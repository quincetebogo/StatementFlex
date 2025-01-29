/* eslint-disable no-extra-parens */
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
			{ value: `orderDescription`, text: `Order Description` },
			{ value: `accountNumber`, text: `Account Number` },
			{ value: `amount`, text: `Order Amount` },
			{ value: `deviceName`, text: `Device Name` },
			{ value: `imeiNumber`, text: `IMEI Number` }
		];

		this.pagingRows = [10, 20, 50];
		this.numOfPagingRows = 10;
		this.currentPageIndex = 1;

		// State variables
		this.activeFilters = {
			searchType: this.searchTypes[0],
			searchValue: ``,
			dateRange: {
				from: getDateInPast(30),
				to: getDateInPast(0)
			}
		};

		this.clientCif = ``;
		this.isInvoiceModalOpen = false;
		this.isCancelOrderModalOpen = false;
		this.isSuccessModalOpen = false;
		this.isErrorModalOpen = false;
		this.emailAddress = ``;
		this.isValidEmail = false;
		this.currentOrderId = ``;
		this.currentOrder = null;
		this.showTable = false;
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
			...super.properties,
			numOfPagingRows: { type: Number },
			currentPageIndex: { type: Number },
			activeFilters: { type: Object },
			clientCif: { type: String },
			isInvoiceModalOpen: { type: Boolean },
			isCancelOrderModalOpen: { type: Boolean },
			isSuccessModalOpen: { type: Boolean },
			isErrorModalOpen: { type: Boolean },
			emailAddress: { type: String },
			isValidEmail: { type: Boolean },
			currentOrderId: { type: String },
			currentOrder: { type: Object },
			showTable: { type: Boolean }
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

	_initialise() {
		// this.clientCif = ``;
		this.clientCif = `030530180`; // TODO: Add for DEV testing

		this.showTable = true;
	}

	async _retrieveDevices(renderSet) {
		this.renderSet = renderSet;
		this.numOfPagingRows = this.renderSet.numOfPagingRows;
		this.currentPageIndex = this.renderSet.currentPageIndex;
		this.searchValue = this.renderSet.searchValue;

		try {
			const request = {
				pageNumber: this.currentPageIndex - 1,
				pageSize: this.numOfPagingRows,
				clientCif: this.clientCif,
				searchType: this.activeFilters.searchType,
				searchValue: this.activeFilters.searchValue,
				dateRange: {
					startDate: this.activeFilters.dateRange.from,
					endDate: this.activeFilters.dateRange.to
				}
			};

			if (!this.clientCif) {
				return {
					pagedItems: [],
					totalCount: 0
				};
			}

			const response = await this.capitecConnectService.getAllDeviceOrders(request);

			let r = response.result.content;

			r = r.map((order) => ({
				orderDate: order.orderPlacedDate,
				orderNumber: order.orderId,
				orderDescription: order.orderDescription,
				orderAmount: order.amount,
				deviceName: order.deviceName,
				imeiNumber: order.imeiNumber,
				accountNumber: order.accountNumber,
				orderId: order.orderId,
				orderStatus: order.orderStatus.split(`_`).join(` `),
				hasLogged: false
			}));

			response.result.content = r;

			this.showTable = response.result.totalElements !== 0;

			return {
				pagedItems: response.result?.content || [],
				totalCount: response.result.totalElements
			};
		} catch (error) {
			console.error(`Error in getAllDeviceOrders:`, error);
			this.showTable = false;

			if (
				this.activeFilters.searchType.value === `accountNumber` &&
				this.activeFilters.searchValue.trim() !== `` &&
				this.clientCif
			) {
				alert(`Error: The provided Account Number [${this.activeFilters.searchValue.trim()}] is not owned by this client [cif ${this.clientCif
					}]`);
			}

			return {
				pagedItems: [],
				totalCount: 0
			};
		}
	}

	_renderTableCol(item) {
		return item.orderDate
			? `${formatDate(item.orderDate)} ${getTimeFromDate(item.orderDate)}`
			: item.orderDate;
	}

	async getInvoice() {
		try {
			const testId = `0aa248ce-fb02-4810-b2bc-ee381b239cbc`; // TODO remove when ready
			const response = await this.capitecConnectService.getDeviceInvoice(testId); // TODO remove when ready
			// const response = await this.capitecConnectService.getDeviceInvoice(this.currentOrderId); // TODO put back when ready
			console.log(`🚀 ~ getDeviceInvoice response->`, response);
		} catch (error) {
			console.error(`Error getting device invoice:`, error);
		}
	}

	_validateEmail(email) {
		const EMAIL_REGEX =
			/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;
		return EMAIL_REGEX.test(email);
	}

	_handleEmailInput(event) {
		const newValue = event.detail.new;
		this.emailAddress = newValue;
		this.isValidEmail = this._validateEmail(newValue);
		this.requestUpdate();
	}

	openInvoiceModal(orderId) {
		if (!this.isInvoiceModalOpen) {
			this.currentOrderId = orderId;
		}
		this.isInvoiceModalOpen = true;

		return html`
      <capitec-modal
        type="form"
        header="Invoice"
        ?open="${this.isInvoiceModalOpen}"
      >
        <capitec-content-box
          slot="body"
          layout="grid"
          style="height: auto; min-height: 300px; padding: 24px;"
        >
          <div column="1" row="1" colspan="2">
            <capitec-label
              type="strong"
              label="Enter email address"
            ></capitec-label>
            <br />
            <capitec-text-field
              label="Email Address"
              placeholder="Enter email address"
              value="${this.emailAddress || ``}"
              @key-input="${this._handleEmailInput}"
            ></capitec-text-field>
          </div>

          <div column="1" row="2" colspan="2" style="margin: 24px -24px;">
            <hr
              style="border: none; border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
            />
          </div>

          <div column="1" row="3" colspan="2">
            <capitec-label
              type="strong"
              label="View document"
              style="margin-bottom: 24px;"
            ></capitec-label>
            <div
              style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border: 1px solid var(--theme-modal-border-color, #E1E1E1); border-radius: 4px;"
            >
              <capitec-label
                label="Invoice"
                style="color: var(--theme-text-primary-color, #333333);"
              ></capitec-label>
              <capitec-hyperlink
                label="View Document"
                style="--theme-hyperlink-color: var(--theme-primary-color, #0091DA);"
                @click="${() => this.getInvoice()}"
              ></capitec-hyperlink>
            </div>
          </div>
        </capitec-content-box>

        <div
          slot="footer"
          style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px;"
        >
          <capitec-button
            type="secondary"
            label="Cancel"
            @click="${() => (this.isInvoiceModalOpen = false)}"
          ></capitec-button>
          <capitec-button
            type="primary"
            label="Send"
            .disabled="${!this.isValidEmail}"
            style="--theme-button-primary-background: var(--theme-primary-color, #0091DA);"
            @click="${() => this.sendInvoice()}"
          ></capitec-button>
        </div>
      </capitec-modal>
    `;
	}

	openCancelOrderModal(order) {
		if (!this.isCancelOrderModalOpen) {
			this.currentOrderId = order.orderNumber;
			this.currentOrder = order;
		}
		this.isCancelOrderModalOpen = true;

		return html`
	<capitec-modal
	  type="alert"
	  header="Cancel Order"
	  ?open="${this.isCancelOrderModalOpen}"
	>
	  <div slot="body" style="text-align: center; padding-top: 16px;">
		<capitec-label
		  label="You are about to cancel this order and the amount of"
		></capitec-label>
		<div style="display: flex; justify-content: center;">
		  <capitec-label
			type="strong"
			label="${formatAmount(this.currentOrder?.orderAmount)}"
		  ></capitec-label>
		  <capitec-label
			label=" will be refunded to the client"
		  ></capitec-label>
		  </div>
		<div style="display: flex; justify-content: center;">
		  <capitec-label label="(Account number "></capitec-label>
		  <capitec-label
			type="strong"
			label="${this.currentOrder?.accountNumber}"
		  ></capitec-label>
		  <capitec-label label=")."></capitec-label>
		</div>
		<capitec-label
		  label="It can take up to 24 hours for the funds to reflect."
		></capitec-label>
		<br />
		<capitec-label label="Are you sure?"></capitec-label>
	  </div>

	  <capitec-button
		slot="footer"
		type="secondary"
		label="Back"
		@click="${() => (this.isCancelOrderModalOpen = false)}"
	  ></capitec-button>
	  <capitec-button
		slot="footer"
		type="primary"
		label="Cancel Order"
		style="--theme-button-primary-background: var(--theme-primary-color, #0091DA);"
		@click="${() => this.cancelOrder()}"
	  ></capitec-button>
	</capitec-modal>
  `;
	}

	openSuccessModal() {
		return html`
      <capitec-modal
        type="alert"
        header="Cancel Order"
        ?open="${this.isSuccessModalOpen}"
      >
        <div slot="body" style="text-align: center; padding-top: 16px; justify-items: center;">
          <capitec-icon
            size="large"
            icon="status/success-trans"
          ></capitec-icon>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px;">
            <capitec-label type="strong" label="Order cancellation requested"></capitec-label>
          </div>
        </div>

        <capitec-button
          slot="footer"
          type="secondary"
          label="Close"
          @click="${() => (this.isSuccessModalOpen = false)}"
        ></capitec-button>
      </capitec-modal>
    `;
	}

	onOrderCancellationFail() {
		return html`
		  <capitec-modal
			type="alert"
			header="Cancel Order"
			?open="${this.isErrorModalOpen}"
		  >

			<div 
			column="1"
	         row="1"
	         colspan="2"
			slot="body" style="text-align: center; padding-top: 16px; justify-items: center;">
			  <capitec-icon size="large" icon="status/error-trans"></capitec-icon>
			  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px;">
				<capitec-label 
				  type="strong"
				  label="Order cancellation unsuccessful"
				></capitec-label>
				<capitec-label 
				  type="strong"
				  label="Please try again or contact support"
				></capitec-label>
			  </div>
			</div>
	
			<capitec-button
			  slot="footer"
			  type="secondary"
			  label="Close"
			  @click="${() => (this.isErrorModalOpen = false)}"
			></capitec-button>
		  </capitec-modal>
		`;
	}

	async cancelOrder() {
		await this.capitecConnectService
			.cancelDeviceOrder(this.currentOrderId)
			.then((res) => {
				console.log(`Order cancelled:`, res);
				this.isCancelOrderModalOpen = false;
				this.isSuccessModalOpen = true;
			})
			.catch(() => {
				this.isCancelOrderModalOpen = false;
				this.isErrorModalOpen = true;
			});
	}

	sendInvoice() {
		if (!this.emailAddress) {
			return;
		}
		try {
			console.log(`Sending invoice to:`, this.emailAddress);
			this.isInvoiceModalOpen = false;
		} catch (error) {
			console.error(`Error sending invoice:`, error);
		}
	}

	_expandRenderer(item) {
		const copyWordToClipboard = (value) => {
			navigator.clipboard.writeText(value);
		};

		if (!item.hasLogged) {
			this.capitecConnectService
				.getDeviceOrder(item.orderId)
				.then((response) => {
					item.deviceOrderResponse = response;
					item.hasLogged = true;
					this.requestUpdate();
				})
				.catch((error) => {
					console.error(`Error in getDeviceOrder:`, error);
				});
		}

		const getValue = (value) => (!value || value === `null` ? `-` : value);
		const getFormattedDate = (date) => (date ? `${formatDate(date)} ${getTimeFromDate(date)}` : `-`);
		const showInvoiceButton = item.orderStatus === `ORDER DELIVERED`;
		const showCancelButton = item.deviceOrderResponse?.result.cancellable;

		return html`
      <capitec-group layout="grid" gap="clear">
        <div column="1" row="1" colspan="4">
          <capitec-label label="Device Description"></capitec-label>
          <capitec-label
            type="strong"
            label="${getValue(item.deviceOrderResponse?.result.products[0]
				.productShortDescription)}"
          ></capitec-label>
        </div>

        <div column="2" row="1">
          <capitec-label label="IMEI 1"></capitec-label>
          <div
            column="2"
            row="1"
            style="display: flex; align-items: center; gap: 4px;"
          >
            <capitec-label
              type="strong"
              label="${getValue(item.deviceOrderResponse?.result.imeiNumber)} "
            ></capitec-label>
            ${getValue(item.deviceOrderResponse?.result.imeiNumber) !== `-`
				? html`<capitec-icon
                  size="small"
                  icon="system/notes-action"
                  @click="${() => copyWordToClipboard(getValue(item.deviceOrderResponse?.result.imeiNumber))}"
                  style="cursor: pointer;"
                ></capitec-icon>`
				: ``}
          </div>
        </div>

        <div column="3" row="1">
          <capitec-label label="IMEI 2"></capitec-label>
          <div
            column="2"
            row="1"
            style="display: flex; align-items: center; gap: 4px;"
          >
            <capitec-label
              type="strong"
              label="${getValue(item.deviceOrderResponse?.result.imeiNumber2)}"
            ></capitec-label>
            ${getValue(item.deviceOrderResponse?.result.imeiNumber2) !== `-`
				? html`<capitec-icon
                  size="small"
                  icon="system/notes-action"
                  @click="${() => copyWordToClipboard(getValue(item.deviceOrderResponse?.result.imeiNumber2))}"
                  style="cursor: pointer;"
                ></capitec-icon>`
				: ``}
          </div>
        </div>

        <div column="4" row="1">
          <capitec-label label="Device Cost"></capitec-label>
          <capitec-label
            type="strong"
            label="R${getValue(item.deviceOrderResponse?.result.totalInclVat)}"
          ></capitec-label>
        </div>

        <div column="1" row="2">
          <capitec-label label="Order Date"></capitec-label>
          <capitec-label
            type="strong"
            label="${getFormattedDate(item.deviceOrderResponse?.result.orderPlacedDate)}"
          ></capitec-label>
        </div>

        <div column="2" row="2">
          <capitec-label label="Order Status"></capitec-label>
          <capitec-label
            type="strong"
            label="${getValue(item.deviceOrderResponse?.result.orderStatus)}"
          ></capitec-label>
        </div>

        <div column="3" row="2">
          <capitec-label label="Account Number"></capitec-label>
          <capitec-label
            type="strong"
            label="${getValue(item.deviceOrderResponse?.result.accountNumber)}"
          ></capitec-label>
        </div>

        <div column="1" row="3">
          <capitec-label label="Courier Tracking"></capitec-label>
          <div
			column="2"
			row="3"
            style="display: flex; align-items: center; gap: 4px;"
		  >
			<capitec-label
			  type="strong"
			  label="${getValue(item.deviceOrderResponse?.result.courierTracking)}"
			></capitec-label>
			${getValue(item.deviceOrderResponse?.result.courierTracking) !== `-`
				? html`<capitec-icon
					size="small"
					icon="system/notes-action"
					@click="${() => copyWordToClipboard(getValue(item.deviceOrderResponse?.result.courierTracking))}"
					style="cursor: pointer;"
				  ></capitec-icon>`
				: ``}
          </div>
        </div>

        <div column="2" row="3">
          <capitec-label label="Warranty Start Date"></capitec-label>
          <capitec-label
            type="strong"
            label="${getFormattedDate(item.deviceOrderResponse?.result.warrantyStartDate)}"
          ></capitec-label>
        </div>

        <div column="3" row="3">
          <capitec-label label="Warranty End Date"></capitec-label>
          <capitec-label
            type="strong"
            label="${getFormattedDate(item.deviceOrderResponse?.result.warrantyEndDate)}"
          ></capitec-label>
        </div>

        <div row="4" column="1" colspan="4">
          ${showInvoiceButton || showCancelButton
			? html` <div
                style="padding-top:10px; display: flex; justify-content: flex-end; gap: 16px; margin-top: 10px; border-top: var(--theme-data-table-border, 1px solid #E1E1E1);"
              >
                ${!showInvoiceButton
				? html`
                      <capitec-hyperlink
                        style="--theme-hyperlink-color: #009DE0;"
                        label="View Invoice"
                        @click="${() => {
					this.openInvoiceModal(item.deviceOrderResponse?.result.orderNumber);
				}}"
                      >
                      </capitec-hyperlink>
                    `
				: ``}
                ${showCancelButton
				? html`
                      <capitec-hyperlink
                        style="--theme-hyperlink-color: #009DE0;"
                        label="Cancel"
                        @click="${() => {
					this.openCancelOrderModal(item);
				}}"
                      >
                      </capitec-hyperlink>
                    `
				: ``}
              </div>`
			: ``}
        </div>
      </capitec-group>
    `;
	}

	_renderAmount(item, fieldName, value) {
		return formatAmount(value);
	}

	_renderStatus(item, _fieldName, value) {
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

        ${this.showTable
			? html`
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
                  .renderer="${(item) => this._renderTableCol(item)}"
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
            `
			: html`
              <capitec-table>
                <capitec-table-column label="Order Date"></capitec-table-column>
                <capitec-table-column
                  label="Order Number"
                ></capitec-table-column>
                <capitec-table-column
                  label="Order Description"
                ></capitec-table-column>
                <capitec-table-column
                  label="Order Amount (incl VAT)"
                ></capitec-table-column>
                <capitec-table-column
                  label="Order Status"
                ></capitec-table-column>
              </capitec-table>
              <capitec-content-box>
                <capitec-label
                  align="center"
                  type="default"
                  label="No device orders found."
                ></capitec-label>
              </capitec-content-box>
            `}
        ${this.isInvoiceModalOpen ? this.openInvoiceModal() : null}
        ${this.isCancelOrderModalOpen ? this.openCancelOrderModal() : null}
        ${this.isSuccessModalOpen ? this.openSuccessModal() : null}
        ${this.isErrorModalOpen ? this.onOrderCancellationFail() : null}
      </capitec-content-box>
    `;
	}
}

customElements.define(
	`horizon-capitec-connect-agent-devices`,
	CapitecConnectAgentDevices
);