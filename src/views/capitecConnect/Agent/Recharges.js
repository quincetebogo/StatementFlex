import { Component, View, css, html, unsafeCSS } from 'platform/elements';
import { Configuration, NavigationContext } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { SavingsService } from '../../../services/SavingsService';
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
		// this.creditService = new CreditService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));

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
		this.selectedRechargeView = null;
		this.reversalAction = null;
		this.showConfirmModal = false;
		this.showTable = false;

		this.reason = null;
		this.comment = "";

		this.clientCif = null;

		this.savingsProducts = null;
		this.selectedSavingsProduct = null;

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

	async _retrieveRecharges(renderSet) {
		const pagedItemsToReturn = await this.searchReversals(renderSet, this.activeFilters, this.selectedSavingsProduct);
		return {
			pagedItems: pagedItemsToReturn.records,
			totalCount: pagedItemsToReturn.totalRecords
		};
	}
	
	_render() {
		
		return html`
		<capitec-content-box noPadding style="width:CALC(var(--horizon-center-panel-width) - 30px); height:CALC(var(--horizon-panel-height) - 180px)" layout="vertical" halign="stretch" valign="top" gap="clear">
		<capitec-button-bar >
			<capitec-select 
				label="Account" 
				.items="${this.savingsProducts}" 
				.value="${this.selectedSavingsProduct}"
				@value-change="${(e) => {this.selectedSavingsProduct = e.detail.new; this.onFilter();}}"
				display-field="accountType"
				id-field="accountNumber">
			</capitec-select>
			<capitec-spacer></capitec-spacer>
		</capitec-button-bar>
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
				if(this.activeFilters?.bundelType.includes(item)) {

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
				.dataHandler="${(renderSet) => this._retrieveRecharges(renderSet)}"
				expandable="right" 
				.expandRenderer="${(item) => this._expandRenderer(item)}">
			<capitec-table-column label="Transaction Date" field="createdAt"></capitec-table-column>
			<capitec-table-column label="Beneficiary Name" field="beneficiaryName"></capitec-table-column>
			<capitec-table-column label="Cellphone" field="msisdn"></capitec-table-column>
			<capitec-table-column label="Channel" field="channel"></capitec-table-column>
			<capitec-table-column label="Product" field="product"></capitec-table-column>
			<capitec-table-column label="Amount" field="amount" ></capitec-table-column>
		</capitec-table>
		`}
			
		</capitec-content-box>

		
		${this.selectedRechargeView ? this._renderRechargeStatusModal() : null}
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
					<capitec-button label="Recharge Status" column="3" row="3" @click="${() => {this.selectedRechargeView = item; }}"></capitec-button>
					<capitec-button label="Escalate For Reversal" column="4" row="3" @click="${() => {this.selectedReversal = item; }}"></capitec-button>
				</capitec-content-box>
			</capitec-content-box>
		`;
	}

	_renderRechargeStatusModal() {
		return html`
		<capitec-modal type="form" header="Recharge Status ">
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
			
			<capitec-button slot="footer" type="primary" label="Close" @click="${() => {this.selectedRechargeView = null;}}"></capitec-button>
			</capitec-modal>
		`;
	}

	_renderReversalModal() {
		return html`
		<capitec-modal type="form" header="Escalate for Reversal ">
			<capitec-content-box slot="body" layout="flex" style="min-height:300px;display: flex;flex-direction: column;gap: 1em;">
				<capitec-label  label="You are about to escalate this transaction to a Connect team lead for reversal." ></capitec-label>
				<capitec-label type"strong" label="Choose a reason" ></capitec-label>
				<capitec-select 
					label="Choose a reason" 
					.items="${[{
						label: "Product not received",
						value: "Product not received."
					},{
						label: "Other",
						value: "other"
					}]}" 
					@value-change="${(e) => this.reason = e.detail.new }"
					display-field="label"
					id-field="value">
				</capitec-select>

				${this.reason?.value === 'other' ? 
				 html`<capitec-text-box label="Add description (optional) ${this.comment.length}/5000" @key-input="${(e) => this.comment = e.detail.new}" maxLength="50"></capitec-text-box>`
				: null}
			
			</capitec-content-box>
			
			<capitec-button slot="footer" type="secondary" label="Cancel" @click="${() => {this.selectedReversal = null; this.unlock()}}"></capitec-button>
			<capitec-button slot="footer" type="primary" label="Confirm" @click="${() => {this.reversalAction = "Approve"; this.showConfirmModal = true; }}"></capitec-button>
			</capitec-modal>
		`;
	}

	_renderConfirmModal() {
		return html`
			<capitec-modal type="alert" header="Are you sure?">
				<div slot="body">
					You want to escalate this transaction
				</div>
				<capitec-button slot="footer" type="primary" @click="${() => {this.actionReversal(this.reversalAction, this.selectedReversal); this.showConfirmModal = false; this.selectedReversal = null}}" label="Yes"></capitec-button>
				<capitec-button slot="footer" type="clear" @click="${() => this.showConfirmModal = false}" label="No"></capitec-button>
			</capitec-modal>
		`;
	}

	_renderIcon() {
		return html`
				<img src="/images/liveBetter/live-better-white.svg"/>`
			;
	}
	
}

customElements.define(`horizon-capitec-connect-agent-recharges`, CapitecConnectAgentRecharges);