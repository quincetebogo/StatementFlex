import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';


/**
 * Pay Premium Confirmation Dialog componant will allow you to confirm whether you would like to pay the required amount or not
 * 
 * Events Raised 
 * -------------
 * close-modal
 * confirm-payment
 *  
 * @export
 * @class PayPremiumAgreementDialog
 * @extends {Component}
 */
class PayPremiumConfirmationDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();


	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Number} amountToPay Total arrears amount to be paid
	 * @property {Object} contractReference contains the contract reference
	 * @property {String} fromAccount account number of the account being paid from
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {

			amountToPay: { type: Number, state: true },
			contractReference: { type: String, state: true },
			fromAccount: { type: String, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region PRIVATE METHODS

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	 _cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	/**
	 * comfirm event from the dialog footer button
	 * @returns {void}
	 */
	_confirmClick() {
		this.dispatchEvent(new CustomEvent(`confirm-payment`, {}));
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
				${INSURE_CSS}
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			<capitec-modal type="result" result="warn" header="Pay">
				<div slot="body" data-automation-id="horizon-insure-pay-premium-confirmation-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="horizon-insure-pay-premium-confirmation-dialog-footer">
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`;
	}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	 _renderDialogBody() {
		return html`
			
			<div>
				<capitec-label label="Pay ${formatCurrency(this.amountToPay)} to funeral plan ${this.contractReference} from savings account ${this.fromAccount}" type="subtitle"></capitec-label>
			</div>


		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button slot="footer" type="secondary" label="Cancel" class="capitec-button-medium"
					@click="${() => this._cancelClick()}"
					data-automation-id="horizon-insure-pay-premium-confirmation-dialog-cancel">
				</capitec-button>
				<capitec-button slot="footer" type="primary" label="Confirm" class="capitec-button-medium"
					@click="${() => this._confirmClick()}"
					data-automation-id="horizon-insure-pay-premium-confirmation-dialog-confirm">
				</capitec-button>
		`;
	}

	// #endregion RENDERING
 

}

window.customElements.define(`horizon-insure-pay-premium-confirmation-dialog`, PayPremiumConfirmationDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-pay-premium-confirmation-dialog ... @close-modal="${this._handler}"></horizon-insure-pay-premium-confirmation-dialog>
 *
 * @event PayPremiumConfirmationDialog#close-modal
 * @type {Object} - N/A
 */

 /**
 * Send Confirm Payment dialog event to consuming componant when 'Confirm' is clicked
 *
 * @example
 * <horizon-insure-pay-premium-confirmation-dialog ... @confirm-payment="${this._handler}"></horizon-insure-pay-premium-confirmation-dialog>
 *
 * @event PayPremiumConfirmationDialog#confirm-payment
 * @type {Object} - N/A
 */