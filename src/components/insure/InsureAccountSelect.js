import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';

/**
 * the account select box is populated with the callers savings account and flexible savings accounts which can then be selected to make a payment from
 * 
 * Events Raised 
 * -------------
 * option-selected
 *  
 * @export
 * @class PayPremiumAgreementDialog
 * @extends {Component}
 */
class InsureAccountSelect extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.label = null;
		this.displayOptions = false;
		this.selectedIndex = null;
		this.optionSelected = false;
		this.selectorAccounts = {};
		this.insufficient = false;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * 
	 * @property {String} label cantains the lable to be displayed before an account is chosen
	 * @property {boolean} displayOptions determines whether to display the account options or not
	 * @property {Number} selectedIndex contains the index of the account that was selected
	 * @property {Boolean} optionSelected determines whether an account has been selected or not
	 * @property {Object} accountDetails contains the callers account details for savings and savings plan
	 * @property {Object} selectorAccounts contains the callers valid accounts
	 * @property {String} accountType indicates whether the account chosen is a savings account or a savings plan
	 * @property {integer} selectedAccount contains the account number of the selected account
	 * @property {integer} insufficient indicates whether the selected account has sufficient funds 
	 * 
	 * 
	 */
	static get properties() {
		return {

			label: { type: String, state: true },
			displayOptions: { type: Boolean, state: true },
			selectedIndex: { type: Number, state: true },
			optionSelected: { type: Boolean, state: true },
			accountDetails: { type: Object, state: true },
			selectorAccounts: { type: Object, state: true },
			accountType: { type: String, state: true },
			selectedAccount: { type: String, state: true },
			insufficient: { type: Boolean, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	 connectedCallback() {
		super.connectedCallback();
		this._initialise();

	}

	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	/**
	 * initialisation
	 * @returns {void}
	 */
	_initialise() {

		this.selectorAccounts.savingsAccount = [];
		this.selectorAccounts.savingsPlan = [];

		this.accountDetails.map((account) => {
			if (account.accountName === `SAVINGS ACCOUNT`) {
				this.selectorAccounts.savingsAccount.push({
					accountNumber: account.accountNumber,
					availableBalance: account.availableBalance
					// accountStatus: this.accountDetails.savingsAccountData.accountStatus
				});
			}
			if (account.accountName !== `SAVINGS ACCOUNT`) {
				this.selectorAccounts.savingsPlan.push({
					accountType: account.accountType,
					// accountStatus: this.accountDetails.savingsPlanData.savingsPlans[i].accountStatus,
					accountNumber: account.accountNumber,
					availableBalance: account.availableBalance,
					planName: `Savings Plan`
				});
			}

		});
	}

	/**
	 * event that sets the value of optionSelected and sends it to pay premium dialog
	 * @param {String} account selected account
	 * @return {void} 
	 */
	 _optionSelected(account) {
		this.optionSelected = true;

		this.dispatchEvent(new CustomEvent(`option-selected`, { detail: { optionSelected: this.optionSelected, accountNumber: this.selectedAccount, accountType: account } }));
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Event that determins whether to display or hide the select options
	 * @return {void} 
	 */
	_showAccountOptions() {
		if (this.displayOptions === false) {
			
			this.displayOptions = true;
		} else {
			this.displayOptions = false;
		}
		
	}

	/**
	 * Event that determines the index of the option that was selected from the options
	 * 
	 * @param {Boolean} selected selected
	 * @param {String} account account
	 * @return {void} 
	 */
	_indexChange(selected, account) {
		
		
		if (account === `Savings Account`) {
			this.selectedIndex = this.selectorAccounts.savingsAccount.map(accounts => accounts.accountNumber).indexOf(selected);
			this.selectedAccount = selected;
		} else {
			this.selectedIndex = this.selectorAccounts.savingsPlan.map(accounts => accounts.accountNumber).indexOf(selected);
			this.selectedAccount = selected;
		}
		
		this.accountType = account;

		this.displayOptions = false;
		

		this._optionSelected(account);
	}

	/**
	 * event that changes the style of the select box depending on if the selected account has sufficient funds
	 * 
	 * @returns {string} css class
	 */
	_setStyle() {
		return this.insufficient ? `select-header-insufficient` : `select-header`;
	}

	// #endregion EVENT HANDLERS


	// #region RENDERING

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

				.select-header-insufficient > capitec-content-box{
					border: 1px solid #ce1b1b;
					border-radius: 3px;
					height: 75px;
					display: flex;
					justify-content: space-between;
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

	`;

	}

/**
 * Render the header section of the select box
 * 
 * @returns {html} The html content of the component.
 */
_renderHeader() {
	return html`

		${this.selectedIndex === null 
			? html`
				<div class="default">
					<capitec-content-box @click="${this._showAccountOptions}" layout="horizontal" valign="center" noScroll>
						<div>
							<capitec-label type="strong" label=${this.label} ></capitec-label>
						</div>
						<div>
							<capitec-icon size="8px" icon="${this.displayOptions === false ? `system/chevron-down-action` : `system/chevron-up-action`}" ></capitec-icon>
						</div>
					</capitec-content-box>
				</div>`
			: html``
		}

		${this.accountType === `Savings Plan` 
			? html`
				<div class="${this._setStyle()}">
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
							<capitec-icon size="8px" icon="${this.displayOptions === false ? `system/chevron-down-action` : `system/chevron-up-action`}" ></capitec-icon>
						</div>
					</capitec-content-box>
				</div>`
			: html``
		}

		${this.accountType !== `Savings Plan` && this.selectedIndex !== null 
			? html`
				<div class="${this._setStyle()}">
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
							<capitec-icon size="8px" icon="${this.displayOptions === false ? `system/chevron-down-action` : `system/chevron-up-action`}" ></capitec-icon>
						</div>
					</capitec-content-box>
				</div>`
			: html``
		}
	`;
}


/**
 * Render the Select box options
 * 
 * @returns {html} The html content of the component.
 */
_renderOptions() {
	return this.displayOptions === false ? html`` 
	: html`
	<div class="all-options">
		${this.selectorAccounts.savingsAccount.map(item => html`
				
			<div class="select-options">
				<capitec-content-box @click="${() => this._indexChange(item.accountNumber, `Savings Account`)}" layout="horizontal" valign="center" noScroll>
					<div> 
						<capitec-icon size="default" icon="product/transact"></capitec-icon>
					</div>
					<div >
						<capitec-label class="option-label" type="subtitle" label="Savings Account | ${formatCurrency(item.availableBalance)}" ></capitec-label>
					</div>
				</capitec-content-box>

			</div>
		`)}

		${this.selectorAccounts.savingsPlan.map(item => html`
			
			<div class="select-options">
				<capitec-content-box @click="${() => this._indexChange(item.accountNumber, `Savings Plan`)}" layout="horizontal" valign="center" noScroll>
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
	`;

}


	// #endregion RENDERING

	
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