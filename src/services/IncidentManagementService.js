import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { SecurityContext } from 'platform/SecurityContext';

const STRACK_URGENCY = `Medium`;
const STRACK_IMPACT = `Medium`;
const STARCK_SOURCE = `RealConnect`;

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
			`serviceURIs.channelServiceUrl`, 
			`HorizonChannelService`, 
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
		const createIncidentRequest = {
			"ucid": incidentData.voiceReferenceNumber,
			"cli": incidentData.incomingTelephoneNumber,
			"clientCIF": ``,
			"orgUnitId": ``,
			"category": ``,
			"subCategory": ``,
			"issue": ``,
			"vdn": incidentData.VDN,
			"networkUserName": SecurityContext.getInstance().username,
			"source": `${STARCK_SOURCE}`,
			"impact": `${STRACK_IMPACT}`,
			"urgency": `${STRACK_URGENCY}`,
			"branchID": ``,
			"summary": ``,
			"description": ``,
			"incidentType": ``,
			"nonClientDetails": {
				"fullName": ``,
				"southAfricanIDNumber": ``,
				"celllPhone": ``,
				"workPhone": ``,
				"email": ``
			},
			"referenceNo": ``,
			"primaryNeedIncidentRecId": incidentData.primaryIncidentRecID || ``
		};

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

	/**
	 * Record the details of a client against an incident
	 *
	 * @param {String} cifNumber The client's CIF number
	 * @param {String} incidentRecId STrack incident record ID against which the client details will get recorded
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} A promise for an object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 updateIncidentClientDetails(cifNumber, incidentRecId, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const request = {
			incidentRecId: incidentRecId,
			cif: cifNumber
		};
	
		return this.post(
			`/clientcare-incident-${this._version}/UpdateIncidentClientDetails`, 
			request, 
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
	 * @param {String} incidentRecId STrack incident record ID against which the client details will get recorded
	 * @param {String} nonClientDetails Non client details
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} A promise for an object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 updateIncidentNonClientDetails(incidentRecId, nonClientDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		nonClientDetails.incidentRecId = incidentRecId;
	
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
	 * @param {object} closeIncidentRequest The incoming all information to record against the incident
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 closeIncident(closeIncidentRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-incident-${this._version}/close-incident?` +
			`IncidentRecId=${closeIncidentRequest.incidentRecId}&` +
			`Reason=${closeIncidentRequest.reason}&` +
			`Resolution=${closeIncidentRequest.resolution}&` +
			`CauseCode=${closeIncidentRequest.causeCode}`;
	
		return this.put(
			url, 
			null, 
			this.setToken(), 
			`closeIncident`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * classifying incident.
	 *
	 * @param {object} classifyIncidentRequest IncidentRecID & need details to classify incident
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	classifyIncident(classifyIncidentRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-incident-${this._version}/classification`;
	
		return this.post(
			url, 
			classifyIncidentRequest, 
			this.setToken(), 
			`classifyIncident`, 
			null, 
			null, 
			900,
			null,
			errorHandler, 
			autoRetries
		);
	}

	/**
	 * Retrieving incident status.
	 *
	 * @param {object} incidentRecId IncidentRecID to get status
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 incidentStatus(incidentRecId, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-incident-${this._version}/incident`;
	
		return this.post(
			url,
			incidentRecId,
			this.setToken(), 
			`incidentStatus`,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	* Adding branch details for consultant phoning on behalf of client
    * @param {object} branchDetails IncidentRecID & BranchCode to classify branch
	* @param {errorHandlerCallback} [errorHandler=null] and optional error handler
	* @param {Number} [autoRetries] The amount of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	* @memberof IncidentManagementService
	*/
	UpdateIncidentBranchDetailsRequest(incidentRecID, branchCode, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const branchDetails = {
			incidentRecId: incidentRecID,
			branchCode: branchCode
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