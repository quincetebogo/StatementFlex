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
	 * @param {string} [VDN=``] incoming call info VDN
	 * @param {string} [incomingTelephoneNumber=``] The CLI (number of the incoming call). This no necessarilly the verified telephone number of the client
	 * @param {string} [isAssigned] If true, the incident must be assigned. (isHandedOff must be false)
	 * @param {string} [isHandedOff] If true, the incident must be handed off (isAssigned  must be false)
	 * @param {string} [voiceReferenceNumber=``] The reference number for the call recording
	 * @param {string} [agentTelephoneNumber=``] The agent's extension
	 * @param {string} [ivrOptionCode=``] The IVR Option/Need
	 * @param {Object} [ivrOption={possibleValues:[], value: ``}] The list of IVR Options/Needs and the currently selected Need
	 */
	constructor(
		VDN = ``,

		/**
		 * The CLI (incoming call number). This may not be the verified number of the client
		 */
		incomingTelephoneNumber = ``, 
		isAssigned = false,
		isHandedOff = false,
		voiceReferenceNumber = ``,

		/**
		 * The agent's extension. Note this is not a full telephone number
		 */
		agentTelephoneNumber = ``,

		ivrOptionCode = ``, 
		ivrOption = { 
						'possibleValues': [
							{
								key: `StopCard`, value: `Stop Card`
							},
							{
								key: `Transact`, value: `Transact`
							},
							{
								key: `ProductEnquiry`, value: `Product Enquiry`
							}
						], 
						'value': ivrOptionCode
				}
	) {
		this.VDN = VDN;
		this.incomingTelephoneNumber = incomingTelephoneNumber;
		this.isAssigned = isAssigned;
		this.isHandedOff = isHandedOff;
		this.voiceReferenceNumber = voiceReferenceNumber;
		this.agentTelephoneNumber = agentTelephoneNumber;

		// The IVR Option selected in the telephony system
		this.ivrOptionCode = ivrOptionCode;

		// An array of possible needs (IVR Options are mapped onto one of the needs in this array)
		this.ivrOption = ivrOption;

		Object.seal();
	}
}