import { Component, css, html, unsafeCSS } from 'platform/elements';
import { DATE_TYPE_LIST, DEFAULTS, FILTER_BY, MAX_RESULTS, NINETY_DAYS, RENDER_CHIPS } from 'app/constants/InsureTransactionHistory';
import { EXPANDER_LABEL, INSURE_TRANSACTIONS_CSS, TABLE_EXPANDER_CELL } from 'app/css/PolicyTransactionHistory';
import { getDateRangeDisplayValue, getPredefinedDateRanges } from 'app/utils/insureUtils';
import { DateTime } from 'luxon';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import 'app/components/common/HorizonLabel';

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
class PolicyTransactionHistory extends Component {

	// #region INITIALIZATION

	constructor() {
		super();

		this.policyTransactionHistory = {};
		this.filteredData = [];
		this.hideLoadMore = true;
	}

	// #endregion INITIALIZATION

	// #region PROPERTIES

	/**
	 * Callback for rendering transaction details used by {@link PolicyTransactionHistory}.
	 * 
	 * @callback RenderTransactionDetails
	 * @param {Object} [item] Current item for which transaction details to be rendered
	 * 
	 * @returns {html} Transaction details response, expander content
	 */

	/**
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
			startDate: { type: String, state: true },
			endDate: { type: String, state: true },
			filteredData: { type: Object, state: true },
			policyTransactionHistory: { type: Object },
			getPolicyTransactionHistory: { type: Object },
			disposeData: { type: Object },
			hideLoadMore: { type: Boolean, state: true }
		};
	}

	// #endregion PROPERTIES

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
				${INSURE_TRANSACTIONS_CSS}

				/* Header Details Bar styles */
				.actionbar-header > horizon-label {
					width: 256px;
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

				capitec-table > capitec-icon {
					--theme-icon-size-medium: 24px;
				}

				.transaction-card{
					margin-bottom:30px;
				}

				#header-label{
					color: #FFF;
				}

				.insure-title-bar{
					box-shadow: none;
				}
			`
		];
	}

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	/**
	 * call unload event once the component removed from the DOM.
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
		this._unloading();
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region EVENTS

	/**
	 * unload the policy transactions
	 * @return {void}
	 */
	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	/**
	 * Navigate back to Policy summary page
	 * @return {void}
	 */
	_backToSummaryPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, { detail: {} }));
	}

	/**
	 * filter transactions when date is changed
	 * @param {*} e e
	 * @return {void} 
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

		RENDER_CHIPS[FILTER_BY.DATE] = getDateRangeDisplayValue(this.startDate, this.endDate);

		await this._refineSearch();
	}

	/**
	 * scroll to top of transactions table
	 * @param {*} e e
	 * @return {void} 
	 */
	_scrollToTop(e) {
		const element = this.shadowRoot.getElementById(`policy-transactions-table`);
		element.scrollTop = 0;
	}

	/**
	 * filter transactions when date type is changed
	 * @param {*} event event
	 * @return {void} 
	 */
	_filterByDateType(event) {

		RENDER_CHIPS[FILTER_BY.DATE_TYPE] = event.detail.new.text;

		this._refineSearch();
	}

	// #endregion EVENTS

	// #region PRIVATE FUNCTIONS

	/**
	 * Initialize component when loaded
	 * @returns {void}
	 */
	_initialise() {
		this.startDate = new Date(Date.now() - NINETY_DAYS).toISOString();
		this.endDate = new Date().toISOString();
		RENDER_CHIPS[FILTER_BY.DATE] = getDateRangeDisplayValue(this.startDate, this.endDate);

		this.filteredData = [];
		if (!isNullorEmpty(this.policyTransactionHistory?.transactions)) {
			this.filteredData = this.policyTransactionHistory?.transactions.filter(item => new Date(item.date) >= new Date(this.startDate) && new Date(item.date) <= new Date(this.endDate));
			this.hideLoadMore = this.policyTransactionHistory?.transactions?.length % MAX_RESULTS > 0 && this.policyTransactionHistory?.transactions?.length % MAX_RESULTS < MAX_RESULTS;
		}
	}

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
		<capitec-card class="transaction-card">
			<capitec-group layout="vertical" gap="line" halign="left" valign="top" >
				<div class="transact">
					${this._renderTitleBar()}
					${this._renderHeaderDetailsBar()}
				</div>
				
				${this._renderActionBar()}
				${this._renderFilterBar()}
				<capitec-content-box class="main-view" id="policy-transactions-table">
					${this._renderPolicyTransactionHistory()}
				</capitec-content-box>
				${this._renderFooter()}
			</capitec-group>
		</capitec-card>`;
	}

	/**
	 * Render Title Bar
	 * @returns {html} The html of the title
	*/
	_renderTitleBar() {
		return html`
		<capitec-title-bar class="insure-title-bar no-border-bottom" type="clear">
			<capitec-image
				alt="back"
				class="action-image"
				src="/images/insure/left-arrow.svg"
				@click="${() => this._backToSummaryPage()}"
				data-automation-id="transactions-back">
			</capitec-image>
			<capitec-label 
				label="Transaction History"
				type="title"
				id="header-label">
			</capitec-label>
		</capitec-title-bar>`;
	}

	/**
	 * Render Header Details Bar
	 * @returns {html} The html of the header details - Policy Number
	*/
	_renderHeaderDetailsBar() {
		return html`
			<capitec-group
				class= "actionbar-header"
				layout="horizontal"
				gap="none"
				halign="left"
				valign="center">
					<horizon-label label = "Policy number" 
						value = "${this.policyTransactionHistory?.contractReference}" 
						data-automation-id="transaction-header-contract-reference">
					</horizon-label>
					<horizon-label label = "Bank" 
						value = "${isNullorEmpty(this.policyTransactionHistory?.bankName) ? `-` : this.policyTransactionHistory?.bankName}" 
						data-automation-id="transaction-header-bank-name">
					</horizon-label>
					<horizon-label label = "Account" 
						value = "${isNullorEmpty(this.policyTransactionHistory?.accountNumber) ? `-` : this.policyTransactionHistory?.accountNumber}" 
						data-automation-id="transaction-header-account-number">
					</horizon-label>
					<horizon-label label = "Arrears amount" 
						value = "${isNullorEmpty(this.policyTransactionHistory?.arrearsAmount) ? formatCurrency(0) : formatCurrency(this.policyTransactionHistory?.arrearsAmount)}" 
						data-automation-id="transaction-header-arrears-amount">
					</horizon-label>
			</capitec-group>
		`;
	}

	/**
	 * Render Action Bar
	 * @returns {html} The html of the date type and date controls
	 */
	_renderActionBar() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="transaction-action-bar">
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
					.predefinedRanges="${getPredefinedDateRanges()}"
					@apply-clicked="${(e) => this._dateChanged(e)}"
					data-automation-id="transaction-history-date-filter">
				</capitec-date-time-picker>
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
	 * @return {void} 
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
	 * @return {void} 
	 */
	_clearFilter(type) {
		const date = () => this._reset();

		const resetForfilters = {
			'DATE': date,
			'DATE_TYPE': type
		};

		RENDER_CHIPS[type] = ``;
		if (resetForfilters[type]) {
			resetForfilters[type]();
		}
	}

	/**
	 * close specified chip
	 * @param {*} type - filter type 
	 * @return {void} 
	 */
	_closeChip(type) {
		this._clearFilter(type);
		this._refineSearch();
	}

	/**
	 * reset all filters and load transactions
	 * @return {void} 
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
				groupField="groupByDate"
				displayMode="Full"
				?fixed = "${true}"
				.items = "${this.filteredData}"
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
	 * @return {html} html
	 */
	_renderTransactionDetails(item) {
		return html`
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
				label="Bank details"
				data-automation-id="policy-transaction-history-bank-details">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Account name"
					value = "${item.bankDetails.accountName ? item.bankDetails.accountName : `-`}"
					data-automation-id="policy-transaction-history-account-name">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Account number"
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
					label="Branch code"
					value = "${item.bankDetails.branchCode}"
					data-automation-id="policy-transaction-history-branch-code">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Account type"
					value = "${item.bankDetails.accountType}"
					data-automation-id="policy-transaction-history-account-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Collection day"
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
				label="Premium"
				field="formatedPremium"
				type="currency"
				size="110px">
			</capitec-table-column>
			<capitec-spacer></capitec-spacer>
			<capitec-table-column
				label="Type"
				field="transactionType"
				size="160px">
			</capitec-table-column>
			<capitec-table-column
				label="Date"
				field="date"
				type="date"
				size="140px">
			</capitec-table-column>
			<capitec-table-column
				label="Amount"
				field="formatedAmount"
				type="currency"
				size="120px">
			</capitec-table-column>
			<capitec-spacer></capitec-spacer>
			<capitec-table-column
				label="Reason"
				field="reason"
				size="250px">
			</capitec-table-column>
		`;
	}

	/**
	 * Show message when there are no records
	 * @returns {html} - message for no results
	 */
	_renderNoResults() {
		let noResultsMessage;
		if (this.startDate) {
			noResultsMessage = `No policy transactions made during ${isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE]) ? `Last 90 days` : RENDER_CHIPS[FILTER_BY.DATE]}`;
		} else {
			noResultsMessage = `Adjust filters to see policy transactions`;
		}


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
						label="${noResultsMessage}"
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
			<capitec-action-bar class="load-more-bar" ?hidden="${this.hideLoadMore || this.policyTransactionHistory?.transactions?.length === 0}">
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
	 * load more transaction when clicked on load more button
	 * @return {void} 
	 */
	async _loadMoreTransactions() {
		const oldCount = this.policyTransactionHistory?.transactions?.length;
		const startDate = this.startDate.toLocaleString().slice(0, 10);
		const endDate = this.endDate.toLocaleString().slice(0, 10);

		await this.getPolicyTransactionHistory(startDate, endDate, this.policyTransactionHistory?.transactions?.length);

		// If the old record count and count after load more are same means no more data to populate,
		// so hiding loadmore button
		if (oldCount === this.policyTransactionHistory?.transactions?.length) {
			this.hideLoadMore = true;
		} else {
			this.hideLoadMore = this.policyTransactionHistory?.transactions?.length % MAX_RESULTS > 0 && this.policyTransactionHistory?.transactions?.length % MAX_RESULTS < MAX_RESULTS;
		}
		this._refineSearch();
	}

	/**
	 * filter the transactions
	 * @return {void} 
	 */
	_refineSearch() {
		if (!isNullorEmpty(this.policyTransactionHistory?.transactions)) {
			this.filteredData = this.policyTransactionHistory?.transactions;

			if (!isNullorEmpty(this.startDate) && !isNullorEmpty(this.endDate)) {
				if (RENDER_CHIPS[FILTER_BY.DATE]) {
					const startDate = new Date(Date.parse(this.startDate));
					const endDate = new Date(Date.parse(this.endDate));
					this.filteredData = this.filteredData.filter(item => new Date(item.date) >= startDate && new Date(item.date) <= endDate);
				}
			} else {
				this.filteredData = [];
			}
			this.requestUpdate();
		}
	}

	// #endregion PRIVATE FUNCTIONS
}

window.customElements.define(`horizon-insure-policy-transaction-history`, PolicyTransactionHistory);

/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-insure-policy-transaction-history 
			...@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}..."
 *
 * @event PolicyTransactionHistory#navigate-back
 * @type {Object} - N/A
 */

/**
 * When page is unloaded, clear policytransactionhistory objects
 *
 * @example
 * <horizon-insure-policy-transaction-history 
			...@unloading="${() => this._unloadPolicyTransactionHistory()}"...>
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
				...@apply-clicked="${(e) => this._dateChanged(e)}"...</capitec-date-time-picker>
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
				...@value-change = "${(e) => this._filterByDateType(e)}" ...</capitec-select>
 *
 * @event PolicyTransactionHistory#_filterByDateType
 * @type {Object} - event
 */