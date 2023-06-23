import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * remove Life Assured dialog allows one to confirm whether they would like to remove the selected Life Assured
 * 
 * Events Raised 
 * -------------
 * close-modal
 * agree-click
 * 
 *  
 * @export
 * @class RemoveLifeAssuredDialog
 * @extends {Component}
 */
class RemoveLifeAssuredDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {String} lifeToRemoveDescription description of the life to remove 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			lifeToRemoveDescription: { type: String, state: true }
		};
	}

	// #endregion PROPERTIES


	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	/**
	 * Add Event, Calculate cover details parameter, emit new life object to consuming component & reset toggles 
	 * @returns {void} 
	 */
	_agreeClick() {
		this.dispatchEvent(new CustomEvent(`agree-click`, {}));
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
		
			${INSURE_CSS}

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
		<capitec-modal type="free" header="Remove Family Member" style="--theme-modal-header-color: black;">
			<div slot="body">
				<capitec-content-box class="body-box">
					${this._renderDialogBody()}
				</capitec-content-box>
			</div>
			<div slot="footer">
				${this._renderDialogFooter()}
			</div>
		</capitec-modal>
		`;
	}

	/**
	* Render modal body section
	* 
	* @returns {html} The html content of the component.
	*/
	_renderDialogBody() {
		return html`
			<p>Are you sure you want to remove <b>${this.lifeToRemoveDescription}</b> from your <br>Funeral Plan? They will no
				longer be covered.</p>
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			<!-- <capitec-group > -->
			<capitec-button type="secondary" label="Cancel" @click="${() => this._cancelClick()}">
			</capitec-button>
			
			<capitec-button type="primary" label="Confirm" @click="${() => this._agreeClick()}">
			</capitec-button>
			<!-- </capitec-group> -->
			`;
	}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-remove-life-assured-dialog`, RemoveLifeAssuredDialog);

/**
 * send a close modal event to consuming component when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-remove-life-assured-dialog ... @close-modal="${this._handler}"></horizon-insure-remove-life-assured-dialog>
 *
 * @event RemoveLifeAssuredDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree click event to consuming component when 'agree' is clicked
 *
 * @example
 * <horizon-insure-remove-life-assured-dialog ... @agree-click="${this._handler}"></horizon-insure-remove-life-assured-dialog>
 *
 * @event RemoveLifeAssuredDialog#agree-click
 * @type {Object} - N/A
 */