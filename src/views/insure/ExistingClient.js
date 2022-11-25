
import { ACTIVITY_TYPE_DESCRIPTION, AUDIT_DATE_TYPE_LIST, MAX_RESULTS, NINETY_DAYS, TRANSACTION_TYPE } from 'app/constants/InsureTransactionHistory';
import { DOCUMENT_TYPE, INSURE_CALLER_PAGE, TRANSACTION_STATUS } from 'app/constants/InsureCommon';
import { EMAIL_DOCUMENT_REQUEST_PAYLOAD, GENERATE_DOCUMENT_REQUEST_PAYLOAD } from 'app/utils/insureRequestPayload';
import { css, html } from 'platform/elements';
import { getAgeFromIDNumber, getGenderFromIDNumber } from 'app/utils/insureUtils';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { Configuration } from 'platform/core';
import { HorizonInsureStore } from 'app/store/HorizonInsureStore';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { InsureService } from 'app/services/InsureService';
import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { SavingsService } from 'app/services/SavingsService';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import 'app/components/insure/ClientSummary';
import 'app/components/insure/PolicyEstimate';
import 'app/components/insure/UpdatePlan';
import 'app/components/insure/PolicySummary';
import 'app/components/insure/CancelPolicySuccess';
import 'app/components/insure/EmailPlanSuccess';
import 'app/components/insure/PayPremiumSuccess';
import 'app/components/insure/PolicyTransactionHistory';
import 'app/components/insure/AuditTransactionHistory';
import 'app/components/insure/UpdatePlanSuccess';
import 'app/components/insure/SuccessPage';
import 'app/components/insure/SMSHistory';
import 'app/components/insure/ClaimSummary';

const POLICY_TRANSACTION_HISTORY = {
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
	PAGE_INDEX: 0,
	MAX_RESULTS: MAX_RESULTS
};

const COMMUNICATION_HISTORY = {
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
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
		this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;
		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.savingsAccountService = new SavingsService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.configuration = Configuration.getInstance();
		this.horizonInsureStore = HorizonInsureStore.getInstance();

		this.productParams = {};
		this.policyTransactionHistory = {};
		this.policyDetails = {};
		this.estimate = {};
		this.claims = [];

		this.contractReference = ``;
		this.successMessage = ``;
		this.callerPage = ``;
		this.issuePlanAgreementDocument = {};
		this.reinstatePaymentAgreementDocument = {};
		this.updatePlanAgreementDocument = {};
		this.updatePaymentAgreementDocument = {};

		this.readOnly = false;
		this.emailEstimateSuccess = false;
		// this.auditTransactionHistory = {};
	}

	/**
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {Object} clientPolicies Data & flags for all policies relating to client CIF
	 * @property {Object} policyDetails  Local object for Policy Summary requests
	 * @property {Object} estimate Local object for new Estimate requests
	 * @property {String} mainLifeGender Gender of Main Life on policy
	 * @property {String} contractReference Contract Reference of selected policy
	 * @property {String} successMessage after action is done.
	 * @property {String} callerPage from which success page is invoked.
	 * @property {String} issuePlanAgreementDocument stores issue plan agreement document object.
	 * @property {String} reinstatePaymentAgreementDocument stores payment agreement document object.
	 * @property {Object} policySummary  Local object for new Quote requests
	 * @property {String} cancellationReason contains the cancellation reason selected
	 * @property {Object} cancelPolicyDocumentDetails contains the cancel policy document details
	 * @property {Object} arrearsPaymentDocumentDetails contains the arrears payment document details
	 * @property {Boolean} emailEstimateSuccess determin whether to show a success alert for estimate email
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			productParams: { type: Object, state: true },
			clientPolicies: { type: Object, state: true },
			policyDetails: { type: Object, state: true },
			estimate: { type: Object, state: true },
			mainLifeGender: { type: String, state: true },
			contractReference: { type: String, state: true },
			successMessage: { type: String },
			callerPage: { type: String },
			issuePlanAgreementDocument: { type: Object, state: true },
			reinstatePaymentAgreementDocument: { type: Object, state: true },
			updatePlanAgreementDocument: { type: Object, state: true },
			updatePaymentAgreementDocument: { type: Object, state: true },
			cancellationReason: { type: String, state: true },
			cancelPolicyDocumentDetails: { type: Object, state: true },
			accountDetails: { type: Object, state: true },
			policyNumber: { type: String, state: true },
			commsHistory: { type: Object, state: true },
			readOnly: { type: Object, state: true },
			arrearsPaymentDocumentDetails: { type: Object, state: true },
			confirmedEmail: { type: Object, state: true },
			renderMode: { type: Number },
			claims: { type: Object, state: true },
			emailEstimateSuccess: { type: Boolean, state: true }

		};
	}

	// #endregion

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
	 * Fetch client policies
	 * 
	 * @returns {null} null
	 */
	async _initialise() {
		await this._retrieveClientSummary();
		this.accountDetails = await this._retrieveAccountDetails();
		this.commsHistory = await this._retrieveCommsHistory();
		this.claims = await this._retrieveClaims();
	}

	/**
	 * Get main life age from birthdate
	 * @returns {null} null 
	 */
	_getMainLifeAge() {
		const mainLifeAge = getAgeFromIDNumber(this.callerInformation.southAfricanIDNumber);
		return mainLifeAge;
	}

	/**
	 * Get main life gender from ID
	 * @returns {*} main life gender 
	 */
	_getMainLifeGender() {
		const mainLifeGender = getGenderFromIDNumber(this.callerInformation.southAfricanIDNumber);
		return mainLifeGender;
	}

	/**
	 * Generate 801 & 804 documents for Reinstate Policy
	 * @param {*} saveDocumentToDocumentum - true/false
	 * @returns {*} *
	 */
	async _generateDocumentsForReinstate(saveDocumentToDocumentum) {
		const dob = new Date(this.callerInformation.birthdate);
		const clientDetails = {
			"cifNumber": this.callerInformation.cifNumber,
			"policyContractReference": this.contractReference,
			"firstName": this.callerInformation.firstName,
			"surname": this.callerInformation.surname,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"dateOfBirth": dob.toISOString()
		};

		GENERATE_DOCUMENT_REQUEST_PAYLOAD.saveDocumentToDocumentum = saveDocumentToDocumentum;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.clientDetails = clientDetails;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.contractReference = this.contractReference;

		const issuePlanAgreementResponse = await this.insureService.generateIssueFuneralCoverPlanAgreement(GENERATE_DOCUMENT_REQUEST_PAYLOAD);

		if (!issuePlanAgreementResponse.succeeded) {
			this.handleToastError(issuePlanAgreementResponse.exception);
			return;
		}

		this.issuePlanAgreementDocument = issuePlanAgreementResponse.result;

		if (this.contractReference.toLowerCase().startsWith(`cf`)) {
			const paymentAgreementResponse = await this.insureService.generateFuneralPolicyPaymentAgreement(GENERATE_DOCUMENT_REQUEST_PAYLOAD);

			if (!paymentAgreementResponse.succeeded) {
				this.handleToastError(paymentAgreementResponse.exception);
				return;
			}

			this.reinstatePaymentAgreementDocument = paymentAgreementResponse.result;
		}
	}

	/**
	 * Generate 802 & 804 documents for Update Plan
	 * @param {*} saveDocumentToDocumentum - true/false
	 * @returns {*} *
	 */
	async _generateDocumentsForUpdatePlan(saveDocumentToDocumentum) {
		const dob = new Date(this.callerInformation.birthdate);
		const clientDetails = {
			"cifNumber": this.callerInformation.cifNumber,
			"policyContractReference": this.contractReference,
			"firstName": this.callerInformation.firstName,
			"surname": this.callerInformation.surname,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"dateOfBirth": dob.toISOString()
		};

		GENERATE_DOCUMENT_REQUEST_PAYLOAD.saveDocumentToDocumentum = saveDocumentToDocumentum;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.clientDetails = clientDetails;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.contractReference = this.contractReference;

		const docGenerateRequestPayload = {
			"documentFormat": `PDF`,
			"saveDocumentToDocumentum": false,
			"returnDocumentContent": true,
			"emailDocumentToClient": false,
			"wetsignBarcode": false,
			"clientDetails": {
				"cifNumber": this.callerInformation.cifNumber,
				"policyContractReference": this.contractReference,
				"firstName": this.callerInformation.firstName,
				"surname": this.callerInformation.surname,
				"idNumber": this.callerInformation.southAfricanIDNumber,
				"dateOfBirth": dob.toISOString()
			},
			"contractReference": this.contractReference
		};

		const updatePlanAgreementResponse = await this.insureService.generateUpdateFuneralCoverPlanAgreement(docGenerateRequestPayload);

		if (!updatePlanAgreementResponse.succeeded) {
			this.handleToastError(updatePlanAgreementResponse.exception);
			return;
		}

		this.updatePlanAgreementDocument = updatePlanAgreementResponse.result;

		if (docGenerateRequestPayload.contractReference.toLowerCase().startsWith(`cf`)) {
			const updatePaymentAgreementResponse = await this.insureService.generateFuneralPolicyPaymentAgreement(docGenerateRequestPayload);

			if (!updatePaymentAgreementResponse.succeeded) {
				this.handleToastError(updatePaymentAgreementResponse.exception);
				return;
			}

			this.updatePaymentAgreementDocument = updatePaymentAgreementResponse.result;
		}
	}

	/**
	 * Get attachments for different document types
	 * @param {*} sourcePage from which send email method is invoked
	 * @param {*} emailDocumentRequestPayload - email request payload
	 * @param {*} docContent - Document content
	 * @returns {*} *
	 */
	_getAgreementAttachments(sourcePage, emailDocumentRequestPayload, docContent) {
		if (sourcePage === INSURE_CALLER_PAGE.REINSTATE_POLICY) {
			emailDocumentRequestPayload.documentInfo = [
				{
					"documentType": DOCUMENT_TYPE.ISSUE_POLICY_AGREEMENT,
					"documentGuid": this.issuePlanAgreementDocument?.documentDetails?.guid,
					"content": {
						"type": `PDF`,
						"value": this.issuePlanAgreementDocument?.documentContent.value
					}
				},
				{
					"documentType": DOCUMENT_TYPE.PAYMENT_MANDATE_AGREEMENT,
					"documentGuid": this.reinstatePaymentAgreementDocument?.documentDetails?.guid,
					"content": {
						"type": `PDF`,
						"value": this.reinstatePaymentAgreementDocument?.documentContent.value
					}
				}
			];
		} else if (sourcePage === INSURE_CALLER_PAGE.UPDATE_PLAN) {
			emailDocumentRequestPayload.documentInfo = [
				{
					"documentType": DOCUMENT_TYPE.UPDATE_POLICY_AGREEMENT,
					"documentGuid": this.updatePlanAgreementDocument?.documentDetails?.guid,
					"content": {
						"type": `PDF`,
						"value": this.updatePlanAgreementDocument?.documentContent.value
					}
				},
				{
					"documentType": DOCUMENT_TYPE.PAYMENT_MANDATE_AGREEMENT,
					"documentGuid": this.updatePaymentAgreementDocument?.documentDetails?.guid,
					"content": {
						"type": `PDF`,
						"value": this.updatePaymentAgreementDocument?.documentContent?.value
					}
				}
			];
		} else if (sourcePage === INSURE_CALLER_PAGE.CANCEL_POLICY) {
			emailDocumentRequestPayload.documentInfo = [
				{
					"documentType": DOCUMENT_TYPE.CANCEL_POLICY_AGREEMENT,
					"documentGuid": this.cancelPolicyDocumentDetails?.documentDetails?.guid,
					"content": {
						"value": this.cancelPolicyDocumentDetails?.documentContent.value,
						"type": `PDF`
					}
				}
			];
		} else if (sourcePage === INSURE_CALLER_PAGE.PAY_PREMIUM) {
			emailDocumentRequestPayload.documentInfo = [
				{
					"documentType": DOCUMENT_TYPE.PAY_ARREARS_AGREEMENT,
					"documentGuid": ``,
					"content": {
						"type": `PDF`,
						"value": ``
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
		} else if (sourcePage === INSURE_CALLER_PAGE.CLIENT_POLICIES) {
			emailDocumentRequestPayload.documentInfo = [];
		}
	}

	/**
	 * Refresh client summary after navigating back
	 * @param {string} navigateBackTo component to navigate too
	 * @returns {void}
	 */
	async _rerenderClientSummary(navigateBackTo) {
		await this._retrieveClientSummary();
		this.emailEstimateSuccess = false;
		this._navigateToSubView(navigateBackTo);
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Navigate so specific subview
	 * @param {String} newMode New render mode string to change renderMode to
	 * @returns {null} null
	  */
	_navigateToSubView(newMode) {
		this.renderMode = newMode;
	}

	/**
	 * Navigate back from any view to Client Summary
	 * @returns {null} null
	 */
	_backToSummaryPage() {
		this.emailEstimateSuccess = false;
		this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;
	}

	/**
	 * Prepare and navigate Estimate
	 * @returns {null} null
	 */
	_goToPolicyEstimate() {
		this._navigateToSubView(INSURE_RENDER_MODE.ESTIMATE);
	}

	/**
	 * Make FIPS call and Prepare and navigate to pay premium success page
	 * 
	 * @param {*} e contains the payArrears object
	 * @returns {null} null
	 */
	_goToPayPremiumSuccess(e) {
		this._navigateToSubView(INSURE_RENDER_MODE.PAY_PREMIUM_SUCCESS);
	}

	/**
	 * Prepare and navigate Update plan
	 * @param {*} e e
	 * @returns {null} null
	 */
	async _goToUpdatePlan(e) {
		if (e.detail.canReinstate) {
			const calcResponse = await this._reinstateQuoteCalc(e.detail.policyContractReference, this.callerInformation.cifNumber);
			if (calcResponse !== null) {
				this.policyDetails = calcResponse;
				this.policyDetails.roleplayers = calcResponse.eligibleRoleplayers;
				delete this.policyDetails.eligibleRoleplayers;
				delete this.policyDetails.ineligibleRoleplayers;
				this.policyDetails.canReinstate = true;
			} else {
				this.handleToastError(calcResponse.exception);
				return;
			}
		} else {
			this.policyDetails = await this._retrievePolicySummary(e.detail.policyContractReference, this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);
		}
		this._navigateToSubView(INSURE_RENDER_MODE.UPDATE_PLAN);
	}

	/**
	 * Retrieve client summary containing all policies
	 * @returns {Object} Client policies 
	 */
	async _retrieveClientSummary() {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			idNumber: this.callerInformation.southAfricanIDNumber
		};

		const resp = await this.insureService.clientSummary(request);
		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return;
		}
		this.clientPolicies = resp.result;
	}

	/**
	 * Retrieve Policy Summary via insure channel service
	 * @param {*} contractReference contractReference
	 * @param {*} cifNumber cifNumber
	 * @param {*} idNumber idNumber
	 * @returns {Object} Policy Summary Details 
	 */
	async _retrievePolicySummary(contractReference, cifNumber, idNumber) {
		const request = {
			contractReference: contractReference,
			cifNumber: cifNumber,
			idNumber: idNumber
		};
		const resp = await this.insureService.policySummary(request);
		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return;
		}

		return resp.result;
	}

	/**
	* Retrieve Quote number and Policy details
	* @returns {Object} Quote number and Policy details 
	* @returns {Object} Quote number and Policy details 
	* @returns {Object} Quote number and Policy details 
	* @param {*} contractReference contractReference
	* @param {*} cifNumber cifNumber
	 */
	async _reinstateQuoteCalc(contractReference, cifNumber) {
		const request = {
			contractReference: contractReference,
			cifNumber: cifNumber
		};
		const resp = await this.insureService.policyReissue(request);
		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return;
		}

		return resp.result;
	}

	/**
	 * Retrieve Savings Account Details via Savings Account service
	 * @returns {Object} Savings Account Details 
	 */
	async _retrieveAccountDetails() {
		const savingsAccountData = await this.savingsAccountService.savingsAccountLanding(this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber, true);
		const savingsPlanData = await this.savingsAccountService.savingsPlanLanding(this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber, true);

		const resp = {
			savingsAccountData: savingsAccountData?.result,
			savingsPlanData: savingsPlanData?.result
		};

		return resp;
	}

	/**
	 * Retrieve Claims list for Client
	 * @returns {Object} Claims list
	 */
	async _retrieveClaims() {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			idNumber: this.callerInformation.southAfricanIDNumber
		};
		const claimsList = await this.insureService.viewExistingClaims(request);
		return claimsList.result;
	}

	/**
	 * Calculate estimate based on lives assured provided
	 * Map metadata (coverDetails) back when response is received
	 * @param {*} e e
	 * @returns {Object} Estimate response
	 */
	async _calculateClientEstimate(e) {
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
			this.estimate = estimateWithCoverDetails;
		} else {
			this.handleToastError(resp.exception);
			return null;
		}
	}

	/**
	 * Print estimate based on lives assured provided
	 * Map metadata (coverDetails) back when response is received
	 * @param {*} e e
	 * @returns {Object} Estimate response
	 */
	async _printEstimate(e) {
		await this._calculateClientEstimate(e);
		const dob = new Date(this.callerInformation.birthdate);
		const clientDetails = {
			"cifNumber": this.callerInformation.cifNumber,
			"policyContractReference": this.contractReference,
			"firstName": this.callerInformation.firstName,
			"surname": this.callerInformation.surname,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"dateOfBirth": dob.toISOString()
		};

		GENERATE_DOCUMENT_REQUEST_PAYLOAD.clientDetails = clientDetails;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.input = this.estimate;

		const result = await this.insureService.generateEstimatePrintoutDocument(GENERATE_DOCUMENT_REQUEST_PAYLOAD);
		if (!result.succeeded) {
			this.handleToastError(result.exception);
			return;
		}
		return result;
	}

	/**
	 * Cancel Policy
	 * @param {*} e e
	 * @returns {*} * 
	 */
	async _cancelPolicy(e) {

		this.cancellationReason = e.detail.cancellationReason;

		const cancelPolicyDetails = {
			"contractReference": e.detail.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"cancellationReason": this.cancellationReason,
			"documents": [
				{
					"documentCode": this.cancelPolicyDocumentDetails.documentDetails.documentCode,
					"documentName": this.cancelPolicyDocumentDetails.documentDetails.documentName,
					"guid": this.cancelPolicyDocumentDetails.documentDetails.guid
				}
			]

		};

		const resp = await this.insureService.cancelPolicy(cancelPolicyDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {

			this._getCancelPolicyDocument(e.detail.contractReference, e.detail.cancellationReason, true);
			this._goToCancelPolicySuccess(e);

		} else {
			this.handleToastError(resp.exception);
			return null;
		}
	}

	/**
	 * Cancel Policy Agreement
	 * @param {*} contractReference contractReference
	 * @param {*} cancelReason cancelReason
	 * @param {*} saveToDocumentum saveToDocumentum
	 * @returns {*} * 
	 */
	async _getCancelPolicyDocument(contractReference, cancelReason, saveToDocumentum) {
		this.policyNumber = contractReference;
		const dob = new Date(this.callerInformation.birthdate);
		const cancelPolicyAgreementDetails = {
			"documentFormat": `PDF`,
			"saveDocumentToDocumentum": saveToDocumentum,
			"returnDocumentContent": true,
			"emailDocumentToClient": false,
			"wetsignBarcode": false,
			"clientDetails": {
				"cifNumber": this.callerInformation.cifNumber,
				"primarySavingsAccountNumber": this.accountDetails.savingsAccountData.accountNumber,
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
			this.cancelPolicyDocumentDetails = resp.result;
		} else {
			this.handleToastError(resp.exception);
			return;
		}

		this.requestUpdate();
	}

	/**
	 * Pay Arrears based on arrears provided
	 * Map metadata back when response is received
	 * @param {*} e e
	 * @returns {Object} accumulator
	 */
	async _payPolicy(e) {

		const payArrears = {
			"contractReference": e.detail.payArrears.contractReference,
			"arrears": e.detail.payArrears.arrears,
			"cifNumber": this.callerInformation.cifNumber,
			"fromAccount": e.detail.fromAccount
		};

		const resp = await this.insureService.payPolicy(payArrears, () => true);
		if (resp.succeeded === true && resp.result !== null) {

			this.contractReference = e.detail.payArrears.contractReference;

			const sumArrears = e.detail.payArrears.arrears?.reduce((accumulator, object) => accumulator + (object.amount ?? 0), 0);

			this.amountToPay = sumArrears;

			this._getArrearsPaymentDocument(this.contractReference, e.detail.payArrears.arrears, e.detail.fromAccount, true);
			this._navigateToSubView(INSURE_RENDER_MODE.PAY_PREMIUM_SUCCESS);
		} else {
			this.handleToastError(resp.exception);
			return null;
		}
	}


	/**
	 * retrieve the Communication(SMS) History
	 * @param {*} startDate startDate
	 * @param {*} endDate endDate
	 * @returns {*} result
	 */
	async _retrieveCommsHistory(startDate, endDate) {

		const commsHistoryDetails = {
			"cifNumber": this.callerInformation.cifNumber,
			"filters": {
				"contractReference": ``,
				"contactNumber": this.callerInformation.verifiedTelephoneNumber,
				"medium": `SMS`
			},
			"fromDate": startDate || COMMUNICATION_HISTORY.START_DATE,
			"toDate": endDate || COMMUNICATION_HISTORY.END_DATE,
			"pagniation": {
				"pageIndex": COMMUNICATION_HISTORY.PAGE_INDEX,
				"totalPerPage": COMMUNICATION_HISTORY.MAX_RESULTS
			}
		};

		const resp = await this.insureService.communicationHistory(commsHistoryDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			return resp.result;
		}
		this.handleToastError(resp.exception);
		return null;

	}

	/**
	 * Navigate so specific subview
	 * @param {*} newMode newMode
	 * @returns {null} null
	 */
	_navigateToSubView(newMode) {
		this.renderMode = newMode;
	}

	/**
	 * Navigate back from any view to Summary
	 * @returns {null} null
	 */
	_backToSummaryPage() {
		this.emailEstimateSuccess = false;
		this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;
	}

	/**
	 * Prepare and navigate Estimate
	 * @returns {null} null
	 */
	_goToPolicyEstimate() {
		// Telemetry Here
		this._navigateToSubView(INSURE_RENDER_MODE.ESTIMATE);
	}

	/**
	 * Prepare and navigate to Transaction history
	 * @param {*} e e
	 * @returns {null} null
	 */
	async _goToPolicyTransactionHistory(e) {
		this.contractReference = e.detail.policyNumber;
		this.bankName = e.detail.bankName;
		this.accountNumber = e.detail.accountNumber;
		this.arrearsAmount = e.detail.arrearsAmount;

		await this._getPolicyTransactionHistory();
		this._navigateToSubView(INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY);
	}

	/**
	 * Fetch latest policy details and render Policy Summary 
	 * @param {*} e e
	 * @returns {null} null
	 */
	async _goToPolicySummary(e) {
		this.policyDetails = await this._retrievePolicySummary(e.detail.policyContractReference, this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);
		this._navigateToSubView(INSURE_RENDER_MODE.POLICY_SUMMARY);
	}

	/**
	 * Fetch latest claim details and render Claims Summary 
	 * @param {*} e e
	 * @returns {null} null
	 */
	_goToClaimSummary(e) {
		this.claimSummary = e.detail;
		this._navigateToSubView(INSURE_RENDER_MODE.CLAIM_SUMMARY);
	}

	/**
	 * Prepare and navigate Cancel Policy Success
	 * @param {*} e e
	 * @returns {null} null
	 */
	_goToCancelPolicySuccess(e) {
		// Telemetry Here
		this.contractReference = e.detail.contractReference;
		this._navigateToSubView(INSURE_RENDER_MODE.CANCEL_POLICY_SUCCESS);
	}

	/**
	 * Prepare and navigate Email Success
	 * @returns {null} null
	 */
	_goToEmailPlanSuccess() {
		// Telemetry Here
		this._navigateToSubView(INSURE_RENDER_MODE.EMAIL_SUCCESS);
	}


	/**
	 * Make FIPS call and Prepare and navigate to pay premium success page
	 * 
	 * @param {*} e contains the payArrears object
	 * @returns {null} null
	 */
	_goToPayPremiumSuccess() {
		// call fips here

		// Telemetry Here


		this._navigateToSubView(INSURE_RENDER_MODE.PAY_PREMIUM_SUCCESS);
	}

	_goToSMSHistory(e) {

		this.policyNumber = e.detail.policyItem.contractReference;


		// call fips here

		// Telemetry Here

		this._navigateToSubView(INSURE_RENDER_MODE.SMS_HISTORY);
	}

	// #endregion

	/**
	 * Fetch Policy Transaction History
	 * @param {*} startDate startDate
	 * @param {*} endDate endDate
	 * @param {*} pageIndex pageIndex
	 * @returns {null} null
	 */
	async _getPolicyTransactionHistory(startDate, endDate, pageIndex) {
		const transactionHistoryRequest = {
			contractReference: this.contractReference,
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

		this.policyTransactionHistory = {
			contractReference: this.contractReference,
			bankName: this.bankName,
			accountNumber: this.accountNumber,
			arrearsAmount: this.arrearsAmount
		};

		const returnValue = await this.insureService.policyTransactions(transactionHistoryRequest);
		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactions.
				filter((ele) => ele.transactionType === `PremiumCollection` || ele.transactionType === `Disbursement`).map((item) => {
					const formatedDate = new Date(Date.parse(item.date));
					item.transactionType = TRANSACTION_TYPE[item.transactionType?.toUpperCase()];
					item.formatedDate = formatedDate;
					item.formatedPremium = isNullorEmpty(item.premium) ? `` : formatCurrency(item.premium);
					item.groupByDate = `${getMonthName(formatedDate.getMonth())} ${formatedDate.getFullYear()}`;
					item.formatedAmount = isNullorEmpty(item.amount) ? `` : formatCurrency(item.amount);
					return item;
				});
			this.transactions.push(...formattedTrans);
			this.policyTransactionHistory.transactions = this.transactions;
			this.renderMode = INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY;
		} else {
			this.handleToastError(returnValue.exception);
		}
	}

	/**
	 * Fetch Audit Transaction History - RELEASE DELAYED
	 * @param {*} startDate startDate
	 * @param {*} endDate endDate
	 * @param {*} pageIndex pageIndex
	 * @returns {null} null
	*/
	// async _getAuditTransactionHistory(startDate, endDate, pageIndex) {
	// const transactionHistoryRequest = {
	// contractReference: this.contractReference,
	// transactionDateType: AUDIT_DATE_TYPE_LIST[0].code,
	// fromDate: startDate || POLICY_TRANSACTION_HISTORY.START_DATE,
	// toDate: endDate || POLICY_TRANSACTION_HISTORY.END_DATE,
	// transactionStatus: TRANSACTION_STATUS.NONFINANCIAL,
	// pagniation: {
	// pageIndex: pageIndex || POLICY_TRANSACTION_HISTORY.PAGE_INDEX,
	// totalPerPage: POLICY_TRANSACTION_HISTORY.MAX_RESULTS
	// }
	// };

	// this.transactions = [];

	// this.auditTransactionHistory = {
	// contractReference: this.contractReference
	// };

	// const returnValue = await this.insureService.getAuditTransactions(transactionHistoryRequest);

	// if (returnValue.succeeded && returnValue.result) {
	// const formattedTrans = returnValue.result.transactions
	// .map((item) => {
	// // TODO: Need to update below code once service includes in the response payload.
	// // const formatedChangeActionedDate = new Date(Date.parse(item.changeActionedDate));
	// // const formatedEffectiveDate = new Date(Date.parse(item.effectiveDate));
	// // item.formatedChangeActionedDate = formatedChangeActionedDate;
	// // item.formatedEffectiveDate = formatedEffectiveDate;
	// // item.groupBychangeActionedDate = `${getMonthName(formatedChangeActionedDate.getMonth())} ${formatedChangeActionedDate.getFullYear()}`;

	// const formatedDate = new Date(Date.parse(item.date));
	// item.formatedDate = formatedDate;
	// item.groupByDate = `${getMonthName(formatedDate.getMonth())} ${formatedDate.getFullYear()}`;
	// item.transactionTypeDesc = isNullorEmpty(ACTIVITY_TYPE_DESCRIPTION[item.transactionType]) ? item.transactionType : ACTIVITY_TYPE_DESCRIPTION[item.transactionType];
	// return item;
	// });
	// this.transactions.push(...formattedTrans);

	// this.auditTransactionHistory.transactions = this.transactions;

	// this.endCallContext = `AuditTransactionHistory`;
	// this.renderMode = INSURE_RENDER_MODE.AUDIT_TRANSACTION_HISTORY;
	// }
	// }

	/**
	 * Prepare and navigate to Audit Transaction history - RELEASE DELAYED
	 * @param {*} e e
	 * @returns {null} null
	 */
	// async _goToAuditTransactionHistory(e) {
	// this.contractReference = e.detail.policyNumber;
	// await this._getAuditTransactionHistory();
	// this._navigateToSubView(INSURE_RENDER_MODE.AUDIT_TRANSACTION_HISTORY);
	// }

	/**
	 * Calculate quote callback from Update plan, supply 
	 * @param {*} policyToCalc policyToCalc
	 * @returns {*} result
	 */
	async _updatePlanQuote(policyToCalc) {
		const quoteCalcRequest = {
			"saveQuote": true,
			"contractReference": policyToCalc.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"totalPremium": policyToCalc.totalPremium,
			"lifesAssured": policyToCalc.roleplayers.filter(ele => ele.lifeAssured === true)
		};

		const calculateQuoteResp = await this.insureService.calculateQuote(quoteCalcRequest);
		if (!calculateQuoteResp.succeeded) {
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
		calculatedQuote.lifesAssured = adjustedRoleplayers;
		return calculatedQuote;
	}

	/**
	 * Update Plan callback to perform update sequence
	 * @param {*} policyToUpdate policyToUpdate
	 * @returns {*} preparePlanResponse
	 */
	async _updatePlanPrepare(policyToUpdate) {
		const quoteCalcRequest = {
			"saveQuote": true,
			"contractReference": policyToUpdate.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"totalPremium": policyToUpdate.totalPremium,
			"lifesAssured": policyToUpdate.roleplayers.filter(ele => ele.lifeAssured === true)
		};
		const calculateQuoteResp = await this.insureService.calculateQuote(quoteCalcRequest);
		if (!calculateQuoteResp.succeeded) {
			this.handleToastError(calculateQuoteResp.exception);
			return;
		}

		const prepareUpdateRequest = {
			"contractReference": policyToUpdate.contractReference,
			"quoteNumber": calculateQuoteResp.result.quoteNumber,
			"beneficiaries": policyToUpdate.roleplayers.filter(ele => ele.beneficiary === true),
			"collectionDetails": policyToUpdate.deductionDetails
		};

		const prepareUpdateResp = await this.insureService.prepareUpdate(prepareUpdateRequest);
		if (!prepareUpdateResp.succeeded) {
			this.handleToastError(prepareUpdateResp.exception);
			return;
		}

		this.contractReference = prepareUpdateResp.result.contractReference;

		await this._generateDocumentsForUpdatePlan(false);

		// let agreementRequest = {
		// "documentFormat": "PDF",
		// "saveDocumentToDocumentum": true,
		// "returnDocumentContent": true,
		// "emailDocumentToClient": false,
		// "wetsignBarcode": false,
		// "clientDetails": {
		// "cifNumber": this.callerInformation.cifNumber,
		// "policyContractReference": prepareUpdateResp.result.contractReference,
		// "firstName": this.callerInformation.firstName,
		// "surname": this.callerInformation.surname,
		// "idNumber": this.callerInformation.southAfricanIDNumber,
		// "dateOfBirth": this.callerInformation.birthdate
		// },
		// "contractReference": prepareUpdateResp.result.contractReference
		// }

		// const planAgreementResp = await this.insureService.generateUpdateFuneralCoverPlanAgreement(agreementRequest);
		// const paymentAgreementResp = await this.insureService.generateFuneralPolicyPaymentAgreement(agreementRequest);

		// if (!planAgreementResp.succeeded || !paymentAgreementResp.succeeded)
		// return;

		// // TMP ===== REMOVE WHEN SERVICE READY
		// let agreementResp = {
		// "documentDetails": {
		// "documentCode": "ABC01",
		// "documentName": "Test Doc",
		// "guid": "91ba047a4bd44cf3abb7ccae7a95149a"
		// },
		// "documentContent": "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
		// }
		// planAgreementResp.result = agreementResp;
		// paymentAgreementResp.result = agreementResp;
		// // =========

		// this.updatePlanAgreementDocument = planAgreementResp?.result;
		// this.updatePaymentAgreementDocument = paymentAgreementResp?.result;

		const preparePlanResponse = {
			planAgreement: this.updatePlanAgreementDocument,
			paymentAgreement: this.updatePaymentAgreementDocument,
			prepareUpdateResponse: prepareUpdateResp.result
		};
		return preparePlanResponse;

	}

	/**
	 * Invoke accept plan call, and redirect to success page
	 * @param {*} event event
	 * @returns {*}*
	 */
	async _updatePlanAccept(event) {
		const documents = [
			event.detail.prepareUpdate.paymentAgreement.documentDetails,
			event.detail.prepareUpdate.planAgreement.documentDetails
		];
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
			this.handleToastError(acceptPlanResp.exception);
			return;
		}

		this.successMessage = `The policy has been successfully updated`;
		this.callerPage = INSURE_CALLER_PAGE.UPDATE_PLAN;
		this.contractReference = event.detail.prepareUpdate.prepareUpdateResponse.contractReference;
		this.renderMode = INSURE_RENDER_MODE.SUCCESS_PAGE;
	}

	/**
	 * Reinstate Policy callback to create policy and get agreement documents
	 * @param {*} policyToReinstate policyToReinstate
	 * @returns {*} reinstatePolicyResponse
	 */
	async _initiateReinstatePolicy(policyToReinstate) {
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
			this.handleToastError(createPolicyResponse.exception);
			return;
		}
		this.contractReference = createPolicyResponse.result.contractReference;

		await this._generateDocumentsForReinstate(false);
		const resinstatePolicyResponse = {
			issuePlanAgreement: this.issuePlanAgreementDocument,
			paymentAgreement: this.reinstatePaymentAgreementDocument,
			policyResponse: createPolicyResponse.result
		};
		return resinstatePolicyResponse;
	}

	/**
	 * Accept Policy Reinstate
	 * @param {object} event - request payload for Accept Policy
	 * @returns {null} null 
	 */
	async _acceptPolicy(event) {

		let documents = [];

		if (event.detail.newContractRef.substring(0, 2) === `CF`) {
			documents = [
				event.detail.policyResponse.issuePlanAgreement.documentDetails,
				event.detail.policyResponse.paymentAgreement.documentDetails
			];
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
			this.handleToastError(acceptPlanResp.exception);
			return;
		}

		this.contractReference = event.detail.policyResponse.policyResponse.contractReference;
		await this._generateDocumentsForReinstate(true);

		this.successMessage = `The policy ${event.detail.policyResponse.policyResponse.contractReference} has been successfully reinstated`;
		this.callerPage = INSURE_CALLER_PAGE.REINSTATE_POLICY;
		this.contractReference = event.detail.policyResponse.policyResponse.contractReference;
		this.renderMode = INSURE_RENDER_MODE.SUCCESS_PAGE;
	}

	/**
	 * Navigate so specific subview
	 * @param {*} e e
	 * @returns {null} null
	  */
	async _sendEmail(e) {
		this.confirmedEmail = e.detail.emailId.detail.emailAddress;

		if (e.detail.callerPage === INSURE_CALLER_PAGE.CANCEL_POLICY) {
			this.callerPage = INSURE_CALLER_PAGE.CANCEL_POLICY;
		} else if (e.detail.callerPage === INSURE_CALLER_PAGE.PAY_PREMIUM) {
			this.callerPage = INSURE_CALLER_PAGE.PAY_PREMIUM;
		} else if (e.detail.callerPage === INSURE_CALLER_PAGE.ESTIMATE) {
			this.callerPage = INSURE_CALLER_PAGE.ESTIMATE;
		} else if (e.detail.callerPage === INSURE_CALLER_PAGE.CLIENT_POLICIES) {
			this.callerPage = INSURE_CALLER_PAGE.CLIENT_POLICIES;
		}

		EMAIL_DOCUMENT_REQUEST_PAYLOAD.email = e.detail.emailId.detail.emailAddress;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.cifNumber = this.callerInformation.cifNumber;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.contractReference = isNullorEmpty(this.contractReference) ? e.detail?.contractRef : this.contractReference;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.title = this.callerInformation.title;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.firstName = this.callerInformation.firstName;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.surname = this.callerInformation.lastName;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.middleName = this.callerInformation?.middleName1;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.gender = getGenderFromIDNumber(this.callerInformation.southAfricanIDNumber);
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.contactDetails.cellphone = this.callerInformation?.verifiedTelephoneNumber;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.contactDetails.email = e.detail.emailId.detail.emailAddress;


		this._getAgreementAttachments(this.callerPage, EMAIL_DOCUMENT_REQUEST_PAYLOAD, e.detail.docContent);
		const emailResponse = await this.insureService.emailFuneralDocuments(EMAIL_DOCUMENT_REQUEST_PAYLOAD);

		if (!emailResponse.succeeded) {
			this.handleToastError(emailResponse.exception);
			return;
		}
		window.showToastTimed(`success`, `top`, `Success`, `Email document was sent`, 3000, true);

		if (this.callerPage === INSURE_CALLER_PAGE.CANCEL_POLICY || this.callerPage === INSURE_CALLER_PAGE.PAY_PREMIUM) {
			this._navigateToSubView(INSURE_RENDER_MODE.EMAIL_SUCCESS);
		} else {
			this.emailEstimateSuccess = true;
			this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES);
		}
	}

	/**
	 * Get the Arrears Payment Instruction document
	 * 
	 * @param {*} contractReference contractReference
	 * @param {*} payArrears payArrears
	 * @param {*} fromAccount fromAccount
	 * @param {*} saveToDocumentum saveToDocumentum
	 * @returns {null} null
	 */
	async _getArrearsPaymentDocument(contractReference, payArrears, fromAccount, saveToDocumentum) {
		const dob = new Date(this.callerInformation.birthdate);
		const arrearsPaymentInstructionDetails = {
			"documentFormat": `PDF`,
			"saveDocumentToDocumentum": saveToDocumentum,
			"returnDocumentContent": true,
			"emailDocumentToClient": false,
			"wetsignBarcode": false,
			"clientDetails": {
				"cifNumber": this.callerInformation.cifNumber, // 363291555
				"primarySavingsAccountNumber": this.accountDetails.savingsAccountData.accountNumber, // 1952898232
				"policyContractReference": contractReference, // "FP00001590"
				"firstName": this.callerInformation.firstName, // `DUBE`
				"surname": this.callerInformation.lastName, // `TDIL`
				"idNumber": this.callerInformation.southAfricanIDNumber, // "0011262112193"
				"dateOfBirth": dob.toISOString() // "2000-11-25T22:00:00.000Z"
			},
			"input": {
				"policyContractReference": contractReference,
				"payArrearsModel": {
					"contractReference": contractReference,
					"arrears": payArrears.arrears,
					"fromAccount": fromAccount,
					"cifNumber": this.callerInformation.cifNumber // 363291555
				}
			}
		};

		const resp = await this.insureService.arrearsPaymentInstruction(arrearsPaymentInstructionDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			this.arrearsPaymentDocumentDetails = resp.result;
		} else {
			this.handleToastError(resp.exception);
			return null;
		}

		this.requestUpdate();
	}

	/**
	 * Unload Policy Transactions
	 * @returns {void}
	 */
	_unloadPolicyTransactionHistory() {
		this.policyTransactionHistory = {};
	}

	/**
	 * Unload Audit Transactions
	 * @returns {void}
	 */
	_unloadAuditTransactionHistory() {
		this.auditTransactionHistory = {};
	}

	/**
	 * Unload Policy Transactions
	 * @returns {void}
	  */
	_unloadClientPolicies() {
		if (this.clientPolicies?.summaryDetails?.policies !== null) {
			this.clientPolicies.summaryDetails.policies.forEach(item => {
				item.isExpanded = false;
			});
		}
	}

	/*
	* Open insure product details on Capitec website
	*/
	async _productEnquiry() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}/insure/`);
	}

	// #endregion EVENT HANDLERS

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
			case INSURE_RENDER_MODE.ESTIMATE:
				return html`${this._renderCalculateEstimatePage()}`;
			case INSURE_RENDER_MODE.UPDATE_PLAN:
				return html`${this._renderUpdatePlanPage()}`;
			case INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY:
				return html`${this._renderPolicyTransactionHistoryPage()}`;
			case INSURE_RENDER_MODE.POLICY_SUMMARY:
				return html`${this._renderPolicySummaryPage()}`;
			case INSURE_RENDER_MODE.CANCEL_POLICY_SUCCESS:
				return html`${this._renderCancelPolicySuccessPage()}`;
			case INSURE_RENDER_MODE.EMAIL_SUCCESS:
				return html`${this._renderEmailSuccessPage()}`;
			case INSURE_RENDER_MODE.PAY_PREMIUM_SUCCESS:
				return html`${this._renderPayPremiumSuccessPage()}`;
			case INSURE_RENDER_MODE.UPDATE_PLAN_SUCCESS:
				return html`${this._renderUpdatePlanSuccessPage()}`;
			case INSURE_RENDER_MODE.SUCCESS_PAGE:
				return html`${this._renderSuccessPage()}`;
			case INSURE_RENDER_MODE.SMS_HISTORY:
				return html`${this._renderSMSHistory()}`;
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
		if (this.clientPolicies?.summaryDetails?.policies !== null && this.clientPolicies?.summaryDetails?.policies !== undefined) {
			this.clientPolicies.summaryDetails.policies.forEach(item => {
				item.isExpanded = false;
			});
		}

		return html`
			<horizon-insure-client-summary 
				.emailEstimateSuccess ="${this.emailEstimateSuccess}"
				.clientClaims="${this.claims}"
				.clientPolicies="${this.clientPolicies}"
				.cancelPolicyDocumentDetails="${this.cancelPolicyDocumentDetails}" 
				.accountDetails="${this.accountDetails}"
				.arrearsPaymentDocumentDetails="${this.arrearsPaymentDocumentDetails}"
				.getCancelPolicyDocument="${(contractReference, cancelReason, saveToDocumentum) => this._getCancelPolicyDocument(contractReference, cancelReason, saveToDocumentum)}"
				.getArrearsPaymentDocument="${(contractReference, payArrears, fromAccount, saveToDocumentum) => this._getArrearsPaymentDocument(contractReference, payArrears, fromAccount, saveToDocumentum)}"
				.maxAllowedCover="${isNullorEmpty(this.clientPolicies?.checkInsuranceDetails[0]?.maxAllowedCover) ? 100000 : this.clientPolicies?.checkInsuranceDetails[0]?.maxAllowedCover}"
				@product-enquiry="${() => this._productEnquiry()}"
				@pay-policy="${(e) => this._payPolicy(e)}"
				@cancel-policy="${(e) => this._cancelPolicy(e)}"
				@navigate-to-estimate="${() => this._goToPolicyEstimate()}"
				@navigate-to-update-plan="${(e) => this._goToUpdatePlan(e)}"
				@navigate-to-policy-summary="${(e) => this._goToPolicySummary(e)}"
				@navigate-to-claim-summary="${(e) => this._goToClaimSummary(e)}"
				@navigate-to-policy-transaction-history="${(e) => this._goToPolicyTransactionHistory(e)}"
				@navigate-to-sms-history="${(e) => this._goToSMSHistory(e)}"
				@send-email = "${(e) => this._sendEmail(e)}">
			</horizon-insure-client-summary>`;
	}

	/**
	 * Render Calculate estimate page
	 * @return {html} Html of the sub view
	 */
	_renderCalculateEstimatePage() {
		return html`
			<horizon-insure-policy-estimate 
				.estimate="${this.estimate}"
				.printEstimate="${(e) => this._printEstimate(e)}" 
				.productParams="${this.productParams}" 
				.mainLifeDefaultAge="${this._getMainLifeAge()}"
				.mainLifeDefaultGender="${this._getMainLifeGender()}"
				.maxAllowedCover="${isNullorEmpty(this.clientPolicies?.checkInsuranceDetails[0]?.maxAllowedCover) ? 100000 : this.clientPolicies?.checkInsuranceDetails[0]?.maxAllowedCover}"
				@calculate="${(e) => this._calculateClientEstimate(e)}"
				@send-email = "${(e) => this._sendEmail(e)}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-policy-estimate>`;
	}

	/**
	 * Render Update Plan page
	 * @return {html} Html of the sub view
	 */
	_renderUpdatePlanPage() {
		return html`
			<horizon-insure-update-plan 
				.maxAllowedCover="${this.clientPolicies.checkInsuranceDetails[0].maxAllowedCover}"
				.updatePlanQuote="${(policyToCalc) => this._updatePlanQuote(policyToCalc)}"
				.updatePlanPrepare="${(policyToUpdate) => this._updatePlanPrepare(policyToUpdate)}"
				.policyDetails="${this.policyDetails}" 
				.productParams="${this.productParams}"
				.initiateReinstatePolicy="${(policyToReinstate) => this._initiateReinstatePolicy(policyToReinstate)}"
				@accept-policy="${(policyToAccept) => this._acceptPolicy(policyToAccept)}"
				@updatePlanAccept="${(e) => this._updatePlanAccept(e)}"
				@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-update-plan>`;
	}

	/**
	 * Render Policy Details Plan
	 * @return {html} Html of the sub view
	 */
	_renderPolicySummaryPage() {
		return html`
			<horizon-insure-policy-summary 
				.policyDetails="${this.policyDetails}"
				@navigate-back="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				@navigate-to-update-plan="${(e) => this._goToUpdatePlan(e)}" 
				@unloading="${() => this._unloadClientPolicies()}">
			</horizon-insure-policy-summary>`;
	}

	/**
	 * Render Cancel Policy Success Page
	 * @return {html} Html of the sub view
	 */
	_renderCancelPolicySuccessPage() {
		return html`
			<horizon-insure-cancel-policy-success
				.contractReference = ${this.contractReference}
				@send-email = "${(e) => this._sendEmail(e)}" 
				@navigate-to-summary="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-cancel-policy-success>`;
	}

	/**
	 * Render Email Success Page
	 * @return {html} Html of the sub view
	 */
	_renderEmailSuccessPage() {
		return html`
			<horizon-insure-email-plan-success 
				.contractReference = ${this.contractReference}
				.confirmedEmail="${this.confirmedEmail}"
				@navigate-to-policy-summary="${(e) => this._goToPolicySummary(e)}"
				@navigate-back="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-email-plan-success>
		`;
	}

	/**
	 *  Render Pay Premium Success page
	 * @returns {html} Html of the sub view
	 */
	_renderPayPremiumSuccessPage() {
		return html`
			<horizon-insure-pay-premium-success-page 
				.amountToPay = "${this.amountToPay}" 
				.contractReference = "${this.contractReference}"
				@send-email= "${(e) => this._sendEmail(e)}"
				@navigate-to-policy-summary="${(e) => this._goToPolicySummary(e)}"
				@navigate-back="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-pay-premium-success-page>
		`;
	}

	/**
	 * Render Policy Transaction History Page
	 * @returns {html} Html of the sub view 
	 */
	_renderPolicyTransactionHistoryPage() {
		return html`
			<horizon-insure-policy-transaction-history
				.policyTransactionHistory="${this.policyTransactionHistory}"
				.getPolicyTransactionHistory="${(startDate, endDate, pageIndex) => this._getPolicyTransactionHistory(startDate, endDate, pageIndex)}"
				.disposeData="${() => this.policyTransactionHistory = []}"
				@navigate-back="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				@unloading="${() => this._unloadPolicyTransactionHistory()}">
			</horizon-insure-policy-transaction-history>`;
	}

	/**
	 * Renders the Communication/SMS history page
	 * 
	 * @returns {html} html
	 */
	_renderSMSHistory() {
		return html`
			<horizon-insure-sms-history-page
				.contractReference=${this.policyNumber} 
				.contactNumber=${this.callerInformation.verifiedTelephoneNumber}
				.commsHistory="${this.commsHistory}"
				.getCommsHistory="${(startDate, endDate) => this._retrieveCommsHistory(startDate, endDate)}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-sms-history-page>`;
	}

	/**
	 * Renders the Claim Summary page
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

	// TODO check if this is needed
	/**
	 * Render Update Plan Success page
	 * @return {html} Html of the sub view
	 */
	_renderUpdatePlanSuccessPage() {
		return html`
			<horizon-insure-update-plan-success 
				.policyDetails="${this.policyDetails}"
				@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-update-plan-success>`;
	}

	/**
	 * Render Success page for Update Plan / ReIssue
	 * @returns {html} Html of the sub view 
	 */
	_renderSuccessPage() {
		return html`
			<horizon-insure-success-page 
				.successMessage="${this.successMessage}" 
				.callerPage = "${this.callerPage}" 
				.contractReference = "${this.contractReference}"
				@send-email = "${(e) => this._sendEmail(e)}"
				@navigate-back="${(e) => this._rerenderClientSummary(e.detail.navigateBackTo)}">
			</horizon-insure-success-page>`;
	}

	/**
	 * Render Error toast 
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

	// #region RELEASE DELAYED

	/**
	 * Render Audit Transaction History Page
	 * @returns {html} Html of the sub view 
	 */
	// _renderAuditTransactionHistoryPage() {
	// return html`
	// <horizon-insure-audit-transaction-history 
	// @navigate-back="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
	// .auditTransactionHistory="${this.auditTransactionHistory}"
	// .getAuditTransactionHistory="${(startDate, endDate, pageIndex) => this._getAuditTransactionHistory(startDate, endDate, pageIndex)}"
	// .disposeData="${() => this.auditTransactionHistory = []}"
	// @unloading="${() => this._unloadAuditTransactionHistory()}">
	// </horizon-insure-audit-transaction-history>`;
	// }

	// #endregion RELEASE DELAYED
}
customElements.define(`horizon-existing-client`, ExistingClient);