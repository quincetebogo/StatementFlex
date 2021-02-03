import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';

/**
 * Channel Service Methods for Savings Account
 *
 * @export
 * @class SavingsAccountService
 * @extends {ServiceBase}
 */
export class SavingsAccountService extends ServiceBase {
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
	 * Get client's debi check mandates
	 *
	 * @param {object} clientInfo Holds client information
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof SavingsAccountService
	 */
	debiCheckMandates(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.debiCheckMandates(clientInfo), `debiCheckMandates`, errorHandler, autoRetries);
	}
}