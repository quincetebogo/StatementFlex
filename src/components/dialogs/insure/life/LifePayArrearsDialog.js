import { Component, css, html } from 'platform/elements';
import { CANCELATION_REASONS } from 'app/constants/InsureCommon';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import 'app/components/dialogs/insure/AgreementDialog';

const STEPS = {
	SETTLE_DETAILS: 1,
	AGREEMENT: 2
};

const ERROR_MESSAGES = {
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Please confirm email`
};

/**
 * Life pay arrears dialog
 * 
 * Events Raised 
 * -------------
 * close-dialog
 *  
 * @export
 * @class LifePayArrearsDialog
 * @extends {Component}
 */
class LifePayArrearsDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.currentStep = STEPS.REASON;
		this.lifePayArrearsAgreementDetails = {};
		this.showAgreementDialog = false;
		this.email = ``;
		this.confirmEmail = ``;
		this.emailAlertBannerMessage = ``;
		this.agreeToTermsCheckSelected = false;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	static get properties() {
		return {
			currentStep: { type: Number, state: true },
			getLifeCancelPolicyDocument: { type: Object, state: true },
			lifePayArrearsAgreementDetails: { type: Object, state: true },
			showAgreementDialog: { type: Boolean, state: true },
			email: { type: String, state: true },
			confirmEmail: { type: String, state: true },
			emailAlertBannerMessage: { type: String, state: true },
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
		this.dispatchEvent(new CustomEvent(`agree`, { detail: { cancellationReason: this.selectedReason, emailAddress: this.email, documentDetails: this.lifePayArrearsAgreementDetails } }));
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
			this.emailAlertBannerMessage = ERROR_MESSAGES.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.emailAlertBannerMessage = ERROR_MESSAGES.EMAIL_MISMATCH;
		}
	}

	/**
	 * Clear alert banner message 
	 * 
	 * @returns {void}
	 */
	_clearAlerts() {
		this.emailAlertBannerMessage = ``;
	}

	/**
	 * validation checks for email address
	 * 
	 * @returns {boolean} boolean for whether the alert banner message is empty or not
	 */
	_validateEmailAddress() {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmEmail)) {
			this.emailAlertBannerMessage = ERROR_MESSAGES.EMAIL_REQUIRED;
		}
		return isNullorEmpty(this.emailAlertBannerMessage);
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

				.pay-arrears-dialog{
					--theme-modal-alert-m-l-xl-width: 520px;
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
					width: 490px;
				}

				.title-label{
					margin-bottom: 10px;
					margin-top: 10px;
				}

				.check-box{
					--theme-check-width: 65px;
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
			<capitec-modal type="free" class="pay-arrears-dialog" header="Life Cover arrears" style="--theme-modal-header-color: black; --theme-modal-alert-m-l-xl-width: 520px; --theme-modal-body-padding: 0px 0px 50px 0px;">
				<div slot="body" style="${this.emailAlertBannerMessage === `` ? `height: 540px` : `height: 660px`} ">
					${this._renderDialogBody()}
				</div>
				<div slot="footer">
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
					<div class="select" >
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
					<horizon-product-tile class="view-document" type="default" label="Cancellation Agreement" subtitle="Life Policy" detail="" icon="" @click="${() => this.showAgreementDialog = true}">
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
						?showRequiredError="${this.emailAlertBannerMessage === ERROR_MESSAGES.EMAIL_REQUIRED}"
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
		return this.emailAlertBannerMessage
			? html`
			<capitec-alert-banner type="unsuccessful-red" class= "alert">
				<capitec-group layout="horizontal">
					<capitec-label
						type="subtitle"
						label="Notify:">
					</capitec-label>
					<capitec-label
						label="${this.emailAlertBannerMessage}">
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
		return this.showAgreementDialog === false
			? html``
			: html`
				<horizon-insure-agreement-dialog
				.agreementContent="${this.lifePayArrearsAgreementDetails?.documentContent.value}"
				@back-click="${() => this.showAgreementDialog = false}">
				</horizon-insure-agreement-dialog>
			`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-pay-arrears-dialog`, LifePayArrearsDialog);

/**
 * send close modal event to the consuming component when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-life-pay-arrears-dialog ... @close-modal="${this._handler}"></horizon-insure-life-pay-arrears-dialog
 *
 * @event LifePayArrearsDialog#close-modal
 * @type {Object} - N/A
 */
