import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { ClientPoliciesEvents } from 'app/constants/telemetry/events/Insure';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { Status } from 'app/constants/InsureCommon';
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
import 'app/components/insure/ClaimsList';

const MAIN_LIFE_MINIMUM_COVER = 5000;


/**
 * Client policies component showing all the policies a client currently has on their account
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
class ClientPolicies extends Component {

	// #region INITIALISATION

	constructor() {
		super();
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
			showLodgeClaimInfoDialog: { type: Boolean, state: true }
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
		this.dispatchEvent(new CustomEvent(`navigate-to-claim-summary`, { detail: e.detail }));
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
	 * @returns {null} null
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
	 * Determine show sub menu or not
	 * @param {object} policyItem - each policy item 
	 * @returns {void}
	 */
	_showSubMenu(policyItem) {
		policyItem.showSubMenu = false;

		let count = 0;
		if (policyItem.canReinstate) {
			count += 2;
		} else {
			if (policyItem.arrearDetails?.outstandingAmount > 0) {
				count += 1;
			}

			if (policyItem.status === `Active` || policyItem.status === `PendingInForce`) {
				count += 1;
			}
			count += 2;
		}

		if (policyItem.status !== `Cancelled` && policyItem.status !== `Lapsed` && policyItem.status !== `NotTakenUp`) {
			count += 3;
		} else {
			count += 1;
		}

		if (count > 5) {
			policyItem.showSubMenu = true;
		}
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
				height: 850px;
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
			}

			.benefits-table-cell{
				background-color: #f3f3f3;
				padding: 2px;
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
		`;
	}

	/**
	 * Render the content HTML for the component
	 * @returns {html} html
	 */
	_renderContent() {
		return html`
			<capitec-card 
				data-automation-id="insure-landing-screen"
				class="card">
				<capitec-title-bar type="insure" class="insure-title-bar">
					<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
					<capitec-label label="Insure" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-button type="white" class="capitec-button-medium"  label="Lodge Claim" data-automation-id="insure-landing-lodge-claim"
						@click="${() => this.showLodgeClaimInfoDialog = true}">
					</capitec-button>
					${this._renderGetEstimateButton()}
				</capitec-title-bar>
				${this._renderPoliciesLandingContent()}
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
				heading="You have reached your maximum allowed funeral cover">
				<capitec-button 
					disabled
					type="white" 
					class="capitec-button-medium" 
					label="Get Estimate" 
					data-automation-id="insure-landing-get-estimate">
				</capitec-button>
			</capitec-popover>`;
		}
		else if (this.readOnlyMode === false || this.readOnlyMode === undefined) {
			return html`
				<capitec-button 
					type="white" 
					class="capitec-button-medium" 
					label="Get Estimate" 
					data-automation-id="insure-landing-get-estimate"
					@click="${() => this._goToEstimate()}">
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
					<capitec-content-box class="header-label">
						${isNullorEmpty(this.clientPolicies) ? html`<capitec-label label="Funeral Plan" class="strong-label"></capitec-label>` : html``}
					</capitec-content-box>
					<capitec-content-box  id="client-policies-box" class="accounts-box">
							${this._renderPoliciesDetailsBar()}
					</capitec-content-box>
					${this._renderFooter()}
				</capitec-tab>
				<capitec-tab
					data-automation-id="insure-landing-claims-tab"
					label="Claims">
					<capitec-content-box  id="client-policies-box" class="accounts-box">
						<horizon-insure-claims-list @navigate-to-claim-summary="${(e) => this._goToClaimSummary(e)}" .clientClaims="${this.clientClaims}"></horizon-insure-claims-list>
					</capitec-content-box>
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
							label="Policy Number"
							textOverflow="ellipsis"
							value="${policyItem.contractReference}"
							@click="${() => this._goToPolicySummary(policyItem.contractReference)}">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							data-automation-id="insure-policy-start-date"
							label="Start Date"
							value="${formatDate(policyItem.commencementDate, `dd mmm yyyy`) === `` ? `-` : formatDate(policyItem.commencementDate, `dd mmm yyyy`)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-policy-next-debit-order"
							label="Next Debit Order"
							value="${formatDate(policyItem.paymentSchedule?.nextPaymentDate, `dd mmm yyyy`) === `` ? `-` : formatDate(policyItem.paymentSchedule?.nextPaymentDate, `dd mmm yyyy`)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-policy-total-premium"
							label="Total Premium"
							value="${isNullorEmpty(policyItem.totalPremium) ? formatCurrency(0) : formatCurrency(policyItem.totalPremium)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-policy-arrears"
							label="Arrears"
							class="${sumArrears > 0 ? `arrears` : ``}"
							value="${isNullorEmpty(sumArrears) ? formatCurrency(0) : formatCurrency(sumArrears)}">
						</horizon-label>
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
		}) : this._renderNoResults()}`;
	}

	/**
	 * Render Policy options
	 * @param {Object} policyItem - each policy item
	 * @returns {html} The html content of the each Policy options
	 */
	_renderOptions(policyItem) {
		this._showSubMenu(policyItem);

		return html`
			<capitec-title-bar type="default" label="Choose an option"></capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				${policyItem.canReinstate
				? html`
					<horizon-option-button 
						data-automation-id="insure-policy-options-reinstate"
						class="button-margin" 
						label="Re-Issue" 
						icon="system/history-action"
						@click="${() => this._goToUpdatePlan(policyItem.contractReference, policyItem.canReinstate)}"
						.disabled="${this.readOnlyMode}">
					</horizon-option-button>
					<horizon-option-button 
						data-automation-id="insure-policy-options-email-plan"
						class="button-margin" 
						label="Email Plan" 
						icon="system/profile-action"
						.disabled="${this.readOnlyMode}">
					</horizon-option-button>`
				: html`${policyItem.arrearDetails?.outstandingAmount > 0 && (policyItem.status === `Active` || policyItem.status === `PendingInForce`)
					? html`
						<horizon-option-button 
							data-automation-id="insure-policy-options-pay-arrears"
							class="button-margin" 
							label="Pay Arrears" 
							icon="status/error"
							@click="${() => this._openPayPremiumDialog(policyItem)}"
							.disabled="${this.readOnlyMode}">
						</horizon-option-button>
					` : ``}
					${policyItem.status === `Active` || policyItem.status === `PendingInForce`
						? html`<horizon-option-button 
						data-automation-id="insure-policy-options-update-plan"
						class="button-margin" 
						label="Update Plan" 
						icon="system/profile-action"
						@click="${() => this._goToUpdatePlan(policyItem.contractReference)}"
						.disabled="${this.readOnlyMode}">
					</horizon-option-button>
					` : ``}
					
					<horizon-option-button 
						data-automation-id="insure-policy-options-email-plan"
						class="button-margin" 
						label="Email Plan" 
						icon="system/profile-action"
						.disabled="${this.readOnlyMode}">
					</horizon-option-button>
					
					${policyItem.showSubMenu ? `` : html`
						<horizon-option-button 
							data-automation-id="insure-policy-options-transaction-history"
							class="button-margin" 
							@click="${() => this._goToPolicyTransactionHistory(policyItem)}"
							label="Transaction History" 
							icon="system/transfer-action"
							.disabled="${this.readOnlyMode}">
						</horizon-option-button>
						<horizon-option-button 
							data-automation-id="insure-policy-options-sms-history"
							class="button-margin" 
							@click="${() => this._goToSMSHistory(policyItem)}"
							label="SMS History" 
							icon="system/send-action"
							.disabled="${this.readOnlyMode}">
						</horizon-option-button>
						${policyItem.status !== `Cancelled` && policyItem.status !== `Lapsed` && policyItem.status !== `NotTakenUp`
							? html`
							<horizon-option-button 
								data-automation-id="insure-policy-options-cancel-plan"
								class="button-margin" 
								@click="${() => this._openCancelPolicyDialog(policyItem.contractReference)}"
								label="Cancel Plan" 
								icon="system/delete-action"
								.disabled="${this.readOnlyMode}">
							</horizon-option-button>`
							: ``
						}
					`}
				`}
				${policyItem.showSubMenu ? this._renderSubMenu(policyItem) : ``}
			</capitec-group>
		`;
	}

	/**
	 * Render More Sub menu
	 * @param {Object} policyItem policy item
	 * @returns {html} The html content of more sub menu 
	 */
	_renderSubMenu(policyItem) {
		return html`
		<capitec-card class="action-card">
			<capitec-overflow-menu label="More" data-automation-id = "insure-policy-more-sub-menu">
				<capitec-overflow-menu-item icon="system/transfer-action" label="Transaction History" @click="${() => this._goToPolicyTransactionHistory(policyItem)}"></capitec-overflow-menu-item>
				<capitec-overflow-menu-item icon="system/send-action" label="SMS History" @click="${() => this._goToSMSHistory(policyItem)}"></capitec-overflow-menu-item>
				${policyItem.status !== `Cancelled` && policyItem.status !== `Lapsed` && policyItem.status !== `NotTakenUp` ? html`
				<capitec-overflow-menu-item icon="system/delete-action" label="Cancel Plan" @click="${() => this._openCancelPolicyDialog(policyItem.contractReference)}"></capitec-overflow-menu-item>` : html``}
			</capitec-overflow-menu>
			<capitec-label label="More" class="label-text">
			</capitec-label>
		</capitec-card>`;
	}

	/**
	 * Render message when no results found
	 * @returns {html} The html content of No results
	 */
	_renderNoResults() {
		return html`${isNullorEmpty(this.clientPolicies) ? ``
			: html`
					<capitec-label label="Features of a Funeral Plan" class="strong-label"></capitec-label>
					<table id='benefits-table'>
						<tr>
							<td class="benefits-table-cell">Origin</td>
							<td class="benefits-table-cell">Leaflet</td>
						</tr>
						<tr>
							<td class="benefits-table-cell">Date of service update</td>
							<td class="benefits-table-cell">00/00/0000</td>
						</tr>
						<tr>
							<td class="benefits-table-cell">Maximum cover</td>
							<td class="benefits-table-cell">
								<div>R100 000 - Main Life"</div>
								<div>R100 000 - Spouse</div>
								<div>R20 000 - Children (0 - 5 years) </div>
								<div>R50 000 - Children (6 - 13 years) </div>
								<div>R60 000 - Children (14 - 25 years) </div>
								<div>R50 000 - Parents </div>
								<div>R50 000 - Extended Family</div>
							</td>
						</tr>
						<tr>
							<td class="benefits-table-cell">Waiting period</td>
							<td class="benefits-table-cell">6 month waiting period. However, if you have cover with an existing insurer, we will waive your waiting period u to your current cover amount</td>
						</tr>
						<tr>
							<td class="benefits-table-cell">Maximum entry age</td>
							<td class="benefits-table-cell">
								<div>64 - Main Life and Spouse</div>
								<div>25 - Children</div>
								<div>85 - Parents and Extended Family</div>
							</td>
						</tr>
						<tr>
							<td class="benefits-table-cell">Number of lives assured</td>
							<td class="benefits-table-cell">22</td>
						</tr>
						<tr>
							<td class="benefits-table-cell">Funeral support (incl. transportation of the deceased)</td>
							<td class="benefits-table-cell">Request funeral support, for transportation of the deceased, by calling 0860 777 554 or log a request via our remote banking app or WhatsApp for the service provider to contact you. The place of death must be at least 50 kilometres from the place of burial</td>
						</tr>
						<tr>
							<td class="benefits-table-cell">Death Premium Waiver</td>
							<td class="benefits-table-cell">Premiums paid by insurer on death of policyholder – 6 months, allowing your family time to re-organize their financial lives</td>
						</tr>
						<tr>
							<td class="benefits-table-cell">Voluntary Policy Pause benefit</td>
							<td class="benefits-table-cell">Pause premiums and benefits – 6 months. Allows you to retain your product pricing based on entry age</td>
						</tr>
						<tr>
							<td class="benefits-table-cell">Double Accident benefit</td>
							<td class="benefits-table-cell">Payment of an additional benefit amount equal to your cover amount if lives assured die in an accident</td>
						</tr>
						<tr>
							<td class="benefits-table-cell">Newborn premium waiver</td>
							<td class="benefits-table-cell">Premiums paid by insurer on your behalf – 6 months (natural birth or adoption)</td>
						</tr>
					</table>
			`}`;
	}

	/**
	 * Render Footer
	 * @returns {html} The html content of Footer
	 */
	_renderFooter() {
		return html`
			<capitec-group class="" layout="vertical" gap="none" halign="left" valign="center">
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

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-client-policies`, ClientPolicies);

/**
 * Product enquiry event, navigate to corporate website, Insure page
 *
 * @example
 * <horizon-insure-client-policies ... @product-enquiry="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#product-enquiry
 * @type {Object} - N/A
 */

/**
 * Attempt to pay policy arrears
 *
 * @example
 * <horizon-insure-client-policies ... @pay-policy="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#pay-policy
 * @type {Object} - N/A
 */

/**
 * Attempt to cancel policy with reason
 *
 * @example
 * <horizon-insure-client-policies ... @cancel-policy="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#cancel-policy
 * @type {Object} - N/A
 */

/**
 * When Get Estimate button is clicked, navigate
 *
 * @example
 * <horizon-insure-client-policies ... @navigate-to-estimate="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#navigate-to-estimate
 * @type {Object} - N/A
 */

/**
 * When Update Plan tile is clicked, navigate
 *
 * @example
 * <horizon-insure-client-policies ... @navigate-to-update-plan="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#navigate-to-update-plan
 * @type {Object} - N/A
 */

/**
 * When policy contract reference link is clicked, navigate
 *
 * @example
 * <horizon-insure-client-policies ... @navigate-to-policy-summary="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#navigate-to-policy-summary
 * @type {Object} - N/A
 */

/**
 * Navigate to claim summary from claim number
 *
 * @example
 * <horizon-insure-client-policies ... @navigate-to-claim-summary="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#navigate-to-claim-summary
 */

/**
 * Navigate to transaction history
 *
 * @example
 * <horizon-insure-client-policies ... @navigate-to-policy-transaction-history="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#navigate-to-policy-transaction-history
 */

/**
 * Navigate to SMS History history
 *
 * @example
 * <horizon-insure-client-policies ... @navigate-to-sms-history="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#navigate-to-sms-history
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