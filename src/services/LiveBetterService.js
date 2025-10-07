import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * Channel Service Methods for Live Better flow
 *
 * @export
 * @class LiveBetterService
 * @extends {ChannelServiceBase}
 */
export class LiveBetterService extends ChannelServiceBase {
	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc,
			defaultErrorHandlerFunc,
			`serviceURIs.liveBetterServiceUrl`,
			`HorizonChannelService`,
			`v1`,
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);

		this._version_2 = `v2`;
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
	async liveBetterLanding(clientDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`liveBetterLanding`)) {
			return this.mock(`liveBetterLanding`);
		}

		return this.post(
			`/clientcare-lbb-${this._version_2}/landing`,
			clientDetails,
			this.setToken(),
			`liveBetterLanding`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}


	/**
	 * Live better Transaction History - list of Transactions
	 *
	 * @param {object} transactionHistoryRequest details required to get list of transactions
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async liveBetterTransactionHistory(transactionHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`liveBetterTransactionHistory`)) {
			return this.mock(`liveBetterTransactionHistory`, transactionHistoryRequest);
		}

		return this.post(
			`/clientcare-lbb-${this._version_2}/transactions`,
			transactionHistoryRequest,
			this.setToken(),
			`liveBetterTransactionHistory`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Live better Linked transaction details - list of linked transactions and it's details
	 *
	 * @param {object} transactionHistoryRequest details required to get list of transactions
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lbbLinkedTransactionDetails(transactionHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`lbbLinkedTransactionDetails`)) {
			return this.mock(`lbbLinkedTransactionDetails`, transactionHistoryRequest);
		}

		return this.post(
			`/clientcare-lbb-${this._version_2}/transaction-detail`,
			transactionHistoryRequest,
			this.setToken(),
			`lbbLinkedTransactionDetails`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Update live better roundup details
	 *
	 * @param {object} updateRoundupRequest details required to update lbb roundup details
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lbbUpdateRoundupDetails(updateRoundupRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().autoCreateAndClassify(this._toggleBusyFlag);

		return this.put(
			`/clientcare-lbb-${this._version_2}/update-lbb-account`,
			updateRoundupRequest,
			this.setToken(),
			`lbbUpdateRoundupDetails`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}
}