import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { Security } from 'platform/core';
import { v4 } from 'uuid';

/**
 * Channel Service Methods for Insure related functionality
 *
 * @export
 * @class InsureService
 * @deprecated - InsureService is old code that will probably be completely replaced when we finally pick up Insure
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

	setInsureTokens() {
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
			return this.mock(`insureProductParams`, insureProductParams);
		}

		const url = `/FuneralInsuranceProductService/product/params`;
		return this.get(
			url,
			this.setInsureTokens(),
			`productParams`,
			null,
			1000,
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
		if (await this.isMockEnabled(`insureCalculateEstimate`)) {
			return this.mock(`insureCalculateEstimate`);
		}

		return this.post(
			`/FuneralInsuranceProductService/quote/estimate`,
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
		if (await this.isMockEnabled(`insureCalculateQuote`)) {
			return this.mock(`insureCalculateQuote`);
		}

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
		if (await this.isMockEnabled(`insureRetrieveQuoteDetails`)) {
			return this.mock(`insureRetrieveQuoteDetails`);
		}

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
		if (await this.isMockEnabled(`insureRetrieveQuotes`)) {
			return this.mock(`insureRetrieveQuotes`);
		}

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

	/**
	 * Client Policy Summary / Policy list
	 *
	 * @param {summaryRequest} [errorHandler=null]  Request data for summary 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async clientPolicySummary(summaryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureClientPolicySummary`)) {
			console.log('MOCKS!')
			return this.mock(`insureClientPolicySummary`);
		}

		return this.post(
			`/FuneralInsuranceProductService/client/summary`,
			quoteRequest,
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

	//#endregion


	// ---- OLD // Check if can / should still use these

	async hasInsuranceProducts(insuranceClientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`hasInsuranceProducts`)) {
			return this.mock(`hasInsuranceProducts`);
		}

		const url = `/clientcare-insure-${this._version}/landing?` +
			`IdNumber=${insuranceClientInfo.IdNumber}&` +
			`Cif=${insuranceClientInfo.CifNumber}&` +
			`IsCallerVerified=${insuranceClientInfo.isCallerVarified}`;

		return this.get(
			url,
			this.setToken(),
			`hasInsuranceProducts`,
			null,
			1000,
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
}