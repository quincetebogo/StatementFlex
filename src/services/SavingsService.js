import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * Channel Service Methods for Savings Account/Plan/Product documents
 *
 * @export
 * @class SavingsService
 * @extends {ChannelServiceBase}
 */

 export class SavingsService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`serviceURIs.savingsPlanChannelServiceUrl`, 
			`SavingsChannelService`, 
			`v1`, 
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	// --------------
	// PUBLIC METHODS
	// --------------

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

		const url = `/cec-save-${this._version}/savings-account/landing`;

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
	 * Savings Account Transaction History - list of Transactions
	 *
	 * @param {object} transactionHistoryRequest details required to get list of transactions
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	 async savingsAccountTransactionHistory (transactionHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
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

		const url = `/cec-save-${this._version}/savings-account/transactions`;

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

		const url = `/cec-save-${this._version}/savings-plan/landing`;

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

	/**
	 * Savings Plan Transaction History - list of Transactions
	 *
	 * @param {object} transactionHistoryRequest details required to get list of transactions
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async savingsPlanTransactionHistory(transactionHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`savingsPlanTransactionHistory`)) {
			return this.mock(`savingsPlanTransactionHistory`, transactionHistoryRequest);
		}

		const request = {
			"accountNumber": transactionHistoryRequest.accountNumber,
			"startDate": transactionHistoryRequest.startDate,
			"endDate": transactionHistoryRequest.endDate,
			"startAtIndex": transactionHistoryRequest.startAtIndex,
			"maxResults": transactionHistoryRequest.maxResults,
			"moneyType": transactionHistoryRequest.moneyType
		};

		const url = `/cec-save-${this._version}/savings-plan/transactions`;

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

	// Statements flow CS calls

	async viewStatement(statement, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`viewStatements`)) {
			return this.mock(`viewStatements`);
		}

		const url = `/cec-save-${this._version}/documents/view-statements`;

		return this.post(
			url, 
			statement, 
			this.setToken(), 
			`viewStatement`, 
			null, 
			null, 
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async sendStatement(statement, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		const url = `/cec-save-${this._version}/documents/send-statement`;
		
		return this.post(
			url, 
			statement, 
			this.setToken(), 
			`sendStatement`, 
			null, 
			null, 
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	// Proof of account CS calls

	viewProofOfAccount(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/cec-save-${this._version}/documents/view-proof-of-account`;

		return this.post(
			url, 
			clientInfo, 
			this.setToken(), 
			`viewProofOfAccount`, 
			null, 
			null, 
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async sendProofOfAccount(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		const url = `/cec-save-${this._version}/documents/send-proof-of-account`;

		return this.post(
			url,
			clientInfo,
			this.setToken(),
			`sendProofOfAccount`,
			null,
			null,
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	// Get client Products

	getClientProducts(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const requestObject = {
			"cifNumber": request.cifNumber,
			"productStatus": request.status
		};
		
		const url = `/cec-save-${this._version}/savings-product/products`;

		return this.post(
			url, 
			requestObject, 
			this.setToken(), 
			`getClientProducts`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------
 }