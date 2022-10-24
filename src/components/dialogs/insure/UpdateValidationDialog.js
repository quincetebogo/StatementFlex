import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * Update Validation Dialog component will allow you to confirm
 * 
 * Events Raised 
 * -------------
 * confirm
 *  
 * @export
 * @class InsureConfirmationDialog
 * @extends {Component}
 */
class UpdateValidationDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
	}

	// #endregion

	// #region PROPERTIES

	/**
	 * @property {String} body - confirmation message
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			confirmationMessage: { type: Object, state: true }
		};
	}

	// #endregion

	// #region PRIVATE METHODS

	// #endregion

	// #region EVENT HANDLERS

	_onConfirmationClick() {
		this.dispatchEvent(new CustomEvent(`confirmation-click`, {}));
	}

	// #endregion

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
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			<capitec-modal type="free" header = "Unable to Calculate"> 
				<div slot="body" data-automation-id="insure-update-validation-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-update-validation-dialog-footer">
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
		<capitec-content-box>
			<capitec-label label = "One or more required fields are missing" type = "strong"></capitec-label>
		</capitec-content-box>
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="primary" label="Ok" class="capitec-button-small"
				@click="${() => this._onConfirmationClick()}"
				data-automation-id="insure-confirmation-dialog-confirm">
			</capitec-button>
		`;
	}

	// #endregion

}

window.customElements.define(`insure-update-validation-dialog`, UpdateValidationDialog);

 /**
 * Send Confirmation dialog event to consuming component when 'Confirm' is clicked
 *
 * @example
 * <insure-update-validation-dialog ... @confirmation-click="${this._onConfirmationClick}"></insure-update-validation-dialog>
 *
 * @event InsureUpdateValidationDialog#confirm
 * @type {Object} - N/A
 */