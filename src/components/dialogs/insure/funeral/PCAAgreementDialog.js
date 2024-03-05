
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
		<capitec-modal type="form" header="Premium and Cover amount" style="--theme-modal-header-color: black;">
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
			<li>Lives are immediately covered for accidental death</li>
			<li>Please remember that there is a 6 month waiting period for natural death & suicide </li>
			<li>The details you provided must be correct. Incorrect information could have negative impact on  your claim and policy </li>
			<li>You confirm that you’ve listed family members living in SA permanently and related as detailed in schedule </li>
			<li>There is a limitation on cover on children that restricts payout to a certain amount across all polices </li>
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