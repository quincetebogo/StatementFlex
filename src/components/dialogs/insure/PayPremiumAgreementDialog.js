import { Component, css, html } from 'platform/elements';

/**
 * Pay Premium Agreement Dialog componant will allow you to view the policy schedule, view the mandate and to agree 
 * to the pay premium agreement
 * 
 * Events Raised 
 * -------------
 * close-modal
 * email-plan
 * agree
 *  
 * @export
 * @class PayPremiumAgreementDialog
 * @extends {Component}
 */
class PayPremiumAgreementDialog extends Component {

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

	/**
	 * Email event from the dialog footer, closes modal & switches to email dialog
	 */
	_onEmailClick() {
		this.dispatchEvent(new CustomEvent(`email-plan`, {}));
	}

	/**
	 * Agree event from dialog footer, closes modal and navigates to Pay Premium Success page
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
					top: var(--theme-toast-close-top, 10px);
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
			<capitec-modal type="form" header="Pay Arrears Agreement (CF00027650)">
				<div slot="body" data-automation-id="insure-pay-premium-agreement-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-pay-premium-agreement-dialog-footer">
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
					will be emailed to you and available in branch." data-automation-id="insure-pay-premium-agreement-dialog-footer" closable>
				</capitec-toast>
			</div>

			<capitec-expander-group modeset="single">
				<div class="expander">
					<capitec-expander expandbuttonalignment="left" label="View Policy Schedule" data-automation-id="insure-pay-premium-agreement-dialog-view-policy-schedule">
						<capitec-label label=""></capitec-label>
					</capitec-expander>
				</div>

				<div>
					<capitec-expander expandbuttonalignment="left" label="View Mandate" data-automation-id="insure-pay-premium-agreement-dialog-view-mandate">
						<capitec-check label="Please confirm that you agree to these terms and conditions and that you are bound by them?"></capitec-check>
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
					data-automation-id="insure-pay-premium-agreement-dialog-cancel">
				</capitec-button>
				<capitec-button class="button" slot="footer" type="secondary" label="Email"
					@click="${() => this._onEmailClick()}"
					data-automation-id="insure-pay-premium-agreement-dialog-email">
				</capitec-button>
				<capitec-button class="button" slot="footer" type="primary" label="Agree"
					@click="${() => this._onAgreeClick()}"
					data-automation-id="insure-pay-premium-agreement-dialog-agree">
				</capitec-button>
		`}

	//#endregion


}

window.customElements.define(`insure-pay-premium-agreement-dialog`, PayPremiumAgreementDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <insure-pay-premium-agreement-dialog ... @close-modal="${this._handler}"></insure-pay-premium-agreement-dialog>
 *
 * @event PayPremiumAgreementDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * Send the selected arrears and chosen account to consuming component when 'Add' is clicked
 *
 * @example
 * <insure-pay-premium-agreement-dialog ... @email-plan="${this._handler}"></insure-pay-premium-agreement-dialog>
 *
 * @event PayPremiumAgreementDialog#email-plan
 * @type {Object} - N/A
 */

/**
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <insure-pay-premium-agreement-dialog ... @agree="${this._handler}"></insure-pay-premium-agreement-dialog>
 *
 * @event PayPremiumAgreementDialog#agree
 * @type {Object} - N/A
 */