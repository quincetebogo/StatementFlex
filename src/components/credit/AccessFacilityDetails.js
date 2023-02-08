import { Component, html } from 'platform/elements';
import { formatDate, formatStringAsPascalCase, getDateOrdinal } from 'app/utils/channelServiceUtilities';
import { formatCurrency } from 'app/productControls/utilities/Currency';

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
			'title': formatStringAsPascalCase(this.accessFacilityDetails.accountDescription),
			'accountNumber': this.accessFacilityDetails.accountNumber,
			'overview': {
				'Current balance': formatCurrency(this.accessFacilityDetails.currentBalance),
				'Available balance': formatCurrency(this.accessFacilityDetails.availableBalance),
				'Credit limit': formatCurrency(this.accessFacilityDetails.creditLimit),
				'Take-up date': formatDate(this.accessFacilityDetails.openDate, `dd mmm yyyy`),
				'Auto limit increase': `${this.accessFacilityDetails.autoIncreaseLimitOption ? `Yes` : `No`}`,
				'Account status': this.accessFacilityDetails.arrearsStatus ? `In arrears` : formatStringAsPascalCase(this.accessFacilityDetails.accountStatusDescription)
			},
			'arrears': {
				'Total arrears amount': formatCurrency(this.accessFacilityDetails.totalArrearsPayable || `0`),
				'Last arrears date': this.accessFacilityDetails.lastArrearsDate ? formatDate(this.accessFacilityDetails.lastArrearsDate, `dd mmm yyyy`) : `-`
			},
			'repayment': {
				'Repayment amount': `${formatCurrency(this.accessFacilityDetails.repaymentValue)}`,
				'Repayment date': `${this.accessFacilityDetails.repaymentDay}${getDateOrdinal(this.accessFacilityDetails.repaymentDay)} of every month`,
				'Next repayment due': formatDate(this.accessFacilityDetails.nextRepaymentDate, `dd mmm yyyy`),
				'Repayment period': `${this.accessFacilityDetails.repaymentPeriod} months`,
				'Remaining monthly repayments': this.accessFacilityDetails.remainingRepayments,
				'Last repayment received': formatDate(this.accessFacilityDetails.lastFinancialDate, `dd mmm yyyy`),
				'Repayment method': this.accessFacilityDetails.repaymentMethod
			},
			'insurance': {
				'Option': this.accessFacilityDetails.insuranceOptionCode,
				'Type': this.accessFacilityDetails.insuranceTypeDescription,
				'Waiting period expiry date': formatDate(this.accessFacilityDetails.waitingPeriodExpiryDate, `dd mmm yyyy`)
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