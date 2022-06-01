import { Component, css, html, unsafeCSS } from 'platform/elements';

import 'app/components/common/HorizonLabel';
import { DATE_TYPE_LIST, DEFAULTS, MAX_RESULTS } from 'app/constants/PolicyTransactionHistory';
import { EXPANDER_LABEL, TABLE_EXPANDER_CELL } from 'app/css/PolicyTransactionHistory';
import { DateTime } from 'luxon';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';

//#region  CONSTANTS

const FILTER_BY = {
	ALL: `ALL`,
	DATE: `DATE`,
	DATE_TYPE: `DATE_TYPE`
};

const RENDER_CHIPS = {
	DATE: ``,
	DATE_TYPE: ``
};

const today = new Date();

//#endregion CONSTANTS

/**
 * Policy Transaction History component that displays Policy transactions
 * 
 * Events Raised
 * -------------
 * navigate-back
 * unloading
 * _dateChanged
 * _scrollToTop
 * _filterByDateType
 *  
 * @export
 * @class PolicyTransactionHistory
 * @extends {Component}
 */
class PolicyTransactionHistory extends Component{

	//#region INITIALIZATION

	constructor()
	{
		super();

		this.dateLabel = DEFAULTS.DATE_LABEL;

		this.startDate = ``;
		this.endDate = ``;

		this.policyTransactionHistory = [];
		this.filteredData = [];
		this.isBusy = false;
		this.hideLoadMore = true;

		this.dateTypeOptions = DATE_TYPE_LIST;
	}

	//#endregion INITIALIZATION

	//#region PROPERTIES

	/**
	 * Callback for rendering transaction details used by {@link PolicyTransactionHistory}.
	 * 
	 * @callback RenderTransactionDetails
	 * @param {Object} [item] Current item for which transaction details to be rendered
	 * 
	 * @returns {html} Transaction details response, expander content
	 */

	/**
	 * @property {String} dateLabel - Default label for Date Type dropdown
	 * @property {String} startDate - String holds Start date of transaction/due date 
	 * @property {String} endDate - String holds End date of transaction/due date
	 * @property {Object} filteredData - Object holds filtered transaction data
	 * @property {Object} policyTransactionHistory - Object holds transaction data
	 * @property {Function} getPolicyTransactionHistory Callback function to fetch more data
	 * @property {Function} disposeData Callback function to clear transaction history data variable
	 * @property {Boolean} hideLoadMore Show/Hide Load More button
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			dateLabel: { type: String, state: true },
			startDate: { type: String, state: true },
			endDate: { type: String, state: true },
			filteredData: { type: Object, state: true },
			policyTransactionHistory: { type: Object },
			getPolicyTransactionHistory: { type: Object },
			disposeData: { type: Object },
			hideLoadMore: { type: Boolean, state: true },
			isBusy: { state: true },
		};
	}

	//#endregion PROPERTIES

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	 static get styles() {
		return [
			super.styles,
			css`
				.transaction-card {
					height: auto;
					width: 1066px;
					background-color: #FFFFFF;
					box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				.transaction-card > capitec-group:first-child {
					--theme-layout-gap-spacing: 0px;
				}

				/* Header Styles */
				.transaction-history-title {
					width: var(--horizon-center-panel-width, 1064px);
					border-bottom: 0px;
					border-radius: 4px 4px 0 0;
					padding: 11px 24px 11px 15px;

					--theme-label-font-color: #FFFFFF;
				}
				.transact {
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
				}
				.lbb {
					background: no-repeat url(../images/liveBetter/Gradient1.png);
				}
				.transaction-history-title > img {
					width: 26px;
					margin-right: 10px;
					cursor: pointer;
				}

				/* Header Details Bar styles */
				.actionbar-header {
					height: 64px;
					width: var(--horizon-center-panel-width, 1064px);
					border-bottom: 0px;
					padding: 11px 24px 11px 43px;
				}
				.actionbar-header > horizon-label {
					width: 156px;
					height: 100%;
					padding: 0px 0px 0px 16px;
				
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-value-color: #FFFFFF;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}
				.actionbar-header > horizon-label[label="Account Number"] {
					width: 174px;
				}
				.actionbar-header > horizon-label[label="Interest"] {
					width: 120px;
				}

				/* Filter Bar styles */
				.transaction-action-bar {
					height: 64px;
					width: var(--horizon-center-panel-width, 1064px);
					padding: 10px 10px;
				}
				.transaction-action-bar > capitec-text-field {
					height: 47px;
					width: 388px;
					padding-left: 8px;
				
					--theme-label-font-color: #3A3A3A;
					--theme-input-label-font-size: 16px;
					--theme-layout-gap-spacing: 8px; 
					--theme-input-clear-icon-height: 0px;
					--theme-input-clear-icon-width: 0px;
				}
				.cb-datepicker {
					height: 48px;
					width: 201px;
					margin-right: 8px;
					border-radius: 5px;
					border: 1px solid #E1E1E1;
					cursor: pointer;
				}

				/* Chip Bar Styles */
				.filter-bar {
					--theme-actionbar-min-height: 48px;
					--theme-actionbar-padding: 8px 0px 8px 16px;
				}
				.filter-bar > capitec-label {
					height: 20px;
					width: 87px;
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
				
				/* Main View Styles */
				.main-view {
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-layout-gap-line-color: 0px;
					height: 661px;
					width: auto;
				}
				capitec-table{
					width: var(--horizon-center-panel-width, 1064px);
					height: auto;
					--theme-icon-size-default: 8px;
					--theme-data-table-body-group-font-weight: 600;
					--theme-data-table-font-size : 15px;
					--theme-data-table-padding-left: 16px;
					--theme-data-table-body-group-color: #3A3A3A;
					--theme-data-table-font-color: #3A3A3A;
					--theme-data-table-padding-right: 16px;
					--theme-data-table-padding-top: 11px;
					--theme-data-table-padding-bottom: 11px;
					--theme-data-table-expander-size: 12px;
					--theme-data-table-footer-border: 0px;
					--theme-data-table-expander-size: 24px;
					--theme-data-table-header-font-weight: 600;

				}

				/* Modal Calendar Styles */

				div[slot="body"] {
					display: flex;
				}

				.load-more-bar{
					--theme-actionbar-min-height: 48px;
					padding-top : 0px;
					padding-bottom: 0px; 
					--theme-actionbar-background: #f4f4f4;
				}
				.transaction-status-select{
					--theme-input-label-font-size: 16px;
					--theme-input-padding-bottom: 13px;
					--theme-select-options-max-height: 308px;
					--theme-input-font-size: 16px;
					--theme-input-label-font-color: #3A3A3A;
					--theme-input-font-weight: 400;
					--theme-input-icon-top: 8px;
					line-height: 30px;
					width: 224px;
				}
				.scroll-top {
					--theme-icon-size-medium: 26px;
					padding-top: 12px;
					cursor: pointer;
				}
				capitec-date-time-picker{
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-date-time-picker-range-calendar-border: 0px;
					margin-right: 8px;
					width: 280px;
				}
				.transaction-action-bar > capitec-chip{
					margin: 0px 8px;
					--theme-chip-label-padding-left: 11px;
					--theme-chip-label-padding-right: 11px;
					--theme-chip-label-line-height: 19px;
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
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.no-result-group {
					width: 1062px;
					margin-top: 130px;
				}
			`
		];
	}	

	//#region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();

		// Making sure no baggage is carried from the previous instance.
		RENDER_CHIPS[FILTER_BY.DATE] = ``;
		RENDER_CHIPS[FILTER_BY.DATE_TYPE] = this.dateTypeOptions[1].text;

		this.filteredData = this.policyTransactionHistory;
		this.hideLoadMore = this.policyTransactionHistory.length % MAX_RESULTS > 0 
			&& this.policyTransactionHistory.length % MAX_RESULTS < MAX_RESULTS;
	}

	/**
	 * call unload event once the component removed from the DOM.
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();

		this._unloading();
	}

	//#endregion LIFECYCLE OVERRIDES

	//#region EVENTS

	/**
	 * unload the policy transactions
	 */
	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	/**
	 * Navigate back to Policy summary page
	 */
	_backToSummaryPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, {
			detail: {
			}
		}));
	}

	/**
	 * filter transactions when date is changed
	 * @param {*} e 
	 */
	async _dateChanged(e) {
		let fromDate = DateTime.fromISO(e.detail.new.startDate === null ? e.detail.old.startDate : e.detail.new.startDate);
		let toDate = DateTime.fromISO(e.detail.new.endDate === null ? e.detail.old.endDate : e.detail.new.endDate);
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
		} else if (e.detail.new.endDate === null && this.endDate === ``) {
			this.startDate = fromDate;
			toDate = fromDate.plus({ days: 90 });
			if (toDate.diff(currentDateTime, [`days`]).days > 0) {
				this.endDate = currentDateTime;
			} else {
				this.endDate = toDate;
			}
		} else if (e.detail.new.startDate === null && this.startDate === ``) {
			this.endDate = toDate;
			fromDate = toDate.minus({ days: 90 });
			this.startDate = fromDate;
		} else {
			
			this.startDate = fromDate;
			this.endDate = toDate;
		}

		RENDER_CHIPS[FILTER_BY.DATE] = this._getDateRange();
		
		await this._refineSearch();
	}

	/**
	 * scroll to top of transactions table
	 * @param {*} e 
	 */
	_scrollToTop(e) {
		const element = this.shadowRoot.getElementById(`policy-transactions-table`);
		element.scrollTop = 0;
	}

	/**
	 * filter transactions when date type is changed
	 * @param {*} event 
	 */
	_filterByDateType(event) {

		RENDER_CHIPS[FILTER_BY.DATE_TYPE] = event.detail.new.text;

		this._refineSearch();
	}

	//#endregion EVENTS

	//#region PRIVATE FUNCTIONS

	/**
	 * 
	 * Entry point for rendering the component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
		`;
	}

	/**
	 * Render content of the component
	 * @returns {html} The html content of the header, filter, transactions table and footer.
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}" />
			<capitec-label label="Transaction History" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
		</capitec-title-bar>
		<capitec-card style="min-height: 100vh;">
			<capitec-group layout="vertical" gap="line" halign="left" valign="top">
				${this._renderActionBar()}
				${this._renderFilterBar()}
				<capitec-content-box class="main-view" id="policy-transactions-table">
					${this._renderPolicyTransactionHistory()}
				</capitec-content-box>
				${this._renderFooter()}
			</capitec-group>
		</capitec-card>
		${this._renderLoadingIndicator()}
		`
	}

	/**
	 * Render Action Bar
	 * @returns {html} The html of the date type and date controls
	 */
	_renderActionBar() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="transaction-action-bar">
				<capitec-select
					label="${RENDER_CHIPS[FILTER_BY.DATE_TYPE] !== `` ? `` : this.dateLabel}" 
					class="transaction-status-select"
					.items="${this.dateTypeOptions}"
					@focus="${(e) => this.datelabel = ``}"
					display-field="text"
					id-field="code"
					@value-change = "${(e) => this._filterByDateType(e)}"
					value = "${RENDER_CHIPS[FILTER_BY.DATE_TYPE]}"
					hint=""
					data-automation-id="transaction-status-filter">
				</capitec-select>

				<capitec-date-time-picker
					id="calendarRange"
					label = "Choose a date (up to 90 days)"
					startDate="${this.startDate === `dd mm yyyy` ? `` : this.startDate}"
					endDate="${this.endDate === `dd mm yyyy` ? `` : this.endDate}"
					maxDate="${new Date().toString()}"
					type="range"
					mode="date"
					inputType="calendar"
					outputType="string"
					.predefinedRanges="${this.getPredefinedDateRanges()}"
					@apply-clicked="${(e) => this._dateChanged(e)}"
					data-automation-id="transaction-history-date-filter">
				</capitec-date-time-picker>
				<capitec-spacer></capitec-spacer>
				<horizon-label
					label="Contract Reference"
					value="CFXXXX"
					data-automation-id="policy-contract-reference-value">
				</horizon-label>
			</capitec-group>
		`;
	}

	/**
	 * Show clear/clear all filters
	 * @returns {html} The html of Clear and Clear All filters
	 */
	_renderFilterBar() {
		if (RENDER_CHIPS[FILTER_BY.DATE] !== ``) {
			return html`
				<capitec-action-bar
					id="active-filters"
					class="filter-bar"
					data-automation-id="transaction-history-active-filters">
						<capitec-label label = "Active filters:"></capitec-label>
							${this._renderDateChip()}
						<capitec-button
							type="clear"
							label="Clear All"
							@click = "${() => this._clearFilters()}"
							data-automation-id="transaction-history-clear-active-filters">
						</capitec-button>
				</capitec-action-bar>
			`;
		}
	}

	/**
	 * Clear Date filter
	 * @returns {html} Render Date chip 
	 */
	_renderDateChip() {
		return !isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE])
			? html`
			<capitec-chip
				id="${FILTER_BY.DATE}"
				label="${RENDER_CHIPS[FILTER_BY.DATE]}"
				@remove="${() => this._closeChip(FILTER_BY.DATE)}"
				closable>
			</capitec-chip>`
			: html``;
	}

	/**
	 * Clear Date Type filter
	 * @returns {html} Render Date Type chip
	 */
	_renderDateTypeChip() {
		return !isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE_TYPE])
			? html`
				<capitec-chip
					id="${FILTER_BY.DATE_TYPE}"
					label="${RENDER_CHIPS[FILTER_BY.DATE_TYPE]}"
					@remove="${() => this._closeChip(FILTER_BY.DATE_TYPE)}"
					closable>
				</capitec-chip>`
			: html``;
	}

	/**
	 * Clear all filters
	 */
	_clearFilters() {
		const activeFilters = this.shadowRoot.getElementById(`active-filters`);

		Array.from(activeFilters.children)
			 .filter(field => field.localName === `capitec-chip` && !field.hidden)
			 .forEach(item => {
				 this._clearFilter(item.id);
			 });

		this._refineSearch();
	}

	/**
	 * Clear filter by criteria type
	 * @param {*} type - filter type
	 */
	_clearFilter(type) {
		const date = () => this._reset();
		const dateType = () => { 
			this.dateLabel = DEFAULTS.DATE_LABEL; 
		};
		
		const resetForfilters = {
			'DATE': date,
			'DATE_TYPE': dateType
		};

		RENDER_CHIPS[type] = ``;
		if (resetForfilters[type]) {
			resetForfilters[type]();
		}
	}

	/**
	 * close specified chip
	 * @param {*} type - filter type 
	 */
	async _closeChip(type) {
		this._clearFilter(type);
		this._refineSearch();
	}

	/**
	 * reset all filters and load transactions
	 */
	async _reset() {
		if (isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE])) {
			this.startDate = ``;
			this.endDate = ``;

			const calendar = this.shadowRoot.querySelector(`#calendarRange`);
			if (calendar) {
				calendar._placeholderEndDate = null;
				calendar._placeholderStartDate = null;
			}
			await this._refineSearch();
		}
	}

	/**
	 * Render policy transactions
	 * @returns {html} - content of transactions
	 */
	_renderPolicyTransactionHistory() {
		return this.filteredData?.length > 0 
		? html`
			<capitec-table
				.items = "${this.filteredData}"
				groupField="groupByPremiumDate"
				displayMode="Full"
				?fixed = "${true}"
				.expandRenderer="${(item) => this._renderTransactionDetails(item)}"
				data-automation-id="transaction-history-table">
					${this._renderPolicyTransHistoryColumns()}
			</capitec-table>`
		: html`
			${this._renderNoResults()}
		`;
	}

	/**
	 * render transaction details of each transaction
	 * @param {*} item - transaction item
	 * @returns 
	 */
	_renderTransactionDetails(item) {
		return html`
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
				label="Bank Details"
				data-automation-id="policy-transaction-history-bank-details">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Account Name"
					value = "${item.bankDetails.accountName ? item.bankDetails.accountName : `-`}"
					data-automation-id="policy-transaction-history-account-name">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Account Number"
					value = "${item.bankDetails.accountNumber ? item.bankDetails.accountNumber : `-`}"
					data-automation-id="policy-transaction-history-account-number">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Bank" 
					value = "${item.bankDetails.bank}"
					data-automation-id="policy-transaction-history-bank">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Branch Code"
					value = "${item.bankDetails.branchCode}"
					data-automation-id="policy-transaction-history-branch-code">
				</horizon-label>
			</capitec-group>
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Account Type"
					value = "${item.bankDetails.accountType}"
					data-automation-id="policy-transaction-history-account-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Collection Day"
					value = "${item.bankDetails.collectionDay}"
					data-automation-id="policy-transaction-history-collection-day">
				</horizon-label>
			</capitec-group>
		`;
	}

	/**
	 * render transaction history columns
	 * @returns {html} - table columns
	 */
	_renderPolicyTransHistoryColumns() {
		return html`
			<capitec-table-column
				label="Premium Due Date"
				field="premiumDueDate"
				type="date">
			</capitec-table-column>
			<capitec-table-column
				label="Premium"
				field="formatedPremium"
				type="currency">
			</capitec-table-column>
			<capitec-table-column
				label="Type"
				field="type">
			</capitec-table-column>
			<capitec-table-column
				label="Date"
				field="date"
				type="date">
			</capitec-table-column>
			<capitec-table-column
				label="Amount"
				field="formatedAmount"
				type="currency">
			</capitec-table-column>
			<capitec-table-column
				label="Reason"
				field="reason">
			</capitec-table-column>
		`;
	}

	/**
	 * Show message when there are no records
	 * @returns {html} - message for no results
	 */
	_renderNoResults() {
		return html`
			<capitec-group
				class="no-result-group"
				layout="vertical"
				halign="center"
				valign="center"
				gap="none">
					<img
						src="platform/illustrations/history.svg"
						class="document-icon"/>
					<capitec-label
						class="no-results"
						label="No results found"
						type="strong">
					</capitec-label>
					<capitec-label
						label="No policy transactions made in the last 6 months"
						type="strong">
					</capitec-label>
			</capitec-group>
		`;
	}

	/**
	 * Show load more feature in the footer
	 * @returns {html} - content of footer
	 */
	_renderFooter() {
		return html`
			<capitec-action-bar class="load-more-bar" ?hidden="${this.hideLoadMore || this.policyTransactionHistory.length === 0}">
				<capitec-spacer></capitec-spacer>
				<capitec-button
					type="clear"
					label="Load More"
					@click = ${() => this._loadMoreTransactions()}
					data-automation-id="policy-transaction-history-load-more">
				</capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-icon
					class='scroll-top'
					size="medium"
					icon="system/arrow-up-action"
					@click = ${(e) => this._scrollToTop(e)}
					data-automation-id="policy-transaction-history-scroll-top">
				</capitec-icon>
			</capitec-action-bar>`;
	}

	/**
	 * Show loading indicator when screen is busy
	 * @returns {html} - loading indicator
	 */
	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}

	/**
	 * Get Predefined date ranges
	 * @returns - {Object} - date ranges array object
	 */
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

	/**
	 * format the give date
	 * @param {*} date - date to be formatted 
	 * @returns 
	 */
	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	/**
	 * Get selected date range
	 * @returns {string} - fromdate to todate
	 */
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

	/**
	 * load more transaction when clicked on load more button
	 */
	async _loadMoreTransactions() {
		const oldCount = this.policyTransactionHistory.length;
		const startDate = this.startDate.toLocaleString().slice(0, 10);
		const endDate = this.endDate.toLocaleString().slice(0, 10);

		await this.getPolicyTransactionHistory(startDate, endDate, this.policyTransactionHistory.length);

		// If the old record count and count after load more are same means no more data to populate,
		// so hiding loadmore button
		if (oldCount === this.policyTransactionHistory.length) {
			this.hideLoadMore = true;
		} else {
			this.hideLoadMore = this.policyTransactionHistory.length % MAX_RESULTS > 0 && this.policyTransactionHistory.length % MAX_RESULTS < MAX_RESULTS;
		}
		this._refineSearch();
	}

	/**
	 * filter the transactions
	 */
	_refineSearch() {

		this.filteredData = this.policyTransactionHistory;

		if (RENDER_CHIPS[FILTER_BY.DATE]) {
			const startDate = new Date(Date.parse(this.startDate));
			const endDate = new Date(Date.parse(this.endDate));

			if(RENDER_CHIPS[FILTER_BY.DATE_TYPE] == this.dateTypeOptions[0].text)
				this.filteredData = this.filteredData.filter(
					item => new Date(item.date) >= startDate && new Date(item.date) <= endDate); 
			else if(RENDER_CHIPS[FILTER_BY.DATE_TYPE] == this.dateTypeOptions[1].text)
				this.filteredData = this.filteredData.filter(
					item => new Date(item.premiumDueDate) >= startDate && new Date(item.premiumDueDate) <= endDate); 
		}

		this.requestUpdate();
	}

	//#endregion PRIVATE FUNCTIONS
}

window.customElements.define(`horizon-insure-policy-transaction-history`, PolicyTransactionHistory);

/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-insure-policy-transaction-history 
			...	@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}..."
 *
 * @event PolicyTransactionHistory#navigate-back
 * @type {Object} - N/A
 */

/**
 * When page is unloaded, clear policytransactionhistory objects
 *
 * @example
 * <horizon-insure-policy-transaction-history 
			...	@unloading="${() => this._unloadPolicyTransactionHistory()}"...>
			</horizon-insure-policy-transaction-history>
 *
 * @event PolicyTransactionHistory#unloading
 * @type {Object} - N/A
 */

/**
 * Filter the policy transactions when date is changed
 *
 * @example
 * <capitec-date-time-picker
				...	@apply-clicked="${(e) => this._dateChanged(e)}"...</capitec-date-time-picker>
 *
 * @event PolicyTransactionHistory#_dateChanged
 * @type {Object} - event
 */

/**
 * Scroll to top of the page when arrow up action image is clicked
 *
 * @example
*  <capitec-icon ... @click = ${(e) => this._scrollToTop(e)} ... </capitec-icon>
 *
 * @event PolicyTransactionHistory#_scrollToTop
 * @type {Object} - event
 */

/**
 * Filter the policy transactions when date type is changed
 *
 * @example
				<capitec-select
				...	@value-change = "${(e) => this._filterByDateType(e)}" ...</capitec-select>
 *
 * @event PolicyTransactionHistory#_filterByDateType
 * @type {Object} - event
 */