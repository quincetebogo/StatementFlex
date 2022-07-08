import { Component, css, html } from 'platform/elements';

/**
 * Update Plan Agreement Dialog componant will allow you to view the policy schedule, view the mandate and to agree 
 * to the Update Plan agreement
 * 
 * Events Raised 
 * -------------
 * close-modal
 * email-plan
 * agree
 *  
 * @export
 * @class UpdatePlanAgreementDialog
 * @extends {Component}
 */
class UpdatePlanAgreementDialog extends Component {

	//#region INITIALIZE

	constructor() {
		super();

	}

	//#endregion

	//#region PROPERTIES

	static get properties() {
		return {
			policyScheduleDocContent: { type: Object, state: true },
			paymentAgreementDocContent: { type: Object, state: true },
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
	 * Agree event from dialog footer, closes modal and navigates to Pay Premium Success page
	 */
	_onAgreeClick() {
		this.dispatchEvent(new CustomEvent(`agree-click`, {}));
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
			<capitec-modal type="form" header="Funeral Cover Plan (CF00027650)">
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
				<capitec-toast type="info" header="Notify Client" detail="The full agreement, inclusive of the Policy Schedule, Section 484 summary. Disclosure, terms and conditions,
														will be emailed to you and available in branch."
					data-automation-id="insure-pay-premium-agreement-dialog-notification">
				</capitec-toast>
			</div>
			
			<capitec-expander-group modeset="single">
				<div class="expander">
					<capitec-expander expandbuttonalignment="left" label="View Policy Schedule"
						data-automation-id="insure-pay-premium-agreement-dialog-view-policy-schedule">
						<capitec-label label=""></capitec-label>
			
			
			
						<img src="data:image/png;base64, ${this.policyScheduleDocContent}" alt="agreement" />
					</capitec-expander>
				</div>
			
				<div>
					<capitec-expander expandbuttonalignment="left" label="View Mandate"
						data-automation-id="insure-pay-premium-agreement-dialog-view-mandate">
						<capitec-check
							label="Please confirm that you agree to these terms and conditions and that you are bound by them?">
						</capitec-check>
						<img src="data:image/png;base64, ${this.paymentAgreementDocContent}" alt="agreement" />
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
				<capitec-button class="button" slot="footer" type="secondary" label="Cancel" @click="${() => this._onCancelClick()}"
					data-automation-id="insure-pay-premium-agreement-dialog-cancel">
				</capitec-button>
				<capitec-button class="button" slot="footer" type="primary" label="Agree" @click="${() => this._onAgreeClick()}"
					data-automation-id="insure-pay-premium-agreement-dialog-agree">
				</capitec-button>
		`}

	//#endregion


}

window.customElements.define(`insure-update-plan-agreement-dialog`, UpdatePlanAgreementDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <insure-update-plan-agreement-dialog ... @close-modal="${this._handler}"></insure-update-plan-agreement-dialog>
 *
 * @event UpdatePlanAgreementDialog#close-modal
 * @type {Object} - N/A
 */


/**
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <insure-update-plan-agreement-dialog ... @agree="${this._handler}"></insure-update-plan-agreement-dialog>
 *
 * @event UpdatePlanAgreementDialog#agree
 * @type {Object} - N/A
 */