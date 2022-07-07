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
	 * Create token to enable envoking FIPS, this will move to the channel service.
	 * @returns {Object} Header entries 
	 */
	setInsureTokens() {
		const test = Security.getInstance().token;

		return {
			"X-User-Token": Security.getInstance().token,
			"x-session-id": v4(),
			"x-request-id": v4(),
			"x-requester-uid": 'CP336134_17249_01_3997_16',
		};
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
		const url = `/FuneralInsuranceProductService/product/params`;
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
			`/FuneralInsuranceProductService/client/summary?WithClaims=true`,
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
			`/FuneralInsuranceProductService/policy/summary?WithClaims=true`,
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
			`/FuneralInsuranceProductService/estimate`,
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
	 * Retrieve quote details
	 *
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
	 *
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


	// ---- OLD // Check if can / should still use these

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
			`/FuneralInsuranceProductService/policy/transactions`,
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
}