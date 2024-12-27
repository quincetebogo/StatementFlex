import { css, html } from "platform/elements";
import {
	formatAmount,
	formatDate,
	getDateInPast,
	getTimeFromDate,
	incrementDate
} from "app/utils/capitecConnectUtils";
import { CapitecConnectService } from "app/services/CapitecConnectService";
import { DateTime } from "luxon";
import { ViewBase } from "app/views/common/ViewBase";

/**
 * Capitec Connect Agent Devices View
 *
 * @export
 * @class CapitecConnectAgentDevices
 */
export class CapitecConnectAgentDevices extends ViewBase {
	constructor() {
		super();

		this.capitecConnectService = new CapitecConnectService(() => super._toggleBusyFlag());

		// Static variables
		this.searchTypes = [
			{ value: `orderDate`, text: `Order Date` },
			{ value: `accountNumber`, text: `Account Number` },
			{ value: `imeiNumber`, text: `IMEI Number` },
			{ value: `description`, text: `Order Description` },
			{ value: `amount`, text: `Order Amount` },
			{ value: `deviceName`, text: `Device Name` }
		];

		this.pagingRows = [10, 20, 50];
		this.numOfPagingRows = 10;
		this.currentPageIndex = 1;

		// State variables
		this.activeFilters = {
			searchType: this.searchTypes[0],
			searchValue: ``,
			selectedDate: { value: `NonSelected` },
			dateRange: {
				from: getDateInPast(30),
				to: getDateInPast(0)
			}
		};

		this.clientCif = `030530180`; // TODO: comment out when done with dev
	}

	static get properties() {
		return {
			...super.properties,
			numOfPagingRows: { type: Number },
			currentPageIndex: { type: Number },
			activeFilters: { type: Object }
		};
	}

	static get styles() {
		return [
			super.styles,
			css`
        .custom-flex-size {
          flex: 1;
        }

        capitec-button-bar.no-border-top {
          border-top: none;
        }
      `
		];
	}

	getPredefinedDateRanges() {
		return [
			{
				text: `Last 30 days`,
				value: { startDate: getDateInPast(30), endDate: getDateInPast(0) }
			},
			{
				text: `Last 60 days`,
				value: { startDate: getDateInPast(60), endDate: getDateInPast(0) }
			},
			{
				text: `Last 90 days`,
				value: { startDate: getDateInPast(90), endDate: getDateInPast(0) }
			}
		];
	}

	_dateChanged(e) {
		if (!e.detail.new.startDate && !e.detail.new.endDate) {
			return false;
		} else if (!e.detail.new.endDate) {
			e.detail.new.endDate =
				e.detail.old.endDate?.split(`T`)[0] || getDateInPast(0);
		} else if (!e.detail.new.startDate) {
			e.detail.new.startDate = incrementDate(
				e.detail.new.endDate.split(`T`)[0],
				-30
			);
		}

		const currentDateTime = DateTime.local();
		const fromDate = DateTime.fromISO(e.detail.new.startDate);
		let toDate = DateTime.fromISO(e.detail.new.endDate);

		let from, to;

		if (toDate.diff(fromDate, [`days`]).days > 90) {
			toDate = fromDate.plus({ days: 90 });

			if (toDate > currentDateTime) {
				from = e.detail.new.startDate;
				to = getDateInPast(0);
			} else {
				from = e.detail.new.startDate;
				to = e.detail.new.endDate;

				const calendar = this.shadowRoot.querySelector(`#calendarRange`);
				if (calendar) {
					calendar._placeholderEndDate = toDate;
				}
			}
		} else {
			from = e.detail.new.startDate || getDateInPast(30);
			to = e.detail.new.endDate || incrementDate(from, 30);
		}

		Object.keys(e.detail).forEach((d) => {
			Object.keys(e.detail[d]).forEach((x) => {
				if (e.detail[d][x] !== null && e.detail[d][x].indexOf(`T`) > -1) {
					e.detail[d][x] = e.detail[d][x].split(`T`)[0];
				}
			});
		});

		this.activeFilters.dateRange = {
			from: from.split(`T`)[0],
			to: to.split(`T`)[0]
		};

		return this.onFilter();
	}

	onFilter() {
		this.showTable = false;

		setTimeout(() => {
			this.showTable = true;
			this.requestUpdate();
		}, 100);
	}

	render() {
		return html`
      <capitec-content-box
        noPadding
        style="width:CALC(var(--horizon-center-panel-width) - 30px); height:CALC(var(--horizon-panel-height) - 180px)"
        layout="vertical"
        halign="stretch"
        valign="top"
        gap="clear"
      >
        <capitec-button-bar align="left">
          <capitec-search-field
            label="Search"
            value="${this.activeFilters.searchValue}"
            class="custom-flex-size"
            @value-change="${(e) => {
				this.activeFilters.searchValue = e.detail.new;
				this.onFilter();
		}}"
          >
          </capitec-search-field>

          <capitec-select
            label="Select option"
            .items="${this.searchTypes}"
            .value="${this.activeFilters.searchType}"
            @value-change="${(e) => {
				this.activeFilters.searchType = e.detail.new;
				this.onFilter();
			}}"
            display-field="text"
            id-field="value"
          >
          </capitec-select>

          <capitec-date-time-picker
            id="calendarRange"
            class="custom-flex-size"
            label="Choose a start and end date"
            startDate="${this.activeFilters.dateRange.from}"
            endDate="${this.activeFilters.dateRange.to}"
            maxDate="${getDateInPast(0)}"
            type="range"
            mode="date"
            inputType="calendar"
            outputType="string"
            .predefinedRanges="${this.getPredefinedDateRanges()}"
            @apply-clicked="${(e) => this._dateChanged(e)}"
            data-automation-id="connect-devices-date-filter"
          >
          </capitec-date-time-picker>

          <capitec-button
            type="primary"
            label="Search"
            @click="${() => this.onFilter()}"
          ></capitec-button>
        </capitec-button-bar>

        <capitec-button-bar align="left" class="no-border-top">
          <capitec-label label="Active Filters:"></capitec-label>
          ${this.activeFilters.searchValue
				? html`<capitec-chip
                closable
                @remove="${() => {
						this.activeFilters.searchValue = ``;
						this.onFilter();
			}}"
                label="${this.activeFilters.searchType.text}: ${this
					.activeFilters.searchValue}"
              >
              </capitec-chip>`
			: null}
          ${this.activeFilters.dateRange.to !== null &&
				this.activeFilters.dateRange.from !== null
				? html`<capitec-chip
                label="${formatDate(this.activeFilters.dateRange.from)} - ${formatDate(this.activeFilters.dateRange.to)}"
              >
              </capitec-chip>`
			: null}
        </capitec-button-bar>

        <capitec-table
          displayMode="Paging"
          groupField="month"
          numOfPagingRows="${this.numOfPagingRows}"
          pagingRows="[${this.pagingRows.join(`,`)}]"
          .dataHandler="${(renderSet) => this._retrieveDevices(renderSet)}"
          expandable="right"
          .expandRenderer="${(item) => this._expandRenderer(item)}"
        >
          <capitec-table-column
            label="Order Date"
            field="orderDate"
            .renderer="${(item) => (item.orderDate
				? `${formatDate(item.orderDate)} ${getTimeFromDate(item.orderDate)}`
				: item.orderDate)}"
          ></capitec-table-column>
          <capitec-table-column
            label="Order Number"
            field="orderNumber"
          ></capitec-table-column>
          <capitec-table-column
            label="Order Description"
            field="orderDescription"
          ></capitec-table-column>
          <capitec-table-column
            label="Order Amount (incl VAT)"
            field="orderAmount"
            .renderer="${this._renderAmount}"
          ></capitec-table-column>
          <capitec-table-column
            label="Order Status"
            field="orderStatus"
            .renderer="${this._renderStatus}"
          ></capitec-table-column>
        </capitec-table>
      </capitec-content-box>
    `;
	}

	async _retrieveDevices(renderSet) {
		this.renderSet = renderSet;
		this.currentPageIndex = this.renderSet.currentPageIndex;

		let response;
		try {
			const today = new Date();
			const year = today.getFullYear();
			const month = String(today.getMonth() + 1).padStart(2, `0`);
			const day = String(today.getDate()).padStart(2, `0`);
			const todayStr = `${year}-${month}-${day}`;

			const params = {
				pageNumber: this.currentPageIndex - 1,
				pageSize: this.numOfPagingRows,
				searchValue: this.activeFilters?.searchValue || ``,
				dateFrom:
					this.activeFilters?.selectedDate?.value === `NonSelected`
						? null
						: getDateInPast(this.activeFilters?.selectedDate?.value || 30),
				dateTo: incrementDate(todayStr, 1),
				clientCif: this.clientCif
			};
			response = await this.capitecConnectService.getDeviceOrders(params);
		} catch (error) {
			console.error(`Error in getDeviceOrders:`, error);
		}

		const mappedItems = response.result.content.map((order) => ({
			orderDate: order.orderPlacedDate,
			orderNumber: order.orderId,
			orderDescription: order.orderDescription,
			orderAmount: order.amount,
			deviceName: order.deviceName,
			imeiNumber: order.imeiNumber,
			accountNumber: order.accountNumber,
			orderStatus: order.orderStatus.split(`_`).join(` `)
		}));

		return {
			pagedItems: mappedItems,
			totalCount: response.totalElements
		};
	}

	_expandRenderer(item) {
		const getValue = (value) => (!value || value === `null` ? `-` : value);
		const getFormattedDate = (date) => (date ? `${formatDate(date)} ${getTimeFromDate(date)}` : `-`);

		return html`
      <capitec-group layout="grid" gap="clear">
        <div column="1" row="1" colspan="4">
          <capitec-label label="Device Description"></capitec-label>
          <capitec-label
            type="strong"
            label="${getValue(item.orderDescription)}"
          ></capitec-label>
        </div>

        <div column="2" row="1">
          <capitec-label label="IMEI 1"></capitec-label>
          <capitec-copy-text>
            <capitec-label
              type="strong"
              label="${getValue(item.imeiNumber)}"
            ></capitec-label>
          </capitec-copy-text>
        </div>

        <div column="3" row="1">
          <capitec-label label="IMEI 2"></capitec-label>
          <capitec-copy-text>
            <capitec-label
              type="strong"
              label="${getValue(item.imeiNumber2)}"
            ></capitec-label>
          </capitec-copy-text>
        </div>

        <div column="4" row="1">
          <capitec-label label="Device Cost"></capitec-label>
          <capitec-label
            type="strong"
            label="R${getValue(item.orderAmount)}"
          ></capitec-label>
        </div>

        <div column="1" row="2">
          <capitec-label label="Order Date"></capitec-label>
          <capitec-label
            type="strong"
            label="${getFormattedDate(item.orderDate)}"
          ></capitec-label>
        </div>

        <div column="2" row="2">
          <capitec-label label="Order Status"></capitec-label>
          <capitec-label
            type="strong"
            label="${getValue(item.orderStatus)}"
          ></capitec-label>
        </div>

        <div column="3" row="2">
          <capitec-label label="Account Number"></capitec-label>
          <capitec-label
            type="strong"
            label="${getValue(item.accountNumber)}"
          ></capitec-label>
        </div>

        <div column="1" row="3">
          <capitec-label label="Courier Tracking"></capitec-label>
          <capitec-copy-text>
            <capitec-label
              type="strong"
              label="${getValue(item.courierTracking)}"
            ></capitec-label>
          </capitec-copy-text>
        </div>

        <div column="2" row="3">
          <capitec-label label="Warranty Start Date"></capitec-label>
          <capitec-label
            type="strong"
            label="${getFormattedDate(item.warrantyStartDate)}"
          ></capitec-label>
        </div>

        <div column="3" row="3">
          <capitec-label label="Warranty End Date"></capitec-label>
          <capitec-label
            type="strong"
            label="${getFormattedDate(item.warrantyEndDate)}"
          ></capitec-label>
        </div>
        ${item.orderStatus !== `ORDER DELIVERED`
				? html`
              <div
                row="4"
                column="1"
                colspan="4"
                style="text-align: right; --theme-hyperlink-color: #009DE0; border-top: var(--theme-data-table-border, 1px solid #E1E1E1);"
              >
                <capitec-hyperlink
                  style="margin-right: 16px; margin-top: 10px;"
                  label="View Invoice"
                  @click="${() => { }}"
                >
                </capitec-hyperlink>
              </div>
            `
			: ``}
      </capitec-group>
    `;
	}

	_renderAmount(item, fieldName, value) {
		return formatAmount(value);
	}

	_renderStatus(item, fieldName, value) {
		const label = value.replace(`ORDER`, ``);
		let type = `warning`;

		if (value === `ORDER PAYMENT SUCCESSFUL`) {
			type = `info`;
		}

		if (value === `ORDER DELIVERED`) {
			type = `success`;
		}

		return html`<capitec-tag label="${label}" type="${type}"></capitec-tag>`;
	}
}

customElements.define(
	`horizon-capitec-connect-agent-devices`,
	CapitecConnectAgentDevices
);