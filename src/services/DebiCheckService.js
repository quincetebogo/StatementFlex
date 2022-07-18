import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * The debi-check service contains service calls that helps to fullfill needs of a client on debi-check flow
 * like view, approve or decline a mandate.
 *
 * @export
 * @class DebiCheckService
 * @extends {ChannelServiceBase}
 */
export class DebiCheckService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc,
			defaultErrorHandlerFunc,
			`serviceURIs.debiCheckServiceUrl`,
			`csc-debicheck`,
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
	async debiCheckDecline(cifNumber, title, lastName, debiCheckDetails, mandateInfo, accepted, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`debiCheckDecline`)) {
			return this.mock(`debiCheckDecline`, cifNumber, title, lastName, debiCheckDetails, mandateInfo, accepted);
		}

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

		const url = `/clientcare-debicheck-${this._version}/mandate-decline`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`debiCheckDecline`,
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
	async debiCheckApprove (mandateInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`debiCheckApprove`)) {
			return this.mock(`debiCheckApprove`, mandateInfo);
		}

		const url = `/clientcare-debicheck-${this._version}/mandate-approve`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`debiCheckApprove`,
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
	 * @param {Object} clientInfo Information about the mandate and account holder
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async debiCheckAgreement (clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`debiCheckAgreement`)) {
			return this.mock(`debiCheckAgreement`, clientInfo);
		}

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
}