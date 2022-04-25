import { Component, css, html, unsafeCSS } from 'platform/elements';

import 'app/components/common/HorizonLabel';
import { DATE_TYPE_LIST, DEFAULTS, MAX_RESULTS } from 'app/constants/PolicyTransactionHistory';
import { EXPANDER_LABEL, TABLE_EXPANDER_CELL } from 'app/css/PolicyTransactionHistory';
import { DateTime } from 'luxon';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';

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

class PolicyTransactionHistory extends Component{
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

		// --------------
	// PROPERTIES
	// --------------

	/**
	 * Callback for rendering transaction details used by {@link PolicyTransactionHistory}.
	 * 
	 * @callback RenderTranactionDetails
	 * @param {Object} [item] Current item for which transaction details to be rendered
	 * 
	 * @returns {string} Transaction details response, expander content
	 */

	/**
	 * @property {Object} policyTransactionHistory - Object holds transaction data
	 * 
	 * @property {Function} getPolicyTransactionHistory Callback function to fetch more data
	 * @property {Function} disposeData Callback function to clear transaction history data variable
	 * 
	 * @readonly
	 * @static
	 * @memberof TransactionHistory
	 */

	static get properties() {
		return {
			dateLabel: { state: true },
			startDate: { type: String, state: true },
			endDate: { type: String, state: true },

			filteredData: { state: true },
			policyTransactionHistory: { type: Object },
			getPolicyTransactionHistory: { type: Object },
			disposeData: { type: Object },

			hideLoadMore: { state: true },

			isBusy: { state: true },
		};
	}

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

	async connectedCallback() {
		super.connectedCallback();

		// Making sure no baggage is carried from the previous instance.
		RENDER_CHIPS[FILTER_BY.DATE] = ``;
		RENDER_CHIPS[FILTER_BY.DATE_TYPE] = this.dateTypeOptions[1].text;

		this.filteredData = this.policyTransactionHistory;
		this.hideLoadMore = this.policyTransactionHistory.length % MAX_RESULTS > 0 
			&& this.policyTransactionHistory.length % MAX_RESULTS < MAX_RESULTS;
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._unloading();
	}

	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	_backToSummaryPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, {
			detail: {
			}
		}));
	}

	_webTemplate() {
		return html`
			${this._renderContent()}
		`;
	}

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
			<capitec-content-box class="main-view" id="transactions-table">
				${this._renderPolicyTransactionHistory()}
			</capitec-content-box>
			</capitec-group>
		</capitec-card>
		${this._renderLoadingIndicator()}
		`
	}

	_renderActionBar() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="transaction-action-bar">
				<capitec-select
					label="${RENDER_CHIPS[FILTER_BY.DATE_TYPE] !== `` ? `` : this.dateLabel}" 
					class="transaction-status-select"
					.items="${this.dateTypeOptions}"
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
				<capitec-spacer></capitec-spacer>
				<horizon-label
					label="Contract Reference"
					value="CFXXXX"
					data-automation-id="policy-contract-reference-value">
				</horizon-label>
			</capitec-group>
		`;
	}

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

	_clearFilters() {
		const activeFilters = this.shadowRoot.getElementById(`active-filters`);

		Array.from(activeFilters.children)
			 .filter(field => field.localName === `capitec-chip` && !field.hidden)
			 .forEach(item => {
				 this._clearFilter(item.id);
			 });

		this._refineSearch();
	}

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

	async _closeChip(type) {
		this._clearFilter(type);
		this._refineSearch();
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
			await this._refineSearch();
		}
	}

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

	_renderPolicyTransHistoryColumns() {
		return html`
			<capitec-table-column
				label="Premium Due Date"
				field="premiumDueDate"
				type="date">
			</capitec-table-column>
			<capitec-table-column
				label="Premium"
				field="premium">
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
			<capitec-table-column
				label="Reason"
				field="reason">
			</capitec-table-column>
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
						label="No policy transactions made in the last 6 months"
						type="strong">
					</capitec-label>
			</capitec-group>
		`;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}

	_filterByDateType(event) {

		RENDER_CHIPS[FILTER_BY.DATE_TYPE] = event.detail.new.text;

		this._refineSearch();
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

	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	_dateTypeFocussed(e) {
		this.dateLabel = ``;
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
		
		await this._refineSearch();
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

	_refineSearch() {

		this.filteredData = this.policyTransactionHistory;

		if (RENDER_CHIPS[FILTER_BY.DATE]) {
			const startDate = new Date(this.startDate);
			const endDate = new Date(this.endDate);

			if(RENDER_CHIPS[FILTER_BY.DATE_TYPE] == this.dateTypeOptions[0].text)
				this.filteredData = this.filteredData.filter(
					item => new Date(item.date) >= startDate && new Date(item.date) <= endDate); 
			else if(RENDER_CHIPS[FILTER_BY.DATE_TYPE] == this.dateTypeOptions[1].text)
				this.filteredData = this.filteredData.filter(
					item => new Date(item.premiumDueDate) >= startDate && new Date(item.premiumDueDate) <= endDate); 
		}

		this.requestUpdate();
	}
}

window.customElements.define(`horizon-insure-policy-transaction-history`, PolicyTransactionHistory);