import { css, html } from 'platform/elements';
import { CapitecConnectService } from 'app/services/CapitecConnectService';
import { ViewBase } from '../../common/ViewBase';

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

		this.capitecConnectService = new CapitecConnectService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));

		// Static variables
		this.dateRanges = [
			{ value: `30`, text: `30 Days` },
			{ value: `60`, text: `60 Days` },
			{ value: `90`, text: `90 Days` }
		];

		this.pagingRows = [10, 20, 50];
		this.numOfPagingRows = 10;
		this.currentPageIndex = 1;

		this.availableBundleFilters = [`All`, `Airtime`, `Minutes`, `Data`, `SMS`];

		// State variables
		this.searchValue = ``;
		this.activeFilters = {
			selectedDate: this.dateRanges[0],
			searchValue: ``,
			bundleType: [`All`]
		};

		this.selectedReversal = null;
		this.selectedRechargeView = null;
		this.reversalAction = null;

		this.showConfirmModal = false;
		this.showSuccessModal = false;
		this.showFailureModal = false;

		this.showTable = false;

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
			selectedRechargeView: { type: Object },
			showConfirmModal: { type: Boolean },
			showSuccessModal: { type: Boolean },
			showFailureModal: { type: Boolean },
			activeFilters: { type: Object },
			showTable: { type: Boolean },
			reason: { type: Object },
			comment: { type: String },
			callerInformation: { type: Object },
			clientCif: { type: String },
			searchValue: { type: String }
		};
	}

	static get styles() {
		return [
			super.styles,
			css`
				.product-info{
					width: 100%;
					height: var(--horizon-panel-height, 888px);
				}
				.content{
					width: 100%;
					height: 788px;
				}
				capitec-title-bar {
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 12px 16px;
				}
				.transact {
					--theme-type-primary-background: linear-gradient(135deg, #126D9B 0%, #0985C5 54.69%, #298EA7 100%);
				}
				.save {
					--theme-type-primary-background: linear-gradient(135deg, #002A3F 0%, #00537D 52.97%, #024D73 100%);
				}
				.credit {
					--theme-type-primary-background: linear-gradient(90deg, #B62825 0%, #E61414 100%);
				}
				.insure {
					--theme-type-primary-background: linear-gradient(315deg, #70838C 0%, #667F8C 47.52%, #41525B 100%);
				}
				.liveBetter {
					--theme-type-primary-background: url(/images/liveBetter/lbb-bg-1092x64.png);
				}
				#id-more-info {
					margin: 43px auto 8px auto;
					color: #3A3A3A;
					font-size: 24px;
					font-weight: 600;
				}
				.insights-subtitle{
					color: #3A3A3A;
					font-size: 15px;
					line-height: 20px;
					text-align: center;
					max-width: 684px;
					margin-bottom: 32px;
				}
				.benefits-button {
					height: 48px;
					width: 146px;
					--theme-button-primary-border-width: 0px;
					--theme-button-line-height: 20px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-bottom: 14px;
				}
			`
		];
	}

	/* UTILITIES:start */
	formatDate(inputDate, options) {
		options = options || { day: `2-digit`, month: `short`, year: `numeric` };
		const date = new Date(inputDate);
		return date.toLocaleDateString(`en-za`, options);
	}

	getTimeFromDate(dateString) {
		const date = new Date(dateString);
		const hours = date.getHours().toString().padStart(2, `0`);
		const minutes = date.getMinutes().toString().padStart(2, `0`);
		const seconds = date.getSeconds().toString().padStart(2, `0`);
		return `${hours}:${minutes}:${seconds}`;
	}

	compareDates(dateStr1, dateStr2) {
		const date1 = new Date(dateStr1);
		const date2 = new Date(dateStr2);

		var result = null;
		
		switch (true) {
			case date1 < date2:
				result = -1;
				break;
			case date1 > date2:
				result = 1;
				break;
			default:
				result = 0;
				break;
		}

		return result;
	}

	getDateInPast(days) {
		const today = new Date();
		const pastDate = new Date(today);
		pastDate.setDate(today.getDate() - days);
		const year = pastDate.getFullYear();
		const month = String(pastDate.getMonth() + 1).padStart(2, `0`);
		const day = String(pastDate.getDate()).padStart(2, `0`);
		return `${year}-${month}-${day}`;
	}

	sortObjectsByDateDescending(array, dateKey) {
		return array.sort((a, b) => {
			const dateA = new Date(a[dateKey]);
			const dateB = new Date(b[dateKey]);
			return dateB - dateA;
		});
	}

	formatCellphoneNumber(cellphoneNumber, withoutSpaces = false) {
		cellphoneNumber = cellphoneNumber.replace(/\s/g, ``); // first remove the spaces

		if (cellphoneNumber.startsWith('0')) {
			// Replace the '0' with '27' using the replace method
			cellphoneNumber = cellphoneNumber.replace(/^0/, '27');
		}

		if (cellphoneNumber.length === 11) {
			cellphoneNumber = `${cellphoneNumber.substr(0, 2)} ${cellphoneNumber.substr(2, 2)} ${cellphoneNumber.substr(4, 3)} ${cellphoneNumber.substr(7, 4)}`;
		} else {
			// Handle invalid input here if necessary
			cellphoneNumber = ``;
		}

		if (withoutSpaces) {
			cellphoneNumber = cellphoneNumber.replace(/\s/g, ``);
		}

		return cellphoneNumber;
	}

	isArray(obj) {
		return obj !== null && typeof obj === `object` && obj.length; // arrays are objects and have length
	}

	isJson(obj) {
		return obj !== null && typeof obj === `object` && !obj.length; // json object have no length
	}

	toTitleCase(inputString) {
		return inputString.replace(/\w\S*/g, function (text) {
			return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
		});
	};
	/* UTILITIES:end */

	_errorHandler() {
		alert(`error`);
	}

	async _initialise() {
		// Remove before deploying.
		// if (!this.clientCif) {
		// 	this.clientCif = `123456789`;
		// }

		this.showTable = true;
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
			var filters = this.activeFilters;

			if (this.clientCif) {
				filters.cif = this.clientCif;
			} else {
				return {
					pagedItems: [],
					totalCount: 0
				};
			}

			const response = await this.searchRecharges(filters);

			var r = response.result.content;

			r = r.map(e => {
				e.friendlyDate = this.formatDate(e.transactionDate);
				e.friendlyMsisdn = this.formatCellphoneNumber(e.msisdn);

				e.recharges = e.recharges.length > 0 ? this.sortObjectsByDateDescending(e.recharges, 'transactionDateTime') : e.recharges;
				e.transactions = e.transactions.length > 0 ? this.sortObjectsByDateDescending(e.transactions, 'transactionDateTime') : e.transactions;

				e.successfulRecharge = null;
				e.successfulTransaction = null;
				e.reversedTransaction = null;
				e.pendingReversedTransaction = null;

				if (e.recharges.length > 0) {
					e.successfulRecharge = e.transactions.filter(t => t.type === `RECHARGE` && t.status === `SUCCESSFUL`);
					e.successfulRecharge = e.successfulRecharge.length ? e.successfulRecharge[0] : null;
				}

				if (e.transactions.length > 0) {
					e.successfulTransaction = e.transactions.filter(t => t.type === `RECHARGE` && t.status === `SUCCESSFUL`);
					e.successfulTransaction = e.successfulTransaction.length ? e.successfulTransaction[0] : null;

					e.reversedTransaction = e.transactions.filter(t => t.type === `RECHARGE_REVERSAL` && t.status === `SUCCESSFUL`);
					e.reversedTransaction = e.reversedTransaction.length ? e.reversedTransaction[0] : null;
				
					e.pendingReversedTransaction = e.transactions.filter(t => t.type === `RECHARGE_REVERSAL` && t.status === `PENDING`);
					e.pendingReversedTransaction = e.pendingReversedTransaction.length ? e.pendingReversedTransaction[0] : null;
				}

				if (
					(typeof e.successfulRecharge === 'undefined') // if no successful recharge
					|| (
						typeof e.successfulRecharge !== 'undefined' // successful recharge
						&& typeof e.reversedTransaction !== 'undefined' // successful reversal
						&& this.compareDates(e.successfulRecharge, e.reversedTransaction) < 1 // recharge is before the reversal
					) ||
					(e.recharges.length > 0 && e.transactions.length === 0) // successful recharge + no transaction
				) { // then we cannot reverse
					e.reversible = false;
				}

				return e;
			});

			response.result.content = r;

			return {
				pagedItems: response.result?.content || [],
				totalCount: response.result.totalElements // for pagination reasons this is not the returned resultset's length
			};
		} catch (error) {
			console.error(error);

			return {
				pagedItems: [],
				totalCount: 0
			};
		}
	}

	async _actionReversal() {
		try {
			const response = await this.actionReversal(this.selectedReversal, this.reason.value, this.comment);

			if (response.result.errorCode) {
				this.showSuccessModal = !response.succeeded;
				this.showFailureModal = response.succeeded;
			} else {
				this.showSuccessModal = response.succeeded;
				this.showFailureModal = !response.succeeded;
			}

			return response;
		} catch (error) {
			alert(`An error occurred while processing your request`);
			console.error(error);

			this.showSuccessModal = false;
			this.showFailureModal = true;

			return {};
		}
	}

	_filterClick(value) {
		let index = this.activeFilters.bundleType.findIndex(item => item === value);
		let bundleType = [...this.activeFilters.bundleType];

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
				let indexA = this.activeFilters.bundleType.findIndex(item => item === `All`);
				if (indexA > -1) {
					// All is selected
					bundleType.splice(indexA, 1);
				}
			} 
			
			bundleType.push(value);
			this.activeFilters.bundleType = [...bundleType];
		}

		this.onFilter();
		return;
	}

	_isValidNumberFormat(val) {
		return (/^27[0-9]{9}$/).test(val);
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

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._render()}
			${super._webTemplate()}
		`;
	}

	/* RENDERS:start */
	_render() {
		return html`
			<capitec-content-box noPadding style="width:CALC(var(--horizon-center-panel-width) - 30px); height:CALC(var(--horizon-panel-height) - 180px)" layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-button-bar>
					<capitec-search-field label="Search mobile number" 
					value="${this.activeFilters.searchValue}" 
					hint="e.g. 2784000000"
					@value-change="${(e) => { 
						this.activeFilters.searchValue = e.detail.new; 
						this.onFilter(); 
					}}" focussed></capitec-search-field>

					<capitec-select 
						label="Select date" 
						.items="${this.dateRanges}" 
						.value="${this.activeFilters.selectedDate}"
						@value-change="${(e) => { 
							this.activeFilters.selectedDate = e.detail.new; 
							this.onFilter(); 
						}}"
						display-field="text"
						id-field="value">
					</capitec-select>

					<capitec-spacer></capitec-spacer>

					${this.availableBundleFilters.map(item => {
						if (this.activeFilters?.bundleType.includes(item)) {
							return html`<capitec-chip closable label="${item}" @remove="${() => this._filterClick(item)}" @click="${() => this._filterClick(item)}"></capitec-chip>`;
						}

						return html`<capitec-chip label="${item}" @click="${() => this._filterClick(item)}"></capitec-chip>`;
					})}
				</capitec-button-bar>

				<capitec-button-bar>
					<capitec-label type="strong" label="Active Filters:"></capitec-label>
					${this.activeFilters.searchValue ? html`<capitec-chip closable @remove="${() => this._filterSearchboxClick(item)}" label="${this.activeFilters.searchValue}"></capitec-chip>` : null}
					${this.activeFilters.selectedDate && this.activeFilters.selectedDate.value !== `NonSelected` ? html`<capitec-chip label="${this.activeFilters.selectedDate.text}"></capitec-chip>` : null}
					${this.activeFilters.bundleType.map(item => html`<capitec-chip closable @remove="${() => this._filterClick(item)}" label="${item}" @click="${() => this._filterClick(item)}"></capitec-chip>`)}
					<capitec-spacer></capitec-spacer>
				</capitec-button-bar>

				${!this.showTable ? null : html`
				<capitec-table style="" 
						displayMode="Paging" 
						groupField="month"
						numOfPagingRows="${this.numOfPagingRows}"
						pagingRows="[${this.pagingRows.join(`,`)}]"
						.dataHandler="${(renderSet) => this._retrieveRecharges(renderSet)}"
						expandable="right" 
						.expandRenderer="${(item) => this._expandRenderer(item)}">
					<capitec-table-column label="Transaction Date" field="friendlyDate"></capitec-table-column>
					<capitec-table-column label="Beneficiary Name" field="recharges" .renderer="${this._renderBeneficiaryName}"></capitec-table-column>
					<capitec-table-column label="Cellphone Number" field="friendlyMsisdn"></capitec-table-column>
					<capitec-table-column label="Channel" field="channel" .renderer="${this._renderTag}"></capitec-table-column>
					<capitec-table-column label="Product" .renderer="${this._renderProductName}"></capitec-table-column>
					<capitec-table-column label="Amount" field="amount" ></capitec-table-column>
				</capitec-table>
				`}
			</capitec-content-box>

			${this.selectedRechargeView ? this._renderRechargeStatusModal() : null}
			${this.selectedReversal && this._renderReversalModal()}
			${this.showSuccessModal ? this._renderSuccessModal() : ``}
			${this.showFailureModal ? this._renderFailureModal() : ``}
			${this.showConfirmModal ? this._renderConfirmModal() : ``}
		`;
	}

	_renderTag(item, fieldName, value) {
		return html`<capitec-tag label="${value.toUpperCase()}" type="info"></capitec-tag>`;
	}

	_renderBeneficiaryName(item, fieldName, value) {
		return value[0]?.beneficiaryName;
	}

	_renderProductName(item, fieldName, value) {
		var product = item.bundleType;

		if (item.recharges.length) {
			product = item.recharges[0].bundleType;
		}

		return product;
	}

	_expandRenderer (item) {
		var accountNumber = `-`;
		var channel = this.toTitleCase(item.channel);
		var journalNumber = `-`;
		var postingDate = item.transactionDate;
		var processedDate = `-`;
		var product = item.bundleType;
		var statusOfRecharge = ``;
		var transferAccount = `-`;
		var transactionCode = item.transactionReference || `-`;
		var typeOfRecharge = ``;
		var isPending = false;

		var theRecharge = this.isJson(item.successfulRecharge) ? item.successfulRecharge : (item.recharges.length ? item.recharges[0] : null);

		if (this.isJson(theRecharge)) {
			product = product ? product : theRecharge.bundleType;
			postingDate = theRecharge.transactionDateTime;
			statusOfRecharge = theRecharge.status;
			typeOfRecharge = theRecharge.type
		}

		var theTransaction = this.isJson(item.successfulTransaction) ? item.successfulTransaction : (item.transactions.length ? item.transactions[0] : null);

		if (
			typeof item.pendingReversedTransaction !== 'undefined' // if a there is a pending reversal
			&& typeof item.reversedTransaction === 'undefined' // if there is no successful reversals
			&& typeof item.successfulTransaction !== `undefined` // if there was a successful transaction
			&& this.compareDates(item.pendingReversedTransaction, item.successfulTransaction) > 0 // if the pending reversal is after the success transaction
		) {
			theTransaction = item.pendingReversedTransaction;
		}

		if (this.isJson(theTransaction)) {
			typeOfRecharge = theTransaction.type;
			processedDate = theTransaction.transactionDateTime;
			accountNumber = theTransaction.accountNumber;
			journalNumber = theTransaction.journalReference;
			statusOfRecharge = theTransaction.status;

			isPending = statusOfRecharge.toLowerCase().includes('pending');
		}

		product = this.toTitleCase(product);

		if (statusOfRecharge !== ``) {
			statusOfRecharge = ` [${statusOfRecharge}]`;
		}

		postingDate = postingDate ? this.formatDate(postingDate) + ` ` + this.getTimeFromDate(postingDate) : postingDate;
		processedDate = processedDate !== `-` ? this.formatDate(processedDate) + ` ` + this.getTimeFromDate(processedDate) : processedDate;

		typeOfRecharge = this.toTitleCase(typeOfRecharge);

		return html`
			<capitec-spacer></capitec-spacer>

			<capitec-group layout="grid" gap="clear">
				<div column="1" row="1" colspan="4">
					<capitec-label type="strong" label="Description: ${channel.toUpperCase()} ${product} ${typeOfRecharge}${statusOfRecharge} Capitec Connect"></capitec-label>
				</div>

				<div column="1" row="2">
					<capitec-label label="Transaction Type:"></capitec-label>
					<capitec-label type="strong" label="${product} ${typeOfRecharge}${statusOfRecharge}"></capitec-label>
				</div>
				<div column="1" row="3">
					<capitec-label label="Transaction Code:"></capitec-label>
					<capitec-label type="strong" label="${transactionCode}"></capitec-label>
				</div>

				<div column="2" row="2">
					<capitec-label label="Account:"></capitec-label>
					<capitec-label type="strong" label="${accountNumber}"></capitec-label>
				</div>
				<div column="2" row="3">
					<capitec-label label="Processed Date:"></capitec-label>
					<capitec-label type="strong" label="${processedDate}"></capitec-label>
				</div>

				<div column="3" row="2">
					<capitec-label label="Transfer Account:"></capitec-label>
					<capitec-label type="strong" label="${transferAccount}"></capitec-label>
				</div>
				<div column="3" row="3">
					<capitec-label label="Includes VAT:"></capitec-label>
					<capitec-label type="strong" label="Yes"></capitec-label>
				</div>

				<div column="4" row="2">
					<capitec-label label="Posting Date:"></capitec-label>
					<capitec-label type="strong" label="${postingDate}"></capitec-label>
				</div>
				<div column="4" row="3">
					<capitec-label label="Journal Number:"></capitec-label>
					<capitec-label type="strong" label="${journalNumber}"></capitec-label>
				</div>

				<div column="1" row="5" colspan="4">
					<capitec-spacer></capitec-spacer>
				</div>

				<div column="1" row="6" colspan="4" style="text-align: right; --theme-hyperlink-color: #009DE0; border-top: var(--theme-data-table-border, 1px solid #E1E1E1);">
					<capitec-hyperlink
						style="margin-right: 16px;
						margin-top: 10px"
						label="${isPending ? 'Reversal' : 'Recharge'} Status"
						@click="${() => { this.selectedRechargeView = item; }}">
					</capitec-hyperlink>
					${!item.reversible 
					? html`<capitec-hyperlink
						style="margin-top: 10px;"
						label="Escalate For Reversal"
						disabled>
					</capitec-hyperlink>`
					: html`<capitec-hyperlink
						style="margin-top: 10px;"
						label="Escalate For Reversal"
						@click="${() => { this.selectedReversal = item; }}">
					</capitec-hyperlink>`
					}
				</div>
			</capitec-group>
		`;
	}

	_renderRechargeStatusModal() {
		var item = this.selectedRechargeView;

		var product = item.bundleType,
			productId = `-`,
			type = ``,
			messageId = `-`,
			startTime = this.getTimeFromDate(item.transactionDate),
			endTime = ``,
			merchantId = `-`,
			quantityMeasurement = ``,
			errorType = `-`,
			errorMessage = `-`,
			statusOfRecharge = ``,
			isPending = false;

		var theRecharge = this.isJson(item.successfulRecharge) ? item.successfulRecharge : (item.recharges.length ? item.recharges[0] : null);
		var theTransaction = this.isJson(item.successfulTransaction) ? item.successfulTransaction : (item.transactions.length ? item.transactions[0] : null);

		if (this.isJson(theRecharge)) {
			product = product ? product : theRecharge.bundleType;
			statusOfRecharge = theRecharge.status;
			type = theRecharge.type;
			quantityMeasurement = theRecharge.quantityMeasurement;
			errorMessage = theRecharge.statusReason;
			productId = theRecharge.productId;
		}

		if (
			typeof item.reversedTransaction !== 'undefined' // if there is a successful reversal
			&& typeof item.successfulTransaction !== `undefined` // if there was a successful transaction
			&& this.compareDates(item.reversedTransaction, item.successfulTransaction) > 0 // if the reversal is after the successful transaction
		) {
			theTransaction = item.reversedTransaction;
		}

		if (
			typeof item.pendingReversedTransaction !== 'undefined' // if a there is a pending reversal
			&& typeof item.reversedTransaction === 'undefined' // if there is no successful reversals
			&& typeof item.successfulTransaction !== `undefined` // if there was a successful transaction
			&& this.compareDates(item.pendingReversedTransaction, item.successfulTransaction) > 0 // if the pending reversal is after the success transaction
		) {
			theTransaction = item.pendingReversedTransaction;
		}

		if (this.isJson(theTransaction)) {
			type = theTransaction.type;
			statusOfRecharge = theTransaction.status;
			errorMessage = theTransaction.statusReason;
			endTime = ` - ${this.getTimeFromDate(theTransaction.transactionDateTime)}`;
		}
		
		isPending = statusOfRecharge.toLowerCase().includes('pending');
		product = this.toTitleCase(product);
		quantityMeasurement = quantityMeasurement ? ` (${quantityMeasurement.toLowerCase()})` : quantityMeasurement;

		return html`
		<capitec-modal type="form" header="Recharge Status">
			<capitec-group slot="body" layout="grid" gap="clear">
				<div row="1" column="1">
					<capitec-label type="strong" label="${statusOfRecharge}"></capitec-label>
					<capitec-label type="strong" label="${product} ${this.toTitleCase(type)}"></capitec-label>
				</div>
				<div row="1" column="2">
					<br>
					<capitec-label type="strong" label="${item.transactionReference}"></capitec-label>
				</div>

				<div row="2" column="1">
					<capitec-label label="Message ID"></capitec-label>
					<capitec-label label="Time"></capitec-label>
					<capitec-label label="Origin"></capitec-label>
					<capitec-label label="Merchant ID"></capitec-label>
				</div>
				<div row="2" column="2">
					<capitec-label label="${messageId}"></capitec-label>
					<capitec-label label="${item.friendlyDate} ${startTime}"></capitec-label>
					<capitec-label label="${item.cif}"></capitec-label>
					<capitec-label label="${merchantId}"></capitec-label>
				</div>

				<div row="3" column="1" colspan="2">
					<hr>
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
					<capitec-label label="${item.amount} ${quantityMeasurement}"></capitec-label>
				</div>

				<capitec-spacer></capitec-spacer>

				<div row="5" column="1">
					<capitec-label label="Error Type"></capitec-label>
					<capitec-label label="Error Message"></capitec-label>
				</div>
				<div row="5" column="2">
					<capitec-label label="${errorType}"></capitec-label>
					<capitec-label label="${errorMessage}"></capitec-label>
				</div>

				<capitec-spacer></capitec-spacer>

				<div row="6" column="1" colspan="2">
					<capitec-label type="strong" label="${this.formatDate(item.transactionDate, { weekday: `short`, day: `numeric`, month: `short`, year: `numeric` })}"></capitec-label>
					<capitec-label type="strong" label="${startTime}${endTime}"></capitec-label>
				</div>
			</capitec-group>

			<capitec-button slot="footer" type="primary" label="Close" @click="${() => { this.selectedRechargeView = null; }}"></capitec-button>
		</capitec-modal>`;
	}

	_renderReversalModal() {
		return html`
		<capitec-modal type="form" header="Escalate for Reversal ">
			<capitec-content-box slot="body" layout="flex" style="min-height:300px;display: flex;flex-direction: column;gap: 1em;">
				<capitec-label label="You are about to escalate this transaction to a Connect team lead for reversal."></capitec-label>
				<capitec-label label="Choose a reason" type="title"></capitec-label>
				<capitec-select 
					label="Choose a reason" 
					.items="${[ 
						{
							label: `Product not received`,
							value: `Product not received.`
						}, {
							label: `Other`,
							value: `other`
						}
					]}" 
					@value-change="${(e) => this.reason = e.detail.new}"
					display-field="label"
					id-field="value">
				</capitec-select>
				<capitec-text-box
					label="Add description (optional) ${this.comment.length}/5000"
					@key-input="${(e) => this.comment = e.detail.new}"
					maxLength="50">
				</capitec-text-box>
			</capitec-content-box>

			<capitec-button slot="footer" type="secondary" label="Cancel" @click="${() => { this.selectedReversal = null; this.reason = null; this.comment = '' }}"></capitec-button>
			${this.reason?.value ?
				html`<capitec-button slot="footer" type="primary" label="Confirm" @click="${() => this.showConfirmModal = true}"></capitec-button>`
				:
				html`<capitec-button slot="footer" type="primary" label="Confirm" disabled></capitec-button>`
			}
			
			</capitec-modal>
		`;
	}

	_renderConfirmModal() {
		return html`
			<capitec-modal type="alert" header="Are you sure?">
				<div slot="body">
					Are you sure you want to escalate this transaction?
				</div>
				<capitec-button slot="footer" type="primary" @click="${() => { 
					this._actionReversal(); 
					this.selectedReversal = null; 
					this.showConfirmModal = false;
					}}" label="Yes"></capitec-button>
				<capitec-button slot="footer" type="clear" @click="${() => this.showConfirmModal = false}" label="No"></capitec-button>
			</capitec-modal>
		`;
	}

	_renderSuccessModal() {

		return html`
			<capitec-modal 
				type="result" 
				result="success" 
				header="Success">
				<div slot="body">
					The transaction has been successfully escalated to the team lead.
				</div>
				<capitec-button 
					slot="footer" 
					type="clear" 
					label="Done"
					@click="${() => {this.showSuccessModal = false; this.onFilter()}}">
				</capitec-button>
			</capitec-modal>
		`;
	}

	_renderFailureModal() {
		return html`
			<capitec-modal 
				type="result" 
				result="error" 
				header="Escalation Error">
				<div slot="body">
					The transaction could not be escalated at this time. Please try again later.
				</div>
				<capitec-button 
					slot="footer" 
					type="clear" 
					label="Done"
					@click="${() => {this.showFailureModal = false; this.onFilter()}}">
				</capitec-button>
			</capitec-modal>
		`;
	}

	_renderIcon() {
		return html`
				<img src="/images/liveBetter/capitec-connect-white.svg"/>`;
	}

	/* RENDERS:end */
}

customElements.define(`horizon-capitec-connect-agent-recharges`, CapitecConnectAgentRecharges);
