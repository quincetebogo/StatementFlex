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
	 * @param {object} [currentIncident = null] The current incident being managed
	 * @param {object} [primaryIncident = null] The initial/primary incident to which all secondary incidents are linked
	 * @param {string} [currentNeed = ``] Current need [Stopcard/ Debicheck/ Statements etc..]
	 * @param {string} [previousNeed = ``] Previous need [Stopcard/ Debicheck/ Statements etc..], when switching to subsequent need
	 * @param {status} [incidentState = `InProgress`] Status of incident *Internal purpose* [InProgress/ Completed/ Assigned]
	 * @param {string} [feedback = ``] Feedback of incident (need fulfilled/ assigned/ handed-off)
	 * @param {string} [description = ``] Incident's description to update on strack
	 * @memberof IncidentDetails
	 */

	constructor(
		currentIncident = null,
		primaryIncident = null,
		currentNeed = ``,
		previousNeed = ``,
		incidentState = `Not Started`,
		feedback = ``,
		isReassigned = false,
		incCreated = true,
		description = ``
	) {
		this.currentIncident = currentIncident;
		this.primaryIncident = primaryIncident;
		this.currentNeed = currentNeed;
		this.previousNeed = previousNeed;
		this.incidentState = incidentState;
		this.feedback = feedback;
		this.isReassigned = isReassigned;
		this.incCreated = incCreated;    
		this.description = description;
	}
};