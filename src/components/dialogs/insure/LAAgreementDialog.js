
import { Component, css, html } from 'platform/elements';

/**
 * Dialog that will display the LA Agreement
 * 
 * Events Raised 
 * -------------
 * agreementAccepted
 * close-modal
 *  
 * @export
 * @class LAAgreementDialog
 * @extends {Component}
 */
export class LAAgreementDialog extends Component {

	
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
		<capitec-modal type="form" header="Lives Assured" style="--theme-modal-header-color: black;">
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
		<strong>This Funeral Plan covers</strong>
		You and your family members who:
		<ul>
			<li>live in South Africa permanently; and </li>
			<li>are related to you in a way recognised by us in the Funeral  Agreement; and </li>
			<li>are listed by you in the Schedule. </li>
		</ul>
		In deciding who to include, please note:
		<ul>
			<li>Entry Age is how old the Life Assured is on the Cover Start Date and is used to calculate the premium and cover.</li>
			<li>By law the total amount that can be paid out for a child’s death is limited. These limits apply across all our plans and benefit types.</li>
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
window.customElements.define(`horizon-insure-la-agreement-dialog`, LAAgreementDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-la-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-la-agreement-dialog>
 *
 * @event LAAgreementDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree event to the consuming componant when agreement is accepted 
 *
 * @example
 * <horizon-insure-la-agreement-dialog ... @agreementAccepted="${this._handler}"></horizon-insure-la-agreement-dialog>
 *
 * @event LAAgreementDialog#agreementAccepted
 * @type {Object} - N/A
 */