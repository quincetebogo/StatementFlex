import { Component, html } from 'platform/elements';
import { formatDate, formatStringAsPascalCase, getDateOrdinal } from 'app/utils/channelServiceUtilities';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/productControls/credit/src/AccountDetailsView';

/**
 * Credit card details view
 *
 * Events Raised
 * -------------
 *
 * back
 *
 * @export
 * @class CreditCardDetails
 * @extends {Component}
 */

 export class CreditCardDetails extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.creditCardDetails = {};
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} creditCardDetails - holds credit cards details
	 *
	 * @readonly
	 * @static
	 * @memberof CreditCardDetails
	 */

	static get properties() {
		return {
			creditCardDetails: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		const totalArrearsPayable = this.creditCardDetails.totalArrearsPayable || `0`;

		// formatting credit card details received from service
		this.accountDetails = {
			'title': formatStringAsPascalCase(this.creditCardDetails.accountDescription),
			'accountNumber': this.creditCardDetails.accountNumber,
			'overview': {
				'Current balance': formatCurrency(this.creditCardDetails.currentBalance),
				'Available balance': formatCurrency(this.creditCardDetails.availableBalance),
				'Debit interest rate(yearly)': `${this.creditCardDetails.interestRate}%`,
				'Credit limit': formatCurrency(this.creditCardDetails.creditLimit),
				'Outstanding authorisations': formatCurrency(this.creditCardDetails.outstandingAuthorizations),
				'Take-up date': formatDate(this.creditCardDetails.openDate, `dd mmm yyyy`),
				'Auto limit increase': `${this.creditCardDetails.autoIncreaseLimitOption ? `Yes` : `No`}`,
				'Account status': this.creditCardDetails.arrearsStatus ? `In arrears` : formatStringAsPascalCase(this.creditCardDetails.accountStatusDescription)
			},
			'arrears': {
				[totalArrearsPayable < 0 ? `Total advance amount` : `Total arrears amount`]: formatCurrency(totalArrearsPayable)
			},
			'repayment': {
				'Repayment day': `${this.creditCardDetails.repaymentDay}${getDateOrdinal(this.creditCardDetails.repaymentDay)} of every month`,
				'Repayment method': this.creditCardDetails.repaymentMethodDescription,
				'Repayment option': this._formatCreditCardRepaymentOption(this.creditCardDetails.repaymentValueType, this.creditCardDetails.repaymentValue),
				'Next repayment due': formatDate(this.creditCardDetails.nextRepaymentDate, `dd mmm yyyy`),
				'Last repayment received': formatDate(this.creditCardDetails.lastPaymentDate, `dd mmm yyyy`),
				'Statement day': `${this.creditCardDetails.statementDay}${getDateOrdinal(this.creditCardDetails.statementDay)} of every month`
			},
			'insurance': {
				'Option': this.creditCardDetails.insuranceOptionCode,
				'Type': this.creditCardDetails.insuranceTypeDescription,
				'Waiting period expiry date': formatDate(this.creditCardDetails.waitingPeriodExpiryDate, `dd mmm yyyy`)
			}
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

	_formatCreditCardRepaymentOption(repaymentValueType, repaymentValue) {
		return repaymentValueType === `Percentage` ? `${repaymentValueType} (${repaymentValue}%)` : `${repaymentValueType} (${formatCurrency(repaymentValue)})`;
	}

	// ---------
	// RENDERING
	// ---------
	
	static get styles() {
		return [super.styles];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-pc-account-details-view
				.accountDetails="${this.accountDetails}"
				@back="${() => this._back()}">
			</capitec-pc-account-details-view>
		`;
	}

	_kisokTemplate() {
		return this._webTemplate();
	}
 }

 customElements.define(`horizon-credit-card-details-view`, CreditCardDetails);

 /**
 * When left arrow on the title bar is clicked to go back
 *
 * @example
 * <horizon-credit-card-details-view ... @back="${this._handler}"></horizon-credit-card-details-view>
 *
 * @event CreditCardDetails#back
 * @type {Object} - N/A
 */