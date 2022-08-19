import { Component, css, html } from 'platform/elements';
import { SendCashLandingMocks } from 'app/mocks/SendCashMocks';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';
import { DateTime } from 'luxon';

const today = new Date();
const DATE_FORMAT = `dd mmm yyyy`;

const DEFAULTS = { 
	SEARCH_TEXT_LABEL: `Search for amount, voucher/account no.`,
	CALENDAR_LABEL: `Choose a date`
};

const FILTER_BY = {
	ALL: `ALL`,
	TEXT: `TEXT`,
	DATE: `DATE`,
	STATUS: `STATUS`,
};

const RENDER_CHIPS = {
	TEXT: ``,
	DATE: ``,
	STATUS: ``
};

/**
 * This component implements the update card limits for Quick Transactions
 *
 * Events Raised 
 * -------------
 * back
 * 
 * @export
 * @class SendCashLanding
 * @extends {Component}
 */

export class SendCashLanding extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.startDate = ``;
		this.endDate = ``;

		this.sendCashDetails = [];
		this.filteredSendCashDetails = [];

		this.searchTextLabel = DEFAULTS.SEARCH_TEXT_LABEL;
		this.statuslabel = DEFAULTS.STATUS_LABEL;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			sendCashDetails: { state: true },
			filteredSendCashDetails: { state: true },
			startDate: { type: String, state: true },
			endDate: { type: String, state: true },
			searchTextLabel: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.sendCashDetails = SendCashLandingMocks.sendCashSummaryList;
		this.filteredSendCashDetails = this.sendCashDetails;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
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
		const last14day = new Date(today);
		const last25day = new Date(today);
		const last30day = new Date(today);

		last7day.setDate(today.getDate() - 7);
		last14day.setDate(today.getDate() - 14);
		last25day.setDate(today.getDate() - 25);
		last30day.setDate(today.getDate() - 30);

		return [
			{ text: `Last 7 days`, value: { startDate: last7day.toISOString(), endDate: today.toISOString() } },
			{ text: `Last 14 days`, value: { startDate: last14day.toISOString(), endDate: today.toISOString() } },
			{ text: `Last 25 days`, value: { startDate: last25day.toISOString(), endDate: today.toISOString() } },
			{ text: `Last 30 days`, value: { startDate: last30day.toISOString(), endDate: today.toISOString() } }
		];
	}

	async _dateChanged(e) {
		let fromDate = DateTime.fromISO(e.detail.new.startDate);
		let toDate = DateTime.fromISO(e.detail.new.endDate);
		const currentDateTime = DateTime.local();

		if (toDate.diff(fromDate, [`days`]).days > 30) {
			toDate = fromDate.plus({days:30});
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
			toDate = fromDate.plus({days:30});
			if (toDate.diff(currentDateTime,[`days`]).days > 0) {
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

		this._refineSearch();
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

	_selectedStatusType(e) {
		RENDER_CHIPS[FILTER_BY.STATUS] = e.target.label;

		this._refineSearch();
	}

	_refineSearch() {
		// Assigning the raw data before performing the filter
		this.filteredSendCashDetails = this.sendCashDetails;

		if (RENDER_CHIPS[FILTER_BY.TEXT]) {
			const searchText = RENDER_CHIPS[FILTER_BY.TEXT].split(` `);

			const searchTextResult = searchText.map(key => {
				if (key !== ``) {
					// if (key.startsWith(`-`)) {
					// 	return this.filteredSendCashDetails.filter(item => parseFloat(item.amountSent).toFixed(2).startsWith(key));
					// }

					return this.filteredSendCashDetails.filter(item => item.voucherNumber.toString().includes(key) ||
																	   item.amountSent.toString().startsWith(key) ||
																	   item.fromAccount.toString().startsWith(key));
				}
				return [];
			});
			this.filteredSendCashDetails = Array.from(new Set([...searchTextResult.flat()]));
			console.log(this.filteredSendCashDetails);
		}

		if (RENDER_CHIPS[FILTER_BY.DATE]) {
			const startDate = new Date(Date.parse(this.startDate));
			const endDate = new Date(Date.parse(this.endDate));

			this.filteredSendCashDetails = this.filteredSendCashDetails.filter(item => {
				const date = new Date(Date.parse(item.dateCreated)); 
				return date >= startDate && date <= endDate; 
			});
			console.log(this.filteredSendCashDetails);
		}

		if (RENDER_CHIPS[FILTER_BY.STATUS]) {
			const status = RENDER_CHIPS[FILTER_BY.STATUS];

			if (status === `All`) {
				return this.filteredSendCashDetails;
			}
			this.filteredSendCashDetails = this.filteredSendCashDetails.filter(item => item.status === status);
		}

		this.requestUpdate();
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

	async _reset() {
		if (isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE])) {
			this.startDate = ``;
			this.endDate = ``;

			const calendar = this.shadowRoot.querySelector(`#calendarRange`);
			if (calendar) {
				calendar._placeholderEndDate = null;
				calendar._placeholderStartDate = null;
			}
			this._refineSearch();
		}
	}

	async _closeChip(type) {
		this._clearFilter(type);
		this._refineSearch();
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

	static get styles() {
		return [
			super.styles,
			css`
				capitec-card {
					height: var(--horizon-panel-height, 888px);
					width: var(--horizon-center-panel-width, 1064px);
					--theme-card-border-radius: 5px;
					--theme-card-box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}

				capitec-title-bar {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
					--theme-titlebar-shadow: none;
					--theme-titlebar-border: 1px solid #E1E1E1;
				}
				capitec-content-box {
					--theme-container-padding-top: 8px;
				}
				.transaction-action-bar {
					height: 64px;
					--horizon-center-panel-width: 130px;
				}
				.transaction-action-bar > capitec-text-field {
					height: 48px;
					width: 315px;
					--theme-input-label-font-size: 12px;
					--theme-label-font-color: #3A3A3A;
					--theme-input-label-font-size: 14px;
					--theme-layout-gap-spacing: 5px;
					--theme-input-clear-icon-height: 0px;
					--theme-input-clear-icon-width: 0px;
				}
				.transaction-action-bar > capitec-chip {
					--theme-layout-gap-spacing: 5px;
					--theme-chip-label-padding-left: 11px;
					--theme-chip-label-padding-right: 11px;
					--theme-chip-label-line-height: 19px;
				}
				.transaction-action-bar > capitec-date-time-picker {
					height: 48px;
					--theme-layout-gap-spacing: 5px;
					--theme-date-time-picker-range-calendar-border: 160px;
					--theme-date-time-picker-medium-select-min-width: 160px;
					--theme-date-time-picker-range-calendar-min-width: 160px;
					--theme-date-time-picker-host-max-width: 160px;
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
				.expander-header > capitec-icon {
					--theme-icon-size-default: 20px;
					--theme-layout-gap-spacing: 0px;
					margin-left: 16px;
				}

				horizon-label {
					width: 158px;

					--theme-layout-gap-spacing: 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}
				horizon-label[value="Redeemable"] {
					--horizon-label-value-color: #70AF00;
				}
				horizon-label[value="On hold"] {
					--horizon-label-value-color: #C83B37;
				}
				horizon-label[value="Redemption Authorised"] {
					--horizon-label-value-color: #D4781C;
				}
				.date-created-label {
					width: 150px;
				}
				.voucher-number-label {
					width: 150px;
				}
				.amount-sent-label {
					width: 150px;
				}
				.from-account-label {
					width: 150px;
				}
				.sent-from-label {
					width: 130px;
				}
				.status-label {
					width: 204px;
				}
				horizon-expander {
					height: auto;
					--theme-expander-header-height: 64px;
				}
				.expander-content {
					height: auto;
					border-left: 1px solid #E1E1E1;
					border-bottom: 1px solid #E1E1E1;
					border-right: 1px solid #E1E1E1;
					border-radius: 0px 0px 4px 4px
				}
				capitec-table {
					--theme-data-table-header-background-color: #FFFFFF;

					--theme-data-table-padding-left: 15px;
					--theme-data-table-padding-right: 15px;
				}
				capitec-action-bar {
					--theme-actionbar-shadow: none;
				}
				.no-result-group {
					width: 1062px;
					margin-top: 130px;
				}
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
			`
		]
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card>
				${this._renderTitleBar()}
				<capitec-content-box>
					${this._renderActionBar()}
					${this._renderFilterBar()}
					${this._renderContent()}
				</capitec-content-box>
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar>
				<capitec-icon
					data-automation-id="send-cash-landing-back"
					size="small"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Send Cash" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderActionBar() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="transaction-action-bar">
				<capitec-text-field
					id="text-filter"
					label="${this.searchTextLabel}"
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
					label="${DEFAULTS.CALENDAR_LABEL}"
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
					label="All" 
					class="${RENDER_CHIPS[FILTER_BY.STATUS] === `All` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedStatusType(e)}">
				</capitec-chip>
				<capitec-chip 
					label="Redeemable"
					class="${RENDER_CHIPS[FILTER_BY.STATUS] === `Redeemable` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedStatusType(e)}">
				</capitec-chip>
				<capitec-chip 
					label="Redeemed" 
					class="${RENDER_CHIPS[FILTER_BY.STATUS] === `Redeemed` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedStatusType(e)}">
				</capitec-chip>
				<capitec-chip 
					label="On hold"
					class="${RENDER_CHIPS[FILTER_BY.STATUS] === `On hold` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedStatusType(e)}">
				</capitec-chip>
				<capitec-chip 
					label="Redemption Authorised"
					class="${RENDER_CHIPS[FILTER_BY.STATUS] === `Redemption Authorised` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedStatusType(e)}">
				</capitec-chip>
			</capitec-group>
		`;
	}

	_renderFilterBar() {
		if (RENDER_CHIPS[FILTER_BY.TEXT] !== `` || RENDER_CHIPS[FILTER_BY.DATE] !== `` || RENDER_CHIPS[FILTER_BY.STATUS] !== ``) {
			return html`
				<capitec-action-bar
					id="active-filters"
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
		return !isNullorEmpty(RENDER_CHIPS[FILTER_BY.TEXT])
			? html`
				<capitec-chip
					id="${FILTER_BY.TEXT}"
					label="${RENDER_CHIPS[FILTER_BY.TEXT]}"
					@remove="${() => this._closeChip(FILTER_BY.TEXT)}"
					closable>
				</capitec-chip>`
			: html``;
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

	_renderStatusChip() {
		return !isNullorEmpty(RENDER_CHIPS[FILTER_BY.STATUS])
			? html`
				<capitec-chip
					id="${FILTER_BY.STATUS}"
					label="${RENDER_CHIPS[FILTER_BY.STATUS]}"
					@remove="${() => this._closeChip(FILTER_BY.STATUS)}"
					closable>
				</capitec-chip>`
			: html``;
	}

	_renderContent() {

		return this.filteredSendCashDetails.length > 0 
			? this._renderSendCashContent()
			: this._renderNoResults();
	}
			
	_renderSendCashContent() {
		return this.filteredSendCashDetails.map((item) => html`
			<horizon-expander expandButtonAlignment="right">
					<capitec-group
						class="expander-header"
						slot="custom-header"
						layout="horizontal"
						gap="clear"
						halign="left"
						valign="center">
							<horizon-label 
								data-automation-id="credit-account-access-facility"
								class="date-created-label"
								label="Date Created"
								value="${item.dateCreated}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-balance"
								class="voucher-number-label"
								label="Voucher Number"
								value="${item.voucherNumber}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-available-balance"
								class="amount-sent-label"
								label="Amount Sent"
								value="${formatCurrency(item.amountSent)}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-credit-limit"
								class="from-account-label"
								label="From Account"
								value="${item.fromAccount}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-next-instalment"
								class="sent-from-label"
								label="Sent From"
								value="${item.sentFrom}">
							</horizon-label>
							<horizon-label
								data-automation-id="credit-account-status"
								class="status-label"
								label="Status"
								value="${item.status}">
							</horizon-label>
					</capitec-group>
					<div slot="content">
						<capitec-group 
							class="expander-content" 
							layout="vertical"
							gap="none"
							halign="left"
							valign="center">
								${this._renderAdditionalDetails(item)}
						</capitec-group>
					</div>
			</horizon-expander>
		`);
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
			</capitec-group>
		`;
	}

	// <capitec-label
	// 					label="No transactions made in the last 6 months"
	// 					type="strong">
	// 				</capitec-label>
	_renderAdditionalDetails(item) {
		return html`
			<capitec-table
				.items="${item.addDetails}"
				displayMode="Full"
				?fixed = "${true}"
				data-automation-id="transaction-history-table">
					${this._renderTableColumns(item)}
			</capitec-table>
		`;
	}
	//.expandRenderer="${(item) => this._renderTransactionDetails(item)}"
	// _renderTransactionDetails(item) {	
	// 	return html`	
	// 		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
	// 			<capitec-label
	// 				label="${item.addDetails.date}"
	// 				data-automation-id="transaction-history-item-type">
	// 			</capitec-label>
	// 			<capitec-label
	// 				label="${item.addDetails.eventAmount}"
	// 				data-automation-id="transaction-history-item-transfer-account">
	// 			</capitec-label>
	// 			<capitec-label
	// 				label= "${item.addDetails.remAmount}"
	// 				data-automation-id="transaction-history-item-posting-date">
	// 			</capitec-label>
	// 			<capitec-label
	// 				label="${item.addDetails.action}"
	// 				data-automation-id="transaction-history-item-processed-date">
	// 			</capitec-label>
	// 			<capitec-label
	// 				label="${item.addDetails.actionDescription}"
	// 				data-automation-id="transaction-history-item-processed-date">
	// 			</capitec-label>
	// 		</capitec-group>
	// 	`;
	// }

	_renderTableColumns() {
		return html`
			<capitec-table-column
				label="Date"
				field="date"
				size="130px;">
			</capitec-table-column>
			<capitec-table-column
				label="Event Amount"
				field="eventAmount"
				size="130px;">
			</capitec-table-column>
			<capitec-table-column
				label="Remaining Amount"
				field="remAmount"
				size="130px;">
			</capitec-table-column>
			<capitec-table-column
				label="Action"
				field="action"
				size="130px;">
			</capitec-table-column>
			<capitec-table-column
				label="Action description"
				field="actionDescription"
				size="275px;">
			</capitec-table-column>
		`;
	}
}

customElements.define(`horizon-send-cash-landing`, SendCashLanding);