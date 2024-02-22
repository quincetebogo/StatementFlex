import { DOCUMENT_TYPE, GLOBAL_ONE_GENERIC_DETAILS, INSURE_CALLER_PAGE, INSURE_TABS, TRANSACTION_STATUS } from 'app/constants/InsureCommon';
import { EMAIL_DOCUMENT_REQUEST_PAYLOAD, GENERATE_DOCUMENT_REQUEST_PAYLOAD } from 'app/utils/insureRequestPayload';
import { MAX_RESULTS, TRANSACTION_TYPE } from 'app/constants/InsureTransactionHistory';
import { css, html } from 'platform/elements';
import { getAgeFromIDNumber, getGenderFromIDNumber } from 'app/utils/insureUtils';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { Configuration } from 'platform/core';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonInsureStore } from 'app/store/HorizonInsureStore';
import { HorizonStore } from 'app/store/HorizonStore';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { InsureFuneralService } from '../../services/InsureFuneralService';
import { InsureLifeService } from 'app/services/InsureLifeService';
import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { LANDING_PAGE_NEEDS } from 'app/constants/Common';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RoleManager } from 'app/shell/RoleManager';
import { SavingsService } from 'app/services/SavingsService';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/insure/ClientSummary';
import 'app/components/insure/EmailPlanSuccess';
import 'app/components/insure/ClaimSummary';
import 'app/components/insure/funeral/FuneralSuccessPage';
import 'app/components/insure/funeral/FuneralPolicyEstimate';
import 'app/components/insure/funeral/FuneralUpdatePlan';
import 'app/components/insure/funeral/FuneralPolicySummary';
import 'app/components/insure/funeral/FuneralSMSHistory';
import 'app/components/insure/funeral/FuneralPolicyTransactionHistory';
import 'app/components/insure/funeral/FuneralPayPremiumSuccess';
import 'app/components/insure/funeral/FuneralCancelPolicySuccess';

import 'app/components/insure/life/LifeSuccess';
import 'app/components/insure/life/LifePocketSummary';
import 'app/components/insure/life/LifePolicySummary';
import 'app/components/insure/life/LifePremiumHistory';
import 'app/components/insure/life/LifeSMSHistory';

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

		this.insureFuneralService = new InsureFuneralService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.insureLifeService = new InsureLifeService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.savingsAccountService = new SavingsService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.configuration = Configuration.getInstance();
		this.roleManager = RoleManager.getInstance();
		this.horizonStore = HorizonStore.getInstance();

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), () => true);

		this.productParams = {};
		this.insuranceClaims = [];
		this.successPageMessage = ``;
		this.readOnly = false;
		this.selectedInsureTabIndex = 0;

		this.selectedFuneralPolicyContractReference = ``;
		this.selectedFuneralPolicyProductCode = ``;
		this.selectedFuneralPolicyDetails = {};
		this.funeralEstimateDetails = {};
		this.funeralPolicyTransactionHistory = {};
		this.funeralIssuePlanAgreementDocument = {};
		this.funeralUpdatePlanAgreementDocument = {};
		this.funeralShowEstimateSuccessToast = false;

		this.selectedLifePocketType = ``;
		this.selectedLifePolicy = ``;
		this.lifeSuccessPageMessages = {};
		this.emailEstimateSuccess = false;
		this.defaultSavingsAccountNumber = ``;
		this.defaultSavingsAccountAvailableBalance = 0;
		this.lifePremiumHistory = {};
		this.lifeDocsToEmail = {};
		// this.auditTransactionHistory = {};

		this.showInsureSuccessToast = false;
		this.isLifeQualifyingClient = false;
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
	 * @property {String} selectedFuneralPolicyProductCode Product code of selected policy
	 * @property {Object} funeralPolicies Contains all funeral policies for a client
	 * @property {Object} funeralEstimateDetails Local object for new Estimate requests
	 * @property {String} funeralIssuePlanAgreementDocument stores issue plan agreement document object.
	 * @property {Object} funeralUpdatePlanAgreementDocument stores update Plan Agreement Document object
	 * @property {String} funeralCancellationReason contains the cancellation reason selected
	 * @property {Object} funeralCancelAgreementDocument contains the cancel policy document details
	 * @property {Object} funeralArrearsAgreementDocument contains the arrears payment document details
	 * @property {Boolean} funeralShowEstimateSuccessToast determine whether to show a success alert for estimate email
	 * @property {Object} funeralPolicyArrears contains client arrears and payable accounts for funeral policy
	 * @property {Object} lifePolicies contains clients life policies
	 * @property {Object} lifeCancelAgreementDocument contains the cancel policy document details
	 * @property {Object} lifeDocsToEmail contains Life Document details to email
	 * @property {Object} lifeUpdateBankingDetailsAgreement contains the update banking details document details
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
			selectedFuneralPolicyProductCode: { type: String, state: true },
			funeralPolicies: { type: Object, state: true },
			lifePolicies: { type: Object, state: true },
			funeralEstimateDetails: { type: Object, state: true },
			funeralIssuePlanAgreementDocument: { type: Object, state: true },
			funeralUpdatePlanAgreementDocument: { type: Object, state: true },
			funeralCancellationReason: { type: String, state: true },
			funeralCancelAgreementDocument: { type: Object, state: true },
			funeralArrearsAgreementDocument: { type: Object, state: true },
			funeralShowEstimateSuccessToast: { type: Boolean, state: true },
			funeralPolicyArrears: { type: Object, state: true },
			selectedInsureTabIndex: { type: Number, state: true },
			lifeCancelAgreementDocument: { type: Object, state: true },
			lifeSuccessPageMessages: { type: Object, state: true },
			arrearsPaymentDocumentDetails: { type: Object, state: true },
			confirmedEmail: { type: Object, state: true },
			renderMode: { type: Number },
			claims: { type: Object, state: true },
			emailEstimateSuccess: { type: Boolean, state: true },
			clientArrears: { type: Object, state: true },
			defaultSavingsAccountNumber: { type: String, state: true },
			defaultSavingsAccountAvailableBalance: { type: String, state: true },
			showInsureSuccessToast: { type: Boolean, state: true },
			lifePolicyArrears: { type: Object, state: true },
			lifeDocsToEmail: { type: Object, state: true },
			lifeUpdateBankingDetailsAgreement: { type: Object, state: true },
			isLifeQualifyingClient: { type: Boolean, state: true }
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
	 * 3. Fetch client Life policies
	 * 
	 * @returns {void}
	 */
	async _initialise() {
		this.funeralPolicies = await this._retrieveClientFuneralPolicies();
		this.insuranceClaims = await this._retrieveClientClaims();
		const lifeQualify = await this._clientQualifiesLife();
		if (lifeQualify === true) {
			this.lifePolicies = await this._retrieveClientLifePolicies();
			super.setInsureIncident(LANDING_PAGE_NEEDS.INSURE);
		}
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
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.clientDetails.productCode = this.selectedFuneralPolicyProductCode;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.contractReference = this.selectedFuneralPolicyContractReference;

		const issuePlanAgreementResponse = await this.insureFuneralService.generateIssueFuneralCoverPlanAgreement(GENERATE_DOCUMENT_REQUEST_PAYLOAD);

		if (!issuePlanAgreementResponse.succeeded) {
			super.isOnlyProductEnquiry = false;
			this.handleToastError(issuePlanAgreementResponse.exception);
			this.funeralIssuePlanAgreementDocument = null;
			return;
		}
		super.isOnlyProductEnquiry = false;
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
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.clientDetails.productCode = this.selectedFuneralPolicyProductCode;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.contractReference = this.selectedFuneralPolicyContractReference;

		const updatePlanAgreementResponse = await this.insureFuneralService.generateUpdateFuneralCoverPlanAgreement(GENERATE_DOCUMENT_REQUEST_PAYLOAD);

		if (!updatePlanAgreementResponse.succeeded) {
			super.isOnlyProductEnquiry = false;
			this.handleToastError(updatePlanAgreementResponse.exception);
			this.funeralUpdatePlanAgreementDocument = null;
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
	 * @param {string} productCode productCode
	 * @returns {void} 
	 */
	async _generateDocumentsFuneralArrears(contractReference, payArrears, fromAccount, saveToDocumentum, productCode) {
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
				"dateOfBirth": dob.toISOString(),
				"productCode": productCode
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

		const resp = await this.insureFuneralService.arrearsPaymentInstruction(arrearsPaymentInstructionDetails, () => true);
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
	 * @param {string} productCode productCode
	 * @returns {void}  
	 */
	async _generateDocumentsFuneralCancel(contractReference, cancelReason, saveToDocumentum, productCode) {
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
				"dateOfBirth": dob.toISOString(),
				"productCode": productCode
			},
			"input": {
				"cancellationReason": cancelReason
			}
		};

		const resp = await this.insureFuneralService.cancelPolicyAgreement(cancelPolicyAgreementDetails, () => true);
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
	 * Cancel Life Policy Agreement
	 * @param {String} contractReference contractReference
	 * @param {string} cancelReason cancelReason
	 * @param {boolean} saveToDocumentum saveToDocumentum
	 * @returns {void}  
	 */
	async _generateDocumentsLifeCancel(contractReference, cancelReason, saveToDocumentum) {
		const lifeCancelPolicyAgreementDetails = {
			"saveDocument": saveToDocumentum,
			"documentOptions": {
				"stamp": `Default`,
				"barcode": `Default`,
				"watermark": `Copy`,
				"channel": `Horizon`,
				"contentType": `Pdf`
			},
			"metadata": {
				"deviceId": null,
				"signatureType": ``,
				"branchName": ``,
				"branchNumber": ``,
				"documentDate": new Date().toISOString(),
				"language": ``,
				"productId": `12601`
			},
			"voiceReferenceNumber": this.incomingCallDetails.voiceReferenceNumber,
			"cifNumber": this.callerInformation.cifNumber,
			"policyNumber": contractReference,
			"acceptanceDate": new Date().toISOString(),
			"signatureDate": new Date().toISOString(),
			"emailAddress": this.callerInformation?.emailId,
			"cancellationReason": cancelReason
		};


		const resp = await this.insureLifeService.lifeCancelPolicyAgreement(lifeCancelPolicyAgreementDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			this.lifeCancelAgreementDocument = resp.result;
			this.lifeDocsToEmail = resp.result;
		} else {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(resp.exception);
			return;
		}

		this.requestUpdate();
	}

	/**
	 * Update Banking Details Agreement
	 * @param {String} policy policy being updated
	 * @param {boolean} saveToDocumentum saveToDocumentum
	 * @returns {void}  
	 */
	async _generateDocumentsLifeUpdateBankingDetails(policy, saveToDocumentum) {
		const lifeBankingDetailsAgreement = {
			"saveDocument": saveToDocumentum,
			"documentOptions": {
				"stamp": `Default`,
				"barcode": `Default`,
				"watermark": `Copy`,
				"channel": `Horizon`,
				"contentType": `Pdf`
			},
			"metadata": {
				"deviceId": null,
				"signatureType": ``,
				"branchName": ``,
				"branchNumber": ``,
				"documentDate": new Date().toISOString(),
				"language": ``,
				"productId": `12601`
			},
			"voiceReferenceNumber": this.incomingCallDetails.voiceReferenceNumber,
			"cifNumber": this.callerInformation.cifNumber,
			"policyNumber": policy.contractReference,
			"acceptanceDate": new Date().toISOString(),
			"signatureDate": new Date().toISOString(),
			"emailAddress": this.callerInformation?.emailId
		};


		// Fix this
		const resp = await this.insureLifeService.lifeUpdateAgreement(lifeBankingDetailsAgreement, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			this.lifeUpdateBankingDetailsAgreement = resp.result;
			this.lifeDocsToEmail = resp.result;
		} else {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(resp.exception);
			return;
		}

		this.requestUpdate();
	}

	/**
	 * Pay Life Policy Arrears Agreement
	 * @param {String} contractReference contractReference
	 * @param {string} accountSelected accountSelected
	 * @param {Object} selectedArrears selectedArrears
	 * @param {boolean} saveToDocumentum saveToDocumentum
	 * @returns {Object} resp
	 */
	async _generateDocumentsLifePayArrears(contractReference, accountSelected, selectedArrears, saveToDocumentum) {
		const generateDocumentRequest = {
			"saveDocument": saveToDocumentum,
			"documentOptions": {
				"stamp": `Default`,
				"barcode": `Default`,
				"watermark": `Copy`,
				"channel": `Horizon`,
				"contentType": `Pdf`
			},
			"metadata": {
				"deviceId": null,
				"signatureType": ``,
				"branchName": ``,
				"branchNumber": ``,
				"documentDate": new Date().toISOString(),
				"language": ``,
				"productId": `12601`
			},
			"voiceReferenceNumber": this.incomingCallDetails.voiceReferenceNumber,
			"payArrears": {
				"policyNumber": contractReference,
				"arrears": selectedArrears,
				"cifNumber": this.callerInformation.cifNumber,
				"policyNumber": contractReference,
				"paidWithClaims": false,
				"fromAccount": accountSelected
			}
		};

		const resp = await this.insureLifeService.lifePayArrearsAgreement(generateDocumentRequest, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			this.lifeDocsToEmail = resp.result;
			return resp;
		}
		this.handleToastError(resp.exception);
		return null;
	}

	/**
	 * Cancel Life Policy 
	 * @param {event} e e
	 * @returns {void}  
	 */
	async _cancelLifePolicy(e) {
		this.selectedLifePolicy = e.detail.contractReference;
		const lifeCancelPayload =
		{
			"cancellationReason": e.detail.cancellationReason,
			"policyNumber": e.detail.contractReference,
			"documents": [
				{
					"documentCode": e.detail.documentDetails.documentDetails.documentCode,
					"documentName": e.detail.documentDetails.documentDetails.documentName,
					"guid": e.detail.documentDetails.documentDetails.guid
				}
			]
		};

		const resp = await this.insureLifeService.lifeCancelPolicy(lifeCancelPayload, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			// this.lifeCancelAgreementDocument = resp.result;
			this._generateDocumentsLifeCancel(e.detail.contractReference, e.detail.cancellationReason, true);
			const lifeEmailSuccess = await this._sendLifeEmail(e);
			this.lifeSuccessPageMessages = this._buildLifeSuccessMessage(lifeEmailSuccess, INSURE_CALLER_PAGE.LIFE_CANCEL_POLICY_DIALOG, e.detail.emailAddress, e.detail.contractReference);
			this.clientConfirmedEmail = e.detail.emailAddress;
			this._goToLifeSuccess(e);
		} else {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(resp.exception);
			return;
		}

		this.requestUpdate();

	}

	/**
	 * Life Update banking details 
	 * @param {event} e e
	 * @returns {void}
	 */
	async _updateBankingDetailsLifePolicy(e) {
		const lifeUpdateBankingDetailsPayload = {
			"cifNumber": this.callerInformation.cifNumber,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"policyNumber": e.detail.policy.contractReference,
			"currentBankName": e.detail.policy.bankDetails.bank,
			"newBankName": e.detail.updatedPolicy.bankDetails.bank,
			"currentAccountNumber": e.detail.policy.bankDetails.accountNumber,
			"newAccountNumber": e.detail.updatedPolicy.bankDetails.accountNumber,
			"currentBranchCode": e.detail.policy.bankDetails.branchCode,
			"newBranchCode": e.detail.updatedPolicy.bankDetails.branchCode,
			"currentAccountType": e.detail.policy.bankDetails.accountType,
			"newAccountType": e.detail.updatedPolicy.bankDetails.accountType,
			"collectionDay": e.detail.updatedPolicy.bankDetails.collectionDay
		};

		const resp = await this.insureLifeService.lifeUpdateBankingDetails(lifeUpdateBankingDetailsPayload, () => true);
		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return;
		}
		const lifeEmailSuccess = await this._sendLifeEmail(e);
		this.lifeSuccessPageMessages = this._buildLifeSuccessMessage(lifeEmailSuccess, INSURE_CALLER_PAGE.LIFE_UPDATE_POLICY_DIALOG, e.detail.email, resp.result.policyNumber);
		this.clientConfirmedEmail = e.detail.email;
		this._goToLifeSuccess();
	}

	/** 
	 * Life build success message
	 * @param {Boolean} lifeEmailSuccess lifeEmailSuccess
	 * @param {Number} callerPage callerPage
	 * @param {String} emailAddress emailAddress
	 * @param {String} contractRef contractRef
	 * @returns {Object} successPageMessage 
	 */
	_buildLifeSuccessMessage(lifeEmailSuccess, callerPage, emailAddress, contractRef) {
		const successPageMessage = {};
		successPageMessage.actionSuccessLabel = ``;
		successPageMessage.emailMessage = ``;
		successPageMessage.emailSuccess = lifeEmailSuccess;


		if (callerPage === INSURE_CALLER_PAGE.LIFE_CANCEL_POLICY_DIALOG) {
			successPageMessage.actionSuccessLabel = `The policy has been cancelled`;
			if (lifeEmailSuccess) {
				successPageMessage.emailMessage = `Your cancellation documentation for policy number <b>${contractRef}</b> has been emailed to <b>${emailAddress}</b>`;
			} else if (!lifeEmailSuccess && isNullorEmpty(emailAddress)) {
				successPageMessage.emailMessage = ``;
			} else {
				successPageMessage.emailMessage = `Your cancellation documentation for policy number <b>${contractRef}</b> has failed to email to <b>${emailAddress}</b>`;
			}
		} else if (callerPage === INSURE_CALLER_PAGE.LIFE_UPDATE_POLICY_DIALOG) {
			successPageMessage.actionSuccessLabel = `The policy has been updated`;
			if (lifeEmailSuccess) {
				successPageMessage.emailMessage = `Your documentation for policy number <b>${contractRef}</b> has been emailed to <b>${emailAddress}</b>`;
			} else {
				successPageMessage.emailMessage = `Your documentation for policy number <b>${contractRef}</b> has failed to email to <b>${emailAddress}</b>`;
			}
		}

		return successPageMessage;
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
		} else {
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

		const resp = await this.insureFuneralService.clientSummary(request);
		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return;
		}
		return resp.result;
	}

	/**
	 * Check if client qualifies for Life product
	 * @returns {Object} Client Life policies 
	 */
	async _clientQualifiesLife() {
		const request = {
			cifNumber: this.callerInformation.cifNumber
		};

		const resp = await this.insureLifeService.lifeClientQualify(request);
		if (!resp.succeeded) {
			this.isLifeQualifyingClient = false;
		} else {
			this.isLifeQualifyingClient = resp.result.qualify;
		}

		return this.isLifeQualifyingClient;
	}

	/**
	 * Retrieve client summary containing all Life policies
	 * @returns {Object} Client Life policies 
	 */
	async _retrieveClientLifePolicies() {
		const request = {
			cifNumber: this.callerInformation.cifNumber
		};

		const respSummary = await this.insureLifeService.lifeClientSummary(request);
		if (!respSummary.succeeded) {
			this.handleToastError(respSummary.exception);
			return;
		}
		return respSummary.result;
	}

	// Attempt to get global one savings account number to pre populate, if fails, continue
	async _getSavingsAccountDetails() {
		const landingRequest = {
			cifNumber: this.callerInformation.cifNumber,
			nationalIDNumber: this.callerInformation.southAfricanIDNumber,
			getGenericData: true
		};

		const returnValue = await this.savingsAccountService.savingsAccountLanding(landingRequest.cifNumber, landingRequest.nationalIDNumber, landingRequest.getGenericData);

		if (!isNullorEmpty(returnValue?.result?.accountNumber) && !isNullorEmpty(returnValue?.result?.accountNumber)) {
			this.defaultSavingsAccountNumber = returnValue?.result?.accountNumber;
			this.defaultSavingsAccountAvailableBalance = returnValue?.result?.accountAvailableBalance;
		}
	}

	/**
	 * Retrieve Funeral Policy Summary via insure channel service
	 * @param {string} contractReference contractReference
	 * @param {string} cifNumber cifNumber
	 * @param {string} idNumber idNumber
	 * @param {string} productCode productCode of selected policy
	 * @returns {Object} Policy Summary Details 
	 */
	async _retrieveFuneralPolicySummary(contractReference, cifNumber, idNumber, productCode) {
		const request = {
			contractReference: contractReference,
			cifNumber: cifNumber,
			idNumber: idNumber,
			productCode: productCode
		};
		const resp = await this.insureFuneralService.policySummary(request);
		if (!resp.succeeded) {
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
		const claimsList = await this.insureFuneralService.viewExistingClaims(request);
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
			cifNumber: cifNumber,
			productCode: this.selectedFuneralPolicyProductCode
		};
		const resp = await this.insureFuneralService.policyReissue(request);
		if (!resp.succeeded) {
			super.isOnlyProductEnquiry = false;
			this.handleToastError(resp.exception);
			return;
		}
		super.isOnlyProductEnquiry = false;
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
		const resp = await this.insureFuneralService.calculateEstimate(estimateWithCoverDetails, () => true);
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
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.clientDetails.productCode = this.funeralPolicies.checkInsuranceDetails[0].productCode;
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.input = this.funeralEstimateDetails;

		const result = await this.insureFuneralService.generateEstimatePrintoutDocument(GENERATE_DOCUMENT_REQUEST_PAYLOAD);
		if (!result.succeeded) {
			super.isOnlyProductEnquiry = false;
			this.handleToastError(result.exception);
			return;
		}
		super.isOnlyProductEnquiry = false;
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

		const calculateQuoteResp = await this.insureFuneralService.calculateQuote(quoteCalcRequest);
		if (!calculateQuoteResp.succeeded) {
			super.isOnlyProductEnquiry = false;
			this.handleToastError(calculateQuoteResp.exception);
			return;
		}
		super.isOnlyProductEnquiry = false;
		// Map back to array
		const calculatedQuote = calculateQuoteResp.result;
		const adjustedRoleplayers = calculatedQuote.lifesAssured.map((life) => {
			const foundPlayer = policyToCalc.roleplayers.find((ele) => ele.rowID === life.rowID);
			life.coverDetails = foundPlayer.coverDetails;
			life.benefitPayout = foundPlayer.benefitPayout;
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
			"lifesAssured": policyToUpdate.roleplayers.filter(ele => ele.lifeAssured === true),
			"productCode": this.selectedFuneralPolicyProductCode
		};
		const calculateQuoteResp = await this.insureFuneralService.calculateQuote(quoteCalcRequest);
		if (!calculateQuoteResp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(calculateQuoteResp.exception);
			return;
		}

		const prepareUpdateRequest = {
			"contractReference": policyToUpdate.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"quoteNumber": policyToUpdate.quoteNumber,
			"beneficiaries": policyToUpdate.roleplayers.filter(ele => ele.beneficiary === true),
			"collectionDetails": policyToUpdate.deductionDetails,
			"productCode": this.selectedFuneralPolicyProductCode
		};

		const prepareUpdateResp = await this.insureFuneralService.prepareUpdate(prepareUpdateRequest);
		if (!prepareUpdateResp.succeeded) {
			super.isOnlyProductEnquiry = false;
			this.handleToastError(prepareUpdateResp.exception);
			return;
		}
		super.isOnlyProductEnquiry = false;
		this.contractReference = prepareUpdateResp.result.contractReference;

		await this._generateDocumentsFuneralUpdatePlan(false);
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
			"productCode": this.selectedFuneralPolicyProductCode,
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
		console.log(`1.1 - `, acceptPlanRequest);
		const acceptPlanResp = await this.insureFuneralService.policyAccept(acceptPlanRequest);
		console.log(`1.2 - `, acceptPlanResp);
		if (!acceptPlanResp.succeeded) {
			console.log(`1.3 - `, acceptPlanResp.exception);
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(acceptPlanResp.exception);
			return;
		}

		await this._generateDocumentsFuneralUpdatePlan(true);
		this.successPageMessage = `The policy has been successfully updated`;
		this.callerPage = INSURE_CALLER_PAGE.UPDATE_PLAN;
		this.selectedFuneralPolicyContractReference = event.detail.prepareUpdate.prepareUpdateResponse.contractReference;
		console.log(`1.4 - `, this.selectedFuneralPolicyContractReference);
		this.renderMode = INSURE_RENDER_MODE.SUCCESS_PAGE;
		console.log(`1.5 - `, this.renderMode);
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
			"productCode": this.selectedFuneralPolicyProductCode,
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

		const createPolicyResponse = await this.insureFuneralService.createPolicy(createPolicyRequest);
		if (!createPolicyResponse.succeeded) {
			this.handleToastError(createPolicyResponse.exception);
			return;
		}
		this.selectedFuneralPolicyContractReference = createPolicyResponse.result.contractReference;
		super.isOnlyProductEnquiry = false;
		this.contractReference = createPolicyResponse.result.contractReference;

		await this._generateDocumentsFuneralReissue(false);
		const resinstatePolicyResponse = {
			issuePlanAgreement: this.funeralIssuePlanAgreementDocument,
			policyResponse: createPolicyResponse.result
		};
		return resinstatePolicyResponse;
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS 


	/*
	* Navigate so specific subview
	* @param {String} newMode New render mode string to change renderMode to
	* @returns {void} void
	 */
	_navigateToSubView(newMode) {
		if (this.renderMode !== INSURE_RENDER_MODE.ESTIMATE && this.renderMode !== INSURE_RENDER_MODE.CLIENT_POLICIES) {
			this.emailEstimateSuccess = false;
		}
		this.renderMode = newMode;
	}

	/**
	 * Prepare and navigate Estimate
	 * @returns {void} 
	 */
	_goToPolicyEstimate() {
		this.contractReference = ``;
		super.setInsureIncident(`funeral-plan-calculate-estimate`);
		this._navigateToSubView(INSURE_RENDER_MODE.ESTIMATE);
	}

	/**
	 * Accept Policy Reinstate
	 * @param {object} event - request payload for Accept Policy
	 * @returns {void}
	 */
	async _acceptPolicy(event) {
		let documents = [];
		if (event.detail.newContractRef.substring(0, 2) === `CF`) {
			documents = [event.detail.policyResponse.issuePlanAgreement.documentDetails];
		} else {
			documents = [event.detail.policyResponse.issuePlanAgreement.documentDetails];
		}

		console.log(`1.0 - `, documents);

		const acceptPlanRequest =
		{
			"cifNumber": this.callerInformation.cifNumber,
			"contractReference": event.detail.policyResponse.policyResponse.contractReference,
			"documents": documents,
			"mandates": event.detail.policyResponse.policyResponse.mandates
		};
		console.log(`1.1 - `, acceptPlanRequest);

		const acceptPlanResp = await this.insureFuneralService.policyAccept(acceptPlanRequest);
		console.log(`1.2 - `, acceptPlanResp);
		if (!acceptPlanResp.succeeded) {
			console.log(`1.3 - `, acceptPlanResp.exception);
			this.handleToastError(acceptPlanResp.exception);
			return;
		}

		this.contractReference = event.detail.policyResponse.policyResponse.contractReference;
		console.log(`1.3 - `, this.contractReference);
		await this._generateDocumentsFuneralReissue(true);
		console.log(`1.4 - After documents for ReIssue`);

		this.successPageMessage = `The policy ${event.detail.policyResponse.policyResponse.contractReference} has been successfully reissued`;
		this.callerPage = INSURE_CALLER_PAGE.REINSTATE_POLICY;
		this.contractReference = event.detail.policyResponse.policyResponse.contractReference;
		console.log(`1.5`, this.contractReference);
		this.renderMode = INSURE_RENDER_MODE.SUCCESS_PAGE;
		console.log(`1.5`, this.renderMode);
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

		const resp = await this.insureFuneralService.cancelPolicy(cancelPolicyDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			this._generateDocumentsFuneralCancel(e.detail.contractReference, e.detail.cancellationReason, true);
			this._goToFuneralCancelPolicySuccess(e);

		} else {
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
			"fromAccount": e.detail.fromAccount,
			"productCode": e.detail.productCode
		};

		const resp = await this.insureFuneralService.payPolicy(payArrears, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			this.selectedFuneralPolicyContractReference = e.detail.payArrears.contractReference;
			const sumArrears = e.detail.payArrears.arrears?.reduce((accumulator, object) => accumulator + (object.amount ?? 0), 0);
			this.amountToPay = sumArrears;

			this._generateDocumentsFuneralArrears(this.selectedFuneralPolicyContractReference, e.detail.payArrears, e.detail.fromAccount, true);
			this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_PAY_PREMIUM_SUCCESS);
		} else {
			this.handleToastError(resp.exception);
			return null;
		}
	}

	/**
	 * Pay arrears for active life policy
	 * @param {string} contractReference contractReference
	 * @param {string} accountNumber accountNumber
	 * @param {string} selectedArrears selectedArrears
	 * @returns {object} resp
	 */
	async _payArrearsLife(contractReference, accountNumber, selectedArrears) {
		const payArrears = {
			"cifNumber": this.callerInformation.cifNumber,
			"policyNumber": contractReference,
			"bankDetails": {
				"accountName": GLOBAL_ONE_GENERIC_DETAILS.ACCOUNT_NAME,
				"branchCode": GLOBAL_ONE_GENERIC_DETAILS.BRANCH_CODE,
				"accountNumber": this.defaultSavingsAccountNumber,
				"bank": GLOBAL_ONE_GENERIC_DETAILS.BANK,
				"accountType": GLOBAL_ONE_GENERIC_DETAILS.ACCOUNT_TYPE,
				"effectiveDate": null
			},
			"arrears": selectedArrears
		};

		const resp = await this.insureLifeService.lifePayArrears(payArrears, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			return resp;
		}
		this.handleToastError(resp.exception);
		return null;
	}

	/** Email and navigate after success  
	 * @param {string} contractReference contractReference of policy
	 * @param {string} totalPaid total arrears settled
	 * @param {string} email email to send agreement too
	 * @param {string} agreementResult result from CDS call
	 * @returns {void}
	*/
	_payArrearsLifeEmail(contractReference, totalPaid, email, agreementResult) {

		const e = {
			detail: {
				emailAddress: email,
				contractReference: contractReference
			}
		};
		const emailSent = this._sendLifeEmail(e);

		this.lifeSuccessPageMessages = {
			emailSuccess: emailSent,
			actionSuccessLabel: `Life Cover arrears was successfully paid`,
			emailMessage: `Your life cover policy of <b>${contractReference}</b> arrears was settled with <b>${totalPaid}</b>`
		};
		this.selectedInsureTabIndex = INSURE_TABS.LIFE;
		this._navigateToSubView(INSURE_RENDER_MODE.LIFE_SUCCESS);
	}

	async _healthQuestionnaire() {
		const resp = await this.insureLifeService.lifeHealthQuestionnaire();
		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return;
		}
		return resp.result;
	}

	async _lifeAllowedCover(allowedCoverRequest) {
		allowedCoverRequest.clientDateOfBirth = this.callerInformation.birthdate;
		allowedCoverRequest.clientGender = getGenderFromIDNumber(this.callerInformation.southAfricanIDNumber).substring(0, 1);
		allowedCoverRequest.clientIdNumber = this.callerInformation.southAfricanIDNumber;

		const resp = await this.insureLifeService.lifeAllowedCover(allowedCoverRequest);
		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return;
		}
		return resp.result;
	}

	_lifeUpdatePolicy(updatePolicyRequest) {
		this.lifeSuccessPageMessages = this._buildLifeSuccessMessage(true, INSURE_CALLER_PAGE.LIFE_UPDATE_POLICY_DIALOG, updatePolicyRequest.emailDetails.emailAddress, updatePolicyRequest.emailDetails.contractReference);
		this.clientConfirmedEmail = updatePolicyRequest.emailDetails.emailAddress;
		this._goToLifeSuccess();
	}

	/**
	 * gets the life policy arrears
	 * 
	 * @param {object} selectedPolicy the selected policy
	 * @returns {void}
	 */
	async _retrieveLifePolicyArrears(selectedPolicy) {
		const arrearsRequest =
		{
			"contractReference": selectedPolicy.contractReference
		};

		const resp = await this.insureLifeService.lifeGetArrears(arrearsRequest);
		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return;
		}

		await this._getSavingsAccountDetails();

		this.lifePolicyArrears = resp.result;
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

		const arrearsResp = await this.insureFuneralService.Arrears(arrearsRequest);
		if (!arrearsResp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(acceptPlanResp.exception);
			return;
		}
		this.funeralPolicyArrears = arrearsResp?.result;
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
			"toDate": toDate,
			"productCode": this.selectedFuneralPolicyProductCode
		};

		const resp = await this.insureFuneralService.communicationHistory(smsHistoryDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			super.isOnlyProductEnquiry = false;
			return resp.result;
		}
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
			},
			productCode: this.selectedFuneralPolicyProductCode
		};

		this.transactions = [];

		this.funeralPolicyTransactionHistory = {
			contractReference: this.selectedFuneralPolicyContractReference,
			bankName: this.bankName,
			accountNumber: this.accountNumber,
			arrearsAmount: this.arrearsAmount
		};

		const returnValue = await this.insureFuneralService.policyPremiumHistory(transactionHistoryRequest);
		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactions.
				filter((ele) => ele.premiumType === `PremiumCollection` || ele.premiumType === `Disbursement` || ele.premiumType === `Submit` || ele.premiumType === `AdHocReceipt` || ele.premiumType === `DebitOrderReceipt`).map((item) => {
					const formatedDate = new Date(Date.parse(item.date));
					item.premiumType = TRANSACTION_TYPE[item.premiumType?.toUpperCase()];
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

	/**
	 * Fetch Policy Premium History
	 * 
	 * @returns {null} null
	 */
	async _retrieveLifePolicyPremiumHistory() {
		const PremiumHistoryRequest = {
			policyNumber: this.selectedLifePolicy.contractReference
		};

		let totalArrears = 0;
		this.selectedLifePolicy?.arrears?.forEach(arrears => {
			totalArrears += parseFloat(arrears.arrearsPaymentDueAmount, 10);
		});

		this.lifePremiumHistory = {
			contractReference: this.selectedLifePolicy.contractReference,
			bankName: this.selectedLifePolicy.bankDetails.bank,
			accountNumber: this.selectedLifePolicy.bankDetails.accountNumber,
			arrearsAmount: formatCurrency(totalArrears),
			transactions: []
		};
		const returnValue = await this.insureLifeService.lifePremiumHistory(PremiumHistoryRequest);
		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactionHistory.
				filter((ele) => ele.eventTransactionType === `Premium collection` || ele.eventTransactionType === `Refund` || ele.eventTransactionType === `Pay-out` || ele.eventTransactionType === `Ad-hoc`).map((item) => {
					const formatedDate = new Date(Date.parse(item.eventDate));
					item.formatedDate = formatedDate;
					item.groupByDate = `${getMonthName(formatedDate.getMonth())} ${formatedDate.getFullYear()}`;
					item.eventAmount = formatCurrency(item.eventAmount);
					item.eventPaidAmount = formatCurrency(item.eventPaidAmount);
					return item;
				});

			this.lifePremiumHistory.transactions.push(...formattedTrans);
			this.renderMode = INSURE_RENDER_MODE.LIFE_POLICY_PREMIUM_HISTORY;
		} else {
			this.handleToastError(returnValue.exception);
		}
	}

	/**
	 * Fetch Life policy SMS history
	 * @returns {void} void
	 */
	async _retrieveLifeSMSHistory() {
		const smsHistoryDetails = {
			"policyNumber": this.selectedLifePolicy.contractReference
		};

		const resp = await this.insureLifeService.lifeSMSHistory(smsHistoryDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			super.isOnlyProductEnquiry = false;
			return resp.result;
		}
		this.handleToastError(resp.exception);
		return null;
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
		this.claimSummary = e.detail.claim;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		this._navigateToSubView(INSURE_RENDER_MODE.CLAIM_SUMMARY);
	}

	/**
	 * Navigate to Funeral Estimate screen
	 * @param {event} e e
	 * @returns {void} 
	 */
	_goToFuneralPolicyEstimate(e) {
		this.selectedFuneralPolicyContractReference = ``;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		super.setInsureIncident(`funeral-plan-calculate-estimate`);
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
		this.selectedFuneralPolicyProductCode = e.detail.productCode;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		super.setInsureIncident(`funeral-sms-history`);
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_SMS_HISTORY);
	}

	/**
	 * Prepare and navigate Cancel Policy Success
	 * @param {event} e e
	 * @returns {void} 
	 */
	_goToFuneralCancelPolicySuccess(e) {
		this.selectedFuneralPolicyContractReference = e.detail.contractReference;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_CANCEL_POLICY_SUCCESS);
	}

	/**
	 * Prepare and navigate Cancel Policy Success
	 * @param {event} e e
	 * @returns {void} 
	 */
	_goToLifeSuccess(e) {
		this.selectedInsureTabIndex = INSURE_TABS.LIFE;
		this._navigateToSubView(INSURE_RENDER_MODE.LIFE_SUCCESS);
	}

	/**
	 * Prepare and navigate Funeral Update plan
	 * @param {event} e e
	 * @returns {void}
	 */
	async _goToFuneralUpdatePlan(e) {
		this.selectedFuneralPolicyProductCode = e.detail.productCode;
		this.selectedFuneralPolicyContractReference = e.detail.policyContractReference;

		if (e.detail.canReinstate) {
			const calcResponse = await this._reissueFuneralPolicyQuote(e.detail.policyContractReference, this.callerInformation.cifNumber);
			const policyResponse = await this._retrieveFuneralPolicySummary(e.detail.policyContractReference, this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);
			super.setInsureIncident(`funeral-plan-reissue`);
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
			super.setInsureIncident(`funeral-plan-update-lives`);
			const indexOfMainLife = this.selectedFuneralPolicyDetails.roleplayers.findIndex(x => x.relationship === `MainLife`);
			const mainLifeElement = this.selectedFuneralPolicyDetails.roleplayers.splice(indexOfMainLife, 1)[0];
			this.selectedFuneralPolicyDetails.roleplayers.unshift(mainLifeElement);
		}
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_UPDATE_PLAN);
	}

	/**
	 * Fetch latest policy details and render Policy Summary 
	 * @param {event} e e
	 * @returns {void} 
	 */
	async _goToFuneralPolicySummary(e) {
		this.selectedFuneralPolicyDetails = await this._retrieveFuneralPolicySummary(e.detail.policyContractReference, this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber, e.detail.productCode);
		const indexOfMainLife = this.selectedFuneralPolicyDetails.roleplayers.findIndex(x => x.relationship === `MainLife`);
		const mainLifeElement = this.selectedFuneralPolicyDetails.roleplayers.splice(indexOfMainLife, 1)[0];
		this.selectedFuneralPolicyDetails.roleplayers.unshift(mainLifeElement);

		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_POLICY_SUMMARY);
	}

	/**
	 * Prepare and navigate to Funeral Transaction history
	 * @param {event} e e
	 * @returns {void} 
	 */
	async _goToFuneralTransactionHistory(e) {
		this.selectedFuneralPolicyContractReference = e.detail.policyNumber;
		this.selectedFuneralPolicyProductCode = e.detail.productCode;
		this.bankName = e.detail.bankName;
		this.accountNumber = e.detail.accountNumber;
		this.arrearsAmount = e.detail.arrearsAmount;
		await this._retrieveFuneralPolicyTransactionHistory();

		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		super.setInsureIncident(`funeral-transaction-history`);
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_POLICY_TRANSACTION_HISTORY);
	}

	/**
	 * Prepare and navigate to Life Pocket Summary
	 * @param {event} e e
	 * @returns {void} 
	 */
	_goToLifePocketSummary(e) {
		this.selectedLifePocketType = e.detail.pocketType;
		this.selectedLifePolicy = e.detail.lifePolicy;

		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		this._navigateToSubView(INSURE_RENDER_MODE.LIFE_POCKET_SUMMARY);
	}

	/**
	 * Prepare and navigate to Life Policy Summary
	 * @param {event} e e
	 * @returns {void} 
	 */
	_goToLifePolicySummary(e) {
		this.selectedLifePolicy = e.detail.lifePolicy;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		this._navigateToSubView(INSURE_RENDER_MODE.LIFE_POLICY_SUMMARY);
	}

	/**
	 * Prepare and navigate to Life Policy Premium History
	 * @param {event} e e
	 * @returns {void}
	 */
	async _goToLifePolicyPremiumHistory(e) {
		this.selectedLifePolicy = e.detail.lifePolicy;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		await this._retrieveLifePolicyPremiumHistory();
		this._navigateToSubView(INSURE_RENDER_MODE.LIFE_POLICY_PREMIUM_HISTORY);
	}

	/**
	 * Prepare and navigate to Life SMS History
	 * @param {event} e e
	 * @returns {void}
	 */
	_goToLifeSMSHistory(e) {
		this.selectedLifePolicy = e.detail.lifePolicy;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		this._navigateToSubView(INSURE_RENDER_MODE.LIFE_SMS_HISTORY);
	}

	/**
	 * Send email from caller page
	 * @param {event} e e
	 * @returns {void} 
	  */
	async _sendEmail(e) {
		this.clientConfirmedEmail = e.detail.emailId.detail.emailAddress;
		EMAIL_DOCUMENT_REQUEST_PAYLOAD.productCode = e.detail.productCode;

		if (e.detail.callerPage === INSURE_CALLER_PAGE.CANCEL_POLICY) {
			this.callerPage = INSURE_CALLER_PAGE.CANCEL_POLICY;
		} else if (e.detail.callerPage === INSURE_CALLER_PAGE.PAY_PREMIUM) {
			this.callerPage = INSURE_CALLER_PAGE.PAY_PREMIUM;
		} else if (e.detail.callerPage === INSURE_CALLER_PAGE.ESTIMATE) {
			EMAIL_DOCUMENT_REQUEST_PAYLOAD.productCode = this.funeralPolicies.checkInsuranceDetails[0].productCode;
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
		const emailResponse = await this.insureFuneralService.emailFuneralDocuments(EMAIL_DOCUMENT_REQUEST_PAYLOAD);
		if (!emailResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(emailResponse.exception);
			return;
		}
		super.isOnlyProductEnquiry = false;
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
	 * Send life email from caller page
	 * @param {event} e e
	 * @returns {void} 
	  */
	async _sendLifeEmail(e) {
		if (isNullorEmpty(e.detail.emailAddress)) {
			return false;
		}
		const emailLifeDocumentsPayload = {
			"cifNumber": this.callerInformation.cifNumber,
			"policyNumber": e.detail.contractReference,
			"emailAddress": e.detail.emailAddress,
			"documentContent": this.lifeDocsToEmail?.documentContent?.base64EncodedString ? this.lifeDocsToEmail?.documentContent?.base64EncodedString : ``,
			"documentType": this.lifeDocsToEmail?.documentDetails?.documentCode ? this.lifeDocsToEmail?.documentDetails?.documentCode : ``
		};
		const lifeEmailResponse = await this.insureLifeService.emailLifeDocuments(emailLifeDocumentsPayload, () => true);
		if (!lifeEmailResponse.succeeded) {
			this.handleToastError(lifeEmailResponse.exception);
			return false;
		}

		// window.showToastTimed(`success`, `top`, `Success`, `Document was sent`, 3000, true);
		this.funeralShowEstimateSuccessToast = true;
		this.lifeDocsToEmail = {};
		this.lifeSuccessPageMessages.emailSuccess = true;
		return true;
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
		const requestCallbackResp = await this.insureFuneralService.requestCallback(requestCallbackRequest);
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
	 * Unload Life premium history Transactions
	 * @returns {void}
	 */
	_unloadLifePremiumHistory() {
		this.lifePremiumHistory = {};
	}

	/**
	 * Navigate back to summary and reload life policies
	 * @returns {void}
	 */
	async _refreshLifePolicies() {
		this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES);
		this.lifePolicies = await this._retrieveClientLifePolicies();
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

	/**
	 * Update client elect preferences for type
	 * @param {Object} electRequest Update selected preference request
	 * @returns {void} 
	 */
	async _updateElectOptions(electRequest) {
		electRequest.cifNumber = this.callerInformation.cifNumber;
		electRequest.clientIDNumber = this.callerInformation.southAfricanIDNumber;

		const electResp = await this.insureFuneralService.SetElectOptions(electRequest);
		if (!electResp.succeeded) {
			super.isOnlyProductEnquiry = false;
			this.insureErrorToastMessage = `December collection OPT change was unsuccessful. Please try again later.`;
			this.showInsureErrorToast = true;
			return;
		}
		super.isOnlyProductEnquiry = false;
		this.showInsureSuccessToast = true;
		this.insureSuccessToastMessage = `Early December collection OPT ${electRequest.participating === true ? `OUT` : `IN`} successfully updated.`;
		window.setTimeout(() => this.showInsureSuccessToast = false, 5000);
		this.funeralPolicies = await this._retrieveClientFuneralPolicies();
		return true;
	}

	// #endregion EVENT HANDLER


	async _clientVerified(event) {
		super._clientVerified(event);
		await this._initialise();
		this.renderMode = INSURE_RENDER_MODE?.CLIENT_POLICIES;
	}

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
		${this._renderSuccessToast()}
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
			case INSURE_RENDER_MODE.LIFE_POCKET_SUMMARY:
				return html`${this._renderLifePocketSummaryPage()}`;
			case INSURE_RENDER_MODE.LIFE_SUCCESS:
				return html`${this._renderLifeSuccessPage()}`;
			case INSURE_RENDER_MODE.LIFE_POLICY_SUMMARY:
				return html`${this._renderLifePolicySummaryPage()}`;
			case INSURE_RENDER_MODE.LIFE_POLICY_PREMIUM_HISTORY:
				return html`${this._renderLifePolicyPremiumHistoryPage()}`;
			case INSURE_RENDER_MODE.LIFE_SMS_HISTORY:
				return html`${this._renderLifeSMSHistoryPage()}`;
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
				.showEmailEstimateSuccessToast ="${this.funeralShowEstimateSuccessToast}"
				.clientClaims="${this.insuranceClaims}"
				.funeralPolicies="${this.funeralPolicies}"
				.funeralCancelAgreementDocument="${this.funeralCancelAgreementDocument}" 
				.funeralArrearsPaymentDocumentDetails="${this.funeralArrearsAgreementDocument}"
				.generateDocumentsFuneralCancel="${(contractReference, cancelReason, saveToDocumentum, productCode) => this._generateDocumentsFuneralCancel(contractReference, cancelReason, saveToDocumentum, productCode)}"
				.generateDocumentsFuneralArrears="${(contractReference, payArrears, fromAccount, saveToDocumentum) => this._generateDocumentsFuneralArrears(contractReference, payArrears, fromAccount, saveToDocumentum)}"
				.maxAllowedCover="${isNullorEmpty(this.funeralPolicies?.checkInsuranceDetails[0]?.maxAllowedCover) ? 100000 : this.funeralPolicies?.checkInsuranceDetails[0]?.maxAllowedCover}"
				.requestCallback = "${(firstName, lastName, cellphoneNumber) => this._requestCallback(firstName, lastName, cellphoneNumber)}"
				.funeralGetPolicyArrears = "${() => this._retrieveFuneralPolicyArrears()}"
				.funeralPolicyArrears = "${this.funeralPolicyArrears}"
				.lifePolicies = "${this.lifePolicies}"
				.selectedInsureTabIndex = "${this.selectedInsureTabIndex}"
				.generateDocumentsLifeCancel="${(contractReference, cancelReason, saveToDocumentum) => this._generateDocumentsLifeCancel(contractReference, cancelReason, saveToDocumentum)}"
				.generateDocumentsUpdateBankingDetails="${(policy, saveToDocumentum) => this._generateDocumentsLifeUpdateBankingDetails(policy, saveToDocumentum)}"
				.lifeCancelAgreementDocument="${this.lifeCancelAgreementDocument}"
				.readOnlyMode="${this.readOnly}"
				.executeLifePayArrearsGenerateAgreementDocument="${(contractReference, accountSelected, selectedArrears, saveToDocumentum) => this._generateDocumentsLifePayArrears(contractReference, accountSelected, selectedArrears, saveToDocumentum)}"
				.executeLifePayArrears="${(contractReference, accountNumber, selectedArrears) => this._payArrearsLife(contractReference, accountNumber, selectedArrears)}"
				.executeLifeArrearsSendEmail="${(contractReference, totalPaid, email, agreementResult) => this._payArrearsLifeEmail(contractReference, totalPaid, email, agreementResult)}"
				.executeGetLifeQuestionnaire="${() => this._healthQuestionnaire()}"
				.executeLifeAllowedCover="${(answersRequest) => this._lifeAllowedCover(answersRequest)}"
				.executeLifeUpdatePolicy="${(updatePolicyRequest) => this._lifeUpdatePolicy(updatePolicyRequest)}"
				.refreshLifePolicies="${() => this._retrieveClientLifePolicies()}"
				.lifeGetPolicyArrears="${(selectedPolicy) => this._retrieveLifePolicyArrears(selectedPolicy)}"
				.lifePolicyArrears = "${this.lifePolicyArrears}"
				.lifeUpdateBankingDetailsAgreement = "${this.lifeUpdateBankingDetailsAgreement}"
				.defaultSavingsAccountNumber="${this.defaultSavingsAccountNumber}"
				.defaultSavingsAccountAvailableBalance="${this.defaultSavingsAccountAvailableBalance}"
				.isLifeQualifyingClient = "${this.isLifeQualifyingClient}"
				.updateEarlyCollectionPreferences = "${(e) => this._updateElectOptions(e)}"
				@send-life-email = "${(e) => this._sendLifeEmail(e)}"
				@life-cancel-policy="${(e) => this._cancelLifePolicy(e)}"
				@life-update-banking-details="${(e) => this._updateBankingDetailsLifePolicy(e)}"
				@product-enquiry="${() => this._productEnquiry()}"
				@pay-policy="${(e) => this._payFuneralPolicyArrears(e)}"
				@cancel-policy="${(e) => this._cancelFuneralPolicy(e)}"
				@navigate-to-estimate="${(e) => this._goToFuneralPolicyEstimate(e)}"
				@navigate-to-update-plan="${(e) => this._goToFuneralUpdatePlan(e)}"
				@navigate-to-policy-summary="${(e) => this._goToFuneralPolicySummary(e)}"
				@navigate-to-claim-summary="${(e) => this._goToClaimSummary(e)}"
				@navigate-to-policy-transaction-history="${(e) => this._goToFuneralTransactionHistory(e)}"
				@navigate-to-sms-history="${(e) => this._goToFuneralSMSHistory(e)}"
				@navigate-to-life-pocket-summary="${(e) => this._goToLifePocketSummary(e)}"
				@navigate-to-life-policy-summary="${(e) => this._goToLifePolicySummary(e)}"
				@navigate-to-life-allocate-cover="${(e) => this._goToLifeAllocateCover(e)}"
				@navigate-to-life-policy-premium-history="${(e) => this._goToLifePolicyPremiumHistory(e)}"
				@navigate-to-life-sms-history="${(e) => this._goToLifeSMSHistory(e)}"
				@send-funeral-email = "${(e) => this._sendEmail(e)}"
				@verify-now = ${() => this._verifyClick()}
				.setInsureIncident = "${(need) => super.setInsureIncident(need)}">
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
				@updatePlanAccept="${(e) => this._updateFuneralPlanAccept(e)}"
				.defaultSavingsAccountNumber="${this.defaultSavingsAccountNumber}"
				.setInsureIncident = "${(need) => super.setInsureIncident(need)}"
				@accept-policy="${(policyToAccept) => this._acceptPolicy(policyToAccept)}"
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
	 * Render Life Premium History Page
	 * @returns {html} Html of the sub view
	 */
	_renderLifePolicyPremiumHistoryPage() {
		return html`
		<horizon-insure-life-premium-history
			.lifePremiumHistory="${this.lifePremiumHistory}"
			.getLifePremiumHistory="${(startDate, endDate, pageIndex) => this._retrieveLifePolicyPremiumHistory(startDate, endDate, pageIndex)}"
			.disposeData="${() => this.lifePremiumHistory = []}"
			@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
			@unloading="${() => this._unloadLifePremiumHistory()}"
		>
		</horizon-insure-life-premium-history>
		`;
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
	 * Renders the pocket summary page, configured with the selected pocket type
	 * 
	 * @returns {html} html
	 */
	_renderLifePocketSummaryPage() {
		return html`
			<horizon-insure-life-pocket-summary 
				.selectedPocketType="${this.selectedLifePocketType}"
				.selectedLifePolicy="${this.selectedLifePolicy}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-life-pocket-summary>`;
	}

	/**
	 * Renders the pocket summary page, configured with the selected pocket type
	 * 
	 * @returns {html} html
	 */
	_renderLifePolicySummaryPage() {
		return html`
			<horizon-insure-life-policy-summary 
				.selectedLifePolicy="${this.selectedLifePolicy}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-life-policy-summary >`;
	}

	_renderLifeSMSHistoryPage() {
		return html`
			<horizon-insure-life-sms-history-page
			.getCommsHistory="${() => this._retrieveLifeSMSHistory()}"
			.contractReference="${this.selectedLifePolicy.contractReference}"
			@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-life-sms-history-page>
		`;
	}

	/**
	 * Renders the Life Success page
	 * 
	 * @returns {html} html
	 */
	_renderLifeSuccessPage() {
		return html`
			<horizon-insure-life-success 
				.contractReference="${this.selectedLifePolicy}"
				.successMessages="${this.lifeSuccessPageMessages}"
				.email = "${this.clientConfirmedEmail}"
				.sendLifeEmail="${(e) => this._sendLifeEmail(e)}"
				@navigate-to-summary="${() => this._refreshLifePolicies()}">
			</horizon-insure-life-success>`;
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

	/**
	 * Renders the Generic Success toast
	 * @returns {html} html content
	 */
	_renderSuccessToast() {
		return html`
			<capitec-toast
				?hidden="${!this.showInsureSuccessToast}"
				class="toast"
				type="success"
				Header="Successful"
				layout = "vertical"
				detail = "${this.insureSuccessToastMessage}"
				@click = "${() => this.showInsureSuccessToast = false}">
			</capitec-toast>
		`;
	}

	// #endregion RENDERING
}
customElements.define(`horizon-existing-client`, ExistingClient);