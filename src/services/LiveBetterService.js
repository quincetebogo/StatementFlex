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

		
	/**
	 * Live better Transaction History - list of Transactions
	 *
	 * @param {object} transactionHistoryRequest details required to get list of transactions
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	 liveBetterTransactionHistory (transactionHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.liveBetterTransactionHistory(transactionHistoryRequest), `liveBetterTransactionHistory`, errorHandler, autoRetries);
	}

	/**
	 * Live better Linked transaction details - list of linked transactions and it's details
	 *
	 * @param {object} transactionHistoryRequest details required to get list of transactions
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	 lbbLinkedTransactionDetails (transactionHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.lbbLinkedTransactionDetails(transactionHistoryRequest), `lbbLinkedTransactionDetails`, errorHandler, autoRetries);
	}
}