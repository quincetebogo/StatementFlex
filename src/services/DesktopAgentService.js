
export class NewCallEvent {
	constructor() {
		this.date = new Date();
		this.incomingTelephoneNumber = "";
		this.voiceReferenceNumber = "";
		this.ivrOptionCode = "";
		this.incidentReferenceNumber = "";
		this.agentPhoneNumber = "";
	}
};


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
			console.log("event.data: ", event.data);
			console.log("is event an instance of NewCallEvent? ", event.data instanceof NewCallEvent);
		})
	}

	queueEvent(event) {
		if (event instanceof NewCallEvent) {
			this.eventQueue.push(event);
		}
	}

}