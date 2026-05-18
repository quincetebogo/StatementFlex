
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
export class AmendRelationshipInfoDialog extends Component {


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
	_navigateToAmendRelationship() {
		this.dispatchEvent(new CustomEvent(`navigateToAmend`, { detail: {} }));
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
		<capitec-modal type="form" class="selectable-text" header="Discontinued Relationships" style="--theme-modal-header-color: black;">
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
		<strong>Relationship update required for cover increases</strong>
		<p>
		We have simplified the relationship types on our Funeral Cover Plan. You have covered lives on your policy that fall into these categories. You must please update these relationships if you want to increase the cover on this life assured.
		</p>
		`;
	}

	/**
	 * Render footer html of the dialog
	 * @returns {html} Action buttons
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="secondary" label="Back" @click="${() => this._cancelDialog()}">
			</capitec-button>
			<capitec-button slot="footer" type="primary" label="Amend" @click="${() => this._navigateToAmendRelationship()}">
			</capitec-button>`;
	}

	// #endregion RENDERING
}
window.customElements.define(`horizon-insure-amend-relationship-info-dialog`, AmendRelationshipInfoDialog);