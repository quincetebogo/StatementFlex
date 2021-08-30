import { Component, css, html, unsafeCSS } from 'platform/elements';
import { EXPANDER_LABEL, STATUS_TAG, TABLE_EXPANDER_CELL } from 'app/css/TransactionHistory';
import { formatCurrency, getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { DateTime } from 'luxon';
import { SavingsAccountService } from 'app/services/SavingsAccountService';

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
	`Fee`,
    `Financial`,
    `Non Financial`,
    `Processing`,
    `Reversed`

];

// ninety days in milliseconds
const NINETY_DAYS = 7777000000;

const TRANSACTION_HISTORY = {
    ACCOUNT_TYPE: `PRIMARY_SAVINGS`,
    END_DATE: new Date().toISOString().substr(0, 10),
    START_DATE: new Date(`January 01, 2000`).toISOString().substr(0, 10),
    MAX_RESULTS: 50,
    MONEY_TYPE: `BOTH`
};

const today = new Date();

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
        this.callerInformation = null;

        this.isBusy = false;

        // private properites
        this.renderMode = RENDER_MODE.MAIN_PAGE;
        this.showLoadMore = true;

        this.startDate = ``;
        this.endDate = ``;
        this.errorMessage = ``;
        this.calendarError = ``;

        this.filteredData = [];
        this.rawTableData = [];
        this.searchTextLabel = `Search for amount or transaction name`;
        this.statuslabel = `Transaction status`;

        this.startTransactionDate = null; /* new Date("January 01, 2000"); */
        this.endTransactionDate = null; /* new Date(); */

        this.savingsAccountService = new SavingsAccountService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
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
            callerInformation: { type: Object },

            filteredData: { attribute: false },
            renderMode: { attribute: false },
            isBusy: { attribute: false },
            startDate: { type: String, attribute: false },
            endDate: { type: String, attribute: false },
            searchTextLabel: { attribute: false },
            statuslabel: { attribute: false }
        };
    }

    // -------------------
    // LIFECYCLE OVERRIDES
    // -------------------

    connectedCallback() {
        super.connectedCallback();

        this.rawTableData = this.transactionHistory;
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

    // To hide or show the label for the search text field according to the design requirement.
    _searchTextFocussed(e) {
        this.searchTextLabel = ``;
    }

    _searchTextBlur(e) {
        if (RENDER_CHIPS[FILTER_BY.TEXT] === ``) {
            this.searchTextLabel = `Search for amount or transaction name`;
        }
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

    _dateChanged(e) {
        let fromDate = DateTime.fromISO(e.detail.new.startDate);
        let toDate = DateTime.fromISO(e.detail.new.endDate);
        const today = DateTime.local();


        if (toDate.diff(fromDate, [`days`]).days > 90) {
            
            toDate = fromDate.plus({ days: 90 });
            if (toDate > today) {
                this.startDate = fromDate;
                this.endDate = today;

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
                if (toDate.diff(today, [`days`]).days > 0) {
                    this.endDate = today;
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
        this.startTransactionDate = this.startDate;
        this.endTransactionDate = this.endDate;
        this._loadFilteredTransactions();
        this.requestUpdate();

    }

    async _populateTransactions() {
        const transactionHistoryRequest = {
            cifNumber: this.callerInformation.cifNumber,
            accountNumber: this.accountDetails.accountNumber,
            accountType: TRANSACTION_HISTORY.ACCOUNT_TYPE,
            startDate: this.startTransactionDate.toLocaleString().slice(0, 10),
            endDate: this.endTransactionDate.toLocaleString().slice(0, 10),
            startAtIndex: 0,
            maxResults: TRANSACTION_HISTORY.MAX_RESULTS,
            moneyType: TRANSACTION_HISTORY.MONEY_TYPE
        };

        const returnValue = await this.savingsAccountService.transactionHistory(transactionHistoryRequest);
        if (returnValue.succeeded && returnValue.result) {
            return returnValue.result.transactions;
        }
    }

    async _loadFilteredTransactions() {

        const loadMoreData = await this._populateTransactions();

		if (loadMoreData.length > 0) {
            this.rawTableData = loadMoreData;
            this.transactionHistory = this._initialize(loadMoreData);
        }
        if (!loadMoreData.length > 0 && this.transactionHistory.length > 0) {
            this.showLoadMore = false;
        }
        this.filteredData = this.transactionHistory;
        this._refineSearch();
    }

    _filterByStatus(event) {
        RENDER_CHIPS[FILTER_BY.STATUS] = event.detail.new;
        this._refineSearch();
    }

    _closeChip(type) {
        RENDER_CHIPS[type] = ``;
        this._reset();
        this._refineSearch();
    }

    _clearFilters() {
        RENDER_CHIPS[FILTER_BY.TEXT] = ``;
        RENDER_CHIPS[FILTER_BY.DATE] = ``;
        RENDER_CHIPS[FILTER_BY.STATUS] = ``;
        this._reset();

        this.filteredData = this.transactionHistory;
        this.requestUpdate();
    }

    // To scroll the content of the Table to the Top when scroll to Top button is clicked
    _scrollToTop(e) {
        const element = this.shadowRoot.getElementById(`transactions-table`);
        element.scrollTop = 0;
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

    _initialize(tableData) {
        this.showLoadMore = !(tableData.length < TRANSACTION_HISTORY.MAX_RESULTS);

        tableData.map((item) => {
            const date = new Date(Date.parse(item.transactionDate));

            item.tranDate = date;
            item.groupByItem = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
            item.formatedAmount = formatCurrency(item.amount);
            item.formatedBalance = formatCurrency(item.balance);

            return item;
        });
        return tableData.filter(item => item.transactionStatus !== ``);
    }

    // To set the values to default on closing the chip or clearing all the filters
    _reset() {
        this.showLoadMore = true;
        this.searchTextLabel = RENDER_CHIPS[FILTER_BY.TEXT] === `` ? `Search for amount or transaction name` : ``;
        this.statuslabel = RENDER_CHIPS[FILTER_BY.STATUS] === `` ? `Transaction status` : ``;
        if (isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE])) {
            this.startDate = ``;
            this.endDate = ``;
            this.startTransactionDate = new Date(`January 01, 2000`);
            this.endTransactionDate = new Date();

            const calendar = this.shadowRoot.querySelector(`#calendarRange`);
            if (calendar) {
                calendar._placeholderEndDate = null;
                calendar._placeholderStartDate = null;
            }
			this._loadFilteredTransactions();
        }
    }

    async _loadMoreTransactions() {
        const loadMoreData = this.transactionHistory.length > 0 ? await this.getMoreTransactions() : [];
        if (loadMoreData.length > 0) {
            this.rawTableData = [...this.rawTableData, ...loadMoreData];
            const tableData = this._initialize(loadMoreData);
            this.transactionHistory = [...this.transactionHistory, ...tableData];
        }
        if (!loadMoreData.length > 0 && this.transactionHistory.length > 0) {
            this.showLoadMore = false;
        }
        this.filteredData = this.transactionHistory;
        this._refineSearch();
    }

    async getMoreTransactions() {
		const startDate = this.startTransactionDate && this.startTransactionDate.toLocaleString().slice(0, 10);
		const endDate = this.endTransactionDate && this.endTransactionDate.toLocaleString().slice(0, 10);

        const transactionHistoryRequest = {
            cifNumber: this.callerInformation.cifNumber,
            accountNumber: this.accountDetails.accountNumber,
            accountType: TRANSACTION_HISTORY.ACCOUNT_TYPE,
            startDate: startDate || TRANSACTION_HISTORY.START_DATE,
            endDate: endDate || TRANSACTION_HISTORY.END_DATE,
            startAtIndex: this.rawTableData.length,
            maxResults: TRANSACTION_HISTORY.MAX_RESULTS,
            moneyType: TRANSACTION_HISTORY.MONEY_TYPE
        };
        const returnValue = await this.savingsAccountService.transactionHistory(transactionHistoryRequest);
        if (returnValue.succeeded && returnValue.result) {
            return returnValue.result.transactions;
        }
    }

	_refineSearch() {
		this.filteredData = this.transactionHistory;

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

		if (RENDER_CHIPS[FILTER_BY.STATUS]) {
			const status = RENDER_CHIPS[FILTER_BY.STATUS];

			this.filteredData = this.filteredData.filter(item => item.transactionStatus === status);
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
        return `${fromDate} - ${toDate}`;
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
					width: var(--horizon-center-panel-width, 1064px);
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
					width: var(--horizon-center-panel-width, 1064px);
				}
				.transaction-action-bar > capitec-text-field {
					height: 47px;
					width: 388px;
					padding-left: 16px;
				
					--theme-label-font-color: #3A3A3A;
					--theme-input-label-font-size: 16px;
					--theme-layout-gap-spacing: 16px;
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
					height: 661px;
					width: auto;
				}
				capitec-table{
					width: var(--horizon-center-panel-width, 1064px);
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
				.scroll-top {
					--theme-icon-size-medium: 26px;
    				padding-top: 12px;
					cursor: pointer;
				}
                capitec-date-time-picker{
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-date-time-picker-range-calendar-border: 0px;
                    margin-right: 16px;
                    width: 280px;
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
				<capitec-action-bar class="load-more-bar ${this.showLoadMore ? `show-load-more` : `hide-load-more`}">
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
				</capitec-action-bar>
				</capitec-group>
			</capitec-card>
			${this._renderLoadingIndicator()}
		`;
    }

    _renderAlertBanner() {
        if (this.errorMessage) {
            return html`
				<capitec-alert-banner
					type="unsuccessful-red"
					data-automation-id="transaction-history-alert-banner">
						<p><b>Notify:</b> ${this.errorMessage}</p>
				</capitec-alert-banner>`;
        }
        return html``;
    }

    _renderLoadingIndicator() {
        return this.isBusy
            ? html`<capitec-loading-indicator></capitec-loading-indicator>`
            : html``;
    }

    _renderTitleBar() {
        return html`
			<capitec-title-bar class="transaction-history-title" type="transact">
				<img
					src="/images/insure/left-arrow.svg"
					@click="${() => this._back()}"
					data-automation-id="transaction-history-back" />
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
					label="Account number"
					value="${this.accountDetails.accountNumber}"
					data-automation-id="transaction-history-acc-number">
				</horizon-label>
				<horizon-label
					label="Balance"
					value="${formatCurrency(this.accountDetails.balance)}"
					data-automation-id="transaction-history-acc-bal">
				</horizon-label>
				<horizon-label
					label="Available balance"
					value="${formatCurrency(this.accountDetails.availableBalance)}"
					data-automation-id="transaction-history-available-bal">
				</horizon-label>
				<horizon-label
					label="Pending amount"
					value="${formatCurrency(this.accountDetails.pendingAmount)}"
					data-automation-id="transaction-history-pending-amount">
				</horizon-label>
				<horizon-label
					label="Interest"
					value="${this.accountDetails.interest}%"
					data-automation-id="transaction-history-acc-interest">
				</horizon-label>
				<horizon-label
					label="Status"
					value="${this.accountDetails.status}"
					data-automation-id="transaction-history-acc-status">
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
					data-automation-id="transaction-status-filter">
				</capitec-select>
			</capitec-group>
		`;
    }

    _renderFilterBar() {
        if (RENDER_CHIPS[FILTER_BY.TEXT] !== `` || RENDER_CHIPS[FILTER_BY.DATE] !== `` || RENDER_CHIPS[FILTER_BY.STATUS] !== ``) {
            return html`
				<capitec-action-bar
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
				.expandRenderer="${(item) => this._renderExpander(item)}"
				data-automation-id="transaction-history-table">
					<capitec-table-column label="Transaction Date" field="transactionDate" type="date" size="156px;"></capitec-table-column>
					<capitec-table-column label="Description" field="description" size="410px;"></capitec-table-column>
					<capitec-table-column label="Transaction Status" field="transactionStatus" size="144px;"
					.renderer="${(item, fieldName, value) => this._renderTransactionStatus(value)}">
					</capitec-table-column>
					<capitec-table-column label="Amount" field="formatedAmount" size="158px;" type="currency"></capitec-table-column>
					<capitec-table-column label="Balance" field="formatedBalance" size="130px;" type="currency" align ="right"></capitec-table-column>
			</capitec-table>
		`;
	}

	_renderTransactionStatus(value) {
		return value === `Processed`
			? html``
			: html`
				<div style="${unsafeCSS(STATUS_TAG.tagContainer)} ${unsafeCSS(STATUS_TAG.tagType)}">
					<div style="${unsafeCSS(STATUS_TAG.tagLabel).toString()}">${value}</div>
				</div>`;
    }

    _renderExpander(item) {
        return html`
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
				label="Statement description: ${item.description}"
				data-automation-id="transaction-history-item-description">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction type"
					value = "${item.transactionType ? item.transactionType : `-`}"
					data-automation-id="transaction-history-item-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transfer account"
					value = "${item.transferAccount ? item.transferAccount : `-`}"
					data-automation-id="transaction-history-item-transfer-account">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date" 
					value = "${this._formatDate(item.postingDate)}"
					data-automation-id="transaction-history-item-posting-date">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Processed date"
					value = "${this._formatDate(item.processDate)}"
					data-automation-id="transaction-history-item-processed-date">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction code"
					value = "${item.transactionCode ? item.transactionCode : `-`}"
					data-automation-id="transaction-history-item-code">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card number"
					value = "${item.cardNumber ? item.cardNumber : `-`}"
					data-automation-id="transaction-history-item-card-number">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card authentication type"
					value = "${item.cardAuthType ? item.cardAuthType : `-`}"
					data-automation-id="transaction-history-item-card-auth-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Journal number"
					value = "${item.journalNumber ? item.journalNumber : `-`}"
					data-automation-id="transaction-history-item-journal-number">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Includes Vat"
					value = "${item.includesVat ? `Yes` : `No`}"
					data-automation-id="transaction-history-item-includes-vat">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="External terminal ID"
					value = "${item.externalTerminalId ? item.externalTerminalId : `-`}"
					data-automation-id="transaction-history-item-terminalID">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Cash back"
					value = "${item.cashback ? item.cashback : `-`}"
					data-automation-id="transaction-history-item-cashback">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Branch" 
					value = "${item.branch ? item.branch : `-`}"
					data-automation-id="transaction-history-item-branch">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Teller"
					value = "${item.teller ? item.teller : `-`}"
					data-automation-id="transaction-history-item-teller">
				</horizon-label>
			</capitec-group>
		`;
    }

}

customElements.define(`horizon-transaction-history`, TransactionHistory);