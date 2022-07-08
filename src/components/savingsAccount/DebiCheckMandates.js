import { Component, css, html, unsafeCSS } from 'platform/elements';
import { TABLE_ROW_CELL_CSS, TABLE_ROW_CSS, getFontColor } from 'app/css/DebiCheckMandates';
import { convertCentsToRand, getDateOrdinal } from 'app/utils/channelServiceUtilities';
import { formatCurrency } from 'app/productControls/utilities/Currency';

const FILTER_BY = {
	ALL: 0,
	PENDING: 1,
	ACTIVE: 2,
	INACTIVE: 3
};

const MANDATE_STATUS = {
	// ACTIVE, INACTIVE, SUSPENDED, PENDING, ALL
	ACTIVE: `Accepted`,
	INACTIVE: `Expired`,
	PENDING: `Pending`,
	SUSPENDED: `Expired`
};

/**
 * DebiCheck mandates component
 *
 * Events Raised
 * -------------
 * back
 * 
 * @export
 * @class DebiCheckMandates
 * @extends {Component}
 */
export class DebiCheckMandates extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// private properites
		this.pendingMandates = [];
		this.activeMandates = [];
		this.inActiveMandates = [];
		this.filterBy = 0;
		this.noMandatesError = `No DebiCheck mandates on the account`;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Array} debiCheckMandates Contains list of active/pending/expired mandates
	 *
	 * @readonly
	 * @static
	 * @memberof DebiCheckMandates
	 */
	static get properties() {
		return {
			debiCheckMandates: { type: Array },
			filterBy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._loading();
		this._initialise();
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

	_performFilter(type) {
		this.filterBy = FILTER_BY[type];
	}

	_filterByText(event) {
		
		/**
		 * Capitec text field component is firing two events for every key press.
		 * Ignoring the event which doesn't have detail property
		 */
		if (!event.detail) {
			return true;
		}

		const searchText = event.detail.new && event.detail.new.toLowerCase();
		if (!searchText) {
			this.noMandatesError = `No DebiCheck mandates on the account`;
			this._initialise();
		} else {
			this.noMandatesError = `No results found`;
			this.pendingMandates = this._lookForSearchText(MANDATE_STATUS.PENDING, searchText);
			this.activeMandates = this._lookForSearchText(MANDATE_STATUS.ACTIVE, searchText);
			this.inActiveMandates = this._lookForSearchText(MANDATE_STATUS.INACTIVE, searchText);
		}
		this.requestUpdate();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_loading() {
		this.dispatchEvent(new CustomEvent(`loading`));
	}

	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	_initialise() {
		this.pendingMandates = this.debiCheckMandates.filter(item => MANDATE_STATUS[item.mandateStatus] === MANDATE_STATUS.PENDING);
		this.pendingMandates.sort((a, b) => b.canBeAuthenticated - a.canBeAuthenticated);
		this.activeMandates = this.debiCheckMandates.filter(item => MANDATE_STATUS[item.mandateStatus] === MANDATE_STATUS.ACTIVE);
		this.inActiveMandates = this.debiCheckMandates.filter(item => MANDATE_STATUS[item.mandateStatus] === MANDATE_STATUS.INACTIVE);
	}
	
	_formatCollectionDate(collectionDate) {
		return `${collectionDate.day}${getDateOrdinal(collectionDate.day)} of each ${collectionDate.frequency}`;
	}

	_lookForSearchText(status, searchText) {
		return this.debiCheckMandates.filter(item => MANDATE_STATUS[item.mandateStatus] === status &&
											  (item.mandateName.toLowerCase().indexOf(searchText) !== -1 ||
											   parseFloat(item.amount).toFixed(2).startsWith(searchText) ||
											   parseFloat(item.maxCollectionAmount).toFixed(2).startsWith(searchText)));
	}

	_viewInfo(mandateInfo, isPending) {
		this.dispatchEvent(new CustomEvent(`action`, { detail: { "action": `viewInfo`, mandateInfo: mandateInfo, isPending: isPending } }));
	}

	_decline(mandateInfo) {
		// TODO: Add mandate data to the event
		this.dispatchEvent(new CustomEvent(`action`, { detail: { action: `decline`, mandateInfo: mandateInfo } }));
	}

	_approve(mandateInfo) {
		// TODO: Add mandate data to the event
		this.dispatchEvent(new CustomEvent(`action`, { detail: { action: `approve`, mandateInfo: mandateInfo } }));
	}

	_hasMandatesToDisplay() {
		let flag = false;

		if (this.filterBy === FILTER_BY.ALL && (this.pendingMandates.length > 0 || this.activeMandates.length > 0 || this.inActiveMandates.length > 0)) {
			flag = !flag;
		} else if (this.filterBy === FILTER_BY.PENDING && this.pendingMandates.length > 0) {
			flag = !flag;
		} else if (this.filterBy === FILTER_BY.ACTIVE && this.activeMandates.length > 0) {
			flag = !flag;
		} else if (this.filterBy === FILTER_BY.INACTIVE && this.inActiveMandates.length > 0) {
			flag = !flag;
		} else {
			// do nothing
		}

		return flag;
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
				.debi-check {
					height: 889px;
					width: var(--horizon-center-panel-width, 1064px);
					box-sizing: border-box;
					border: 1px solid #E1E1E1;
					border-radius: 5px;
					background-color: #FFFFFF;
					box-shadow: none!important;
				}
				capitec-card > capitec-group:first-child {
					--theme-layout-gap-spacing: 0px;
				}
				capitec-title-bar {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
					--theme-titlebar-padding: 0px 0px 0px 16px;
				}
				capitec-title-bar > capitec-icon {
					cursor: pointer;
					margin-right: 16px;
				}
				.debicheck-action-bar {
					height: 64px;
					--theme-actionbar-padding: 4px 16px 4px 16px;
					--theme-actionbar-min-height: 56px;
					--theme-actionbar-item-gap: 8px;
					box-shadow: none!important;
					margin: 0px;
				}
				.debicheck-action-bar > capitec-text-field {
					height: 49px;
					width: 441px;
					--theme-input-label-font-color: #969B9D;
					margin-top: 8px;
					line-height: 24px;
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
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 9px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 0px;
					height: 759px;
					width: auto;
				}
				capitec-content-box > .section-header {
					height: 44px;
					margin-left: 8px;

					--theme-layout-gap-spacing: 8px;
				}
				capitec-content-box > .section-header:not(:first-child) {
					margin-top: 24px;
				}
				.status-icon {
					width: 10px;
					height: 10px;
					border-radius: 12px;
				}
				.status-icon.Pending {
					background-color: #D4781C;
				}
				.status-icon.Active {
					background-color: #70AF00;
				}
				.status-icon.Inactive {
					background-color: #A5132A;
				}
				.status-label {
					--theme-label-default-font-weight: 600;
					--theme-label-default-font-size: 20px;
					--theme-label-font-color: #3E4547;
					line-height: 28px;
				}
				capitec-table{
					--theme-data-table-border: none;
					--theme-data-table-body-group-background-color: #FFFFFF;
					--theme-data-table-body-group-font-weight: 600;
					--theme-data-table-body-group-padding-top: 0px;
					--theme-data-table-body-group-padding-bottom: 0px;
					--theme-data-table-body-group-padding-left: 0px;
					--theme-data-table-body-group-padding-right: 0px;
					--theme-data-table-body-group-color: #3E4547;
					--theme-data-table-padding-top: 0px;
					--theme-data-table-padding-bottom: 0px;
					--theme-data-table-padding-left: 0px;
					--theme-data-table-padding-right: 0px;
					--theme-system-hover-color: #FFFFFF;
					--theme-data-table-body-row-selected-background-color: #FFFFFF;
					--theme-data-table-border-last-row: none;
					--theme-data-table-footer-border: none;
				}

				/* No Results CSS */
				.document-icon {
					margin-top: 85px;
				}
				.debi-check-logo {
					width: 96px;
					height: 24px;
					margin-bottom: 33px;
				}
				.no-results-group {
					width: 1032px;
				}
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="debi-check">
				<capitec-group layout="vertical" gap="line" halign="left" valign="top">
					${this._renderTitleBar()}
					${this._renderActionBar()}
					<capitec-content-box>
						${this._renderDebiCheckMandates()}
						${this._renderNoResults()}
					</capitec-content-box>
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar type="default">
				<capitec-icon 
					size="medium"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="DebiCheck" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderActionBar() {
		return html`
			<capitec-action-bar class="debicheck-action-bar">
				<capitec-text-field 
					label="Search by description or amount"
					type="search"
					keyboardMode="alpha-numeric"
					@input="${(e) => this._filterByText(e)}"
					@value-changed="${(e) => this._filterByText(e)}">
				</capitec-text-field>
				<capitec-radio-group>
					<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
						<capitec-radio 
							class="radio-btn-all"
							label="All"
							@value-change="${() => this._performFilter(`ALL`)}"
							?checked = "${this.filterBy === FILTER_BY.ALL}">
						</capitec-radio>
						<capitec-radio
							class="radio-btn-pending"
							label="Pending"
							@value-change="${() => this._performFilter(`PENDING`)}"
							?checked = "${this.filterBy === FILTER_BY.PENDING}">
						</capitec-radio>
						<capitec-radio
							class="radio-btn-active"
							label="Active"
							@value-change="${() => this._performFilter(`ACTIVE`)}"
							?checked = "${this.filterBy === FILTER_BY.ACTIVE}">
						</capitec-radio>
						<capitec-radio
							class="radio-btn-inactive"
							label="Inactive"
							@value-change="${() => this._performFilter(`INACTIVE`)}"
							?checked = "${this.filterBy === FILTER_BY.INACTIVE}">
						</capitec-radio>
					</capitec-group>
				</capitec-radio-group>
			</capitec-action-bar>
		`;
	}

	_renderDebiCheckMandates() {
		switch (this.filterBy) {

			case FILTER_BY.PENDING:
				return html`
					${this._renderPendingMandates()}
				`;
			case FILTER_BY.ACTIVE:
				return html`
					${this._renderActiveMandates()}
				`;
			case FILTER_BY.INACTIVE:
				return html`
					${this._renderInActiveMandates()}
				`;
			case FILTER_BY.ALL:
			default:
				return html`
					${this._renderPendingMandates()}
					${this._renderActiveMandates()}
					${this._renderInActiveMandates()}
				`;
		}
	}

	_renderPendingMandates() {
		if (this.pendingMandates.length > 0) {
			return html`
				${this._renderHeader(`Pending`)}
				<capitec-table displayMode="Full" .items="${this.pendingMandates}" ?hideHeader=${true}>
					<capitec-table-column label="" field="" type="text" 
										  .renderer="${(rowData) => this._renderRows(rowData)}">
					</capitec-table-column>
				</capitec-table>
			`;
		}
		return html``;
	}

	_renderActiveMandates() {
		if (this.activeMandates.length > 0) {
			return html`
				${this._renderHeader(`Active`)}
				<capitec-table displayMode="Full" .items="${this.activeMandates}" ?hideHeader=${true}>
					<capitec-table-column label="" field="" type="text" 
										  .renderer="${(rowData) => this._renderRows(rowData)}">
					</capitec-table-column>
				</capitec-table>
			`;
		}
		return html``;
	}

	_renderInActiveMandates() {
		if (this.inActiveMandates.length > 0) {
			return html`
				${this._renderHeader(`Inactive`)}
				<capitec-table displayMode="Full" .items="${this.inActiveMandates}" ?hideHeader=${true}>
					<capitec-table-column label="" field="" type="text" 
										  .renderer="${(rowData) => this._renderRows(rowData)}">
					</capitec-table-column>
				</capitec-table>
			`;
		}
		return html``;
	}

	_renderHeader(label) {
		return html`
			<capitec-group class="section-header"
						   layout="horizontal"
						   halign="left"
						   valign="center"
						   gap="clear">
				<div class="status-icon ${label}"></div>
				<capitec-label label="${label}" class="status-label"></capitec-label>
			</capitec-group>
		`;
	}

	_renderRows(rowData) {
		return html`
			<capitec-group style="${TABLE_ROW_CSS.rowItem}"
						   layout="horizontal"
						   gap="none"
						   halign="left"
						   valign="center">
				<div style="${unsafeCSS(TABLE_ROW_CSS.width223)} ${unsafeCSS(TABLE_ROW_CSS.borderRight).toString()}">
					${this._renderCell(rowData.mandateName, formatCurrency(convertCentsToRand(rowData.amount)))}
				</div>
				<div style="${unsafeCSS(TABLE_ROW_CSS.width185).toString()}">
					${this._renderCell(`Max collection amount`, formatCurrency(convertCentsToRand(rowData.maxCollectionAmount)))}
				</div>
				<div style="${unsafeCSS(TABLE_ROW_CSS.width185).toString()}">
					${this._renderCell(`Collection day`, rowData.collectionDayFrequency)}
				</div>
				<div style="${unsafeCSS(TABLE_ROW_CSS.width128).toString()}">
					${this._renderCell(`Status`, MANDATE_STATUS[rowData.mandateStatus])}
				</div>
				<capitec-group layout="horizontal" gap="clear" halign="right" valign="center" style="width: 250px;">
					${this._renderButtons(rowData.mandateStatus, rowData)}
				</capitec-group>
				<div></div>
			</capitec-group>`;
	}

	_renderCell(value1, value2) {
		
		const fontColor = getFontColor(value1, value2);
		return html`
			<capitec-group style="${unsafeCSS(TABLE_ROW_CELL_CSS.cellGroup).toString()}"
						   layout="vertical"
						   gap="none"
						   halign="left"
						   valign="top">
				<capitec-label style="${unsafeCSS(TABLE_ROW_CELL_CSS.cellLabel).toString()}"
							   label="${value1}"
							   type="default">
				</capitec-label>
				<capitec-label style="${unsafeCSS(TABLE_ROW_CELL_CSS.cellLabelStrong).toString()} ${unsafeCSS(fontColor).toString()}"
							   label="${value2}"
							   type="default">
				</capitec-label>
			</capitec-group>
		`;
	}

	_renderButtons(status, rowData) {
		if (status === `PENDING`) {
			return rowData.canBeAuthenticated
				? html`<capitec-label type="subtitle"
									label="Decline"
									style="${TABLE_ROW_CELL_CSS.cellButton}"
									@click="${() => this._decline(rowData)}">
					 </capitec-label>
					 <capitec-label type="subtitle"
					 				label="Approve"
									style="${TABLE_ROW_CELL_CSS.cellButton}"
									@click="${() => this._approve(rowData)}">
					 </capitec-label>
					 <capitec-label type="subtitle"
						label="View"
						style="${TABLE_ROW_CELL_CSS.cellButton}"
						@click="${() => this._viewInfo(rowData, false)}">
					 </capitec-label>`
				: html`<capitec-label type="subtitle"
						label="View"
						style="${TABLE_ROW_CELL_CSS.cellButton}"
						@click="${() => this._viewInfo(rowData, true)}">
					 </capitec-label>`;
		}
		return html`<capitec-label type="subtitle"
						label="View"
						style="${TABLE_ROW_CELL_CSS.cellButton}"
						@click="${() => this._viewInfo(rowData, false)}">
					 </capitec-label>`;
	}

	_renderNoResults() {
		
		if (this._hasMandatesToDisplay()) {
			return html``;
		}

		return html`
			<capitec-group
				layout="vertical"
				halign="center"
				valign="top"
				gap="none"
				class="no-results-group">
					<img
						src="/images/common/document.svg"
						class="document-icon"/>
					<img
						src="/images/debi-check/debi-check-logo.svg"
						class="debi-check-logo"/>
					<capitec-label
						class="no-results"
						label="${this.noMandatesError}"
						type="strong">
					</capitec-label>
			</capitec-group>
		`;
	}
}

customElements.define(`debi-check-mandates`, DebiCheckMandates);