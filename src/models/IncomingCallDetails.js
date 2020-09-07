/**
 * After an new call comes in, an IncomingCallDetails object must get passed to the
 * Confirmed Caller or the Search dialog. The dialogs expect an object with of this
 * model.
 */
export class IncomingCallDetails {
	constructor() {
		this.incomingTelephoneNumber = ``;
		this.incidentReferenceNumber = ``;
		this.incidentRecId = ``;
		this.agentTelephoneNumber = ``;

		// The IVR Option selected in the telephony system
		this.ivrOptionCode = ``;

		// An array of possible needs (IVR Options are mapped onto one of the needs in this array)
		this.ivrOption = {
			possibleValues: []
		};
	}
}