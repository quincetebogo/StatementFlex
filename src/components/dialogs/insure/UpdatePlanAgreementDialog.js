import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * Update Plan Agreement Dialog componant will allow you to view the policy schedule, view the mandate and to agree 
 * to the Update Plan agreement
 * 
 * Events Raised 
 * -------------
 * close-modal
 * update-plan-agree-click
 *  
 * @export_agreeClick
 * @class UpdatePlanAgreementDialog
 * @extends {Component}
 */
class UpdatePlanAgreementDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.alertBannerMessage = ``;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {String} planAgreementContent doc content for the plan agreement
	 * @property {String} contractReference contract reference for the selected policy 
	 * @property {String} alertBannerMessage message for the alert banner
	 */
	static get properties() {
		return {
			planAgreementContent: { type: String, state: true },
			contractReference: { type: String }
		};
	}

	// #endregion PROPERTIES

	// #region PRIVATE METHODS

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	/**
	 * Agree event from dialog footer, closes modal and navigates to Pay Premium Success page
	 * @returns {void} 
	 */
	_agreeClick() {
			this.dispatchEvent(new CustomEvent(`update-plan-agree-click`, {}));
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
				.full-length-banner > capitec-toast{
					width: 100%;
				}

				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
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
			<capitec-modal type="form" header="Funeral Cover Plan (${this.contractReference})" style="--theme-modal-header-color: black;">
				<div slot="body" data-automation-id="horizon-insure-pay-premium-agreement-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="horizon-insure-pay-premium-agreement-dialog-footer">
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
				<div class="expander">
					<capitec-expander expandbuttonalignment="left" label="View Policy Schedule" class="pdf-viewer" ?expanded="${true}"
						data-automation-id="horizon-insure-pay-premium-agreement-dialog-view-policy-schedule">
						<iframe title="UpdatePlanAgreement" height = "100%" frameborder = "0"
							src="data:application/pdf;base64,${this.planAgreementContent}#view=fitH">
						</iframe>
					</capitec-expander>
				</div>
				 
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
				<capitec-button class="capitec-button-medium" slot="footer" type="secondary" label="Cancel" @click="${() => this._cancelClick()}"
					data-automation-id="horizon-insure-pay-premium-agreement-dialog-cancel">
				</capitec-button>
				<capitec-button class="capitec-button-medium" slot="footer" type="primary" label="Agree" @click="${() => this._agreeClick()}"
					data-automation-id="horizon-insure-pay-premium-agreement-dialog-agree">
				</capitec-button>
		`;
	}

	// #endregion RENDERING


}

window.customElements.define(`horizon-insure-update-plan-agreement-dialog`, UpdatePlanAgreementDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-update-plan-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-update-plan-agreement-dialog>
 *
 * @event UpdatePlanAgreementDialog#close-modal
 * @type {Object} - N/A
 */


/**
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <horizon-insure-update-plan-agreement-dialog ... @update-plan-agree-click="${this._handler}"></horizon-insure-update-plan-agreement-dialog>
 *
 * @event UpdatePlanAgreementDialog#agree
 * @type {Object} - N/A
 */