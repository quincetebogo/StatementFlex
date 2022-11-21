import { Component, css, html, unsafeCSS } from 'platform/elements';
import { TABLE_ROW_CELL_CSS, TABLE_ROW_CSS, getFontColor } from 'app/css/DebiCheckMandates';
import { convertCentsToRand, getDateOrdinal } from 'app/utils/channelServiceUtilities';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/dialogs/quickTransactions/ViewInfoDebiCheck';

const FILTER_BY = {
	ALL: 0,
	PENDING: 1,
	ACTIVE: 2,
	INACTIVE: 3,
	DECLINED: 4
};

const MANDATE_STATUS = {
	// ACTIVE, INACTIVE, SUSPENDED, PENDING, ALL
	ACTIVE: `Accepted`,
	INACTIVE: `Expired`,
	PENDING: `Pending`,
	SUSPENDED: `Expired`
};

const SECONDARY_STATUS = {
	DECLINED: `Declined`
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
		this.declinedMandates = [];
		this.filterBy = 0;
		this.noMandatesError = `No DebiCheck mandates on the account`;

		this.mandateDetails = {};
		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
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
			filterBy: { attribute: false },
			renderMode: { attribute: false },

			debicheckAction: { type: Object }
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
			this.declinedMandates = this._lookForSearchText(MANDATE_STATUS.INACTIVE, searchText, SECONDARY_STATUS.DECLINED);
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
		this.inActiveMandates = this.debiCheckMandates.filter(item => MANDATE_STATUS[item.mandateStatus] === MANDATE_STATUS.INACTIVE && SECONDARY_STATUS[item.secondaryStatus] !== SECONDARY_STATUS.DECLINED);
		this.declinedMandates = this.debiCheckMandates.filter(item => SECONDARY_STATUS[item.secondaryStatus] === SECONDARY_STATUS.DECLINED);
	}
	
	_formatCollectionDate(collectionDate) {
		return `${collectionDate.day}${getDateOrdinal(collectionDate.day)} of each ${collectionDate.frequency}`;
	}

	_lookForSearchText(status, searchText, secondaryStatus) {
		return this.debiCheckMandates.filter(item => MANDATE_STATUS[item.mandateStatus] === status && SECONDARY_STATUS[item.secondaryStatus] === secondaryStatus &&
											  (item.mandateName.toLowerCase().indexOf(searchText) !== -1 ||
											   parseFloat(item.amount).toFixed(2).startsWith(searchText) ||
											   parseFloat(item.maxCollectionAmount).toFixed(2).startsWith(searchText)));
	}

	async _viewInfo(mandateInfo, isPending) {
		const mandateDetails = await this._mandateActionClick(`viewInfo`, mandateInfo, isPending);
		if (mandateDetails) {
			this.mandateDetails = { ...mandateDetails, ...mandateInfo };
			this.renderMode = RENDER_MODE.DEBI_CHECK_VIEW_INFO;
		}
	}

	async _decline(mandateInfo) {
		await this._mandateActionClick(`decline`, mandateInfo);
	}

	async _approve(mandateInfo) {
		await this._mandateActionClick(`approve`, mandateInfo);
	}

	_hasMandatesToDisplay() {
		let flag = false;

		if (this.filterBy === FILTER_BY.ALL && (this.pendingMandates.length > 0 || this.activeMandates.length > 0 || this.inActiveMandates.length > 0 || this.declinedMandates.length > 0)) {
			flag = !flag;
		} else if (this.filterBy === FILTER_BY.PENDING && this.pendingMandates.length > 0) {
			flag = !flag;
		} else if (this.filterBy === FILTER_BY.ACTIVE && this.activeMandates.length > 0) {
			flag = !flag;
		} else if (this.filterBy === FILTER_BY.INACTIVE && this.inActiveMandates.length > 0) {
			flag = !flag;
		} else if (this.filterBy === FILTER_BY.DECLINED && this.declinedMandates.length > 0) {
			flag = !flag;
		} else {
			// do nothing
		}

		return flag;
	}

	_backFromMandateDetails() {
		this.dispatchEvent(new CustomEvent(`back-from-details`, {}));
		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
	}

	_mandateActionClick(action, mandateInfo, isPending) {
		return this.debicheckAction(action, mandateInfo, isPending);
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
					--theme-actionbar-padding-bottom: 8px;
					--theme-actionbar-padding-top: 4px;
					--theme-actionbar-padding-left: 21px;
					--theme-actionbar-min-height: 56px;
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
				.type-normal{
					--theme-chip-label-color: #3A3A3A;
					--theme-chip-background-color: #FFFFFF;
				}
				capitec-chip{
					width: 85px;
					margin: 0px 8px;
					--theme-chip-font-size: 12px;
					--theme-chip-label-padding-left: 15px;
					--theme-chip-label-padding-right: 11px;
					--theme-chip-label-line-height: 20px;
					--theme-chip-font-weight: 500;
				}
				capitec-chip[label="All"] {
					--theme-chip-label-padding-left: 28px;
				}
				capitec-chip[label="Active"] {
					--theme-chip-label-padding-left: 20px;
				}
				capitec-chip[label="Declined"] {
					--theme-chip-label-padding-left: 14px;
				}
				.type-selected{
					--theme-chip-label-color: #FFFFFF;
					--theme-chip-background-color: #009DE0;
					--theme-chip-font-weight: 600;
				}
				capitec-content-box {
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 0px;
					height: 759px;
					width: 1064px;
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
				.status-icon.Declined {
					background-color: #3A3A3A
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
			${this._renderMandates()}
			${this._renderDebiCheckViewMandateInfo()}
		`;
	}

	_renderMandates() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_PAGE
		? html`
			<capitec-card class="debi-check">
				<capitec-group layout="vertical" gap="line" halign="left" valign="top">
					${this._renderTitleBar()}
					${this._renderActionBar()}
					<capitec-content-box>
						${this._renderDebiCheckMandates()}
						${this._renderNoResults()}
					</capitec-content-box>
				</capitec-group>
			</capitec-card>`
		: html``;
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
				<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
						<capitec-chip 
							label="All" 
							class="${this.filterBy === FILTER_BY.ALL ? `type-selected` : `type-normal`}" 
							@click="${() => this._performFilter(`ALL`)}">
						</capitec-chip>
						<capitec-chip 
							label="Pending" 
							class="${this.filterBy === FILTER_BY.PENDING ? `type-selected` : `type-normal`}" 
							@click="${() => this._performFilter(`PENDING`)}">
						</capitec-chip>
						<capitec-chip 
							label="Active" 
							class="${this.filterBy === FILTER_BY.ACTIVE ? `type-selected` : `type-normal`}" 
							@click="${() => this._performFilter(`ACTIVE`)}">
						</capitec-chip>
						<capitec-chip 
							label="Inactive" 
							class="${this.filterBy === FILTER_BY.INACTIVE ? `type-selected` : `type-normal`}" 
							@click="${() => this._performFilter(`INACTIVE`)}">
						</capitec-chip>
						<capitec-chip 
							label="Declined" 
							class="${this.filterBy === FILTER_BY.DECLINED ? `type-selected` : `type-normal`}" 
							@click="${() => this._performFilter(`DECLINED`)}">
						</capitec-chip>
					</capitec-group>
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
			case FILTER_BY.DECLINED:
				return html`
					${this._renderDeclinedMandates()}
				`;
			case FILTER_BY.ALL:
			default:
				return html`
					${this._renderPendingMandates()}
					${this._renderActiveMandates()}
					${this._renderInActiveMandates()}
					${this._renderDeclinedMandates()}
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
	
	_renderDeclinedMandates() {
		if (this.declinedMandates.length > 0) {
			return html`
				${this._renderHeader(`Declined`)}
				<capitec-table displayMode="Full" .items="${this.declinedMandates}" ?hideHeader=${true}>
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

				${this._renderInfoButton(rowData.mandateStatus, rowData)}

				<div style="${unsafeCSS(TABLE_ROW_CSS.width273)} ${unsafeCSS(TABLE_ROW_CSS.borderRight).toString()}">
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
				<capitec-group layout="horizontal" gap="clear" halign="left" valign="center" style="width: 190px;">
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
					 </capitec-label>`
				: html``;
		}
	}
	
	_renderInfoButton(status, rowData) {
		return html`
		<capitec-icon
			icon="system/info-action"
			style="${unsafeCSS(TABLE_ROW_CELL_CSS.cellInfoIcon).toString()}"
			@click="${() => this._viewInfo(rowData, status === `PENDING`)}">
		</capitec-icon>`;

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

	_renderDebiCheckViewMandateInfo() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_VIEW_INFO
			? html`
				<horizon-viewinfo-debicheck
					.debiCheckDetails=${this.mandateDetails}
					@back="${() => this._backFromMandateDetails()}"
					@approve="${(event) => this._approve(event.detail.mandateInfo)}"
					@decline="${(event) => this._decline(event.detail.mandateInfo)}"
				></horizon-viewinfo-debicheck>`
			: html``;
	}
}

customElements.define(`debi-check-mandates`, DebiCheckMandates);