import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { InitialiseService } from 'app/services/InitialiseService';
import { Security } from 'platform/core';
import { v4 } from 'uuid';

/**
 * Channel service methods for Insure Life (ILCS) related functionality
 *
 * @export
 * @class InsureLifeService
 * @extends {ChannelServiceBase}
 */
export class InsureLifeService extends ChannelServiceBase {

	// #region INITIALISATION

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc,
			defaultErrorHandlerFunc,
			`serviceURIs.insureChannelServiceUrl`,
			`InsureChannelService`,
			`v1`,
			() => import(`../mocks/InsureChannelServiceMocks.js`)
		);
		this._version = `v1`;
		this.initialiseService = new InitialiseService(() => this._toggleBusyFlag(), (ex) => this._landingPageErrorHandler(ex));

		this.employeeId = ``;
		this._getLoggedInAgent();
	}

	// #endregion INITIALISATION

	// #region PRIVATE FUNCTIONS

	/**
	 * Create headers for Insure channel & product services
	 * @returns {Object} Header entries 
	 */
	_setInsureHeaders() {
		return {
			"X-User-Token": Security.getInstance().token,
			"x-session-id": v4(),
			"x-request-id": v4(),
			"x-requester-uid": this._generateILCRequesterUID()
		};
	}

	/**
	 * Get logged in agent ID
	 * @returns {void}
	 */
	async _getLoggedInAgent() {
		let id = `XXXXXXXX`;
		const returnValue = await this.initialiseService.initialise();
		if (returnValue.succeeded) {
			id = returnValue.result.loggedInAgent.employeeId;
		}
		this.employeeId = id;
	}

	/**
	 * Generate x-requester-uid for FIPS
	 * @returns {string} requesterID 
	 */
	_generateILCRequesterUID() {
		return `${this.employeeId}_XXXXX_02_2000_XX`;
	}

	// #endregion PRIVATE FUNCTIONS

	// #region PUBLIC METHODS

	/**
	 * Check if client qualifies for Life Cover 
	 *
	 * @param {Object} [clientQualifyRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeClientQualify(clientQualifyRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeClientQualifies`)) {
			return this.mock(`insureLifeClientQualifies`);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/client/qualify`,
			clientQualifyRequest,
			this._setInsureHeaders(),
			`lifeClientQualify`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Returns the Summary of clients Life Cover policies
	 *
	 * @param {Object} [clientSummaryRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeClientSummary(clientSummaryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeClientSummary`)) {
			return this.mock(`insureLifeClientSummary`);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/client/summary`,
			clientSummaryRequest,
			this._setInsureHeaders(),
			`lifeClientSummary`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Cancels the specified policy and cancels all mandates linked to the policy
	 *
	 * @param {Object} [cancelPolicyRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeCancelPolicy(cancelPolicyRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeCancelPolicy`)) {
			return this.mock(`insureLifeCancelPolicy`);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/policy/cancel-policy`,
			cancelPolicyRequest,
			this._setInsureHeaders(),
			`lifeCancelPolicy`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Get selected policy details
	 *
	 * @param {Object} [getPolicyRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeGetPolicy(getPolicyRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeGetPolicy`)) {
			return this.mock(`insureLifeGetPolicy`);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/policy/get-policy`,
			getPolicyRequest,
			this._setInsureHeaders(),
			`lifeGetPolicy`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

		/**
	 * Get Mandates for selected life policy
	 *
	 * @param {Object} [getMandatesRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeGetMandates(getMandatesRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeGetMandates`)) {
			return this.mock(`insureLifeGetMandates`, getMandatesRequest);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/policy/mandates`,
			getMandatesRequest,
			this._setInsureHeaders(),
			`lifeGetMandates`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Get arrears for selected life policy
	 *
	 * @param {Object} [getArrearsRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeGetArrears(getArrearsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeGetArrears`)) {
			return this.mock(`insureLifeGetArrears`, getArrearsRequest);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/policy/get-arrears`,
			getArrearsRequest,
			this._setInsureHeaders(),
			`lifeGetArrears`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Pay arrears for selected life policy
	 *
	 * @param {Object} [payArrearsRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifePayArrears(payArrearsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifePayArrears`)) {
			return this.mock(`insureLifePayArrears`, payArrearsRequest);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/policy/arrears/pay`,
			payArrearsRequest,
			this._setInsureHeaders(),
			`lifePayArrears`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Get health questionnaire
	 *
	 * @param {Object} [healthQuestionsRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeHealthQuestionnaire(healthQuestionsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeQuestionnaire`)) {
			return this.mock(`insureLifeQuestionnaire`);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/product/health-questions`,
			this._setInsureHeaders(),
			`lifeHealthQuestions`,
			null,
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Get health questionnaire
	 *
	 * @param {Object} [allowedCoverRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeAllowedCover(allowedCoverRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureAllowedCover`)) {
			return this.mock(`insureAllowedCover`);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/quote/allowed-cover`,
			allowedCoverRequest,
			this._setInsureHeaders(),
			`lifeAllowedCover`,
			null,
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Premium History for selected life policy
	 *
	 * @param {Object} [premiumHistoryRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifePremiumHistory(premiumHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifePremiumHistory`)) {
			return this.mock(`insureLifePremiumHistory`, premiumHistoryRequest);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/policy/transaction-history`,
			premiumHistoryRequest,
			this._setInsureHeaders(),
			`lifePremiumHistory`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * SMS History for selected life policy
	 *
	 * @param {Object} [smsHistoryRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeSMSHistory(smsHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeSMSHistory`)) {
			return this.mock(`insureLifeSMSHistory`, smsHistoryRequest);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/message/sms-history`,
			smsHistoryRequest,
			this._setInsureHeaders(),
			`lifeSMSHistory`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	// Document generation

	/**
	 * Generate life cancel policy agreement
	 *
	 * @param {Object} [cancelPolicyAgreementRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeCancelPolicyAgreement(cancelPolicyAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenericLifeDocument`)) {
			return this.mock(`insureGenericLifeDocument`, cancelPolicyAgreementRequest);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/document/generate/cancel-policy-agreement`,
			cancelPolicyAgreementRequest,
			this._setInsureHeaders(),
			`lifeCancelPolicyAgreement`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Generate life pay arrears agreement
	 *
	 * @param {Object} [payArrearsAgreementRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifePayArrearsAgreement(payArrearsAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenericLifeDocument`)) {
			return this.mock(`insureGenericLifeDocument`, payArrearsAgreementRequest);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/document/generate/pay-arrears-agreement`,
			payArrearsAgreementRequest,
			this._setInsureHeaders(),
			`lifePayArrearsAgreement`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Email Life agreement
	 *
	 * @param {Object} [emailDocumentsRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async emailLifeDocuments(emailDocumentsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureSendEmail`)) {
			return this.mock(`insureSendEmail`, {});
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/document/email`,
			emailDocumentsRequest,
			this._setInsureHeaders(),
			`lifeEmailDocuments`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Email Life agreement
	 *
	 * @param {Object} [updateBankingDetailsRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	lifeUpdateBankingDetails(updateBankingDetailsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		// if (await this.isMockEnabled(`insureSendEmail`)) {
		// 	return this.mock(`insureSendEmail`, {});
		// }
		return this.post(
			`/horizon-insurance/life-cover/api/v1/policy/update-banking-details`,
			updateBankingDetailsRequest,
			this._setInsureHeaders(),
			`lifeUpdateBankingDetails`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Generate update agreement
	 *
	 * @param {Object} [updateAgreementRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeUpdateAgreement(updateAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenericLifeDocument`)) {
			return this.mock(`insureGenericLifeDocument`, updateAgreementRequest);
		}
		return this.post(
			`/horizon-insurance/life-cover/api/v1/document/generate/update-agreement`,
			updateAgreementRequest,
			this._setInsureHeaders(),
			`lifeUpdateAgreement`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}
	// #endregion PUBLIC METHODS
}