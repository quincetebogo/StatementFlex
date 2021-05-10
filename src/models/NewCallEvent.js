/**
 * SSE Event for incoming call
 */
export class NewCallEvent {
	constructor(
		incomingTelephoneNumber,
		voiceReferenceNumber,
		ivrOptionCode,
		agentTelephoneNumber,
		date
	) {
		this.incomingTelephoneNumber = incomingTelephoneNumber;
		this.voiceReferenceNumber = voiceReferenceNumber;
		this.ivrOptionCode = ivrOptionCode;
		this.agentTelephoneNumber = agentTelephoneNumber;
		this.date = date;
	}
};