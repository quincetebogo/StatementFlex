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
	 * @param {status} [incidentState = undefined] Status of incident *Internal purposes* [Completed/ Assigned]
	 * @param {string} [feedback = ``] Feedback of incident (need fulfilled/ assigned/ handed-off)
	 * @param {string} [isReassigned = false] Indicates if the current incident has been reassigned in Strack
	 * @param {boolean} [incCreated = true] Indicates if there is a current successfully created incident
	 * @param {string} [description = ``] Incident's description to update on strack
	 * @param {boolean} [primaryIncidentFinished = true] Flag to indicate if future incidents should be sub-incidents
	 * @memberof IncidentDetails
	 */

	constructor(
		currentIncident = null,
		primaryIncident = null,
		currentNeed = ``,
		previousNeed = ``,

		/* Changed during incident management refactor
		incidentState = `Not Started`,
		*/
		incidentState = undefined,
		feedback = ``,
		isReassigned = false,
		incCreated = true,
		description = ``,
		primaryIncidentFinished = true
	) {
		this.currentIncident = currentIncident;
		this.primaryIncident = primaryIncident;
		this.currentNeed = currentNeed;
		this.previousNeed = previousNeed;
		this.incidentState = undefined; // We are not going to be using this anymore
		this.feedback = feedback;
		this.isReassigned = isReassigned;
		this.incCreated = incCreated;
		this.description = description;
		this.primaryIncidentFinished = primaryIncidentFinished;
	}
};