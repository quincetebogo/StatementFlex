import { Component, css, html,unsafeCSS } from 'platform/elements';

import { EXPANDER_LABEL, TABLE_EXPANDER_CELL} from 'app/css/TransactionHistory';
import { getMonthName } from 'app/utils/channelServiceUtilities';

import { transactionHistoryMockData } from 'app/mocks/TransactionHistoryMockData';

const RENDER_MODE = {
	MAIN_PAGE: 0,
	CALENDAR: 1
};

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
		this.accountDetails = null;
		
		// private properites
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.startDate = ``;
		this.endDate = ``;
		this.filteredData = [];
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {Object} transactionHistory Has list of client's transactions
	 * 
	 * @readonly
	 * @static
	 * @memberof TransactionHistory
	 */

	static get properties() {
		return {
			transactionHistory: { type: Object },

			renderMode: { attribute: false },
			startDate: { attribute: false },
			endDate: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.transactionHistory = transactionHistoryMockData.transactionHistoryList;
		this.accountDetails = transactionHistoryMockData.accountDetails;
		this.transactionHistory.map((item) => {
			const date = new Date(Date.parse(item.TransactionDate))

			item.TranDate = date;
			item.groupByItem = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
			item.Amount = `-R${item.Amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}.00`;
			item.Balance = `R${item.Balance.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}.00`
		});

		this.filteredData = this.transactionHistory;
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

	_startDateChanged(e) {
		if (e.detail.new.date) {
			this.startDate = this._formatDate(e.detail.new.date);
		}
	}

	_endDateChanged(e) {
		if (e.detail.new.date) {
			this.endDate = this._formatDate(e.detail.new.date);
		}
	}

	_apply() {
		if (!this.startDate || !this.endDate) {
			return;
		}
		RENDER_CHIPS[FILTER_BY.DATE] = this._getDateRange();
		this._refineSearch();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_cancel() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_filterByStatus(event) {
		RENDER_CHIPS[FILTER_BY.STATUS] = event.detail.label;
		this._refineSearch();
	}

	_closeChip(type) {
		RENDER_CHIPS[type] = ``;
		this._refineSearch();
	}

	_clearFilters() {
		RENDER_CHIPS[FILTER_BY.TEXT] = ``;
		RENDER_CHIPS[FILTER_BY.DATE] = ``;
		RENDER_CHIPS[FILTER_BY.STATUS] = ``;
		
		this.filteredData = this.transactionHistory;
		this.requestUpdate();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_refineSearch() {

		this.filteredData = this.transactionHistory;
		if (RENDER_CHIPS[FILTER_BY.TEXT]) {
			const searchText = RENDER_CHIPS[FILTER_BY.TEXT];

			this.filteredData = this.filteredData.filter(item => item.Description.toLowerCase().indexOf(searchText) !== -1 ||
															 	 parseInt(item.Amount, 10) === parseInt(searchText, 10)
			);
		}

		if (RENDER_CHIPS[FILTER_BY.DATE]) {
			const startDate = new Date(Date.parse(this.startDate));
			const endDate = new Date(Date.parse(this.endDate));

			this.filteredData = this.filteredData.filter(item => item.TranDate >= startDate && item.TranDate <= endDate);
		}

		if (RENDER_CHIPS[FILTER_BY.STATUS]) {
			const status = RENDER_CHIPS[FILTER_BY.STATUS];

			this.filteredData = this.filteredData.filter(item => item.TransactionStatus === status);
		}
		this.requestUpdate();
	}

	_showCalendar() {
		this.renderMode = RENDER_MODE.CALENDAR;
	}

	_formatDate(date) {
		return `${date.getDate()} ${getMonthName(date.getMonth())} ${date.getFullYear()}`;
	}

	_getDateRange() {
		const startDate = !this.startDate ? `dd mm yyy` : this.startDate;
		const endDate = !this.endDate ? `dd mm yyy` : this.endDate;
		
		return `${startDate} - ${endDate}`;
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
					height: 888px;
					width: 1064px;
					border-radius: 5px;
					box-sizing: border-box;
					border: 1px solid #E1E1E1;
					background-color: #FFFFFF;
					box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				.transaction-card > capitec-group:first-child {
					--theme-layout-gap-spacing: 0px;
				}

				/* Header Styles */
				.transaction-history-title {
					height: 64px;
					width: 1064px;
					border-bottom: 0px;
					border-radius: 4px 4px 0 0;
					padding: 11px 24px 11px 15px;
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
				}
				.transaction-history-title > img {
					height: 26px;
					width: 26px;
					margin-right: 10px;
					cursor: pointer;
				}

				/* Account Details Bar styles */
				.actionbar-header {
					height: 64px;
					width: 1064px;
					border-bottom: 0px;
					padding: 11px 24px 11px 43px;
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
				}
				.actionbar-header > horizon-label {
					width: 156px;
					height: 100%;
					font-weight: 300;
					justify-content: left;
					padding: 0px 0px 0px 16px;
				
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: 20px;
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
					width: 1064px;
				}
				.transaction-action-bar > capitec-text-field {
					height: 47px;
					width: 380px;
					padding-left: 8px;
				
					--theme-input-label-font-size: 16px;
					--theme-layout-gap-spacing: 8px;
				}
				.cb-datepicker {
					height: 48px;
					width: 201px;
					margin-right: 8px;
					border-radius: 5px;
					box-sizing: border-box;
					border: 1px solid #E1E1E1;
					background-color: #FFFFFF;
					cursor: pointer;
				}
				.cb-datepicker > capitec-label {
					width: 143px;
					cursor: pointer;
					margin-left: 16.5px;
				
					--theme-label-default-font-size: 16px;
				}
				.cb-datepicker > capitec-icon {
					--theme-icon-size-small: 26px;
				}
				.transaction-status {
					position: relative;
				}
				.transaction-status > capitec-label {
					z-index: 10;
					margin-left: 35px;
				}
				capitec-overflow-menu {
					width: 225px;
					height: 48px;
					border-radius: 5px;
					box-sizing: border-box;
					border: 1px solid rgb(225, 225, 225);
					background-color: rgb(255, 255, 255);
					position: absolute;

					--theme-overflow-menu-width: 225px;
				}
				capitec-overflow-menu-item {
					width: 200px;

					--theme-overflow-menu-item-hover-background-color: none;
				}
				capitec-overflow-menu > capitec-group:hover {
					background-color: #E5F5FB;
				}
				capitec-overflow-menu-item > capitec-group:hover {
					background-color: #E5F5FB;
				}
				.status-icon {
					width: 10px;
					height: 10px;
					border-radius: 12px;
					margin-left: 13px;
				}
				.status-icon.processed {
					background-color: #70AF00;
				}
				.status-icon.pending {
					background-color: #D4781C;
				}
				.status-icon.expired {
					background-color: #B71C1A;
				}
				.status-icon.reversed {
					background-color: #009DE0;
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
					height: 768px;
					width: auto;
				}
				capitec-table{
					width: 1064px;
					--theme-data-table-body-group-font-weight: 600;
					--theme-data-table-padding-left: 16px;
					--theme-data-table-body-group-color: #3A3A3A;
					--theme-data-table-font-color: #3A3A3A;
					--theme-data-table-padding-right: 15px;
				}
				
				/* Modal Calendar Styles */
				capitec-modal {
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #4E6066;
					--theme-modal-header-font-size: 16px;
					--theme-modal-header-font-weight: 600;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-padding-top: 12px;
					--theme-modal-header-padding-bottom: 12px;
					--theme-modal-footer-padding: 7.5px 12px 7.5px 0px;
				}
				div[slot="body"] {
					display: flex;
				}
				capitec-calendar {
					--theme-input-font-weight: 600;
					--theme-calendar-days-font-size: 15px;
					--theme-calendar-days-color: #3A3A3A;
					--theme-calendar-not-selectable-color: #969B9D;
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
				<capitec-content-box class="main-view">
					${this._renderTransactionHistory()}
				</capitec-content-box>
				</capitec-group>
			</capitec-card>
			${this._renderCalendar()}
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="transaction-history-title" type="transact">
				<img src="/images/insure/left-arrow.svg" @click="${() => this._back()}"/>
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
					label="Account Number"
					value="${this.accountDetails.accountNumber}">
				</horizon-label>
				<horizon-label
					label="Balance"
					value="${this.accountDetails.balance}">
				</horizon-label>
				<horizon-label
					label="Available Balance"
					value="${this.accountDetails.availableBalance}">
				</horizon-label>
				<horizon-label
					label="Pending amount"
					value="${this.accountDetails.pendingAmount}">
				</horizon-label>
				<horizon-label
					label="Interest"
					value="${this.accountDetails.interest}">
				</horizon-label>
				<horizon-label
					label="Status"
					value="${this.accountDetails.status}">
				</horizon-label>
			</capitec-group>
		`;
	}

	_renderActionBar() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="transaction-action-bar">
				<capitec-text-field 
					label="Search for amount or transaction name"
					type="search"
					keyboardMode="alpha-numeric"
					@key-input="${(e) => this._searchTextChange(e)}"
					@value-change="${(e) => this._searchTextChange(e)}"
					value="${RENDER_CHIPS[FILTER_BY.TEXT]}">
				</capitec-text-field>

				<capitec-content-box
					class="cb-datepicker"
					layout="horizontal"
					halign="left" valign="center" gap="none"
					nopadding
					@click="${()=> this._showCalendar()}">
						<capitec-label
							label="Choose a date"
							type="default"
							@click="${()=> this._showCalendar()}">
						</capitec-label>
						<capitec-icon
							size="small"
							icon="system/calendar-action"
							@click="${()=> this._showCalendar()}">
						</capitec-icon>
				</capitec-content-box>

				<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="transaction-status">
					<capitec-label
						label="Transaction Status"
						type="default">
					</capitec-label>
					${this._renderStatusOptions()}
				</capitec-group>
			</capitec-group>
		`;
	}

	_renderStatusOptions() {
		return html`
			<capitec-overflow-menu label="Transaction Status">
				<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
					<div class="status-icon processed">
					</div>
					<capitec-overflow-menu-item label="Processed" @click="${(e) => this._filterByStatus(e)}">
					</capitec-overflow-menu-item>
				</capitec-group>

				<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
					<div class="status-icon pending">
					</div>
					<capitec-overflow-menu-item label="Pending" @click="${(e) => this._filterByStatus(e)}">
					</capitec-overflow-menu-item>
				</capitec-group>

				<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
					<div class="status-icon expired">
					</div>
					<capitec-overflow-menu-item label="Expired" @click="${(e) => this._filterByStatus(e)}">
					</capitec-overflow-menu-item>
				</capitec-group>

				<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
					<div class="status-icon reversed">
					</div>
					<capitec-overflow-menu-item label="Reversed">
						
						<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
							<div class="status-icon reversed">
							</div>
							<capitec-overflow-menu-item label="Reversed" @click="${(e) => this._filterByStatus(e)}">
							</capitec-overflow-menu-item>
						</capitec-group>

						<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
							<div class="status-icon reversed">
							</div>
							<capitec-overflow-menu-item label="Partial reversal" @click="${(e) => this._filterByStatus(e)}">
							</capitec-overflow-menu-item>
						</capitec-group>

						<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
							<div class="status-icon reversed">
							</div>
							<capitec-overflow-menu-item label="Partial reversal processed" @click="${(e) => this._filterByStatus(e)}">
							</capitec-overflow-menu-item>
						</capitec-group>
					</capitec-overflow-menu-item>
				</capitec-group>
			</capitec-overflow-menu>
		`;
	}

	_renderFilterBar() {
		if (RENDER_CHIPS[FILTER_BY.TEXT] !== `` || RENDER_CHIPS[FILTER_BY.DATE] !== `` || RENDER_CHIPS[FILTER_BY.STATUS] !== ``) {
			return html`
				<capitec-action-bar class="filter-bar">
					<capitec-label label = "Active filters:"></capitec-label>
						${this._renderTextChip()}
						${this._renderDateChip()}
						${this._renderStatusChip()}
					<capitec-button type="clear" label="Clear All" @click = "${() => this._clearFilters()}"></capitec-button>
				</capitec-action-bar>
			`;
		}
	}
	
	_renderTextChip() {
		if (RENDER_CHIPS[FILTER_BY.TEXT]) {
			return	html`
				<capitec-chip
					label="${RENDER_CHIPS[FILTER_BY.TEXT]}"
					@remove="${() => this._closeChip(FILTER_BY.TEXT)}"
					closable>
				</capitec-chip>
			`;
		}
	}

	_renderDateChip() {
		if (RENDER_CHIPS[FILTER_BY.DATE]) {
			return html`
				<capitec-chip
					label="${RENDER_CHIPS[FILTER_BY.DATE]}"
					@remove="${() => this._closeChip(FILTER_BY.DATE)}"
					closable>
				</capitec-chip>
			`;
		}
	}

	_renderStatusChip() {
		if (RENDER_CHIPS[FILTER_BY.STATUS]) {
			return html`
				<capitec-chip
					label="${RENDER_CHIPS[FILTER_BY.STATUS]}"
					@remove="${() => this._closeChip(FILTER_BY.STATUS)}"
					closable>
				</capitec-chip>
			`;
		}
	}

	_renderTransactionHistory() {
		return html`
			<capitec-table
				.items="${this.filteredData}"
				groupField="groupByItem"
				displayMode="LoadMore"
				expandable="right"
				.expandRenderer="${(item) => this._renderExpander(item)}">
					<capitec-table-column label="Transaction Date" field="TransactionDate" size="161px;"></capitec-table-column>
					<capitec-table-column label="Description" field="Description" size="411px;"></capitec-table-column>
					<capitec-table-column
						label="Transaction Status"
						field="TransactionStatus"
						size="190px;" 
						.renderer="${(item, fieldName, value) => this._renderTransactionStatus(value)}">
					</capitec-table-column>
					<capitec-table-column label="Amount(R)" field="Amount" size="100px;" type="currency"></capitec-table-column>
					<capitec-table-column label="Balance" field="Balance" size="131px;" type="currency" align ="right"></capitec-table-column>
			</capitec-table>
		`;
	}

	_renderTransactionStatus(value) {
		const processed = () => html`<capitec-tag label="Processed" type="success"></capitec-tag>`;
		const pending = () => html`<capitec-tag label="Pending" type="warning"></capitec-tag>`;
		const expired = () => html`<capitec-tag label="Expired" type="error"></capitec-tag>`;
		const reversed = () => html`<capitec-tag label="Reversed" type="info"></capitec-tag>`;
		
		return {
			Processed: processed,
			Pending: pending,
			Expired: expired,
			Reversed: reversed
		}[value]();

	}

	_renderExpander (item) {
		return html`
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL)}" 
				label="Statement description: POS Purchase SPAR Die Boord card no 3445">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label 
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date" 
					value = "${item.PostingDate}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Processed date"
					value = "${item.ProcessDate}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction type"
					value = "POS">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction code"
					value = "${item.TransactionCode}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card number"
					value = "${item.CardNumber}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card authentication type"
					value = "${item.CardAuthType}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transfer account"
					value = "${item.TransferAccount}">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Journal number"
					value = "${item.JournalNumber}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Includes Vat"
					value = "${item.IncludesVat}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="External terminal ID"
					value = "${item.ExternalTerminalId}">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Spend group"
					value = "Category Name">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Cash back"
					value = "${item.Cashback}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Branch" 
					value = "${item.Branch}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Teller"
					value = "${item.Teller}">
				</horizon-label>
			</capitec-group>
		`;
	}

	_renderCalendar() {
		if (this.renderMode === RENDER_MODE.CALENDAR) {
			return html`
				<capitec-modal type="free" header-align="center" header="${this._getDateRange()} (up to 90 days)">
					<div slot="body">
						<capitec-calendar 
							startDate="${this.startDate}"
							endDate="${this.endDate}"
							maxDate="${this.endDate}"
							@value-change="${(e) => this._startDateChanged(e)}"
							range>
						</capitec-calendar>
						<capitec-calendar
							startDate="${this.startDate}"
							endDate="${this.endDate}"
							minDate="${this.startDate}"
							@value-change="${(e) => this._endDateChanged(e)}"
							range>
						</capitec-calendar>
					</div>
					<div slot="footer">
					<capitec-group layout="horizontal" gap="clear" halign="right" valign="top">
						<capitec-button
							label="Cancel"
							type="clear"
							@click=${() => this._cancel()}>
						</capitec-button>
						<capitec-button
							label="Apply"
							type="clear"
							@click=${() => this._apply()}>
						</capitec-button>
					</capitec-group>
					</div>
				</capitec-modal>
			`;
		}
	}
}

customElements.define(`transaction-history`, TransactionHistory);