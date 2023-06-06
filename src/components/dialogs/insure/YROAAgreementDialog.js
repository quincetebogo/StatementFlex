
import { Component, css, html } from 'platform/elements';

/**
 * Dialog that will display the YROA Agreement
 * 
 * Events Raised 
 * -------------
 * agreementAccepted
 * close-modal
 * 
 *  
 * @export
 * @class YBPAgreementDialog
 * @extends {Component}
 */
export class YROAAgreementDialog extends Component {

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
		<capitec-modal type="form" header="Your responsibility & Our accountability" style="--theme-modal-header-color: black;">
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
		<strong>Your responsibility </strong>
		<p>All information provided by you must be accurate. Any incorrect or incomplete information may have a negative impact when you claim.</p>
		<strong> Our Accountability </strong>
		<p>If you’re unhappy with our products or services, we have provided detailed contact information in the Agreement and on our website.</p>
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
window.customElements.define(`horizon-insure-yroa-agreement-dialog`, YROAAgreementDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-yroa-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-yroa-agreement-dialog>
 *
 * @event YROAAgreementDialog#close-modal
 * @type {Object} - N/A
 */


/**
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <horizon-insure-yroa-agreement-dialog ... @agreementAccepted="${this._handler}"></horizon-insure-yroa-agreement-dialog>
 *
 * @event YROAAgreementDialog#agreementAccepted
 * @type {Object} - N/A
 */