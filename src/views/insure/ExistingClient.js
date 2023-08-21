
import { DOCUMENT_TYPE, INSURE_CALLER_PAGE, TRANSACTION_STATUS } from 'app/constants/InsureCommon';
import { EMAIL_DOCUMENT_REQUEST_PAYLOAD, GENERATE_DOCUMENT_REQUEST_PAYLOAD } from 'app/utils/insureRequestPayload';
import { MAX_RESULTS, TRANSACTION_TYPE } from 'app/constants/InsureTransactionHistory';
import { css, html } from 'platform/elements';
import { getAgeFromIDNumber, getGenderFromIDNumber } from 'app/utils/insureUtils';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { Configuration } from 'platform/core';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonInsureStore } from 'app/store/HorizonInsureStore';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { InsureService } from 'app/services/InsureService';
import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { SavingsService } from 'app/services/SavingsService';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/insure/ClientSummary';
import 'app/components/insure/EmailPlanSuccess';
import 'app/components/insure/ClaimSummary';
import 'app/components/insure/SuccessPage';
import 'app/components/insure/funeral/FuneralPolicyEstimate';
import 'app/components/insure/funeral/FuneralUpdatePlan';
import 'app/components/insure/funeral/FuneralPolicySummary';
import 'app/components/insure/funeral/FuneralSMSHistory';
import 'app/components/insure/funeral/FuneralPolicyTransactionHistory';
import 'app/components/insure/funeral/FuneralPayPremiumSuccess';
import 'app/components/insure/funeral/FuneralCancelPolicySuccess';

const INSURE_PRODUCT_START_DATE = `2001/01/01`;

const POLICY_TRANSACTION_HISTORY = {
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(INSURE_PRODUCT_START_DATE).toISOString().substr(0, 10),
	PAGE_INDEX: 0,
	MAX_RESULTS: MAX_RESULTS
};

/**
 * Implements the view for Insure verified and unverified existing clients (i.e. the client has products)
 * This includes the view for third parties phoning in about an existing client.
 *
 * The view is context sensitive to the incoming callers verification status. 
 * 
 * @export
 * @class ExistingClient
 * @extends {View}
 */
export class ExistingClient extends InsureViewBase {

	// #region INITIALISATION

	constructor() {
		super();
		this.horizonIncidentManager = HorizonIncidentManager.getInstance();
		this.horizonInsureStore = HorizonInsureStore.getInstance();

		this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;
		this.callerPage = ``;

		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.savingsAccountService = new SavingsService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.configuration = Configuration.getInstance();

		this.productParams = {};
		this.insuranceClaims = [];
		this.successPageMessage = ``;
		this.readOnly = false;

		this.selectedFuneralPolicyContractReference = ``;
		this.selectedFuneralPolicyDetails = {};
		this.funeralEstimateDetails = {};
		this.funeralPolicyTransactionHistory = {};
		this.funeralIssuePlanAgreementDocument = {};
		this.funeralUpdatePlanAgreementDocument = {};
		this.funeralShowEstimateSuccessToast = false;
	}

	// #endregion INITIALISATION

	// #region PROPERTIES

	/**
	 * @property {Object} insuranceClaims contains client claims for funeral and life products
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {String} successPageMessage Generic message for shared success page
	 * @property {Object} renderMode contains which flow to render
	 * @property {String} callerPage from which success page is invoked.
	 * @property {String} mainLifeGender Gender of Main Life on policy
	 * @property {Object} clientConfirmedEmail clients confirmed email address
	 * @property {Object} readOnly determines whether read only mode is on or off
	 * @property {Object} selectedFuneralPolicyDetails  Local object for Policy Summary requests
	 * @property {String} selectedFuneralPolicyContractReference Contract Reference of selected policy
	 * @property {Object} funeralPolicies Contains all funeral policies for a client
	 * @property {Object} funeralEstimateDetails Local object for new Estimate requests
	 * @property {String} funeralIssuePlanAgreementDocument stores issue plan agreement document object.
	 * @property {Object} funeralUpdatePlanAgreementDocument stores update Plan Agreement Document object
	 * @property {String} funeralCancellationReason contains the cancellation reason selected
	 * @property {Object} funeralCancelAgreementDocument contains the cancel policy document details
	 * @property {Object} funeralArrearsAgreementDocument contains the arrears payment document details
	 * @property {Boolean} funeralShowEstimateSuccessToast determine whether to show a success alert for estimate email
	 * @property {Object} funeralArrears contains client arrears and payable accounts for funeral
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			insuranceClaims: { type: Object, state: true },
			productParams: { type: Object, state: true },
			successPageMessage: { type: String },
			renderMode: { type: Number },
			callerPage: { type: String },
			mainLifeGender: { type: String, state: true },
			clientConfirmedEmail: { type: Object, state: true },
			readOnly: { type: Object, state: true },
			selectedFuneralPolicyDetails: { type: Object, state: true },
			selectedFuneralPolicyContractReference: { type: String, state: true },
			funeralPolicies: { type: Object, state: true },
			funeralEstimateDetails: { type: Object, state: true },
			funeralIssuePlanAgreementDocument: { type: Object, state: true },
			funeralUpdatePlanAgreementDocument: { type: Object, state: true },
			funeralCancellationReason: { type: String, state: true },
			funeralCancelAgreementDocument: { type: Object, state: true },
			funeralArrearsAgreementDocument: { type: Object, state: true },
			funeralShowEstimateSuccessToast: { type: Boolean, state: true },
			funeralArrears: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	/**
	 * Initialise Landing View 
	 * 1. Fetch client funeral policies
	 * 2. Fetch client instance claims
	 * 
	 * @returns {void}
	 */
	async _initialise() {
		this.funeralPolicies = await this._retrieveClientFuneralPolicies();
		this.insuranceClaims = await this._retrieveClientClaims();
	}

	// --- Document Generation

	/**
	 * Generate 801 & 804 documents for Reinstate Policy
	 * @param {boolean} saveDocumentToDocumentum - true/false
	 * @returns {void} 
	 */
	async _generateDocumentsFuneralReissue(saveDocumentToDocumentum) {
		const dob = new Date(this.callerInformation.birthdate);
		const clientDetails = {
			"cifNumber": this.callerInformation.cifNumber,
			"policyContractReference": this.selectedFuneralPolicyContractReference,
			"firstName": this.callerInformation.firstName,
			"surname": this.callerInformation.surname,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"dateOfBirth": dob.toISOString()
		};

		GENERATE_DOCUMENT_REQUEST_PAYLOAD.saveDocumentToDocumentum = saveDocumentToDocumentum;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.markDocumentsAsAccepted = saveDocumentToDocumentum;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.clientDetails = clientDetails;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.contractReference = this.selectedFuneralPolicyContractReference;

		const issuePlanAgreementResponse = await this.insureService.generateIssueFuneralCoverPlanAgreement(GENERATE_DOCUMENT_REQUEST_PAYLOAD);

		if (!issuePlanAgreementResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(issuePlanAgreementResponse.exception);
			return;
		}

		this.funeralIssuePlanAgreementDocument = issuePlanAgreementResponse.result;
	}

	/**
	 * Generate 802 & 804 documents for Update Plan
	 * @param {boolean} saveDocumentToDocumentum - true/false
	 * @returns {void} 
	 */
	async _generateDocumentsFuneralUpdatePlan(saveDocumentToDocumentum) {
		const dob = new Date(this.callerInformation.birthdate);
		const clientDetails = {
			"cifNumber": this.callerInformation.cifNumber,
			"policyContractReference": this.selectedFuneralPolicyContractReference,
			"firstName": this.callerInformation.firstName,
			"surname": this.callerInformation.surname,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"dateOfBirth": dob.toISOString()
		};

		GENERATE_DOCUMENT_REQUEST_PAYLOAD.saveDocumentToDocumentum = saveDocumentToDocumentum;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.markDocumentsAsAccepted = saveDocumentToDocumentum;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.clientDetails = clientDetails;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.contractReference = this.selectedFuneralPolicyContractReference;

		const docGenerateRequestPayload = {
			"documentFormat": `PDF`,
			"saveDocumentToDocumentum": true,
			"markDocumentsAsAccepted": true,
			"returnDocumentContent": true,
			"emailDocumentToClient": false,
			"wetsignBarcode": false,
			"clientDetails": {
				"cifNumber": this.callerInformation.cifNumber,
				"policyContractReference": this.selectedFuneralPolicyContractReference,
				"firstName": this.callerInformation.firstName,
				"surname": this.callerInformation.surname,
				"idNumber": this.callerInformation.southAfricanIDNumber,
				"dateOfBirth": dob.toISOString()
			},
			"contractReference": this.selectedFuneralPolicyContractReference
		};

		const updatePlanAgreementResponse = await this.insureService.generateUpdateFuneralCoverPlanAgreement(docGenerateRequestPayload);

		if (!updatePlanAgreementResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(updatePlanAgreementResponse.exception);
			return;
		}

		this.funeralUpdatePlanAgreementDocument = updatePlanAgreementResponse.result;

	}

	/**
	 * Get the Arrears Payment Instruction document
	 * 
	 * @param {String} contractReference contractReference
	 * @param {object} payArrears payArrears
	 * @param {string} fromAccount fromAccount
	 * @param {boolean} saveToDocumentum saveToDocumentum
	 * @returns {void} 
	 */
	async _generateDocumentsFuneralArrears(contractReference, payArrears, fromAccount, saveToDocumentum) {
		const dob = new Date(this.callerInformation.birthdate);
		const arrearsPaymentInstructionDetails = {
			"documentFormat": `PDF`,
			"saveDocumentToDocumentum": saveToDocumentum,
			"markDocumentsAsAccepted": saveToDocumentum,
			"returnDocumentContent": true,
			"emailDocumentToClient": false,
			"wetsignBarcode": false,
			"clientDetails": {
				"cifNumber": this.callerInformation.cifNumber,
				"policyContractReference": contractReference,
				"firstName": this.callerInformation.firstName,
				"surname": this.callerInformation.lastName,
				"idNumber": this.callerInformation.southAfricanIDNumber,
				"dateOfBirth": dob.toISOString()
			},
			"input": {
				"policyContractReference": contractReference,
				"payArrearsModel": {
					"contractReference": contractReference,
					"arrears": payArrears.arrears,
					"fromAccount": fromAccount,
					"cifNumber": this.callerInformation.cifNumber
				}
			}
		};

		const resp = await this.insureService.arrearsPaymentInstruction(arrearsPaymentInstructionDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			this.funeralArrearsAgreementDocument = resp.result;
		} else {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(resp.exception);
			return null;
		}

		this.requestUpdate();
	}

	/**
	 * Cancel Funeral Policy Agreement
	 * @param {String} contractReference contractReference
	 * @param {string} cancelReason cancelReason
	 * @param {boolean} saveToDocumentum saveToDocumentum
	 * @returns {void}  
	 */
	async _generateDocumentsFuneralCancel(contractReference, cancelReason, saveToDocumentum) {
		this.selectedFuneralPolicyContractReference = contractReference;
		const dob = new Date(this.callerInformation.birthdate);
		const cancelPolicyAgreementDetails = {
			"documentFormat": `PDF`,
			"saveDocumentToDocumentum": saveToDocumentum,
			"markDocumentsAsAccepted": saveToDocumentum,
			"returnDocumentContent": true,
			"emailDocumentToClient": false,
			"wetsignBarcode": false,
			"clientDetails": {
				"cifNumber": this.callerInformation.cifNumber,
				"policyContractReference": contractReference,
				"firstName": this.callerInformation.firstName,
				"surname": this.callerInformation.lastName,
				"idNumber": this.callerInformation.southAfricanIDNumber,
				"dateOfBirth": dob.toISOString()
			},
			"input": {
				"cancellationReason": cancelReason
			}
		};

		const resp = await this.insureService.cancelPolicyAgreement(cancelPolicyAgreementDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			this.funeralCancelAgreementDocument = resp.result;
		} else {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(resp.exception);
			return;
		}

		this.requestUpdate();
	}

	/**
	 * Helper for attachments for different document types
	 * @param {String} sourcePage from which send email method is invoked
	 * @param {object} emailDocumentRequestPayload - email request payload
	 * @param {array} docContent - Document content
	 * @returns {void} 
	 */
	_getAgreementEmailAttachments(sourcePage, emailDocumentRequestPayload, docContent) {
		if (sourcePage === INSURE_CALLER_PAGE.REINSTATE_POLICY) {
			if (this.selectedFuneralPolicyContractReference.toLowerCase().startsWith(`cf`)) {
				emailDocumentRequestPayload.documentInfo = [
					{
						"documentType": DOCUMENT_TYPE.ISSUE_POLICY_AGREEMENT,
						"documentGuid": this.funeralIssuePlanAgreementDocument?.documentDetails?.guid,
						"content": {
							"type": `PDF`,
							"value": this.funeralIssuePlanAgreementDocument?.documentContent.value
						}
					}
				];
			} else {
				emailDocumentRequestPayload.documentInfo = [
					{
						"documentType": DOCUMENT_TYPE.ISSUE_POLICY_AGREEMENT,
						"documentGuid": this.funeralIssuePlanAgreementDocument?.documentDetails?.guid,
						"content": {
							"type": `PDF`,
							"value": this.funeralIssuePlanAgreementDocument?.documentContent.value
						}
					}
				];
			}
		} else if (sourcePage === INSURE_CALLER_PAGE.UPDATE_PLAN) {
			if (this.selectedFuneralPolicyContractReference.toLowerCase().startsWith(`cf`)) {
				emailDocumentRequestPayload.documentInfo = [
					{
						"documentType": DOCUMENT_TYPE.UPDATE_POLICY_AGREEMENT,
						"documentGuid": this.funeralUpdatePlanAgreementDocument?.documentDetails?.guid,
						"content": {
							"type": `PDF`,
							"value": this.funeralUpdatePlanAgreementDocument?.documentContent.value
						}
					}
				];
			} else {
				emailDocumentRequestPayload.documentInfo = [
					{
						"documentType": DOCUMENT_TYPE.UPDATE_POLICY_AGREEMENT,
						"documentGuid": this.funeralUpdatePlanAgreementDocument?.documentDetails?.guid,
						"content": {
							"type": `PDF`,
							"value": this.funeralUpdatePlanAgreementDocument?.documentContent.value
						}
					}
				];
			}
		} else if (sourcePage === INSURE_CALLER_PAGE.CANCEL_POLICY) {
			emailDocumentRequestPayload.documentInfo = [
				{
					"documentType": DOCUMENT_TYPE.CANCEL_POLICY_AGREEMENT,
					"documentGuid": this.funeralCancelAgreementDocument?.documentDetails?.guid,
					"content": {
						"value": this.funeralCancelAgreementDocument?.documentContent.value,
						"type": `PDF`
					}
				}
			];
		} else if (sourcePage === INSURE_CALLER_PAGE.PAY_PREMIUM) {
			emailDocumentRequestPayload.documentInfo = [
				{
					"documentType": DOCUMENT_TYPE.PAY_ARREARS_AGREEMENT,
					"documentGuid": this.funeralArrearsAgreementDocument?.documentDetails.guid,
					"content": {
						"type": `PDF`,
						"value": this.funeralArrearsAgreementDocument?.documentContent.value
					}
				}
			];
		} else if (sourcePage === INSURE_CALLER_PAGE.ESTIMATE) {
			emailDocumentRequestPayload.documentInfo = [
				{
					"documentType": DOCUMENT_TYPE.ESTIMATE_AGREEMENT,
					"documentGuid": ``,
					"content": {
						"type": `PDF`,
						"value": docContent
					}
				}
			];
		} else if (sourcePage === INSURE_CALLER_PAGE.FUNERAL_CLIENT_POLICIES) {
			emailDocumentRequestPayload.documentInfo = [];
		}
	}

	// --- END Document Generation

	/**
	 * Retrieve client summary containing all policies
	 * @returns {Object} Client policies 
	 */
	async _retrieveClientFuneralPolicies() {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			idNumber: this.callerInformation.southAfricanIDNumber
		};

		const resp = await this.insureService.clientSummary(request);
		if (!resp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(resp.exception);
			return;
		}
		return resp.result;
	}

	/**
	 * Retrieve Funeral Policy Summary via insure channel service
	 * @param {string} contractReference contractReference
	 * @param {string} cifNumber cifNumber
	 * @param {string} idNumber idNumber
	 * @returns {Object} Policy Summary Details 
	 */
	async _retrieveFuneralPolicySummary(contractReference, cifNumber, idNumber) {
		const request = {
			contractReference: contractReference,
			cifNumber: cifNumber,
			idNumber: idNumber
		};
		const resp = await this.insureService.policySummary(request);
		if (!resp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(resp.exception);
			return;
		}

		return resp.result;
	}

	/**
	 * Retrieve Insurance claims list for Client
	 * @returns {Object} Claims list
	 */
	async _retrieveClientClaims() {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			idNumber: this.callerInformation.southAfricanIDNumber
		};
		const claimsList = await this.insureService.viewExistingClaims(request);
		return claimsList.result;
	}

	/**
	* Retrieve Quote number and Policy details
	* @param {string} contractReference contractReference
	* @param {string} cifNumber cifNumber
	* @returns {Object} Quote number and Policy details 
	 */
	async _reissueFuneralPolicyQuote(contractReference, cifNumber) {
		const request = {
			contractReference: contractReference,
			cifNumber: cifNumber
		};
		const resp = await this.insureService.policyReissue(request);
		if (!resp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(resp.exception);
			return;
		}

		return resp.result;
	}

	/**
	 * Calculate estimate based on lives assured provided
	 * Map metadata (coverDetails) back when response is received
	 * @param {event} e e
	 * @returns {Object} Estimate response
	 */
	async _calculateFuneralEstimate(e) {
		const estimateWithCoverDetails = e.detail;
		estimateWithCoverDetails.lifesAssured = estimateWithCoverDetails.lifesAssured.map((life) => {
			life.coverAmount = parseInt(life.coverAmount, 10);
			life.premium = parseInt(life.premium, 10);
			return life;
		});
		const resp = await this.insureService.calculateEstimate(estimateWithCoverDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			estimateWithCoverDetails.totalPremium = resp.result.totalPremium;
			estimateWithCoverDetails.lifesAssured = estimateWithCoverDetails.lifesAssured.map(lifeWithDetails => Object.assign(lifeWithDetails, resp.result.lifesAssured.find(respLife => lifeWithDetails.rowID === respLife.rowID)));
			return estimateWithCoverDetails;
		}
		// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
		this.handleToastError(resp.exception);
		return null;

	}

	/**
	 * Print estimate based on lives assured provided
	 * Map metadata (coverDetails) back when response is received
	 * @param {event} e e
	 * @returns {Object} Estimate response
	 */
	async _printFuneralEstimate(e) {
		await this._calculateFuneralEstimate(e);
		const dob = new Date(this.callerInformation.birthdate);
		const clientDetails = {
			"cifNumber": this.callerInformation.cifNumber,
			"policyContractReference": this.selectedFuneralPolicyContractReference,
			"firstName": this.callerInformation.firstName,
			"surname": this.callerInformation.surname,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"dateOfBirth": dob.toISOString()
		};

		GENERATE_DOCUMENT_REQUEST_PAYLOAD.clientDetails = clientDetails;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.input = this.funeralEstimateDetails;

		const result = await this.insureService.generateEstimatePrintoutDocument(GENERATE_DOCUMENT_REQUEST_PAYLOAD);
		if (!result.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(result.exception);
			return;
		}
		return result;
	}

	/**
	 * Calculate quote callback from Update plan, supply 
	 * @param {*} policyToCalc policyToCalc
	 * @returns {*} result
	 */
	async _updateFuneralPlanQuote(policyToCalc) {
		const quoteCalcRequest = {
			"saveQuote": true,
			"contractReference": policyToCalc.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"totalPremium": policyToCalc.totalPremium,
			"lifesAssured": policyToCalc.roleplayers.filter(ele => ele.lifeAssured === true)
		};

		const calculateQuoteResp = await this.insureService.calculateQuote(quoteCalcRequest);
		if (!calculateQuoteResp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(calculateQuoteResp.exception);
			return;
		}

		// Map back to array
		const calculatedQuote = calculateQuoteResp.result;
		const adjustedRoleplayers = calculateQuoteResp.result.lifesAssured.map((life) => {
			const foundPlayer = policyToCalc.roleplayers.find((ele) => ele.rowID === life.rowID);
			life.coverDetails = foundPlayer.coverDetails;
			return life;
		});

		policyToCalc.roleplayers.forEach((life) => {
			if (life.lifeAssured === false && life.beneficiary === true) {
				adjustedRoleplayers.push(life);
			}
		});

		calculatedQuote.lifesAssured = adjustedRoleplayers;
		return calculatedQuote;
	}

	/**
	 * Update Plan callback to perform update sequence
	 * @param {*} policyToUpdate policyToUpdate
	 * @returns {*} preparePlanResponse
	 */
	async _updateFuneralPlanPrepare(policyToUpdate) {
		const quoteCalcRequest = {
			"saveQuote": true,
			"contractReference": policyToUpdate.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"totalPremium": policyToUpdate.totalPremium,
			"lifesAssured": policyToUpdate.roleplayers.filter(ele => ele.lifeAssured === true)
		};
		const calculateQuoteResp = await this.insureService.calculateQuote(quoteCalcRequest);
		if (!calculateQuoteResp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(calculateQuoteResp.exception);
			return;
		}

		const prepareUpdateRequest = {
			"contractReference": policyToUpdate.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"quoteNumber": calculateQuoteResp.result.quoteNumber,
			"beneficiaries": policyToUpdate.roleplayers.filter(ele => ele.beneficiary === true),
			"collectionDetails": policyToUpdate.deductionDetails
		};

		const prepareUpdateResp = await this.insureService.prepareUpdate(prepareUpdateRequest);
		if (!prepareUpdateResp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(prepareUpdateResp.exception);
			return;
		}

		this.selectedFuneralPolicyContractReference = prepareUpdateResp.result.contractReference;
		await this._generateDocumentsFuneralUpdatePlan(true);

		const preparePlanResponse = {
			planAgreement: this.funeralUpdatePlanAgreementDocument,
			prepareUpdateResponse: prepareUpdateResp.result
		};
		return preparePlanResponse;

	}

	/**
	 * Invoke accept plan call, and redirect to success page
	 * @param {*} event event
	 * @returns {*}*
	 */
	async _updateFuneralPlanAccept(event) {
		const documents = [];
		if (!isNullorEmpty(event.detail.prepareUpdate.planAgreement.documentDetails)) {
			documents.push(event.detail.prepareUpdate.planAgreement.documentDetails);
		}

		const acceptPlanRequest =
		{
			"cifNumber": this.callerInformation.cifNumber,
			"contractReference": event.detail.prepareUpdate.prepareUpdateResponse.contractReference,
			"documents": documents,
			"mandates": event.detail.prepareUpdate.prepareUpdateResponse.mandates,
			"insureWaiverInformation": {
				"contractReference": event.detail.prepareUpdate.prepareUpdateResponse.contractReference,
				"insurersInformation": [
					{
						"insurer": `Capitec`,
						"policyNumber": event.detail.prepareUpdate.prepareUpdateResponse.contractReference
					}
				]
			}
		};

		const acceptPlanResp = await this.insureService.policyAccept(acceptPlanRequest);
		if (!acceptPlanResp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(acceptPlanResp.exception);
			return;
		}

		this.successPageMessage = `The policy has been successfully updated`;
		this.callerPage = INSURE_CALLER_PAGE.UPDATE_PLAN;
		this.selectedFuneralPolicyContractReference = event.detail.prepareUpdate.prepareUpdateResponse.contractReference;
		this.renderMode = INSURE_RENDER_MODE.SUCCESS_PAGE;
	}

	/**
	 * Reinstate Policy callback to create policy and get agreement documents
	 * @param {*} policyToReinstate policyToReinstate
	 * @returns {*} reinstatePolicyResponse
	 */
	async _reissueFuneralPolicyExecute(policyToReinstate) {
		const createPolicyRequest = {
			"cifNumber": policyToReinstate.cifNumber,
			"quoteNumber": policyToReinstate.quoteNumber,
			"bankDetails": {
				"accountName": policyToReinstate.deductionDetails?.bankDetails?.accountName,
				"branchCode": policyToReinstate.deductionDetails?.bankDetails?.branchCode,
				"accountNumber": policyToReinstate.deductionDetails?.bankDetails?.accountNumber,
				"bank": policyToReinstate.deductionDetails?.bankDetails?.bank,
				"accountType": policyToReinstate.deductionDetails?.bankDetails?.accountType
			},
			"collectionDay": policyToReinstate.deductionDetails?.collectionDay,
			"roleplayers": policyToReinstate.roleplayers
		};

		const createPolicyResponse = await this.insureService.createPolicy(createPolicyRequest);
		if (!createPolicyResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(createPolicyResponse.exception);
			return;
		}
		this.selectedFuneralPolicyContractReference = createPolicyResponse.result.contractReference;

		await this._generateDocumentsFuneralReissue(false);
		const resinstatePolicyResponse = {
			issuePlanAgreement: this.funeralIssuePlanAgreementDocument,
			policyResponse: createPolicyResponse.result
		};
		return resinstatePolicyResponse;
	}

	/**
	 * Accept Policy
	 * @param {object} event - request payload for Accept Policy
	 * @returns {void} 
	 */
	async _acceptFuneralPolicy(event) {

		let documents = [];

		if (event.detail.newContractRef.substring(0, 2) === `CF`) {
			documents = [event.detail.policyResponse.issuePlanAgreement.documentDetails];
		} else {
			documents = [event.detail.policyResponse.issuePlanAgreement.documentDetails];
		}

		const acceptPlanRequest =
		{
			"cifNumber": this.callerInformation.cifNumber,
			"contractReference": event.detail.policyResponse.policyResponse.contractReference,
			"documents": documents,
			"mandates": event.detail.policyResponse.policyResponse.mandates
		};

		const acceptPlanResp = await this.insureService.policyAccept(acceptPlanRequest);
		if (!acceptPlanResp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(acceptPlanResp.exception);
			return;
		}

		this.selectedFuneralPolicyContractReference = event.detail.policyResponse.policyResponse.contractReference;
		await this._generateDocumentsFuneralReissue(true);

		this.successPageMessage = `The policy ${event.detail.policyResponse.policyResponse.contractReference} has been successfully reissued`;
		this.callerPage = INSURE_CALLER_PAGE.REINSTATE_POLICY;
		this.selectedFuneralPolicyContractReference = event.detail.policyResponse.policyResponse.contractReference;
		this.renderMode = INSURE_RENDER_MODE.SUCCESS_PAGE;
	}

	/**
	 * Cancel Policy
	 * @param {event} e e
	 * @returns {void}
	 */
	async _cancelFuneralPolicy(e) {
		this.funeralCancellationReason = e.detail.cancellationReason;

		const cancelPolicyDetails = {
			"contractReference": e.detail.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"cancellationReason": this.funeralCancellationReason,
			"documents": [
				{
					"documentCode": this.funeralCancelAgreementDocument.documentDetails.documentCode,
					"documentName": this.funeralCancelAgreementDocument.documentDetails.documentName,
					"guid": this.funeralCancelAgreementDocument.documentDetails.guid
				}
			]

		};

		const resp = await this.insureService.cancelPolicy(cancelPolicyDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			this._generateDocumentsFuneralCancel(e.detail.contractReference, e.detail.cancellationReason, true);
			this._goToFuneralCancelPolicySuccess(e);

		} else {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(resp.exception);
			return null;
		}
	}

	/**
	 * Pay Arrears based on arrears provided
	 * Map metadata back when response is received
	 * @param {event} e e
	 * @returns {void} 
	 */
	async _payFuneralPolicyArrears(e) {
		const payArrears = {
			"contractReference": e.detail.payArrears.contractReference,
			"arrears": e.detail.payArrears.arrears,
			"cifNumber": this.callerInformation.cifNumber,
			"fromAccount": e.detail.fromAccount
		};

		const resp = await this.insureService.payPolicy(payArrears, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			this.selectedFuneralPolicyContractReference = e.detail.payArrears.contractReference;
			const sumArrears = e.detail.payArrears.arrears?.reduce((accumulator, object) => accumulator + (object.amount ?? 0), 0);
			this.amountToPay = sumArrears;

			this._generateDocumentsFuneralArrears(this.selectedFuneralPolicyContractReference, e.detail.payArrears, e.detail.fromAccount, true);
			this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_PAY_PREMIUM_SUCCESS);
		} else {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(resp.exception);
			return null;
		}
	}

	/**
	 * gets clients arrears and payable accounts
	 * 
	 * @returns {void} 
	 */
	async _retrieveFuneralPolicyArrears() {
		const arrearsRequest =
		{
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"cifNumber": this.callerInformation.cifNumber
		};

		const arrearsResp = await this.insureService.Arrears(arrearsRequest);
		if (!arrearsResp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(acceptPlanResp.exception);
			return;
		}
		this.funeralArrears = arrearsResp?.result;
	}

	/**
	 * retrieve the Communication(SMS) History
	 * @param {string} contractReference contractReference
	 * @param {string} fromDate fromDate
	 * @param {string} toDate toDate
	 * @returns {*} result
	 */
	async _retrieveFuneralSMSHistory(contractReference, fromDate, toDate) {
		const smsHistoryDetails = {
			"contractReference": contractReference,
			"fromDate": fromDate,
			"toDate": toDate
		};

		const resp = await this.insureService.communicationHistory(smsHistoryDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			return resp.result;
		}
		// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
		this.handleToastError(resp.exception);
		return null;

	}

	/**
	 * Fetch Policy Transaction History
	 * @param {*} startDate startDate
	 * @param {*} endDate endDate
	 * @param {*} pageIndex pageIndex
	 * @returns {null} null
	 */
	async _retrieveFuneralPolicyTransactionHistory(startDate, endDate, pageIndex) {
		const transactionHistoryRequest = {
			contractReference: this.selectedFuneralPolicyContractReference,
			transactionDateType: `TransactionDate`,
			fromDate: startDate || POLICY_TRANSACTION_HISTORY.START_DATE,
			toDate: endDate || POLICY_TRANSACTION_HISTORY.END_DATE,
			transactionStatus: TRANSACTION_STATUS.FINANCIAL,
			pagniation: {
				pageIndex: pageIndex || POLICY_TRANSACTION_HISTORY.PAGE_INDEX,
				totalPerPage: POLICY_TRANSACTION_HISTORY.MAX_RESULTS
			}
		};

		this.transactions = [];

		this.funeralPolicyTransactionHistory = {
			contractReference: this.selectedFuneralPolicyContractReference,
			bankName: this.bankName,
			accountNumber: this.accountNumber,
			arrearsAmount: this.arrearsAmount
		};

		const returnValue = await this.insureService.policyTransactions(transactionHistoryRequest);
		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactions.
				filter((ele) => ele.transactionType === `PremiumCollection` || ele.transactionType === `Disbursement` || ele.transactionType === `Submit`).map((item) => {
					const formatedDate = new Date(Date.parse(item.date));
					item.transactionType = TRANSACTION_TYPE[item.transactionType?.toUpperCase()];
					item.formatedDate = formatedDate;
					item.formatedPremium = isNullorEmpty(item.premium) ? `` : formatCurrency(item.premium);
					item.groupByDate = `${getMonthName(formatedDate.getMonth())} ${formatedDate.getFullYear()}`;
					item.formatedAmount = isNullorEmpty(item.amount) ? `` : formatCurrency(item.amount);
					return item;
				});
			this.transactions.push(...formattedTrans);
			this.funeralPolicyTransactionHistory.transactions = this.transactions;
			this.renderMode = INSURE_RENDER_MODE.FUNERAL_POLICY_TRANSACTION_HISTORY;
		} else {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(returnValue.exception);
		}
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS 

	// --- Navigation

	/**
	 * Navigate so specific subview
	 * @param {String} newMode New render mode string to change renderMode to
	 * @returns {void} void
	 */
	_navigateToSubView(newMode) {
		if (this.renderMode !== INSURE_RENDER_MODE.FUNERAL_ESTIMATE && this.renderMode !== INSURE_RENDER_MODE.CLIENT_POLICIES) {
			this.funeralShowEstimateSuccessToast = false;
		}
		this.renderMode = newMode;
	}

	/**
	 * Fetch latest claim details and render Claim Summary 
	 * @param {event} e e
	 * @returns {void} 
	 */
	_goToClaimSummary(e) {
		this.claimSummary = e.detail;
		this._navigateToSubView(INSURE_RENDER_MODE.CLAIM_SUMMARY);
	}

	/**
	 * Navigate to Funeral Estimate screen
	 * @returns {void} 
	 */
	_goToFuneralPolicyEstimate() {
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_ESTIMATE);
	}

	/**
	 * Navigate to Funeral Sms History
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_goToFuneralSMSHistory(e) {
		this.selectedFuneralPolicyContractReference = e.detail.policyItem.contractReference;
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_SMS_HISTORY);
	}

	/**
	 * Prepare and navigate Cancel Policy Success
	 * @param {event} e e
	 * @returns {void} 
	 */
	_goToFuneralCancelPolicySuccess(e) {
		this.selectedFuneralPolicyContractReference = e.detail.contractReference;
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_CANCEL_POLICY_SUCCESS);
	}

	/**
	 * Prepare and navigate Funeral Update plan
	 * @param {event} e e
	 * @returns {void}
	 */
	async _goToFuneralUpdatePlan(e) {
		if (e.detail.canReinstate) {
			const calcResponse = await this._reissueFuneralPolicyQuote(e.detail.policyContractReference, this.callerInformation.cifNumber);
			const policyResponse = await this._retrieveFuneralPolicySummary(e.detail.policyContractReference, this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);
			if (calcResponse !== null) {
				this.selectedFuneralPolicyDetails = calcResponse;
				this.selectedFuneralPolicyDetails.roleplayers = calcResponse.eligibleRoleplayers;
				this.selectedFuneralPolicyDetails.canReinstate = true;
				this.selectedFuneralPolicyDetails.policyRule = policyResponse.policyRule;
				this.selectedFuneralPolicyDetails.deductionDetails = policyResponse.deductionDetails;
				delete this.selectedFuneralPolicyDetails.eligibleRoleplayers;
			} else {
				// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
				this.handleToastError(calcResponse.exception);
				return;
			}
		} else {
			this.selectedFuneralPolicyDetails = await this._retrieveFuneralPolicySummary(e.detail.policyContractReference, this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);
			const indexOfMainLife = this.selectedFuneralPolicyDetails.roleplayers.findIndex(x => x.relationship === `MainLife`);
			const mainLifeElement = this.selectedFuneralPolicyDetails.roleplayers.splice(indexOfMainLife, 1)[0];
			this.selectedFuneralPolicyDetails.roleplayers.unshift(mainLifeElement);
		}
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_UPDATE_PLAN);
	}

	/**
	 * Fetch latest policy details and render Policy Summary 
	 * @param {event} e e
	 * @returns {void} 
	 */
	async _goToFuneralPolicySummary(e) {
		this.selectedFuneralPolicyDetails = await this._retrieveFuneralPolicySummary(e.detail.policyContractReference, this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);
		const indexOfMainLife = this.selectedFuneralPolicyDetails.roleplayers.findIndex(x => x.relationship === `MainLife`);
		const mainLifeElement = this.selectedFuneralPolicyDetails.roleplayers.splice(indexOfMainLife, 1)[0];
		this.selectedFuneralPolicyDetails.roleplayers.unshift(mainLifeElement);

		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_POLICY_SUMMARY);
	}

	/**
	 * Prepare and navigate to Funeral Transaction history
	 * @param {event} e e
	 * @returns {void} 
	 */
	async _goToFuneralTransactionHistory(e) {
		this.selectedFuneralPolicyContractReference = e.detail.policyNumber;
		this.bankName = e.detail.bankName;
		this.accountNumber = e.detail.accountNumber;
		this.arrearsAmount = e.detail.arrearsAmount;

		await this._retrieveFuneralPolicyTransactionHistory();
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_POLICY_TRANSACTION_HISTORY);
	}

	/**
	 * Send email from caller page
	 * @param {event} e e
	 * @returns {void} 
	  */
	async _sendEmail(e) {
		this.clientConfirmedEmail = e.detail.emailId.detail.emailAddress;

		if (e.detail.callerPage === INSURE_CALLER_PAGE.CANCEL_POLICY) {
			this.callerPage = INSURE_CALLER_PAGE.CANCEL_POLICY;
		} else if (e.detail.callerPage === INSURE_CALLER_PAGE.PAY_PREMIUM) {
			this.callerPage = INSURE_CALLER_PAGE.PAY_PREMIUM;
		} else if (e.detail.callerPage === INSURE_CALLER_PAGE.ESTIMATE) {
			this.callerPage = INSURE_CALLER_PAGE.ESTIMATE;
		} else if (e.detail.callerPage === INSURE_CALLER_PAGE.FUNERAL_CLIENT_POLICIES) {
			this.callerPage = INSURE_CALLER_PAGE.FUNERAL_CLIENT_POLICIES;
		}

		EMAIL_DOCUMENT_REQUEST_PAYLOAD.email = e.detail.emailId.detail.emailAddress;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.cifNumber = this.callerInformation.cifNumber;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.contractReference = isNullorEmpty(this.selectedFuneralPolicyContractReference) ? e.detail?.contractRef : this.selectedFuneralPolicyContractReference;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.title = this.callerInformation.title;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.firstName = this.callerInformation.firstName;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.surname = this.callerInformation.lastName;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.middleName = this.callerInformation?.middleName1;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.gender = getGenderFromIDNumber(this.callerInformation.southAfricanIDNumber);
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.contactDetails.cellphone = this.callerInformation?.verifiedTelephoneNumber;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.contactDetails.email = e.detail.emailId.detail.emailAddress;

		this._getAgreementEmailAttachments(this.callerPage, EMAIL_DOCUMENT_REQUEST_PAYLOAD, e.detail.docContent);
		const emailResponse = await this.insureService.emailFuneralDocuments(EMAIL_DOCUMENT_REQUEST_PAYLOAD);
		if (!emailResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(emailResponse.exception);
			return;
		}
		window.showToastTimed(`success`, `top`, `Success`, `Email document was sent`, 3000, true);
		if (this.callerPage === INSURE_CALLER_PAGE.CANCEL_POLICY || this.callerPage === INSURE_CALLER_PAGE.PAY_PREMIUM || this.callerPage === INSURE_CALLER_PAGE.UPDATE_PLAN || this.callerPage === INSURE_CALLER_PAGE.REINSTATE_POLICY) {
			this._navigateToSubView(INSURE_RENDER_MODE.EMAIL_SUCCESS);
		} else {
			this.funeralShowEstimateSuccessToast = true;
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
			this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES);
		}
	}

	/**
	 * FMS Callback request
	 * @param {*} firstName client first name
	 * @param {*} lastName client last name
	 * @param {*} cellphoneNumber client registered cellphone number
	 * @returns {void}
	 */
	async _requestCallback(firstName, lastName, cellphoneNumber) {
		const requestCallbackRequest = {
			"firstName": firstName,
			"lastName": lastName,
			"cifNumber": this.callerInformation.cifNumber,
			"contactNumber": cellphoneNumber
		};
		const requestCallbackResp = await this.insureService.requestCallback(requestCallbackRequest);
		if (!requestCallbackResp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(requestCallbackResp.exception);
		}
	}

	// --- END Navigation

	// --- Helpers

	/**
	 * Get main life age from caller birthdate
	 * @returns {Number} age
	 */
	_getMainLifeAge() {
		return getAgeFromIDNumber(this.callerInformation.southAfricanIDNumber);
	}

	/**
	 * Get main life gender from ID
	 * @returns {String} main life gender 
	 */
	_getMainLifeGender() {
		return getGenderFromIDNumber(this.callerInformation.southAfricanIDNumber);
	}

	/**
	 * Refresh client summary after navigating back
	 * @param {string} navigateBackTo component to navigate too
	 * @returns {void}
	 */
	async _rerenderClientSummary(navigateBackTo) {
		this.funeralPolicies = await this._retrieveClientFuneralPolicies();
		this._navigateToSubView(navigateBackTo);
	}

	/**
	* Open insure product details on Capitec website
	* @returns {void}
	*/
	async _productEnquiry() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}/insure/`);
	}

	/**
	 * Unload Policy Transactions
	 * @returns {void}
	 */
	_unloadPolicyTransactionHistory() {
		this.funeralPolicyTransactionHistory = {};
	}

	/**
	 * Unload Policy Transactions
	 * @returns {void}
	  */
	_unloadClientPolicies() {
		if (this.funeralPolicies?.summaryDetails?.policies !== null) {
			this.funeralPolicies.summaryDetails.policies.forEach(item => {
				item.isExpanded = false;
			});
		}
	}

	// --- END Helpers

	// #endregion EVENT HANDLER

	// #region RENDERING

	/**
	 * Generates the view stylesheet.
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			${INSURE_CSS}
			`
		];
	}

	/**
	 * Generates the component template for kiosk mode.
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for mobile mode.
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
		${super._webTemplate()}
		${this._renderErrorToast()}
		${this._renderLandingPage()}`;
	}

	/**
	 * Main render switch for Insure views
	 * @returns {html} Component html based on current render mode.
	 */
	_renderLandingPage() {
		switch (this.renderMode) {
			case INSURE_RENDER_MODE.CLIENT_POLICIES:
				return html`${this._renderClientPoliciesPage()}`;
			case INSURE_RENDER_MODE.FUNERAL_ESTIMATE:
				return html`${this._renderFuneralCalculateEstimatePage()}`;
			case INSURE_RENDER_MODE.FUNERAL_UPDATE_PLAN:
				return html`${this._renderFuneralUpdatePlanPage()}`;
			case INSURE_RENDER_MODE.FUNERAL_POLICY_TRANSACTION_HISTORY:
				return html`${this._renderFuneralPolicyTransactionHistoryPage()}`;
			case INSURE_RENDER_MODE.FUNERAL_POLICY_SUMMARY:
				return html`${this._renderFuneralPolicySummaryPage()}`;
			case INSURE_RENDER_MODE.FUNERAL_CANCEL_POLICY_SUCCESS:
				return html`${this._renderFuneralCancelPolicySuccessPage()}`;
			case INSURE_RENDER_MODE.FUNERAL_SMS_HISTORY:
				return html`${this._renderFuneralSMSHistory()}`;
			case INSURE_RENDER_MODE.FUNERAL_PAY_PREMIUM_SUCCESS:
				return html`${this._renderFuneralPayPremiumSuccessPage()}`;
			case INSURE_RENDER_MODE.EMAIL_SUCCESS:
				return html`${this._renderEmailSuccessPage()}`;
			case INSURE_RENDER_MODE.SUCCESS_PAGE:
				return html`${this._renderSuccessPage()}`;
			case INSURE_RENDER_MODE.CLAIM_SUMMARY:
				return html`${this._renderClaimSummaryPage()}`;
			default:
				return html``;
		}
	}

	/**
	 * Render Landing page for Insure Client Summary
	 * Collapse all expanders
	 * @return {html} Html of the sub view
	 */
	_renderClientPoliciesPage() {
		if (this.funeralPolicies?.summaryDetails?.policies !== null && this.funeralPolicies?.summaryDetails?.policies !== undefined) {
			this.funeralPolicies.summaryDetails.policies.forEach(item => {
				item.isExpanded = false;
			});
		}

		return html`
			<horizon-insure-client-summary 
				.emailEstimateSuccess ="${this.funeralShowEstimateSuccessToast}"
				.clientClaims="${this.insuranceClaims}"
				.funeralPolicies="${this.funeralPolicies}"
				.cancelPolicyDocumentDetails="${this.funeralCancelAgreementDocument}" 
				.arrearsPaymentDocumentDetails="${this.funeralArrearsAgreementDocument}"
				.getCancelPolicyDocument="${(contractReference, cancelReason, saveToDocumentum) => this._generateDocumentsFuneralCancel(contractReference, cancelReason, saveToDocumentum)}"
				.generateDocumentsFuneralArrears="${(contractReference, payArrears, fromAccount, saveToDocumentum) => this._generateDocumentsFuneralArrears(contractReference, payArrears, fromAccount, saveToDocumentum)}"
				.maxAllowedCover="${isNullorEmpty(this.funeralPolicies?.checkInsuranceDetails[0]?.maxAllowedCover) ? 100000 : this.funeralPolicies?.checkInsuranceDetails[0]?.maxAllowedCover}"
				.requestCallback = "${(firstName, lastName, cellphoneNumber) => this._requestCallback(firstName, lastName, cellphoneNumber)}"
				.getArrears = "${() => this._retrieveFuneralPolicyArrears()}"
				.clientArrears = "${this.funeralArrears}"
				@product-enquiry="${() => this._productEnquiry()}"
				@pay-policy="${(e) => this._payFuneralPolicyArrears(e)}"
				@cancel-policy="${(e) => this._cancelFuneralPolicy(e)}"
				@navigate-to-estimate="${() => this._goToFuneralPolicyEstimate()}"
				@navigate-to-update-plan="${(e) => this._goToFuneralUpdatePlan(e)}"
				@navigate-to-policy-summary="${(e) => this._goToFuneralPolicySummary(e)}"
				@navigate-to-claim-summary="${(e) => this._goToClaimSummary(e)}"
				@navigate-to-policy-transaction-history="${(e) => this._goToFuneralTransactionHistory(e)}"
				@navigate-to-sms-history="${(e) => this._goToFuneralSMSHistory(e)}"
				@send-email = "${(e) => this._sendEmail(e)}">
			</horizon-insure-client-summary>`;
	}

	/**
	 * Render Calculate estimate page
	 * @return {html} Html of the sub view
	 */
	_renderFuneralCalculateEstimatePage() {
		return html`
			<horizon-insure-funeral-policy-estimate 
				.estimate="${this.funeralEstimateDetails}"
				.printEstimate="${(e) => this._printFuneralEstimate(e)}"
				.calculateEstimate="${(e) => this._calculateFuneralEstimate(e)}"  
				.productParams="${this.productParams}" 
				.mainLifeDefaultAge="${this._getMainLifeAge()}"
				.mainLifeDefaultGender="${this._getMainLifeGender()}"
				.maxAllowedCover="${isNullorEmpty(this.funeralPolicies?.checkInsuranceDetails[0]?.maxAllowedCover) ? 100000 : this.funeralPolicies?.checkInsuranceDetails[0]?.maxAllowedCover}"
				@send-email = "${(e) => this._sendEmail(e)}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-funeral-policy-estimate>`;
	}

	/**
	 * Render Update Plan page
	 * @return {html} Html of the sub view
	 */
	_renderFuneralUpdatePlanPage() {
		return html`
			<horizon-insure-funeral-update-plan
				.maxAllowedCover="${this.funeralPolicies.checkInsuranceDetails[0].maxAllowedCover}"
				.updatePlanQuote="${(policyToCalc) => this._updateFuneralPlanQuote(policyToCalc)}"
				.updatePlanPrepare="${(policyToUpdate) => this._updateFuneralPlanPrepare(policyToUpdate)}"
				.policyDetails="${this.selectedFuneralPolicyDetails}"
				.productParams="${this.productParams}"
				.initiateReinstatePolicy="${(policyToReinstate) => this._reissueFuneralPolicyExecute(policyToReinstate)}"
				@accept-policy="${(policyToAccept) => this._acceptFuneralPolicy(policyToAccept)}"
				@updatePlanAccept="${(e) => this._updateFuneralPlanAccept(e)}"
				@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-funeral-update-plan>`;
	}

	/**
	 * Render Policy Details Plan
	 * @return {html} Html of the sub view
	 */
	_renderFuneralPolicySummaryPage() {
		return html`
			<horizon-insure-funeral-policy-summary 
				.policyDetails="${this.selectedFuneralPolicyDetails}"
				@navigate-back="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				@unloading="${() => this._unloadClientPolicies()}">
			</horizon-insure-funeral-policy-summary>`;
	}

	/**
	 * Render Cancel Policy Success Page
	 * @return {html} Html of the sub view
	 */
	_renderFuneralCancelPolicySuccessPage() {
		return html`
			<horizon-insure-funeral-cancel-policy-success
				.contractReference = ${this.selectedFuneralPolicyContractReference}
				@send-email = "${(e) => this._sendEmail(e)}" 
				@navigate-to-summary="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-funeral-cancel-policy-success>`;
	}

	/**
	 *  Render Pay Premium Success page
	 * @returns {html} Html of the sub view
	 */
	_renderFuneralPayPremiumSuccessPage() {
		return html`
			<horizon-insure-funeral-pay-premium-success-page 
				.amountToPay = "${this.amountToPay}" 
				.contractReference = "${this.selectedFuneralPolicyContractReference}"
				@send-email= "${(e) => this._sendEmail(e)}"
				@navigate-to-policy-summary="${(e) => this._goToFuneralPolicySummary(e)}"
				@navigate-back="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-funeral-pay-premium-success-page>
		`;
	}

	/**
	 * Render Policy Transaction History Page
	 * @returns {html} Html of the sub view 
	 */
	_renderFuneralPolicyTransactionHistoryPage() {
		return html`
			<horizon-insure-funeral-policy-transaction-history
				.policyTransactionHistory="${this.funeralPolicyTransactionHistory}"
				.getPolicyTransactionHistory="${(startDate, endDate, pageIndex) => this._retrieveFuneralPolicyTransactionHistory(startDate, endDate, pageIndex)}"
				.disposeData="${() => this.funeralPolicyTransactionHistory = []}"
				@navigate-back="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				@unloading="${() => this._unloadPolicyTransactionHistory()}">
			</horizon-insure-funeral-policy-transaction-history>`;
	}

	/**
	 * Renders the Communication/SMS history page
	 * 
	 * @returns {html} html
	 */
	_renderFuneralSMSHistory() {
		return html`
			<horizon-insure-funeral-sms-history-page
				.contractReference=${this.selectedFuneralPolicyContractReference} 
				.contactNumber=${this.callerInformation.verifiedTelephoneNumber}
				.getCommsHistory="${(contractReference, startDate, endDate) => this._retrieveFuneralSMSHistory(contractReference, startDate, endDate)}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-funeral-sms-history-page>`;
	}

	/**
	 * Renders the Claim Summary page, single claim details
	 * 
	 * @returns {html} html
	 */
	_renderClaimSummaryPage() {
		return html`
			<horizon-insure-claim-summary
				.claimSummary="${this.claimSummary}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-claim-summary>`;
	}

	/**
	 * Render Email Success Page
	 * @return {html} Html of the sub view
	 */
	_renderEmailSuccessPage() {
		return html`
			<horizon-insure-email-plan-success 
				.contractReference = ${this.selectedFuneralPolicyContractReference}
				.confirmedEmail="${this.clientConfirmedEmail}"
				@navigate-to-policy-summary="${(e) => this._goToFuneralPolicySummary(e)}"
				@navigate-back="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-email-plan-success>
		`;
	}

	/**
	 * Render Generic Success page for Update Plan / ReIssue
	 * @returns {html} Html of the sub view 
	 */
	_renderSuccessPage() {
		return html`
			<horizon-insure-success-page 
				.successMessage="${this.successPageMessage}" 
				.callerPage = "${this.callerPage}" 
				.contractReference = "${this.selectedFuneralPolicyContractReference}"
				@send-email = "${(e) => this._sendEmail(e)}"
				@navigate-back="${(e) => this._rerenderClientSummary(e.detail.navigateBackTo)}">
			</horizon-insure-success-page>`;
	}

	/**
	 * Render Generic Error toast with message
	 * @returns {html} Html of the toast
	 */
	_renderErrorToast() {
		return html`
			<capitec-toast 
				?hidden="${!this.showInsureErrorToast}" 
				class="error-toast"
				id="id-insure-error-toast"
				type="error"
				header="Unsuccessful"
				detail="${this.insureErrorToastMessage}" 
				@click="${() => this.showInsureErrorToast = false}">
			</capitec-toast>`;
	}

	// #endregion RENDERING
}
customElements.define(`horizon-existing-client`, ExistingClient);