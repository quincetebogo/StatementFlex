import { Component, css, html, unsafeCSS } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatDate } from 'app/utils/channelServiceUtilities';
import 'app/components/insure/InsureAccountSelect';

// Lookups
import { CLIENT_ACCOUNTS } from 'app/constants/InsureCommon';

/**
 * Pay Premium Dialog componant will allow an account to be selected that will be used to pay the arrears as well as allow the arrears that are to be paid to be selected
 * 
 * Events Raised 
 * -------------
 * close-modal
 * pay-arrears
 *  
 * @export
 * @class PayPremiumDialog
 * @extends {Component}
 */
class PayPremiumDialog extends Component {

	//#region INITIALIZE

	constructor() {
		super();

		this.amount = 0;
		this.optionSelected = false;
		this.displayInsufficientFunds = false;
		this.insufficient = false;
		// Lookups
		this.clientAccounts = CLIENT_ACCOUNTS;

	}

	//#endregion

	//#region PROPERTIES

	/**
	 * @property {Object} clientArrears Data & flags from Arrears Service
	 * @property {Object} payArrears Data & flags for Pay Arrears service request
	 * @property {Number} amount Total amount to be paid for arrears
	 * @property {Boolean} optionSelected determines whether an option has been selected from the account select box
	 * @property {Object} accountDetails contains the caller's savings and savings plan account details
	 * @property {String} accountNumber conatins the account number of the selected account
	 * @property {String} accountType 
	 * @property {Boolean} displayInsufficientFunds 
	 * @property {Boolean} insufficient 
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			clientArrears: { type: Object, state: true },
			payArrears: { type: Object, state: true },
			amount: { type: Number, state: true },
			optionSelected: { type: Boolean, state: true },
			accountDetails: {type: Object, state: true},
			accountNumber: {type: String, state: true},
			accountType: {type: String, state: true},
			displayInsufficientFunds: { type: Boolean, state: true },
			insufficient: {type: Boolean, state: true}
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
		this._totalAmount();
	}

	//#endregion

	//#region PRIVATE METHODS

	/**
	 * Initialize component when loaded
	 */
	_initialise() {
		this.payArrears = {};
		this.payArrears.arrears = [];
		this.payArrears.contractReference = this.clientArrears.contractReference;
		this.payArrears.fromAccount = "";
		this.payArrears.cifNumber = "";

		this._sortArrears()

		// Set Metadata
		this.clientArrears.arrears.forEach(ele => {
			ele.shouldBeChecked = false;
			ele.shouldBeDisabled = false;
		});

		// First Entry
		this.clientArrears.arrears[0].shouldBeChecked = true;
		this.clientArrears.arrears[0].shouldBeDisabled = true;

		this._AddFirst(this.clientArrears.arrears[0])

		if (this.clientArrears.arrears.length == 3) {
			this.clientArrears.arrears[2].shouldBeDisabled = true;
		}

		console.log(this.payArrears)
	}

	/**
	 * sort the Arrears from oldest to newest
	 */
	_sortArrears() {
		this.clientArrears.arrears.sort((a, b) => { return (a.dueDate < b.dueDate) ? -1 : ((a.dueDate > b.dueDate) ? 1 : 0) });
		console.log(this.clientArrears.arrears)
	}

	_AddFirst(outstanding) {

		// add first arrear to pay arrears
		this.payArrears.arrears.push({
			dueDate: outstanding.dueDate,
			amount: outstanding.amount,
			objectID: outstanding.objectID,
			shouldBeChecked: outstanding.shouldBeChecked,
			shouldBeDisabled: outstanding.shouldBeDisabled
		});

		this.amount = outstanding.amount;

		console.log('Current Selected Arrears Array (1st)')
		console.log(this.payArrears.arrears)
	}
/**
 * Calculates the total amount of the arrears selected
 */
	_totalAmount() {

		for (let i = 0; i < this.payArrears.arrears; i++) {
			this.amount = this.amount + this.payArrears.arrears[i].amount
			console.log(this.amount)
		}

	}

	//#endregion



	//#region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 */
	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	/**
	 * Pay arrears Event, emits payArrears object containg the Arrears that are to be paid as well as the total amount to be paid and the clients account number & resets toggles 
	 */
	_PayArrears() {

		this.dispatchEvent(new CustomEvent(`pay-arrears`, { detail: { payArrears: this.payArrears, amountToPay: this.amount, fromAccount: this.accountNumber } }));
	}

	/**
	 * pay click event that determines if there is sufficient funds in the clients chosen account to to pay the arrears
	 */
	_onPayClick() {
			if(this.accountType == "Savings Account"){
				if (this.accountDetails.savingsAccountData.accountAvailableBalance < this.amount){
					this.optionSelected = false;
					this.displayInsufficientFunds = true;
					this.insufficient = true;
				} else {
					this._PayArrears();
				}
			} else {
				const index = this.accountDetails.savingsPlanData.savingsPlans.map(object => object.accountNumber).indexOf(this.accountNumber);

				if (this.accountDetails.savingsPlanData.savingsPlans[index].availableBalance < this.amount){
					this.optionSelected = false;
					this.displayInsufficientFunds = true;
					this.insufficient = true;
				} else {
					this._PayArrears();
				}

			}
	}

	/**
	 * Event that checks if Arrears have been selected to enable the Pay button
	 * 
	 * @param {} outstanding Live object at index that was clicked
	 * @param {*} e contains new value of checkbox
	 */
	_checkedChange(outstanding, selectedIndex, e) {


		console.log(e)


		//sets should be checked for third arrear to true when clicked
		if(selectedIndex == 2){
			this.clientArrears.arrears[2].shouldBeChecked = true;
		}

		//adds selected arrear or removes deselcted arrear
		this._addSelected(outstanding, selectedIndex, e);

		//adds amount of arrear selected
		if (e.detail.new == true) {
			this.amount = this.amount + outstanding.amount;
		} else if (e.detail.new == false) {
			this.amount = this.amount - outstanding.amount;
		}

		console.log('Current Selected Arrears Array (Change)')
		console.log(this.payArrears.arrears)
		this.requestUpdate()

	}

	/**
	 * Event that adds the selected Arrear to the payArrears Object and removes an unselected Arrear from the payArrears Object
	 * 
	 * @param {} selected Live object at index that was clicked
	 * @param {*} e contains new value of checkbox
	 */
	_addSelected(selected, selectedIndex, e) {

		console.log(e.detail)

		//adds/removes selected or deselected arrear to payArrears
		if (e.detail.new == true) {
			this.payArrears.arrears.push({
				dueDate: selected.dueDate,
				amount: selected.amount,
				objectID: selected.objectID,
				shouldBeChecked: selected.shouldBeChecked,
				shouldBeDisabled: selected.shouldBeDisabled
			});
		} else {
			const index = this.payArrears.arrears.map(object => object.objectID).indexOf(selected.objectID);
			this.payArrears.arrears.splice(index, 1);
		}

		//second arrear check = true
		if(e.detail.new == true && this.clientArrears.arrears.length == 3 && selectedIndex == 1){
			this.clientArrears.arrears[2].shouldBeDisabled = false;
		}

		// second arrear check = false and third arrear check = true
		if(e.detail.new == false && this.clientArrears.arrears.length == 3 && selectedIndex == 1 && this.clientArrears.arrears[2].shouldBeChecked == true){
			this.clientArrears.arrears[2].shouldBeDisabled = true;
			this.clientArrears.arrears[2].shouldBeChecked = false;
			
			const index = this.payArrears.arrears.map(object => object.objectID).indexOf(this.clientArrears.arrears[2].objectID);
			console.log("value:")
			console.log(this.clientArrears.arrears[2])
			this.payArrears.arrears.splice(index, 1);

			this.amount = this.amount - this.clientArrears.arrears[2].amount;
			
			console.log("in line false check")
		}

		// second arrear check = false
		if(e.detail.new == false && this.clientArrears.arrears.length == 3 && selectedIndex == 1){
			this.clientArrears.arrears[2].shouldBeDisabled = true;
			this.clientArrears.arrears[2].shouldBeChecked = false;
		}

	}
	/**
	 * event that sets the value of optionSelected to the value recieved from the account select box
	 * 
	 * @param {*} e contains the boolean value recieved from the account select box
	 */
	_optionSelected(e) {
		this.optionSelected = e.detail.optionSelected;

		this.displayInsufficientFunds = false;

		this.insufficient = false;

		this.accountNumber = e.detail.accountNumber;

		this.accountType = e.detail.accountType;
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
		
		.buttons{
			width: 100px;
		}

		.checkbox{
			border: 1px solid #e1e1e1;
			border-radius: 5px;
			padding: 10px;
		}

		.modal-body-label{
			padding: 10px 10px 10px 10px;
			font-weight: bold;
		}
		.error{
			--theme-toast-error-color: #000000;
			--theme-toast-height: 50px;

		}

		`
		];
	}


	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<capitec-modal type="form" class="modal-body-label" header="Pay Arrears (${this.clientArrears.contractReference})"
			header-align="left">
			<div slot="body" class="modal-body">
				<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear" data-automation-id = "insure-pay-premium-dialog-body">
					${this._renderDialogBody()}
				</capitec-content-box>
			</div>
			<div slot="footer" data-automation-id="insure-pay-premium-dialog-footer">
				${this._renderDialogFooter()}
			</div>
			</capitec-modal>`;
	}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {
		return html`

			${this._renderInsufficientFunds()}

			<capitec-label type="subtitle" label="Choose payment method">
			</capitec-label>
			
			<insure-account-select .items= "${this.clientAccounts}" label="Select an Account"
				@option-selected="${(e) => this._optionSelected(e)}" data-automation-id="insure-pay-premium-dialog-accounts"
				.accountDetails = ${this.accountDetails} .insufficient = "${this.insufficient}">
			</insure-account-select>

			
			<div style="display: flex; justify-content: space-between;">
				<capitec-label type="subtitle" label="Arrear amount"></capitec-label>
				<capitec-label type="subtitle" label="Amount to Pay: ${formatCurrency(this.amount)}"></capitec-label>
			</div>
			
			<capitec-check-group>
				${this.clientArrears.arrears.map((outstanding, index) => html`
					${index == 1 ? html`
						<capitec-check class="checkbox" label="${formatDate(outstanding.dueDate, 'MM yyyy')} | ${formatCurrency(outstanding.amount)}"
							@value-change=" ${(e) => this._checkedChange(outstanding, index, e)}" data-automation-id="insure-pay-premium-dialog-arrears" >
						</capitec-check>
					` : (index == 2 ? html`
						<capitec-check class="checkbox" label="${formatDate(outstanding.dueDate, 'MM yyyy')} | ${formatCurrency(outstanding.amount)}"
							@value-change=" ${(e) => this._checkedChange(outstanding, index, e)}" data-automation-id="insure-pay-premium-dialog-arrears"
							.disabled="${outstanding.shouldBeDisabled == true}" .checked="${outstanding.shouldBeChecked == true}" >
						</capitec-check>	
					`: html`
						<capitec-check class="checkbox" label="${formatDate(outstanding.dueDate, 'MM yyyy')} | ${formatCurrency(outstanding.amount)}"
							@value-change=" ${(e) => this._checkedChange(outstanding, index, e)}" data-automation-id="insure-pay-premium-dialog-arrears"
							.disabled="${outstanding.shouldBeDisabled == true}" .checked="${outstanding.shouldBeChecked == true}">
						</capitec-check>
						
					`)}
				`)}
			</capitec-check-group>
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button class="buttons" label="Cancel" @click="${() => this._onCancelClick()}"
				data-automation-id="insure-pay-premium-dialog-cancel">
				</capitec-button>
			
				<capitec-button class="buttons" id="id-confirm-button" type="primary" label="Pay"
					@click="${() => this._onPayClick()}" .disabled=${this.optionSelected == false} data-automation-id="insure-pay-premium-dialog-pay">
				</capitec-button>
			</capitec-group>`;

	}

	_renderInsufficientFunds(){
		return this.displayInsufficientFunds == false ? html`` :
		html `
			<capitec-toast class="error" type="error" header="Insufficient Funds" layout="horizontal" data-automation-id="insure-pay-premium-dialog-insufficient-funds"></capitec-toast>
		`
	}




	//#endregion


}

window.customElements.define(`insure-pay-premium-dialog`, PayPremiumDialog);

/**
 * Send the selected arrears and chosen account to consuming component when 'Add' is clicked
 *
 * @example
 * <pay-premium-dialog ... @pay-arrears="${this._handler}"></pay-premium-dialog>
 *
 * @event PayPremiumDialog#pay-arrears
 * @type {Object} - N/A
 */

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <pay-premium-dialog ... @close-modal="${this._handler}"></pay-premium-dialog>
 *
 * @event PayPremiumDialog#close-modal
 * @type {Object} - N/A
 */