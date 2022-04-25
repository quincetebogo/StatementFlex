
import { Component, css, html } from 'platform/elements';

export class EACLAgreementDialog extends Component {

	constructor() {
		super();
	}

	/**
	 * Accept terms and close dialog 
	 */
	_acceptAndClose() {
		this.dispatchEvent(new CustomEvent(`agreementAccepted`, { detail: { accepted: true } }));
	}

	/**
	 * Generates the component template for web mode
	 */
	_webTemplate() {
		return html`
		<capitec-modal type="form" header="You/your beneficiary are paid Agreement Declaration">
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
		In deciding who to include, please note:
		<ul>
			<li>Entry Age is how old the Life Assured is on the Cover Start Date and is used to calculate the premium
				and cover. Once on the plan, there are no age restrictions; </li>
			<li>By law the total amount that can be paid out for a child’s death is limited. These limits apply across
				all our plans, benefit types and bind Insurers.</li>
		</ul>`
	}

	/**
	 * Render footer html of the dialog
	 * @returns {html} Action buttons
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="clear" label="Accept" @click="${() => this._acceptAndClose()}">
			</capitec-button>`
	}
}
window.customElements.define(`horizon-insure-eacl-agreement-dialog`, EACLAgreementDialog);