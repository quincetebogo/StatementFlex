import { Component, css, html } from 'platform/elements';
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

	//#region INITIALIZE

	constructor() {
		super();


	}

	//#endregion

	//#region PROPERTIES

	/**
	 * @property {Object} amountToPay Total arrears amount to be paid
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {

			amountToPay: {type: Object, state: true}
			
		};
	}

	//#endregion

	//#region PRIVATE METHODS

	//#endregion

	//#region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 */
	 _onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	_onConfirmClick() {
		this.dispatchEvent(new CustomEvent(`confirm-payment`, {}));
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
				<div slot="body" data-automation-id="insure-pay-premium-confirmation-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-pay-premium-confirmation-dialog-footer">
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	 _renderDialogBody() {
		return html`
			
			<div>
				<capitec-label label="Pay ${formatCurrency(this.amountToPay)} to funeral plan number 'CF34416'?" type="subtitle"></capitec-label>
			</div>


		`}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button slot="footer" type="secondary" label="Cancel"
					@click="${() => this._onCancelClick()}"
					data-automation-id="insure-pay-premium-confirmation-dialog-cancel">
				</capitec-button>
				<capitec-button slot="footer" type="primary" label="Confirm" 
					@click="${() => this._onConfirmClick()}"
					data-automation-id="insure-pay-premium-confirmation-dialog-confirm">
				</capitec-button>
		`}

	//#endregion


}

window.customElements.define(`insure-pay-premium-confirmation-dialog`, PayPremiumConfirmationDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <insure-pay-premium-confirmation-dialog ... @close-modal="${this._handler}"></insure-pay-premium-confirmation-dialog>
 *
 * @event PayPremiumConfirmationDialog#close-modal
 * @type {Object} - N/A
 */

 /**
 * Send Confirm Payment dialog event to consuming componant when 'Confirm' is clicked
 *
 * @example
 * <insure-pay-premium-confirmation-dialog ... @agree="${this._handler}"></insure-pay-premium-confirmation-dialog>
 *
 * @event PayPremiumConfirmationDialog#confirm-payment
 * @type {Object} - N/A
 */