import { Component, css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { formatPhoneNumber } from 'app/utils/channelServiceUtilities';
import 'platform/components/popups/Modal';


const ERROR_MESSAGE = {
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Enter the correct email address`
};

/**
 * The Horizon Pay shap update implements the modal for updating the default institute.
 * 
 * Events Raised 
 * -------------
 * -
 * 
 * @export
 * @class PayShapUpdate
 * @extends {Component}
 */

export class PayShapPOP extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	
		this.horizonStore = HorizonStore.getInstance();
		this.inAppNotification = false;
		this.smsNotififcation = false;
		this.emailNotification = false;
		this.showemailField = false;

		// private properites
		
		this.alertBannerMessage = ``;
		this.emailText = `Email address`;
		
		// private variables
		this.emailLabel = `Enter email address`;
		this.confirmEmailLabel = `Confirm email`;
		this.idEmailAddress = ``;
		this.idConfirmEmailAddress = ``;
		this.errMessage = {
			idEmailAddress: ``,
			idConfirmEmail: ``
		};

		this.notificationType = [];
	}


	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			
			inAppNotification: { type: Boolean },
			smsNotififcation: { type: Boolean },
			emailNotification: { type: Boolean },
			showemailField: { type: Boolean },
		
			registeredEmailId: { type: String },
			alertBannerMessage: { attribute: false },
			emailText: { attribute: false },

			notificationType: { type: String },
			verifiedCellphoneNumber: { type: String },
			emailAddress: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.screenDetails = this.horizonStore.getScreenDetails();
		this.verifiedCellphoneNumber = this.screenDetails && this.screenDetails.verifiedCellphoneNumber;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancel() {
		this.dispatchEvent(new CustomEvent(`on-cancel`, {}));
	}

	_inAppNotificationSelected() {
		this.inAppNotification = !this.inAppNotification;
		this._addOrRemoveNotificationType(this.inAppNotification, `APP`);
	}

	_smsNotificationSelected() {
		this.smsNotififcation = !this.smsNotififcation;
		this._addOrRemoveNotificationType(this.smsNotififcation, `SMS`);
	}

	_emailNotificationSelected() {
		this.emailNotification = !this.emailNotification;
		this._addOrRemoveNotificationType(this.emailNotification, `EMAIL`);
	}

	_showEmailField() {
		this.showemailField = !this.showemailField;
	}

	_sendClick(e) {
		if (this.notificationType.length > 0) {
			if (this.emailNotification && !this._validateEmailAddress()) {
				return;
			} 
			this._sendProofOfPayment();
 		}
	}

	_sendProofOfPayment() {
		this.dispatchEvent(new CustomEvent(
		`on-send`, 
		{ detail: {
				emailAddress: this.idEmailAddress,
				notificationType: this.notificationType,
				verifiedCellphoneNumber: this.verifiedCellphoneNumber
			} }
		));

	}

	_clearAlerts() {
		this.alertBannerMessage = ``;
	}

	_emailValueChanged(e) {
		this.idEmailAddress = e.detail.email;
		this.confirmEmail = e.detail.confirmEmail;

		if (e.detail.invalidFormat) {
			this.alertBannerMessage = ERROR_MESSAGE.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_MISMATCH;
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_validateEmailAddress() {
		if (this._isNullorEmpty(this.idEmailAddress) || this._isNullorEmpty(this.confirmEmail)) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_REQUIRED;
		}

		return this._isNullorEmpty(this.alertBannerMessage);
	}

	_onKeyPress(e) {
		this._clearErrors(e);
	}

	_clearErrors(e) {
        this.errMessage.idEmailAddress = ``;
        this.errMessage.idConfirmEmail = ``;
		this.alertBannerMessage = ``;
		this.emailText = `Email address`;
	}

	_valueChanged(e) {
		this[e.currentTarget.id] = e.detail.new;
		this._clearErrors(e);
		this.emailText = `Email address`;
	}

	_isNullorEmpty(fieldValue) {
		return fieldValue === `` || fieldValue === null || fieldValue === undefined;
	}

	_addOrRemoveNotificationType(selcted, type) {
		if (selcted) {
			this.notificationType.push(type);
		} else {
			const index = this.notificationType.indexOf(type);
			if (index !== -1) {
				this.notificationType.splice(index, 1);
			}
		}
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles, 
			css`

				capitec-modal {
					width: 808px;
					height: 856px;

					--theme-modal-free-max-width: 808px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 8px 16px 8px 0px;
				}

				div[slot="body"] {
					width: var(--horizon-modal-width, 690px);
					height: 600px;
				}

				capitec-label[label="Default institution"] {
					--theme-label-title-font-size: 16px;
					--theme-label-title-font-weight: 600;
				}

				.app-box {
					--theme-card-min-height: 50px;
				}

				.sms-box {
					--theme-card-min-height: 50px;
				}

				.email-box {
					--theme-card-min-height: 50px;
				}

				capitec-card > capitec-group {
					padding: 10px;
					height: 48px;
				}

				capitec-check {
					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
					--theme-label-font-color: #3A3A3A;
				}

				.terms-and-conditions {
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
				}

				.terms-and-conditions > ol {
					margin: 0px;
					padding-left: 20px;
				}

				.terms-and-conditions > ol > li {
					padding-left: 10px;
				}

				.accept-terms-and-conditions {
					justify-content: center;
					margin-bottom: 13px;

					--theme-card-min-height: 48px;
				}

				.main {
					height: 728px;
					border-bottom: 1px solid #E1E1E1;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 18px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}

				.scroll {
					height: 728px;
					width: 808px;
					border-bottom: 1px solid #E1E1E1;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 18px;
					--theme-container-padding-right: 2px;
					--theme-container-padding-bottom: 0px;
				}

				.agreement-viewer {
					width: 100%;
					height: 100%;
				}

				capitec-title-bar {
					padding: 0px 0px 0px 10px;
					background: #E1E1E1;

					--theme-label-title-font-size: 14px;
					--theme-titlebar-min-height: 35px;
					--theme-label-title-font-weight: 600;
				}

				.institute-name {
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}

				.list-items {
					margin: 0px;
					padding-inline-start: 20px;
				}

				.agreement {
					padding: 10px;
				}

				.agreement-box {
					padding: 10px;
				}
				.warning-modal{
					--theme-modal-free-max-width: 500px;
					--theme-modal-free-max-height: 400px;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
				}
				.warning-header {
					width: 341px;
					height: auto;
					position: absolute;
					display: flex;
					align-items: center;
					left: -464px;
					top: -11px;
					--theme-modal-header-height: 64px;
				}
				.warning-label {
					--theme-label-default-font-size: 18px;
					--theme-label-default-font-weight: 600;
				}
				.warning-modal > div[slot="body"] {
					height: 268px;
					width: 500px;
				}
				.warning-body > capitec-content-box > capitec-label {
					--theme-label-default-font-size: 16px;
					--theme-label-default-font-weight: 400;
					margin-bottom: 24px;
				}
				capitec-alert-banner {
					--theme-toast-box-shadow: none;
					--theme-toast-width: 664px;
					--theme-toast-border-radius: 0px;
				}
				horizon-label {
					--horizon-label-text-height: 20px;

                    --horizon-label-text-font-size: 15px;

                    --horizon-label-text-font-weight: 500;

                    --horizon-label-text-line-height: 16px;

                    --horizon-label-text-color: #3A3A3A;

                    --horizon-label-value-height: 12px;

                    --horizon-label-value-font-size: 12px;

                    --horizon-label-value-font-weight: 500;

                    --horizon-label-value-line-height: 5px;

                    --horizon-label-value-color:#3A3A3A;
				}

				horizon-email-input {
					--theme-input-confirm-email-top: -63px;
					--theme-input-email-top: -46px;
				}

			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Proof of Payment">
				<div slot="body">
					<capitec-content-box class="main-container">
						${this._renderNotificationType()}
					</capitec-content-box>
				</div>
				<div slot="footer" class="footer-class">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderAlertBanner() {
		return this.smsNotififcation || this.emailNotification
		? html`
			<capitec-alert-banner 
				type="warning" 
				header="Notify client:" 
				label="A fee will be charged for SMS & Email notifications" 
				layout="horizontal">
			</capitec-alert-banner>`
		: html``;
	}

	_renderNotificationType() {
		return html`
			<capitec-label type="strong" label="Choose notification type"></capitec-label>
			${this._renderAlertBanner()}
			${this._renderSmsNotification()}
			${this._renderEmailNotification()}
			${this._renderEmailFields()}
		`;
	}


	// _renderAppNotification() {
	// return html`
	// <capitec-card class="app-box">
	// <capitec-group >
	// <capitec-check label="In App"
	// @value-change="${() => this._inAppNotificationSelected()}"></capitec-check>
	// </capitec-group>
	// </capitec-card>
	// `;

	// }

	_renderSmsNotification() {
		return html`
		<capitec-card class="sms-box">
		<capitec-group layout="horizontal" gap="none">
				<capitec-check 
				@value-change="${() => this._smsNotificationSelected()}"></capitec-check></capitec-check>
				<horizon-label
				value="${formatPhoneNumber(this.verifiedCellphoneNumber)}"
				label="SMS"></horizon-label>
				</capitec-group>
		</capitec-card>
		`;
	}

_renderEmailNotification() {
		return html`
		<capitec-card class="email-box">
		<capitec-group layout="horizontal">
				<capitec-check label="Email"
				@click="${() => this._showEmailField()}"
				@value-change="${() => this._emailNotificationSelected()}"></capitec-check>
				</capitec-group>
		</capitec-card>
		`;
}

_renderEmailFields() {
	return this.showemailField
	? html`
		<horizon-email-input
			registeredEmailId="${this.registeredEmailId}"
			?showRequiredError="${this.alertBannerMessage === ERROR_MESSAGE.EMAIL_REQUIRED}"
			.callBack="${() => this._clearAlerts()}"
			@value-changed="${(e) => this._emailValueChanged(e)}">
		</horizon-email-input>`
	: html``;
}

	_renderFooter() {
		return html`
			<capitec-button
					label="Cancel"
					@click="${() => this._onCancel()}">
			</capitec-button>

			<capitec-button 
					type="primary"
					label="Send"
					?disabled="${!this.inAppNotification && !this.smsNotififcation && !this.emailNotification}"
					@click="${(e) => this._sendClick(e)}">
			</capitec-button>
		`;
	}

}
customElements.define(`horizon-pay-shap-pop`, PayShapPOP);