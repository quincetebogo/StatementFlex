import { ACTIVITY_TYPE, ACTIVITY_TYPE_LIST, AUDIT_DATE_TYPE_LIST, DEFAULTS, FILTER_BY, MAX_RESULTS, NINETY_DAYS, RENDER_CHIPS } from 'app/constants/InsureTransactionHistory';
import { Component, css, html, unsafeCSS } from 'platform/elements';
import { EXPANDER_LABEL, INSURE_TRANSACTIONS_CSS, TABLE_EXPANDER_CELL } from 'app/css/PolicyTransactionHistory';
import { _getDateRange, getPredefinedDateRanges } from 'app/utils/insureUtils';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { DateTime } from 'luxon';
import { formatCurrency } from 'app/productControls/utilities/Currency';

/**
 * Audit Transaction History component that displays audit transaction history
 * 
 * Events Raised
 * -------------
 * unloading
 * navigate-back
 * _scrollToTop
 * _filterByDateType
 * _dateChanged
 * 
 * @export
 * @class AuditTransactionHistory
 * @extends {Component}
 */
class AuditTransactionHistory extends Component {
	
	// #region INITIALIZATION

	constructor() {
		super();

		this.dateLabel = DEFAULTS.DATE_LABEL;
		this.activityTypeLabel = DEFAULTS.ACTIVITY_TYPE_LABEL;

		this.auditTransactionHistory = {};
		this.filteredData = [];
		this.isBusy = false;
		this.hideLoadMore = true;

		this.dateTypeOptions = AUDIT_DATE_TYPE_LIST;
		this.activityTypeOptions = ACTIVITY_TYPE_LIST;
	}

	// #endregion INITIALIZATION

	// #region PROPERTIES

	/**
	 * Callback for rendering transaction details used by {@link AuditTransactionHistory}.
	 * 
	 * @callback RenderTransactionDetails
	 * @param {Object} [item] Current item for which transaction details to be rendered
	 * 
	 * @returns {html} Transaction details response, expander content
	 *
	 * @property {String} dateLabel - Default label for Date Type dropdown
	 * @property {String} startDate - String holds Start date of transaction/due date 
	 * @property {String} endDate - String holds End date of transaction/due date
	 * @property {String} activityTypeLabel - Default label for Activity Type dropdown
	 * @property {Object} filteredData - Object holds filtered transaction data
	 * @property {Object} auditTransactionHistory - Object holds transaction data
	 * @property {Function} getAuditTransactionHistory Callback function to fetch more data
	 * @property {Function} disposeData Callback function to clear transaction history data variable
	 * @property {Boolean} hideLoadMore Show/Hide Load More button
	 * @property {Boolean} isBusy if it is true load indicator
	 * @property {Boolean} readOnlyMode determine to show page in readonly mode
	 
	 * @readonly
	 * @static
	 */
	 static get properties() {
		return {
			dateLabel: { type: String, state: true },
			startDate: { type: String, state: true },
			endDate: { type: String, state: true },
			activityTypeLabel: { type: String, state: true },
			filteredData: { type: Object, state: true },
			auditTransactionHistory: { type: Object },
			getAuditTransactionHistory: { type: Object },
			disposeData: { type: Object },
			hideLoadMore: { type: Boolean, state: true },
			isBusy: { state: true },
			readOnlyMode: { type: Boolean, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region RENDER STYLES

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

				.transact {
					background: var(--theme-type-insure-background);
					--theme-label-font-color: #FFFFFF;
				}

				.no-border-bottom {
					border-bottom: 0px;
				}
				.margin-right-20{
					margin-right: 20px;
				}
				.margin-right-50 {
					margin-right: 50px;
				}
			`
		];
	}

	// #endregion RENDER STYLES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	 connectedCallback() {
		super.connectedCallback();

		this.startDate = new Date(Date.now() - NINETY_DAYS).toISOString();
		this.endDate = new Date().toISOString();

		RENDER_CHIPS[FILTER_BY.DATE] = _getDateRange(this.startDate, this.endDate);

		// Making sure no baggage is carried from the previous instance.
		RENDER_CHIPS[FILTER_BY.DATE_TYPE] = this.dateTypeOptions[0].text;
		RENDER_CHIPS[FILTER_BY.ACTIVITY_TYPE] = ``; // this.activityTypeOptions[0].text;

		this.filteredData = this.auditTransactionHistory?.transactions;
		this.hideLoadMore = this.auditTransactionHistory?.transactions?.length % MAX_RESULTS > 0 && this.auditTransactionHistory?.transactions?.length % MAX_RESULTS < MAX_RESULTS;
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

	// #region EVENTS

	/**
	 * unload the audit transactions
	 * @return {null} null
	 */
	 _unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	/**
	 * Navigate back to Policy summary page
	 * @return {null} null
	 */
	_backToSummaryPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, {
			detail: {
			}
		}));
	}

	/**
	 * scroll to top of transactions table
	 * @param {*} e e
	 * @return {null} null
	 */
	_scrollToTop(e) {
		const element = this.shadowRoot.getElementById(`audit-transactions-table`);
		element.scrollTop = 0;
	}

	/**
	 * filter transactions when date type is changed
	 * @param {*} event event
	 * @return {null} null
	 */
	_filterByDateType(event) {
		RENDER_CHIPS[FILTER_BY.DATE_TYPE] = event.detail.new.text;
		this._refineSearch();
	}

	/**
	 * filter transactions when activity type is changed
	 * @param {*} event event
	 * @return {null} null
	*/
	_filterByActivityType(event) {
		RENDER_CHIPS[FILTER_BY.ACTIVITY_TYPE] = event.detail.new.text;
		this.activityTypeDesc = event.detail.new.code;
		this._refineSearch();
	}

	/**
	 * filter transactions when date is changed
	 * @param {object} e event
	 * @return {null} null
	*/
	async _dateChanged(e) {
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

		RENDER_CHIPS[FILTER_BY.DATE] = _getDateRange(this.startDate, this.endDate);
		
		await this._refineSearch();
	}

	// #endregion EVENTS

	// #region RENDERING

	/**
	 * 
	 * Entry point for rendering the component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			<capitec-card class="transaction-card">
				<capitec-group layout="vertical" gap="line" halign="left" valign="top">
					${this._renderTitleBar()}
					${this._renderHeaderDetailsBar()}
					${this._renderActionBar()}
					${this._renderFilterBar()}
					<capitec-content-box class="main-view" id="audit-transactions-table">
						${this._renderAuditTransactionHistory()}
					</capitec-content-box>
					${this._renderFooter()}
				</capitec-group>
			</capitec-card>
			${this._renderLoadingIndicator()}
		`;
	}

	/**
	 * Render Title Bar
	 * @returns {html} The html of the title
	*/
	_renderTitleBar() {
		return html`
			<capitec-title-bar class="insure-title-bar no-border-bottom" type="insure">
				<capitec-image
					alt="back"
					class="action-image"
					src="/images/insure/left-arrow.svg"
					@click="${() => this._backToSummaryPage()}"
					data-automation-id="audit-transactions-back">
				</capitec-image>
				<capitec-label 
					label="Audit Transaction History"
					type="title">
				</capitec-label>
			</capitec-title-bar>
		`;
	}

	/**
	 * Render Header Details Bar
	 * @returns {html} The html of the header details - Policy Number
	*/
	_renderHeaderDetailsBar() {
		return html`
			<capitec-group
				class= "actionbar-header transact"
				layout="horizontal"
				gap="none"
				halign="left"
				valign="center">
					<capitec-label class = "margin-right-50" label = "Policy Number"></capitec-label>
					<capitec-label label = "${this.auditTransactionHistory?.contractReference}"></capitec-label>
			</capitec-group>
		`;
	}

	/**
	 * Render Action Bar
	 * @returns {html} The html of the filter criteria date type and date controls
	 */
	 _renderActionBar() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="transaction-action-bar">
				<capitec-select
					label="${RENDER_CHIPS[FILTER_BY.DATE_TYPE] !== `` ? `` : this.dateLabel}" 
					class="transaction-status-select margin-right-20"
					.items="${this.dateTypeOptions}"
					@focus="${(e) => this.datelabel = ``}"
					display-field="text"
					id-field="code"
					@value-change = "${(e) => this._filterByDateType(e)}"
					value = "${RENDER_CHIPS[FILTER_BY.DATE_TYPE]}"
					hint=""
					data-automation-id="audit-transactions-date-type-filter">
				</capitec-select>

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
					data-automation-id="audit-transactions-date-filter">
				</capitec-date-time-picker>

				<capitec-select
					label="${RENDER_CHIPS[FILTER_BY.ACTIVITY_TYPE] !== `` ? `` : this.activityTypeLabel}" 
					class="transaction-status-select margin-right-20"
					.items="${this.activityTypeOptions}"
					@focus="${(e) => this.activityTypeLabel = ``}"
					display-field="text"
					id-field="code"
					@value-change = "${(e) => this._filterByActivityType(e)}"
					value = "${RENDER_CHIPS[FILTER_BY.ACTIVITY_TYPE]}"
					hint=""
					data-automation-id="audit-transactions-activity-type-filter">
				</capitec-select>
			</capitec-group>
		`;
	}

	/**
	 * Render audit transactions
	 * @returns {html} - content of transactions
	*/
	_renderAuditTransactionHistory() {
		// TODO: Need to change below code groupBychangeActionedDate once service includes change action date
		return this.filteredData?.length > 0 
		? html`
			<capitec-table
				.items = "${this.filteredData}"
				groupField="groupByDate"
				displayMode="Full"
				?fixed = "${true}"
				.expandRenderer="${(item) => this._renderTransactionDetails(item)}"
				data-automation-id="audit-transaction-history-table">
					${this._renderAuditTransHistoryColumns()}
			</capitec-table>`
		: html`
			${this._renderNoResults()}
		`;
	}

	/**
	 * render audit transaction history columns
	 * @returns {html} - table columns
	*/
	_renderAuditTransHistoryColumns() {
		// TODO: Need to change below code changeActionedDate, effectiveDate once service includes it
		return html`
			<capitec-table-column
				label="Month and Year Date"
				field="date"
				type="date"
				size="250px"
				wrap>
			</capitec-table-column>
			<capitec-table-column
				label="Transaction Type"
				field="transactionTypeDesc"
				size="300px">
			</capitec-table-column>
			<capitec-spacer></capitec-spacer>
			<!-- <capitec-table-column
				label="Effective Date"
				field="effectiveDate"
				type="date"
				size="125px">
			</capitec-table-column> -->
			<capitec-spacer></capitec-spacer>
			<capitec-table-column
				label="Reason for Change"
				field="reason"
				size="350px">
			</capitec-table-column>
		`;
	}

		/**
	 * render transaction details of each transaction
	 * @param {*} item - transaction item
	 * @return {null} null
	 */
	_renderTransactionDetails(item) {
		switch (item.transactionType) {
			case ACTIVITY_TYPE.PREMIUM_CHANGE:
				return html`${this._renderPremiumChanges(item)}`;
			case ACTIVITY_TYPE.BANKDETAILS_CHANGES:
				return html`${this._renderBankDetailsChanges(item)}`;
			case ACTIVITY_TYPE.MAINLIFE_CHANGES:
				return html`${this._renderMainLifeChanges(item)}`;
			case ACTIVITY_TYPE.LIVESASSURED_CHANGES:
				return html`${this._renderLivesAssuredChanges(item)}`;
			case ACTIVITY_TYPE.BENEFICIARY_CHANGES:
				return html`${this._renderBeneficiaryChanges(item)}`;
			case ACTIVITY_TYPE.POLICYSTATUS_CHANGES:
				return html`${this._renderPolicyStatusChanges(item)}`;
			case ACTIVITY_TYPE.WAIVER_CHANGES:
				return html`${this._renderWaiverChanges(item)}`;
			case ACTIVITY_TYPE.CLAIMSLODGES_CHANGES:
				return html`${this._renderClaimsLodgesChanges(item)}`;
			default:
				return html``;
		}
	}

	/**
	 * 
	 * @param {object} item - transaction object 
	 * @returns {html} html content of premium changes
	 */
	_renderPremiumChanges(item) {
		return html`
		<capitec-label
			style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
			label="Additonal Details"
			data-automation-id="audit-transactions-premium-additional-details">
		</capitec-label>

		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Date Requested"
				value = "${formatDate(item?.date, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.date, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-premium-requested-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Previous Premium"
				value = "${isNullorEmpty(item?.additionalDetails?.previousPremium) ? formatCurrency(0) : formatCurrency(item?.additionalDetails?.previousPremium)}"
				data-automation-id="audit-transactions-premium-previous-premium">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Effective Date" 
				value = "${formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-premium-effective-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Current Premium"
				value = "${isNullorEmpty(item?.additionalDetails?.currentPremium) ? formatCurrency(0) : formatCurrency(item?.additionalDetails?.currentPremium)}"
				data-automation-id="audit-transactions-premium-current-premium">
			</horizon-label>
		</capitec-group>
		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Actioned By"
				value = "${isNullorEmpty(item?.additionalDetails?.actionedBy) ? `-` : item?.additionalDetails?.actionedBy}"
				data-automation-id="audit-transactions-premium-actioned-by">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Channel Applied On"
				value = "${isNullorEmpty(item?.additionalDetails?.channelAppliedOn) ? `-` : item?.additionalDetails?.channelAppliedOn}"
				data-automation-id="audit-transactions-premium-channel-applied-on">
			</horizon-label>
		</capitec-group>
	`;
	}

	/**
	 * 
	 * @param {object} item - transaction object 
	 * @returns {html} html content of bank details changes
	*/
	_renderBankDetailsChanges(item) {
		return html`
		<capitec-label
			style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
			label="Additonal Details"
			data-automation-id="audit-transactions-bank-additional-details">
		</capitec-label>

		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Date Requested"
				value = "${formatDate(item?.date, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.date, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-bank-requested-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Effective Date" 
				value = "${formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-bank-effective-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Account Name"
				value = "${isNullorEmpty(item?.additionalDetails?.accountName) ? `-` : item?.additionalDetails?.accountName}"
				data-automation-id="audit-transactions-account-name">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Account Number"
				value = "${isNullorEmpty(item?.additionalDetails?.accountNumber) ? `-` : item?.additionalDetails?.accountNumber}"
				data-automation-id="audit-transactions-account-number">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Bank"
				value = "${isNullorEmpty(item?.additionalDetails?.bank) ? `-` : item?.additionalDetails?.bank}"
				data-automation-id="audit-transactions-bank">
			</horizon-label>
		</capitec-group>
		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Branch Code"
				value = "${isNullorEmpty(item?.additionalDetails?.branchCode) ? `-` : item?.additionalDetails?.branchCode}"
				data-automation-id="audit-transactions-branch-code">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Account Type"
				value = "${isNullorEmpty(item?.additionalDetails?.accountType) ? `-` : item?.additionalDetails?.accountType}"
				data-automation-id="audit-transactions-account-type">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Collection Day"
				value = "${isNullorEmpty(item?.additionalDetails?.collectionDay) ? `-` : item?.additionalDetails?.collectionDay}"
				data-automation-id="audit-transactions-collection-day">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Actioned By"
				value = "${isNullorEmpty(item?.additionalDetails?.actionedBy) ? `-` : item?.additionalDetails?.actionedBy}"
				data-automation-id="audit-transactions-bank-actioned-by">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Channel Applied On"
				value = "${isNullorEmpty(item?.additionalDetails?.channelAppliedOn) ? `-` : item?.additionalDetails?.channelAppliedOn}"
				data-automation-id="audit-transactions-bank-channel-applied-on">
			</horizon-label>
		</capitec-group>
	`;
	}

	/**
	 * 
	 * @param {object} item - transaction object 
	 * @returns {html} html content of main life changes
	*/
	_renderMainLifeChanges(item) {
		return html`
		<capitec-label
			style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
			label="Additonal Details"
			data-automation-id="audit-transactions-main-life-additional-details">
		</capitec-label>

		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Date Requested"
				value = "${formatDate(item?.date, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.date, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-main-life-requested-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Name & Surname"
				value = "${isNullorEmpty(item?.additionalDetails?.fullName) ? `-` : item?.additionalDetails?.fullName}"
				data-automation-id="audit-transactions-main-life-name">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Effective Date" 
				value = "${formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-main-life-effective-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Premium"
				value = "${isNullorEmpty(item?.additionalDetails?.premium) ? formatCurrency(0) : formatCurrency(item?.additionalDetails?.premium)}"
				data-automation-id="audit-transactions-main-life-premium">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Cover Amount"
				value = "${isNullorEmpty(item?.additionalDetails?.coverAmount) ? formatCurrency(0) : formatCurrency(item?.additionalDetails?.coverAmount)}"
				data-automation-id="audit-transactions-main-life-cover-amount">
			</horizon-label>
		</capitec-group>
		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
		<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Contact Number"
				value = "${item?.additionalDetails?.contactNumber}"
				data-automation-id="audit-transactions-main-life-contact-number">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Email"
				value = "${item?.additionalDetails?.email}"
				data-automation-id="audit-transactions-main-life-email">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Actioned By"
				value = "${isNullorEmpty(item?.additionalDetails?.actionedBy) ? `-` : item?.additionalDetails?.actionedBy}"
				data-automation-id="audit-transactions-main-life-actioned-by">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Channel Applied On"
				value = "${isNullorEmpty(item?.additionalDetails?.channelAppliedOn) ? `-` : item?.additionalDetails?.channelAppliedOn}"
				data-automation-id="audit-transactions-main-life-channel-applied-on">
			</horizon-label>
		</capitec-group>
	`;
	}

	/**
	 * 
	 * @param {object} item - transaction object 
	 * @returns {html} html content of lives assured changes
	*/
	_renderLivesAssuredChanges(item) {
		return html`
		<capitec-label
			style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
			label="Additonal Details"
			data-automation-id="audit-transactions-lives-assured-additional-details">
		</capitec-label>

		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
		<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Date Requested"
				value = "${formatDate(item?.date, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.date, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-lives-assured-requested-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Name & Surname"
				value = "${isNullorEmpty(item?.additionalDetails?.fullName) ? `-` : item?.additionalDetails?.fullName}"
				data-automation-id="audit-transactions-lives-assured-name">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Effective Date" 
				value = "${formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-lives-assured-effective-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Relationship"
				value = "${isNullorEmpty(item?.additionalDetails?.relationship) ? `-` : item?.additionalDetails?.relationship}"
				data-automation-id="audit-transactions-lives-assured-relationship">
			</horizon-label>
		</capitec-group>
		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Premium"
				value = "${isNullorEmpty(item?.additionalDetails?.premium) ? formatCurrency(0) : formatCurrency(item?.additionalDetails?.premium)}"
				data-automation-id="audit-transactions-lives-assured-premium">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Cover Amount"
				value = "${isNullorEmpty(item?.additionalDetails?.coverAmount) ? formatCurrency(0) : formatCurrency(item?.additionalDetails?.coverAmount)}"
				data-automation-id="audit-transactions-lives-assured-cover-amount">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Actioned By"
				value = "${isNullorEmpty(item?.additionalDetails?.actionedBy) ? `-` : item?.additionalDetails?.actionedBy}"
				data-automation-id="audit-transactions-lives-assured-actioned-by">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Channel Applied On"
				value = "${isNullorEmpty(item?.additionalDetails?.channelAppliedOn) ? `-` : item?.additionalDetails?.channelAppliedOn}"
				data-automation-id="audit-transactions-lives-assured-channel-applied-on">
			</horizon-label>
		</capitec-group>
	`;
	}

	/**
	 * 
	 * @param {object} item - transaction object 
	 * @returns {html} html content of beneficiary changes
	*/
	_renderBeneficiaryChanges(item) {
		return html`
		<capitec-label
			style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
			label="Additonal Details"
			data-automation-id="audit-transactions-beneficiary-additional-details">
		</capitec-label>

		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Date Requested"
				value = "${formatDate(item?.date, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.date, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-beneficiary-requested-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Name & Surname"
				value = "${item?.additionalDetails?.fullName}"
				data-automation-id="audit-transactions-beneficiary-name">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Effective Date" 
				value = "${formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-beneficiary-effective-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Relationship"
				value = "${item?.additionalDetails?.relationship}"
				data-automation-id="audit-transactions-beneficiary-relationship">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Contact Number"
				value = "${item?.additionalDetails?.contactNumber}"
				data-automation-id="audit-transactions-beneficiary-contact-number">
			</horizon-label>
		</capitec-group>
		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Email"
				value = "${item?.additionalDetails?.email}"
				data-automation-id="audit-transactions-beneficiary-email">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Benefit Payout"
				value = "${isNullorEmpty(item?.additionalDetails?.benefitPayout) ? formatCurrency(0) : formatCurrency(item?.additionalDetails?.benefitPayout)}"
				data-automation-id="audit-transactions-beneficiary-payout">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Actioned By"
				value = "${isNullorEmpty(item?.additionalDetails?.actionedBy) ? `-` : item?.additionalDetails?.actionedBy}"
				data-automation-id="audit-transactions-beneficiary-actioned-by">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fiveColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Channel Applied On"
				value = "${isNullorEmpty(item?.additionalDetails?.channelAppliedOn) ? `-` : item?.additionalDetails?.channelAppliedOn}"
				data-automation-id="audit-transactions-beneficiary-channel-applied-on">
			</horizon-label>
		</capitec-group>
	`;
	}

	/**
	 * 
	 * @param {object} item - transaction object 
	 * @returns {html} html content of policy status changes
	*/
	_renderPolicyStatusChanges(item) {
		return html`
		<capitec-label
			style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
			label="Additonal Details"
			data-automation-id="audit-transactions-status-additional-details">
		</capitec-label>

		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Date Requested"
				value = "${formatDate(item?.date, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.date, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-status-requested-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Previous Status"
				value = "${isNullorEmpty(item?.additionalDetails?.previousStatus) ? `-` : item?.additionalDetails?.previousStatus}"
				data-automation-id="audit-transactions-status-previous-status">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Effective Date" 
				value = "${formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-status-effective-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Current Status"
				value = "${isNullorEmpty(item?.additionalDetails?.currentStatus) ? `-` : item?.additionalDetails?.currentStatus}"
				data-automation-id="audit-transactions-status-current-status">
			</horizon-label>
		</capitec-group>
		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Actioned By"
				value = "${isNullorEmpty(item?.additionalDetails?.actionedBy) ? `-` : item?.additionalDetails?.actionedBy}"
				data-automation-id="audit-transactions-status-actioned-by">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Channel Applied On"
				value = "${isNullorEmpty(item?.additionalDetails?.channelAppliedOn) ? `-` : item?.additionalDetails?.channelAppliedOn}"
				data-automation-id="audit-transactions-status-channel-applied-on">
			</horizon-label>
		</capitec-group>
	`;
	}

	/**
	 * 
	 * @param {object} item - transaction object 
	 * @returns {html} html content of waiver changes
	*/
	_renderWaiverChanges(item) {
		return html`
		<capitec-label
			style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
			label="Additonal Details"
			data-automation-id="audit-transactions-waiver-additional-details">
		</capitec-label>

		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Date Requested"
				value = "${formatDate(item?.date, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.date, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-waiver-requested-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Effective Date" 
				value = "${formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-waiver-effective-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Benefit Waiver Type"
				value = "${isNullorEmpty(item?.additionalDetails?.benefitWaiverType) ? `-` : item?.additionalDetails?.benefitWaiverType}"
				data-automation-id="audit-transactions-waiver-type">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="End Date" 
				value = "${formatDate(item?.additionalDetails?.endDate, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.additionalDetails?.endDate, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-waiver-end-date">
			</horizon-label>
		</capitec-group>
		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Status"
				value = "${isNullorEmpty(item?.additionalDetails?.status) ? `-` : item?.additionalDetails?.status}"
				data-automation-id="audit-transactions-waiver-status">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Actioned By"
				value = "${isNullorEmpty(item?.additionalDetails?.actionedBy) ? `-` : item?.additionalDetails?.actionedBy}"
				data-automation-id="audit-transactions-waiver-actioned-by">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Channel Applied On"
				value = "${isNullorEmpty(item?.additionalDetails?.channelAppliedOn) ? `-` : item?.additionalDetails?.channelAppliedOn}"
				data-automation-id="audit-transactions-waiver-channel-applied-on">
			</horizon-label>
		</capitec-group>
	`;
	}

	/**
	 * 
	 * @param {object} item - transaction object 
	 * @returns {html} html content of claims lodges changes
	*/
	_renderClaimsLodgesChanges(item) {
		return html`
		<capitec-label
			style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
			label="Additonal Details"
			data-automation-id="audit-transactions-claim-additional-details">
		</capitec-label>

		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Date Requested"
				value = "${formatDate(item?.date, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.date, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-claim-requested-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Case/Incident Number"
				value = "${isNullorEmpty(item?.additionalDetails?.caseNumber) ? `-` : item?.additionalDetails?.caseNumber}"
				data-automation-id="audit-transactions-claim-case-number">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Effective Date" 
				value = "${formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`) === `` ? `-` : formatDate(item?.additionalDetails?.effectiveDate, `dd mmm yyyy`)}"
				data-automation-id="audit-transactions-claim-effective-date">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Claim Status"
				value = "${isNullorEmpty(item?.additionalDetails?.claimStatus) ? `-` : item?.additionalDetails?.claimStatus}"
				data-automation-id="audit-transactions-claim-status">
			</horizon-label>
		</capitec-group>
		<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Actioned By"
				value = "${isNullorEmpty(item?.additionalDetails?.actionedBy) ? `-` : item?.additionalDetails?.actionedBy}"
				data-automation-id="audit-transactions-claim-actioned-by">
			</horizon-label>
			<horizon-label
				style="${unsafeCSS(TABLE_EXPANDER_CELL.fourColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
				label="Channel Applied On"
				value = "${isNullorEmpty(item?.additionalDetails?.channelAppliedOn) ? `-` : item?.additionalDetails?.channelAppliedOn}"
				data-automation-id="audit-transactions-claim-channel-applied-on">
			</horizon-label>
		</capitec-group>
	`;
	}

	/**
	 * Show clear/clear all filters
	 * @returns {html} The html of Clear and Clear All filters
	*/
	_renderFilterBar() {
		if (RENDER_CHIPS[FILTER_BY.DATE] !== `` || RENDER_CHIPS[FILTER_BY.ACTIVITY_TYPE] !== ``) {
			return html`
				<capitec-action-bar
					id="active-filters"
					class="filter-bar"
					data-automation-id="audit-transactions-active-filters">
						<capitec-label label = "Active filters:"></capitec-label>
							${this._renderDateChip()}
							${this._renderActivityTypeChip()}
						<capitec-button
							type="clear"
							label="Clear All"
							@click = "${() => this._clearFilters()}"
							data-automation-id="audit-transactions-clear-active-filters">
						</capitec-button>
				</capitec-action-bar>
			`;
		}
	}

	/**
	 * Show load more feature in the footer
	 * @returns {html} - content of footer
	*/
	_renderFooter() {
		return html`
			<capitec-action-bar class="load-more-bar" 
				?hidden="${this.hideLoadMore || this.auditTransactionHistory?.length === 0}">
				<capitec-spacer></capitec-spacer>
				<capitec-button
					type="clear"
					label="Load More"
					@click = ${() => this._loadMoreTransactions()}
					data-automation-id="audit-transactions-load-more">
				</capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-icon
					class='scroll-top'
					size="medium"
					icon="system/arrow-up-action"
					@click = ${(e) => this._scrollToTop(e)}
					data-automation-id="audit-transactions-scroll-top">
				</capitec-icon>
			</capitec-action-bar>`;
	}

	/**
	 * load indicator if the page is busy
	 * @returns {html} The html of loading indicator
	 */
	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="audit-transactions-loading-indicator"></capitec-loading-indicator>`
			: html``;
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
				closable>
			</capitec-chip>`
			: html``;
	}

	/**
	 * Clear Activity Type filter
	 * @returns {html} Render Activity Type chip
	 */
	_renderActivityTypeChip() {
		return !isNullorEmpty(RENDER_CHIPS[FILTER_BY.ACTIVITY_TYPE])
			? html`
				<capitec-chip
					id="${FILTER_BY.ACTIVITY_TYPE}"
					label="${RENDER_CHIPS[FILTER_BY.ACTIVITY_TYPE]}"
					@remove="${() => this._closeChip(FILTER_BY.ACTIVITY_TYPE)}"
					closable>
				</capitec-chip>`
			: html``;
	}

	/**
	 * Show message when there are no records
	 * @returns {html} - message for no results
	*/
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
						label="No transactions made during ${isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE]) ? `Last 90 days` : RENDER_CHIPS[FILTER_BY.DATE]} "
						type="strong">
					</capitec-label>
			</capitec-group>
		`;
	}

	// #endregion RENDERING

	// #region PRIVATE METHODS

	async _loadMoreTransactions() {
		const oldCount = this.auditTransactionHistory?.transactions?.length;
		const startDate = this.startDate.toLocaleString().slice(0, 10);
		const endDate = this.endDate.toLocaleString().slice(0, 10);

		await this.getAuditTransactionHistory(startDate, endDate, this.auditTransactionHistory?.transactions?.length);

		// If the old record count and count after load more are same means no more data to populate,
		// so hiding loadmore button
		if (oldCount === this.auditTransactionHistory?.transactions?.length) {
			this.hideLoadMore = true;
		} else {
			this.hideLoadMore = this.auditTransactionHistory?.transactions?.length % MAX_RESULTS > 0 && this.auditTransactionHistory?.transactions?.length % MAX_RESULTS < MAX_RESULTS;
		}
		this._refineSearch();
	}

	/**
	 * Clear all filters
	 * @return {null} null
	 */
	_clearFilters() {
		const activeFilters = this.shadowRoot.getElementById(`active-filters`);

		Array.from(activeFilters.children)
				.filter(field => field.localName === `capitec-chip` && !field.hidden)
				.forEach(item => {
					this._clearFilter(item.id);
				});

		this._refineSearch();
	}

	/**
	 * Clear filter by criteria type
	 * @param {*} type - filter type
	 * @return {null} null
	 */
	_clearFilter(type) {
		const date = () => this._reset();
		const dateType = () => { 
			this.dateLabel = DEFAULTS.DATE_LABEL; 
		};
		const activityType = () => { 
			this.activityTypeLabel = DEFAULTS.ACTIVITY_TYPE_LABEL; 
		};
		
		const resetForfilters = {
			'DATE': date,
			'DATE_TYPE': dateType,
			'ACTIVITY_TYPE': activityType
		};

		RENDER_CHIPS[type] = ``;
		if (resetForfilters[type]) {
			resetForfilters[type]();
		}
	}

	/**
	 * close specified chip
	 * @param {*} type - filter type 
	 * @return {null} null
	 */
	_closeChip(type) {
		this._clearFilter(type);
		this._refineSearch();
	}

	/**
	 * reset all filters and load transactions
	 * @return {null} null
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
	 * @return {null} null
	*/
	_refineSearch() {

		this.filteredData = this.auditTransactionHistory?.transactions;

		if (RENDER_CHIPS[FILTER_BY.DATE]) {
			const startDate = new Date(Date.parse(this.startDate));
			const endDate = new Date(Date.parse(this.endDate));

			// TODO: Need to change below code once service includes change action date & effective date
			if (RENDER_CHIPS[FILTER_BY.DATE_TYPE] === this.dateTypeOptions[0].text) {
				this.filteredData = this.filteredData?.filter(item => new Date(item.date) >= startDate && new Date(item.date) <= endDate); 
			} else if (RENDER_CHIPS[FILTER_BY.DATE_TYPE] === this.dateTypeOptions[1].text) {
				this.filteredData = this.filteredData?.filter(item => new Date(item.date) >= startDate && new Date(item.date) <= endDate); 
			}
		}

		if (RENDER_CHIPS[FILTER_BY.ACTIVITY_TYPE]) {
			const activityType = this.activityTypeDesc;

			this.filteredData = this.filteredData?.filter(item => item.transactionType === activityType);
		}

		this.requestUpdate();
	}

	// #endregion PRIVATE METHODS

}

window.customElements.define(`horizon-insure-audit-transaction-history`, AuditTransactionHistory);