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

// exporting the common code - used in securityQuestions failed screen
export const navigateToFailedScreen = (objInstance) => {
	objInstance.callerInformation.verificationStatus = `failed`;
	objInstance.horizonStore.setCallerInformation(objInstance.callerInformation);
	objInstance.horizonStore.setIncomingCallDetails(objInstance.incomingCallDetails);
	
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
        this.timeLeft = `70`;		
		this.seconds = ITA_TIMEOUT_SECS;
		this.appTimedOut = false;
		this.isBusy = false;
		this.itaFailedCount = 0;
		this.itaTimer = null;
		this.loading = true;
		this.xdsMessage = ``;
		this.unableToVerifyErr = ``;
		this.itaMessage = ``;
		this.noOfXdsVerificationAttempted = 0;
		this.itaVerificationFailed = false;
		this.hasSouthAfricanID = false;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.configuration = Configuration.getInstance();
		this.logger = Logger.getInstance();
		this._telemetry = HorizonTelemetry.instance;

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._xdsErrorHandler(ex));
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
			noOfXdsVerificationAttempted: { type: Number },
			incidentDetails: { type: Object },

			renderMode: { attribute: false },
			timeLeft: { attribute: false },
			xdsMessage: { attribute: false }, // Set when there has been a system error with XDS
			itaMessage: { attribute: false }, // Set when there has been a system error with ITA
			itaFailedCount: { attribute: false },
			isBusy: { attribute: false },
			loading: { attribute: false },
			itaVerificationFailed: { attribute: false },
			foreignClientErr: { attribute: false },
			hasSouthAfricanID: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	async connectedCallback() {
		super.connectedCallback();

		this.logger.log(`info`, `Entered connectedCallback`, `VerifyCaller`);
		this._telemetry.startSpan(VerifyCallerEvents.VERIFY_CALLER);

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
			this._stopSignalRConnection();

			if (this.itaTimer) {
				clearInterval(this.itaTimer);
				this.itaTimer = null;
				this.logger.log(`info`, `ITA timer stopped`, `VerifyCaller`);
			}
		};

		this.hasSouthAfricanID = isWellFormedSouthAfricanID(this.callerInformation.southAfricanIDNumber);
		if (this.callerInformation.hasDigitalChannels) {
			this._initiateItaVerification();
		} else if (this.hasSouthAfricanID) {
			this.logger.log(`info`, `Digital channels are unavailable, only verification via XDS is available`, `VerifyCaller`);
			await this._launchSecurityQuestions();
		} else {
			// Technically this may not be a foreign client. We don't have a valid ID number available for the
			// client and digital channels are not available. So the Client Care Agent cannot verify the caller
			this.logger.log(`info`, `Neither digital channels nor a valid South African ID number are available to use for verification`, `VerifyCaller`);
			this.unableToVerifyErr = `Client can not be verified. Continue unverified or transfer call to team leader.`;
		}

		// The Verify Caller UI will not display until this.loading is false. This keeps it hidden
		// should we be transitioning directly to security questions because APP/USSD is unavailable
		this.loading = false;
	}

	disconnectedCallback() {
		// Cleanup before we leave the dialog
		this.logger.log(`info`, `Entered disconnectedCallback - cleaning up resources`, `VerifyCaller`);
		this._stopTimer();
		super.disconnectedCallback();

		this._telemetry.endSpan(VerifyCallerEvents.VERIFY_CALLER_ITA, {
			"screen": TelemetryScreen.VERIFY_CALLER
		});
		this._telemetry.endSpan(VerifyCallerEvents.VERIFY_CALLER, {
			"screen": TelemetryScreen.VERIFY_CALLER
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	_securityQuestionsClick() {
		this._telemetry.logEvent(VerifyCallerEvents.ITA_SQ_CLICK, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": TelemetryScreen.SECURITY_QUESTIONS
		});
		this._launchSecurityQuestions();
	}

	async _launchSecurityQuestions() {
		if (this.itaTimer) {
			this._stopTimer();
		}

		this.xdsMessage = ``;
		const clientID = this.callerInformation.southAfricanIDNumber;
		const returnValue = await this.callHandleService.xdsQuestions(clientID);

		if (returnValue.succeeded) {
			this.securityQuestions = returnValue.result;

			const authHistory = this.securityQuestions.authenticationHistory;
			if (authHistory) {
				this.noOfXdsVerificationAttempted = this._calculateXDSAttempts(authHistory);
				if (this.noOfXdsVerificationAttempted > 0) {
					this.logger.log(`warn`, `The caller made ${this.noOfXdsVerificationAttempted} attempts at verifying via XDS in the last 24 hours!`);
				}
			}

			if (!this.securityQuestions.authenticationPermitted) {
				this.logger.log(`warn`, `Maximum attempts at XDS verification exceeded`, `_securityQuestionsClick`);
				this.callerInformation.verificationAttempts.xdsAttempts = MAX_XDS_ATTEMPTS; // There have already been too many attempts.
				this._updateApplicationState(`failed`);
				this.horizonRouter.navigateToXdsVerificationFailed();
			} else if (this.securityQuestions.questions && this.securityQuestions.questions.length > 0) {
				this.logger.log(`info`, `XDS Questions retrieved, transitioning to Security Questions Dialog`, `_securityQuestionsClick`);
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
		this._telemetry.logEvent(VerifyCallerEvents.ITA_SKIP_CLICK, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": null // TODO: Determine by need and failed verification counts
		});

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
		this._initiateItaVerification();
	}

	_tryAgain() {
		this._telemetry.logEvent(VerifyCallerEvents.ITA_TRY_AGAIN, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": TelemetryScreen.VERIFY_CALLER
		});

		this.itaVerificationFailed = false;
		this.appTimedOut = false;
		this.itaMessage = ``;
		this.xdsMessage = ``;
		this.seconds = ITA_TIMEOUT_SECS;

		if (this.itaTimer) {
			this._stopTimer();
			this.itaFailedCount += 1;
		}

		if (this.itaFailedCount < MAX_ITA_ATTEMPTS) {
			// Re-initialting the ITA verification
			this.logger.log(`info`, `Retrying ITA verification`, `_tryAgain`);
			this._initiateItaVerification();
		} else {
			this.logger.log(`info`, `Maximum ITA verification attemmpts exceeded`, `_tryAgain`);
			this._navigateToItaVerificationFailed();
		}
	}

	_endCall() {
		this._telemetry.logEvent(VerifyCallerEvents.ITA_END_CALL, {
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
		this.callerInformation.verificationAttempts.itaAttempts = this.itaFailedCount;

		this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
		this.horizonStore.setCallerInformation(this.callerInformation);
	}

	_xdsErrorHandler(exception) {
		this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
		this.horizonStore.setCallerInformation(this.callerInformation);

		this.xdsMessage = `System error. Please try again later`;

		return true;
	}

	_itaErrorHandler(exception) {
		this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
		this.horizonStore.setCallerInformation(this.callerInformation);
		
		this.itaMessage = `System error. Please try again later`;
		this.itaVerificationFailed = true;

		return true;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_startTimer() {
		const startTimer = setInterval(() => {
			this.seconds--;

			if (this.seconds <= 0) {
				this._telemetry.logEvent(VerifyCallerEvents.ITA_TIMEDOUT, {
					"screen": TelemetryScreen.VERIFY_CALLER,
					"next-screen": this.itaFailedCount >= MAX_ITA_ATTEMPTS ? TelemetryScreen.ITA_FAILED : TelemetryScreen.VERIFY_CALLER
				});

				this._stopTimer();
				
				this.itaTimer = null;
				this.itaFailedCount += 1;
				this.appTimedOut = true;

				if (this.itaFailedCount >= MAX_ITA_ATTEMPTS) {
					this._navigateToItaVerificationFailed();
				} else {
					this._updateApplicationState(`unverified`);
				}
			}

            this.timeLeft = `${this.seconds < 10 ? `0` : ``}${this.seconds.toString()}`;
		}, 1000);

		return startTimer;
	}

	_navigateToItaVerificationFailed() {
		this._updateApplicationState(`failed`);
		this.horizonRouter.navigateToItaVerificationFailed();
	}

	async _initiateItaVerification() {
		const signalRUrl = await this.configuration.getSetting(`signalRUrl`);
		if (signalRUrl && signalRUrl !== ``) {
			if (!this.HorizonSignalRClient) {
				this.horizonSignalRClient = HorizonSignalRClient.getInstance();
				this._telemetry.startSpan(VerifyCallerEvents.VERIFY_CALLER_ITA, {
					"screen": TelemetryScreen.VERIFY_CALLER
				});

				const connectionID = await this._initialiseSignalR();
				if (connectionID) {
					this._itaServiceCall(connectionID);
				} else {
					this.logger.log(`error`, `ITA Service call not made as ITA subscription was not started`, `_initiateItaVerification`);
				}
			} else {
				this.logger.log(`warn`, `ITA connection is already started, a new connection will not be started`, `_initiateItaVerification`);
			}
		} else {
			this.logger.log(`warn`, `ITA is not configured`, `_initiateItaVerification`);
		}
	}

	async _initialiseSignalR() {
		this.logger.log(`info`, `Initialising SignalR connection for ITA verification`, `_initialiseSignalR`);
		this.itaVerificationFailed = false;
		// Starting signalR connection

		try {
			await this.horizonSignalRClient.startConnection();

			// Fetching connection id from signalR client
			const connectionID = await this.horizonSignalRClient.getConnectionId();
	
			this.logger.log(`info`, `SignalR connection established`, `_initialiseSignalR`);
			
			return connectionID;
		} catch (error) {
			this.logger.log(`error`, `Failed to establish ITA Hub Connection`, `_initialiseSignalR`);
		}

		return null;
	}

	async _itaServiceCall(connectionID) {
		if (connectionID) {

			const request = {
				cifNumber: this.callerInformation.cifNumber,
				connectionID: connectionID
			};

			const returnValue = await this.callHandleService.itaVerification(request, (ex) => this._itaErrorHandler(ex));

			if (returnValue.succeeded) {

				this.logger.log(`INFO`, `ITA verification request initiated`, `_itaServiceCall`);
				this._telemetry.logEvent(VerifyCallerEvents.ITA_REQUEST_SENT, {
					"screen": TelemetryScreen.VERIFY_CALLER
				});

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
		} else {
			this.logger.log(`error`, `ITA Verification not started as no connection ID was set`, `_itaServiceCall`);
		}
	}

	_signalRPostEventAction(verificationStatus) {
		this.logger.log(`info`, `ITA verification event received. Status=${verificationStatus}`, `_signalRPostEventAction`);

		this._stopTimer();

		if ((typeof verificationStatus === `boolean` && verificationStatus) || (typeof verificationStatus === `string` && verificationStatus === `true`)) {
			
			this.logger.log(`info`, `ITA SignalR subscription stopped`, `_signalRPostEventAction`);
			this._telemetry.logEvent(VerifyCallerEvents.ITA_SUCCESS, {
				"screen": TelemetryScreen.VERIFY_CALLER,
				"next-screen": null // Determine by need / path its opened from
			});

			this._updateApplicationState(`verified`);

			this.dispatchEvent(new CustomEvent(`verified`, {
				detail: {
					incomingCallDetails: this.incomingCallDetails,
					callerInformation: this.callerInformation
				}
			}));
		} else {
			this.logger.log(`info`, `ITA SignalR event indicated that verification was rejected`, `_signalRPostEventAction`);
			this._telemetry.logEvent(VerifyCallerEvents.ITA_FAILED, {
				"screen": TelemetryScreen.VERIFY_CALLER,
				"next-screen": this.itaFailedCount >= MAX_ITA_ATTEMPTS ? TelemetryScreen.ITA_FAILED : TelemetryScreen.VERIFY_CALLER
			});

			this.itaVerificationFailed = true;
			this.itaFailedCount++;

			if (this.itaFailedCount >= MAX_ITA_ATTEMPTS) {
				this._navigateToItaVerificationFailed();
			}
			this._updateApplicationState(`failed`);
		}
	}

	_stopSignalRConnection() {
		if (this.horizonSignalRClient) {
			this.logger.log(`info`, `Stopping SignalR Connection for ITA Verification`, `_stopSignalRConnection`);
			this.horizonSignalRClient.deRegisterHandler();
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
		if (this.loading) {
			return html`${this._renderLoadingIndicator()}`;
		}

		return this.renderMode !== RENDER_MODE.VERIFY_CALLER
			? html``
			: html`
				<horizon-caller-dialog
					.incomingCallDetails="${this.incomingCallDetails}"
					.incidentDetails="${this.incidentDetails}"
					.isNeedSelectable=${false}
					.headerLabel="${HEADER_LABEL}"
					@on-end-call="${() => this._endCall()}">
					<div slot="body">
						${this._renderPushNotificationStatus()}
						${this._renderXdsError()}
						${this._renderPushNotificationError()}
						${this._renderLoadingIndicator()}
						${this._renderClientCannotBeVerified()}
						${this._renderOtherOptions()}
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
					.incidentDetails="${this.incidentDetails}"
					endCallContext="VerifyClient"
					@cancel="${() => this.renderMode = RENDER_MODE.VERIFY_CALLER}">
				</horizon-end-call-session>`;
	}

	_renderPushNotificationStatus() {
		if (this.callerInformation.hasDigitalChannels && !this.appTimedOut && !this.itaVerificationFailed && !this.itaMessage && !this.xdsMessage) {
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
								You have <span class="timer-bold">${this.timeLeft} seconds</span> remaining.
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
		if (this.callerInformation.hasDigitalChannels && (this.appTimedOut || this.itaVerificationFailed) && !this.xdsMessage) {

			let message = ``;
			if (this.appTimedOut) {
				message = `The client did not accept the notification in time`;
			} else if (this.itaVerificationFailed && !this.itaMessage) {
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
								label="Notify the client and either try again${this.hasSouthAfricanID ? ` or complete through security questions.` : ``}">
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
						?hidden=${!this.hasSouthAfricanID || this.callerInformation.verificationAttempts.xdsAttempts >= 2}
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

	_renderClientCannotBeVerified() {

		/*
			1. If client doesn't have digital channels and doesn't have a South African ID, we are unable to verify
			2. If client doesn't have digital channels and the XDS attempts have also been exceeded we are unable to verify
		*/
		if (!this.callerInformation.hasDigitalChannels && !this.hasSouthAfricanID) {
			return html`
				<capitec-content-box id="notification-status-box">
					<capitec-group layout="vertical" halign="stretch" valign="top" gap="clear">
						<capitec-alert-banner type="error">
							<b>Notify: </b>${this.unableToVerifyErr}
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
		return html``;
	}
}

window.customElements.define(`horizon-verify-caller`, VerifyCaller);