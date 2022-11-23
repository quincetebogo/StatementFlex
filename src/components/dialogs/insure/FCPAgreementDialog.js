
import { Component, css, html } from 'platform/elements';

/**
 * Dialog that will display the FCP Agreement
 * 
 * Events Raised 
 * -------------
 * agreementAccepted
 * close-modal
 *  
 * @export
 * @class EACLAgreementDialog
 * @extends {Component}
 */
export class FCPAgreementDialog extends Component {

	
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
	 * Generates the component template for web mode
	 * @returns {html} html content
	 */
	_webTemplate() {
		return html`
		<capitec-modal type="form" header="Funeral cover plan Agreement Disclosure">
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
		<strong>The Funeral Plan: </strong>
		<p><strong>Starts: </strong></p>
		<ul>
			<li>Immediately on the date of signature of this agreement, and certain benefits are payable from the
				Cover
				Start Date </li>
		</ul>
		<strong>Ends if: </strong>
		<ul>
			<li>You or Capitec cancel your Funeral Cover Plan;</li>
			<li>You cancel in the cooling off period of 31 days from the Cover Start Date without claim, and you
				will
				receive a full refund of premiums paid; </li>
			<li>You cancel at any other time with no refund of premiums already paid; </li>
			<li>Your Capitec savings account is closed; </li>
			<li>You are in arrears with 3 premiums. Your Funeral Cover Plan will then be terminated with effect from
				the
				date of the last premium received by Us. </li>
			<li>You as the policyholder dies and the Death Premium Waiver benefit ends; </li>
			<li>Fraud is confirmed.</li>
		</ul>`;
	}

	/**
	 * Render footer html of the dialog
	 * @returns {html} Action buttons
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="clear" label="Cancel" @click="${() => this._cancelDialog()}">
			</capitec-button>
			<capitec-button slot="footer" type="clear" label="Accept" @click="${() => this._acceptAndClose()}">
			</capitec-button>`;
	}

	// #endregion RENDERING
}
window.customElements.define(`horizon-insure-fcp-agreement-dialog`, FCPAgreementDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-fcp-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-fcp-agreement-dialog>
 *
 * @event FCPAgreementDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree event to the consuming componant when agreement is accepted 
 *
 * @example
 * <horizon-insure-fcp-agreement-dialog ... @agreementAccepted="${this._handler}"></horizon-insure-fcp-agreement-dialog>
 *
 * @event FCPAgreementDialog#agreementAccepted
 * @type {Object} - N/A
 */