import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import 'app/components/common/HorizonEmailInput';


const ERROR_MESSAGE = {
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Enter the correct email address`
};

/**
 * Insure Common Email model 
 */
class InsureEmailDialog extends Component {

	// #region INITIALISATION

	constructor() {
		super();
	
		this.email = ``;
		this.confirmEmail = ``;
		this.alertBannerMessage = ``;
		this.titleMessage = ``;
	}

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

	// #endregion INITIALISATION

	// #region EVENTS

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	_onSendClick() {
		const isEmailInputValid = this._validateEmailAddress();

		if (!isEmailInputValid) {
			return;
		}

		this.dispatchEvent(new CustomEvent(`send-email`, { detail: { emailAddress: this.email } }));
	}

	_clearAlerts() {
		this.alertBannerMessage = ``;
	}

	_emailValueChanged(e) {
		this.email = e.detail.email;
		this.confirmEmail = e.detail.confirmEmail;

		if (e.detail.invalidFormat) {
			this.alertBannerMessage = ERROR_MESSAGE.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_MISMATCH;
		}
	}

	// #endregion EVENTS

	// #region PRIVATE METHODS
	
	_validateEmailAddress() {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmEmail)) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_REQUIRED;
		}
		return isNullorEmpty(this.alertBannerMessage);
	}

	// #endregion

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

			`
		];
	}

	_renderBody() {
		return html`

			${this._renderAlertBanner()}

			<horizon-email-input
				labelOne="Enter Email Address"
				labelTwo="Confirm Email"
				email="${this.email}"
				confirmEmail="${this.confirmEmail}"
				?showRequiredError="${this.alertBannerMessage === ERROR_MESSAGE.EMAIL_REQUIRED}"
				@value-changed="${(e) => this._emailValueChanged(e)}"
				.callBack="${() => this._clearAlerts()}">
			</horizon-email-input>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button data-automation-id="stop-card-confirm-cancel" label="Cancel" 
					class = "capitec-button-medium" @click="${() => this._onCancelClick()}">
				</capitec-button>
				<capitec-button data-automation-id="stop-card-confirm-confirm" id="id-confirm-button" 
				class = "capitec-button-medium" type="primary" label="Send" @click="${() => this._onSendClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}

	_renderAlertBanner() {
		return this.alertBannerMessage 
		? html`
			<capitec-alert-banner type="unsuccessful-red">
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

window.customElements.define(`insure-email-dialog`, InsureEmailDialog);