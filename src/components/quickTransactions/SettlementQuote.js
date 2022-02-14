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
'Credit card',
'Term Loan',
'Access facility'
]);

const quotes = [
	{
		quoteName: `Term Loan (32 months)`,
		accountNumber: `1234596`,
		loanAmount: 35000,
		instalment: 1234.91,
		settlementAmount: 18000
	},
	{
		quoteName: `Term Loan (84 months)`,
		accountNumber: `456789`,
		loanAmount: 15000,
		instalment: 1498.91,
		settlementAmount: 7920
	},
	{
		quoteName: `Credit card`,
		accountNumber: `147852`,
		loanAmount: 150000,
		instalment: 3982.91,
		settlementAmount: 31938.99
	},
	{
		quoteName: `Access facility`,
		accountNumber: `852369`,
		loanAmount: 50000,
		instalment: 2479.01,
		settlementAmount: 7820
	}
];

export class SettlementQuote extends Component {

// 	// --------------
// 	// INITIALISATION
// 	// --------------

// 	constructor() {
// 		super();

// 		this.searchTextLabel = DEFAULTS.SEARCH_TEXT_LABEL;
// 		this.typeLabel = DEFAULTS.TYPE_LABEL;
// 		this.textValue = this.typeValue = ``;
// 	}


// 	// ----------
// 	// PROPERTIES
// 	// ----------

// 	static get properties() {
// 		return {
// 			quotes: { type: Object},
// 			searchTextLabel: { state: true }
// 		};
// 	}

// 	// -------------------
// 	// LIFECYCLE OVERRIDES
// 	// -------------------

// 	connectedCallback() {
// 		super.connectedCallback();
// 	}

// 	disconnectedCallback() {
	
// 	}

// 	_refineSearch() {
// 		// Assigning the raw data before performing the filter
// 		this.filteredData = this.transactionHistory.filter(item => item.transactionStatus !== ``);

// 		if (FILTER_BY.TEXT) {

// 			const searchTextResult = searchText.map(key => {
// 				if (key !== ``) {
// 					if (key.startsWith(`-`)) {
// 						return this.filteredData.filter(item => parseFloat(item.amount).toFixed(2).startsWith(key));
// 					}
// 					return this.filteredData.filter(item => item.description.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
// 															parseFloat(item.amount).toFixed(2).startsWith(key) ||
// 															(parseFloat(item.amount) * -1).toFixed(2).startsWith(key));
// 				}
// 				return [];
// 			});
// 			this.filteredData = Array.from(new Set([...searchTextResult.flat()]));
// 		}

// 		// Status filter is apllicable only on Savings Account Transaction History screen in the current state of application
// 		if (FILTER_BY.TYPE) {
// 			this.filteredData = this.filteredData.filter(item => item.transactionStatus === status);
// 		}

// 		this.requestUpdate();
// 	}

// 	// --------------
// 	// EVENT HANDLERS
// 	// --------------

// 	_searchTextChange(event) {
// 		RENDER_CHIPS[FILTER_BY.TEXT] = event.detail.new;
// 		this._refineSearch();
// 	}

// 	_back() {
// 		this.dispatchEvent(new CustomEvent(`back`, {}));
// 	}

// 	// ---------------
// 	// PRIVATE METHODS
// 	// ---------------

// 	_initialise() {
	
// 	}

// 	// ---------
// 	// RENDERING
// 	// ---------

// 	/**
// 	 * Generates the component stylesheet.
// 	 *
// 	 * @readonly
// 	 * @static
// 	 * @returns {css} CSS for the component.
// 	 */
// 	 static get styles() {
// 		return [
// 			super.styles,
// 			css`			
// 			capitec-title-bar {
// 				--theme-label-title-font-size: 24px;
// 				--theme-label-title-font-weight: 600;
// 				--theme-titlebar-shadow: none;
// 				--theme-titlebar-border: 1px solid #E1E1E1;
// 			}
// 			capitec-title-bar > capitec-icon {
// 				cursor: pointer;
// 				margin-right: 15px;
// 			}
// 			.main-cb {
// 				height: 690px;				
// 			}
// 			.type-select{
// 				--theme-input-label-font-size: 16px;
// 				--theme-input-padding-bottom: 13px;
// 				--theme-select-options-max-height: 308px;
// 				--theme-input-font-size: 16px;
// 				--theme-input-label-font-color: #3A3A3A;
// 				--theme-input-font-weight: 400;
// 				--theme-input-icon-top: 8px;
// 				line-height: 30px;
// 				width: 224px;
// 			}
// 			.action-bar {
// 				height: 64px;
// 				width: var(--horizon-center-panel-width, 1064px);
// 			}
// 			.action-bar > capitec-text-field {
// 				height: 47px;
// 				width: 388px;
// 				padding-left: 8px;
			
// 				--theme-label-font-color: #3A3A3A;
// 				--theme-input-label-font-size: 16px;
// 				--theme-layout-gap-spacing: 8px; 
// 				--theme-input-clear-icon-height: 0px;
// 				--theme-input-clear-icon-width: 0px;
// 			}
// 			.main-cb > capitec-label[type="subtitle"] {
// 				line-height: 24px;

// 				--theme-label-subtitle-font-size: 18px;
// 				--theme-label-subtitle-font-weight: 600;
// 				--theme-layout-gap-spacing: 18px;
// 			}
// 			`
// 		];
// 	}


// 	_mobileTemplate() {
// 		return this._webTemplate();
// 	}

// 	_webTemplate() {
// 		return html`
// 			${this._renderContent()}
// 		`;
// 	}

// 	_renderContent() {
// 		return html`
// 			<capitec-card class="center-section">
// 				${this._renderTitleBar()}
// 				${this._renderSearch()}
// 				<capitec-content-box class="main-cb">
// 					${this._renderAlertBanner()}
// 					${this._renderQuotes()}
// 					${this._renderFooter()}
// 				</capitec-content-box>
// 			</capitec-card>
// 		`;
// 	}

// 	_renderAlertBanner() {
// 		return html``
// 	}

// 	_renderTitleBar() {
// 		return html`
// 			<capitec-title-bar>
// 				<capitec-icon 
// 					size="small"
// 					icon="system/arrow-left-action"
// 					@click="${() => this._back()}">
// 				</capitec-icon>
// 				<capitec-label label="Settlement Quote" type="title"></capitec-label>
// 			</capitec-title-bar>
// 		`;
// 	}

// 	_renderSearch() {
// 		return html`
// 			<capitec-title-bar>
// 			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="action-bar">
// 				<capitec-text-field
// 					id="text-filter"
// 					label=${this.searchTextLabel}
// 					type="search"
// 					keyboardMode="alpha-numeric"
// 					@key-input="${(e) => this._searchTextChange(e)}"
// 					@value-change="${(e) => this._searchTextChange(e)}"
// 					@focus="${(e) => this.searchTextLabel = ``}"
// 					@blur="${(e) => this._searchTextBlur(e)}"
// 					value="${this.textValue}">
// 				</capitec-text-field>

// 				<capitec-select
// 					label="${this.typeLabel}" 
// 					class="type-select"
// 					.items="${CREDIT_TYPE_LIST}"
// 					@focus="${(e) => this._statusFocussed(e)}"
// 					@value-change = "${(e) => this._filterByStatus(e)}"
// 					value = ${this.typeValue}>					
// 				</capitec-select>
// 			</capitec-group>
// 			</capitec-title-bar>
// 		`;
// 	}

// 	_renderQuotes() {
// 		return html`
// 			<capitec-label type="subtitle" label="Choose an account"></capitec-label>
// 			${quotes.map(item => this._renderRow(item))}
// 		`;
// 	}

// 	_renderRow(item) {
// 		return html`
// 			<capitec-group layout="grid" rows="auto" columns="uniform" gap="none">
// 				${this._renderRowInput(item)}
// 				${this._renderRowData(item)}
// 			</capitec-group>
// 		`;
// 	}

// 	_renderRowInput(rowData) {
// 		return html`
// 			<div 
// 				row="1" 
// 				column="1" 
// 				style="width: 35px; height: 22px;">
// 				<capitec-check 
// 					data-automation-id="stop-card-select"
// 					label="" 
// 					style="--theme-check-width: 21px; --theme-check-height: 21px;"
// 					@value-changed="${(e) => this._valueChanged(e, rowData)}">
// 				</capitec-check>
// 			</div>`;
// 	}

// 	_renderRowData(rowData) {
// 		return html`
// 		<div row="1" column="2" colspan="2" style="display: flex; align-items: center;">

// 		<horizon-label label="${rowData.quoteName}" value="${rowData.accountNumber}">
// 		</horizon-label>

// 		<horizon-label label="Loan amount" value="${rowData.loanAmount}">
// 		</horizon-label>

// 		<horizon-label label="Instalment" value="${rowData.instalment}">
// 		</horizon-label>

// 		<horizon-label label="Settlement amount" value="${rowData.settlementAmount}">
// 		</horizon-label>
// 		</div>`;
// 	}

// _renderFooter() {
// 	return html ``;
// }

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
		this.listValue = ``;
		
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
			listValue: { type: String }
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
			this.filteredData = this.filteredData.filter(item => item.quoteName.toLowerCase().indexOf(this.listValue.toLowerCase()) !== -1);
		}	

		if(text) {		
			const searchText = text.split(` `);
			const searchResult = searchText.map(key => {
				if (key !== ``){
					return this.filteredData.filter(item => item.quoteName.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
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
		this.requestUpdate();
	}

	_selectAll() {
		this.checkAll = false;
		if (this.isAccountsChecked.every(val => val === true)) {
			this.isChecked = false;
			for (let index = 0; index < this.isAccountsChecked.length; index++) {
				this.isAccountsChecked[index] = false;
			}
		} else {
			this._clearErrors();
			this.isChecked = true;
			for (let index = 0; index < this.isAccountsChecked.length; index++) {
				this.isAccountsChecked[index] = true;
			}
		}
		this.requestUpdate();
	}

	_deselect() {
		this.checkAll = false;
		this.isChecked = false;
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
					--theme-buttonbar-padding: 16px 0px 0px 16px;
					--theme-buttonbar-item-gap: 0px;
				}
			
				.btnSend {
					height: 20px;
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
					height: var(--theme-product-tile--height, 80px);
					background-color: transparent;
					padding: 0px;
					width: 100%;
					position: relative;
					border: 1px solid #E1E1E1;
					padding-left: 16px;
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
					label="${DEFAULTS.TYPE_LABEL}" 
					.items="${CREDIT_TYPE_LIST}" 
					display-field="text"
					filter-id="select"
					@value-change = "${(e) => this._filter(e)}"
					value="${this.listValue}">
				</capitec-select>
			</capitec-title-bar>
			<capitec-content-box class="main-cb" layout="vertical" halign="stretch" valign="top" gap="clear">
			${this._renderAlertBanner()}
			<capitec-label type="subtitle" label="Choose an account"></capitec-label>
			${this.filteredData.map((item, index) => this._renderAcountInfoTile(item, index))}
			</capitec-content-box>
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
					label="Select all"
					?indeterminate="${this.checkAll}"
					?checked="${this.isChecked}"
					@value-change="${e => this._selectAll()}">
				</capitec-check>
				<capitec-hyperlink ?hidden="${!this.isChecked && !this.checkAll}" label="Deselect all" @click="${() => this._deselect()}"></capitec-hyperlink>
				<capitec-spacer></capitec-spacer>
				<capitec-button 
					type="primary" 
					class ="btnSend" 
					label="Send Statement(s)" 
					@click="${() => this._showSendDialog()}">
				</capitec-button>			
			</capitec-button-bar>`;
	}
}
customElements.define(`horizon-settlement-quote`, SettlementQuote);