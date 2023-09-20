import { Component, css, html } from 'platform/elements';
import { CANCELATION_REASONS } from 'app/constants/InsureCommon';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import 'app/components/dialogs/insure/AgreementDialog';

// Lookups

const STEPS = {
	REASON: 1,
	AGREEMENT: 2
};

const ERROR_MESSAGE = {
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Please confirm email`
};

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
class LifeCancelPolicyDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.cancelationReasons = CANCELATION_REASONS;
		this.selectedReason = ``;
		this.currentStep = STEPS.REASON;
		this._telemetry = HorizonTelemetry.getInstance();
		this.lifeCancelAgreementDetails = {};
		this.showCancelAgreement = false;
		this.email = ``;
		this.confirmEmail = ``;
		this.alertBannerMessage = ``;
		this.agreeToTermsCheckSelected = false;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Function} getCancelPolicyDocument Callback function to fetch Life Cancel Policy Agreement
	 * @property {Number} currentStep Callback function to fetch Cancel Policy Agreement
	 * @property {Boolean} showCancelAgreement determines whether to show the agreement dialog
	 * 
	 */
	static get properties() {
		return {
			currentStep: { type: Number, state: true },
			getLifeCancelPolicyDocument: { type: Object, state: true },
			lifeCancelAgreementDetails: { type: Object, state: true },
			showCancelAgreement: { type: Boolean, state: true },
			email: { type: String, state: true },
			confirmEmail: { type: String, state: true },
			alertBannerMessage: { type: String, state: true },
			agreeToTermsCheckSelected: { type: Boolean, state: true }
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
		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		
	}

	//  #endregion LIFECYCLE OVERRIDES

	//  #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * 
	 * @returns {void} 
	 */
	_cancelClick() {
		
		this.dispatchEvent(new CustomEvent(`close-dialog`, {}));
	}

	//  #endregion EVENT HANDLERS

	//  #region PRIVATE METHODS

	_initialise() {
		// await super._inicidentManager_(`funeral-plan-cancel`, null);
		// await super.createAndClassifySubIncident();

	}

	/**
	 * agree event from dialog footer button, closes modal and navigates to success page
	 * 
	 * @returns {void} 
	 */
	 _agreeClick() {
		
		const isEmailInputValid = this._validateEmailAddress();
		
		if (!isEmailInputValid) {
			return;
		}
		this.dispatchEvent(new CustomEvent(`agree`, { detail: { cancellationReason: this.selectedReason, emailAddress: this.email, documentDetails: this.lifeCancelAgreementDetails } }));
	}

	/**
	 * back event from dialog footer button, takes you back to previous step
	 * 
	 * @returns {void}
	 */
	_backClick() {
		this.currentStep = STEPS.REASON;

	}

	/**
	 * event from cancelation reason select box to move to next step and set chosen reason
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_reasonSelected(e) {
		this.selectedReason = e.detail.new.code;
		this._getLifeCancelAgreement();
		this.currentStep = STEPS.AGREEMENT;
		// this.requestUpdate();
	}

	/**
	 * change event for email address
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_emailValueChanged(e) {
		this.email = e.detail.email;
		this.confirmEmail = e.detail.confirmEmail;

		if (e.detail.invalidFormat) {
			this.alertBannerMessage = ERROR_MESSAGE.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_MISMATCH;
		}
	}

	/**
	 * Clear alert banner message 
	 * 
	 * @returns {void}
	 */
	_clearAlerts() {
		this.alertBannerMessage = ``;
	}

	/**
	 * validation checks for email address
	 * 
	 * @returns {boolean} boolean for whether the alert banner message is empty or not
	 */
	_validateEmailAddress() {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmEmail)) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_REQUIRED;
		}
		return isNullorEmpty(this.alertBannerMessage);
	}

	/**
	 * callback function to cancel agreement doc details
	 * @returns {void}
	 */
	async _getLifeCancelAgreement() {
		await this.getLifeCancelPolicyDocument(this.selectedReason);
	}


	/**
	 * event to see whether the check box was selected 
	 * 
	 * @param {event} e e
	 * @return {void}
	 */
	_checkBoxChange(e) {
		if (e.detail.new) {
			this.agreeToTermsCheckSelected = true;
		} else {
			this.agreeToTermsCheckSelected = false;
		}
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
					margin-top: 25px;
					width: 60%;
				}

				.button {
					width: 140px;
				}

				.cancel-policy-modal{
					--theme-modal-alert-m-l-xl-width: 840px;
				}

				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
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

				horizon-product-tile {
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-subtitle-height: 20px;
					--theme-product-tile-subtitle-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-radio-disabled-border-color: #E1E1E1;
					--theme-radio-disabled-background-color: #F7F7F7;
				}

				.alert{
					--theme-toast-width: 100%;
					margin-bottom: 20px;
				}

				.alert-banner{
					margin-top: 20px;
					width: 100%;
				}

				.select-box{
					width: 816px
				}

				.title-label{
					margin-bottom: 10px;
					margin-top: 10px;
				}

				.check-box{
					--theme-check-width: 38px;
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
			<capitec-modal type="alert" class="cancel-policy-modal" header="Cancel Policy" style="--theme-modal-header-color: black; --theme-modal-alert-m-l-xl-width: 848px; --theme-modal-body-padding: 0px 0px 50px 0px;">
				<div slot="body" style="${this.alertBannerMessage === `` ? `height: 500px` : `height: 600px`}">
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

			<capitec-stepper
				layout="horizontal"
				.steps="${[{ title: `Cancellation Reason` }, { title: `Agreement` }]}"
				active-step-number="${this.currentStep}">
			</capitec-stepper>

			${this._renderDialogBodyContent()}

			
		`;
	}

	/**
	 * Render modal body content
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBodyContent() {
		return html`
			${this.currentStep === STEPS.REASON ? html`
				<capitec-content-box>
					<div class="alert-banner">
						<horizon-alert-banner
							type="warning"
							header="Notify client:"
							label="By cancelling this policy, they will no longer have any benefit on this policy. Ensure they have carefully considered the effects before continuing with cancellation"
							layout="vertical">
						</horizon-alert-banner>
					</div>
					<div class="select" data-automation-id="horizon-insure-cancel-policy-dialog-cancelation-reason">
						<capitec-select 
							class="select-box"
							label="Cancellation Reason" 
							.items= "${this.cancelationReasons}"
							display-field="text"
							id-field="code"
							@value-change = "${(e) => this._reasonSelected(e)}">
						</capitec-select>
					</div>
				</capitec-content-box>
			` 
			: html`
				<capitec-content-box>
					<horizon-product-tile class="view-document" type="default" label="Cancellation Agreement" subtitle="Life Policy" detail="" icon="" @click="${() => this.showCancelAgreement = true}">
						<capitec-label slot="detail" type="strong" label="View Document" >
						</capitec-label>
					</horizon-product-tile>

					<capitec-label type="title" label="Email cancellation agreement" class="title-label"></capitec-label>

					${this._renderEmailAlertBanner()}

					<horizon-email-input
						labelOne="Enter email address"
						labelTwo="Confirm email"
						email="${this.email}"
						confirmEmail="${this.confirmEmail}"
						?showRequiredError="${this.alertBannerMessage === ERROR_MESSAGE.EMAIL_REQUIRED}"
						@value-changed="${(e) => this._emailValueChanged(e)}"
						.callBack="${() => this._clearAlerts()}">
					</horizon-email-input>

					<capitec-check-group>
						<capitec-check label="I have read and understand the terms of the Capitec Life Cancellation Agreement. By checking the tick box and continuing, I electronically sign the agreement and confirm my acceptance of all terms contained in the agreement."
							@value-change="${(e) => this._checkBoxChange(e)}" class="check-box">
						</capitec-check>
					</capitec-check-group>
				</capitec-content-box>

				


			`}
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`

				${this.currentStep === STEPS.AGREEMENT ? html`
						<capitec-button class="button" slot="footer" type="secondary" label="Back"
							@click="${() => this._backClick()}">
						</capitec-button>
						<capitec-button class="button" slot="footer" type="primary" label="Agree" ?disabled="${!this.agreeToTermsCheckSelected}"
							@click="${() => this._agreeClick()}">
						</capitec-button>
					` 
					: html`
						<capitec-button class="button" slot="footer" type="secondary" label="Cancel"
							@click="${() => this._cancelClick()}">
						</capitec-button>
					`}
				
		`;
	}

	/**
	 * render the alert banner
	 * 
	 * @returns {html} html content 
	 */
	_renderEmailAlertBanner() {
		return this.alertBannerMessage 
		? html`
			<capitec-alert-banner type="unsuccessful-red" class= "alert">
				<capitec-group layout="horizontal">
					<capitec-label
						type="subtitle"
						label="Notify:">
					</capitec-label>
					<capitec-label
						label="${this.alertBannerMessage}">
					</capitec-label>
				</capitec-group>
			</capitec-alert-banner>`
		: html``;
	}

	/**
	 * render the agreement dialog
	 * 
	 * @returns {html} html content 
	 */
	_renderAgreementDialog() {
		return this.showCancelAgreement === false ? html``
		: html`
			<horizon-insure-agreement-dialog
			.agreementContent="${this.lifeCancelAgreementDetails?.documentContent.value}"
			@back-click="${() => this.showCancelAgreement = false}">
			</horizon-insure-agreement-dialog>
		`;
	}

	
	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-life-cancel-policy-dialog`, LifeCancelPolicyDialog);

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