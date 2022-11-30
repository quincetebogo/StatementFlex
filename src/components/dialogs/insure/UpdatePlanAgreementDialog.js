import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

const ERROR_MESSAGE = `Please select confirmation checkbox`;

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
 * @export_onAgreeClick
 * @class UpdatePlanAgreementDialog
 * @extends {Component}
 */
class UpdatePlanAgreementDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.alertBannerMessage = ``;
	}

	// #endregion

	// #region PROPERTIES

	static get properties() {
		return {
			planAgreementContent: { type: String, state: true },
			paymentAgreementContent: { type: String, state: true },
			contractReference: { type: String },
			alertBannerMessage: { attribute: false },
			showUpdatePlanPaymentAgreementDocument: { type: Boolean, state: true }
		};
	}

	// #endregion

	// #region PRIVATE METHODS

	// #endregion

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {null} null
	 */
	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	/**
	 * Agree event from dialog footer, closes modal and navigates to Pay Premium Success page
	 * @returns {null} null
	 */
	_onAgreeClick() {
		const agreeCheck = this.shadowRoot.getElementById(`update-plan-agree-check`);

		if (!agreeCheck.checked) {
			this.alertBannerMessage = ERROR_MESSAGE;
		} else {
			this.alertBannerMessage = ``;
			this.dispatchEvent(new CustomEvent(`update-plan-agree-click`, {}));
		}
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

				.notification > capitec-toast{
					--theme-toast-height: 80px;
					position: relative;
				}
				.notification {
					margin-bottom: 30px;
				}
				.left-padding-0{
					padding-left: 0px;
				}
				.expander{
					margin-bottom: 20px;
				}
				.select{
					margin-bottom: 20px;
					width: 60%;
				}
				capitec-expander {
					border-left: var(--theme-expander-border, 1px solid black);
					border-right: var(--theme-expander-border, 1px solid black);
					margin-bottom: 20px;
				}
				capitec-expander[expanded] {
					border-bottom: var(--theme-expander-border, 1px solid black);
				}
				.alert-banner {
					padding: 0px 0px 16px 0px;
				}

				.full-length-banner > capitec-toast{
					width: 100%;
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
			<capitec-modal type="form" header="Funeral Cover Plan (${this.contractReference})">
				<div slot="body" data-automation-id="insure-pay-premium-agreement-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-pay-premium-agreement-dialog-footer">
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
			<div class="notification">
				<capitec-toast type="info" header="Notify Client" detail="The full agreement, inclusive of the Policy Schedule, Section 484 summary. Disclosure, terms and conditions,
					can be emailed to you and available in branch."
					data-automation-id="insure-pay-premium-agreement-dialog-notification">
				</capitec-toast>
			</div>
			
			${this._renderAlertBanner()}

			<capitec-expander-group modeset="single">
				<div class="expander">
					<capitec-expander expandbuttonalignment="left" label="View Policy Schedule" class="pdf-viewer"
						data-automation-id="insure-pay-premium-agreement-dialog-view-policy-schedule">
						<iframe title="UpdatePlanAgreement" height = "100%" frameborder = "0"
							src="data:application/pdf;base64,${this.planAgreementContent}#view=fitH">
						</iframe>
					</capitec-expander>
				</div>
			
				${this.showUpdatePlanPaymentAgreementDocument === true ? html`
					<div>
						<capitec-expander expandbuttonalignment="left" label="View Mandate" class="pdf-viewer"
							data-automation-id="insure-pay-premium-agreement-dialog-view-mandate">
								<iframe title="UpdatePaymentAgreement" height = "100%" frameborder = "0"
									src="data:application/pdf;base64,${this.paymentAgreementContent}#view=fitH">
								</iframe>
						</capitec-expander>
					</div>` : html``}
				 
			</capitec-expander-group>

			<capitec-content-box class="left-padding-0">
				<capitec-check id="update-plan-agree-check" label="Please confirm that you agree to these terms and conditions and that you are bound by them?">
				</capitec-check>
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
				<capitec-button class="capitec-button-medium" slot="footer" type="secondary" label="Cancel" @click="${() => this._onCancelClick()}"
					data-automation-id="insure-pay-premium-agreement-dialog-cancel">
				</capitec-button>
				<capitec-button class="capitec-button-medium" slot="footer" type="primary" label="Agree" @click="${() => this._onAgreeClick()}"
					data-automation-id="insure-pay-premium-agreement-dialog-agree">
				</capitec-button>
		`;
	}

	/**
	 * Render Alert banner for error message.
	 * @returns {html} The html content of the component. 
	 */
	 _renderAlertBanner() {
		if (this.alertBannerMessage) {
			return html`
				<capitec-content-box class="alert-banner">
					<capitec-toast 
						class="full-length-banner"
						type="error" 
						data-automation-id="insure-update-plan-agreement-dialog-banner"
						header="${this.alertBannerMessage}" 
						layout="horizontal">
					</capitec-toast>
				</capitec-content-box>
				`;

		}
	}

	// #endregion RENDERING


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