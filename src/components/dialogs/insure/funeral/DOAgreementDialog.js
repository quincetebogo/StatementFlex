
import { Component, css, html } from 'platform/elements';

/**
 * Dialog that will display the DO Agreement
 * 
 * Events Raised 
 * -------------
 * agreementAccepted
 * close-modal
 * 
 *  
 * @export
 * @class DOAgreementDialog
 * @extends {Component}
 */
export class DOAgreementDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
	}

	// #endregion INITIALIZE

	// #region EVENT HANDLERS

	/**
	 * Accept terms and close dialog 
	 * @returns {void} 
	 */
	_acceptAndClose() {
		this.dispatchEvent(new CustomEvent(`agreementAccepted`, { detail: { accepted: true } }));
	}

	/**
	 * Cancel dialog 
	 * @returns {void} 
	*/
	_cancelDialog() {
		this.dispatchEvent(new CustomEvent(`close-modal`, { detail: { accepted: false } }));
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

			capitec-modal {
				--theme-modal-header-background-color: #f7f7f7;
			}

		`
		];
	}

	/**
	 * Generates the component template for web mode
	 * @returns {html} html content
	 */
	_webTemplate() {
		return html`
		<capitec-modal type="form" header="Debit Order" style="--theme-modal-header-color: black;">
			<div slot="body">
				<capitec-content-box class="body-box">
					${this._renderDialogBody()}
				</capitec-content-box>
			</div>
			${this._renderDialogFooter()}
		</capitec-modal>`;
	}

	/**
	 * Render Agreement html of the dialog
	 * @returns {html} Agreement Copy
	 */
	_renderDialogBody() {
		return html`
		<ul>
			<li>Your premium is paid monthly by debit order from your nominated bank account and partial payments are not allowed</li>
			<li>We may review you premium annually and we’ll give 31 days written notice before making any changes</li>
			<li>Any arrears premiums will be deducted from your cover amount</li>
		</ul>
		`;
	}

	/**
	 * Render footer html of the dialog
	 * @returns {html} Action buttons
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="secondary" label="Cancel" @click="${() => this._cancelDialog()}">
			</capitec-button>
			<capitec-button slot="footer" type="primary" label="Accept" @click="${() => this._acceptAndClose()}">
			</capitec-button>`;
	}

	// #endregion RENDERING

}
window.customElements.define(`horizon-insure-do-agreement-dialog`, DOAgreementDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-do-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-do-agreement-dialog>
 *
 * @event DOAgreementDialog#close-modal
 * @type {Object} - N/A
 */


/**
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <horizon-insure-do-agreement-dialog ... @agreementAccepted="${this._handler}"></horizon-insure-do-agreement-dialog>
 *
 * @event DOAgreementDialog#agreementAccepted
 * @type {Object} - N/A
 */