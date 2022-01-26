import { Component, html } from 'platform/elements';
import { formatCurrency, formatDate, getDateOrdinal } from 'app/utils/channelServiceUtilities';

import 'app/productControls/credit/src/AccountDetailsView';

/**
 * Access facility details view
 *
 * Events Raised
 * -------------
 *
 * back
 *
 * @export
 * @class AccessFacilityDetails
 * @extends {Component}
 */

 export class AccessFacilityDetails extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.accessFacilityDetails = {};
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} accessFacilityDetails - holds access facility details
	 *
	 * @readonly
	 * @static
	 * @memberof AccessFacilityDetails
	 */

	static get properties() {
		return {
			accessFacilityDetails: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		// formatting credit card details received from service
		this.accountDetails = {
			'title': this.accessFacilityDetails.accountDescription,
			'accountNumber': this.accessFacilityDetails.accountNumber,
			'overview': {
				// TODO: totalBalance gets mapped to currentBalance in the CS?
				'Current balance': formatCurrency(this.accessFacilityDetails.currentBalance),
				'Available balance': formatCurrency(this.accessFacilityDetails.availableBalance),
				'Credit limit': formatCurrency(this.accessFacilityDetails.creditLimit),
				'Take-up date': formatDate(this.accessFacilityDetails.openDate, `dd mmm yyyy`),
				// TODO: Should this be mapped to YES or NO to match invision?
				'Auto limit increase': this.accessFacilityDetails.autoIncreaseLimitOption,
				'Account status': this.accessFacilityDetails.accountStatusDescription
			},
			'arrears': null,
			'repayment': {
				// TODO: Removed repaymentAmount. Only included repaymentValue as it is always amount. 
				'Repayment amount': `${formatCurrency(this.accessFacilityDetails.repaymentValue)}`,
				// TODO: Tweeked this implementation a bit
				'Repayment date': `${this.accessFacilityDetails.repaymentDay}${getDateOrdinal(this.accessFacilityDetails.repaymentDay)} of every month`,
				'Next repayment due': formatDate(this.accessFacilityDetails.nextRepaymentDate, `dd mmm yyyy`),
				'Repayment period': this.accessFacilityDetails.repaymentPeriod,
				// TODO: outstandingRepayments => remainingRepayments
				'Remaning monthly repayments': this.accessFacilityDetails.remainingRepayments,
				// TODO: lastpaymentDate => lastFinancialDate?
				'Last repayment received': formatDate(this.accessFacilityDetails.lastFinancialDate, `dd mmm yyyy`),
				// TODO: RepaymentMethod does not get returned. Is it always debit order?
				'Repayment method': this.accessFacilityDetails.repaymentMethod
			},
			'insurance': {
				// TODO: What exactly should this be? 
				'Option': this.accessFacilityDetails.insuranceOptionCode,
				'Type': this.accessFacilityDetails.insuranceTypeDescription,
				'Waiting period expiry date': formatDate(this.accessFacilityDetails.waitingPeriodExpiryDate, `dd mmm yyyy`)
			}
		};

		if (this.accessFacilityDetails.accountStatusDescription === `In arrears`) {
			this.accountDetails.arrears = {
				// TODO: This should probably be totalArrearsPayable
				'Total arrears amount': formatCurrency(this.accessFacilityDetails.arrearsAmount),
				'Last arrears date': formatDate(this.accessFacilityDetails.lastArrearsDate, `dd mmm yyyy`)
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
		// TODO: Not sure this is doing what is needed
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

 customElements.define(`horizon-access-facility-details-view`, AccessFacilityDetails);

 /**
 * When left arrow on the title bar is clicked to go back
 *
 * @example
 * <horizon-access-facility-details-view ... @back="${this._handler}"></horizon-access-facility-details-view>
 *
 * @event AccessFacilityDetails#back
 * @type {Object} - N/A
 */