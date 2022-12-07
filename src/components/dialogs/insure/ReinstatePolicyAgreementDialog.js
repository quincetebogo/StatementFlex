import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

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

	// #region INITIALIZE

	constructor() {
		super();

		this.alertBannerMessage = ``;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	static get properties() {
		return {
			issuePlanAgreementContent: { type: String },
			paymentAgreementContent: { type: String },
			contractReference: { type: String },
			showReinstatePaymentAgreementDocument: { type: Boolean, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {null} null
	 */
	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`reinstate-close-modal`, {}));
	}

	/**
	 * Agree event from dialog footer, closes modal and navigates to Pay Premium Success page
	 * @returns {null} null
	 */
	_onAgreeClick() {
			this.dispatchEvent(new CustomEvent(`reinstate-agree-click`, {}));
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
				capitec-expander {
					border-left: var(--theme-expander-border, 1px solid black);
					border-right: var(--theme-expander-border, 1px solid black);
					margin-bottom: 20px;
				}
				capitec-expander[expanded] {
					border-bottom: var(--theme-expander-border, 1px solid black);
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
			<capitec-modal type="form" header="Re-Issue Policy Agreement (${this.contractReference})">
				<div slot="body" data-automation-id="insure-reinstate-policy-agreement-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-reinstate-policy-agreement-dialog-footer">
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
			
			<capitec-expander-group modeset="single">
				<capitec-expander expandbuttonalignment="left" label="View Policy Schedule" class="pdf-viewer" ?expanded="${true}"
					data-automation-id="insure-reinstate-policy-agreement-dialog-view-policy-schedule">
					<iframe title="ReinstateIssueAgreement" height = "100%" frameborder = "0"
						src="data:application/pdf;base64,${this.issuePlanAgreementContent}#view=fitH">
					</iframe>
				</capitec-expander>
		
				${this.showReinstatePaymentAgreementDocument === true ? html`
					<capitec-expander expandbuttonalignment="left" label="View Mandate" class="pdf-viewer"
						data-automation-id="insure-reinstate-policy-agreement-dialog-view-mandate">
						<iframe title="ReinstatePaymentAgreemnt" height = "100%" frameborder = "0"
							src="data:application/pdf;base64, ${this.paymentAgreementContent}#view=fitH">
						</iframe>
					</capitec-expander>
				</div>` : html``}
			</capitec-expander-group>

		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button class = "capitec-button-medium" slot="footer" type="secondary" label="Cancel" @click="${() => this._onCancelClick()}"
					data-automation-id="insure-reinstate-policy-agreement-dialog-cancel">
				</capitec-button>
				<capitec-button class = "capitec-button-medium" slot="footer" type="primary" label="Agree" @click="${() => this._onAgreeClick()}"
					data-automation-id="insure-reinstate-policy-agreement-dialog-agree">
				</capitec-button>
		`;
	}

	// #endregion RENDERING
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