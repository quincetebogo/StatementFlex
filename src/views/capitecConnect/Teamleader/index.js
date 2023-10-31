import { Component, View, css, html, unsafeCSS } from 'platform/elements';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { CapitecConnectService } from 'app/services/CapitecConnectService';
import { ClientProfileService } from 'app/services/ClientProfileService';
import './EscalatedReversals';
import './PendingReversals';
import './CompletedReversals';
import './ProcessReversalFailure';
import SecurityContext from 'platform/SecurityContext';
// import { request } from 'http';
/**
 * Capitec Connect teamleader View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class CapitecConnectTeamLeader
 */
export class CapitecConnectTeamLeader extends View {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.capitecConnectService = new CapitecConnectService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.clientProfileService = new ClientProfileService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));

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

		this.totalEscalatedReversals = 0;
		this.totalPendingReversals = 0;
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
		};
	}

	async searchReversals(renderSet , filters , state) {

		const pagination_args = {
			"page": 0,
			"size": 10,
			"sort":[
				"processingDate,desc"
			]
		  }

		const records = await this.capitecConnectService.getReversals(state, pagination_args);
		console.log("records", records)

		const searchClient = {
			identificationMethod: 2,
			searchValue: "000000001"//this.searchFieldText
		};

		const returnValue = await this.clientProfileService.searchCaller(searchClient, null, 1);
		const identifiedClient = returnValue.result;

		console.info("returnValue", returnValue);
		console.info("identifiedClient", identifiedClient);

		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const retrievedRecords = records.result.content.filter(item => item.actionState === state);
				const returnValue = retrievedRecords?.slice((renderSet.currentPageIndex - 1) * renderSet.numOfPagingRows, renderSet.currentPageIndex * renderSet.numOfPagingRows);
				if(state === "AVAILABLE" ) {
					this.totalEscalatedReversals = records.result.totalElements;
				}
				
				if(state === "FLAGGED" ) {
					this.totalPendingReversals = records.result.totalElements;
				}

				// if(state === "COMPLETED" ) {
				// 	this.totalCompletedReversals = records.result.totalElements;
				// }

				resolve({
					records: returnValue || [],
					totalRecords: retrievedRecords?.length || 0
				});
			}, 1000);
		});
	}

	async reversalActions(action, selectedReversal) {
		console.info("type", action)
		console.info("selectedReversal", selectedReversal)
		const transactionReference = selectedReversal.businessTransactionReference;

		if(action === "Lock"){
			var reversalDetails = await this.capitecConnectService.lockReversal(transactionReference);
			console.log("reversalDetails lock", reversalDetails)
		} else if(action === "Unlock") {
			var reversalDetails = await this.capitecConnectService.unlockReversal(transactionReference);
			console.log("reversalDetails unlock", reversalDetails)
			// if (reversalDetails.succeeded) {
			// 	this.horizonRouter.navigateToProcessReversalSuccess();
			// } else {
			// 	this.horizonRouter.navigateToProcessReversalFailure(transactionReference);
			// }
		} else if(action === "Flag") {
			var reversalDetails = await this.capitecConnectService.flagReversal(transactionReference);
			console.log("reversalDetails flag", reversalDetails)
		} else if(action === "Decline") {
			var reversalDetails = await this.capitecConnectService.processReversal(transactionReference, false);
			console.info("Decline reversal", reversalDetails)
		} else if(action === "Approve") {
			var reversalDetails = await this.capitecConnectService.processReversal(transactionReference, true);
			console.info("Approve reversal", reversalDetails)
			if (reversalDetails.succeeded) {
				this.horizonRouter.navigateToProcessReversalSuccess();
			} else {
				this.horizonRouter.navigateToProcessReversalFailure(transactionReference);
			}
		}

		return reversalDetails;
		// return new Promise((resolve, reject) => {
		// 	setTimeout(() => {
		// 		resolve({
		// 			reversalDetails: reversalDetails || [],
		// 		});
		// 	}, 1000);
		// });
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
						<capitec-tab label="Escalated reversals ${this.totalEscalatedReversals}" layout="vertical" halign="left">
							<horizon-capitec-connect-teamleader-escalated-reversals
									style="width:100%"
									.searchReversals="${this.searchReversals}"
									.reversalActions="${this.reversalActions}"
									.actionReversal="${this.actionReversal}"
							></horizon-capitec-connect-teamleader-escalated-reversals>
							
						</capitec-tab>
						
						<capitec-tab label="Pending Reversals ${this.totalPendingReversals}" layout="vertical" halign="right">
						
							<horizon-capitec-connect-teamleader-pending-reversals
									style="width:100%"
									.searchReversals="${this.searchReversals}"
									.reversalActions="${this.reversalActions}"
									.actionReversal="${this.actionReversal}"
							></horizon-capitec-connect-teamleader-pending-reversals>
						</capitec-tab>
						
						<capitec-tab label="Completed Reversals" layout="vertical" halign="center">
						
						<horizon-capitec-connect-teamleader-completed-reversals
									style="width:100%"
									.searchReversals="${this.searchReversals}"
									.reversalActions="${this.reversalActions}"
									.actionReversal="${this.actionReversal}"
							></horizon-capitec-connect-teamleader-completed-reversals>
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

customElements.define(`horizon-capitec-connect-teamleader`, CapitecConnectTeamLeader);
