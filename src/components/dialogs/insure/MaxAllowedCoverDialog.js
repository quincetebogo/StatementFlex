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

	// #endregion

	// #region EVENT HANDLERS

	_onConfirmationClick() {
		this.dispatchEvent(new CustomEvent(`confirm`, {}));
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
			<capitec-modal type="free" header = "You have reached your maximum allowed funeral cover."> 
				<div slot="body" data-automation-id="insure-max-allowed-cover-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-max-allowed-cover-dialog-footer">
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
				@click="${() => this._onConfirmationClick()}"
				data-automation-id="insure-confirmation-dialog-confirm">
			</capitec-button>
		`;
	}

	// #endregion

}

window.customElements.define(`insure-max-allowed-cover-dialog`, MaxAllowedCoverDialog);

 /**
 * Send Confirmation dialog event to consuming component when 'Confirm' is clicked
 *
 * @example
 * <insure-max-allowed-cover-dialog ... @confirm="${this._onConfirmationClick}"></insure-max-allowed-cover-dialog>
 *
 * @event MaxAllowedCoverDialog#confirm
 * @type {Object} - N/A
 */