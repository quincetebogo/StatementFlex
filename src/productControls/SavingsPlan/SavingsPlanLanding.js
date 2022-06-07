import { Component, css, html } from 'platform/elements';
import { ACCOUNT_TYPE_CODE } from 'app/constants/Common';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';

/**
 * Savings Plan verified landing Product Control
 * 
 * Events Raised
 * -------------
 * 
 * option-click
 * 
 * @export
 * @class SavingsPlanLanding
 * @extends {Component}
 */

const SAVE_PLAN_TYPE = {
	FLEXIBLE: `flexible-save-plan`,
	FIXED_TERM: `fixed-term-save-plan`
};

export class SavingsPlanLanding extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.savingsPlanDetails = {};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @typedef {Object} SavingsPlanDetails
 	 */

	/**
	 * Registry of all properties defined by the component.
	 *
	 *  @property {savingsPlanDetails} savingsPlanDetails Data for verified savings plan account landing Page display
	 *
	 */

	static get properties() {
		return {
			savingsPlanDetails: { type: Object }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	_click(selection, savePlanDetails, type) {
		this.dispatchEvent(new CustomEvent(`option-click`, { detail: { option: selection, planDetails: savePlanDetails, saveType: type} }));
	}

	_viewInfo() {
		this.dispatchEvent(new CustomEvent(`view-info`, { detail: {} }));
	}
	
	_accountDetails(type, accNumber) {
		this.dispatchEvent(new CustomEvent(`account-details`, { detail: { accountType: type, accountNumber: accNumber } }));
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A
	
	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	// NA
	
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.card {
					width: 100%;
					height: 888px;
				}
				/* Title Bar styles */
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

				/* Main view styles */
				capitec-tab-group {
					--theme-tab-tab-bar-background-color: linear-gradient(135deg, #002A3F 0%, #00537D 52.97%, #024D73 100%);
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
				.accounts-box {
					width: auto;
					height: 600px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 16px;
					--theme-container-padding-top: 0px;
					--theme-layout-gap-spacing: 0px;
				}
				/* Option button styles */
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
				}
				.expander-header > capitec-icon {
					--theme-icon-size-default: 20px;
					--theme-layout-gap-spacing: 0px;
					margin-left: 16px;
				}
				.expander-header > capitec-button {
					width: 128px;
				}

				horizon-label {
					width: 154px;
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

				horizon-label[value="Open"],[value="OPEN"] {
					width: 132px;
					--horizon-label-value-color: #70AF00;
				}
				horizon-label[value="Closed"],[value="CLOSED"] {
					width: 132px;
					--horizon-label-value-color: #a5132a;
				}
				.label-pointer {
					--theme-label-cursor: pointer;
				}
				.label-account-number {
					--theme-label-cursor: pointer;
					--horizon-label-value-color: #009DE0;
				}
				.flexible-label {
					width: 25%;
					--horizon-label-max-overflow-width: 180px;
				}
				.fixed-label {
					width: 20%;
					--horizon-label-max-overflow-width: 171px;
				}
				.vertical-line {
					height: 40px;
					width: 1px;
					background-color: #E1E1E1;
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
				.fixed-term-exp {
					--theme-expander-header-height: 96px;
				}

				/* No results available styles */
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.not-available {
					height: auto;
					width: auto;
					margin-top: 148px;
				}
				.info-button {
					height: 48px;
					width: 116px;
					margin-top: 28px;
					--theme-button-primary-border-width: 0px;
					--theme-button-line-height: 20px;
				}
				.account-deposit-type {
					
					--theme-label-title-font-size: 12px;
					--theme-label-title-font-weight: 400;
				}

				/* Account Details Bar Styles */
				.account-details-bar {
					display: flex;
					position: relative;
				}
				.account-details-bar > capitec-expander {
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
				.account-details-bar > capitec-group {
					width: 984px;
					z-index: 10;
					padding-top: 12px;
					padding-bottom: 12px;
					border-right: 1px solid #dfdfdf;
				}

				/* service error message */
				.error-msg {
					width: auto;
					height: 60px;
					font-family: "Hind Vadodara";
					color: #3A3A3A;
					font-size: 16px;
					font-weight: 600;
					letter-spacing: 0;
					text-align: center;
				}
	
				horizon-service-call-error-screen {
					--horizon-service-call-error-screen-height: 100%;
				
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card 
				data-automation-id="savings-plan-landing-screen"
				class="card">
					<capitec-title-bar 
						data-automation-id="savings-plan-landing-title"
						type="save">
							<capitec-icon
								size="medium"
								icon="product/save-white">
							</capitec-icon>
							<capitec-label label="Savings Plans" type="Title"></capitec-label>
					</capitec-title-bar>

				${this._renderSavingsPlanLandingContent()}
			</capitec-card>
		`;
	}

	_renderSavingsPlanLandingContent() {
		return this.savingsPlanDetails.length > 0 
		? html`
			<capitec-tab-group class="tabs">
				<capitec-tab
					data-automation-id="savings-plan-flexible-tab"
					label="Flexible Savings">
						${this._renderFlexibleSavingsPlanTab(this.savingsPlanDetails.filter(item => item.accountType === ACCOUNT_TYPE_CODE.FLEXIBLE_SAVINGS_PLAN))}
				</capitec-tab>
				<capitec-tab
					data-automation-id="savings-plan-fixed-term-tab"
					label="Fixed-term Savings">
						${this._renderFixedTermSavingsPlanTab(this.savingsPlanDetails.filter(item => item.accountType === ACCOUNT_TYPE_CODE.FIXED_TERM_SAVINGS_PLAN))}
				</capitec-tab>
			</capitec-tab-group>`
		: html``;
	}

	_renderFlexibleSavingsPlanTab(flexibleSavingsPlanDetails) {
		return flexibleSavingsPlanDetails.length > 0 
		? html`
			<capitec-content-box class="accounts-box">
				${this._renderFlexibleAccounts(flexibleSavingsPlanDetails)}
			</capitec-content-box>
			
			${this._renderFooter()}`
		: html`
			${this._renderSavingsPlanNotAvailable(ACCOUNT_TYPE_CODE.FLEXIBLE_SAVINGS_PLAN)}
		`;
	}

	_renderFixedTermSavingsPlanTab(fixedSavingsPlanDetails) {
		return fixedSavingsPlanDetails.length > 0 
		? html`
			<capitec-content-box class="accounts-box">
				${this._renderFixedTermAccounts(fixedSavingsPlanDetails)}
			</capitec-content-box>
			
			${this._renderFooter()}`
		: html`
			${this._renderSavingsPlanNotAvailable(ACCOUNT_TYPE_CODE.FIXED_TERM_SAVINGS_PLAN)}
		`;
	}

	_renderFlexibleAccounts(flexibleSavingsPlanDetails) {

		return flexibleSavingsPlanDetails.map((item, index) => html`
				<horizon-expander
					expandButtonAlignment="right"
					.expanded="${index === 0}">
						<capitec-group 
							class="expander-header"
							slot="custom-header"
							layout="horizontal"
							gap="clear"
							halign="left"
							valign="center">
								<capitec-icon
									data-automation-id="savings-plan-flexible-info"
									icon="system/info-action"
									@click="${() => this._accountDetails(SAVE_PLAN_TYPE.FLEXIBLE, item.accountNumber)}">
								</capitec-icon>
								<horizon-label
									class="label-account-number flexible-label"
									data-automation-id="savings-plan-account-number"
									label="${item.planName}"
									textOverflow="ellipsis"
									value="${item.accountNumber}"
									@click="${() => this._accountDetails(SAVE_PLAN_TYPE.FLEXIBLE, item.accountNumber)}">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									data-automation-id="savings-plan-balance"
									label="Balance"
									value="${item.currentBalance}">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-available-balance"
									label="Available balance"
									value="${item.availableBalance}">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-interest-rate"
									label="Interest rate"
									value="${item.interestRate}%">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-status"
									label="Status"
									value="${item.accountStatus}">
								</horizon-label>
						</capitec-group>
						<div slot="content">
							<capitec-group 
								class="expander-content" 
								layout="vertical"
								gap="none"
								halign="left"
								valign="center">
									${this._renderOptionsGroup(item, SAVE_PLAN_TYPE.FLEXIBLE)}
							</capitec-group>
						</div>
				</horizon-expander>`);
	}

	_renderFixedTermAccounts(fixedSavingsPlanDetails) {

		return fixedSavingsPlanDetails.map((item, index) => html`
				<horizon-expander
					class="fixed-term-exp"
					expandButtonAlignment="right"
					.expanded="${index === 0}">
						<capitec-group
							class="expander-header"
							slot="custom-header"
							layout="horizontal"
							gap="clear"
							halign="left"
							valign="center">
								<capitec-icon
									data-automation-id="savings-plan-fixed-term-info"
									icon="system/info-action"
									@click="${() => this._accountDetails(SAVE_PLAN_TYPE.FIXED_TERM, item.accountNumber)}">
								</capitec-icon>
								<horizon-label
									data-automation-id="savings-plan-number"
									class="label-account-number fixed-label"
									label="${item.planName}"
									textOverflow="ellipsis"
									value="${item.accountNumber}"
									@click="${() => this._accountDetails(SAVE_PLAN_TYPE.FIXED_TERM, item.accountNumber)}">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									data-automation-id="savings-plan-balance"
									label="Balance"
									value="${item.currentBalance}">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-term"
									label="Term (months)"
									value="${item.term}">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-nominal-interest-rate"
									label="Nominal interest rate"
									value="${item.nominalInterestRate}%">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-effective-interest-rate"
									label="Effective interest rate"
									value="${item.effectiveInterestRate}%">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-status"
									label="Status"
									value="${item.accountStatus}">
								</horizon-label>
						</capitec-group>

						<div slot="content">
							<capitec-group 
								class="expander-content"
								layout="vertical"
								gap="none"
								halign="left"
								valign="center">
								<capitec-title-bar
									class="account-deposit-type"
									type="default"
									label="${item.depositeType}">
								</capitec-title-bar>
									${this._renderOptionsGroup(item, SAVE_PLAN_TYPE.FIXED_TERM)}
							</capitec-group>
						</div>
				</horizon-expander>`);
	}

	_renderOptionsGroup(item, saveType) {
		return html`
			<capitec-title-bar
				type="default"
				label="Choose an option">
			</capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				<horizon-option-button
						data-automation-id="savings-plan-transaction-history"
						label="Transaction History"
						icon="system/time-action"
						@click="${() => this._click(`transaction-history`, item, saveType)}">
				</horizon-option-button>
				<horizon-option-button 
						data-automation-id="savings-plan-statements"
						label="Statements"
						icon="system/documents-action"
						@click="${() => this._click(`statements`, item, saveType)}">
				</horizon-option-button>
				<horizon-option-button 
						data-automation-id="savings-plan-tax-certificate"
						label="Tax Certificate"
						icon="system/sars-action" 
						@click="${() => this._click(`tax-certificate`, item, saveType)}">
				</horizon-option-button>
			</capitec-group>
		`;
	}
	
	_renderFooter() {
		return html`
			<capitec-group class="" layout="vertical" gap="none" halign="left" valign="center">
				<capitec-title-bar
					type="default"
					label="Explore">
				</capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button
							data-automation-id="savings-plan-product-enquiry"
							label="Product enquiry"
							icon="system/info-action"
							@click="${() => this._click(`product-enquiry`)}">
					</horizon-option-button>
					<horizon-option-button
							data-automation-id="savings-plan-interest-rates"
							label="Interest Rates"
							icon="system/fees-and-interest-action"
							@click="${() => this._click(`interest-rates`)}">
					</horizon-option-button>
				</capitec-group>
			</capitec-group>
		`;
	}

	_renderSavingsPlanNotAvailable(savingsPlanType) {
		const headerText = savingsPlanType === ACCOUNT_TYPE_CODE.FLEXIBLE_SAVINGS_PLAN ? `flexible savings` : `fixed-term savings`;

		return html`
			<capitec-group
				class="not-available"
				layout="vertical"
				halign="center"
				gap="none">
					<img src="platform/illustrations/history.svg"/>
					<capitec-label
						class="no-results"
						label="No ${headerText} plan accounts currently"
						type="strong">
					</capitec-label>
					<capitec-label
						label="Get info about ${headerText} plan on the app or visit capitecbank.co.za"
						type="strong">
					</capitec-label>
					<capitec-button
						data-automation-id="credit-account-view-info"
							class="info-button"
							type="primary"
							label="View Info"
							@click="${() => this._viewInfo()}">
					</capitec-button>
			</capitec-group>`;
	}
}

customElements.define(`capitec-pc-savings-plan`, SavingsPlanLanding);