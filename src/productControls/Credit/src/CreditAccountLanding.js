import { Component, css, html } from 'platform/elements';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';

const CREDIT_TYPE = {
	FLEXIBLE: `Flexible`,
	FIXED: `Fixed Credit`
};

const PRODUCT_TYPE = {
	CREDIT_CARD: `Credit Card`,
	ACCESS_FACILITY: `Access facility`,
	TERM_LOAN: `Term Loan`
};

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

		this.creditAccountDetails = null;
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
	 * Registry of all properties defined by the component.
	 *
	 * @property {creditAccountDetails} creditAccountDetails Data for verified credit account landing Page display
	 *
	 */
	static get properties() {
		return {
			creditAccountDetails: { type: Object }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	_click(selection, creditType, productType) {
		this.dispatchEvent(new CustomEvent(`option-click`, { detail: { option: selection, creditType: creditType, productType: productType } }));
	}

	_accountDetails(creditType, productType) {
		this.dispatchEvent(new CustomEvent(`account-details`, { detail: { creditType: creditType, productType: productType }}));
	}

	_productEnquiry() {
		this.dispatchEvent(new CustomEvent(`product-enquiry`, { detail: {}}));
	}

	_viewInfo() {
		this.dispatchEvent(new CustomEvent(`view-info`, { detail: {}}));
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
				.fixed-accounts-box {
					height: 748px;
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

				horizon-label[value="Active"] {
					width: 132px;
					--horizon-label-value-color: #70AF00;
				}
				horizon-label[value="In arrears"] {
					width: 132px;
					--horizon-label-value-color: #a5132a;
				}
				.label-pointer {
					--theme-label-cursor: pointer;
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
				.budget-banner {
					--theme-titlebar-min-height: 48px;
				}
				.budget-banner:hover {
    				--theme-type-default-background: rgba(0,157,224,0.1);
				}
				.budget-banner > horizon-label {
					width: 158px;
					padding-left: 16px;
					--theme-titlebar-item-gap: 0px;
					--horizon-label-value-margin-top: 2px;
					--horizon-label-text-height: 12px;
					--horizon-label-text-font-size: 12px;
					--horizon-label-text-line-height: 12px;
					--horizon-label-value-font-size: 14px;;
				}
				.budget-banner > horizon-label[label="Total budget balance"] {
					margin-left: 90px;
				}
				.budget-banner > horizon-label[label="Total budget instalment (monthly)"] {
					width: auto;
				}
				.budget-banner > capitec-hyperlink {
					--theme-hyperlink-font-size: 14px;
					--theme-font-weight: 600;
				}
				.budget-banner:hover > capitec-hyperlink {
    				text-decoration: underline;
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

					<capitec-tab-group class="tabs">
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
					</capitec-tab-group>

			</capitec-card>
		`;
	}

	_renderFlexibleCreditTab() {
		// Temporary constant which shows if client has credit products.
		// TO DO: Later to be replaced with information received from CS call.
		const accountsAvailable = true;
		const showBudgetFacilityBanner = true;
		
		return accountsAvailable
		? html`
			${this._renderFlexibleAccounts(showBudgetFacilityBanner)}`
		: html`
			${this._renderCreditNotAvailable(`flexible`)}`;
	}

	_renderFixedTermCreditTab() {
		// Temporary constant which shows if client has credit products.
		// TO DO: Later to be replaced with information received from CS call.
		const accountsAvailable = true;
		
		return accountsAvailable
		? html`
			${this._renderFixedTermAccounts()}`
		: html`
			${this._renderCreditNotAvailable(`fixed term`)}`;
	}

	_renderFlexibleAccounts(showBudgetFacilityBanner) {

		// TO DO: Expanders to be rendered dynamicaly once CS data is available
		return html`
			<capitec-content-box class="accounts-box">
				<horizon-expander
					class="${showBudgetFacilityBanner ? `expander-budget-facility` : ``}"
					expandButtonAlignment="right"
					.expanded="${true}">
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
									@click="${() => this._accountDetails(CREDIT_TYPE.FLEXIBLE, PRODUCT_TYPE.CREDIT_CARD)}">
								</capitec-icon>
								<horizon-label
									class="label-pointer"
									data-automation-id="credit-account-number"
									label="Credit card"
									value="1234567890"
									@click="${() => this._accountDetails(CREDIT_TYPE.FLEXIBLE, PRODUCT_TYPE.CREDIT_CARD)}">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									data-automation-id="credit-account-balance"
									label="Balance"
									value="-R10 634.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-available-balance"
									label="Available balance"
									value="R20 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-credit-limit"
									label="Credit limit"
									value="R35 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-next-instalment"
									label="Next instalment"
									value="R1 564.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-status"
									label="Status"
									value="Active">
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
										type="default"
										label="Budget facilities"
										class="budget-banner"
										?hidden="${!showBudgetFacilityBanner}">
											<horizon-label 
												label="Total budget balance"
												value="R35 000.00">
											</horizon-label>
											<horizon-label
												label="Total budget instalment (monthly)"
												value="R1 564.76">
											</horizon-label>

											<capitec-spacer></capitec-spacer>
											
											<capitec-hyperlink 
												label="View details" 
												@click="${() => this._click(`budget-facility`, CREDIT_TYPE.FLEXIBLE, PRODUCT_TYPE.CREDIT_CARD)}" 
												inline>
											</capitec-hyperlink>
									</capitec-title-bar>
									${this._renderOptionsGroup(CREDIT_TYPE.FLEXIBLE, PRODUCT_TYPE.CREDIT_CARD)}
							</capitec-group>
						</div>
				</horizon-expander>

				<horizon-expander
					expandButtonAlignment="right"
					.expanded="${false}">
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
									@click="${() => this._accountDetails(CREDIT_TYPE.FLEXIBLE, PRODUCT_TYPE.ACCESS_FACILITY)}">
								</capitec-icon>
								<horizon-label 
									data-automation-id="credit-account-access-facility"
									class="label-pointer"
									label="Access facility"
									value="1234567890"
									@click="${() => this._accountDetails(CREDIT_TYPE.FLEXIBLE, PRODUCT_TYPE.ACCESS_FACILITY)}">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									data-automation-id="credit-account-balance"
									label="Balance"
									value="-R10 634.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-available-balance"
									label="Available balance"
									value="R20 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-credit-limit"
									label="Credit limit"
									value="R35 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-next-instalment"
									label="Next instalment"
									value="R1 564.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-status"
									label="Status"
									value="In arrears">
								</horizon-label>
						</capitec-group>

						<div slot="content">
							<capitec-group 
								class="expander-content"
								layout="vertical"
								gap="none"
								halign="left"
								valign="center">
								${this._renderOptionsGroup(CREDIT_TYPE.FLEXIBLE, PRODUCT_TYPE.ACCESS_FACILITY)}
							</capitec-group>
						</div>
				</horizon-expander>
			</capitec-content-box>
			
			${this._renderFooter()}
		`;
	}

	_renderFixedTermAccounts() {
		
		// TO DO: Expanders to be rendered dynamicaly once CS data is available
		return html`
			<capitec-content-box class="accounts-box fixed-accounts-box">
				<horizon-expander
					expandButtonAlignment="right"
					.expanded="${true}">
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
									@click="${() => this._accountDetails(CREDIT_TYPE.FIXED, PRODUCT_TYPE.TERM_LOAN)}">
								</capitec-icon>
								<horizon-label
									data-automation-id="credit-account-number"
									class="label-pointer"
									label="56 month term loan"
									value="1234567890"
									@click="${() => this._accountDetails(CREDIT_TYPE.FIXED, PRODUCT_TYPE.TERM_LOAN)}">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									data-automation-id="credit-account-loan-amount"
									label="Loan amount"
									value="R100 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-outstanding-balance"
									label="Outstanding balance"
									value="R85 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-remaining-instalment"
									label="Remaining instalment"
									value="43">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-next-instalment"
									label="Next instalment"
									value="R4 592.10">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-status"
									label="Status"
									value="Active">
								</horizon-label>
						</capitec-group>

						<div slot="content">
							<capitec-group 
								class="expander-content"
								layout="vertical"
								gap="none"
								halign="left"
								valign="center">
									${this._renderOptionsGroup(CREDIT_TYPE.FIXED, PRODUCT_TYPE.TERM_LOAN)}
							</capitec-group>
						</div>
				</horizon-expander>

				<horizon-expander
					expandButtonAlignment="right"
					.expanded="${false}">
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
									@click="${() => this._accountDetails(CREDIT_TYPE.FIXED, PRODUCT_TYPE.TERM_LOAN)}">
								</capitec-icon>
								<horizon-label
									data-automation-id="credit-account-number"
									class="label-pointer"
									label="24 month term loan"
									value="3456789098"
									@click="${() => this._accountDetails(CREDIT_TYPE.FIXED, PRODUCT_TYPE.TERM_LOAN)}">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									data-automation-id="credit-account-loan-amount"
									label="Loan amount"
									value="R35 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-outstanding-balance"
									label="Outstanding balance"
									value="R24 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-remaining-instalment"
									label="Remaining instalment"
									value="12">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-next-instalment"
									label="Next instalment"
									value="R2 592.10">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-status"
									label="Status"
									value="Active">
								</horizon-label>
						</capitec-group>

						<div slot="content">
							<capitec-group 
								class="expander-content"
								layout="vertical"
								gap="none"
								halign="left"
								valign="center">
									${this._renderOptionsGroup(CREDIT_TYPE.FIXED, PRODUCT_TYPE.TERM_LOAN)}
							</capitec-group>
						</div>
				</horizon-expander>

				<horizon-expander
					expandButtonAlignment="right"
					.expanded="${false}">
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
									@click="${() => this._accountDetails(CREDIT_TYPE.FIXED, PRODUCT_TYPE.TERM_LOAN)}">
								</capitec-icon>
								<horizon-label
									data-automation-id="credit-account-number"
									class="label-pointer"
									label="72 month term loan"
									value="1234567890"
									@click="${() => this._accountDetails(CREDIT_TYPE.FIXED, PRODUCT_TYPE.TERM_LOAN)}">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									data-automation-id="credit-account-loan-amount"
									label="Loan amount"
									value="R120 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-outstanding-balance"
									label="Outstanding balance"
									value="R73 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-remaining-instalment"
									label="Remaining instalment"
									value="65">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-next-instalment"
									label="Next instalment"
									value="R3 910.10">
								</horizon-label>
								<horizon-label
									data-automation-id="credit-account-status"
									label="Status"
									value="Active">
								</horizon-label>
						</capitec-group>

						<div slot="content">
							<capitec-group 
								class="expander-content"
								layout="vertical"
								gap="none"
								halign="left"
								valign="center">
									${this._renderOptionsGroup(CREDIT_TYPE.FIXED, PRODUCT_TYPE.TERM_LOAN)}
							</capitec-group>
						</div>
				</horizon-expander>
			</capitec-content-box>
		`;
	}

	_renderOptionsGroup(creditType, productType) {

		// TO DO: Hide/show respected option buttons dynamically
		return html`
			<capitec-title-bar
				type="default"
				label="Choose an option">
			</capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				<horizon-option-button 
						data-automation-id="credit-account-transaction-history"
						label="Transaction History"
						icon="system/time-action"
						?hidden="${false}"
						@click="${() => this._click(`transaction-history`, creditType, productType)}">
				</horizon-option-button>
				<horizon-option-button 
						data-automation-id="credit-account-statements"
						label="Statements"
						icon="system/documents-action"
						?hidden="${false}"
						@click="${() => this._click(`statements`, creditType, productType)}">
				</horizon-option-button>
				<horizon-option-button 
						data-automation-id="credit-account-settlement-quote"
						label="Settlement Quote"
						icon="system/documents-action"
						?hidden="${false}"
						@click="${() => this._click(`settlement-quote`, creditType, productType)}">
				</horizon-option-button>
				<horizon-option-button 
						data-automation-id="credit-account-paid-up-letter"
						label="Paid up Letter"
						icon="system/documents-action"
						?hidden="${true}"
						@click="${() => this._click(`paid-up-letter`, creditType, productType)}">
				</horizon-option-button>
				<horizon-option-button 
						data-automation-id="credit-account-settle-close"
						label="Settle & Close"
						icon="system/close-circle-action"
						?hidden="${false}"
						@click="${() => this._click(`settle-close`, creditType, productType)}">
				</horizon-option-button>
				<horizon-option-button
						data-automation-id="credit-account-budget-facility"
						label="Budget Facility"
						icon="system/documents-action"
						?hidden="${true}"
						@click="${() => this._click(`budget-facility`, creditType, productType)}">
				</horizon-option-button>
			</capitec-group>
		`;
	}

	_renderCreditNotAvailable(creditType) {
		const headerText = creditType === `flexible` ? `flexible credit` : `fixed term`;

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
						label="Go to the app to get all the info about ${creditType} credit or visit capitecbank.co.za"
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