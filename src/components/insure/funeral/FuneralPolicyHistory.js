import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { FILTER_BY, MAX_RESULTS, NINETY_DAYS, RENDER_CHIPS } from 'app/constants/InsureTransactionHistory';
import { getDateRangeDisplayValue, getPredefinedDateRanges } from 'app/utils/insureUtils';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { INSURE_TRANSACTIONS_CSS} from 'app/css/PolicyTransactionHistory';
import { DateTime } from 'luxon';

import 'app/components/dialogs/insure/funeral/PolicyHistoryDetailsDialog'




import 'app/components/dialogs/insure/InsureEmailDialog';

/**
 * Policy history page shows activities on the policy
 * 
 * Events Raised 
 * -------------
 * navigate-to-summary
 *  
 * @export
 * @class FuneralPolicyHistory
 * @extends {Component}
 */
class FuneralPolicyHistory extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.filteredData = [];
		this.hideLoadMore = true;
		this.showHistoryDetailsDialog = false

	}

	// #endregion

	// #region PROPERTIES

	/**
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			startDate: { type: String, state: true },
			endDate: { type: String, state: true },
			filteredData: { type: Array, state: true },
			policyHistory: { type: Array, state: true },
			hideLoadMore: { type: Boolean, state: true },
			showHistoryDetailsDialog: { type: Boolean, state: true },
			policy: { type: Object, state: true },
			fetchPolicyHistory: { type: Function, state: true },
			fetchPolicyHistoryDetails: { type: Function, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialise()
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

		/**
	 * Initialize component when loaded
	 * @returns {void}
	 */
	async _initialise() {
		this.startDate = new Date(Date.now() - NINETY_DAYS).toISOString();
		this.endDate = new Date().toISOString();
		RENDER_CHIPS[FILTER_BY.DATE] = getDateRangeDisplayValue(this.startDate, this.endDate);

		this.policyHistory = await this.fetchPolicyHistory(this.startDate, this.endDate, this.policy)



		this.filteredData = [];
		if (!isNullorEmpty(this.policyHistory)) {
			this.filteredData = this.policyHistory?.filter(item => new Date(item.effectiveDate) >= new Date(this.startDate) && new Date(item.effectiveDate) <= new Date(this.endDate));
			this.hideLoadMore = this.policyHistory?.length % MAX_RESULTS > 0 && this.policyHistory?.length % MAX_RESULTS < MAX_RESULTS;
		}

	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * filter transactions when date is changed
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

		if (toDate.diff(fromDate, [`days`]).days > 3650) {

			toDate = fromDate.plus({ days: 3650 });
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
			toDate = fromDate.plus({ days: 3650 });
			if (toDate.diff(currentDateTime, [`days`]).days > 0) {
				this.endDate = currentDateTime;
			} else {
				this.endDate = toDate;
			}
		} else if (e.detail.new.startDate === null && this.startDate === ``) {
			this.endDate = toDate;
			fromDate = toDate.minus({ days: 3650 });
			this.startDate = fromDate;
		} else {

			this.startDate = fromDate;
			this.endDate = toDate;
		}

		RENDER_CHIPS[FILTER_BY.DATE] = getDateRangeDisplayValue(this.startDate, this.endDate);

		await this._refineSearch();
	}

	/**
	 * Clear filter by criteria type
	 * @param {*} type - filter type
	 * @return {void} 
	 */
	_clearFilter(type) {
		const date = () => this._reset();

		const resetForfilters = {
			'DATE': date,
			'DATE_TYPE': type
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

	/**
	 * filter the transactions
	 * @return {void} 
	 */
	_refineSearch() {
		if (!isNullorEmpty(this.policyHistory)) {
			this.filteredData = this.policyHistory;

			if (!isNullorEmpty(this.startDate) && !isNullorEmpty(this.endDate)) {
				if (RENDER_CHIPS[FILTER_BY.DATE]) {
					const startDate = new Date(Date.parse(this.startDate));
					const endDate = new Date(Date.parse(this.endDate));
					this.filteredData = this.filteredData.filter(item => new Date(item.effectiveDate) >= startDate && new Date(item.effectiveDate) <= endDate);
				}
			} else {
				this.filteredData = [];
			}
			this.requestUpdate();
		}
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

		/**
	 * scroll to top of transactions table
	 * @param {event} e e
	 * @return {void} 
	 */
		_scrollToTop() {
			const element = this.shadowRoot.getElementById(`policy-transactions-table`);
			element.scrollTop = 0;
		}


	/**
	 * Navigate to client summary
	 * @returns {void}
	 */
	_navigateToSummary() {
		this.dispatchEvent(new CustomEvent(`navigate-to-summary`, {
			detail: {
			}
		}));
	}

	async _openTransactionDetailsDialog(item) {
		this.policyHistoryDetails = await this.fetchPolicyHistoryDetails(item.activityGuid, this.policy);

		if (this.policyHistoryDetails?.length !== 0) {
			this.showHistoryDetailsDialog = true;
		}
	}

	// #endregion EVENT HANDLERS

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
			
			${INSURE_CSS}

			${INSURE_TRANSACTIONS_CSS}

			.insure-title-bar{
				margin-bottom: 0px; 
				border-top-left-radius: 5px; 
				border-top-right-radius: 5px;
				
			}

			.container{
				min-height: 650px;
				text-align: center;
				padding-top: 100px;
			}

			.label{
				font-weight: bold;
				font-size: 24px;
				margin-bottom: 30px;
			}
			
			.spacing { 
				margin-bottom: 30px;
				margin-top: 20px;
			}

			.notification {
				width: 350px;
				margin: auto;
			}

			.button-row{
				display: flex; 
				justify-content: center;
				padding: 10px 15px 15px 15px; 
				gap: 10px;
			}

			/* Header Details Bar styles */
			.actionbar-header > horizon-label {
				width: 256px;
				height: 100%;
				padding: 0px 0px 0px 16px;
			
				--horizon-label-text-height: 20px;
				--horizon-label-text-color: #FFFFFF;
				--horizon-label-value-color: #FFFFFF;
				--horizon-label-value-font-size: 16px;
				--horizon-label-value-line-height: 20px;
			}

			#header-label{
				color: #FFF;
			}

			.insure-title-bar{
				box-shadow: none;
			}

			.policy-transaction-card{
				min-height: auto;
				height: 65px;
				padding-top: 10px;
				padding-bottom: 10px;
				padding-left: 10px;
				padding-right: 10px;
				background-color: #ffffff;
				border-radius: 4px;
				border-width: 1px;
				border-style: solid;
				border-color: rgb(225, 225, 225);
				margin-bottom: 15px;
			}

			.history-view{
				--theme-container-padding-left: 15px;
				--theme-container-padding-right: 15px;
				--theme-container-padding-top: 15px;
				--theme-container-padding-bottom: 0px;
				--theme-layout-gap-line-color: 0px;
				height: 661px;
				width: 100%;
			}
			
			.transaction-container{
				display: flex;
			}

			.view-transaction-details-label{
				position: relative;
				left: 180px;
				top: 10px;
				cursor: pointer;

				--theme-label-font-color: #009DE0;
				--theme-label-strong-font-size: 16px;
				--theme-label-strong-font-weight: 600;
			}

			horizon-label {
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
			${this._renderPolicyHistoryDetailsDialog()}

		`;
	}

	

	/**
	 * Render the content HTML for the component
	 * @returns {html} html content
	 */
	_renderContent() {
		return html`
			<capitec-card class="transaction-card">
			<capitec-group layout="vertical" gap="line" halign="left" valign="top" >
				<div class="transact">
					${this._renderTitleBar()}
					${this._renderHeaderDetailsBar()}
				</div>
				
				${this._renderActionBar()}
				${this._renderFilterBar()}
				<capitec-content-box class="history-view" id="policy-transactions-table">
					${this._renderPolicyHistory()}
				</capitec-content-box>
				${this._renderFooter()}
			</capitec-group>
		</capitec-card>
		`;
	}

		/**
	 * Render Title Bar
	 * @returns {html} The html of the title
	*/
	_renderTitleBar() {
		return html`
		<capitec-title-bar class="insure-title-bar no-border-bottom" type="clear">
			<capitec-image
				alt="back"
				class="action-image"
				src="/images/insure/left-arrow.svg"
				@click="${() => this._navigateToSummary()}"
				data-automation-id="transactions-back">
			</capitec-image>
			<capitec-label 
				label="Policy History"
				type="title"
				id="header-label">
			</capitec-label>
		</capitec-title-bar>`;
	}

	/**
	 * Render Header Details Bar
	 * @returns {html} The html of the header details - Policy Number
	*/
	_renderHeaderDetailsBar() {
		return html`
			<capitec-group
				class= "actionbar-header"
				layout="horizontal"
				gap="none"
				halign="left"
				valign="center">
					<horizon-label label = "Policy number" 
						value = "${this.policy?.contractReference}" 
						data-automation-id="transaction-header-contract-reference">
					</horizon-label>
			</capitec-group>
		`;
	}

	/**
	 * Render Action Bar
	 * @returns {html} The html of the date type and date controls
	 */
	_renderActionBar() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="transaction-action-bar">
				<capitec-date-time-picker
					id="calendarRange"
					label = "Choose a date"
					startDate="${this.startDate === `dd mm yyyy` ? `` : this.startDate}"
					endDate="${this.endDate === `dd mm yyyy` ? `` : this.endDate}"
					maxDate="${new Date().toString()}"
					minDate = "${this.policyStartDate}"
					type="range"
					mode="date"
					inputType="calendar"
					outputType="string"
					.predefinedRanges="${getPredefinedDateRanges()}"
					@apply-clicked="${(e) => this._dateChanged(e)}"
					data-automation-id="transaction-history-date-filter">
				</capitec-date-time-picker>
			</capitec-group>
		`;
	}

		/**
	 * Show clear/clear all filters
	 * @returns {html} The html of Clear and Clear All filters
	 */
	_renderFilterBar() {
		if (RENDER_CHIPS[FILTER_BY.DATE] !== ``) {
			return html`
				<capitec-action-bar
					id="active-filters"
					class="filter-bar"
					data-automation-id="transaction-history-active-filters">
						<capitec-label label = "Active filters:"></capitec-label>
							${this._renderDateChip()}
				</capitec-action-bar>
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
				closable>
			</capitec-chip>`
			: html``;
	}

	/**
	 * Show load more feature in the footer
	 * @returns {html} - content of footer
	 */
	_renderFooter() {
		return html`
			<capitec-action-bar class="load-more-bar" ?hidden="${this.hideLoadMore || this.filteredData?.length === 0}">
				<capitec-spacer></capitec-spacer>
				<capitec-button
					type="clear"
					label="Load More"
					@click = ${() => this._loadMoreTransactions()}
					data-automation-id="policy-transaction-history-load-more">
				</capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-icon
					class='scroll-top'
					size="medium"
					icon="system/arrow-up-action"
					@click = ${() => this._scrollToTop()}
					data-automation-id="policy-transaction-history-scroll-top">
				</capitec-icon>
			</capitec-action-bar>`;
	}

	_renderPolicyHistory() {
		return this.filteredData?.Length !== 0 ? html`

		${this.filteredData?.map((item) => html`
		<div>
			<capitec-card class="policy-transaction-card" halign="center" valign="center" layout="vertical">
				<div class="transaction-container">
					<div style="width: 40%">
						<horizon-label
							class="label-policy-number fixed-label"
							label="Transaction"
							textOverflow="ellipsis"
							value="${item.transactionName.replace(/([a-z])([A-Z])/g, '$1 $2')}">
						</horizon-label>
					</div>
					<div style="width: 15%">
						<horizon-label
							label="Effective Date"
							textOverflow="ellipsis"
							value="${formatDate(item.effectiveDate,`dd mmm yyyy`) === `` ? `-` : formatDate(item.effectiveDate, `dd mmm yyyy`)}">
						</horizon-label>
					</div>
					<div style="width: 15%">
						<horizon-label class="${item.status === `Active` ? `active-status` : `inactive-status`}"
							label="Status"
							textOverflow="ellipsis"
							value="${item.status}">
						</horizon-label>
					</div>
					<div style="width: 30%">
						<capitec-label class="view-transaction-details-label" type="strong" label="View Details"
							@click="${(item) => this._openTransactionDetailsDialog(item)}">
						</capitec-label>
					</div>
				</div>	
			</capitec-card>
		</div>
		`)}

		`
		: html`
			${this._renderNoResults()}
		`
	}

	
		/**
	 * Show message when there are no records
	 * @returns {html} - message for no results
	 */
	_renderNoResults() {
		let noResultsMessage;
		if (this.startDate) {
			noResultsMessage = `No transactions made during ${isNullorEmpty(RENDER_CHIPS[FILTER_BY.DATE]) ? `Last 90 days` : RENDER_CHIPS[FILTER_BY.DATE]}`;
		} else {
			noResultsMessage = `Adjust filters to see policy premium history`;
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

	_renderPolicyHistoryDetailsDialog() {
		return this.showHistoryDetailsDialog === false ? html`` 
		: html`
			<horizon-insure-policy-history-details-dialog
				.policyHistoryDetails="${this.policyHistoryDetails}"
				@close-modal="${() => this.showHistoryDetailsDialog = false}">
			</horizon-insure-policy-history-details-dialog>
		`;
	}



	// #endregion

}
window.customElements.define(`horizon-insure-funeral-policy-history`, FuneralPolicyHistory);

/**
 * Navigate back to client policies 
 *
 * @example
 * <horizon-insure-funeral-policy-history ... @navigate-to-summary="${this._handler}"></horizon-insure-funeral-policy-history>
 *
 * @event FuneralPolicyHistory#navigate-back
 * @type {Object} - N/A
 */