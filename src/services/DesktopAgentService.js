import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';
import { NavigationContext } from 'platform/NavigationContext';

import { HorizonViewManager, HORIZON_VIEWS } from '../shell/HorizonViewManager';
import { HorizonRouter } from '../shell/HorizonRouter';

import '../utils/channelServiceUtilities';
import { validate } from '../utils/channelServiceUtilities';

import { NewCallEvent } from '../models//NewCallEvent'

/**
 * Scenario 1 - Call center NOT busy, call ends, and user have enough time to click on "end call" 
 *		and gets routed back to the landing page.
 *		-> 	This class will action the event immediately.
 * Scenario 2 - Call center IS busy, call ends/drops, agent still on last page. New call arrives before
 *		agent clicked on "end call".
 *		-> 	event is queued, agent has time to press "end call" (agent discretion is used on how quick he/she 
 *			should proceed), when "end call" is pressed, the next event in the queue is actioned. The processor
 *			will action the event intelligently, ie. if a corresponding end-call event was received (call dropped while
 *			ringing), the new-call event is handled appropriately (routed to screen asking end-call reason, 
 *			or not at all, depending).
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

		this.nextCall = null;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.HorizonRouter = HorizonRouter.getInstance();
		this.router = Router.getInstance();

		this.eventAggregator.subscribe("landing-page-loaded", () => this._onLandingPageLoaded());

		this.lastEventId = 0;
		this.onCall = false;
		this.connectionTries = 0;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Event handler for the SSE event from the Desktop Agent Service
	 * 
	 * @param {*} event 
	 */
	_onNewCall(event) {
		let eventData = JSON.parse(event.data);
		let newCallEvent = new NewCallEvent();


		try {
			// Copy the information we require out of the incoming event into a new object.
			// We validate the information received and discard anything unexpected that may 
			// have been injected into the event.

			// TODO: Agree consistent regular expressions between the CLI, the Horizon UI and the CS !!!!!
			newCallEvent.IncomingTelephoneNumber = validate(eventData.IncomingTelephoneNumber, DesktopAgentService.incomingTelephoneNumberValidation);
			newCallEvent.VoiceReferenceNumber = validate(eventData.VoiceReferenceNumber, DesktopAgentService.voiceReferenceNumberValidation);
			newCallEvent.AgentTelephoneNumber = validate(eventData.AgentTelephoneNumber, DesktopAgentService.agentTelephoneNumberValidation);
			newCallEvent.IncidentReferenceNumber = validate(eventData.IncidentReferenceNumber, DesktopAgentService.incidentReferenceNumberValidation);
			newCallEvent.IVROptionCode = 'StopCard'; //TODO: fix up all these hard coded StopCards
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

			this._handleIncomingCall();
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
		this.eventSource.addEventListener("new-call", (event) => this._onNewCall(event));

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
		DesktopAgentService.incidentReferenceNumberValidation = '^[0-9]{6}'; // STrack reference numbers
		DesktopAgentService.ivrOptionCodeValidation = '^[0-9]'; // TODO: confirm with architects
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_handleIncomingCall() {
		// Business logic on how to respond to events comes here

		// If NOT on Landing Page => Wait for Landing Page (by listening for landing-page-loaded event)
		// When landing-page-loaded event received, check if a end-call event was received to cancel the new-call
		// If not, proceed to publish event

		if (!this.nextCall) {
			return;
		}

		console.log("Processing New Call Event");
		console.log("on call flag", this.onCall);

		// Get current view from router. Note that we are still on the landing page when presenting
		// dialogs (such as Confirm Caller Details). Therefore we use a flag to indicate whether we 
		// are on a call and accept only if no dialog has been presented (i.e. we are not on a call)
		if (NavigationContext.getInstance().current.route.name === 'landing-page' && !this.onCall) {
			// If Landing Page => publish event
			console.log("Publishing new-call event");
			this.onCall = true;
			this.eventAggregator.publish(`new-call`, this.nextCall);
			this.nextCall = null;
		}
		else if (this.horizonViewManager.getCurrentView() === HORIZON_VIEWS.LANDING_PAGE) {
			console.log('Desktop Agent service navigating to landing page');
			this.HorizonRouter.navigateToLandingPage();
		}
		else {
			console.log("Not on landing page, waiting for agent to end the call...");
		}
	}

	_promptForDesktopAgent() {
		if (NavigationContext.getInstance().current.route.name === 'landing-page' && !this.onCall) {
			this.eventAggregator.publish(`prompt-start-desktopagent`);
			this.connectionTries = 0;
		}
		else if (this.horizonViewManager.getCurrentView() === HORIZON_VIEWS.LANDING_PAGE) {
			this.HorizonRouter.navigateToLandingPage();
		}
	}
}
