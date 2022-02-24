import { Component, css, html } from 'platform/elements';
import { ALERTBANNER_CSS } from 'app/css/VerificationStatusAlertBanner';
import { QuickTransactionsService }from'app/services/QuickTransactionsService';

import 'app/components/common/HorizonPDFViewer';
import 'app/components/common/OptionButton';
import 'app/components/common/StepperModal';
import 'app/dialogs/credit/PaidUpLetter';
import 'app/components/common/HorizonProductTile'; 



/**
 * This component implements the Paid Up Accounts Page for favourite landing page
 *
 * 
 * @export
 * @class PaidUpAccounts
 * @extends {Component}
 */
export class PaidUpAccounts extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.checkAll = false;
		this.isChecked = false;
		//this.selectedAccounts = [];
		this.showPaidUpLetter = false;
		this.accountsInfo = [];
		this.errorMessage = ``;
		this.cardTypes = [];
		this.landingPageInfo = null;
		this.isBusy = false;
		this.isAccountsChecked = [];
		this.selectedAccounts = [];
		

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
			showPaidUpLetter: { type: Boolean, attribute: false }
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
		this.accountsInfo = ["Term loan (32 Months)", "Credit" , "Access Facility"];

		this.cardTypes = ["All","Term Loan" , "Credit" , "Access Facility"]
		for (let index = 0; index < this.accountsInfo.length; index++)
		 {
			this.isAccountsChecked[index] = false;
		}	

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
		this._renderAlertBanner()
		this.requestUpdate();
		return false;
	}

	_back(){
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_showPaidUpLetter ()
	{
		this.selectedAccounts =[];
		if (this._isAnySelected())
		{
			for (let index = 0; index < this.isAccountsChecked.length; index++)
			{
				if (this.isAccountsChecked[index])
				{
					this.selectedAccounts[index] = this.accountsInfo[index];
				}
			}
			this.showPaidUpLetter = !this.showPaidUpLetter;
		}
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

				capitec-title-bar > capitec-label {
					height: 32px;
					width: 191px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 32px;
					margin-left: 15px;
				}
				capitec-action-bar {

                    border-bottom: 1px solid rgb(225, 225, 225);    

                    box-shadow: 0px 0px;                

                }
				
				.choose-account{
					line-height: 20px;
					padding-bottom: 5px;

					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
					--theme-layout-gap-spacing: 18px;
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
				capitec-label{
					margin: 16px 0px 16px 0px;
					--theme-label-font-size: 18px;
					--theme-label-font-family: Hind Vadodara;
				}
								.main-cb > capitec-label[type="subtitle"] {
					line-height: 24px;
					padding-top: 0px;

					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
					--theme-layout-gap-spacing: 18px;
				}

				capitec-button-bar {
					height: 50x;
					width: 100%;
					--buttonbar-align: right;
					--theme-buttonbar-item-gap: 0px;
				}
			
				horizon-option-button {
					height: 80px;
					width: 188px;
					margin-right: 16px;
				}

				.btnSend {
					height: 52px;
					margin-right: 16px;
				}

				.vertical-line{
					height: 50px;
					width: 1px;
					background-color: #E1E1E1;
					margin-right: 16px;
				}
				.main-content-box
				{
					height:570px;
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
				.alert-banner
				{
					width:100%;
				}
				.toast {
					position: absolute;
					top : 70px;
					left: 790px;
					height: 64px;
					width: 428px;
					border-radius: 4px;
					color: #70AF00;
					z-index: 201;
					left: calc(50.8% - 200px);
					justify-content: center;
					align-items: center;
				}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderContent()}
			${this._renderpaidUpLetter()}
		`;
	}

	_renderContent() {
		return html`
			<capitec-card class="center-section" >
				<capitec-title-bar>
					<capitec-icon 
						size="small"
						icon="system/arrow-left-action"
						@click="${() => this._back()}">
					</capitec-icon>

					<capitec-label label="Paid Up Letter" type="title"></capitec-label>
				</capitec-title-bar>
				<capitec-group layout="vertical" halign="left" valign="top" gap="2">
					${this._renderAlertBanner()}
					${this._renderpaidUpAccounts()}
				</capitec-group>
			</capitec-card>`;
	}
	/* ${this.accountsInfo.map((item, index) => this._renderAccounts(item, index))}*/
	_renderpaidUpAccounts()
	{
		let accInfo = this.accountsInfo ;
		return html `			
			<capitec-action-bar>
				<capitec-search-field label="Search loan , amount or account number" style="width: 320px;" value focussed></capitec-search-field>
				<capitec-select 
					label="Account type" 
					.items="${this.cardTypes}" 
					display-field="text"
					filter-id="select">
				</capitec-select>
			</capitec-action-bar>

			<capitec-content-box class="main-content-box" layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-label class="choose-account"
					type="subtitle" 
					label="Choose an account">
				</capitec-label>
				${this.accountsInfo.map((item, index) => this._renderAcountInfoTile(item, index))}
			</capitec-content-box>

			<capitec-button-bar>
				<capitec-check-group>
					<capitec-check
						label="Select all"
						?indeterminate="${this.checkAll}"
						?checked="${this.isChecked}"
						@value-change="${e => this._selectAll()}">
					</capitec-check>
				</capitec-check-group>
				<capitec-spacer></capitec-spacer>
				<capitec-button type="primary" class ="btnSend" label="Send Statement(s)" @click="${() => this._showPaidUpLetter()}"></capitec-button>				
			</capitec-button-bar>
		`;
	}
	_renderAcountInfoTile (item,index)
	{
		// item used to populate info below
		return html `
		<capitec-group class="accounts" layout="horizontal" gap="clear" valign="center">
					<capitec-group layout="vertical"  valign="center" gap="clear">
						<capitec-check 
							data="${item}"
							@value-changed=${(e) => this._checkBox(e, index)}
							?checked="${this.isAccountsChecked[index]}">>
						</capitec-check>
					</capitec-group>
						<horizon-label
								label="${item}"
								value="345634643">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							label="Credit taken up"
							value="R${(Math.floor(Math.random() * 99) + 50).toString()} ${(Math.floor(Math.random() * 1000) + 100).toString()}.00">
						</horizon-label>
						<horizon-label
							label="Installment"
							value="R${(Math.floor(Math.random() * 10) + 1).toString()} ${(Math.floor(Math.random() * 1000) + 100).toString()}.00">
						</horizon-label>
						<horizon-label
							label="Settlement Amount"
							value="R${(Math.floor(Math.random() * 30) + 10).toString()} ${(Math.floor(Math.random() * 1000) + 100).toString()}.00">
						</horizon-label>
		</capitec-group>
		`;
	}

	_checkBox(e,index) {
		this._clearErrors();

		if (this.isAccountsChecked[index] === true) {
			this.isAccountsChecked[index] = false;
		} else {
			this.isAccountsChecked[index] = true;
			this._clearErrors();
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
			for (let index = 0; index < this.isAccountsChecked.length; index++) {
				this.isAccountsChecked[index] = false;
			}
		} else {
			this.isChecked = true;
			for (let index = 0; index < this.isAccountsChecked.length; index++) {
				this.isAccountsChecked[index] = true;
			}
		}
		this.requestUpdate();
	}

	_clearErrors() {
		this.errorMessage = ``;
	}

	_renderpaidUpLetter()
	{
		return this.showPaidUpLetter ? 
		html`
		<horizon-paid-up-letter-dialog
			.landingPageInfo="${this.landingPageInfo}"
			.selectedAccounts="${this.selectedAccounts}"
			@cancel="${() => this._showPaidUpLetter()}"
			.navigatePDF="${(currPage) => this._navigatePDF(currPage)}">
		</horizon-paid-up-letter-dialog>`
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

}

customElements.define(`horizon-paid-up-accounts`, PaidUpAccounts);