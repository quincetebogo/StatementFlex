
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';
import { NavigationContext } from 'platform/NavigationContext';
import '../utils/channelServiceUtilities';
import { validate } from '../utils/channelServiceUtilities';


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

export class HeartbeatMonitorEvent {
	constructor(
		interval,
		threshold,
		disabled
	) {
		this.interval = interval;
		this.threshold = threshold;
		this.disabled = disabled;
	}
}

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

	static setRegistrationUrl(url) {
		DesktopAgentService.registrationUrl = url;
	}

	static getValidationData() {
		// TODO: Make channel service call to retrieve validation data

		//TODO: these validation criteria needs to come from the channel service
		DesktopAgentService.incomingTelephoneNumberValidation = '^\\+?[1-9][0-9]{6,14}'; // E164 telephone number format (minimum of 7 digits, maximum of 15)
		DesktopAgentService.voiceReferenceNumberValidation = '^[0-9]{20}';	// Avaya specific. Needs to be revised when adding more incoming channels.
		DesktopAgentService.agentTelephoneNumberValidation = '^[1-9][0-9]{5}';	// Dialplan as configured on Avaya
		DesktopAgentService.incidentReferenceNumberValidation = '^[0-9]{6}'; // STrack reference numbers
		DesktopAgentService.ivrOptionCodeValidation = '^[0-9]'; // TODO: confirm with architects
	}

	static setHeartbeatMonitorConfig(heartBeatMonitorEvent) {
		DesktopAgentService.lastHeartbeatReceivedTime = '';
		DesktopAgentService.heartbeatMonitor = heartBeatMonitorEvent;
	}

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
		this.heartBeatReceived = false;
		this.heartBeatsMissed = 0;

		// Listening for SSE events from the Desktop Agent
		// this.open();

		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe("landing-page-loaded", () => this.processEventQueue());

		this.router = Router.getInstance();
		this.lastEventId = 0;
	}

	open() {
		this.eventSource = new EventSource(`${DesktopAgentService.registrationUrl}?eventId=${this.lastEventId}`);
		this.eventSource.addEventListener("new-call", (event) => this.onNewCall(event));
		this.eventSource.addEventListener("heartbeat", (event) => this.onHearbeatReceived(event));

		this.eventSource.onerror = () => { this.onError(); };
		this.eventSource.onopen = () => { this.onOpen(); };
		this.eventSource.onmessage = (x) => { this.onMessage(x); };

		console.log("event source ready state", this.eventSource.readyState);


		//For {configured} time interval, checks the heartbeatRecived flag to determine heartbeat is received from DesktopAgent service
		window.setInterval(() => this.checkHeartbeat(), DesktopAgentService.heartbeatMonitor.interval);

		//Disposing the timer on window unload
		window.onbeforeunload = () => window.clearInterval();
	}

	onError() {
		console.log(this.eventSource.readyState);

		//Resetting the heartbeatReceived flag to flase, when there is error on SSE
		//		this.setHeartBeatReceived(false);

		this.eventSource.close();
		this.open();
	}

	onOpen() {
		console.log(this.eventSource.readyState);
		console.log("connection opened");
	}

	onMessage(event) {
		console.log(event);
	}

	onNewCall(event) {
		console.log("Received 'new-call' event: ", event);

		let eventData = JSON.parse(event.data);
		let newCallEvent = new NewCallEvent();


		try {
			newCallEvent.IncomingTelephoneNumber = validate(eventData.IncomingTelephoneNumber, DesktopAgentService.incomingTelephoneNumberValidation);
			newCallEvent.VoiceReferenceNumber = validate(eventData.VoiceReferenceNumber, DesktopAgentService.voiceReferenceNumberValidation);
			newCallEvent.AgentTelephoneNumber = validate(eventData.AgentTelephoneNumber, DesktopAgentService.agentTelephoneNumberValidation);
			newCallEvent.IncidentReferenceNumber = validate(eventData.IncidentReferenceNumber, DesktopAgentService.incidentReferenceNumberValidation);
			newCallEvent.IVROptionCode = 'StopCard'; //TODO: fix up all these hard coded StopCards
			newCallEvent.Date = eventData.Date;

			console.log(`event id = ${event.lastEventId}`);
			console.log(`last event id = ${this.lastEventId}`);
			this.lastEventId = event.lastEventId;

			console.log(newCallEvent);

			this.queueEvent(newCallEvent);
			this.processEventQueue();
		}
		catch (err) {
			console.log(err);
		}
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

	/**
	 * When the eventListener receives 'Heartbet' event, this function is being called to handle the event
	 * @param {*} event - Holds the data sent from DesktopAgent service
	 */
	onHearbeatReceived(event) {
		console.log('Heartbeat Received..', event);
		console.log(`event id = ${event.lastEventId}`);
		console.log(`last event id = ${this.lastEventId}`);
		this.lastEventId = event.lastEventId;

		if (!this.heartBeatReceived) {
			this.heartBeatReceived = true;
			this.heartBeatsMissed = 0;
			DesktopAgentService.lastHeartbeatReceivedTime = event.data;
			this.publishEvent();
		}
	}

	checkHeartbeat() {

		this.heartBeatsMissed = !this.heartBeatReceived ? this.heartBeatsMissed + 1 : 0;

		if (this.heartBeatsMissed >= DesktopAgentService.heartbeatMonitor.threshold && !this.heartBeatReceived) {
			this.publishEvent();
		}
	}

	/**
	 * Publishing event to Appshell to communicate heartbeat is received or not
	 */
	publishEvent() {
		if (DesktopAgentService.heartbeatMonitor.disabled == "false") {
			this.eventAggregator.publish(`heatbeat-monitor`, this.heartBeatReceived);
		}
	}

	setHeartBeatReceived(value) {
		this.heartBeatReceived = value;
	}
}
