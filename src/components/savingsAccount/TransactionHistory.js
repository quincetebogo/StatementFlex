import { Component, css, html,unsafeCSS } from 'platform/elements';
import  'app/components/common/DoubleCalendar';
import {EXPANDER_LABEL, FIRST_CELL, TABLE_EXPANDER_CELL} from 'app/css/TransactionHistory';
import { transactionHistoryMockData } from 'app/mocks/TransactionHistoryMockData';

const RENDER_MODE = {
	MAIN_PAGE : 0,
	CALENDAR : 1
}

/**
 * Transaction History component
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

		// private properites
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.filterText = null;
		this.filterArray = [];
		this.headerRecords =
			{columnOne: '1928247288',
			 columnTwo: 'R20 916.00', 
			 columnThree: 'R20 567.00', 
			 columnFour: 'R349.00', 
			 columnFive: '5.5%',
			 columnSix: 'Active'};
		
		this.today = new Date();
		this.minDate = new Date(this.today);
		this.minDate.setDate(this.today.getDate() - 90);
	
		this.transactionHistory = [];

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
			filterText: { attribute: false },
			
			renderMode: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.transactionHistory = transactionHistoryMockData.transactionHistoryList;

		//TO DO: Date to be picked as needed when service calls is built.
		this.transactionHistory.map((item) => item.groupByItem = item.TransactionDate.substr(2,9));
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	calendarClick(){
		this.renderMode = RENDER_MODE.CALENDAR;
	}

	_filterByText(event) {
	
		const searchText = event.detail.new || event.detail.label;
		if (searchText) {
			this.filterText = searchText;
		}
		this.filterArray.push(this.filterText);
	}

	_filterByCalendar(event){
		const searchText = event.detail.new;
		this.filterText = searchText.startDate.substr(0,10) + "/"+ searchText.endDate.substr(0,10);
		this.filterArray.push(this.filterText);
	}

	_closeChip(e){
		const index = this.filterArray.indexOf(e.currentTarget.label);
		this.filterArray.splice(index, 1);
		this.requestUpdate();
	}

	_clearFilters(){
		this.filterArray = [];
		this.requestUpdate();
	}


	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------
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

				.calendar-container {
					height: 48px;
					width: 200px;
					padding: 0px;
					box-sizing: border-box;
					border-style: solid;
					border-width: thin;
					border-radius: 5px;
					border-color: lightgrey;
				}
				.calendar-container > horizon-label {
					height:24px;
					margin:11px 44px 10px 16px;
					font-family: "Hind Vadodara";
					--horizon-label-text-color: #3E4547;
					--horizon-label-text-font-size: 16px;
					--horizon-label-text-font-weight: 500;
				}

				.calendar-icon {
					cursor: pointer;
					height: 26px;
					width: 26px;
				}
				.transaction-action-bar > capitec-text-field {
					height: 47px;
					width: 380px;
					padding-right: 8px;
					--theme-input-label-font-size: 16px;
				}
				.statusFilter{
					width: 198px;
					margin: 4px 0px 4px 0px;
					padding-left: 12px;
					--theme-input-label-font-size: 16px;
				}

				capitec-menu {
				height: 48px;
				border-radius: 4px;
				--theme-menu-header-padding-left: 0px;
				--theme-menu-header-padding-right: 0px;
				--theme-menu-header-padding-top: 0px;
				--theme-menu-header-padding-bottom: 0px;
				--theme-menu-header-border-bottom: 0px;
				--theme-menu-header-font-size: 16px;
				--theme-menu-header-font-weight: 400;
				--theme-menu-header-font-color: #3E4547;
				}

				capitec-chip-bar {
					width: 1064px;
					--theme-chipbar-min-height: 48px;
					--theme-chipbar-padding: 0px;
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

				capitec-radio-group {
					margin-left: 12px;
				}
				capitec-radio-group > capitec-group {
					height: 100%;
					margin: 0px;
				}
				capitec-radio-group > capitec-group > capitec-radio {
					padding-left: 16px;
					
					--theme-label-font-color: #3A3A3A;
					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
				}
				.radio-btn-all{
					width: 100px;
				}
				.radio-btn-pending, .radio-btn-inactive{
					width: 128px;
				}
				.radio-btn-active{
					width: 116px;
				}
				capitec-content-box {
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					height: 768px;
					width: auto;
				}
				.section-header {
					height: 32px;
					padding-left: 16px;
					margin: 0px;
					--theme-layout-gap-spacing: 8px;
					border-top:  1px solid #E1E1E1;
					background-color: rgb(247, 247, 247);
				}

				.status-label {
					height: 20px;
					--theme-label-default-font-weight: 600;
					--theme-label-default-font-size: 14px;
					--theme-label-font-color: #3A3A3A;
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
				${this._renderCalendar()}
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
					<horizon-label label="Account Number" value = "${this.headerRecords.columnOne}"></horizon-label>
					<horizon-label label="Balance" value = "${this.headerRecords.columnTwo}"></horizon-label>
					<horizon-label label="Available Balance" value = "${this.headerRecords.columnThree}"></horizon-label>
					<horizon-label label="Pending amount" value = "${this.headerRecords.columnFour}"></horizon-label>
					<horizon-label label="Interest" value = "${this.headerRecords.columnFive}"></horizon-label>
					<horizon-label label="Status" value = "${this.headerRecords.columnSix}"></horizon-label>
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
					@input="${(e) => this._filterByText(e)}">
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

				<capitec-overflow-menu>
					<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
						<div class="status-icon processed">
						</div>
						<capitec-overflow-menu-item label="Processed" @click="${(e) => this._filterByText(e)}">
						</capitec-overflow-menu-item>
					</capitec-group>

					<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
						<div class="status-icon pending">
						</div>
						<capitec-overflow-menu-item label="Pending" @click="${(e) => this._filterByText(e)}">
						</capitec-overflow-menu-item>
					</capitec-group>

					<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
						<div class="status-icon expired">
						</div>
						<capitec-overflow-menu-item label="Expired" @click="${(e) => this._filterByText(e)}">
						</capitec-overflow-menu-item>
					</capitec-group>

					<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
						<div class="status-icon reversed">
						</div>
						<capitec-overflow-menu-item label="Reversed">
							
							<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
								<div class="status-icon reversed">
								</div>
								<capitec-overflow-menu-item label="Reversed" @click="${(e) => this._filterByText(e)}">
								</capitec-overflow-menu-item>
							</capitec-group>

							<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
								<div class="status-icon reversed">
								</div>
								<capitec-overflow-menu-item label="Partial reversal" @click="${(e) => this._filterByText(e)}">
								</capitec-overflow-menu-item>
							</capitec-group>

							<capitec-group layout="horizontal" gap="none" halign="left" valign="center">
								<div class="status-icon reversed">
								</div>
								<capitec-overflow-menu-item label="Partial reversal processed" @click="${(e) => this._filterByText(e)}">
								</capitec-overflow-menu-item>
							</capitec-group>
						</capitec-overflow-menu-item>
					</capitec-group>
				</capitec-overflow-menu>
					
			</capitec-action-bar>

			${this._renderFilterBar()}
			
		`;
	}

	_renderFilterBar(){
		if(this.filterArray.length >0){
			return html`
				<capitec-action-bar class="filter-bar">
					<capitec-label label = "Active filters:"></capitec-label>
					${this._renderFilterChips()}
					<capitec-button type="clear" label="Clear All" @click = "${() => this._clearFilters()}"></capitec-button>
				</capitec-action-bar>
			`;
		}
	}

	_renderFilterChips(){
		return	this.filterArray.map(item => html`<capitec-chip label="${item}" @remove="${(e) => this._closeChip(e)}" closable></capitec-chip>`);

	}

	
	_renderCalendar() {
		if(this.renderMode === RENDER_MODE.CALENDAR){
		return html`	
			`;
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
		<capitec-table .items="${this.transactionHistory}" groupField="groupByItem" displayMode="LoadMore" expandable="right" ?hideHeader=${true} .expandRenderer="${(item) => this._renderExpander(item)}">
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