
import { Component, css, html } from 'platform/elements';

export class CancelPolicyConfirmationDialog extends Component {

	/**
	 * Initialize
	 */
	constructor() {
		super();
	}

	/**
	 * Accept terms and close dialog 
	 */
	_confirmAndClose() {
		this.dispatchEvent(new CustomEvent(`confirm`, { detail: {} }));
	}

	/**
	 * Generates the component template for web mode
	 */
	_webTemplate() {
		return html`
		<capitec-modal type="result" result="warn" header="Cancel Plan">
			<div slot="body">
				<capitec-content-box class="body-box">
					${this._renderDialogBody()}
				</capitec-content-box>
			</div>
			${this._renderDialogFooter()}
		</capitec-modal>`
	}

	/**
	 * Render Agreement html of the dialog
	 * @returns {html} Agreement Copy
	 */
	_renderDialogBody() {
		return html`

		<div> 
			By canceling this plan you will no longer have any benefitson this plan. Ensure you have carefully considerd the effects before continuing with the cancelation
		</div>

		`
	}

	/**
	 * Render footer html of the dialog
	 * @returns {html} Action buttons
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="clear" label="Back" @click="${() => this._backClick()}">
			</capitec-button>
			<capitec-button slot="footer" type="clear" label="Confirm" @click="${() => this._confirmAndClose()}">
			</capitec-button>`
	}
}
window.customElements.define(`insure-cancel-policy-confirmation-dialog`, CancelPolicyConfirmationDialog);