import { Configuration, EventAggregator, Logger, NavigationContext, Security, SecurityContext } from 'platform/core';
import { HORIZON_VIEW_SET, HorizonViewManager } from 'app/shell/HorizonViewManager';
import { AcceptCallEvents } from 'app/constants/telemetry/events/AcceptCall';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { NewCallEvent } from 'app/models//NewCallEvent';
import { RoleManager } from 'app/shell/RoleManager';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { validate } from 'app/utils/channelServiceUtilities';

/**
 *  The Desktop Agent Service subscribes to Server Side Events from the Desktop Agent running on the
 *  workstation. Server Side Events are used to notify the Horizon UI of the details of an incoming 
 *  call. 
 * 
 *  A possibly better alternative may be to use Web Sockets as this allows a bi-directional protocol.
 * 
 * There a a few scenarios that this service needs to handle.
 * 
 * Scenario 1: The agent is still busy on the previous call even though the original caller has
 *             disconnected. The call must not present until the agent returns to the landing page.
 * 
 * Scenario 2: The agent has returned to the  "Landing Page" set of screens. An incomming call must
 *              be accepted immediately. 
 *
 * Scenario 3: Similar to scenario 1. The agent has not completed handling the previous call. A new 
 *             call comes in and drops before the agent returns to the landing page. A subsequent
 *             call comes in before the agent returns to the landing page. Only the latest call 
 *             must be handled. Incoming calls are not queued. There is at most one pending incoming
 *             call.
 * 
 * EVENTS RAISED:
 * 
 * new-call                     - Notify the subscriber of the details of an incoming call
 * prompt-start-desktopagent    - Notify the subscriber that the Desktop Agent Service is down
 * 
 * EVENTS SUBSCRIBED
 * 
 * landing-page-loaded          - Informs this class that the UI is on the landing page and 
 *                                therefore calls may be accepted.
 * 
 */
export class DesktopAgentService {
	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new DesktopAgentService());
	}

	constructor() {

		if (this.instance) {
			return this.instance;
		}

		
		this._configuration = Configuration.getInstance();
		this._eventAggregator = EventAggregator.getInstance();
		this._logger = Logger.getInstance();
		this._navigationContext = NavigationContext.getInstance();
		this._security = Security.getInstance();
		this._securityContext = SecurityContext.getInstance();
		this._telemetry = HorizonTelemetry.instance;

		this.horizonViewManager = HorizonViewManager.getInstance();
		this.HorizonRouter = HorizonRouter.getInstance();

		this.nextCall = null; // A pending call event
		this.lastEventId = 0; // The last SSE ID recieved
		this.onCall = false; // Indicates that the UI is still handling a call
		this.connectionTries = 0; // Retry count for detecting Desktop Agent down

		this.registrationUrl = null;

		// this.refreshTokenTime = new Date();

		this._setValidationData();

		this._eventAggregator.subscribe(`landing-page-loaded`, () => this._onLandingPageLoaded());
	}


	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Event handler for the SSE event from the Desktop Agent Service
	 *
	 * @private
	 * @param {*} event Server Side Event from the Destkop Agent Service Application
	 * @returns {Promise} A promise
	 * @memberof DesktopAgentService
	 */
	async _onNewCall(event) {
		const eventData = JSON.parse(event.data);

		// Do nothing with hearbeats. They are just to keep the connection alive
		if (Object.prototype.hasOwnProperty.call(eventData, `Heartbeat`)) {
			if (this.connectionTries >= 3) {
				this._eventAggregator.publish(`desktop-agent-up`, {});
			}
			this.connectionTries = 0;

			// We tend to lose the first notification that arrives after an IDP token expires.
			// This is because the logout/login process kicks in and resets everything
			//
			// Here we leverage the Desktop Agent heartbeat to keep the IDP token refreshed.
			// As long as the hearbeat interval is less than the 30s token refresh window this
			// should work nicely. This code should probably move onto a timer in the App Shell though.
			if (!this.onCall) {
				// The token will only actually get refreshed if this call lands in the 30s window
				// before token expiry. Otherwise this call should have little effect.
				this._security.ensureValidToken();
			}

			return;
		}

		// If we get a call before a heartbeat, also automatically notify that the desktop agent is up.
		if (this.connectionTries >= 3) {
			this._eventAggregator.publish(`desktop-agent-up`, {});
		}

		// We have received an event so we must be connected to the Desktop Agent
		this.connectionTries = 0;

		const newCallEvent = new NewCallEvent();

		try {
			// Copy the information we require out of the incoming event into a new object.
			// We validate the information received and discard anything unexpected that may 
			// have been injected into the event.

			newCallEvent.incomingTelephoneNumber = validate(eventData.IncomingTelephoneNumber.trim(), DesktopAgentService.incomingTelephoneNumberValidation);

			if (newCallEvent.incomingTelephoneNumber === 0) {
				if (eventData.IncomingTelephoneNumber.toLowerCase() !== `anonymous`) {
					this._logger.log(`warn`, `Incoming number does not match validation rule: ${eventData.IncomingTelephoneNumber}`);
				}
				newCallEvent.incomingTelephoneNumber = `0000000000`;
			}

			newCallEvent.incomingTelephoneNumber = this._cleanupTelephoneNumber(newCallEvent.incomingTelephoneNumber);

			newCallEvent.voiceReferenceNumber = validate(eventData.VoiceReferenceNumber, DesktopAgentService.voiceReferenceNumberValidation);
			newCallEvent.agentTelephoneNumber = validate(eventData.AgentTelephoneNumber, DesktopAgentService.agentTelephoneNumberValidation);
			newCallEvent.VDN = validate(eventData.VDN, DesktopAgentService.vdnValidation);

			newCallEvent.ivrOptionCode = await this._mapIvrOption(eventData.IVROptionCode);
			newCallEvent.date = eventData.Date;

			// Critical: the Last Event Id will be used in the query string when re-creating the EventSource
			// When not re-creating an the event source, the EventSource automatically sets the last event id
			// in the header of the SSE subscription.
			this.lastEventId = event.lastEventId;

			if (this.nextCall) {
				this._logger.log(`warn`, `Dropped call detected. A previous call was delivered to the user interface but not handled.`, `_onNewCall`);
			}

			if (!newCallEvent.voiceReferenceNumber || newCallEvent.voiceReferenceNumber === 0) {
				
				newCallEvent.voiceReferenceNumber = this._generateVoiceReference();
				this._logger.log(`warn`, `No Voice Reference Number received! This call may have been handled by doing a manual search.`, `_onNewCall`);
			}

			this.nextCall = newCallEvent;

			// Telemetry
			// If the call was initiated through desktop agent, we log telemetry here
			// since we have the IVR selection before it gets mapped to a need.
			this._telemetry.newTrace();
			this._telemetry.startSpan(AcceptCallEvents.INCOMING_CALL, {
				"screen": TelemetryScreen.WAIT_FOR_CALL,
				"ivr": eventData.IVROptionCode,
				"ucid": newCallEvent.voiceReferenceNumber
			});
			
			this._handleIncomingCall();

		} catch (err) {
			this._logger.log(`fatal`, err.message, `_onNewCall`);
		}
	}

	_cleanupTelephoneNumber(telephoneNumber) {
		if (telephoneNumber.length >= 9) {
			return `0${telephoneNumber.substr(telephoneNumber.length - 9)}`;
		} else if (telephoneNumber.length < 10) {
			telephoneNumber = telephoneNumber.padStart(10, `0`);
		}

		return telephoneNumber;
	}

	/**
	 * Event that gets received when the UI returns to the landing page. If there is a
	 * call pending (i.e. a call came in before we returned to the landing page) then 
	 * take it immediately.
	 * 
	 * @private
	 * @returns {undefined}
	 * @memberof DesktopAgentService
	 */
	_onLandingPageLoaded() {
		this._handleIncomingCall();
	}

	/**
	 * Re-connect to the Desktop Agent when the connection is closed.
	 * Notify the user if unable to connect/re-connect within a 
	 * specified number of retries.
	 * 
	 * @private
	 * @returns {undefined}
	 * @memberof DesktopAgentService
	   */
	_onError() {
		// console.log(`Desktop Agent in error state`);

		switch (this.eventSource.readyState) {
			case 0:
				this.connectionTries++;
				// console.log(`Event Source State: CONNECTING`, this.connectionTries);
				break;
			case 1:
				// console.log(`Event Source State: OPEN`);
				// this.connectionTries = 0;
				break;
			case 2:
				this.connectionTries++;
				// console.log(`Event Source State: CLOSED`, this.connectionTries++);
				break;
			default:
				break;
		}

		if (this.eventSource.readyState !== 0) {
			// console.log(`Closing and re-opening Desktop Agent Event Source`);
			// Close the event source and then re-open it.
			this.eventSource.close();
			this.open();
		}

		if (this.connectionTries >= 3) {
			this._promptForDesktopAgent();
		}
	}

	_onOpen() {
		// console.log(`Connection to Desktop Agent open`);
	}

	_onMessage(event) {
		// console.log(`Received an event from the Desktop Agent`, event);
	}


	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Registers for Server Side Events with the Desktop Agent Applicaton.
	 *
	 * @returns {undefined}
	 * @memberof DesktopAgentService
	 */
	async open() {
		if (!this.registrationUrl) {
			this.registrationUrl = await Configuration.getInstance().getSetting(`DesktopAgent.registrationUrl`);
		}

		this.eventSource = new EventSource(`${this.registrationUrl}?eventId=${this.lastEventId}`);
		this.eventSource.addEventListener(`new-call`, event => this._onNewCall(event));

		this.eventSource.onerror = () => {
			this._onError();
		};
		this.eventSource.onopen = () => {
			this._onOpen();
		};
		this.eventSource.onmessage = (x) => {
			this._onMessage(x);
		};
	}

	async manualCreateCall() {
		if (!this.onCall) {
			const d = new Date();
			const currentdate = d.toISOString();
			const newCallEvent = new NewCallEvent();

			newCallEvent.incomingTelephoneNumber = `0000000000`; // incoming telephone number
			newCallEvent.voiceReferenceNumber = this._generateVoiceReference();
			newCallEvent.agentTelephoneNumber = `000000`;
			newCallEvent.VDN = await this._getVdn();
			newCallEvent.ivrOptionCode = `Transact`;
			newCallEvent.date = currentdate;

			this._logger.log(`warn`, `Manual call handling invoked. This may be due to a missed incoming call event.`, `manualCreateCall`);
	
			if (this.nextCall) {
				this._logger.log(`warn`, `Dropped call detected. A previous call was delivered to the user interface but not handled.`, `manualCreateCall`);
			}
	
			this.nextCall = newCallEvent;
	
			// Telemetry: If the call was created manually, we log telemetry without any IVR selection.
			// The mapped need will be logged later.
			this._telemetry.newTrace();
			this._telemetry.startSpan(AcceptCallEvents.INCOMING_CALL, {
				"screen": TelemetryScreen.WAIT_FOR_CALL,
				"ivr": ``,
				"ucid": newCallEvent.voiceReferenceNumber
			});

			this._handleIncomingCall();
		}
	}

	/**
	 * We maintain a flag (this.onCall) to prevent a new call from interrupting an incomplete call session.
	 * The UI must invoke callComplete() once a call session has been completed in order to handle any
	 * new incoming call.
	 * *
	 * @memberof DesktopAgentService
	 * @returns {undefined}
	 */
	callComplete() {
		this.onCall = false;
		this._handleIncomingCall();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_generateVoiceReference() {
		const d = new Date();
		const year = d.getFullYear();
		const month = (d.getMonth() + 1).toString().padStart(2, `0`);
		const day = d.getDate().toString().padStart(2, `0`);
		const hours = d.getHours().toString().padStart(2, `0`);
		const minutes = d.getMinutes().toString().padStart(2, `0`);
		const seconds = d.getSeconds().toString().padStart(2, `0`);

		const currentdate = `${year}${month}${day}-${hours}${minutes}${seconds}`;
		return `${this._securityContext.username}-${currentdate}`; // voicedReferenceNumber;
	}
	

	async _mapIvrOption(IvrOptionCode) {
		const ivrMapping = await this._configuration.getSetting(`ivrMapping`);
		const selectedOption = ivrMapping.find(element => element.option === IvrOptionCode);

		return selectedOption ? selectedOption.primaryNeed : `Transact`;
	}

	_setValidationData() {
		DesktopAgentService.incomingTelephoneNumberValidation = `^\\+?[0-9][0-9]{3,14}`; 
		DesktopAgentService.voiceReferenceNumberValidation = `^[0-9]*`; 
		DesktopAgentService.agentTelephoneNumberValidation = `^[0-9]*`; 
		DesktopAgentService.vdnValidation = `^[0-9]*`; 
		DesktopAgentService.incidentReferenceNumberValidation = `^[0-9]{1,10}`; // STrack reference numbers
		DesktopAgentService.incidentRecIdValidation = `^[a-fA-F0-9]{8}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{12}$`; // STrack rec id
		DesktopAgentService.ivrOptionCodeValidation = `^[0-9]*`;
	}

	_handleIncomingCall() {
		// Don't handle incoming call if if application is still starting up or if we already on a call
		// If we have not completed the previous call, the new call will be buffered until returning
		// to the call waiting landing page. The landing page must make use of the callComplete()
		// method when reloading which will trigger the handling of the buffered call.
		
		if (!this.nextCall || this._navigationContext.current === undefined || this.onCall) {
			return;
		}

		// Insure the agent has the correct authorisation 
		if (!RoleManager.getInstance().isAuthorised) {
			return;
		}

		// Get current view from router. Note that we are still on the landing page when presenting
		// dialogs (such as Confirm Caller Details). Therefore we use a flag to indicate whether we 
		// are on a call and accept only if no dialog has been presented (i.e. we are not on a call)
		if (this._waitingForCallPageActive()) {
			// If Landing Page => publish event

			this.onCall = true;

			this._eventAggregator.publish(`new-call`, this.nextCall);

			this.nextCall = null;
		} else if (this.horizonViewManager.getCurrentView() === HORIZON_VIEW_SET.LANDING_PAGES) {
			// We can take a call when on a product view page (they belong to the set of landing pages)
			// Automatically navigate to the landing page. Once on the landing page and event will fire
			// notifying this class to take the call.
			this.HorizonRouter.navigateToWaitingForCall();
		}
	}

	_promptForDesktopAgent() {
		if (this._waitingForCallPageActive()) {
			this._eventAggregator.publish(`prompt-start-desktopagent`);
			// this.connectionTries = 0;
		} else if (this._productLandingPagesActive()) {

			// Don't route the capitec teamleaders away from the page.
			if(this._checkCapitecConnectTeamLeader()) {
				return;
			}

			this.HorizonRouter.navigateToWaitingForCall();
		}
	}

	// If the user is a capitec connect teamleader and the page is capitec connect don't re-route.
	_checkCapitecConnectTeamLeader() {
		let rolemanager = RoleManager.getInstance();
		if(rolemanager.isCapitecConnectTeamleader && this._navigationContext.current.path === '/product/capitec-connect') {
			console.log('teamleader')
			return true;
		}

		return false;
	}

	_productLandingPagesActive() {
		return this.horizonViewManager.getCurrentView() === HORIZON_VIEW_SET.LANDING_PAGES && this._navigationContext.current !== undefined;
	}

	_waitingForCallPageActive() {
		if (this._navigationContext.current !== undefined) {
			return this._navigationContext.current.route.name === `horizon-landing-page`;
		}

		return false;
	}

	_getVdn() {
		const isHelpDeskAgent = RoleManager.getInstance().isHelpDeskAgent;
		const isCapitecConnectAgent = RoleManager.getInstance().isCapitecConnectAgent;

		if (isCapitecConnectAgent) {
			return this._configuration.getSetting(`CapitecConnectVDN`);
		} else if (isHelpDeskAgent) {
			return this._configuration.getSetting(`HelpDeskVDN`);
		}
		return this._configuration.getSetting(`ClientCareVDN`);

	}
}