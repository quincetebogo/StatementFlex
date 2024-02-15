import { Component, css, html } from 'platform/elements';
import { RoleManager } from '../../shell/RoleManager';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';

/**
 * Savings Account View
 *
 * Events Raised
 * -------------
 * 
 * option-click
 * 
 * @export
 * @class SavingsAccount
 * @extends {Component}
 */
export class SavingsAccount extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.landingPageInfo = null;
		this.roleManager = RoleManager.getInstance();
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
	 *
	 * @property {Object} landingPageInfo Data for the Savings Account Landing Page display
	 * @property {Object} shouldDisableByRole Callback function, returns true or false to disable need button
	 * @property {Object} showTooltip Callback function, returns true or false to display tooltip
	 *
	 * @readonly
	 * @static
	 * @memberof SavingsAccount
	 */
	static get properties() {
		return {
			landingPageInfo: { type: Object },
			shouldDisableByRole: { type: Object },
			showTooltip: { type: Object },
			tooltipMessage: { type: String }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------
	
	_optionSelectedClick(selectedOption) {
		this.dispatchEvent(new CustomEvent(`option-click`, { detail: { option: selectedOption } }));
	}

	_accountSavingsEnquiry(productEnquiry) {
		this.dispatchEvent(new CustomEvent(`savings-enquiry`, { detail: { enquiry: productEnquiry } }));
	}

	_accountDetails() {
		this.dispatchEvent(new CustomEvent(`account-details`, {})); 
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// ---------------
	// PRIVATE METHODS
	// ---------------
	_validateAmount(amount) {
		if (amount === 0) {
			return `-`;
		};

		return formatCurrency(amount);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.card {
					width: 100%;
					height: auto;
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
				/* Account Details Bar Styles */
				.account-details-bar {
					display: flex;
					position: relative;
				}
				
				.account-details-bar > capitec-group {
					width: 984px;
					z-index: 10;
					padding-top: 12px;
					padding-bottom: 12px;
					border-right: 1px solid #dfdfdf;
				}
				.actionbar-header > horizon-label[label="Account Number"] {
					width: 174px;
					border-right: 1px solid #dfdfdf;
					cursor:pointer;
				}
				.actionbar-header > horizon-label[label="Interest"] {
					width: 120px;
				}
				.actionbar-header > horizon-label[label="Status"] {
					--horizon-label-value-color: #70AF00;
				}
				horizon-label {
					width: 136px;
					height: 100%;
					font-weight: 300;
					justify-content: left;
					padding: 0px 0px 0px 14px;
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
					--theme-titlebar-padding: 0px 16px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 15px;
					--theme-label-title-font-weight: 600;
					--theme-type-default-font-color: #545D60;
					--theme-label-title-font-size: 14px;
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-item-gap: 0px;

					border-top: 1px solid #E1E1E1;
					border-bottom: 1px solid #E1E1E1;
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
					width: 186px;
					margin-left: 16px;
					padding: 0px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
				}
				.button-more{
                   margin-left:223px;
				}
				.label-text {
					--horizon-option-btn-text-margin-top: 10px;
				}
				.vertical-line{
					height: 48px;
					width: 1px;
					background-color: #E1E1E1;
				}
				.actionbar-header > capitec-icon {
					--theme-icon-size-default: 20px;
					--theme-layout-gap-spacing: 0px;
					margin-left: 16px;
					cursor:pointer;
				}
				horizon-expander{
					margin-bottom: 0px;
					--theme-expander-height: auto;
					--theme-layout-gap-spacing: 0px;
					--theme-expander-header-height: 64px;
					--theme-expander-header-padding: 0 0px 0 0;
					--theme-expander-indicator-width: 16px;
				}
				horizon-expander[expanded] {
					box-shadow: 0 6px 10px 0.25px rgb(0 0 0 / 7%);
				}
				.expander-content > capitec-title-bar {
					border-top: 0px;
				}
				
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">

				<capitec-title-bar type="primary">
					<capitec-icon size="default" icon="product/transact-white">
					</capitec-icon>
					<capitec-label label="Savings Account" type="Title"></capitec-label>
				</capitec-title-bar>

				<capitec-content-box>
					<capitec-card>
						${this._renderAccountDetailsBar()}
					</capitec-card>
				</capitec-content-box>
				${this._renderFooter()}
			</capitec-card>
		`;
	}
	
	_renderAccountDetailsBar() {
		return html`
			<horizon-expander
				expandButtonAlignment="right"
				.expanded="${true}">
					
					<capitec-group class= "actionbar-header" slot="custom-header" layout="horizontal" gap="clear" halign="left" valign="center">
						<capitec-icon
							data-automation-id="savings-Account-info"
							icon="system/info-action"
							@click="${() => this._accountDetails()}">
						</capitec-icon>
						<horizon-label
							label="Account number"
							textOverflow="ellipsis"
							value="${this.landingPageInfo.accountNumber}"
							@click="${() => this._accountDetails()}">
						</horizon-label>

						<div class="vertical-line"></div>

						<horizon-label
							label="Balance"
							value="${formatCurrency(this.landingPageInfo.accountBalance)}">
						</horizon-label>
						<horizon-label
							label="Available balance"
							value="${formatCurrency(this.landingPageInfo.accountAvailableBalance)}">
						</horizon-label>
						<horizon-label
							label="Amount on Hold"
							value="${this._validateAmount(this.landingPageInfo.holds)}">
						</horizon-label>
						<horizon-label
							label="Pending amount"
							value="${this._validateAmount(this.landingPageInfo.accountPendingAmount)}">
						</horizon-label>
						<horizon-label
							label="Interest"
							value="${this.landingPageInfo.interestRatePercentage}%">
						</horizon-label>
						<horizon-label
							label="Status"
							value="${this.landingPageInfo.accountStatus}">
						</horizon-label>
					</capitec-group>
					<div slot="content">
						<capitec-group 
							class="expander-content" 
							layout="vertical"
							gap="none"
							halign="left"
							valign="center">
								${this._renderOptions()}
						</capitec-group>
					</div>
			</horizon-expander>
		`;
	}

	_renderOptions() {
		const pendingMandates = this.landingPageInfo?.pendingMandateCount ?? ``;
		return html`
				<capitec-title-bar type="default" label="Choose an option"></capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button 
						class="button-margin" 
						label="Transaction History" 
						icon="system/time-action"
						.tooltipMessage="${this.tooltipMessage}"
						?showTooltip="${this.showTooltip(`transaction-history`)}"
						@click="${() => this._optionSelectedClick(`transaction-history`)}"
						?disabled="${this.shouldDisableByRole(`transaction-history`)}">
					</horizon-option-button>
					<horizon-option-button
					    badgeText="${pendingMandates}"
						class="button-margin" 
						label="DebiCheck" 
						icon="system/debi-check-action"
						.tooltipMessage="${this.tooltipMessage}"
						?showTooltip="${this.showTooltip(`debi-check`)}"
						@click="${() => this._optionSelectedClick(`debi-check-viewInfo`)}"
						?disabled="${this.shouldDisableByRole(`debi-check`)}">
					</horizon-option-button>
					<horizon-option-button 
						class="button-margin" 
						label="Statements" 
						icon="system/documents-action"
						.tooltipMessage="${this.tooltipMessage}"
						?showTooltip="${this.showTooltip(`statements`)}"
						@click="${() => this._optionSelectedClick(`statements-transact`)}"
						?disabled="${this.shouldDisableByRole(`statements`)}">
					</horizon-option-button>
					<horizon-option-button 
						class="button-margin button-more"
						label="More" 
						icon="system/more-action"
						style="visibility: hidden"
						@click="${() => this._optionSelectedClick(`more`)}">
					</horizon-option-button>
				</capitec-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group class= "" layout="vertical" gap="none" halign="left" valign="center">

				<capitec-title-bar
					type="default"
					label="Explore Saving Account"
					class="other-options">
				</capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button 
							class="button-margin"
							label="Product enquiry"
							icon="system/info-action"
							@click="${() => this._accountSavingsEnquiry(`product-enquiry`)}">
					</horizon-option-button>
				</capitec-group>
			</capitec-group>
		`;
	}
}

customElements.define(`horizon-savings-account`, SavingsAccount);