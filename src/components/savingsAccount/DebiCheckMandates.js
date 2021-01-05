import { css, html, Component, unsafeCSS } from 'platform/elements';
import { TABLE_ROW_CSS, TABLE_ROW_CELL_CSS, getFontColor } from 'app/css/DebiCheckMandates';
import { getDateOrdinal } from 'app/utils/channelServiceUtilities';

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
		this.pendingMandates = {};
		this.activeMandates = {};
		this.inActiveMandates = {};
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} debiCheckMandates Contains list of active/pending/expired mandates
	 *
	 * @readonly
	 * @static
	 * @memberof DebiCheckMandates
	 */
	static get properties() {
		return {
			debiCheckMandates: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.pendingMandates = this.debiCheckMandates.filter(item => item.mandateStatus === `Pending`);
		this.activeMandates = this.debiCheckMandates.filter(item => item.mandateStatus === `Accepted`);
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
	
	_formatCollectionDate(collectionDate) {
		return `${collectionDate.day}${getDateOrdinal(collectionDate.day)} of each ${collectionDate.frequency}`
	}

	_formatCollectionAmount(amount) {
		return `R${amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, " ")}`;
	}

	_viewInfo() {
		// TODO: Functionality to get mandate info comes here
	}

	_decline() {
		// TODO: Functionality to decline mandate comes here
	}

	_approve() {
		// TODO: Functionality to approve mandate comes here
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
				capitec-title-bar {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
					--theme-titlebar-padding: 0px 0px 0px 16px;
				}
				capitec-title-bar > capitec-icon {
					cursor: pointer;
					margin-right: 34px;
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
					--theme-input-label-font-color: #969B9D;
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
					--theme-container-padding-right: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 0px;
					height: 768px;
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
					${this._renderDebiCheckMandates()}
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar type="default">
				<capitec-icon 
					size="small"
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

	_renderPendingMandates() {
		return html`
			${this._renderHeader(`Pending`)}
			<capitec-table displayMode="Full" .items="${this.pendingMandates}" hideHeader=${true}>
				<capitec-table-column label="" field="" type="text" 
									  .renderer="${(rowData) => this._renderRows(rowData)}">
				</capitec-table-column>
			</capitec-table>
		`;
	}

	_renderActiveMandates() {
		return html`
			${this._renderHeader(`Active`)}
			<capitec-table displayMode="Full" .items="${this.activeMandates}" hideHeader=${true}>
				<capitec-table-column label="" field="" type="text" 
									  .renderer="${(rowData) => this._renderRows(rowData)}">
				</capitec-table-column>
			</capitec-table>
		`;
	}

	_renderInActiveMandates() {
		return html`
			${this._renderHeader(`InActive`)}
			<capitec-table displayMode="Full" .items="${this.inActiveMandates}" hideHeader=${true}>
				<capitec-table-column label="" field="" type="text" 
									  .renderer="${(rowData) => this._renderRows(rowData)}">
				</capitec-table-column>
			</capitec-table>
		`;
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
				<div style="${unsafeCSS(TABLE_ROW_CSS.width_223)} ${unsafeCSS(TABLE_ROW_CSS.border_Right)}">
					${this._renderCell(rowData.mandateName, this._formatCollectionAmount(rowData.maxCollectionAmount))}
				</div>
				<div style="${unsafeCSS(TABLE_ROW_CSS.width_185)}">
					${this._renderCell(`Max collection amount`, this._formatCollectionAmount(rowData.maxCollectionAmount))}
				</div>
				<div style="${unsafeCSS(TABLE_ROW_CSS.width_185)}">
					${this._renderCell(`Collection date`, this._formatCollectionDate(rowData.collectionDate))}
				</div>
				<div style="${unsafeCSS(TABLE_ROW_CSS.width_98)}">
					${this._renderCell(`Status`, rowData.mandateStatus)}
				</div>
				<capitec-group layout="horizontal" gap="clear" halign="right" valign="center" style="width: 341px;">
					${this._renderButtons(rowData.mandateStatus)}
				</capitec-group>
				<div></div>
			</capitec-group>`;
	}

	_renderCell(value1, value2) {
		
		const fontColor = getFontColor(value1, value2);
		return html`
			<capitec-group style="${unsafeCSS(TABLE_ROW_CELL_CSS.cell_Group)}"
						   layout="vertical"
						   gap="none"
						   halign="left"
						   valign="top">
				<capitec-label style="${unsafeCSS(TABLE_ROW_CELL_CSS.cell_Label)}"
							   label="${value1}"
							   type="default">
				</capitec-label>
				<capitec-label style="${unsafeCSS(TABLE_ROW_CELL_CSS.cell_Label_Strong)} ${unsafeCSS(fontColor)}"
							   label="${value2}"
							   type="default">
				</capitec-label>
			</capitec-group>
		`;
	}

	_renderButtons(status) {
		return status !== `Pending` ? 
				html`<capitec-label type="subtitle"
									label="View Info"
									style="${TABLE_ROW_CELL_CSS.cell_Button}"
									@click="${() => this._viewInfo()}">
					 </capitec-label>` :
				html`<capitec-label type="subtitle"
									label="Decline"
									style="${TABLE_ROW_CELL_CSS.cell_Button}"
									@click="${() => this._decline()}">
					 </capitec-label>
					 <capitec-label type="subtitle"
					 				label="Approve"
									style="${TABLE_ROW_CELL_CSS.cell_Button}"
									@click="${() => this._approve()}">
					 </capitec-label>`;
	}
}

customElements.define(`debi-check-mandates`, DebiCheckMandates);