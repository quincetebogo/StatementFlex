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
		this.IncomingTelephoneNumber = incomingTelephoneNumber;
		this.VoiceReferenceNumber = voiceReferenceNumber;
		this.IVROptionCode = ivrOptionCode;
		this.AgentTelephoneNumber = agentTelephoneNumber;
		this.Date = date;
	}
};