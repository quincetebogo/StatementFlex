
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';
import { NavigationContext } from 'platform/NavigationContext';


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

	static getInstance() {
		return this.instance || (this.instance = new DesktopAgentService());
	}

	constructor() {

		if (this.instance) {
			console.log("DesktopAgentService already running...");
			return this.instance;
		}

		console.log("DesktopAgentService created....");

		this.eventQueue = [];

		// Listening for SSE events from the Desktop Agent
		this.eventSource = new EventSource("http://localhost:8888/subscribe"); //TODO: make configurable
		this.eventSource.addEventListener("new-call", (event) => {
			console.log("Received 'new-call' event: ", event);

			let newCallEvent = Object.assign(new NewCallEvent, JSON.parse(event.data));
			console.log(newCallEvent);

			this.queueEvent(newCallEvent);
			this.processEventQueue();
		})

		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe("landing-page-loaded", () => this.processEventQueue());

		this.router = Router.getInstance();
	}

	queueEvent(event) {
		if (event instanceof NewCallEvent) {
			this.eventQueue.push(event);
			console.log("Current event queue:", this.eventQueue);
		}
	}

	dequeueNextEvent() {
		return this.eventQueue.shift();
	}

	peekNextEvent() {
		return this.eventQueue[0];
	}

	eventQueueContains(event) {
		return this.eventQueue.includes(event);
	}

	processEventQueue() {
		// Business logic on how to respond to events comes here

		// If NOT on Landing Page => Wait for Landing Page (by listening for landing-page-loaded event)
		// When landing-page-loaded event received, check if a end-call event was received to cancel the new-call
		// If not, proceed to publish event

		console.log("Processing Desktop Agent event queue...");

		if (this.peekNextEvent() instanceof NewCallEvent) {
			console.log("Processing New Call Event");

			// Get current view from router
			if (NavigationContext.getInstance().current.route.name === 'landing-page') {
				// If Landing Page => publish event
				console.log("Publishing new-call event");
				this.eventAggregator.publish(`new-call`, this.dequeueNextEvent());
			}
			else {
				// TODO: should we forcefully route to landing page?

				console.log("Not on landing page, waiting for agent to end the call...");
			}
		}
	}
}
