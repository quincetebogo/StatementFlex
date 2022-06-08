import { Component, css, html } from 'platform/elements';

// Lookups
import { CANCELATION_REASONS } from 'app/constants/InsureCommon';

/**
 * cancel policy dialog 
 * 
 * Events Raised 
 * -------------
 * close-modal
 * email-plan
 * agree
 *  
 * @export
 * @class CancelPolicyDialog
 * @extends {Component}
 */
class CancelPolicyDialog extends Component {

	//#region INITIALIZE

	constructor() {
		super();

		this.cancelationReasons = CANCELATION_REASONS;
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

	/**
	 * email event from dialog footer button, closes modal and switches to email plan dialog
	 */
	_onEmailClick() {
		this.dispatchEvent(new CustomEvent(`email-plan`, {}));
	}

	/**
	 * agree event from dialog footer button, closes modal and navigates to cancel policy success page
	 */
	_onAgreeClick() {
		this.dispatchEvent(new CustomEvent(`agree`, {}));
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

				.notification > capitec-toast{
					--theme-toast-height: 80px;
					position: relative;
				}

				.notification {
					margin-bottom: 30px;
				}

				.expander{
					margin-bottom: 20px;
				}

				.select{
					margin-bottom: 20px;
					width: 60%;
				}

				.button {
					width: 140px;
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
			<capitec-modal type="form" header="Cancel Funeral Cover Plan (CF00027650)">
				<div slot="body" data-automation-id="insure-cancel-policy-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-cancel-policy-dialog-footer">
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
			<div class="notification">
				<capitec-toast type="info" header="Notify Client" 
					detail="The full agreement, inclusive of the Policy Schedule, Section 484 summary. Disclosure, terms and conditions,
					will be emailed to you and available in branch." data-automation-id="insure-cancel-policy-dialog-notification">
				</capitec-toast>
			</div>

			<div class="select" data-automation-id="insure-cancel-policy-dialog-cancelation-reason">
				<capitec-select 
					label="Cancelation Reason" 
					.items= "${this.cancelationReasons}"
					display-field="text"
					id-field="code">
				</capitec-select>
			</div>

			<capitec-expander-group modeset="single">
				<div class="expander">
					<capitec-expander expandbuttonalignment="left" label="View Policy Schedule" data-automation-id="insure-cancel-policy-dialog-view-policy-schedule">
						<capitec-label label=""></capitec-label>
					</capitec-expander>
				</div>

				<div>
					<capitec-expander expandbuttonalignment="left" label="View Mandate" data-automation-id="insure-cancel-policy-dialog-view-mandate">
						<capitec-check label="Please confirm that you agree to these terms and conditions and that you are bound by them?" checked></capitec-check>
					</capitec-expander>
				</div>
			 </capitec-expander-group>

		`}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button class="button" slot="footer" type="secondary" label="Cancel"
					@click="${() => this._onCancelClick()}"
					data-automation-id="insure-cancel-policy-dialog-cancel">
				</capitec-button>
				<capitec-button class="button" slot="footer" type="secondary" label="Email"
					@click="${() => this._onEmailClick()}"
					data-automation-id="insure-cancel-policy-dialog-email">
				</capitec-button>
				<capitec-button class="button" slot="footer" type="primary" label="Agree"
					@click="${() => this._onAgreeClick()}"
					data-automation-id="insure-cancel-policy-dialog-agree">
				</capitec-button>
		`}

	//#endregion


}

window.customElements.define(`insure-cancel-policy-dialog`, CancelPolicyDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <insure-cancel-policy-dialog ... @close-modal="${this._handler}"></insure-cancel-policy-dialog>
 *
 * @event CancelPolicyDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send email plan event to the consuming componant when 'email' is clicked
 *
 * @example
 * <insure-cancel-policy-dialog ... @email-plan="${this._handler}"></insure-cancel-policy-dialog>
 *
 * @event CancelPolicyDialog#email-plan
 * @type {Object} - N/A
 */

/**
 * send agree event to the consuming componant when 'agree is clicked' is clicked
 *
 * @example
 * <insure-cancel-policy-dialog ... @agree="${this._handler}"></insure-cancel-policy-dialog>
 *
 * @event CancelPolicyDialog#agree
 * @type {Object} - N/A
 */