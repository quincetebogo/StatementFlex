import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';

/**
 * Channel Service Methods for Live Better flow
 *
 * @export
 * @class LivBetterService
 * @extends {ServiceBase}
 */
export class LivBetterService extends ServiceBase {
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
	 * Get Live better savings account landing page information
	 *
	 * @param {string} clientDetails The Client details which has 'cifNumber', 'GetGenericData', 'NationalIDNumber'
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
 	liveBetterLanding (clientDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.liveBetterLanding(clientDetails), `liveBetterLanding`, errorHandler, autoRetries);
	}
}