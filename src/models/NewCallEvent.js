/**
 * SSE Event for incoming call
 */
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