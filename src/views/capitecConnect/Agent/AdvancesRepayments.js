import { css, html } from 'platform/elements';
import { CapitecConnectService } from 'app/services/CapitecConnectService';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatDate, getTimeFromDate, compareDates, getDateInPast, sortObjectsByDateDescending, formatCellphoneNumber, isArray, isJson, toTitleCase, formatAmount } from 'app/utils/capitecConnectUtils';

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
			{ value: `transactionReference`, text: `Transaction Reference` }
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

		this.selectedAdvanceView = null;

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
			selectedAdvanceView: { type: Object },
			activeFilters: { type: Object },
			showTable: { type: Boolean },
			callerInformation: { type: Object },
			clientCif: { type: String },
			searchValue: { type: String }
		};
	}

	static get styles() {
		return [
			super.styles,
			css`
				:host > .wrapper > ::slotted(:not(capitec-spacer)) {
					flex: 1;
				}
			`
		];
	}

	_initialise() {
		// this.clientCif = "386017913";

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
			console.log(error);

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

	onFilter() {
		this.showTable = false;
		// this.requestUpdate();

		setTimeout(() => {
			this.showTable = true;
			this.requestUpdate();
		}, 100);
	}

	dateRangeHandler(e) {
		var from = e.detail.new.startDate?.split('T')[0] || null;
		var to = e.detail.new.endDate?.split('T')[0] || null;

		if (from !== null && to !== null) {
			this.activeFilters.dateRange = {
				from,
				to
			}

			return this.onFilter();
		}

		return null;
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
						type="range"
						mode="date"
						startDate="${this.activeFilters.dateRange.from}"
 						endDate="${this.activeFilters.dateRange.to}"
 						maxDate="${getDateInPast(0)}"
						inputType="calendar"
						outputType="string"
						@value-change="${this.dateRangeHandler}">
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
		let statusOfTransaction = ``;
		let transactionCode = item.transactionReference || `-`;
		let typeOfRecharge = item.type;
		let advanceAmountPaid = `R${parseFloat(item.transactions[0].advanceAmountPaid).toFixed(2)}` || `R0.00`;
		let transactionDate = `-`;
		let account = `-`;
		let airtimeSurplus = `-`;

		if (item.transactions.length > 0) {
			transactionDate = formatDate(item.transactions[0].transactionDateTime) + ` ` + getTimeFromDate(item.transactions[0].transactionDateTime);
			account = item.transactions[0].accountNumber;
			statusOfTransaction = item.transactions[0].status;
		}

		let postingDate = item.friendlyDate;

		if (item.recharges.length > 0) {
			product = product ? product : item.recharges[0].bundleType;
			airtimeSurplus = `R${parseFloat(item.recharges[0].quantity).toFixed(2)}`; // the recharge that occurred is the surplus of airtime.
		}

		product = toTitleCase(product);
		typeOfRecharge = toTitleCase(typeOfRecharge.replace("_", " "));
		statusOfTransaction = toTitleCase(statusOfTransaction);

		return html`
			<capitec-spacer></capitec-spacer>

			<capitec-group layout="grid" gap="clear">
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
					<capitec-label type="strong" label="${statusOfTransaction}"></capitec-label>
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
					<capitec-label label="Account:"></capitec-label>
					<capitec-label type="strong" label="${account}"></capitec-label>
				</div>

				<div row="4" column="1" colspan="4">
					<capitec-label label="Airtime Surplus:"></capitec-label>
					<capitec-label type="strong" label="${airtimeSurplus}"></capitec-label>
				</div>

				<div row="5" column="1" colspan="4">
					<capitec-spacer></capitec-spacer>
				</div>

				<div row="5" column="1" colspan="4" style="text-align: right; --theme-hyperlink-color: #009DE0; border-top: var(--theme-data-table-border, 1px solid #E1E1E1);">
					<capitec-hyperlink
						style="margin-right: 16px;
						margin-top: 10px"
						label="Advance Status"
						@click="${() => { this.selectedAdvanceView = item; }}">
					</capitec-hyperlink>
				</div>
			</capitec-group>
		`;
	}

	_renderAdvanceStatusModal() {
		let item = this.selectedAdvanceView;

		let product = item.bundleType,
			productId = `-`,
			type = item.type,
			statusOfRecharge = `-`,
			airtimeSurplus = `-`,
			advanceRepayment = `-`,
			account = `-`;

		if (item.transactions.length > 0) {
			statusOfRecharge = item.transactions[0].status;
			product = product ? product : item.transactions[0].bundleType;
			account = item.transactions[0].accountNumber;

			advanceRepayment = `R${parseFloat(item.transactions[0].advanceAmountPaid).toFixed(2)}`;
		}

		if (item.recharges.length > 0) {
			product = product ? product : item.recharges[0].bundleType;
			productId = item.recharges[0].productId ? item.recharges[0].productId : productId;

			airtimeSurplus = `R${parseFloat(item.recharges[0].quantity).toFixed(2)}`; // the recharge that occurred is the surplus of airtime.
		}

		statusOfRecharge = toTitleCase(statusOfRecharge);
		product = toTitleCase(product);

		return html`
		<capitec-modal type="form" header="Advance Status">
			<capitec-group slot="body" layout="grid" gap="clear">
				<div row="1" column="1">
					<capitec-label type="strong" label="Status: ${statusOfRecharge}"></capitec-label>
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
			</capitec-group>

			<capitec-button slot="footer" type="primary" label="Close" @click="${() => { this.selectedAdvanceView = null; }}"></capitec-button>
		</capitec-modal>`;
	}

	_renderIcon() {
		return html`
				<img src="/images/liveBetter/capitec-connect-white.svg"/>`;
	}

	/* RENDERS:end */
}

customElements.define(`horizon-capitec-connect-agent-advances-repayments`, CapitecConnectAgentAdvancesRepayments);
