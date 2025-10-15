/**
 * SSE Event for incoming call
 */
export class NewCallEvent {
  constructor(
    date,
    incomingTelephoneNumber,
    voiceReferenceNumber,
    ivrOptionCode,
    agentTelephoneNumber,
    VDN,
    authenticationMethod,
    clientId,
    idType,
    externalId,
    externalSystem
  ) {
    this.date = date;
    this.incomingTelephoneNumber = incomingTelephoneNumber;
    this.voiceReferenceNumber = voiceReferenceNumber;
    this.ivrOptionCode = ivrOptionCode;
    this.agentTelephoneNumber = agentTelephoneNumber;
    this.VDN = VDN;
	this.authenticationMethod = authenticationMethod;
    this.clientId = clientId;
    this.idType = idType;
    this.externalId = externalId;
    this.externalSystem = externalSystem;
  }
}