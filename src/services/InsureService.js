import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { resolve } from 'path';
import { Security } from 'platform/core';
import { v4 } from 'uuid';

/**
 * Channel Service Methods for Insure related functionality
 *
 * @export
 * @class InsureService
 * @extends {ChannelServiceBase}
 */
export class InsureService extends ChannelServiceBase {

	//#region INITIALISATION

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
	}

	/**
	 * Create token to enable envoking FIPS
	 * @returns {Object} Header entries 
	 */
	setInsureTokens() {
		return {
			"X-User-Token": Security.getInstance().token,
			"x-session-id": v4(),
			"x-request-id": v4(),
			"x-requester-uid": this.generateFIPSRequesterUID(),
		};
	}

	/**
	 * Generate x-requester-uid for FIPS
	 */
	generateFIPSRequesterUID() {
		return 'CP336134_17249_02_3997_16';
	}

	//#endregion

	//#region PUBLIC METHODS

	/**
	 * IsAlive Check for Insure
	 *
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async alive(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/platform/healthcheck/${this._version}/alive`;
		return this.get(
			url,
			this.setToken(),
			`alive`,
			null,
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Product Params for Insure Product
	 *
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async productParams(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureProductParams`)) {
			return this.mock(`insureProductParams`);
		}
		const url = `/horizon-insurance/product/params`;
		return this.get(
			url,
			this.setInsureTokens(),
			`productParams`,
			null,
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Client Policy Summary / Policy list
	 *
	 * @param {clientPoliciesRequest} [errorHandler=null]  Request data containing cif & id numbers
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async clientPolicies(clientPoliciesRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureClientPolicies`)) {
			return this.mock(`insureClientPolicies`);
		}
		return this.post(
			`/horizon-insurance/client/summary?WithClaims=true`,
			clientPoliciesRequest,
			this.setInsureTokens(),
			`summary`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Policy Summary / Policy Details
	 *
	 * @param {policyRequest} [errorHandler=null]  Request data containing contract reference & cifnumber
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async insurePolicySummary(policyRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insurePolicySummary`)) {
			return this.mock(`insurePolicySummary`);
		}
		return this.post(
			`/horizon-insurance/policy/summary?WithClaims=true`,
			policyRequest,
			this.setInsureTokens(),
			`policysummary`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Calculate Estimate / leaving no footprint on OIPA
	 *
	 * @param {estimateRequest} [errorHandler=null]  Request data for estimate 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async calculateEstimate(estimateRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/horizon-insurance/estimate`,
			estimateRequest,
			this.setInsureTokens(),
			`calculateEstimate`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Calculate Quote / Generate Quote
	 *
	 * @param {quoteRequest} [errorHandler=null]  Request data for quote 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async calculateQuote(quoteRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/FuneralInsuranceProductService/quote/calc`,
			quoteRequest,
			this.setInsureTokens(),
			`calculateQuote`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Get Policy Transaction History
	 *
	 * @param {transactionsRequest} [errorHandler=null]  Request data for policy transactions 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async getPolicyTransactions(transactionsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insurePolicyTransactionHistory`)) {
			return this.mock(`policyTransactionHistory`, transactionsRequest);
		}
		return this.post(
			`/horizon-insurance/policy/transactions`,
			transactionsRequest,
			this.setInsureTokens(),
			`getPolicyTransactions`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Prepares FIPS for updating a policy, ensuring we fail fast if required 
	 *
	 * @param {prepareUpdateRequest} [errorHandler=null]  Request data for prepare update 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async prepareUpdate(prepareUpdateRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insurePrepareUpdate`)) {
			return this.mock(`prepareUpdate`, prepareUpdateRequest);
		}
		return this.post(
			`/horizon-insurance/policy/prepareupdate`,
			prepareUpdateRequest,
			this.setInsureTokens(),
			`prepareUpdate`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Takes in the details of the policy to be accepted and activates it and creates mandates 
	 *
	 * @param {policyAcceptRequest} [errorHandler=null]  Request data for policyAccept 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async policyAccept(policyAcceptRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insurePolicyAccept`)) {
			return this.mock(`policyAccept`, policyAcceptRequest);
		}
		return this.post(
			`/horizon-insurance/policy/accept`,
			policyAcceptRequest,
			this.setInsureTokens(),
			`policyAccept`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 *  Generates the 801 Funeral Cover Plan Agreement document
	 *
	 * @param {generateAgreementRequest} [errorHandler=null]  Request data for UpdateFuneralCoverPlanAgreement 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async generateUpdateFuneralCoverPlanAgreement(generateAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenerateUpdateFuneralCoverPlanAgreement`)) {
			return this.mock(`updateFuneralCoverPlanAgreement`, generateAgreementRequest);
		}
		return this.post(
			`/horizon-insurance/document/generate/UpdateFuneralCoverPlanAgreement`,
			generateAgreementRequest,
			this.setInsureTokens(),
			`updateFuneralCoverPlanAgreement`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 *  Generates the 804 Funeral Policy Payment Agreement document
	 *
	 * @param {generateAgreementRequest} [errorHandler=null]  Request data for FuneralPolicyPaymentAgreement 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async generateFuneralPolicyPaymentAgreement(generateAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenerateFuneralPolicyPaymentAgreement`)) {
			return this.mock(`funeralPolicyPaymentAgreement`, generateAgreementRequest);
		}
		return this.post(
			`/horizon-insurance/document/generate/FuneralPolicyPaymentAgreement`,
			generateAgreementRequest,
			this.setInsureTokens(),
			`funeralPolicyPaymentAgreement`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	//#endregion

	//#region DEPRECATED

	/**
	 * Retrieve quote details
	 * @deprecated No Quote for MPV - Confirm if can be removed entirely
	 * @param {quoteRequest} [errorHandler=null]  Request data for retrieve quote 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async retrieveQuoteDetails(quoteRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/FuneralInsuranceProductService/quote/retrieve`,
			quoteRequest,
			this.setInsureTokens(),
			`retrieveQuote`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Retrieve list of quotes
	 * @deprecated No Quote for MPV - Confirm if can be removed entirely
	 * @param {quoteRequest} [errorHandler=null]  Request data for retrieve quotes list 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async retrieveQuotes(quoteRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/FuneralInsuranceProductService/client/quotes/retrieve`,
			quoteRequest,
			this.setInsureTokens(),
			`retrieveQuotes`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	//#endregion


	//#region OLD // Check if can / should still use these

	async hasInsuranceProducts(insuranceClientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`hasInsuranceProducts`)) {
			return this.mock(`hasInsuranceProducts`);
		}

		const insuranceClientRequest = {
			'idNumber': insuranceClientInfo.idNumber,
			'cif': insuranceClientInfo.cifNumber,
			'isCallerVerified': insuranceClientInfo.isCallerVerified
		};

		return this.post(
			`/clientcare-insure-${this._version}/landing`,
			insuranceClientRequest,
			this.setToken(),
			`addNonClientDetails`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	addNonClientDetails(incidentData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const nonClientDetailsRequest = {
			'incidentRecId': incidentData.incidentRecId,
			'ivrOptionCode': incidentData.ivrOptionCode,
			'incomingTelephoneNumber': incidentData.incomingTelephoneNumber,
			'firstName': incidentData.firstName,
			'surname': incidentData.surname,
			'cellPhone': incidentData.cellPhone
		};

		return this.post(
			`/clientcare-insure-${this._version}/addCaller/nonclient`,
			nonClientDetailsRequest,
			this.setToken(),
			`addNonClientDetails`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	calculatePremiumDone(feedbackDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/clientcare-insure-${this._version}/CalculatePremium/done`,
			{
				'incidentRecId': feedbackDetails.incidentRecId,
				'feedback': feedbackDetails.feedback,
				'updateIncident': feedbackDetails.updateIncident
			},
			this.setToken(),
			`calculatePremiumDone`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}
	// #endregion
}