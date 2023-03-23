import { Component, css, html } from 'platform/elements';
import { ALERTBANNER_CSS } from 'app/css/VerificationStatusAlertBanner';
import 'app/components/common/HorizonLabel';

/**
 * Budget Account details screen for Credit product
 *
 * Events Raised
 * -------------
 *
 * back
 *
 * @export
 * @class BudgetAccountDetails
 * @extends {Component}
 */

 export class BudgetAccountDetails extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.accountDetails = {};
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
	 * @typedef {Object} renderAlertBanner Display alter banner based on verification status
	*/

	/**
	 * @callback renderAlterBannerCallback
	 * @returns {html}
	*/

	/**
	 *
	 * @property {Object} accountDetails Data for the Account details screen from budget account
	 * @property {renderAlterBannerCallback} renderAlertBanner Callback function to render alter banner based on verification status & method
	 *
	 * @readonly
	 * @static
	 * @memberof BudgetAccountDetails
	 */
	static get properties() {
		return {
			accountDetails: { type: Object },
			shouldDisable: { type: Object },
			renderAlertBanner: { type: Object, attribute: false }
		};
	}

	// ---------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_transferClick() {
		this.dispatchEvent(new CustomEvent(`transfer-click`, {
			detail: {
				budgetSequenceNo: this.accountDetails.budgetSequence
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
					height: 888px;
				}
				capitec-title-bar {
					height: 80px;
					width: 1062px;
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 10px 24px 6px 16px;
					--theme-titlebar-item-gap: 0px;
				}
				.main-title {
					--horizon-label-text-font-size: 24px;
					--horizon-label-text-line-height: 26px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-text-height: 32px;
					--horizon-label-text-font-weight: 600;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color: #FFFFFF;
					--horizon-label-value-font-weight: 500;
					padding: 6px 33px 6px 16px;
					height: 64px;
					width: auto;
				}
				.left-arrow {
					cursor: pointer;
					margin-bottom: 24px;
				}
				.details-vertical {
					width: auto;
					height: auto;
					--theme-container-padding-top: 8px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-layout-gap-spacing: 0px;
				}

				/* Alertbanner styles */
				${ALERTBANNER_CSS}
				.verificatoin-status {
					order: 2;
				}
				
				horizon-label {
					height: 64px;
					width: 33%;
					padding: 12px 0px 12px 16px;

					--horizon-label-text-height: 20px;
					--horizon-label-text-line-height: 12px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-color: #3A3A3A;
				}
				horizon-label[value="Active"] {
					--horizon-label-value-color: #70AF00;
				}
				horizon-label[value="Settled"] {
					--horizon-label-value-color:#d4781c;
				}
				horizon-label[value="Closed"] {
					--horizon-label-value-color:#a5132a;
				}
				.transfer-button {
					--theme-button-font-weight: 600;
					--theme-button-default-background-color: #e31515;
					--theme-button-default-border-color: #FFFFFF;
					--theme-button-default-font-color: #FFFFFF;
				}
				capitec-button[disabled] {
					--theme-button-default-font-color: #a7a7a7;
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
				<capitec-title-bar
					data-automation-id="budget-account-details-title"
					type="credit">
						<img
							src="/images/liveBetter/left-arrow.svg"
							@click="${() => this._back()}"
							class="left-arrow"/>
						<horizon-label
							class="main-title"
							label="Budget Details"
							value="${this.accountDetails.budgetName}">
						</horizon-label>

						<capitec-spacer></capitec-spacer>

						<capitec-button
							class="transfer-button"
							data-automation-id="budget-account-details-transfer-button"
							label="Transfer"
							@click="${() => this._transferClick()}"
							?disabled="${this.shouldDisable(`pay-budget`)}">
						</capitec-button>
				</capitec-title-bar>

				${this.renderAlertBanner()}
				${this._renderAccountDetails()}

			</capitec-card>
		`;
	}

	_renderAccountDetails() {

		return html`
			<capitec-content-box
				class="details-vertical" 
				layout="vertical"
				gap="clear"
				halign="stretch"
				valign="top">
					<capitec-group 
						class="details-horizontal"
						layout="horizontal"
						gap="none"
						halign="left"
						valign="top"
						wrap>
							${Object.entries(this.accountDetails.budgetDetails).map(item => {
								const [key, value] = item;
								return html`
									<horizon-label
										label="${key}"
										value="${value}"
										data-automation-id="budget-account-details-${key.toLowerCase().split(``).join(`-`)}">
									</horizon-label>
								`;
							})}
					</capitec-group>
			</capitec-content-box>
		`;
	}

 }

 customElements.define(`capitec-pc-budget-account-details`, BudgetAccountDetails);

 /**
 * When left arrow on the title bar is clicked to go back
 *
 * @example
 * <capitec-pc-budget-account-details ... @back="${this._handler}"></capitec-pc-budget-account-details>
 *
 * @event BudgetAccountDetails#back
 * @type {Object} - N/A
 */