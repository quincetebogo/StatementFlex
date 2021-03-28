import { Configuration, EventAggregator, Logger, NavigationContext, SecurityContext } from 'platform/core';
import { HORIZON_VIEW_SET, HorizonViewManager } from 'app/shell/HorizonViewManager';

import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { NewCallEvent } from 'app/models//NewCallEvent';
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

		this.nextCall = null; // A pending call event
		this.lastEventId = 0; // The last SSE ID recieved
		this.onCall = false; // Indicates that the UI is still handling a call
		this.connectionTries = 0; // Retry count for detecting Desktop Agent down

		this.registrationUrl = null;

		this._setValidationData();

		this._configuration = Configuration.getInstance();
		this._eventAggregator = EventAggregator.getInstance();
		this._logger = Logger.getInstance();
		this._navigationContext = NavigationContext.getInstance();
		this._securityContext = SecurityContext.getInstance();

		this.horizonViewManager = HorizonViewManager.getInstance();
		this.HorizonRouter = HorizonRouter.getInstance();

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

			newCallEvent.incomingTelephoneNumber = validate(eventData.IncomingTelephoneNumber, DesktopAgentService.incomingTelephoneNumberValidation);
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
				newCallEvent.voiceReferenceNumber = 0;
				this._logger.log(`error`, `No Voice Reference Number received!. The ACapitecAES Proxy component may be down!`, `_onNewCall`);
			}

			this.nextCall = newCallEvent;

			// Telemetry
			HorizonTelemetry.instance.newTrace();
			HorizonTelemetry.instance.incomingCall({
				screen: TelemetryScreen.WAIT_FOR_CALL,
				ivr: eventData.IVROptionCode,
				ucid: newCallEvent.voiceReferenceNumber
			});
			
			this._handleIncomingCall();

		} catch (err) {
			this._logger.log(`fatal`, err.message, `_onNewCall`);
		}
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
			const vdn = await this._configuration.getSetting(`VDN`);

			newCallEvent.incomingTelephoneNumber = `0000000000`; // incoming telephone number
			newCallEvent.voiceReferenceNumber = `${this._securityContext.username}-${currentdate}`; // voicedReferenceNumber
			newCallEvent.agentTelephoneNumber = `000000`;
			newCallEvent.VDN = vdn;
			newCallEvent.ivrOptionCode = `Transact`;
			newCallEvent.date = currentdate;
	
			if (this.nextCall) {
				this._logger.log(`warn`, `Dropped call detected. A previous call was delivered to the user interface but not handled.`, `manualCreateCall`);
			}
	
			this.nextCall = newCallEvent;
	
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

	async _mapIvrOption(IvrOptionCode) {
		const ivrMapping = await this._configuration.getSetting(`ivrMapping`);
		const selectedOption = ivrMapping.find(element => element.option === IvrOptionCode);

		return selectedOption ? selectedOption.primaryNeed : `Transact`;
	}

	_setValidationData() {
		DesktopAgentService.incomingTelephoneNumberValidation = `^\\+?[0-9][0-9]{6,14}`; // E164 telephone number format (minimum of 7 digits, maximum of 15)
		DesktopAgentService.voiceReferenceNumberValidation = `^[0-9]{20}`; // Avaya specific. Needs to be revised when adding more incoming channels.
		DesktopAgentService.agentTelephoneNumberValidation = `^[1-9][0-9]{3,5}`; // Dialplan as configured on Avaya
		DesktopAgentService.vdnValidation = `^[1-9][0-9]{5}`; // Dialplan as configured on Avaya
		DesktopAgentService.incidentReferenceNumberValidation = `^[0-9]{1,10}`; // STrack reference numbers
		DesktopAgentService.incidentRecIdValidation = `^[a-fA-F0-9]{8}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{12}$`; // STrack rec id
		DesktopAgentService.ivrOptionCodeValidation = `^[0-9]*`;
	}

	_handleIncomingCall() {
		// Don't handle incoming call if if application is still starting up
		if (!this.nextCall || this._navigationContext.current === undefined) {
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
			this.HorizonRouter.navigateToWaitingForCall();
		}
	}

	_productLandingPagesActive() {
		return this.horizonViewManager.getCurrentView() === HORIZON_VIEW_SET.LANDING_PAGES && this._navigationContext.current !== undefined;
	}

	_waitingForCallPageActive() {
		// TODO: Restore onCall check once all screens for insure etc. are properly wired up again
		if (this._navigationContext.current !== undefined) {
			return this._navigationContext.current.route.name === `horizon-landing-page`; /* && !this.onCall */
		}

		return false;
	}
}