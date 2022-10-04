
import { Component, css, html } from 'platform/elements';

export class YROAAgreementDialog extends Component {

	/**
	 * Initialize
	 */
	constructor() {
		super();
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
	 * @returns {null} null
	 */
	_webTemplate() {
		return html`
		<capitec-modal type="form" header="Your responsibility & Our Accountability Agreement Disclosure">
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
		<strong>Your Responsibility </strong>
		<ul>
			<li>You must give us accurate and true personal information, yours and all the Lives Assured; </li>
			<li>Any misrepresentation, incorrect or non-disclosure of information or circumstances may have a negative
				impact when you claim. </li>
		</ul>
		<strong> Our Accountability </strong>
		<p>If you’re unhappy with our products or services, we have provided detailed contact information in the
			Agreement and on our website. Please call our 24hr Client Care Centre. </p>
		If you are still not satisfied please complain to:
		<ul>
			<li>Centriq’s Complaints or Compliance department</li>
			<li>the FAIS Ombudsman </li>
			<li>the Long-term Insurance Ombudsman </li>
		</ul>
		<p>You will find their contact details in your Funeral Cover Plan Agreement. </p>
		<p>We may unilaterally change the terms, provisions and conditions of the Funeral Cover Plan by giving you at
			least 31 days’ written notice. </p>
		`;
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
window.customElements.define(`horizon-insure-yroa-agreement-dialog`, YROAAgreementDialog);