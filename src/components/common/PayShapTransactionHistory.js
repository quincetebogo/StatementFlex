import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { DateTime } from 'luxon';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
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
	MONEY_TYPE: `All`
};

const DEFAULTS = {
	SEARCH_TEXT_LABEL: `Search for amount or transaction name`,
	STATUS_LABEL: `Transaction status`,
	DATE_FORMAT: `dd mm yyyy`
};

const MAX_RESULTS = 50;
const today = new Date();
const DATE_FORMAT = `dd mmm yyyy`;

/**
 * Transaction History, common component to display list of transactions occured 
 * in client's payshap account.
 *
 * Events Raised
 * -------------
 * back 
 *
 * @export
 * @class PayShapTransactionHistory
 * @extends {Component}
 */

export class PayShapTransactionHistory extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.moneyOutTransactionHistory = [];
		this.moneyInTransactionHistory = [];

		// private properites
		this.hideLoadMore = true;

		this.startDate = ``;
		this.endDate = ``;

		this.filteredData = [];
		this.searchTextLabel = DEFAULTS.SEARCH_TEXT_LABEL;
		this.statuslabel = DEFAULTS.STATUS_LABEL;

		this._telemetry = HorizonTelemetry.getInstance();
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
	 * @property {Object} moneyOutTransactionHistory - Object holds money out transaction data
	 * @property {Object} moneyInTransactionHistory - Object holds money in transaction data
	 * 
	 * @property {Object} renderTableColumns - Callback function to render account sepecific columns
	 * @property {Object} renderTransactionDetails - Callback function to render account sepecific transaction information
	 * @property {Function} getMoneyOutTransactionHistory Callback function to fetch more data
	 * @property {Function} getMoneyInTransactionHistory Callback function to fetch more data
	 * @property {Function} disposeData Callback function to clear transaction history data variable
	 * 
	 * @readonly
	 * @static
	 * @memberof TransactionHistory
	 */

	static get properties() {
		return {
			moneyOutTransactionHistory: { type: Object },
			moneyInTransactionHistory: { type: Object },
			moneyOutTransDetails: { type: Object },

			renderTableColumns: { type: Object },
			renderTransactionDetails: { type: Object },
			getMoneyOutTransactionHistory: { type: Object },
			getMoneyInTransactionHistory: { type: Object },
			disposeData: { type: Object },

			moneyType: { type: String },

			filteredData: { state: true },
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

		// Making sure no baggage is carried from the previous instance.
		RENDER_CHIPS[FILTER_BY.TEXT] = ``;
		RENDER_CHIPS[FILTER_BY.DATE] = ``;

		if (this.moneyType === `Money Out`) {
			this.moneyOutTransactionHistory = this.moneyOutTransDetails.moneyOutTransactionHistory;
			this.filteredData = this.moneyOutTransactionHistory;
			this.hideLoadMore = !this.moneyOutTransDetails.moneyOutLoadMore;
		} else {
			this.filteredData = this.moneyInTransactionHistory;
			this.hideLoadMore = this.moneyInTransactionHistory.length % MAX_RESULTS > 0;
		}

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

	async _dateChanged(e) {

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

		await this._loadFilteredTransactions();
	}

	async _loadFilteredTransactions() {
		const startDate = this.startDate.toLocaleString().slice(0, 10);
		const endDate = this.endDate.toLocaleString().slice(0, 10);

		this.disposeData();

		if (this.moneyType === `Money Out`) {
			const details = await this.getMoneyOutTransactionHistory(startDate, endDate);

			this.moneyOutTransDetails = details;
			this.moneyOutTransactionHistory = details.moneyOutTransactionHistory;
			this.hideLoadMore = !details.moneyOutLoadMore;
		} else {
			this.moneyInTransactionHistory = await this.getMoneyInTransactionHistory(startDate, endDate);
			this.hideLoadMore = this.moneyInTransactionHistory.length % MAX_RESULTS > 0;
		}

		this._refineSearch();
	}

	async _selectedMoneyType(e) {

		this.moneyType = e.target.label;
		const startDate = this.startDate.toLocaleString().slice(0, 10);
		const endDate = this.endDate.toLocaleString().slice(0, 10);

		if (this.moneyType === `Money In` && this.moneyInTransactionHistory.length === 0) {
			this.moneyInTransactionHistory = await this.getMoneyInTransactionHistory(startDate, endDate);
			this.hideLoadMore = this.moneyInTransactionHistory.length % MAX_RESULTS > 0;

		} else if (this.moneyType === `Money Out` && this.moneyOutTransactionHistory.length === 0) {
			const details = await this.getMoneyOutTransactionHistory(startDate, endDate);

			this.moneyOutTransDetails = details;
			this.moneyOutTransactionHistory = details.moneyOutTransactionHistory;
			this.hideLoadMore = !details.moneyOutLoadMore;
		}

		this._refineSearch();
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

	_refineSearch() {
		// Assigning the raw data before performing the filter

		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_TRANSACTION_HISTORY_TAB_FILTER, {
			"screen": TelemetryScreen.PAY_SHAP_TRANSACTION_HISTORY,
			"search-by-text": RENDER_CHIPS[FILTER_BY.TEXT],
			"date-filter": RENDER_CHIPS[FILTER_BY.DATE],
			"money-type": this.moneyType
		});

		if (this.moneyType === `Money Out`) {
			this.filteredData = this.moneyOutTransactionHistory;
			this.hideLoadMore = !this.moneyOutTransDetails.moneyOutLoadMore;
		} else {
			this.filteredData = this.moneyInTransactionHistory;
			this.hideLoadMore = this.moneyInTransactionHistory.length === 0 || this.moneyInTransactionHistory.length % MAX_RESULTS > 0;
		}

		if (RENDER_CHIPS[FILTER_BY.TEXT]) {
			const searchText = RENDER_CHIPS[FILTER_BY.TEXT].split(` `);

			const searchTextResult = searchText.map(key => {
				if (key !== ``) {
					if (key.startsWith(`-`)) {
						return this.filteredData.filter(item => parseFloat(item.amount).toFixed(2).startsWith(key));
					}
					if (this.moneyType === `Money Out`) {
						return this.filteredData.filter(item => item.creditorKnownAsName.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
																parseFloat(item.creditorAccountId).toFixed(2).startsWith(key) ||
																parseFloat(item.amount).toFixed(2).startsWith(key));
					} 
					return this.filteredData.filter(item => item.description.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
															parseFloat(item.amount).toFixed(2).startsWith(key));


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

		this.requestUpdate();
	}

	_getDateRange() {
		const fromDate = !this.startDate ? `dd mm yyyy` : formatDate(this.startDate, DATE_FORMAT);
		const toDate = !this.endDate ? `dd mm yyyy` : formatDate(this.endDate, DATE_FORMAT);

		const preDefinedRanges = this.getPredefinedDateRanges();
		const selectedValue = preDefinedRanges.filter(item => formatDate(item.value.startDate, DATE_FORMAT) === fromDate && formatDate(item.value.endDate, DATE_FORMAT) === toDate);

		if (selectedValue.length > 0) {
			return selectedValue[0].text;
		}
	
		return `${fromDate} - ${toDate}`;
	}

	_unloading() {
		this.disposeData();
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	async _loadMoreTransactions() {
		if (this.moneyType === `Money Out`) {
			const startDate = this.startDate.toLocaleString().slice(0, 10);
			const endDate = this.endDate.toLocaleString().slice(0, 10);

			const details = await this.getMoneyOutTransactionHistory(startDate, endDate, this.moneyOutTransDetails.paginationToken);

			this.moneyOutTransDetails = details;
			this.moneyOutTransactionHistory = details.moneyOutTransactionHistory;
			this.hideLoadMore = !details.moneyOutLoadMore;

		} else {
			const oldCount = this.moneyInTransactionHistory.length;
			const startDate = this.startDate.toLocaleString().slice(0, 10);
			const endDate = this.endDate.toLocaleString().slice(0, 10);

			this.moneyInTransactionHistory = await this.getMoneyInTransactionHistory(startDate, endDate, this.moneyInTransactionHistory.length + 1);

			if (oldCount === this.transactionHistory.length) {
				this.hideLoadMore = true;
			} else {
				this.hideLoadMore = this.transactionHistory.length % MAX_RESULTS > 0 && this.transactionHistory.length % MAX_RESULTS < MAX_RESULTS;
			}
		}

		this._refineSearch();
	}

	_scrollToTop() {
		const element = this.shadowRoot.getElementById(`transactions-table`);
		element.scrollTop = 0;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.transaction-card {
					height: auto;
					background-color: #FFFFFF;
					border: none;
					width: 1062px;
				}
				.transaction-card > capitec-group:first-child {
					--theme-layout-gap-spacing: 0px;
				}

				/* Filter Bar styles */
				.transaction-action-bar {
					height: 64px;
					width: 1060px;
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

				/* Main View Styles */
				.main-view {
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-layout-gap-line-color: 0px;
					height: inherit;
				}
				capitec-table {
					width: 1060px;
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

				.load-more-bar {
					padding: 0px;
					margin: 0px;
					--theme-actionbar-min-height: 48px;
					--theme-actionbar-background: #f4f4f4;
				}

				.scroll-top {
					padding-top: 12px;
					cursor: pointer;
				}

				capitec-date-time-picker {
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-date-time-picker-range-calendar-border: 0px;
					margin-right: 8px;
					width: 280px;
				}

				.transaction-action-bar > capitec-chip {
					margin: 0px 8px;
					--theme-chip-label-padding-left: 11px;
					--theme-chip-label-padding-right: 11px;
					--theme-chip-label-line-height: 19px;
				}
				.type-normal {
					--theme-chip-label-color: #3A3A3A;
					--theme-chip-background-color: #FFFFFF;
				}
				.type-selected {
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
					width: 1060px;
    				height: 500px;
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
						<capitec-content-box class="main-view" id="transactions-table" noScroll>
							${this._renderTransactionHistory()}
						</capitec-content-box>
						${this._renderFooter()}
				</capitec-group>
			</capitec-card>
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

				<capitec-chip 
					label="Money In"
					class="${this.moneyType === `Money In` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedMoneyType(e)}">
				</capitec-chip>
				<capitec-chip 
					label="Money Out" 
					class="${this.moneyType === `Money Out` ? `type-selected` : `type-normal`}" 
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

	renderTransactionDetails(item) {
		return this.moneyType === `Money Out` 
		? html`${this.renderMoneyOutTransactionDetails(item)}`
		: html`${this.renderMoneyInTransactionDetails(item)}`;
	}

	renderTableColumns() {
		return this.moneyType === `Money Out` 
		? html`${this.renderMoneyOutTableColumns()}`
		: html`${this.renderMoneyInTableColumns()}`;
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
			<capitec-action-bar class="load-more-bar" ?hidden="${this.hideLoadMore}">
				<capitec-spacer></capitec-spacer>
				<capitec-button
					type="clear"
					label="Load More"
					@click = ${() => this._loadMoreTransactions()}>
				</capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-icon
					class='scroll-top'
					size="medium"
					icon="system/arrow-up-action"
					@click = ${(e) => this._scrollToTop(e)}>
				</capitec-icon>
			</capitec-action-bar>`;
	}
}

customElements.define(`horizon-payshap-transaction-history`, PayShapTransactionHistory);