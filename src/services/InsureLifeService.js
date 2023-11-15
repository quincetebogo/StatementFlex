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
			`/horizon-insurance/life/policy/cancel-policy`,
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
			`/horizon-insurance/life/policy/get-policy`,
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
			`/horizon-insurance/life/policy/get-arrears`,
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
			`/horizon-insurance/life/policy/pay-arrears`,
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
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeHealthQuestionnaire(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeQuestionnaire`)) {
			return this.mock(`insureLifeQuestionnaire`);
		}
		return this.get(
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
	lifeAllowedCover(allowedCoverRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
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
		if (await this.isMockEnabled(`insureGenerateAgreement`)) {
			return this.mock(`generateAgreement`, cancelPolicyAgreementRequest);
		}
		return this.post(
			`/horizon-insurance/life/document/generate/cancel-policy-agreement`,
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
		if (await this.isMockEnabled(`insureGenerateAgreement`)) {
			return this.mock(`generateAgreement`, payArrearsAgreementRequest);
		}
		return this.post(
			`/horizon-insurance/life/document/generate/pay-arrears-agreement`,
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

	// #endregion PUBLIC METHODS
}