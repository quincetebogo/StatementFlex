import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/utils/channelServiceUtilities';
import 'app/components/common/HorizonLabel';

// TO DO: Temporary data. Can be removed when implemented CS call.
const ACCOUNT_DETAILS = {
	accountName: `Shoprite Pleican PARK Grassy Park ZA`,
	monthlyRepayment: 74.11,
	purchaseAmount: 433.35,
	outstandingBalance: 364.06,
	openingDate: "2021-11-12T03:09:58.829Z",
	interestRate: 7.75,
	term: 3,
	paymentMade: 74.11,
	settlementAmount: 191.71,
	remainingTerm: 2
}

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

		this.accountDetails = ACCOUNT_DETAILS;
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
	 * @property {Object} accountDetails Data for the Account details screen from budget account
	 *
	 * @readonly
	 * @static
	 * @memberof BudgetAccountDetails
	 */
	static get properties() {
		return {
			accountDetails: { type: Object }
		};
	}

	// ---------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	// Formating date in the form 'DD MMM YYYY'
	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${this.getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	// Get month name using month as a number (0 = Jan, 1 = Feb,... )
	getMonthName(month) {
		const monthNames = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
		return monthNames.slice(month)[0];
	}

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

				horizon-label {
					height: 64px;
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
							src="src/productControls/credit/images/left-arrow.svg"
							@click="${() => this._back()}"
							class="left-arrow"/>
						<horizon-label
							class="main-title"
							label="Budget Details"
							value="${this.accountDetails.accountName}">
						</horizon-label>
				</capitec-title-bar>

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
					halign="stretch"
					valign="top">
						<horizon-label
							data-automation-id="budget-account-details-monthly-repayment"
							label="Monthly repayment"
							value="${formatCurrency(this.accountDetails.monthlyRepayment)}">
						</horizon-label>
						<horizon-label 
							data-automation-id="budget-account-details-purchase-amount" 
							label="Purchase amount" 
							value="${formatCurrency(this.accountDetails.purchaseAmount)}">
						</horizon-label>
						<horizon-label 
							data-automation-id="budget-account-details-outstanding-balance"
							label="Outstanding balance"
							value="${formatCurrency(this.accountDetails.outstandingBalance)}">
						</horizon-label>
				</capitec-group>

				<capitec-group 
					class="details-horizontal"
					layout="horizontal"
					gap="none" 
					halign="stretch" 
					valign="center">
						<horizon-label 
							data-automation-id="budget-account-details-opening-date"
							label="Opening date" 
							value="${this._formatDate(this.accountDetails.openingDate)}">
						</horizon-label>
						<horizon-label 
							data-automation-id="budget-account-details-interest-rate"
							label="Interest rate" 
							value="${this.accountDetails.interestRate}%">
						</horizon-label>
						<horizon-label
							data-automation-id="budget-account-details-term"
							label="Term (months)" 
							value="${formatCurrency(this.accountDetails.outstandingBalance)}">
						</horizon-label>
				</capitec-group>

				<capitec-group 
					class="details-horizontal"
					layout="horizontal"
					gap="none" 
					halign="stretch" 
					valign="center">
						<horizon-label 
							data-automation-id="budget-account-details-payment-made"
							label="Payment made" 
							value="${formatCurrency(this.accountDetails.paymentMade)}">
						</horizon-label>
						<horizon-label 
							data-automation-id="budget-account-details-settlement-amount"
							label="Settlement amount" 
							value="${formatCurrency(this.accountDetails.settlementAmount)}">
						</horizon-label>
						<horizon-label
							data-automation-id="budget-account-details-remaining-term"
							label="Remaining term (months)"
							value="${this.accountDetails.remainingTerm}">
						</horizon-label>
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