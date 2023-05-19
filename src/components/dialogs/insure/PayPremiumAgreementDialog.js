import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from '../../../utils/channelServiceUtilities';
import { formatDateToInsure } from 'app/utils/insureUtils';

import 'app/components/dialogs/insure/AgreementDialog';

/**
 * Pay Premium Agreement Dialog componant will allow you to view the policy schedule, view the mandate and to agree 
 * to the pay premium agreement
 * 
 * Events Raised 
 * -------------
 * close-modal
 * pay-premium-agree
 *  
 * @export
 * @class PayPremiumAgreementDialog
 * @extends {Component}
 */
class PayPremiumAgreementDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.showAgreementDialog = false;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Object} contractReference contains the contract reference
	 * @property {Number} payAmount total amount that will be paid
	 * @property {Function} getArrearsPaymentDocument Callback function to fetch arrears payment document
	 * @property {Object} arrearsPaymentDocumentDetails contains arrears payment document details
	 * 
	 * 
	 */
	 static get properties() {
		return {
			contractReference: { type: Object, state: true },
			payAmount: { type: Number, state: true },
			getArrearsPaymentDocument: { type: Object },
			arrearsPaymentDocumentDetails: { type: Object, state: true },
			showAgreementDialog: { type: Boolean, state: true }
		};
	}

	// #endregion PROPERTIES
 
	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialise();

	 }

	 // #endregion LIFECYCLE OVERRIDES


	// #region PRIVATE METHODS

	_initialise() {
		this._getDocument();
		
	}

	/**
	 * fetch arrears payment document
	 * @returns {null} null
	 */
	 async _getDocument() {

		await this.getArrearsPaymentDocument(this.contractReference);

	}

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
		this.dispatchEvent(new CustomEvent(`pay-premium-agree`, {}));
	}

	_showAgreementDialog() {
		this.showAgreementDialog = true;
	}

	_closeAgreementDialog() {
		this.showAgreementDialog = false;
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

				capitec-expander {
					border-left: var(--theme-expander-border, 1px solid black);
					border-right: var(--theme-expander-border, 1px solid black);
					margin-bottom: 20px;
				}
				capitec-expander[expanded] {
					border-bottom: var(--theme-expander-border, 1px solid black);
				}

				capitec-expander > capitec-content-box {
					padding: 0 !important;
				}

				.iframe-content {
					height: 100%;
				}

				.no-padding{
					padding: 0px;
					height: 100%;
				}

				.spacing{
					margin-bottom: 20px;
				}

				.font{
					font-weight: bolder;
				}

				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
				}

				horizon-product-tile {
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-subtitle-height: 20px;
					--theme-product-tile-subtitle-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-heading-margin-left: 6px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-radio-disabled-border-color: #E1E1E1;
					--theme-radio-disabled-background-color: #F7F7F7;
				}

				.view-document {
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-detail-top: 20px;
					--theme-product-tile-detail-right: 16px;
				}
				.view-document > capitec-label[type="strong"] {
					line-height: 20px;
					cursor: pointer;

					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
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
			${this._renderAgreementDialog()}
			<capitec-modal type="form" header="Pay Arrears Agreement (${this.contractReference})" style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: auto;">
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
			<div>
				<capitec-label class="font" type="subtitle" label="Declaration">
				</capitec-label>
				<capitec-label class="spacing" type="strong" label="By agreeing to pay your arrear premiums, you acknowledge and confirm that:
• ${formatCurrency(this.payAmount)} can be debited from your account on ${formatDateToInsure(Date())} ">
				</capitec-label>
			</div>

			<capitec-content-box>
				<horizon-product-tile class="view-document" type="default" label="Cancellation Agreement" detail="" icon="" @click="${() => this._showAgreementDialog()}">
						<capitec-label slot="detail" type="strong" label="View Document" >
						</capitec-label>
				</horizon-product-tile>
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
				<capitec-button class="button" slot="footer" type="secondary" label="Cancel"
					@click="${() => this._cancelClick()}"
					data-automation-id="horizon-insure-pay-premium-agreement-dialog-cancel">
				</capitec-button>
				<capitec-button class="button" slot="footer" type="primary" label="Agree"
					@click="${() => this._agreeClick()}"
					data-automation-id="horizon-insure-pay-premium-agreement-dialog-agree">
				</capitec-button>
		`;
	}

	_renderAgreementDialog() {
		return this.showAgreementDialog === false ? html`` 
		: html`
			<horizon-insure-agreement-dialog
				.agreementContent="${this.arrearsPaymentDocumentDetails?.documentContent.value}"
				@back-click="${() => this._closeAgreementDialog()}">
			</horizon-insure-agreement-dialog>
		`;
	}

	// #endregion


}

window.customElements.define(`horizon-insure-pay-premium-agreement-dialog`, PayPremiumAgreementDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-pay-premium-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-pay-premium-agreement-dialog>
 *
 * @event PayPremiumAgreementDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <horizon-insure-pay-premium-agreement-dialog ... @pay-premium-agree="${this._handler}"></horizon-insure-pay-premium-agreement-dialog>
 *
 * @event PayPremiumAgreementDialog#agree
 * @type {Object} - N/A
 */