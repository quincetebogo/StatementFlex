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
class TestDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		console.log("in test dialog")

	}

	// #endregion

	// #region PROPERTIES

	/**
	
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			payAmount: { type: Number, state: true },
			contractReference: { type: String, state: true },
			getArrearsPaymentDocument: { type: Object, state: true },
			arrearsPaymentDocumentDetails: { type: Object, state: true }
		}; 
	}

	// #endregion

	// #region PRIVATE METHODS

	// #endregion

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {null} null
	 */
	 _onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
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
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			<capitec-modal type="form" header="Pay Arrears Agreement Hello (${this.contractReference})">
			<div slot="body">
		This is the modal content area with a short description of what the modal is about fok.
	</div>
				<div slot="footer" data-automation-id="insure-pay-premium-agreement-dialog-footer">
					
				</div>
			</capitec-modal>
		`;
	}


	// #endregion


}

window.customElements.define(`insure-test-dialog`, TestDialog);