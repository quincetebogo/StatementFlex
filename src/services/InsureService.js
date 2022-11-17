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
	 * Returns the rules related to governing the product and it's rules, such as cover limits per age group
	 *
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler
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
			this._setInsureHeaders(),
			`productParams`,
			null,
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Provides a summary breakdown of all policies in a client's portfolio
	 *
	 * @param {Object} [clientSummaryRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async clientSummary(clientSummaryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureClientSummary`)) {
			return this.mock(`insureClientSummary`);
		}
		return this.post(
			`/horizon-insurance/client/summary?WithClaims=false`,
			clientSummaryRequest,
			this._setInsureHeaders(),
			`clientSummary`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Provides a summary breakdown of all aspects of a policy
	 *
	 * @param {policySummaryRequest} [policySummaryRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async policySummary(policySummaryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insurePolicySummary`)) {
			return this.mock(`insurePolicySummary`);
		}
		return this.post(
			`/horizon-insurance/policy/summary?WithClaims=false`,
			policySummaryRequest,
			this._setInsureHeaders(),
			`policySummary`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Takes in the details of the policy to be created and creates it in an inactive step ready for acceptance.
	 *
	 * @param {createPolicyRequest} [createPolicyRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async createPolicy(createPolicyRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureCreatePolicy`)) {
			return this.mock(`createPolicy`);
		}
		return this.post(
			`/horizon-insurance/policy/create`,
			createPolicyRequest,
			this._setInsureHeaders(),
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
	 * Takes in lapsed/cancelled policy details and calculates premiums as optionally caching the quote to later be accepted and committed.
	 *
	 * @param {reinstateQuoteRequest} [policyReissueRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async policyReissue(policyReissueRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insurePolicyReissue`)) {
			return this.mock(`insurePolicyReissue`);
		}
		return this.post(
			`/horizon-insurance/policy/reissue`,
			policyReissueRequest,
			this._setInsureHeaders(),
			`policyReissue`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Provides an estimate of what you would pay for a policy, without requiring all the detail for an actual quote
	 *
	 * @param {estimateRequest} [estimateRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	calculateEstimate(estimateRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/horizon-insurance/estimate`,
			estimateRequest,
			this._setInsureHeaders(),
			`estimate`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Takes in policy details and calculates premiums as optionally caching the quote to later be accepted and committed.
	 *
	 * @param {quoteCalcRequest} [quoteCalcRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async calculateQuote(quoteCalcRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureCalculateQuote`)) {
			return this.mock(`calculateQuote`, quoteCalcRequest);
		}
		return this.post(
			`/horizon-insurance/quote/calc`,
			quoteCalcRequest,
			this._setInsureHeaders(),
			`quoteCalc`,
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
	 * @param {cancelPolicyRequest} [cancelPolicyRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async cancelPolicy(cancelPolicyRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureCancelPolicy`)) {
			return this.mock(`insureCancelPolicy`);
		}
		return this.post(
			`/horizon-insurance/policy/cancel`,
			cancelPolicyRequest,
			this._setInsureHeaders(),
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
	 * Get the history of the clients successful and failed collections, arrears payments, claim payouts, refunds, etc.
	 *
	 * @param {policyTransactionsRequest} [policyTransactionsRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async policyTransactions(policyTransactionsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insurePolicyTransactionHistory`)) {
			return this.mock(`insurePolicyTransactionHistory`, policyTransactionsRequest);
		}

		return this.post(
			`/horizon-insurance/policy/transactions`,
			policyTransactionsRequest,
			this._setInsureHeaders(),
			`policyTransactions`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Prepares for updating a policy, ensuring we fail fast if required
	 *
	 * @param {prepareUpdateRequest} [prepareUpdateRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async prepareUpdate(prepareUpdateRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insurePrepareUpdate`)) {
			return this.mock(`insurePrepareUpdate`, prepareUpdateRequest);
		}
		return this.post(
			`/horizon-insurance/policy/prepareupdate`,
			prepareUpdateRequest,
			this._setInsureHeaders(),
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
	 * @param {policyAcceptRequest} [policyAcceptRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async policyAccept(policyAcceptRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insurePolicyAccept`)) {
			return this.mock(`insurePolicyAccept`, policyAcceptRequest);
		}
		return this.post(
			`/horizon-insurance/policy/accept`,
			policyAcceptRequest,
			this._setInsureHeaders(),
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
	 * Handles Ad-Hoc payments for arrears amounts
	 *
	 * @param {payPolicyRequest} [payPolicyRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async payPolicy(payPolicyRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insurePolicyPay`)) {
			return this.mock(`insurePolicyPay`);
		}
		return this.post(
			`/horizon-insurance/policy/pay`,
			payPolicyRequest,
			this._setInsureHeaders(),
			`payPolicy`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Sends a templated email to the client with the specified documents
	 *
	 * @param {emailDocumentRequest} [emailDocumentRequest=null] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async emailFuneralDocuments(emailDocumentRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureSendEmail`)) {
			return this.mock(`insureSendEmail`, emailDocumentRequest);
		}
		return this.post(
			`/horizon-insurance/client/documents/email`,
			emailDocumentRequest,
			this._setInsureHeaders(),
			`emailDocumentRequest`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Provides a communication history of a policy.
	 *
	 * @param {communicationHistoryRequest} [communicationHistoryRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null] An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async communicationHistory(communicationHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureCommsHistory`)) {
			return this.mock(`insureCommsHistory`);
		}

		return this.post(
			`/horizon-insurance/policy/CommunicationHistory`,
			communicationHistoryRequest,
			this._setInsureHeaders(),
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
	 * Provides a summary breakdown of all claims for a given client
	 *
	 * @param {viewExistingClaimsRequest} [viewExistingClaimsRequest]  Request data
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async viewExistingClaims(viewExistingClaimsRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureClaims`)) {
			return this.mock(`insureClaims`);
		}

		return this.post(
			`/horizon-insurance/ViewExistingClaims`,
			viewExistingClaimsRequest,
			this._setInsureHeaders(),
			`ViewExistingClaims`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	// #endregion

	// #region Documents

	/**
	 *  Generates the 904 / 3104 Estimate printout document
	 *
	 * @param {generateEstimateDocumentRequest} [generateEstimateDocumentRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async generateEstimatePrintoutDocument(generateEstimateDocumentRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureEstimatePrintout`)) {
			return this.mock(`insureEstimatePrintout`);
		}
		return this.post(
			`/horizon-insurance/document/generate/Estimateprintout`,
			generateEstimateDocumentRequest,
			this._setInsureHeaders(),
			`estimatePrintout`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Generates the 801 Issue Funeral Cover Plan Agreement document
	 *
	 * @param {generateIssueAgreementRequest} [generateIssueAgreementRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async generateIssueFuneralCoverPlanAgreement(generateIssueAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenerateIssueAgreement`)) {
			return this.mock(`insureGenerateIssueAgreement`);
		}
		return this.post(
			`/horizon-insurance/document/generate/IssueFuneralCoverPlanAgreement`,
			generateIssueAgreementRequest,
			this._setInsureHeaders(),
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
	 * Generates the 801 Update Funeral Cover Plan Agreement document
	 *
	 * @param {generateAgreementRequest} [generateAgreementRequest] Request data for service call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async generateUpdateFuneralCoverPlanAgreement(generateAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenerateAgreement`)) {
			return this.mock(`generateAgreement`, generateAgreementRequest);
		}
		return this.post(
			`/horizon-insurance/document/generate/UpdateFuneralCoverPlanAgreement`,
			generateAgreementRequest,
			this._setInsureHeaders(),
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
	 * @param {generateAgreementRequest} [generateAgreementRequest=null]  Request data for FuneralPolicyPaymentAgreement 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async generateFuneralPolicyPaymentAgreement(generateAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureGenerateAgreement`)) {
			return this.mock(`generateAgreement`, generateAgreementRequest);
		}
		return this.post(
			`/horizon-insurance/document/generate/FuneralPolicyPaymentAgreement`,
			generateAgreementRequest,
			this._setInsureHeaders(),
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
	* generate document 802 (Cancel Policy Agreement)
	*
	* @param {GenerateCancelAgreementRequest} [GenerateCancelAgreementRequest=null]  Request data to generate Cancel Policy Agreement
	* @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	* @param {Number} [autoRetries] The number of times the call should be retried if it fails
	* @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	*/
	cancelPolicyAgreement(GenerateCancelAgreementRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/horizon-insurance/document/generate/CancelPolicyAgreement`,
			GenerateCancelAgreementRequest,
			this._setInsureHeaders(),
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
	 * @param {GenerateArrearsPaymentInstructionRequest} [GenerateArrearsPaymentInstructionRequest=null]  Request data to generate Cancel Policy Agreement
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	arrearsPaymentInstruction(GenerateArrearsPaymentInstructionRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/horizon-insurance/document/generate/CapitecBankFuneralArrearsPaymentInstruction`,
			GenerateArrearsPaymentInstructionRequest,
			this._setInsureHeaders(),
			`arrearsPaymentInstruction`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);

	}

	// #endregion Documents

	// #region OLD

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

	// #endregion
}