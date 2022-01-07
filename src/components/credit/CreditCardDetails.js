import { Component, html } from 'platform/elements';
import { formatCurrency, formatDate, getDateOrdinal } from 'app/utils/channelServiceUtilities';

import 'app/productControls/Credit/src/AccountDetaislView';

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

		// formatting credit card details received from service
		this.accountDetails = {
			'title': this.creditCardDetails.accountDescription,
			'accountNumber': this.creditCardDetails.accountNumber,
			'overview': {
				'Current balance': formatCurrency(this.creditCardDetails.currentBalance),
				'Available balance': formatCurrency(this.creditCardDetails.availableBalance),
				'Debit interest rate(yearly)': this.creditCardDetails.interestRate,
				'Credit limit': formatCurrency(this.creditCardDetails.creditLimit),
				'Outstanding authorisations': formatCurrency(this.creditCardDetails.outstandingAuthorizations),
				'Take-up date': formatDate(this.creditCardDetails.openDate, `dd mmm yyyy`),
				'Auto limit increase': this.creditCardDetails.autoIncreaseLimitOption,
				'Account status': this.creditCardDetails.accountStatusDescription
			},
			'arrears': null,
			'repayment': {
				'Repayment day': this._getOccurance(this.creditCardDetails.repaymentDay, `month`),
				'Repayment method': this.creditCardDetails.repaymentMethod,
				'Repayment option': `${this.creditCardDetails.repaymentValueType} (${this.creditCardDetails.repaymentValue}%)`,
				'Next repayment due': formatDate(this.creditCardDetails.nextRepaymentDate, `dd mmm yyyy`),
				'Last repayment received': formatDate(this.creditCardDetails.lastpaymentDate, `dd mmm yyyy`),
				'Statement day': this._getOccurance(this.creditCardDetails.statementDay, `month`)
			},
			'insurance': {
				'Option': this.creditCardDetails.insuranceOptionCode,
				'Type': this.creditCardDetails.insuranceTypeDescription,
				'Waiting period expiry date': formatDate(this.creditCardDetails.waitingPeriodExpiryDate, `dd mmm yyyy`)
			}
		};

		if (this.creditCardDetails.accountStatusDescription === `In arrears`) {
			this.accountDetails.arrears = {
				'Total arrears amount': formatCurrency(this.creditCardDetails.arrearsAmount),
				'Last arrears date': formatDate(this.creditCardDetails.lastArrearsDate, `dd mmm yyyy`)
			};
		}
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

	_getOccurance(value, occurance) {
		const parsedDate = new Date(value);
		const date = parsedDate.getDate();
		const month = parsedDate.getMonth();

		return `${date}${getDateOrdinal(date)} of every ${occurance}`;
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