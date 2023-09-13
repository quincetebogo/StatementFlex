import { Component, View, css, html, unsafeCSS } from 'platform/elements';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';

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
		const pagedItemsToReturn = await this.searchReversals(renderSet, this.activeFilters, "LOCKED");
		return {
			pagedItems: pagedItemsToReturn.records,
			totalCount: pagedItemsToReturn.totalRecords
		};
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
			<capitec-table-column label="Agent Name" field="actionedBy"></capitec-table-column>
			<capitec-table-column label="Client Name" field="markedBy"></capitec-table-column>
			<capitec-table-column label="Account" field="account"></capitec-table-column>
			<capitec-table-column label="Number Charged" field="msisdn"></capitec-table-column>
			<capitec-table-column label="Network" render="${() => "CAPITEC CONNECT"}"></capitec-table-column>
			<capitec-table-column label="Amount" field="amount" ></capitec-table-column>
		</capitec-table>
		`}
			
		</capitec-content-box>

		

		${this.selectedReversal && this._renderReversalModal()}
		${this.showConfirmModal ? this._renderConfirmModal() : null}

		`;
	}

	_expandRenderer (item) {
		return html`
			<capitec-content-box>
				<capitec-label type="default" label="${item.description}"></capitec-label>
				
				<capitec-content-box layout="grid">
					<capitec-label label="Heading: " column="1" row="1">${item.statementDescription}</capitec-label>
					<div column="1" row="2">
						<capitec-label label="Transaction Type: " >${item.transTypeDesc}</capitec-label>
						<capitec-label label="Transaction Code: " >${item.transactionId}</capitec-label>
						<capitec-label label="Account: " >${item.accountNumber}</capitec-label>
						<capitec-label label="Processed Date: " >${item.transactionDate}</capitec-label>
					</div>
				
					<div column="2" row="2">
						<capitec-label label="Posting Date: " >${item.postingDate}</capitec-label>
						<capitec-label label="Includes VAT*: " >${item.includesVAT}</capitec-label>
						<capitec-label label="Teller*: " >${item.teller}</capitec-label>
						<capitec-label label="Journal Number*: " >${item.journalNumber}</capitec-label>
					</div>

					<div column="3" row="2">
						<capitec-label label="Branch*: " >${item.branch}</capitec-label>
						<capitec-label label="External Terminal ID*: " >${item.externalTerminalId}</capitec-label>
						<capitec-label label="Description: " ></capitec-label>
						<capitec-label label="Description: " ></capitec-label>
					</div>

					<div column="4" row="2">
						<capitec-label label="Description: " ></capitec-label>
						<capitec-label label="Description: " ></capitec-label>
						<capitec-label label="Description: " ></capitec-label>
						<capitec-label label="Description: " ></capitec-label>
					</div>
					<capitec-button label="View Reversal Request" column="4" row="3" @click="${() => {this.selectedReversal = item; this.lock()}}"></capitec-button>
				</capitec-content-box>
			</capitec-content-box>
		`;
	}

	_renderReversalModal() {
		return html`
		<capitec-modal type="form" header="Capitec Connect Recharge Reversal ">
			<capitec-content-box slot="body" layout="grid">
				<div column="1" row="1">
					<capitec-label type="strong" label="Declined" ></capitec-label>
					<capitec-label label="Airtime Purchase Request" ></capitec-label>
					</br>
					<capitec-label label="Message ID" ></capitec-label>
					<capitec-label label="Time" ></capitec-label>
					<capitec-label label="Origin" ></capitec-label>
					<capitec-label label="Merchant ID" ></capitec-label>
				</div>
				<div column="2" row="1">
					</br>
					<capitec-label label="001" ></capitec-label>
					</br>

					<capitec-label label="Message ID" ></capitec-label>
					<capitec-label label="Time" ></capitec-label>
					<capitec-label label="Origin" ></capitec-label>
					<capitec-label label="Merchant ID" ></capitec-label>
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
					<capitec-label label="Error Type" ></capitec-label>
					<capitec-label label="Error Message" ></capitec-label>
					</br>
					<capitec-label label="Comment" ></capitec-label>
					</br>
					<capitec-label type="strong" label="Friday 14th" ></capitec-label>
					<capitec-label type="strong" label="15:03 - 15:10" ></capitec-label>
				</div>
				<div column="2" row="2">
					<capitec-label label="Channel" ></capitec-label>
					<capitec-label label="MSISDN" ></capitec-label>
					<capitec-label label="MNO" ></capitec-label>
					<capitec-label label="Product ID" ></capitec-label>
					<capitec-label label="Product Name" ></capitec-label>
					<capitec-label label="Product Type" ></capitec-label>
					<capitec-label label="Request Amount" ></capitec-label>
					</br>
					<capitec-label label="Error Type" ></capitec-label>
					<capitec-label label="Error Message" ></capitec-label>
					</br>
					<capitec-label label="Comment" ></capitec-label>
				</div>
			</capitec-content-box>
			
			<capitec-button slot="footer" type="secondary" label="Close" @click="${() => {this.selectedReversal = null; this.unlock()}}"></capitec-button>
			<capitec-button slot="footer" type="secondary" label="Pending" @click="${() => {this.reversalAction = "Pending"; this.showConfirmModal = true; }}" ></capitec-button>
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
				<capitec-button slot="footer" type="primary" @click="${() => {this.actionReversal(this.reversalAction, this.selectedReversal); this.showConfirmModal = false; this.selectedReversal = null}}" label="Yes"></capitec-button>
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