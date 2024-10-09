/* eslint-disable sort-imports */
import { css, html } from 'platform/elements';
import { EMAIL_DOCUMENT_REQUEST_PAYLOAD, GENERATE_DOCUMENT_REQUEST_PAYLOAD } from 'app/utils/insureRequestPayload';
import { getAgeFromIDNumber, getGenderFromIDNumber } from 'app/utils/insureUtils';
import { Configuration } from 'platform/core';
import { InsureFuneralService } from '../../services/InsureFuneralService';
import { InsureLifeService } from '../../services/InsureLifeService';
import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { LANDING_PAGE_NEEDS } from 'app/constants/Common';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { MAX_RESULTS, TRANSACTION_TYPE } from 'app/constants/InsureTransactionHistory';

import 'app/components/insure/ClientSummary';
import 'app/components/insure/EmailPlanSuccess';
import 'app/components/insure/funeral/FuneralSuccessPage';
import 'app/components/insure/funeral/FuneralPolicyEstimate';
import 'app/components/insure/funeral/FuneralUpdatePlan';
import 'app/components/insure/funeral/FuneralPayPremiumSuccess';
import 'app/components/insure/funeral/FuneralCancelPolicySuccess';
import 'app/components/insure/funeral/FuneralSMSHistory';
import '../../components/insure/funeral/FuneralPolicySummary';
import '../../components/insure/funeral/FuneralPolicyTransactionHistory';
import '../../components/insure/ClaimSummary';
import 'app/components/insure/funeral/FuneralPolicyHistory';

import 'app/components/insure/life/LifePolicySummary';
import 'app/components/insure/life/LifePremiumHistory';
import 'app/components/insure/life/LifeSMSHistory';

import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { CANCELATION_REASONS_FUNERAL_BACKOFFICE, DOCUMENT_TYPE, FUN_BENEFIT_PERIOD, LIFE_ARREARS_STATUSES, TRANSACTION_STATUS, INSURE_CALLER_PAGE, LIFE_CANCELATION_REASONS_BACKOFFICE, FEATURE_TOGGLES } from 'app/constants/InsureCommon';

const INSURE_PRODUCT_START_DATE = `2001/01/01`;

const POLICY_TRANSACTION_HISTORY = {
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(INSURE_PRODUCT_START_DATE).toISOString().substr(0, 10),
	PAGE_INDEX: 0,
	MAX_RESULTS: MAX_RESULTS
};

/**
 * Implements the view for Insure Back Office agent. View is readonly and only allows investigations to take place, no interaction on clients policies
 *
 * 
 * @export
 * @class InsureBackOffice
 * @extends {View}
 */
export class InsureBackOfficeView extends InsureViewBase {

	// #region INITIALISATION

	constructor() {
		super();
		this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;
		this.callerPage = ``;

		this.insureFuneralService = new InsureFuneralService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.insureLifeService = new InsureLifeService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.configuration = Configuration.getInstance();

		this.productParams = {};
		this.claims = [];
		this.successPageMessage = ``;
		this.selectedInsureTabIndex = 0;

		this.selectedFuneralPolicyContractReference = ``;
		this.selectedFuneralPolicyProductCode = ``;
		this.selectedFuneralPolicyDetails = {};
		this.selectedFuneralPolicyStartDate = ``;
		this.funeralEstimateDetails = {};
		this.funeralPolicyTransactionHistory = {};
		this.funeralIssuePlanAgreementDocument = {};
		this.funeralUpdatePlanAgreementDocument = {};
		this.funeralShowEstimateSuccessToast = false;
		this.funeralCancelAgreementDocument = {};
		this.funeralArrearsAgreementDocument = {};

		this.policySummary = {};
		this.commsHistory = {};
		this.selectedLifePolicy = {};
		this.contractReference = ``;
		this.defaultSavingsAccountNumber = ``;

		this.showInsureSuccessToast = false;

		this.funeralCancelationReasons = CANCELATION_REASONS_FUNERAL_BACKOFFICE;


		this.lifeCancelationReasons = LIFE_CANCELATION_REASONS_BACKOFFICE;
	}

	/**
	 * @property {Object} policySummary Local object for new Quote requests
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {String} successPageMessage Generic message for shared success page
	 * @property {Object} renderMode contains which flow to render
	 * @property {String} callerPage from which success page is invoked.
	 * @property {Object} clientConfirmedEmail clients confirmed email address
	 * @property {Object} selectedFuneralPolicyDetails  Local object for Policy Summary requests
	 * @property {String} selectedFuneralPolicyContractReference Contract Reference of selected policy
	 * @property {String} selectedFuneralPolicyProductCode Product code of selected policy
	 * @property {Object} funeralPolicies Data & flags for all policies relating to client CIF
	 * @property {Object} funeralEstimateDetails Local object for new Estimate requests
	 * @property {String} funeralIssuePlanAgreementDocument stores issue plan agreement document object.
	 * @property {Object} funeralUpdatePlanAgreementDocument stores update Plan Agreement Document object
	 * @property {String} funeralCancellationReason contains the cancellation reason selected
	 * @property {Object} funeralCancelAgreementDocument contains the cancel policy document details
	 * @property {Object} funeralArrearsAgreementDocument contains the arrears payment document details
	 * @property {Boolean} funeralShowEstimateSuccessToast determine whether to show a success alert for estimate email
	 * @property {Object} funeralPolicyArrears contains client arrears and payable accounts for funeral policy
	 * @property {String} contractReference contains the contract reference for the selected policy 
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			policySummary: { type: Object, state: true },
			productParams: { type: Object, state: true },
			successPageMessage: { type: String },
			renderMode: { type: Number, state: true },
			callerPage: { type: String },
			clientConfirmedEmail: { type: Object, state: true },
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
			funeralPolicyRescheduleAgreement: { type: Object, state: true },

			contractReference: { type: String, state: true },
			claims: { type: Object, state: true },
			lifePolicyMandates: { type: Object, state: true },

			defaultSavingsAccountNumber: { type: String, state: true },
			showInsureSuccessToast: { type: Boolean, state: true },

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
	 * @returns {null} null
	 */
	async _initialise() {
		this.funeralPolicies = await this._retrieveClientFuneralPolicies();
		this.lifePolicies = await this._retrieveClientLifePolicies(this.callerInformation.cifNumber);
		this.claims = await this._retrieveClaims();
		this.initFeaturesBanner();
		super.setInsureIncident(LANDING_PAGE_NEEDS.INSURE);
	}

	/**
	 * Set feature flags banner
	 * @returns {void}
	 */
	initFeaturesBanner() {
		if(this.funeralPolicies === undefined || this.funeralPolicies.featureResponse === undefined) {
			this.showFeatureBanner = false;
			this.featureBannerMessage = ``;
			return;
		}

		const featureBannerDetails = this.funeralPolicies.featureResponse.features.find(feature => feature.feature.toUpperCase() === FEATURE_TOGGLES.Banner.toUpperCase());
		if(featureBannerDetails !== undefined) {
			if(featureBannerDetails.enabled === true) {
				this.showFeatureBanner = true;
				this.featureBannerMessage = featureBannerDetails.message;
			} else {
				this.showFeatureBanner = false;
				this.featureBannerMessage = ``;
			}
		}
	}

	/**
	 * Retrieve client policies via insure channel service
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
	 * Retrieve client summary containing all Life policies
	 * @param {String} cifNumber cifNumber of client
	 * @returns {Object} Client Life policies 
	 */
	async _retrieveClientLifePolicies(cifNumber) {
		const request = {
			cifNumber: cifNumber
		};

		const respSummary = await this.insureLifeService.lifeClientSummary(request);
		if (!respSummary.succeeded) {
			this.handleToastError(resp.exception);
			return;
		}
		return respSummary.result;
	}

	/**
	 * Retrieve Policy Summary via insure channel service
	 * @param {*} contractReference contractReference
	 * @param {*} cifNumber cifNumber
	 * @param {*} idNumber idNumber
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
	 * Retrieve Claims list for Client
	 * @returns {Object} Claims list
	 */
	async _retrieveClaims() {
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
	 * gets the life policy mandates
	 * 
	 * @param {object} selectedPolicy the selected policy
	 * @returns {void}
	 */
	async _retrieveLifePolicyMandates(selectedPolicy) {
		const mandatesRequest =
		{
			"contractReference": selectedPolicy,
			"cifNumber": this.callerInformation.cifNumber
		};

		const resp = await this.insureLifeService.lifeGetMandates(mandatesRequest);
		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return;
		}

		this.lifePolicyMandates = resp.result;
	}

	async _retrievePolicyBenefitInfo(contractRef, productCode) {
		const benefitInfoRequest = {
			"contractReference": contractRef,
  			"productCode": productCode
		};

		const benefitInfoResponse = await this.insureFuneralService.policyBenefitInfo(benefitInfoRequest);

		if (!benefitInfoResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(benefitInfoResponse.exception);
			return;
		}

		return benefitInfoResponse.result;

	}
	
	async _retrieveLifePolicyBenefitInfo(contractRef) {
		const benefitInfoRequest = {
			"contractReference": contractRef,
			"cifNumber": this.callerInformation.cifNumber
		};

		const benefitInfoResponse = await this.insureLifeService.lifeGetPolicy(benefitInfoRequest);

		if (!benefitInfoResponse.succeeded) {
			this.handleToastError(benefitInfoResponse.exception);
			return;
		}

		return benefitInfoResponse.result;

	}

	async executeFuneralActivateBenefit(activationReason, benefitType, policy) {
		const activateBenefitRequest = {
			"contractReference": policy.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"policyPauseReason": activationReason,
			"benefitType": benefitType,
			"benefitPeriod": FUN_BENEFIT_PERIOD.PERIOD,
			"claimIncidentDate": new Date(),
			"productCode": policy.productCode
		};

		const activateBenefitResponse = await this.insureFuneralService.activateBenefit(activateBenefitRequest);

		if (!activateBenefitResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(activateBenefitResponse.exception);
			return;
		}

		return activateBenefitResponse.result;
	
	}

	async executeLifeActivateBenefit(activationReason, benefit, policy) {
		const activateBenefitRequest = {
			"policyNumber": policy.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"waiverReason": activationReason
		};

		const activateBenefitResponse = await this.insureLifeService.activateBenefit(activateBenefitRequest);

		if (!activateBenefitResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(activateBenefitResponse.exception);
			return;
		}
		
		return activateBenefitResponse.result;
	
	}

	async executeFuneralCancelBenefit(benefitType, policy) {
		const cancelBenefitRequest = {
			"contractReference": policy.contractReference,
			"benefitType": benefitType,
			"cifNumber": this.callerInformation.cifNumber,
			"productCode": policy.productCode
		};

		const cancelBenefitResponse = await this.insureFuneralService.cancelBenefit(cancelBenefitRequest);

		if (!cancelBenefitResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(cancelBenefitResponse.exception);
			return;
		}

		return cancelBenefitResponse.result;
	
	}

	
	async executeLifeCancelBenefit(policy) {

		/**
		 * @returns {void} returns dates
		 */
		function getTodayDate() {
			const today = new Date();
			const year = today.getFullYear();
			const month = String(today.getMonth() + 1).padStart(2, `0`); // Months are zero-based
			const day = String(today.getDate()).padStart(2, `0`);
			return `${year}-${month}-${day}`;
		};

		const cancelBenefitRequest = {
			"cifNumber": this.callerInformation.cifNumber,
			"policyNumber": policy.contractReference,
			"benefitStopDate": getTodayDate()
		};

		const cancelBenefitResponse = await this.insureLifeService.cancelBenefit(cancelBenefitRequest);

		if (!cancelBenefitResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(cancelBenefitResponse.exception);
			return;
		}

		return cancelBenefitResponse.result;
	
	}

	async _retrievePolicyBenefitInfo(contractRef, productCode) {
		const benefitInfoRequest = {
			"contractReference": contractRef,
  			"productCode": productCode
		};

		const benefitInfoResponse = await this.insureFuneralService.policyBenefitInfo(benefitInfoRequest);

		if (!benefitInfoResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(benefitInfoResponse.exception);
			return;
		}

		return benefitInfoResponse.result
	}

	/**
	 * update main life details with caller information (latest client details on Bancs)
	 * @param {*} mainLife main life roleplayer
	 * @returns {*}*
	 */
	_updateMainLifeFromCallerInfo(mainLife)
	{
		let dob = new Date(this.callerInformation.birthdate);
		
		mainLife.surname = this.callerInformation.lastName;
		mainLife.firstName = this.callerInformation.firstName;
		mainLife.middleName = this.callerInformation.middleName1;
		mainLife.idNumber = this.callerInformation.southAfricanIDNumber;
		mainLife.dateOfBirth = dob.toISOString();;
	}

	// #endregion PRIVATE METHODS

	// #region DOCUMENT GENERATION

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
		} else if (sourcePage === INSURE_CALLER_PAGE.FUNERAL_UPDATE_ID_DOB_DIALOG) {
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
		} else if (sourcePage === INSURE_CALLER_PAGE.FUNERAL_NEW_AGREEMENT_GENERATION) {
			emailDocumentRequestPayload.documentInfo = [
				{
					"documentType": DOCUMENT_TYPE.POLICY_RESCHEDULE_AGREEMENT,
					"documentGuid": this.funeralPolicyRescheduleAgreement?.documentDetails?.guid,
					"content": {
						"type": `PDF`,
						"value": this.funeralPolicyRescheduleAgreement?.documentContent.value
					}
				}
			];
		} else if (sourcePage === INSURE_CALLER_PAGE.FUNERAL_CLIENT_POLICIES) {
			emailDocumentRequestPayload.documentInfo = [];
		} else {
			emailDocumentRequestPayload.documentInfo = [];
		}
	}

	// #endregion DOCUMENT GENERATION

	// #region EVENT HANDLERS

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
		GENERATE_DOCUMENT_REQUEST_PAYLOAD.input = e.detail;

		const result = await this.insureFuneralService.generateEstimatePrintoutDocument(GENERATE_DOCUMENT_REQUEST_PAYLOAD);
		if (!result.succeeded) {
			super.isOnlyProductEnquiry = false;
			this.handleToastError(result.exception);
			return null;
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
			"productCode": this.selectedFuneralPolicyProductCode,
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
				adjustedRoleplayers.coverAmount = 0;
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
		const acceptPlanResp = await this.insureFuneralService.policyAccept(acceptPlanRequest);
		if (!acceptPlanResp.succeeded) {
			this.handleToastError(acceptPlanResp.exception);
			return;
		}

		await this._generateDocumentsFuneralUpdatePlan(true);
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


		const acceptPlanRequest =
		{
			"cifNumber": this.callerInformation.cifNumber,
			"contractReference": event.detail.policyResponse.policyResponse.contractReference,
			"productCode": this.selectedFuneralPolicyProductCode,
			"documents": documents,
			"mandates": event.detail.policyResponse.policyResponse.mandates
		};

		const acceptPlanResp = await this.insureFuneralService.policyAccept(acceptPlanRequest);
		if (!acceptPlanResp.succeeded) {
			this.handleToastError(acceptPlanResp.exception);
			return;
		}

		this.contractReference = event.detail.policyResponse.policyResponse.contractReference;
		await this._generateDocumentsFuneralReissue(true);

		this.successPageMessage = `The policy ${event.detail.policyResponse.policyResponse.contractReference} has been successfully reissued`;
		this.callerPage = INSURE_CALLER_PAGE.REINSTATE_POLICY;
		this.contractReference = event.detail.policyResponse.policyResponse.contractReference;
		this.renderMode = INSURE_RENDER_MODE.SUCCESS_PAGE;
	}

	/**
	 * Cancel Policy
	 * @param {event} e e
	 * @returns {void}
	 */
	async _cancelFuneralPolicy(e) {
		this.funeralCancellationReason = e.detail.cancellationReason;
		this.selectedFuneralPolicyProductCode = e.detail.productCode;

		const cancelPolicyDetails = {
			"contractReference": e.detail.contractReference,
			"productCode": this.selectedFuneralPolicyProductCode,
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
			this.handleToastError(arrearsResp.exception);
			return;
		}
		this.funeralPolicyArrears = arrearsResp?.result;
	}

	/**
	 * retrieve the communication history for the specific policy
	 * Map metadata (coverDetails) back when response is received
	 * @param {*} contractReference startDate
	 * @param {*} fromDate startDate
	 * @param {*} toDate endDate
	 * @returns {Object} Communication history response
	 */
	async _retrieveFuneralSMSHistory(contractReference, fromDate, toDate) {

		const commsHistoryDetails = {
			"contractReference": contractReference,
			"fromDate": fromDate,
			"toDate": toDate,
			"productCode": this.selectedFuneralPolicyProductCode
		};

		const resp = await this.insureFuneralService.communicationHistory(commsHistoryDetails, () => true);
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
	 * @returns {*} transaction history
	 */
	async _retrieveFuneralPolicyTransactionHistory(startDate, endDate, pageIndex) {
		const transactionHistoryRequest = {
			contractReference: this.contractReference,
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
			contractReference: this.contractReference,
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

			this.endCallContext = `PolicyTransactionHistory`;
			this.renderMode = INSURE_RENDER_MODE.FUNERAL_POLICY_TRANSACTION_HISTORY;
		}
	}

	/**
	 * Fetch Policy Transaction History
	 * 
	 * @returns {null} null
	 */
	async _retrieveLifePolicyPremiumHistory() {
		const PremiumHistoryRequest = {
			policyNumber: this.selectedLifePolicy.contractReference
		};

		this.lifeTransactions = [];

		let totalArrears = 0;
		this.selectedLifePolicy?.arrears?.forEach(arrears => {
			if (arrears?.arrearsPaymentStatus !== LIFE_ARREARS_STATUSES.PAID) {
			totalArrears += parseFloat(arrears.arrearsPaymentDueAmount, 10);
			}
		});

		this.lifePremiumHistory = {
			contractReference: this.selectedLifePolicy.contractReference,
			bankName: this.selectedLifePolicy.bankDetails.bank,
			accountNumber: this.selectedLifePolicy.bankDetails.accountNumber,
			arrearsAmount: formatCurrency(totalArrears)
		};
		const returnValue = await this.insureLifeService.lifePremiumHistory(PremiumHistoryRequest);
		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactionHistory.
				filter((ele) => ele.eventTransactionType === `Premium collection` || ele.eventTransactionType === `Refund` || ele.eventTransactionType === `Pay-out` || ele.eventTransactionType === `Ad-hoc`).map((item) => {
					const formatedDate = new Date(Date.parse(item.eventDate));
					item.formatedDate = formatedDate;
					item.formatedPremium = isNullorEmpty(this.selectedLifePolicy?.totalPremium) ? `` : formatCurrency(this.selectedLifePolicy?.totalPremium);
					item.groupByDate = `${getMonthName(formatedDate.getMonth())} ${formatedDate.getFullYear()}`;
					item.formatedAmount = isNullorEmpty(item.eventAmount) ? `` : formatCurrency(item.eventAmount);
					return item;
				});
			this.lifeTransactions.push(...formattedTrans);
			this.lifePremiumHistory.transactions = this.lifeTransactions;
			this.renderMode = INSURE_RENDER_MODE.LIFE_POLICY_PREMIUM_HISTORY;
		} else {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
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
			resp.result.smsHistory.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
			return resp.result;
		}
		this.handleToastError(resp.exception);
		return null;
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
	 * @returns {null} null
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
	 * Unload Policy Transactions State
	 * @returns {null} null
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

	/**
	 * Navigate back from any view to Summary
	 * @returns {null} null
	 */
	_backToSummaryPage() {
		this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;
	}

	
	async _executeFuneralUpdateIdDoB(policy, updatedLife) {
		let dob = new Date(this.callerInformation.birthdate)

		const UpdateIdDobRequest = {
			"documentFormat": `PDF`,
			"saveDocumentToDocumentum": true,
			"voiceRecordingNumber": ``,
			"markDocumentsAsAccepted": true,
			"returnDocumentContent": true,
			"emailDocumentToClient": false,
			"wetsignBarcode": true,
			"clientDetails": {
			  "cifNumber": this.callerInformation.cifNumber,
			  "policyContractReference": policy.contractReference,
			  "productCode": policy.productCode,
			  "firstName": this.callerInformation.firstName,
			  "surname": this.callerInformation.lastName,
			  "idNumber": this.callerInformation.southAfricanIDNumber,
			  "dateOfBirth": dob.toISOString()
			},
			"contractReference": policy.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"productCode": policy.productCode,
			"idNumber": updatedLife.idNumber,
			"dateOfBirth": updatedLife.dateOfBirth,
			"recordID": updatedLife.recordID
		};

		const resp = await this.insureFuneralService.updateIdDob(UpdateIdDobRequest);

		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return false;
		}

		this.selectedFuneralPolicyContractReference = policy.contractReference;
		this.selectedFuneralPolicyProductCode = policy.productCode;

		this.funeralUpdatePlanAgreementDocument = resp.result;
		return resp.result;
		
	}

	async _executeFuneralCreateMandate(request) {
		request.idNumber = this.callerInformation.southAfricanIDNumber;
		const resp = await this.insureFuneralService.createMandate(request);

		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return false;
		}

		return true;
}

	async _generatePolicyRescheduleDocument(policy, saveDocument) {
		let dob = new Date(this.callerInformation.birthdate);
		let request = {
				"documentFormat": "PDF",
				"saveDocumentToDocumentum": saveDocument,
				"voiceRecordingNumber": "",
				"markDocumentsAsAccepted": saveDocument,
				"returnDocumentContent": true,
				"emailDocumentToClient": false,
				"wetsignBarcode": true,
				"clientDetails": {
				  "cifNumber": this.callerInformation.cifNumber,
				  "primarySavingsAccountNumber": policy.deductionDetails.bankDetails.accountNumber,
				  "policyContractReference": policy.contractReference,
				  "productCode": policy.productCode,
				  "firstName": this.callerInformation.firstName,
				  "surname": this.callerInformation.lastName,
				  "idNumber": this.callerInformation.southAfricanIDNumber,
				  "dateOfBirth": dob.toISOString
				},
				"emailDetails": {
				  "email": "",
				}
		}

		const resp = await this.insureFuneralService.generatePolicyRescheduleDocument(request);
		
		if (!resp.succeeded) {
			this.handleToastError(resp.exception);
			return false;
		}
		this.funeralPolicyRescheduleAgreement = resp.result;
		return resp.result

	}

	_goToFuneralPolicyHistory(e) {
		this.selectedFuneralPolicyDetails = e.detail.policy
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_POLICY_HISTORY);
	}

	async _fetchPolicyHistory(startDate, endDate, policy) {
		
		const request = {
			contractReference: policy.contractReference,
			productCode: policy.productCode,
			fromDate: startDate || POLICY_TRANSACTION_HISTORY.START_DATE,
			toDate: endDate || POLICY_TRANSACTION_HISTORY.END_DATE,
			pagniation: {
				pageIndex: POLICY_TRANSACTION_HISTORY.PAGE_INDEX,
				totalPerPage: POLICY_TRANSACTION_HISTORY.MAX_RESULTS
			}
		}

		let response = await this.insureFuneralService.policyHistory(request);

		if (!response.succeeded) {
			this.handleToastError(response.exception);
			return;
		}

		return response.result.transactions;
	}

	async _fetchPolicyHistoryDetails(activityID, policy) {
		const request = {
			contractReference: policy.contractReference,
			activityId: activityID,
			productCode: policy.productCode
		}

		const response = await this.insureFuneralService.policyHistoryDetails(request);

		if (!response.succeeded) {
			this.handleToastError(response.exception);
			return;
		}

		return response.result.auditDetails;
	}

	// #endregion EVENT HANDLERS

	// #region NAVIGATION METHODS

	/**
	* Navigate so specific subview
	* @param {*} newMode newMode
	* @returns {null} null
	  */
	_navigateToSubView(newMode) {
		if (this.renderMode !== INSURE_RENDER_MODE.FUNERAL_ESTIMATE && this.renderMode !== INSURE_RENDER_MODE.CLIENT_POLICIES) {
			this.funeralShowEstimateSuccessToast = false;
		}
		this.renderMode = newMode;
	}

	/**
	 * Fetch latest claim details and render Claims Summary 
	 * @param {event} e e
	 * @returns {void} 
	 */
	_goToClaimSummary(e) {
		this.claimSummary = e.detail;
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
		this.policyNumber = e.detail.policyItem.contractReference;
		this.selectedFuneralPolicyProductCode = e.detail.productCode;
		this.selectedFuneralPolicyStartDate = e.detail.policyItem.commencementDate;
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
	 * Prepare and navigate Funeral Update plan
	 * @param {event} e e
	 * @returns {void}
	 */
	async _goToFuneralUpdatePlan(e) {
		this.selectedFuneralPolicyProductCode = e.detail.productCode;
		this.selectedFuneralPolicyContractReference = e.detail.policyContractReference;

		if (e.detail.canReinstate) {
			const calcResponse = await this._reissueFuneralPolicyQuote(e.detail.policyContractReference, this.callerInformation.cifNumber);
			const policyResponse = await this._retrieveFuneralPolicySummary(e.detail.policyContractReference, this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber, e.detail.productCode);
			super.setInsureIncident(`funeral-plan-reissue`);
			if (calcResponse !== null) {
				this.selectedFuneralPolicyDetails = calcResponse;
				this.selectedFuneralPolicyDetails.roleplayers = calcResponse.eligibleRoleplayers;
				this.selectedFuneralPolicyDetails.canReinstate = true;
				this.selectedFuneralPolicyDetails.policyRule = policyResponse.policyRule;
				this.selectedFuneralPolicyDetails.deductionDetails = policyResponse.deductionDetails;
				delete this.selectedFuneralPolicyDetails.eligibleRoleplayers;
			} else {
				this.handleToastError(calcResponse.exception);
				return;
			}
		} else {
			this.selectedFuneralPolicyDetails = await this._retrieveFuneralPolicySummary(e.detail.policyContractReference, this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber, e.detail.productCode);
			super.setInsureIncident(`funeral-plan-update-lives`);
		}

		if(this.selectedFuneralPolicyDetails !== null && this.selectedFuneralPolicyDetails.roleplayers !== null)
		{ 
			const indexOfMainLife = this.selectedFuneralPolicyDetails.roleplayers.findIndex(x => x.relationship === `MainLife`);
			const mainLifeElement = this.selectedFuneralPolicyDetails.roleplayers.splice(indexOfMainLife, 1)[0];
			this._updateMainLifeFromCallerInfo(mainLifeElement);
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
	 * Prepare and navigate to Transaction history
	 * @param {*} e event 
	 * @returns {null} null
	 */
	async _goToFuneralTransactionHistory(e) {
		this.selectedFuneralPolicyContractReference = e.detail.policyNumber;
		this.contractReference = e.detail.policyNumber;
		this.selectedFuneralPolicyProductCode = e.detail.productCode;
		this.selectedFuneralPolicyStartDate = e.detail.commencementDate;
		this.bankName = e.detail.bankName;
		this.accountNumber = e.detail.accountNumber;
		this.arrearsAmount = e.detail.arrearsAmount;
		await this._retrieveFuneralPolicyTransactionHistory();

		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		super.setInsureIncident(`funeral-transaction-history`);
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_POLICY_TRANSACTION_HISTORY);
	}

	/**
	 * Prepare and navigate to Life Policy Summary
	 * @param {event} e e
	 * @returns {void} 
	 */
	async _goToLifePolicySummary(e) {
		this.selectedLifePolicy = e.detail.lifePolicy;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		await this._retrieveLifePolicyMandates(this.selectedLifePolicy.contractReference);
		this._navigateToSubView(INSURE_RENDER_MODE.LIFE_POLICY_SUMMARY);
	}

	/**
	 * Prepare and navigate to Life Policy Premium History
	 * @param {event} e e
	 * @returns {void}
	 */
	async _goToLifePolicyPremiumHistory(e) {
		super.setInsureIncident(`life-cover-premium-history`);
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
		super.setInsureIncident(`life-cover-sms-history`);
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
		} else if (e.detail.callerPage === INSURE_CALLER_PAGE.FUNERAL_UPDATE_ID_DOB_DIALOG) {
			this.callerPage = INSURE_CALLER_PAGE.FUNERAL_UPDATE_ID_DOB_DIALOG
		}else if (e.detail.callerPage === INSURE_CALLER_PAGE.FUNERAL_NEW_AGREEMENT_GENERATION) {
			this.callerPage = INSURE_CALLER_PAGE.FUNERAL_NEW_AGREEMENT_GENERATION
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

		this._getAgreementEmailAttachments(this.callerPage, EMAIL_DOCUMENT_REQUEST_PAYLOAD, e.detail?.docContent);
		const emailResponse = await this.insureFuneralService.emailFuneralDocuments(EMAIL_DOCUMENT_REQUEST_PAYLOAD);
		if (!emailResponse.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(emailResponse.exception);
			return;
		}
		super.isOnlyProductEnquiry = false;
		window.showToastTimed(`success`, `top`, `Success`, `Email document was sent`, 3000, true);

		if (this.callerPage === INSURE_CALLER_PAGE.CANCEL_POLICY || this.callerPage === INSURE_CALLER_PAGE.PAY_PREMIUM || this.callerPage === INSURE_CALLER_PAGE.UPDATE_PLAN || this.callerPage === INSURE_CALLER_PAGE.REINSTATE_POLICY || this.callerPage === INSURE_CALLER_PAGE.FUNERAL_UPDATE_ID_DOB_DIALOG || this.callerPage === INSURE_CALLER_PAGE.FUNERAL_NEW_AGREEMENT_GENERATION) {
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
		const requestCallbackResp = await this.insureFuneralService.requestCallback(requestCallbackRequest);
		if (!requestCallbackResp.succeeded) {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(requestCallbackResp.exception);
		}
	}

	// #endregion NAVIGATION METHODS


	// #region HELPERS

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

	// #endregion HELPERS

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
	 *
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
			case INSURE_RENDER_MODE.LIFE_POLICY_SUMMARY:
				return html`${this._renderLifePolicySummaryPage()}`;
			case INSURE_RENDER_MODE.LIFE_POLICY_PREMIUM_HISTORY:
				return html`${this._renderLifePolicyPremiumHistoryPage()}`;
			case INSURE_RENDER_MODE.LIFE_SMS_HISTORY:
				return html`${this._renderLifeSMSHistoryPage()}`;
			case INSURE_RENDER_MODE.FUNERAL_POLICY_HISTORY:
				return html`${this._renderFuneralPolicyHistoryPage()}`;
			default:
				return html``;
		}
	}

	/**
	 * Render Landing page for Insure existing clients
	 * @return {html} Html of the sub view
	 */
	_renderClientPoliciesPage() {
		return html`
			<horizon-insure-client-summary 
				.showEmailEstimateSuccessToast ="${this.funeralShowEstimateSuccessToast}"
				.clientClaims="${this.claims}"
				.funeralPolicies = "${this.funeralPolicies}" 
				.funeralCancelAgreementDocument="${this.funeralCancelAgreementDocument}" 
				.funeralArrearsPaymentDocumentDetails="${this.funeralArrearsAgreementDocument}"
				.generateDocumentsFuneralCancel="${(contractReference, cancelReason, saveToDocumentum, productCode) => this._generateDocumentsFuneralCancel(contractReference, cancelReason, saveToDocumentum, productCode)}"
				.generateDocumentsFuneralArrears="${(contractReference, payArrears, fromAccount, saveToDocumentum) => this._generateDocumentsFuneralArrears(contractReference, payArrears, fromAccount, saveToDocumentum)}"
				.maxAllowedCover="${isNullorEmpty(this.funeralPolicies?.checkInsuranceDetails[0]?.maxAllowedCover) ? 100000 : this.funeralPolicies?.checkInsuranceDetails[0]?.maxAllowedCover}"
				.requestCallback = "${(firstName, lastName, cellphoneNumber) => this._requestCallback(firstName, lastName, cellphoneNumber)}"
				.funeralGetPolicyArrears = "${() => this._retrieveFuneralPolicyArrears()}"
				.funeralPolicyArrears = "${this.funeralPolicyArrears}"
				.lifePolicies="${this.lifePolicies}" 
				.selectedInsureTabIndex = "${this.selectedInsureTabIndex}"
				.updateEarlyCollectionPreferences="${(electRequest) => this._updateElectOptions(electRequest)}"
				.funeralCancelationReasons="${this.funeralCancelationReasons}"
				.executeActivateBenefit="${(activationReason, benefitType, policy) => this.executeFuneralActivateBenefit(activationReason, benefitType, policy)}"
				.executeLifeActivateBenefit="${(activationReason, benefitType, policy) => this.executeLifeActivateBenefit(activationReason, benefitType, policy)}"
				.executeCancelBenefit="${(benefitType, policy) => this.executeFuneralCancelBenefit(benefitType, policy)}"
				.executeLifeCancelBenefit="${(policy) => this.executeLifeCancelBenefit(policy)}"
				.fetchBenefitDetails="${(contractRef, productCode) => this._retrievePolicyBenefitInfo(contractRef, productCode)}"
				.fetchLifeBenefitDetails="${(contractRef) => this._retrieveLifePolicyBenefitInfo(contractRef)}"
				.lifeCancelationReasons="${this.lifeCancelationReasons}"
				.executeFuneralUpdateIdDoB="${(policy, updatedLife) => this._executeFuneralUpdateIdDoB(policy, updatedLife)}"
				.sendFuneralUpdateIdDobEmail="${(e) => this._sendEmail(e)}"
				.executeFuneralCreateMandate="${(request) => this._executeFuneralCreateMandate(request)}"
				.executeSendFuneralEmail="${(e) => this._sendEmail(e)}"
				.fetchPolicyRescheduleDocumentDetails="${(policy, saveDocument) => this._generatePolicyRescheduleDocument(policy, saveDocument) }"
				@product-enquiry="${() => this._productEnquiry()}"
				@pay-policy="${(e) => this._payFuneralPolicyArrears(e)}"
				@cancel-policy="${(e) => this._cancelFuneralPolicy(e)}"
				@navigate-to-estimate="${(e) => this._goToFuneralPolicyEstimate(e)}"
				@navigate-to-update-plan="${(e) => this._goToFuneralUpdatePlan(e)}"
				@navigate-to-policy-summary="${(e) => this._goToFuneralPolicySummary(e)}"
				@navigate-to-claim-summary="${(e) => this._goToClaimSummary(e)}"
				@navigate-to-policy-transaction-history="${(e) => this._goToFuneralTransactionHistory(e)}"
				@navigate-to-sms-history="${(e) => this._goToFuneralSMSHistory(e)}"
				@navigate-to-life-policy-summary="${(e) => this._goToLifePolicySummary(e)}"
				@navigate-to-life-policy-premium-history="${(e) => this._goToLifePolicyPremiumHistory(e)}"
				@navigate-to-life-sms-history="${(e) => this._goToLifeSMSHistory(e)}"
				@send-funeral-email = "${(e) => this._sendEmail(e)}"
				@navigate-to-funeral-policy-history= "${(e) => this._goToFuneralPolicyHistory(e)}"
				.setInsureIncident = "${(need) => super.setInsureIncident(need)}"
				.showFeatureBanner="${this.showFeatureBanner}"
				.featureBannerMessage="${this.featureBannerMessage}">
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
				.policyDetails = "${this.selectedFuneralPolicyDetails}"
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
		return html`<horizon-insure-funeral-policy-transaction-history 
				.policyTransactionHistory="${this.funeralPolicyTransactionHistory}"
				.getPolicyTransactionHistory="${(startDate, endDate, pageIndex) => this._retrieveFuneralPolicyTransactionHistory(startDate, endDate, pageIndex)}"
				.disposeData="${() => this.funeralPolicyTransactionHistory = []}"
				.policyStartDate="${this.selectedFuneralPolicyStartDate}"
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
				.policyStartDate="${this.selectedLifePolicy.policyStartDate}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				@unloading="${() => this._unloadLifePremiumHistory()}"
			>
			</horizon-insure-life-premium-history>`;
	}

	_renderFuneralSMSHistory() {
		return html`
			<horizon-insure-funeral-sms-history-page
				.contractReference = ${this.selectedFuneralPolicyContractReference} 
				.contactNumber = ${this.callerInformation.verifiedTelephoneNumber}
				.policyStartDate="${this.selectedFuneralPolicyStartDate}"
				.getCommsHistory="${(contractReference, startDate, endDate) => this._retrieveFuneralSMSHistory(contractReference, startDate, endDate)}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-funeral-sms-history-page>`;
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

	/**
	 * Renders the pocket summary page, configured with the selected pocket type
	 * 
	 * @returns {html} html
	 */
	_renderLifePolicySummaryPage() {
		return html`
			<horizon-insure-life-policy-summary 
				.selectedLifePolicy="${this.selectedLifePolicy}"
				.lifePolicyMandates = "${this.lifePolicyMandates}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-life-policy-summary >`;
	}

	/**
	 * Renders life cover sms history page
	 * 
	 * @returns {html} html
	 */
	_renderLifeSMSHistoryPage() {
		return html`
			<horizon-insure-life-sms-history-page
			.getCommsHistory="${() => this._retrieveLifeSMSHistory()}"
			.contractReference="${this.selectedLifePolicy.contractReference}"
			.policyStartDate="${this.selectedLifePolicy.policyStartDate}"
			@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-life-sms-history-page>
		`;
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

	_renderFuneralPolicyHistoryPage() {
		return html`
		<horizon-insure-funeral-policy-history
			.policy="${this.selectedFuneralPolicyDetails}"
			.fetchPolicyHistory="${(startDate, endDate, policy) => this._fetchPolicyHistory(startDate, endDate, policy)}"
			.fetchPolicyHistoryDetails= "${(activityID, policy) => this._fetchPolicyHistoryDetails(activityID, policy)}"
			@navigate-to-summary="${() => this._rerenderClientSummary(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
		</horizon-insure-funeral-policy-history>
		`
	}

	// #endregion RENDERING


}
customElements.define(`horizon-insure-backoffice`, InsureBackOfficeView);