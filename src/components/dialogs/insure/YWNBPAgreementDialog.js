
import { Component, css, html } from 'platform/elements';

/**
 * Dialog that will display the YWNBP Agreement
 * 
 * Events Raised 
 * -------------
 * agreementAccepted
 * close-modal
 *  
 * @export
 * @class YWNBPAgreementDialog
 * @extends {Component}
 */
export class YWNBPAgreementDialog extends Component {

	
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
	 * Cancel and close modal 
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
		<capitec-modal type="form" header="You will not be paid" style="--theme-modal-header-color: black;">
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
		<strong>You will not be paid:</strong>
		<ul>
			<li>if a Life Assured dies because of participating in any illegal acts, active participation in war, civil commotion, illegal strikes etc. The full list of exclusions is in the Funeral Plan;</li>
			<li>when a Life Assureds dies within 6 months from the Cover Start Date and the death is natural, unless the Insurer waives the waiting period. </li>
		</ul>`;
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
window.customElements.define(`horizon-insure-ywnbp-agreement-dialog`, YWNBPAgreementDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-ywnbp-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-ywnbp-agreement-dialog>
 *
 * @event LAAgreementDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree event to the consuming componant when agreement is accepted 
 *
 * @example
 * <horizon-insure-ywnbp-agreement-dialog ... @agreementAccepted="${this._handler}"></horizon-insure-ywnbp-agreement-dialog>
 *
 * @event LAAgreementDialog#agreementAccepted
 * @type {Object} - N/A
 */