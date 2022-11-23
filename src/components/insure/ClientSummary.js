import { Component, css, html } from 'platform/elements';
import { INSURE_CALLER_PAGE, POLICY_OPTIONS, Status } from 'app/constants/InsureCommon';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { ClientPoliciesEvents } from 'app/constants/telemetry/events/Insure';
import { HorizonInsureStore } from 'app/store/HorizonInsureStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';

import 'app/components/dialogs/insure/PayPremiumDialog';
import 'app/components/dialogs/insure/PayPremiumConfirmationDialog';
import 'app/components/dialogs/insure/PayPremiumAgreementDialog';
import 'app/components/dialogs/insure/LodgeClaimInfoDialog';
import 'app/components/dialogs/insure/CancelPolicyDialog';
import 'app/components/dialogs/insure/EmailPlanDialog';
import 'app/components/insure/ClientClaimsSummary';
import 'app/components/dialogs/insure/CFPAgreementDialog';

const MAIN_LIFE_MINIMUM_COVER = 5000;


/**
 * Client Summary component showing all the policies a client currently has on their account
 * This is the primary landing screen for client that has insurance product
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
  
 * _expanded
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

		this.horizonInsureStore = HorizonInsureStore.getInstance();

		this.clientPolicies = null;
		this.clientClaims = null;
		this.amountToPay = 0;

		this.showSubMenu = true;
		this.showCancelPolicyDialog = false;
		this.showEmailPlanDialog = false;
		this.showCancelPolicyConfirmationDialog = false;
		this.showPayPremiumDialog = false;
		this.showPayPremiumConfirmationDialog = false;
		this.showPayPremiumAgreementDialog = false;
		this.showLodgeClaimInfoDialog = false;
		this.showCFPAgreementDialog = false;
		this.emailEstimateSuccess = false;

		this._telemetry = HorizonTelemetry.getInstance();
		this.telemetryEvents = {};
	}

	// #endregion INITIALISATION

	// #region PROPERTIES

	/**
	 * @property {Number} maxAllowedCover  CheckInsurance limit for remaining cover limit
	 * @property {Object} clientClaims Client Claims
	 * @property {Object} clientPolicies All policies for client
	 * @property {Object} clientArrears Data & flags from Arrears Service
	 * @property {Object} payArrears contains the arrears that will be paid
	 * @property {Number} fromAccount contains the account number for the account the client will be paying from
	 * @property {Object} accountDetails contains the clients Savings Account and Savings Plan details
	 * @property {Number} amountToPay contains the total arrear amount to be paid
	 * @property {Function} getArrearsPaymentDocument Callback function to fetch arrears payment document
	 * @property {Object} arrearsPaymentDocumentDetails payment document
	 * @property {String} contractReferenceToCancel Selected contract reference for cancel action
	 * @property {Function} getCancelPolicyDocument Callback function to fetch Cancel Policy Agreement
	 * @property {Object} cancelPolicyDocumentDetails cancel document
	 * @property {boolean} readOnlyMode toggle to disable actions based on rules
	 * @property {boolean} showSubMenu Determines if the sub menu to be shown or not
	 * @property {boolean} showCancelPolicyDialog Determines if the Cancel Policy dialog should be shown
	 * @property {boolean} showEmailPlanDialog Determines if the Email Plan dialog should be shown
	 * @property {boolean} showCancelPolicyConfirmationDialog Determines if the Cancel Policy Confirmation dialog should be shown
	 * @property {boolean} showPayPremiumDialog Determines if the Pay Premium dialog should be shown
	 * @property {boolean} showPayPremiumConfirmationDialog Determines if the Pay Premium Confirmation dialog should be shown
	 * @property {boolean} showPayPremiumAgreementDialog Determines if the Pay Premium Agreement dialog should be shown
	 * @property {boolean} showLodgeClaimInfoDialog Determines if the Claim Inf dialog should be shown
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			maxAllowedCover: { type: Number, state: true },
			clientClaims: { type: Object, state: true },
			clientPolicies: { type: Object, state: true },
			clientArrears: { type: Object, state: true },

			payArrears: { type: Object, state: true },
			fromAccount: { type: Number, state: true },
			accountDetails: { type: Object, state: true },
			amountToPay: { type: Number, state: true },
			getArrearsPaymentDocument: { type: Object },
			arrearsPaymentDocumentDetails: { type: Object },

			contractReferenceToCancel: { type: String, state: true },
			getCancelPolicyDocument: { type: Object, state: true },
			cancelPolicyDocumentDetails: { type: Object, state: true },

			readOnlyMode: { type: Boolean, state: true },
			showSubMenu: { type: Boolean, state: true },
			showCancelPolicyDialog: { type: Boolean, state: true },
			showEmailPlanDialog: { type: Boolean, state: true },
			showCancelPolicyConfirmationDialog: { type: Boolean, state: true },
			showPayPremiumDialog: { type: Boolean, state: true },
			showPayPremiumConfirmationDialog: { type: Boolean, state: true },
			showPayPremiumAgreementDialog: { type: Boolean, state: true },
			showLodgeClaimInfoDialog: { type: Boolean, state: true },
			showCFPAgreementDialog: { type: Boolean, state: true },

			selectedFlow: { type: String, state: true },
			selectedContractRef: { type: String, state: true },
			canReinstate: { type: Boolean, state: true },
			selectedPolicyItem: { type: Object, state: true },
			productCode: { type: String, state: true },
			emailEstimateSuccess: { type: Boolean, state: true }

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
		window.setTimeout(() => this.emailEstimateSuccess = false, 2000);
	}

	async disconnectedCallback() {
		super.disconnectedCallback();
		await this._telemetry.endSpan(this.telemetryEvents.CLIENT_POLICIES, {});
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region EVENT HANDLERS

	/**
	 * Fire navigate event to Estimate
	 * @returns {void}
	 */
	_goToEstimate() {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_GET_ESTIMATE, {});
		this.dispatchEvent(new CustomEvent(`navigate-to-estimate`));
	}

	/**
	 * Fire navigate event to Claim Summary
	 * @param {*} e event
	 * @returns {void}
	 */
	_goToClaimSummary(e) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_CLAIM_DETAILS, {});
		this.dispatchEvent(new CustomEvent(`navigate-to-claim-summary`, { detail: e.detail.claim }));
	}

	/**
	 * Fire navigate event to Update Plan
	 * @param {*} contractReference contract reference
	 * @param {*} canReinstate canReinstate
	 * @returns {void}
	 */
	_goToUpdatePlan(contractReference, canReinstate) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_UPDATE_PLAN, {});
		this.dispatchEvent(new CustomEvent(`navigate-to-update-plan`, {
			detail: {
				policyContractReference: contractReference, canReinstate: canReinstate
			}
		}));
	}

	/**
	 * Fire navigate event to Policy Summary
	 * @param {*} contractReference contract reference
	 * @returns {void}
	 */
	_goToPolicySummary(contractReference) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_POLICY_DETAILS, {});
		this.dispatchEvent(new CustomEvent(`navigate-to-policy-summary`, {
			detail: { policyContractReference: contractReference }
		}));
	}

	/**
	 * Fire navigate event to Policy Transaction History
	 * @param {object} policyItem policy item details
	 * @returns {void}
	 */
	_goToPolicyTransactionHistory(policyItem) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_TRANSACTION_HISTORY, {});
		this.dispatchEvent(new CustomEvent(`navigate-to-policy-transaction-history`, {
			detail: {
				policyNumber: policyItem.contractReference,
				bankName: policyItem.deductionDetails?.bankDetails?.bank,
				accountNumber: policyItem.deductionDetails?.bankDetails?.accountNumber,
				arrearsAmount: policyItem.arrearDetails?.outstandingAmount
			}
		}));
	}

	/**
	 * Fire Pay Policy event
	 * @returns {void}
	 */
	_payPremiumAgree() {
		this.dispatchEvent(new CustomEvent(`pay-policy`, {
			detail: { payArrears: this.payArrears, fromAccount: this.fromAccount }
		}));
	}

	/**
	 * Cancel Policy event
	 * @param {*} e event
	 * @returns {void}
	 */
	_cancelPolicyAgree(e) {
		this.dispatchEvent(new CustomEvent(`cancel-policy`, {
			detail: { contractReference: this.contractReferenceToCancel, cancellationReason: e.detail.cancellationReason }
		}));
	}

	/*
	 * Fire navigate to SMS History
	 */
	_goToSMSHistory(policyItem) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_SMS_HISTORY, {});
		this.dispatchEvent(new CustomEvent(`navigate-to-sms-history`, { detail: { policyItem: policyItem } }));
	}

	/**
	 * event to open the cancel policy dialog
	 * @param {string} contractReference contract reference
	 * @returns {void} 
	 */
	_openCancelPolicyDialog(contractReference) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_CANCEL_POLICY, {});
		this.contractReferenceToCancel = contractReference;
		this.showCancelPolicyDialog = true;
	}

	/**
	 * Invoke this function when Send button is clicked on Email Popup
	 * @param {string} emailAddress email address
	 * @returns {void}
	 */
	_sendEmail(emailAddress) {
		this.dispatchEvent(new CustomEvent(`send-email`, { detail: { emailId: emailAddress, callerPage: INSURE_CALLER_PAGE.CLIENT_POLICIES, contractRef: this.emailContractRef } }));
	}

	/**
	 * Close Pay Premium Dialog and Open the Pay Premium Confirmation Dialog.
	 *
	 * @param {*} e contains the values pay arrears and amount to be paid
	 * @returns {void}
	 */
	_payArrears(e) {
		this.payArrears = e.detail.payArrears;
		this.amountToPay = e.detail.amountToPay;
		this.fromAccount = e.detail.fromAccount;

		this.showPayPremiumDialog = false;
		this.showPayPremiumConfirmationDialog = true;
	}

	/**
	 * Open Pay Premium Agreement Dialog
	 * @returns {void}
	 */
	_openPayPremiumAgreementDialog() {
		this.showPayPremiumConfirmationDialog = false;
		this.showPayPremiumAgreementDialog = true;
	}

	/**
	 * Open Pay Premium dialog 
	 * @param {*} policyItem policy item
	 * @returns {void}
	 */
	_openPayPremiumDialog(policyItem) {
		this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_PAY_POLICY, {});
		this.clientArrears = {
			contractReference: policyItem.contractReference,
			arrears: policyItem.arrearDetails?.arrears
		};
		this.showPayPremiumDialog = true;
	}

	/**
	 * Get the Cancel Policy Document
	 * 
	 * @param {*} contractReference contractReference
	 * @param {*} cancelReason cancelReason
	 * @returns {void}
	 */
	async _getCancelPolicyDocument(contractReference, cancelReason) {
		await this.getCancelPolicyDocument(contractReference, cancelReason, false);
	}

	/**
	 * Get the Arrears Payment Document
	 * @param {string} contractReference contractReference
	 * @return {void} 
	 */
	async _getArrearsPaymentDocument(contractReference) {
		await this.getArrearsPaymentDocument(contractReference, this.payArrears, this.fromAccount, false);
	}

	/**
	 * Event for closing cancel dialog, reset document state 
	 * @returns {void}
	 */
	_closeCancelPolicyDialog() {
		this.showCancelPolicyDialog = false;
		this.cancelPolicyDocumentDetails = undefined;
	}

	_showEmailPlanDialog(contractRef) {
		this.emailContractRef = contractRef;
		this.showEmailPlanDialog = true;
	}

	// #endregion EVENT HANDLERS

	// #region PRIVATE FUNCTIONS

	/**
	 * Fire navigate event to Product Enquiry
	 * @returns {void}
	 */
	_productEnquiry() {
		this.dispatchEvent(new CustomEvent(`product-enquiry`, { detail: {} }));
	}

	/**
	 * Get Total cover amount of all role players
	 * @param {Object} policyItem - Policy details 
	 * @returns {void}
	 */
	_getTotalCoverAmount(policyItem) {
		return policyItem.roleplayers.filter(x => x.beneficiary !== true).reduce((accumulator, object) => accumulator + (object.coverAmount ?? 0), 0);
	}

	/**
	 * Expand Policy Item
	 * @param {Object} policyItem - Policy details 
	 * @returns {void}
	 */
	_expanded(policyItem) {
		const isExpanded = this.policiesList?.some(x => x.contractReference !== policyItem.contractReference &&
			x.isExpanded === true);

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
	_collapsed(policyItem) {
		policyItem.isExpanded = false;
		this.requestUpdate();
	}

	/**
	 * Determine which options to show
	 * @param {object} policyItem - each policy item
	 * @returns {void}
	 */
	_calculateShowOptions(policyItem) {
		policyItem.showOptions = [];

		if (policyItem.canReinstate) {
			policyItem.showOptions.push(POLICY_OPTIONS.EMAIL_PLAN);
			policyItem.showOptions.push(POLICY_OPTIONS.REINSTATE);
		} else {
			// if (policyItem.status === `Active` && policyItem.arrearDetails?.outstandingAmount > 0) {
			// policyItem.showOptions.push({ showPayArrears: true });
			// }
			policyItem.showOptions.push(POLICY_OPTIONS.EMAIL_PLAN);

			if (policyItem.status === `Active` || policyItem.status === `PendingInForce`) {
				if (policyItem.arrearDetails?.outstandingAmount > 0) {
					policyItem.showOptions.push(POLICY_OPTIONS.PAY_ARREARS);
				}

				policyItem.showOptions.push(POLICY_OPTIONS.UPDATE_PLAN);
				policyItem.showOptions.push(POLICY_OPTIONS.CANCEL_PLAN);
				policyItem.showOptions.push(POLICY_OPTIONS.TRANSACTION_HISTORY);
				policyItem.showOptions.push(POLICY_OPTIONS.SMS_HISTORY);
			}
		}
	}

	/**
	 * get option to show
	 * @param {string} showOption - option to show 
	 * @param {object} policyItem - policy object
	 * @returns {html} - html content of option
	 */
	_getOptions(showOption, policyItem) {
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
				.disabled="${this.readOnlyMode}"
				@click="${() => this._goToPolicyTransactionHistory(policyItem)}">
			</horizon-option-button>`;
			case POLICY_OPTIONS.SMS_HISTORY:
				return html`<horizon-option-button 
				data-automation-id="insure-policy-options-sms-history"
				class="button-margin" 
				label="SMS History" 
				icon="system/send-action"
				.disabled="${this.readOnlyMode}"
				@click="${() => this._goToSMSHistory(policyItem)}">
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
	_getMoreOptions(showOption, policyItem) {
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
					label="Transaction History" @click="${() => this._goToPolicyTransactionHistory(policyItem)}">
				</capitec-overflow-menu-item>`;
			case POLICY_OPTIONS.SMS_HISTORY:
				return html`<capitec-overflow-menu-item icon="system/send-action" 
					label="SMS History" @click="${() => this._goToSMSHistory(policyItem)}">
				</capitec-overflow-menu-item>`;
			default:
				return html``;
		}
	}

	/**
	 * displays the CFP disclosure
	 * @param {String} flow flow
	 * @param {Object} [policyItem = null] policy item
	 * @returns {void}
	 */
	_displayCFPDisclosure(flow, policyItem = null) {

		this.selectedFlow = flow;
		this.selectedContractRef = policyItem?.contractReference;
		this.canReinstate = policyItem?.canReinstate;
		this.selectedPolicyItem = policyItem;

		if (policyItem === null) {
			this.productCode = `Capitec`;
		} else {
			this.productCode = policyItem.productCode;
		}


		if (this.horizonInsureStore.getCFPStatus() === false || this.horizonInsureStore.getCFPStatus() === null) {
			this.showCFPAgreementDialog = true;
		} else {
			this._navigateAfterCFP();
		}
	}

	/**
	 * determines where to navigate after accepting the cfp disclosure
	 * @returns {void}
	 */
	_navigateAfterCFP() {

		this.horizonInsureStore.setCFPStatus(true);

		switch (this.selectedFlow) {
			case `update`:
				this.showCFPAgreementDialog = false;
				this._goToUpdatePlan(this.selectedContractRef, this.canReinstate);
				break;
			case `cancel`:
				this.showCFPAgreementDialog = false;
				this._openCancelPolicyDialog(this.selectedContractRef);
				break;
			case `adhoc`:
				this.showCFPAgreementDialog = false;
				this._openPayPremiumDialog(this.selectedPolicyItem);
				break;
			case `estimate`:
				this.showCFPAgreementDialog = false;
				this._goToEstimate();
				break;
			default:
				this.showCFPAgreementDialog = false;
				break;
		}
	}

/**
 * determines the value to display for Total Premium
 * @param {Object} policyItem Policy Item
 * @returns {String} string
 */
	_totalPremiumDisplay(policyItem) {
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
	_nextDebitOrderDisplay(policyItem) {
		if (policyItem.status === `NotTakenUp` || policyItem.status === `Lapsed`) {
			return `-`;
		}
		return formatDate(policyItem.paymentSchedule?.nextPaymentDate, `dd mmm yyyy`) === `` ? `-` : formatDate(policyItem.paymentSchedule?.nextPaymentDate, `dd mmm yyyy`);
	}

	/**
	 * determines the value to display for Arrears
	 * @param {Object} policyItem policy item
	 * @param {number} sumArrears policy Item
	 * @returns {string} string
	 */
	_arrearsDisplay(policyItem, sumArrears) {
		if (policyItem.status === `NotTakenUp` || policyItem.status === `Lapsed`) {
			return `-`;
		}
		return isNullorEmpty(sumArrears) ? formatCurrency(0) : formatCurrency(sumArrears);
	}

	/**
	 * Fire navigate event to Audit Transaction History - RELEASE DELAYED
	 * @param {String} contractReference contract reference
	 * @returns {void}
	 */
	// _goToAuditTransactionHistory(contractReference) {
	// this._telemetry.logEvent(this.telemetryEvents.CLIENT_POLICIES_AUDIT_TRANSACTION_HISTORY, {});
	// this.dispatchEvent(new CustomEvent(`navigate-to-audit-transaction-history`, {
	// detail: { policyNumber: contractReference }
	// }));
	// }


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
				width: auto;
				height: 500px;
				--theme-container-padding-left: 16px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-bottom: 16px;
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

			#no-results-box-inner{
				padding: 20px; margin-top: 10px;
			}

			#policies-container{
				margin-bottom:20px;
			}
			`
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
			${this._renderPayPremiumDialog()}
			${this._renderPayPremiumConfirmationDialog()}
			${this._renderPayPremiumAgreementDialog()}
			${this._renderLodgeClaimInfoDialog()}
			${this._renderCancelPolicyDialog()}
			${this._renderCFPAgreementDialog()}
			${this._renderInsureEmailDialog()}
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
			</div>

			<capitec-card 
				data-automation-id="insure-landing-screen"
				class="card" id="policies-container">
				<capitec-title-bar type="insure" class="insure-title-bar">
					<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
					<capitec-label label="Insure" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
					${this.clientPolicies?.summaryDetails?.policies.length === 0 ? `` : html`
						<capitec-button type="white" class="capitec-button-medium"  label="Lodge Claim" data-automation-id="insure-landing-lodge-claim"
							@click="${() => this.showLodgeClaimInfoDialog = true}">
						</capitec-button>
					`}
					
					${this._renderGetEstimateButton()}
				</capitec-title-bar>

				${this.clientPolicies?.summaryDetails?.policies.length === 0 ? html`${this._renderNoResults()}` : html`${this._renderPoliciesLandingContent()}`}
		</capitec-card>`;
	}

	/**
	 * Render correct HTML for Estimate Button
	 * @returns {html} html
	 */
	_renderGetEstimateButton() {
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
	_renderPoliciesLandingContent() {
		return html`
			<capitec-tab-group>
				<capitec-tab
					data-automation-id="insure-landing-policies-tab"
					label="Policies">
					<capitec-content-box  id="client-policies-box" class="accounts-box">
							${this._renderPoliciesDetailsBar()}
					</capitec-content-box>
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
	 * Render List of Policies
	 * @returns {html} The html content the list of Policies
	 */
	_renderPoliciesDetailsBar() {
		this.policiesList = this.clientPolicies?.summaryDetails?.policies;
		this.policiesList = this.policiesList?.sort((a, b) => Status[a.status] - Status[b.status] || new Date(b.commencementDate) - new Date(a.commencementDate));

		return html`${this.policiesList?.length > 0 ? this.policiesList?.map((policyItem) => {
			const sumArrears = policyItem?.arrearDetails?.outstandingAmount;

			return html`
		<horizon-expander
			expandButtonAlignment="right"
			id="horizon-expander-${policyItem.contractReference}"
			?expanded = "${policyItem.isExpanded}" 
			@expand = "${() => this._expanded(policyItem)}"
			@collapse = "${() => this._collapsed(policyItem)}">
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
							@click="${() => this._goToPolicySummary(policyItem.contractReference)}">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							data-automation-id="insure-policy-start-date"
							label="Start date"
							value="${formatDate(policyItem.commencementDate, `dd mmm yyyy`) === `` ? `-` : formatDate(policyItem.commencementDate, `dd mmm yyyy`)}">
						</horizon-label>
						${policyItem.status === `Cancelled`
					? html`
						<horizon-label
							data-automation-id="insure-policy-cancellation-date"
							label="Cancellation date"
							value="${formatDate(policyItem.cancellationDetails?.effectiveCancellationDate, `dd mmm yyyy`) === `` ? `-` : formatDate(policyItem.cancellationDetails?.effectiveCancellationDate, `dd mmm yyyy`)}">
						</horizon-label>
						`
					: html`
						<horizon-label
							data-automation-id="insure-policy-next-debit-order"
							label="Next debit order"
							value="${this._nextDebitOrderDisplay(policyItem)}">
						</horizon-label>
						`
				}
						
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
							value="${this._totalPremiumDisplay(policyItem)}">
						</horizon-label>`
				}
						${policyItem.status === `Cancelled`
					? html``
					: html`
						<horizon-label
							data-automation-id="insure-policy-arrears"
							label="Arrears"
							class="${sumArrears > 0 ? `arrears` : ``}"
							value="${this._arrearsDisplay(policyItem, sumArrears)}">
						</horizon-label>
						`}
						
						<horizon-label
							data-automation-id="insure-policy-display-status"
							label="Status"
							class = "${policyItem.status === `Active` ? `active-status` : `inactive-status`}"
							value="${policyItem.displayStatus}">
						</horizon-label>
				</capitec-group>
				<div slot="content">
					<capitec-group 
						class="expander-content" 
						layout="vertical"
						gap="none"
						halign="left"
						valign="center">
							${this._renderOptions(policyItem)}
					</capitec-group>
				</div>
		</horizon-expander>`;
		}) : html``}`;
	}

	/**
	 * Render Policy options
	 * @param {Object} policyItem - each policy item
	 * @returns {html} The html content of the each Policy options
	 */
	_renderOptions(policyItem) {
		this._calculateShowOptions(policyItem);
		let moreOptions = 0;

		if (policyItem.showOptions?.length > 5) {
			moreOptions = policyItem.showOptions?.splice(4);
		}

		return html`<capitec-title-bar type="default" label="Choose an option"></capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				${policyItem.showOptions?.map((option) => html`${this._getOptions(option, policyItem)}`)}
				${moreOptions?.length > 0 ? html`
					<capitec-card class="action-card">
						<capitec-overflow-menu label="More" data-automation-id = "insure-policy-more-sub-menu">
							${moreOptions?.map((option) => html`${this._getMoreOptions(option, policyItem)}`)}
						</capitec-overflow-menu>
						<capitec-label label="More" class="label-text">
						</capitec-label>
					</capitec-card>` : ``}
			</capitec-group>`;
	}

	/**
	 * Render message when no results found
	 * @returns {html} The html content of No results
	 */
	_renderNoResults() {
		return html`${isNullorEmpty(this.clientPolicies) ? ``
			: html`
			<capitec-content-box id="no-results-box">
				<div id="no-results-box-inner">
					<capitec-label label="Features of a Funeral Plan" class="strong-label"></capitec-label>
					<table id='benefits-table'>
						<tr>
							<td>Origin</td>
							<td>Leaflet</td>
						</tr>
						<tr>
							<td>Date of service update</td>
							<td>12/03/2023</td>
						</tr>
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
							<td>6 month waiting period. However, if you have cover with an existing insurer, we will waive your waiting period up to your current cover amount</td>
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
							<td>Funeral support (incl. transportation of the deceased)</td>
							<td>Request funeral support, for transportation of the deceased, by calling 0860 777 554 or log a request via our remote banking app or WhatsApp for the service provider to contact you. The place of death must be at least 50 kilometres from the place of burial</td>
						</tr>
						<tr>
							<td>Death Premium Waiver</td>
							<td>Premiums paid by insurer on death of policyholder – 6 months, allowing your family time to re-organize their financial lives</td>
						</tr>
						<tr>
							<td>Voluntary Policy Pause benefit</td>
							<td>Pause premiums and benefits – 6 months. Allows you to retain your product pricing based on entry age</td>
						</tr>
						<tr>
							<td>Double Accident benefit</td>
							<td>Payment of an additional benefit amount equal to your cover amount if lives assured die in an accident</td>
						</tr>
						<tr>
							<td>Newborn premium waiver</td>
							<td>Premiums paid by insurer on your behalf – 6 months (natural birth or adoption)</td>
						</tr>
					</table>
				</div>
			</capitec-content-box>
		`}`;
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

	/**
	 * Render the Cancel Policy Dialog
	 * @returns {html} html content
	 */
	_renderCancelPolicyDialog() {
		return this.showCancelPolicyDialog === false ? ``
			: html`
		<insure-cancel-policy-dialog 
			.contractReference = ${this.contractReferenceToCancel}
			.cancelPolicyDocumentDetails = "${this.cancelPolicyDocumentDetails}"
			.getCancelPolicyDocument="${(contractReference, cancelReason) => this._getCancelPolicyDocument(contractReference, cancelReason)}"
			@close-modal="${() => this._closeCancelPolicyDialog()}"
			@agree="${(e) => this._cancelPolicyAgree(e)}" >
		</insure-cancel-policy-dialog>`;
	}

	/**
	 * Render Pay Premium Dialog 
	 * @return {html} Html of the dialog
	 */
	_renderPayPremiumDialog() {
		return this.showPayPremiumDialog === false ? ``
			: html`
			<insure-pay-premium-dialog   
				.clientArrears = ${this.clientArrears}
				.accountDetails = ${this.accountDetails} 
				@pay-arrears = "${(e) => this._payArrears(e)}"
				@close-modal="${() => this.showPayPremiumDialog = false}" >
			</insure-pay-premium-dialog>`;
	}

	/**
	 * Render Confirm Pay Premium Dialog 
	 * @return {html} Html of the dialog
	 */
	_renderPayPremiumConfirmationDialog() {
		return this.showPayPremiumConfirmationDialog === false ? ``
			: html`
			<insure-pay-premium-confirmation-dialog 
				.amountToPay = "${this.amountToPay}" 
				.fromAccount = "${this.fromAccount}"
				.contractReference = ${this.clientArrears.contractReference}
				@close-modal="${() => this.showPayPremiumConfirmationDialog = false}" 
				@confirm-payment="${() => this._openPayPremiumAgreementDialog()}">
			</insure-pay-premium-confirmation-dialog>`;
	}

	/**
	 * Render Pay Premium Agreement Dialog 
	 * @return {html} Html of the dialog
	 */
	_renderPayPremiumAgreementDialog() {
		return this.showPayPremiumAgreementDialog === false ? ``
			: html`
			<insure-pay-premium-agreement-dialog 
				.payAmount = "${this.amountToPay}" 
				.contractReference= ${this.clientArrears.contractReference}
				.getArrearsPaymentDocument="${(contractReference) => this._getArrearsPaymentDocument(contractReference)}"
				.arrearsPaymentDocumentDetails="${this.arrearsPaymentDocumentDetails}"
				@close-modal="${() => this.showPayPremiumAgreementDialog = false}"
				@pay-premium-agree = "${() => this._payPremiumAgree()}">
			</insure-pay-premium-agreement-dialog>`;
	}

	/**
	 * Render Lodge Claim Info Dialog 
	 * @return {html} Html of the dialog
	 */
	_renderLodgeClaimInfoDialog() {
		return this.showLodgeClaimInfoDialog === false ? ``
			: html`
			<insure-lodge-claim-info-dialog @confirm="${() => this.showLodgeClaimInfoDialog = false}">
			</insure-lodge-claim-info-dialog>`;
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
	 * @returns {void}
	 */
	_renderInsureEmailDialog() {
		return this.showEmailPlanDialog === false ? ``
			: html`
				<insure-email-dialog 
					.titleMessage = "${`Email Funeral Plan`}"
					@close-modal="${() => this.showEmailPlanDialog = false}"
					@send-email = "${(emailAddress) => this._sendEmail(emailAddress)}">
				</insure-email-dialog>`;
	}

	
/**
 * Renders the Email Success alert
 * @returns {html} html content
 */
_renderSuccessAlert() {
	return this.emailEstimateSuccess === false ? html``
	: html`
		<capitec-toast
			class="toast"
			type="success"
			Header="Successful"
			layout = "vertical"
			detail = "Document sent successfully"
			@click = "${() => this.emailEstimateSuccess = false}">
		</capitec-toast>

	`;
}

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
 * @event ClientPolicies#_expanded
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