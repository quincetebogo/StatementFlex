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
import "app/components/common/HorizonPDFViewer";

/**
 * Capitec Connect Agent Devices View
 *
 * @export
 * @class CapitecConnectAgentDevices
 */
export class CapitecConnectAgentDevices extends ViewBase {
	constructor() {
		super();
		this.clientCif = ``;
		this.isInvoiceModalVisible = false;
		this.isCancelOrderModalVisible = false;
		this.isSuccessModalVisible = false;
		this.isSendEmailSuccessModalVisible = false;
		this.isErrorModalVisible = false;
		this.hasInvoiceError = false;
		this.emailAddress = ``;
		this.currentOrderId = ``;
		this.currentOrder = null;
		this.isDeviceTableVisible = false;
		this.isInvoicePdfVisible = false;
		this.invoicePdfBase64 = ``;
		this.isLoading = false;
		this.capitecConnectService = new CapitecConnectService(() => super._toggleBusyFlag());
		this.isValidEmail = false;
		this.pagingRows = [10, 20, 50];
		this.numOfPagingRows = 10;
		this.currentPageIndex = 1;
		this.isConnectivityModalVisible = false;
		this.isReturnsModalVisible = false;
		this.isConnectivityIssuesModalVisible = false;
		this.isConnectivityTroubleshootingModalVisible = false;
		this.isConfirmDetailsModalVisible = false;
		this.isReturnsSuccessModalVisible = false;
		this.isOrderTrackerModalVisible = false;
		this.isOrderNegativeStatesModalVisible = false;
		this.isReturnsTableVisible = true;
		this.isReturnsModalVisible = false;
		this.returnsCache = [];
		// Static variables
		this.searchTypes = [
			{ value: `orderDescription`, text: `Order Description` },
			{ value: `accountNumber`, text: `Account Number` },
			{ value: `amount`, text: `Order Amount` },
			{ value: `deviceName`, text: `Device Name` },
			{ value: `serialNumbers`, text: `IMEI Number` }
		];
		// State variables
		this.activeFilters = {
			searchType: this.searchTypes[0],
			searchValue: ``,
			dateRange: {
				from: getDateInPast(30),
				to: getDateInPast(0)
			}
		};
		this.rowForms = new Map();
		this.tempReturnForm = {};
		this.currentActionType = '';
		this.currentOrderStatus = null;
		this.negativeStateModalConfig = {
			header: 'Order update',
			lines: []
		};
	}
	_onReturnFieldChange(field, e) {
		const val = e?.detail?.new ?? e?.detail?.value ?? e?.target?.value ?? '';
		this.tempReturnForm = { ...this.tempReturnForm, [field]: val };
		sessionStorage.setItem('returnDraft', JSON.stringify(this.tempReturnForm)); // debug-only
		this.requestUpdate();
	}

	_onReturnFaultToggle(faultLabel, e) {
		const checked = e.target?.checked;

		let faults = Array.isArray(this.tempReturnForm.faults)
			? [...this.tempReturnForm.faults]
			: [];

		if (checked) {
			if (!faults.includes(faultLabel)) faults.push(faultLabel);
		} else {
			faults = faults.filter(f => f !== faultLabel);
		}

		this.tempReturnForm = { ...this.tempReturnForm, faults };
		localStorage.setItem("returnDraft", JSON.stringify(this.tempReturnForm));
	}


	_resetReturnDraft(orderId) {
		if (orderId) this.currentOrderId = orderId;
		this.tempReturnForm = {};
		this.requestUpdate();
	}

	_persistReturnDraft() {
		const id = this.currentOrderId || 'global';
		this.rowForms.set(id, { ...this.tempReturnForm });
		console.log('[returns] SAVED for', id, this.rowForms.get(id));
	}

	static get properties() {
		return {
			...super.properties,
			numOfPagingRows: { type: Number },
			currentPageIndex: { type: Number },
			activeFilters: { type: Object },
			clientCif: { type: String },
			isInvoiceModalVisible: { type: Boolean },
			isCancelOrderModalVisible: { type: Boolean },
			isSuccessModalVisible: { type: Boolean },
			isSendEmailSuccessModalVisible: { type: Boolean },
			isErrorModalVisible: { type: Boolean },
			hasInvoiceError: { type: Boolean },
			emailAddress: { type: String },
			isValidEmail: { type: Boolean },
			currentOrderId: { type: String },
			currentOrder: { type: Object },
			isDeviceTableVisible: { type: Boolean },
			isInvoicePdfVisible: { type: Boolean },
			invoicePdfBase64: { type: String },
			isLoading: { type: Boolean },
			isConnectivityModalVisible: { type: Boolean },
			isReturnsModalVisible: { type: Boolean },
			isReturnsDetailsModalVisible: { type: Boolean },
			isConnectivityIssuesModalVisible: { type: Boolean },
			isConnectivityTroubleshootingModalVisible: { type: Boolean },
			isConfirmDetailsModalVisible: { type: Boolean },
			isReturnsSuccessModalVisible: { type: Boolean },
			isOrderTrackerModalVisible: { type: Boolean },
			isOrderNegativeStatesModalVisible: { type: Boolean },
			currentOrderStatus: { type: String },
			negativeStateModalConfig: { type: Object },
			isReturnsTableVisible: { type: Boolean },
			isReturnsErrorModalVisible: { type: Boolean },
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

		.returns-review-modal capitec-label {
			margin-bottom: 0px !important;
			margin-top: 0 !important;
      	}
		.returns-review-modal .modal .body {
			padding: 0!important;
		}
		
		 .review-card {
			border: 1px solid #E1E1E1; 
			border-radius: 12px;
			padding: 16px 20px;
			margin-bottom: 16px;
			background: #FFFFFF;
			box-shadow: 2px 2px 6px rgba(0,0,0,0.08); /* small soft shadow */
      	}
		.returns-review-modal .confirm-body {
			padding: 0!important;
		}
		.bordered-labels {
			border-bottom: 1px solid var(--theme-modal-border-color, #E1E1E1);
		}
		.review-card-labels {
			display:flex; 
			justify-content:space-between;
			font-size: 14px;
		}
		.no-padding .container.form > .body {
			padding: 0 !important;
		}
		.check-box-wrapper {
			display: flex;
			justify-content: space-between;
		}
		
		capitec-table.no-header {
        --theme-data-table-header-background: transparent;
        --theme-data-table-header-border-color: transparent;
        --theme-data-table-header-font-weight: 0;
        --theme-data-table-header-height: 0px;
        --theme-data-table-header-padding: 0;
        --theme-data-table-header-color: transparent;
      }

      /* Hide any first row if it acts as header */
      capitec-table.no-header::part(header),
      capitec-table.no-header::part(thead),
      capitec-table.no-header::part(column-headers) {
        display: none !important;
        height: 0 !important;
      }

      /* As a fallback, collapse top border entirely */
      capitec-table.no-header {
        border-top: none !important;
        margin-top: -6px;
      }

	  .tracker-body {
    padding: 8px 0 8px 0;
  }

  .tracker-row {
    display: flex;
    gap: 12px;
    min-height: 42px;
  }

  .tracker-line {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 20px;
  }

  .tracker-dot {
    width: 16px;
    height: 16px;
    border-radius: 999px;
    border: 2px solid #D3D6DA; /* default grey */
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: white;
  }

  .tracker-connector {
    flex: 1;
    width: 2px;
    background: #D3D6DA;
    margin-top: 2px;
    margin-bottom: 2px;
  }

  .tracker-content {
    padding-bottom: 10px;
  }

  .tracker-title {
    font-size: 14px;
    color: #333;
  }

  .tracker-desc {
    font-size: 12px;
    color: #555;
    margin-top: 4px;
  }

  /* done state */
  .tracker-row.done .tracker-dot {
    background: #3DAA3A;
    border-color: #3DAA3A;
    color: #fff;
  }
  .tracker-row.done + .tracker-row .tracker-connector,
  .tracker-row.done .tracker-connector {
    background: #CDE9CD;
  }

  /* current state */
  .tracker-row.current .tracker-dot {
    border-color: #002A5E;
    background: #002A5E;
    color: #fff;
  }
      `
		];
	}

	connectedCallback() {
		super.connectedCallback();
		console.log("Testing console info: ", this.callerInformation);

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

	_initialise() {
		// this.clientCif = `030530180`; // TODO: comment out when done with DEV testing
		// this.clientCif = `403059445`; // TODO: comment out when done with INT testing
		// this.clientCif = `161413722`; // TODO: comment out when done with INT testing
		// this.clientCif = `224274252`; // TODO: comment out when done with INT testing
		this.isDeviceTableVisible = true;
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
		this.isDeviceTableVisible = false;

		setTimeout(() => {
			this.isDeviceTableVisible = true;
			this.requestUpdate();
		}, 100);
	}

	_getPositiveOrderStatuses() {
		return [
			'ORDER_PLACED',
			'ORDER_PROCESSING',
			'ORDER_OUT_FOR_DELIVERY',
			'ORDER_DELIVERED',
			'ORDER_PLACED_AT_SUPPLIER',
		];
	}

	_getNegativeOrderStatuses() {
		return [
			'ORDER_PAYMENT_FAILED',
			'ORDER_FAILED',
			'ORDER_CANCELLATION_PENDING',
			'ORDER_CANCELLED',
			'ORDER_DELIVERY_FAILED_RETURNED',
			'ORDER_ADDRESS_VALIDATION_FAILED',
		];
	}

	_buildNegativeStateConfig(status, item) {
		const amount = item?.orderAmount
			? formatAmount(item.orderAmount)
			: null;

		const deviceName = item?.deviceName || 'your device';

		switch (status) {
			case 'ORDER_PAYMENT_REVERSAL_FAILED':
				return {
					header: 'Order payment reversed failed',
					lines: [
						`Please note to escalate to your TL with the following information:<br />`,
						' Details to include in escalation:<br />',
						'<ul><li>CIF:</li><li>Order Number: </li><li>Cancellation date: </li>'
					]
				};

			case 'ORDER_FAILED':
				return {
					header: 'Order failed',
					lines: [
						`We couldn’t process The client’s order at this time. It may be due to technical issues or limited stock.`,
						'Please try again shortly.'
					]
				};

			case 'ORDER_CANCELLATION_PENDING':
				return {
					header: 'Cancellation in progress',
					lines: [
						`The cancellation request for ${deviceName} has been submitted.`,
						'The client will receive an update once the cancellation is completed.'
					]
				};

			case 'ORDER_CANCELLED':
				return {
					header: 'Order cancelled',
					lines: [
						`The client cancelled the order for the ${deviceName}`,
						amount
							? `${amount} will be refunded to the client’s account.`
							: 'The amount will be refunded to the client’s account.',
					]
				};

			case 'ORDER_DELIVERY_FAILED_RETURNED':
				return {
					header: 'Failed delivery',
					lines: [
						`The client reached the maximum number of failed attempts. The money will be refunded back into the clients account and the order cancelled`,
					]
				};

			case 'ORDER_ADDRESS_VALIDATION_FAILED':
				return {
					header: 'Order address validation failed',
					lines: [
						`The courier could not contact The client to confirm the delivery address.`,
						'The money will be refunded to the client’s account and the order cancelled. The client can place the order again on the app.',
						'Make sure that the correct address is added when ordering a new device'
					]
				};
			case 'ORDER_OUT_FOR_DELIVERY':
				return {
					header: 'OUT FOR DELIVERY',
					lines: [
						`The delivery of ${deviceName} was unsuccessful and the device was returned.`,
						amount
							? `${amount} will be refunded to the client’s account.`
							: 'The amount will be refunded to the client’s account.'
					]
				};

			default:
				return {
					header: 'Order update',
					lines: [
						'There was an issue with this order.',
						'Please try again or contact support.'
					]
				};
		}
	}

	_handleOrderTrackerClick(item) {
		// Prefer raw status from the API if available
		const rawStatus =
			item?.deviceOrderResponse?.result?.orderStatus ||
			(item?.orderStatus ? item.orderStatus.replace(/\s+/g, '_') : '');

		const positive = this._getPositiveOrderStatuses();
		const negative = this._getNegativeOrderStatuses();

		this.currentOrderId = item?.orderNumber;
		this.currentOrderStatus = rawStatus || 'ORDER_DELIVERED';

		// Positive → show tracker
		if (positive.includes(this.currentOrderStatus)) {
			this.isOrderTrackerModalVisible = true;
			this.isOrderNegativeStatesModalVisible = false;
			return;
		}

		// Negative → show negative modal with custom copy
		if (negative.includes(this.currentOrderStatus)) {
			this.negativeStateModalConfig = this._buildNegativeStateConfig(this.currentOrderStatus, item);
			this.isOrderNegativeStatesModalVisible = true;
			this.isOrderTrackerModalVisible = false;
			return;
		}

		// Fallback: if unknown status, you can choose what to do
		// For now just default to tracker
		this.isOrderTrackerModalVisible = true;
		this.isOrderNegativeStatesModalVisible = false;
	}

	async _retrieveDevices(renderSet) {
		try {
			this.isLoading = true;
			this.renderSet = renderSet;
			this.numOfPagingRows = this.renderSet.numOfPagingRows;
			this.currentPageIndex = this.renderSet.currentPageIndex;
			this.searchValue = this.renderSet.searchValue;

			if (!this.clientCif) {
				return { pagedItems: [], totalCount: 0 };
			}

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

			const response = await this.capitecConnectService.getAllDeviceOrders(request);

			if (!response || !response.succeeded) {
				throw new Error(`Failed to retrieve devices`);
			}

			const devices = response.result.content.map((order) => ({
				orderDate: order.orderPlacedDate,
				orderNumber: order.orderId,
				orderNumberShort: order.orderId.split(`-`).pop(),
				orderDescription: order.orderDescription,
				orderAmount: order.amount,
				deviceName: order.deviceName,
				serialNumber: order.serialNumber,
				accountNumber: order.accountNumber,
				orderId: order.orderId,
				orderStatus: order.orderStatus.split(`_`).join(` `),
				productOrderId: order.productOrderId,
				hasLogged: false
			}));

			this.isDeviceTableVisible = response.result.totalElements !== 0;

			return {
				pagedItems: devices,
				totalCount: response.result.totalElements
			};
		} catch (error) {
			console.error(`Error retrieving devices:`, error);
			this.isDeviceTableVisible = false;

			if (
				this.activeFilters.searchType.value === `accountNumber` &&
				this.activeFilters.searchValue.trim() &&
				this.clientCif
			) {
				alert(`Error: The provided Account Number [${this.activeFilters.searchValue.trim()}] is not owned by this client [cif ${this.clientCif
					}]`);
			}

			return { pagedItems: [], totalCount: 0 };
		} finally {
			this.isLoading = false;
			this.requestUpdate();
		}
	}

	async _retrieveReturns(renderSet) {
		try {
			this.isLoading = true;
			this.renderSet = renderSet;

			const { currentPageIndex, numOfPagingRows } = renderSet;
			this.numOfPagingRows = numOfPagingRows;
			this.currentPageIndex = currentPageIndex;

			if (!this.clientCif) {
				return { pagedItems: [], totalCount: 0 };
			}

			// If we've already loaded returns, reuse cache (table calls dataHandler multiple times)
			if (!this.returnsCache || this.returnsCache.length === 0) {
				const request = {
					clientCif: this.clientCif
				};

				const response = await this.capitecConnectService.getDeviceReturnsByCif(request);

				if (!response || !response.succeeded) {
					throw new Error('Failed to retrieve returns');
				}

				// JSON you showed: { "returns": [ ... ] }
				const returns = (response.result && response.result.returns) || response.returns || [];

				this.returnsCache = returns.map((r) => this._mapReturnToRow(r));
			}

			const allItems = this.returnsCache;
			const totalCount = allItems.length;

			// emulate paging on the frontend
			const start = (currentPageIndex - 1) * numOfPagingRows;
			const end = start + numOfPagingRows;
			const pagedItems = allItems.slice(start, end);


			return {
				pagedItems,
				totalCount
			};
		} catch (error) {
			console.error('Error retrieving returns:', error);
			this.isReturnsTableVisible = false;
			return { pagedItems: [], totalCount: 0 };
		} finally {
			this.isLoading = false;
			this.requestUpdate();
		}
	}


	_mapReturnToRow(ret) {
		const order = ret.productOrder || {};
		const statusHistory = ret.statusHistory || [];

		// current status = last completed, else first, else '-'
		const completed = statusHistory.filter((s) => s.completed);
		const currentStatusObj =
			completed[completed.length - 1] ||
			statusHistory[0] ||
			{ statusName: '-' };

		const currentStatus = currentStatusObj.statusName || '-';

		// use first status date as "order date" for table
		const firstStatusDate = statusHistory[0]?.statusDate || null;

		const orderId = order.orderId || '';

		return {
			// 🔹 these match what the table + _renderTableCol expect
			orderDate: firstStatusDate,
			orderNumber: orderId,
			orderNumberShort: orderId ? orderId.split(`-`).pop() : '',
			orderDescription: order.shortDescription || order.productName || '',
			orderAmount: order.priceIncVat,
			deviceName: order.productName || '',
			serialNumber: order.serialNumbers || '',
			accountNumber: null,
			orderId,
			orderStatus: currentStatus,
			hasLogged: false,
			isReturn: true,
			rawReturn: ret
		};
	}


	_renderTableCol(item) {
		return item.orderDate
			? `${formatDate(item.orderDate)} ${getTimeFromDate(item.orderDate)}`
			: item.orderDate;
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

	_getReturnDraft() {
		// Prefer in-memory first
		const draft = this.tempReturnForm && Object.keys(this.tempReturnForm).length
			? this.tempReturnForm
			: JSON.parse(localStorage.getItem('returnDraft') || '{}');

		return draft;
	}

	async getInvoice() {
		try {
			this.isLoading = true;
			const response = await this.capitecConnectService.getDeviceInvoice(this.currentOrderId);

			if (!response || !response.succeeded) {
				throw new Error(`Failed to load invoice`);
			}

			this.invoicePdfBase64 = response.result.document;
			this.isInvoicePdfVisible = true;
		} catch (error) {
			console.error(`Error getting device invoice:`, error);
			this.invoicePdfBase64 = null;
			this.hasInvoiceError = true;
		} finally {
			this.isLoading = false;
			this.requestUpdate();
		}
	}

	async _submitDeviceReturn() {
		const data = this._getReturnDraft();

		try {
			this.isLoading = true;
			const payload = {
				cif: this.clientCif,
				appearance: data.deviceCondition?.value || '',
				cpaReason: data.reason || '',
				cpaDescription: data.description || '',
				faults: (data.faults || []).map(f => ({
					category: null,
					description: f,
					subCategory: null
				})),
				productOrderId: data.productOrderId,
				addressLine1: data.addr1 || '',
				addressLine2: data.addr2 || '',
				postalCode: data.postalCode || '',
				townName: data.city || '',
				country: 'South Africa',
				provinceName: data.province || '',
				suburbName: data.suburb || '',
				alternatePhoneNumber: data.altNumber || '',
				emailAddress: data.email || '',
				firstName: data.firstName || '',
				surname: data.lastName || '',
				phoneNumber: data.cell || ''
			};

			const response = await this.capitecConnectService.submitDeviceReturn(payload);

			if (!response || !response.succeeded) {
				throw new Error(`Failed to send device return`);
			}

			localStorage.removeItem('returnDraft');
			this.tempReturnForm = {};

			this.isReturnsSuccessModalVisible = true;

		} catch (error) {
			console.error(`Error sending the device return:`, error);
			this.isReturnsErrorModalVisible = true;
		} finally {
			this.isLoading = false;
			this.requestUpdate();
		}


	}

	renderInvoiceModal(orderId) {
		if (orderId && orderId !== this.currentOrderId) {
			this.currentOrderId = orderId;
		}

		return html`
			<capitec-modal
				type="form"
				header="Statement"
				?open="${this.isInvoiceModalVisible}"
			>
			<capitec-content-box
				slot="body"
				layout="grid"
				style="height: auto; min-height: 300px; padding: 24px;"
			>
          ${this.isInvoicePdfVisible
				? html`
                <horizon-pdf-viewer
                  header="View Document"
                  encodedPDF="${this.invoicePdfBase64}"
                  @cancel="${() => {
						this.isInvoicePdfVisible = false;
					}}"
                >
                </horizon-pdf-viewer>
              `
				: ``}

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
            @click="${() => {
				this.isInvoiceModalVisible = false;
				this.invoicePdfBase64 = ``;
			}}"
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


	renderConnectivityModal() {

		return html`
			<capitec-modal
				type="form"
				header="Connectivity"
				?open="${this.isConnectivityModalVisible}"
			>
				<capitec-content-box
				slot="body"
				layout="grid"
				style="padding: 24px;text-align: center;"
				>

				<div column="1" row="1" colspan="2">

				<capitec-label
            type="strong"
            label="Are you only having connectivity issues?"
          ></capitec-label>
				<capitec-button
					type="secondary"
					label="No"
					@click="${() => {
				this.isConnectivityModalVisible = false;
				this.isReturnsModalVisible = true;
				// this.invoicePdfBase64 = ``;
			}}"
				></capitec-button>
				<capitec-button
					type="primary"
					label="Yes"
					style="--theme-button-primary-background: var(--theme-primary-color, #0091DA);"
					@click="${() => {
				this.isConnectivityIssuesModalVisible = true;
				this.isConnectivityModalVisible = false;
			}}"
				></capitec-button>
				</div>
				</capitec-content-box>

				<div
				slot="footer"
				style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px;text-align: center;"
				>
				</div>
			</capitec-modal>
			`;
	}


	renderReturnsModal(orderId) {
		if (orderId && orderId !== this.currentOrderId) {
			this.currentOrderId = orderId;
		}

		return html`
      <capitec-modal
        type="form"
        header="Repairs and returns"
        ?open="${this.isReturnsModalVisible}"
		style="--capitec-modal-width: 1024px; min-width: 1024px;"
      >
        <capitec-content-box
          slot="body"
          layout="grid"
          style="height: auto; min-height: 300px;"
        >
          ${this.isInvoicePdfVisible
				? html`
                <horizon-pdf-viewer
                  header="View Document"
                  encodedPDF="${this.invoicePdfBase64}"
                  @cancel="${() => {
						this.isInvoicePdfVisible = false;
					}}"
                >
                </horizon-pdf-viewer>
              `
				: ``}

          <div column="1" row="1" colspan="2">
            <capitec-label
              type="strong"
			  style="font-weight: bold;"
              label="Please note, the following is NOT covered by the warranty"
            ></capitec-label>
            <ul style="text-align: left; margin: 16px 0; padding-left: 20px;">
				<li>Any liquid damage</li>
				<li>Affected by power surges</li>
				<li>The device is damaged</li>
				<li>Device not bought from Connect</li>
				<li>The software has been tampered with</li>
        	</ul>
			<capitec-label
              type="strong"
              label="Note"
			  style="font-weight: bold;"
            ></capitec-label>
			 <capitec-label
              type="strong"
              label="If the issue isn’t covered by the warranty, you’ll need to pay for shipping and inspection."
            ></capitec-label>
          </div>

        </capitec-content-box>
		
        <div
          slot="footer"
          style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
		  layout="grid"
        >
            <hr
              style="border: none; border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
            />
         
          <capitec-button
            type="secondary"
            label="Close"
            @click="${() => {
				this.isReturnsModalVisible = false;
				this.invoicePdfBase64 = ``;
			}}"
          ></capitec-button>
          <capitec-button
            type="primary"
            label="Customer understands"
            style="--theme-button-primary-background: var(--theme-primary-color, #0091DA);"
            @click="${() => {
				this.isReturnsModalVisible = false;
				this.isReturnsDetailsModalVisible = true;
			}}"
          ></capitec-button>
        </div>
      </capitec-modal>
    `;
	}
	_returnExpandRenderer() {
		return html`
    <capitec-content-box style="padding:16px;">
      <capitec-label type="strong" label="Return details"></capitec-label>
      <div style="height:8px;"></div>
      <capitec-text-field label="Reason for return"></capitec-text-field>
      <capitec-text-field label="Preferred contact method"></capitec-text-field>
    </capitec-content-box>
  `;
	}

	renderReturnsDetailsModal(orderId) {
		if (orderId && orderId !== this.currentOrderId) {
			this.currentOrderId = orderId;
		}

		return html`
      <capitec-modal
        type="form"
        header="Repairs and returns details"
        ?open="${this.isReturnsDetailsModalVisible}"
		class="no-padding"
      >
        <capitec-content-box
          slot="body"
		  
        >
          <capitec-table
		  	class="no-header"
            displayMode="All"
            numOfPagingRows="3"
            pagingRows="[3]"
            .dataHandler="${(renderSet) => this._retrieveReturnSectionsForModal(renderSet)}"
            expandable="right"
            .expandRenderer="${(item) => this._returnsExpandRenderer(item)}"
			style="padding-left: 0 !important;"
          >
            <capitec-table-column
              label=""
              field="title"
            ></capitec-table-column>
          </capitec-table>
        </capitec-content-box>

        <div
          slot="footer"
          style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px;"
        >
          <capitec-button
            type="secondary"
            label="Cancel"
            @click="${() => {
				this.isReturnsDetailsModalVisible = false;
			}}"
          ></capitec-button>
          <capitec-button
            type="primary"
            label="Send"
            style="--theme-button-primary-background: var(--theme-primary-color, #0091DA);"
            @click="${() => {
				this.isReturnsDetailsModalVisible = false;
				this.isConfirmDetailsModalVisible = true;
			}}"
          ></capitec-button>
        </div>
      </capitec-modal>
    `;
	}

	_getReturnSections() {
		return [
			{ id: `condition`, title: `Device condition & options`, kind: `condition` },
			{ id: `reason`, title: `Why do you want to return your device?`, kind: `reason` },
			{ id: `details`, title: `Personal details`, kind: `details` }
		];
	}

	_retrieveReturnSectionsForModal(_renderSet) {
		const sections = this._getReturnSections().map((s, i) => ({ ...s, _rowNumber: i + 1 }));
		return { pagedItems: sections, totalCount: sections.length };
	}

	_returnsExpandRenderer(item) {
		if (!item || !item.kind) return html``;

		if (item.kind === 'condition') {
			const conditionItems = [
				{ value: 'GOOD', text: 'Device is in good condition' },
				{ value: 'SCRATCHED', text: 'Scratches on device' },
				{ value: 'DENTED', text: 'Device is dented' },
				{ value: 'DEFORMED', text: 'Device is bent/deformed' },
				{ value: 'CRACKED', text: 'Screen/back of device is cracked' },
				{ value: 'DAMAGED', text: 'Device has major damages' },
				{ value: 'PARTS MISSING', text: 'Parts/accessories missing' }
			];
			const selectedCondition = conditionItems.find(i => i.value === this.tempReturnForm.deviceCondition) || null;

			return html`
    <capitec-content-box style="overflow: visible;">
      <capitec-label type="strong" label="Which option best describes the condition of your device?"></capitec-label>
      <capitec-group layout="grid" columns="auto auto" gap="normal">
        <capitec-select
          label="Device condition"
          .items="${conditionItems}"
          display-field="text"
          id-field="value"
		  .value="${this.tempReturnForm.deviceCondition || ''}"
		  @value-change="${(e) => this._onReturnFieldChange('deviceCondition', e)}" 
          @change="${(e) => this._onReturnFieldChange('deviceCondition', e)}"
		  style="padding-left: 0!important;">
        </capitec-select>

		${this.currentActionType === 'repair' ? html`
		<hr
              style="border: none; border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
        />
		      <capitec-label type="strong" label="Tell us about the issues with your device"></capitec-label>
		<div>
			<div style="display:flex; justify-content:space-between; gap:12px; width:300px;">
				<capitec-check label="Audio" 
					.checked="${(this.tempReturnForm.faults || []).includes('Audio')}"
				 	@change="${(e) => this._onReturnFaultToggle('Audio', e)}"  
				 	@value-change="${(e) => this._onReturnFaultToggle('Audio', e)}"  
				 	@checked-change="${(e) => this._onReturnFaultToggle('Audio', e)}">
				</capitec-check>
				<capitec-check label="Power" 
					.checked="${(this.tempReturnForm.faults || []).includes('Power')}"
					@change="${(e) => this._onReturnFaultToggle('Power', e)}"
					@value-change="${(e) => this._onReturnFaultToggle('Power', e)}"  
					@checked-change="${(e) => this._onReturnFaultToggle('Power', e)}"
				>
				</capitec-check>
			</div>

			<div style="display:flex; justify-content:space-between; gap:14px; width:316px;">
				<capitec-check label="Camera"
					.checked="${(this.tempReturnForm.faults || []).includes('Camera')}"
				 	@change="${(e) => this._onReturnFaultToggle('Camera', e)}"
				 	@value-change="${(e) => this._onReturnFaultToggle('Camera', e)}"  
				 	@checked-change="${(e) => this._onReturnFaultToggle('Camera', e)}"
				>
				 </capitec-check>
				<capitec-check label="Software" style="margin-left:6px;" 
					.checked="${(this.tempReturnForm.faults || []).includes('Software')}"
					@change="${(e) => this._onReturnFaultToggle('Software', e)}"
					@value-change="${(e) => this._onReturnFaultToggle('Software', e)}"  
				 	@checked-change="${(e) => this._onReturnFaultToggle('Software', e)}"
				></capitec-check>
			</div>

			<div style="display:flex; justify-content:space-between; gap:12px; width:296px;">
				<capitec-check label="Display" 
					.checked="${(this.tempReturnForm.faults || []).includes('Display')}"
					@change="${(e) => this._onReturnFaultToggle('Display', e)}"
					@value-change="${(e) => this._onReturnFaultToggle('Display', e)}"  
				 	@checked-change="${(e) => this._onReturnFaultToggle('Display', e)}"
					></capitec-check>
				<capitec-check label="Other"  
					.checked="${(this.tempReturnForm.faults || []).includes('Other')}"
					@change="${(e) => this._onReturnFaultToggle('Other', e)}"
					@value-change="${(e) => this._onReturnFaultToggle('Other', e)}"  
				 	@checked-change="${(e) => this._onReturnFaultToggle('Other', e)}"
				></capitec-check>
			</div>
		</div>
		` : ''}
 			
      </capitec-group>

    </capitec-content-box>
  `;
		}

		if (item.kind === 'reason') {
			return html`
				<capitec-content-box style="padding:0;">
					<capitec-text-box
						label="Type the reason"
						placeholder="Describe the issue or reason…"
						style="margin-top:8px;"
						@key-input="${(e) => this._onReturnFieldChange('reason', e)}">
					</capitec-text-box>
				</capitec-content-box>
			`;
		}

		if (item.kind === `details`) {
			return html`
        <capitec-content-box style="padding: 0;">
          <capitec-group layout="grid" columns="auto auto" gap="normal">
            <capitec-text-field column="1" row="1" 
				label="Name"
				.value="${this.tempReturnForm.firstName || ''}" 
				@key-input="${(e) => this._onReturnFieldChange('firstName', e)}">
			</capitec-text-field>
            <capitec-text-field column="2" row="1" 
				label="Surname"
				.value="${this.tempReturnForm.lastName || ''}" 
				@key-input="${(e) => this._onReturnFieldChange('lastName', e)}">
			</capitec-text-field>
            <capitec-text-field column="3" row="1" 
				label="Cellphone Number"
				.value="${this.tempReturnForm.cell || ''}"
				@key-input="${(e) => this._onReturnFieldChange('cell', e)}">
			</capitec-text-field>
            <capitec-text-field column="1" row="2" 
				label="Alternate Number"
				.value="${this.tempReturnForm.altNumber || ''}"
				@key-input="${(e) => this._onReturnFieldChange('altNumber', e)}">
			</capitec-text-field>
            <capitec-text-field column="2" row="2" 
				label="Email"
				.value="${this.tempReturnForm.email || ''}"
                @key-input="${(e) => this._onReturnFieldChange('email', e)}">
			</capitec-text-field>
          </capitec-group>
		   <hr
              style="border: none; border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
            />
			<capitec-label type="strong" label="Where should the device be collected?"></capitec-label>
			<capitec-group layout="grid" columns="auto auto" gap="normal">
            <capitec-text-field column="1" row="1"
			 	label="Address line 1"
				.value="${this.tempReturnForm.addr1 || ''}"
            @key-input="${(e) => this._onReturnFieldChange('addr1', e)}">
			</capitec-text-field>
            <capitec-text-field column="2" row="1" 
				label="Address line 2"
				.value="${this.tempReturnForm.addr2 || ''}"
            @key-input="${(e) => this._onReturnFieldChange('addr2', e)}">
			</capitec-text-field>
            <capitec-text-field column="3" row="1" 
				label="Suburb" 
				.value="${this.tempReturnForm.suburb || ''}"
            @key-input="${(e) => this._onReturnFieldChange('suburb', e)}">
			</capitec-text-field>
            <capitec-text-field column="1" row="2" 
				label="City"
				.value="${this.tempReturnForm.city || ''}"
            @key-input="${(e) => this._onReturnFieldChange('city', e)}">
			</capitec-text-field>
            <capitec-text-field column="2" row="2" 
				label="Province"
				.value="${this.tempReturnForm.province || ''}"
            @key-input="${(e) => this._onReturnFieldChange('province', e)}">
			</capitec-text-field>
			<capitec-text-field column="3" row="2" 
				label="Postal Code"
				.value="${this.tempReturnForm.postalCode || ''}"
            @key-input="${(e) => this._onReturnFieldChange('postalCode', e)}">
			</capitec-text-field>

          </capitec-group>

        </capitec-content-box>
      `;
		}

		return html``;
	}

	_returnExpandRenderer() {
		return html`
      <capitec-content-box style="padding:16px;">
        <capitec-label type="strong" label="Return details"></capitec-label>
        <div style="height:8px;"></div>
        <capitec-text-field label="Why do you want to return your device?"></capitec-text-field>
        <capitec-text-field label="Preferred contact method"></capitec-text-field>
      </capitec-content-box>
    `;
	}

	renderConnectivityIssuesModal() {
		return html`
      <capitec-modal
        type="alert"
        header="Connectivity issue"
        ?open="${this.isConnectivityIssuesModalVisible}"
      >
        <div
          column="1"
          row="1"
          colspan="2"
          slot="body"
          style="padding: 20px 0px !important;"
        >
		  <capitec-label
            type="strong"
            label="Are any of the following statements true?"
			style="font-weight: bold;font-size: 16px;"
          ></capitec-label>
		  <div style="height:30px;"></div>
		  <div style="display:flex;gap:12px;">	  
			<img src="/images/common/location.svg" class="connection-error-svg"/>
            <capitec-label
              type="strong"
              label="The connection is unreliable in certain areas only."
			  icon="status/success-trans"
            ></capitec-label>
			</div>
			      <div style="height:8px;"></div>

			 <hr
              style="border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
            />
			<div style="height:8px;"></div>
			<div style="display:flex;gap:12px;">	  
			<img src="/images/common/home.svg" class="connection-error-svg"/>

            <capitec-label
              type="strong"
              label="Other people in my household have the same issue."
            ></capitec-label>
			</div>
			 <hr
              style="border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
            />
			      <div style="height:8px;"></div>
			<div style="display:flex;gap:12px;">	  
			<img src="/images/common/mobile-prepaid.svg" class="connection-error-svg"/>	  
			  <capitec-label
              type="strong"
              label="The issue continues even while using the SIM card in another device."
            ></capitec-label>
			</div>
			 <div style="height:8px;"></div>
			<hr
              style="border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
            />
        </div>
        <div
          slot="footer"
          style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px;"
        >
          <capitec-button
            slot="footer"
            type="secondary"
            label="No"
            @click="${() => {
				this.isReturnsModalVisible = true;
				this.isConnectivityIssuesModalVisible = false;
			}}"
          ></capitec-button>
          <capitec-button
            type="primary"
            label="Yes"
            style="--theme-button-primary-background: var(--theme-primary-color, #0091DA);"
            @click="${() => {
				this.isConnectivityIssuesModalVisible = false;
				this.isConnectivityTroubleshootingModalVisible = true;
			}}"
          ></capitec-button>
        </div>
      </capitec-modal>
    `;
	}

	renderReturnsSuccessModal() {
		const data = this._getReturnDraft();
		return html`
      <capitec-modal
        type="alert"
        header="Successful"
        ?open="${this.isReturnsSuccessModalVisible}"
      >
	  <capitec-content-box
				slot="body"
				layout="grid"
				style="padding: 20px 0px !important;"
				>
        <div
          column="1"
          row="1"
        >
		  <capitec-label
            type="strong"
            label="We have submitted a collection for your ${data?.specs || ''}"
			style="font-weight: bold;font-size: 16px;"
          ></capitec-label>
		  <div style="height:30px;"></div>
		  <div style="display:flex;gap:12px;">	  
			<img src="/images/common/calandar.svg" class="connection-error-svg"/>
            <capitec-label
              type="strong"
              label="It will take 3 - 4 days to collect the device"
			  icon="status/success-trans"
            ></capitec-label>
			</div>
			      <div style="height:8px;"></div>

			 <hr
              style="border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
            />
			      <div style="height:8px;"></div>
			<div style="display:flex;gap:12px;">	  
			<img src="/images/common/package.svg" class="connection-error-svg"/>

            <capitec-label
              type="strong"
              label="Safely package your device inside the original box, with the accessories (e.g. charger, cable)."
            ></capitec-label>
			</div>
			 <hr
              style="border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
            />
			      <div style="height:8px;"></div>
			<div style="display:flex;gap:12px;">	  
			<img src="/images/common/home.svg" class="connection-error-svg"/>	  
			  <capitec-label
              type="strong"
              label="Our courier partner will contact you to confirm the collection details."
            ></capitec-label>
			</div>
			<div style="height:8px;"></div>
			<hr
              style="border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
            />
			<div style="display:flex;gap:12px;">	  
			<img src="/images/common/delivery.svg" class="connection-error-svg"/>	  
			  <capitec-label
              type="strong"
              label="Once collected, the device will be assessed and outcome provided."
            ></capitec-label>
			</div>
			 <div style="height:8px;"></div>
		
        </div>
		</capitec-content-box>
        <div
          slot="footer"
          style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px;"
        >
          <capitec-button
            slot="footer"
            type="secondary"
            label="Done"
            @click="${() => {
				this.isReturnsSuccessModalVisible = false;
			}}"
          ></capitec-button>
        </div>
      </capitec-modal>
    `;
	}

	renderConnectivityTroubleshootingModal() {
		return html`
      <capitec-modal
        type="alert"
        header="Connectivity troubleshooting"
        ?open="${this.isConnectivityTroubleshootingModalVisible}"
      >
        <div
          column="1"
          row="1"
          colspan="2"
          slot="body"
          style="padding: 20px 0px !important;text-align: center;"
        >
		<img src="/images/common/connectionError.svg" class="ita-timeout-svg"/>
		  

        </div>
		<div
          column="1"
          row="1"
          colspan="2"
          slot="body"
        >
		<capitec-label
            type="strong"
            label="It seems like this might be a network issue, not something caused by your device."
			style="font-weight: bold;font-size: 16px;"
          ></capitec-label>
		</div>  
        <div
          slot="footer"
          style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px;"
        >
          <capitec-button
            slot="footer"
            type="secondary"
            label="Close"
            @click="${() => (this.isConnectivityTroubleshootingModalVisible = false)}"
          ></capitec-button>
        </div>
      </capitec-modal>
    `;
	}

	renderConfirmDetailsModal() {
		const data = this._getReturnDraft();
		const faults = Array.isArray(data.faults) ? data.faults : [];

		return html`
      <capitec-modal
        type="form"
        header="Review collection details"
        ?open="${this.isConfirmDetailsModalVisible}"
		style="--capitec-modal-width: 1024px; min-width: 1024px;"
		class="returns-review-modal"
      >
        <capitec-content-box slot="body" layout="grid" gap="normal" class="confirm-body">
        
        <!-- Device information -->
        <capitec-content-box layout="grid" class="review-card" column="1" row="1">
          <capitec-label type="strong" label="Device information" class="bordered-labels"></capitec-label>
		
          <capitec-group layout="grid" columns="auto auto" gap="normal">
			<div class="review-card-labels">
			<span>Device</span>
			<span><strong>${data.deviceName || ' '}</strong></span>
			</div>
			<div class="review-card-labels">
			<span>IMEI</span>
			<span><strong>${data.imei1 || ' '}</strong></span>
			</div>

			<div class="review-card-labels">
			<span>Condition</span>
			<span><strong>${data.deviceCondition?.value || ' '}</strong></span>
			</div>
          </capitec-group>
        </capitec-content-box>

        <!-- Faults listed -->
        <capitec-content-box layout="grid" class="review-card" column="2" row="1">
          <capitec-label type="strong" label="Faults listed" class="bordered-labels"></capitec-label>
          <capitec-group layout="grid" columns="auto auto" gap="normal">
    ${faults.length
				? faults.slice(0, 4).map((fault, index) => html`
          <div class="review-card-labels">
            <span>Fault ${index + 1}</span>
            <span><strong>${fault || ' '}</strong></span>
          </div>
        `)
				: html`
          <div class="review-card-labels">
            <span>Faults</span>
            <span><strong>-</strong></span>
          </div>
        `
			}
  </capitec-group>
        </capitec-content-box>

        <!-- Person details -->
        <capitec-content-box layout="grid" class="review-card" column="1" row="2">
          <capitec-label type="strong" label="Person we're collecting from" class="bordered-labels"></capitec-label>
          <capitec-group layout="grid" columns="auto auto" gap="normal">

			<div class="review-card-labels">
			<span>Name:</span>
			<span><strong>${data.firstName || ' '}</strong></span>
			</div>

			<div class="review-card-labels">
			<span>Surname:</span>
			<span><strong>${data.lastName || ' '}</strong></span>
			</div>

			<div class="review-card-labels">
			<span>Cellphone:</span>
			<span><strong>${data.cell || ' '}</strong></span>
			</div>

			<div class="review-card-labels">
			<span>Alternate number:</span>
			<span><strong>${data.altNumber || '-'}</strong></span>
			</div>

			<div class="review-card-labels">
			<span>Email: </span>
			<span><strong>${data.email || ' '}</strong></span>
			</div>
          </capitec-group>
        </capitec-content-box>

        <!-- Collection address -->
        <capitec-content-box layout="grid" class="review-card" column="2" row="2">
          <capitec-label type="strong" label="Collection address" class="bordered-labels"></capitec-label>
          <capitec-group layout="grid" columns="auto auto" gap="normal">

			<div class="review-card-labels">
			<span>Address line 1</span>
			<span><strong>${data.addr1 || ' '}</strong></span>
			</div>

			<div class="review-card-labels">
			<span>Address line 2</span>
			<span><strong>${data.addr2 || ' '}</strong></span>
			</div>

            <div class="review-card-labels">
			<span>Suburb</span>
			<span><strong>${data.suburb || ' '}</strong></span>
			</div>

			<div class="review-card-labels">
			<span>City</span>
			<span><strong>${data.city || ' '}</strong></span>
			</div>

			<div class="review-card-labels">
			<span>Province</span>
			<span><strong>${data.province || ' '}</strong></span>
			</div>

			<div class="review-card-labels">
			<span>Postal Code</span>
			<span><strong>${data.postalCode || ' '}</strong></span>
			</div>

          </capitec-group>
        </capitec-content-box>

      </capitec-content-box>
		
        <div
          slot="footer"
          style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
		  layout="grid"
        >
            <hr
              style="border: none; border-top: 1px solid var(--theme-modal-border-color, #E1E1E1);"
            />
         
          <capitec-button
            type="secondary"
            label="Edit"
            @click="${() => {
				this.isConfirmDetailsModalVisible = false;
				this.isReturnsDetailsModalVisible = true;
			}}"
          ></capitec-button>
          <capitec-button
            type="primary"
            label="Confirm"
            style="--theme-button-primary-background: var(--theme-primary-color, #0091DA);"
            @click="${() => {
				this.isConfirmDetailsModalVisible = false;
				this._submitDeviceReturn()
				// this.isReturnsSuccessModalVisible = true;
			}}"
          ></capitec-button>
        </div>
      </capitec-modal>
    `;

	}

	renderOrderTrackerModal() {
		const currentStatus = this.currentOrderStatus || 'ORDER_DELIVERED';

		const steps = [
			{
				code: 'ORDER_PLACED',
				label: 'Order placed'
			},
			{
				code: 'ORDER_PAYMENT_SUCCESSFUL',
				label: 'Order payment successful'
			},
			{
				code: 'ORDER_PROCESSING',
				label: 'Order processing',
				description: 'Your device is on its way to our repair partner.'
			},
			{
				code: 'ORDER_PLACED_AT_SUPPLIER',
				label: 'Order placed at supplier'
			},
			// {
			// 	code: 'ORDER_OUT_FOR_DELIVERY',
			// 	label: 'Order out for delivery'
			// },
			{
				code: 'ORDER_DELIVERED',
				label: 'Order delivered'
			}
		];

		// find where we are
		const currentIndex = steps.findIndex(s => s.code === currentStatus);


		return html`
			<capitec-modal
				type="alert"
				header="Order Tracker"
				?open="${this.isOrderTrackerModalVisible}"
			>
				<div
				column="1"
				row="1"
				colspan="2"
				slot="body"
				>
				${steps.map((step, index) => {
			const isDone = currentIndex > index;
			const isCurrent = currentIndex === index;
			const isFuture = currentIndex < index;

			return html`
            <div class="tracker-row ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">
              <div class="tracker-line">
                <div class="tracker-dot">
                  ${isDone
					? html`<span class="tick">✔</span>`
					: ''}
                </div>
                ${index < steps.length - 1
					? html`<div class="tracker-connector"></div>`
					: ''}
              </div>
              <div class="tracker-content">
                <div class="tracker-title">${step.label}</div>
                ${isCurrent && step.description
					? html`<div class="tracker-desc">${step.description}</div>`
					: ''}
              </div>
            </div>
          `;
		})}
				
				</div>  
				<div
				slot="footer"
				style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px;"
				>
				<capitec-button
					slot="footer"
					type="secondary"
					label="Close"
					@click="${() => this.isOrderTrackerModalVisible = false}"
				></capitec-button>
				</div>
			</capitec-modal>
    	`;
	}


	sendInvoice() {
		if (!this.emailAddress) {
			return;
		}
		try {
			this.isSendEmailSuccessModalVisible = true;
		} catch (error) {
			console.error(`Error sending invoice:`, error);
		}
	}

	renderSendEmailSuccessModal() {
		return html`
      <capitec-modal
        type="alert"
        header="Cancel Order"
        ?open="${this.isSendEmailSuccessModalVisible}"
      >
        <div
          slot="body"
          style="text-align: center; padding-top: 16px; justify-items: center;"
        >
          <capitec-icon size="large" icon="status/success-trans"></capitec-icon>
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px;"
          >
            <capitec-label
              type="strong"
              label="Email sent successfully"
            ></capitec-label>
          </div>
        </div>

        <capitec-button
          slot="footer"
          type="secondary"
          label="Close"
		  @click="${() => {
				this.isSendEmailSuccessModalVisible = false;
				this.requestUpdate();
			}}"
        ></capitec-button>
      </capitec-modal>
    `;
	}

	renderInvoiceErrorModal() {
		return html`
      <capitec-modal
        type="alert"
        header="Invoice"
        ?open="${this.hasInvoiceError}"
      >
        <div
          column="1"
          row="1"
          colspan="2"
          slot="body"
          style="text-align: center; padding-top: 16px; justify-items: center;"
        >
          <capitec-icon size="large" icon="status/error-trans"></capitec-icon>
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px;"
          >
            <capitec-label
              type="strong"
              label="Invoice could not be opened"
            ></capitec-label>
            <capitec-label
              type="strong"
              label="Please try again or contact support"
            ></capitec-label>
          </div>
        </div>
        <div
          slot="footer"
          style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px;"
        >
          <capitec-button
            slot="footer"
            type="secondary"
            label="Close"
            @click="${() => (this.hasInvoiceError = false)}"
          ></capitec-button>
          <capitec-button
            type="primary"
            label="Retry"
            style="--theme-button-primary-background: var(--theme-primary-color, #0091DA);"
            @click="${() => this.getInvoice()}"
          ></capitec-button>
        </div>
      </capitec-modal>
    `;
	}

	renderOrderNegativeStateModal() {
		const config = this.negativeStateModalConfig || {
			header: 'Order update',
			lines: ['There was an issue with this order.']
		};
		return html`
      <capitec-modal
        type="alert"
        header="${config.header}"
        ?open="${this.isOrderNegativeStatesModalVisible}"
      >
        <div
          column="1"
          row="1"
          colspan="2"
          slot="body"
          style="text-align: center; padding-top: 16px; justify-items: center;"
        >
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px;"
          >
             ${config.lines.map(
			(line) => html`
              <capitec-label
                type="strong"
                label="${line}"
              ></capitec-label>
            `
		)}
          </div>
        </div>
        <div
          slot="footer"
          style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px;"
        >
          <capitec-button
            slot="footer"
            type="secondary"
            label="Close"
            @click="${() => (this.isOrderNegativeStatesModalVisible = false)}"
          ></capitec-button>
        </div>
      </capitec-modal>
    `;
	}

	async cancelOrder() {
		try {
			this.isLoading = true;
			const response = await this.capitecConnectService.cancelDeviceOrder(
				this.currentOrderId,
				this.clientCif
			);

			if (!response || !response.succeeded) {
				throw new Error(`Failed to cancel order`);
			}
			this.isCancelOrderModalVisible = false;
			this.isSuccessModalVisible = true;
			this.isDeviceTableVisible = false;
			setTimeout(() => {
				this.isDeviceTableVisible = true;
				this.requestUpdate();
			}, 100);

		} catch (error) {
			console.error(`Error cancelling order:`, error);
			this.isCancelOrderModalVisible = false;
			this.isErrorModalVisible = true;
		} finally {
			this.isLoading = false;
			this.requestUpdate();
		}
	}

	renderCancelOrderModal(order) {
		if (order && order !== this.currentOrder) {
			this.currentOrderId = order.orderNumber;
			this.currentOrder = order;
		}

		return html`
      <capitec-modal
        type="alert"
        header="Cancel Order"
        ?open="${this.isCancelOrderModalVisible}"
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
          @click="${() => (this.isCancelOrderModalVisible = false)}"
        ></capitec-button>
        <capitec-button
          slot="footer"
          type="primary"
          label="Confirm"
          style="--theme-button-primary-background: var(--theme-primary-color, #0091DA);"
          @click="${() => this.cancelOrder()}"
        ></capitec-button>
      </capitec-modal>
    `;
	}

	renderOrderCancelSuccessModal() {
		return html`
      <capitec-modal
        type="alert"
        header="Cancel Order"
        ?open="${this.isSuccessModalVisible}"
      >
        <div
          slot="body"
          style="text-align: center; padding-top: 16px; justify-items: center;"
        >
          <capitec-icon size="large" icon="status/success-trans"></capitec-icon>
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px;"
          >
            <capitec-label
              type="strong"
              label="Order cancellation requested"
            ></capitec-label>
          </div>
        </div>

        <capitec-button
          slot="footer"
          type="secondary"
          label="Close"
          @click="${() => this.isSuccessModalVisible = false}"
        ></capitec-button>
      </capitec-modal>
    `;
	}

	renderOrderCancelErrorModal() {
		return html`
      <capitec-modal
        type="alert"
        header="Cancel Order"
        ?open="${this.isErrorModalVisible}"
      >
        <div
          column="1"
          row="1"
          colspan="2"
          slot="body"
          style="text-align: center; padding-top: 16px; justify-items: center;"
        >
          <capitec-icon size="large" icon="status/error-trans"></capitec-icon>
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px;"
          >
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
        <div
          slot="footer"
          style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px;"
        >
          <capitec-button
            slot="footer"
            type="secondary"
            label="Close"
            @click="${() => (this.isErrorModalVisible = false)}"
          ></capitec-button>
          <capitec-button
            type="primary"
            label="Retry"
            style="--theme-button-primary-background: var(--theme-primary-color, #0091DA);"
            @click="${() => this.cancelOrder()}"
          ></capitec-button>
        </div>
      </capitec-modal>
    `;
	}

	renderReturnsErrorModal() {
		return html`
      <capitec-modal
        type="alert"
        header="Returns & Repairs"
        ?open="${this.isReturnsErrorModalVisible}"
      >
        <div
          column="1"
          row="1"
          colspan="2"
          slot="body"
          style="text-align: center; padding-top: 16px; justify-items: center;"
        >
          <capitec-icon size="large" icon="status/error-trans"></capitec-icon>
          <div
            style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: 16px;"
          >
            <capitec-label
              type="strong"
              label="Request unsuccessful"
            ></capitec-label>
            <capitec-label
              type="strong"
              label="Please try again or contact support"
            ></capitec-label>
          </div>
        </div>
        <div
          slot="footer"
          style="display: flex; gap: 16px; justify-content: flex-end; padding: 16px 24px;"
        >
          <capitec-button
            slot="footer"
            type="secondary"
            label="Close"
            @click="${() => (this.isReturnsErrorModalVisible = false)}"
          ></capitec-button>
        </div>
      </capitec-modal>
    `;
	}

	_returnsExpandRendererForReturns(item) {
		if (!item) return html``;

		const ret = item.rawReturn || {};
		const order = ret.productOrder || {};
		const contact = ret.contactDetails || {};
		const addr = ret.collectionAddress || {};
		const faults = ret.faults || [];
		const steps = ret.statusHistory || [];

		const deviceName =
			(order.productName || '') +
			(order.shortDescription ? ` | ${order.shortDescription}` : '');

		const faultText = faults.length
			? faults
				.map((f) => f.description || f.subCategory || f.category)
				.filter(Boolean)
				.join(', ')
			: '-';

		const warrantyStart = order.warrantyStart
			? formatDate(order.warrantyStart)
			: '-';

		const warrantyEnd = order.warrantyEnd
			? formatDate(order.warrantyEnd)
			: '-';

		const completedSteps = steps.filter((s) => s.completed);
		const lastCompleted = completedSteps.length
			? completedSteps[completedSteps.length - 1]
			: null;

		const returnStatus = lastCompleted?.statusName || '-';

		return html`
		<capitec-content-box style="padding:20px;">
			<div style="
				display:grid;
				grid-template-columns: repeat(4, 1fr);
				gap: 32px;
			">

				<!-- COLUMN 1 -->
				<div>
					<capitec-label type="strong" label="Device Description"></capitec-label>
					<div style="margin:4px 0 16px;">${deviceName}</div>

					<capitec-label type="strong" label="IMEI 1"></capitec-label>
					<div style="margin:4px 0 16px;">
						${order.serialNumbers?.split('|')[0] || '-'}
					</div>

					<capitec-label type="strong" label="IMEI 2"></capitec-label>
					<div style="margin:4px 0 16px;">
						${order.serialNumbers?.split('|')[1] || '-'}
					</div>
				</div>

				<!-- COLUMN 2 -->
				<div>
					<capitec-label type="strong" label="Order Date"></capitec-label>
					<div style="margin:4px 0 16px;">
						${ret.createdAt ? formatDate(ret.createdAt) : '-'}
					</div>

					<capitec-label type="strong" label="Appearance"></capitec-label>
					<div style="margin:4px 0 16px;">
						${ret.appearance || '-'}
					</div>

					<capitec-label type="strong" label="Faults"></capitec-label>
					<div style="margin:4px 0 16px;">
						${faultText}
					</div>
				</div>

				<!-- COLUMN 3 -->
				<div>
					<capitec-label type="strong" label="Device Cost"></capitec-label>
					<div style="margin:4px 0 16px;">
						R ${order.priceIncVat || '-'}
					</div>

					<capitec-label type="strong" label="Warranty Start Date"></capitec-label>
					<div style="margin:4px 0 16px;">
						${warrantyStart}
					</div>

					<capitec-label type="strong" label="Warranty End Date"></capitec-label>
					<div style="margin:4px 0 16px;">
						${warrantyEnd}
					</div>
				</div>

				<!-- COLUMN 4 -->
				<div>
					<capitec-label type="strong" label="Account Number"></capitec-label>
					<div style="margin:4px 0 16px;">
						${contact.primaryNumber || '-'}
					</div>

					<capitec-label type="strong" label="Collection Address"></capitec-label>
					<div style="margin:4px 0 16px;">
						${addr.addressLine1 || '-'}, ${addr.suburb || '-'}
					</div>

					<capitec-label type="strong" label="Return Status"></capitec-label>
					<div style="margin:4px 0 16px;">
						${returnStatus || '-'}
					</div>
				</div>

			</div>
		</capitec-content-box>
	`;
	}




	_expandRenderer(item) {
		const imei1 = item?.deviceOrderResponse?.result.products?.[0]?.serialNumbers?.split(`|`)?.[0];
		const imei2 = item?.deviceOrderResponse?.result.products?.[0]?.serialNumbers?.split(`|`)?.[1];
		try {
			const copyWordToClipboard = (value) => {
				navigator.clipboard.writeText(value);
			};

			if (!item.hasLogged && !item.isLoading) {
				item.isLoading = true;
				this.isLoading = true;
				this.capitecConnectService
					.getDeviceOrder(item.orderId)
					.then((response) => {
						if (!response || !response.succeeded) {
							throw new Error(`Failed to get device order`);
						}
						item.deviceOrderResponse = response;
						item.hasLogged = true;

						const product = response?.result?.products?.[0];
						if (product) {
							const serials = product.serialNumbers?.split('|') || [];
							const deviceDetails = {
								deviceName: item.deviceName || '-',
								specs: item.deviceName || '-',
								imei1: serials[0] || '-',
								productOrderId: item.productOrderId,
							};

							this.tempReturnForm = { ...this.tempReturnForm, ...deviceDetails };
							localStorage.setItem('returnDraft', JSON.stringify(this.tempReturnForm));
							console.log('[returns] Saved device details:', this.tempReturnForm);
						}

						this.requestUpdate();
					})
					.catch((error) => {
						console.error(`Error in getDeviceOrder:`, error);
						item.hasError = true;
					})
					.finally(() => {
						item.isLoading = false;
						this.isLoading = false;
						this.requestUpdate();
					});
			}

			const getValue = (value) => (!value || value === `null` ? `-` : value);
			const getFormattedDate = (date) => (date ? `${formatDate(date)} ${getTimeFromDate(date)}` : `-`);
			const showInvoiceButton = item.orderStatus === `ORDER DELIVERED`;
			const showCancelButton = item.deviceOrderResponse?.result.cancellable;
			const showReturnButton = item.orderStatus === `ORDER DELIVERED`;
			const showRepairButton = item.orderStatus === `ORDER DELIVERED`;
			const showOrderTrackerButton = item.orderStatus != null;


			return html`
        <capitec-group layout="grid" gap="clear">
          <div column="1" row="1">
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
                label="${item?.orderStatus === `ORDER DELIVERED` ? getValue(imei1) : `-`}"
              ></capitec-label>
              ${getValue(item?.orderStatus === `ORDER DELIVERED` && imei1) !== `-`
					? html`<capitec-icon
                    size="small"
                    icon="system/notes-action"
                    @click="${() => copyWordToClipboard(getValue(imei1))}"
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
				label="${item?.orderStatus === `ORDER DELIVERED` ? getValue(imei2) : `-`}"
				></capitec-label>
				${item?.orderStatus === `ORDER DELIVERED` && getValue(imei2) !== `-`
					? html`<capitec-icon
					size="small"
					icon="system/notes-action"
					@click="${() => copyWordToClipboard(getValue(imei2))}"
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
			  label="${this._renderStatus(item?.orderStatus)}"
            ></capitec-label>
          </div>

          <div column="3" row="2">
		  <capitec-label label="Account Number"></capitec-label>
            <div
              row="3"
              style="display: flex; align-items: center; gap: 4px;"
            >
              <capitec-label
                type="strong"
                label="${getValue(item.deviceOrderResponse?.result.accountNumber)}"
              ></capitec-label>
              <capitec-icon
                size="small"
                icon="system/notes-action"
                @click="${() => copyWordToClipboard(getValue(item.deviceOrderResponse?.result.accountNumber))}"
                style="cursor: pointer;"
              ></capitec-icon>
            </div>
          </div>

		  <div column="4" row="2">
            <capitec-label label="Client Id"></capitec-label>
            <capitec-label
              type="strong"
              label="${getValue(item.deviceOrderResponse?.result.clientOrderId)}"
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
				style="cursor: pointer; color: var(--theme-primary-color, #0091DA)"
				onclick="window.open('${getValue(item?.deviceOrderResponse?.result?.waybillUrl)}')"
                label="${getValue(item?.deviceOrderResponse?.result?.waybillNumber)}"
              ></capitec-label>
              ${getValue(item?.deviceOrderResponse?.result?.waybillUrl) !==
					`-`
					? html`<capitec-icon
                    size="small"
                    icon="system/notes-action"
                    @click="${() => copyWordToClipboard(getValue(item?.deviceOrderResponse?.result?.waybillNumber))}"
                    style="cursor: pointer;"
                  ></capitec-icon>`
					: ``}
            </div>
          </div>

          <div column="2" row="3">
            <capitec-label label="Warranty Start Date"></capitec-label>
            <capitec-label
              type="strong"
        	  label="${getFormattedDate(item.deviceOrderResponse?.result?.products?.[0]?.warrantyStartDate)}"
            ></capitec-label>
          </div>

          <div column="3" row="3">
            <capitec-label label="Warranty End Date"></capitec-label>
            <capitec-label
              type="strong"
			  label="${getFormattedDate(item.deviceOrderResponse?.result?.products?.[0]?.warrantyEndDate)}"
            ></capitec-label>
          </div>

		  <div column="4" row="3">
		            <capitec-label label="Order Id"></capitec-label>
		            <div
		              style="display: flex; align-items: center; gap: 4px;"
		            >
		              <capitec-label
		                type="strong"
		                label="${getValue(item.deviceOrderResponse?.result.orderId)}"
		              ></capitec-label>
		              <capitec-icon
		                size="small"
		                icon="system/notes-action"
		                @click="${() => copyWordToClipboard(getValue(item.deviceOrderResponse?.result.orderId))}"
		                style="cursor: pointer;"
		              ></capitec-icon>
		            </div>
		          </div>

          <div row="4" column="1" colspan="4">
            ${showInvoiceButton || showCancelButton || showReturnButton || showOrderTrackerButton
					? html` <div
                  style="padding-top:10px; display: flex; justify-content: flex-end; gap: 16px; margin-top: 10px; border-top: var(--theme-data-table-border, 1px solid #E1E1E1);"
                >
                  ${showInvoiceButton
							? html`
                        <capitec-hyperlink
                          style="--theme-hyperlink-color: #009DE0;"
                          label="View Invoice"
                          @click="${() => {
									this.currentOrderId = item?.orderNumber;
									this.isInvoiceModalVisible = true;
								}}"
                        >
                        </capitec-hyperlink>
                      `
							: ``}
							${showReturnButton
							? html`
                        <capitec-hyperlink
                          style="--theme-hyperlink-color: #009DE0;"
                          label="Return"
                          @click="${() => {
									this.currentActionType = 'return';
									this.currentOrderId = item?.orderNumber;
									this.isConnectivityModalVisible = true;
								}}"
                        >
                        </capitec-hyperlink>
                      `
							: ``}

								${showOrderTrackerButton
							? html`

						<capitec-hyperlink
                          style="--theme-hyperlink-color: #009DE0;"
                          label="Order Tracker"
                          @click="${() => this._handleOrderTrackerClick(item)}"
                        >
                        </capitec-hyperlink>
                      `
							: ``}

							${showRepairButton
							? html`
                        <capitec-hyperlink
                          style="--theme-hyperlink-color: #009DE0;"
                          label="Repair"
                          @click="${() => {
									this.currentActionType = 'repair';
									this.currentOrderId = item?.orderNumber;
									this.isConnectivityModalVisible = true;
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
									this.currentOrder = item;
									this.currentOrderId = item?.orderNumber;
									this.isCancelOrderModalVisible = true;
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
		} catch (error) {
			console.error(`Error in expandRenderer:`, error);
			return html``;
		}

	}

	_renderAmount(item, fieldName, value) {
		return formatAmount(value);
	}

	_renderStatus(status) {
		if (!status) {
			return `-`;
		}
		const label = status.replace(`ORDER`, ``).replace(/_/g, ` `).trim();
		return label;
	}


	_renderStatusTag(item, _fieldName, value) {
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
      ${this.isLoading ? html`<capitec-loading-indicator></capitec-loading-indicator>` : ``}

      <!-- Shared Filters (apply to both inner tabs for now) -->
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
              label="${this.activeFilters.searchType.text}: ${this.activeFilters.searchValue}"
            >
            </capitec-chip>`
				: null}
        ${this.activeFilters.dateRange.to !== null && this.activeFilters.dateRange.from !== null
				? html`<capitec-chip
              label="${formatDate(this.activeFilters.dateRange.from)} - ${formatDate(this.activeFilters.dateRange.to)}"
            >
            </capitec-chip>`
				: null}
      </capitec-button-bar>

      <!-- NEW: Inner tabs for Devices & Returns -->
      <capitec-tab-group layout="vertical" halign="left" style="height: 100%;">
        <!-- DEVICES TAB -->
        <capitec-tab label="Devices" layout="vertical" halign="left">
          ${this.isDeviceTableVisible
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
                    field="orderNumberShort"
                  ></capitec-table-column>
                  <capitec-table-column
                    label="Order Description"
                    field="orderDescription"
                  ></capitec-table-column>
                  <capitec-table-column
                    label="Order Amount"
                    field="orderAmount"
                    .renderer="${this._renderAmount}"
                  ></capitec-table-column>
                  <capitec-table-column
                    label="Order Status"
                    field="orderStatus"
                    .renderer="${this._renderStatusTag}"
                  ></capitec-table-column>
                </capitec-table>
              `
				: html`
                <capitec-table>
                  <capitec-table-column label="Order Date"></capitec-table-column>
                  <capitec-table-column label="Order Number"></capitec-table-column>
                  <capitec-table-column label="Order Description"></capitec-table-column>
                  <capitec-table-column label="Order Amount (incl VAT)"></capitec-table-column>
                  <capitec-table-column label="Order Status"></capitec-table-column>
                </capitec-table>
                <capitec-content-box>
                  <capitec-label
                    align="center"
                    type="default"
                    label="No device orders found."
                  ></capitec-label>
                </capitec-content-box>
				 
              `}
          
          <!-- Keep your existing modals inside the Devices tab so they’re scoped -->
          ${this.isInvoiceModalVisible ? this.renderInvoiceModal() : null}
          ${this.isSendEmailSuccessModalVisible ? this.renderSendEmailSuccessModal() : null}
          ${this.isCancelOrderModalVisible ? this.renderCancelOrderModal() : null}
          ${this.isSuccessModalVisible ? this.renderOrderCancelSuccessModal() : null}
          ${this.isErrorModalVisible ? this.renderOrderCancelErrorModal() : null}
          ${this.hasInvoiceError ? this.renderInvoiceErrorModal() : null}
		  ${this.isConnectivityModalVisible ? this.renderConnectivityModal() : null}
		  ${this.isReturnsModalVisible ? this.renderReturnsModal() : null}
		  ${this.isReturnsDetailsModalVisible ? this.renderReturnsDetailsModal() : null}
		  ${this.isConnectivityIssuesModalVisible ? this.renderConnectivityIssuesModal() : null}
		  ${this.isConnectivityTroubleshootingModalVisible ? this.renderConnectivityTroubleshootingModal() : null}
		  ${this.isConfirmDetailsModalVisible ? this.renderConfirmDetailsModal() : null}
		  ${this.isReturnsSuccessModalVisible ? this.renderReturnsSuccessModal() : null}
		  ${this.isOrderTrackerModalVisible ? this.renderOrderTrackerModal() : null}
		  ${this.isOrderNegativeStatesModalVisible ? this.renderOrderNegativeStateModal() : null}
		  ${this.isReturnsErrorModalVisible ? this.renderReturnsErrorModal() : null}

        </capitec-tab>

        <!-- RETURNS TAB -->
        <capitec-tab label="Return and repairs" layout="vertical" halign="left">
		
        <capitec-table
    displayMode="Paging"
    numOfPagingRows="${this.numOfPagingRows}"
    pagingRows="[${this.pagingRows.join(`,`)}]"
    .dataHandler="${(renderSet) => this._retrieveReturns(renderSet)}"
    expandable="right"
    .expandRenderer="${(item) => this._returnsExpandRendererForReturns(item)}"
  >
    <capitec-table-column
      label="Order Date"
      field="orderDate"
      .renderer="${(item) => this._renderTableCol(item)}"
    ></capitec-table-column>
    <capitec-table-column
      label="Order Number"
      field="orderNumberShort"
    ></capitec-table-column>
    <capitec-table-column
      label="Order Description"
      field="orderDescription"
    ></capitec-table-column>
    <capitec-table-column
      label="Order Amount"
      field="orderAmount"
      .renderer="${this._renderAmount}"
    ></capitec-table-column>
    <capitec-table-column
      label="Order Status"
      field="orderStatus"
      .renderer="${this._renderStatusTag}"
    ></capitec-table-column>
  </capitec-table>
		</capitec-tab>
      </capitec-tab-group>
    </capitec-content-box>
  `;
	}
}

customElements.define(
	`horizon-capitec-connect-agent-devices`,
	CapitecConnectAgentDevices
);