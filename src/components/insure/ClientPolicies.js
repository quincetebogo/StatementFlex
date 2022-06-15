import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';

//Dialogs
import 'app/components/dialogs/insure/PayPremiumDialog';
import 'app/components/dialogs/insure/PayPremiumConfirmationDialog';
import 'app/components/dialogs/insure/PayPremiumAgreementDialog';

/**
 * Client policies component showing all the policies a client currently has on their account
 * This is the primary landing screen for client that has insurance product
 * 
 * Events Raised 
 * -------------
 * navigate-to-estimate
 * navigate-to-update-plan
 * navigate-to-policy-summary
 * navigate-to-pay-premium-success
 *  
 * product-enquiry
 * _expanded
 * _collapsed
 * 
 * @export
 * @class ClientPolicies
 * @extends {Component}
 */
class ClientPolicies extends Component {

	//#region INITIALISATION

	constructor() {
		super();
		
		this.showPayPremiumDialog = false;
		this.showPayPremiumConfirmationDialog = false;
		this.showPayPremiumAgreementDialog = false;
		this.amountToPay = 0;

		this.clientPolicies = null;
	}

	//#endregion INITIALISATION

	//#region PROPERTIES

	/**
	 * @property {Object} clientArrears Data & flags from Arrears Service
	 * @property {boolean} showPayPremiumDialog Determines if the Pay Premium dialog should be shown
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			clientArrears: { type: Object, state: true },
			payArrears: {type: Object, state: true},
			showPayPremiumDialog: { type: Boolean, state: true},
			showPayPremiumConfirmationDialog: {type: Boolean, state: true},
			showPayPremiumAgreementDialog: {type: Boolean, state: true},
			amountToPay: {type: Number, state: true},

			clientPolicies: { type: Object, state: true },
			policyDetails: { type: Object, state: true }
		};
	}

	//#endregion PROPERTIES

	//#region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	 connectedCallback() {
		super.connectedCallback();
	}

	//#endregion LIFECYCLE OVERRIDES

	//#region EVENT HANDLERS

	/**
	 * Fire navigate event to Estimate
	 */
	_goToEstimate() {
		this.dispatchEvent(new CustomEvent(`navigate-to-estimate`, {
			detail: {
			}
		}));
	}

	/**
	 * Fire navigate event to Update Plan
	 */
	_goToUpdatePlan() {
		this.dispatchEvent(new CustomEvent(`navigate-to-update-plan`, {
			detail: {
			}
		}));
	}

	/**
	 * Fire navigate event to Policy Summary
	 */
	_goToPolicySummary(contractReference) {
		this.dispatchEvent(new CustomEvent(`navigate-to-policy-summary`, {
			detail: { policyContractReference: contractReference 
			}
		}));
	}

	/**
	 * Fire navigate event to Policy Transaction History
	 */
	_goToPolicyTransactionHistory(contractReference) {
		this.dispatchEvent(new CustomEvent(`navigate-to-policy-transaction-history`, {
			detail: { policyNumber: contractReference
			}
		}));
	}

	/**
	 * Fire navigate event to Pay Premium Success page
	 */
	_goToPayPremiumSuccess(){
		this.dispatchEvent(new CustomEvent(`navigate-to-pay-premium-success`, {
			detail: {
			}
		}));
	}

	/**
	 * Close Pay Premium Dialog and Open the Pay Premium Confirmation Dialog.
	 * 
	 * @param {*} e contains the values pay arrears and amount to be paid
	 */
	 _payArrears(e) {
			this.payArrears = e.detail.payArrears;
			this.amountToPay = e.detail.amountToPay;

			this.showPayPremiumDialog = false;
			this.showPayPremiumConfirmationDialog = true;
	}

	/**
	 * Open Pay Premium Agreement Dialog
	 */
	_openPayPremiumAgreementDialog(){
		this.showPayPremiumConfirmationDialog = false;
		this.showPayPremiumAgreementDialog = true;		
	}

	/**
	 * Close Pay Premium Agreement Dialog
	 */
	_closePayPremiumAgreementDialog() {
		this.showPayPremiumAgreementDialog = false;
	}

	/**
	 * Close Pay Premium Confirmation Dialog
	 */
	_closePayPremiumConfirmationDialog(){
		this.showPayPremiumConfirmationDialog = false;
	}

	/**
	 * Open Pay Premium dialog 
	 */
	 _openPayPremiumDialog(policyItem) {
		this.clientArrears = {
			contractReference: policyItem.contractReference,
			arrears: policyItem.arrearDetails.arrears
			}
		this.showPayPremiumDialog = true;
	}

	/**
	 * Close Pay Premium dialog 
	 */
	_closePayPremiumDialog() {
		this.showPayPremiumDialog = false;
	}


	//#endregion EVENT HANDLERS

	//#region PRIVATE FUNCTIONS

	/**
	 * Fire navigate event to Product Enquiry
	 */
	_productEnquiry() {
		this.dispatchEvent(new CustomEvent(`product-enquiry`, { detail: {} }));
	}

	/**
	 * 
	 * @param {Object} policyItem - Policy details 
	 */
	_expanded(policyItem)
	{
		policyItem.isExpanded = true;

		this.policiesList?.forEach(item => { if (item.contractReference != policyItem.contractReference ) item["isExpanded"] = false ;})

		this.requestUpdate();
	}

	/**
	 * 
	 * @param {Object} policyItem - Policy details 
	 */
	_collapsed(policyItem)
	{
		policyItem.isExpanded = false;
		this.requestUpdate();
	}	

	/**
	 * 
	 * @param {Object} policyItem - Policy details 
	 * Get Total cover amount of all role players
	 */
	_getTotalCoverAmount(policyItem)
	{
		return policyItem.roleplayers.reduce((accumulator, object) => {
			return accumulator + (object.coverAmount ?? 0);
		}, 0);
	}	

	//#endregion PRIVATE FUNCTIONS

	//#region RENDERING

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
			.insure-title-bar{
				margin-bottom: 0px; 
				border-top-left-radius: 5px; 
				border-top-right-radius: 5px;
			}
			capitec-tab-group {
				--theme-tab-tab-bar-background-color: linear-gradient(315deg, #70838C 0%, #667F8C 47.52%, #41525B 100%);
				--theme-tab-hover-background-color: transparent;
				--theme-tab-selected-indicator-color: #FFFFFF;
				--theme-tab-selected-font-color: #FFFFFF;
				--theme-tab-indicator-border-radius: 0px;
				--theme-tab-font-color: #FFFFFF;
				--theme-tab-border-bottom: 0px;
				--theme-tab-font-weight: 400;
				--theme-container-padding-left: 0px;
				--theme-container-padding-right: 0px;
				--theme-container-padding-bottom: 0px;
				--theme-tab-bar-height: 64px;
			}
			.card {
				width: 100%;
				height: 888px;
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
				height: 600px;
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
				width: 186px;
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
				--horizon-label-value-color: #70AF00;
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
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html}
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
			${this._renderError()}
		`}

	/**
	 * Render the content HTML for the component
	 * @returns {html}
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
					<capitec-button type="white"  label="Get Estimate" data-automation-id="insure-landing-get-estimate"
						@click="${() => this._goToEstimate()}">
					</capitec-button>
				</capitec-title-bar>
				${this._renderPoliciesLandingContent()}
		</capitec-card>
		`
	}

	/**
	 * Render Landing page for Policies & Claims
	 * @returns {html} The html content of the Policies & Claims tabs
	 */
	_renderPoliciesLandingContent() {
		return html`
			<capitec-tab-group class="tabs">
				<capitec-tab
					data-automation-id="insure-landing-policies-tab"
					label="Policies">
					<capitec-content-box  class="accounts-box">
							${this._renderPoliciesDetailsBar()}
					</capitec-content-box>
					${this._renderFooter()}
				</capitec-tab>
				<capitec-tab
					data-automation-id="insure-landing-claims-tab"
					label="Claims">
					<capitec-content-box  class="accounts-box">
						<label>Claims - Coming soon to a sprint near you!</label>
					</capitec-content-box>
					${this._renderFooter()}
				</capitec-tab>
			</capitec-tab-group>`;
	}

	/**
	 * Render List of Policies
	 * @returns {html} The html content the list of Policies
	 */
	_renderPoliciesDetailsBar()
	{
		this.policiesList = this.clientPolicies?.summaryDetails?.policies;

		return html `${ this.policiesList?.length > 0 ? this.policiesList?.map((policyItem, index) => html`
		<horizon-expander
			expandButtonAlignment="right"
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
					${policyItem.arrearDetails.outstandingAmount > 0 ? html`<capitec-icon class="capitec-info-icon" icon="system/info-action"
						@click="${(policyItem) => this._goToPolicySummary(policyItem.contractReference)}"></capitec-icon>` 
							: html`<span class="policy-item"></span>`}
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
							value="${ formatDate(policyItem.commencementDate, `dd mmm yyyy`) === '' ? '-' : formatDate(policyItem.commencementDate, `dd mmm yyyy`)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-policy-debit-order-date"
							label="Debit Order Date"
							value="${formatDate(policyItem.paymentSchedule?.nextPaymentDate, `dd mmm yyyy`) === '' ? '-' : formatDate(policyItem.paymentSchedule?.nextPaymentDate, `dd mmm yyyy`)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-policy-cover-amount"
							label="Cover Amount"
							value="${formatCurrency(this._getTotalCoverAmount(policyItem))}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-policy-total-premium"
							label="Total Premium"
							value="${formatCurrency(policyItem.totalPremium)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-policy-display-status"
							label="Status"
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
		</horizon-expander>`) : this._renderNoResults() }`;
	}

	/**
	 * Render Policy options
	 * @param {Object} policyItem - each policy item
	 * @returns {html} The html content of the each Policy options
	 */
	_renderOptions(policyItem) {
		return html`
			<capitec-title-bar type="default" label="Choose an option"></capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				${policyItem.arrearDetails.outstandingAmount > 0 ? 
					html `
				<horizon-option-button 
					data-automation-id="insure-policy-options-pay-arrears"
					class="button-margin" 
					label="Pay Arrears" 
					icon="status/error"
					@click="${() => this._openPayPremiumDialog(policyItem)}">
				</horizon-option-button>
				` : ``}
				<horizon-option-button 
					data-automation-id="insure-policy-options-update-plan"
					class="button-margin" 
					label="Update Plan" 
					icon="system/profile-action">
				</horizon-option-button>
				<horizon-option-button
					data-automation-id="insure-policy-options-claims"
					class="button-margin" 
					label="Claims" 
					icon="system/documents-action">
				</horizon-option-button>
				<horizon-option-button 
					data-automation-id="insure-policy-options-email-plan"
					class="button-margin" 
					label="Email Plan" 
					icon="system/profile-action">
				</horizon-option-button>
				${policyItem.arrearDetails.outstandingAmount < 1 ? 
					html `
				<horizon-option-button 
					data-automation-id="insure-policy-options-benefits"
					class="button-margin" 
					label="Benefits" 
					icon="system/sars-action">
				</horizon-option-button>
				` : ``}	
				${this._renderSubMenu(policyItem)}
			</capitec-group>
		`;
	}

	/**
	 * Render More Sub menu
	 * @param {Object} policyItem 
	 * @returns {html} The html content of more sub menu 
	 */
	_renderSubMenu(policyItem)
	{
		return html`
		<capitec-card class="action-card">
			<capitec-overflow-menu label="More" data-automation-id = "insure-policy-more-sub-menu">
				<capitec-overflow-menu-item icon="system/transfer-action" label="Transaction history" @click="${() => this._goToPolicyTransactionHistory(policyItem.contractReference)}"></capitec-overflow-menu-item>
				<capitec-overflow-menu-item icon="system/delete-action" label="Cancel Plan"></capitec-overflow-menu-item>
				${policyItem.arrearDetails.outstandingAmount > 0 ?
					html `<capitec-overflow-menu-item icon="system/sars-action" label="Benefits"></capitec-overflow-menu-item>`
					: ``}
			</capitec-overflow-menu>
			<capitec-label label="More" class="label-text">
			</capitec-label>
		</capitec-card>`
	}

	/**
	 * Render message when no results found
	 * @returns {html} The html content of No results
	 */
	_renderNoResults() {
		return html `${ isNullorEmpty(this.clientPolicies) ? `` : 
			html `<capitec-group
				class="no-result-group"
				layout="vertical"
				halign="center"
				valign="center"
				gap="none">
					<capitec-label
						data-automation-id = "insure-policy-no-results"
						class="no-results"
						label="No results found"
						type="strong">
					</capitec-label>
			</capitec-group>`
		}`;
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

	// Not for estimate testing - reenable later
	// <capitec-button type="white" label="Update plan" @click="${() => this._goToUpdatePlan()}">
	// </capitec-button>
	// <capitec-button type="white" label="Policy Summary" @click="${() => this._goToPolicySummary()}">
	// </capitec-button>

	/**
	 * Render Pay Premium Dialog 
	 * @return {html} Html of the dialog
	 */
	 _renderPayPremiumDialog() {
		return this.showPayPremiumDialog == false ? `` :
			html`
			<insure-pay-premium-dialog  @close-modal="${(e) => this._closePayPremiumDialog()}" .clientArrears = ${this.clientArrears}
			@pay-arrears = "${(e) => this._payArrears(e)}" >	
			</insure-pay-premium-dialog>`

	}

	/**
	 * Render Confirm Pay Premium Dialog 
	 * @return {html} Html of the dialog
	 */
	 _renderPayPremiumConfirmationDialog() {
		return this.showPayPremiumConfirmationDialog == false ? `` :
			html`
			<insure-pay-premium-confirmation-dialog @close-modal="${(e) => this._closePayPremiumConfirmationDialog()}" 
			@confirm-payment="${(e) => this._openPayPremiumAgreementDialog()}"
			.amountToPay = ${this.amountToPay} .contractReference = ${this.clientArrears.contractReference}>	
			</insure-pay-premium-confirmation-dialog>`

	}

	/**
	 * Render Pay Premium Agreement Dialog 
	 * @return {html} Html of the dialog
	 */
	 _renderPayPremiumAgreementDialog() {
		return this.showPayPremiumAgreementDialog == false ? `` :
			html`
			<insure-pay-premium-agreement-dialog @close-modal="${(e) => this._closePayPremiumAgreementDialog()}"
			@agree="${(e) => this._goToPayPremiumSuccess()}">	
			</insure-pay-premium-agreement-dialog>`

	}

	_renderError(){
		return html`
			<insure-unknown-error-dialog></insure-unknown-error-dialog>
			
			`
		
	}

	//#endregion RENDERING
}

window.customElements.define(`horizon-insure-client-policies`, ClientPolicies);

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
 * When Pay Arrears button is clicked in dialog, payArrears object is passed through
 *
 * @example
 * <horizon-insure-client-policies ... @pay-arrears="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#navigate-to-estimate
 * When product enquiry is clicked, navigate
 *
 * @example
 * <horizon-option-button ... @click="${() => this._productEnquiry()}"></horizon-option-button>
 *
 * @event ClientPolicies#product-enquiry
 * @type {Object} - N/A
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