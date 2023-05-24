import { Component, css, html } from 'platform/elements';
import { FILTER_BY, NINETY_DAYS, RENDER_CHIPS } from 'app/constants/InsureTransactionHistory';
import { formatDate, getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { getDateRangeDisplayValue, getPredefinedDateRanges } from 'app/utils/insureUtils';
import { DateTime } from 'luxon';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_TRANSACTIONS_CSS } from 'app/css/PolicyTransactionHistory';
import { SMSHistoryEvents } from 'app/constants/telemetry/events/Insure';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

// #region CONSTANTS

const today = new Date();

// #endregion CONSTANTS

/**
 * the SMS History page displays the SMS History for the chosen policy
 *  
 * Events Raised:
 * --------------
 * 
 * @export
 * @class SMSHistory
 * @extends {Component}
 */
class SMSHistory extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		this._telemetry = HorizonTelemetry.getInstance();
		this.telemetryEvents = {};
		this.commsHistory = [];
	}

	// #endregion

	// #region PROPERTIES

	/**
	 * @property {String} startDate - String holds Start date of transaction/due date 
	 * @property {String} endDate - String holds End date of transaction/due date
	 * @property {String} contractReference contains the policy number
	 * @property {String} contactNumber contains the callers verified contact number
	 * @property {Object} commsHistory contains the communication history of the client for the policy selected
	 * @property {function} getCommsHistory Callback function to fetch more data
	 * @property {function} filteredData Holds the filtered communication history data
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			startDate: { type: String, state: true },
			endDate: { type: String, state: true },
			contractReference: { type: String, state: true },
			contactNumber: { type: String, state: true },
			commsHistory: { type: Object, state: true },
			getCommsHistory: { type: Object, state: true },
			filteredData: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		this.telemetryEvents = SMSHistoryEvents;
		await this._telemetry.startSpan(this.telemetryEvents.SMS_HISTORY, {});

		this._initialise();

		// RENDER_CHIPS[FILTER_BY.DATE] = ``;
		// this.filteredData = this.commsHistory?.communications;
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE FUNCTIONS

	/**
	 * Initialize component when loaded
	 * @returns {void}
	 */
	async _initialise() {
		this.startDate = new Date(Date.now() - NINETY_DAYS).toISOString();
		this.endDate = new Date().toISOString();

		this.commsHistory = await this.getCommsHistory(this.contractReference, this.startDate, this.endDate);
		RENDER_CHIPS[FILTER_BY.DATE] = getDateRangeDisplayValue(this.startDate, this.endDate);
		this.filteredData = [];
		if (!isNullorEmpty(this.commsHistory?.results)) {
			this.filteredData = this.commsHistory?.results.filter(item => new Date(item.sentAt) >= new Date(this.startDate) && new Date(item.sentAt) <= new Date(this.endDate));
			// this.hideLoadMore = this.policyTransactionHistory?.transactions?.length % MAX_RESULTS > 0 && this.policyTransactionHistory?.transactions?.length % MAX_RESULTS < MAX_RESULTS;
		}
	}

	/**
	 * filter sms history when date is changed
	 * @param {*} e e
	 * @return {void}
	 */
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

	/**
	 * filter the sms history
	 * @return {void}
	 */
	_refineSearch() {
		this.filteredData = this.commsHistory?.results;
		if (!isNullorEmpty(this.startDate) && !isNullorEmpty(this.endDate)) {
			if (RENDER_CHIPS[FILTER_BY.DATE]) {
				const startDate = new Date(Date.parse(this.startDate));
				const endDate = new Date(Date.parse(this.endDate));
				this.filteredData = this.filteredData?.filter(item => new Date(item.sentAt) >= startDate && new Date(item.sentAt) <= endDate);
			}
		} else {
			this.filteredData = [];
		}

		this.requestUpdate();
	}

	/**
	 * Get selected date range
	 * @returns {string} - fromdate to todate
	 */
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

	/**
	 * format the give date
	 * @param {*} date - date to be formatted 
	 * @return {String} string
	 */
	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	/**
	 * Clear filter by criteria type
	 * @param {*} type - filter type
	 * @return {void}
	 */
	_clearFilter(type) {
		const date = () => this._reset();

		const resetForfilters = {
			'DATE': date
		};

		RENDER_CHIPS[type] = ``;
		if (resetForfilters[type]) {
			resetForfilters[type]();
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


	// #endregion PRIVATE FUNCTIONS

	// #region EVENT HANDLERS

	/**
	 * Navigate to Landing
	 * @return {void} 
	 */
	_backToSummaryPage() {
		this._telemetry.logEvent(this.telemetryEvents.SMS_HISTORY_BACK, {
			"screen": TelemetryScreen.INSURE_SMS_HISTORY,
			"next-screen": TelemetryScreen.INSURE_CLIENT_SUMMARY
		});
		this.dispatchEvent(new CustomEvent(`navigate-back`, { detail: {} }));
	}

	/**
		 * filter sms history when date is changed
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

		this.commsHistory = await this.getCommsHistory(this.contractReference, this.startDate, this.endDate);
		await this._refineSearch();
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

	// #endregion


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
			
		.insure-title-bar{
			margin-bottom: 0px; 
			border-top-left-radius: 5px; 
			border-top-right-radius: 5px;
		}

		.card{
			height: fit-content;
			min-height: 662px;
			padding: 20px;
		}

		.label{
			padding-bottom: 10px;
			padding-top: 10px;
		}

		horizon-expander {
			margin-bottom: 16px;
			--theme-expander-height: auto;
			--theme-layout-gap-spacing: 0px;
			--theme-expander-header-height: 64px;
			--theme-expander-header-padding: 0 6px 0 0;
			--theme-expander-indicator-width: 16px;
		}
		horizon-expander[expanded] {
			box-shadow: 0 6px 10px 0.25px rgb(0 0 0 / 7%);
			display: block;
			--theme-overflow-menu-width: 200px !important;
		}
		.expander-header > capitec-icon {
			--theme-icon-size-default: 20px;
			--theme-layout-gap-spacing: 0px;
			margin-left: 10px;
		}
		.expander-header > capitec-button {
			width: 128px;
		}
		.expander-content {
			border-left: 1px solid #E1E1E1;
			border-bottom: 1px solid #E1E1E1;
			border-right: 1px solid #E1E1E1;
			border-radius: 0px 0px 4px 4px
		}
		.expander-content > capitec-title-bar {
			border-top: 0px;
		}
		horizon-label {
			width: 189px;
			padding-left: 16px;
			--theme-layout-gap-spacing: 0px;
			--horizon-label-text-height: 20px;
			--horizon-label-text-color: #3A3A3A;
			--horizon-label-text-line-height: 20px;
			
			--horizon-label-value-height: 20px;
			--horizon-label-value-color: #3A3A3A;
			--horizon-label-value-font-size: 16px;
			--horizon-label-value-line-height: 20px;
		}
		.label-policy-number {
			--theme-label-cursor: pointer;
			--horizon-label-value-color: #3A3A3A;
		}
		.fixed-label {
			width: 22%;
			--horizon-label-max-overflow-width: 170px;
		}
		.vertical-line {
			height: 40px;
			width: 1px;
			background-color: #E1E1E1;
		}
		capitec-group > capitec-title-bar {
			--theme-titlebar-min-height: 32px;
			--theme-titlebar-padding: 0px 16px 0px 16px;
			--theme-type-default-background: rgb(244, 244, 244);
			--theme-label-title-font-size: 15px;
			--theme-label-title-font-weight: 600;
			--theme-type-default-font-color: #3A3A3A;
			--theme-label-title-font-size: 14px;
			--theme-titlebar-shadow: 0px;
			--theme-titlebar-item-gap: 0px;

			border-top: 1px solid #E1E1E1;
			border-bottom: 1px solid #E1E1E1;
		}

		.datePicker{
			padding-bottom: 20px
		}

		.filter-bar {

			display: -webkit-inline-box;
			border-top: 1px solid #E1E1E1;
			border-bottom: 1px solid #E1E1E1;
			padding-left: 0px;
			
		}
		.filter-bar > capitec-label {
			height: 20px;
			width: auto;
			color: #3A3A3A;
			font-family: "Hind Vadodara";
			font-size: 15px;
			font-weight: 600;
			letter-spacing: 0;
			line-height: 30px;
		}
		`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
			
		`;
	}

	/**
	 * Render the content HTML for the component
	 * @return {html} html
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}" />
			
			<capitec-label  label="SMS History" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
		</capitec-title-bar>
		
		<capitec-card class="card" >
			<div class="datePicker">
				${this._renderDatePicker()}
			</div>
			<div>
				${this._renderActiveFilters()}
			</div>

			${this.filteredData?.length !== 0 ? html`
				${this.filteredData?.map((comms) => this._renderExpander(comms))}
			` : html`
				${this._renderNoResults()}
			`}
		</capitec-card>`;
	}

	/**
	 * renders each expander
	 * 
	 * @param {Object} comms comms
	 * @returns {html} the html content for the expanders
	 */
	_renderExpander(comms) {
		return html`
			<horizon-expander data-automation-id="insure-sms-history-expander">
				<capitec-group 
					class="expander-header"
					slot="custom-header"
					layout="horizontal"
					gap="clear"
					halign="left"
					valign="center">
						<horizon-label
							class="label-policy-number fixed-label"
							label="Policy Number"
							textOverflow="ellipsis"
							value="${this.contractReference}">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							label="Contact Details"
							value="${isNullorEmpty(comms.contactNumber) ? `-` : comms.contactNumber}">
						</horizon-label>
						<horizon-label
							label="Sent"
							value="${formatDate(comms.sentAt, `dd mmm yyyy`)}, ${new Date(comms.sentAt).toLocaleTimeString(`en`, { timeStyle: `short`, hour12: true, timeZone: `UTC` })}">
						</horizon-label>
						<!-- <horizon-label
							label="Received"
							value="${formatDate(comms.sentAt, `dd mmm yyyy`)}, ${new Date(comms.sentAt).toLocaleTimeString(`en`, { timeStyle: `short`, hour12: true, timeZone: `UTC` })}">
						</horizon-label> -->
						<horizon-label
							label="Status"
							value="${comms.status}">
						</horizon-label>
				</capitec-group>
				<div slot="content" class="slot-content">
					<capitec-group 
						class="expander-content" 
						layout="vertical"
						gap="none"
						halign="left"
						valign="center">
							${this._renderMessages(comms)}
					</capitec-group>
				</div>
			</horizon-expander>
		`;
	}

	/**
	 * Render Messages options
	 * @param {Object} comms - each Communication history item
	 * @returns {html} The html content of each of the messages
	 */
	_renderMessages(comms) {
		return html`
			<capitec-title-bar type="default" label="Message"></capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				<capitec-content-box style="height: auto;" >
					<capitec-label label="${comms.message}">
					</capitec-label>
				</capitec-content-box>
			
			</capitec-group>
		`;
	}

	/**
	 * renders the date picker to select a date to filter with
	 * 
	 * @return {html} html
	 */
	_renderDatePicker() {
		return html`
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
					data-automation-id="insure-sms-history-date-picker">
				</capitec-date-time-picker>
		`;
	}

	/**
	 * render the active filters bar 
	 * 
	 * @return {html} render active filters 
	 */
	_renderActiveFilters() {
		if (RENDER_CHIPS[FILTER_BY.DATE] !== ``) {
			return html`
				<capitec-content-box id="active-filters" class="filter-bar">
					<capitec-label label = "Active filters: "></capitec-label>
						${this._renderDateChip()}
				</capitec-content-box>
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
			closable
			data-automation-id="insure-sms-history-active-filter">
		</capitec-chip>`
			: html``;
	}

	/**
	 * Show message when there are no records
	 * @returns {html} - message for no results
	 */
	_renderNoResults() {

		let noResultsMessage;
		if (this.startDate) {
			noResultsMessage = `No policy communications sent during ${isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE]) ? `Last 90 days` : RENDER_CHIPS[FILTER_BY.DATE]}`;
		} else {
			noResultsMessage = `Adjust filters to see policy communications`;
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

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-sms-history-page`, SMSHistory);

/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-insure-sms-history-page ... @navigate-back="${this._handler}"></horizon-insure-sms-history-page>
 *
 * @event PayPremiumSuccess#navigate-back
 * @type {Object} - N/A
 */