
import { Component, css, html } from 'platform/elements';

/**
 * Dialog that will display the PCA Agreement
 * 
 * Events Raised 
 * -------------
 * agreementAccepted
 * close-modal
 *  
 * @export
 * @class PCAAgreementDialog
 * @extends {Component}
 */
export class PCAAgreementDialog extends Component {


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
		<capitec-modal type="form" header="Premium and Cover amount" style="user-select: text; --theme-modal-header-color: black;">
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
		<strong>Cover Amount</strong>
		<ul>
			<li>All lives assured are covered immediately for accidental death​</li>
			<li>Please remember that there is a 6-month waiting period for natural death and suicide​</li>
			<li>The details you have provided to us must always be correct. Any incorrect information could have a negative impact on your claim and policy in future​</li>
			<li>You confirm that all your family members including yourself live in South Africa permanently​</li>
			<li>Please note Legal limits apply to the total cover paid for children across our Funeral Plans​</li>
		</ul>
		<strong>Premiums</strong>
		<ul>
			<li>Must be made in full every month</li>
			<li>The amount may change if you make updates to your policy; or a live assured dies​</li>
			<li>We will give you 31 days' notice before we make changes to terms, including changes to your premiums​</li>
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
window.customElements.define(`horizon-insure-pca-agreement-dialog`, PCAAgreementDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-pca-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-pca-agreement-dialog>
 *
 * @event PCAAgreementDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree event to the consuming componant when agreement is accepted 
 *
 * @example
 * <horizon-insure-pca-agreement-dialog ... @agreementAccepted="${this._handler}"></horizon-insure-pca-agreement-dialog>
 *
 * @event PCAAgreementDialog#agreementAccepted
 * @type {Object} - N/A
 */