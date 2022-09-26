import { Component, css, html, unsafeCSS } from 'platform/elements';
import { MAX_RESULTS } from 'app/constants/AuditTransactionHistory';

/**
 * Audit Transaction History component that displays audit transaction history
 * 
 * 
 * @export
 * @class AuditTransactionHistory
 * @extends {Component}
 */
class AuditTransactionHistory extends Component {
	
	// #region INITIALIZATION

	constructor() {
		super();

		this.startDate = ``;
		this.endDate = ``;

		this.auditTransactionHistory = {};
		this.filteredData = [];
		this.isBusy = false;
		this.hideLoadMore = true;
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
	 * @property {Object} filteredData - Object holds filtered transaction data
	 * @property {Object} auditTransactionHistory - Object holds transaction data
	 * @property {Function} getAuditTransactionHistory Callback function to fetch more data
	 * @property {Function} disposeData Callback function to clear transaction history data variable
	 * @property {Boolean} hideLoadMore Show/Hide Load More button
	 * 
	 * @readonly
	 * @static
	 */
	 static get properties() {
		return {
			dateLabel: { type: String, state: true },
			startDate: { type: String, state: true },
			endDate: { type: String, state: true },
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

					--theme-label-font-color: #FFFFFF;
				}
				.transact {
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
				}
				.lbb {
					background: no-repeat url(../images/liveBetter/Gradient1.png);
				}
				.transaction-history-title > img {
					width: 26px;
					margin-right: 10px;
					cursor: pointer;
				}

				/* Header Details Bar styles */
				.actionbar-header {
					height: 64px;
					width: var(--horizon-center-panel-width, 1064px);
					border-bottom: 0px;
					padding: 11px 24px 11px 43px;
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
					padding: 10px 10px;
				}
				.transaction-action-bar > capitec-text-field {
					height: 47px;
					width: 388px;
					padding-left: 8px;
				
					--theme-label-font-color: #3A3A3A;
					--theme-input-label-font-size: 16px;
					--theme-layout-gap-spacing: 8px; 
					--theme-input-clear-icon-height: 0px;
					--theme-input-clear-icon-width: 0px;
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
					--theme-icon-size-default: 8px;
					--theme-data-table-body-group-font-weight: 600;
					--theme-data-table-font-size : 15px;
					--theme-data-table-padding-left: 16px;
					--theme-data-table-body-group-color: #3A3A3A;
					--theme-data-table-font-color: #3A3A3A;
					--theme-data-table-padding-right: 16px;
					--theme-data-table-padding-top: 11px;
					--theme-data-table-padding-bottom: 11px;
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
					margin-right: 8px;
					width: 280px;
				}
				.transaction-action-bar > capitec-chip{
					margin: 0px 8px;
					--theme-chip-label-padding-left: 11px;
					--theme-chip-label-padding-right: 11px;
					--theme-chip-label-line-height: 19px;
				}
				.type-normal{
					--theme-chip-label-color: #3A3A3A;
					--theme-chip-background-color: #FFFFFF;
				}
				.type-selected{
					--theme-chip-label-color: #FFFFFF;
					--theme-chip-background-color: #009DE0;
					--theme-chip-font-weight: 600;
				}
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.no-result-group {
					width: 1062px;
					margin-top: 130px;
				}
				.action-image{
					cursor: pointer;
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

		// Making sure no baggage is carried from the previous instance.
		// RENDER_CHIPS[FILTER_BY.DATE] = ``;
		// RENDER_CHIPS[FILTER_BY.DATE_TYPE] = this.dateTypeOptions[0].text;

		this.filteredData = this.auditTransactionHistory?.transactions;
		this.hideLoadMore = this.auditTransactionHistory?.transactions?.length % MAX_RESULTS > 0 && this.auditTransactionHistory?.transactions?.length % MAX_RESULTS < MAX_RESULTS;
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
						<capitec-content-box class="main-view" id="audit-transactions-table">
						</capitec-content-box>
						${this._renderFooter()}
				</capitec-group>
			</capitec-card>
			${this._renderLoadingIndicator()}
		`;
	}

	/**
	 * Render content of the component
	 * @returns {html} The html content of the header, filter, transactions table and footer.
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}" />
			<capitec-label label="Audit Transaction History" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
		</capitec-title-bar>
		<capitec-card style="min-height: 100vh;">
			<capitec-group layout="vertical" gap="line" halign="left" valign="top">
				<capitec-content-box class="main-view" id="audit-transactions-table">
				</capitec-content-box>
			</capitec-group>
		</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="insure-title-bar" type="insure">
				<capitec-image
					alt="back"
					class="action-image"
					src="/images/insure/left-arrow.svg"
					@click="${() => this._backToSummaryPage()}"
					data-automation-id="audit-transaction-history-back">
				</capitec-image>
				<capitec-label 
					label="Audit Transaction History"
					type="title">
				</capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-action-bar class="load-more-bar" 
				?hidden="${this.hideLoadMore || this.auditTransactionHistory.length === 0}">
				<capitec-spacer></capitec-spacer>
				<capitec-button
					type="clear"
					label="Load More"
					@click = ${() => this._loadMoreTransactions()}
					data-automation-id="audit-transaction-history-load-more">
				</capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-icon
					class='scroll-top'
					size="medium"
					icon="system/arrow-up-action"
					@click = ${(e) => this._scrollToTop(e)}
					data-automation-id="audit-transaction-history-scroll-top">
				</capitec-icon>
			</capitec-action-bar>`;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="audit-transaction-history-loading-indicator"></capitec-loading-indicator>`
			: html``;
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

	// #endregion PRIVATE METHODS

}

window.customElements.define(`horizon-insure-audit-transaction-history`, AuditTransactionHistory);