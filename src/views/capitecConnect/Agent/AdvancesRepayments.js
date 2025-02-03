import { css, html } from 'platform/elements';
import { CapitecConnectService } from 'app/services/CapitecConnectService';
import { ViewBase } from 'app/views/common/ViewBase';
import { DateTime } from 'luxon';
import { formatDate, getTimeFromDate, compareDates, getDateInPast, incrementDate, sortObjectsByDateDescending, formatCellphoneNumber, isArray, isJson, toTitleCase, formatAmount, formatDateAndTime } from 'app/utils/capitecConnectUtils';

/**
 * Capitec Connect Agent View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class CapitecConnectAgentAdvancesRepayments
 */
export class CapitecConnectAgentAdvancesRepayments extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.capitecConnectService = new CapitecConnectService(() => super._toggleBusyFlag());

		// Static variables
		this.searchTypes = [
			{ value: `msisdn`, text: `MSISDN` },
			{ value: `amount`, text: `Amount` },
			{ value: `accountNumber`, text: `Account Number` }
		];

		this.pagingRows = [10, 20, 50];
		this.numOfPagingRows = this.pagingRows[0];
		this.currentPageIndex = 1;

		// State variables
		this.searchValue = ``;
		this.activeFilters = {
			searchType: this.searchTypes[0],
			searchValue: ``,
			dateRange: {
				from: getDateInPast(30),
				to: getDateInPast(0)
			}
		};

		this.advanceBalances = [];
		this.advanceBalancePopupOpen = false;

		this.selectedAdvanceView = null;

		this.showTable = false;

		this.clientCif = ``;

		this.serialNumber = ``;
		this.showVoucherModal = false;
		this.showVoucherInformationModal = false;
		this.showErrorModal = false;
		this.voucherInformationData = null;
		this.voucherHistoryData = null;
		this.voucherInfoLoading = false;
		this.voucherHistoryLoading = false;
		this.errorMessage = ``;
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
			selectedAdvanceView: { type: Object },
			activeFilters: { type: Object },
			showTable: { type: Boolean },
			callerInformation: { type: Object },
			clientCif: { type: String },
			searchValue: { type: String },
			advanceBalances: { type: Object },
			advanceBalancePopupOpen: { type: Boolean },
			showVoucherModal: { type: Boolean },
			showVoucherInformationModal: { type: Boolean },
			showErrorModal: { type: Boolean },
			voucherInfoLoading: { type: Boolean },
			voucherHistoryLoading: { type: Boolean }
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
		this.clientCif = `161413722`; // TODO: comment out when done with dev (INT env): - Has voucherSerialNumber
		// this.clientCif = `281783047`; // TODO: comment out when done with dev: - Transaction Type:Account

		this.showTable = true;
	}

	async _retrieveAdvances(renderSet) {
		this.renderSet = renderSet;
		this.numOfPagingRows = this.renderSet.numOfPagingRows;
		this.currentPageIndex = this.renderSet.currentPageIndex;
		this.searchValue = this.renderSet.searchValue;

		try {
			/*
				When a client has called in. We get their CIF number. i.e. If they are "connected" to Horizon
			*/
			let filters = this.activeFilters;

			if (this.clientCif) {
				filters.cif = this.clientCif;
			} else {
				return {
					pagedItems: [],
					totalCount: 0
				};
			}

			const response = await this.searchAdvances(filters, "ADVANCE_PAYMENT");

			let r = response.result.content;

			if (r.length > 0) {
				r = r.map(e => {
					e.friendlyDate = formatDate(e.transactionDate) + ' ' + getTimeFromDate(e.transactionDate);
					e.friendlyMsisdn = formatCellphoneNumber(e.msisdn);
	
					return e;
				});
			}

			response.result.content = r;

			this.showTable = response.result.totalElements !== 0;

			return {
				pagedItems: response.result?.content || [],
				totalCount: response.result.totalElements // for pagination reasons this is not the returned resultset's length
			};
		} catch (error) {
			this.showTable = false;

			if (
				this.activeFilters.searchType.value === `msisdn` &&
				this.activeFilters.searchValue.trim() !== `` &&
				this.clientCif
			) {
				alert("Error: " + `The provided MSISDN [${this.activeFilters.searchValue.trim()}] is not owned by this client [cif ${this.clientCif}]`);
			}

			return {
				pagedItems: [],
				totalCount: 0
			};
		}
	}

	_filterSearchboxClick(value) {
		this.activeFilters.searchValue = ``;

		this.onFilter();
		return;
	}

	getPredefinedDateRanges() {
		return [
			{ text: `Last 30 days`, value: { startDate: getDateInPast(30), endDate: getDateInPast(0) } },
			{ text: `Last 60 days`, value: { startDate: getDateInPast(60), endDate: getDateInPast(0) } },
			{ text: `Last 90 days`, value: { startDate: getDateInPast(90), endDate: getDateInPast(0) } }
		];
	}

	async _dateChanged(e) {

		/**
		 * 1. When dates are not selected on the date time picker, new value dispatched would be null.
		 *    In such case, data refresh can be skipped.
		 * 2. Sometimes start date/ end date could be null when one of its not selected, for which
		 *    either before 90 days or after 90 days set accordingly.
		 */

		if (!e.detail.new.startDate && !e.detail.new.endDate) {
			return false;
		} else if (!e.detail.new.endDate) {
			e.detail.new.endDate = e.detail.old.endDate?.split('T')[0] || getDateInPast(0);
		} else if (!e.detail.new.startDate) {
			e.detail.new.startDate = incrementDate(e.detail.new.endDate.split('T')[0], -30);
		}

		const currentDateTime = DateTime.local();
		const fromDate = DateTime.fromISO(e.detail.new.startDate);
		let toDate = DateTime.fromISO(e.detail.new.endDate);

		let from,
			to;

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

		Object.keys(e.detail).forEach(d => {
			Object.keys(e.detail[d]).forEach(x => {
				if (e.detail[d][x] !== null && e.detail[d][x].indexOf("T") > -1) {
					e.detail[d][x] = e.detail[d][x].split('T')[0]
				}
			});
		});

		this.activeFilters.dateRange = {
			from: from.split('T')[0],
			to: to.split('T')[0]
		}

		return this.onFilter();
	}

	onFilter() {
		this.showTable = false;
		// this.requestUpdate();

		setTimeout(() => {
			this.showTable = true;
			this.requestUpdate();
		}, 100);
	}

	async advancesBalanceButtonClickHandler(e) {
		let filters = this.activeFilters;

		if (this.clientCif) {
			filters.cif = this.clientCif;
		}

		var { result } = await this.getAdvanceBalances(filters);
		this.advanceBalances = result.content;

		if (
			filters.searchType.value === `msisdn` &&
			filters.searchValue.trim() !== `` &&
			this.clientCif
		) {
			this.advanceBalances = this.advanceBalances.filter(e => e.msisdn === filters.searchValue);
		}

		this.advanceBalancePopupOpen = true;
	}

	async _handleVoucherInfoConfirm(serial) {
		if (serial === '') {
			return;
		}
		this.showVoucherInformationModal = false;
		this.voucherInfoLoading = true;
		this.voucherHistoryLoading = true;
		this._getVoucherInformation(serial);
		this._getVoucherHistory(serial);
	}

	async _getVoucherInformation(voucherSerialNumber) {
		try {
			const response = await this.capitecConnectService.getVoucherInformation(voucherSerialNumber);
			if (response.succeeded) {
				this.voucherInformationData = response.result;
				this.voucherInfoLoading = false;
				this.requestUpdate();
				this.showVoucherModal = true;
			} else {
				this.voucherInfoLoading = false;
				console.error(`Failed to get voucher information`);
				this.showErrorModal = true;
				this.errorMessage = `Failed to get voucher information`;
				this.requestUpdate();
			}
		} catch (error) {
			this.voucherInfoLoading = false;
			console.error(`Error fetching voucher information (bluelabel api down):`, error);
			this.showErrorModal = true;
			this.errorMessage = `Unable to retrieve the voucher information. Please try again later.`;
			this.requestUpdate();
		}
	}

	async _getVoucherHistory(voucherSerialNumber) {
		try {
			const response = await this.capitecConnectService.getVoucherHistory(voucherSerialNumber);
			if (response.succeeded) {
				this.voucherHistoryData = response.result;
				this.voucherHistoryLoading = false;
				this.requestUpdate();
				this.showVoucherModal = true;
			} else {
				this.voucherHistoryLoading = false;
				console.error('Failed to get voucher history');
				this.showErrorModal = true;
				this.errorMessage = 'Failed to get voucher history';
				this.requestUpdate();
			}
		} catch (error) {
			this.voucherHistoryLoading = false;
			console.error('Error fetching voucher history (bluelabel api down):', error);
			this.showErrorModal = true;
			this.errorMessage = 'Unable to retrieve the voucher history. Please try again later.';
			this.requestUpdate();
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

	/* RENDERS:start */
	_render() {
		return html`
			<capitec-content-box noPadding style="width:CALC(var(--horizon-center-panel-width) - 30px); height:CALC(var(--horizon-panel-height) - 180px)" layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-button-bar align="left">
					<capitec-search-field label="Search" 
					value="${this.activeFilters.searchValue}" 
					class="custom-flex-size" 
					@value-change="${(e) => {
				this.activeFilters.searchValue = e.detail.new;
				this.onFilter();
			}}"></capitec-search-field>

					<capitec-select 
						label="Select option" 
						.items="${this.searchTypes}" 
						.value="${this.activeFilters.searchType}"
						@value-change="${(e) => {
				this.activeFilters.searchType = e.detail.new;
				this.onFilter();
			}}"
						display-field="text"
						id-field="value">
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
						data-automation-id="connect-advances-repayment-date-filter">
					</capitec-date-time-picker>

					<capitec-button
						type="primary"
						label="Search"
						@click="${() => this.onFilter()}"
					></capitec-button>
				</capitec-button-bar>

				<capitec-button-bar align="left">
					<capitec-label type="strong" label="Active Filters:"></capitec-label>
					${this.activeFilters.searchValue ? html`<capitec-chip closable @remove="${this._filterSearchboxClick}" label="${this.activeFilters.searchType.text}: ${this.activeFilters.searchValue}"></capitec-chip>` : null}
					${this.activeFilters.dateRange.to !== null && this.activeFilters.dateRange.from !== null ?
				html`<capitec-chip label="${formatDate(this.activeFilters.dateRange.from)} - ${formatDate(this.activeFilters.dateRange.to)}"></capitec-chip>` :
				null
			}
					<capitec-spacer></capitec-spacer>
					
					${this.clientCif && html`
					<capitec-button
						type="primary"
						label="Advance Balance"
						@click="${this.advancesBalanceButtonClickHandler}">
					</capitec-button>`}
				</capitec-button-bar>

				${this.showTable ? html`
					<capitec-table style="" 
							displayMode="Paging" 
							groupField="month"
							numOfPagingRows="${this.numOfPagingRows}"
							pagingRows="[${this.pagingRows.join(`,`)}]"
							.dataHandler="${(renderSet) => this._retrieveAdvances(renderSet)}"
							expandable="right" 
							.expandRenderer="${(item) => this._expandRenderer(item)}">
						<capitec-table-column label="Transaction Date" field="friendlyDate"></capitec-table-column>
						<capitec-table-column label="Beneficiary Name" field="recharges" .renderer="${this._renderBeneficiaryName}"></capitec-table-column>
						<capitec-table-column label="Mobile Number" field="friendlyMsisdn"></capitec-table-column>
						<capitec-table-column label="Channel" field="channel" .renderer="${this._renderTag}"></capitec-table-column>
						<capitec-table-column label="Product" field="bundleType"></capitec-table-column>
						<capitec-table-column label="Amount" field="amount" .renderer="${this._renderAmount}"></capitec-table-column>
					</capitec-table>
					`
				: html`
					<capitec-table>
						<capitec-table-column label="Transaction Date"></capitec-table-column>
						<capitec-table-column label="Beneficiary Name"></capitec-table-column>
						<capitec-table-column label="Cellphone Number"></capitec-table-column>
						<capitec-table-column label="Channel"></capitec-table-column>
						<capitec-table-column label="Product"></capitec-table-column>
						<capitec-table-column label="Amount"></capitec-table-column>
					</capitec-table>
					<capitec-content-box>
						<capitec-label align="center" type="default" label="No advance data found."></capitec-label>
					</capitec-content-box>
				`}
			</capitec-content-box>

			${this.selectedAdvanceView ? this._renderAdvanceStatusModal() : null}
			${this.advanceBalancePopupOpen ? this._renderAdvanceBalanceModal() : null}
			${this.showErrorModal ? this._renderErrorModal() : ``}
			${this.showVoucherModal ? this._renderVoucherInformationModal() : null}
			${this.showVoucherInformationModal ? this._renderVoucherSerialModal() : ``}
		`;
	}

	_renderTag(item, fieldName, value) {
		return html`<capitec-tag label="${value.toUpperCase()}" type="info"></capitec-tag>`;
	}

	_renderBeneficiaryName(item, fieldName, value) {
		return value[0]?.beneficiaryName;
	}

	_renderAmount(item, fieldName, value) {
		return formatAmount(value);
	}

	_expandRenderer(item) {
		let channel = toTitleCase(item.channel);
		let product = item.bundleType;
		let status = `---`;
		let transactionCode = item.transactionReference || `-`;
		let typeOfRecharge = item.type;
		let transactionDate = `-`;
		let account = `-`;
		let journalReference = `-`;
		let advanceAmountPaid = `R0.00`;
		let airtimeSurplus = `R0.00`;
		const voucherSerialNumber = item.transactions?.[0]?.voucherSerialNumber;
		const sourceOfFunds =
			item.transactions?.[0]?.sourceOfFunds === `BANK_ACCOUNT`
				? `Account`
				: `Voucher`;

		if (item.transactions.length > 0) {
			transactionDate = formatDate(item.transactions[0].transactionDateTime) + ` ` + getTimeFromDate(item.transactions[0].transactionDateTime);
			account = item.transactions[0].accountNumber;
			status = item.transactions[0].status || status;
			status = toTitleCase(status);

			journalReference = item.transactions[0].journalReference || journalReference;
			
			advanceAmountPaid = typeof item.transactions[0].advanceAmountPaid === "number" ? `R${parseFloat(item.transactions[0].advanceAmountPaid).toFixed(2)}` : advanceAmountPaid;
			airtimeSurplus = typeof item.transactions[0].advanceSurplus === "number" ? `R${parseFloat(item.transactions[0].advanceSurplus).toFixed(2)}` : airtimeSurplus;

			typeOfRecharge = typeof item.transactions[0].type === "string" ? item.transactions[0].type : typeOfRecharge;
		}

		let postingDate = item.friendlyDate;

		if (item.recharges.length > 0) {
			product = product ? product : item.recharges[0].bundleType;
			airtimeSurplus = typeof item.recharges[0].quantity === "number" ? `R${parseFloat(item.recharges[0].quantity).toFixed(2)}` : airtimeSurplus; // the recharge that occurred is the surplus of airtime.
		}

		product = toTitleCase(product);
		typeOfRecharge = toTitleCase(typeOfRecharge.replace("_", " "));
		const loading = this.voucherHistoryLoading || this.voucherInfoLoading;

		return html`
			<capitec-spacer></capitec-spacer>

			<capitec-group layout="grid" gap="clear">
			${loading
				? html`<capitec-loading-indicator
				data-automation-id="app-shell-loading-indicator"
			  ></capitec-loading-indicator>`
				: null}
				<div row="1" column="1" colspan="4">
					<capitec-label label="Description:"></capitec-label>
					<capitec-label type="strong" label="${channel.toUpperCase()} ${product} ${typeOfRecharge} Capitec Connect"></capitec-label>
				</div>

				<div row="2" column="1">
					<capitec-label label="Product:"></capitec-label>
					<capitec-label type="strong" label="${product}"></capitec-label>
				</div>
				<div row="2" column="2">
					<capitec-label label="Transaction Type:"></capitec-label>
					<capitec-label type="strong" label="${typeOfRecharge}"></capitec-label>
				</div>
				<div row="2" column="3">
					<capitec-label label="Transaction Status:"></capitec-label>
					<capitec-label type="strong" label="${status}"></capitec-label>
				</div>
				<div row="2" column="4">
					<capitec-label label="Transaction Code:"></capitec-label>
					<capitec-label type="strong" label="${transactionCode}"></capitec-label>
				</div>

				<div row="3" column="1">
					<capitec-label label="Transaction Date:"></capitec-label>
					<capitec-label type="strong" label="${transactionDate}"></capitec-label>
				</div>
				<div row="3" column="2">
					<capitec-label label="Processed Date:"></capitec-label>
					<capitec-label type="strong" label="${postingDate}"></capitec-label>
				</div>
				<div row="3" column="3">
					<capitec-label label="Advance Repayment:"></capitec-label>
					<capitec-label type="strong" label="${advanceAmountPaid}"></capitec-label>
				</div>
				<div row="3" column="4">
					<capitec-label label="Airtime Surplus:"></capitec-label>
					<capitec-label type="strong" label="${airtimeSurplus}"></capitec-label>
				</div>

				<div row="4" column="1">
					<capitec-label label="Account:"></capitec-label>
					<capitec-label type="strong" label="${account}"></capitec-label>
				</div>
				<div row="4" column="2">
					<capitec-label label="Journal Number:"></capitec-label>
					<capitec-label type="strong" label="${journalReference}"></capitec-label>
				</div>
				<div row="4" column="3">
					<capitec-label label="Serial number:"></capitec-label>
					<capitec-label type="strong" label="${voucherSerialNumber || `-`}"></capitec-label>
				</div>
				<div row="4" column="4">
					<capitec-label label="Source of funds:"></capitec-label>
					<capitec-label type="strong" label="${sourceOfFunds}"></capitec-label>
				</div>

				<div row="5" column="1" colspan="4">
					<capitec-spacer></capitec-spacer>
				</div>

				<div row="5" column="1" colspan="4" style="text-align: right; --theme-hyperlink-color: #009DE0; border-top: var(--theme-data-table-border, 1px solid #E1E1E1);">
					<capitec-hyperlink
						style="margin-right: 16px;
						margin-top: 10px"
						label="Recharge Status"
						@click="${() => { this.selectedAdvanceView = item; }}">
					</capitec-hyperlink>
					${voucherSerialNumber ? html`
						<capitec-hyperlink
						style="margin-right: 16px; margin-top: 10px;"
						label="Voucher Information"
						@click="${() => this._handleVoucherInfoConfirm(voucherSerialNumber)}" //TODO
						>
					</capitec-hyperlink>` : ``}
				</div>
			</capitec-group>
		`;
	}

	_renderAdvanceStatusModal() {
		let item = this.selectedAdvanceView;

		let product = item.bundleType,
			productId = `N/A`,
			type = item.type,
			airtimeSurplus = `---`,
			advanceRepayment = `---`,
			account = `---`;

		let rechargeStatus = 'Failed';
		let rechargeStatusReason = null;

		if (item.transactions.length > 0) {
			product = product ? product : item.transactions[0].bundleType;
			account = item.transactions[0].accountNumber;

			advanceRepayment = typeof item.transactions[0].advanceAmountPaid === "number" ? `R${parseFloat(item.transactions[0].advanceAmountPaid).toFixed(2)}` : advanceRepayment;
			airtimeSurplus = typeof item.transactions[0].advanceSurplus === "number" ? `R${parseFloat(item.transactions[0].advanceSurplus).toFixed(2)}` : airtimeSurplus;

			type = typeof item.transactions[0].type === "string" ? item.transactions[0].type : type;
		}

		if (item.recharges.length > 0) {
			product = product ? product : item.recharges[0].bundleType;
			productId = item.recharges[0].productId ? item.recharges[0].productId : productId;

			airtimeSurplus = typeof item.recharges[0].quantity === "number" ? `R${parseFloat(item.recharges[0].quantity).toFixed(2)}` : airtimeSurplus; // the recharge that occurred is the surplus of airtime.

			rechargeStatus = item.recharges[0]?.status || rechargeStatus;
			rechargeStatusReason = item.recharges[0]?.statusReason || rechargeStatusReason;
		} else {
			rechargeStatusReason = "No recharge occurred.";

			// if there was a transaction, chances are that this was a transaction that didn't have a surplus
			if (item.transactions.length > 0) {
				rechargeStatus = item.transactions[0].status;
			}
		}

		product = toTitleCase(product);

		return html`
		<capitec-modal type="form" header="Recharge Status">
			<capitec-group slot="body" layout="grid" gap="clear">
				<div row="1" column="1">
					<capitec-label type="strong" label="Status: ${rechargeStatus}"></capitec-label>
					<capitec-label type="strong" label="${product} ${toTitleCase(type.replace("_", " "))}"></capitec-label>
				</div>
				<div row="1" column="2">
					<br>
					<capitec-label label="${item.transactions[0].advancePaymentId}"></capitec-label>
				</div>

				<div row="2" column="1">
					<capitec-label label="Message ID"></capitec-label>
					<capitec-label label="Time"></capitec-label>
				</div>
				<div row="2" column="2">
					<capitec-label label="${item.transactionReference}"></capitec-label>
					<capitec-label label="${item.friendlyDate}"></capitec-label>
				</div>

				<div row="3" column="1" colspan="2">
					<hr style="border-bottom: none;">
				</div>

				<div row="4" column="1">
					<capitec-label label="Channel"></capitec-label>
					<capitec-label label="MSISDN"></capitec-label>
					<capitec-label label="MNO"></capitec-label>
					<capitec-label label="Product ID"></capitec-label>
					<capitec-label label="Product Name"></capitec-label>
					<capitec-label label="Product Type"></capitec-label>
					<capitec-label label="Account"></capitec-label>
					<capitec-label label="Advance Repayment"></capitec-label>
					<capitec-label label="Airtime Surplus"></capitec-label>
				</div>
				<div row="4" column="2">
					<capitec-label label="${item.channel.toUpperCase()}"></capitec-label>
					<capitec-label label="${item.friendlyMsisdn}"></capitec-label>
					<capitec-label label="Capitec Connect"></capitec-label>
					<capitec-label label="${productId}"></capitec-label>
					<capitec-label label="${item.productName}"></capitec-label>
					<capitec-label label="${product}"></capitec-label>
					<capitec-label label="${account}"></capitec-label>
					<capitec-label label="${advanceRepayment}"></capitec-label>
					<capitec-label label="${airtimeSurplus}"></capitec-label>
				</div>

				${(rechargeStatus !== null && rechargeStatus.toUpperCase() !== "SUCCESSFUL") ? html`
				<capitec-spacer></capitec-spacer>
				<div row="5" column="1">
					<capitec-label label="Error Type"></capitec-label>
					${rechargeStatusReason !== null ? html`<capitec-label label="Error Message"></capitec-label>` : ``}
				</div>
				<div row="5" column="2">
					<capitec-label label="${rechargeStatus.toUpperCase()}"></capitec-label>
					${rechargeStatusReason !== null ? html`<capitec-label label="${rechargeStatusReason}"></capitec-label>` : ``}
				</div>
				` : ``}
			</capitec-group>

			<capitec-button slot="footer" type="primary" label="Close" @click="${() => { this.selectedAdvanceView = null; }}"></capitec-button>
		</capitec-modal>`;
	}

	_renderVoucherInformationModal() {
		const voucherInfo = this.voucherInformationData;
		const voucherHistory = this.voucherHistoryData;


		return html` <!-- Voucher Information  -->
		  <capitec-modal type="text" header="Voucher Information">
			<capitec-group slot="body" layout="grid" gap="clear">
			  <div row="1" column="1">
				<capitec-label type="strong" label="Serial Number:"></capitec-label>
				<capitec-label type="strong" label="Issue date"></capitec-label>
				<capitec-label type="strong" label="Expiry date"></capitec-label>
				<capitec-label
				  type="strong"
				  label="Amount (in cents)"
				></capitec-label>
				<capitec-label type="strong" label="Status"></capitec-label>
				<capitec-label type="strong" label="Type"></capitec-label>
			  </div>
			  <div row="1" column="2">
				<capitec-label
				  type="strong"
				  label="${voucherInfo.serialNumber || `No Serial found`}"
				></capitec-label>
				<capitec-label
				  type="strong"
				  label="${voucherInfo.issueDate ? formatDateAndTime(voucherInfo.issueDate) : `-`}"
				></capitec-label>
				<capitec-label
				  type="strong"
				  label="${voucherInfo.expiryDate ? formatDateAndTime(voucherInfo.expiryDate) : `-`}"
				></capitec-label>
				<capitec-label
				  type="strong"
				  label="${voucherInfo.amount}"
				></capitec-label>
				<capitec-label
				  type="strong"
				  label="${voucherInfo.status || `-`}"
				></capitec-label>
				<capitec-label
				  type="strong"
				  label="${voucherInfo.voucherType || `-`}"
				></capitec-label>
			  </div>
			  <div row="2" colspan="4">
				<hr style="border-bottom: none;" />
			  </div>
			  <div
				row="3"
				column="1"
				style="margin-bottom: 10px; font-weight: bold;"
			  >
				<!-- Voucher History  -->
				<capitec-label
				  type="subtitle"
				  label="Voucher History"
				></capitec-label>
			  </div>
			  ${voucherHistory?.length !== 0
				? html` <div row="4" colspan="4" column="1">
					<capitec-table .items="${voucherHistory}">
					  <capitec-table-column
						label="MSISDN"
						field="msisdn"
					  ></capitec-table-column>
					  <capitec-table-column
						label="Network"
						.renderer="${() => `Capitec Connect`}"
					  ></capitec-table-column>
					  <capitec-table-column
						label="Timestamp"
						.renderer="${(item) => formatDateAndTime(item.statusDate)}"
					  ></capitec-table-column>
					  <capitec-table-column
						label="Status"
						.renderer="${(item) => item.status ? item.status : "-"}"
					  ></capitec-table-column>
					</capitec-table>
				  </div>`
				: html`
					<div row="4" column="1">
					  <capitec-label
						type="strong"
						label="No history to display"
					  ></capitec-label>
					</div>
				  `}
			  <div row="7" column="1" colspan="4">
				<hr style="border-bottom: none;" />
			  </div>
			</capitec-group>
	
			<capitec-button
			  slot="footer"
			  type="primary"
			  label="Close"
			  @click="${() => (this.showVoucherModal = false)}"
			></capitec-button>
		  </capitec-modal>`;
	}

	_renderAdvanceBalanceModal() {
		var today = new Date();
		today = today.toISOString().split('T')[0];

		return html`
		<capitec-modal type="text" header="Advance Balance">
			${!this.advanceBalances.length ? html`
			<capitec-group slot="body" layout="grid" gap="clear">
				<div row="1" column="1">
					<capitec-label type="strong" label="Advances balance not available"></capitec-label>
				</div>
			</capitec-group>
			` : ``}
			${this.advanceBalances.map(ab => html`
				<capitec-group slot="body" layout="grid" gap="clear">
					<div row="1" column="1" colspan="2">
						<capitec-label type="strong" label="${ab.msisdn}"></capitec-label>
					</div>
					<div row="2" column="1">
						<capitec-label label="Qualify"></capitec-label>
						<capitec-label label="Available" type="strong"></capitec-label>
						<capitec-label label="Taken"></capitec-label>
						<capitec-label label="Fee"></capitec-label>
						<capitec-label label="Total Outstanding" type="strong"></capitec-label>
						<capitec-label label="Overdue"></capitec-label>
						<capitec-label label="Status"></capitec-label>
						${ab.nextPaymentDate && html`
							<capitec-label label="Next payment date"></capitec-label>
						`}
					</div>
					<div row="2" column="2">
						<capitec-label label="R${parseFloat(ab.qualifyingLoanAmount).toFixed(2)}"></capitec-label>
						<capitec-label label="R${parseFloat(ab.availableBalance).toFixed(2)}" type="strong"></capitec-label>
						<capitec-label label="R${parseFloat(ab.totalOutstandingAdvanceBalance).toFixed(2)}"></capitec-label>
						<capitec-label label="R${parseFloat(ab.totalOutstandingFeeBalance).toFixed(2)}"></capitec-label>
						<capitec-label label="R${parseFloat(ab.totalOutstandingBalance).toFixed(2)}" type="strong"></capitec-label>
						<capitec-label label="${ab.nextPaymentDate && compareDates(ab.nextPaymentDate, today) < 1 ? 'YES' : '--'}"></capitec-label>
						<capitec-label label="${ab.status || '--'}"></capitec-label>
						${ab.nextPaymentDate && html`
							<capitec-label label="${ab.nextPaymentDate}"></capitec-label>
						`}
					</div>

					<div row="3" column="1" colspan="2">
						<hr style="border-bottom: none;">
					</div>
				</capitec-group>`
			)};

			<capitec-button slot="footer" type="primary" label="Close" @click="${() => { this.advanceBalances = []; this.advanceBalancePopupOpen = false }}"></capitec-button>
		</capitec-modal>`;
	}

	_renderVoucherSerialModal() {
		return html`
			<capitec-modal type="form" header="Voucher Information">
				<capitec-content-box
					slot="body"
					layout="flex"
					style="min-height:300px;"
				>
					<h3>Serial Number</h3>
					<capitec-text-field
						@key-input="${(e) => {
				this.serialNumber = e.detail.new;
				this.requestUpdate();
			}}"
						maxLength="50"
					>
					</capitec-text-field>
				</capitec-content-box>

				<capitec-button
					slot="footer"
					type="secondary"
					label="Cancel"
					@click="${() => {
			this.serialNumber = ``;
				this.showVoucherInformationModal = false;
			}}"
				></capitec-button>

				${this.serialNumber?.length > 0
				? html`<capitec-button
							slot="footer"
							type="primary"
							label="Confirm"
							@click="${() => this._handleVoucherInfoConfirm(this.serialNumber)}"
					></capitec-button>`
				: html`<capitec-button
							slot="footer"
							type="primary"
							label="Confirm"
							disabled
					></capitec-button>`}
			</capitec-modal>
		`;
	}

	_renderErrorModal() {
		return html`
			<capitec-modal type="alert" header="Error">
				<div slot="body">${this.errorMessage}</div>
				<capitec-button
					slot="footer"
					type="primary"
					label="OK"
					@click="${() => {
				this.showVoucherModal = false;
				this.showErrorModal = false;
			}}"
				></capitec-button>
			</capitec-modal>
		`;
	}

	_renderIcon() {
		return html`
				<img src="/images/liveBetter/capitec-connect-white.svg"/>`;
	}

	/* RENDERS:end */
}

customElements.define(`horizon-capitec-connect-agent-advances-repayments`, CapitecConnectAgentAdvancesRepayments);
