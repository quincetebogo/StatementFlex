
import { Component, css, html } from 'platform/elements';

/**
 * Dialog that will confirmamtion message for removing life from inception
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
export class AmendConfirmRemoveLifeDialog extends Component {


	// #region INITIALIZE

	constructor() {
		super();
	}

	// #endregion INITIALIZE

	// #region EVENT HANDLERS

	/**
	 * Confrim choice
	 * @returns {void} 
	*/
	_confirmAndClose() {
		this.dispatchEvent(new CustomEvent(`confirm-change`, { detail: {} }));
	}

	/**
	 * Cancel and close modal 
	 * @returns {void} 
	*/
	_cancel() {
		this.dispatchEvent(new CustomEvent(`close-modal`, { detail: {} }));
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
			
			.selectable-text {
				user-select: text !important;
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
		<capitec-modal type="form" class="selectable-text" header="Remove Life" style="--theme-modal-header-color: black; z-index: 10000;">
			<div slot="body">
				<capitec-content-box class="body-box selectable-text">
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
		<strong>Remove a life: </strong>
		A request will be sent to remove this life from the Cover Start Date.
		`;
	}

	/**
	 * Render footer html of the dialog
	 * @returns {html} Action buttons
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="secondary" label="Back" @click="${() => this._cancel()}">
			</capitec-button>
			<capitec-button slot="footer" type="primary" label="Confirm" @click="${() => this._confirmAndClose()}">
			</capitec-button>`;
	}

	// #endregion RENDERING
}
window.customElements.define(`horizon-insure-amend-confirm-remove-life-dialog`, AmendConfirmRemoveLifeDialog);