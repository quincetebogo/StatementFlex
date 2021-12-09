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
	 * Returns information on the logged in agent/user
	 *
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} A promise for an object containing a success flag and the result of the channel service call
	 * @memberof InitialiseService
	 */
	initialise(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-initialise-${this._version}`;

		return this.get(
			url, 
			this.setToken(), 
			`initialise`, 
			false, 
			null, 
			null, 
			errorHandler, 
			autoRetries
		);
	}
}