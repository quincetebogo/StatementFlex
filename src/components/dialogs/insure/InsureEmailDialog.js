import { Component, css, html } from 'platform/elements';
import { EmailPlanEvents } from 'app/constants/telemetry/events/Insure';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import 'app/components/common/HorizonEmailInput';


const ERROR_MESSAGE = {
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Please confirm email`
};

/**
 * Email dialog allows you enter your email address and to confirm it 
 * 
 * Events Raised 
 * -------------
 * close-modal
 * send-email
 *  
 * @export
 * @class InsureEmailDialog
 * @extends {Component}
 */
class InsureEmailDialog extends Component {

	// #region INITIALISATION

	constructor() {
		super();
	
		this.email = ``;
		this.confirmEmail = ``;
		this.alertBannerMessage = ``;
		this.titleMessage = ``;
		this._telemetry = HorizonTelemetry.getInstance();
		this.telemetryEvents = {};
	}
	
	// #endregion INITIALISATION

	// #region PROPERTIES

	/**
	 * @property {String} email - email address to be sent.
	 * @property {String} confirmEmail - confirm email address.
	 * @property {String} alertBannerMessage error message when required fields are not provided.
	 * @property {String} titleMessage - title fo send email popup.
	 * @static
	 */
	 static get properties() {
		return {
			email: { type: String, state: true },
			confirmEmail: { type: String, state: true },
			alertBannerMessage: { type: String },
			titleMessage: { type: String }
		};
	}

	// #endregion PROPERTIES

//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		this.telemetryEvents = EmailPlanEvents;
		await this._telemetry.startSpan(this.telemetryEvents.SEND_EMAIL, {});

		this._initialise();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();
		await this._telemetry.endSpan(this.telemetryEvents.SEND_EMAIL, {});
	}

	//  #endregion LIFECYCLE OVERRIDES

	// #region EVENT HANDLERS

	/**
	 * Close dialog
	 * 
	 * @returns {void}
	 */
	_cancelClick() {
		this._telemetry.logEvent(this.telemetryEvents.SEND_EMAIL_CANCEL, {
			"screen": TelemetryScreen.INSURE_SEND_EMAIL_DIALOG,
			"next-screen": TelemetryScreen.INSURE_SUCCESS
		});
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	/**
	 * Dispatches event to send email
	 * 
	 * @returns {void}
	 */
	_sendClick() {

		this._telemetry.logEvent(this.telemetryEvents.SEND_EMAIL_SEND, {
			"screen": TelemetryScreen.INSURE_SEND_EMAIL_DIALOG,
			"next-screen": TelemetryScreen.INSURE_SUCCESS
		});

		const isEmailInputValid = this._validateEmailAddress();

		if (!isEmailInputValid) {
			return;
		}

		this.dispatchEvent(new CustomEvent(`send-email`, { detail: { emailAddress: this.email } }));
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

	// #endregion EVENT HANDLERS

	// #region PRIVATE METHODS
	
	async _initialise() {
		await super._inicidentManager_(`funeral-document-request`, () => this._toggleBusyFlag());
		await super.createAndClassifySubIncident();
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

	// #endregion PRIVATE METHODS

	// #region RENDERING

	static get styles() {
		return [
			super.styles,
			css`

				${INSURE_CSS}

				.modal-body-label{
					padding: 10px 10px 10px 10px;
					font-weight: bold;
				}

				.modal-body-textfield{
					padding: 10px 10px 10px 10px;
				}

				.alert{
					--theme-toast-width: 100%;
					margin-bottom: 20px;
				}

			`
		];
	}

	/**
	 * render the dialog body 
	 * 
	 * @returns {html} html content
	 */
	_renderBody() {
		return html`

			${this._renderAlertBanner()}

			<horizon-email-input
				labelOne="Enter email address"
				labelTwo="Confirm email"
				email="${this.email}"
				confirmEmail="${this.confirmEmail}"
				?showRequiredError="${this.alertBannerMessage === ERROR_MESSAGE.EMAIL_REQUIRED}"
				@value-changed="${(e) => this._emailValueChanged(e)}"
				.callBack="${() => this._clearAlerts()}">
			</horizon-email-input>
		`;
	}

	/**
	 * render the dialog footer
	 * 
	 * @returns {html} html content
	 */
	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button data-automation-id="stop-card-confirm-cancel" label="Cancel" 
					class = "capitec-button-medium" @click="${() => this._cancelClick()}">
				</capitec-button>
				<capitec-button data-automation-id="stop-card-confirm-confirm" id="id-confirm-button" 
				class = "capitec-button-medium" type="primary" label="Send" @click="${() => this._sendClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}

	/**
	 * render the alert banner
	 * 
	 * @returns {html} html content 
	 */
	_renderAlertBanner() {
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
	 * Generates the component template for web mode
	 * 
	 * @returns {html} html content 
	 */
	_webTemplate() {
		return html`
		<capitec-modal data-automation-id="insure-email-modal" type="form" style="font-weight: bold;" 
			header="${this.titleMessage}" header-align="left">
			<div slot="body" class="insure-email-modal-body">
				${this._renderBody()}
			</div>
			<div slot="footer">
				${this._renderFooter()}
			</div>
		</capitec-modal>`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-email-dialog`, InsureEmailDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-email-dialog ... @close-modal="${this._handler}"></horizon-insure-email-dialog>
 *
 * @event InsureEmailDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send send email event to the consuming componant when agreement is accepted 
 *
 * @example
 * <horizon-insure-email-dialog ... @send-email="${this._handler}"></horizon-insure-email-dialog>
 *
 * @event InsureEmailDialog#agreementAccepted
 * @type {Object} - N/A
 */