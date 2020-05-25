
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';
import { NavigationContext } from 'platform/NavigationContext';

import { HorizonViewManager, HORIZON_VIEWS } from '../shell/HorizonViewManager';
import { HorizonRouter } from '../shell/HorizonRouter';
import '../utils/channelServiceUtilities';
import { validate } from '../utils/channelServiceUtilities';

// TODO: Move to a models structure
export class NewCallEvent {
	constructor(
		incomingTelephoneNumber,
		voiceReferenceNumber,
		ivrOptionCode,
		incidentReferenceNumber,
		agentTelephoneNumber,
		date) {
		this.IncomingTelephoneNumber = incomingTelephoneNumber;
		this.VoiceReferenceNumber = voiceReferenceNumber;
		this.IVROptionCode = ivrOptionCode;
		this.IncidentReferenceNumber = incidentReferenceNumber;
		this.AgentTelephoneNumber = agentTelephoneNumber;
		this.Date = date;
	}
};

// Scenario 1 - Call center NOT busy, call ends, and user have enough time to click on "end call" 
//		and gets routed back to the landing page.
//		-> 	This class will action the event immediately.
// Scenario 2 - Call center IS busy, call ends/drops, agent still on last page. New call arrives before
//		agent clicked on "end call".
//		-> 	event is queued, agent has time to press "end call" (agent discretion is used on how quick he/she 
//			should proceed), when "end call" is pressed, the next event in the queue is actioned. The processor
//			will action the event intelligently, ie. if a corresponding end-call event was received (call dropped while
//			ringing), the new-call event is handled appropriately (routed to screen asking end-call reason, 
//			or not at all, depending).


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

		console.log("DesktopAgentService created....");

		this.eventQueue = [];

		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe("landing-page-loaded", () => this._processEventQueue());

		this.horizonViewManager = HorizonViewManager.getInstance();
		this.HorizonRouter = HorizonRouter.getInstance();
		this.router = Router.getInstance();
		this.lastEventId = 0;
		this.onCall = false;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onError() {
		// console.log("Desktop Agent in error state");

		switch (this.eventSource.readyState) {
			case 0:
				// console.log("Event Source State: CONNECTING");
				break;
			case 1:
				// console.log("Event Source State: OPEN");
				break;
			case 2:
				// console.log("Event Source State: CLOSED");
				break;
		}

		if (this.eventSource.readyState != 0) {
			// console.log("Closing and re-opening Desktop Agent Event Source");
			// Close the event source and then re-open it.
			this.eventSource.close();
			this.open();
		}
	}

	_onOpen() {
		console.log("Connection to Desktop Agent open");
	}

	_onMessage(event) {
		// console.log("Received an event from the Desktop Agent", event);
	}

	_onNewCall(event) {
		console.log("Received 'new-call' event: ", event);

		let eventData = JSON.parse(event.data);
		let newCallEvent = new NewCallEvent();


		try {
			// TODO: Agree consistent regular expressions between the CLI, the Horizon UI and the CS !!!!!

			newCallEvent.IncomingTelephoneNumber = validate(eventData.IncomingTelephoneNumber, DesktopAgentService.incomingTelephoneNumberValidation);
			newCallEvent.VoiceReferenceNumber = validate(eventData.VoiceReferenceNumber, DesktopAgentService.voiceReferenceNumberValidation);
			newCallEvent.AgentTelephoneNumber = validate(eventData.AgentTelephoneNumber, DesktopAgentService.agentTelephoneNumberValidation);
			newCallEvent.IncidentReferenceNumber = validate(eventData.IncidentReferenceNumber, DesktopAgentService.incidentReferenceNumberValidation);
			newCallEvent.IVROptionCode = 'StopCard'; //TODO: fix up all these hard coded StopCards
			newCallEvent.Date = eventData.Date;

			// Critical: the Last Event Id will be used in the query string when re-creating the EventSource
			// It would be better if we did not have to re-create the event source and could instead rely on the 
			// Last-Event-ID header being set.
			this.lastEventId = event.lastEventId;

			console.log(newCallEvent);

			this._queueEvent(newCallEvent);
			this._processEventQueue();
		}
		catch (err) {
			console.log(err);
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	static setRegistrationUrl(url) {
		// TODO: Load from config in constructor and get rid of method
		DesktopAgentService.registrationUrl = url;
	}

	open() {
		console.log("Connecting to Desktop Agent");

		this.eventSource = new EventSource(`${DesktopAgentService.registrationUrl}?eventId=${this.lastEventId}`);
		this.eventSource.addEventListener("new-call", (event) => this._onNewCall(event));

		this.eventSource.onerror = () => { this._onError(); };
		this.eventSource.onopen = () => { this._onOpen(); };
		this.eventSource.onmessage = (x) => { this._onMessage(x); };
	}

	callComplete() {
		this.onCall = false;
		this._processEventQueue();
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

	_queueEvent(event) {
		if (event instanceof NewCallEvent) {
			this.eventQueue.push(event);
			console.log("Current event queue:", this.eventQueue);
		}
	}

	_dequeueNextEvent() {
		return this.eventQueue.shift();
	}

	_peekNextEvent() {
		return this.eventQueue[0];
	}

	_processEventQueue() {
		// Business logic on how to respond to events comes here

		// If NOT on Landing Page => Wait for Landing Page (by listening for landing-page-loaded event)
		// When landing-page-loaded event received, check if a end-call event was received to cancel the new-call
		// If not, proceed to publish event

		console.log("Processing Desktop Agent event queue...");

		if (this._peekNextEvent() instanceof NewCallEvent) {
			console.log("Processing New Call Event");
			console.log("on call flag", this.onCall);

			// Get current view from router. Note that we are still on the landing page when presenting
			// dialogs (such as Confirm Caller Details). Therefore we use a flag to indicate whether we 
			// are on a call and accept only if no dialog has been presented (i.e. we are not on a call)
			if (NavigationContext.getInstance().current.route.name === 'landing-page' && !this.onCall) {
				// If Landing Page => publish event
				console.log("Publishing new-call event");
				this.onCall = true;
				this.eventAggregator.publish(`new-call`, this._dequeueNextEvent());
			}
			else if (this.horizonViewManager.getCurrentView() === HORIZON_VIEWS.LANDING_PAGE) {
				console.log('Desktop Agent service navigating to landing page');
				this.HorizonRouter.navigateToLandingPage();
			}
			else {
				console.log("Not on landing page, waiting for agent to end the call...");
			}
		}
	}
}
