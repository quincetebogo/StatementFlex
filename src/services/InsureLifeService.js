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
			`/life-cover/api/v1/client/summary`,
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
			`/life-cover/api/v1/policy/cancel-policy`,
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
			`/life-cover/api/v1/policy/get-policy`,
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
			`/life-cover/api/v1/policy/mandates`,
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
			`/life-cover/api/v1/policy/get-arrears`,
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
			`/life-cover/api/v1/policy/arrears/pay`,
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
			`/life-cover/api/v1/product/health-questions`,
			healthQuestionsRequest,
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
			`/life-cover/api/v1/quote/allowed-cover`,
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
			`/life-cover/api/v1/policy/transaction-history`,
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
			`/life-cover/api/v1/message/sms-history`,
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
			`/life-cover/api/v1/document/generate/cancel-policy-agreement`,
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
			`/life-cover/api/v1/document/generate/pay-arrears-agreement`,
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
			`/life-cover/api/v1/document/email`,
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
	async lifeUpdateBankingDetails(updateBankingDetailsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeUpdateBankingDetails`)) {
			return this.mock(`insureLifeUpdateBankingDetails`, {});
		}
		return this.post(
			`/life-cover/api/v1/policy/update-banking-details`,
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
			`/life-cover/api/v1/document/generate/update-agreement`,
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

	/**
	 * ReIssue
	 *
	 * @param {Object} [reIssueRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeReIssue(reIssueRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeReIssuePolicy`)) {
			return this.mock(`insureLifeReIssuePolicy`, reIssueRequest);
		}
		return this.post(
			`/life-cover/api/v1/policy/re-issue`,
			reIssueRequest,
			this._setInsureHeaders(),
			`lifeReIssue`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Generate issue agreement
	 *
	 * @param {Object} [issueAgreementRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeIssueAgreement(issueAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenericLifeDocument`)) {
			return this.mock(`insureGenericLifeDocument`, issueAgreementRequest);
		}
		return this.post(
			`/life-cover/api/v1/document/generate/issue-agreement`,
			issueAgreementRequest,
			this._setInsureHeaders(),
			`lifeIssueAgreement`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Create / Issue new life policy
	 *
	 * @param {Object} [issueRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeCreatePolicy(issueRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeIssuePolicy`)) {
			return this.mock(`insureLifeIssuePolicy`, issueRequest);
		}
		return this.post(
			`/life-cover/api/v1/policy/create`,
			issueRequest,
			this._setInsureHeaders(),
			`lifeReIssue`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Accept life policy
	 *
	 * @param {Object} [acceptRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeAcceptPolicy(acceptRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeAcceptPolicy`)) {
			return this.mock(`insureLifeAcceptPolicy`, acceptRequest);
		}
		return this.post(
			`/life-cover/api/v1/policy/accept-policy`,
			acceptRequest,
			this._setInsureHeaders(),
			`lifeReIssue`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Update life policy
	 *
	 * @param {Object} [updateRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeUpdatePolicy(updateRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeUpdatePolicy`)) {
			return this.mock(`insureLifeUpdatePolicy`, updateRequest);
		}
		return this.post(
			`/life-cover/api/v1/policy/update-policy`,
			updateRequest,
			this._setInsureHeaders(),
			`lifeUpdatePolicy`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Update life pocket
	 *
	 * @param {Object} [updateRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeUpdatePocket(updateRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeUpdatePocket`)) {
			return this.mock(`insureLifeUpdatePocket`, updateRequest);
		}
		return this.post(
			`/life-cover/api/v1/policy/update-pocket`,
			updateRequest,
			this._setInsureHeaders(),
			`lifeUpdatePocket`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Cover Available 
	 *
	 * @param {Object} [coverAvailableRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeCoverAvailable(coverAvailableRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeCoverAvailable`)) {
			return this.mock(`insureLifeCoverAvailable`, coverAvailableRequest);
		}
		return this.post(
			`/life-cover/api/v1/policy/cover-available`,
			coverAvailableRequest,
			this._setInsureHeaders(),
			`lifeCoverAvailable`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Increase cover
	 *
	 * @param {Object} [increaseCoverRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeIncreaseCover(increaseCoverRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeIncreaseCover`)) {
			return this.mock(`insureLifeIncreaseCover`, increaseCoverRequest);
		}
		return this.post(
			`/life-cover/api/v1/policy/increase-cover`,
			increaseCoverRequest,
			this._setInsureHeaders(),
			`lifeIncreaseCover`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
 * 
 * 
 * @param {activateBenefitRequest} activateBenefitRequest - The request object containing details needed to activate the benefit.
 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
 */
	async activateBenefit(activateBenefitRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeActivateBenefit`)) {
			return this.mock(`insureLifeActivateBenefit`);
		}
		return this.post(
			`/life-cover/api/v1/policy/newborn-waiver`,
			activateBenefitRequest,
			this._setInsureHeaders(),
			`activateBenefit`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
 * 
 * 
 * @param {cancelBenefitRequest} cancelBenefitRequest - The request object containing details needed to activate the benefit.
 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
 */
	async cancelBenefit(cancelBenefitRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeCancelBenefit`)) {
			return this.mock(`insureLifeCancelBenefit`);
		}
		return this.post(
			`/life-cover/api/v1/policy/newborn-waiver-stop`,
			cancelBenefitRequest,
			this._setInsureHeaders(),
			`cancelBenefit`,
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