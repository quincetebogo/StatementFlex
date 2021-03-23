import { Component, css, html, unsafeCSS } from 'platform/elements';

import { EXPANDER_LABEL, STATUS_TAG, TABLE_EXPANDER_CELL } from 'app/css/TransactionHistory';
import { getMonthName } from 'app/utils/channelServiceUtilities';
import { HorizonStore } from 'app/store/HorizonStore';

import { SavingsAccountService} from 'app/services/SavingsAccountService';

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

const TRANSACTION_STATUS_LIST = [
	`Financial`,
	`Non Financial`,
	`Processing`,
	`Reversed`,
	`Partial reversal`,
	`Partial reversal processed`
];

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
		
		this.transactionHistory = null;
		this.accountDetails = null;
		
		this.isBusy = false;
		
		// private properites
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.showLoadMore = true;
		this.startDate = ``;
		this.minDate = ``;
		this.maxDate =``;
		this.startDateMonth = getMonthName(new Date().getMonth() - 1);
		this.startDateYear = ``;
		this.endDate = ``;
		this.endDateMonth = ``;
		this.endDateYear = ``;
		this.filteredData = [];
		this.rawData = [];
		this.searchTextLabel = `Search for amount or transaction name`;
		this.statuslabel = `Transaction Status`;

		this.statuslabel = `Transaction Status`;
		this.transactionStatusList = [
			`Financial`,
			`Non Financial`,
			`Processing`,
			`Reversed`,
			`Partial reversal`,
			`Partial reversal processed`
		];
		this.savingsAccountService = new SavingsAccountService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));

	
		this.horizonStore = HorizonStore.getInstance();
	
		this.state = this.horizonStore.recoverState();
		this.callerInformation = this.state.callerInformation;
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
			accountDetails: { type: Object },
			filteredData: { attribute: false },

			renderMode: { attribute: false },
			isBusy: { attribute: false },
			startDate: { attribute: false },
			minDate: { attribute: false },
			maxDate: { attribute: false },
			startDateMonth: { attribute: false },
			startDateYear: { attribute: false },
			endDate: { attribute: false },
			endDateMonth: { attribute: false },
			endDateYear: { attribute: false },
			searchTextLabel: { attribute: false },
			statuslabel: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.rawData = this.transactionHistory;
		this.transactionHistory = this._initialize(this.transactionHistory);
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

	//To hide or show the label for the search text field according to the design requirement.
	_searchTextFocussed(e) {
		this.searchTextLabel = ``;
	}

	_searchTextBlur(e) {
		if (RENDER_CHIPS[FILTER_BY.TEXT] === ``) {
			this.searchTextLabel = `Search for amount or transaction name`;
		}
	}

	//To hide or show the label for the select field according to the design requirement.
	_statusFocussed(e) {
		this.statuslabel = '';
	}

	_startDateChanged(e) {
		if (e.detail.new.date) {
			this.startDate = this._formatDate(e.detail.new.date);
			this.maxDate = new Date(e.detail.new.date);
			this.maxDate.setDate(this.maxDate.getDate() + 90);
			this.startDateYear = e.detail.new.date.getFullYear();
		}
	}

	_endDateChanged(e) {
		if (e.detail.new.date) {
			this.endDate = this._formatDate(e.detail.new.date);
			this.minDate = new Date(e.detail.new.date);
			this.minDate.setDate(this.minDate.getDate() - 90);
			this.endDateYear = e.detail.new.date.getFullYear();
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
		RENDER_CHIPS[FILTER_BY.STATUS] = event.detail.new;
		this._refineSearch();
	}

	_closeChip(type) {
		RENDER_CHIPS[type] = ``;
		const closeChip = {
			TEXT: this.searchTextLabel = `Search for amount or transaction name`,
			DATE: ``,
			STATUS: this.statuslabel = `Transaction Status`,
		};
		closeChip[type];
		this._refineSearch();
	}

	_clearFilters() {
		RENDER_CHIPS[FILTER_BY.TEXT] = ``;
		RENDER_CHIPS[FILTER_BY.DATE] = ``;
		RENDER_CHIPS[FILTER_BY.STATUS] = ``;
		this.searchTextLabel = `Search for amount or transaction name`;
		this.statuslabel = `Transaction Status`
		
		this.filteredData = this.transactionHistory;
		this.requestUpdate();
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialize(tableData) {
		tableData.map((item) => {
			const date = new Date(Date.parse(item.transactionDate));

			item.tranDate = date;
			item.groupByItem = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
			item.amount = this._formatAmount(item.amount)
			item.balance = this._formatAmount(item.balance)

			return item;
		});
		
		return tableData.filter(item => item.transactionStatus !== ``);
	}

	//To format the raw amount as per the design
	_formatAmount(amount){
		const currencyString = (amount >= 0) ? `R${amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}` : `- R${amount.toString().substring(1,).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}`;
		return currencyString.includes('.') ? currencyString : (currencyString + '.00');

	}

	_initialize(tableData) {
		tableData.length < 40 ? this.showLoadMore = false : this.showLoadMore = true
		tableData.map((item) => {
			const date = new Date(Date.parse(item.transactionDate));

			item.tranDate = date;
			item.groupByItem = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
			item.amount = item.amount > 0 ? `R${item.amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}.00` : `- R${item.amount.toString().substring(1,).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}.00`;
			item.balance = `R${item.balance.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}.00`;

			return item;
		});
		
		return tableData.filter(item => item.transactionStatus !== ``);
	}

	async _renderCollection(){

		const loadMoreData = (this.transactionHistory.length > 0) ? await this.dummyServiceCall() : [];
		if(loadMoreData.length > 0){
			this.rawData = [...this.rawData,...loadMoreData];
			const tableData = this._initialize(loadMoreData);
			this.transactionHistory = [...this.transactionHistory,...tableData];
		}
		if((!loadMoreData.length > 0) && this.transactionHistory.length>0){
			this.showLoadMore = false
		}
		this.filteredData = this.transactionHistory;
		this._refineSearch();
	}

	async dummyServiceCall(){
		const transactionHistoryRequest = {
			cifNumber: this.callerInformation.cifNumber,
			accountNumber: this.accountDetails.accountNumber,
			accountType: `PRIMARY_SAVINGS`,
			startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().substr(0,10),
			endDate: new Date().toISOString().substr(0,10),
			startAtIndex: this.rawData.length,
			maxResults: 40,
			moneyType: `BOTH`
		}
		const returnValue = await this.savingsAccountService.transactionHistory(transactionHistoryRequest);

		if(returnValue.succeeded && returnValue.result){
			return returnValue.result.transactions;
		}
	}

	_refineSearch() {

		this.filteredData = this.transactionHistory;
		if (RENDER_CHIPS[FILTER_BY.TEXT]) {
			const searchText = RENDER_CHIPS[FILTER_BY.TEXT].split(` `);

			const searchTextResult = searchText.map(key => { 
				if (key !== ``) {
					return this.filteredData.filter(item => item.description.toLowerCase().indexOf(key) !== -1 || parseInt(item.amount, 10) === parseInt(key, 10));
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

	_showCalendar() {
		this.renderMode = RENDER_MODE.CALENDAR;
	}

	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
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
					width: 1064px;
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
					width: 1064px;
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
					width: 1064px;
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
				.cb-datepicker > capitec-label {
					width: 143px;
					cursor: pointer;
					margin-left: 16.5px;
				
					margin-bottom: 2px;
					--theme-label-font-color: #3A3A3A;
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
					--theme-layout-gap-line-color: 0px;
					height: 679px;
					width: auto;
				}
				capitec-table{
					width: 1064px;
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
					--theme-modal-free-max-width: 695px;
				}
				div[slot="body"] {
					display: flex;
				}
				capitec-calendar {
					--theme-input-font-weight: 600;
					--theme-calendar-days-font-size: 15px;
					--theme-calendar-days-color: #3A3A3A;
					--theme-calendar-not-selectable-color: #969B9D;
					--theme-calendar-calendar-width: 347px;
					--theme-calendar-days-padding: 0px 18px;
					--theme-calendar-calendar-border-radius: 0px;
				}

				.transaction-status-select{
					--theme-input-label-font-size: 16px;
					--theme-input-padding-bottom: 12px;
					--theme-select-options-max-height: 304px;
					--theme-input-font-size: 16px;
					--theme-input-label-font-color: #3A3A3A;
					--theme-input-font-weight: 400;
					line-height: 20px;
					width: 224px;
				}
				.load-more-bar{
					--theme-actionbar-min-height: 48px;
					padding-top : 0px;
					padding-bottom: 0px; 
					--theme-actionbar-background: #f4f4f4;
				}
				.show-load-more{
					display: block;
				}
				.hide-load-more{
					display: none;
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
				<capitec-action-bar class="load-more-bar ${this.showLoadMore ? "show-load-more" : "hide-load-more"}">
						<capitec-spacer></capitec-spacer>
						<capitec-button type="clear" label="Load More" @click = ${() => this._renderCollection()}></capitec-button>
						<capitec-spacer></capitec-spacer>
				</capitec-action-bar>
				</capitec-group>
			</capitec-card>
			${this._renderCalendar()}
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
					label="Pending Amount"
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
					label=${this.searchTextLabel}
					type="search"
					keyboardMode="alpha-numeric"
					@key-input="${(e) => this._searchTextChange(e)}"
					@value-change="${(e) => this._searchTextChange(e)}"
					@focus="${(e) => this._searchTextFocussed(e)}"
					@blur="${(e) => this._searchTextBlur(e)}"
					value="${RENDER_CHIPS[FILTER_BY.TEXT]}">
				</capitec-text-field>
					
				<capitec-content-box
					class="cb-datepicker"
					layout="horizontal"
					halign="left" valign="center" gap="none"
					nopadding
					@click="${() => this._showCalendar()}">
						<capitec-label
							label="Choose a date"
							type="default"
							@click="${() => this._showCalendar()}">
						</capitec-label>
						<capitec-icon
							size="small"
							icon="system/calendar-action"
							@click="${() => this._showCalendar()}">
						</capitec-icon>
				</capitec-content-box>

				<capitec-select
					label="${RENDER_CHIPS[FILTER_BY.STATUS] !== '' ? '' : this.statuslabel}" 
					class="transaction-status-select"
					.items="${TRANSACTION_STATUS_LIST}"
					@focus="${(e) => this._statusFocussed(e)}"
					@value-change = "${(e) => this._filterByStatus(e)}"
					value = ${RENDER_CHIPS[FILTER_BY.STATUS]}
					hint="">
				</capitec-select>
			</capitec-group>
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
			return html`
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
				.items = "${this.filteredData}"
				groupField="groupByItem"
				displayMode="Full"
				expandable="right"
				?fixed = "${true}"
				.expandRenderer="${(item) => this._renderExpander(item)}">
					<capitec-table-column label="Transaction Date" field="transactionDate" type="date" size="156px;"></capitec-table-column>
					<capitec-table-column label="Description" field="description" size="410px;"></capitec-table-column>
					<capitec-table-column
						label="Transaction Status"
						field="transactionStatus"
						size="144px;" 
						.renderer="${(item, fieldName, value) => this._renderTransactionStatus(value)}">
					</capitec-table-column>
					<capitec-table-column label="Amount" field="amount" size="158px;" type="currency"></capitec-table-column>
					<capitec-table-column label="Balance" field="balance" size="130px;" type="currency" align ="right"></capitec-table-column>
			</capitec-table>

		`;
	}

	_renderTransactionStatus(value) {
		if (value === 'Processed'){
			return html ``;
		}else {
		return html`<div style = "${unsafeCSS(STATUS_TAG.tagContainer)} ${unsafeCSS(STATUS_TAG.tagType)}">
						<div style="${unsafeCSS(STATUS_TAG.tagLabel)}">${value}</div>
					</div>`;
		}

	}

	_renderExpander (item) {
		return html`
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}" 
				label="Statement description: ${item.description}">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction type"
					value = "${item.transactionType ? item.transactionType : '-'}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transfer account"
					value = "${item.transferAccount ? item.transferAccount : '-'}">
				</horizon-label>
				<horizon-label 
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date" 
					value = "${this._formatDate(item.postingDate)}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Processed date"
					value = "${this._formatDate(item.processDate)}">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction code"
					value = "${item.transactionCode  ? item.transactionCode : '-'}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card number"
					value = "${item.cardNumber ? item.cardNumber : '-'}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card authentication type"
					value = "${item.cardAuthType ? item.cardAuthType : '-'}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Journal number"
					value = "${item.journalNumber ? item.journalNumber : '-'}">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Includes Vat"
					value = "${item.includesVat ? 'Yes' : 'No'}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="External terminal ID"
					value = "${item.externalTerminalId ? item.externalTerminalId : '-'}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Cash back"
					value = "${item.cashback ? item.cashback : '-'}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Branch" 
					value = "${item.branch ? item.branch : '-'}">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Teller"
					value = "${item.teller ? item.teller : '-'}">
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
							month=${this.startDateMonth}
 							year="2021"
							startDate="${this.startDate}"
							endDate="${this.endDate}"

							minDate="${this.minDate}"

							@value-change="${(e) => this._startDateChanged(e)}"
							range>
						</capitec-calendar>
						<capitec-calendar 
							startDate="${this.startDate}"
							endDate="${this.endDate}"

							maxDate="${this.maxDate}"
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
							type="primary"
							@click=${() => this._apply()}>
						</capitec-button>
					</capitec-group>
					</div>
				</capitec-modal>
			`;
		}
	}
}

customElements.define(`horizon-transaction-history`, TransactionHistory);