import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * Client unable to take any more funeral cover
 * 
 * Events Raised 
 * -------------
 * confirm
 *  
 * @export
 * @class MaxAllowedCoverDialog
 * @extends {Component}
 */
class MaxAllowedCoverDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
	}

	// #endregion INITIALIZE

	// #region EVENT HANDLERS

	/**
	 *  confirm and close modal
	 * @returns {void}
	 */
	_confirmationClick() {
		this.dispatchEvent(new CustomEvent(`confirm`, {}));
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
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			<capitec-modal type="free" header = "You have reached your maximum allowed funeral cover." style="--theme-modal-header-color: black;"> 
				<div slot="body" data-automation-id="horizon-insure-max-allowed-cover-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="horizon-insure-max-allowed-cover-dialog-footer">
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
			<capitec-label label = "You have reached your maximum allowed funeral cover." type = "strong"></capitec-label>
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
				@click="${() => this._confirmationClick()}"
				data-automation-id="horizon-insure-confirmation-dialog-confirm">
			</capitec-button>
		`;
	}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-max-allowed-cover-dialog`, MaxAllowedCoverDialog);

 /**
 * Send Confirmation dialog event to consuming component when 'Confirm' is clicked
 *
 * @example
 * <horizon-insure-max-allowed-cover-dialog ... @confirm="${this._confirmationClick}"></horizon-insure-max-allowed-cover-dialog>
 *
 * @event MaxAllowedCoverDialog#confirm
 * @type {Object} - N/A
 */