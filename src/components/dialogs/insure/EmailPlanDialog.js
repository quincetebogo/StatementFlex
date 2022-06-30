import { Component, css, html } from 'platform/elements';

/**
 * Email plan dialog component will allow for an email address to be entered and confirmed
 * 
 * Events Raised 
 * -------------
 * send-email
 * close-modal
 *  
 * @export
 * @class EmailPlanDialog
 * @extends {Component}
 */
class EmailPlanDialog extends Component {

	//#region INITIALIZE

	constructor() {
		super();
	}

	//#endregion

	//#region PROPERTIES

	static get properties() {
		return {
			contractReference: {type: String, state: true}
		};
	}

	//#endregion

	//#region PRIVATE METHODS

	//#endregion

	//#region EVENT HANDLERS

	/**
	 * Send event from dialog footer button, closes modal & reset toggles 
	 */
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
				font-weight: bold;
			}

			.textField {
				margin-bottom: 20px;
			}

			.button {
				width: 150px;
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
			<capitec-modal type="form" header="Email Funeral Plan (${this.contractReference})">
				<div slot="body" data-automation-id="insure-email-plan-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-email-plan-dialog-footer">
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
				<capitec-label label="Enter email address" type="subtitle" style="font-weight: bold;"></capitec-label>
			</div>

			<div class="textField">
				<capitec-text-field label="Email Address" value="Something@gmail.com" type="alpha-numeric"
					data-automation-id="insure-email-plan-dialog-email-address">
				</capitec-text-field>
			</div>

			<div class="label">
				<capitec-label label="Confirm email" type="subtitle" style="font-weight: bold;"></capitec-label>
			</div>

			<div class="textField">
				<capitec-text-field value="Confirm Email address" type="alpha-numeric"
					data-automation-id="insure-email-plan-dialog-confirm-email">
				</capitec-text-field>
			</div>

		`}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				
				<capitec-button class="button" slot="footer" type="primary" label="Send" 
					@click="${() => this._onSendClick()}"
					data-automation-id="insure-email-plan-dialog-send">
				</capitec-button>
		`}

	//#endregion


}

window.customElements.define(`insure-email-plan-dialog`, EmailPlanDialog);

/**
 * Send send email dialog event to consuming componant when cancel is clicked and navigate to email success page
 *
 * @example
 * <insure-email-plan-dialog ... @send-email="${this._handler}"></insure-email-plan-dialog>
 *
 * @event EmailPlanDialog#send-email
 * @type {Object} - N/A
 */

