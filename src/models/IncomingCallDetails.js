/**
 * IncomingCallDetails records the information on the incoming call. This object is preserved
 * in state for the duration of the call.
 */
export class IncomingCallDetails {

	/**
	 * Creates an instance of IncomingCallDetails.
	 * 
	 * @param {string} [incomingTelephoneNumber=``] The CLI (number of the incoming call)
	 * @param {string} [incidentReferenceNumber=``] The STrack Incident Reference Number
	 * @param {string} [incidentRecId=``] The STrack Incident Reference ID
	 * @param {string} [voiceReferenceNumber=``] The reference number for the call recording
	 * @param {string} [agentTelephoneNumber=``] The agent's extension
	 * @param {string} [ivrOptionCode=``] The IVR Option/Need
	 * @param {Object} [ivrOption={possibleValues:[], value: ``}] The list of IVR Options/Needs and the currently selected Need
	 * @memberof IncomingCallDetails
	 */
	constructor(
		incomingTelephoneNumber = ``, 
		incidentReferenceNumber = ``, 
		incidentRecId = ``, 
		voiceReferenceNumber = ``,
		agentTelephoneNumber = ``, 
		ivrOptionCode = ``, 
		ivrOption = { 
						'possibleValues': [
							{
								key: `StopCard`, value: `Stop Card`
							},
							//{
							//	key: `Insure`, value: `Insure`
							//},
							{
								key: `Transact`, value: `Transact`
							}
						], 
						'value': ivrOptionCode
				}
	) {
		this.incomingTelephoneNumber = incomingTelephoneNumber;
		this.incidentReferenceNumber = incidentReferenceNumber;
		this.incidentRecId = incidentRecId;
		this.agentTelephoneNumber = agentTelephoneNumber;
		this.voiceReferenceNumber = voiceReferenceNumber;

		// The IVR Option selected in the telephony system
		this.ivrOptionCode = ivrOptionCode;

		// An array of possible needs (IVR Options are mapped onto one of the needs in this array)
		this.ivrOption = ivrOption;
	}
}