import { Component, css, html } from 'platform/elements';
import { CallHandleService } from 'app/services/CallHandleService';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { SignalRService } from 'app/services/SignalRService';

import 'app/components/common/OptionButton';
import 'app/components/common/CallerDialog';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyBySecurityQuestions';


const RENDER_MODE = Object.freeze({
	VERIFY_CALLER: 1,
	SECURITY_QUESTIONS: 2,
	END_CALL: 3
});

const HEADER_LABEL = `Verify Caller`;

const MAX_ITA_ATTEMPTS = 3;
const MAX_XDS_ATTEMPTS = 2;

const ITA_TIMEOUT_SECS = 60;

// exporting the common code - used in securityQuestions failed screen
export const navigateToFailedScreen = (objInstance) => {

	objInstance.callerInformation.verificationStatus = `failed`;
	const state = {
		callerInformation: objInstance.callerInformation,
		incomingCallDetails: objInstance.incomingCallDetails
	};
	objInstance.horizonStore.saveState(state);

	return objInstance.horizonRouter.navigateToXdsVerificationFailed();
};

/**
 * The Horizon Verify Caller Details Dialog is used to verify a Capitec Client.
 * 
 * Events Raised 
 * -------------
 * cancel - should return to caller 
 * skip - should return to caller which should then navigate to the appropriate landing page
 * verify - should navigate to landing page with appropriate verification status
 * 
 * @export
 * @class VerifyCaller
 * @extends {Component}
 */
export class VerifyCaller extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Property initialization
		this.renderMode = RENDER_MODE.VERIFY_CALLER;
		this.incomingCallDetails = null;
		this.timeLeft = `1:00`;
		this.minutes = 1;
		this.seconds = ITA_TIMEOUT_SECS;
		this.appTimedOut = false;

		this.connectionID = ``;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.SignalRService = SignalRService.getInstance();

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._xdsErrorHandler(ex));

		this.itaFailedCount = 0;

		this.itaTimer = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} incomingCallDetails Information on the incoming call
	 * @property {Object} callerInformation Information (mini-profile) on the incoming caller
	 * 
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			callerInformation: { type: Object },
			renderMode: { type: Number },
			timeLeft: { type: String },
			notVerified: { type: Boolean },
			xdsMessage: { type: String },
			itaFailedCount: { type: Number },
			connectionID: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	connectedCallback() {
		super.connectedCallback();

		this.voiceReferenceNumber = this.incomingCallDetails.voiceReferenceNumber;
		this.ivrOptionCode = this.incomingCallDetails.ivrOptionCode;
		this.ivrOptions = this.incomingCallDetails.ivrOption.possibleValues;
		this.incomingTelephoneNumber = this.incomingCallDetails.incomingTelephoneNumber;

		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
		this.incidentRecId = this.incomingCallDetails.incidentRecId;
		this.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;

		this._itaVerification();

		if (!this.callerInformation.verificationAttempts) {
			this.callerInformation.verificationAttempts = {
				itaAttempts: 0,
				xdsAttempts: 0
			};
		}

		this.itaFailedCount = this.callerInformation.verificationAttempts.itaAttempts;
		this.appTimedOut = this.itaFailedCount >= MAX_ITA_ATTEMPTS;

		if (this.itaFailedCount < MAX_ITA_ATTEMPTS) {
			this.itaTimer = this._startTimer();
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _securityQuestionsClick() {
		const clientID = this.callerInformation.southAfricanIDNumber;

		const returnValue = await this.callHandleService.xdsQuestions(clientID);

		if (returnValue.succeeded) {
			this.securityQuestions = returnValue.result;
			if (!this.securityQuestions.authenticationPermitted) {
				this.callerInformation.verificationAttempts.xdsAttempts = MAX_XDS_ATTEMPTS; // There have already been too many attempts.
				this._updateApplicationState(`failed`);
				this.horizonRouter.navigateToXdsVerificationFailed();
			} else if (this.securityQuestions.questions && this.securityQuestions.questions.length > 0) {
				this.renderMode = RENDER_MODE.SECURITY_QUESTIONS;
			} else {
				this.xdsMessage = this.securityQuestions.errorMessage ? this.securityQuestions.errorMessage : `System Issue: Unable to obtain security questions`;
			}
		}
	}

	async _itaVerification() {
		this.SignalRService.startConnection();
		this.connectionID = this.SignalRService.getconnectionID();

		if (this.connectionID) {
			const returnValue = await this.callHandleService.itaVerification(this.callerInformation.cifNumber, this.connectionID);
			if (returnValue.succeeded) {
				this._startTimer();
			}
		}
	}

	_skipClick() {
		this.callerInformation.verificationAttempts.itaAttempts = this.itaFailedCount;
		this.dispatchEvent(new CustomEvent(`skip`, { detail: { incomingCallDetails: this.incomingCallDetails, callerInformation: this.callerInformation } }));
	}

	_skippedSecurityQuestions(event) {
		this.callerInformation = event.detail.callerInformation;
		this.callerInformation.verificationAttempts.itaAttempts = this.itaFailedCount;
		this.dispatchEvent(new CustomEvent(`skip`, { detail: { incomingCallDetails: this.incomingCallDetails, callerInformation: this.callerInformation } }));
	}

	_cancelledSecurityQuestions(event) {
		this.callerInformation = event.detail.callerInformation;
		this.callerInformation.verificationAttempts.itaAttempts = this.itaFailedCount;
		this.dispatchEvent(new CustomEvent(`cancel`, { detail: { incomingCallDetails: this.incomingCallDetails, callerInformation: this.callerInformation } }));
	}

	_verifiedViaSecurityQuestions(event) {
		this.callerInformation = event.detail.callerInformation;
		this.callerInformation.verificationAttempts.itaAttempts = this.itaFailedCount;
		this.dispatchEvent(new CustomEvent(`verified`, { detail: { incomingCallDetails: this.incomingCallDetails, callerInformation: this.callerInformation } }));
	}

	_tryAgain() {
		// TODO: Channel service comes here, on success of it need to do the below reset
		this.appTimedOut = false;
		this.minutes = 1;
		this.seconds = ITA_TIMEOUT_SECS;

		if (this.itaTimer) {
			this.itaFailedCount += 1;
			clearInterval(this.itaTimer);
			this.itaTimer = null;
		}

		if (this.itaFailedCount < MAX_ITA_ATTEMPTS) {
			this.itaTimer = this._startTimer();
		} else {
			this._navigateToItaVerificationFailed();
		}
	}

	_onEndCall() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateApplicationState(verificationStatus) {
		this.callerInformation.verificationStatus = verificationStatus;
		this.callerInformation.verificationAttempts.itaAttempts = this.itaFailedCount;

		const state = {
			callerInformation: this.callerInformation,
			incomingCallDetails: this.incomingCallDetails
		};

		this.horizonStore.saveState(state);
	}

	_xdsErrorHandler(exception) {
		const state = {
			incomingCallDetails: this.incomingCallDetails,
			callerInformation: this.callerInformation
		};
		this.horizonStore.saveState(state);
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_startTimer() {
		const startTimer = setInterval(() => {
			this.minutes = this.minutes !== 0 ? this.minutes - 1 : this.minutes;
			this.seconds--;

			const _stopTimer = () => clearInterval(startTimer);

			if (this.seconds <= 0) {
				_stopTimer();
				this.itaTimer = null;
				this.itaFailedCount += 1;
				this.notVerified = true;
				this.appTimedOut = true;

				if (this.itaFailedCount >= MAX_ITA_ATTEMPTS) {
					this._navigateToItaVerificationFailed();
				}
			}

			this.timeLeft = `${this.minutes}:${this.seconds < 10 ? `0` : ``}${this.seconds.toString()}`;
		}, 1000);

		return startTimer;
	}

	_navigateToItaVerificationFailed() {
		this._updateApplicationState(`failed`);
		this.horizonRouter.navigateToItaVerificationFailed();
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

				div[slot="body"]{
					width: 690px;
					height: 494px;
				}
				#notification-status-box {
					--theme-container-padding-top: 18px;
					--theme-container-padding-right: 17px;
					--theme-container-padding-bottom: 12px;
					--theme-container-padding-left: 16px;
					height: auto;
				}
				#notification-status-box > capitec-group {
					--theme-layout-gap-spacing: 16px;
				}
				#notification-status-box > capitec-group > capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-info-border: none;
				}
				#notification-status-box > capitec-group > capitec-alert-banner[type="error"] {
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					--theme-alert-banner-unsuccessful-red-border: none;
					
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
				}
				#notification-status-group > capitec-label {
					line-height: 24px;
					margin: 0;
					margin-bottom: 34px;

					--theme-label-title-font-size: 15px;
				}
				#notification-status-error-group > capitec-label {
					line-height: 24px;
					margin: 0;
					margin-bottom: 26px;

					--theme-label-title-font-size: 15px;
				}
				.sms-svg{
					height: 152px;
					width: 210px;
					margin: 15px 0px 8px 0px;
				}
				.connection-error-svg {
					height: 152px;
					width: 210px;
					margin: 18px 0px 13px 0px;
				}
				.notification-info {
					color: #545D60;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 24px;
					margin-bottom: 0px;
				}
				.timer-bold {
					font-weight: 700;
					color: #0083BB;
				}
				capitec-title-bar {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 15px;
					--theme-label-title-font-weight: 600;

					border-top: 1px solid #E1E1E1;
				}
				#relation-options-btn {
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 17px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					height: auto;
				}
				#relation-options-btn > capitec-group {
					--theme-layout-gap-spacing: 24px;
				}
				horizon-option-button {
					width: 204px;
					height: 81px;
				}
				horizon-caller-dialog {
					--horizon-modal-footer-padding: 0px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderVerifyCallerDialog()}
			${this._renderSecurityQuestionsDialog()}
			${this._renderEndCallModal()}
		`;
	}

	_renderVerifyCallerDialog() {
		return this.renderMode !== RENDER_MODE.VERIFY_CALLER
			? html``
			: html`
				<horizon-caller-dialog
					.incomingCallDetails="${this.incomingCallDetails}" 
					.headerLabel="${HEADER_LABEL}"
					@on-end-call="${() => this._onEndCall()}">
					<div slot="body">
						${this._renderNotificationStatus()}
						${this._renderXdsError()}
						${this._renderPushNotificationError()}
						${this._renderOtherOptions()}
						${this._renderLoadingIndicator()}
					</div>
				</horizon-caller-dialog>`;
	}

	_renderSecurityQuestionsDialog() {
		return this.renderMode !== RENDER_MODE.SECURITY_QUESTIONS
			? html``
			: html`
				<horizon-security-question 
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}" 
					.securityQuestions="${this.securityQuestions}"
					@cancel="${(event) => this._cancelledSecurityQuestions(event)}"
					@skip="${(event) => this._skippedSecurityQuestions(event)}"
					@verified="${(event) => this._verifiedViaSecurityQuestions(event)}">
				</horizon-security-question>`;
	}

	_renderEndCallModal() {
		return this.renderMode !== RENDER_MODE.END_CALL
			? html``
			: html`
				<horizon-end-call-session 
					.incomingCallDetails="${this.incomingCallDetails}"
					@cancel="${() => this.renderMode = RENDER_MODE.VERIFY_CALLER}">
				</horizon-end-call-session>`;
	}

	_renderNotificationStatus() {
		if (!this.appTimedOut && !this.xdsMessage) {
			return html`
				<capitec-content-box id="notification-status-box">
					<capitec-group layout="vertical"
                                    halign="stretch"
                                    valign="top"
                                    gap="clear">
						<capitec-alert-banner type="info">
							Notify client that a push notification has been sent and they need to accept to continue.
						</capitec-alert-banner>
						<capitec-group layout="vertical" 
                                    halign="center" 
                                    valign="top"
                                    gap="clear"
                                    id="notification-status-group">
							<img src="/images/insure/sms.svg" class="sms-svg"/>
							<div class="notification-info">
								There is <span class="timer-bold">${this.timeLeft}</span> remaining.
							</div>
							<capitec-label type="title" label="If the client has not received the notification, choose Try Again.">
							</capitec-label>
						</capitec-group>
					</capitec-group>
				</capitec-content-box>
			`;
		}
		return html``;
	}

	_renderPushNotificationError() {
		if (this.appTimedOut && !this.xdsMessage) {
			return html`
				<capitec-content-box id="notification-status-box">
					<capitec-group layout="vertical" 
                                    halign="stretch"
                                    valign="top"
                                    gap="clear">
						<capitec-alert-banner type="error">
							Notification didn't send due to a system error.
						</capitec-alert-banner>
						<capitec-group layout="vertical"
                                        halign="center" 
                                        valign="top" 
                                        gap="clear"
                                        id="notification-status-error-group">
							<img src="/images/insure/connection-error.svg" class="connection-error-svg"/>
							<div class="notification-info">
								An error has occured.
							</div>
							<capitec-label type="title"
								label="Notify the client and either try again or complete verification through security questions.">
							</capitec-label>
						</capitec-group>
					</capitec-group>
				</capitec-content-box>
			`;
		}
		return html``;
	}

	_renderXdsError() {
		if (this.xdsMessage) {
			return html`
				<capitec-content-box id="notification-status-box">
					<capitec-group layout="vertical" 
                                    halign="stretch"
                                    valign="top"
                                    gap="clear">
						<capitec-alert-banner type="error">
							${this.xdsMessage}
						</capitec-alert-banner>
						<capitec-group layout="vertical" 
                                        halign="center"
                                        valign="top"
                                        gap="clear"
                                        id="notification-status-error-group">
							<img src="/images/insure/connection-error.svg" class="connection-error-svg"/>
							<div class="notification-info">
								An error has occured.
							</div>
							<capitec-label type="title"
								label="Notify the client and either try again or complete verification via the App.">
							</capitec-label>
						</capitec-group>
					</capitec-group>
				</capitec-content-box>
			`;
		}
		return html``;
	}

	_renderOtherOptions() {
		console.log(`ita failed count`, this.itaFailedCount);
		return html`
			<capitec-title-bar type="default" label="Choose another option"></capitec-title-bar>
			<capitec-content-box id="relation-options-btn">
				<capitec-group layout="horizontal" halign="left" valign="top" gap="clear">
					<horizon-option-button 
						label="Security Questions" 
                        icon="system/apply-now-action"
                        iconSize="default"
						@click="${() => this._securityQuestionsClick()}">
					</horizon-option-button>
					<horizon-option-button 
						label="Skip"
                        icon="system/arrow-right-action" 
                        iconSize="default"
					    @click="${() => this._skipClick()}">
					</horizon-option-button>
					<horizon-option-button 
						label="Try Again" 
						img-src="/images/insure/refresh.svg"
						iconSize="default"
						?disabled=${this.itaFailedCount >= MAX_ITA_ATTEMPTS - 1}
						?hidden=${this.itaFailedCount >= MAX_ITA_ATTEMPTS - 1}
						@click="${() => this._tryAgain()}">
					</horizon-option-button>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

window.customElements.define(`horizon-verify-caller`, VerifyCaller);