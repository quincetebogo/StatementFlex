import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

const ERROR_MESSAGE = `Please select confirm checkbox`;

/**
 * Reinstate Policy Agreement Dialog component will allow you to view the policy schedule, 
 * view the mandate and to agree to Reinstate the Policy
 * 
 * Events Raised 
 * -------------
 * reinstate-close-modal
 * reinstate-agree-click
 *  
 * @export
 * @class ReinstatePolicyAgreementDialog
 * @extends {Component}
 */
class ReinstatePolicyAgreementDialog extends Component {

	//#region INITIALIZE

	constructor() {
		super();

		this.alertBannerMessage = ``;
	}

	//#endregion INITIALIZE

	//#region PROPERTIES

	static get properties() {
		return {
			issuePlanAgreementContent: { type: String },
			paymentAgreementContent: { type: String },
			contractReference: { type: String },
			alertBannerMessage: { attribute: false },
		};
	}

	//#endregion PROPERTIES

	//#region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 */
	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`reinstate-close-modal`, {}));
	}

	/**
	 * Agree event from dialog footer, closes modal and navigates to Pay Premium Success page
	 */
	_onAgreeClick() {
		const agreeCheck = this.shadowRoot.getElementById(`reinstate-policy-agree-check`);

		if(!agreeCheck.checked)
		{
			this.alertBannerMessage = ERROR_MESSAGE;
		}
		else
		{
			this.alertBannerMessage = ``;
			this.dispatchEvent(new CustomEvent(`reinstate-agree-click`, {}));
		}
	}

	//#endregion EVENT HANDLERS

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
				.select{
					margin-bottom: 20px;
					width: 60%;
				}
				.button {
					width: 140px;
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

				`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<capitec-modal type="form" header="Reinstate Policy Agreement (${ this.contractReference })">
				<div slot="body" data-automation-id="insure-reinstate-policy-agreement-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-reinstate-policy-agreement-dialog-footer">
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
					data-automation-id="insure-reinstate-policy-agreement-dialog-notification">
				</capitec-toast>
			</div>
			
			${this._renderAlertBanner()}
			
			<capitec-expander-group modeset="single" class="expander">
				<capitec-expander expandbuttonalignment="left" label="View Policy Schedule"
					data-automation-id="insure-reinstate-policy-agreement-dialog-view-policy-schedule">
					<capitec-label label=""></capitec-label>
					<img src="data:image/png;base64, ${this.issuePlanAgreementContent}" alt="agreement" />
				</capitec-expander>
		
				<capitec-expander expandbuttonalignment="left" label="View Mandate"
					data-automation-id="insure-reinstate-policy-agreement-dialog-view-mandate">
					<img src="data:image/png;base64, ${this.paymentAgreementContent}" alt="agreement" />
				</capitec-expander>
			</capitec-expander-group>

			<capitec-content-box class="left-padding-0">
				<capitec-check id="reinstate-policy-agree-check" label="Please confirm that you agree to these terms and conditions and that you are bound by them?">
				</capitec-check>
			</capitec-content-box>
	`}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button class="button" slot="footer" type="secondary" label="Cancel" @click="${() => this._onCancelClick()}"
					data-automation-id="insure-reinstate-policy-agreement-dialog-cancel">
				</capitec-button>
				<capitec-button class="button" slot="footer" type="primary" label="Agree" @click="${() => this._onAgreeClick()}"
					data-automation-id="insure-reinstate-policy-agreement-dialog-agree">
				</capitec-button>
	`}

	/**
	 * Render Alert banner for error message.
	 * @returns {html} The html content of the component. 
	 */
	_renderAlertBanner() {
		if (this.alertBannerMessage) {
			return html`
				<capitec-content-box class="alert-banner">
					<capitec-alert-banner 
						data-automation-id="insure-reinstate-policy-agreement-dialog-banner"
						type="unsuccessful-red">
							${this.alertBannerMessage}
					</capitec-alert-banner>
				</capitec-content-box>`;
		}
	}

	//#endregion RENDERING
}

window.customElements.define(`insure-reinstate-policy-agreement-dialog`, ReinstatePolicyAgreementDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <insure-reinstate-policy-agreement-dialog ... @close-modal="${this._handler}"></insure-reinstate-policy-agreement-dialog>
 *
 * @event ReinstatePolicyAgreementDialog#close-modal
 * @type {Object} - N/A
 */


/**
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <insure-reinstate-policy-agreement-dialog ... @agree="${this._handler}"></insure-reinstate-policy-agreement-dialog>
 *
 * @event ReinstatePolicyAgreementDialog#agree
 * @type {Object} - N/A
 */