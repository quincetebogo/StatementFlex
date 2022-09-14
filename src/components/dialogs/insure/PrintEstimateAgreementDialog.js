import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

const ERROR_MESSAGE = `Please select confirmation checkbox`;

/**
 * Email Estimate Agreement Dialog component will allow you to view the Estimate detail, 
 * and to agree to Send the Estimate details
 * 
 * Events Raised 
 * -------------
 * print-estimate-close-modal
 * print-estimate-agree-click
 *  
 * @export
 * @class PrintEstimateAgreementDialog
 * @extends {Component}
 */
class PrintEstimateAgreementDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.alertBannerMessage = ``;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	static get properties() {
		return {
			printEstimateAgreementContent: { type: String },
			alertBannerMessage: { attribute: false }
		};
	}

	// #endregion PROPERTIES

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {null} null
	 */
	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`print-estimate-close-modal`, {}));
	}

	/**
	 * Agree event from dialog footer, closes modal and navigates to Pay Premium Success page
	 * @returns {null} null
	 */
	_onAgreeClick() {
		const agreeCheck = this.shadowRoot.getElementById(`print-estimate-agree-check`);

		if (!agreeCheck.checked) {
			this.alertBannerMessage = ERROR_MESSAGE;
		} else {
			this.alertBannerMessage = ``;
			this.dispatchEvent(new CustomEvent(`print-estimate-agree-click`, {}));
		}
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
			<capitec-modal type="form" header="Email Estimate Agreement">
				<div slot="body" data-automation-id="insure-print-estimate-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-print-estimate-agreement-dialog-footer">
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
					data-automation-id="insure-print-estimate-agreement-dialog-notification">
				</capitec-toast>
			</div>
			
			${this._renderAlertBanner()}
			
			<capitec-expander-group modeset="single">
				<capitec-expander expandbuttonalignment="left" label="View Estimate" class="pdf-viewer"
					data-automation-id="insure-print-estimate-agreement-dialog-view-estimate">
					<iframe title="PrintEstimateAgreemnt" height = "100%" frameborder = "0"
						src="data:application/pdf;base64, ${this.printEstimateAgreementContent}#view=fitH">
					</iframe>
				</capitec-expander>
			</capitec-expander-group>

			<capitec-content-box class="left-padding-0">
				<capitec-check id="print-estimate-agree-check" label="Please confirm that you agree to these terms and conditions and that you are bound by them?">
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
				<capitec-button class = "capitec-button-medium" slot="footer" type="secondary" label="Cancel" @click="${() => this._onCancelClick()}"
					data-automation-id="print-estimate-agreement-dialog-cancel">
				</capitec-button>
				<capitec-button class = "capitec-button-medium" slot="footer" type="primary" label="Agree" @click="${() => this._onAgreeClick()}"
					data-automation-id="print-estimate-agreement-dialog-agree">
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
					<capitec-alert-banner 
						data-automation-id="insure-print-estimate-agreement-dialog-banner"
						type="unsuccessful-red">
							${this.alertBannerMessage}
					</capitec-alert-banner>
				</capitec-content-box>`;
		}
	}

	// #endregion RENDERING
}

window.customElements.define(`print-estimate-agreement-dialog`, PrintEstimateAgreementDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <print-estimate-agreement-dialog ... @close-modal="${this._handler}"></print-estimate-agreement-dialog>
 *
 * @event PrintEstimateAgreementDialog#close-modal
 * @type {Object} - N/A
 */


/**
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <print-estimate-agreement-dialog ... @agree="${this._handler}"></print-estimate-agreement-dialog>
 *
 * @event PrintEstimateAgreementDialog#agree
 * @type {Object} - N/A
 */