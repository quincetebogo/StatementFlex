import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';


class InsureAccountSelect extends Component {

	//#region INITIALIZE

	constructor() {
		super();

		this.label = null;
		this.items = [];
		this.displayOptions = false;
		this.selectedIndex = null;
		this.optionSelected = false
		this.selectorAccounts = {}
	}

	//#endregion

	//#region PROPERTIES

	/**
	 * 
	 * @property {String} label 
	 * @property {Array} items
	 * @property {boolean} displayOptions
	 * @property {integer} selectedIndex
	 * 
	 * 
	 */
	static get properties() {
		return {

			label: { type: String, state: true },
			items: { type: Array, state: true},
			displayOptions: { type: Boolean, state: true },
			selectedIndex: { type: Number, state: true },
			optionSelected: {type: Boolean, state: true},
			accountDetails: {type: Object, state: true},
			selectorAccounts: {type: Object, state: true},
			accountType: {type: String, state: true},
			selectedAccount: {type: String, state: true}
		};
	}

	//#endregion

	//#region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	 connectedCallback() {
		super.connectedCallback();
		this._initialise();

	}

	//#endregion

	//#region PRIVATE METHODS

	async _initialise() {
		this.selectorAccounts.savingsAccount = [];
		this.selectorAccounts.savingsAccount.push({
			accountNumber: this.accountDetails.savingsAccountData.accountNumber,
			availableBalance: this.accountDetails.savingsAccountData.accountAvailableBalance,
			accountStatus: this.accountDetails.savingsAccountData.accountStatus,
		});
		this.selectorAccounts.savingsPlan = [];
		for (let i = 0; i < this.accountDetails.savingsPlanData.savingsPlans.length; i++) {
			this.selectorAccounts.savingsPlan.push({
				accountType: this.accountDetails.savingsPlanData.savingsPlans[i].accountType,
				accountStatus: this.accountDetails.savingsPlanData.savingsPlans[i].accountStatus,
				accountNumber: this.accountDetails.savingsPlanData.savingsPlans[i].accountNumber,
				availableBalance: this.accountDetails.savingsPlanData.savingsPlans[i].availableBalance,
				planName: this.accountDetails.savingsPlanData.savingsPlans[i].planName,
			});
		}
		
		
		
		console.log("selector")
		console.log(this.selectorAccounts)

	}

	//#endregion

	//#region EVENT HANDLERS

	/**
	 * event that sets the value of optionSelected and sends it to pay premium dialog
	 * 
	 */
	_optionSelected(account){
		this.optionSelected = true

		this.dispatchEvent(new CustomEvent(`option-selected`, {detail: {optionSelected: this.optionSelected, accountNumber: this.selectedAccount, accountType: account}}));
	}

	/**
	 * Event that determins whether to display or hide the select options
	 */
	_showAccountOptions(){
		if (this.displayOptions == false) {
			
			this.displayOptions = true;
		} else {
			this.displayOptions = false;
		}
		
	}

	/**
	 * Event that determines the index of the option that was selected from the options
	 * 
	 * @param {*} selected 
	 */
	_indexChange(selected, account) {
		
		
		if (account == "Savings Account"){
			this.selectedIndex = this.selectorAccounts.savingsAccount.map(account => account.accountNumber).indexOf(selected);
			this.selectedAccount = selected;
		} else {
			this.selectedIndex = this.selectorAccounts.savingsPlan.map(account => account.accountNumber).indexOf(selected);
			this.selectedAccount = selected;
		}
		
		this.accountType = account;

		this.displayOptions = false;
		

		this._optionSelected(account)
	}

	/**
	 * Event that flips the chevron depending on whether the select box is open or closed
	 * 
	 * @returns 
	 */
	_chevronChange() {

		if (this.displayOptions == false) {
			return "system/chevron-down-action";
		} else if(this.displayOptions == true){
			return "system/chevron-up-action";
		}

	}

	//#endregion


	//#region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`

				.select-header > capitec-content-box{
					border: 1px solid #e1e1e1;
					border-radius: 3px;
					height: 75px;
					display: flex;
					justify-content: space-between;
				}

				.select-header :hover{
					border-color: #009DE0;

				}

				.select-header :focus-within {
					border: 3px solid #009DE0;

				}


				.select-options > capitec-content-box {
					height: 40px;
					width: 560px;
					display: flex;
					border-radius: 3px;
					background-color: #fafafa
					
				}

				.all-options {
					position:absolute;
					box-shadow: 0 0 6px 0 rgba(0,0,0,0.11);
					border-radius: 3px;
					z-index: 1100;
					
				}

				.select-options :hover {
					background-color: #9de1ff
				}

				.account-label {
					position: relative; 
					left: -80px; 
					
				}

				.option-label {
					/*position: relative;
					left: -385px;*/
					font-weight: bold;
				}

				.account-amount {
					left: 62px; 
					position: relative; 
					font-weight: bold;
				}
				
				.default > capitec-content-box {
					border: 1px solid #e1e1e1;
					border-radius: 3px;
					height: 45px;
					display: flex;
					justify-content: space-between;
				}
				.default :hover{
					border-color: #009DE0;

				}

			`
		];
	}

	/**
	 * Main render point for component
	 * 
	 * @returns {html} The html content of the component.
	 */
_webTemplate() {
	return html`
		<div >	
			${this._renderHeader()}
		</div>
		<div>
			${this._renderOptions()}
		</div>

	`

	}

/**
 * Render the header section of the select box
 * 
 * @returns {html} The html content of the component.
 */
_renderHeader() {
	return html`

		${this.selectedIndex == null ? html`
			
			<div class="default">
				<capitec-content-box @click="${this._showAccountOptions}" layout="horizontal" valign="center" noScroll>
					<div>
						<capitec-label type="strong" label="${this.label}" ></capitec-label>
					</div>

					<div>
						<capitec-icon size="8px" icon="${this.displayOptions == false ? "system/chevron-down-action" : "system/chevron-up-action"}" ></capitec-icon>
					</div>

				</capitec-content-box>
			</div>

			
		` 

		: ( this.accountType == "Savings Plan" ? html `


			<div class="select-header">
				<capitec-content-box @click="${this._showAccountOptions}" layout="horizontal" valign="center" noScroll>
					<div> 
						<capitec-icon size="default" icon="product/save"></capitec-icon>
					</div>

					<div style="display: flex; flex-direction: column;">
						<capitec-label class="account-label" type="subtitle" label="${this.selectorAccounts.savingsPlan[this.selectedIndex].planName}" style="font-weight: bold;" ></capitec-label>
						<capitec-label class="account-label" type="subtitle" label="Available balance" ></capitec-label>
					</div>

					<div> 
						<capitec-label type="subtitle" label="${formatCurrency(this.selectorAccounts.savingsPlan[this.selectedIndex].availableBalance)}" style="left: 62px; position: relative; font-weight: bold;"></capitec-label>
					</div>

					<div>
						<capitec-icon size="8px" icon="${this.displayOptions == false ? "system/chevron-down-action" : "system/chevron-up-action"}" ></capitec-icon>
					</div>
				</capitec-content-box>
			</div>

		`: html `

			<div class="select-header">
				<capitec-content-box @click="${this._showAccountOptions}" layout="horizontal" valign="center" noScroll>
					<div> 
						<capitec-icon size="default" icon="product/transact"></capitec-icon>
					</div>

					<div style="display: flex; flex-direction: column;">
						<capitec-label class="account-label" type="subtitle" label="Savings Account" style="font-weight: bold;" ></capitec-label>
						<capitec-label class="account-label" type="subtitle" label="Available balance" ></capitec-label>
					</div>

					<div> 
						<capitec-label type="subtitle" label="${formatCurrency(this.selectorAccounts.savingsAccount[this.selectedIndex].availableBalance)}" style="left: 62px; position: relative; font-weight: bold;"></capitec-label>
					</div>

					<div>
						<capitec-icon size="8px" icon="${this.displayOptions == false ? "system/chevron-down-action" : "system/chevron-up-action"}" ></capitec-icon>
					</div>
				</capitec-content-box>
			</div>
		
		`)}
			

	`
}

/**
 * Render the Select box options
 * 
 * @returns The html content of the component.
 */
_renderOptions() {
	return this.displayOptions == false ? html`` :

	 html`
	<div class="all-options">
		${this.selectorAccounts.savingsAccount.map(item=> html`
				
			<div class="select-options">
				<capitec-content-box @click="${() => this._indexChange(item.accountNumber, "Savings Account")}" layout="horizontal" valign="center" noScroll>
					<div> 
						<capitec-icon size="default" icon="product/transact"></capitec-icon>
					</div>
					<div >
						<capitec-label class="option-label" type="subtitle" label="Savings Account | ${formatCurrency(item.availableBalance)}" ></capitec-label>
					</div>
				</capitec-content-box>

			</div>
		`)}

		${this.selectorAccounts.savingsPlan.map(item=> html`
			
			<div class="select-options">
				<capitec-content-box @click="${() => this._indexChange(item.accountNumber, "Savings Plan")}" layout="horizontal" valign="center" noScroll>
					<div> 
						<capitec-icon size="default" icon="product/save"></capitec-icon>
					</div>
					<div >
						<capitec-label class="option-label" type="subtitle" label="${item.planName} | ${formatCurrency(item.availableBalance)}" ></capitec-label>
					</div>
				</capitec-content-box>

			</div>
		`)}

	</div>
	`

}


	//#endregion

	
}

window.customElements.define(`insure-account-select`, InsureAccountSelect);

/**
 * Send the the value of optionSelected to consuming component when an option is clicked
 *
 * @example
 * <insure-account-select ... @option-selected="${this._handler}"></insure-account-select>
 *
 * @event InsureAccountSelect#option-selected
 * @type {Object} - N/A
 */