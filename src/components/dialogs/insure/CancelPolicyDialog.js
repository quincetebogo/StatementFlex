import { Component, css, html } from 'platform/elements';
import { CANCELATION_REASONS } from 'app/constants/InsureCommon';
import { CancelPolicyEvents } from 'app/constants/telemetry/events/Insure';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { formatDateToInsure } from 'app/utils/insureUtils';
import 'app/components/dialogs/insure/AgreementDialog';

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
		this._telemetry = HorizonTelemetry.getInstance();
		this.telemetryEvents = {};
		this.showCancelAgreement = false;
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
			errorMsg: { type: String, state: true },
			showCancelAgreement: { type: Boolean, state: true }
		};
	}

	//  #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		this.telemetryEvents = CancelPolicyEvents;
		await this._telemetry.startSpan(this.telemetryEvents.CANCEL_POLICY, {});
		this._initialise();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();
		await this._telemetry.endSpan(this.telemetryEvents.CANCEL_POLICY, {});
	}

	//  #endregion LIFECYCLE OVERRIDES

	//  #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * 
	 * @returns {void} 
	 */
	_cancelClick() {
		this._telemetry.logEvent(this.telemetryEvents.CANCEL_POLICY_CLOSE, {
			"screen": TelemetryScreen.INSURE_CANCEL_PLAN_AGREEMENT_DIALOG,
			"next-screen": TelemetryScreen.INSURE_CLIENT_SUMMARY
		});
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

	_showAgreement() {
		this.showCancelAgreement = true;
	}

	_closeAgreementDialog() {
		this.showCancelAgreement = false;
	}


	//  #endregion EVENT HANDLERS

	//  #region PRIVATE METHODS

	async _initialise() {
		await super._inicidentManager_(`funeral-plan-cancel`, null);
		await super.createAndClassifySubIncident();

	}

	/**
	 * agree event from dialog footer button, closes modal and navigates to cancel policy success page
	 * 
	 * @returns {void} 
	 */
	_agreeClick() {
		this._telemetry.logEvent(this.telemetryEvents.CANCEL_POLICY_AGREE, {
			"screen": TelemetryScreen.INSURE_CANCEL_PLAN_AGREEMENT_DIALOG,
			"next-screen": TelemetryScreen.INSURE_CANCEL_PLAN_SUCCESS
		});
		this.dispatchEvent(new CustomEvent(`agree`, { detail: { cancellationReason: this.cancelReason } }));
	}

	/**
	 * Event that returns the following day's date
	 * 
	 * @returns {String} tomorrows date
	 */
	_getAgreementDate() {
		const today = new Date();
		return today;
	}

	/**
	 * 
	 * @param {String} cancelReason cancelation reason selected
	 * @returns {void}
	 */
	async _getCancelAgreement(cancelReason) {
		await this.getCancelPolicyDocument(this.contractReference, cancelReason);
	}

	_initialise() {
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

				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
				}

				.cancel-pdf-viewer{
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					width: 800px;
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
			<capitec-modal type="alert" class="cancel-policy-modal" header="Cancel Funeral Cover Plan (${this.contractReference})" style="--theme-modal-header-color: black; --theme-modal-alert-m-l-xl-width: 848px;">
				<div slot="body" data-automation-id="horizon-insure-cancel-policy-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="horizon-insure-cancel-policy-dialog-footer">
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

			<div class="select" data-automation-id="horizon-insure-cancel-policy-dialog-cancelation-reason">
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
				<li>You will no longer have any benefits under this policy, effective ${formatDateToInsure(this._getAgreementDate())}</li>
				<li>You will be entitled to a refund of all premiums paid if you cancel this policy within 31 (thirty-one) days from the signature provided that no benefit has been paid or claimed</li>
				<li>You will not be entitled to a refund of premiums, if you cancel this policy at anytime after the 31 (thirty-one) day period referred to above</li>
				<li>A Waiting Period will not be applicable on the Funeral Benefit, should you take up a new Funeral Cover Plan within 2 (two) months of cancelling this policy</li>
				</ul>
			</capitec-content-box>

			<capitec-content-box>

			${this.cancelPolicyDocumentDetails === undefined ? html``
				: html`
				<horizon-product-tile class="view-document" type="default" label="Cancellation Agreement" subtitle="Funeral Cover Plan" detail="" icon="" @click="${() => this._showAgreement()}">
					<capitec-label slot="detail" type="strong" label="View Document" >
					</capitec-label>
				</horizon-product-tile>
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
					data-automation-id="horizon-insure-cancel-policy-dialog-cancel">
				</capitec-button>
				<capitec-button class="button" slot="footer" type="primary" label="Agree"
					@click="${() => this._checkSelected()}"
					data-automation-id="horizon-insure-cancel-policy-dialog-agree">
				</capitec-button>
		`;
	}

	_renderAgreementDialog() {
		return this.showCancelAgreement === false ? html``
			: html`
			<horizon-insure-agreement-dialog
			.agreementContent="${this.cancelPolicyDocumentDetails?.documentContent.value}"
			@back-click="${() => this._closeAgreementDialog()}">
			</horizon-insure-agreement-dialog>
		`;
	}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-cancel-policy-dialog`, CancelPolicyDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-cancel-policy-dialog ... @close-modal="${this._handler}"></horizon-insure-cancel-policy-dialog>
 *
 * @event CancelPolicyDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree event to the consuming componant when 'agree is clicked' is clicked
 *
 * @example
 * <horizon-insure-cancel-policy-dialog ... @agree="${this._handler}"></horizon-insure-cancel-policy-dialog>
 *
 * @event CancelPolicyDialog#agree
 * @type {Object} - N/A
 */