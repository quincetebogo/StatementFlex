import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * Update Validation Dialog component will allow you to confirm
 * 
 * Events Raised 
 * -------------
 * confirmation-click
 *  
 * @export
 * @class UpdateValidationDialog
 * @extends {Component}
 */
class UpdateValidationDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Object} validationMessage - validation message
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			validationMessage: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region PRIVATE METHODS

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * dispatch confirmation click event
	 * @returns {void}
	 */
	_confirmationClick() {
		this.dispatchEvent(new CustomEvent(`confirmation-click`, {}));
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
				<div slot="body" data-automation-id="horizon-insure-update-validation-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="horizon-insure-update-validation-dialog-footer">
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
			${this.validationMessage}
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
			<capitec-button slot="footer" type="primary" label="Ok" class="capitec-button-medium"
				@click="${() => this._confirmationClick()}"
				data-automation-id="horizon-insure-confirmation-dialog-confirm">
			</capitec-button>
		`;
	}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-update-validation-dialog`, UpdateValidationDialog);

 /**
 * Send Confirmation dialog event to consuming component when 'Confirm' is clicked
 *
 * @example
 * <horizon-insure-update-validation-dialog ... @confirmation-click="${this._confirmationClick}"></horizon-insure-update-validation-dialog>
 *
 * @event InsureUpdateValidationDialog#confirm
 * @type {Object} - N/A
 */