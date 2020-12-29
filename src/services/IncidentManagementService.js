import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';
import { SecurityContext } from 'platform/SecurityContext';

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
			"networkUserName": SecurityContext.getInstance().username,
			"cli": incidentData.incomingTelephoneNumber,
			"vdn": incidentData.VDN,
			"ucid": incidentData.voiceReferenceNumber
		};

		return this.wrapCall(this.channelService.createIncident(createIncidentRequest), `createIncident`, errorHandler, autoRetries);
	}
}