import { css, html } from 'platform/elements';
import { formatDate, getTimeFromDate, toTitleCase } from 'app/utils/capitecConnectUtils';
import { CapitecConnectService } from 'app/services/CapitecConnectService';
import { ViewBase } from 'app/views/common/ViewBase';

/**
 * Capitec Connect Agent Rewards History View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class CapitecConnectAgentRewardsHistory
 */
export class CapitecConnectAgentRewardsHistory extends ViewBase {
	constructor() {
		super();

		this.capitecConnectService = new CapitecConnectService(() => super._toggleBusyFlag());

		// Static variables
		this.filterTypes = [
			{ value: `campaignId`, text: `Campaign ID` },
			{ value: `productId`, text: `Product ID` },
			{ value: `transactionReference`, text: `Transaction Reference` }
		];

		this.pagingRows = [10, 20, 50];
		this.numOfPagingRows = this.pagingRows[0];
		this.currentPageIndex = 1;

		// State variables
		this.activeFilters = {
			filterType: this.filterTypes[0],
			filterValue: ``,
			dateRange: {
				from: null,
				to: null
			}
		};

		this.showTable = false;
		this.selectedReward = null;
		this.clientCif = ``;
	}

	connectedCallback() {
		super.connectedCallback();
		this.clientCif = this.callerInformation?.cif || this.callerInformation?.cifNumber;
		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	static get properties() {
		return {
			selectedReward: { type: Object },
			activeFilters: { type: Object },
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
		// this.clientCif = `800929667`;

		if (this.clientCif) {
			this.showTable = true;
		}
	}

	async _retrieveRewards(renderSet) {
		this.renderSet = renderSet;
		this.numOfPagingRows = renderSet.numOfPagingRows;
		this.currentPageIndex = renderSet.currentPageIndex;

		try {
			if (!this.clientCif) {
				this.showTable = false;
				return {
					pagedItems: [],
					totalCount: 0
				};
			}

			// Create payload with the required format
			const payload = {};

			payload.cif = this.clientCif;

			// Add filter based on type
			if (this.activeFilters.filterValue) {
				switch (this.activeFilters.filterType.value) {
					case `campaignId`:
						payload.campaignId = parseInt(this.activeFilters.filterValue, 10) || 0;
						break;
					case `productId`:
						payload.productId = parseInt(this.activeFilters.filterValue, 10) || 0;
						break;
					case `transactionReference`:
						payload.transactionReference = this.activeFilters.filterValue;
						break;
					default:
						break;
				}
			}

			// Add date range if present
			if (this.activeFilters.dateRange.from || this.activeFilters.dateRange.to) {
				payload.transactionDate = {
					startDate: this.activeFilters.dateRange.from || null,
					endDate: this.activeFilters.dateRange.to || null
				};
			}

			const response = await this.capitecConnectService.getRewardsHistory(
				payload,
				{
					page: this.currentPageIndex - 1,
					size: this.numOfPagingRows
				}
			);

			let rewards = response.result.content;
			if (rewards.length > 0) {
				rewards = rewards.map(reward => ({
					...reward,
					friendlyDate: `${formatDate(reward.transactionDate)} ${getTimeFromDate(reward.transactionDate)}`
				}));
			}

			this.showTable = response.result.totalElements !== 0;

			return {
				pagedItems: rewards,
				totalCount: response.result.totalElements
			};
		} catch (error) {
			console.error(`Error retrieving rewards:`, error);
			this.showTable = false;
			return {
				pagedItems: [],
				totalCount: 0
			};
		}
	}

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
            ${this._render()}
        `;
	}

	_render() {
		return html`
            <capitec-content-box noPadding style="width:CALC(var(--horizon-center-panel-width) - 30px); height:CALC(var(--horizon-panel-height) - 180px)" layout="vertical" halign="stretch" valign="top" gap="clear">
                <capitec-button-bar align="left">
                    <capitec-select 
                        label="Filter Type" 
                        .items="${this.filterTypes}" 
                        .value="${this.activeFilters.filterType}"
                        @value-change="${(e) => {
				this.activeFilters.filterType = e.detail.new;
				this.onFilter();
			}}"
                        display-field="text"
                        id-field="value">
                    </capitec-select>

                    <capitec-search-field 
                        label="Search" 
                        value="${this.activeFilters.filterValue}" 
                        class="custom-flex-size" 
                        @value-change="${(e) => {
				this.activeFilters.filterValue = e.detail.new;
				this.onFilter();
			}}">
                    </capitec-search-field>

                    <capitec-date-time-picker
                        label="Transaction Date"
                        startDate="${this.activeFilters.dateRange.from}"
                        endDate="${this.activeFilters.dateRange.to}"
                        type="range"
                        mode="date"
                        @apply-clicked="${(e) => this._dateChanged(e)}">
                    </capitec-date-time-picker>
                </capitec-button-bar>

                ${this.showTable ? html`
                    <capitec-table 
                        displayMode="Paging" 
                        numOfPagingRows="${this.numOfPagingRows}"
                        pagingRows="[${this.pagingRows.join(`,`)}]"
                        .dataHandler="${(renderSet) => this._retrieveRewards(renderSet)}"
                        expandable="right" 
                        .expandRenderer="${(item) => this._expandRenderer(item)}">
                        <capitec-table-column label="Transaction Date" field="friendlyDate"></capitec-table-column>
                        <capitec-table-column label="Campaign ID" field="campaignID"></capitec-table-column>
                        <capitec-table-column label="Product ID" field="productID"></capitec-table-column>
                        <capitec-table-column label="Status" field="status" .renderer="${this._renderStatus}"></capitec-table-column>
                        <capitec-table-column label="Beneficiary Name" field="beneficiaryName"></capitec-table-column>
                    </capitec-table>
                ` : html`
                    <capitec-content-box>
                        <capitec-label align="center" type="default" label="No rewards data found."></capitec-label>
                    </capitec-content-box>
                `}
            </capitec-content-box>

            ${this.selectedReward ? this._renderRewardDetailsModal() : null}
        `;
	}

	_renderStatus(item, fieldName, value) {
		return html`<capitec-tag label="${value.toUpperCase()}" type="${value.toUpperCase() === `SUCCESS` ? `success` : `warning`}"></capitec-tag>`;
	}

	_expandRenderer(item) {
		return html`
            <capitec-group layout="grid" gap="clear">
                <div column="1" row="1" colspan="4">
                    <capitec-label label="Transaction Reference:"></capitec-label>
                    <capitec-label type="strong" label="${item.transactionReference}"></capitec-label>
                </div>

                <div row="2" column="1" colspan="4" style="text-align: right;">
                    <capitec-hyperlink
                        label="View Details"
                        @click="${() => {
				this.selectedReward = item;
			}}">
                    </capitec-hyperlink>
                </div>
            </capitec-group>
        `;
	}

	_renderRewardDetailsModal() {
		const reward = this.selectedReward;
		return html`
        <capitec-modal type="form" header="Reward Details">
            <capitec-group slot="body" layout="grid" gap="clear">
                <div row="1" column="1">
                    <capitec-label label="Transaction Date"></capitec-label>
                    <capitec-label label="Campaign ID"></capitec-label>
                    <capitec-label label="Product ID"></capitec-label>
                    <capitec-label label="Status"></capitec-label>
                    <capitec-label label="Beneficiary Name"></capitec-label>
                    <capitec-label label="Transaction Reference"></capitec-label>
                </div>
                <div row="1" column="2">
                    <capitec-label label="${reward.friendlyDate}"></capitec-label>
                    <capitec-label label="${reward.campaignID}"></capitec-label>
                    <capitec-label label="${reward.productID}"></capitec-label>
                    <capitec-label label="${toTitleCase(reward.status)}"></capitec-label>
                    <capitec-label label="${reward.beneficiaryName}"></capitec-label>
                    <capitec-label label="${reward.transactionReference}"></capitec-label>
                </div>
            </capitec-group>

            <capitec-button slot="footer" type="primary" label="Close" @click="${() => {
				this.selectedReward = null;
			}}"></capitec-button>
        </capitec-modal>`;
	}

	onFilter() {
		this.showTable = false;
		setTimeout(() => {
			this.showTable = true;
			this.requestUpdate();
		}, 100);
	}

	_dateChanged(e) {
		if (!e.detail.new.startDate && !e.detail.new.endDate) {
			return false;
		}

		// Format dates to YYYY-MM-DD
		const formatDateString = (date) => {
			if (!date) {
				return null;
			}
			const d = new Date(date);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, `0`)}-${String(d.getDate()).padStart(2, `0`)}`;
		};

		this.activeFilters.dateRange = {
			from: formatDateString(e.detail.new.startDate),
			to: formatDateString(e.detail.new.endDate)
		};

		this.onFilter();
	}

	_renderIcon() {
		return html`
            <img src="/images/liveBetter/capitec-connect-white.svg"/>
        `;
	}
}

customElements.define(`horizon-capitec-connect-agent-rewards-history`, CapitecConnectAgentRewardsHistory);