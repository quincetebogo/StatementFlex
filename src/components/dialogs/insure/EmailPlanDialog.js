import { Component, css, html } from 'platform/elements';

class EmailPlanDialog extends Component {

	//#region INITIALIZE

	constructor() {
		super();
	}

	//#endregion

	//#region PROPERTIES

	static get properties() {
		return {
			
		};
	}

	//#endregion

	//#region PRIVATE METHODS

	//#endregion

	//#region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 */
	 _onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	_onSendClick() {
		this.dispatchEvent(new CustomEvent(`send-email`, {}));
	}

	//#endregion

	//#region RENDERING

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

			.label {
				margin-bottom: 20px;
			}

			.textField {
				margin-bottom: 20px;
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
			<capitec-modal type="form" header="Email Funeral Plan ()">
				<div slot="body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer">
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	 _renderDialogBody() {
		return html`
			
			<div class="label">
				<capitec-label label="Enter email address" type="subtitle"></capitec-label>
			</div>

			<div class="textField">
				<capitec-text-field label="Email Address" value="Something@gmail.com" type="alpha-numeric"></capitec-text-field>
			</div>

			<div class="label">
				<capitec-label label="Confirm email" type="subtitle"></capitec-label>
			</div>

			<div class="textField">
				<capitec-text-field value="Confirm Email address" type="alpha-numeric"></capitec-text-field>
			</div>

		`}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button slot="footer" type="secondary" label="Cancel"
					@click="${() => this._onCancelClick()}">
				</capitec-button>
				<capitec-button slot="footer" type="primary" label="Send" 
					@click="${() => this._onSendClick()}">
				</capitec-button>
		`}

	//#endregion


}

window.customElements.define(`email-plan-dialog`, EmailPlanDialog);