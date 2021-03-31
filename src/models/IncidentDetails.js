/**
 * Incident details records the details of incident created at STrack.
 * This object is stored in state only for the current call.
 *
 * @export
 * @class IncidentDetails
 */
 export class IncidentDetails {

	/**
	 * Creates an instance of IncidentDetails.
	 * 
	 * @param {string} [incidentReferenceNumber = ``] The STrack Incident Reference Number
	 * @param {string} [incidentRecId = ``] The STrack Incident Reference ID
	 * @param {string} [primaryIncidentRecID] Primary incident recID, when there is subsequent need
	 * @param {string} [currentNeed = ``] Current need [Stopcard/ Debicheck/ Statements etc..]
	 * @param {string} [previousNeed = ``] Previous need [Stopcard/ Debicheck/ Statements etc..], when switching to subsequent need
	 * @param {status} [needStatus = `InProgress`] Status of need *Internal purpose* [InProgress/ Completed/ Assigned]
	 * @memberof IncidentDetails
	 */

	constructor(
		incidentReferenceNumber = ``,
		incidentRecId = ``,
		primaryIncidentRecID = ``,
		currentNeed = ``,
		previousNeed = ``,
		needStatus = `InProgress`
	) {
		this.incidentReferenceNumber = incidentReferenceNumber;
		this.incidentRecId = incidentRecId;
		this.primaryIncidentRecID = primaryIncidentRecID;
		this.currentNeed = currentNeed;
		this.previousNeed = previousNeed;
		this.needStatus = needStatus;
	}
};