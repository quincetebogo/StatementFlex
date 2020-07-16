import { Router } from 'platform/Router';
import { NavigationContext } from 'platform/NavigationContext';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonViewManager, HORIZON_VIEW_SET } from '../shell/HorizonViewManager';
import { HorizonRouter } from '../shell/HorizonRouter';
import '../utils/channelServiceUtilities';
import { validate } from '../utils/channelServiceUtilities';
import { NewCallEvent } from '../models//NewCallEvent';
import { IncidentManagementService } from '../services/IncidentManagementService';


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
 *			   be accepted immediately. 
 *			   
 * Scenario 3: Similar to scenario 1. The agent has not completed handling the previous call. A new 
 *             call comes in and drops before the agent returns to the landing page. A subsequent
 *             call comes in before the agent returns to the landing page. Only the latest call 
 *             must be handled. Incoming calls are not queued. There is at most one pending incoming
 *             call.
 * 
 * EVENTS RAISED:
 * 
 * new-call						- Notify the subscriber of the details of an incoming call
 * prompt-start-desktopagent	- Notify the subscriber that the Desktop Agent Service is down
 * 
 * EVENTS SUBSCRIBED
 * 
 * landing-page-loaded			- Informs this class that the UI is on the landing page and 
 * 								  therefore calls may be accepted.
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

		this.nextCall = null;		// A pending call event
		this.lastEventId = 0;		// The last SSE ID recieved
		this.onCall = false;		// Indicates that the UI is still handling a call
		this.connectionTries = 0;	// Retry count for detecting Desktop Agent down

		DesktopAgentService.getValidationData();

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.HorizonRouter = HorizonRouter.getInstance();
		this.router = Router.getInstance();

		this.eventAggregator.subscribe("landing-page-loaded", () => this._onLandingPageLoaded());
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Event handler for the SSE event from the Desktop Agent Service
	 * 
	 * @param {*} event 
	 */
	async _onNewCall(event) {
		let eventData = JSON.parse(event.data);
		let newCallEvent = new NewCallEvent();

		// We have received an event so we must be connected to the Desktop Agent
		this.connectionTries = 0;

		try {
			// Copy the information we require out of the incoming event into a new object.
			// We validate the information received and discard anything unexpected that may 
			// have been injected into the event.

			// TODO: Agree consistent regular expressions between the CLI, the Horizon UI and the CS !!!!!
			newCallEvent.IncomingTelephoneNumber = validate(eventData.IncomingTelephoneNumber, DesktopAgentService.incomingTelephoneNumberValidation);
			newCallEvent.VoiceReferenceNumber = validate(eventData.VoiceReferenceNumber, DesktopAgentService.voiceReferenceNumberValidation);
			newCallEvent.AgentTelephoneNumber = validate(eventData.AgentTelephoneNumber, DesktopAgentService.agentTelephoneNumberValidation);
			newCallEvent.VDN = validate(eventData.VDN, DesktopAgentService.vdnValidation);
			//newCallEvent.IncidentReferenceNumber = validate(eventData.IncidentReferenceNumber, DesktopAgentService.incidentReferenceNumberValidation);
			//newCallEvent.IncidentRecId = eventData.IncidentRecNo;
			newCallEvent.IVROptionCode = eventData.IVROptionCode;
			newCallEvent.Date = eventData.Date;

			// Critical: the Last Event Id will be used in the query string when re-creating the EventSource
			// When not re-creating an the event source, the EventSource automatically sets the last event id
			// in the header of the SSE subscription.
			this.lastEventId = event.lastEventId;

			if (this.nextCall) {
				// Should we do something to record this as a dropped call. The new incoming call
				// will overwrite this. This pending call event was never picked up by the UI.
			}

			this.nextCall = newCallEvent;

			await this._handleIncomingCall();
		}
		catch (err) {
			console.log(err);
		}
	}

	/**
	 * Event that gets received when the UI returns to the landing page. If there is a
	 * call pending (i.e. a call came in before we returned to the landing page) then 
	 * take it immediately.
	 */
	_onLandingPageLoaded() {
		this._handleIncomingCall();
	}

	/**
	 * Re-connect to the Desktop Agent when the connection is closed.
	 * Notify the user if unable to connect/re-connect within a 
	 * specified number of retries.
	 */
	_onError() {
		// console.log("Desktop Agent in error state");

		switch (this.eventSource.readyState) {
			case 0:
				this.connectionTries++;
				// console.log("Event Source State: CONNECTING", this.connectionTries);
				break;
			case 1:
				// console.log("Event Source State: OPEN");
				this.connectionTries = 0;
				break;
			case 2:
				this.connectionTries++;
				// console.log("Event Source State: CLOSED", this.connectionTries++);
				break;
		}

		if (this.eventSource.readyState != 0) {
			// console.log("Closing and re-opening Desktop Agent Event Source");
			// Close the event source and then re-open it.
			this.eventSource.close();
			this.open();
		}

		if (this.connectionTries >= 3) {
			this._promptForDesktopAgent()
		}
	}

	_onOpen() {
		// console.log("Connection to Desktop Agent open");
	}

	_onMessage(event) {
		// console.log("Received an event from the Desktop Agent", event);
	}


	// --------------
	// PUBLIC METHODS
	// --------------

	static setRegistrationUrl(url) {
		// TODO: Load from config in constructor and get rid of method
		DesktopAgentService.registrationUrl = url;
	}

	open() {
		// console.log("Connecting to Desktop Agent");

		this.eventSource = new EventSource(`${DesktopAgentService.registrationUrl}?eventId=${this.lastEventId}`);
		this.eventSource.addEventListener("new-call", async (event) => this._onNewCall(event));

		this.eventSource.onerror = () => { this._onError(); };
		this.eventSource.onopen = () => { this._onOpen(); };
		this.eventSource.onmessage = (x) => { this._onMessage(x); };
	}

	/**
	 * We maintain a flag (this.onCall) to prevent a new call from interrupting an incomplete call session.
	 * The UI must invoke callComplete() once a call session has been completed in order to handle any
	 * new incoming call.
	 */
	callComplete() {
		this.onCall = false;
		this._handleIncomingCall();
	}

	static getValidationData() {
		// TODO: Make channel service call to retrieve validation data
		// TODO: these validation criteria needs to come from the channel service
		// TODO: Move into constructor/class initialization
		DesktopAgentService.incomingTelephoneNumberValidation = '^\\+?[0-9][0-9]{6,14}'; // E164 telephone number format (minimum of 7 digits, maximum of 15)
		DesktopAgentService.voiceReferenceNumberValidation = '^[0-9]{20}';	// Avaya specific. Needs to be revised when adding more incoming channels.
		DesktopAgentService.agentTelephoneNumberValidation = '^[1-9][0-9]{5}';	// Dialplan as configured on Avaya
		DesktopAgentService.vdnValidation = '^[1-9][0-9]{5}';	// Dialplan as configured on Avaya
		DesktopAgentService.incidentReferenceNumberValidation = '^[0-9]{6}'; // STrack reference numbers
		DesktopAgentService.incidentRecIdValidation = '^[a-fA-F0-9]{8}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{12}$'; // STrack rec id
		DesktopAgentService.ivrOptionCodeValidation = '^[0-9]'; // TODO: confirm with architects
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
	}

	async _handleIncomingCall() {

		if (!this.nextCall) {
			return;
		}

		// Get current view from router. Note that we are still on the landing page when presenting
		// dialogs (such as Confirm Caller Details). Therefore we use a flag to indicate whether we 
		// are on a call and accept only if no dialog has been presented (i.e. we are not on a call)
		if (NavigationContext.getInstance().current.route.name === 'landing-page' && !this.onCall) {
			// If Landing Page => publish event
			this.onCall = true;

			let incident = await IncidentManagementService.getInstance().createIncident(this.nextCall,
				() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
				null // no error handler supplied, uses default
			);

			this.nextCall.IncidentReferenceNumber = validate(incident.incidentNumber, DesktopAgentService.incidentReferenceNumberValidation);
			this.nextCall.IncidentRecId = validate(incident.incidentRecId, DesktopAgentService.incidentRecIdValidation);
			this.eventAggregator.publish(`new-call`, this.nextCall);

			this.nextCall = null;
		}
		else if (this.horizonViewManager.getCurrentView() === HORIZON_VIEW_SET.LANDING_PAGES) {
			// We can take a call when on a product view page (they belong to the set of landing pages)
			// Automatically navigate to the landing page. Once on the landing page and event will fire
			// notifying this class to take the call.
			this.HorizonRouter.navigateToLandingPage();
		}
	}

	_promptForDesktopAgent() {
		if (NavigationContext.getInstance().current.route.name === 'landing-page' && !this.onCall) {
			this.eventAggregator.publish(`prompt-start-desktopagent`);
			this.connectionTries = 0;
		}
		else if (this.horizonViewManager.getCurrentView() === HORIZON_VIEW_SET.LANDING_PAGES) {
			this.HorizonRouter.navigateToLandingPage();
		}
	}

}
