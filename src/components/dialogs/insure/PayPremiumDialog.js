import { Component, css, html, unsafeCSS } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatDate } from 'app/utils/channelServiceUtilities';
import 'app/components/insure/InsureAccountSelect';

// Lookups
import { CLIENT_ACCOUNTS} from 'app/constants/InsureCommon';

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

	this.checked = false;
	
	// Lookups
	this.clientAccounts = CLIENT_ACCOUNTS;
}

//#endregion

//#region PROPERTIES

	/**
	 * @property {Object} clientArrears Data & flags from Arrears Service
	 * @property {Object} payArrears Data & flags for Pay Arrears service request
	 * @property {boolean} checked Determines if an Arrear was selected
	 * 
	 * @readonly
	 * @static
	 */
	 static get properties() {
		return {
			clientArrears: { type: Object },
			payArrears: {type: Object},
			checked: {boolean: false},
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

	/**
	 * Initialize component when loaded / Count current lives in list and set limits
	 */
	 _initialise() {
		this.payArrears = {};
		this.payArrears.arrears = [];
		this.payArrears.contractReference = "";
		this.payArrears.fromAccount = "";
		this.payArrears.cifNumber = "";

		
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
	 * Pay Event, emits payArrears object containg the Arrears that are to be paid & resets toggles 
	 */
	_onPayClick() {

		this.dispatchEvent(new CustomEvent(`pay-arrears`, {detail: this.payArrears}));
	}

	/**
	 * Event that checks if Arrears have been selected to enable the Pay button
	 * 
	 * @param {} outstanding Live object at index that was clicked
	 * @param {*} e contains new value of checkbox
	 */
	_checkedChange(outstanding, e) {
		

		this._addSelected(outstanding, e);

		console.log(this.payArrears.arrears);

		if (this.payArrears.arrears.length > 0) {
			this.checked = true
		} else {
			this.checked = false;
		}
		

	}

	/**
	 * Event that adds the selected Arrear to the payArrears Object and removes an unselected Arrear from the payArrears Object
	 * 
	 * @param {} selected Live object at index that was clicked
	 * @param {*} e contains new value of checkbox
	 */
	_addSelected(selected, e) {
		if (e.detail.new == true) {
			this.payArrears.arrears.push({
			dueDate: selected.dueDate,
			amount: selected.amount,
			objectID: selected.objectID,
			})
		} else {
			const index = this.payArrears.arrears.map(object => object.objectID).indexOf(selected.objectID);
			this.payArrears.arrears.splice(index, 1);
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

		`
		];
	}


	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			<capitec-modal data-automation-id="insure-pay-arrears-dialog" type="form" class="modal-body-label" header="Pay Arrears (${this.clientArrears.contractReference})"
			header-align="left">
			<div slot="body" class="modal-body">
				<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear" data-automation-id = "insure-pay-arrears-dialog-body">
					${this._renderDialogBody()}
				</capitec-content-box>
			</div>
			<div slot="footer" data-automation-id="insure-pay-arrears-dialog-footer">
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

			<insure-account-select></insure-account-select>

			<capitec-label type="subtitle" label="Choose payment method">
			</capitec-label>
			
			<capitec-select 
				label="Choose an account" .items="${this.clientAccounts}" display-field="text" id-field="code" data-automation-id="insure-pay-arrears-dialog-accounts">
			</capitec-select>
			
			<capitec-label type="subtitle" label="Arrear amount">
			</capitec-label>

			<capitec-check-group>
						${this.clientArrears.arrears.map((outstanding, index) => html`
							${index != 0 || index == 0 ? html`
								<capitec-check class="checkbox" label=" ${formatDate(outstanding.dueDate, 'MM yyyy')} | ${formatCurrency(outstanding.amount)}"
								@value-change=" ${(e) => this._checkedChange(outstanding,e)}" data-automation-id="insure-pay-arrears-dialog-arrears">
								</capitec-check>
							` : html``}
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
				<capitec-button class="buttons" data-automation-id="" label="Cancel" @click="${() => this._onCancelClick()}"
				data-automation-id="insure-pay-arrears-dialog-cancel">
				</capitec-button>
			
				<capitec-button class="buttons" data-automation-id="" id="id-confirm-button" type="primary" label="Pay"
					@click="${() => this._onPayClick()}" .disabled=${this.checked == false} data-automation-id="insure-pay-arrears-dialog-pay">
				</capitec-button>
			</capitec-group>`;
		
		}


	

//#endregion


}

window.customElements.define(`pay-premium-dialog`, PayPremiumDialog);

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