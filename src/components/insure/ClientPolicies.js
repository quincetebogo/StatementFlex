import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';

/**
 * Client policies component showing all the policies a client currently has on their account
 * This is the primary landing screen for client that has insurance product
 * 
 * Events Raised 
 * -------------
 * navigate-to-estimate
 * navigate-to-update-plan
 * navigate-to-policy-summary
 *  
 * @export
 * @class ClientPolicies
 * @extends {Component}
 */
class ClientPolicies extends Component {

	//#region INITIALISATION

	constructor() {
		super();

		this.clientPolicies = null;
		this.isExpanded = true;
		
		this._policies = [
			{
				policyNumber: `CF00001`,
				effectiveDate: `01 Feb 2022`,
				debitOrderDate: `25 Mar 2022`,
				coverAmount: 35000.50,
				totalPremium: 88.50,
				status: `Active`,
				inArrears: false
			}
			,
			{
				policyNumber: `CF00002`,
				effectiveDate: `01 Mar 2022`,
				debitOrderDate: `28 Apr 2022`,
				coverAmount: 25000.75,
				totalPremium: 158.50,
				status: `In Arrears`,
				inArrears: true
			}
		];
	}

	//#endregion

	//#region PROPERTIES

	/**
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			clientPolicies: { type: Object, state: true },
			isExpanded: { state: true }
		};
	}

	//#endregion

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
	_goToPolicySummary() {
		this.dispatchEvent(new CustomEvent(`navigate-to-policy-summary`, {
			detail: {
			}
		}));
	}

	//#endregion

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
				--theme-tab-tab-bar-background-color: var(--theme-type-insure-background, darkgreen);
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
			#temp-container{
				min-height: 650px;
				text-align: center;
				padding-top: 100px;
			}

			#temp-container-label{
				font-weight: bold;
				font-size: 24px;
			}

			.card {
				width: 100%;
				height: auto;
			}
			capitec-content-box {
				width: auto;
				height: 666px;
				
				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 19px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-bottom: 0px;
			}
			capitec-content-box > capitec-card {
				border: 1px solid #E1E1E1;
				border-radius: 4px;
				background-color: #FFFFFF;
				box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);

				--theme-card-min-height: 64px;
			}
			.policy-details-bar {
				display: flex;
				position: relative;
			}
			.policy-details-bar-padding {
				padding-bottom: 144px;
			}
			.policy-details-bar > capitec-expander {
				position: absolute;
				border-bottom: 1px solid #E1E1E1;
				border-radius:4px;
				--theme-container-padding-right: 0px;
				--theme-container-padding-left: 0px;
				--theme-container-padding-top: 0px;
				--theme-container-padding-bottom: 0px;
				--theme-expander-header-height: 64px;
				--theme-expander-height: 211px;
				--theme-expander-indicator-width: 11.5px;
				--theme-expander-indicator-height: 6.5px;
				box-shadow:0 3px 6px 0.25px rgba(0,0,0,0.08);
			}
			.policy-details-bar > capitec-group {
				width: 984px;
				z-index: 10;
				padding-top: 12px;
				padding-bottom: 12px;
				border-right: 1px solid #dfdfdf;
			}
			.actionbar-header:hover{
				background-color: #E5F5FB;
			}
			.actionbar-header > capitec-group > capitec-icon{
				padding-left: 15px;
			}
			.actionbar-header > horizon-label[label="Policy Number"] {
				width: 174px;
				border-right: 1px solid #dfdfdf;
				--horizon-label-value-color: #009DE0;
				--theme-label-cursor: pointer;
			}
			.actionbar-header > horizon-label[label="Status"] {
				--horizon-label-value-color: #70AF00;
			}
			.actionbar-header > horizon-label {
				width: 156px;
				height: 100%;
				font-weight: 300;
				justify-content: left;
				padding: 0px 0px 0px 16px;
				--horizon-label-text-height: 20px;
				--horizon-label-text-font-size: 14px;
				--horizon-label-text-line-height: 20px;
				--horizon-label-value-height: 20px;
				--horizon-label-value-font-size: 16px;
				--horizon-label-value-line-height: 20px;
				--horizon-label-value-color:#3A3A3A;
			}
			capitec-group > capitec-title-bar {
				--theme-titlebar-min-height: 32px;
				--theme-titlebar-padding: 0px 0px 0px 16px;
				--theme-type-default-background: rgb(244, 244, 244);
				--theme-label-title-font-size: 15px;
				--theme-label-title-font-weight: 600;
				--theme-type-default-font-color: #545D60;

				border-top: 1px solid #E1E1E1;
			}
			.other-options {
				--theme-type-default-font-color: #3A3A3A
			}
			.options-group {
				height: 80px; 
				margin: 17px 0px 15px 0px;
				width: auto;
			}
			horizon-option-button {
				width: 204px;
				height: 80px;

				--horizon-option-btn-text-margin-top: 3px;
			}
			.button-margin {
				height: 80px;
				width: 185px;
				margin-left: 16px;
				padding: 0px;
				--horizon-option-btn-icon-height: 26px;
				--horizon-option-btn-icon-width: 26px;
			}
			.label-text {
    			font-size: var(--theme-button-font-size, 14px);
    			font-weight: var(--theme-button-font-weight, bold);
			}
			.policy-item {
				display: inline-block;
				width: 30px;
			}
			.action-card{
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 10px;
				height: 80px;
				--theme-card-min-width: 185px;
				margin-left: 16px;
			}
			.capitec-info-icon {
				--theme-icon-size-medium: 24px;
			}
			.flexible-label {
				width: 25%;
				--horizon-label-max-overflow-width: 180px;
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
		`;
	}

	/**
	 * Render the content HTML for the component
	 * @returns {html}
	 */
	_renderContent() {
		return html`
			<capitec-card 
				data-automation-id="savings-plan-landing-screen"
				class="card">
				<capitec-title-bar type="insure" class="insure-title-bar">
					<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
					<capitec-label label="Insure" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-button type="white" label="Get Estimate" @click="${() => this._goToEstimate()}">
					</capitec-button>
				</capitec-title-bar>
				${this._renderPoliciesLandingContent()}
		</capitec-card>`
	}

	_renderPoliciesLandingContent() {
		return html`
			<capitec-tab-group class="tabs">
				<capitec-tab
					data-automation-id="insure-policies-tab"
					label="Policies">
					<capitec-content-box>
						<capitec-card>
							${this._renderPolicyDetailsBar()}
						</capitec-card>
					</capitec-content-box>
				</capitec-tab>
				<capitec-tab
					data-automation-id="insure-quotes-tab"
					label="Quotes">
					I'm inside Quotes tab
				</capitec-tab>
			</capitec-tab-group>`;
	}

	_expanded(e, policyItem)
	{
		policyItem.isExpanded = true;

		this._policies.forEach(item => { if (item.policyNumber != policyItem.policyNumber ) item["isExpanded"] = false ;})

		this.requestUpdate();
	}

	_collapsed(e, policyItem)
	{
		policyItem.isExpanded = false;
		this.requestUpdate();
	}	

	_renderPolicyDetailsBar() {
		var policiesList = this._policies; //this.clientPolicies?.summaryDetails.policies;

		return policiesList != null ? html`
			${policiesList.map(policyItem => html`
			<div class="policy-details-bar ${policyItem.isExpanded ? `policy-details-bar-padding` : ``}">
				<capitec-expander label="" ?expanded = "${policyItem.isExpanded}" @expand = "${(e) => this._expanded(e, policyItem)}"
					@collapse = "${(e) => this._collapsed(e, policyItem)}">
					${this._renderOptions(policyItem)}
				</capitec-expander>
				<capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">
					${this._renderArrearsIndicator(policyItem)}
					<horizon-label
						label="Policy Number"
						class="flexible-label"
						value="${policyItem.contractReference}"
						@click="${() => this._goToPolicySummary()}">
					</horizon-label>
					<horizon-label
						label="Effective Date"
						value="${policyItem.effectiveDate}">
					</horizon-label>
					<horizon-label
						label="Debit Order Date"
						value="${policyItem.debitOrderDate}">
					</horizon-label>
					<horizon-label
						label="${this._expanded ? `Cover Amount` : `Cover Amounts`}"
						value="${formatCurrency(policyItem.coverAmount)}">
					</horizon-label>
					<horizon-label
						label="Total Premium"
						value="${formatCurrency(policyItem.totalPremium)}">
					</horizon-label>
					<horizon-label
						label="Status"
						value="${policyItem.status}">
					</horizon-label>
				</capitec-group>
			</div>`)}
		` : html `${this._renderNoResults()}`;
	}

	/**
	 * Renders an arrears icon if policy in arrears
	 * @returns {html} The html content of the component.
	 */
	 _renderArrearsIndicator(policyItem) {
		return html`<capitec-group layout="vertical" valign="center" halign="left" gap="none">
			${policyItem.inArrears === true ? html`<capitec-icon class="capitec-info-icon" icon="system/info-action"></capitec-icon>` 
			: html`<span class="policy-item"></span>`}
		</capitec-group>`;
	}

	_renderOptions(policyItem) {
		return html`
			<capitec-group class= "" layout="vertical" gap="none" halign="left" valign="center">
				<capitec-title-bar type="default" label="Choose an option"></capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					${policyItem.inArrears === true ? 
						html `
					<horizon-option-button 
						class="button-margin" 
						label="Pay Arrears" 
						icon="status/error">
					</horizon-option-button>
					` : ``}
					<horizon-option-button 
						class="button-margin" 
						label="Update Plan" 
						icon="system/profile-action">
					</horizon-option-button>
					<horizon-option-button
						class="button-margin" 
						label="Claims" 
						icon="system/documents-action">
					</horizon-option-button>
					<horizon-option-button 
						class="button-margin" 
						label="Email Plan" 
						icon="system/profile-action">
					</horizon-option-button>
					${policyItem.inArrears !== true ? 
						html `
					<horizon-option-button 
						class="button-margin" 
						label="Benefits" 
						icon="system/sars-action">
					</horizon-option-button>
					` : ``}	
					${this._renderSubMenu(policyItem)}
				</capitec-group>
			</capitec-group>
		`;
	}

	_renderSubMenu(policyItem)
	{
		return html`
		<capitec-card class="action-card">
			<capitec-overflow-menu label="More">
				<div>
				<capitec-overflow-menu-item icon="system/delete-action" label="Cancel Plan"></capitec-overflow-menu-item>
				${policyItem.inArrears === true ?
					html `<capitec-overflow-menu-item icon="system/sars-action" label="Benefits"></capitec-overflow-menu-item>`
					: ``}
				</div>
			</capitec-overflow-menu>
			<capitec-label label="More" class="label-text">
			</capitec-label>
		</capitec-card>`
	}

	_renderNoResults() {
		return html`
			<capitec-group
				class="no-result-group"
				layout="vertical"
				halign="center"
				valign="center"
				gap="none">
					<capitec-label
						class="no-results"
						label="No results found"
						type="strong">
					</capitec-label>
			</capitec-group>
		`;
	}

	_toggleExpander() {
		this._expanded = !this._expanded;
	}

	// Not for estimate testing - reenable later
	// <capitec-button type="white" label="Update plan" @click="${() => this._goToUpdatePlan()}">
	// </capitec-button>
	// <capitec-button type="white" label="Policy Summary" @click="${() => this._goToPolicySummary()}">
	// </capitec-button>

	//#endregion
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