import { Component, html } from 'platform/elements';
import { formatDate, formatStringAsPascalCase, getDateOrdinal } from 'app/utils/channelServiceUtilities';
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
		ineum(`page`, `Credit Term Loan Details Dialog`);
		// formatting credit card details received from service
		this.accountDetails = {
			'title': formatStringAsPascalCase(this.termLoanDetails.accountDescription),
			'accountNumber': this.termLoanDetails.accountNumber,
			'overview': {
				'Current balance': formatCurrency(this.termLoanDetails.accountBalance),
				'Approved Amount': formatCurrency(this.termLoanDetails.approvedAmount),
				'Debit interest rate(yearly)': `${this.termLoanDetails.interestRate}%`,
				'Take-up date': formatDate(this.termLoanDetails.approvedDate, `dd mmm yyyy`),
				'Account status': this.termLoanDetails.arrearsStatus ? `In arrears` : formatStringAsPascalCase(this.termLoanDetails.accountStatusDescription)
			},
			'arrears': {
				'Total arrears amount': formatCurrency(this.termLoanDetails.totalArrearsPayable || `0`),
				'Last arrears date': this.termLoanDetails.lastArrearsDate ? formatDate(this.termLoanDetails.lastArrearsDate, `dd mmm yyyy`) : `-`,
				'December arrears': formatCurrency(this.termLoanDetails.decemberArrears || `0`),
				'Arrears excluding December arrears': formatCurrency(this.termLoanDetails.arrearsExcludingDecemberArrears || `0`)
			},
			'repayment': {
				'Repayment date': `${this.termLoanDetails.salaryDate}${getDateOrdinal(this.termLoanDetails.salaryDate)} of every month`,
				'Repayment amount': `${formatCurrency(this.termLoanDetails.nextInstalmentDueAmount)}`,
				'Next repayment due': formatDate(this.termLoanDetails.nextInstalmentDate, `dd mmm yyyy`),
				'Last repayment received': formatDate(this.termLoanDetails.lastPaymentDate, `dd mmm yyyy`),
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