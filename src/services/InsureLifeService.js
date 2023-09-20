import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { InitialiseService } from 'app/services/InitialiseService';
import { Security } from 'platform/core';
import { v4 } from 'uuid';

/**
 * Channel Service Methods for Insure Life related functionality
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
			"x-requester-uid": this._generateFIPSRequesterUID()
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
	_generateFIPSRequesterUID() {
		return `${this.employeeId}_XXXXX_02_2000_XX`;
	}

	// #endregion PRIVATE FUNCTIONS

	// #region PUBLIC METHODS

	/**
	 * Returns the Summary of clients life policies
	 *
	 * @param {Object} [lifeClientSummaryRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeClientSummary(lifeClientSummaryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeClientSummary`)) {
			return this.mock(`insureLifeClientSummary`);
		}
		return this.post(
			`/horizon-insurance/life/client/summary`,
			lifeClientSummaryRequest,
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
	 * @param {lifeCancelPolicyRequest} [lifeCancelPolicyRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeCancelPolicy(lifeCancelPolicyRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeCancelPolicy`)) {
			return this.mock(`insureLifeCancelPolicy`);
		}
		return this.post(
			`/horizon-insurance/life/policy/cancel-policy`,
			lifeCancelPolicyRequest,
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
	 * returns the Arrears for specified policy 
	 *
	 * @param {lifeGetArrearsRequest} [lifeGetArrearsRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeGetArrears(lifeGetArrearsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeGetArrears`)) {
			return this.mock(`insureLifeGetArrears`);
		}
		return this.post(
			`/horizon-insurance/life/policy/get-arrears`,
			lifeGetArrearsRequest,
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
	 * returns details for specified life policy 
	 *
	 * @param {lifeGetPolicyRequest} [lifeGetPolicyRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeGetPolicy(lifeGetPolicyRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureLifeGetPolicy`)) {
			return this.mock(`insureLifeGetPolicy`);
		}
		return this.post(
			`/horizon-insurance/life/policy/get-policy`,
			lifeGetPolicyRequest,
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

	// Docs

	/**
	 * Cancels the specified policy and cancels all mandates linked to the policy
	 *
	 * @param {lifeCancelPolicyAgreementRequest} [lifeCancelPolicyAgreementRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async lifeCancelPolicyAgreement(lifeCancelPolicyAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenerateAgreement`)) {
			return this.mock(`generateAgreement`, lifeCancelPolicyAgreementRequest);
		}
		return this.post(
			`/horizon-insurance/life/document/generate/cancel-policy-agreement`,
			lifeCancelPolicyAgreementRequest,
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

	// #endregion PUBLIC METHODS
}