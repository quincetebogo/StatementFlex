/**
 * After an new call comes in, an IncomingCallDetails object must get passed to the
 * Confirmed Caller or the Search dialog. The dialogs expect an object with of this
 * model.
 */
export class IncomingCallDetails {
	constructor(incomingTelephoneNumber = ``, 
				incidentReferenceNumber = ``, 
				incidentRecId = ``, 
				agentTelephoneNumber = ``, 
				ivrOptionCode = ``, 
				ivrOption = { 
								'possibleValues': [], 
								'value': ``
				}) {
		this.incomingTelephoneNumber = incomingTelephoneNumber;
		this.incidentReferenceNumber = incidentReferenceNumber;
		this.incidentRecId = incidentRecId;
		this.agentTelephoneNumber = agentTelephoneNumber;

		// The IVR Option selected in the telephony system
		this.ivrOptionCode = ivrOptionCode;

		// An array of possible needs (IVR Options are mapped onto one of the needs in this array)
		this.ivrOption = ivrOption
	}
}