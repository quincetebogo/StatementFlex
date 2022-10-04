
import { Component, css, html } from 'platform/elements';

export class YBPAgreementDialog extends Component {

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
		<capitec-modal type="form" header="You/your beneficiary are paid Agreement Disclosure">
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
		<strong>You/your beneficiary are paid:</strong>
		<ul>
			<li>The cover amount in the Schedule when a Life Assured dies only AFTER 6 months from the Cover Start Date;
			</li>
			<li>Double the Funeral Benefit cover amount in the Schedule when a Life Assured dies due to an accident any
				time after the Cover Start Date. </li>
		</ul>
		A Waiting Period will not be applicable on the Funeral Benefit if:
		<ul>
			<li>the Lives Assured were covered on a previous funeral policy with another Licensed Insurer within 31
				(thirty-one) days before the Cover Start Date or covered on a previous Capitec Funeral Cover Plan within
				2 (two) months before the Cover Start Date (“the previous policy”); and </li>
			<li>the previous policy has lapsed or was cancelled; and </li>
			<li>the waiting period expired in respect of that previous policy for the Life Assured.</li>
		</ul>
		<strong>Burial Repatriation:</strong> We will transport the deceased to the funeral home of the claimant’s
		choice from within the Republic of South Africa, Namibia, Zimbabwe, Botswana, Swaziland, Lesotho and Mozambique
		to the closest place of burial anywhere in South Africa.`;
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
window.customElements.define(`horizon-insure-ybp-agreement-dialog`, YBPAgreementDialog);