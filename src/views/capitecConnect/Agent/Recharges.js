import { css, html } from 'platform/elements';
import { CapitecConnectService } from 'app/services/CapitecConnectService';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatDate, getTimeFromDate, compareDates, getDateInPast, sortObjectsByDateDescending, formatCellphoneNumber, isArray, isJson, toTitleCase, formatAmount } from 'app/utils/capitecConnectUtils';
import { Logger } from 'platform/core';

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
		this.logger = Logger.getInstance();

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

	_errorHandler(error) {
		this.logger.log(`error`, error);
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
				e.friendlyDate = formatDate(e.transactionDate) + ' ' + getTimeFromDate(e.transactionDate);
				e.friendlyMsisdn = formatCellphoneNumber(e.msisdn);

				e.recharges = e.recharges.length > 0 ? sortObjectsByDateDescending(e.recharges, 'transactionDateTime') : e.recharges;
				e.transactions = e.transactions.length > 0 ? sortObjectsByDateDescending(e.transactions, 'transactionDateTime') : e.transactions;

				e.successfulRecharge = null;
				e.successfulTransaction = null;
				e.reversedTransaction = null;
				e.pendingReversedTransaction = null;

				if (e.recharges.length > 0) {
					e.successfulRecharge = e.recharges.filter(t => t.type === `RECHARGE` && t.status === `SUCCESSFUL`);
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

				e.reversible = true;

				if (
					(e.pendingReversedTransaction !== null || e.reversedTransaction !== null) // pending or successful reversal
					|| e.recharges.length === 0 // no recharges
					|| e.transactions.length === 0 // no transactions
				) { // then we cannot reverse
					e.reversible = false;
				}

				return e;
			});

			response.result.content = r;

			this.showTable = response.result.totalElements !== 0;

			return {
				pagedItems: response.result?.content || [],
				totalCount: response.result.totalElements // for pagination reasons this is not the returned resultset's length
			};
		} catch (error) {
			this.logger.log(`error`, error);

			this.showTable = false;

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
			this.logger.log(`error`, error);

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

				${this.showTable ? html`
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
						<capitec-label align="center" type="default" label="No recharge data found."></capitec-label>
					</capitec-content-box>
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

	_renderAmount(item, fieldName, value) {
		return formatAmount(value);
	}

	_expandRenderer (item) {
		var accountNumber = `-`;
		var channel = toTitleCase(item.channel);
		var journalNumber = `-`;
		var transactionDate = item.transactionDate;
		var processedDate = `-`;
		var product = item.bundleType;
		var statusOfRecharge = ``;
		var transactionCode = item.transactionReference || `-`;
		var typeOfRecharge = ``;
		var isPending = false;

		var theRecharge = isJson(item.successfulRecharge) ? item.successfulRecharge : (item.recharges.length ? item.recharges[0] : null);

		if (isJson(theRecharge)) {
			product = product ? product : theRecharge.bundleType;
			transactionDate = theRecharge.transactionDateTime;
			statusOfRecharge = theRecharge.status;
			typeOfRecharge = theRecharge.type
		}

		var theTransaction = isJson(item.successfulTransaction) ? item.successfulTransaction : (item.transactions.length ? item.transactions[0] : null);

		if (
			item.pendingReversedTransaction !== null // if a there is a pending reversal
			&& item.reversedTransaction === null // if there is no successful reversals
			&& item.successfulTransaction !== null // if there was a successful transaction
			&& compareDates(item.pendingReversedTransaction, item.successfulTransaction) > -1 // if the pending reversal is after the success transaction
		) {
			theTransaction = item.pendingReversedTransaction;
			isPending = true;
		}

		if (isJson(theTransaction)) {
			typeOfRecharge = theTransaction.type;
			processedDate = theTransaction.transactionDateTime;
			accountNumber = theTransaction.accountNumber;
			journalNumber = theTransaction.journalReference;
			statusOfRecharge = theTransaction.status;
		}

		product = toTitleCase(product);

		transactionDate = transactionDate ? formatDate(transactionDate) + ` ` + getTimeFromDate(transactionDate) : transactionDate;
		processedDate = processedDate !== `-` ? formatDate(processedDate) + ` ` + getTimeFromDate(processedDate) : processedDate;

		typeOfRecharge = toTitleCase(typeOfRecharge);

		return html`
			<capitec-spacer></capitec-spacer>

			<capitec-group layout="grid" gap="clear">
				<div column="1" row="1" colspan="4">
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
					<capitec-label type="strong" label="${statusOfRecharge}"></capitec-label>
				</div>
				<div row="2" column="4">
					<capitec-label label="Account:"></capitec-label>
					<capitec-label type="strong" label="${accountNumber}"></capitec-label>
				</div>

				<div row="3" column="1">
					<capitec-label label="Transaction Date:"></capitec-label>
					<capitec-label type="strong" label="${transactionDate}"></capitec-label>
				</div>
				<div row="3" column="2">
					<capitec-label label="Processed Date:"></capitec-label>
					<capitec-label type="strong" label="${processedDate}"></capitec-label>
				</div>
				<div row="3" column="3">
					<capitec-label label="Transaction Code:"></capitec-label>
					<capitec-label type="strong" label="${transactionCode}"></capitec-label>
				</div>
				<div row="3" column="4">
					<capitec-label label="Journal Number:"></capitec-label>
					<capitec-label type="strong" label="${journalNumber}"></capitec-label>
				</div>

				<div row="4" column="1" colspan="4">
					<capitec-spacer></capitec-spacer>
				</div>

				<div row="5" column="1" colspan="4" style="text-align: right; --theme-hyperlink-color: #009DE0; border-top: var(--theme-data-table-border, 1px solid #E1E1E1);">
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
			type = `-`,
			errorType = `-`,
			statusOfRecharge = `-`,
			isPending = false;

		var theRecharge = isJson(item.successfulRecharge) ? item.successfulRecharge : (item.recharges.length ? item.recharges[0] : null);
		var theTransaction = isJson(item.successfulTransaction) ? item.successfulTransaction : (item.transactions.length ? item.transactions[0] : null);

		if (isJson(theRecharge)) {
			product = product ? product : theRecharge.bundleType;
			statusOfRecharge = theRecharge.status ? theRecharge.status : statusOfRecharge;
			type = theRecharge.type ? theRecharge.type : type;
			productId = theRecharge.productId ? theRecharge.productId : productId;
		}

		if (
			isJson(item.reversedTransaction) // if there is a successful reversal
			&& isJson(item.successfulTransaction) // if there was a successful transaction
			&& compareDates(item.reversedTransaction, item.successfulTransaction) > -1 // if the reversal is after the successful transaction
		) {
			theTransaction = item.reversedTransaction;
		}

		if (
			isJson(item.pendingReversedTransaction) // if a there is a pending reversal
			&& item.reversedTransaction === null // if there is no successful reversals
			&& isJson(item.successfulTransaction) // if there was a successful transaction
			&& compareDates(item.pendingReversedTransaction, item.successfulTransaction) > -1 // if the pending reversal is after the success transaction
		) {
			theTransaction = item.pendingReversedTransaction;
			isPending = true;
		}

		if (isJson(theTransaction)) {
			type = type !== `-` ? type : theTransaction.type;
			statusOfRecharge = statusOfRecharge !== `-` ? statusOfRecharge : theTransaction.status;
			product = product ? product : theRecharge.bundleType;
		}

		product = toTitleCase(product);

		switch (true) {
			case item.reversedTransaction !== null && item.pendingReversedTransaction === null: // reversed, no pending
			case item.reversedTransaction !== null && item.pendingReversedTransaction !== null && compareDates(item.reversedTransaction, item.pendingReversedTransaction) > -1: // reversed, previously pending
				errorType = `RECHARGE_REVERSED`;
			case item.pendingReversedTransaction !== null && item.reversedTransaction === null: // pending, not reversal yet
				errorType = `RECHARGE_REVERSAL_PENDING`;
				break;
			case item.successfulTransaction === null: // no successful transaction
				errorType = `TRANSACTION_FAILURE`;
				break;
			default:
				break;
		}

		return html`
		<capitec-modal type="form" header="${isPending ? 'Reversal' : 'Recharge'} Status">
			<capitec-group slot="body" layout="grid" gap="clear">
				<div row="1" column="1">
					<capitec-label type="strong" label="${statusOfRecharge}"></capitec-label>
					<capitec-label type="strong" label="${product} ${toTitleCase(type)}"></capitec-label>
				</div>
				<div row="1" column="2">
					<br>
					<br>
				</div>

				<div row="2" column="1">
					<capitec-label label="Message ID"></capitec-label>
					<capitec-label label="Time"></capitec-label>
					<capitec-label label="Origin"></capitec-label>
				</div>
				<div row="2" column="2">
					<capitec-label label="${item.transactionReference}"></capitec-label>
					<capitec-label label="${item.friendlyDate}"></capitec-label>
					<capitec-label label="${item.cif}"></capitec-label>
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

				<capitec-spacer></capitec-spacer>

				<div row="5" column="1">
					<capitec-label label="Error Type"></capitec-label>
				</div>
				<div row="5" column="2">
					<capitec-label label="${errorType}"></capitec-label>
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
