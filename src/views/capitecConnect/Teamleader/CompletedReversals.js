import { Component, View, css, html, unsafeCSS } from 'platform/elements';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { CapitecConnectService } from 'app/services/CapitecConnectService';
import { ClientProfileService } from 'app/services/ClientProfileService';
import { toTitleCase, formatTime, formatDate, formatCellphoneNumber, formatAmount } from 'app/utils/capitecConnectUtils';
import { Logger } from 'platform/core';

/**
 * Capitec Connect teamleader View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class CapitecConnectTeamLeaderCompletedReversals
 */
export class CapitecConnectTeamLeaderCompletedReversals extends View {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.capitecConnectService = new CapitecConnectService(() => this._toggleBusyFlag(), null);
		this.clientProfileService = new ClientProfileService(() => this._toggleBusyFlag(), null);
		this.logger = Logger.getInstance();

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
		this.showTable = true;

		this.identificationMethod = 2;
	}
	
	static get properties() {
		return {
			selectedReversal: { type: Object },
			reversalAction: {type: String},
			activeFilters: {type: Object},
			showTable: {type : Boolean}
		};
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_errorHandler(err) {
		return true;
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

		const pagedItemsToReturn = await this.searchReversals(renderSet, this.activeFilters, "COMPLETED");

		for (var i = 0; i < pagedItemsToReturn.records.length; i++) {
			pagedItemsToReturn.records[i].clientName = `-`;

			if (pagedItemsToReturn.records[i].accountNumber) {
				try {
					var clientName = await this.getClientName(pagedItemsToReturn.records[i].accountNumber);
					pagedItemsToReturn.records[i].clientName = clientName;
				} catch (error) {
					this.logger.log(`error`, "Client name could not be retrieved", "_renderCollection Completed")
				}
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

		if(returnValue.succeeded && returnValue.result){
			var firstName = returnValue.result.callerInformation.firstName;
			var lastName = returnValue.result.callerInformation.lastName;
			var identifiedClient = toTitleCase(firstName) + " " +  toTitleCase(lastName);
		} else {
			var identifiedClient = "-"
		}

		return identifiedClient;
	}

	formatModalDate(inputDate, options) {
		options = options || { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' };
		return formatDate(inputDate, options);
	}

	_renderAmount(item, fieldName, value) {
		return formatAmount(value);
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
			<capitec-table-column label="Transaction Date" field="postingDate"></capitec-table-column>
			<capitec-table-column label="Escalation Date" field="createdAt"></capitec-table-column>
			<capitec-table-column label="Agent Name" field="markedByName"></capitec-table-column>
			<capitec-table-column label="Client Name" field="clientName"></capitec-table-column>
			<capitec-table-column label="Account" field="accountNumber"></capitec-table-column>
			<capitec-table-column label="Number Charged" field="msisdn"></capitec-table-column>
			<capitec-table-column label="Channel" field="channel"></capitec-table-column>
			<capitec-table-column label="Amount" field="amount" .renderer="${this._renderAmount}"></capitec-table-column>
		</capitec-table>
		`}
			
		</capitec-content-box>

		

		${this.selectedReversal && this._renderReversalModal(this.selectedReversal)}

		`;
	}

	_expandRenderer (item) {
		var channel = toTitleCase(item.channel);
		var bundleType = item.bundleType ? toTitleCase(item.bundleType) : '-';
		var typeOfRecharge = item.type ? toTitleCase(item.type) : '-'
		var accountNumber = item.accountNumber ? item.accountNumber : '-';
		var postingDate = item.postingDate ? formatDate(item.postingDate) : '-';
		var journalReference = item.journalReference ? item.journalReference : '-';
		var processingDate = item.processingDate ? formatDate(item.processingDate) : '-';
		var reversalStatus = item.transactionState ? toTitleCase(item.transactionState) : '-';

		return html`
			<capitec-content-box>
				<capitec-label type="default" label=""></capitec-label>
				
				<capitec-content-box layout="grid">
					<capitec-label type="strong" label="Statement description: ${channel} ${bundleType} ${typeOfRecharge} Capitec Connect"></capitec-label>
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
						<capitec-label label="Reversal Status" ></capitec-label>
						<capitec-label type="strong" label="${reversalStatus}" ></capitec-label>
					</div>

					<div column="1" row="6" colspan="4" style="text-align: right; --theme-hyperlink-color: #009DE0; border-top: var(--theme-data-table-border, 1px solid #E1E1E1);">
						<capitec-hyperlink
							style="margin-top: 10px;"
							label="View Reversal Request"
							@click="${() => {this.selectedReversal = item}}">
						</capitec-hyperlink>
					</div>
				</capitec-content-box>
			</capitec-content-box>
		`;
	}

	_renderReversalModal(selectedReversal) {
		var status = selectedReversal.status ? selectedReversal.status : '-';
		var transactionReference = selectedReversal.businessTransactionReference ? selectedReversal.businessTransactionReference : '-';
		var postingDate = selectedReversal.postingDate ? selectedReversal.postingDate : '-';
		var channel = selectedReversal.channel ? toTitleCase(selectedReversal.channel) : '-';
		var msisdn = selectedReversal.msisdn ? selectedReversal.msisdn : '-';
		var productId = selectedReversal.productId ? selectedReversal.productId : '-';
		var productName = selectedReversal.productName ? selectedReversal.productName : '-';
		var bundleType = selectedReversal.bundleType ? toTitleCase(selectedReversal.bundleType) : '-';
		var amount = selectedReversal.amount ? selectedReversal.amount : '-';
		var statusReason = selectedReversal.statusReason ? selectedReversal.statusReason : '-';
		var reason = selectedReversal.reason ? selectedReversal.reason : '-';
		var additionalComments = selectedReversal.additionalComments ? selectedReversal.additionalComments : '-';
		var modalDate = selectedReversal.postingDate ? this.formatModalDate(selectedReversal.postingDate) : '-';
		var modalTime = selectedReversal.postingDate ? formatTime(selectedReversal.postingDate) : '-';

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
					<capitec-label label="${formatAmount(amount)}" ></capitec-label>
					</br>
					<capitec-label label="${statusReason}" ></capitec-label>
					</br>
					<capitec-label label="${reason}" ></capitec-label>
					<capitec-label label="${additionalComments}" ></capitec-label>	
				</div>
			</capitec-content-box>
			
			<capitec-button slot="footer" type="secondary" label="Close" @click="${() => {this.selectedReversal = null}}"></capitec-button>
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

customElements.define(`horizon-capitec-connect-teamleader-completed-reversals`, CapitecConnectTeamLeaderCompletedReversals);
