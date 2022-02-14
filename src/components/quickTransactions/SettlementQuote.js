import { Component, css, html } from 'platform/elements';
import { ALERTBANNER_CSS } from 'app/css/VerificationStatusAlertBanner';

import { QuickTransactionsService }from'app/services/QuickTransactionsService';
import 'app/components/common/HorizonPDFViewer';
import 'app/components/common/OptionButton';
import 'app/components/common/StepperModal';
import 'app/components/common/HorizonProductTile'; 
import 'app/dialogs/credit/SettlementQuote'; 

const DEFAULTS = {
	SEARCH_TEXT_LABEL: `Search loan, amount or account number`,
	TYPE_LABEL: `Credit type`,
};

const CREDIT_TYPE_LIST = Object.freeze([
'All',
'Fixed credit',
'Flexible credit'
]);

const quotes = [
	{
		quoteName: `Term Loan (32 months)`,
		accountNumber: `1234596`,
		loanAmount: 35000,
		instalment: 1234.91,
		settlementAmount: 18000,
		creditType: `Fixed credit`
	},
	{
		quoteName: `Term Loan (84 months)`,
		accountNumber: `456789`,
		loanAmount: 15000,
		instalment: 1498.91,
		settlementAmount: 7920,
		creditType: `Fixed credit`
	},
	{
		quoteName: `Credit card`,
		accountNumber: `147852`,
		loanAmount: 150000,
		instalment: 3982.91,
		settlementAmount: 31938.99,
		creditType: `Flexible credit`
	},
	{
		quoteName: `Access facility`,
		accountNumber: `852369`,
		loanAmount: 50000,
		instalment: 2479.01,
		settlementAmount: 7820,
		creditType: `Flexible credit`
	}
];

export class SettlementQuote extends Component {


	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();
		this.checkAll = false;
		this.isChecked = false;
		this.showSendDialog = false;
		this.accountsInfo = [];
		this.errorMessage = ``;
		this.cardTypes = [];
		this.landingPageInfo = null;
		this.isBusy = false;
		this.isAccountsChecked = [];
		this.selectedAccounts = [];
		this.filteredData = [];
		this.listValue = `Credit type`;
		this.selectedLabel = `Select All`;
		
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));
	}


	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} landingPageInfo Data for the Favourites Landing Page display
	 * @readonly
	 * @static
	 * @memberof FavouriteTransactions
	 */


	static get properties() {
		return {
			landingPageInfo: { type: Object },
			isBusy: { attribute: false },
			showSendDialog: { type: Boolean, attribute: false },
			isChecked: { type: Boolean, attribute: false },
			checkAll: { type: Boolean, attribute: false},
			filteredData: { type: Array },
			listValue: { type: String },
			selectedLabel: { type: String }
		};
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------


	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------


	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_initialise() {
		for (let index = 0; index < quotes.length; index++)
		 {
			this.isAccountsChecked[index] = false;
		}	

		this.filteredData = quotes;
	}

	_isAnySelected ()
	{
		for (let index = 0; index < this.isAccountsChecked.length; index++) 
		{
			if (this.isAccountsChecked[index]===true)
			{
				return true;
			}
		}
		this.errorMessage = `Please select an account`;
		this._renderAlertBanner();
		this.requestUpdate();
		return false;
	}

	_filter(e) {
		this.listValue = e.detail.new;
		this._search(e);
	}

	_search (e) {
		const text = e.detail.new;
		this.filteredData = quotes;

		if(text === `All`) {
			return;
		}

		if(this.listValue !== `` && this.listValue !== `All`) {
			this.filteredData = this.filteredData.filter(item => item.creditType.toLowerCase().indexOf(this.listValue.toLowerCase()) !== -1);
		}	

		if(text) {		
			const searchText = text.split(` `);
			const searchResult = searchText.map(key => {
				if (key !== ``){
					return this.filteredData.filter(item => item.quoteName.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
															item.creditType.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
															parseFloat(item.settlementAmount).toFixed(2).startsWith(key) ||
															parseFloat(item.loanAmount).toFixed(2).startsWith(key) ||
															parseFloat(item.instalment).toFixed(2).startsWith(key) ||
															item.accountNumber.startsWith(key));
				}
				return [];
			});
			this.filteredData = Array.from(new Set([...searchResult.flat()]));
		}
		

	}

	_back(){
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_showSendDialog () {
		this.selectedAccounts = [];

		if(this.isAccountsChecked.every(val => val === false)) {
			this.errorMessage = `Please select an account`;
			this._renderAlertBanner();
			this.requestUpdate();
			return;
		}

		for (let index = 0; index < this.isAccountsChecked.length; index++)
		{
			if (this.isAccountsChecked[index])
			{
				this.selectedAccounts[index] = quotes[index].quoteName;
			}
		}
		this.showSendDialog = !this.showSendDialog;		
	}

	_checkBox(e,index) {
		this._clearErrors();
		if (this.isAccountsChecked[index] === true) {
			this.isAccountsChecked[index] = false;
		} else {
			this.isAccountsChecked[index] = true;
		}
		if (this.isAccountsChecked.every(val => val === true)) {
			this.checkAll = false;
			this.isChecked = true;
		} else if (this.isAccountsChecked.every(val => val === false)) {
			this.checkAll = false;
			this.isChecked = false;
		} else {
			this.checkAll = true;
			this.isChecked = false;
		}

		const amountSelected = this.isAccountsChecked.filter(Boolean).length;

		if(amountSelected === 0) {
			this.selectedLabel = `Select All`;
		}else if (amountSelected === 1) {
			this.selectedLabel = `1 account selected`
		}else {
			this.selectedLabel = `${this.isAccountsChecked.filter(Boolean).length} accounts selected`;
		}

		this.requestUpdate();
	}

	_selectAll() {
		this.checkAll = false;
		if (this.isAccountsChecked.every(val => val === true)) {
			this.isChecked = false;
			this.selectedLabel = `Select All`;
			for (let index = 0; index < this.isAccountsChecked.length; index++) {
				this.isAccountsChecked[index] = false;
			}
		} else {
			this._clearErrors();
			this.isChecked = true;
			for (let index = 0; index < this.isAccountsChecked.length; index++) {
				this.isAccountsChecked[index] = true;
			}
			this.selectedLabel = `${this.isAccountsChecked.length} accounts selected`;
		}
		this.requestUpdate();
	}

	_deselect() {
		this.checkAll = false;
		this.isChecked = false;
		this.selectedLabel = `Select All`;
		for (let index = 0; index < this.isAccountsChecked.length; index++) {
			this.isAccountsChecked[index] = false;			
		}
		this._clearErrors();
	}
	// --------------
	// EVENT HANDLERS
	// --------------

	async _navigatePDF(currPage){
        //add CS call to get encodedPDF 
        //currPage is date currently selected
        const returnValue = await this.quickTransactionService.viewStatement(currPage, () => this._createIncidentOnError());
        if(returnValue){
           return returnValue.result.statementData;
        }
    }

	_clearErrors() {
		this.errorMessage = ``;
	}

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
				${ALERTBANNER_CSS}
				.card{
					width:100%;
					height:100%;
				}
				capitec-text-field {
					width: 337px;
				}
				capitec-title-bar {
					border-bottom: 1px solid rgb(225, 225, 225);	
					box-shadow: 0px 0px;				
				}
				.main-cb {
					height: 590px;
				}
				.main-cb > capitec-label[type="subtitle"] {
					line-height: 24px;
					padding-top: 0px;

					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
					--theme-layout-gap-spacing: 18px;
				}

				capitec-button-bar>capitec-check {
					margin-top: 15px;
				}

				capitec-title-bar > capitec-label {
					height: 32px;
					width: 191px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 32px;
				}

				capitec-group > capitec-title-bar {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					width: 100%;
				}

				capitec-hyperlink {
					margin-left: 16px;
					margin-top: 15px;
					height: 20px;
					width: 84px;
					--theme-hyperlink-color: #009DE0;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
				}
				
				horizon-label{
					width: 182px;
					--theme-layout-gap-spacing: 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				} 

				capitec-button-bar {
					height: 50x;
					width: 100%;
					--buttonbar-align: right;
					// --theme-buttonbar-padding: 16px 0px 0px 16px;
					--theme-buttonbar-item-gap: 0px;
				}
			
				.btnSend {
					height: 48px;
					margin-right: 16px;
				}
				.vertical-line{
					height: 50px;
					width: 1px;
					background-color: #E1E1E1;
					margin-right: 16px;
				}
				.accounts{
					display: inline-flex;
					flex-direction: row;
					box-sizing: border-box;
					height: 64px;
					background-color: transparent;
					padding: 0px;
					width: 100%;
					position: relative;
					border: 1px solid #E1E1E1;
					padding-left: 16px;
				}
				.no-result-group {
					width: 1020px;
					margin-top: 130px;
				}
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.alert-banner
				{
					width:100%;
				}`
		];
	}
	_mobileTemplate() {
		return this._webTemplate();
	}
	_webTemplate() {
		return html`
			${this._renderContent()}
			${this._renderSendQuote()}
		`;
	}

	_renderContent() {
		return html`
			<capitec-card class="center-section">
				${this._renderTitleBar()}
				${this._renderSearch()}
				${this._renderFooter()}
			</capitec-card>
		`;
	}


	_renderTitleBar() {
		return html`
			<capitec-title-bar>
				<capitec-icon 
					size="small"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Settlement Quote" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderSearch() {
		this.textValue = ``;
		return html `			
			<capitec-title-bar>
				<capitec-text-field
 					id="text-filter"
 					label="${DEFAULTS.SEARCH_TEXT_LABEL}"
 					type="search"
 					keyboardMode="alpha-numeric"
 					@key-input="${(e) => this._search(e)}"
 					@value-change="${(e) => this._search(e)}">
 				</capitec-text-field>
				<capitec-select 					 
					.items="${CREDIT_TYPE_LIST}" 
					display-field="text"
					filter-id="select"
					@value-change = "${(e) => this._filter(e)}"
					value="${this.listValue}">
				</capitec-select>
			</capitec-title-bar>
			<capitec-content-box class="main-cb" layout="vertical" halign="stretch" valign="top" gap="clear">
			${this._renderAlertBanner()}
			<capitec-label 
				type="subtitle" 
				label="Choose an account" 
				?hidden="${this.filteredData.length < 1}" >
			</capitec-label>
			${this.filteredData.length > 0 ? this.filteredData.map((item, index) => this._renderAcountInfoTile(item, index)) : this._renderNoResult()}
			</capitec-content-box>
		`;
	}

	_renderNoResult() {
		return html`
			<capitec-group
				class="no-result-group"
				layout="vertical"
				halign="center"
				valign="center"
				gap="none">
					<img
						src="platform/illustrations/history.svg"
						class="document-icon"/>
					<capitec-label
						class="no-results"
						label="No results found"
						type="strong">
					</capitec-label>

			</capitec-group>
		`;
	}
	_renderAcountInfoTile (item,index) {
		return html `
			<capitec-group class="accounts" layout="horizontal" gap="clear" valign="center">
				<capitec-check 
					data="${item}"
					@value-changed=${(e) => this._checkBox(e, index)}
					?checked="${this.isAccountsChecked[index]}">>
				</capitec-check>
				<horizon-label
					label="${item.quoteName}"
					value="${item.accountNumber}">
				</horizon-label>
				<div class="vertical-line"></div>
				<horizon-label
					label="Loan amount"
					value="R${item.loanAmount}">
				</horizon-label>
				<horizon-label
					label="Instalment"
					value="R${item.instalment}">
				</horizon-label>
				<horizon-label
					label="Settlement Amount"
					value="R${item.settlementAmount}">
				</horizon-label>
			</capitec-group>
		`;
	}

	_renderSendQuote() {
		return this.showSendDialog ? 
		html`
		<horizon-settlement-quote-dialog
			.landingPageInfo="${this.landingPageInfo}"
			.selectedAccounts="${this.selectedAccounts}"
			@cancel="${() => this._showSendDialog()}"
			.navigatePDF="${(currPage) => this._navigatePDF(currPage)}">
		</horizon-settlement-quote-dialog>`
		: html ``;
	}
	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}
	_renderAlertBanner() {
		if (this.errorMessage) {
			return html`
				<capitec-alert-banner class="alert-banner"
					type="unsuccessful-red">
						<p><b>Notify:</b> ${this.errorMessage}</p>
				</capitec-alert-banner>`;
		}
	}

	_renderFooter() {
		return html`
			<capitec-button-bar>				
				<capitec-check
					label="${this.selectedLabel}"
					?indeterminate="${this.checkAll}"
					?checked="${this.isChecked}"
					@value-change="${e => this._selectAll()}">
				</capitec-check>
				<capitec-hyperlink ?hidden="${!this.isChecked && !this.checkAll}" label="Deselect All" @click="${() => this._deselect()}"></capitec-hyperlink>
				<capitec-spacer></capitec-spacer>
				<capitec-button 
					type="primary" 
					class ="btnSend" 
					label="Send Settlement Quote(s)" 
					@click="${() => this._showSendDialog()}">
				</capitec-button>			
			</capitec-button-bar>`;
	}
}
customElements.define(`horizon-settlement-quote`, SettlementQuote);