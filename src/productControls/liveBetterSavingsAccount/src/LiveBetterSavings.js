import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatStringAsPascalCase } from 'app/utils/channelServiceUtilities';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';

/**
 * Live Better Savings Account Product Control
 * 
 * Events Raised
 * -------------
 * 
 * option-click
 * account-details
 * round-up
 * interest-sweep
 * 
 * @export
 * @class LiveBetterSavings
 * @extends {Component}
 */
export class LiveBetterSavings extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.liveBetterAccountData = null;
		this._expanded = true;
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
	 * @typedef {Object} LiveBetterAccountData
	 * @property {String} accountNumber - The Live Better Savings Account Number
	 * @property {Number} accountAvailableBalance - The Available Live Better Account Balance
	 * @property {Number} roundupValue
	 * @property {String} interestSweep
	 * @property {String} interestRatePercentage
	 * @property {String} accountStatus
 	 */

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {LiveBetterAccountData} liveBetterAccountData Data for the Live Better verified landing Page display
	 *
	 */
	static get properties() {
		return {
			liveBetterAccountData: { type: Object },

			// Private Properties
			_expanded: { state: true }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	_click(selection) {
		this.dispatchEvent(new CustomEvent(`option-click`, { detail: { option: selection } }));
	}

	_toggleExpander() {
		this._expanded = !this._expanded;
	}

	_toggleRoundUp(event) {
		this.dispatchEvent(new CustomEvent(`round-up`, {
			detail: {
				roundUpStatus: event.detail.new
			}
		}));
	}

	_toggleInterestSweep(event) {
		this.dispatchEvent(new CustomEvent(`interest-sweep`, {
			detail: {
				interestSweepStatus: event.detail.new
			}
		}));
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
					--theme-type-primary-background: url(../images/liveBetter/LBB_bg-1092x64.png);
				}
				capitec-title-bar > capitec-label {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
				}

				/* Main view styles */
				capitec-content-box {
					width: auto;
					height: 678px;
					
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 19px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}
				capitec-content-box > capitec-card {
					border: 0px;
					--theme-card-min-height: 64px;
				}

				/* Account Details Bar Styles */
				.account-details-bar {
					display: flex;
					position: relative;
				}
				.account-details-bar > capitec-expander {
					position: absolute;
					border-radius:4px;
					border: 1px solid #E1E1E1;
					--theme-expander-width: 1032px;
					--theme-expander-border: 0px;
					--theme-expander-header-padding: 0px 36px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-expander-header-height: 64px;
					--theme-expander-height: 211px;
					--theme-expander-indicator-width: 0px;
					--theme-expander-indicator-height: 0px;
					--theme-system-hover-color: #FFFFFF;
					box-shadow:0 3px 6px 0.25px rgba(0,0,0,0.08);
				}
				.transform-icon {
					transform: rotate(180deg);
				}
				.account-details-bar > capitec-group {
					width: auto;
					height: 64px;
					z-index: 10;
					padding: 0px 16px;
				}
				.actionbar-header > capitec-icon {
					--theme-icon-size-medium: 24px;
					cursor: pointer;
				}
				.actionbar-header > horizon-label {
					width: 158px;
					height: 100%;
					font-weight: 300;
					justify-content: left;
					padding: 12px 0px 12px 16px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-value-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color:#3A3A3A;
				}
				.actionbar-header > horizon-label[label="Account number"] {
					width: 150px;
					--horizon-label-value-color: #009DE0;
					--theme-label-cursor: pointer;
				}
				.actionbar-header > horizon-label[label="Status"] {
					width: 142px;
					--horizon-label-value-color: #70AF00;
				}
				.vertical-line{
					height: 48px;
					width: 1px;
					background-color: #E1E1E1;
				}
				.toggle-group {
					width: 158px;
					padding: 12px 0px 12px 16px;
				}
				.toggle-group > capitec-toggle {
					--theme-label-font-color: #3A3A3A;
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 600;
					--theme-toggle-label-spacing: 6px;
					--theme-toggle-track-inset: 1px;
				}
				.toggle-group > capitec-label {
					--theme-label-default-font-size: 14px;
					--theme-label-font-family: Hind Vadodara;
					--theme-label-font-color: #3A3A3A;
				}
				capitec-group > capitec-title-bar {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 15px;
					--theme-label-title-font-weight: 600;
					--theme-type-default-font-color: #3A3A3A;
					--theme-label-title-font-size: 14px;
					--theme-titlebar-shadow: 0px;

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
				.icon-chevron {
					height: 48px;
					width: 48px;
					margin-top: 4px;
					border-radius: 4px;
					cursor: pointer;
				}
				.icon-chevron:hover {
					background-color: rgba(0,157,224,0.1);
				}
				.icon-chevron > capitec-icon {
					--theme-icon-size-default: 8px;
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
				data-automation-id="live-better-verified-page"
				class="card">
					<capitec-title-bar 
						data-automation-id="live-better-verified-title"
						type="primary">
							<img src='/images/liveBetter/liveBetter-white.svg'/>
							<capitec-label label="Live Better Savings Account" type="Title"></capitec-label>
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
		return this.liveBetterAccountData 
		? html`
			<div class="account-details-bar">
				<capitec-expander 
					data-automation-id="live-better-verified-expander"
					label="" 
					?expanded="${this._expanded}">
						${this._renderOptions()}
				</capitec-expander>

				<capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">
					<capitec-icon 
						data-automation-id="live-better-verified-account-info"
						size="medium" 
						icon="system/info-action"
						@click="${() => this._click(`lbb-account-enquiry`)}">
					</capitec-icon>

					<horizon-label
						data-automation-id="live-better-verified-account-number"
						label="Account number"
						@click="${() => this._click(`lbb-account-enquiry`)}"
						value="${this.liveBetterAccountData.accountNumber}">
					</horizon-label>

					<div class="vertical-line"></div>

					<horizon-label
						data-automation-id="live-better-verified-available-balance"
						label="Available balance"
						value="${formatCurrency(this.liveBetterAccountData.accountAvailableBalance)}">
					</horizon-label>

					<capitec-group 
						data-automation-id="live-better-verified-round-up"
						class="toggle-group" 
						layout="vertical" 
						gap="none" 
						halign="left" 
						valign="center">
							<capitec-label label="Round-up"></capitec-label>
							<capitec-toggle 
								label="${this.liveBetterAccountData.roundupValue ? formatCurrency(this.liveBetterAccountData.roundupValue) : ``}" 
								@value-change="${(event) => this._toggleRoundUp(event)}"
								?checked="${this.liveBetterAccountData.accountRoundUpActive}">
							</capitec-toggle>
					</capitec-group>

					<capitec-group 
						data-automation-id="live-better-verified-interest-sweep"
						class="toggle-group" 
						layout="vertical" 
						gap="none" 
						halign="left" 
						valign="center">
							<capitec-label label="Interest Sweep"></capitec-label>
							<capitec-toggle 
								label="${this.liveBetterAccountData.accountInterestSweepActive ? `On` : `Off`}" 
								@value-change="${(event) => this._toggleInterestSweep(event)}"
								?checked="${this.liveBetterAccountData.accountInterestSweepActive}">
							</capitec-toggle>
					</capitec-group>

					<horizon-label
						data-automation-id="live-better-verified-interest-rate"
						label="Interest rate"
						value="${this.liveBetterAccountData.interestRatePercentage}%">
					</horizon-label>

					<horizon-label
						data-automation-id="live-better-verified-status"
						label="Status"
						value="${formatStringAsPascalCase(this.liveBetterAccountData.accountStatus)}">
					</horizon-label>
					
					<capitec-group class="icon-chevron" @click="${() => this._toggleExpander()}" layout="vertical" gap="none" halign="center" valign="center">
						<capitec-icon class="${this._expanded ? `transform-icon` : ``}" icon="system/chevron-down-action"></capitec-icon>
					</capitec-group>
				</capitec-group>
			</div>`
		: html``;
	}

	_renderOptions() {
		return html`
			<capitec-group layout="vertical" gap="none" halign="left" valign="center">

				<capitec-title-bar type="default" label="Choose an option"></capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button 
						data-automation-id="live-better-verified-transaction-history"
						class="button-margin" 
						label="Transaction History" 
						icon="system/time-action"
						@click="${() => this._click(`transaction-history-lbb`)}">
					</horizon-option-button>
					<horizon-option-button 
						data-automation-id="live-better-verified-statements"
						class="button-margin" 
						label="Statements" 
						icon="system/documents-action"
						@click="${() => this._click(`statements-lbb`)}">
					</horizon-option-button>
					<horizon-option-button 
						data-automation-id="live-better-verified-automatic-savings"
						class="button-margin"
						label="Automatic Savings" 
						img-src="/images/liveBetter/automatic-savings.svg"
						@click="${() => this._click(`automatic-savings-lbb`)}">
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
					label="Explore Live Better"
					class="other-options">
				</capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button 
							data-automation-id="live-better-verified-product-enquiry"
							class="button-margin"
							label="Product enquiry"
							icon="system/info-action"
							@click="${() => this._click(`product-enquiry`)}">
					</horizon-option-button>
					<horizon-option-button 
							data-automation-id="live-better-verified-partner-benefits"
							class="button-margin"
							label="Partner Benefits"
							icon="system/client-insights-action"
							@click="${() => this._click(`partner-benefits`)}">
					</horizon-option-button>
				</capitec-group>
			</capitec-group>
		`;
	}
}

customElements.define(`capitec-pc-live-better-savings`, LiveBetterSavings);

/**
 * When an option tile is clicked
 *
 * @example
 * <capitec-pc-live-better-savings ... @option-click="${this._handler}"></capitec-pc-live-better-savings>
 *
 * @event LiveBetterSavings#click
 * @type {Object}
 * @property {Object} detail - Contains information on the clicked item
 * @property {String} detail.option - The selected option
 */

/**
 * When an Account number & info icon is clicked 
 *
 * @example
 * <capitec-pc-live-better-savings ... @account-details="${this._handler}"></capitec-pc-live-better-savings>
 *
 * @event LiveBetterSavings#account-details
 * @type {Object} - N/A
 */

/**
 * When Round-Up is toggled
 *
 * @example
 * <capitec-pc-live-better-savings ... @round-up="${this._handler}"></capitec-pc-live-better-savings>
 *
 * @event LiveBetterSavings#round-up
 * @type {Object} - N/A
 */

/**
 * When an Interest sweep is toggled
 *
 * @example
 * <capitec-pc-live-better-savings ... @interest-sweep="${this._handler}"></capitec-pc-live-better-savings>
 *
 * @event LiveBetterSavings#interest-sweep
 * @type {Object} - N/A
 */