import { Component, css, html } from 'platform/elements';
import { INSURE_PRODUCT_CODE } from 'app/constants/InsureCommon';

export class CFPAgreementDialog extends Component {

	/**
	 * Initialize
	 */
	constructor() {
		super();

		this.productCode = ``;
	}

	// #region PROPERTIES

	/**
	 * @property {String} productCode - insurance product code capitec/sanlam.
	 * @static
	 */
	 static get properties() {
		return {
			productCode: { type: String }
		};
	}

	// #endregion PROPERTIES

		// #region RENDERING

	/**
	 * Generates the view stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	 static get styles() {
		return [
			super.styles,
			css`
				.no-margin{
					margin-top: 0;
				}
			`
		];
	}

	/**
	 * Accept terms and close dialog 
	 * @returns {null} null
	 */
	_acceptAndClose() {
		this.dispatchEvent(new CustomEvent(`agreementAccepted`, { detail: { accepted: true } }));
	}

	/**
	 * Generates the component template for web mode
	 * @returns {html} html content
	 */
	_webTemplate() {
		return html`
		<capitec-modal type="form" header="Capitec Funeral Plan Agreement Declaration">
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
		if (this.productCode === INSURE_PRODUCT_CODE.CAPITEC) {
			return html`<strong>Capitec:</strong>
				<ul class="no-margin">
					<li>is a licensed financial services provider;</li>
					<li>earns a commission of 3.5% from the Insurer;</li>
				</ul>
				<p>This plan is underwritten by Capitec Life Insurance Company Limited, a licensed insurer and an Authorised Financial Services Provider</p>
				<p><strong>I:</strong></p>

				<ul class="no-margin">
					<li>work for Capitec who is liable for this service;</li>
					<li>will tell you about the Capitec Funeral Plan and your options and I cannot give you advice.</li>
				</ul>
				<p><strong>You:</strong></p>
				<ul class="no-margin">
					<li>must have an active Capitec savings account to have a Funeral Plan;</li>
					<li>cannot transfer the rights or obligations of a Funeral Plan to someone else.</li>
				</ul>`;
		} else if (this.productCode === INSURE_PRODUCT_CODE.CAPITEC_SANLAM) {
			return html` <strong>Capitec:</strong>
				<ul class="no-margin">
					<li>is a licensed financial services provider;</li>
					<li>earns a commission of 3.25% from the Insurer;</li>
				</ul>
				<p>This plan is underwritten by Centriq Life Insurance Company Limited, a licensed insurer and an Authorised Financial Services Provider</p>
				<p>I:</p>
				<ul class="no-margin">
					<li>work for Capitec who is liable for this service;</li>
					<li>will tell you about the Capitec Funeral Plan and your options and I cannot give you advice.</li>
				</ul>
				<p>You:</p>
				<ul class="no-margin">
					<li>must have an active Capitec savings account to have a Funeral Plan;</li>
					<li>cannot transfer the rights or obligations of a Funeral Plan to someone else.</li>
				</ul>`;
		} 
		
		return html``;
	}

	/**
	 * Render footer html of the dialog
	 * @returns {html} Action buttons
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="clear" label="Accept" @click="${() => this._acceptAndClose()}">
			</capitec-button>`;
	}
}
window.customElements.define(`horizon-insure-cfp-agreement-dialog`, CFPAgreementDialog);