import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';

/**
 * The InitializeService is used on the Horizon Landing Page primarily to load the the 
 * current agent/user's details
 *
 * @export
 * @class InitialiseService
 * @extends {ChannelServiceBase}
 */
export class InitialiseService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null, baseUrlKey = `serviceURIs.channelServiceUrl`, serviceName = `HorizonChannelService`, version = `v1`) {
		super(toggleBusyFunc, defaultErrorHandlerFunc, baseUrlKey, serviceName, version);
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
	 * @returns {Promise<ReturnValue>} A promise for an object containing a success flag and the result of the channel service call
	 * @memberof InitialiseService
	 */
	initialise(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-initialise-${this._version}`;
		return super.get(url, this._setToken(), `initialise`, false, null, null, errorHandler, autoRetries);
	}
}