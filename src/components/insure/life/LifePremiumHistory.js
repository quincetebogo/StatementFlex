import { Component, css, html, unsafeCSS } from 'platform/elements';
import { EXPANDER_LABEL, INSURE_TRANSACTIONS_CSS, TABLE_EXPANDER_CELL } from 'app/css/PolicyTransactionHistory';
import { FILTER_BY, MAX_RESULTS, NINETY_DAYS, RENDER_CHIPS } from 'app/constants/InsureTransactionHistory';
import { getDateRangeDisplayValue, getPredefinedDateRanges } from 'app/utils/insureUtils';
import { DateTime } from 'luxon';

import { formatCurrency } from 'app/productControls/utilities/Currency';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import 'app/components/common/HorizonLabel';

/**
 * Life Premium History component used to display premium history of a policy.
 * 
 * Events Raised 
 * -------------
 * navigate-back
 *  
 * @export
 * @class LifePolicySummary
 * @extends {Component}
 */
class LifePremiumHistory extends Component {

	// #region INITIALIZATION

	constructor() {
		super();

		this.lifePremiumHistory = {};
		this.filteredData = [];
		this.hideLoadMore = true;
		this.policyStartDate = ``;
	}

	// #endregion INITIALIZATION

	// #region PROPERTIES

	/**
	 * @property {String} startDate - String holds Start date of transaction/due date 
	 * @property {String} endDate - String holds End date of transaction/due date
	 * @property {Object} filteredData - Object holds filtered transaction data
	 * @property {Object} lifePremiumHistory - Object holds transaction data
	 * @property {Function} getLifePremiumHistory Callback function to fetch more data
	 * @property {Function} disposeData Callback function to clear transaction history data variable
	 * @property {Boolean} hideLoadMore Show/Hide Load More button
	 * @property {Object} policyStartDate Start date for restricting date range
	
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			startDate: { type: String, state: true },
			endDate: { type: String, state: true },
			filteredData: { type: Object, state: true },
			lifePremiumHistory: { type: Object },
			getLifePremiumHistory: { type: Object },
			disposeData: { type: Object },
			hideLoadMore: { type: Boolean, state: true },
			policyStartDate: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

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

	// #region EVENT HANDLER

	/**
	 * Navigate back to Policy summary page
	 * @return {void}
	 */
	_backToSummaryPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`));
	}

	/**
	 * set new date range
	 * @param {event} e e
	 * @return {void} 
	 */
	async _dateChanged(e) {
		if (isNullorEmpty(e.detail.new.startDate)) {
			this.filteredData = [];
			this._clearFilter();
			return;
		}
		let fromDate = DateTime.fromISO(e.detail.new.startDate === null ? e.detail.old.startDate : e.detail.new.startDate);
		let toDate = DateTime.fromISO(e.detail.new.endDate === null ? e.detail.old.endDate : e.detail.new.endDate);
		const currentDateTime = DateTime.local();

		if (toDate.diff(fromDate, [`days`]).days > 3650) {

			toDate = fromDate.plus({ days: 3650 });
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
			toDate = fromDate.plus({ days: 3650 });
			if (toDate.diff(currentDateTime, [`days`]).days > 0) {
				this.endDate = currentDateTime;
			} else {
				this.endDate = toDate;
			}
		} else if (e.detail.new.startDate === null && this.startDate === ``) {
			this.endDate = toDate;
			fromDate = toDate.minus({ days: 3650 });
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
	 * @param {event} e e
	 * @return {void} 
	 */
	_scrollToTop() {
		const element = this.shadowRoot.getElementById(`policy-transactions-table`);
		element.scrollTop = 0;
	}

	/**
	 * filter transactions when date type is changed
	 * @param {event} event event
	 * @return {void} 
	 */
	_filterByDateType(event) {

		RENDER_CHIPS[FILTER_BY.DATE_TYPE] = event.detail.new.text;

		this._refineSearch();
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
	 * load more transaction when clicked on load more button
	 * @return {void} 
	 */
	async _loadMoreTransactions() {
		const oldCount = this.lifePremiumHistory?.transactions?.length;
		const startDate = this.startDate.toLocaleString().slice(0, 10);
		const endDate = this.endDate.toLocaleString().slice(0, 10);

		await this.getLifePremiumHistory(startDate, endDate, this.lifePremiumHistory?.transactions?.length);

		// If the old record count and count after load more are same means no more data to populate,
		// so hiding loadmore button
		if (oldCount === this.lifePremiumHistory?.transactions?.length) {
			this.hideLoadMore = true;
		} else {
			this.hideLoadMore = this.lifePremiumHistory?.transactions?.length % MAX_RESULTS > 0 && this.lifePremiumHistory?.transactions?.length % MAX_RESULTS < MAX_RESULTS;
		}
		this._refineSearch();
	}

	// #endregion EVENT HANDLER

	// #region PRIVATE FUNCTIONS

	/**
	 * unload the policy transactions
	 * @return {void}
	 */
	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
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
	 * Initialize component when loaded
	 * @returns {void}
	 */
	 _initialise() {
		this.startDate = new Date(Date.now() - NINETY_DAYS).toISOString();
		this.endDate = new Date().toISOString();
		RENDER_CHIPS[FILTER_BY.DATE] = getDateRangeDisplayValue(this.startDate, this.endDate);

		this.filteredData = [];
		if (!isNullorEmpty(this.lifePremiumHistory?.transactions)) {
			this.filteredData = this.lifePremiumHistory?.transactions.filter(item => new Date(item.eventDate) >= new Date(this.startDate) && new Date(item.eventDate) <= new Date(this.endDate));
			this.hideLoadMore = this.lifePremiumHistory?.transactions?.length % MAX_RESULTS > 0 && this.lifePremiumHistory?.transactions?.length % MAX_RESULTS < MAX_RESULTS;
		}
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
	 * filter the transactions
	 * @return {void} 
	 */
	_refineSearch() {
		if (!isNullorEmpty(this.lifePremiumHistory?.transactions)) {
			this.filteredData = this.lifePremiumHistory?.transactions;

			if (!isNullorEmpty(this.startDate) && !isNullorEmpty(this.endDate)) {
				if (RENDER_CHIPS[FILTER_BY.DATE]) {
					const startDate = new Date(Date.parse(this.startDate));
					const endDate = new Date(Date.parse(this.endDate));
					this.filteredData = this.filteredData.filter(item => new Date(item.eventDate) >= startDate && new Date(item.eventDate) <= endDate);
				}
			} else {
				this.filteredData = [];
			}
			this.requestUpdate();
		}
	}

	// #endregion PRIVATE FUNCTIONS

	// #region RENDERING

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
					${this._renderPremiumHistory()}
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
				label="Premium History"
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
						value = "${this.lifePremiumHistory?.contractReference}" 
						data-automation-id="transaction-header-contract-reference">
					</horizon-label>
					<horizon-label label = "Bank" 
						value = "${isNullorEmpty(this.lifePremiumHistory?.bankName) ? `-` : this.lifePremiumHistory?.bankName}" 
						data-automation-id="transaction-header-bank-name">
					</horizon-label>
					<horizon-label label = "Account" 
						value = "${isNullorEmpty(this.lifePremiumHistory?.accountNumber) ? `-` : this.lifePremiumHistory?.accountNumber}" 
						data-automation-id="transaction-header-account-number">
					</horizon-label>
					<horizon-label label = "Arrears amount" 
						value = "${isNullorEmpty(this.lifePremiumHistory?.arrearsAmount) ? formatCurrency(0) : formatCurrency(this.lifePremiumHistory?.arrearsAmount)}" 
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
					label = "Choose a date"
					startDate="${this.startDate === `dd mm yyyy` ? `` : this.startDate}"
					endDate="${this.endDate === `dd mm yyyy` ? `` : this.endDate}"
					maxDate="${new Date().toString()}"
					minDate = "${this.policyStartDate}"
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
	 * Render Filter Bar
	 * @returns {html} The html of Filter Bar
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
				</capitec-action-bar>
			`;
		}
	}

	/**
	 * Render Date chip
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
	 * Render policy transactions
	 * @returns {html} - content of transactions
	 */
	_renderPremiumHistory() {
		return this.filteredData?.length > 0
			? html`
			<capitec-table
				groupField="groupByDate"
				displayMode="Full"
				?fixed = "${true}"
				.items = "${this.filteredData}"
				.expandRenderer="${(item) => this._renderTransactionDetails(item)}"
				data-automation-id="transaction-history-table">
					${this._renderPremiumHistoryColumns()}
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
				data-automation-id="life-premium-history-bank-details">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Account number"
					value = "${item.accountNumber ? item.accountNumber : `-`}"
					data-automation-id="life-premium-history-account-number">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Bank" 
					value = "${item.bank}"
					data-automation-id="life-premium-history-bank">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Branch code"
					value = "${item.bankBranchCode}"
					data-automation-id="life-premium-history-branch-code">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Account type"
					value = "${item.accountType}"
					data-automation-id="life-premium-history-account-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Collection day"
					value = "${item.eventCollectionDay}"
					data-automation-id="life-premium-history-collection-day">
				</horizon-label>
			</capitec-group>
		`;
	}

	/**
	 * render transaction history columns
	 * @returns {html} - table columns
	 */
	_renderPremiumHistoryColumns() {
		return html`
			<capitec-table-column
				label="Amount"
				field="eventAmount"
				type="currency"
				size="110px">
			</capitec-table-column>
			<capitec-spacer></capitec-spacer>
			<capitec-table-column
				label="Type"
				field="eventTransactionType"
				size="160px">
			</capitec-table-column>
			<capitec-table-column
				label="Date"
				field="eventDate"
				type="date"
				size="140px">
			</capitec-table-column>
			<capitec-table-column
				label="Paid Amount"
				field="eventPaidAmount"
				type="currency"
				size="120px">
			</capitec-table-column>
			<capitec-spacer></capitec-spacer>
		`;
	}

	/**
	 * Show message when there are no records
	 * @returns {html} - message for no results
	 */
	_renderNoResults() {
		let noResultsMessage;
		if (this.startDate) {
			noResultsMessage = `No transactions made during ${isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE]) ? `Last 90 days` : RENDER_CHIPS[FILTER_BY.DATE]}`;
		} else {
			noResultsMessage = `Adjust filters to see policy premium history`;
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
			<capitec-action-bar class="load-more-bar" ?hidden="${this.hideLoadMore || this.lifePremiumHistory?.transactions?.length === 0}">
				<capitec-spacer></capitec-spacer>
				<capitec-button
					type="clear"
					label="Load More"
					@click = ${() => this._loadMoreTransactions()}
					data-automation-id="life-premium-history-load-more">
				</capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-icon
					class='scroll-top'
					size="medium"
					icon="system/arrow-up-action"
					@click = ${() => this._scrollToTop()}
					data-automation-id="life-premium-history-scroll-top">
				</capitec-icon>
			</capitec-action-bar>`;
	}

	// #endregion RENDERING
}
window.customElements.define(`horizon-insure-life-premium-history`, LifePremiumHistory);

/**
 * When back arrow button is clicked, navigate
 *
 * @example
 * <horizon-insure-life-premium-history ... @navigate-back="${this._handler}"></horizon-insure-life--premium-history>
 *
 * @event LifePremiumHistory#navigate-back
 * @type {Object} - N/A
 */