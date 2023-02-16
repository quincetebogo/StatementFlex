import { Component, css, html } from 'platform/elements';
import { convertCentsToRand, formatDate, formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { DateTime } from 'luxon';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';
import 'app/components/dialogs/common/ConfirmPlaceHold';

const today = new Date();

const DATE_FORMAT = `dd mmm yyyy`;
const DATE_TIME_FORMAT = `dd mmm yyy hh:mm:ss`;

const DEFAULTS = { 
	SEARCH_TEXT_LABEL: `Search for amount, voucher/account no.`,
	CALENDAR_LABEL: `Choose a date`
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

const HOLD_RESTRICTION_SET = new Set([`Redeemable`, `Partial Redeemed`]);

/**
 * This component shows the send cash landing page.
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

		this.showConfirmPlaceHoldModal = false;
		this.filteredSendCashVouchers = [];

		this.searchTextLabel = DEFAULTS.SEARCH_TEXT_LABEL;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			filteredSendCashVouchers: { state: true },
			searchTextLabel: { state: true },
			showConfirmPlaceHoldModal: { state: true },

			getSendCashVouchers: { type: Object },
			disposeData: { type: Object },

			startDate: { type: String, state: true },
			endDate: { type: String, state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.filteredSendCashVouchers = this.sendCashVouchers;

		RENDER_CHIPS[FILTER_BY.TEXT] = ``;
		RENDER_CHIPS[FILTER_BY.DATE] = ``;
		RENDER_CHIPS[FILTER_BY.STATUS] = `ALL`;
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

	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`, {}));
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
			toDate = fromDate.plus({ days: 30 });
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
		} else if (e.detail.new.endDate === null || this.endDate === ``) {
			this.startDate = fromDate;
			toDate = fromDate.plus({ days: 30 });
			if (toDate.diff(currentDateTime, [`days`]).days > 0) {
				this.endDate = currentDateTime;
			} else {
				this.endDate = toDate;
			}
		} else if (e.detail.new.startDate === null || this.startDate === ``) {
			this.endDate = toDate;
			fromDate = toDate.minus({ days: 90 });
			this.startDate = fromDate;
		} else {
			this.startDate = fromDate;
			this.endDate = toDate;
		}

		RENDER_CHIPS[FILTER_BY.DATE] = this._getDateRange();

		await this._loadFilteredVouchers();

	}

	async _loadFilteredVouchers() {
		const startDate = DateTime.fromISO(this.startDate);
		const endDate = DateTime.fromISO(this.endDate);

		this.disposeData();
		this.sendCashVouchers = await this.getSendCashVouchers(startDate, endDate);

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
		RENDER_CHIPS[FILTER_BY.STATUS] = e.target.label.toUpperCase();

		this._refineSearch();
	}

	_refineSearch() {
		// Assigning the raw data before performing the filter
		this.filteredSendCashVouchers = this.sendCashVouchers;

		// Filtering while search on the text bar.
		if (RENDER_CHIPS[FILTER_BY.TEXT]) {
			const searchText = RENDER_CHIPS[FILTER_BY.TEXT].split(` `);

			const searchTextResult = searchText.map(key => {
				if (key !== ``) {
					return this.filteredSendCashVouchers.filter(item => item.voucherNumber.toString().includes(key) ||
																		item.amount.toString().startsWith(key) ||
																		item.sourceAccount.toString().startsWith(key));
				}
				return [];
			});
			this.filteredSendCashVouchers = Array.from(new Set([...searchTextResult.flat()]));
		}

		// Filtering by date.
		if (RENDER_CHIPS[FILTER_BY.DATE]) {
			const startDate = new Date(Date.parse(this.startDate));
			const endDate = new Date(Date.parse(this.endDate));

			this.filteredSendCashVouchers = this.filteredSendCashVouchers.filter(item => {
				const date = new Date(Date.parse(item.datetimeCreated)); 
				return date >= startDate && date <= endDate; 
			});
		}

		// Filtering by status.
		if (RENDER_CHIPS[FILTER_BY.STATUS]) {
			const status = RENDER_CHIPS[FILTER_BY.STATUS];

			if (status === `ALL`) {
				return this.filteredSendCashVouchers;
			}
			this.filteredSendCashVouchers = this.filteredSendCashVouchers.filter(item => item.voucherStatus.replace(`_`, ` `) === status);
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
		
		const resetForfilters = {
			'DATE': date,
			'TEXT': text
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

	_reset() {
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

	_closeChip(type) {
		this._clearFilter(type);
		this._refineSearch();
	}

	_onPlaceHoldClick(item) {
		this.dispatchEvent(new CustomEvent(`on-place-hold`, { detail: item.voucherNumber }));
	}

	_displayTooltip(e) {

		const tooltip = this.shadowRoot.getElementById(`tooltip-action`);
		const actionLabel = this.shadowRoot.getElementById(`action-label`);

		if (e.target.scrollWidth > e.target.offsetWidth) {
			tooltip.style.display = `flex`;
			actionLabel.style.display = `none`;
		}
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
				capitec-title-bar > capitec-icon {
					cursor: pointer;
				}
				capitec-content-box {
					--theme-container-padding-top: 8px;
					--theme-container-padding-right: 0px;
				}
				.transaction-action-bar {
					height: 64px;
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
				.transaction-action-bar > capitec-date-time-picker {
					height: 48px;
					--theme-layout-gap-spacing: 5px;
					--theme-date-time-picker-range-calendar-border: 160px;
					--theme-date-time-picker-medium-select-min-width: 160px;
					--theme-date-time-picker-range-calendar-min-width: 160px;
					--theme-date-time-picker-host-max-width: 160px;
				}
				.transaction-action-bar > capitec-chip {
					--theme-layout-gap-spacing: 5px;
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
				/* Chip Bar Styles */
				capitec-action-bar {
					--theme-actionbar-shadow: none;
					--theme-actionbar-min-height: 48px;
					--theme-actionbar-padding: 8px 0px 8px 16px;
				}
				capitec-action-bar > capitec-label {
					font-size: 15px;
					font-weight: 600;
					line-height: 30px;
				}
				capitec-action-bar > capitec-button {
					margin: 0px;

					--theme-button-font-size : 14px;
					--theme-button-line-height: 10px;
				}
				horizon-expander {
					height: auto;
					width: 1030px;
					--theme-expander-header-height: 64px;
					--theme-expander-indicator-right-margin: 0px;
				}
				horizon-label {
					width: 145px;

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
				horizon-label[value="On Hold"] {
					--horizon-label-value-color: #C83B37;
				}
				horizon-label[value="Redemption Authorised"] {
					--horizon-label-value-color: #D4781C;
				}
				horizon-label[value="Partial Redeemed"] {
					--horizon-label-value-color: #909090;
				}
				.sent-from-label {
					width: 170px;
				}
				.status-label {
					width: 195px;
				}
				.expander-content {
					height: auto;
					border-left: 1px solid #E1E1E1;
					border-bottom: 1px solid #E1E1E1;
					border-right: 1px solid #E1E1E1;
					border-radius: 0px 0px 4px 4px
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
				capitec-group[layout="grid"] {
					padding-left: 16px;
					padding-top: 20px;
					padding-bottom: 30px;
				}
				.headerRow {
					width: 145px;
					--theme-label-default-font-weight: 600;
				}
				.actionRow {
					width: 130px;
					--theme-label-default-font-weight: 600;
				}
				.detailsRow {
					width: 135px;
					margin-right: 10px;
				}
				.actionDesc {
					width: 430px;
				}
				.footer {
					width: 1029px;
					border-top: 1px solid #E1E1E1;
					--theme-container-padding-top: 8px;
					--theme-container-padding-bottom: 8px;
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 14px;
				}
				.footer > capitec-button {
					border-radius: 5px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-right: 24px;
					--theme-button-padding-bottom: 14px;
					--theme-button-padding-left: 24px;
				}
				capitec-label[label="Payout from merchant"] {
					padding-left: 16px;
					--theme-label-default-font-weight: 600;
				}
				.tooltip {
					display: inline-block;
					width: 135px; 
					white-space: nowrap; 
					overflow: hidden;
					text-overflow: ellipsis; 
				}
			`
		];
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
					${this._renderVouchers()}
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
					data-automation-id="send-cash-landing-text-filter">
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
					data-automation-id="send-cash-landing-date-filter">
				</capitec-date-time-picker>

				<capitec-chip 
					label="All" 
					class="${RENDER_CHIPS[FILTER_BY.STATUS] !== `ALL` ? `type-normal` : `type-selected`}" 
					@click="${(e) => this._selectedStatusType(e)}">
				</capitec-chip>
				<capitec-chip 
					label="Redeemable"
					class="${RENDER_CHIPS[FILTER_BY.STATUS] === `REDEEMABLE` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedStatusType(e)}">
				</capitec-chip>
				<capitec-chip 
					label="Redeemed" 
					class="${RENDER_CHIPS[FILTER_BY.STATUS] === `REDEEMED` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedStatusType(e)}">
				</capitec-chip>
				<capitec-chip 
					label="On hold"
					class="${RENDER_CHIPS[FILTER_BY.STATUS] === `ON HOLD` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedStatusType(e)}">
				</capitec-chip>
				<capitec-chip 
					label="Redemption Authorised"
					class="${RENDER_CHIPS[FILTER_BY.STATUS] === `REDEMPTION AUTHORISED` ? `type-selected` : `type-normal`}" 
					@click="${(e) => this._selectedStatusType(e)}">
				</capitec-chip>
			</capitec-group>
		`;
	}

	_renderFilterBar() {
		if (RENDER_CHIPS[FILTER_BY.TEXT] !== `` || RENDER_CHIPS[FILTER_BY.DATE] !== ``) {
			return html`
				<capitec-action-bar
					id="active-filters"
					data-automation-id="send-cash-landing-active-filters">
						<capitec-label label="Active filters:"></capitec-label>
							${this._renderTextChip()}
							${this._renderDateChip()}
						<capitec-button
							type="clear"
							label="Clear All"
							@click = "${() => this._clearFilters()}"
							data-automation-id="send-cash-landing-clear-active-filters">
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

	_renderVouchers() {
		return this.filteredSendCashVouchers.length > 0 
			? this._renderVoucherDetails()
			: this._renderNoResults();
	}

	_renderVoucherDetails() {
		return this.filteredSendCashVouchers.map((item) => html`
			<horizon-expander expandButtonAlignment="right">
					<capitec-group
						slot="custom-header"
						layout="horizontal"
						gap="clear"
						halign="left"
						valign="center">
							<horizon-label
								class="date-created-label"
								label="Date Created"
								value="${formatDate(item.datetimeCreated, DATE_TIME_FORMAT)}">
							</horizon-label>
							<horizon-label
								class="voucher-number-label"
								label="Voucher Number"
								value="${item.voucherNumber}">
							</horizon-label>
							<horizon-label
								class="amount-sent-label"
								label="Amount Sent"
								value="${formatCurrency(convertCentsToRand(item.amount))}">
							</horizon-label>
							<horizon-label
								class="from-account-label"
								label="From Account"
								value="${item.sourceAccount}">
							</horizon-label>
							<horizon-label
								class="sent-from-label"
								label="Sent From"
								value="${item.sourceSystem.replace(`_`, ` `)}">
							</horizon-label>
							<horizon-label
								class="status-label"
								label="Status"
								value="${formatStringAsPascalCase(item.voucherStatus.replace(`_`, ` `))}">
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

	_renderAdditionalDetails(item) {
		return html`
			<capitec-group layout="grid" gap="none" columns="5" rows="${item.statusChange.length}">
				<capitec-label class="headerRow" label="Date" row="1" column="1"></capitec-label>
				<capitec-label class="headerRow" label="Event Amount" row="1" column="2"></capitec-label>
				<capitec-label class="headerRow" label="Remaining Amount" row="1" column="3"></capitec-label>
				<capitec-label class="headerRow" label="Action" row="1" column="4"></capitec-label>
				<capitec-label class="headerRow" label="Action description" row="1" column="5"></capitec-label>

				${item.statusChange.map((element, index) => this._renderVoucherInfo(element, index + 2))}

			</capitec-group>

			${this._renderMerchantList(item)}

			${this._renderFooter(item)}
		`;
	}

	_renderVoucherInfo(element, index) {
		return html`
			<capitec-label class="detailsRow" label="${formatDate(element.changeDateTime, DATE_TIME_FORMAT)}" row="${index}" column="1"></capitec-label>
			<capitec-label class="detailsRow" label="${formatCurrency(convertCentsToRand(element.eventAmount))}" row="${index}" column="2"></capitec-label>
			<capitec-label class="detailsRow" label="${formatCurrency(convertCentsToRand(element.remainingOrderAmount))}" row="${index}" column="3"></capitec-label>

			<capitec-label 
				id="action-label"
				class="detailsRow tooltip"
				label="${element.action ? formatStringAsPascalCase(element.action) : `-`}"
				@mouseover="${(e) => this._displayTooltip(e)}"
				row="${index}" 
				column="4">
			</capitec-label>
			<capitec-tooltip
						id="tooltip-action"
						message="${element.action ? formatStringAsPascalCase(element.action) : `-`}"
						position="bottom"
						row="${index}" 
						column="4"
						width="200px">
				<capitec-label 
						class="tooltip" 
						label="${element.action ? formatStringAsPascalCase(element.action) : `-`}">
				</capitec-label>
			</capitec-tooltip>

			<capitec-label class="actionDesc" label="${element.actionDescription ? formatStringAsPascalCase(element.actionDescription) : `-`}" row="${index}" column="5"></capitec-label>
		`;
	}

	_renderMerchantList(item) {
		return item.merchantStatusList.length > 0
		? html`
			<capitec-label label="Payout from merchant"></capitec-label>

			<capitec-group layout="grid" gap="none" columns="5" rows="${item.merchantStatusList.length}">
				<capitec-label class="headerRow" label="Date" row="1" column="1"></capitec-label>
				<capitec-label class="headerRow" label="Status" row="1" column="2"></capitec-label>
				<capitec-label class="headerRow" label="City" row="1" column="3"></capitec-label>
				<capitec-label class="headerRow" label="Merchant Name" row="1" column="4"></capitec-label>
				<capitec-label class="actionRow" label="Merchant ID" row="1" column="5"></capitec-label>
				<capitec-label class="actionRow" label="Amount" row="1" column="6"></capitec-label>
				<capitec-label class="actionRow" label="Country" row="1" column="7"></capitec-label>

				${item.merchantStatusList.map((element, index) => this._renderMerchantInfo(element, index + 2))}

			</capitec-group>`

		: html``;
	}

	_renderMerchantInfo(element, index) {
		return html`
			<capitec-label label="${formatDate(element.merchantTimeStamp, DATE_TIME_FORMAT)}" row="${index}" column="1"></capitec-label>
			<capitec-label label="${element.merchantStatus}" row="${index}" column="2"></capitec-label>
			<capitec-label label="${element.city}" row="${index}" column="3"></capitec-label>
			<capitec-label label="${element.merchantName}" row="${index}" column="4"></capitec-label>
			<capitec-label label="${element.merchantId}" row="${index}" column="5"></capitec-label>
			<capitec-label label="${formatCurrency(convertCentsToRand(element.merchantAmount))}" row="${index}" column="6"></capitec-label>
			<capitec-label label="${element.country}" row="${index}" column="7"></capitec-label>
		`;
	}

	_renderFooter(item) {
		if (HOLD_RESTRICTION_SET.has(formatStringAsPascalCase(item.voucherStatus.replace(`_`, ` `)))) {
			return html`
				<capitec-content-box layout="horizontal" halign="right" valign="center" gap="clear" class="footer">
					<capitec-button
							type="primary" 
							label="Place hold"
							?hidden="${!HOLD_RESTRICTION_SET.has(formatStringAsPascalCase(item.voucherStatus.replace(`_`, ` `)))}"
							@click="${() => this._onPlaceHoldClick(item)}">
					</capitec-button>
				</capitec-content-box>
			`;
		}
	}

}

customElements.define(`horizon-send-cash-landing`, SendCashLanding);