/**
 * The Incoming Caller Details model
 * 
 * @module models/IncomingCallDetails
 */

/**
 * The IncomingCallDetails class records the information on the incoming call. This object is preserved
 * in state for the duration of the call.
 */
export class IncomingCallDetails {

	/**
	 * Creates an instance of IncomingCallDetails.
	 * 
	 * @param {string} [incomingTelephoneNumber=``] The CLI (number of the incoming call). This no necessarilly the verified telephone number of the client
	 * @param {string} [incidentReferenceNumber=``] The STrack Incident Reference Number
	 * @param {string} [incidentRecId=``] The STrack Incident Reference ID
	 * @param {string} [agentTelephoneNumber=``] The agent's extension
	 * @param {string} [ivrOptionCode=``] The IVR Option/Need
	 * @param {Object} [ivrOption={possibleValues:[], value: ``}] The list of IVR Options/Needs and the currently selected Need
	 */
	constructor(
		
		/**
		 * The CLI (incoming call number). This may not be the verified number of the client
		 */
		incomingTelephoneNumber = ``, 

		/**
		 * The incident reference number for the current call/need being handled
		 */
		incidentReferenceNumber = ``, 

		/**
		 * The incident record ID for the current call/need being handled
		 */
		incidentRecId = ``, 
		
		/**
		 * The agent's extension. Note this is not a full telephone number
		 */
		agentTelephoneNumber = ``, 

		ivrOptionCode = ``, 
		ivrOption = { 
						'possibleValues': [], 
						'value': ``
				}
	) {
		this.incomingTelephoneNumber = incomingTelephoneNumber;
		this.incidentReferenceNumber = incidentReferenceNumber;
		this.incidentRecId = incidentRecId;
		this.agentTelephoneNumber = agentTelephoneNumber;

		// The IVR Option selected in the telephony system
		this.ivrOptionCode = ivrOptionCode;

		// An array of possible needs (IVR Options are mapped onto one of the needs in this array)
		this.ivrOption = ivrOption;

		Object.seal();
	}
}