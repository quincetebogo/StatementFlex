
import { Component, css, html } from 'platform/elements';

/**
 * Dialog that will display the Bene Agreement
 * 
 * Events Raised 
 * -------------
 * agreementAccepted
 * close-modal
 * 
 *  
 * @export
 * @class BeneAgreementDialog
 * @extends {Component}
 */
export class BeneAgreementDialog extends Component {

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
		<capitec-modal type="form" header="Beneficiaries" style=" user-select: text; --theme-modal-header-color: black;">
			<div slot="body">
				<capitec-content-box class="body-box" style="user-select: text;">
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
		<strong>You/Your Beneficiary:</strong>
		<ul>
			<li>Your Beneficiary will be paid the amount allocated to them when you pass away of natural death after the 6-month waiting period where applicable</li>
			<li>Your Beneficiary will be paid double the amount allocated to them if your death is accidental​</li>
			<li>Please make sure that your nominated Beneficiary is aware of this policy as well as the Claims process​</li>
			<li>Your Beneficiary will not be paid if you die due to participating in illegal acts, active participation in war, civil commotion, illegal strikes etc and other reasons set out in your Policy. The full list of exclusions is listed in the funeral plan agreement​​</li>
		</ul>
		<strong>Premiums:</strong>
		<ul>
			<li>Note any premiums in arrears will be deducted from the cover amount payable</li>
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
window.customElements.define(`horizon-insure-bene-agreement-dialog`, BeneAgreementDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-bene-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-bene-agreement-dialog>
 *
 * @event BeneAgreementDialog#close-modal
 * @type {Object} - N/A
 */


/**
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <horizon-insure-bene-agreement-dialog ... @agreementAccepted="${this._handler}"></horizon-insure-bene-agreement-dialog>
 *
 * @event BeneAgreementDialog#agreementAccepted
 * @type {Object} - N/A
 */