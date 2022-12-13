import { Component, css, html } from 'platform/elements';
import { CANCELATION_REASONS } from 'app/constants/InsureCommon';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatDateToInsure } from 'app/utils/insureUtils';

// Lookups


/**
 * cancel policy dialog 
 * 
 * Events Raised 
 * -------------
 * close-modal
 * agree
 *  
 * @export
 * @class CancelPolicyDialog
 * @extends {Component}
 */
class CancelPolicyDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.cancelationReasons = CANCELATION_REASONS;
		this.selected = false;
		this.errorMsg = ``;
		this.cancelReason = ``;
		this.contractReference = ``;
		this.cancelPolicyDocumentDetails = {};
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Boolean} selected determines if a cancellation reason has been chosen
	 * @property {Boolean} checked determines if terms and conditions have been agreed to 
	 * @property {String} contractReference contains the contract reference
	 * @property {String} cancelReason contains the chosen cancellation reason
	 * @property {Function} getCancelPolicyDocument Callback function to fetch Cancel Policy Agreement
	 * @property {Object} cancelPolicyDocumentDetails contains the cancel policy agreement document details
	 * @property {String} errorMsg error message to be displayed if cancellation reason is not selected
	 * 
	 */
	static get properties() {
		return {
			selected: { type: Boolean, state: true },
			checked: { type: Boolean, state: true },
			contractReference: { type: String, state: true },
			cancelReason: { type: String, state: true },
			getCancelPolicyDocument: { type: Object, state: true },
			cancelPolicyDocumentDetails: { type: Object, state: true },
			errorMsg: { type: String, state: true }
		};
	}

	//  #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
	}

	//  #endregion LIFECYCLE OVERRIDES

	//  #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * 
	 * @returns {void} 
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	/**
	 * Event to to change the value of selected once an option has been chosen from the cancelation select box and also to cancelReason with the reason chosen
	 * @param {event} e e
	 * @returns {void}
	 */
	_valueSelected(e) {
		this.selected = true;
		this.errorMsg = ``;
		this.cancelReason = e.detail.new.code;

		this._getCancelAgreement(this.cancelReason);

		this.requestUpdate();
	}

	/**
	 * determine if a cancellation reason was selected
	 * @returns {void}
	 */
	_checkSelected() {

		if (this.selected === true) {
			this._agreeClick();
		} else {
			this.errorMsg = `Please select a cancellation reason`;
		}
	}

	//  #endregion EVENT HANDLERS

	//  #region PRIVATE METHODS

	/**
	 * agree event from dialog footer button, closes modal and navigates to cancel policy success page
	 * 
	 * @returns {void} 
	 */
	 _agreeClick() {
		this.dispatchEvent(new CustomEvent(`agree`, { detail: { cancellationReason: this.cancelReason } }));
	}

	/**
	 * Event that returns the following day's date
	 * 
	 * @returns {String} tomorrows date
	 */
	 _getDate() {
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		return tomorrow;
	}

	/**
	 * 
	 * @param {String} cancelReason cancelation reason selected
	 * @returns {void}
	 */
	 async _getCancelAgreement(cancelReason) {
		await this.getCancelPolicyDocument(this.contractReference, cancelReason);
	}

	//  #endregion PRIVATE METHODS

	//  #region RENDERING

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
					--theme-toast-height: 110px;
					position: relative;
					--theme-toast-max-width: 100%;
				}

				.notification {
					margin-bottom: 30px;
					padding: 0px;
				}

				.no-padding{
					padding: 0px;
					height: 100%;
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
				.cancel-policy-modal{
					--theme-modal-alert-m-l-xl-width: 840px;
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
			<capitec-modal type="alert" class="cancel-policy-modal" header="Cancel Funeral Cover Plan (${this.contractReference})">
				<div slot="body" data-automation-id="insure-cancel-policy-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-cancel-policy-dialog-footer">
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

			<div class="select" data-automation-id="insure-cancel-policy-dialog-cancelation-reason">
				<capitec-select 
					label="Cancellation Reason" 
					.items= "${this.cancelationReasons}"
					display-field="text"
					id-field="code"
					@value-change = "${(e) => this._valueSelected(e)}"
					error = "${this.errorMsg}">
				</capitec-select>
			</div>

			<capitec-content-box class="no-padding">
				<capitec-label type="subtitle" label=" By requesting the cancellation of the policy, you acknowledge and confirm that:"></capitec-label>
				<ul>
				<li>You will no longer have any benefits under this policy, effective ${formatDateToInsure(this._getDate())}</li>
				<li>You will be entitled to a refund of all premiums paid if you cancel this policy within 31 (thirty-one) days from the signature provided that no benefit has been paid or claimed</li>
				<li>You will not be entitled to a refund of premiums, if you cancel this policy at anytime after the 31 (thirty-one) day period referred to above</li>
				<li>A Waiting Period will not be applicable on the Funeral Benefit, should you take up a new Funeral Cover Plan within 2 (two) months of cancelling this policy</li>
				</ul>
			</capitec-content-box>

			<capitec-content-box class="no-padding">

				${this.cancelPolicyDocumentDetails === undefined ? html`
				` : html`
					<capitec-expander expandbuttonalignment="left" label="View Cancellation Agreement" class="pdf-viewer"
						data-automation-id="insure-cancel-policy-dialog-view-cancellation-agreement">
						<iframe title="CancelPolicyAgreement" height = "100%" frameborder = "0"
							src="data:application/pdf;base64,${this.cancelPolicyDocumentDetails?.documentContent.value}#view=fitH">
						</iframe>
					</capitec-expander>
				`}
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
					data-automation-id="insure-cancel-policy-dialog-cancel">
				</capitec-button>
				<capitec-button class="button" slot="footer" type="primary" label="Agree"
					@click="${() => this._checkSelected()}"
					data-automation-id="insure-cancel-policy-dialog-agree">
				</capitec-button>
		`;
	}

	// #endregion RENDERING

}

window.customElements.define(`insure-cancel-policy-dialog`, CancelPolicyDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <insure-cancel-policy-dialog ... @close-modal="${this._handler}"></insure-cancel-policy-dialog>
 *
 * @event CancelPolicyDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree event to the consuming componant when 'agree is clicked' is clicked
 *
 * @example
 * <insure-cancel-policy-dialog ... @agree="${this._handler}"></insure-cancel-policy-dialog>
 *
 * @event CancelPolicyDialog#agree
 * @type {Object} - N/A
 */