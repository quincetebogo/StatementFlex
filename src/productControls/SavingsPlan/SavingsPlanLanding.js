import { Component, css, html } from 'platform/elements';

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
export class SavingsPlanLanding extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.savingsPlanDetails = null;
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
	 * @property {savingsPlanDetails} savingsPlanDetails Data for verified credit account landing Page display
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

	_click(selection) {
		this.dispatchEvent(new CustomEvent(`option-click`, { detail: { option: selection } }));
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

				horizon-label[value="Open"] {
					width: 132px;
					--horizon-label-value-color: #70AF00;
				}
				horizon-label[value="Closed"] {
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

					<capitec-tab-group class="tabs">
						<capitec-tab
							data-automation-id="savings-plan-flexible-tab"
							label="Flexible Savings">
								${this._renderFlexibleSavingsPlanTab()}
						</capitec-tab>
						<capitec-tab
							data-automation-id="savings-plan-fixed-term-tab"
							label="Fixed-term Savings">
								${this._renderFixedTermSavingsPlanTab()}
						</capitec-tab>
					</capitec-tab-group>

			</capitec-card>
		`;
	}

	_renderFlexibleSavingsPlanTab() {		
		return html`
			${this._renderFlexibleAccounts()}`;
	}

	_renderFixedTermSavingsPlanTab() {
		
		return  html`
			${this._renderFixedTermAccounts()}`;
	}

	_renderFlexibleAccounts() {

		// TO DO: Expanders to be rendered dynamicaly once CS data is available
		return html`
			<capitec-content-box class="accounts-box">
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
									data-automation-id="savings-plan-flexible-info"
									icon="system/info-action">
								</capitec-icon>
								<horizon-label
									class="label-pointer"
									data-automation-id="savings-plan-account-number"
									label="My New Car"
									value="1633823409">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									data-automation-id="savings-plan-balance"
									label="Balance"
									value="R25 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-available-balance"
									label="Available balance"
									value="R25 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-interest-rate"
									label="Interest rate"
									value="5.5%">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-status"
									label="Status"
									value="Open">
								</horizon-label>
						</capitec-group>
						<div slot="content">
							<capitec-group 
								class="expander-content" 
								layout="vertical"
								gap="none"
								halign="left"
								valign="center">
									${this._renderOptionsGroup()}
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
									data-automation-id="savings-plan-flexible-info"
									icon="system/info-action">
								</capitec-icon>
								<horizon-label 
									data-automation-id="savings-plan-access-facility"
									class="label-pointer"
									label="Holiday savings"
									value="1633823409">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									data-automation-id="savings-plan-balance"
									label="Balance"
									value="R5 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-available-balance"
									label="Available balance"
									value="R5 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-interest-rate"
									label="Interest rate"
									value="5.5%">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-status"
									label="Status"
									value="Open">
								</horizon-label>
						</capitec-group>

						<div slot="content">
							<capitec-group 
								class="expander-content"
								layout="vertical"
								gap="none"
								halign="left"
								valign="center">
									${this._renderOptionsGroup()}
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
									data-automation-id="savings-plan-fixed-term-info"
									icon="system/info-action">
								</capitec-icon>
								<horizon-label
									data-automation-id="savings-plan-number"
									class="label-pointer"
									label="House deposit"
									value="1633823409">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									data-automation-id="savings-plan-balance"
									label="Balance"
									value="R100 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-term"
									label="Term (months)"
									value="24">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-nominal-interest-rate"
									label="Nominal interest rate"
									value="5.98%">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-effective-interest-rate"
									label="Effective interest rate"
									value="6.15%">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-status"
									label="Status"
									value="Open">
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
									label="Single Deposit - Reinvest">
								</capitec-title-bar>
									${this._renderOptionsGroup()}
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
									data-automation-id="savings-plan-fixed-term-info"
									icon="system/info-action">
								</capitec-icon>
								<horizon-label
									data-automation-id="savings-plan-number"
									class="label-pointer"
									label="Tax-free Savings Plan"
									value="1984399101">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									data-automation-id="savings-plan-balance"
									label="Balance"
									value="R10 000.00">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-term"
									label="Term (months)"
									value="12">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-nominal-interest-rate"
									label="Nominal interest rate"
									value="5.77%">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-effective-interest-rate"
									label="Effective interest rate"
									value="5.93%">
								</horizon-label>
								<horizon-label
									data-automation-id="savings-plan-status"
									label="Status"
									value="Open">
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
									label="Single Deposit - Reinvest">
								</capitec-title-bar>
									${this._renderOptionsGroup()}
							</capitec-group>
						</div>
				</horizon-expander>
			</capitec-content-box>
		`;
	}

	_renderOptionsGroup() {

		// TO DO: Hide/show respected option buttons dynamically
		return html`
			<capitec-title-bar
				type="default"
				label="Choose an option">
			</capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				<horizon-option-button 
						data-automation-id="savings-plan-statements"
						label="Statements"
						icon="system/documents-action"
						?hidden="${false}"
						@click="${() => this._click(`statements`)}">
				</horizon-option-button>
				<horizon-option-button 
						data-automation-id="savings-plan-tax-certificate"
						label="Tax Certificate"
						icon="system/sars-action" 
						?hidden="${false}"
						@click="${() => this._click(`tax-certificates`)}">
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
							data-automation-id="savings-plan-savings-calculator"
							label="Savings Calculator"
							icon="system/track-action"
							@click="${() => this._click(`savings-calculator`)}">
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
}

customElements.define(`capitec-pc-savings-plan`, SavingsPlanLanding);
