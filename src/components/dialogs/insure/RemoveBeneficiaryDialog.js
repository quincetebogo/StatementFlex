import { Component, html } from 'platform/elements';

/**
 * remove beneficiary dialog allows one to confirm whether they would like to remove the selected beneficiary
 * 
 * Events Raised 
 * -------------
 * close-modal
 * agree-click
 * 
 *  
 * @export
 * @class RemoveBeneficiaryDialog
 * @extends {Component}
 */
class RemoveBeneficiaryDialog extends Component {

	// #region INITIALIZE

	
	constructor() {
		super();

	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {String} beneficiaryName Name of beneficiary to remove
	 *
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			beneficiaryToRemoveDescription: { String: ``, state: true }
		};
	}

	// #endregion

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
		<capitec-modal type="warn" header="Remove Beneficiary">
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
			<p>Are you sure you want to remove <b>${this.beneficiaryToRemoveDescription}</b> from your <br>Funeral Plan? </p>
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

window.customElements.define(`horizon-insure-remove-beneficiary-dialog`, RemoveBeneficiaryDialog);

/**
 * send aclose modal event to consuming component when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-remove-beneficiary-dialog ... @close-modal="${this._handler}"></horizon-insure-remove-beneficiary-dialog>
 *
 * @event RemoveBeneficiaryDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree click event to consuming component when 'agree' is clicked
 *
 * @example
 * <horizon-insure-remove-beneficiary-dialog ... @agree-click="${this._handler}"></horizon-insure-remove-beneficiary-dialog>
 *
 * @event RemoveBeneficiaryDialog#agree-click
 * @type {Object} - N/A
 */