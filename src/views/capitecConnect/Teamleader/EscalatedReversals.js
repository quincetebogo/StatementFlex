import { Component, View, css, html, unsafeCSS } from 'platform/elements';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { CapitecConnectService } from 'app/services/CapitecConnectService';
import { ClientProfileService } from 'app/services/ClientProfileService';

/**
 * Capitec Connect teamleader View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class CapitecConnectTeamLeaderEscalatedReversals
 */
export class CapitecConnectTeamLeaderEscalatedReversals extends View {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.capitecConnectService = new CapitecConnectService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.clientProfileService = new ClientProfileService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));
	
		// private properites
		this.loading = true;

		// Static variables
		this.dateRanges = [
			{ value: "30", text: "30 Days" },
			{ value: "60", text: "60 Days" },
			{ value: "90", text: "90 Days" },
		];

		this.pagingRows = [10, 20, 50];
		this.numOfPagingRows = 10;
		this.currentPageIndex = 1;

		// State variables
		// this.searchValue = "";
		// this.selectedDate = this.dateRanges[0];
		this.activeFilters = {
			selectedDate:this.dateRanges[0],
			searchValue: ""
		};

		this.selectedReversal = null;
		this.reversalAction = null;
		this.showConfirmModal = false;
		this.showTable = true;

		this.newItem = {}
		this.identificationMethod = 2;
	}
	
	static get properties() {
		return {
			selectedReversal: { type: Object },
			showConfirmModal: {type: Boolean},
			reversalAction: {type: String},
			activeFilters: {type: Object},
			showTable: {type : Boolean},
			callerInformation: {type: Object},
		};
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_errorHandler() {
		alert('error')
	}

	_filterSearchboxClick() {
		this.activeFilters.searchValue = ``;

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

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._render()}
		`;
	}

	async _renderCollection(renderSet) {
		this.renderSet = renderSet;
		this.numOfPagingRows = this.renderSet.numOfPagingRows;
		this.currentPageIndex = this.renderSet.currentPageIndex;
		this.searchValue = this.renderSet.searchValue;

		const pagedItemsToReturn = await this.searchReversals(renderSet, this.activeFilters, "AVAILABLE");
		for(var i = 0; i < pagedItemsToReturn.records.length; i++){
			if(pagedItemsToReturn.records[i].accountNumber !== 0){
				var clientName = await this.getClientName(pagedItemsToReturn.records[i].accountNumber);
				Object.assign(pagedItemsToReturn.records[i], {clientName: clientName});
			} else {
				Object.assign(pagedItemsToReturn.records[i], {clientName: "-"});
			}
		}
		
		return {
			pagedItems: pagedItemsToReturn.records,
			totalCount: pagedItemsToReturn.totalRecords
		};
	}

	async getClientName(accountNumber){
		const searchClient = {
			identificationMethod: this.identificationMethod,
			searchValue: accountNumber
		};
		const returnValue = await this.clientProfileService.searchCaller(searchClient, null, 1);
		
		if(returnValue.result){
			var firstName = returnValue.result.callerInformation.firstName;
			var lastName = returnValue.result.callerInformation.lastName;
			var identifiedClient = this.toTitleCase(firstName) + " " +  this.toTitleCase(lastName);
		} else {
			var identifiedClient = "-"
		}

		return identifiedClient;
	}

	toTitleCase(inputString) {
		return inputString.replace(/\w\S*/g, function (text) {
		  return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
		});
	}

	formatTime(inputDate, options) {
		options = options || { hour: '2-digit', minute: '2-digit', second: '2-digit' };
		const date = new Date(inputDate);
		return date.toLocaleTimeString(options);
	}

	formatDate(inputDate, options) {
		options = options || { day: '2-digit', month: 'short', year: 'numeric' };
		const date = new Date(inputDate);
		return date.toLocaleDateString('en-za', options);
	}

	formatModalDate(inputDate, options) {
		options = options || { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' };
		const date = new Date(inputDate);
		return date.toLocaleDateString('en-za', options);
	}
	
	_render() {
		return html`
		<capitec-content-box noPadding style="width:CALC(var(--horizon-center-panel-width) - 30px); height:CALC(var(--horizon-panel-height) - 180px)" layout="vertical" halign="stretch" valign="top" gap="clear">
		<capitec-button-bar>
			<capitec-search-field label="Search" value="${this.activeFilters.searchValue}" @value-change="${(e) => {this.activeFilters.searchValue = e.detail.new; this.onFilter();}}" focussed>
			</capitec-search-field>
			<capitec-select 
				label="Select date" 
				.items="${this.dateRanges}" 
				.value="${this.activeFilters.selectedDate}"
				@value-change="${(e) => {this.activeFilters.selectedDate = e.detail.new; this.onFilter();}}"
				display-field="text"
				id-field="value">
			</capitec-select>
			<capitec-spacer></capitec-spacer>
		</capitec-button-bar>

		<capitec-label label="Active Filters:"></capitec-label>
		<capitec-button-bar>
		${this.activeFilters.searchValue ? html`<capitec-chip closable @remove="${() => this._filterSearchboxClick()}" label="${this.activeFilters.searchValue}"></capitec-chip>` : null}
		${this.activeFilters.selectedDate && this.activeFilters.selectedDate.value !== "NonSelected" ? html`<capitec-chip label="${this.activeFilters.selectedDate.text}"></capitec-chip>` : null}
			
			<capitec-spacer></capitec-spacer>
		</capitec-button-bar>
		${!this.showTable ? null : html`
		
		<capitec-table style="" 
				displayMode="Paging" 
				groupField="month" 
				numOfPagingRows="${this.numOfPagingRows}"
				pagingRows="[${this.pagingRows.join(`,`)}]"
				.dataHandler="${(renderSet) => this._renderCollection(renderSet)}"
				expandable="right" 
				.expandRenderer="${(item) => this._expandRenderer(item)}">
			<capitec-table-column label="Business Transaction Reference" field="businessTransactionReference"></capitec-table-column>
			<capitec-table-column label="Transaction Date" field="createdAt"></capitec-table-column>
			<capitec-table-column label="Agent Name" field="markedByName"></capitec-table-column>
			<capitec-table-column label="Client Name" field="clientName"></capitec-table-column>
			<capitec-table-column label="Account" field="accountNumber"></capitec-table-column>
			<capitec-table-column label="Number Charged" field="msisdn"></capitec-table-column>
			<capitec-table-column label="Amount" field="amount" ></capitec-table-column>
		</capitec-table>
		`}
			
		</capitec-content-box>

		

		${this.selectedReversal && this._renderReversalModal(this.selectedReversal)}
		${this.showConfirmModal ? this._renderConfirmModal() : null}

		`;
	}

	_expandRenderer (item) {
		var channel = this.toTitleCase(item.channel);
		var bundleType = item.bundleType ? this.toTitleCase(item.bundleType) : '-';
		var typeOfRecharge = item.type ? this.toTitleCase(item.type) : '-'
		var accountNumber = item.accountNumber ? item.accountNumber : '-';
		var processingDate = item.processingDate ? this.formatDate(item.processingDate) : '-';
		var postingDate = item.postingDate ? this.formatDate(item.postingDate) : '-';
		var journalReference = item.journalReference ? item.journalReference : '-';

		return html`
			<capitec-content-box>
				<capitec-label type="default" label=""></capitec-label>
				
				<capitec-content-box layout="grid">
					<div column="1" row="1" colspan="4">
						<capitec-label type="strong" label="Statement description: ${channel} ${bundleType} ${typeOfRecharge} Capitec Connect"></capitec-label>
					</div>
					<div column="1" row="2">
						<capitec-label label="Transaction Type" ></capitec-label>
						<capitec-label type="strong" label="${typeOfRecharge}" ></capitec-label>
						<capitec-label label="Account" ></capitec-label>
						<capitec-label type="strong" label="${accountNumber}" ></capitec-label>
					</div>
				
					<div column="2" row="2">
						<capitec-label label="Posting Date" ></capitec-label>
						<capitec-label type="strong" label="${postingDate}" ></capitec-label>
						<capitec-label label="Journal Number" >j</capitec-label>
						<capitec-label type="strong" label="${journalReference}" >j</capitec-label>
					</div>

					<div column="3" row="2">
						<capitec-label label="Processed Date" ></capitec-label>
						<capitec-label type="strong" label="${processingDate}" ></capitec-label>
					</div>
					<capitec-button label="View Reversal Request" column="4" row="3" @click="${() => {this.selectedReversal = item; this.reversalActions("Lock", this.selectedReversal)}}"></capitec-button>
				</capitec-content-box>
			</capitec-content-box>
		`;
	}

	_renderReversalModal(selectedReversal) {
		var status = selectedReversal.status ? selectedReversal.status : '-';
		var transactionReference = selectedReversal.businessTransactionReference ? selectedReversal.businessTransactionReference : '-';
		var postingDate = selectedReversal.postingDate ? selectedReversal.postingDate : '-';
		var channel = selectedReversal.channel ? this.toTitleCase(selectedReversal.channel) : '-';
		var msisdn = selectedReversal.msisdn ? selectedReversal.msisdn : '-';
		var productId = selectedReversal.productId ? selectedReversal.productId : '-';
		var productName = selectedReversal.productName ? selectedReversal.productName : '-';
		var bundleType = selectedReversal.bundleType ? this.toTitleCase(selectedReversal.bundleType) : '-';
		var amount = selectedReversal.amount ? selectedReversal.amount : '-';
		var statusReason = selectedReversal.statusReason ? selectedReversal.statusReason : '-';
		var reason = selectedReversal.reason ? selectedReversal.reason : '-';
		var additionalComments = selectedReversal.additionalComments ? selectedReversal.additionalComments : '-';
		var modalDate = selectedReversal.postingDate ? this.formatModalDate(selectedReversal.postingDate) : '-';
		var modalTime = selectedReversal.postingDate ? this.formatTime(selectedReversal.postingDate) : '-';

		return html`
		<capitec-modal type="form" header="Reversal request">
			<capitec-content-box slot="body" layout="grid" style="height: 500px;">
				<div column="1" row="1">
					<capitec-label type="strong" label="${status}" ></capitec-label>
					<capitec-label label="Message ID" ></capitec-label>
					<capitec-label label="Time" ></capitec-label>
				</div>
				<div column="2" row="1">
					</br>
					<capitec-label label="${transactionReference}" ></capitec-label>
					<capitec-label label="${postingDate}" ></capitec-label>
				</div>
				<hr>
				<div column="1" row="2">
					<capitec-label label="Channel" ></capitec-label>
					<capitec-label label="MSISDN" ></capitec-label>
					<capitec-label label="MNO" ></capitec-label>
					<capitec-label label="Product ID" ></capitec-label>
					<capitec-label label="Product Name" ></capitec-label>
					<capitec-label label="Product Type" ></capitec-label>
					<capitec-label label="Request Amount" ></capitec-label>
					</br>
					<capitec-label label="Error Message" ></capitec-label>
					</br>
					<capitec-label label="Reason for reversal" ></capitec-label>
					<capitec-label label="Comment" ></capitec-label>
					</br>
					<capitec-label type="strong" label="${modalDate}" ></capitec-label>
					<capitec-label type="strong" label="${modalTime}" ></capitec-label>
				</div>
				<hr>
				<div column="2" row="2">
					<capitec-label label="${channel}" ></capitec-label>
					<capitec-label label="${msisdn}" ></capitec-label>
					<capitec-label label="Capitec Connect" ></capitec-label>
					<capitec-label label="${productId}" ></capitec-label>
					<capitec-label label="${productName}" ></capitec-label>
					<capitec-label label="${bundleType}" ></capitec-label>
					<capitec-label label="${amount}" ></capitec-label>
					</br>
					<capitec-label label="${statusReason}" ></capitec-label>
					</br>
					<capitec-label label="${reason}" ></capitec-label>
					<capitec-label label="${additionalComments}" ></capitec-label>	
				</div>
			</capitec-content-box>
			
			<capitec-button slot="footer" type="secondary" label="Close" @click="${() => {this.selectedReversal = null; this.reversalActions("Unlock", selectedReversal)}}"></capitec-button>
			<capitec-button slot="footer" type="secondary" label="Pending" @click="${() => {this.reversalAction = "Flag"; this.showConfirmModal = true; }}" ></capitec-button>
			<capitec-button slot="footer" type="secondary" label="Decline" @click="${() => {this.reversalAction = "Decline"; this.showConfirmModal = true; }}"></capitec-button>
			<capitec-button slot="footer" type="primary" label="Approve" @click="${() => {this.reversalAction = "Approve"; this.showConfirmModal = true; }}"></capitec-button>
			</capitec-modal>
		`;
	}

	_renderConfirmModal() {
		return html`
			<capitec-modal type="alert" header="Are you sure?">
				<div slot="body">
					You are going to ${this.reversalAction} the following R${this.selectedReversal.amount}
				</div>
				<capitec-button slot="footer" type="primary" @click="${() => {this.reversalActions(this.reversalAction, this.selectedReversal); this.showConfirmModal = false; this.selectedReversal = null;}}" label="Yes"></capitec-button>
				<capitec-button slot="footer" type="clear" @click="${() => this.showConfirmModal = false}" label="No"></capitec-button>
			</capitec-modal>
		`;
	}

	_renderCompleted() {
		return html`Completed`;
		
	}
	_renderIcon() {
		return html`
				<img src="/images/liveBetter/live-better-white.svg"/>`
			;
	}
	
}

customElements.define(`horizon-capitec-connect-teamleader-escalated-reversals`, CapitecConnectTeamLeaderEscalatedReversals);
