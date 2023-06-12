import { Component, css, html } from 'platform/elements';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { DateTime } from 'luxon';

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
	MONEY_TYPE: `Money Out`
};

const DEFAULTS = {
	SEARCH_TEXT_LABEL: `Search for amount or transaction name`,
	STATUS_LABEL: `Transaction status`,
	DATE_FORMAT: `dd mm yyyy`
};

const MAX_RESULTS = 50;
const today = new Date();

/**
 * Transaction History, common component to display list of transactions happened in client's'
 * account (Savings account / LBB / Savings plan / Credit).
 *
 * Events Raised
 * -------------
 * back 
 *
 * @export
 * @class TransactionHistory
 * @extends {Component}
 */

export class PayShapTransactionHistory extends Component {

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
		this.product = ``;

		this.filteredData = [];
		this.searchTextLabel = DEFAULTS.SEARCH_TEXT_LABEL;
		this.statuslabel = DEFAULTS.STATUS_LABEL;
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
	 * @property {String} product - Type of product under account type ( Credit card/ Access facility/ Term loan/ etc...)
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
			product: { type: String },

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

 connectedCallback() {
		super.connectedCallback();

		 this._initialise();

		// Making sure no baggage is carried from the previous instance.
		RENDER_CHIPS[FILTER_BY.TEXT] = ``;
		RENDER_CHIPS[FILTER_BY.DATE] = ``;
		RENDER_CHIPS[FILTER_BY.MONEY_TYPE] = `All`;

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
		if (isNullorEmpty(RENDER_CHIPS[FILTER_BY.TEXT])) {
			this.searchTextLabel = DEFAULTS.SEARCH_TEXT_LABEL;
			return true;
		}
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
		
		this._loadFilteredTransactions();
	}

	 _loadFilteredTransactions() {
		const startDate = this.startDate.toLocaleString().slice(0, 10);
		const endDate = this.endDate.toLocaleString().slice(0, 10);

		this.disposeData();
		 this.getTransactionHistory();

		this._refineSearch(startDate, endDate);
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
	
	_selectedMoneyType(e) {
		RENDER_CHIPS[FILTER_BY.MONEY_TYPE] = e.target.label;
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

	 _initialise() {
		this.get90DaysAfter = (date) => {
			const result = new Date(date);
			result.setDate(result.getDate() + 90);

			return result > today ? today.toISOString() : result.toISOString();
		};
		this.get90DaysBefore = (date) => {
			const result = new Date(date);
			result.setDate(result.getDate() - 90);
			return result.toISOString();
		};

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
			this._loadFilteredTransactions();
		}
	}

	async _loadMoreTransactions() {
		const oldCount = this.transactionHistory.length;
		const startDate = this.startDate.toLocaleString().slice(0, 10);
		const endDate = this.endDate.toLocaleString().slice(0, 10);

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
		this.filteredData = this.transactionHistory;

		if (RENDER_CHIPS[FILTER_BY.TEXT]) {
			const searchText = RENDER_CHIPS[FILTER_BY.TEXT].split(` `);

			const searchTextResult = searchText.map(key => {
				if (key !== ``) {
					if (key.startsWith(`-`)) {
						return this.filteredData.filter(item => parseFloat(item.amount).toFixed(2).startsWith(key));
					}
					return this.filteredData.filter(item => item.creditorFicaName.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
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

			this.filteredData = this.filteredData.filter(item => item.processDateTime >= startDate && item.processDateTime <= endDate); 
		}

		if (RENDER_CHIPS[FILTER_BY.MONEY_TYPE]) {
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
				.transaction-history-title > img {
					width: 26px;
					margin-right: 10px;
					cursor: pointer;
				}

				/* Account Details Bar styles */
				.actionbar-header {
					height: 64px;
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
				
				/* Main View Styles */
				.main-view {
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-layout-gap-line-color: 0px;
					height: 661px;
				}
				capitec-table{
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
				capitec-image {
					cursor: pointer;
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
					${this._renderActionBar()}
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
				
				<capitec-chip 
					label="Money In"
					class="${RENDER_CHIPS[FILTER_BY.MONEY_TYPE] === `Money In` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedMoneyType(e)}">
				</capitec-chip>
				<capitec-chip 
					label="Money Out" 
					class="${RENDER_CHIPS[FILTER_BY.MONEY_TYPE] === `Money Out` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedMoneyType(e)}">
				</capitec-chip>

			</capitec-group>
		`;
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

customElements.define(`horizon-payshap-transaction-history`, PayShapTransactionHistory);