import { Component, html } from 'platform/elements';
import { formatDate, getDateOrdinal } from 'app/utils/channelServiceUtilities';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/productControls/credit/src/AccountDetailsView';

/**
 * Term loan details view
 *
 * Events Raised
 * -------------
 *
 * back
 *
 * @export
 * @class TermLoanDetails
 * @extends {Component}
 */

 export class TermLoanDetails extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.termLoanDetails = {};
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} termLoanDetails - holds access facility details
	 *
	 * @readonly
	 * @static
	 * @memberof TermLoanDetails
	 */

	static get properties() {
		return {
			termLoanDetails: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		// formatting credit card details received from service
		this.accountDetails = {
			'title': this.termLoanDetails.accountDescription,
			'accountNumber': this.termLoanDetails.accountNumber,
			'overview': {
				'Current balance': formatCurrency(this.termLoanDetails.accountBalance),
				'Credit limit': formatCurrency(this.termLoanDetails.creditLimit),
				'Debit interest rate(yearly)': this.termLoanDetails.interestRate,
				'Take-up date': formatDate(this.termLoanDetails.approvedDate, `dd mmm yyyy`),
				'Account status': this.termLoanDetails.accountStatusDescription
			},
			'arrears': null,
			'repayment': {
				'Repayment date': this._getOccurance(this.termLoanDetails.repaymentDay, `month`),
				'Repayment option': `${this.termLoanDetails.repaymentValueType} (${this.termLoanDetails.repaymentValue}%)`,
				'Next repayment due': formatDate(this.termLoanDetails.nextRepaymentDate, `dd mmm yyyy`),
				'Last repayment received': formatDate(this.termLoanDetails.lastpaymentDate, `dd mmm yyyy`),
				'Last payment received': formatCurrency(this.termLoanDetails.lastPaymentReceived)
			},
			'insurance': {
				'Option': this.termLoanDetails.insuranceOptionCode,
				'Type': this.termLoanDetails.insuranceTypeDescription,
				'Waiting period expiry date': formatDate(this.termLoanDetails.waitingPeriodExpiryDate, `dd mmm yyyy`)
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

	_getOccurance(value, occurance) {
		const parsedDate = new Date(value);
		const date = parsedDate.getDate();

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

 customElements.define(`horizon-term-loan-details-view`, TermLoanDetails);

 /**
 * When left arrow on the title bar is clicked to go back
 *
 * @example
 * <horizon-term-loan-details-view ... @back="${this._handler}"></horizon-term-loan-details-view>
 *
 * @event TermLoanDetails#back
 * @type {Object} - N/A
 */