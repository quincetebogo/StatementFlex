import { Component, html, unsafeCSS } from "platform/elements";
import { TABLE_ROW_CSS, TABLE_ROW_CELL_CSS } from 'app/css/DebiCheckMandates';

const getSuffix = day => {
	if (day > 3 && day < 21)
		return 'th';

	switch (day % 10) {
		case 1: return "st";
		case 2: return "nd";
		case 3: return "rd";
		default: return "th";
	}
}

/**
 * DebiCheck mandates component
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
		this.pendingMandates = {};
		this.activeMandates = {};
		this.inActiveMandates = {};
	}

	// --------------
	// PROPERTIES
	// --------------
	static get properties() {
		return {
			debiCheckMandates: { type: Object }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback(){
		this.pendingMandates = this.debiCheckMandates.filter(item => item.mandateStatus === `Pending`);
		this.activeMandates = this.debiCheckMandates.filter(item => item.mandateStatus === `Active`);
		this.inActiveMandates = this.debiCheckMandates.filter(item => item.mandateStatus === `Expired` || item.mandateStatus === `Declined`);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_groupByHandler(renderSet) {
		const groupedValues = Utilities.groupBy(renderSet.items, renderSet.groupField);
		const newRows = [];
		let index = -1;

		for (const key in groupedValues) {
			if (groupedValues.hasOwnProperty(key)) {

				let groupName = key;
				index++;

				if (renderSet.groupLabel && Utilities.isFunction(renderSet.groupLabel)) {
					groupName = renderSet.groupLabel(key);
				} else if (typeof renderSet.groupLabel === `string`) {
					groupName = renderSet.groupLabel;
				}

				if (groupName) {
					newRows.push({
						group: this._getGroupLabel(groupName, index)
					});
				}
				const rows = groupedValues[key];
				newRows.push(...rows);
			}
		}

		return {
			pagedItems: newRows
		};
	}

	_getGroupLabel(label, index) {
		
	}

	_formatCollectionDate(collectionDate){
		return `${collectionDate.day}${getSuffix(collectionDate.day)} of each ${collectionDate.frequency}`
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
					height: 888px;
					width: 1064px;
					box-sizing: border-box;
					border: 1px solid #E1E1E1;
					border-radius: 5px;
					background-color: #FFFFFF;
					box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				capitec-card > capitec-group:first-child {
					--theme-layout-gap-spacing: 0px;
				}
				.debicheck-action-bar {
					height: 56px;
					--theme-actionbar-padding: 4px 16px 4px 16px;
					--theme-actionbar-min-height: 56px;
					--theme-actionbar-item-gap: 8px;
				}
				.debicheck-action-bar > capitec-text-field {
					height: 49px;
					width: 441px;
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
					--theme-container-padding-right: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 0px;
					height: 676px;
				}
				capitec-content-box > .section-header {
					height: 44px;
					margin-left: 8px;
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
				.status-icon.InActive {
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
			`
		]
	}

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="debi-check">
				<capitec-group layout="vertical" gap="line" halign="left" valign="top">
					${this._renderTitleBar()}
					${this._renderActionBar()}
					${this._renderDebiCheckMandates()}
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar type="default">
				<img src="/images/insure/left-arrow.svg" @click="${() => this._back()}" />
				<capitec-label label="DebiCheck" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderActionBar() {
		return html`
			<capitec-action-bar class="debicheck-action-bar">
				<capitec-text-field label="Search by description or amount" type="search">
				</capitec-text-field>
				<capitec-radio-group>
					<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
						<capitec-radio label="All" class="radio-btn-all" checked></capitec-radio>
						<capitec-radio label="Pending" class="radio-btn-pending"></capitec-radio>
						<capitec-radio label="Active" class="radio-btn-active"></capitec-radio>
						<capitec-radio label="Inactive" class="radio-btn-inactive"></capitec-radio>
					</capitec-group>
				</capitec-radio-group>
			</capitec-action-bar>
		`;
	}

	_renderDebiCheckMandates() {
		return html`
			<capitec-content-box>
				${this._renderPendingMandates()}
				${this._renderActiveMandates()}
				${this._renderInActiveMandates()}
			</capitec-content-box>
		`;
	}

	_renderPendingMandates(){
		return html`
			${this._renderHeader(`Pending`)}
			<capitec-table displayMode="Full" .items="${this.pendingMandates}" hideHeader=${true}>
				<capitec-table-column label="" field="" type="text" 
									  .renderer="${(rowData) => this._renderRows(rowData)}">
				</capitec-table-column>
			</capitec-table>
		`;
	}

	_renderActiveMandates(){
		return html`
			${this._renderHeader(`Active`)}
			<capitec-table displayMode="Full" .items="${this.activeMandates}" hideHeader=${true}>
				<capitec-table-column label="" field="" type="text" 
									  .renderer="${(rowData) => this._renderRows(rowData)}">
				</capitec-table-column>
			</capitec-table>
		`;
	}

	_renderInActiveMandates(){
		return html`
			${this._renderHeader(`InActive`)}
			<capitec-table displayMode="Full" .items="${this.inActiveMandates}" hideHeader=${true}>
				<capitec-table-column label="" field="" type="text" 
									  .renderer="${(rowData) => this._renderRows(rowData)}">
				</capitec-table-column>
			</capitec-table>
		`;
	}

	_renderHeader(label){
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
				<div style="${unsafeCSS(TABLE_ROW_CSS.width_223)} ${unsafeCSS(TABLE_ROW_CSS.border_Right)}">
					${this._renderCell(rowData.mandateName, rowData.maxCollectionAmount)}
				</div>
				<div style="${unsafeCSS(TABLE_ROW_CSS.width_185)}">
					${this._renderCell('Max collection amount', rowData.maxCollectionAmount)}
				</div>
				<div style="${unsafeCSS(TABLE_ROW_CSS.width_185)}">
					${this._renderCell('Collection date', this._formatCollectionDate(rowData.collectionDate))}
				</div>
				<div style="${unsafeCSS(TABLE_ROW_CSS.width_98)}">
					${this._renderCell('Status', rowData.mandateStatus)}
				</div>
			</capitec-group>`;
	}

	_renderCell(value1, value2){
		return html`
			<capitec-group style="${unsafeCSS(TABLE_ROW_CELL_CSS.rowCell_Group)}"
						   layout="vertical"
						   gap="none"
						   halign="left"
						   valign="top">
				<capitec-label style="${unsafeCSS(TABLE_ROW_CELL_CSS.rowCell_Label)}"
							   label="${value1}"
							   type="default">
				</capitec-label>
				<capitec-label style="${unsafeCSS(TABLE_ROW_CELL_CSS.rowCell_Label_Strong)}"
							   label="${value2}"
							   type="default">
				</capitec-label>
			</capitec-group>
		`;
	}
}

customElements.define(`horizon-debi-check`, DebiCheckMandates);