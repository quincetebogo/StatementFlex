import { Component, View, css, html, unsafeCSS } from 'platform/elements';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import './Recharges'
import SecurityContext from 'platform/SecurityContext';
import { SavingsService } from '../../../services/SavingsService';
/**
 * Capitec Connect teamleader View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class CapitecConnectAgent
 */
export class CapitecConnectAgent extends View {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.savingsService = new SavingsService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));

		// private properites
		this.loading = true;

		// Static variables
		this.dateRanges = [
			{ value: "30", text: "30 Days" },
			{ value: "60", text: "60 Days" },
			{ value: "90", text: "90 Days" },
		];

		this.availableFilters = ["All", "Airtime", "Minutes", "Data", "SMSs"]


		// State variables
		this.searchValue = "";
		this.selectedDate = this.dateRanges[0];
		this.activeFilters = [];

		this.selectedReversal = null;
		this.reversalAction = null;
		this.showConfirmModal = false;


		this.totalEscalatedReversals = 10;
		this.totalPendingReversals = 10;
		this.totalCompletedReversals = 10;
	}
	
	static get properties() {
		return {
			selectedReversal: { type: Object },
			showConfirmModal: {type: Boolean},
			reversalAction: {type: String},
			selectedDate: {type: Object},
			searchValue: {type: String},
			activeFilters: {type: Array},
			totalEscalatedReversals: {type : Number},
			totalPendingReversals: {type : Number},
			totalCompletedReversals: {type : Number}
		};
	}

	

	async searchReversals(renderSet , filters , selectedAccount ) {

		function formatDate(daysToSubtract) {
			var newDate = new Date();
			newDate.setDate(newDate.getDate() - daysToSubtract);
		  
			var year = newDate.getFullYear();
			var month = String(newDate.getMonth() + 1).padStart(2, '0');
			var day = String(newDate.getDate()).padStart(2, '0');
		  
			var formattedDate = year + '-' + month + '-' + day;
			return formattedDate;
		}

		const response = await this.savingsService.savingsPlanTransactionHistory({
			"accountNumber": selectedAccount.accountNumber,
			"startDate": formatDate(0),
			"endDate": formatDate(parseInt(filters.selectedDate.value)),
			"startAtIndex": renderSet.currentPageIndex,
			"maxResults": renderSet.numOfPagingRows,
			"moneyType": "OUT"
		});

		console.log(response)

		return {
			records: response.result?.transactions || [],
			totalRecords: response.results?.transactions?.length || 0
		}

		// console.log(result)

		// console.log(SecurityContext.username)
		// // AVAILABLE, LOCKED, ACCEPTED, DECLINED, FLAGGED
		// console.log("searchReversals")
		// console.log(filters)
		// console.log(renderSet)
		// const records = [
		// 	{
		// 	  "businessTransactionReference": "TX12345",
		// 	  "amount": 100.00,
		// 	  "msisdn": "1234567890",
		// 	  "markedBy": "John Doe",
		// 	  "reason": "Incorrect Charge",
		// 	  "additionalComments": "Please review",
		// 	  "actionState": "AVAILABLE",
		// 	  "lockedTo": null,
		// 	  "transactionState": "PENDING",
		// 	  "actionedBy": "Jane Smith",
		// 	  "createdAt": "2023-08-01T10:00:00Z",
		// 	  "updatedAt": "2023-08-01T11:30:00Z",
		// 	  "locked": false,
		// 	  "complete": false
		// 	},
		// 	{
		// 	  "businessTransactionReference": "TX67890",
		// 	  "amount": 50.00,
		// 	  "msisdn": "9876543210",
		// 	  "markedBy": "Alice Smith",
		// 	  "reason": "Fraudulent Transaction",
		// 	  "additionalComments": "Urgent attention needed",
		// 	  "actionState": "LOCKED",
		// 	  "lockedTo": "cp349869",
		// 	  "transactionState": "PROCESSING",
		// 	  "actionedBy": "Bob Anderson",
		// 	  "createdAt": "2023-08-02T15:00:00Z",
		// 	  "updatedAt": "2023-08-02T16:45:00Z",
		// 	  "locked": true,
		// 	  "complete": false
		// 	},
		// 	{
		// 	  "businessTransactionReference": "TX54321",
		// 	  "amount": 75.00,
		// 	  "msisdn": "5551234567",
		// 	  "markedBy": "Eve Brown",
		// 	  "reason": "Customer Request",
		// 	  "additionalComments": "Approved by supervisor",
		// 	  "actionState": "ACCEPTED",
		// 	  "lockedTo": null,
		// 	  "transactionState": "SUCCESSFUL",
		// 	  "actionedBy": "Alice Johnson",
		// 	  "createdAt": "2023-08-03T08:30:00Z",
		// 	  "updatedAt": "2023-08-03T09:15:00Z",
		// 	  "locked": false,
		// 	  "complete": true
		// 	},
		// 	{
		// 	  "businessTransactionReference": "TX98765",
		// 	  "amount": 120.00,
		// 	  "msisdn": "3334445555",
		// 	  "markedBy": "Bob Anderson",
		// 	  "reason": "Billing Error",
		// 	  "additionalComments": "Investigate root cause",
		// 	  "actionState": "DECLINED",
		// 	  "lockedTo": null,
		// 	  "transactionState": "FAILED",
		// 	  "actionedBy": "John Doe",
		// 	  "createdAt": "2023-08-04T12:15:00Z",
		// 	  "updatedAt": "2023-08-04T13:30:00Z",
		// 	  "locked": false,
		// 	  "complete": true
		// 	},
		// 	{
		// 	  "businessTransactionReference": "TX24680",
		// 	  "amount": 200.00,
		// 	  "msisdn": "7778889999",
		// 	  "markedBy": "Jane Smith",
		// 	  "reason": "User Error",
		// 	  "additionalComments": "Reprocess payment",
		// 	  "actionState": "FLAGGED",
		// 	  "lockedTo": null,
		// 	  "transactionState": "CANCELED",
		// 	  "actionedBy": "Alice Smith",
		// 	  "createdAt": "2023-08-05T14:45:00Z",
		// 	  "updatedAt": "2023-08-05T15:20:00Z",
		// 	  "locked": false,
		// 	  "complete": true
		// 	}
		// ];

		// return new Promise((resolve, reject) => {
		// 	setTimeout(() => {
		// 		const retrievedRecords = records.filter(item => item.actionState === state);
		// 		const returnValue = retrievedRecords?.slice((renderSet.currentPageIndex - 1) * renderSet.numOfPagingRows, renderSet.currentPageIndex * renderSet.numOfPagingRows);
		// 		resolve({
		// 			records: returnValue || [],
		// 			totalRecords: retrievedRecords?.length || 0
		// 		});
		// 	}, 1000);
		// });
	}

	async lock(){
		alert('lock')
	}

	async unlock() {
		alert('unlock')

	}

	async actionReversal(type, selectedReversal) {
		console.log(type)
		console.log(selectedReversal)
		alert(type)
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
			${this._renderProductInfo()}
		`;
	}

	_renderProductInfo() {
		return html`
			<capitec-card class="product-info">
				<capitec-title-bar
					data-automation-id="cnet-product-info-title-bar"
					class="liveBetter"
					type="primary">
						${this._renderIcon()}
						<capitec-label
							data-automation-id="cnet-product-info-title"
							label="Capitec Connect"
							type="title">
						</capitec-label>
				</capitec-title-bar>
					
				<capitec-group class= "content" layout="grid" gap="none" columns="auto" rows="auto">
					<capitec-tab-group>
						<capitec-tab label="Recharge History" layout="vertical" halign="left">
							<horizon-capitec-connect-agent-recharges
								style="width:100%"
								.searchReversals="${this.searchReversals}"
								.lock="${this.lock}"
								.unlock="${this.unlock}"
								.actionReversal="${this.actionReversal}"
								></horizon-capitec-connect-agent-recharges>							
						</capitec-tab>
						
						<capitec-tab label="Advances" layout="vertical" halign="left">
							Not available
						</capitec-tab>
						
						<capitec-tab label="Advance Repayment" layout="vertical" halign="center">
							Not available
						</capitec-tab>
					</capitec-tab-group>
				</capitec-group>
		</capitec-card>`;
	}
	
	_renderIcon() {
		return html`
				<img src="/images/liveBetter/live-better-white.svg"/>`
			;
	}
	
}

customElements.define(`horizon-capitec-connect-agent`, CapitecConnectAgent);
