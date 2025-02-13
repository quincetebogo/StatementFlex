import { css, html } from 'platform/elements';
import { CapitecConnectService } from 'app/services/CapitecConnectService';
import { ViewBase } from 'app/views/common/ViewBase';
import { DateTime } from 'luxon';
import { formatDate, getTimeFromDate, compareDates, getDateInPast, incrementDate, sortObjectsByDateDescending, formatCellphoneNumber, isArray, isJson, toTitleCase, formatAmount } from 'app/utils/capitecConnectUtils';

/**
 * Capitec Connect Agent View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class CapitecConnectCampaigns
 */
export class CapitecConnectCampaigns extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.capitecConnectService = new CapitecConnectService(() => super._toggleBusyFlag());

		this.pagingRows = [10, 20, 50];
		this.numOfPagingRows = this.pagingRows[0];
		this.currentPageIndex = 1;

		this.showTable = false;

		this.clientCif = ``;
	}

	connectedCallback() {
		super.connectedCallback();

		/*
			When a client has called in. We get their CIF number. i.e. If they are "connected" to Horizon
		*/
		this.clientCif = this.callerInformation?.cif;

		if (this.callerInformation?.cifNumber) {
			this.clientCif = this.callerInformation?.cifNumber;
		}

		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	static get properties() {
		return {
			showTable: { type: Boolean },
			callerInformation: { type: Object },
			clientCif: { type: String }
		};
	}

	static get styles() {
		return [
			super.styles,
			css`
				.custom-flex-size {
					flex: 1;
				}
			`
		];
	}

	_initialise() {
		this.clientCif = "281783047";

		this.showTable = true;
	}

	async _retrieveCampaigns(renderSet) {
		this.renderSet = renderSet;
		this.numOfPagingRows = this.renderSet.numOfPagingRows;
		this.currentPageIndex = this.renderSet.currentPageIndex;

		try {
			const pagination_args = {
				"page": typeof this.currentPageIndex === `number` ? this.currentPageIndex - 1 : 1, // -1 because we start from 0,
				"size": typeof this.numOfPagingRows === `number` ? this.numOfPagingRows : 10,
				"sort": [
					"campaignStartDate,asc"
				]
			}

			const response = await this.getCampaigns(pagination_args);

			this.showTable = response.result.totalElements !== 0;

			return {
				pagedItems: response.result?.content || [],
				totalCount: response.result.totalElements // for pagination reasons this is not the returned resultset's length
			};
		} catch (error) {
			this.showTable = false;

			return {
				pagedItems: [],
				totalCount: 0
			};
		}
	}

	onFilter() {
		this.showTable = false;
		// this.requestUpdate();

		setTimeout(() => {
			this.showTable = true;
			this.requestUpdate();
		}, 100);
	}

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._render()}
		`;
	}

	/* RENDERS:start */
	_render() {
		return html`
			<capitec-content-box noPadding style="width:CALC(var(--horizon-center-panel-width) - 30px); height:CALC(var(--horizon-panel-height) - 180px)" layout="vertical" halign="stretch" valign="top" gap="clear">
				${this.showTable ? html`
					<capitec-table style="" 
							displayMode="Paging" 
							groupField="month"
							numOfPagingRows="${this.numOfPagingRows}"
							pagingRows="[${this.pagingRows.join(`,`)}]"
							.dataHandler="${(renderSet) => this._retrieveCampaigns(renderSet)}"
							expandable="right" 
							.expandRenderer="${(item) => this._expandRenderer(item)}">
						<capitec-table-column label="Campaign Name" field="ccName"></capitec-table-column>
						<capitec-table-column label="Campaign ID" field="ccId"></capitec-table-column>
						<capitec-table-column label="Start date" field="ccStartOn"></capitec-table-column>
						<capitec-table-column label="Notification Channel" field="ccNotifyTypeDescription"></capitec-table-column>
					</capitec-table>
					`
				: html`
					<capitec-table>
						<capitec-table-column label="Campaign Name" field="ccName"></capitec-table-column>
						<capitec-table-column label="Campaign ID" field="ccId"></capitec-table-column>
						<capitec-table-column label="Start date" field="ccStartOn"></capitec-table-column>
						<capitec-table-column label="Notification Channel" field="ccNotifyTypeDescription"></capitec-table-column>
					</capitec-table>
					<capitec-content-box>
						<capitec-label align="center" type="default" label="No campaign data found."></capitec-label>
					</capitec-content-box>
				`}
			</capitec-content-box>
		`;
	}

	_renderTag(item, fieldName, value) {
		return html`<capitec-tag label="${value.toUpperCase()}" type="info"></capitec-tag>`;
	}

	_renderBeneficiaryName(item, fieldName, value) {
		return value[0]?.beneficiaryName;
	}

	_expandRenderer(item) {
		return html`
			<capitec-spacer></capitec-spacer>

			<capitec-group layout="grid" gap="clear">
				<div row="1" column="1" colspan="5">
					<capitec-label type="strong" label="SVM Campaign Information"></capitec-label>
				</div>

				<div row="2" column="1" colspan="5">
					<capitec-label label="Qualification criteria:"></capitec-label>
					<capitec-label type="strong" label="A customer recharged for R10 in the last 7 days"></capitec-label>
				</div>

				<div row="3" column="1">
					<capitec-label label="Resource type"></capitec-label>
					<capitec-label type="strong" label="Data"></capitec-label>
				</div>
				<div row="3" column="2">
					<capitec-label label="Product description"></capitec-label>
					<capitec-label type="strong" label="1GB data bundle"></capitec-label>
				</div>
				<div row="3" column="3">
					<capitec-label label="Valid for"></capitec-label>
					<capitec-label type="strong" label="7 days"></capitec-label>
				</div>
				<div row="3" column="4">
					<capitec-label label="Start date"></capitec-label>
					<capitec-label type="strong" label="21/12/2024 16:00"></capitec-label>
				</div>
				<div row="3" column="5">
					<capitec-label label="End date"></capitec-label>
					<capitec-label type="strong" label="21/12/2024 16:00"></capitec-label>
				</div>

				<div row="4" column="1">
					<capitec-label label="Notification channel"></capitec-label>
					<capitec-label type="strong" label="SMS"></capitec-label>
				</div>
			</capitec-group>
		`;
	}

	_renderIcon() {
		return html`
				<img src="/images/liveBetter/capitec-connect-white.svg"/>`;
	}
	/* RENDERS:end */
}

customElements.define(`horizon-capitec-connect-agent-campaign-info`, CapitecConnectCampaigns);
