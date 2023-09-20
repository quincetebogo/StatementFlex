import { Component, css, html } from 'platform/elements';
import { INSURE_CALLER_PAGE, LIFE_POCKET_TYPES, POLICY_OPTIONS, POLICY_RULES, Status } from 'app/constants/InsureCommon';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { ClientPoliciesEvents } from 'app/constants/telemetry/events/Insure';
import { HorizonInsureStore } from 'app/store/HorizonInsureStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { LANDING_PAGE_NEEDS } from 'app/constants/Common';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatCurrencyInsureCoverAmount } from 'app/utils/insureUtils';
import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';

import 'app/components/insure/ClientClaimsSummary';
import 'app/components/dialogs/insure/CFPAgreementDialog';
import 'app/components/dialogs/insure/LodgeClaimInfoDialog';
import 'app/components/dialogs/insure/RequestCallbackDialog';
import 'app/components/dialogs/insure/funeral/PayPremiumDialog';
import 'app/components/dialogs/insure/funeral/PayPremiumConfirmationDialog';
import 'app/components/dialogs/insure/funeral/PayPremiumAgreementDialog';
import 'app/components/dialogs/insure/funeral/CancelPolicyDialog';

import 'app/components/dialogs/insure/life/LifeUpdateBankDetailsDialog';

const MAIN_LIFE_MINIMUM_COVER = 5000;

/**
 * Client Summary component showing all the claims, funeral and life cover policies a client currently has on their account
 * This is the primary landing screen for client that has insurance products
 * 
 * Events Raised 
 * -------------
 * 
 * product-enquiry
 * pay-policy
 * cancel-policy
 * navigate-to-estimate
 * navigate-to-update-plan
 * navigate-to-policy-summary
 * navigate-to-claim-summary
 * navigate-to-policy-transaction-history
 * navigate-to-sms-history

 * _funeralPolicyExpanded
 * _collapsed
 * 
 * @export
 * @class ClientPolicies
 * @extends {Component}
 */
class ClientSummary extends Component {

	// #region INITIALISATION

	constructor() {
		super();

		this._horizonInsureStore = HorizonInsureStore.getInstance();
		this._telemetry = HorizonTelemetry.getInstance();

		this.clientClaims = null;
		this.funeralPolicies = null;
		this.funeralArrearsPaymentAmount = 0;

		this.lifePolicies = null;
		this.selectedLifePolicy = null;

		this.showFuneralCancelPolicyDialog = false;
		this.showFuneralEmailPlanDialog = false;
		this.showFuneralPayPremiumDialog = false;
		this.showFuneralPayPremiumConfirmationDialog = false;
		this.showFuneralPayPremiumAgreementDialog = false;
		this.showLodgeClaimInfoDialog = false;
		this.showCFPAgreementDialog = false;
		this.showEmailEstimateSuccessToast = false;
		this.showRequestCallbackDialog = false;
		this.showRequestFMSCallbackSuccessToast = false;
		this.selectedInsureTabIndex = 0;
		this.showLifeUpdateBankDetailsDialog = false;

		this.telemetryEvents = {};
	}

	// #endregion INITIALISATION

	// #region PROPERTIES

	/**
	 * @property {Number} maxAllowedCover  CheckInsurance limit for remaining cover limit
	 * @property {Object} clientClaims Client Claims
	 * @property {Object} funeralPolicies All client funeral policies
	 * @property {Object} funeralPolicyArrears Data & flags from Arrears Service
	 * @property {Object} funeralPolicyPayArrears contains the arrears that will be paid
	 * @property {Number} funeralPayArrearsFromAccount contains the account number for the account the client will be paying from
	 * @property {Number} funeralArrearsPaymentAmount contains the total arrear amount to be paid
	 * @property {Function} generateDocumentsFuneralArrears Callback function to fetch arrears payment document
	 * @property {Object} funeralArrearsPaymentDocumentDetails payment document
	 * @property {String} contractReferenceToCancel Selected contract reference for cancel action
	 * @property {Function} generateDocumentsFuneralCancel Callback function to fetch Cancel Policy Agreement
	 * @property {Object} funeralCancelAgreementDocument cancel document
	 * @property {boolean} readOnlyMode toggle to disable actions based on rules
	 * @property {boolean} showFuneralCancelPolicyDialog Determines if the Cancel Policy dialog should be shown
	 * @property {boolean} showFuneralEmailPlanDialog Determines if the Email Plan dialog should be shown
	 * @property {boolean} showFuneralPayPremiumDialog Determines if the Pay Premium dialog should be shown
	 * @property {boolean} showFuneralPayPremiumConfirmationDialog Determines if the Pay Premium Confirmation dialog should be shown
	 * @property {boolean} showFuneralPayPremiumAgreementDialog Determines if the Pay Premium Agreement dialog should be shown
	 * @property {boolean} showLodgeClaimInfoDialog Determines if the Claim Inf dialog should be shown
	 * @property {boolean} showCFPAgreementDialog Determines if the CFP agreement dialog should be shown
	 * @property {String} selectedFlow current selected flow
	 * @property {String} selectedContractRef selected policy contract reference
	 * @property {boolean} canReinstate determines whether a policy can be reinstated
	 * @property {Object} selectedPolicyItem selected policy item
	 * @property {String} productCode policy product code
	 * @property {Function} requestCallback policy product code
	 * @property {Function} funeralGetPolicyArrears Callback function to fetch arrears and payable accounts
	 * @property {Object} lifePolicies Contains clients life policies
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			maxAllowedCover: { type: Number, state: true },
			clientClaims: { type: Object, state: true },
			funeralPolicies: { type: Object, state: true },

			lifePolicies: { type: Object, state: true },

			funeralPolicyArrears: { type: Object, state: true },
			funeralPolicyPayArrears: { type: Object, state: true },
			funeralPayArrearsFromAccount: { type: Number, state: true },
			funeralArrearsPaymentAmount: { type: Number, state: true },
			generateDocumentsFuneralArrears: { type: Object },
			funeralArrearsPaymentDocumentDetails: { type: Object },
			funeralGetPolicyArrears: { type: Object, state: true },

			contractReferenceToCancel: { type: String, state: true },
			generateDocumentsFuneralCancel: { type: Object, state: true },
			funeralCancelAgreementDocument: { type: Object, state: true },

			readOnlyMode: { type: Boolean, state: true },
			showFuneralCancelPolicyDialog: { type: Boolean, state: true },
			showFuneralEmailPlanDialog: { type: Boolean, state: true },
			showFuneralPayPremiumDialog: { type: Boolean, state: true },
			showFuneralPayPremiumConfirmationDialog: { type: Boolean, state: true },
			showFuneralPayPremiumAgreementDialog: { type: Boolean, state: true },
			showLodgeClaimInfoDialog: { type: Boolean, state: true },
			showCFPAgreementDialog: { type: Boolean, state: true },
			showRequestCallbackDialog: { type: Boolean, state: true },
			showLifeUpdateBankDetailsDialog: { type: Boolean, state: true },

			selectedInsureTabIndex: { type: Number, state: true },
			selectedFlow: { type: String, state: true },
			selectedContractRef: { type: String, state: true },
			canReinstate: { type: Boolean, state: true },
			selectedPolicyItem: { type: Object, state: true },
			productCode: { type: String, state: true },
			showEmailEstimateSuccessToast: { type: Boolean, state: true },
			showRequestFMSCallbackSuccessToast: { type: Boolean, state: true },
			requestCallback: { type: Object, state: true },

			selectedLifePolicy: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		this.telemetryEvents = ClientPoliciesEvents;
		await this._telemetry.startSpan(this.telemetryEvents.CLIENT_POLICIES, {});
		this._initialise();

	}

	async disconnectedCallback() {
		super.disconnectedCallback();
		await this._telemetry.endSpan(this.telemetryEvents.CLIENT_POLICIES, {});
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region EVENT HANDLERS

	/**
	 * Fire navigate event to Policy Summary
	 * @param {String} contractReference contract reference
	 * @returns {void}
	 */
	_goToFuneralPolicySummary(contractReference) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_POLICY_DETAILS, {});
		this.dispatchEvent(new CustomEvent(`navigate-to-policy-summary`, {
			detail: {
				policyContractReference: contractReference,
				selectedInsureTabIndex: this.selectedInsureTabIndex
			}
		}));
	}

	/**
	 * Fire navigate event to Policy Summary for Life Cover
	 * @param {String} lifePolicy selected life policy
	 * @returns {void}
	 */
	_goToLifePolicySummary(lifePolicy) {
		this.dispatchEvent(new CustomEvent(`navigate-to-life-policy-summary`, {
			detail: {
				lifePolicy: lifePolicy,
				selectedInsureTabIndex: this.selectedInsureTabIndex
			}
		}));
	}

	/**
	 * Fire navigate event to Policy Transaction History
	 * @param {object} policyItem policy item details
	 * @returns {void}
	 */
	_goToFuneralPolicyTransactionHistory(policyItem) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_TRANSACTION_HISTORY, {});
		this.dispatchEvent(new CustomEvent(`navigate-to-policy-transaction-history`, {
			detail: {
				policyNumber: policyItem.contractReference,
				bankName: policyItem.deductionDetails?.bankDetails?.bank,
				accountNumber: policyItem.deductionDetails?.bankDetails?.accountNumber,
				arrearsAmount: policyItem.arrearDetails?.outstandingAmount,
				selectedInsureTabIndex: this.selectedInsureTabIndex
			}
		}));
	}

	/**
	 * Fire Pay Policy event
	 * @returns {void}
	 */
	_funeralPayPremiumConfirm() {
		this.dispatchEvent(new CustomEvent(`pay-policy`, {
			detail: {
				payArrears: this.funeralPolicyPayArrears,
				fromAccount: this.funeralPayArrearsFromAccount
			}
		}));
	}

	/**
	 * Cancel Policy event
	 * @param {event} e event
	 * @returns {void}
	 */
	_funeralCancelPolicyConfirm(e) {
		this.dispatchEvent(new CustomEvent(`cancel-policy`, {
			detail: {
				contractReference: this.contractReferenceToCancel,
				cancellationReason: e.detail.cancellationReason
			}
		}));
	}

	/**
	 * Fire navigate to SMS History
	 * 
	 * @param {Object} policyItem policy item
	 * @returns {void}
	 */
	_goToFuneralSMSHistory(policyItem) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_SMS_HISTORY, {});
		this.dispatchEvent(new CustomEvent(`navigate-to-sms-history`, {
			detail: {
				policyItem: policyItem,
				selectedInsureTabIndex: this.selectedInsureTabIndex
			}
		}));
	}

	/**
	 * Invoke this function when Send button is clicked on Email Popup
	 * @param {string} emailAddress email address
	 * @returns {void}
	 */
	_sendEmail(emailAddress) {
		this.dispatchEvent(new CustomEvent(`send-email`, { detail: { emailId: emailAddress, callerPage: INSURE_CALLER_PAGE.CLIENT_POLICIES, contractRef: this.emailContractRef } }));
		this.showFuneralEmailPlanDialog = false;
	}

	/**
	 * Close Pay Premium Dialog and Open the Pay Premium Confirmation Dialog.
	 *
	 * @param {event} e contains the values pay arrears and amount to be paid
	 * @returns {void}
	 */
	_showFuneralPayPremiumConfirmationDialog(e) {
		this.funeralPolicyPayArrears = e.detail.payArrears;
		this.funeralArrearsPaymentAmount = e.detail.amountToPay;
		this.funeralPayArrearsFromAccount = e.detail.fromAccount;

		this.showFuneralPayPremiumDialog = false;
		this.showFuneralPayPremiumConfirmationDialog = true;
	}

	/**
	 * Open Pay Premium Agreement Dialog
	 * @returns {void}
	 */
	_openFuneralPayPremiumAgreementDialog() {
		this.showFuneralPayPremiumConfirmationDialog = false;
		this.showFuneralPayPremiumAgreementDialog = true;
	}

	/**
	 * Get the Cancel Policy Document
	 * 
	 * @param {String} contractReference contract Reference
	 * @param {String} cancelReason cancel Reason
	 * @returns {void}
	 */
	async _generateDocumentsFuneralCancel(contractReference, cancelReason) {
		await this.generateDocumentsFuneralCancel(contractReference, cancelReason, false);
	}

	/**
	 * Get the Arrears Payment Document
	 * @param {string} contractReference contract Reference
	 * @return {void} 
	 */
	async _generateDocumentsFuneralArrears(contractReference) {
		await this.generateDocumentsFuneralArrears(contractReference, this.funeralPolicyPayArrears, this.funeralPayArrearsFromAccount, false);
	}

	/**
	 * Event for closing cancel dialog, reset document state 
	 * @returns {void}
	 */
	_closeFuneralCancelPolicyDialog() {
		this.showFuneralCancelPolicyDialog = false;
		this.funeralCancelAgreementDocument = undefined;
	}

	/**
	 * determines whether to show the email dialog
	 * @param {String} contractRef Policy contract reference
	 * @returns {void} 
	 */
	_showEmailPlanDialog(contractRef) {
		this.emailContractRef = contractRef;
		this.showFuneralEmailPlanDialog = true;
	}

	/**
	 * Fire navigate event to Product Enquiry
	 * @returns {void}
	 */
	_productEnquiry() {
		this.dispatchEvent(new CustomEvent(`product-enquiry`, { detail: {} }));
	}

	/**
	 * Expand Policy Item
	 * @param {Object} policyItem - Policy details 
	 * @returns {void}
	 */
	_funeralPolicyExpanded(policyItem) {
		const isExpanded = this.policiesList?.some(x => x.contractReference !== policyItem.contractReference && x.isExpanded === true);

		policyItem.isExpanded = true;
		this.policiesList = this.policiesList?.forEach(item => {
			if (item.contractReference !== policyItem.contractReference) {
				item.isExpanded = false;
			}
		});

		this.requestUpdate();
		const parentElement = this.shadowRoot.getElementById(`client-policies-box`);
		const childElement = this.shadowRoot.getElementById(`horizon-expander-${policyItem.contractReference}`);

		if (isExpanded) {
			parentElement.scrollTop = childElement.offsetTop - 445;
		} else {
			parentElement.scrollTop = childElement.offsetTop - 380;
		}
	}

	/**
	 * Collapse Policy Item
	 * @param {Object} policyItem - Policy details 
	 * @returns {void}
	 */
	_funeralPolicyCollapsed(policyItem) {
		policyItem.isExpanded = false;
		this.requestUpdate();
	}

	/**
	 * Expand Pocket Item
	 * @param {Object} pocketItem - Pocket details 
	 * @returns {void}
	 */
	_lifePolicyExpanded(pocketItem) {
		const isExpanded = this.pocketList?.some(x => x.pocketType !== pocketItem.pocketType &&
			x.isExpanded === true);

		pocketItem.isExpanded = true;
		this.pocketList = this.pocketList?.forEach(item => {
			if (item.pocketType !== pocketItem.pocketType) {
				item.isExpanded = false;
			}
		});

		this.requestUpdate();
		const parentElement = this.shadowRoot.getElementById(`client-pockets-box`);
		const childElement = this.shadowRoot.getElementById(`horizon-expander-${pocketItem.pocketType}`);

		if (isExpanded) {
			parentElement.scrollTop = childElement.offsetTop - 445;
		} else {
			parentElement.scrollTop = childElement.offsetTop - 380;
		}
	}

	/**
	 * Collapse Pocket Item
	 * @param {Object} pocketItem - Pocket details 
	 * @returns {void}
	 */
	_lifePolicyCollapsed(pocketItem) {
		pocketItem.isExpanded = false;
		this.requestUpdate();
	}

	/**
	 * displays the CFP disclosure
	 * @param {String} flow selected flow
	 * @param {Object} [policyItem = null] policy item
	 * @returns {void}
	 */
	_displayCFPDisclosure(flow, policyItem = null) {

		if (this.readOnlyMode === true) {
			return;
		}

		this.selectedFlow = flow;
		this.selectedContractRef = policyItem?.contractReference;
		this.canReinstate = policyItem?.canReinstate;
		this.selectedPolicyItem = policyItem;

		if (policyItem === null) {
			this.productCode = `Capitec`;
		} else {
			this.productCode = policyItem.productCode;
		}


		if (this._horizonInsureStore.getCFPStatus() === false || this._horizonInsureStore.getCFPStatus() === null) {
			this.showCFPAgreementDialog = true;
		} else {
			this._navigateAfterCFP();
		}
	}

	/**
	 * Callback to determine  here to navigate after accepting the Insure CFP disclosure
	 * @returns {void}
	 */
	_navigateAfterCFP() {
		this._horizonInsureStore.setCFPStatus(true);
		switch (this.selectedFlow) {
			case `update`:
				this.showCFPAgreementDialog = false;
				this._goToFuneralUpdatePlan(this.selectedContractRef, this.canReinstate);
				break;
			case `cancel`:
				this.showCFPAgreementDialog = false;
				this._openFuneralCancelPolicyDialog(this.selectedContractRef);
				break;
			case `adhoc`:
				this.showCFPAgreementDialog = false;
				this._openFuneralPayPremiumDialog();
				break;
			case `estimate`:
				this.showCFPAgreementDialog = false;
				this._goToFuneralEstimate();
				break;
			default:
				this.showCFPAgreementDialog = false;
				break;
		}
	}

	/**
	 * Event handler to call request callback service
	 * @param {string} firstName Client first name
	 * @param {string} lastName Client last name`
	 * @param {number} cellphoneNumber client cellphone number
	 * @returns {void}
	 */
	async _requestCallback(firstName, lastName, cellphoneNumber) {
		await this.requestCallback(firstName, lastName, cellphoneNumber);
		this.showRequestCallbackDialog = false;
		this.showRequestFMSCallbackSuccessToast = true;
		window.setTimeout(() => this.showRequestFMSCallbackSuccessToast = false, 2000);
	}

	// #endregion EVENT HANDLERS

	// #region PRIVATE FUNCTIONS

	_initialise() {
		// await super._inicidentManager_(LANDING_PAGE_NEEDS.INSURE, () => this._toggleBusyFlag());
		// await super.createAndClassifySubIncident(null, false);
	}

	/**
	 * Open Pay Premium dialog 
	 * @param {Object} policyItem policy item
	 * @returns {void}
	 */
	async _openFuneralPayPremiumDialog() {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_PAY_POLICY, {});
		await this.funeralGetPolicyArrears();
		this.showFuneralPayPremiumDialog = true;
	}

	/**
	 * event to open the funeral cancel policy dialog
	 * @param {string} contractReference contract reference
	 * @returns {void} 
	 */
	_openFuneralCancelPolicyDialog(contractReference) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_CANCEL_POLICY, {});
		this.contractReferenceToCancel = contractReference;
		this.showFuneralCancelPolicyDialog = true;
	}

	/**
	 * opens the life cancel policy dialog
	 * @returns {void} 
	 */
	_openLifeCancelPolicyDialog() {

	}

	/**
	 * opens the life cancel policy dialog
	 * @param {Object} selectedPolicy policy being updated
	 * @returns {void} 
	 */
	_openLifeUpdateBankDetailsDialog(selectedPolicy) {
		console.log(`_openLifeUpdateBankDetailsDialog`);
		this.showLifeUpdateBankDetailsDialog = true;
		this.selectedLifePolicy = selectedPolicy;
	}

	/**
	 * Fire navigate event to Claim Summary
	 * @param {event} e event
	 * @returns {void}
	 */
	_goToClaimSummary(e) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_CLAIM_DETAILS, {});
		this.dispatchEvent(new CustomEvent(`navigate-to-claim-summary`, {
			detail: {
				claim: e.detail.claim,
				selectedInsureTabIndex: this.selectedInsureTabIndex
			}
		}));
	}

	/**
	 * Fire navigate event to Update Plan
	 * @param {string} contractReference contract reference
	 * @param {string} canReinstate canReinstate
	 * @returns {void}
	 */
	_goToFuneralUpdatePlan(contractReference, canReinstate) {
		if (canReinstate === false) {
			this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_UPDATE_PLAN, {});
		} else {
			this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_REINSTATE_PLAN, {});
		}
		this.dispatchEvent(new CustomEvent(`navigate-to-update-plan`, {
			detail: {
				policyContractReference: contractReference,
				canReinstate: canReinstate,
				selectedInsureTabIndex: this.selectedInsureTabIndex
			}
		}));
	}

	/**
	 * Fire navigate event to Estimate
	 * @returns {void}
	 */
	_goToFuneralEstimate() {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_GET_ESTIMATE, {});
		this.dispatchEvent(new CustomEvent(`navigate-to-estimate`, {
			detail: {
				selectedInsureTabIndex: this.selectedInsureTabIndex
			}
		}));
	}

	/**
	 * Determine which options to show
	 * @param {object} policyItem - each policy item
	 * @returns {void}
	 */
	_calculateFuneralOverflowOptions(policyItem) {
		policyItem.showOptions = [];

		if (policyItem.canReinstate) {
			policyItem.showOptions.push(POLICY_OPTIONS.EMAIL_PLAN);
			policyItem.showOptions.push(POLICY_OPTIONS.REINSTATE);
		} else {
			policyItem.showOptions.push(POLICY_OPTIONS.EMAIL_PLAN);

			if (policyItem.status === `Active` || policyItem.status === `PendingInForce`) {
				if (policyItem.arrearDetails?.outstandingAmount > 0) {
					policyItem.showOptions.push(POLICY_OPTIONS.PAY_ARREARS);
				}

				policyItem.showOptions.push(POLICY_OPTIONS.UPDATE_PLAN);
				policyItem.showOptions.push(POLICY_OPTIONS.CANCEL_PLAN);
			}
		}
		policyItem.showOptions.push(POLICY_OPTIONS.SMS_HISTORY);
		policyItem.showOptions.push(POLICY_OPTIONS.TRANSACTION_HISTORY);
	}

	/**
	 * get option to show
	 * @param {string} showOption - option to show 
	 * @param {object} policyItem - policy object
	 * @returns {html} - html content of option
	 */
	_getFuneralOptions(showOption, policyItem) {
		switch (showOption) {
			case POLICY_OPTIONS.REINSTATE:
				return html`<horizon-option-button 
				data-automation-id="insure-policy-options-reinstate"
				class="button-margin" 
				label="Re-Issue" 
				icon="system/history-action"
				.disabled="${this.readOnlyMode}"
				@click="${() => this._displayCFPDisclosure(`update`, policyItem)}">
			</horizon-option-button>`;
			case POLICY_OPTIONS.EMAIL_PLAN:
				return html`<horizon-option-button 
				data-automation-id="insure-policy-options-email-plan"
				class="button-margin" 
				label="Email Plan" 
				icon="system/profile-action"
				.disabled="${this.readOnlyMode}"
				@click="${() => this._showEmailPlanDialog(policyItem.contractReference)}">
			</horizon-option-button>`;
			case POLICY_OPTIONS.PAY_ARREARS:
				return html`<horizon-option-button 
				data-automation-id="insure-policy-options-pay-arrears"
				class="button-margin" 
				label="Pay Arrears" 
				icon="status/error"
				.disabled="${this.readOnlyMode}"
				@click="${() => this._displayCFPDisclosure(`adhoc`, policyItem)}">
			</horizon-option-button>`;
			case POLICY_OPTIONS.UPDATE_PLAN:
				return html`<horizon-option-button 
				data-automation-id="insure-policy-options-update-plan"
				class="button-margin" 
				label="Update Plan" 
				icon="system/profile-action"
				.disabled="${this.readOnlyMode}"
				@click="${() => this._displayCFPDisclosure(`update`, policyItem)}">
			</horizon-option-button>`;
			case POLICY_OPTIONS.CANCEL_PLAN:
				return html`<horizon-option-button 
				data-automation-id="insure-policy-options-cancel-plan"
				class="button-margin" 
				label="Cancel Plan" 
				icon="system/delete-action"
				.disabled="${this.readOnlyMode}"
				@click="${() => this._displayCFPDisclosure(`cancel`, policyItem)}">
			</horizon-option-button>`;
			case POLICY_OPTIONS.TRANSACTION_HISTORY:
				return html`<horizon-option-button 
				data-automation-id="insure-policy-options-transaction-history"
				class="button-margin" 
				label="Transaction History" 
				icon="system/transfer-action"
				@click="${() => this._goToFuneralPolicyTransactionHistory(policyItem)}">
			</horizon-option-button>`;
			case POLICY_OPTIONS.SMS_HISTORY:
				return html`<horizon-option-button 
				data-automation-id="insure-policy-options-sms-history"
				class="button-margin" 
				label="SMS History" 
				icon="system/send-action"
				@click="${() => this._goToFuneralSMSHistory(policyItem)}">
			</horizon-option-button>`;
			default:
				return html``;
		}
	}

	/**
	 * get more option to show
	 * @param {string} showOption - option to show 
	 * @param {object} policyItem - policy object
	 * @returns {html} - html content of option
	 */
	_getFuneralOverflowOptions(showOption, policyItem) {
		switch (showOption) {
			case POLICY_OPTIONS.REINSTATE:
				return html`<capitec-overflow-menu-item icon="system/history-action" 
					label="Re-Issue" @click="${() => this._displayCFPDisclosure(`update`, policyItem)}">
				</capitec-overflow-menu-item>`;
			case POLICY_OPTIONS.EMAIL_PLAN:
				return html`<capitec-overflow-menu-item icon="system/profile-action" 
					label="Email Plan">
				</capitec-overflow-menu-item>`;
			case POLICY_OPTIONS.PAY_ARREARS:
				return html`<capitec-overflow-menu-item icon="status/error" 
					label="Pay Arrears" @click="${() => this._displayCFPDisclosure(`adhoc`, policyItem)}">
				</capitec-overflow-menu-item>`;
			case POLICY_OPTIONS.UPDATE_PLAN:
				return html`<capitec-overflow-menu-item icon="system/profile-action" 
					label="Update Plan" @click="${() => this._displayCFPDisclosure(`update`, policyItem)}">
				</capitec-overflow-menu-item>`;
			case POLICY_OPTIONS.CANCEL_PLAN:
				return html`<capitec-overflow-menu-item icon="system/delete-action" 
					label="Cancel Plan" @click="${() => this._displayCFPDisclosure(`cancel`, policyItem)}">
				</capitec-overflow-menu-item>`;
			case POLICY_OPTIONS.TRANSACTION_HISTORY:
				return html`<capitec-overflow-menu-item icon="system/transfer-action" 
					label="Transaction History" @click="${() => this._goToFuneralPolicyTransactionHistory(policyItem)}">
				</capitec-overflow-menu-item>`;
			case POLICY_OPTIONS.SMS_HISTORY:
				return html`<capitec-overflow-menu-item icon="system/send-action" 
					label="SMS History" @click="${() => this._goToFuneralSMSHistory(policyItem)}">
				</capitec-overflow-menu-item>`;
			default:
				return html``;
		}
	}

	/**
	 * determines the value to display for Total Premium
	 * @param {Object} policyItem Policy Item
	 * @returns {String} string
	 */
	_funeralTotalPremiumLabel(policyItem) {
		if (policyItem.status === `NotTakenUp` || policyItem.status === `Lapsed`) {
			return `-`;
		}
		return isNullorEmpty(policyItem.totalPremium) ? formatCurrency(0) : formatCurrency(policyItem.totalPremium);
	}

	/**
	 * determines the value to display for Next Debit Order
	 * @param {Object} policyItem policyItem
	 * @returns {String} string
	 */
	_funeralNextDebitOrderLabel(policyItem) {
		if (policyItem.status === `NotTakenUp` || policyItem.status === `Lapsed`) {
			return `-`;
		}
		return isNullorEmpty(policyItem.paymentSchedule?.nextPaymentDate) ? `-` : formatDate(policyItem.paymentSchedule?.nextPaymentDate, `dd mmm yyyy`);
	}

	/**
	 * determines the value to display for Arrears
	 * @param {Object} policyItem policy item
	 * @param {number} sumArrears policy Item
	 * @returns {string} string
	 */
	_funeralArrearsLabel(policyItem, sumArrears) {
		if (policyItem.status === `NotTakenUp` || policyItem.status === `Lapsed`) {
			return `-`;
		}
		return isNullorEmpty(sumArrears) ? formatCurrency(0) : formatCurrency(sumArrears);
	}

	/**
	 * Show dialog explaining how to Lodge a Claim
	 * @returns {void}
	 */
	_openClaimInfoDialog() {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_LODGE_CLAIM_INFO, {});
		this.showLodgeClaimInfoDialog = false;
	}

	/**
	 * Status to show on funeral policy
	 * @param {object} policyItem Current iteration policy
	 * @returns {string} displayStatus
	 */
	_getFuneralPolicyDisplayStatus(policyItem) {
		let displayStatus = policyItem?.displayStatus;
		if (policyItem?.policyRule !== `Standard`) {
			displayStatus = POLICY_RULES[policyItem?.policyRule.toUpperCase()];
		}
		return displayStatus;
	}

	/**
	 * Timer to hide Estimate email success toast
	 * @returns {void}
	 */
	_startFuneralEstimateToastTimer() {
		window.setTimeout(() => this.showEmailEstimateSuccessToast = false, 3000);
	}

	/**
	 * Add all pocket coverage together and format to currency
	 * @returns {string} total cover
	 */
	_calculateLifeTotalCoverAmount(policy) {
		let totalCover = 0;
		policy?.pockets?.forEach(pocket => {
			totalCover += pocket.coverage;
		});
		return formatCurrencyInsureCoverAmount(formatCurrency(totalCover));
	}

	/**
	 * Calculate total arrears for life cover policy
	 * @param {Object} policy tab event
	 * @returns {string} formatted total
	 */
	_calculateLifeArrearsAmount(policy) {
		let totalArrears = 0;
		policy?.arrears?.forEach(arrears => {
			totalArrears += parseFloat(arrears.arrearsPaymentDueAmount, 10);
		});
		return totalArrears;
	}

	/**
	 * Event to capture when tabs changes
	 * @param {*} e tab event
	 * @returns {void}
	 */
	_selectInsureTab(e) {
		this.selectedInsureTabIndex = e.detail.selectedIndex;
	}

	// #endregion PRIVATE FUNCTIONS

	// #region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			
			${INSURE_CSS}

			.insure-title-bar{
				margin-bottom: 0px; 
				border-top-left-radius: 5px; 
				border-top-right-radius: 5px;
			}
			capitec-tab-group {
				--theme-tab-indicator-border-radius: 0px;
				--theme-tab-border-bottom: 0px;
				--theme-tab-font-weight: 400;
				--theme-container-padding-left: 0px;
				--theme-container-padding-right: 0px;
				--theme-container-padding-bottom: 0px;
				--theme-tab-bar-height: 64px;
			}
			.card {
				width: 100%;
				
			}
			capitec-title-bar {
				--theme-titlebar-padding: 12px 16px;
				margin-bottom: 0px;
			}
			capitec-title-bar > capitec-label {
				--theme-label-title-font-size: 22px;
				--theme-label-title-font-weight: 500;
			}
			capitec-title-bar > capitec-icon {
				--theme-icon-size-medium: 24px;
			}
			.accounts-box {
				overflow: initial;
				width: auto;
				height: auto;
				min-height: 500px;
				--theme-container-padding-left: 16px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-bottom: 16px;
				--theme-container-padding-top: 0px;
				--theme-layout-gap-spacing: 0px;
			}

			.life-policies-box {
				overflow: initial;
				width: auto;
				height: auto;
				--theme-container-padding-left: 16px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-top: 0px;
				--theme-layout-gap-spacing: 0px;
			}

			capitec-group > capitec-title-bar {
				--theme-titlebar-min-height: 32px;
				--theme-titlebar-padding: 0px 16px 0px 16px;
				--theme-type-default-background: rgb(244, 244, 244);
				--theme-label-title-font-size: 15px;
				--theme-label-title-font-weight: 600;
				--theme-type-default-font-color: #3A3A3A;
				--theme-label-title-font-size: 14px;
				--theme-titlebar-shadow: 0px;
				--theme-titlebar-item-gap: 0px;

				border-top: 1px solid #E1E1E1;
				border-bottom: 1px solid #E1E1E1;
			}
			.options-group {
				height: 80px; 
				margin: 17px 0px 15px 0px;
				width: auto;
			}
			.options-group > horizon-option-button {
				width: 184px;
				height: 80px;
				margin-left: 16px;
				padding: 0px;

				--horizon-option-btn-text-margin-top: 3px;
				--horizon-option-btn-icon-height: 26px;
				--horizon-option-btn-icon-width: 26px;
			}

			.notification {
				width: 350px;
				margin: auto;
			}

			/* Expander header and content styles */
			horizon-expander {
				margin-bottom: 16px;
				--theme-expander-height: auto;
				--theme-layout-gap-spacing: 0px;
				--theme-expander-header-height: 64px;
				--theme-expander-header-padding: 0 6px 0 0;
				--theme-expander-indicator-width: 16px;
			}
			horizon-expander[expanded] {
				box-shadow: 0 6px 10px 0.25px rgb(0 0 0 / 7%);
				display: block;
				--theme-overflow-menu-width: 200px !important;
			}
			.expander-header > capitec-icon {
				--theme-icon-size-default: 20px;
				--theme-layout-gap-spacing: 0px;
				margin-left: 10px;
			}
			.expander-header > capitec-button {
				width: 128px;
			}
			.expander-content {
				border-left: 1px solid #E1E1E1;
				border-bottom: 1px solid #E1E1E1;
				border-right: 1px solid #E1E1E1;
				border-radius: 0px 0px 4px 4px
			}
			.expander-content > capitec-title-bar {
				border-top: 0px;
			}
			.expander-header > horizon-label[label="Status"] {
				width: 200px;
				text-overflow: ellipsis;
			}
			horizon-label {
				width: 135px;
				padding-left: 16px;
				--theme-layout-gap-spacing: 0px;
				--horizon-label-text-height: 20px;
				--horizon-label-text-color: #3A3A3A;
				--horizon-label-text-line-height: 20px;
				
				--horizon-label-value-height: 20px;
				--horizon-label-value-color: #3A3A3A;
				--horizon-label-value-font-size: 16px;
				--horizon-label-value-line-height: 20px;
			}
			.label-policy-number {
				--theme-label-cursor: pointer;
				--horizon-label-value-color: #009DE0;
			}
			.fixed-label {
				width: 22%;
				--horizon-label-max-overflow-width: 170px;
			}
			.vertical-line {
				height: 40px;
				width: 1px;
				background-color: #E1E1E1;
			}

			/* No results available styles */
			.no-results {
				--theme-label-strong-font-size: 18px;
				--theme-label-strong-font-weight: 600;
				--theme-label-font-color: #3A3A3A;
			}
			.no-result-group {
				width: 1032px;
				margin-top: 50px;
			}

			.action-card{
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 10px;
				min-width: 186px;
				min-height: 80px;
				margin-left: 16px;
			}
			.policy-item {
				padding-left: 30px;
			}
			.slot-content {
				min-height: 180px;
			}
			.arrears{
				--horizon-label-value-color: #C83C37 !important;
			}
			.header-label{
				height: auto;
				padding-left: 16px;
			}
			.strong-label{
				font-size: 16px;
				font-weight: bold;
			}

			.header-popover{
				z-index: 1;
			}

			#benefits-table{
				width: 100%;
				font-family: var(--theme-font-family, Arial, Helvetica, sans-serif);
    			font-weight: var(--theme-font-weight, 300);
				margin-top: 20px;
			}

			#benefits-table td {
				background-color: #f3f3f3;
				padding: 5px 10px;
			}

			#no-results-box{
				margin-bottom: 20px;
			}

			#policies-container{
				margin-bottom:20px;
			}

			capitec-icon.default {
				width: 44px;
				height: 38px;
			}

			.more-options-button{
				font-size: 16px;
				font-weight: 500; 
				margin-bottom: 9px;
			}
			
			.more-options-card{
				gap: 0px;
			}

			.life-policy-box{
				height: 96px;
				min-height: auto;
				padding-top: 15px;
				padding-bottom: 15px;
				background-color: rgb(243, 243, 243);
				padding-left: 15px;
				padding-right: 15px;
				border-radius: 0px;
				margin-bottom: 15px;
			}

			.life-policy{
				min-height: auto;
				height: 65px;
				padding-top: 10px;
				padding-bottom: 10px;
				padding-left: 10px;
				padding-right: 10px;
				background-color: #ffffff;
				border-radius: 4px;
				border-width: 1px;
				border-style: solid;
				border-color: rgb(225, 225, 225);
				margin-bottom: 15px;
			}

			.life-pol-label{
				width: 180px;
			}

			.pocket-type-label{
				width: 195px;
				padding-left: 20px;
				font-size: unset;
			}

			.life-policy-container{
				display: flex;
			}

			.payment-label{
				width: 180px;
			}

			.life-arrears-notify{
				padding: 0px 10px;
			}

			#inactive-life-policies-title{
				margin-bottom: 10px;
			}`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} html
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
			${this._renderDialogs()}
		`;
	}

	/**
	 * Generates the component template for web mode.
	 * @returns {html} The html content of the component.
	 */
	_renderDialogs() {
		return html`
			${this._renderLodgeClaimInfoDialog()}
			${this._renderCFPAgreementDialog()}
			${this._renderInsureEmailDialog()}
			${this._renderFMSRequestCallbackDialog()}
			${this._renderFuneralPayPremiumDialog()}
			${this._renderFuneralPayPremiumConfirmationDialog()}
			${this._renderFuneralPayPremiumAgreementDialog()}
			${this._renderFuneralCancelPolicyDialog()}

			${this._renderLifeUpdateBankDetailsDialog()}
		`;
	}

	/**
	 * Render the content HTML for the component
	 * @returns {html} html
	 */
	_renderContent() {
		return html`
			<div class="notification">
				${this._renderSuccessAlert()}
				${this._renderRequestCallbackAlert()}
			</div>

			<capitec-card 
				data-automation-id="insure-landing-screen"
				class="card" id="policies-container">
				<capitec-title-bar type="insure" class="insure-title-bar">
					<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
					<capitec-label label="Insure" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
					${this.readOnlyMode === true ? `` : html`
						<capitec-button type="white" class="capitec-button-medium"  label="Lodge Claim" data-automation-id="insure-landing-lodge-claim"
							@click="${() => this.showLodgeClaimInfoDialog = true}">
						</capitec-button>
					`}
					${this.selectedInsureTabIndex === 0 ? this._renderGetFuneralEstimateButton() : html``}
					${this.readOnlyMode === true || this.selectedInsureTabIndex !== 0 ? html``
				: html`
							<capitec-overflow-menu label="Menu" icon="system/more-white">
								<capitec-overflow-menu-item icon="system/phone-call-action" label="Request callback" 
									@click="${() => this.showRequestCallbackDialog = true}">
								</capitec-overflow-menu-item>
							</capitec-overflow-menu>
						`}
				</capitec-title-bar>
				${this._renderInsureTabs()}
		</capitec-card>`;
	}

	/**
	 * Render correct HTML for Estimate Button
	 * @returns {html} html
	 */
	_renderGetFuneralEstimateButton() {
		if (this.maxAllowedCover < MAIN_LIFE_MINIMUM_COVER) {
			return html`
			<capitec-popover
				class="header-popover"
				heading="Maximum cover reached. Maximum cover for main life is R100 000">
				<capitec-button 
					disabled
					type="white" 
					class="capitec-button-medium" 
					label="Get Estimate" 
					data-automation-id="insure-landing-get-estimate">
				</capitec-button>
			</capitec-popover>`;
		} else if (this.readOnlyMode === false || this.readOnlyMode === undefined) {
			return html`
				<capitec-button 
					type="white" 
					class="capitec-button-medium" 
					label="Get Estimate" 
					data-automation-id="insure-landing-get-estimate"
					@click="${() => this._displayCFPDisclosure(`estimate`)}">
				</capitec-button>`;
		}
		return html``;
	}

	/**
	 * Render Landing page for Policies & Claims
	 * @returns {html} The html content of the Policies & Claims tabs
	 */
	_renderInsureTabs() {
		return html`
			<capitec-tab-group @tab-select="${(e) => this._selectInsureTab(e)}"  selectedIndex="${this.selectedInsureTabIndex}">
				<capitec-tab
					data-automation-id="insure-landing-funeral-policies-tab"
					label="Funeral Plan">
					<capitec-content-box  id="client-policies-box" class="accounts-box">
						${this.funeralPolicies?.summaryDetails?.policies.length === 0 ? html`${this._renderNoResultsFuneralTab()}` : html`${this._renderFuneralPoliciesList()}`}
					</capitec-content-box>
					${this._renderFooter()}
				</capitec-tab>

				<capitec-tab
					data-automation-id="insure-landing-life-policies-tab"
					label="Life Cover">
					${this.lifePolicies?.policies.length === 0 ? html`${this._renderNoResultsLifeTab()}` : html`${this._renderLifePoliciesList()}`}
					${this._renderFooter()}
				</capitec-tab>

				<capitec-tab
					data-automation-id="insure-landing-claims-tab"
					label="Claims">
					<capitec-content-box  id="client-policies-box" class="accounts-box">
						<horizon-insure-client-claims-summary 
							.clientClaims="${this.clientClaims}"
							@claim-selected="${(e) => this._goToClaimSummary(e)}" >
						</horizon-insure-client-claims-summary>
					</capitec-content-box>
					${this._renderFooter()}
				</capitec-tab>
			</capitec-tab-group>`;
	}

	/**
	 * Render list of Funeral Cover policies
	 * @returns {html} The html content the list of Policies
	 */
	_renderFuneralPoliciesList() {
		this.policiesList = this.funeralPolicies?.summaryDetails?.policies;
		this.policiesList = this.policiesList?.sort((a, b) => Status[a.status] - Status[b.status] || new Date(b.commencementDate) - new Date(a.commencementDate));

		return html`${this.policiesList?.length > 0 ? this.policiesList?.map((policyItem) => {
			const sumArrears = policyItem?.arrearDetails?.outstandingAmount;

			return html`
		<horizon-expander
			expandButtonAlignment="right"
			id="horizon-expander-${policyItem.contractReference}"
			?expanded = "${policyItem.isExpanded}" 
			@expand = "${() => this._funeralPolicyExpanded(policyItem)}"
			@collapse = "${() => this._funeralPolicyCollapsed(policyItem)}">
				<capitec-group 
					class="expander-header"
					slot="custom-header"
					layout="horizontal"
					gap="clear"
					halign="left"
					valign="center">
						<horizon-label
							class="label-policy-number fixed-label"
							data-automation-id="insure-policy-contract-reference"
							label="Policy number"
							textOverflow="ellipsis"
							value="${policyItem.contractReference}"
							@click="${() => this._goToFuneralPolicySummary(policyItem.contractReference)}">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							data-automation-id="insure-policy-start-date"
							label="Start date"
							value="${isNullorEmpty(policyItem.commencementDate) ? `-` : formatDate(policyItem.commencementDate, `dd mmm yyyy`)}">
						</horizon-label>
						${policyItem.status === `Cancelled`

					? html`
						<horizon-label
							data-automation-id="insure-policy-cancellation-date"
							label="Cancellation date"
							value="${isNullorEmpty(policyItem.cancellationDetails?.recordedCancellationDate) ? `-` : formatDate(policyItem.cancellationDetails?.recordedCancellationDate, `dd mmm yyyy`)}">
						</horizon-label>`

					: html`
						<horizon-label
							data-automation-id="insure-policy-next-debit-order"
							label="Next debit order"
							value="${this._funeralNextDebitOrderLabel(policyItem)}">
						</horizon-label>
						`}
						${policyItem.status === `Cancelled`

					? html`
						<horizon-label
							style="    width: 270px;"
							data-automation-id="insure-policy-cancellation-reason"
							label="Reason"
							value="${policyItem?.cancellationDetails?.displayReason}">
						</horizon-label>`

					: html`
						<horizon-label
							data-automation-id="insure-policy-total-premium"
							label="Total premium"
							value="${this._funeralTotalPremiumLabel(policyItem)}">
						</horizon-label>`}
						${policyItem.status === `Cancelled`
					? html``

					: html`
						<horizon-label
							data-automation-id="insure-policy-arrears"
							label="Arrears"
							class="${sumArrears > 0 ? `arrears` : ``}"
							value="${this._funeralArrearsLabel(policyItem, sumArrears)}">
						</horizon-label>`}
						<horizon-label
							data-automation-id="insure-policy-display-status"
							label="Status"
							class = "${policyItem.status === `Active` ? `active-status` : `inactive-status`}"
							value="${this._getFuneralPolicyDisplayStatus(policyItem)}">
						</horizon-label>
				</capitec-group>
				<div slot="content">
					<capitec-group 
						class="expander-content" 
						layout="vertical"
						gap="none"
						halign="left"
						valign="center">
							${this._renderFuneralExpandedOptions(policyItem)}
					</capitec-group>
				</div>
		</horizon-expander>`;
		}) : html``}`;
	}

	/**
	 * Render list of Life Cover policies
	 * @returns {html} The html content the list of Policies
	 */
	_renderLifePoliciesList() {
		const activeLifePolicy = this.lifePolicies?.policies.find(x => x.policyStatus.toUpperCase() === `ACTIVE`);
		const nonActiveLifePolicies = this.lifePolicies?.policies.filter(pol => pol.policyStatus.toUpperCase() !== `ACTIVE`);

		return html`
				${this._calculateLifeArrearsAmount(activeLifePolicy) > 0 ? html`
					<horizon-alert-banner
						type="unsuccessful-red"
						class="life-arrears-notify"
						header="Notify client:"
						label="Your policy is in arrears by ${formatCurrency(this._calculateLifeArrearsAmount(activeLifePolicy))} and will lapse on ????/??/?? if payment is not received."
						layout="horizontal">
					</horizon-alert-banner>`
				: html``}

				${isNullorEmpty(activeLifePolicy) ? html``
				: html`
					<div>
						<capitec-card class="life-policy-box" >
							${this._renderActiveLifePolicy(activeLifePolicy)}
						</capitec-card>

						<capitec-content-box  id="client-pockets-box" class="life-policies-box">
							${this._renderActiveLifePolicyPockets(activeLifePolicy)}
						</capitec-content-box>
					</div>
				`}
				<div>
					<capitec-content-box id="client-pockets-box" class="life-policies-box">
						${this._renderNonActiveLifePolicies(nonActiveLifePolicies)}
					</capitec-content-box>
				</div>
		`;
	}

	/**
	 * render life policy 
	 * @param {Object} activeLifePolicy active life policy
	 * @returns {html} html content for the life policy
	 */
	_renderActiveLifePolicy(activeLifePolicy) {
		return html`
			<capitec-card class="life-policy" halign="center" valign="center" layout="vertical">
					<div class="life-policy-container">
						<div>
							<horizon-label
								class="label-policy-number fixed-label"
								label="One Cover policy"
								textOverflow="ellipsis"
								value="${activeLifePolicy?.contractReference}"
								@click="${() => this._goToLifePolicySummary(activeLifePolicy)}">
							</horizon-label>
						</div>
						<div>
							<horizon-label
								label="Total cover"
								value="${this._calculateLifeTotalCoverAmount(activeLifePolicy)}">
							</horizon-label>
						</div>
						<div>
							<horizon-label
								label="Total monthly payment"
								class = "life-pol-label"
								value="${isNullorEmpty(activeLifePolicy?.totalPremium) ? `R0.00` : formatCurrency(activeLifePolicy?.totalPremium)}">
							</horizon-label>
						</div>
						<div>
							<horizon-label
								label="Debit order date"
								value="${formatDate(activeLifePolicy?.nextCollectionDate, `dd mmm yyyy`)}">
							</horizon-label>
						</div>
						<div>
							<horizon-label
								label="Arrears amount"
								value="${formatCurrency(this._calculateLifeArrearsAmount(activeLifePolicy))}">
							</horizon-label>
						</div>
						<div>
							<horizon-label
								label="Status"
								class = "${activeLifePolicy?.policyStatus === `Active` ? `active-status` : `inactive-status`}"
								value= "${activeLifePolicy?.policyStatus}">
							</horizon-label>
						</div>

						<capitec-overflow-menu label="Menu">
							${this._calculateLifeArrearsAmount(activeLifePolicy) > 0
				? html`<capitec-overflow-menu-item label="Pay Arrears"></capitec-overflow-menu-item>`
				: html``
			}
							<capitec-overflow-menu-item label="Email Policy"></capitec-overflow-menu-item>

							${activeLifePolicy?.policyStatus.toUpperCase() === `ACTIVE`
				? html`<capitec-overflow-menu-item label="Payment Details" @click="${() => this._openLifeUpdateBankDetailsDialog(activeLifePolicy)}"></capitec-overflow-menu-item>`
				: html``
			}
							
							${activeLifePolicy?.policyStatus.toUpperCase() === `ACTIVE`
				? html`<capitec-overflow-menu-item label="Cancel Policy" @click="${() => this._openLifeCancelPolicyDialog()}"></capitec-overflow-menu-item>`
				: html``
			}

							${activeLifePolicy?.policyStatus.toUpperCase() === `ACTIVE`
				? html`<capitec-overflow-menu-item label="Increase Cover"></capitec-overflow-menu-item>`
				: html``
			}

							${activeLifePolicy?.policyStatus.toUpperCase() === `ACTIVE`
				? html`<capitec-overflow-menu-item label="Manage Cover"></capitec-overflow-menu-item>`
				: html``
			}
						</capitec-overflow-menu>
					</div>
				<!-- </capitec-group> -->
			</capitec-card>
		`;
	}

	/**
	 * Render current active life cover policy
	 * @param {Object} activeLifePolicy active life policy
	 * @returns {html} The html content the list of policies
	*/
	_renderActiveLifePolicyPockets(activeLifePolicy) {
		const pocketList = activeLifePolicy?.pockets;

		return html`${pocketList?.length > 0 ? pocketList?.map((pocketItem) => html`
			<horizon-expander
				expandButtonAlignment="right"
				id="horizon-expander-${pocketItem?.pocketType}"
				?expanded = "${pocketItem?.isExpanded}" 
				@expand = "${() => this._lifePolicyExpanded(pocketItem)}"
				@collapse = "${() => this._lifePolicyCollapsed(pocketItem)}">
					<capitec-group 
						class="expander-header"
						slot="custom-header"
						layout="horizontal"
						gap="clear"
						halign="left"
						valign="center">
							<capitec-label type="strong"
								class="pocket-type-label ${this._pocketTypeLabelColour(pocketItem?.pocketType)}"
								.label="${this._displayPocketTypeLabel(pocketItem?.pocketType)}">
							</capitec-label>

							<div class="vertical-line"></div>
							
							<horizon-label
								data-automation-id="insure-pocket-cover-amount"
								label="Cover amount"
								value="${isNullorEmpty(pocketItem?.coverage) ? `R0` : formatCurrencyInsureCoverAmount(formatCurrency(pocketItem?.coverage))}">
							</horizon-label>
							
							<horizon-label
							class="payment-label"
								data-automation-id="insure-pocket-payment-amount"
								label="Payment amount"
								value="${isNullorEmpty(pocketItem?.premium) ? `R0.00` : formatCurrency(pocketItem?.premium)}">
							</horizon-label>
					</capitec-group>
					<div slot="content">
						<capitec-group 
							class="expander-content" 
							layout="vertical"
							gap="none"
							halign="left"
							valign="center">
								${this._renderLifeExpandedOptions(pocketItem)}
						</capitec-group>
					</div>
			</horizon-expander>`) : html``}`;
	}

	_renderNonActiveLifePolicies(nonActiveLifePolicies) {
		return html`
			${nonActiveLifePolicies?.length === 0 ? html``
				: html`<capitec-label label="Inactive Life Policies" class="strong-label" id="inactive-life-policies-title"></capitec-label>`}
			${nonActiveLifePolicies?.map((pol) => html`
			<capitec-card class="life-policy" halign="center" valign="center" layout="vertical">
					<div class="life-policy-container">
						<div>
							<horizon-label
								class="label-policy-number fixed-label"
								label="One Cover policy"
								textOverflow="ellipsis"
								value="${pol?.contractReference}"
								@click="${() => this._goToLifePolicySummary(pol)}">
							</horizon-label>
						</div>
						<div>
							<horizon-label
								label="Total cover"
								value="${this._calculateLifeTotalCoverAmount(pol)}">
							</horizon-label>
						</div>
						<div>
							<horizon-label
								label="Total monthly payment"
								class = "life-pol-label"
								value="${isNullorEmpty(pol?.totalPremium) ? `R0.00` : formatCurrency(pol?.totalPremium)}">
							</horizon-label>
						</div>
						<div>
							<horizon-label
								label="Debit order date"
								value="${formatDate(pol?.nextCollectionDate, `dd mmm yyyy`)}">
							</horizon-label>
						</div>
						<div>
							<horizon-label
								label="Arrears amount"
								value="${formatCurrency(this._calculateLifeArrearsAmount(pol))}">
							</horizon-label>
						</div>
						<div>
							<horizon-label
								label="Status"
								class = "${pol?.policyStatus === `Active` ? `active-status` : `inactive-status`}"
								value= "${pol?.policyStatus}">
							</horizon-label>
						</div>

						<capitec-overflow-menu label="Menu">
							<capitec-overflow-menu-item label="Email Policy"></capitec-overflow-menu-item>
						</capitec-overflow-menu>
					</div>
			</capitec-card>`)
			}`;
	}

	_displayPocketTypeLabel(pocketType) {

		if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return `Monthly Payout`;
		} else if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return `Education Fund`;
		} else if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `Once Off Payout`;
		}
	}

	_pocketTypeLabelColour(pocketType) {
		if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return `monthly-label-colour`;
		} else if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return `education-label-colour`;
		} else if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `once-off-label-colour`;
		}
	}

	/**
	 * Render Policy options
	 * @param {Object} policyItem - each policy item
	 * @returns {html} The html content of the each Policy options
	 */
	_renderFuneralExpandedOptions(policyItem) {
		this._calculateFuneralOverflowOptions(policyItem);
		let moreOptions = 0;

		if (policyItem.showOptions?.length > 5) {
			moreOptions = policyItem.showOptions?.splice(4);
		}

		return html`<capitec-title-bar type="default" label="Choose an option"></capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				${policyItem.showOptions?.map((option) => html`${this._getFuneralOptions(option, policyItem)}`)}
				${moreOptions?.length > 0 ? html`
					<capitec-card class="action-card more-options-card" >
						<capitec-overflow-menu label="More" data-automation-id = "insure-policy-more-sub-menu">
							${moreOptions?.map((option) => html`${this._getFuneralOverflowOptions(option, policyItem)}`)}
						</capitec-overflow-menu>
						<capitec-label label="More" class="label-text more-options-button">
						</capitec-label>
					</capitec-card>` : ``}
			</capitec-group>`;
	}

	/**
	 * Render Pocket options
	 * @param {Object} pocketItem - each policy item
	 * @returns {html} The html content of the each Policy options
	 */
	_renderLifeExpandedOptions(pocketItem) {

		if (pocketItem.pocketType === `OnceOffPayout`) {
			return html`<capitec-title-bar type="default" label="Choose an option"></capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button 
						class="button-margin" 
						label="Beneficiaries" 
						icon="system/profile-action"
						@click="${() => this._openPocketSummary(LIFE_POCKET_TYPES.ONCEOFF)}">
					</horizon-option-button>

					<horizon-option-button 
						class="button-margin" 
						label="De-activate" 
						icon="system/delete-action">
					</horizon-option-button>
					
				</capitec-group>
			`;
		} else if (pocketItem.pocketType === `MonthlyPayout`) {
			return html`<capitec-title-bar type="default" label="Choose an option"></capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button 
						class="button-margin" 
						label="Beneficiaries" 
						icon="system/profile-action"
						@click="${() => this._openPocketSummary(LIFE_POCKET_TYPES.MONTHLY)}">
					</horizon-option-button>

					<horizon-option-button 
						class="button-margin" 
						label="De-activate" 
						icon="system/delete-action">
					</horizon-option-button>
				</capitec-group>
			`;
		}

		return html`<capitec-title-bar type="default" label="Choose an option"></capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				<horizon-option-button 
					data-automation-id="insure-policy-options-reinstate"
					class="button-margin" 
					label="Beneficiaries" 
					icon="system/profile-action"
					@click="${() => this._openPocketSummary(LIFE_POCKET_TYPES.EDUCATION)}">
				</horizon-option-button>

				<horizon-option-button 
					data-automation-id="insure-policy-options-reinstate"
					class="button-margin" 
					label="De-activate" 
					icon="system/delete-action">
				</horizon-option-button>
			</capitec-group>
		`;
	}

	/**
	* Show pocket summary of selected pocket type
	* @param {string} pocketType Pocket type chosen
	* @returns {void}
	*/
	_openPocketSummary(pocketType) {
		this.dispatchEvent(new CustomEvent(`navigate-to-life-pocket-summary`, {
			detail: {
				pocketType: pocketType,
				lifePolicy: this.lifePolicies.policies[0],
				selectedInsureTabIndex: this.selectedInsureTabIndex
			}
		}));
	}

	/**
	 * Render message when no results found for funeral policies
	 * @returns {html} The html content of No results
	 */
	_renderNoResultsFuneralTab() {
		return html`
			<capitec-content-box id="no-results-box">
				<div>
					<capitec-label label="Features of Funeral Cover" class="strong-label"></capitec-label>
					<table id='benefits-table'>
						<tr>
							<td>Maximum cover</td>
							<td>
								<div>R100 000 - Main Life</div>
								<div>R100 000 - Spouse</div>
								<div>R20 000 - Children (0 - 5 years) </div>
								<div>R50 000 - Children (6 - 13 years) </div>
								<div>R60 000 - Children (14 - 25 years) </div>
								<div>R50 000 - Parents </div>
								<div>R50 000 - Extended Family</div>
							</td>
						</tr>
						<tr>
							<td>Waiting period</td>
							<td>
								6-month waiting period for natural death. However, we’ll waive your waiting period for natural death for the same lives assured and related cover amounts if you have cover with an existing insurer.
							</td>
						</tr>
						<tr>
							<td>Maximum entry age</td>
							<td>
								<div>64 - Main Life and Spouse</div>
								<div>25 - Children</div>
								<div>85 - Parents and Extended Family</div>
							</td>
						</tr>
						<tr>
							<td>Number of lives assured</td>
							<td>22</td>
						</tr>
						<tr>
							<td>Funeral support</td>
							<td>
								<div>Our Funeral Support service will guide you step-by-step through this difficult time.</div>
								<div>•Legal assistance regarding the funeral procedures, e.g. removal of the body, etc.</div>
								<div>•Help with obtaining a death certificate for your loved one</div>
								<div>•Help with the arrangement of a burial or cremation (all funeral costs are for your account and not Capitec's)</div>
								<div>
									•This service allows the transport of your or a loved one’s body from the place of death within South Africa and neighbouring countries to the funeral home of choice closest to the place of burial in South Africa. The place of death must be at least 50km from the place of burial
								</div>
								<div>
									•If you need help to transport the deceased, you can contact our Funeral Support directly on 0860 77 75 54 or request a call back on our app or WhatsApp us on 067 418 9565.
								</div>
								<div>
									Note: Referrals to a pathologist, psychologist, psychiatrist or special counselling is limited to referral only; all costs will be for your account (the policyholder). 
								</div>
							</td>
						</tr>
						<tr>
							<td>Death Premium Waiver</td>
							<td>Premiums paid by insurer on death of policyholder – 6 months, allowing your family time to reassess their financial lives. This waiver is automatically activated on registration of your (the policyholder’s) death.</td>
						</tr>
						<tr>
							<td>Voluntary Policy Pause benefit</td>
							<td>
							Pause premiums and benefits for up to 6 months. You won’t pay monthly premiums and there will be no cover, but you can reactivate your cover and premium anytime in the 6-month period. Once reactivated, monthly premium payments will remain the same.
							</td>
						</tr>
						<tr>
							<td>Double Accident benefit</td>
							<td>Payment of an extra benefit amount equal to your cover amount if lives assured die in an accident.</td>
						</tr>
						<tr>
							<td>Newborn premium waiver</td>
							<td>Full cover for up to 6 months without monthly premium payments (natural birth or adoption).</td>
						</tr>
					</table>
				</div>
			</capitec-content-box>
		`;
	}

	/**
	 * Render message when no results found for life policies
	 * @returns {html} The html content of No results
	 */
	_renderNoResultsLifeTab() {
		return html`
		<capitec-content-box class="accounts-box">
			<capitec-content-box id="no-results-box">
				<div>
					<capitec-label label="Features of Life Cover" class="strong-label"></capitec-label>
					<table id='benefits-table'>
						<tr>
							<td>Something Awesome</td>
							<td>
								<div>R100 000 - Main Life</div>
								<div>R100 000 - Spouse</div>
								<div>R20 000 - Children (0 - 5 years) </div>
								<div>R50 000 - Children (6 - 13 years) </div>
								<div>R60 000 - Children (14 - 25 years) </div>
								<div>R50 000 - Parents </div>
								<div>R50 000 - Extended Family</div>
							</td>
						</tr>
					</table>
				</div>
			</capitec-content-box>
		</capitec-content-box>`;
	}

	/**
	 * Render Footer
	 * @returns {html} The html content of Footer
	 */
	_renderFooter() {
		return html`
			<capitec-group layout="vertical" gap="none" halign="left" valign="center">
				<capitec-title-bar
					type="default"
					label="Explore">
				</capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button
							data-automation-id="insure-policy-product-enquiry"
							label="Product enquiry"
							icon="system/info-action"
							@click="${() => this._productEnquiry()}">
					</horizon-option-button>
				</capitec-group>
			</capitec-group>
		`;
	}

	// --- Dialogs

	/**
	 * Render the Cancel Policy Dialog
	 * @returns {html} html content
	 */
	_renderFuneralCancelPolicyDialog() {
		return this.showFuneralCancelPolicyDialog === false ? ``
			: html`
		<horizon-insure-cancel-policy-dialog 
			.contractReference = ${this.contractReferenceToCancel}
			.cancelPolicyDocumentDetails = "${this.funeralCancelAgreementDocument}"
			.getCancelPolicyDocument="${(contractReference, cancelReason) => this._generateDocumentsFuneralCancel(contractReference, cancelReason)}"
			@close-modal="${() => this._closeFuneralCancelPolicyDialog()}"
			@agree="${(e) => this._funeralCancelPolicyConfirm(e)}" >
		</horizon-insure-cancel-policy-dialog>`;
	}

	/**
	 * Render Funeral Pay Premium Dialog 
	 * @return {html} Html of the dialog
	 */
	_renderFuneralPayPremiumDialog() {
		return this.showFuneralPayPremiumDialog === false ? ``
			: html`
			<horizon-insure-pay-premium-dialog   
				.clientArrears = ${this.funeralPolicyArrears}
				.currentContractRef = "${this.selectedContractRef}"
				@pay-arrears = "${(e) => this._showFuneralPayPremiumConfirmationDialog(e)}"
				@close-modal="${() => this.showFuneralPayPremiumDialog = false}" >
			</horizon-insure-pay-premium-dialog>`;
	}

	/**
	 * Render Funeral Confirm Pay Premium Dialog
	 * @return {html} Html of the dialog
	 */
	_renderFuneralPayPremiumConfirmationDialog() {
		return this.showFuneralPayPremiumConfirmationDialog === false ? ``
			: html`
			<horizon-insure-pay-premium-confirmation-dialog 
				.amountToPay = "${this.funeralArrearsPaymentAmount}" 
				.fromAccount = "${this.funeralPayArrearsFromAccount}"
				.contractReference = ${this.selectedContractRef}
				@close-modal="${() => this.showFuneralPayPremiumConfirmationDialog = false}" 
				@confirm-payment="${() => this._openFuneralPayPremiumAgreementDialog()}">
			</horizon-insure-pay-premium-confirmation-dialog>`;
	}

	/**
	 * Render Funeral Pay Premium Agreement Dialog 
	 * @return {html} Html of the dialog
	 */
	_renderFuneralPayPremiumAgreementDialog() {
		return this.showFuneralPayPremiumAgreementDialog === false ? ``
			: html`
			<horizon-insure-pay-premium-agreement-dialog 
				.payAmount = "${this.funeralArrearsPaymentAmount}" 
				.contractReference= ${this.selectedContractRef}
				.getArrearsPaymentDocument="${(contractReference) => this._generateDocumentsFuneralArrears(contractReference)}"
				.arrearsPaymentDocumentDetails="${this.funeralArrearsPaymentDocumentDetails}"
				@close-modal="${() => this.showFuneralPayPremiumAgreementDialog = false}"
				@pay-premium-agree = "${() => this._funeralPayPremiumConfirm()}">
			</horizon-insure-pay-premium-agreement-dialog>`;
	}

	/**
	 * Render Lodge Claim Info Dialog 
	 * @return {html} Html of the dialog
	 */
	_renderLodgeClaimInfoDialog() {
		return this.showLodgeClaimInfoDialog === false ? ``
			: html`
			<horizon-insure-lodge-claim-info-dialog @confirm="${() => this._openClaimInfoDialog()}">
			</horizon-insure-lodge-claim-info-dialog>`;
	}

	/**
	 * render Dialog for CFP Agreement
	 * @returns {html} html content
	 */
	_renderCFPAgreementDialog() {
		return this.showCFPAgreementDialog === false ? `` : html`
		<horizon-insure-cfp-agreement-dialog 
			.productCode = "${this.productCode}"
			@agreementAccepted="${() => this._navigateAfterCFP()}"
			@close-modal="${() => this.showCFPAgreementDialog = false}">
		</horizon-insure-cfp-agreement-dialog>`;
	}

	/** 
	 * Render dialog for confirming email address then sending
	 * @returns {html} html
	 */
	_renderInsureEmailDialog() {
		return this.showFuneralEmailPlanDialog === false ? ``
			: html`
				<horizon-insure-email-dialog 
					.titleMessage = "${`Email Funeral Plan`}"
					@close-modal="${() => this.showFuneralEmailPlanDialog = false}"
					@send-email = "${(emailAddress) => this._sendEmail(emailAddress)}">
				</horizon-insure-email-dialog>`;
	}

	/**
	 * FMS Request a callback details dialog
	 * @returns {html} Dialog content
	 */
	_renderFMSRequestCallbackDialog() {
		return this.showRequestCallbackDialog === false ? html``
			: html`
			<horizon-insure-request-callback-dialog
			.requestCallback ="${(firstName, lastName, cellphoneNumber) => this._requestCallback(firstName, lastName, cellphoneNumber)}"
			@cancel-click="${() => this.showRequestCallbackDialog = false}">
			</horizon-insure-request-callback-dialog>
		`;
	}

	/**
	 * Life Update banking details dialog
	 * @returns {html} Dialog content
	 */
	_renderLifeUpdateBankDetailsDialog() {
		return this.showLifeUpdateBankDetailsDialog === false ? html``
			: html`
			<horizon-insure-life-update-bank-details-dialog
			.policy="${this.selectedLifePolicy}"
			@close-dialog="${() => this.showLifeUpdateBankDetailsDialog = false}">
			</horizon-insure-life-update-bank-details-dialog>
		`;
	}

	// --- END Dialogs

	// --- Helpers

	/**
	 * Renders the Email Success alert
	 * @returns {html} html content
	 */
	_renderSuccessAlert() {
		return this.showEmailEstimateSuccessToast === false ? html``
			: html`
				<capitec-toast
					class="toast"
					type="success"
					Header="Successful"
					layout = "vertical"
					detail = "Document sent successfully"
					@click = "${() => this.showEmailEstimateSuccessToast = false}">
				</capitec-toast>
				${this._startFuneralEstimateToastTimer()}
	`;
	}

	/** 
	 * Show success toast for FMS request callback
	 * @returns {html} Toast html
	 */
	_renderRequestCallbackAlert() {
		return this.showRequestFMSCallbackSuccessToast === false
			? html``
			: html`
				<capitec-toast
					class="toast"
					type="success"
					Header="Successful"
					layout = "vertical"
					detail = "Callback request was successful"
					@click = "${() => this.showRequestFMSCallbackSuccessToast = false}">
				</capitec-toast>`;
	}

	// --- END Helpers

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-client-summary`, ClientSummary);

/**
 * Product enquiry event, navigate to corporate website, Insure page
 *
 * @example
 * <horizon-insure-client-summary ... @product-enquiry="${this._handler}"></horizon-insure-client-summary>
 *
 * @event ClientPolicies#product-enquiry
 * @type {Object} - N/A
 */

/**
 * Attempt to pay policy arrears
 *
 * @example
 * <horizon-insure-client-summary ... @pay-policy="${this._handler}"></horizon-insure-client-summary>
 *
 * @event ClientPolicies#pay-policy
 * @type {Object} - N/A
 */

/**
 * Attempt to cancel policy with reason
 *
 * @example
 * <horizon-insure-client-summary ... @cancel-policy="${this._handler}"></horizon-insure-client-summary>
 *
 * @event ClientPolicies#cancel-policy
 * @type {Object} - N/A
 */

/**
 * When Get Estimate button is clicked, navigate
 *
 * @example
 * <horizon-insure-client-summary ... @navigate-to-estimate="${this._handler}"></horizon-insure-client-summary>
 *
 * @event ClientPolicies#navigate-to-estimate
 * @type {Object} - N/A
 */

/**
 * When Update Plan tile is clicked, navigate
 *
 * @example
 * <horizon-insure-client-summary ... @navigate-to-update-plan="${this._handler}"></horizon-insure-client-summary>
 *
 * @event ClientPolicies#navigate-to-update-plan
 * @type {Object} - N/A
 */

/**
 * When policy contract reference link is clicked, navigate
 *
 * @example
 * <horizon-insure-client-summary ... @navigate-to-policy-summary="${this._handler}"></horizon-insure-client-summary>
 *
 * @event ClientPolicies#navigate-to-policy-summary
 * @type {Object} - N/A
 */

/**
 * Navigate to claim summary from claim number
 *
 * @example
 * <horizon-insure-client-summary ... @navigate-to-claim-summary="${this._handler}"></horizon-insure-client-summary>
 *
 * @event ClientPolicies#navigate-to-claim-summary
 */

/**
 * Navigate to transaction history
 *
 * @example
 * <horizon-insure-client-summary ... @navigate-to-policy-transaction-history="${this._handler}"></horizon-insure-client-summary>
 *
 * @event ClientPolicies#navigate-to-policy-transaction-history
 */

/**
 * Navigate to SMS History history
 *
 * @example
 * <horizon-insure-client-summary ... @navigate-to-sms-history="${this._handler}"></horizon-insure-client-summary>
 *
 * @event ClientPolicies#navigate-to-sms-history
 */

/**
 * Send email event containing confirmed address 
 *
 * @example
 * <horizon-insure-client-summary ... @send-email="${this._handler}"></horizon-insure-client-summary>
 *
 * @event ClientPolicies#send-email
 */

/**
 * When expander is collapsed and clicked, expand
 *
 * @example
 * <horizon-expander ... @expand = "${() => this._handler}"></horizon-expander>
 *
 * @event ClientPolicies#_funeralPolicyExpanded
 * @type {Object} - N/A
 */

/**
 * When expander is expanded and clicked, collapse
 *
 * @example
 * <horizon-expander ... @collapse = "${() => this._handler}"></horizon-expander>
 *
 * @event ClientPolicies#collapsed
 * @type {Object} - N/A
 */