
import { Component, css, html } from 'platform/elements';

/**
 * Dialog that will display the YP Agreement
 * 
 * Events Raised 
 * -------------
 * agreementAccepted
 * close-modal
 *  
 * @export
 * @class YPAgreementDialog
 * @extends {Component}
 */
export class YPAgreementDialog extends Component {

	
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
		<capitec-modal type="form" header="You Pay" style="--theme-modal-header-color: black;">
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
		<strong>Premiums</strong>
		<ul>
			<li>monthly, on your debit order date starting in the month after the signature date; </li>
			<li>no partial premium payments are allowed; </li>
			<li>calculated based on who you cover, how old they are and the amount you want to cover them for – if any of these change, the premium will change; </li>
			<li>may be reviewed every year. We’ll give you 31 days written notice if we need to increase premiums, change terms, provisions or conditions;</li>
			<li>arrears premiums will be deducted from any Cover Amount payable.</li>
		</ul>
		<strong>Premium waivers</strong>
		<ul>
			<li>Death Premium waiver: If you die after your plan has been active for 6 months, everyone covered for at least 6 months, will remain covered for 6 months without any premium payments.</li>
			<li>Voluntary Policy pause: 24 months after your cover started,  you can apply for a policy pause up to 6 months. You won’t pay premiums and cannot claim during this period. After 6 months your policy continues with the same cover and premium as before the pause. The benefit is available again after another 24 months;</li>
			<li>Newborn Premium waiver: 6 months after your cover started, you can apply for a premium waiver, within 3 months of giving birth or legally adopting a Child. You won’t pay premiums but will still be covered for 6 months.</li>
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
window.customElements.define(`horizon-insure-yp-agreement-dialog`, YPAgreementDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-yp-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-yp-agreement-dialog>
 *
 * @event YPAgreementDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree event to the consuming componant when agreement is accepted 
 *
 * @example
 * <horizon-insure-yp-agreement-dialog ... @agreementAccepted="${this._handler}"></horizon-insure-yp-agreement-dialog>
 *
 * @event YPAgreementDialog#agreementAccepted
 * @type {Object} - N/A
 */