import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonSignalRClient } from 'app/shell/HorizonSignalRClient';
import { HorizonStore } from 'app/store/HorizonStore';

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
		this.isBusy = false;
		this.connectionID = ``;
		this.itaFailedCount = 0;
		this.itaTimer = null;
		this.loading = true;
		this.xdsMessage = ``;
		this.itaMessage = ``;
		this.noOfXdsVerificationAttempted = 0;
		this.itaVerificationFailed = false;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.logger = Logger.getInstance();

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._xdsErrorHandler(ex));
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
			noOfXdsVerificationAttempted: { type: Number },

			renderMode: { attribute: false },
			timeLeft: { attribute: false },
			xdsMessage: { attribute: false }, // Set when there has been a system error with XDS
			itaMessage: { attribute: false }, // Set when there has been a system error with ITA
			itaFailedCount: { attribute: false },
			connectionID: { attribute: false },
			isBusy: { attribute: false },
			loading: { attribute: false },
			itaVerificationFailed: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	async connectedCallback() {
		super.connectedCallback();

		this.logger.log(`info`, `Entered connectedCallback`, `VerifyCaller`);

		// Extracting incoming call details
		this.voiceReferenceNumber = this.incomingCallDetails.voiceReferenceNumber;
		this.ivrOptionCode = this.incomingCallDetails.ivrOptionCode;
		this.ivrOptions = this.incomingCallDetails.ivrOption.possibleValues;
		this.incomingTelephoneNumber = this.incomingCallDetails.incomingTelephoneNumber;

		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
		this.incidentRecId = this.incomingCallDetails.incidentRecId;
		this.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;

		// Resetting ITA & XDS attempts
		if (!this.callerInformation.verificationAttempts) {
			this.callerInformation.verificationAttempts = {
				itaAttempts: 0,
				xdsAttempts: 0
			};
		}

		this.itaFailedCount = this.callerInformation.verificationAttempts.itaAttempts;
		this.appTimedOut = this.itaFailedCount >= MAX_ITA_ATTEMPTS;

		// function for stopping the ITA timer
		this._stopTimer = () => {
			if (this.itaTimer) {
				clearInterval(this.itaTimer);
				this.itaTimer = null;
				this.logger.log(`info`, `ITA timer stopped`, `VerifyCaller`);
			}
		};


		// If we have digital channels (XDS/USSD)
		if (this.callerInformation.hasDigitalChannels) {
			this.horizonSignalRClient = HorizonSignalRClient.getInstance();
			this._initiateItaVerification();
		} else {
			this.logger.log(`info`, `Digital channels are unavailable`, `VerifyCaller`);
			await this._securityQuestionsClick();
		}

		// The Verify Caller UI will not display until this.loading is false. This keeps it hidden
		// should we be transitioning directly to security questions because APP/USSD is unavailable
		this.loading = false;
	}

	disconnectedCallback() {
		// Cleanup before we leave the dialog
		this.logger.log(`info`, `Entered disconnectedCallback - cleaning up resources`, `VerifyCaller`);
		this._stopTimer();
		this._stopSignalRConnection();
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _securityQuestionsClick() {
		this.xdsMessage = ``;
		const clientID = this.callerInformation.southAfricanIDNumber;
		const returnValue = await this.callHandleService.xdsQuestions(clientID);

		if (returnValue.succeeded) {
			this.securityQuestions = returnValue.result;

			const authHistory = this.securityQuestions.authenticationHistory;
			if (authHistory) {
				this.noOfXdsVerificationAttempted = this._calculateXDSAttempts(authHistory);
			}

			if (!this.securityQuestions.authenticationPermitted) {
				this.logger.log(`info`, `Maximum attempts at XDS verification exceeded`, `_securityQuestionsClick`);
				this.callerInformation.verificationAttempts.xdsAttempts = MAX_XDS_ATTEMPTS; // There have already been too many attempts.
				this._updateApplicationState(`failed`);
				this.horizonRouter.navigateToXdsVerificationFailed();
			} else if (this.securityQuestions.questions && this.securityQuestions.questions.length > 0) {
				this.logger.log(`info`, `XDS Questions retrieved, transitioning to Security Questions Dialog`, `_securityQuestionsClick`);
				this._stopSignalRConnection();
				this._stopTimer();
				this.renderMode = RENDER_MODE.SECURITY_QUESTIONS;
			} else {
				this.xdsMessage = this.securityQuestions.errorMessage ? this.securityQuestions.errorMessage : `System Issue: Unable to obtain security questions`;
				this.logger.log(`error`, `XDS ERROR: ${$this.xdsMessage}`, `_securityQuestionsClick`);
			}
		} else {
			this.logger.log(`error`, `Failed to retrieve XDS Security Questions`, `_securityQuestionsClick`, returnValue.correlationId);
		}
	}

	_calculateXDSAttempts(authHistory) {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
 
		const usedAttempts = authHistory.filter(item => {
			const bureauDate = new Date(item.bureauDate);
			if (bureauDate > yesterday && item.authenticationStatus === `Not Authenticated`) {
				return true;
			}
			return false;
		}).length;
		return usedAttempts;
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

	_verifyViaApp(event) {
		this.callerInformation = event.detail.callerInformation;
		this.callerInformation.verificationAttempts.itaAttempts = this.itaFailedCount;
		this.renderMode = RENDER_MODE.VERIFY_CALLER;
		this.horizonSignalRClient = HorizonSignalRClient.getInstance();
		this._initiateItaVerification();
	}

	_tryAgain() {
		this.itaVerificationFailed = false;
		this.appTimedOut = false;
		this.itaMessage = ``;
		this.minutes = 1;
		this.seconds = ITA_TIMEOUT_SECS;

		if (this.itaTimer) {
			this._stopTimer();
			this.itaFailedCount += 1;
		}

		if (this.itaFailedCount < MAX_ITA_ATTEMPTS) {
			// Re-initialting the ITA verification
			this.logger.log(`info`, `Retrying ITA verification`, `_tryAgain`);
			this._itaServiceCall();
		} else {
			this.logger.log(`info`, `Maximum ITA verification attemmpts exceeded`, `_tryAgain`);
			this._navigateToItaVerificationFailed();
		}
	}

	_endCall() {
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
		this.xdsMessage = `System error. Please try again later`;

		return true;
	}

	_itaErrorHandler(exception) {
		const state = {
			incomingCallDetails: this.incomingCallDetails,
			callerInformation: this.callerInformation
		};
		this.horizonStore.saveState(state);
		this.itaMessage = `System error. Please try again later`;

		return true;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_startTimer() {
		const startTimer = setInterval(() => {

			this.minutes = this.minutes !== 0 ? this.minutes - 1 : this.minutes;
			this.seconds--;

			if (this.seconds <= 0) {
				this._stopTimer();
				this.itaTimer = null;
				this.itaFailedCount += 1;
				this.appTimedOut = true;

				if (this.itaFailedCount >= MAX_ITA_ATTEMPTS) {
					this._stopSignalRConnection();
					this._navigateToItaVerificationFailed();
				} else {
					this._updateApplicationState(`unverified`);
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

	async _initiateItaVerification() {

		await this._initialiseSignalR();
		this._itaServiceCall();
	}

	async _initialiseSignalR() {
		this.logger.log(`info`, `Initialising SignalR connection for ITA verification`, `_initialiseSignalR`);
		this.itaVerificationFailed = false;
		// Starting signalR connection
		this.horizonSignalRClient.startConnection();
		// Fetching connection id from signalR client
		this.connectionID = await this.horizonSignalRClient.getConnectionId();

		this.logger.log(`info`, `SignalR connection established`, `_initialiseSignalR`);
	}

	async _itaServiceCall() {
		if (this.connectionID) {

			const request = {
				cifNumber: this.callerInformation.cifNumber,
				connectionID: this.connectionID
			};

			const returnValue = await this.callHandleService.itaVerification(request, (ex) => this._itaErrorHandler(ex));

			if (returnValue.succeeded) {

				this.logger.log(`INFO`, `ITA verification request initiated`, `_itaServiceCall`);

				// Registering handler to perform post event action
				await this.horizonSignalRClient.registerHandler((verificationStatus) => {
					this._signalRPostEventAction(verificationStatus);
				});

				if (this.itaFailedCount < MAX_ITA_ATTEMPTS) {
					this.logger.log(`info`, `ITA timer started`, `_itaServiceCall`);
					this.itaTimer = this._startTimer();
				}
			} else {
				this.logger.log(`error`, `itaVerification channel service call failed`, `_itaServiceCall`, returnValue.correlationId);
			}
		}
	}

	_signalRPostEventAction(verificationStatus) {
		this.logger.log(`info`, `ITA verification event received. Status=${verificationStatus}`, `_signalRPostEventAction`);

		this._stopTimer();

		if (verificationStatus) {
			this.logger.log(`info`, `ITA SignalR subscription stopped`, `_signalRPostEventAction`);

			this._stopSignalRConnection();

			this.callerInformation.verificationStatus = `verified`;

			this.dispatchEvent(new CustomEvent(`verified`, {
				detail: {
					incomingCallDetails: this.incomingCallDetails,
					callerInformation: this.callerInformation
				}
			}));
		} else {
			this.logger.log(`info`, `ITA SignalR event indicated that verification was rejected`, `_signalRPostEventAction`);

			this.itaVerificationFailed = true;
			this.itaFailedCount++;

			if (this.itaFailedCount >= MAX_ITA_ATTEMPTS) {
				this._stopSignalRConnection();
				this._navigateToItaVerificationFailed();
			}
			this._updateApplicationState(`failed`);
		}
	}

	_stopSignalRConnection() {
		if (this.horizonSignalRClient) {
			this.logger.log(`info`, `Initialising SignalR connection for ITA verification`, `_stopSignalRConnection`);
			this.horizonSignalRClient.stopConnection();
			this.horizonSignalRClient = null;
		}
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
		if (this.loading) {
			return html`${this._renderLoadingIndicator()}`;
		}

		return this.renderMode !== RENDER_MODE.VERIFY_CALLER
			? html``
			: html`
				<horizon-caller-dialog
					.incomingCallDetails="${this.incomingCallDetails}" 
					.isNeedSelectable=${false}
					.headerLabel="${HEADER_LABEL}"
					@on-end-call="${() => this._endCall()}">
					<div slot="body">
						${this._renderPushNotificationStatus()}
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
					.noOfXdsVerificationAttempted="${this.noOfXdsVerificationAttempted}"
					@cancel="${(event) => this._cancelledSecurityQuestions(event)}"
					@skip="${(event) => this._skippedSecurityQuestions(event)}"
					@verified="${(event) => this._verifiedViaSecurityQuestions(event)}"
					@verify-via-app="${(event) => this._verifyViaApp(event)}">
				</horizon-security-question>`;
	}

	_renderEndCallModal() {
		return this.renderMode !== RENDER_MODE.END_CALL
			? html``
			: html`
				<horizon-end-call-session 
					.incomingCallDetails="${this.incomingCallDetails}"
					endCallContext="VerifyClient"
					@cancel="${() => this.renderMode = RENDER_MODE.VERIFY_CALLER}">
				</horizon-end-call-session>`;
	}

	_renderPushNotificationStatus() {
		if (this.callerInformation.hasDigitalChannels && !this.appTimedOut && !this.itaVerificationFailed && !this.itaMessage) {
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
		if (this.callerInformation.hasDigitalChannels && (this.appTimedOut || this.itaVerificationFailed) && !this.itaMessage) {

			let message = ``;
			if (this.appTimedOut) {
				message = `The client did not accept the notification in time`;
			} else if (this.itaVerificationFailed) {
				message = `The client rejected the notification`;
			} else {
				message = `The notification didn't send due to a system error.`;
			}

			return html`
				<capitec-content-box id="notification-status-box">
					<capitec-group layout="vertical" 
									halign="stretch" 
									valign="top" 
									gap="clear">
						<capitec-alert-banner type="error">
							${message} 
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
								label="Notify the client and either try again or complete through security questions.">
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
			const message = this.callerInformation.hasDigitalChannels
				? `Notify the client and either try again or complete verification verification via the App.`
				: `Notify the client and try again`;

			return html`
				<capitec-content-box id="notification-status-box">
					<capitec-group layout="vertical" halign="stretch" valign="top" gap="clear">
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
								label="${message}">
							</capitec-label>
						</capitec-group>
					</capitec-group>
				</capitec-content-box>
			`;
		}
		return html``;
	}

	_renderOtherOptions() {
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
						?disabled=${!this.callerInformation.hasDigitalChannels || this.itaFailedCount >= MAX_ITA_ATTEMPTS}
						?hidden=${!this.callerInformation.hasDigitalChannels || this.itaFailedCount >= MAX_ITA_ATTEMPTS}
						@click="${() => this._tryAgain()}">
					</horizon-option-button>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderLoadingIndicator() {
		if (this.isBusy || this.loading) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}
}

window.customElements.define(`horizon-verify-caller`, VerifyCaller);