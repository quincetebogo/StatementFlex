import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';

/**
 * The InitializeService is used on the Horizon Landing Page primarily to load the the 
 * current agent/user's details
 *
 * @export
 * @class InitialiseService
 * @extends {ServiceBase}
 */
export class InitialiseService extends ServiceBase {

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
	 * @callback initialiseCallback
	 * @param {object} exception - The exception from the failing service call
	 */

	 /**
	  * @typedef {Object} ReturnValue
	  * @property {boolean} succeeded - Indicates if the service call succeeded
	  * @property {object} result - The result of the service call if succeeded is true
	  */

	/**
	 * Returns information on the logged in agent/user
	 *
	 * @param {initialiseCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {ReturnValue} An object containing a success flag and the result of the channel service call
	 * @memberof InitialiseService
	 */
	initialise(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.serviceCallHelper.asyncCall(this.channelService.initialise(), `initialise`, errorHandler, autoRetries);
	}
}