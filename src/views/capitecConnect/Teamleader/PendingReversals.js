import { Component, View, css, html, unsafeCSS } from 'platform/elements';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { CapitecConnectService } from 'app/services/CapitecConnectService';

/**
 * Capitec Connect teamleader View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class CapitecConnectTeamLeaderPendingReversals
 */
export class CapitecConnectTeamLeaderPendingReversals extends View {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.capitecConnectService = new CapitecConnectService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
	
		// private properites
		this.loading = true;

		// Static variables
		this.dateRanges = [
			{ value: "30", text: "30 Days" },
			{ value: "60", text: "60 Days" },
			{ value: "90", text: "90 Days" },
		];

		this.availableBundleFilters = ["All", "Airtime", "Minutes", "Data", "SMSs"]

		// State variables
		// this.searchValue = "";
		// this.selectedDate = this.dateRanges[0];
		this.activeFilters = {
			selectedDate:this.dateRanges[0],
			searchValue: "",
			bundelType:["All"]
		};

		this.selectedReversal = null;
		this.reversalAction = null;
		this.showConfirmModal = false;
		this.showTable = true;
	}
	
	static get properties() {
		return {
			selectedReversal: { type: Object },
			showConfirmModal: {type: Boolean},
			reversalAction: {type: String},
			activeFilters: {type: Object},
			showTable: {type : Boolean}
		};
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_errorHandler() {
		alert('error')
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

	toTitleCase(inputString) {
		return inputString.replace(/\w\S*/g, function (text) {
		  return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
		});
	}

	formatDate(inputDate, options) {
		options = options || { day: '2-digit', month: 'short', year: 'numeric' };
		const date = new Date(inputDate);
		return date.toLocaleDateString('en-za', options);
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
		const pagedItemsToReturn = await this.searchReversals(renderSet, this.activeFilters, "FLAGGED");
		return {
			pagedItems: pagedItemsToReturn.records,
			totalCount: pagedItemsToReturn.totalRecords
		};
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
			${this.availableBundleFilters.map(item => {
				if(this.activeFilters.bundelType.includes(item)) {

					return html`<capitec-chip closable label="${item}" @remove="${() => this._filterClick(item)}" @click="${() => this._filterClick(item)}"></capitec-chip>`;
				}

					return html`<capitec-chip label="${item}" @click="${() => this._filterClick(item)}"></capitec-chip>`;

			})}
		</capitec-button-bar>

		<capitec-label label="Active Filters"></capitec-label>
		<capitec-button-bar>
			${this.activeFilters.searchValue ? html`<capitec-chip label="${this.activeFilters.searchValue}"></capitec-chip>` : null}
			${this.activeFilters.selectedDate && this.activeFilters.selectedDate.value !== "NonSelected" ? html`<capitec-chip label="${this.activeFilters.selectedDate.text}"></capitec-chip>` : null}
			

			${this.activeFilters.bundelType.map(item => html`<capitec-chip closable @remove="${() => this._filterClick(item)}" label="${item}" @click="${() => this._filterClick(item)}"></capitec-chip>`)}
			<capitec-spacer></capitec-spacer>
		</capitec-button-bar>
		${!this.showTable ? null : html`
		
		<capitec-table style="" 
				displayMode="Paging" 
				groupField="month" 
				.dataHandler="${(renderSet) => this._renderCollection(renderSet)}"
				expandable="right" 
				.expandRenderer="${(item) => this._expandRenderer(item)}">
			<capitec-table-column label="Business Transaction Reference" field="businessTransactionReference"></capitec-table-column>
			<capitec-table-column label="Transaction Date" field="createdAt"></capitec-table-column>
			<capitec-table-column label="Agent Name" field="markedByName"></capitec-table-column>
			<capitec-table-column label="Client Name" field=""></capitec-table-column>
			<capitec-table-column label="Account" field="accountNumber"></capitec-table-column>
			<capitec-table-column label="Number Charged" field="msisdn"></capitec-table-column>
			<capitec-table-column label="Network" field="Capitec Connect"></capitec-table-column>
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
			<capitec-button slot="footer" type="secondary" label="Decline" @click="${() => {this.reversalAction = "Decline"; this.showConfirmModal = true; }}"></capitec-button>
			<capitec-button slot="footer" type="primary" label="Approve" @click="${() => {this.reversalAction = "Approve"; this.showConfirmModal = true; }}"></capitec-button>
			</capitec-modal>
		`;
	}
	
	_renderConfirmModal() {
		return html`
			<capitec-modal type="alert" header="Are you sure?">
				<div slot="body">
					You are going to ${this.reversalAction} the following ${this.selectedReversal.amount}
				</div>
				<capitec-button slot="footer" type="primary" @click="${() => {this.reversalActions(this.reversalAction, this.selectedReversal); this.showConfirmModal = false; this.selectedReversal = null; location.reload()}}" label="Yes"></capitec-button>
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

customElements.define(`horizon-capitec-connect-teamleader-pending-reversals`, CapitecConnectTeamLeaderPendingReversals);
