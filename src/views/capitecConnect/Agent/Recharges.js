import { css, html } from "platform/elements";
import { CapitecConnectService } from "app/services/CapitecConnectService";
import { ViewBase } from "app/views/common/ViewBase";
import { DateTime } from "luxon";
import {
  compareDates,
  convertRandToCents,
  formatAmount,
  formatCellphoneNumber,
  formatDate,
  formatDateAndTime,
  getDateInPast,
  getTimeFromDate,
  isArray,
  isJson,
  sortObjectsByDateDescending,
  toTitleCase,
} from "app/utils/capitecConnectUtils";

/**
 * Capitec Connect teamleader View
 *
 * Events Raised
 * -------------
 * -
 *
 * @export
 * @class CapitecConnectAgentRecharges
 */
export class CapitecConnectAgentRecharges extends ViewBase {
  // --------------
  // INITIALISATION
  // --------------

  constructor() {
    super();

    this.capitecConnectService = new CapitecConnectService(() =>
      super._toggleBusyFlag()
    );

    // Static variables
    this.searchTypes = [
      { value: `msisdn`, text: `MSISDN` },
      { value: `accountNumber`, text: `Account Number` },
      { value: `amount`, text: `Amount` },
      // { value: `transactionReference`, text: `Transaction Reference` }
    ];

    this.pagingRows = [10, 20, 50];
    this.numOfPagingRows = 10;
    this.currentPageIndex = 1;

    // State variables
    this.searchValue = ``;
    this.availableBundleFilters = [`All`, `Airtime`, `Minutes`, `Data`, `SMS`];
    this.activeFilters = {
      searchType: this.searchTypes[0],
      searchValue: ``,
      dateRange: {
        from: getDateInPast(30),
        to: getDateInPast(0),
      },
      bundleType: [this.availableBundleFilters[0]],
    };

    this.serialNumber = ``;
    this.selectedReversal = null;
    this.showVoucherModal = false;
    this.showErrorModal = false;
    this.voucherInformationData = null;
    this.voucherHistoryData = null;
    this.selectedRechargeView = null;
    this.reversalAction = null;
    this.showConfirmModal = false;
    this.showSuccessModal = false;
    this.showFailureModal = false;
    this.showTable = false;
    this.voucherInfoLoading = false;
    this.voucherHistoryLoading = false;
    this.reason = null;
    this.comment = ``;
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
      selectedReversal: { type: Object },
      voucherInformationView: { type: Object },
      selectedRechargeView: { type: Object },
      showConfirmModal: { type: Boolean },
      showVoucherModal: { type: Boolean },
      showErrorModal: { type: Boolean },
      showSuccessModal: { type: Boolean },
      showFailureModal: { type: Boolean },
		showVoucherInformationModal: { type: Boolean },
      activeFilters: { type: Object },
      showTable: { type: Boolean },
      voucherHistoryLoading: { type: Boolean },
      voucherInfoLoading: { type: Boolean },
      reason: { type: Object },
      comment: { type: String },
      callerInformation: { type: Object },
      clientCif: { type: String },
      searchValue: { type: String },
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

  _initialise() {
	  //   this.clientCif = `030530180`; // TODO: comment out when done with dev: - Transaction Type:Voucher
      //   this.clientCif = `281783047`; // TODO: comment out when done with dev: - Transaction Type:Account

    this.showTable = true;
  }

	_handleVoucherInfoConfirm(serial) {
		if (serial === ``) {
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
      const response = await this.capitecConnectService.getVoucherInformation(
        voucherSerialNumber
      );
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
      console.error(
        `Error fetching voucher information (bluelabel api down):`,
        error
      );
      this.showErrorModal = true;
      this.errorMessage = `Unable to retrieve the voucher information. Please try again later.`;
      this.requestUpdate();
    }
  }

  async _getVoucherHistory(voucherSerialNumber) {
    try {
      const response = await this.capitecConnectService.getVoucherHistory(
        voucherSerialNumber
      );
      if (response.succeeded) {
        this.voucherHistoryData = response.result;
        this.voucherHistoryLoading = false;
        this.requestUpdate();
        this.showVoucherModal = true;
      } else {
        this.voucherHistoryLoading = false;
        console.error(`Failed to get voucher history`);
        this.showErrorModal = true;
        this.errorMessage = `Failed to get voucher history`;
        this.requestUpdate();
      }
    } catch (error) {
      this.voucherHistoryLoading = false;
      console.error(
        `Error fetching voucher history (bluelabel api down):`,
        error
      );
      this.showErrorModal = true;
      this.errorMessage = `Unable to retrieve the voucher history. Please try again later.`;
      this.requestUpdate();
    }
  }

  async _retrieveRecharges(renderSet) {
    this.renderSet = renderSet;
    this.numOfPagingRows = this.renderSet.numOfPagingRows;
    this.currentPageIndex = this.renderSet.currentPageIndex;
    this.searchValue = this.renderSet.searchValue;

    try {
      /*
				When a client has called in. We get their CIF number. i.e. If they are "connected" to Horizon
			*/
      const filters = this.activeFilters;

      if (this.clientCif) {
        filters.cif = this.clientCif;
      } else {
        return {
          pagedItems: [],
          totalCount: 0,
        };
      }

      const response = await this.searchRecharges(filters, `RECHARGE`);

      let r = response.result.content;

      r = r.map((e) => {
        e.friendlyDate = `${formatDate(e.transactionDate)} ${getTimeFromDate(
          e.transactionDate
        )}`;
        e.friendlyMsisdn = formatCellphoneNumber(e.msisdn);

        e.recharges =
          e.recharges.length > 0
            ? sortObjectsByDateDescending(e.recharges, `transactionDateTime`)
            : e.recharges;
        e.transactions =
          e.transactions.length > 0
            ? sortObjectsByDateDescending(e.transactions, `transactionDateTime`)
            : e.transactions;

        return e;
      });

      response.result.content = r;

      this.showTable = response.result.totalElements !== 0;

      return {
        pagedItems: response.result?.content || [],
        totalCount: response.result.totalElements, // for pagination reasons this is not the returned resultset's length
      };
    } catch (error) {
      this.showTable = false;

      if (
        this.activeFilters.searchType.value === `msisdn` &&
        this.activeFilters.searchValue.trim() !== `` &&
        this.clientCif
      ) {
        alert(
          `Error: ` +
            `The provided MSISDN [${this.activeFilters.searchValue.trim()}] is not owned by this client [cif ${
              this.clientCif
            }]`
        );
      }

      return {
        pagedItems: [],
        totalCount: 0,
      };
    }
  }

  async _actionReversal() {
    try {
      const response = await this.capitecConnectService.escalateForReversal(
        this.selectedReversal.transactionReference,
        this.reason.value,
        this.comment
      );

      if (response.result.errorCode) {
        this.showSuccessModal = !response.succeeded;
        this.showFailureModal = response.succeeded;
      } else {
        this.showSuccessModal = response.succeeded;
        this.showFailureModal = !response.succeeded;
      }

      return response;
    } catch (error) {
      this.showSuccessModal = false;
      this.showFailureModal = true;

      return {};
    }
  }

  _filterClick(value) {
    const index = this.activeFilters.bundleType.findIndex(
      (item) => item === value
    );
    const bundleType = [...this.activeFilters.bundleType];

    // Un-Select
    if (index !== -1) {
      if (this.activeFilters.bundleType.length === 1) {
        // Auto to all
        this.activeFilters.bundleType = [`All`];
        this.onFilter();
        return;
      }

      bundleType.splice(index, 1);

      this.activeFilters.bundleType = bundleType;
      this.onFilter();
      return;
    }

    // Select
    if (value === `All`) {
      this.activeFilters.bundleType = [value];
    } else {
      if (value !== `All`) {
        // Check if all is selected
        const indexA = this.activeFilters.bundleType.findIndex(
          (item) => item === `All`
        );
        if (indexA > -1) {
          // All is selected
          bundleType.splice(indexA, 1);
        }
      }

      bundleType.push(value);
      this.activeFilters.bundleType = [...bundleType];
    }

    this.onFilter();
  }

  _isValidNumberFormat(val) {
    return /^27[0-9]{9}$/.test(val);
  }

  _filterSearchboxClick(value) {
    this.activeFilters.searchValue = ``;

    this.onFilter();
  }

  getPredefinedDateRanges() {
    return [
      {
        text: `Last 30 days`,
        value: { startDate: getDateInPast(30), endDate: getDateInPast(0) },
      },
      {
        text: `Last 60 days`,
        value: { startDate: getDateInPast(60), endDate: getDateInPast(0) },
      },
      {
        text: `Last 90 days`,
        value: { startDate: getDateInPast(90), endDate: getDateInPast(0) },
      },
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
      to: to.split(`T`)[0],
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

  _mobileTemplate() {
    this._webTemplate();
  }

  _webTemplate() {
    return html` ${this._render()} `;
  }

  /* RENDERS:start */
  _render() {
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
          ></capitec-search-field>

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
            data-automation-id="connect-history-date-filter"
          >
          </capitec-date-time-picker>

          <capitec-button
            type="primary"
            label="Search"
            @click="${() => this.onFilter()}"
          ></capitec-button>
        </capitec-button-bar>

        <capitec-button-bar align="left" class="no-border-top">
          <capitec-label type="strong" label="Bundle Types:"></capitec-label>
          ${this.availableBundleFilters.map((item) => {
            if (this.activeFilters?.bundleType.includes(item)) {
              return html`<capitec-chip
                closable
                label="${item}"
                @remove="${() => this._filterClick(item)}"
                @click="${() => this._filterClick(item)}"
              ></capitec-chip>`;
            }
            return html`<capitec-chip
              label="${item}"
              @click="${() => this._filterClick(item)}"
            ></capitec-chip>`;
          })}
          <capitec-spacer></capitec-spacer>
          <capitec-button
            align="right"
            type="primary"
            label="Voucher Information"
            @click="${() => (this.showVoucherInformationModal = true)}"
          ></capitec-button>
        </capitec-button-bar>

        <capitec-button-bar align="left">
          <capitec-label type="strong" label="Active Filters:"></capitec-label>
          ${this.activeFilters.searchValue
            ? html`<capitec-chip
                closable
                @remove="${this._filterSearchboxClick}"
                label="${this.activeFilters.searchType.text}: ${this
                  .activeFilters.searchValue}"
              ></capitec-chip>`
            : null}
          ${this.activeFilters.dateRange.to !== null &&
          this.activeFilters.dateRange.from !== null
            ? html`<capitec-chip
                label="${formatDate(
                  this.activeFilters.dateRange.from
                )} - ${formatDate(this.activeFilters.dateRange.to)}"
              ></capitec-chip>`
            : null}
          ${this.activeFilters.bundleType.map(
            (item) => html`<capitec-chip
              closable
              @remove="${() => this._filterClick(item)}"
              label="${item}"
              @click="${() => this._filterClick(item)}"
            ></capitec-chip>`
          )}
          <capitec-spacer></capitec-spacer>
        </capitec-button-bar>

        ${this.showTable
          ? html`
              <capitec-table
                style=""
                displayMode="Paging"
                groupField="month"
                numOfPagingRows="${this.numOfPagingRows}"
                pagingRows="[${this.pagingRows.join(`,`)}]"
                .dataHandler="${(renderSet) =>
                  this._retrieveRecharges(renderSet)}"
                expandable="right"
                .expandRenderer="${(item) => this._expandRenderer(item)}"
              >
                <capitec-table-column
                  label="Transaction Date"
                  field="friendlyDate"
                ></capitec-table-column>
                <capitec-table-column
                  label="Beneficiary Name"
                  field="recharges"
                  .renderer="${this._renderBeneficiaryName}"
                ></capitec-table-column>
                <capitec-table-column
                  label="Cellphone Number"
                  field="friendlyMsisdn"
                ></capitec-table-column>
                <capitec-table-column
                  label="Channel"
                  field="channel"
                  .renderer="${this._renderTag}"
                ></capitec-table-column>
                <capitec-table-column
                  label="Product"
                  .renderer="${this._renderProductName}"
                ></capitec-table-column>
                <capitec-table-column
                  label="Amount"
                  field="amount"
                  .renderer="${this._renderAmount}"
                ></capitec-table-column>
              </capitec-table>
            `
          : html`
              <capitec-table>
                <capitec-table-column
                  label="Transaction Date"
                ></capitec-table-column>
                <capitec-table-column
                  label="Beneficiary Name"
                ></capitec-table-column>
                <capitec-table-column
                  label="Cellphone Number"
                ></capitec-table-column>
                <capitec-table-column label="Channel"></capitec-table-column>
                <capitec-table-column label="Product"></capitec-table-column>
                <capitec-table-column label="Amount"></capitec-table-column>
              </capitec-table>
              <capitec-content-box>
                <capitec-label
                  align="center"
                  type="default"
                  label="No recharge data found."
                ></capitec-label>
              </capitec-content-box>
            `}
      </capitec-content-box>

      ${this.showErrorModal ? this._renderErrorModal() : ``}
      ${this.selectedRechargeView ? this._renderRechargeStatusModal() : null}
      ${this.selectedReversal && this._renderReversalModal()}
      ${this.showSuccessModal ? this._renderSuccessModal() : ``}
      ${this.showFailureModal ? this._renderFailureModal() : ``}
      ${this.showConfirmModal ? this._renderConfirmModal() : ``}
      ${this.showVoucherModal ? this._renderVoucherInformationModal() : null}
      ${this.showVoucherInformationModal
			? this._renderVoucherSerialModal()
        : ``}
    `;
  }

  _renderTag(item, fieldName, value) {
    return html`<capitec-tag
      label="${value.toUpperCase()}"
      type="info"
    ></capitec-tag>`;
  }

  _renderBeneficiaryName(item, fieldName, value) {
    return value[0]?.beneficiaryName;
  }

  _renderProductName(item, fieldName, value) {
    let product = item.bundleType;

    if (item.recharges.length) {
      product = item.recharges[0].bundleType;
    }

    return product;
  }

  _renderAmount(item, fieldName, value) {
    return formatAmount(value);
  }

  _expandRenderer(item) {
    const sourceOfFunds =
      item.transactions?.[0]?.sourceOfFunds === `BANK_ACCOUNT`
        ? `Account`
        : `Voucher`;
    const voucherSerialNumber = item.transactions?.[0]?.voucherSerialNumber;
    let accountNumber = `-`;
    const channel = toTitleCase(item.channel);
    let journalNumber = `-`;
    let transactionDate = item.transactionDate;
    let processedDate = `-`;
    let product = item.bundleType;
    let statusOfRecharge = ``;
    const transactionCode = item.transactionReference || `-`;
    let typeOfRecharge = ``;
    let transactionType = `Recharge`;

    const theRecharge = item.recharges.length ? item.recharges[0] : null;

    if (isJson(theRecharge)) {
      product = product ? product : theRecharge.bundleType;
      processedDate = theRecharge.transactionDateTime;
      statusOfRecharge = theRecharge.status;
      typeOfRecharge = theRecharge.type;
    }

    const theTransaction = item.transactions.length
      ? item.transactions[0]
      : null;

    if (isJson(theTransaction)) {
      typeOfRecharge = theTransaction.type;
      transactionDate = theTransaction.transactionDateTime;
      accountNumber = theTransaction.accountNumber;
      journalNumber = theTransaction.journalReference || journalNumber;
      statusOfRecharge = theTransaction.status;

      transactionType =
        theTransaction.type.toUpperCase().indexOf(`REVERSAL`) > -1
          ? `Reversal`
          : transactionType;
    }

    product = toTitleCase(product);

    transactionDate = transactionDate
      ? `${formatDate(transactionDate)} ${getTimeFromDate(transactionDate)}`
      : transactionDate;
    processedDate =
      processedDate !== `-`
        ? `${formatDate(processedDate)} ${getTimeFromDate(processedDate)}`
        : processedDate;

    typeOfRecharge = toTitleCase(typeOfRecharge);
	  const loading = this.voucherHistoryLoading || this.voucherInfoLoading;

    return html`
      <capitec-spacer></capitec-spacer>

      <capitec-group layout="grid" gap="clear">
	  ${loading
			? html`<capitec-loading-indicator
			data-automation-id="app-shell-loading-indicator"
		  ></capitec-loading-indicator>`
			: null}
        <div column="1" row="1" colspan="4">
          <capitec-label label="Description:"></capitec-label>
          <capitec-label
            type="strong"
            label="${channel.toUpperCase()} ${product} ${typeOfRecharge} Capitec Connect"
          ></capitec-label>
        </div>

        <div row="2" column="1">
          <capitec-label label="Product:"></capitec-label>
          <capitec-label type="strong" label="${product}"></capitec-label>
        </div>
        <div row="2" column="2">
          <capitec-label label="Product Name:"></capitec-label>
          <capitec-label
            type="strong"
            label="${item.productName ? item.productName : `-`}"
          ></capitec-label>
        </div>
        <div row="2" column="3">
          <capitec-label label="Transaction Type:"></capitec-label>
          <capitec-label
            type="strong"
            label="${typeOfRecharge}"
          ></capitec-label>
        </div>
        <div row="2" column="4">
          <capitec-label label="Transaction Status:"></capitec-label>
          <capitec-label
            type="strong"
            label="${statusOfRecharge}"
          ></capitec-label>
        </div>

        <div row="3" column="1">
          <capitec-label label="Account:"></capitec-label>
          <capitec-label type="strong" label="${accountNumber}"></capitec-label>
        </div>
        <div row="3" column="2">
          <capitec-label label="Transaction Date:"></capitec-label>
          <capitec-label
            type="strong"
            label="${transactionDate}"
          ></capitec-label>
        </div>
        <div row="3" column="3">
          <capitec-label label="Processed Date:"></capitec-label>
          <capitec-label type="strong" label="${processedDate}"></capitec-label>
        </div>
        <div row="3" column="4">
          <capitec-label label="Transaction Code:"></capitec-label>
          <capitec-label
            type="strong"
            label="${transactionCode}"
          ></capitec-label>
        </div>

        <div row="4" column="1">
          <capitec-label label="Journal Number:"></capitec-label>
          <capitec-label type="strong" label="${journalNumber}"></capitec-label>
        </div>

        <div row="4" column="2">
          <capitec-label label="Serial Number:"></capitec-label>
          <capitec-label
            type="strong"
            label="${voucherSerialNumber ?? `-`}"
          ></capitec-label>
        </div>

        <div row="4" column="3">
          <capitec-label label="Source of funds:"></capitec-label>
          <capitec-label type="strong" label="${sourceOfFunds}"></capitec-label>
        </div>

        <div row="5" column="1" colspan="4">
          <capitec-spacer></capitec-spacer>
        </div>

        <div
          row="6"
          column="1"
          colspan="4"
          style="text-align: right; --theme-hyperlink-color: #009DE0; border-top: var(--theme-data-table-border, 1px solid #E1E1E1);"
        >
        ${voucherSerialNumber
        ? html`
            <capitec-hyperlink
               style="margin-right: 16px; margin-top: 10px;"
               label="Voucher Information"
               @click="${() => this._handleVoucherInfoConfirm(voucherSerialNumber)}"
               >
            </capitec-hyperlink>
            `
        : html`
            <capitec-hyperlink
               style="margin-right: 16px; margin-top: 10px;"
               label="${transactionType} Status"
               @click="${() => {
                this.selectedRechargeView = item;
            }}"
               >
            </capitec-hyperlink>
            ${item.reversible
                ? html`
            <capitec-hyperlink
               style="margin-top: 10px;"
               label="Escalate For Reversal"
               @click="${() => {
                        this.selectedReversal = item;
                    }}"
               >
            </capitec-hyperlink>
            `
                : html`
            <capitec-hyperlink
               style="margin-top: 10px;"
               label="Escalate For Reversal"
               disabled
               >
            </capitec-hyperlink>
            `}
            `}
        </div>
      </capitec-group>
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

  _renderRechargeStatusModal() {
    const item = this.selectedRechargeView;

    let product = item.bundleType,
      productId = `-`,
      type = `-`,
      errorType = null,
      statusOfRecharge = `-`,
      transactionType = `Recharge`,
      statusReason = null,
      reversalReason = null,
      processedDate = ``,
      transactionDuration = {
        start: {
          date: ``,
          time: ``,
        },
        end: {
          date: ``,
          time: ``,
        },
      };

    const theRecharge = item.recharges.length ? item.recharges[0] : null;
    const theTransaction = item.transactions.length
      ? item.transactions[0]
      : null;

    if (isJson(theRecharge)) {
      product = product ? product : theRecharge.bundleType;
      statusOfRecharge = theRecharge.status
        ? theRecharge.status
        : statusOfRecharge;
      type = theRecharge.type ? theRecharge.type : type;
      productId = theRecharge.productId ? theRecharge.productId : productId;
      processedDate = `${formatDate(
        theRecharge.transactionDateTime
      )} ${getTimeFromDate(theRecharge.transactionDateTime)}`;
    }

    if (isJson(theTransaction)) {
      type = theTransaction.type || type;
      statusOfRecharge = theTransaction.status || statusOfRecharge;
      product = product ? product : theRecharge.bundleType;
      statusReason = theTransaction.statusReason || statusReason;
      reversalReason = theTransaction.reversalReason || reversalReason;

      if (theTransaction.type.toUpperCase().indexOf(`REVERSAL`) > -1) {
        transactionType = `Reversal`;

        statusReason = reversalReason || statusReason;
      }

      switch (true) {
        case item.transactions.length === 0 && item.recharges.length === 0: // no transactions
        case theTransaction.type.toUpperCase().indexOf(`FAILED`) > -1: // transaction failed
          errorType = `TRANSACTION_FAILURE`;
          break;
        case theTransaction.type.toUpperCase().indexOf(`REVERSAL`) > -1 &&
          theTransaction.status.toUpperCase() === `SUCCESSFUL`:
          errorType = `RECHARGE_REVERSED`;
          break;
        case theTransaction.type.toUpperCase().indexOf(`PENDING`) > -1: // pending transaction
          errorType = `REVERSAL_PENDING`;
          break;
        default:
          break;
      }
    }

    if (item.transactions.length > 0) {
      transactionDuration.start.date =
        item.transactions.length > 1
          ? formatDate(
              item.transactions[item.transactions.length - 1]
                .transactionDateTime
            )
          : transactionDuration.start.date;
      transactionDuration.start.time =
        item.transactions.length > 1
          ? getTimeFromDate(
              item.transactions[item.transactions.length - 1]
                .transactionDateTime
            )
          : transactionDuration.start.time;

      transactionDuration.end.date = formatDate(
        item.transactions[0].transactionDateTime
      );
      transactionDuration.end.time = getTimeFromDate(
        item.transactions[0].transactionDateTime
      );
    }

    product = toTitleCase(product);

    return html` <capitec-modal type="form" header="${transactionType} Status">
      <capitec-group slot="body" layout="grid" gap="clear">
        <div row="1" column="1">
          <capitec-label
            type="strong"
            label="${statusOfRecharge}"
          ></capitec-label>
          <capitec-label
            type="strong"
            label="${product} ${toTitleCase(type)}"
          ></capitec-label>
        </div>
        <div row="1" column="2">
          <br />
          <br />
        </div>

        <div row="2" column="1">
          <capitec-label label="Message ID"></capitec-label>
          <capitec-label label="Time"></capitec-label>
          <capitec-label label="Origin"></capitec-label>
        </div>
        <div row="2" column="2">
          <capitec-label label="${item.transactionReference}"></capitec-label>
          <capitec-label label="${processedDate}"></capitec-label>
          <capitec-label label="${item.cif}"></capitec-label>
        </div>

        <div row="3" column="1" colspan="2">
          <hr style="border-bottom: none;" />
        </div>

        <div row="4" column="1">
          <capitec-label label="Channel"></capitec-label>
          <capitec-label label="MSISDN"></capitec-label>
          <capitec-label label="MNO"></capitec-label>
          <capitec-label label="Product ID"></capitec-label>
          <capitec-label label="Product Name"></capitec-label>
          <capitec-label label="Product Type"></capitec-label>
          <capitec-label label="Request Amount"></capitec-label>
        </div>
        <div row="4" column="2">
          <capitec-label label="${item.channel.toUpperCase()}"></capitec-label>
          <capitec-label label="${item.friendlyMsisdn}"></capitec-label>
          <capitec-label label="Capitec Connect"></capitec-label>
          <capitec-label label="${productId}"></capitec-label>
          <capitec-label label="${item.productName}"></capitec-label>
          <capitec-label label="${product}"></capitec-label>
          <capitec-label label="${formatAmount(item.amount)}"></capitec-label>
        </div>

        ${errorType !== null
          ? html`
              <capitec-spacer></capitec-spacer>
              <div row="5" column="1">
                <capitec-label label="Error Type"></capitec-label>
                ${statusReason !== null
                  ? html`<capitec-label label="Error Message"></capitec-label>`
                  : ``}
              </div>
              <div row="5" column="2">
                <capitec-label label="${errorType}"></capitec-label>
                ${statusReason !== null
                  ? html`<capitec-label
                      label="${statusReason}"
                    ></capitec-label>`
                  : ``}
              </div>
              <capitec-spacer></capitec-spacer>
              <div row="6" column="1" colspan="2">
                ${transactionDuration.start.date ===
                transactionDuration.end.date
                  ? html`
                      <capitec-label
                        type="strong"
                        label="${transactionDuration.end.date}"
                      ></capitec-label>
                      <capitec-label
                        type="strong"
                        label="${transactionDuration.start.time ===
                        transactionDuration.end.time
                          ? ``
                          : `${transactionDuration.start.time} - `}${transactionDuration
                          .end.time}"
                      ></capitec-label>
                    `
                  : html`
                      <capitec-label
                        type="strong"
                        label="${transactionDuration.start
                          .date} ${transactionDuration.start
                          .time} - ${transactionDuration.end
                          .date} ${transactionDuration.end.time}"
                      ></capitec-label>
                    `}
              </div>
            `
          : ``}
        <div row="7" column="1" colspan="2">
          <hr style="border-bottom: none;" />
        </div>
      </capitec-group>

      <capitec-button
        slot="footer"
        type="primary"
        label="Close"
        @click="${() => {
          this.selectedRechargeView = null;
        }}"
      ></capitec-button>
    </capitec-modal>`;
  }

  _renderReversalModal() {
    return html`
      <capitec-modal type="form" header="Escalate for Reversal ">
        <capitec-content-box
          slot="body"
          layout="flex"
          style="min-height:300px;display: flex;flex-direction: column;gap: 1em;"
        >
          <capitec-label
            label="You are about to escalate this transaction to a Connect team lead for reversal."
          ></capitec-label>
          <capitec-label label="Choose a reason" type="title"></capitec-label>
          <capitec-select
            label="Choose a reason"
            .items="${[
              {
                label: `Product not received`,
                value: `Product not received.`,
              },
              {
                label: `Other`,
                value: `other`,
              },
            ]}"
            @value-change="${(e) => (this.reason = e.detail.new)}"
            display-field="label"
            id-field="value"
          >
          </capitec-select>
          <capitec-text-box
            label="Add description (optional) ${this.comment.length}/5000"
            @key-input="${(e) => (this.comment = e.detail.new)}"
            maxLength="50"
          >
          </capitec-text-box>
        </capitec-content-box>

        <capitec-button
          slot="footer"
          type="secondary"
          label="Cancel"
          @click="${() => {
            this.selectedReversal = null;
            this.reason = null;
            this.comment = ``;
          }}"
        ></capitec-button>
        ${this.reason?.value
          ? html`<capitec-button
              slot="footer"
              type="primary"
              label="Confirm"
              @click="${() => (this.showConfirmModal = true)}"
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

  _renderConfirmModal() {
    return html`
      <capitec-modal type="alert" header="Are you sure?">
        <div slot="body">
          Are you sure you want to escalate this transaction?
        </div>
        <capitec-button
          slot="footer"
          type="primary"
          @click="${() => {
            this._actionReversal();
            this.selectedReversal = null;
            this.showConfirmModal = false;
          }}"
          label="Yes"
        ></capitec-button>
        <capitec-button
          slot="footer"
          type="clear"
          @click="${() => (this.showConfirmModal = false)}"
          label="No"
        ></capitec-button>
      </capitec-modal>
    `;
  }

  _renderSuccessModal() {
    return html`
      <capitec-modal type="result" result="success" header="Success">
        <div slot="body">
          The transaction has been successfully escalated to the team lead.
        </div>
        <capitec-button
          slot="footer"
          type="clear"
          label="Done"
          @click="${() => {
            this.showSuccessModal = false;
            this.onFilter();
          }}"
        >
        </capitec-button>
      </capitec-modal>
    `;
  }

  _renderFailureModal() {
    return html`
      <capitec-modal type="result" result="error" header="Escalation Error">
        <div slot="body">
          The transaction could not be escalated at this time. Please try again
          later.
        </div>
        <capitec-button
          slot="footer"
          type="clear"
          label="Done"
          @click="${() => {
            this.showFailureModal = false;
            this.onFilter();
          }}"
        >
        </capitec-button>
      </capitec-modal>
    `;
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
          <!-- Text box for Serial Number -->
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

  _renderIcon() {
    return html` <img src="/images/liveBetter/capitec-connect-white.svg" />`;
  }

  /* RENDERS:end */
}

customElements.define(
  `horizon-capitec-connect-agent-recharges`,
  CapitecConnectAgentRecharges
);
