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
	 * @param {status} [incidentState = null] Status of incident *Internal purposes* [Completed/ Assigned]
	 * @param {string} [feedback = ``] Feedback of incident (need fulfilled/ assigned/ handed-off)
	 * @param {string} [isReassigned = false] Indicates if the current incident has been reassigned in Strack
	 * @param {boolean} [primaryIncidentCreated = true] Indicates if there is a current successfully created incident
	 * @param {string} [description = ``] Incident's description to update on strack
	 * @param {boolean} [primaryIncidentFinished = false] Flag to indicate if future incidents should be sub-incidents
	 * @memberof IncidentDetails
	 */

	constructor(
		currentIncident = null,
		primaryIncident = null,
		currentNeed = ``,
		previousNeed = ``,
		incidentState = null,
		feedback = ``,
		isReassigned = false,
		primaryIncidentCreated = true,
		description = ``,
		primaryIncidentFinished = false
	) {
		this.currentIncident = currentIncident;
		this.currentNeed = currentNeed;
		this.description = description;
		this.feedback = feedback;
		this.incidentState = null; // Set only when the incident is Completd, Closed, Assigned or Reassigned 
		this.isReassigned = isReassigned;
		this.previousNeed = previousNeed;
		this.primaryIncident = primaryIncident;
		this.primaryIncidentCreated = primaryIncidentCreated;
		this.primaryIncidentFinished = primaryIncidentFinished;
	}
};