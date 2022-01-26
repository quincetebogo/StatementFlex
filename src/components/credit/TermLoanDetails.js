import { Component, html } from 'platform/elements';
import { formatCurrency, formatDate, getDateOrdinal } from 'app/utils/channelServiceUtilities';

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
				// TODO: Should I add a negative sign here?
				// TODO: Is this mapping correct?
				'Current balance': formatCurrency(this.termLoanDetails.accountBalance),
				// TODO: creditLimit => approvedAmount
				'Approved Amount': formatCurrency(this.termLoanDetails.approvedAmount),
				'Debit interest rate(yearly)': `${this.termLoanDetails.interestRate}%`,
				'Take-up date': formatDate(this.termLoanDetails.approvedDate, `dd mmm yyyy`),
				'Account status': this.termLoanDetails.accountStatusDescription
			},
			'arrears': null,
			'repayment': {
				// TODO: repaymentDay => nextInstalmentDate
				'Repayment date': this._getOccurance(this.termLoanDetails.nextInstalmentDate, `month`),
				// TODO: repaymentValue => nextInstalmentDueAmount. NOTE Option is always amount
				'Repayment option': `${this.termLoanDetails.repaymentValueType} (${formatCurrency(this.termLoanDetails.nextInstalmentDueAmount)})`,
				// TODO: nextRepaymentDate => nextInstalmentDate
				'Next repayment due': formatDate(this.termLoanDetails.nextInstalmentDate, `dd mmm yyyy`),
				'Last repayment received': formatDate(this.termLoanDetails.lastPaymentDate, `dd mmm yyyy`),
				'Last payment received': formatCurrency(this.termLoanDetails.lastPaymentReceived)
			},
			'insurance': {
				// TODO: What exactly should this be? 
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