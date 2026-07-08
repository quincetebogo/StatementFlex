
import { Component, css, html } from 'platform/elements';

/**
 * Dialog that will display the Amend Policy info
 * 
 * @export
 * @class AmendActionInfoDialog
 * @extends {Component}
 */
export class AmendActionInfoDialog extends Component {


	// #region INITIALIZE

	constructor() {
		super();
	}

	// #endregion INITIALIZE

	// #region EVENT HANDLERS

	/**
	 * Cancel and close modal 
	 * @returns {void} 
	*/
	_confirmAndClose() {
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
		<capitec-modal type="form" class="selectable-text" header="Amend Actions" style="--theme-modal-header-color: black; z-index: 10000;">
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
		We have simplified the relationship types on our Funeral Cover Plan. You have covered lives on your policy that fall into these categories. You must please update these relationships if you want to reissue this policy.

		`;
	}

	/**
	 * Render footer html of the dialog
	 * @returns {html} Action buttons
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="primary" label="Confirm" @click="${() => this._confirmAndClose()}">
			</capitec-button>`;
	}

	// #endregion RENDERING
}
window.customElements.define(`horizon-insure-amend-action-info-dialog`, AmendActionInfoDialog);