import { Component, css, html, unsafeCSS } from 'platform/elements';

/**
 * Audit Transaction History component that displays Policy audit transactions
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
				.action-image{
					cursor: pointer;
				}
			`
		];
	}

	// #endregion RENDER STYLES

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

	// #endregion EVENTS

	// #region RENDERING

	/**
	 * 
	 * Entry point for rendering the component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			${this._renderContent()}
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

	// #endregion
}

window.customElements.define(`horizon-insure-audit-transaction-history`, AuditTransactionHistory);