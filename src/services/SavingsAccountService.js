import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * Channel Service Methods for Savings Account
 *
 * @export
 * @class SavingsAccountService
 * @extends {ChannelServiceBase}
 */
export class SavingsAccountService extends ChannelServiceBase {
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
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	/**
	 * Transaction History - list of Transactions
	 *
	 * @param {object} transactionHistoryRequest details required to get list of transactions
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async transactionHistory (transactionHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`transactionHistory`)) {
			return this.mock(`transactionHistory`, transactionHistoryRequest);
		}

		const request = {
			"cifNumber": transactionHistoryRequest.cifNumber,
			"accountNumber": transactionHistoryRequest.accountNumber,
			"accountType": transactionHistoryRequest.accountType,
			"startDate": transactionHistoryRequest.startDate,
			"endDate": transactionHistoryRequest.endDate,
			"startAtIndex": transactionHistoryRequest.startAtIndex,
			"maxResults": transactionHistoryRequest.maxResults,
			"moneyType": transactionHistoryRequest.moneyType
		};

		const url = `/clientcare-savingsaccount-${this._version}/client/transactions`;

		return this.post(
			url,
			request,
			this.setToken(), 
			`transactionHistory`, 
			null, 
			null, 
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Get savings account landing page information
	 *
	 * @param {string} cifNumber The Client's CIF number
	 * @param {string} nationalIDNumber client's ID number
	 * @param {string} getGenericData Includes left hand bar details
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
 	async savingsAccountLanding (cifNumber, nationalIDNumber, getGenericData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`savingsAccountLanding`)) {
			return this.mock(`savingsAccountLanding`, cifNumber, nationalIDNumber, getGenericData);
		}
	
		const request = {
			"cifNumber": cifNumber,
			"nationalIDNumber": nationalIDNumber,
			"getGenericData": getGenericData
		};

		const url = `/clientcare-savingsaccount-${this._version}/landing`;

		return this.post(
			url,
			request,
			this.setToken(), 
			`savingsAccountLanding`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Get savings plan landing page information
	 *
	 * @param {string} cifNumber The Client's CIF number
	 * @param {string} nationalIDNumber client's ID number
	 * @param {string} getGenericData Includes left hand bar details
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
 	async savingsPlanLanding (cifNumber, nationalIDNumber, getGenericData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`savingsPlanLanding`)) {
			return this.mock(`savingsPlanLanding`, cifNumber, nationalIDNumber, getGenericData);
		}

		const request = {
			"cifNumber": cifNumber,
			"nationalIDNumber": nationalIDNumber,
			"getGenericData": getGenericData
		};

		const url = `/clientcare-savingsaccount-${this._version}/savings-plan-landing`;

		return this.post(
			url,
			request,
			this.setToken(), 
			`savingsPlanLanding`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}
}