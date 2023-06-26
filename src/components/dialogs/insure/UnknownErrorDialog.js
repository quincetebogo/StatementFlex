import { Component, css, html } from 'platform/elements';

/**
 *Unknown Error modal will be shown when an unknown Error occurs
 * 
 * Events Raised 
 * -------------
 * close-modal
 *  
 * @export
 * @class PayPremiumAgreementDialog
 * @extends {Component}
 */
class UnknownErrorDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();


	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
		};
	}

	// #endregion PROPERTIES
 
	// #region PRIVATE METHODS

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Okay event from dialog footer button, closes modal 
	 * @returns {void} 
	 */
	_confirmClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
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
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			<capitec-modal type="result" result="error" header="Error occurred">
				<div slot="body">
					${this._renderDialogBody()}
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
			
			<div>
				<capitec-label label="Oops. An unknown error has occurred." type="subtitle"></capitec-label>
			</div>


		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button slot="footer" type="primary" label="Okay" 
					@click="${() => this._confirmClick()}">
				</capitec-button>
		`;
	}

	// #endregion RENDERING 


}

window.customElements.define(`horizon-insure-unknown-error-dialog`, UnknownErrorDialog);

 /**
 * Send Confirm Payment dialog event to consuming componant when 'Confirm' is clicked
 *
 * @example
 * <horizon-insure-unknown-error-dialog ... @agree="${this._handler}"></horizon-insure-unknown-error-dialog>
 *
 * @event UnknownErrorDialog#confirm-payment
 * @type {Object} - N/A
 */