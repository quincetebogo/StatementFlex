/* eslint-disable prefer-object-spread */
import { Component, css, html } from 'platform/elements';
import { formatStringAsPascalCase, getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { ALERTBANNER_CSS } from 'app/css/VerificationStatusAlertBanner';
import { PERMISSION_DECLINE_REASONS } from 'app/constants/Credit';
import { DateTime } from 'luxon'; s;
import { Utilities } from '@cb/platform-web-core';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/NoResultsSearchScreen';
import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';

 const FILTER_BY_STATUS = {
	ACTIVE: `Active`,
	SETTLED: `Settled`,
	CLOSED: `Closed`
 };

 const FILTER_BY = {
	TEXT: `TEXT`,
	DATE: `DATE`
};

const RENDER_CHIPS = {
	TEXT: ``,
	DATE: ``
};

 const BUDGET_TYPE = {
	'Active': `activeCreditCardBudgetList`,
	'Settled': `settledCreditCardBudgetList`,
	'Closed': `closedCreditCardBudgetList`
 };

const today = new Date();

/**
 * Budget facility Accounts view Product Control
 * 
 * Events Raised
 * -------------
 * back
 * account-details
 * 
 * @export
 * @class BudgetFacilityAccounts
 * @extends {Component}
 */
 export class BudgetFacilityAccounts extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.budgetFacilityAccounts = null;
		this.activeCreditCardBudgetList = null;
		this.settledCreditCardBudgetList = null;
		this.closedCreditCardBudgetList = null;
		this.filteredAccounts = null;
		this.searchText = ``;
		this.canOpenBudget = true;
		this.openBudgetDeclineReason = ``;
		this.filterByStatus = ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
		
		this._loadBudgetLists();

		// Making sure no baggage is carried from the previous instance.
		RENDER_CHIPS[FILTER_BY.TEXT] = ``;
		RENDER_CHIPS[FILTER_BY.DATE] = ``;

		this._onLoading();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @typedef {Object} renderAlertBanner Display alter banner based on verification status
	*/
	/**
	 * @callback renderAlterBannerCallback
	 * @returns {html}
	*/

	/**
	 * @typedef {Object} getBudgetFacilities  Callback function to get budgets facilities with the selected status
	*/
	/**
	 * @callback getBudgetFacilitiesCallback
	 * @returns {object}
	*/

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {budgetFacilityAccounts} budgetFacilityAccounts List of Budget facility accounts and their details
	 * @property {budgetFacilityAccounts} shouldDisable Indicates if Transfer button needs to be disabled based on ITA verification
	 * @property {budgetFacilityAccounts} budgetStatus Budget status captured when clicked on budget account details, helps to return to the same status list 
	 * @property {renderAlterBannerCallback} renderAlertBanner Callback function to render alter banner based on verification status & method
	 * @property {canOpenBudgetCallback} canOpenBudget Callback function to get open budget permissions
	 * @property {getArrearsPayableCallback} getArrearsPayable Callback function to get total arrears payable
	 * @property {getBudgetFacilitiesCallback} getBudgetFacilities Callback function to get budgets facilities with the selected status
	 *
	 */
	static get properties() {
		return {
			budgetFacilityAccounts: { type: Object },
			shouldDisable: { type: Object },
			budgetStatus: { type: String },
			renderAlertBanner: { type: Object, attribute: false },
			canOpenBudget: { type: Object, attribute: false },
			getArrearsPayable: { type: Object, attribute: false },     
			groupAccountsByTerm: { state: true },
			filteredAccounts: { state: true },
			canOpenBudget: { state: true },
			openBudgetDeclineReason: { state: true },
			getBudgetFacilities: { type: Object, attribute: false },
			filteredAccounts: { state: true },
			filterByStatus: { state: true }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------
	
	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_accountDetails(selectedBudgetAccount) {
		selectedBudgetAccount.budgetAccountNumber = this.budgetFacilityAccounts.creditCardNumber;
	
		this.dispatchEvent(new CustomEvent(`account-details`, {
			detail: {
				selectedAccountDetails: selectedBudgetAccount
			}
		}));
	}

	_searchValueChange(event) {
		RENDER_CHIPS[FILTER_BY.TEXT] = event.detail.new.toLowerCase();
		this._refineSearch();
	}

	_transferClick(selectedBudgetAccount) {
		selectedBudgetAccount.productTypeCode = this.budgetFacilityAccounts.productTypeCode;
		selectedBudgetAccount.budgetAccountNumber = this.budgetFacilityAccounts.creditCardNumber;
		
		this.dispatchEvent(new CustomEvent(`transfer-click`, {
			detail: { selectedAccountDetails: selectedBudgetAccount }
		}));
	}

	_displayTooltip(e) {
		const tooltip = this.shadowRoot.getElementById(`long-budget-name-tooltip`);
		const clientName = this.shadowRoot.getElementById(`short-budget-name-label-value`);

		if (e.target.scrollWidth > e.target.offsetWidth) {
			tooltip.style.display = `flex`;
			clientName.style.display = `none`;
		}
	}

	_focusOut(event) {
		if (event.currentTarget.value) {
			this.dispatchEvent(new CustomEvent(`fiter-changed`, { detail: {
				"searchValue": event.currentTarget.value
			} }));
		}
	}

	async _openBudgetClick() {
		const returnValue = await this.canOpenBudget();
		let result = returnValue?.result;

		if (!returnValue.succeeded) {
			// mimicking the result to false with reason System Failure
			result = {
				canAdd: false,
				declineReason: `System error, try again later` 
			};
		}

		this.canOpenBudget = result?.canAdd;
		this.openBudgetDeclineReason = PERMISSION_DECLINE_REASONS[result?.declineReason];

		if (this.canOpenBudget) {
			this.dispatchEvent(new CustomEvent(`open-budget-click`, {
				detail: {
					option: `open-budget`
				}
			}));
		} else if (this.openBudgetDeclineReason === PERMISSION_DECLINE_REASONS.AccountInArrears) {
			let arrearsPayable = await this.getArrearsPayable();
			arrearsPayable = arrearsPayable < 0 ? arrearsPayable * -1 : arrearsPayable;
			this.openBudgetDeclineReason = this.openBudgetDeclineReason.replace(`$ArrearsPayable$`, formatCurrency(arrearsPayable));
		}
		this.requestUpdate();

	}

	async _statusValueChange(e) {
		this.filterByStatus = e.currentTarget.label;

		// Make sure not to hit CS when the status is selected for second time or more
		if (!this[BUDGET_TYPE[this.filterByStatus]]) {
			const request = {
				accountNumber: this.budgetFacilityAccounts.creditCardNumber,
				status: this.filterByStatus,
				startDateTime: ``,
				endDateTime: ``
			};
			const response = await this.getBudgetFacilities(request);
			if (response) {
				this[BUDGET_TYPE[this.filterByStatus]] = Utilities.groupBy(response[BUDGET_TYPE[this.filterByStatus]], `originalTerm`);
				this.budgetFacilityAccounts[BUDGET_TYPE[this.filterByStatus]] = response[BUDGET_TYPE[this.filterByStatus]];
			}
		}

		this._refineSearch();
	} 

	_dateChanged(e) {

		/**
		 * 1. When dates are not selected on the date time picker, new value dispatched would be null.
		 *    In such case, data refresh can be skipped.
		 * 2. Sometimes start date/ end date could be null when one of its not selected, for which
		 *    either before 90 days or after 90 days set accordingly.
		 */
		if (!e.detail.new.startDate && !e.detail.new.endDate) {
			return false;
		} else if (!e.detail.new.endDate) {
			e.detail.new.endDate = e.detail.old.endDate || this.get90DaysAfter(e.detail.new.startDate);
		} else if (!e.detail.new.startDate) {
			e.detail.new.startDate = e.detail.old.startDate || this.get90DaysBefore(e.detail.new.endDate);
		}

		const fromDate = DateTime.fromISO(e.detail.new.startDate);
		let toDate = DateTime.fromISO(e.detail.new.endDate);
		const currentDateTime = DateTime.local();

		if (toDate.diff(fromDate, [`days`]).days > 90) {
			
			toDate = fromDate.plus({ days: 90 });
			if (toDate > currentDateTime) {
				this.startDate = fromDate;
				this.endDate = currentDateTime;
			} else {
				this.startDate = fromDate;
				this.endDate = toDate;
				const calendar = this.shadowRoot.querySelector(`#calendarRange`);
				if (calendar) {
					calendar._placeholderEndDate = toDate;
				}
			}
		} else {
			this.startDate = fromDate;
			this.endDate = toDate;
		}
		
		RENDER_CHIPS[FILTER_BY.DATE] = this._getDateRange();
		this._refineSearch();
	}

	_clearAllFilters() {
		const activeFilters = this.shadowRoot.getElementById(`active-filters`);
		Array.from(activeFilters.children)
			 .filter(field => field.localName === `capitec-chip` && !field.hidden)
			 .forEach(item => {
				 this._clearFilter(item.id);
			 });

		this._refineSearch();
	}

	_closeChip(type) {
		this._clearFilter(type);
		this._refineSearch();
	}

	_clearFilter(type) {
		const text = () => this._clearTextFilter();
		const date = () => this._reset();
		
		const resetForfilters = {
			'DATE': date,
			'TEXT': text
		};

		RENDER_CHIPS[type] = ``;
		if (resetForfilters[type]) {
			resetForfilters[type]();
		}
	}

	_clearTextFilter() {
		RENDER_CHIPS[FILTER_BY.TEXT] = ``;
		this._refineSearch();
	}

	// To set the values to default on closing the chip or clearing all the filters
	_reset() {
		if (isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE])) {
			this.startDate = ``;
			this.endDate = ``;

			const calendar = this.shadowRoot.querySelector(`#calendarRange`);
			if (calendar) {
				calendar._placeholderEndDate = null;
				calendar._placeholderStartDate = null;
			}
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A
	
	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	_onLoading() {
		this.dispatchEvent(new CustomEvent(`on-loading`, {}));
	}

	_loadBudgetLists() {
		// Set status to previous selection when coming back from details screen else by default Active 
		this.filterByStatus = this.budgetStatus || FILTER_BY_STATUS.ACTIVE;

		Object.values(FILTER_BY_STATUS).forEach(status => {
			if (this.budgetFacilityAccounts[BUDGET_TYPE[status]] && this.budgetFacilityAccounts[BUDGET_TYPE[status]].length > 0) {

				// Grouping budget accounts available based on total number of term months.
				this[BUDGET_TYPE[status]] = Utilities.groupBy(this.budgetFacilityAccounts[BUDGET_TYPE[status]], `originalTerm`);
			} else if (this.budgetFacilityAccounts[BUDGET_TYPE[status]] && !this[BUDGET_TYPE[status]]) {
				// Loading null when array is empty, provided there is no CS call yet made with particular status
				this[BUDGET_TYPE[status]] = null;
			}
		});

		this.filteredAccounts = Object.assign({}, this[BUDGET_TYPE[this.filterByStatus]]);
	}

	getPredefinedDateRanges() {
		const last7day = new Date(today);
		const last30day = new Date(today);
		const last60day = new Date(today);
		const last90day = new Date(today);

		last7day.setDate(today.getDate() - 7);
		last30day.setDate(today.getDate() - 30);
		last60day.setDate(today.getDate() - 60);
		last90day.setDate(today.getDate() - 90);

		return [
			{ text: `Last 7 days`, value: { startDate: last7day.toISOString(), endDate: today.toISOString() } },
			{ text: `Last 30 days`, value: { startDate: last30day.toISOString(), endDate: today.toISOString() } },
			{ text: `Last 60 days`, value: { startDate: last60day.toISOString(), endDate: today.toISOString() } },
			{ text: `Last 90 days`, value: { startDate: last90day.toISOString(), endDate: today.toISOString() } }
		];
	}
	
	_getDateRange() {
		const fromDate = !this.startDate ? `dd mm yyyy` : this._formatDate(this.startDate);
		const toDate = !this.endDate ? `dd mm yyyy` : this._formatDate(this.endDate);

		const preDefinedRanges = this.getPredefinedDateRanges();
		const selectedValue = preDefinedRanges.filter(item => this._formatDate(item.value.startDate) === fromDate && this._formatDate(item.value.endDate) === toDate);

		if (selectedValue.length > 0) {
			return selectedValue[0].text;
		}
	
		return `${fromDate} - ${toDate}`;
	}
	
	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	_refineSearch() {
		this.filteredAccounts = Object.assign({}, this[BUDGET_TYPE[this.filterByStatus]]);

		if (RENDER_CHIPS[FILTER_BY.TEXT]) {
			const searchText = RENDER_CHIPS[FILTER_BY.TEXT];
			Object.keys(this.filteredAccounts).forEach(term => {
				this.filteredAccounts[term] = this.filteredAccounts[term].filter(item => item.budgetName.toLowerCase().indexOf(searchText) !== -1 ||
																						parseFloat(item.budgetInstallment).toFixed(2).startsWith(searchText) ||
																						parseFloat(item.originalAmount).toFixed(2).startsWith(searchText) ||
																						parseFloat(item.budgetBalance).toFixed(2).startsWith(searchText));
			});
		}

		if (RENDER_CHIPS[FILTER_BY.DATE]) {
			const fromDate = new Date(Date.parse(this.startDate));
			const toDate = new Date(Date.parse(this.endDate));
			Object.keys(this.filteredAccounts).forEach(term => {
				this.filteredAccounts[term] = this.filteredAccounts[term].filter(item => new Date(Date.parse(item.budgetDateTaken)) >= fromDate &&
																						new Date(Date.parse(item.budgetDateTaken)) <= toDate);
			});
		}

		this.requestUpdate();
	}

	_checkBudgetStatusAndDisable(budgetAcc) {

		if (budgetAcc.status !== `Active`) {
			return true;
		}
		return false;
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
					--theme-layout-gap-spacing: 0px;
				}

				/* Title Bar styles */
				capitec-title-bar {
					--theme-titlebar-padding: 14px 16px 0px 16px;
					--theme-titlebar-item-gap: 0px;
				}
				capitec-title-bar > capitec-label {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
				}
				.left-arrow {
					cursor: pointer;
					margin: 0px 15px 0px 0px;
				}
				capitec-title-bar > capitec-spacer {
					width: 100px;
				}
				.add-budget-btn {
					--theme-button-default-background-color: linear-gradient(90deg, #B62825 0%, #E61414 100%);
					--theme-button-default-border-color: #FFFFFF;
					--theme-button-default-font-color: #FFFFFF;
					--theme-button-padding-top: 10px;
					--theme-button-padding-bottom: 10px;
					--theme-button-padding-right: 16px;
					--theme-button-padding-left: 16px;
				}

				/* Account details bar styles */
				.account-details-bar {
					width: auto;
					height: 64px;
					border-bottom: 0px;
				}
				.account-details-bar > horizon-label {
					width: auto;
					padding: 12px 62px 12px 0px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-value-color:#FFFFFF;
				}
				
				/* Alert banner styles */
				${ALERTBANNER_CSS}
				.verificatoin-status {
					width: 1030px;
					margin: 16px 0px 8px 16px;
				}
				capitec-alert-banner {
					--theme-toast-box-shadow: none;
					--theme-toast-padding: 12px 16px 12px 16px;
					--theme-toast-width: 100%;
					margin-bottom: 0px;
				}

				/* Search bar styles */
				capitec-search-field {
					margin: 8px 16px;
					width: 356px;
					--theme-input-label-font-color: #7c7c7c;
				}

				/* Busget Accounts content styles */
				capitec-content-box {
					width: 1062px;
					height: 693px;
					
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
				}
				.budget-content {
					height: 647px;
				}
				horizon-label {
					height: 100%;
					width: 158px;
					font-weight: 300;
					justify-content: left;
					padding: 12px 0px 12px 16px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-value-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color:#3A3A3A;
				}
				horizon-label[label="Status"] {
					width: 116px;
				}
				horizon-label[value="Active"] {
					--horizon-label-value-color:#70AF00;
				}
				horizon-label[value="Settled"] {
					--horizon-label-value-color:#d4781c;
				}
				horizon-label[value="Close"] {
					--horizon-label-value-color:#7C7C7C;
				}
				#budget-name-label {
					width: 253px;
					--theme-label-cursor: pointer;
					--theme-label-font-color: #3A3A3A;
					padding: 12px 0px 12px 16px;
					justify-content: left;
					height: 100%;
				}
				.budget-name-label-value {
					width: 236px;
					display: inline-block;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					font-weight: 600;
					height: 20px;
					font-size: 16px;
					line-height: 20px;
					--theme-label-font-color: #3A3A3A;
				}
				.term-header {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 16px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-weight: 600;
					--theme-type-default-font-color: #3A3A3A;
					--theme-label-title-font-size: 14px;
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-item-gap: 0px;
					border-top: 1px solid rgb(225, 225, 225);
					border-bottom: 1px solid rgb(225, 225, 225);
				}
				.accounts-group {
					padding-bottom: 24px;
					height: auto;
					--theme-layout-gap-spacing: 0px;
				}
				.account-details-tile {
					margin: 16px 16px 0px 16px;
					width: 1032px;
					height: 64px;
					border: 1px solid #e1e1e1;
					border-radius: 4px;
					padding: 0px 16px;
				}
				.account-details-tile > capitec-icon {
					--theme-icon-size-medium: 24px;
					cursor: pointer;
				}
				.account-details-tile > capitec-button {
					width: 90px;
					--theme-button-font-weight: 600;
				}
				.account-details-tile > capitec-button[disabled] {
					--theme-button-font-weight: 500;
					filter: grayscale(100%);
				}
				.vertical-line{
					height: 48px;
					width: 1px;
					margin-left: 16px;
					background-color: #E1E1E1;
				}
				capitec-tooltip {
					display: none;
					height: 27px;
					--theme-tooltip-font-family: 'Hind Vadodara';
					--theme-tooltip-font-size: 14px;
					--theme-tooltip-line-height: 20px;
					--theme-tooltip-border-radius: 2px;
					--theme-layout-gap-spacing: 0px;
				}
				capitec-date-time-picker{
					width: 224px;
					margin-right: 12px;
					--theme-input-icon-top: 11px;
					--theme-input-font-size: 14px;
					--theme-modal-header-color: #3A3A3A;
					--theme-input-font-family: "Hind Vadodara";
					--theme-modal-header-background-color: #F7F7F7;
					--theme-date-time-picker-range-calendar-border: 0px;
					--theme-date-time-picker-medium-select-min-width: 224px;
				
				}
				.type-normal{
					--theme-chip-label-color: #3A3A3A;
					--theme-chip-background-color: #FFFFFF;
				}
				.type-selected{
					--theme-chip-label-color: #FFFFFF;
					--theme-chip-background-color: #009DE0;
					--theme-chip-font-weight: 600;
				}
				capitec-chip{
					margin: 4px;
				}
				
				/* Chip Bar Styles */
				.filter-bar {
					border-bottom: 0px;
					border-top: 1px solid rgb(225, 225, 225);
					--theme-actionbar-min-height: 48px;
					--theme-actionbar-padding-top: 8px
				}
				.filter-bar > capitec-label {
					height: 20px;
					width: auto;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 30px;
				}
				.filter-bar > capitec-button {
					height: 40px;
					margin: 0px;

					--theme-button-font-size : 14px;
					--theme-button-line-height: 10px;
					--theme-button-font-weight: 600;
				}
				.filter-bar > capitec-chip{
					margin: 4px 8px;
					--theme-chip-label-padding-left: 11px;
					--theme-chip-label-padding-right: 11px;
					--theme-chip-label-line-height: 19px;
				}
				horizon-no-results-search-screen {
					border-top: 1px solid #E1E1E1;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card 
				data-automation-id="budget-facility-list-view"
				class="card">
				<capitec-group layout="vertical" gap="line" halign="left" valign="top">
					<capitec-title-bar 
						data-automation-id="budget-facility-title"
						type="credit">
							<capitec-icon
								data-automation-id="budget-facility-back-button"
								size="medium"
								icon="system/arrow-left-white"
								@click="${() => this._back()}"
								class="left-arrow">
							</capitec-icon>
							<capitec-label label="Budget Facility" type="Title"></capitec-label>
							<capitec-spacer></capitec-spacer>
							<capitec-button
								class="add-budget-btn"
								icon="system/add-white"
								icon-placement="right"
								label="Add Budget Facility"
								@click="${() => this._openBudgetClick()}"
								?disabled="${!this.canOpenBudget}">
							</capitec-button>
						
							${this._renderAccountDetailsBar()}
				
					</capitec-title-bar>

					${this._renderFilterBar()}
					${this._renderFilterChipsBar()}
					
					<capitec-content-box class="${RENDER_CHIPS[FILTER_BY.TEXT] !== `` || RENDER_CHIPS[FILTER_BY.DATE] !== `` ? `budget-content` : ``}">
						${this.renderAlertBanner()}
						${this._renderSearchBar()}
						${this._renderErrorBanner()}
						${this._renderBudgetAccounts()}
					</capitec-content-box>
				</capitec-group>
			</capitec-card>
		`;
	}
	
	_renderAccountDetailsBar() {
		return html`
			<capitec-group class= "account-details-bar" layout="horizontal" gap="none" halign="left" valign="center">

				<horizon-label
					data-automation-id="budget-facility-credit-card-number"
					label="Credit card"
					value="${this.budgetFacilityAccounts.creditCardNumber}">
				</horizon-label>

				<horizon-label
					data-automation-id="budget-facility-total-budget-balance"
					label="Total budget balance"
					value="${formatCurrency(this.budgetFacilityAccounts.totalBudgetBalance)}">
				</horizon-label>

				<horizon-label
					data-automation-id="budget-facility-total-budget-installment"
					label="Total budget installment (monthly)"
					value="${formatCurrency(this.budgetFacilityAccounts.totalBudgetInstallmentAmount)}">
				</horizon-label>
			</capitec-group>
		`;
	}

	_renderFilterBar() {
		return html`
		<capitec-group class= "account-details-bar" layout="horizontal" gap="none" halign="left" valign="center">
			<capitec-search-field
				data-automation-id="budget-facility-search-filter"
				label="Search for amount or budget name" 
				value="${RENDER_CHIPS[FILTER_BY.TEXT]}"
				@key-input="${(event) => this._searchValueChange(event)}"
				@focusout="${(event) => this._focusOut(event)}">
			</capitec-search-field>
			
			<capitec-date-time-picker
				data-automation-id="budget-facility-date-range-filter"
				id="calendarRange"
				label="Choose a date range"
				startDate='${this.startDate}'
				endDate='${this.endDate}'
				maxDate="${new Date().toString()}"
				type="range"
				mode="date"
				inputType="calendar"
				outputType="string"
				.predefinedRanges="${this.getPredefinedDateRanges()}"
				@apply-clicked="${(e) => this._dateChanged(e)}">
			</capitec-date-time-picker>

			<capitec-chip 
				data-automation-id="budget-facility-active-status-filter"
				label="Active" 
				class="${this.filterByStatus === FILTER_BY_STATUS.ACTIVE ? `type-selected` : `type-normal`}" 
				@click="${(e) => this._statusValueChange(e)}">
			</capitec-chip>
			<capitec-chip 
				data-automation-id="budget-facility-settled-status-filter"
				label="Settled" 
				class="${this.filterByStatus === FILTER_BY_STATUS.SETTLED ? `type-selected` : `type-normal`}" 
				@click="${(e) => this._statusValueChange(e)}">
			</capitec-chip>
			<capitec-chip 
				data-automation-id="budget-facility-closed-status-filter"
				label="Closed" 
				class="${this.filterByStatus === FILTER_BY_STATUS.CLOSED ? `type-selected` : `type-normal`}" 
				@click="${(e) => this._statusValueChange(e)}">
			</capitec-chip>

		</capitec-group>
		`;
	}

	_renderErrorBanner() {
		return !this.canOpenBudget
		? html`
			<capitec-alert-banner
				type="error"
				header="Notify client:"
				label="${this.openBudgetDeclineReason}">
			</capitec-alert-banner>`
		: html``;
	}

	_renderFilterChipsBar() {
		if (RENDER_CHIPS[FILTER_BY.TEXT] !== `` || RENDER_CHIPS[FILTER_BY.DATE] !== ``) {
			return html`
				<capitec-action-bar
					id="active-filters"
					class="filter-bar"
					data-automation-id="budget-facility-active-filters-bar">
						<capitec-label label = "Active filters:"></capitec-label>
							${this._renderChip(FILTER_BY.TEXT)}
							${this._renderChip(FILTER_BY.DATE)}
						<capitec-button
							type="clear"
							label="Clear All"
							@click = "${() => this._clearAllFilters()}"
							data-automation-id="budget-facility-clear-all-filters">
						</capitec-button>
				</capitec-action-bar>
			`;
		}
	}

	_renderChip(type) {
		return !isNullorEmpty(RENDER_CHIPS[FILTER_BY[type]])
			? html`
				<capitec-chip
					data-automation-id="budget-facility-clear-filter-chip"
					id="${FILTER_BY[type]}"
					label="${RENDER_CHIPS[FILTER_BY[type]]}"
					@remove="${() => this._closeChip(FILTER_BY[type])}"
					closable>
				</capitec-chip>`
			: html``;
	}

	_renderBudgetAccounts() {
		let noOfBudgets = 0;
		Object.keys(this.filteredAccounts).forEach(term => {
			if (this.filteredAccounts[term].length > 0) {
				noOfBudgets++;
			}
		});

		return noOfBudgets
		? Object.entries(this.filteredAccounts).map(termGroup => {
			const [term, accountsList] = termGroup;
				return accountsList.length > 0 
				? html`
						<capitec-group class="accounts-group" layout="vertical" gap="none" halign="left" valign="center">
							<capitec-title-bar
								data-automation-id="budget-facility-term-group-header"
								class="term-header"
								type="default"
								label="${term} months">
							</capitec-title-bar>
							${accountsList.map(budgetAccount => this._renderBudgetAccountTile(budgetAccount))}
					</capitec-group>`
				: html``;
					})
		: html`<horizon-no-results-search-screen></horizon-no-results-search-screen>`;
	}

	_renderBudgetNameLabel(budgetAccount) {
		return html`
			<capitec-group id="budget-name-label"
				data-automation-id="budget-facility-account-name" 
				layout="vertical"
				@click="${() => this._accountDetails(budgetAccount)}">
					<capitec-label
						label="Budget Name">
					</capitec-label>
					<capitec-label id="short-budget-name-label-value" class="budget-name-label-value"
						label="${formatStringAsPascalCase(budgetAccount.budgetName)}"
						@mouseover=${(e) => this._displayTooltip(e)}>
					</capitec-label>
					<capitec-tooltip id="long-budget-name-tooltip" message="${formatStringAsPascalCase(budgetAccount.budgetName)}" position="bottom">
						<capitec-label class="budget-name-label-value"
							label="${formatStringAsPascalCase(budgetAccount.budgetName)}"
							@mouseover=${(e) => this._displayTooltip(e)}>
						</capitec-label>
					</capitec-tooltip>
			</capitec-group>`;
	}

	_renderBudgetAccountTile(budgetAccount) {
		return html`
			<capitec-group class="account-details-tile" layout="horizontal" gap="none" halign="left" valign="center">
				<capitec-icon
					data-automation-id="budget-facility-account-info"
					size="medium" 
					icon="system/info-action"
					@click="${() => this._accountDetails(budgetAccount)}">
				</capitec-icon>

				${this._renderBudgetNameLabel(budgetAccount)}

				<div class="vertical-line"></div>

				<horizon-label
					data-automation-id="budget-facility-monthly-repayment"
					label="Monthly repayment"
					value="${formatCurrency(budgetAccount.budgetInstalment)}">
				</horizon-label>

				<horizon-label
					data-automation-id="budget-facility-purchase-amount"
					label="Purchase amount"
					value="${formatCurrency(budgetAccount.originalAmount)}">
				</horizon-label>

				<horizon-label
					data-automation-id="budget-facility-outstanding-balance"
					label="Outstanding balance"
					value="${formatCurrency(budgetAccount.budgetBalance)}">
				</horizon-label>

				<horizon-label
					data-automation-id="budget-facility-status"
					label="Status"
					value="${formatStringAsPascalCase(budgetAccount.status)}">
				</horizon-label>

				<capitec-spacer></capitec-spacer> 
				
				<capitec-button
					data-automation-id="budget-facility-transfer-button"
					type="clear"
					label="Transfer"
					@click="${() => this._transferClick(budgetAccount)}"
					?disabled="${this.shouldDisable(`pay-budget`)}"
					?hidden="${this._checkBudgetStatusAndDisable(budgetAccount)}">
				</capitec-button>
			</capitec-group>`;
	}
}

customElements.define(`capitec-pc-budget-facility-accounts`, BudgetFacilityAccounts);

/**
 * When back arrow is clicked
 *
 * @example
 * <capitec-pc-budget-facility-accounts ... @back"${this._handler}"></capitec-pc-budget-facility-accounts>
 *
 * @event BudgetFacilityAccounts#back
 * @type {Object} N/A
 */

/**
 * When Account name or info icon is clicked
 *
 * @example
 * <capitec-pc-budget-facility-accounts ... @account-details"${this._handler}"></capitec-pc-budget-facility-accounts>
 *
 * @event BudgetFacilityAccounts#account-details
 * @type {Object} 
 * @property {Object} detail - Contains information on the clicked item
 * @property {String} detail.selectedAccountDetails - Selected budget facility account details
 */