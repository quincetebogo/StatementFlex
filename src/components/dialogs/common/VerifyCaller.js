import { Component, css, html } from 'platform/elements';
import { Configuration, EventAggregator, Logger } from 'platform/core';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonSignalRClient } from 'app/shell/HorizonSignalRClient';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';
import { VerifyCallerEvents } from 'app/constants/Telemetry/Events/VerifyCaller';
import { isWellFormedSouthAfricanID } from 'app/utils/channelServiceUtilities';

import 'app/components/common/OptionButton';
import 'app/components/common/CallerDialog';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyBySecurityQuestions';

const RENDER_MODE = Object.freeze({
	VERIFY_CALLER: 1,
	SECURITY_QUESTIONS: 2,
	END_CALL: 3,
	FOREIGN_CLIENT_ERR: 4
});

const HEADER_LABEL = `Verify Caller`;

const MAX_ITA_ATTEMPTS = 3;
const MAX_XDS_ATTEMPTS = 2;

const ITA_TIMEOUT_SECS = 70;


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
		this.seconds = ITA_TIMEOUT_SECS;
		this.isBusy = false;

		this.xdsMessage = ``;
		this.xdsFailed = false;

		this.itaInProgress = false;
		this.itaTimer = null;
		this.itaTimeout = false;
		this.itaRejected = false;
		this.itaSystemError = false;

		this.hasSouthAfricanID = false;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.configuration = Configuration.getInstance();
		this.logger = Logger.getInstance();
		this.telemetry = HorizonTelemetry.getInstance();

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag());
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} incomingCallDetails Information on the incoming call
	 * @property {Object} callerInformation Information (mini-profile) on the incoming caller
	 * @property {object} incidentDetails Incident details
	 * 
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			callerInformation: { type: Object },
			incidentDetails: { type: Object },

			renderMode: { attribute: false },
			
			xdsMessage: { attribute: false }, // Set when there has been a system error with XDS
			hasSouthAfricanID: { attribute: false },

			itaInProgress: { attribute: false },
			itaTimeout: { attribute: false },
			seconds: { attribute: false },
			itaRejected: { attribute: false },
			itaSystemError: { attribute: false }, 

			isBusy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	connectedCallback() {
		super.connectedCallback();

		this.logger.log(`info`, `Entered connectedCallback`, `VerifyCaller`);
		this.telemetry.startSpan(VerifyCallerEvents.VERIFY_CALLER);

		// Resetting ITA & XDS attempts
		if (!this.callerInformation.verificationAttempts) {
			this.callerInformation.verificationAttempts = {
				itaAttempts: 0,
				xdsAttempts: 0
			};
		}

		this.hasSouthAfricanID = isWellFormedSouthAfricanID(this.callerInformation.southAfricanIDNumber);

		if (this.callerInformation.hasDigitalChannels) {
			this._initiateItaVerification();
		} else if (!this.hasSouthAfricanID && !this.callerInformation.hasDigitalChannels) {
			// Technically this may not be a foreign client. We don't have a valid ID number available for the
			// client and digital channels are not available. So the Client Care Agent cannot verify the caller
			this.logger.log(`warn`, `Neither digital channels nor a valid South African ID number are available to use for verification`, `VerifyCaller`);
		}
	}

	disconnectedCallback() {
		// Cleanup before we leave the dialog
		this.logger.log(`info`, `Entered disconnectedCallback - cleaning up resources`, `VerifyCaller`);
		this._stopTimer();
		super.disconnectedCallback();

		this.telemetry.endSpan(VerifyCallerEvents.VERIFY_CALLER_ITA, {
			"screen": TelemetryScreen.VERIFY_CALLER
		});

		this.telemetry.endSpan(VerifyCallerEvents.VERIFY_CALLER, {
			"screen": TelemetryScreen.VERIFY_CALLER
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	async _securityQuestionsClick() {
		this.telemetry.logEvent(VerifyCallerEvents.ITA_SQ_CLICK, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": TelemetryScreen.SECURITY_QUESTIONS
		});

		// This burns an ITA attempt!
		this._stopTimer();

		this.xdsMessage = ``;
		this.xdsFailed = false;

		const clientID = this.callerInformation.southAfricanIDNumber;
		const returnValue = await this.callHandleService.xdsQuestions(clientID, () => true);

		if (returnValue.succeeded) {
			this.securityQuestions = returnValue.result;

			const authHistory = this.securityQuestions.authenticationHistory;

			if (authHistory) {
				// Retreive the number of previous attemnpts (including this current attempt)
				this.callerInformation.verificationAttempts.xdsAttempts = this._calculateXDSAttempts(authHistory);
				if (this.callerInformation.verificationAttempts.xdsAttempts > 1) {
					this.logger.log(`warn`, `The caller made ${this.callerInformation.verificationAttempts.xdsAttempts} to verify via XDS!`);
				}
			} else {
				// Just sending off a request counts as an attempt already
				this.callerInformation.verificationAttempts.xdsAttempts++;
			}

			if (!this.securityQuestions.authenticationPermitted) {
				this.callerInformation.verificationAttempts.xdsAttempts = MAX_XDS_ATTEMPTS; 
				this.xdsMessage = `Authentication Not Permitted`;
				this.logger.log(`warn`, `XDS returns authentication not permitted`, `_securityQuestionsClick`);
			} else if (this.securityQuestions.questions && this.securityQuestions.questions.length > 0) {
				this.logger.log(`info`, `XDS Questions retrieved, transitioning to Security Questions Dialog`, `_securityQuestionsClick`);
				this.renderMode = RENDER_MODE.SECURITY_QUESTIONS;
			} else {
				this.callerInformation.verificationAttempts.xdsAttempts = MAX_XDS_ATTEMPTS;
				this.xdsMessage = this.securityQuestions.errorMessage ? this.securityQuestions.errorMessage : `System Issue: Unable to obtain security questions`;
				this.logger.log(`error`, `XDS ERROR: ${$this.xdsMessage}`, `_securityQuestionsClick`);
			}
		} else {
			this.callerInformation.verificationAttempts.xdsAttempts = MAX_XDS_ATTEMPTS;
			this.xdsMessage = `System Issue: Unable to obtain security questions`;
			this.logger.log(`error`, `Failed to retrieve XDS Security Questions`, `_securityQuestionsClick`, returnValue.correlationId);
		}
	}

	_calculateXDSAttempts(authHistory) {
		let ndx = 0;
		let usedAttempts = 0;

		// Just asking for security questions counts as one attempt
		// All previous pending/failed attempts after the last successful attempt count as attempts.
		// There is no time limit after which an attempt is considered expired.
		while (ndx < authHistory.length - 1) {
			if (authHistory[ndx].authenticationStatus !== `Authenticated`) {
				ndx++;
				usedAttempts++;
			} else {
				return usedAttempts;
			}
		}

		return usedAttempts;
	}

	_skipClick() {
		this.telemetry.logEvent(VerifyCallerEvents.ITA_SKIP_CLICK, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": null // TODO: Determine by need and failed verification counts
		});

		this.dispatchEvent(new CustomEvent(`skip`, { detail: { incomingCallDetails: this.incomingCallDetails, callerInformation: this.callerInformation } }));
	}

	_skippedSecurityQuestions(event) {
		this.callerInformation = event.detail.callerInformation;
		this.dispatchEvent(new CustomEvent(`skip`, { detail: { incomingCallDetails: this.incomingCallDetails, callerInformation: this.callerInformation } }));
	}

	_cancelledSecurityQuestions(event) {
		this.callerInformation = event.detail.callerInformation;
		this.dispatchEvent(new CustomEvent(`cancel`, { detail: { incomingCallDetails: this.incomingCallDetails, callerInformation: this.callerInformation } }));
	}

	_verifiedViaSecurityQuestions(event) {
		this.callerInformation = event.detail.callerInformation;
		this.dispatchEvent(new CustomEvent(`verified`, { detail: { incomingCallDetails: this.incomingCallDetails, callerInformation: this.callerInformation } }));
	}

	_failedSecurityQuestions(event) {
		this.callerInformation = event.detail.callerInformation;
		this.xdsMessage = `Unfortunately you didn't pass the security questions.`;
		this.renderMode = RENDER_MODE.VERIFY_CALLER;
	}

	_verifyViaApp(event) {
		this.callerInformation = event.detail.callerInformation;
		this.renderMode = RENDER_MODE.VERIFY_CALLER;
		this._initiateItaVerification();
	}

	_tryAgain() {
		this.telemetry.logEvent(VerifyCallerEvents.ITA_TRY_AGAIN, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": TelemetryScreen.VERIFY_CALLER
		});

		this.xdsMessage = ``;
		this.seconds = ITA_TIMEOUT_SECS;

		this._stopTimer();

		if (!this._itaAttemptsExceeded()) {
			this.logger.log(`info`, `Retrying ITA verification`, `_tryAgain`);
			this._initiateItaVerification();
		} else {
			this.logger.log(`info`, `Maximum ITA verification attemmpts exceeded`, `_tryAgain`);
			this._navigateToItaVerificationFailed();
		}
	}

	_endCall() {
		this.telemetry.logEvent(VerifyCallerEvents.ITA_END_CALL, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": TelemetryScreen.END_CALL
		});

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

		this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
		this.horizonStore.setCallerInformation(this.callerInformation);
	}

	_itaErrorHandler(exception) {
		this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
		this.horizonStore.setCallerInformation(this.callerInformation);
		
		this.itaSystemError = true;

		return true;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}
  
	_navigateToItaVerificationFailed() {
		this._updateApplicationState(`failed`);
		this.horizonRouter.navigateToItaVerificationFailed();
	}

	_navigateToXdsVerificationFailed() {
		this._updateApplicationState(`failed`);
		return this.horizonRouter.navigateToXdsVerificationFailed();
	};
	

	async _initiateItaVerification() {
		const signalRUrl = await this.configuration.getSetting(`signalRUrl`);
		if (signalRUrl === ``) {
			this.logger.log(`warn`, `ITA is not configured`, `_initiateItaVerification`);
			this.itaInProgress = false;
			return;
		}
		if (this._itaAttemptsExceeded()) {
			this.logger.log(`error`, `Cannot initiate ITA - maximum number of attempts exceeded`, `_initiateItaVerification`);
			this.itaInProgress = false;
			return;
		}
		if (this.horizonSignalRClient) {
			this.logger.log(`warn`, `ITA connection is already started, a new connection will not be started`, `_initiateItaVerification`);
			return;
		}

		this.itaInProgress = true;

		this.logger.log(`info`, `Initiating ITA verification`, `_initiateItaVerification`);
		this.horizonSignalRClient = HorizonSignalRClient.getInstance();

		this.telemetry.startSpan(VerifyCallerEvents.VERIFY_CALLER_ITA, {
			"screen": TelemetryScreen.VERIFY_CALLER
		}, false);

		const connectionID = await this._initialiseSignalR();
		
		let itaNotificationSent = false;
		if (connectionID) {
			itaNotificationSent = await this._itaServiceCall(connectionID);
		};
		
		if (!itaNotificationSent) {
			this.itaSystemError = true;
			this._cleanupSignalRConnection();
		}
	}

	async _initialiseSignalR() {
		try {
			await this.horizonSignalRClient.startConnection();
		} catch (error) {
			this.logger.log(`error`, `Failed to establish ITA Hub Connection`, `_initialiseSignalR`);
			return null;
		}
		try {
			return await this.horizonSignalRClient.getConnectionId();
		} catch (error) {
			this.logger.log(`error`, `Failed to obtain Connection ID`, `_initialiseSignalR`);
			return null;
		}
	}

	async _itaServiceCall(connectionID) {
		try {
			await this.horizonSignalRClient.registerHandler(verificationStatus => this._signalRPostEventAction(verificationStatus));
		} catch (error) {
			this.logger.log(`error`, `Failed to register handler`, `_itaServiceCall`);
			return false;
		}

		const request = {
			cifNumber: this.callerInformation.cifNumber,
			connectionID: connectionID
		};

		const returnValue = await this.callHandleService.itaVerification(request, (ex) => this._itaErrorHandler(ex));

		if (returnValue.succeeded) {
			this.telemetry.logEvent(VerifyCallerEvents.ITA_REQUEST_SENT, {
				"screen": TelemetryScreen.VERIFY_CALLER
			}, true);
			
			this.callerInformation.verificationAttempts.itaAttempts++;

			this.itaTimeout = false;
			this.itaRejected = false;
			this.itaSystemError = false;

			this.logger.log(`info`, `ITA verification request successfully initiated`, `_itaServiceCall`);

			this._startTimer();

			return true;
		} 

		this.logger.log(`error`, `itaVerification channel service call failed`, `_itaServiceCall`, returnValue.correlationId);
		return false;
	}
	
	_startTimer() {
		if (this.itaTimer) {
			this.logger.log(`warn`, `Attempted to start ITA Timer before the previous timer has been stopped`, `_startTimer`);
			return this.itaTimer;
		}

		this.itaTimer = setInterval(() => {

			this.seconds--;

			if (this.seconds <= 0) {
				this.telemetry.logEvent(VerifyCallerEvents.ITA_TIMEDOUT, {
					"screen": TelemetryScreen.VERIFY_CALLER,
					"next-screen": this.itaFailedCount >= MAX_ITA_ATTEMPTS ? TelemetryScreen.ITA_FAILED : TelemetryScreen.VERIFY_CALLER
				}, true);

				this._stopTimer();
				
				this.itaTimeout = true;

				// What happens when both ITA & XDS attempts are exaaused
				if (this._itaAttemptsExceeded()) {
					this._navigateToItaVerificationFailed();
				} else {
					this._updateApplicationState(`unverified`);
				}
			}
		}, 1000);
	}

	_stopTimer() {
		this._cleanupSignalRConnection();

		if (this.itaTimer) {
			clearInterval(this.itaTimer);
			this.itaTimer = null;
			this.logger.log(`info`, `ITA timer stopped`, `VerifyCaller`);
		}
	};
	
	_signalRPostEventAction(verificationStatus) {
		this.logger.log(`info`, `ITA verification event received. Status=${verificationStatus}`, `_signalRPostEventAction`);

		this._stopTimer();

		if (this._isVerified(verificationStatus)) {
			this.telemetry.logEvent(VerifyCallerEvents.ITA_SUCCESS, {
				"screen": TelemetryScreen.VERIFY_CALLER,
				"next-screen": null // Determine by need / path its opened from
			}, true);
			this._updateApplicationState(`verified`);

			this.dispatchEvent(new CustomEvent(`verified`, {
				detail: {
					incomingCallDetails: this.incomingCallDetails,
					callerInformation: this.callerInformation
				}
			}));
		} else {
			this.logger.log(`info`, `ITA SignalR event indicated that verification was rejected`, `_signalRPostEventAction`);
			this.telemetry.logEvent(VerifyCallerEvents.ITA_FAILED, {
				"screen": TelemetryScreen.VERIFY_CALLER,
				"next-screen": this.itaFailedCount >= MAX_ITA_ATTEMPTS ? TelemetryScreen.ITA_FAILED : TelemetryScreen.VERIFY_CALLER
			}, true);

			this.itaRejected = true;

			// TODO: What happens when both ITA and XDS attemtps are exausted
			if (this._itaAttemptsExceeded()) {
				this._navigateToItaVerificationFailed();
			}
		}
	}

	async _cleanupSignalRConnection() {
		this.itaInProgress = false;
		if (this.horizonSignalRClient) {
			this.logger.log(`info`, `Stopping SignalR Connection for ITA Verification`, `_stopSignalRConnection`);

			try {
				await this.horizonSignalRClient.deRegisterHandler();
			} catch (error) {
				this.logger.log(`error`, `Failure while deregistering handler`, `_stopSignalRConnection`);
			}

			try {
				await this.horizonSignalRClient.stopConnection();
			} catch (error) {
				this.logger.log(`error`, `Failure while stopping ITA connection`, `_stopSignalRConnection`);
			}

			this.horizonSignalRClient = null;
			this.logger.log(`info`, `ITA SignalR subscription stopped`, `_stopSignalRConnection`);
		}
	}

	_isVerified(verificationStatus) {
		if (typeof verificationStatus === `boolean` && verificationStatus) {
			return true;
		}
		return typeof verificationStatus === `string` && verificationStatus === `true`;
	}

	_canVerify() {
		const canVerifyViaITA = this.callerInformation.hasDigitalChannels && !this._itaAttemptsExceeded();
		const canVerifyViaXDS = this.hasSouthAfricanID && !this._xdsAttemptsExceeded();

		return canVerifyViaITA || canVerifyViaXDS;
	}

	_itaInProgress() {
		return this.itaInProgress || this.itaTimer !== null;
	}

	_pushFailed() {
		return this.itaTimeout || this.itaRejected || this.itaSystemError;
	}

	_xdsAttemptsExceeded() {
		// xdsAttempts is 0 based and is incremented on attempting to retrieve security questions
		// This is because simply retreiving security questions counts as an attempt
		return this.callerInformation.verificationAttempts.xdsAttempts >= MAX_XDS_ATTEMPTS;
	}

	_itaAttemptsExceeded() {
		// itaAttempts is 0 based and is incremented on successful initiation of an ITA request
		return this.callerInformation.verificationAttempts.itaAttempts >= MAX_ITA_ATTEMPTS;
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
					--theme-container-margin-bottom: 0px;
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
					--theme-alert-banner-margin-bottom: 0px;

					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
				}
				#notification-status-group > capitec-label {
					line-height: 24px;
					margin: 0;
					margin-bottom: 30px;

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
					margin: 15px 0px 12px 0px;
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

				.btnTryAgain[disabled] {
					cursor:default;
					pointer-events:none;
					filter: grayscale(100%);
				}

				horizon-caller-dialog {
					--horizon-modal-footer-padding: 0px;
				}
				.warning-svg {
					margin-top: 18px;
				}
				.foreign-client {
					margin-bottom: 42px;
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
					.incidentDetails="${this.incidentDetails}"
					.isNeedSelectable=${false}
					headerLabel="${HEADER_LABEL}"
					@on-end-call="${() => this._endCall()}">
					<div slot="body">
						${this._renderBody()}
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
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}" 
					.securityQuestions="${this.securityQuestions}"
					@cancel="${(event) => this._cancelledSecurityQuestions(event)}"
					@skip="${(event) => this._skippedSecurityQuestions(event)}"
					@verified="${(event) => this._verifiedViaSecurityQuestions(event)}"
					@failed="${(event) => this._failedSecurityQuestions(event)}">
				</horizon-security-question>`;
	}

	_renderEndCallModal() {
		return this.renderMode !== RENDER_MODE.END_CALL
			? html``
			: html`
				<horizon-end-call-session 
					.incomingCallDetails="${this.incomingCallDetails}"
					.incidentDetails="${this.incidentDetails}"
					endCallContext="VerifyClient"
					@cancel="${() => this.renderMode = RENDER_MODE.VERIFY_CALLER}">
				</horizon-end-call-session>`;
	}

	_renderBody() {
		if (!this._canVerify()) {
			return this._renderClientCannotBeVerified();
		} else if (this.hasSouthAfricanID && this.xdsFailed && this.callerInformation.verificationAttempts.xdsAttempts === MAX_XDS_ATTEMPTS - 1) {
			this._renderXdsOneAttemptLeft();
		} else if (this.hasSouthAfricanID && !this._xdsAttemptsExceeded() && this.xdsMessage !== ``) {
			return this._renderXdsError();
		} else if (this._itaInProgress()) {
			return this._renderPushNotificationStatus();
		};
		
		return this._renderPushNotificationError();
	}

	_renderPushNotificationStatus() {
		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group
						layout="vertical"
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
						<div 
							class="notification-info">
							You have <span class="timer-bold">${this.seconds.toString()} seconds</span> remaining.
						</div>
						<capitec-label 
							type="title" 
							label="If the client has not received the notification, choose Try Again.">
						</capitec-label>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>`;
	}

	_renderPushNotificationError() {
		let message = ``;
		if (this.itaTimeout) {
			message = `The client did not accept the notification in time`;
		} else if (this.itaRejected) {
			message = `The client rejected the notification`;
		} else if (!this.callerInformation.hasDigitalChannels) {
			message = `The client is not registered for the App/USSD`;
		} else if (this._itaAttemptsExceeded()) {
			message = `Maximum number of ITA Attempts reached`;
		} else {
			message = `The notification didn't send due to a system error.`;
		}

		let notificationMessage = ``;
		if (this.callerInformation.hasDigitalChannels && this.hasSouthAfricanID && !this._xdsAttemptsExceeded()) {
			notificationMessage = `Notify the client and either try again or complete through security questions`;
		} else if (this.callerInformation.hasDigitalChannels) {
			notificationMessage = `Notify the client and try again`;
		} else {
			notificationMessage = `Notify the client or complete through security questions`;
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
								label="${notificationMessage}">
							</capitec-label>
						</capitec-group>
					</capitec-group>
				</capitec-content-box>`;
	}

	_renderXdsOneAttemptLeft() {
		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group layout="vertical" 
								halign="stretch"
								valign="top" 
								gap="clear">
					<capitec-alert-banner type="unsuccessful-red">
						${this.xdsMessage}
					</capitec-alert-banner>
					<capitec-group layout="vertical"
									halign="center"
									valign="top" 
									gap="clear"
									id="notification-status-group">
						<img src="/images/warning.svg" class="sms-svg"/>
						<capitec-label type="title"
							label="You've got one more attempt left. Do you want to try the security questions again?">
						</capitec-label>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderXdsError() {
		const message = this.callerInformation.hasDigitalChannels && !this._itaAttemptsExceeded()
			? `Notify the client and either try again or complete verification verification via the App.`
			: `Notify the client and try again`;

		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group layout="vertical" halign="stretch" valign="top" gap="clear">
					<capitec-alert-banner type="error">
						${this.xdsMessage}
					</capitec-alert-banner>
					<capitec-group 
							layout="vertical" 
							halign="center"
							valign="top" 
							gap="clear"
							id="notification-status-error-group">
						<img src="/images/insure/connection-error.svg" class="connection-error-svg"/>
						<div 
							class="notification-info">
								An error has occured.
						</div>
						<capitec-label type="title"
							label="${message}">
						</capitec-label>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>`;
	}

	_renderClientCannotBeVerified() {
		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group layout="vertical" halign="stretch" valign="top" gap="clear">
					<capitec-alert-banner type="error">
						<b>Notify: </b>Client can not be verified. Continue unverified or transfer call to team leader.
					</capitec-alert-banner>
					<capitec-group layout="vertical" 
						halign="center"
						valign="top" 
						gap="clear"
						id="notification-status-error-group">
						<img src="/images/warning.svg" class="warning-svg connection-error-svg"/>
						<div class="foreign-client notification-info">
							Unable to be verified, you can assist with with stopping cards and product enquiries.
						</div>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>`;
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
						?hidden=${!this.hasSouthAfricanID || this._xdsAttemptsExceeded()}
						@click="${() => this._securityQuestionsClick()}">
					</horizon-option-button>
					<horizon-option-button 
						label="Skip"
						icon="system/arrow-right-action" 
						iconSize="default"
						@click="${() => this._skipClick()}">
					</horizon-option-button>
					<horizon-option-button
					  class="btnTryAgain"
						label="Try Again" 
						img-src="/images/insure/refresh.svg"
						iconSize="default"
						?hidden=${!this.callerInformation.hasDigitalChannels || this._itaAttemptsExceeded() || this._itaInProgress()}
						@click="${() => this._tryAgain()}">
					</horizon-option-button>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}
}
window.customElements.define(`horizon-verify-caller`, VerifyCaller);