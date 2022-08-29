import { Component, css, html } from 'platform/elements';
import { formatCurrency } from '../../../utils/channelServiceUtilities';
import { formatDate } from 'app/utils/channelServiceUtilities';
import { dateFormat} from 'app/utils/insureUtils'


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

	/**
	 * @property {Object} contractReference contains the contract refrence
	 * @property {Object} amountToPay total amount that will be paid
	 * @property {Function} getArrearsPaymentDocument Callback function to fetch arrears payment document
	 * @property {Object} arrearsPaymentDocumentDetails contains arrears payment document details
	 * 
	 * 
	 */
	 static get properties() {
		return {
			
			contractReference: {type: Object, state: true},
			amountToPay: {type: Object, state: true},
			getArrearsPaymentDocument: {type: Object},
			arrearsPaymentDocumentDetails: {type: Object, state: true}

		};
	}

	//#endregion

	//#region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	 async connectedCallback() {
		super.connectedCallback();
		this._initialize();

	 }

	 //#endregion


	//#region PRIVATE METHODS

	async _initialize(){

		await this.getArrearsPaymentDocument(this.contractReference);


	}


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
		this.dispatchEvent(new CustomEvent(`pay-premium-agree`, {}));
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

				`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			<capitec-modal type="form" header="Pay Arrears Agreement (${this.contractReference})">
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
					will be emailed to you and available in branch." data-automation-id="insure-pay-premium-agreement-dialog-notification">
				</capitec-toast>
			</div>

			<div>
				<capitec-label type="subtitle" label="Declaration:
By agreeing to pay your arrear premiums, you acknowledge and confirm that:
• Your Savings/ Flexible Account can be debited with the amount of ${formatCurrency(this.amountToPay)} on ${dateFormat(Date())} ">
				</capitec-label>
			</div>

			<!-- <capitec-content-box class="no-padding">
				<capitec-expander expandbuttonalignment="left" label="View Arrears Payment Intruction" data-automation-id="insure-cancel-policy-dialog-view-cancellation-agreement">
					<iframe class="iframe-content" src="data:application/pdf;base64,${this.arrearsPaymentDocumentDetails?.documentContent }#view=fitH" alt="agreement"></iframe>
				</capitec-expander>
			</capitec-content-box> -->

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
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <insure-pay-premium-agreement-dialog ... @agree="${this._handler}"></insure-pay-premium-agreement-dialog>
 *
 * @event PayPremiumAgreementDialog#agree
 * @type {Object} - N/A
 */