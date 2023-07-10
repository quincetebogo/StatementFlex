import { CREDIT_TYPE, PRODUCTS } from 'app/constants/Credit';
import { Component, css, html } from 'platform/elements';
import { ALERTBANNER_CSS } from 'app/css/VerificationStatusAlertBanner';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';
import 'app/views/product/CreditProduct';

/**
 * Credit Account verified landing Product Control
 * 
 * Events Raised
 * -------------
 * 
 * option-click
 * 
 * @export
 * @class CreditAccountLanding
 * @extends {Component}
 */
export class CreditAccountLanding extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.flexibleCreditAccounts = [];
		this.fixedTermCreditAccounts = [];
		this.budgetAccountsSummary = {};
		this.selectedTab = CREDIT_TYPE.FLEXIBLE;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @typedef {Object} renderAlertBanner Display alter banner based on verification status
	*/

	/**
	 * @callback renderAlterBannerCallback
	 * @returns {html}
	*/

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {flexibleCreditAccounts} flexibleCreditAccounts 
	 * @property {fixedTermCreditAccounts} fixedTermCreditAccounts 
	 * @property {budgetAccountsSummary} budgetAccountsSummary
	 * @property {renderAlterBannerCallback} renderAlertBanner Callback function to render alter banner based on verification status & method
	 *
	 */
	 static get properties() {
		return {
			flexibleCreditAccounts: { type: Array },
			fixedTermCreditAccounts: { type: Array },
			budgetAccountsSummary: { type: Object },
			shouldDisable: { type: Object },
			renderAlertBanner: { type: Object, attribute: false },
			selectedTab: { type: String }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	_click(selection, creditType, productType, selectedAccountDetails) {
		this.dispatchEvent(new CustomEvent(`option-click`, { 
			detail: { option: selection, 
						creditType: creditType, 
						productType: productType,
						selectedAccountDetails: selectedAccountDetails }
				}));
	}

	_accountDetails(creditType, productType, accountNumber) {
		this.dispatchEvent(new CustomEvent(`account-details`, { detail: { creditType: creditType, productType: productType, accountNumber: accountNumber } }));
	}

	_productEnquiry() {
		this.dispatchEvent(new CustomEvent(`product-enquiry`, { detail: {} }));
	}

	_viewInfo() {
		this.dispatchEvent(new CustomEvent(`view-info`, { detail: {} }));
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	// N/A
	
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
					--theme-card-border: 0px;
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
					--theme-tab-tab-bar-background-color: linear-gradient(90deg, #B62825 0%, #E61414 100%);
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

				/* Alert banner styles */
				${ALERTBANNER_CSS}
				.verificatoin-status {
					width: 1030px;
					margin: 0px;
					margin-bottom: 16px;
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
				.expander-budget-facility {
					--theme-expander-header-height: 112px;
				}
				.expander-header > capitec-icon {
					--theme-icon-size-default: 20px;
					--theme-layout-gap-spacing: 0px;
					margin-left: 16px;
				}
				horizon-label {
					width: 158px;
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
				horizon-label[label="Status"] {
					width: 132px;
				}
				horizon-label[value="Active"] {
					--horizon-label-value-color: #70AF00;
				}
				horizon-label[value="In arrears"] {
					--horizon-label-value-color: #a5132a;
				}
				horizon-label[value="Marked Closure"] {
					--horizon-label-value-color: #d4781c;
				}
				.label-account-number {
					--theme-label-cursor: pointer;
					--horizon-label-value-color: #009DE0;
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

				/* No results available styles */
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
					line-height: 32px;
					margin-bottom: 6px;
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
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card 
				data-automation-id="credit-account-landing-screen"
				class="card">
					<capitec-title-bar 
						data-automation-id="credit-account-landing-title"
						type="credit">
							<capitec-icon
								size="medium"
								icon="product/credit-white">
							</capitec-icon>
							<capitec-label label="Credit" type="Title"></capitec-label>
					</capitec-title-bar>
					${this._renderContent()}
			</capitec-card>`;
	}

	_renderContent() {
		return this.flexibleCreditAccounts.length > 0 || this.fixedTermCreditAccounts.length > 0
		? html`
			<capitec-tab-group class="tabs" selectedIndex="${this.selectedTab === CREDIT_TYPE.FIXED ? 1 : 0}">
				<capitec-tab
					data-automation-id="credit-account-flexible-credit-tab"
					label="Flexible Credit">
						${this._renderFlexibleCreditTab()}
				</capitec-tab>
				<capitec-tab
					data-automation-id="credit-account-fixed-term-tab"
					label="Fixed Term Credit">
						${this._renderFixedTermCreditTab()}
				</capitec-tab>
			</capitec-tab-group>`
		: html``;
	}

	_renderFlexibleCreditTab() {
		return this.flexibleCreditAccounts.length > 0
		? html`
			<capitec-content-box class="accounts-box">
				${this.renderAlertBanner()}
				${this._renderFlexibleAccounts()}
			</capitec-content-box>
			
			${this._renderFooter()}`
		: html`
			${this._renderCreditNotAvailable(`flexible`)}`;
	}

	_renderFixedTermCreditTab() {
		return this.fixedTermCreditAccounts.length > 0
		? html`
			<capitec-content-box class="accounts-box">
				${this.renderAlertBanner()}
				${this._renderFixedTermAccounts()}
			</capitec-content-box>
			
			${this._renderFooter()}`
		: html`
			${this._renderCreditNotAvailable(`fixed-term`)}`;
	}

	_renderFlexibleAccounts() {
		return this.flexibleCreditAccounts.map((item, index) => html`
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
								data-automation-id="credit-account-flexible-credit-info"
								icon="system/info-action"
								@click="${() => this._accountDetails(item.category, item.type, item.accountNumber)}">
							</capitec-icon>
							<horizon-label 
								data-automation-id="credit-account-access-facility"
								class="label-account-number"
								label="${item.productTypeDescription}"
								value="${item.accountNumber}"
								@click="${() => this._accountDetails(item.category, item.type, item.accountNumber)}">
							</horizon-label>
							<div class="vertical-line"></div>
							<horizon-label
								data-automation-id="credit-account-balance"
								label="Balance"
								value="${item.currentBalance}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-available-balance"
								label="Available balance"
								value="${item.availableCredit}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-credit-limit"
								label="Credit limit"
								value="${item.creditLimit}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-next-instalment"
								label="Next instalment"
								value="${item.nextRepayment}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-status"
								label="Status"
								value="${item.accountStatusDescription}">
							</horizon-label>
					</capitec-group>

					<div slot="content">
						<capitec-group 
							class="expander-content"
							layout="vertical"
							gap="none"
							halign="left"
							valign="center">
								${this._renderOptionsGroup(item.category, item.type, item)}
						</capitec-group>
					</div>
			</horizon-expander>`);
	}

	_renderFixedTermAccounts() {
		return this.fixedTermCreditAccounts.map((item, index) => html`
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
								data-automation-id="credit-account-fixed-term-info"
								icon="system/info-action"
								@click="${() => this._accountDetails(item.category, item.type, item.accountNumber)}">
							</capitec-icon>
							<horizon-label
								data-automation-id="credit-account-number"
								class="label-account-number"
								label="${item.productTypeDescription}"
								value="${item.accountNumber}"
								@click="${() => this._accountDetails(item.category, item.type, item.accountNumber)}">
							</horizon-label>
							<div class="vertical-line"></div>
							<horizon-label
								data-automation-id="credit-account-loan-amount"
								label="Loan amount"
								value="${item.creditLimit}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-outstanding-balance"
								label="Outstanding balance"
								value="${item.currentBalance}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-remaining-instalment"
								label="Remaining instalment"
								value="${item.remainingMonths}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-next-instalment"
								label="Next instalment"
								value="${item.repayAmount}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-status"
								label="Status"
								value="${item.accountStatusDescription}">
							</horizon-label>
					</capitec-group>

					<div slot="content">
						<capitec-group 
							class="expander-content"
							layout="vertical"
							gap="none"
							halign="left"
							valign="center">
								${this._renderOptionsGroup(item.category, item.type, item)}
						</capitec-group>
					</div>
			</horizon-expander>`);
	}

	_renderOptionsGroup(creditType, productType, selectedAccountDetails) {
		return html`
			<capitec-title-bar
				type="default"
				label="Choose an option">
			</capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				${this._renderProductSpecificOptions(productType, selectedAccountDetails)}
			</capitec-group>
		`;
	}

	_renderProductSpecificOptions(productType, selectedAccountDetails) {
		switch (productType) {
			case PRODUCTS.CREDIT_CARD:
				return this._renderCreditCardOptions(selectedAccountDetails);
			case PRODUCTS.ACCESS_FACILITY:
				return this._renderAccessFacilityOptions(selectedAccountDetails);
			case PRODUCTS.TERM_LOAN:
				return this._renderTermLoanOptions(selectedAccountDetails);
			default:
				return html``;
		}
	}

	_renderCreditCardOptions(selectedAccountDetails) {
		const showBudgetFacilityOption = this.budgetAccountsSummary.totalBudgetBalance && this.budgetAccountsSummary.totalBudgetBalance !== `R0.00` &&
											this.budgetAccountsSummary.totalBudgetInstallmentAmount && this.budgetAccountsSummary.totalBudgetInstallmentAmount !== `R0.00`;
			
		return html`
			<horizon-option-button 
					data-automation-id="credit-account-transaction-history"
					label="Transaction History"
					icon="system/time-action"
					@click="${() => this._click(`transaction-history`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.CREDIT_CARD, selectedAccountDetails)}">
			</horizon-option-button>
			<horizon-option-button 
					data-automation-id="credit-account-statements"
					label="Statements"
					icon="system/documents-action"
					@click="${() => this._click(`statements`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.CREDIT_CARD, selectedAccountDetails)}">
			</horizon-option-button>
			<horizon-option-button 
					data-automation-id="credit-account-settlement-quote"
					label="Settlement Quote"
					icon="system/documents-action"
					@click="${() => this._click(`settlement-quote`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.CREDIT_CARD, selectedAccountDetails)}">
			</horizon-option-button>
			<horizon-option-button 
					data-automation-id="credit-account-paid-up-letter"
					label="Paid up Letter"
					icon="system/documents-action"
					?hidden="${true}"
					@click="${() => this._click(`paid-up-letter`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.CREDIT_CARD, selectedAccountDetails)}">
			</horizon-option-button>
			<horizon-option-button 
					data-automation-id="credit-account-settle-close"
					label="Settle & Close"
					icon="system/close-circle-action"
					@click="${() => this._click(`settle-close`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.CREDIT_CARD, selectedAccountDetails)}"
					?disabled="${this.shouldDisable(`settle-close`)}">
			</horizon-option-button>
			<horizon-option-button
					data-automation-id="credit-account-budget-facility"
					label="Budget Facility"
					img-src="/images/credit/calculator.svg"
					?hidden=${!showBudgetFacilityOption}
					@click="${() => this._click(`view-budgets`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.CREDIT_CARD, selectedAccountDetails)}">
			</horizon-option-button>
		`;
	}

	_renderAccessFacilityOptions(selectedAccountDetails) {
		return html`
			<horizon-option-button 
					data-automation-id="credit-account-transaction-history"
					label="Transaction History"
					icon="system/time-action"
					?hidden="${true}"
					@click="${() => this._click(`transaction-history`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.ACCESS_FACILITY, selectedAccountDetails)}">
			</horizon-option-button>
			<horizon-option-button 
					data-automation-id="credit-account-statements"
					label="Statements"
					icon="system/documents-action"
					@click="${() => this._click(`statements`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.ACCESS_FACILITY, selectedAccountDetails)}">
			</horizon-option-button>
			<horizon-option-button 
					data-automation-id="credit-account-settlement-quote"
					label="Settlement Quote"
					icon="system/documents-action"
					@click="${() => this._click(`settlement-quote`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.ACCESS_FACILITY, selectedAccountDetails)}">
			</horizon-option-button>
			<horizon-option-button 
					data-automation-id="credit-account-paid-up-letter"
					label="Paid up Letter"
					icon="system/documents-action"
					?hidden="${true}"
					@click="${() => this._click(`paid-up-letter`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.ACCESS_FACILITY, selectedAccountDetails)}">
			</horizon-option-button>
		`;
	}

	_renderTermLoanOptions(selectedAccountDetails) {
		return html`
			<horizon-option-button 
					data-automation-id="credit-account-transaction-history"
					label="Transaction History"
					icon="system/time-action"
					?hidden="${true}"
					@click="${() => this._click(`transaction-history`, CREDIT_TYPE.FIXED, PRODUCTS.TERM_LOAN, selectedAccountDetails)}">
			</horizon-option-button>
			<horizon-option-button 
					data-automation-id="credit-account-statements"
					label="Statements"
					icon="system/documents-action"
					@click="${() => this._click(`statements`, CREDIT_TYPE.FIXED, PRODUCTS.TERM_LOAN, selectedAccountDetails)}">
			</horizon-option-button>
			<horizon-option-button 
					data-automation-id="credit-account-settlement-quote"
					label="Settlement Quote"
					icon="system/documents-action"
					@click="${() => this._click(`settlement-quote`, CREDIT_TYPE.FIXED, PRODUCTS.TERM_LOAN, selectedAccountDetails)}">
			</horizon-option-button>
			<horizon-option-button 
					data-automation-id="credit-account-paid-up-letter"
					label="Paid up Letter"
					icon="system/documents-action"
					?hidden="${true}"
					@click="${() => this._click(`paid-up-letter`, CREDIT_TYPE.FIXED, PRODUCTS.TERM_LOAN, selectedAccountDetails)}">
			</horizon-option-button>
			<horizon-option-button 
					data-automation-id="credit-account-settle-loan"
					label="Settle Loan"
					icon="system/close-circle-action"
					@click="${() => this._click(`settle-close`, CREDIT_TYPE.FIXED, PRODUCTS.TERM_LOAN, selectedAccountDetails)}"
					?disabled="${this.shouldDisable(`settle-close`)}">
			</horizon-option-button>
		`;
	}

	_renderCreditNotAvailable(creditType) {
		const headerText = creditType === `flexible` ? `flexible credit` : `fixed-term`;

		return html`
			<capitec-group
				class="not-available"
				layout="vertical"
				halign="center"
				gap="none">
					<img src="platform/illustrations/history.svg"/>
					<capitec-label
						class="no-results"
						label="No ${headerText} accounts currently"
						type="strong">
					</capitec-label>
					<capitec-label
						label="Get info about ${creditType} credit on the app or visit capitecbank.co.za"
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

	_renderFooter() {
		return html`
			<capitec-group class="" layout="vertical" gap="none" halign="left" valign="center">
				<capitec-title-bar
					type="default"
					label="Explore">
				</capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button
							data-automation-id="credit-account-product-enquiry"
							label="Product enquiry"
							icon="system/info-action"
							@click="${() => this._productEnquiry()}">
					</horizon-option-button>
				</capitec-group>
			</capitec-group>
		`;
	}
}

customElements.define(`capitec-pc-credit-account`, CreditAccountLanding);

/**
 * When an option tile is clicked
 *
 * @example
 * <capitec-pc-credit-account ... @option-click="${this._handler}"></capitec-pc-credit-account>
 *
 * @event CreditAccountLanding#click
 * @type {Object}
 * @property {Object} detail - Contains information on the clicked item
 * @property {String} detail.option - The selected option
 */