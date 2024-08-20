import { Component, css, html } from 'platform/elements';
import { getMonthName } from 'app/utils/channelServiceUtilities';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';

/**
 * Notice Deposits Plan verified Screen
 *
 * Events Raised
 * -------------
 * back
 * 
 * @export
 * @class NoticeDepositsPlanDetails
 * @extends {Component}
 */
export class NoticeDepositsPlanDetails extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.noticeAccountDetails = null;
		this.detailsHeader = ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this.detailsHeader = `${this.noticeAccountDetails.planName} - ${this.noticeAccountDetails.accountNumber}`;
		this.noticeAccountDetails = {
			'Current balance': this.noticeAccountDetails.currentBalance,
			'Available balance': this.noticeAccountDetails.availableBalance,
			'Nominal interest rate': this.noticeAccountDetails.nominalInterestRate,
			'Effective interest rate': this.noticeAccountDetails.effectiveInterestRate,
			[`Accrued interest ${this._getCurrentMonth()}`]: this.noticeAccountDetails.accruedInterestCurrentMonth,
			[`Interest earned ${this._getPreviousMonth()}`]: this.noticeAccountDetails.accruedInterestLastMonth,
			'Interest earned for tax year': this.noticeAccountDetails.interestEarned,
			'Fees last month': this.noticeAccountDetails.feesLastMonth,
			'Last maturity date': this.noticeAccountDetails.maturityDate,
			'Posting restrictions': this.noticeAccountDetails.postingRestrictions,
			'Outstanding authorisations': this.noticeAccountDetails.outstandingAuthorizations,
			'Holds': this.noticeAccountDetails.holds,
			'Date opened': this.noticeAccountDetails.dateOpened,
			'Last Update': this.noticeAccountDetails.lastUpdate,
			'Account status': this.noticeAccountDetails.accountStatus
		};
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {noticeAccountDetails} noticeAccountDetails Data for verified notice deposits plan display
	 *
	 */
	static get properties() {
		return {
			noticeAccountDetails: { type: Object }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		// initate back to deposits plan landing page (on back arrow)
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_getCurrentMonth() {
		const newdate = new Date();
		return `${getMonthName(newdate.getMonth())}`;
	}

	_getPreviousMonth() {
		const newdate = new Date();
		return `${getMonthName(newdate.getMonth() - 1)}`;
	}
	
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
					--theme-titlebar-padding: 16px 16px 12px 16px;
					--theme-titlebar-item-gap: 0px;
					margin-bottom: 0px;
				}
				.left-arrow {
					padding-bottom: 26px;
					cursor: pointer;
				}
				.main-title {
					--horizon-label-text-font-size: 24px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-text-line-height: 26px;
					--horizon-label-text-line-width: 168px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-text-height: 32px;
					--horizon-label-text-font-weight: 600;
					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color: #FFFFFF;
					--horizon-label-value-font-weight: 500;
					padding: 0px 16px;
				}
				horizon-label[value="Open"] {
					width: 132px;
					--horizon-label-value-color: #70AF00;
				}
				.details-group {
					padding: 8px 16px;
					--theme-layout-gap-spacing: 0px;
				}
				.details-label {
					height: 64px;
					width: 33%;
					padding: 12px 0px;

					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-font-weight: 500;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-font-weight: 600;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color:#3A3A3A;}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card 
				data-automation-id="notice-deposit-details"
				class="card">
					<capitec-title-bar 
						data-automation-id="notice-deposit-details-title"
						type="save">
							<img
							src="/images/liveBetter/left-arrow.svg"
							@click="${() => this._back()}"
							class="left-arrow"/>
							<horizon-label class="main-title" label="Notice Deposit" value="${this.detailsHeader}"></horizon-label>
					</capitec-title-bar>
					 
					${this._renderNoticeDepositsPlan()}
			</capitec-card>`;
	}

	_renderNoticeDepositsPlan() {
		return html`
			<capitec-group
				class="details-group"
				layout="horizontal"
				gap="clear"
				halign="left" 
				valign="top"
				wrap>
					${this._renderFields()}
			</capitec-group>`;
	}

	_renderFields() {
		return Object.entries(this.noticeAccountDetails).map(item => {
			const [label, value] = item;

			return html`
				<horizon-label
					class="details-label"
					label="${label}"
					value="${value}"
					data-automation-id="notice-deposits-plan-${label.split(` `).join(`-`)}">
				</horizon-label>`;
		});
	}
}

customElements.define(`capitec-notice-deposits-plan-details`, NoticeDepositsPlanDetails);

 /**
 * When left arrow on the title bar is clicked to go back
 *
 * @example
 * <capitec-notice-deposits-plan-details ... @back="${this._handler}"></capitec-notice-deposits-plan-details>
 *
 * @event NoticeDepositsPlanDetails#back
 * @type {Object} - N/A
 */