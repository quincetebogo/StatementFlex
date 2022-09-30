import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { InitialiseService } from 'app/services/InitialiseService';
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

	/**
	 * Create token to enable envoking FIPS
	 * @param {String } employeeId id
	 * @returns {Object} Header entries 
	 */
	setInsureTokens() {
		return {
			"X-User-Token": Security.getInstance().token,
			"x-session-id": v4(),
			"x-request-id": v4(),
			"x-requester-uid": this.generateFIPSRequesterUID()
		};
	}

	/**
	 * Get logged in Agent Employee ID
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
	generateFIPSRequesterUID() {
		return `${this.employeeId}_XXXXX_02_XXXX_XX`;
	}

	// #endregion

	// #region PUBLIC METHODS

	/**
	 * IsAlive Check for Insure
	 *
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	alive(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
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
	 * @param {clientPoliciesRequest} [clientPoliciesRequest=null]  Request data containing cif & id numbers
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
	 * @param {policyRequest} [policyRequest=null]  Request data containing contract reference & cifnumber
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
	 * Reinstate Policy Quote number & details
	 *
	 * @param {reinstateQuoteRequest} [errorHandler=null]  Request data containing contract reference & cifnumber
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async insureReinstateQuoteCalc(reinstateQuoteRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureReinstateQuoteCalc`)) {
			return this.mock(`reinstateQuoteCalc`);
		}
		return this.post(
			`/FuneralInsuranceProductService/policy/reinstate`,
			reinstateQuoteRequest,
			this.setInsureTokens(),
			`reinstateQuoteCalc`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Create Policy
	 *
	 * @param {createPolicyRequest} [errorHandler=null]  Request data quote number & policy details
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async createPolicy(createPolicyRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureCreatePolicy`)) {
			return this.mock(`createPolicy`);
		}
		return this.post(
			`/FuneralInsuranceProductService/policy/create`,
			createPolicyRequest,
			this.setInsureTokens(),
			`createPolicy`,
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
	calculateEstimate(estimateRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
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
	 *  Generate Document 904 Estimate printout
	 *
	 * @param {generateEstimateDocRequest} [errorHandler=null]  Request data for Estimate printout 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	generateEstimatePrintout(generateEstimateDocRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		// if (await this.isMockEnabled(`insureEstimatePrintout`)) {
		// return this.mock(`generateIssueAgreement`);
		// }
		return this.post(
			`/FuneralInsuranceProductService/document/generate/Estimateprintout`,
			generateEstimateDocRequest,
			this.setInsureTokens(),
			`insureEstimatePrintout`,
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
			return this.mock(`calculateQuote`, quoteRequest);
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
	async updatePolicyAccept(policyAcceptRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureUpdatePolicyAccept`)) {
			return this.mock(`updatePolicyAccept`, policyAcceptRequest);
		}
		return this.post(
			`/FuneralInsuranceProductService/policy/accept`,
			policyAcceptRequest,
			this.setInsureTokens(),
			`updatePolicyAccept`,
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
			`/FuneralInsuranceProductService/policy/accept`,
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
	 *  Generates the 801 Issue Funeral Cover Plan Agreement document
	 *
	 * @param {generateIssueAgreementRequest} [errorHandler=null]  Request data for IssueFuneralCoverPlanAgreement 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async generateIssueFuneralCoverPlanAgreement(generateIssueAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenerateIssueAgreement`)) {
			return this.mock(`generateIssueAgreement`);
		}
		return this.post(
			`/FuneralInsuranceProductService/document/generate/IssueFuneralCoverPlanAgreement`,
			generateIssueAgreementRequest,
			this.setInsureTokens(),
			`issueFuneralCoverPlanAgreement`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 *  Generates the 801 Update Funeral Cover Plan Agreement document
	 *
	 * @param {generateAgreementRequest} [errorHandler=null]  Request data for UpdateFuneralCoverPlanAgreement 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async generateUpdateFuneralCoverPlanAgreement(generateAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenerateAgreement`)) {
			return this.mock(`generateAgreement`, generateAgreementRequest);
		}
		return this.post(
			`/FuneralInsuranceProductService/document/generate/UpdateFuneralCoverPlanAgreement`,
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
		if (await this.isMockEnabled(`insureGenerateAgreement`)) {
			return this.mock(`generateAgreement`, generateAgreementRequest);
		}
		return this.post(
			`/FuneralInsuranceProductService/document/generate/FuneralPolicyPaymentAgreement`,
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

	/**
	 * Takes in the details of the policy to be accepted and activates it and creates mandates 
	 *
	 * @param {emailDocumentRequest} [errorHandler=null]  Request data for emailFuneralDocuments 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async emailFuneralDocuments(emailDocumentRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureSendEmail`)) {
			return this.mock(`emailFuneralDocuments`, emailDocumentRequest);
		}
		return this.post(
			`/FuneralInsuranceProductService/client/documents/email`,
			emailDocumentRequest,
			this.setInsureTokens(),
			`emailDocumentRequest`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	// #endregion

	// #region DEPRECATED

	/**
	 * Retrieve quote details
	 * @deprecated No Quote for MPV - Confirm if can be removed entirely
	 * @param {quoteRequest} [errorHandler=null]  Request data for retrieve quote 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	retrieveQuoteDetails(quoteRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
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
	retrieveQuotes(quoteRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
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
	 * Communication History
	 *
	 * @param {commsHistoryRequest} [errorHandler=null]  Request data for Communication History 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */

	async commsHistory(commsHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureCommsHistory`)) {
			return this.mock(`insureCommsHistory`);
		}

		return this.post(
			`/horizon-insurance/client/communicationhistory`,
			commsHistoryRequest,
			this.setInsureTokens(),
			`commsHistory`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * cancel policy
	 *
	 * @param {cancelPolicyRequest} [errorHandler=null]  Request data to Cancel Policy
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async cancelPolicy(cancelPolicyRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureCancelPolicy`)) {
			return this.mock(`insureCancelPolicy`);
		}
		return this.post(
			`/FuneralInsuranceProductService/policy/cancel`,
			cancelPolicyRequest,
			this.setInsureTokens(),
			`cancelPolicy`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	
	 * Pay clients arrears
	 *
	 * @param {payArrearsRequest} [errorHandler=null]  Request data to pay arrears 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */

	async payPolicy(payArrearsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insurePolicyPay`)) {
			return this.mock(`insurePolicyPay`);
		}
		// return this.post(
		// `/FuneralInsuranceProductService/policy/pay`,
		// payArrearsRequest,
		// this.setInsureTokens(),
		// `payPolicy`,
		// null,
		// null,
		// 900,
		// null,
		// errorHandler,
		// autoRetries
		// );
	}

	/**
	* generate document 802 (Cancel Policy Agreement)
	*
	* @param {GenerateCancelAgreementRequest} [errorHandler=null]  Request data to generate Cancel Policy Agreement
	* @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	* @param {Number} [autoRetries] The number of times the call should be retried if it fails
	* @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	*/
	cancelPolicyAgreement(GenerateCancelAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/FuneralInsuranceProductService/document/generate/CancelPolicyAgreement`,
			GenerateCancelAgreementRequest,
			this.setInsureTokens(),
			`cancelPolicyAgreement`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * generate document 809 (Cancel Policy Agreement)
	 *
	 * @param {GenerateArrearsPaymentInstructionRequest} [errorHandler=null]  Request data to generate Cancel Policy Agreement
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	arrearsPaymentInstruction(GenerateArrearsPaymentInstructionRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/FuneralInsuranceProductService/document/generate/CapitecBankFuneralArrearsPaymentInstruction`,
			GenerateArrearsPaymentInstructionRequest,
			this.setInsureTokens(),
			`arrearsPaymentInstruction`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);

	}

	/**
	 * Claims List
	 *
	 * @param {claimsRequest} [claimsRequest=null]  Request data
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async claimsList(claimsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureClaims`)) {
			return this.mock(`insureClaims`);
		}
	}

	/**
	 * Claims Summary
	 *
	 * @param {claimsRequest} [claimsRequest=null]  Request data
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async claimSummary(claimsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureClaimSummary`)) {
			return this.mock(`insureClaimSummary`);
		}
	}


	// #endregion


	// #region OLD // Check if can / should still use these

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