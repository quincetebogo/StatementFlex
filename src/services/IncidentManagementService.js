import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { SecurityContext } from 'platform/SecurityContext';

const STRACK_URGENCY = `Medium`;
const STRACK_IMPACT = `Medium`;
const STRACK_SOURCE = `RealConnect`;

/**
 * The IncidentManagementService is used to create an incident for recording information
 * about the handling of a call.
 *
 * @export
 * @class IncidentManagementService
 * @extends {ChannelServiceBase}
 */
export class IncidentManagementService extends ChannelServiceBase {
	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`serviceURIs.incidentManagementService`, 
			`incidentManagementService`, 
			`v1`,
			null
		);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Creates a new incident. 
	 *
	 * @param {object} incidentData The incoming all information to record against the incident
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	createIncident(incidentData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const createIncidentRequest = this._formatIncidentRequest(incidentData);

		const url = `/clientcare-incident-${this._version}/create-incident`;
	
		return this.post(
			url, 
			createIncidentRequest, 
			this.setToken(), 
			`createIncident`, 
			null, 
			null, 
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	_formatIncidentRequest(incidentData) {
		return {
			"ucid": incidentData.voiceReferenceNumber,
			"cli": incidentData.incomingTelephoneNumber,
			"clientCIF": ``,
			"orgUnitId": ``,
			"category": ``,
			"subCategory": ``,
			"issue": ``,
			"vdn": incidentData.VDN,
			"networkUserName": SecurityContext.getInstance().username,
			"source": `${STRACK_SOURCE}`,
			"impact": `${STRACK_IMPACT}`,
			"urgency": `${STRACK_URGENCY}`,
			"branchID": ``,
			"summary": ``,
			"description": ``,
			"incidentType": ``,
			"nonClientDetails": {
				"fullName": ``,
				"southAfricanIDNumber": ``,
				"cellPhone": ``,
				"workPhone": ``,
				"email": ``
			},
			"primaryNeedIncident": incidentData.primaryIncident
		};
	}

	/**
	 * Record the details of a client against an incident
	 *
	 * @param {String} cifNumber The client's CIF number
	 * @param {object} incident The Incident against which the client details will get recorded
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} A promise for an object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 updateIncidentClientDetails(cifNumber, incident, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/clientcare-incident-${this._version}/UpdateIncidentClientDetails`, 
			{
				incident: incident,
				cif: cifNumber
			}, 
			this.setToken(), 
			`updateIncidentClientDetails`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Record the details of a non client against an incident
	 *
	 * @param {Object} incident Incident against which the client details will get recorded
	 * @param {String} nonClientDetails Non client details
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} A promise for an object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 updateIncidentNonClientDetails(incident, nonClientDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		nonClientDetails.incident = incident;
	
		return this.post(
			`/clientcare-incident-${this._version}/addcaller/nonclient`, 
			nonClientDetails, 
			this.setToken(), 
			`updateIncidentNonClientDetails`, 
			null, 
			null, 
			900,
			null,
			errorHandler, 
			autoRetries
		);
	}

	/**
	 * Brings back other needs categories. 
	 *
	 * @param {object} orgUnit It is a grouping of categories on STrack, defaulted to Client Care for now
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 otherNeedCategories(orgUnit, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const request = {
			"orgUnit": encodeURIComponent(orgUnit)
		};

		const url = `/clientcare-incident-${this._version}/categories`;

		return this.post(
			url,
			request,
			this.setToken(), 
			`otherNeedCategories`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Brings back specific needs
	 *
	 * @param {object} orgUnit It is a grouping of categories on STrack, defaulted to Client Care for now
	 * @param {object} category Broader categories for other Needs 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 otherNeedSpecificNeed(orgUnit, category, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const request = {
			"orgUnit": encodeURIComponent(orgUnit),
			"categoryName": encodeURIComponent(category)
		};

		const url = `/clientcare-incident-${this._version}/need`;
		
		return this.post(
			url,
			request,
			this.setToken(), 
			`otherNeedSpecificNeed`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Brings back other needs issue and solution
	 *
	 * @param {object} orgUnit It is a grouping of categories on STrack, defaulted to Client Care for now
	 * @param {object} category Broader categories for other Needs 
	 * @param {object} need Specific need categories for other Needs 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 otherNeedIssueType(orgUnit, category, need, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const request = {
			"orgUnit": encodeURIComponent(orgUnit),
			"categoryName": encodeURIComponent(category),
			"need": encodeURIComponent(need)
		};

		const url = `/clientcare-incident-${this._version}/issue`;

		return this.post(
			url,
			request,
			this.setToken(), 
			`otherNeedIssueType`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Closing current incident.
	 *
	 * @param {object} incident The incident to close
	 * @param {string} reason The reason for closing
	 * @param {string} resolution The resolution of the incident
	 * @param {string} causeCode Cause code for the incident
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 closeIncident(incident, reason, resolution, causeCode, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const request = this._formatCloseIncidentRequest(incident, reason, resolution, causeCode);

		return this.put(
			`/clientcare-incident-${this._version}/close-incident`,
			request, 
			this.setToken(), 
			`closeIncident`, 
			null, 
			null, 
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	_formatCloseIncidentRequest(incident, reason, resolution, causeCode) {
		return {
			incident: incident,
			reason: reason,
			resolution: resolution,
			causeCode: causeCode
		};
	}

	/**
	 * classifying incident.
	 *
	 * @param {object} incident The incident to classify
	 * @param {string} [need=null] A need constant that is mapped to a classification
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	classifyIncident(incident, need, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-incident-${this._version}/classification`;
	
		return this.post(
			url, 
			{
				incident: incident,
				need: need
			}, 
			this.setToken(), 
			`classifyIncident`, 
			null, 
			null, 
			null,
			null,
			errorHandler, 
			autoRetries
		);
	}

	/**
	 * Retrieving incident status.
	 *
	 * @param {object} incident An incident for which the current status must be retrieved
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 incidentStatus(incident, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-incident-${this._version}/incident`;
		
		return this.post(
			url,
			{
				incident: incident
			},
			this.setToken(), 
			`incidentStatus`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	* Adding branch details for consultant phoning on behalf of client
	* @param {object} incident The current incident
    * @param {string} branchCode BranchCode to classify branch
	* @param {string} branchCallerID Branch caller user id
	* @param {errorHandlerCallback} [errorHandler=null] and optional error handler
	* @param {Number} [autoRetries] The amount of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	* @memberof IncidentManagementService
	*/
	UpdateIncidentBranchDetailsRequest(incident, branchCode, branchCallerID, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const branchDetails = {
			incident: incident,
			branchCode: branchCode,
			userID: branchCallerID
		};

		const url = `/clientcare-incident-${this._version}/UpdateIncidentBranchDetails`;

		return this.post(
			url, 
			branchDetails, 
			this.setToken(), 
			`UpdateIncidentBranchDetailsRequest`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Retrieving consultant information
	 * @param {String} cpNumber The CP number of the consultant phoning on behalf of a client
	 * @param {errorHandlerCallback} [errorHandler=null] and optional error handler
	 * @param {Number} [autoRetries] The amount of times the call should be retried if it fails
	 * @returns { Consultant<ReturnValue> } An object of the consultant information
	 * @memberof IncidentManagementService
	 */
	GetConsultantInformation(cpNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const request = {
			"userID": cpNumber
		};

		const url = `/clientcare-incident-${this._version}/user-details`;

		return this.post(
			url,
			request,
			this.setToken(),
			`GetConsultantInformation`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}
}