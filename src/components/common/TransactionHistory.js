import { Component, css, html } from 'platform/elements';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { ACCOUNT_TYPES } from 'app/constants/Common';
import { DateTime } from 'luxon';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { TRANSACTION_STATUS_LIST } from 'app/constants/TransactionHistory';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

const FILTER_BY = {
	ALL: `ALL`,
	TEXT: `TEXT`,
	DATE: `DATE`,
	STATUS: `STATUS`,
	MONEY_TYPE: `MONEY_TYPE` 
};

const RENDER_CHIPS = {
	TEXT: ``,
	DATE: ``,
	STATUS: ``,
	MONEY_TYPE: `All`
};

const DEFAULTS = {
	SEARCH_TEXT_LABEL: `Search for amount or transaction name`,
	STATUS_LABEL: `Transaction status`,
	DATE_FORMAT: `dd mm yyyy`
};

const _importTelemetryEvents_ = {
	[ACCOUNT_TYPES.SAVINGS_ACCOUNT]: () => import(`app/constants/telemetry/events/SavingsAccount`),
	[ACCOUNT_TYPES.LBB]: () => import(`app/constants/telemetry/events/LiveBetter`)
};

const MAX_RESULTS = 50;
const today = new Date();

/**
 * Transaction History, common component to display list of transactions happened in client's'
 * account (Savng account/ LBB).
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
		this._telemetry = HorizonTelemetry.instance;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Callback function to render columns in table used by {@link TransactionHistory}.
	 * 
	 * @callback RenderTableColumns
	 * @returns {string} capitec-table-columns list html response
	 */

	/**
	 * Callback for rendering transaction details used by {@link TransactionHistory}.
	 * 
	 * @callback RenderTranactionDetails
	 * @param {Object} [item] Current item for which transaction details to be rendered
	 * 
	 * @returns {string} Transaction details response, expander content
	 */

	/**
	 * @property {Object} transactionHistory - Object holds transaction data
	 * @property {Object} accountDetails - Account details (Account number, balance, etc..)
	 * @property {String} type - Type of account (savings/ lbb/ credit)
	 * 
	 * @property {Object} renderTableColumns - Callback function to render account sepecific columns
	 * @property {Object} renderTransactionDetails - Callback function to render account sepecific transaction information
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
			type: { type: String },

			renderTableColumns: { type: Object },
			renderTransactionDetails: { type: Object },
			getTransactionHistory: { type: Object },
			disposeData: { type: Object },

			filteredData: { state: true },
			isBusy: { state: true },
			startDate: { type: String, state: true },
			endDate: { type: String, state: true },
			searchTextLabel: { state: true },
			statuslabel: { state: true },
			selectedMoneyType: { state: true },
			hideLoadMore: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		await this._initialise();
		await this._telemetry.startSpan(this.telemetryEvent.TRANSACTION_HISTORY, {});

		// Making sure no baggage is carried from the previous instance.
		RENDER_CHIPS[FILTER_BY.TEXT] = ``;
		RENDER_CHIPS[FILTER_BY.DATE] = ``;
		RENDER_CHIPS[FILTER_BY.STATUS] = ``;
		RENDER_CHIPS[FILTER_BY.MONEY_TYPE] = `All`;

		this.filteredData = this.transactionHistory.filter(item => item.transactionStatus !== ``);
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
		this._telemetry.logEvent(this.telemetryEvent.TRANSACTION_HISTORY_BACK, {});
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_searchTextChange(event) {
		RENDER_CHIPS[FILTER_BY.TEXT] = event.detail.new;
		this._refineSearch();
	}

	_searchTextBlur(e) {
		if (isNullorEmpty(RENDER_CHIPS[FILTER_BY.TEXT])) {
			this.searchTextLabel = DEFAULTS.SEARCH_TEXT_LABEL;
			return true;
		}

		this._telemetry.logEvent(this.telemetryEvent.TRANSACTION_HISTORY_FILTER, {
			'search-by-text': RENDER_CHIPS[FILTER_BY.TEXT],
			'date-filter': RENDER_CHIPS[FILTER_BY.DATE],
			'status': RENDER_CHIPS[FILTER_BY.STATUS],
			'money-type': RENDER_CHIPS[FILTER_BY.MONEY_TYPE]
		});
		this.searchTextLabel = ``;
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
		
		await this._telemetry.logEvent(this.telemetryEvent.TRANSACTION_HISTORY_FILTER, {
			'search-by-text': RENDER_CHIPS[FILTER_BY.TEXT],
			'date-filter': RENDER_CHIPS[FILTER_BY.DATE],
			'status': RENDER_CHIPS[FILTER_BY.STATUS],
			'money-type': RENDER_CHIPS[FILTER_BY.MONEY_TYPE]
		});
		await this._loadFilteredTransactions();
	}

	async _loadFilteredTransactions() {
		const startDate = this.startDate.toLocaleString().slice(0, 10);
		const endDate = this.endDate.toLocaleString().slice(0, 10);

		this.disposeData();
		await this.getTransactionHistory(startDate, endDate);

		this.hideLoadMore = this.transactionHistory.length % MAX_RESULTS > 0 && this.transactionHistory.length % MAX_RESULTS < MAX_RESULTS;
		this._refineSearch();
	}

	_filterByStatus(event) {

		RENDER_CHIPS[FILTER_BY.STATUS] = event.detail.new;

		this._telemetry.logEvent(this.telemetryEvent.TRANSACTION_HISTORY_FILTER, {
			'search-by-text': RENDER_CHIPS[FILTER_BY.TEXT],
			'date-filter': RENDER_CHIPS[FILTER_BY.DATE],
			'status': RENDER_CHIPS[FILTER_BY.STATUS],
			'money-type': RENDER_CHIPS[FILTER_BY.MONEY_TYPE]
		});
		this._refineSearch();
	}

	async _closeChip(type) {

		await this._telemetry.logEvent(this.telemetryEvent.TRANSACTION_HISTORY_CLEAR_FILTER, {
			"filter-type": type
		});
		this._clearFilter(type);
		this._refineSearch();
	}

	_clearFilters() {

		this._telemetry.logEvent(this.telemetryEvent.TRANSACTION_HISTORY_CLEAR_ALL, {});

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

		this._telemetry.logEvent(this.telemetryEvent.TRANSACTION_HISTORY_SCROLL_TOP, {});
	}
	
	_selectedMoneyType(e) {
		RENDER_CHIPS[FILTER_BY.MONEY_TYPE] = e.target.label;
		
		this._telemetry.logEvent(this.telemetryEvent.TRANSACTION_HISTORY_FILTER, {
			'search-by-text': RENDER_CHIPS[FILTER_BY.TEXT],
			'date-filter': RENDER_CHIPS[FILTER_BY.DATE],
			'status': RENDER_CHIPS[FILTER_BY.STATUS],
			'money-type': RENDER_CHIPS[FILTER_BY.MONEY_TYPE]
		});
		this._refineSearch();
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

	async _initialise() {
		this.telemetryEvent = {};
		
		// Fetching the telemetry events object at runtime based on product type
		const { TRANSACTION_ENQUIRY_EVENTS } = await _importTelemetryEvents_[this.type]();

		this.telemetryEvent = TRANSACTION_ENQUIRY_EVENTS;
	}

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
		const startDate = this.startDate.toLocaleString().slice(0, 10);
		const endDate = this.endDate.toLocaleString().slice(0, 10);

		await this._telemetry.logEvent(this.telemetryEvent.TRANSACTION_HISTORY_LOAD_MORE, {});
		await this.getTransactionHistory(startDate, endDate, this.transactionHistory.length + 1);

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
		this.filteredData = this.transactionHistory.filter(item => item.transactionStatus !== ``);

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

		// Status filter is apllicable only on Savings Account Transaction History screen in the current state of application
		if (RENDER_CHIPS[FILTER_BY.STATUS] && this.type === ACCOUNT_TYPES.SAVINGS_ACCOUNT) {
			const status = RENDER_CHIPS[FILTER_BY.STATUS];

			this.filteredData = this.filteredData.filter(item => item.transactionStatus === status);
		}

		// Money Type filter is apllicable only on Live Better Transaction History screen in the current state of application
		if (RENDER_CHIPS[FILTER_BY.MONEY_TYPE] && this.type === ACCOUNT_TYPES.LBB) {
			const moneyType = RENDER_CHIPS[FILTER_BY.MONEY_TYPE];

			if (moneyType === `Money In`) {
				this.filteredData = this.filteredData.filter(item => item.amount > 0);
			} else if (moneyType === `Money Out`) {
				this.filteredData = this.filteredData.filter(item => item.amount < 0);
			}
		}
		this.requestUpdate();
	}

	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
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

	_unloading() {
		this._telemetry.endSpan(this.telemetryEvent.TRANSACTION_HISTORY, {});
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

					--theme-label-font-color: #FFFFFF;
				}
				.transact {
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
				}
				.lbb {
					background: no-repeat url(../images/liveBetter/gradient.png);
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
					--theme-icon-size-default: 24px;
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
			? html`<capitec-loading-indicator data-automation-id="transaction-history-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="transaction-history-title ${this.type}" type="default">
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
		const accDetails = Object.entries(this.accountDetails);
		return html`
			<capitec-group
				class= "actionbar-header ${this.type}"
				layout="horizontal"
				gap="none"
				halign="left"
				valign="center">
					${accDetails.map(item => {
						const [key, value] = item;
						return html`
							<horizon-label
								label="${key}"
								value="${value}"
								data-automation-id="transaction-history-${key.toLowerCase().split(``).join(`-`)}">
							</horizon-label>
						`;
					})}
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
					?hidden="${this.type !== ACCOUNT_TYPES.SAVINGS_ACCOUNT}"
					data-automation-id="transaction-status-filter">
				</capitec-select>
				
				<capitec-chip 
					label="All" 
					class="${RENDER_CHIPS[FILTER_BY.MONEY_TYPE] === `All` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedMoneyType(e)}" 
					?hidden="${this.type !== ACCOUNT_TYPES.LBB}">
				</capitec-chip>
				<capitec-chip 
					label="Money In"
					class="${RENDER_CHIPS[FILTER_BY.MONEY_TYPE] === `Money In` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedMoneyType(e)}" 
					?hidden="${this.type !== ACCOUNT_TYPES.LBB}">
				</capitec-chip>
				<capitec-chip 
					label="Money Out" 
					class="${RENDER_CHIPS[FILTER_BY.MONEY_TYPE] === `Money Out` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedMoneyType(e)}" 
					?hidden="${this.type !== ACCOUNT_TYPES.LBB}">
				</capitec-chip>

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
		return this.filteredData.length > 0 
		? html`
			<capitec-table
				.items = "${this.filteredData}"
				groupField="groupByItem"
				displayMode="Full"
				?fixed = "${true}"
				.expandRenderer="${(item) => this.renderTransactionDetails(item)}"
				data-automation-id="transaction-history-table">
					${this.renderTableColumns()}
			</capitec-table>`
		: html`
			${this._renderNoResults()}
		`;
	}

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
						label="No transactions made in the last 6 months"
						type="strong">
					</capitec-label>
			</capitec-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-action-bar class="load-more-bar" ?hidden="${this.hideLoadMore || this.transactionHistory.length === 0}">
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