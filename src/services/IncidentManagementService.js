import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';
import { SecurityContext } from 'platform/SecurityContext';

const STRACK_URGENCY = `Medium`;
const STRACK_IMPACT = `Medium`;

/**
 * The IncidentManagementService is used to create an incident for recording information
 * about the handling of a call.
 *
 * @export
 * @class IncidentManagementService
 * @extends {ServiceBase}
 */
export class IncidentManagementService extends ServiceBase {
	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, errorHandler = null) {
		super(toggleBusyFunc, errorHandler);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * @callback errorHandlerCallback
	 * @param {object} exception - The exception from the failing service call
	 */

	 /**
	  * @typedef {Object} ReturnValue
	  * @property {boolean} succeeded - Indicates if the service call succeeded
	  * @property {object} result - The result of the service call if succeeded is true
	  */

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
			"source": ``,
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

		return this.wrapCall(this.channelService.createIncident(createIncidentRequest), `createIncident`, errorHandler, autoRetries);
	}

	/**
	 * Record the details of a client against an incident
	 *
	 * @param {String} cifNumber The client's CIF number
	 * @param {String} incidentRecId STrack incident record ID against which the client details will get recorded
	 * @param {initialiseCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} A promise for an object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 updateIncidentClientDetails(cifNumber, incidentRecId, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.updateIncidentClientDetails(cifNumber, incidentRecId), `updateIncidentClientDetails`, errorHandler, autoRetries);
	}

	/**
	 * Record the details of a non client against an incident
	 *
	 * @param {String} incidentRecId STrack incident record ID against which the client details will get recorded
	 * @param {String} nonClientDetails Non client details
	 * @param {initialiseCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} A promise for an object containing a success flag and the result of the channel service call
	 * @memberof IncidentManagementService
	 */
	 updateIncidentNonClientDetails(incidentRecId, nonClientDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.updateIncidentNonClientDetails(incidentRecId, nonClientDetails), `updateIncidentNonClientDetails`, errorHandler, autoRetries);
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
		return this.wrapCall(this.channelService.otherNeedCategories(orgUnit), `otherNeedCategories`, errorHandler, autoRetries);
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
	return this.wrapCall(this.channelService.otherNeedSpecificNeed(orgUnit, category), `otherNeedSpecificNeed`, errorHandler, autoRetries);
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
		return this.wrapCall(this.channelService.otherNeedIssueType(orgUnit, category, need), `otherNeedIssueType`, errorHandler, autoRetries);
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
		return this.wrapCall(this.channelService.closeIncident(closeIncidentRequest), `closeIncident`, errorHandler, autoRetries);
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
		return this.wrapCall(this.channelService.classifyIncident(classifyIncidentRequest), `classifyIncident`, errorHandler, autoRetries);
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
		return this.wrapCall(this.channelService.incidentStatus(incidentRecId), `incidentStatus`, errorHandler, autoRetries);
	}
}