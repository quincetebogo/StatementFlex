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
	 * Retrieves the list of debi-check mandates for the main debi-checks display
	 *
	 * @param {string} cifNumber The Client's CIF Number
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async debiCheckMandates(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag, null, false);

		if (await this.isMockEnabled(`debiCheckMandates`)) {
			return this.mock(`debiCheckMandates`, cifNumber);
		}

		const request = {
			cifNumber: cifNumber
		};

		const url = `/clientcare-debicheck-${this._version}/client-mandate`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`debiCheckMandates`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
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
		if (await this.isMockEnabled(`debiCheckDetails`)) {
			return this.mock(`debiCheckDetails`, cifNumber, mandateId, registerId);
		}

		const request = {
			cifNumber: cifNumber,
			mandateId: mandateId,
			registerId: registerId
		};

		const url = `/clientcare-debicheck-${this._version}/client-mandate-details`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`debiCheckDetails`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Decline and Approve a debi-check mandate
	 *
	 * @param {string} cifNumber Client's cif number
	 * @param {string} title Client's title (Mr/ Mrs)
	 * @param {string} lastName Client's last name
	 * @param {string} debiCheckDetails details of the selected mandate
	 * @param {string} mandateInfo details of the selected mandate
	 * @param {boolean} accepted true if accepted and false if declined
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async debiCheckAuthenticate(cifNumber, title, lastName, debiCheckDetails, mandateInfo, accepted, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		const request = {
			cifNumber: cifNumber,
			mandateReferenceNumber: debiCheckDetails.mandateReference,
			debtorAccountNumber: debiCheckDetails.debtorAccountNumber,
			accepted: accepted,
			title: title,
			lastName: lastName,
			collectorName: mandateInfo.mandateName,
			instalmentAmount: mandateInfo.amount,
			firstCollectionDate: debiCheckDetails.firstCollectionDate
		};

		const url = `/clientcare-debicheck-${this._version}/client-mandate-authenticate`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`debiCheckAuthenticate`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Confirm agreement of decline/approve debi-check mandate
	 *
	 * @param {Object} mandateInfo Information about the mandate and account holder
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async debiCheckConfirmAgreement (mandateInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`debiCheckConfirmAgreement`)) {
			return this.mock(`debiCheckConfirmAgreement`, mandateInfo);
		}

		// TODO: Remove this duplicate reassign, input model is ready to make service call
		const request = {
			cifNumber: mandateInfo.cifNumber,
			mandateRef: mandateInfo.mandateRef,
			title: mandateInfo.title,
			firstName: mandateInfo.firstName,
			surname: mandateInfo.surname,
			middleName: mandateInfo.middleName,
			identificationNumber: mandateInfo.identificationNumber,
			residentialAddress: mandateInfo.residentialAddress,
			postalAddress: mandateInfo.postalAddress,
			cellphone: mandateInfo.cellphone,
			homeNumber: mandateInfo.homeNumber,
			workNumber: mandateInfo.workNumber,
			savingsAccountNumber: mandateInfo.savingsAccountNumber,
			cardNumber: mandateInfo.cardNumber,
			contractReference: mandateInfo.contractReference,
			instalmentAmount: mandateInfo.instalmentAmount,
			frequency: mandateInfo.frequency,
			firstCollectionDate: mandateInfo.firstCollectionDate,
			collectionDayFrequencyWording: mandateInfo.collectionDayFrequencyWording,
			ultimateDebtorName: mandateInfo.debitAccountName,            
			debitAccountName: mandateInfo.debitAccountName,
			accountConfirmation: mandateInfo.accountConfirmation,
			instalmentConfirmation: mandateInfo.instalmentConfirmation,
			permissionToDebit: mandateInfo.permissionToDebit,
			termsAndConditionsConfirmation: mandateInfo.termsAndConditionsConfirmation,
			documentId: mandateInfo.documentId
		};

		const url = `/clientcare-debicheck-${this._version}/client-mandate-confirm-agreement`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`debiCheckConfirmAgreement`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Agreement of approve debi-check mandate
	 *
	 * @param {Object} mandateInfo Information about the mandate and account holder
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */

	debiCheckAgreement (clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const request = {
			title: clientInfo.title,
			firstName: clientInfo.firstName,
			surname: clientInfo.surname,
			identificationNumber: clientInfo.identificationNumber,
			savingsAccountNumber: clientInfo.savingsAccountNumber,
			registerId: clientInfo.registerId,
			mandateId: clientInfo.mandateId,
			mandateReferenceNumber: clientInfo.mandateReferenceNumber,
			cifNumber: clientInfo.cifNumber 
		};
		
		const url = `/clientcare-debicheck-${this._version}/client-mandate-agreement-template`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`debiCheckAgreement`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}
	
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