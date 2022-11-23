import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * Confirmation Dialog component will allow you to confirm
 * 
 * Events Raised 
 * -------------
 * confirm
 *  
 * @export
 * @class InsureConfirmationDialog
 * @extends {Component}
 */
class InsureConfirmationDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
	}

	// #endregion INITIALIZE
 
	// #region PROPERTIES

	/**
	 * @property {String} confirmationMessage - confirmation message
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			confirmationMessage: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region PRIVATE METHODS

	// #endregion

	// #region EVENT HANDLERS

	/**
	 *  confirm and close dialog
	 * 
	 * @returns {void}
	 */
	_onConfirmationClick() {
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
			<capitec-modal type="free">
				<div slot="body" data-automation-id="insure-confirmation-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-confirmation-dialog-footer">
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
				${this.confirmationMessage}
	 		</capitec-content-box>`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="primary" label="Ok" class="capitec-button-medium"
				@click="${() => this._onConfirmationClick()}"
				data-automation-id="insure-confirmation-dialog-confirm">
			</capitec-button>
		`;
	}

	// #endregion RENDERING

}

window.customElements.define(`insure-confirmation-dialog`, InsureConfirmationDialog);

 /**
 * Send Confirmation dialog event to consuming component when 'Confirm' is clicked
 *
 * @example
 * <insure-confirmation-dialog ... @confirmation-click="${this._onConfirmationClick}"></insure-confirmation-dialog>
 *
 * @event InsureConfirmationDialog#confirm
 * @type {Object} - N/A
 */