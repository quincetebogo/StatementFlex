import { Component, css, html,unsafeCSS } from 'platform/elements';
import {EXPANDER_LABEL, FIRST_CELL, TABLE_EXPANDER_CELL} from 'app/css/TransactionHistory';
import { transactionHistoryMockData } from 'app/mocks/TransactionHistoryMockData';

const FILTER_BY = {
	ALL: 0,
	TEXT: 1,
	DATE: 2,
	STATUS: 3
};

const RENDER_CHIPS = {
	1 : "",
	2 : "",
	3 : ""
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
		
		this.today = new Date();
		this.minDate = new Date(this.today);
		this.minDate.setDate(this.today.getDate() - 90);
		this.endDate = "";
		this.startDate = "";
	
		this.tableData = [];
		this.textFilter = [];
		this.statusFilter = [];
		this.transactionStatus = [
			"Processed",
			"Pending",
			"Expired",
			"Reversed",
			"Partial reversal",
			"Partial reversal processed"
		]


	}
	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @readonly
	 * @static
	 * @memberof TransactionHistory
	 */

	static get properties() {
		return {
			transactionHistory: { type: Object },
			tableData: { type: Object },
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.transactionHistory = transactionHistoryMockData.transactionHistoryList;
		this.accountDetails = transactionHistoryMockData.accountDetails;

		//TO DO: Date can be formated as required according to the response once CS call is ready.
		//Adding a groupByItem onto the response to group the obtained records by Transaction Date .
		this.transactionHistory.map((item) => {
						item.groupByItem = item.TransactionDate.substr(2,9);
						item.Amount = `-R${item.Amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}.00`;
						item.Balance = `R${item.Balance.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}.00`
					});
		
		this.tableData = this.transactionHistory;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_filterByText(event) {
		RENDER_CHIPS[FILTER_BY.TEXT] = event.detail.new;
		this._lookForKey();
	}

	_filterByCalendar(event){
		this.endDate = new Date(event.detail.new.endDate);
		this.startDate = new Date(event.detail.new.startDate);
		RENDER_CHIPS[FILTER_BY.DATE] = new Date(event.detail.new.startDate).toString().substr(4,11) + " - " + new Date(event.detail.new.endDate).toString().substr(4,11);
		this._lookForKey();
	}

	_filterByStatus(event) {
		RENDER_CHIPS[FILTER_BY.STATUS] = event.detail.new;
		this._lookForKey();
	}

	_closeChip(searchType){
		(searchType === "text") ? RENDER_CHIPS[FILTER_BY.TEXT] = "" : (searchType === "date" ? RENDER_CHIPS[FILTER_BY.DATE] = "" : RENDER_CHIPS[FILTER_BY.STATUS] = "")

		this._lookForKey();
	}

	_clearFilters(){
		RENDER_CHIPS[FILTER_BY.TEXT] = "";
		RENDER_CHIPS[FILTER_BY.DATE] = "";
		RENDER_CHIPS[FILTER_BY.STATUS] = "";
		this._lookForKey();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	_lookForKey(){

		this.tableData = this.transactionHistory;
		
		RENDER_CHIPS[FILTER_BY.TEXT] ?
		this.textFilter = this.tableData.filter(item => (item.Description.toLowerCase().indexOf(RENDER_CHIPS[FILTER_BY.TEXT]) !== -1 ||
														item.Amount.indexOf(RENDER_CHIPS[FILTER_BY.TEXT]) !== -1 ||
														item.Balance.indexOf(RENDER_CHIPS[FILTER_BY.TEXT]) !== -1 )) : this.textFilter=[];
		
		RENDER_CHIPS[FILTER_BY.DATE] ? this.dateFilter = this.tableData.filter(item => ((new Date(item.TransactionDate) >= this.startDate) && (new Date(item.TransactionDate) <= this.endDate))) : this.dateFilter = [];
	
		RENDER_CHIPS[FILTER_BY.STATUS] ? this.statusFilter = this.tableData.filter(item => item.TransactionStatus === RENDER_CHIPS[FILTER_BY.STATUS] ) : this.statusFilter = [];
	
		(RENDER_CHIPS[FILTER_BY.TEXT] !== "" || RENDER_CHIPS[FILTER_BY.STATUS] !== "" || RENDER_CHIPS[FILTER_BY.DATE] !== "")
			? (this.tableData = [... new Set([...this.textFilter ,...this.statusFilter ,...this.dateFilter])])
			: (this.tableData) ;
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
					box-sizing: border-box;
					border: 1px solid #E1E1E1;
					border-radius: 5px;
					background-color: #FFFFFF;
					box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				capitec-card > capitec-group:first-child {
					--theme-layout-gap-spacing: 0px;
				}
				.transaction-history-title {
					height: 64px;
					width: 1064px;
					border-radius: 4px 4px 0 0;
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
					border-bottom: 0px;
					padding: 11px 24px 11px 15px;
				}
				.transaction-history-title > img {
					cursor: pointer;
					height: 26px;
					width: 26px;
					margin-right: 10px; 
				}
				.actionbar-header {
					height: 64px;
					width: 1064px;
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
					border-bottom: 0px;
					padding: 11px 24px 11px 43px;
				}
				.actionbar-header > horizon-label[label="Account Number"] {
					width: 174px;
				}
				.actionbar-header > horizon-label[label="Interest"] {
					width: 120px;
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
				.transaction-action-bar {
					height: 64px;
					width: 1064px;
					--theme-actionbar-padding: 8px 16px 8px 16px;
					--theme-actionbar-min-height: 64px;
					--theme-actionbar-item-gap: 8px;
				}
				.transaction-action-bar > capitec-select {
					--theme-input-label-font-size: 16px;
					line-height: 20px;
					--theme-input-label-color : #3A3A3A;
					--theme-select-options-max-height: 300px;
				}
				.transaction-action-bar > capitec-text-field {
					height: 47px;
					width: 380px;
					padding-right: 8px;
					--theme-input-label-font-size: 16px;
				}
				.table-header{
					width: 1064px;
					border: 0px;
					padding-bottom: 14px;
					padding-top: 14px;
					background-color: #F7F7F7;
					--theme-titlebar-min-height: 48px;
				}
				.table-header > capitec-label {
					height: 20px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 20px;
				}
				.table-header > capitec-label[label="Transaction Date"]{
					padding: 0px 53px 0px 16px;
				}
				.table-header > capitec-label[label="Transaction Status"]{
					padding: 0px 88px 0px 340px;
				}
				.table-header > capitec-label[label="Balance"]{
					padding: 0px 81px 0px 83px;
				}
				capitec-content-box {
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					height: 768px;
					width: auto;
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
				capitec-overflow-menu {
					--theme-overflow-menu-width: 225px;
					width: 225px;
    				background: #009DE01A;
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
				capitec-table{
					width: 1064px;
					--theme-data-table-body-group-font-weight: 600;
					--theme-data-table-padding-left: 16px;
					--theme-data-table-body-group-color: #3A3A3A;
					--theme-data-table-font-color: #3A3A3A;
					--theme-data-table-padding-right: 15px;
				}
				capitec-date-time-picker {
					--theme-date-time-picker-container-calendar-icon-top: 11px;
					--theme-date-time-picker-container-calendar-icon-height: 26px;
					--theme-input-padding-top: 7px;
					--theme-date-time-picker-host-max-width: 200px;
				}
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
				<capitec-content-box>
					${this._renderTransactionHistory()}
				</capitec-content-box>
				</capitec-group>
			</capitec-card>
			
			`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="transaction-history-title" type="transact">
				<img src="/images/insure/left-arrow.svg" @click="${() => this._back()}"/>
				<capitec-label label="Transaction History" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderAccountDetailsBar() {
		return html`
			<capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">
					<horizon-label label="Account Number" value = "${this.accountDetails.accountNumber}"></horizon-label>
					<horizon-label label="Balance" value = "${this.accountDetails.balance}"></horizon-label>
					<horizon-label label="Available Balance" value = "${this.accountDetails.availableBalance}"></horizon-label>
					<horizon-label label="Pending amount" value = "${this.accountDetails.pendingAmount}"></horizon-label>
					<horizon-label label="Interest" value = "${this.accountDetails.interest}"></horizon-label>
					<horizon-label label="Status" value = "${this.accountDetails.status}"></horizon-label>
			</capitec-group>
		`;
	}

	_renderActionBar() {
		return html`
			<capitec-action-bar class="transaction-action-bar">
				<capitec-text-field 
					label="Search for amount or transaction name"
					type="search"
					keyboardMode="alpha-numeric"
					@key-input="${(e) => this._filterByText(e)}">
				</capitec-text-field>

				<capitec-date-time-picker
					label = "Choose a date"
					type="range"
					mode="date"
					inputType="calendar"
					minDate="${this.minDate}"
					maxDate="${this.today}"
					outputType="string"
					@value-change="${this.newDate}"
					@apply-click = "${(e) => this._filterByCalendar(e)}">
				</capitec-date-time-picker>

				<capitec-select
					label="Transaction status"
					labelAsPlaceholder=${true}
					.items="${this.transactionStatus}"
					.displayRenderer="${(e) => this._renderSelectOptions(e)}"
					@value-change = "${(e) => this._filterByStatus(e)}">
				</capitec-select>

				<!-- <capitec-overflow-menu>
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
				</capitec-overflow-menu> -->
					
			</capitec-action-bar>

			${this._renderFilterBar()}
			
		`;
	}

_renderSelectOptions(e){
	return html`
		<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
			<div style="width: 10px;
					height: 10px;
					border-radius: 12px;
					margin-left: 13px;
					margin-right: 9px;
					background-color: #70AF00;"></div>
			<capitec-label label="${e}"></capitec-label>
		</capitec-group>`;
}

	_renderFilterBar(){
		if(RENDER_CHIPS[FILTER_BY.TEXT] !== "" || RENDER_CHIPS[FILTER_BY.DATE] !== "" || RENDER_CHIPS[FILTER_BY.STATUS] !== ""){
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
	
	_renderTextChip(){
		if(RENDER_CHIPS[FILTER_BY.TEXT]){
			return	html`
			<capitec-chip label="${RENDER_CHIPS[FILTER_BY.TEXT]}" @remove="${() => this._closeChip("text")}" closable>`;
		}
	}

	_renderDateChip(){
		if(RENDER_CHIPS[FILTER_BY.DATE]){
			return html`
			<capitec-chip label="${RENDER_CHIPS[FILTER_BY.DATE]}" @remove="${() => this._closeChip("date")}" closable>`;
		}
	}

	_renderStatusChip(){
		if(RENDER_CHIPS[FILTER_BY.STATUS]){
			return html`
			<capitec-chip label="${RENDER_CHIPS[FILTER_BY.STATUS]}" @remove="${() => this._closeChip("status")}" closable>`;
		}
	}

	_renderTransactionHistory(){
		return html`
		<capitec-group class="table-header" layout="horizontal" gap="clear" halign="left" valign="center">
			<capitec-label label="Transaction Date" ></capitec-label>
			<capitec-label label="Description"></capitec-label>
			<capitec-label label="Transaction Status"></capitec-label>
			<capitec-label label="Amount(R)"></capitec-label>
			<capitec-label label="Balance"></capitec-label>
		</capitec-group>
		<capitec-table .items="${this.tableData}" groupField="groupByItem" displayMode="LoadMore" expandable="right" ?hideHeader=${true} .expandRenderer="${(item) => this._renderExpander(item)}">
			<capitec-table-column field="TransactionDate" size="161px;"></capitec-table-column>
			<capitec-table-column field="Description" size="411px;"></capitec-table-column>
			<capitec-table-column field="TransactionStatus" size="190px;" .renderer="${(item, fieldName, value) => this._renderTransactionStatus(value)}"></capitec-table-column>></capitec-table-column>
			<capitec-table-column field="Amount" size="100px;" type="currency"></capitec-table-column>
			<capitec-table-column field="Balance" size="131px;" type="currency" align ="right"></capitec-table-column>
		</capitec-table>
		`;
	}

	_renderTransactionStatus(value){

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

	};


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
			<horizon-label style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Processed date" value = "${item.ProcessDate}"></horizon-label>
			<horizon-label  style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Transaction type" value = "POS"></horizon-label>
		</capitec-group>

		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Transaction code" value = "${item.TransactionCode}"></horizon-label>
			<horizon-label  style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Card number" value = "${item.CardNumber}"></horizon-label>
			<horizon-label  style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Card authentication type" value = "${item.CardAuthType}"></horizon-label>
			<horizon-label style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Transfer account" value = "${item.TransferAccount}"></horizon-label>
		</capitec-group>

		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Journal number" value = "${item.JournalNumber}"></horizon-label>
			<horizon-label style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Includes Vat" value = "${item.IncludesVat}"></horizon-label>
			<horizon-label style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="External terminal ID" value = "${item.ExternalTerminalId}"></horizon-label>
		</capitec-group>

		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Spend group" value = "Category Name"></horizon-label>
			<horizon-label style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Cash back" value = "${item.Cashback}"></horizon-label>
			<horizon-label style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Branch" value = "${item.Branch}"></horizon-label>
			<horizon-label style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
								label="Teller" value = "${item.Teller}"></horizon-label>
		</capitec-group>
		`;
	}
}

customElements.define(`transaction-history`, TransactionHistory);