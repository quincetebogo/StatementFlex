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
	 * @param {string} [primaryIncidentRef = ``] Primary incident reference number
	 * @param {string} [primaryIncidentRecID] Primary incident recID, when there is subsequent need
	 * @param {string} [currentNeed = ``] Current need [Stopcard/ Debicheck/ Statements etc..]
	 * @param {string} [previousNeed = ``] Previous need [Stopcard/ Debicheck/ Statements etc..], when switching to subsequent need
	 * @param {status} [needStatus = `InProgress`] Status of need *Internal purpose* [InProgress/ Completed/ Assigned]
	 * @param {string} [feedback = ``] Feedback of incident (need fulfilled/ assigned/ handed-off)
	 * @param {boolean} [incCreated = true] Flag to differentiate between error creating inc vs no inc created yet
	 * @param {string} [description = ``] Incident's description to update on strack
	 * @memberof IncidentDetails
	 */

	constructor(
		incidentReferenceNumber = ``,
		incidentRecId = ``,
		primaryIncidentRef = ``,
		primaryIncidentRecID = ``,
		currentNeed = ``,
		previousNeed = ``,
		needStatus = `Not Started`,
		feedback = ``,
		incCreated = true,
		description = ``
	) {
		this.incidentReferenceNumber = incidentReferenceNumber;
		this.incidentRecId = incidentRecId;
		this.primaryIncidentRef = primaryIncidentRef;
		this.primaryIncidentRecID = primaryIncidentRecID;
		this.currentNeed = currentNeed;
		this.previousNeed = previousNeed;
		this.needStatus = needStatus;
		this.feedback = feedback;
		this.incCreated = incCreated;
		this.description = description;
	}
};