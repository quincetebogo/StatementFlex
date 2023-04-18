import { Component, css, html, unsafeCSS } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { PayArrearsEvents } from 'app/constants/telemetry/events/Insure';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatDate } from 'app/utils/channelServiceUtilities';
import 'app/components/insure/InsureAccountSelect';


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

	// #region INITIALIZE

	constructor() {
		super();

		this.amount = 0;
		this.totalAmount = 0;
		this.optionSelected = false;
		this.insufficient = false;
		this.checked = 0;
		this._telemetry = HorizonTelemetry.getInstance();
		this.telemetryEvents = {};
		this.errorMessage = ``;
	}

	// #endregion

	// #region PROPERTIES

	/**
	 * @property {Object} clientArrears Data & flags from Arrears Service
	 * @property {Object} payArrears Data & flags for Pay Arrears service request
	 * @property {Number} amount Total amount to be paid for arrears
	 * @property {Boolean} optionSelected determines whether an option has been selected from the account select box
	 * @property {Object} accountDetails contains the caller's savings and savings plan account details
	 * @property {String} accountNumber conatins the account number of the selected account
	 * @property {String} accountType contains the type of the selected account
	 * @property {Boolean} displayInsufficientFunds determins whether to display the insufficient funds notification
	 * @property {Boolean} insufficient determines whether there is sufficient funds in the selected account
	 * @property {String} currentContractRef contains the contract ref of the selected policy
	 * @property {String} errorMessage contains the error message to be displayed
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			clientArrears: { type: Object, state: true },
			payArrears: { type: Object, state: true },
			amount: { type: Number, state: true },
			totalAmount: { type: Number, state: true },
			optionSelected: { type: Boolean, state: true },
			accountDetails: { type: Object, state: true },
			accountNumber: { type: String, state: true },
			accountType: { type: String, state: true },
			displayInsufficientFunds: { type: Boolean, state: true },
			insufficient: { type: Boolean, state: true },
			checked: { type: Number, state: true },
			displayAccountNotSelected: { type: Boolean, state: true },
			
			currentContractRef: { type: String, state: true },
			errorMessage: { type: String, state: true }
		};
	}

	// #endregion

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();

		this.telemetryEvents = PayArrearsEvents;
		await this._telemetry.startSpan(this.telemetryEvents.PAY_ARREARS, {});

		this._initialise();
		this._totalAmountSelected();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();
		await this._telemetry.endSpan(this.telemetryEvents.PAY_ARREARS, {});
	}

	// #endregion

	// #region PRIVATE METHODS

	/**
	 * Initialize component when loaded
	 * @returns {null} null
	 */
	_initialise() {
		this.payArrears = {};
		this.payArrears.arrears = [];
		this.payArrears.contractReference = this.currentContractRef;

		const index = this.clientArrears.policies.map(object => object.contractReference).indexOf(this.currentContractRef);

		this._sortArrears(index);

		this.clientArrears.arrears = this.clientArrears.policies[index].arrears;

		for (let i = 0; i < this.clientArrears.arrears.length; i++) {
			this.totalAmount += this.clientArrears.arrears[i].amount;
		}
	}

	/**
	 * sort the Arrears from oldest to newest
	 * @param {number} index index
	 * @returns {null} null
	 */
	_sortArrears(index) {
		this.clientArrears.policies[index].arrears = this.clientArrears.policies[index].arrears.sort((a, b) => {
			if (a.dueDate < b.dueDate) {
				return -1;
			} else if (a.dueDate > b.dueDate) {
				return 1;
			}
			return 0;
		}); 
	}


	/**
	 * Calculates the total amount of the arrears selected
	 * @returns {null} null
	*/
	_totalAmountSelected() {

		for (let i = 0; i < this.payArrears.arrears; i++) {
			this.amount += this.payArrears.arrears[i].amount;
		}

	}

	// #endregion

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {null} null
	 */
	_cancelClick() {
		this._telemetry.logEvent(this.telemetryEvents.PAY_ARREARS_CANCEL, {
			"screen": TelemetryScreen.INSURE_PAY_POLICY_DIALOG,
			"next-screen": TelemetryScreen.INSURE_CLIENT_SUMMARY
		});
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	/**
	 * Pay arrears Event, emits payArrears object containg the Arrears that are to be paid as well as the total amount to be paid and the clients account number & resets toggles 
	 * @returns {null} null
	 */
	_PayArrears() {

		this.dispatchEvent(new CustomEvent(`pay-arrears`, { detail: { payArrears: this.payArrears, amountToPay: this.amount, fromAccount: this.accountNumber } }));
	}

	/**
	 * pay click event that determines if there is sufficient funds in the clients chosen account to pay the arrears
	 * @returns {null} null
	 */
	_payClick() {
		this._telemetry.logEvent(this.telemetryEvents.PAY_ARREARS_PAY, {
			"screen": TelemetryScreen.INSURE_PAY_POLICY_DIALOG,
			"next-screen": TelemetryScreen.INSURE_PAY_POLICY_CONFIRM_DIALOG
		});

			if (this.accountType === `Savings Account`) {
				const index = this.clientArrears.payableAccounts.map(object => object.accountNumber).indexOf(this.accountNumber);
				if (this.clientArrears.payableAccounts[index]?.availableBalance < this.amount) {
					this.optionSelected = false;
					this.insufficient = true;
				} else if (this.optionSelected === false) {
					this.errorMessage = `Select an account to pay from`;
				} else {
					this._PayArrears();
				}
			} else {
				const index = this.clientArrears.payableAccounts.map(object => object.accountNumber).indexOf(this.accountNumber);

				if (this.clientArrears.payableAccounts[index]?.availableBalance < this.amount) {
					this.optionSelected = false;
					this.insufficient = true;
				} else if (this.optionSelected === false) {
					this.errorMessage = `Select an account to pay from`;
				} else {
					this._PayArrears();
				}

			}
	}

	/**
	 * Event that checks if Arrears have been selected to enable the Pay button
	 * @param {*} outstanding Live object at index that was clicked
	 * @param {*} selectedIndex Live object at index that was clicked
	 * @param {*} e contains new value of checkbox
	 * @returns {null} null
	 */
	_checkedChange(outstanding, selectedIndex, e) {

		// adds selected arrear or removes deselcted arrear
		this._addSelected(outstanding, selectedIndex, e);


		// adds amount of arrear selected
		if (e.detail.new === true) {
			this.amount += outstanding.amount;
			this.checked += 1;
			
			this.errorMessage = ``;
		} else if (e.detail.new === false) {
			this.insufficient = false;
			this.optionSelected = true;
			this.amount -= outstanding.amount;
			this.checked -= 1;
		}

		this.requestUpdate();

	}

	/**
	 * Event that adds the selected Arrear to the payArrears Object and removes an unselected Arrear from the payArrears Object
	 * 
	 * @param {*} selected Live object at index that was clicked
	 * @param {*} selectedIndex Live object at index that was clicked
	 * @param {*} e contains new value of checkbox
	 * @returns {null} null
	 * 
	 */
	_addSelected(selected, selectedIndex, e) {


		// adds/removes selected or deselected arrear to payArrears
		if (e.detail.new === true) {
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

	}

	/**
	 * event that sets the value of optionSelected to the value recieved from the account select box
	 * 
	 * @param {*} e contains the boolean value recieved from the account select box
	 * @returns {null} null
	 */
	_optionSelected(e) {
		this.optionSelected = e.detail.optionSelected;

		this.insufficient = false;

		this.errorMessage = ``;

		this.accountNumber = e.detail.accountNumber;

		this.accountType = e.detail.accountType;
	}

	_validateCheck() {

		if (this.optionSelected === false) {
			this.errorMessage = `Select an account to pay from`;
		} else if (this.checked === 0) { 
			this.errorMessage = `Select arrears amount to pay`;
		} else {
			this._payClick();
		}

		this.requestUpdate();

	}


	// #endregion

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
		
			${INSURE_CSS}

			.checkbox{
				border: 1px solid #e1e1e1;
				border-radius: 5px;
				padding: 10px;
				margin-bottom: 10px;
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
			<capitec-modal type="form" class="modal-body-label" header="Pay Arrears (${this.currentContractRef})"
			header-align="left">
			<div slot="body" class="modal-body">
				<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear" data-automation-id = "horizon-insure-pay-premium-dialog-body">
					${this._renderDialogBody()}
				</capitec-content-box>
			</div>
			<div slot="footer" data-automation-id="horizon-insure-pay-premium-dialog-footer">
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
			${this._renderErrorMessage()}

			<capitec-label type="subtitle" label="Choose an account">
			</capitec-label>
			
			<insure-account-select 
				@option-selected="${(e) => this._optionSelected(e)}" data-automation-id="horizon-insure-pay-premium-dialog-accounts"
				.accountDetails = "${this.clientArrears.payableAccounts}" .insufficient = "${this.insufficient}" .label= "${`Please select`}">
			</insure-account-select>

			
			<div style="display: flex; justify-content: space-between; margin-top: 30px">
				<capitec-label type="subtitle" label="Arrears amount payable"></capitec-label>
				<capitec-label type="subtitle" label="Total arrears amount: ${formatCurrency(this.totalAmount)}"></capitec-label>
			</div>
			
			<capitec-check-group>
				${this.clientArrears?.arrears?.map((outstanding, index) => html`
					${index === 0 ? html`
						<capitec-check class="checkbox" label="${formatDate(outstanding.dueDate, `MM yyyy`)} | ${formatCurrency(outstanding.amount)}"
							@value-change="${(e) => this._checkedChange(outstanding, index, e)}" data-automation-id="horizon-insure-pay-premium-dialog-arrears" >
						</capitec-check>
					` : html`
						<capitec-check class="checkbox" label="${formatDate(outstanding.dueDate, `MM yyyy`)} | ${formatCurrency(outstanding.amount)}"
							@value-change="${(e) => this._checkedChange(outstanding, index, e)}" data-automation-id="horizon-insure-pay-premium-dialog-arrears">
						</capitec-check>
						`}
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
				<capitec-button class="capitec-button-medium" label="Cancel" @click="${() => this._cancelClick()}"
				data-automation-id="horizon-insure-pay-premium-dialog-cancel">
				</capitec-button>
			
				<capitec-button class="capitec-button-medium" id="id-confirm-button" type="primary" label="Pay"
					@click="${() => this._validateCheck()}" data-automation-id="horizon-insure-pay-premium-dialog-pay">
				</capitec-button>
			</capitec-group>`;

	}

	_renderInsufficientFunds() {
		return this.insufficient === false ? html`` 
		: html`
			<capitec-toast class="error" type="error" header="Insufficient funds: Payment cannot exceed available balance" layout="horizontal" data-automation-id="horizon-insure-pay-premium-dialog-insufficient-funds"></capitec-toast>
		`;
	}

	_renderErrorMessage() {
		return !this.errorMessage ? html``
		: html`
			<capitec-toast class="error" type="error" header=${this.errorMessage} layout="horizontal" data-automation-id="horizon-insure-pay-premium-dialog-insufficient-funds"></capitec-toast>
		`;
	}

	// #endregion


}

window.customElements.define(`horizon-insure-pay-premium-dialog`, PayPremiumDialog);

/**
 * Send the selected arrears and chosen account to consuming component when 'Add' is clicked
 *
 * @example
 * <horizon-insure-pay-premium-dialog ... @pay-arrears="${this._handler}"></horizon-insure-pay-premium-dialog>
 *
 * @event PayPremiumDialog#pay-arrears
 * @type {Object} - N/A
 */

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-pay-premium-dialog ... @close-modal="${this._handler}"></horizon-insure-pay-premium-dialog>
 *
 * @event PayPremiumDialog#close-modal
 * @type {Object} - N/A
 */