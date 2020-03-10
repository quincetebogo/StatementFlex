
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';

export class NewCallEvent { };


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
		})

		this.eventAggregator = EventAggregator.getInstance();
		this.router = Router.getInstance();
	}

	queueEvent(event) {
		if (event instanceof NewCallEvent) {
			this.eventQueue.push(event);
			console.log("Current event queue:", this.eventQueue);
		}
	}

	getNextEvent() {
		let event = this.eventQueue.shift();

		return event;
	}

	processEventQueue() {
		// Business logic on how to respond to events comes here

		let event = this.getNextEvent();
		if (event.event === 'new-call') {
			// 1. Get current view from router
			if (NavigationContext.getInstance().current.route.name === 'landing-page') {
				// 1.1 If Landing Page => publish event ('horizon-temp-button' for now)
				this.eventAggregator.publish(`horizon-temp-button`, {});
			}

			// 1.2   If NOT on Landing Page => Wait for Landing Page (by listening for landing-page-loaded event)
			// 1.2.1 When landing-page-loaded event received, check if a end-call event was received to cancel the new-call
			// 1.2.2 If not, proceed to publish event

		}
	}

}