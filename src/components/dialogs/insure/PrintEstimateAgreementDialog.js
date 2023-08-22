import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

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
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {string} printEstimateAgreementContent doc content for the estimate agreement
	 */
	static get properties() {
		return {
			printEstimateAgreementContent: { type: String }
		};
	}

	// #endregion PROPERTIES

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`print-estimate-close-modal`, {}));
	}

	/**
	 * Agree event from dialog footer, closes modal and navigates to Pay Premium Success page
	 * @returns {void} 
	 */
	_agreeClick() {
		this.dispatchEvent(new CustomEvent(`print-estimate-agree-click`, {}));
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
			capitec-expander {
				border-left: var(--theme-expander-border, 1px solid black);
				border-right: var(--theme-expander-border, 1px solid black);
				margin-bottom: 20px;
			}
			capitec-expander[expanded] {
				border-bottom: var(--theme-expander-border, 1px solid black);
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
		<capitec-modal type="form" header="Email Estimate" style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: auto;">
			<div slot="body" data-automation-id="insure-print-estimate-dialog-body">
				${this._renderDialogBody()}
			</div>
			<div slot="footer" data-automation-id="insure-horizon-insure-print-estimate-agreement-dialog-footer">
				${this._renderDialogFooter()}
			</div>
		</capitec-modal>`;
	}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {
		return html`
			<capitec-content-box style="height: 700px; width: 800px;">
				<iframe title="PrintEstimateAgreement" height = "100%" frameborder = "0"
					src="data:application/pdf;base64, ${this.printEstimateAgreementContent}#view=fitH">
				</iframe>
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
			<capitec-button class = "capitec-button-medium" slot="footer" type="secondary" label="Cancel" @click="${() => this._cancelClick()}"
				data-automation-id="horizon-insure-print-estimate-agreement-dialog-cancel">
			</capitec-button>
			<capitec-button class = "capitec-button-medium" slot="footer" type="primary" label="Next" @click="${() => this._agreeClick()}"
				data-automation-id="horizon-insure-print-estimate-agreement-dialog-agree">
			</capitec-button>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-print-estimate-agreement-dialog`, PrintEstimateAgreementDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-print-estimate-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-print-estimate-agreement-dialog>
 *
 * @event PrintEstimateAgreementDialog#close-modal
 * @type {Object} - N/A
 */


/**
 * Send agree dialog event to consuming component when 'Agree' is clicked
 *
 * @example
 * <horizon-insure-print-estimate-agreement-dialog ... @agree="${this._handler}"></horizon-insure-print-estimate-agreement-dialog>
 *
 * @event PrintEstimateAgreementDialog#agree
 * @type {Object} - N/A
 */