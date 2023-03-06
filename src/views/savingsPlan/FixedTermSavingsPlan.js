import { Component, css, html } from 'platform/elements';
import { getMonthName } from 'app/utils/channelServiceUtilities';

import 'app/productControls/SavingsPlan/SavingsPlanLanding';

/**
 * Fixed Term Savings Plan View
 *
 * Events Raised
 * -------------
 * back
 * 
 * @export
 * @class FixedTermSavingsPlan
 * @extends {Component}
 */
export class FixedTermSavingsPlan extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.fixedTermAccountDetails = null;
		this.detailsHeader = ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this.detailsHeader = `${this.fixedTermAccountDetails.planName} - ${this.fixedTermAccountDetails.accountNumber}`;
		this.fixedTermAccountDetails = {
			'Current balance': this.fixedTermAccountDetails.currentBalance,
			'Available balance': this.fixedTermAccountDetails.availableBalance,
			'Nominal interest rate': this.fixedTermAccountDetails.nominalInterestRate,
			'Effective interest rate': this.fixedTermAccountDetails.effectiveInterestRate,
			[`Interest earned ${this._getCurrentMonth()}`]: this.fixedTermAccountDetails.accruedInterestCurrentMonth,
			[`Interest earned ${this._getPreviousMonth()}`]: this.fixedTermAccountDetails.accruedInterestLastMonth,
			'Interest earned for tax year': this.fixedTermAccountDetails.interestEarned,
			'Date fixed': this.fixedTermAccountDetails.dateFixed,
			'Term (months)': this.fixedTermAccountDetails.term,
			'Maturity date': this.fixedTermAccountDetails.maturityDate,
			'Interest option': this.fixedTermAccountDetails.interestOption,
			'Total contributions': this.fixedTermAccountDetails.totalContributions,
			'Available contributions': this.fixedTermAccountDetails.availableContributions,
			'Contribution limit': this.fixedTermAccountDetails.contributionLimit,
			'Posting restrictions': this.fixedTermAccountDetails.postingRestrictions,
			'Last updated': this.fixedTermAccountDetails.lastUpdate,
			'Account status': this.fixedTermAccountDetails.accountStatus
		};
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {fixedTermAccountDetails} fixedTermAccountDetails Data for verified fixed term savings plan display
	 *
	 */
	static get properties() {
		return {
			fixedTermAccountDetails: { type: Object }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		// initate back to savings plan landing page (on back arrow)
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
				.grid-layout {
					width: 95%;
					margin-top: 23px;  
					margin-left: 20px;
					--theme-data-table-body-group-font-weight: 600;
					--theme-data-table-body-group-padding-top: 0px;
					--theme-data-table-body-group-padding-bottom: 0px;
					--theme-data-table-body-group-color: #3A3A3A;
					
				}
				.interest-label {
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
				}
				.term {
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
					background-color: #F5F5F5;
				}
				.interest {
					height: 32px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 12px;
					font-weight: 600;
					letter-spacing: 2;
					line-height: 12px;
					background-color: #F5F5F5;
				}
				.interest-rate {
					height: 48px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					letter-spacing: 0;
					line-height: 20px;
				}
				.tab {
					display: inline-block;
					margin-left: 40px;
				}
				.tab1 {
					display: inline-block;
					margin-left: 50px;
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
				data-automation-id="fixed-term-savings-details"
				class="card">
					<capitec-title-bar 
						data-automation-id="fixed-term-savings-details-title"
						type="save">
							<img
							src="/images/liveBetter/left-arrow.svg"
							@click="${() => this._back()}"
							class="left-arrow"/>
							<horizon-label class="main-title" label="Fixed-term Savings Plan" value="${this.detailsHeader}"></horizon-label>
					</capitec-title-bar>

					${this._renderFixedTermSavingsPlan()}
			</capitec-card>
		`;
	}

	_renderFixedTermSavingsPlan() {
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
		return Object.entries(this.fixedTermAccountDetails).map(item => {
			const [label, value] = item;

			return html`
				<horizon-label
					class="details-label"
					label="${label}"
					value="${value}"
					data-automation-id="flexible-savings-plan-${label.split(` `).join(`-`)}">
				</horizon-label>`;
		});
	}

	_renderInterestRateTable() {
		return html`
			<capitec-group class="grid-layout" layout="grid" gap="line" columns="auto" rows="auto" halign = "left">
				<div class="interest-label" row="1" column="1" colspan="4" label="Interest Rate %" size="0.5">Interest Rate %</div>
				<div class="term" row="2" column="1" label="Term" size="1">Term</div>
				<div class="interest" row="3" column="1" type="save" size="1"></div>
				<div class="interest-rate" row="4" column="1" rowspan="2" label="24 months" size="1">24 months</div>
				<div class="term" row="2" column="2" size="1">R0-R24 999</div>
				<div class="term" row="2" column="3" size="1">R25-R99 999</div>
				<div class="term" row="2" column="4" size="1">R100 000+</div>
				<div class="interest" row="3" column="2" size="0.5">Nominal<span class="tab"></span>Effective</div>
				<div class="interest" row="3" column="3" size="0.5">Nominal<span class="tab"></span>Effective</div>
				<div class="interest" row="3" column="4" size="0.5">Nominal<span class="tab"></span>Effective</div>
				<div class="interest-rate" row="4" column="2" size="1">5.77%<span class="tab1"></span>5.93%</div>
				<div class="interest-rate" row="4" column="3" size="1">5.77%<span class="tab1"></span>5.93%</div>
				<div class="interest-rate" row="4" column="4" size="1">5.98%<span class="tab1"></span>6.15%</div>
			</capitec-group>`;
	}
}

customElements.define(`capitec-fixed-term-savings-plan-details`, FixedTermSavingsPlan);

 /**
 * When left arrow on the title bar is clicked to go back
 *
 * @example
 * <capitec-fixed-term-savings-plan-details ... @back="${this._handler}"></capitec-fixed-term-savings-plan-details>
 *
 * @event FixedTermSavingsPlan#back
 * @type {Object} - N/A
 */