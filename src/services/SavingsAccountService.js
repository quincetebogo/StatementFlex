import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

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
	 * Retrieves the list of debi-check mandates for the main debi-checks display
	 *
	 * @param {string} cifNumber The Client's CIF Number
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	debiCheckMandates(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.debiCheckMandates(cifNumber), `debiCheckMandates`, errorHandler, autoRetries);
	}
	
	/**
	 * Retrieves the data for the debi-check View Info dialog
	 *
	 * @param {string} cifNumber The Client's CIF number
	 * @param {number} mandateId mandate ID
	 * @param {number} registerId register ID
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async debiCheckDetails(cifNumber, mandateId, registerId, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		return this.wrapCall(this.channelService.debiCheckDetails(cifNumber, mandateId, registerId), `debiCheckDetails`, errorHandler, autoRetries);
	}

	/**
	 * Declines a debi-check mandate
	 *
	 * @param {string} cifNumber The Client's CIF number
	 * @param {string} mandateReferenceNumber mandate refernece number
	 * @param {string} debtorAccountNumber debtor account number
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async debiCheckDecline (cifNumber, mandateReferenceNumber, debtorAccountNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		return this.wrapCall(this.channelService.debiCheckDecline(cifNumber, mandateReferenceNumber, debtorAccountNumber), `debiCheckDecline`, errorHandler, autoRetries);
	}
	
	/**
	 * Transaction History - list of Transactions
	 *
	 * @param {object} transactionHistoryRequest details required to get list of transactions
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	transactionHistory (transactionHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.transactionHistory(transactionHistoryRequest), `transactionHistory`, errorHandler, autoRetries);
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
 	savingsAccountLanding (cifNumber, nationalIDNumber, getGenericData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.savingsAccountLanding(cifNumber, nationalIDNumber, getGenericData), `savingsAccountLanding`, errorHandler, autoRetries);
	}

	/**
	 * Approves debi-check mandate
	 *
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	 async debiCheckApprove (errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		return this.wrapCall(this.channelService.debiCheckApprove(), `debiCheckApprove`, errorHandler, autoRetries);
	}
}