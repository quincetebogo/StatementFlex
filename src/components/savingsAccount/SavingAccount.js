import { Component, css, html } from 'platform/elements';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';

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
	 *
	 * @readonly
	 * @static
	 * @memberof SavingsAccount
	 */
	static get properties() {
		return {
			landingPageInfo: { type: Object }
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

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	_formatCollectionAmount(amount) {
		const currencyString = amount >= 0 ? `R${amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}` : `- R${amount.toString().substring(1,).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}`;
		return currencyString.includes(`.`) ? currencyString : `${currencyString}.00`;

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
					--theme-type-primary-background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
				}
				capitec-title-bar > capitec-label {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
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
				.account-details-bar > capitec-expander {
					position: absolute;
					border-bottom: 1px solid #E1E1E1;
					border-radius:4px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-expander-header-height: 64px;
					--theme-expander-height: 210px;
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
				.actionbar-header > horizon-label[label="Account Number"] {
					width: 174px;
					border-right: 1px solid #dfdfdf;
				}
				.actionbar-header > horizon-label[label="Interest"] {
					width: 120px;
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
					--theme-label-title-font-size: 14px;

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
			<div class="account-details-bar">
				<capitec-expander label="" ?expanded="${true}">
					${this._renderOptions()}
				</capitec-expander>
				<capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">
					<horizon-label
						label="Account Number"
						value="${this.landingPageInfo.accountNumber}">
					</horizon-label>
					<horizon-label
						label="Balance"
						value="${this._formatCollectionAmount(this.landingPageInfo.accountBalance)}">
					</horizon-label>
					<horizon-label
						label="Available Balance"
						value="${this._formatCollectionAmount(this.landingPageInfo.accountAvailableBalance)}">
					</horizon-label>
					<horizon-label
						label="Pending amount"
						value="${this._formatCollectionAmount(this.landingPageInfo.accountPendingAmount)}">
					</horizon-label>
					<horizon-label
						label="Interest"
						value="${this.landingPageInfo.interestRatePercentage}">
					</horizon-label>
					<horizon-label
						label="Status"
						value="${this.landingPageInfo.accountStatus}">
					</horizon-label>
				</capitec-group>
			</div>
		`;
	}

	_renderOptions() {
		return html`
			<capitec-group class= "" layout="vertical" gap="none" halign="left" valign="center">

				<capitec-title-bar type="default" label="Choose an option"></capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button 
						class="button-margin" 
						label="Transaction History" 
						icon="system/time-action"
						@click="${() => this._optionSelectedClick(`transaction-history`)}">
					</horizon-option-button>
					<horizon-option-button 
						class="button-margin" 
						label="DebiCheck" 
						icon="system/debit-order-action"
						@click="${() => this._optionSelectedClick(`debi-check`)}">
					</horizon-option-button>
					<horizon-option-button 
						class="button-margin" 
						label="Statements" 
						icon="system/documents-action"
						@click="${() => this._optionSelectedClick(`statements`)}">
					</horizon-option-button>
					<horizon-option-button 
						class="button-margin button-more"
						label="More" 
						icon="system/more-action"
						@click="${() => this._optionSelectedClick(`more`)}">
					</horizon-option-button>
				</capitec-group>
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
					<horizon-option-button 
						class="button-margin"
						label="Add a Savings Plan"
						icon="system/add-action">
					</horizon-option-button>
				</capitec-group>
			</capitec-group>
		`;
	}
}

customElements.define(`horizon-savings-account`, SavingsAccount);