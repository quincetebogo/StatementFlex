import { Component, html } from 'platform/elements';

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
	 * Generates the component template for web mode
	 * @returns {html} html content 
	 */
	_webTemplate() {
		return html`
		<capitec-modal type="warn" header="Remove Family Member">
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
			<capitec-button type="clear" label="Cancel" @click="${() => this._cancelClick()}">
			</capitec-button>
			
			<capitec-button type="clear" label="Confirm" @click="${() => this._agreeClick()}">
			</capitec-button>
			<!-- </capitec-group> -->
			`;
	}

	// #endregion RENDERING

}

window.customElements.define(`remove-life-assured-dialog`, RemoveLifeAssuredDialog);

/**
 * send a close modal event to consuming component when 'cancel' is clicked
 *
 * @example
 * <remove-life-assured-dialog ... @close-modal="${this._handler}"></remove-life-assured-dialog>
 *
 * @event RemoveLifeAssuredDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree click event to consuming component when 'agree' is clicked
 *
 * @example
 * <remove-life-assured-dialog ... @agree-click="${this._handler}"></remove-life-assured-dialog>
 *
 * @event RemoveLifeAssuredDialog#agree-click
 * @type {Object} - N/A
 */