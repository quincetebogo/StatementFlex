import { Component, css, html, unsafeCSS } from 'platform/elements';
import { EXPANDER_LABEL, STATUS_TAG, TABLE_EXPANDER_CELL } from 'app/css/TransactionHistory';
import { formatCurrency, getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { DateTime } from 'luxon';

const FILTER_BY = {
	ALL: `ALL`,
	TEXT: `TEXT`,
	DATE: `DATE`,
	STATUS: `STATUS`
};

const RENDER_CHIPS = {
	TEXT: ``,
	DATE: ``,
	STATUS: ``
};

const TRANSACTION_STATUS_LIST = [
	`Fee`,
	`Financial`,
	`Non Financial`,
	`Processing`,
	`Reversed`
];

const DEFAULTS = {
	SEARCH_TEXT_LABEL: `Search for amount or transaction name`,
	STATUS_LABEL: `Transaction status`,
	DATE_FORMAT: `dd mm yyyy`
};

const MAX_RESULTS = 50;
const today = new Date();

/**
 * Transaction History screen is to display the list of transactions of a client.
 *
 * Events Raised
 * -------------
 * back 
 *
 * @export
 * @class TransactionHistory
 * @extends {Component}
 */

export class TransactionHistory extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.transactionHistory = [];
		this.accountDetails = {};

		// private properites
		this.isBusy = false;
		this.hideLoadMore = true;

		this.startDate = ``;
		this.endDate = ``;

		this.filteredData = [];
		this.searchTextLabel = DEFAULTS.SEARCH_TEXT_LABEL;
		this.statuslabel = DEFAULTS.STATUS_LABEL;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {Object} transactionHistory Has list of client's transactions
	 * @property {Object} accountDetails client's savings account info
	 * @property {String} cifNumber client's cif number
	 * @property {Function} getTransactionHistory Callback function to fetch more data
	 * @property {Function} disposeData Callback function to clear transaction history data variable
	 * 
	 * @readonly
	 * @static
	 * @memberof TransactionHistory
	 */

	static get properties() {
		return {
			transactionHistory: { type: Object },
			accountDetails: { type: Object },
			cifNumber: { type: String },
			getTransactionHistory: { type: Object },
			disposeData: { type: Object },

			filteredData: { state: true },
			isBusy: { state: true },
			startDate: { state: true },
			endDate: { state: true },
			searchTextLabel: { state: true },
			statuslabel: { state: true },
			hideLoadMore: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.filteredData = this.transactionHistory;
		this.hideLoadMore = this.transactionHistory.length % MAX_RESULTS > 0 && this.transactionHistory.length % MAX_RESULTS < MAX_RESULTS;
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._unloading();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_searchTextChange(event) {
		RENDER_CHIPS[FILTER_BY.TEXT] = event.detail.new;
		this._refineSearch();
	}

	_searchTextBlur(e) {
		this.searchTextLabel = isNullorEmpty(RENDER_CHIPS[FILTER_BY.TEXT]) ? DEFAULTS.SEARCH_TEXT_LABEL : ``;
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

	// To hide or show the label for the select field according to the design requirement.
	_statusFocussed(e) {
		this.statuslabel = ``;
	}

	async _dateChanged(e) {
		let fromDate = DateTime.fromISO(e.detail.new.startDate);
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
		await this._loadFilteredTransactions();
		this._refineSearch();
	}

	async _loadFilteredTransactions() {
		const startDate = this.startDate.toLocaleString().slice(0, 10);
		const endDate = this.endDate.toLocaleString().slice(0, 10);

		this.disposeData();
		await this.getTransactionHistory(startDate, endDate);

		this.hideLoadMore = this.transactionHistory.length % MAX_RESULTS > 0 && this.transactionHistory.length % MAX_RESULTS < MAX_RESULTS;
	}

	_filterByStatus(event) {
		RENDER_CHIPS[FILTER_BY.STATUS] = event.detail.new;
		this._refineSearch();
	}

	_closeChip(type) {
		this._clearFilter(type);
		this._refineSearch();
	}

	_clearFilters() {
		const activeFilters = this.shadowRoot.getElementById(`active-filters`);
		Array.from(activeFilters.children)
			 .filter(field => field.localName === `capitec-chip` && !field.hidden)
			 .forEach(item => {
				 this._clearFilter(item.id);
			 });

		this._refineSearch();
	}

	// To scroll the content of the Table to the Top when scroll to Top button is clicked
	_scrollToTop(e) {
		const element = this.shadowRoot.getElementById(`transactions-table`);
		element.scrollTop = 0;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_errorHandler(exception) {
		this.dispatchEvent(new CustomEvent(`error-handler`, {}));
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// To set the values to default on closing the chip or clearing all the filters
	async _reset() {
		if (isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE])) {
			this.startDate = ``;
			this.endDate = ``;

			const calendar = this.shadowRoot.querySelector(`#calendarRange`);
			if (calendar) {
				calendar._placeholderEndDate = null;
				calendar._placeholderStartDate = null;
			}
			await this._loadFilteredTransactions();
		}
	}

	async _loadMoreTransactions() {
		const oldCount = this.transactionHistory.length;

		await this.getTransactionHistory(this.startDate, this.endDate, this.transactionHistory.length + 1);

		// If the old record count and count after load more are same means no more data to populate,
		// so hiding loadmore button
		if (oldCount === this.transactionHistory.length) {
			this.hideLoadMore = true;
		} else {
			this.hideLoadMore = this.transactionHistory.length % MAX_RESULTS > 0 && this.transactionHistory.length % MAX_RESULTS < MAX_RESULTS;
		}
		this._refineSearch();
	}

	_refineSearch() {
		// Assigning the raw data before performing the filter
		this.filteredData = this.transactionHistory;

		if (RENDER_CHIPS[FILTER_BY.TEXT]) {
			const searchText = RENDER_CHIPS[FILTER_BY.TEXT].split(` `);

			const searchTextResult = searchText.map(key => {
				if (key !== ``) {
					if (key.startsWith(`-`)) {
						return this.filteredData.filter(item => parseFloat(item.amount).toFixed(2).startsWith(key));
					}
					return this.filteredData.filter(item => item.description.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
															parseFloat(item.amount).toFixed(2).startsWith(key) ||
															(parseFloat(item.amount) * -1).toFixed(2).startsWith(key));
				}
				return [];
			});
			this.filteredData = Array.from(new Set([...searchTextResult.flat()]));
		}

		if (RENDER_CHIPS[FILTER_BY.DATE]) {
			const startDate = new Date(Date.parse(this.startDate));
			const endDate = new Date(Date.parse(this.endDate));

			this.filteredData = this.filteredData.filter(item => item.tranDate >= startDate && item.tranDate <= endDate); 
		}

		if (RENDER_CHIPS[FILTER_BY.STATUS]) {
			const status = RENDER_CHIPS[FILTER_BY.STATUS];

			this.filteredData = this.filteredData.filter(item => item.transactionStatus === status);
		}
		this.requestUpdate();
	}

	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	_getDateRange() {
		const fromDate = !this.startDate ? DEFAULTS.DATE_FORMAT : this._formatDate(this.startDate);
		const toDate = !this.endDate ? DEFAULTS.DATE_FORMAT : this._formatDate(this.endDate);
		return `${fromDate} - ${toDate}`;
	}

	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	_clearFilter(type) {
		const text = () => this._clearTextFilter();
		const date = () => this._reset();
		const status = () => { 
			this.statuslabel = DEFAULTS.STATUS_LABEL; 
		};
		
		const resetForfilters = {
			'DATE': date,
			'TEXT': text,
			'STATUS': status
		};

		RENDER_CHIPS[type] = ``;
		if (resetForfilters[type]) {
			resetForfilters[type]();
		}
	}

	_clearTextFilter() {
		this.searchTextLabel = DEFAULTS.SEARCH_TEXT_LABEL;

		const searchTextField = this.shadowRoot.getElementById(`text-filter`);
		searchTextField.clearVisible = false;
	}

	// ---------
	// RENDERING
	// ---------

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
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
				}
				.transaction-history-title > img {
					width: 26px;
					margin-right: 10px;
					cursor: pointer;
				}

				/* Account Details Bar styles */
				.actionbar-header {
					height: 64px;
					width: var(--horizon-center-panel-width, 1064px);
					border-bottom: 0px;
					padding: 11px 24px 11px 43px;
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
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
				}
				.transaction-action-bar > capitec-text-field {
					height: 47px;
					width: 388px;
					padding-left: 8px;
				
					--theme-label-font-color: #3A3A3A;
					--theme-input-label-font-size: 16px;
					--theme-layout-gap-spacing: 8px;
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
					font-weight: 500;
					letter-spacing: 0;
					line-height: 30px;
				}
				.filter-bar > capitec-button {
					height: 40px;
					margin: 0px;

					--theme-button-font-size : 14px;
					--theme-button-line-height: 10px;
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
					--theme-data-table-body-group-font-weight: 600;
					--theme-data-table-font-size : 15px;
					--theme-data-table-padding-left: 16px;
					--theme-data-table-body-group-color: #3A3A3A;
					--theme-data-table-font-color: #3A3A3A;
					--theme-data-table-padding-right: 16px;
					--theme-data-table-padding-top: 9px;
					--theme-data-table-padding-bottom: 9px;
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
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="transaction-card">
				<capitec-group layout="vertical" gap="line" halign="left" valign="top">
					${this._renderTitleBar()}
					${this._renderAccountDetailsBar()}
					${this._renderActionBar()}
					${this._renderFilterBar()}
						<capitec-content-box class="main-view" id="transactions-table">
							${this._renderTransactionHistory()}
						</capitec-content-box>
						${this._renderFooter()}
				</capitec-group>
			</capitec-card>
			${this._renderLoadingIndicator()}
		`;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="transaction-history-title" type="transact">
				<capitec-image
					alt="back"
					src="/images/insure/left-arrow.svg"
					@click="${() => this._back()}"
					data-automation-id="transaction-history-back">
				</capitec-image>
				<capitec-label 
					label="Transaction History"
					type="title">
				</capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderAccountDetailsBar() {
		return html`
			<capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">
				<horizon-label
					label="Account number"
					value="${this.accountDetails.accountNumber}"
					data-automation-id="transaction-history-acc-number">
				</horizon-label>
				<horizon-label
					label="Balance"
					value="${formatCurrency(this.accountDetails.balance)}"
					data-automation-id="transaction-history-acc-bal">
				</horizon-label>
				<horizon-label
					label="Available balance"
					value="${formatCurrency(this.accountDetails.availableBalance)}"
					data-automation-id="transaction-history-available-bal">
				</horizon-label>
				<horizon-label
					label="Pending amount"
					value="${formatCurrency(this.accountDetails.pendingAmount)}"
					data-automation-id="transaction-history-pending-amount">
				</horizon-label>
				<horizon-label
					label="Interest"
					value="${this.accountDetails.interest}%"
					data-automation-id="transaction-history-acc-interest">
				</horizon-label>
				<horizon-label
					label="Status"
					value="${this.accountDetails.status}"
					data-automation-id="transaction-history-acc-status">
				</horizon-label>
			</capitec-group>
		`;
	}

	_renderActionBar() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="transaction-action-bar">
				<capitec-text-field
					id="text-filter"
					label=${this.searchTextLabel}
					type="search"
					keyboardMode="alpha-numeric"
					@key-input="${(e) => this._searchTextChange(e)}"
					@value-change="${(e) => this._searchTextChange(e)}"
					@focus="${(e) => this.searchTextLabel = ``}"
					@blur="${(e) => this._searchTextBlur(e)}"
					value="${RENDER_CHIPS[FILTER_BY.TEXT]}"
					data-automation-id="transaction-history-text-filter">
				</capitec-text-field>
				<capitec-date-time-picker
					id="calendarRange"
					label = "Choose a date (up to 90 days)"
					startDate='${this.startDate}'
					endDate='${this.endDate}'
					maxDate="${new Date().toString()}"
					type="range"
					mode="date"
					inputType="calendar"
					outputType="string"
					.predefinedRanges="${this.getPredefinedDateRanges()}"
					@apply-clicked="${(e) => this._dateChanged(e)}"
					data-automation-id="transaction-history-date-filter">
				</capitec-date-time-picker>
				<capitec-select
					label="${RENDER_CHIPS[FILTER_BY.STATUS] !== `` ? `` : this.statuslabel}" 
					class="transaction-status-select"
					.items="${TRANSACTION_STATUS_LIST}"
					@focus="${(e) => this._statusFocussed(e)}"
					@value-change = "${(e) => this._filterByStatus(e)}"
					value = ${RENDER_CHIPS[FILTER_BY.STATUS]}
					hint=""
					data-automation-id="transaction-status-filter">
				</capitec-select>
			</capitec-group>
		`;
	}

	_renderFilterBar() {
		if (RENDER_CHIPS[FILTER_BY.TEXT] !== `` || RENDER_CHIPS[FILTER_BY.DATE] !== `` || RENDER_CHIPS[FILTER_BY.STATUS] !== ``) {
			return html`
				<capitec-action-bar
					id="active-filters"
					class="filter-bar"
					data-automation-id="transaction-history-active-filters">
						<capitec-label label = "Active filters:"></capitec-label>
						${this._renderTextChip()}
						${this._renderDateChip()}
						${this._renderStatusChip()}
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

	_renderTextChip() {
		return !isNullorEmpty(RENDER_CHIPS[FILTER_BY.TEXT])
			? html`
				<capitec-chip
					id="${FILTER_BY.TEXT}"
					label="${RENDER_CHIPS[FILTER_BY.TEXT]}"
					@remove="${() => this._closeChip(FILTER_BY.TEXT)}"
					closable>
				</capitec-chip>`
			: html``;
	}

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

	_renderStatusChip() {
		return !isNullorEmpty(RENDER_CHIPS[FILTER_BY.STATUS])
			? html`
				<capitec-chip
					id="${FILTER_BY.STATUS}"
					label="${RENDER_CHIPS[FILTER_BY.STATUS]}"
					@remove="${() => this._closeChip(FILTER_BY.STATUS)}"
					closable>
				</capitec-chip>`
			: html``;
	}

	_renderTransactionHistory() {
		return html`
			<capitec-table
				.items = "${this.filteredData}"
				groupField="groupByItem"
				displayMode="Full"
				expandable="right"
				?fixed="${true}"
				.expandRenderer="${(item) => this._renderExpander(item)}"
				data-automation-id="transaction-history-table">
					<capitec-table-column label="Transaction Date" field="transactionDate" type="date" size="156px;"></capitec-table-column>
					<capitec-table-column label="Description" field="description" size="410px;"></capitec-table-column>
					<capitec-table-column label="Transaction Status" field="transactionStatus" size="144px;"
					.renderer="${(item, fieldName, value) => this._renderTransactionStatus(value)}">
					</capitec-table-column>
					<capitec-table-column label="Amount" field="formatedAmount" size="158px;" type="currency"></capitec-table-column>
					<capitec-table-column label="Balance" field="formatedBalance" size="130px;" type="currency" align ="right"></capitec-table-column>
			</capitec-table>
		`;
	}

	_renderTransactionStatus(value) {
		return value === `Processed`
			? html``
			: html`
				<div style="${unsafeCSS(STATUS_TAG.tagContainer)} ${unsafeCSS(STATUS_TAG.tagType)}">
					<div style="${unsafeCSS(STATUS_TAG.tagLabel).toString()}">${value}</div>
				</div>`;
	}

	_renderExpander(item) {
		return html`
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
				label="Statement description: ${item.description}"
				data-automation-id="transaction-history-item-description">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction type"
					value = "${item.transactionType ? item.transactionType : `-`}"
					data-automation-id="transaction-history-item-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transfer account"
					value = "${item.transferAccount ? item.transferAccount : `-`}"
					data-automation-id="transaction-history-item-transfer-account">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date" 
					value = "${this._formatDate(item.postingDate)}"
					data-automation-id="transaction-history-item-posting-date">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Processed date"
					value = "${this._formatDate(item.processDate)}"
					data-automation-id="transaction-history-item-processed-date">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction code"
					value = "${item.transactionCode ? item.transactionCode : `-`}"
					data-automation-id="transaction-history-item-code">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card number"
					value = "${item.cardNumber ? item.cardNumber : `-`}"
					data-automation-id="transaction-history-item-card-number">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card authentication type"
					value = "${item.cardAuthType ? item.cardAuthType : `-`}"
					data-automation-id="transaction-history-item-card-auth-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Journal number"
					value = "${item.journalNumber ? item.journalNumber : `-`}"
					data-automation-id="transaction-history-item-journal-number">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Includes Vat"
					value = "${item.includesVat ? `Yes` : `No`}"
					data-automation-id="transaction-history-item-includes-vat">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="External terminal ID"
					value = "${item.externalTerminalId ? item.externalTerminalId : `-`}"
					data-automation-id="transaction-history-item-terminalID">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Cash back"
					value = "${item.cashback ? item.cashback : `-`}"
					data-automation-id="transaction-history-item-cashback">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Branch" 
					value = "${item.branch ? item.branch : `-`}"
					data-automation-id="transaction-history-item-branch">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Teller"
					value = "${item.teller ? item.teller : `-`}"
					data-automation-id="transaction-history-item-teller">
				</horizon-label>
			</capitec-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-action-bar class="load-more-bar" ?hidden="${this.hideLoadMore}">
				<capitec-spacer></capitec-spacer>
				<capitec-button
					type="clear"
					label="Load More"
					@click = ${() => this._loadMoreTransactions()}
					data-automation-id="transaction-history-load-more">
				</capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-icon
					class='scroll-top'
					size="medium"
					icon="system/arrow-up-action"
					@click = ${(e) => this._scrollToTop(e)}
					data-automation-id="transaction-history-scroll-top">
				</capitec-icon>
			</capitec-action-bar>`;
	}
}

customElements.define(`horizon-transaction-history`, TransactionHistory);