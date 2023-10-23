import { Component, View, css, html, unsafeCSS } from 'platform/elements';
import { Configuration, NavigationContext } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { SavingsService } from '../../../services/SavingsService';
import { CapitecConnectService } from 'app/services/CapitecConnectService';
import { CreditService } from '../../../services/CreditService';
import { ViewBase } from '../../common/ViewBase';
import { HorizonStore } from '../../../store/HorizonStore';
import { ACCOUNT_TYPE_CODE } from '../../../constants/Common';
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

		this.configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		// this.navigationContext = NavigationContext.getInstance();

		// Client details of the caller.
		// this.horizonStore = HorizonStore.getInstance();

		this.savingsService = new SavingsService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.capitecConnectService = new CapitecConnectService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		// this.creditService = new CreditService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));

		// private properites
		this.loading = true;

		// Static variables
		this.dateRanges = [
			{ value: "30", text: "30 Days" },
			{ value: "60", text: "60 Days" },
			{ value: "90", text: "90 Days" },
		];

		this.pagingRows = [10,20,50];
		this.numOfPagingRows = 10;
		this.currentPageIndex = 1;

		this.availableBundleFilters = ["All", "Airtime", "Minutes", "Data", "SMS"]

		// State variables
		// this.searchValue = "";
		// this.selectedDate = this.dateRanges[0];
		this.activeFilters = {
			selectedDate:this.dateRanges[0],
			searchValue: "",
			bundelType:["All"]
		};

		this.selectedReversal = null;
		this.selectedRechargeView = null;
		this.reversalAction = null;

		this.showConfirmModal = false;
		this.showSuccessModal = false;
		this.showFailureModal = false;

		this.showTable = false;

		this.reason = null;
		this.comment = "";

		this.clientCif = null;

		this.savingsProducts = null;
		this.selectedSavingsProduct = null;
		this.escalationDetail = {
			data: [],
			loaded: false
		};
	}

	connectedCallback() {
		super.connectedCallback();

		this.clientCif = this.callerInformation?.cif;
		

		this._initialise();

		// this.landingPageInfo = state.landingPageInfo;
		// this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	static get properties() {
		return {
			selectedReversal: { type: Object },
			selectedRechargeView: {type: Object},
			showConfirmModal: {type: Boolean},
			showSuccessModal: {type: Boolean},
			showFailureModal: {type: Boolean},
			reversalAction: {type: String},
			activeFilters: {type: Object},
			showTable: {type : Boolean},
			reason: {type: Object},
			comment: {type: String},
			callerInformation: {type: Object},
			clientCif: {type: String},
			savingsProducts : {type: Array},
			selectedSavingsProduct : {type: Object},
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
		options = options || { day: '2-digit', month: 'short', year: 'numeric' };
		const date = new Date(inputDate);
		return date.toLocaleDateString('en-za', options);
	}

	getTimeFromDate(dateString) {
		const date = new Date(dateString);
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const seconds = date.getSeconds().toString().padStart(2, '0');
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
		const month = String(pastDate.getMonth() + 1).padStart(2, '0');
		const day = String(pastDate.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	formatCellphoneNumber(cellphoneNumber) {
		cellphoneNumber = cellphoneNumber.replace(/\s/g, ''); // first remove the spaces

		if (cellphoneNumber.length === 11) {
			return `${cellphoneNumber.substr(0, 2)} ${cellphoneNumber.substr(2, 2)} ${cellphoneNumber.substr(4, 3)} ${cellphoneNumber.substr(7, 4)}`;
		} else if (cellphoneNumber.length === 10) {
			return `${cellphoneNumber.substr(0, 3)} ${cellphoneNumber.substr(3, 3)} ${cellphoneNumber.substr(6, 4)}`;
		} else {
			// Handle invalid input here if necessary
			return "000 000 0000";
		}
	}

	isArray(obj) {
		return typeof obj === "object" && obj.length // arrays are objects and have length
	}

	isJson(obj) {
		return typeof obj === "object" && !obj.length // json object have no length
	}

	toTitleCase(inputString) {
		return inputString.replace(/\w\S*/g, function (text) {
			return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
		});
	}
	/* UTILITIES:end */

	_errorHandler() {
		alert('error')
	}

	async _initialise() {
		console.log('Initialise')
		console.log(this.clientCif)
		this.retrieveSavingsAccounts();
        // if (this.callerInformation?.verificationStatus === `unverified`) {
        //     this.horizonRouter.navigateToProductInfo(`SavingsAccount`);
        // } else {
        //     const landingRequest = {
        //         cifNumber: this.callerInformation.cifNumber,
        //         nationalIDNumber: this.callerInformation.southAfricanIDNumber,
        //         getGenericData: true
        //     };

        //     const returnValue = await this.savingsService.savingsAccountLanding(landingRequest.cifNumber, landingRequest.nationalIDNumber, landingRequest.getGenericData);

        //     if (returnValue.succeeded) {
        //         this.landingPageInfo = returnValue.result;

        //         await super._inicidentManager_(LANDING_PAGE_NEEDS.SAVINGS_ACCOUNT, () => this._toggleBusyFlag());
		// 		await super.createAndClassifySubIncident(null, false);

        //         // Now we can update the information on the product buttons
        //         this._updateLeftBar();
        //         this.endCallContext = `LandingPage`;
        //         this.renderMode = RENDER_MODE.MAIN_PAGE;
        //     }
        // }
	}

	async retrieveSavingsAccounts() {
		// Remove before deploying.
		if (!this.clientCif) {
			this.clientCif = '283605510';
		}

		const response = await this.savingsService.getClientProducts({
			"cifNumber": this.clientCif,
			"productStatus": "ALL"
		}, this._errorHandler);


		this.savingsProducts = response.result.savingsProducts.map(item => {
			item.accountType = Object.keys(ACCOUNT_TYPE_CODE).find(key => ACCOUNT_TYPE_CODE[key] === item.accountType)

			return item;
		});

		this.selectedSavingsProduct = this.savingsProducts.find(item => item.accountType === "PRIMARY_SAVINGS");

		this.showTable = true;
	}

	async _retrieveRecharges(renderSet) {
		this.renderSet = renderSet;
		this.numOfPagingRows = this.renderSet.numOfPagingRows;
		this.currentPageIndex = this.renderSet.currentPageIndex;

		// /* For getting the escalation details for the current page */
		// this.searchRecharges(renderSet, this.activeFilters, true)
		// .then(e => {
		// 	this.escalationDetail.loaded = e.succeeded;
		// 	this.escalationDetail.data = e.result.content;
		// });

		try {
			const response = await this.searchRecharges(this.renderSet, this.activeFilters);

			var r = response.result.content;

			r = r.map(e => {
				e.friendlyDate = this.formatDate(e.transactionDate);
				e.msisdn = this.formatCellphoneNumber(e.msisdn);
				return e;
			});

			response.result.content = r;

			return {
				pagedItems: response.result?.content || [],
				totalCount: response.result.totalElements // for pagination reasons this is not the returned resultset's length
			}
		} catch (error) {
			console.error(error);

			return {
				pagedItems: [],
                totalCount: 0
			}
		}
	}

	async _actionReversal() {
		try {
			const response = await this.actionReversal(this.selectedReversal, this.reason.value, this.comment);

			this.showSuccessModal = response.succeeded;
			this.showFailureModal = !response.succeeded;

			return response;
		} catch (error) {
			alert('An error occurred while processing your request');
			console.error(error);

			this.showSuccessModal = false;
			this.showFailureModal = true;

			return {};
		}
	}

	_filterClick(value) {
		let index = this.activeFilters.bundelType.findIndex(item => item === value);
		let bundelType = [...this.activeFilters.bundelType];

		// Un-Select
		if(index !== -1) {

			if(this.activeFilters.bundelType.length === 1) {
				// Auto to all
				this.activeFilters.bundelType = ['All'];
				this.onFilter();
				return;
			} 
				
			bundelType.splice(index, 1);

			this.activeFilters.bundelType = bundelType;
			this.onFilter();
			return;
		}

		// Select
		if(value === "All") {
			this.activeFilters.bundelType = [value];
		} else {
			if(value !== "All") {
				// Check if all is selected
				let indexA = this.activeFilters.bundelType.findIndex(item => item === 'All');
				if(indexA > -1) {
					// All is selected
					bundelType.splice(indexA, 1);
				}
			} 
			
			bundelType.push(value)
			this.activeFilters.bundelType = [...bundelType];
		}

		this.onFilter();
		return;
	}

	onFilter() {
		this.showTable = false;
		this.requestUpdate();

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
					<capitec-search-field label="Search" value="${this.activeFilters.searchValue}" @value-change="${(e) => {this.activeFilters.searchValue = e.detail.new; this.onFilter();}}" focussed></capitec-search-field>

					<capitec-select 
						label="Select date" 
						.items="${this.dateRanges}" 
						.value="${this.activeFilters.selectedDate}"
						@value-change="${(e) => {this.activeFilters.selectedDate = e.detail.new; this.onFilter();}}"
						display-field="text"
						id-field="value">
					</capitec-select>

					<capitec-spacer></capitec-spacer>

					${this.availableBundleFilters.map(item => {
						if (this.activeFilters?.bundelType.includes(item)) {
							return html`<capitec-chip closable label="${item}" @remove="${() => this._filterClick(item)}" @click="${() => this._filterClick(item)}"></capitec-chip>`;
						}

						return html`<capitec-chip label="${item}" @click="${() => this._filterClick(item)}"></capitec-chip>`;
					})}
				</capitec-button-bar>

				<capitec-button-bar>
					<capitec-label type="strong" label="Active Filters:"></capitec-label>
					${this.activeFilters.searchValue ? html`<capitec-chip label="${this.activeFilters.searchValue}"></capitec-chip>` : null}
					${this.activeFilters.selectedDate && this.activeFilters.selectedDate.value !== "NonSelected" ? html`<capitec-chip label="${this.activeFilters.selectedDate.text}"></capitec-chip>` : null}
					${this.activeFilters.bundelType.map(item => html`<capitec-chip closable @remove="${() => this._filterClick(item)}" label="${item}" @click="${() => this._filterClick(item)}"></capitec-chip>`)}
					<capitec-spacer></capitec-spacer>
				</capitec-button-bar>

				${!this.showTable ? null : html`
				<capitec-table style="" 
						displayMode="Paging" 
						groupField="month"
						numOfPagingRows="${this.numOfPagingRows}"
						pagingRows="[${this.pagingRows.join(',')}]"
						.dataHandler="${(renderSet) => this._retrieveRecharges(renderSet)}"
						expandable="right" 
						.expandRenderer="${(item) => this._expandRenderer(item)}">
					<capitec-table-column label="Transaction Date" field="friendlyDate"></capitec-table-column>
					<capitec-table-column label="Beneficiary Name" field="recharges" .renderer="${this._renderBeneficiaryName}"></capitec-table-column>
					<capitec-table-column label="Cellphone Number" field="msisdn"></capitec-table-column>
					<capitec-table-column label="Channel" field="channel" .renderer="${this._renderTag}"></capitec-table-column>
					<capitec-table-column label="Product" .renderer="${this._renderProductName}"></capitec-table-column>
					<capitec-table-column label="Amount" field="amount" ></capitec-table-column>
				</capitec-table>
				`}
			</capitec-content-box>

			${this.selectedRechargeView ? this._renderRechargeStatusModal() : null}
			${this.selectedReversal && this._renderReversalModal()}
			${this.showSuccessModal ? this._renderSuccessModal() : ''}
			${this.showFailureModal ? this._renderFailureModal() : ''}
			${this.showConfirmModal ? this._renderConfirmModal() : ''}
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
		var channel = this.toTitleCase(item.channel);
		var product = item.bundleType;
		var typeOfRecharge = '';
		var statusOfRecharge = '';
		var accountNumber = '-';
		var transferAccount = '-';
		var transactionCode = item.transactionReference || "-";
		var journalNumber = '-';
		var postingDate = item.transactionDate;
		var processedDate = '-';

		if (item.recharges.length) {
			product = product ? product : item.recharges[0].bundleType;
			typeOfRecharge = this.toTitleCase(item.recharges[0].type);
			statusOfRecharge = this.toTitleCase(item.recharges[0].status);

			var successfulRecharge = item.recharges.filter(v => v.status.toLowerCase().includes('success'));

			if (successfulRecharge.length > 0) {
				postingDate = successfulRecharge[0].transactionDateTime;
			}
		}

		if (item.transactions.length) {
			var successfulTransaction = item.transactions.filter(v => v.status.toLowerCase().includes('success'));
			typeOfRecharge = typeOfRecharge === '' ? this.toTitleCase(item.transactions[0].type) : typeOfRecharge;
			processedDate = item.transactions[0].transactionDateTime;
			accountNumber = item.transactions[0].accountNumber;

			if (item.transactions[0].status) {
				statusOfRecharge = this.toTitleCase(item.transactions[0].status);
			}

			if (successfulTransaction.length > 0) {
				journalNumber = successfulTransaction[0].journalReference;
				accountNumber = successfulTransaction[0].accountNumber;
				statusOfRecharge = this.toTitleCase(successfulTransaction[0].status);
				typeOfRecharge = this.toTitleCase(successfulTransaction[0].type);
				processedDate = successfulTransaction[0].transactionDateTime;
			}
		}

		product = this.toTitleCase(product);

		if (statusOfRecharge != '') {
			statusOfRecharge = `[${statusOfRecharge}] `;
		}

		postingDate = postingDate ? this.formatDate(postingDate) + ' ' + this.getTimeFromDate(postingDate) : postingDate;
		processedDate = processedDate !== '-' ? this.formatDate(processedDate) + ' ' + this.getTimeFromDate(processedDate) : processedDate;

		return html`
			<capitec-spacer></capitec-spacer>

			<capitec-group layout="grid" gap="clear">
				<div column="1" row="1" colspan="4">
					<capitec-label type="strong" label="Statement Description: ${channel} ${product} ${typeOfRecharge} Capitec Connect"></capitec-label>
				</div>

				<div column="1" row="2">
					<capitec-label label="Transaction Type:"></capitec-label>
					<capitec-label type="strong" label="${product} ${typeOfRecharge}"></capitec-label>
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
						label="Recharge Status"
						@click="${() => {this.selectedRechargeView = item;}}">
					</capitec-hyperlink>
					${!item.reversible ?
					html`<capitec-hyperlink
						style="margin-top: 10px;"
						label="Escalate For Reversal"
						disabled>
					</capitec-hyperlink>`
					:
					html`<capitec-hyperlink
						style="margin-top: 10px;"
						label="Escalate For Reversal"
						@click="${() => {this.selectedReversal = item;}}">
					</capitec-hyperlink>`
					}
				</div>
			</capitec-group>
		`;
	}

	_renderRechargeStatusModal() {
		var bundleType = this.selectedRechargeView.bundleType ? this.selectedRechargeView.bundleType + " " : "";
		var type = '';
		var status = '';
		var messageId = '-';
		var merchantId = '-';
		var productId = '-';
		var errorType = '-';
		var errorMessage = '-';
		var quantityMeasurement = "";
		var startTime = this.getTimeFromDate(this.selectedRechargeView.transactionDate),
			endTime = '';

		if (this.selectedRechargeView.transactions.length > 0) {
			type = this.selectedRechargeView.transactions[0].type + " ";
			status = this.selectedRechargeView.transactions[0].status;
			errorMessage = this.selectedRechargeView.transactions[0].statusReason;

			this.selectedRechargeView.transactions.forEach(t => {
				if (endTime === '' || this.compareDates(t.transactionDateTime, endTime) > 0) {
					endTime = t.transactionDateTime;
				}
			});

			if (endTime !== '') {
				endTime = ` - ${this.getTimeFromDate(endTime)}`;
			}
		}
		
		if (this.selectedRechargeView.recharges.length > 0) {
			if (this.selectedRechargeView.recharges[0].bundleType !== "") {
				type = this.selectedRechargeView.recharges[0].type + " ";
				bundleType = this.selectedRechargeView.recharges[0].bundleType + " ";
			};

			if (this.selectedRechargeView.recharges[0].status !== "") {
				status = this.selectedRechargeView.recharges[0].status;
			};

			if (this.selectedRechargeView.recharges[0].statusReason) {
				errorMessage = this.selectedRechargeView.recharges[0].statusReason;
			}

			productId = this.selectedRechargeView.recharges[0].productId;
			quantityMeasurement = this.selectedRechargeView.recharges[0].quantityMeasurement;

			if (quantityMeasurement !== '') {
				quantityMeasurement = ` (${quantityMeasurement.toLowerCase()})`;
			}
		}

		return html`
		<capitec-modal type="form" header="Recharge Status">
			<capitec-group slot="body" layout="grid" gap="clear">
				<div row="1" column="1">
					<capitec-label type="strong" label="${status}"></capitec-label>
					<capitec-label type="strong" label="${bundleType}${type}Request"></capitec-label>
				</div>
				<div row="1" column="2">
					<br>
					<capitec-label type="strong" label="${this.selectedRechargeView.transactionReference}"></capitec-label>
				</div>

				<div row="2" column="1">
					<capitec-label label="Message ID"></capitec-label>
					<capitec-label label="Time"></capitec-label>
					<capitec-label label="Origin"></capitec-label>
					<capitec-label label="Merchant ID"></capitec-label>
				</div>
				<div row="2" column="2">
					<capitec-label label="${messageId}"></capitec-label>
					<capitec-label label="${this.selectedRechargeView.friendlyDate} ${startTime}"></capitec-label>
					<capitec-label label="${this.selectedRechargeView.cif}"></capitec-label>
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
					<capitec-label label="${this.toTitleCase(this.selectedRechargeView.channel)}"></capitec-label>
					<capitec-label label="${this.selectedRechargeView.msisdn}"></capitec-label>
					<capitec-label label="Capitec Connect"></capitec-label>
					<capitec-label label="${productId}"></capitec-label>
					<capitec-label label="${this.selectedRechargeView.productName}"></capitec-label>
					<capitec-label label="${bundleType}"></capitec-label>
					<capitec-label label="${this.selectedRechargeView.amount}${quantityMeasurement}"></capitec-label>
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
					<capitec-label type="strong" label="${this.formatDate(this.selectedRechargeView.transactionDate, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}"></capitec-label>
					<capitec-label type="strong" label="${startTime}${endTime}"></capitec-label>
				</div>
			</capitec-group>

			<capitec-button slot="footer" type="primary" label="Close" @click="${() => {this.selectedRechargeView = null;}}"></capitec-button>
		</capitec-modal>`;
	}

	_renderReversalModal() {
		return html`
		<capitec-modal type="form" header="Escalate for Reversal ">
			<capitec-content-box slot="body" layout="flex" style="min-height:300px;display: flex;flex-direction: column;gap: 1em;">
				<capitec-label label="You are about to escalate this transaction to a Connect team lead for reversal."></capitec-label>
				<capitec-label label="Choose a reason" type"title"></capitec-label>
				<capitec-select 
					label="Choose a reason" 
					.items="${[{
						label: "Product not received",
						value: "Product not received."
					},{
						label: "Other",
						value: "other"
					}]}" 
					@value-change="${(e) => this.reason = e.detail.new}"
					display-field="label"
					id-field="value">
				</capitec-select>

				${this.reason?.value === 'other' ? 
				html`
					<capitec-text-box
				 		label="Add description (optional) ${this.comment.length}/5000"
						@key-input="${(e) => this.comment = e.detail.new}"
						maxLength="50">
					</capitec-text-box>`
				: null}
			</capitec-content-box>

			<capitec-button slot="footer" type="secondary" label="Cancel" @click="${() => {this.selectedReversal = null; /* this.unlock() */}}"></capitec-button>
			<capitec-button slot="footer" type="primary" label="Confirm" @click="${() => this.showConfirmModal = true}"></capitec-button>
			</capitec-modal>
		`;
	}

	_renderConfirmModal() {
		return html`
			<capitec-modal type="alert" header="Are you sure?">
				<div slot="body">
					Are you sure you want to escalate this transaction?
				</div>
				<capitec-button slot="footer" type="primary" @click="${() => {this._actionReversal(); this.selectedReversal = null; this.showConfirmModal = false}}" label="Yes"></capitec-button>
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
					@click="${() => this.showSuccessModal = false}">
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
					@click="${this.showFailureModal = false}">
				</capitec-button>
			</capitec-modal>
		`;
	}

	_renderIcon() {
		return html`
				<img src="/images/liveBetter/capitec-connect-white.svg"/>`
			;
	}
	/* RENDERS:end */
}

customElements.define(`horizon-capitec-connect-agent-recharges`, CapitecConnectAgentRecharges);