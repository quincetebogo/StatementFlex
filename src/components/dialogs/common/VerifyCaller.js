import { Component, css, html } from 'platform/elements';
import { Configuration, EventAggregator, Logger } from 'platform/core';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { ItaCallerVerification } from 'app/components/dialogs/common/ItaCallerVerification';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { VerifyCallerEvents } from 'app/constants/telemetry/events/VerifyCaller';
import { isWellFormedSouthAfricanID } from 'app/utils/channelServiceUtilities';

import 'app/components/common/OptionButton';
import 'app/components/common/CallerDialog';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyBySecurityQuestions';
import 'app/components/Common/ComponentCountdown';

const RENDER_MODE = Object.freeze({
	VERIFY_CALLER: 1,
	SECURITY_QUESTIONS: 2,
	END_CALL: 3
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
		this.xdsUnavailable = false;

		this.itaInProgress = false;
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
		this.itaService = new ItaCallerVerification(
			(status, attempt) => this._verificationStatusCallBack(status, attempt),
			() => this._toggleBusyFlag(), 
			0,
			MAX_ITA_ATTEMPTS,
			ITA_TIMEOUT_SECS
		);
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

			renderMode: { state: true },
			xdsMessage: { state: true }, // Set when there has been a system error with XDS
			hasSouthAfricanID: { state: true },
			xdsUnavailable: { state: true }, // Set when there has been a system error with XDS
			itaInProgress: { state: true },
			itaTimeout: { state: true },
			seconds: { state: true },
			itaRejected: { state: true },
			itaSystemError: { state: true }, 
			xdsAttempts: { state: true },
			itaAttempts: { state: true },
			timeLeft: { state: true },
			isBusy: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	connectedCallback() {
		super.connectedCallback();

		this.logger.log(`info`, `Entered connectedCallback`, `VerifyCaller`);
		this.telemetry.startSpan(VerifyCallerEvents.VERIFY_CALLER);

		// Set up ITA & XDS attempts if structure does not exist yet
		if (!this.callerInformation.verificationAttempts) {
			this.callerInformation.verificationAttempts = {
				itaAttempts: 0,
				xdsAttempts: 0
			};
		}

		this.xdsAttempts = this.callerInformation.verificationAttempts.xdsAttempts;
		this.itaAttempts = this.callerInformation.verificationAttempts.itaAttempts;

		this.hasSouthAfricanID = isWellFormedSouthAfricanID(this.callerInformation.southAfricanIDNumber);

		/*
		this.hasSouthAfricanID = false;
		*/
		this.callerInformation.hasDigitalChannels = true;

		if (this.callerInformation.hasDigitalChannels) {
			return this._initiateItaVerification();
		}
	}

	disconnectedCallback() {
		// Cleanup before we leave the dialog
		this.logger.log(`info`, `Entered disconnectedCallback - cleaning up resources`, `VerifyCaller`);
		this.itaService.close();
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

		this.xdsMessage = ``;
		this.xdsFailed = false;

		// Stop any pending ITA attempt
		this.itaService.close();
		this.itaSystemError = false;
		this.itaTimeout = false;
		this.itaRejected = false;

		const returnValue = await this.callHandleService.xdsQuestions(this.callerInformation.southAfricanIDNumber, () => true);

		if (returnValue.succeeded) {
			return this._handleSecurityQuestions(returnValue.result);
		} 

		// If we are unable to retreive security questions
		if (returnValue.exception.status === 404 || returnValue.exception.status === 500 || returnValue.exception.status === 424) {
			this.xdsUnavailable = true;
		}
	}

	_handleSecurityQuestions(securityQuestions) {
		// Set this.securityQuestions for passing to the secuirty questions dialog
		this.securityQuestions = securityQuestions;

		this._updateXdsAuthenticationAttempts(securityQuestions);

		if (!securityQuestions.authenticationPermitted) {
			this.xdsAttempts = MAX_XDS_ATTEMPTS; 
				this._updateApplicationState(`failed`, `unverified`);
			this.logger.log(`warn`, `XDS returns authentication not permitted`, `_securityQuestionsClick`);
			return;
		} ;
		
		if (securityQuestions.questions && securityQuestions.questions.length > 0) {
			this.logger.log(`info`, `XDS Questions retrieved, transitioning to Security Questions Dialog`, `_securityQuestionsClick`);
			this.renderMode = RENDER_MODE.SECURITY_QUESTIONS;
			return;
		};
		
		this.xdsAttempts = MAX_XDS_ATTEMPTS;
		this.xdsMessage = securityQuestions.errorMessage ? securityQuestions.errorMessage : `System Issue: Unable to obtain security questions`;
		this.logger.log(`error`, `XDS ERROR: ${$this.xdsMessage}`, `_securityQuestionsClick`);
	}

	_updateXdsAuthenticationAttempts(securityQuestions) {
		let authHistory = securityQuestions.authenticationHistory;

		// TODO: remove debug line
		authHistory = null;

		if (!authHistory) {
			// Just sending off a request counts as an attempt already
			this.xdsAttempts++;
			return;
		}

		// Retreive the number of previous attemnpts (including this current attempt)
		this.xdsAttempts = this._calculateXDSAttempts(authHistory);
		if (this.xdsAttempts > 1) {
			this.logger.log(`warn`, `The caller made ${this.xdsAttempts} to verify via XDS!`);
		}
	}

	_calculateXDSAttempts(authHistory) {
		let ndx = 0;
		let usedAttempts = 0;

		// Just asking for security questions counts as one attempt
		// All previous pending/failed attempts after the last successful attempt count as attempts.
		// There is no time limit after which an attempt is considered expired.
		while (ndx <= authHistory.length - 1) {
			if (authHistory[ndx].authenticationStatus.toLowerCaseString() !== `authenticated`) {
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

		this._updateApplicationState(`unverified`, `unverified`);
		this.dispatchEvent(new CustomEvent(`skip`, { detail: { 
			incomingCallDetails: this.incomingCallDetails,
			callerInformation: this.callerInformation 
		} }));
	}

	_cancelClick() {
		this._telemetry.logEvent(VerifyCallerEvents.ITA_CANCEL_CLICK, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": null // TODO: Determine by need and failed verification counts
		});

		this._stopSignalRConnection();
		this._updateApplicationState(`verified`, `XDS`);
		this.callerInformation.verificationAttempts.itaAttempts = this.itaFailedCount;
		this.dispatchEvent(new CustomEvent(`cancel`, { detail: { callerInformation: this.callerInformation } }));
	
	}

	_skippedSecurityQuestions(event) {
		this.dispatchEvent(new CustomEvent(`skip`, { detail: { callerInformation: this.callerInformation } }));
	}

	_cancelledSecurityQuestions() {
		this._updateApplicationState(`unverified`, `unverified`);
		this.dispatchEvent(new CustomEvent(`cancel`, { detail: { 
			incomingCallDetails: this.incomingCallDetails,
			callerInformation: this.callerInformation 
		} }));
	}

	_verifiedViaSecurityQuestions() {
		this._updateApplicationState(`verified`, `XDS`);
		this.dispatchEvent(new CustomEvent(`verified`, { detail: { 
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: this.callerInformation 
		} }));
	}

	_failedSecurityQuestions() {
		if (this._xdsAttemptsExceeded()) {
			this._updateApplicationState(`failed`, `unverified`);
			this.horizonRouter.navigateToXdsVerificationFailed();
			return;
		};

		this.renderMode = RENDER_MODE.VERIFY_CALLER;
	}

	_xdsServiceFailure() {
		this.callerInformation.verificationStatus = `failed`;
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

		this.itaService.close();

		if (!this._itaAttemptsExceeded()) {
			this.logger.log(`info`, `Retrying ITA verification`, `_tryAgain`);
			this._initiateItaVerification();
			return;
		} 
		
		this.logger.log(`info`, `Maximum ITA verification attemmpts exceeded`, `_tryAgain`);
		this._navigateToItaVerificationFailed();
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
	_updateApplicationState(verificationStatus, verificationMethod) {
		this.callerInformation.verificationStatus = verificationStatus;
		this.callerInformation.verificationMethod = verificationMethod;

		this.callerInformation.verificationAttempts.xdsAttempts = this.xdsAttempts;
		this.callerInformation.verificationAttempts.itaAttempts = this.itaAttempts;

		this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
		this.horizonStore.setCallerInformation(this.callerInformation);
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_navigateToItaVerificationFailed() {
		if (this.itaFailedCount >= MAX_ITA_ATTEMPTS && (this.callerInformation.verificationStatus === `verified` && this.callerInformation.verificationMethod === `XDS`)) {

			this._updateApplicationState(`verified`, `XDS`);
		} else {
		this._updateApplicationState(`failed`, `unverified`);
		this.horizonRouter.navigateToItaVerificationFailed();
		}
	}

	async _initiateItaVerification() {
		this.itaSystemError = !await this.itaService.initiateItaVerification(this.callerInformation.cifNumber);

		this.itaSystemError = false;
		this.itaInProgress = true;
		
		if (!this.itaSystemError) {
			this.telemetry.startSpan(VerifyCallerEvents.VERIFY_CALLER_ITA, {
				"screen": TelemetryScreen.VERIFY_CALLER
			}, false);
		}
	}

	_verificationStatusCallBack(status, attempt) {
		this.itaRejected = false;
		this.itaInProgress = false;
		this.itaTimeout = false;

		if (status === `started`) {
			this.itaInProgress = true;

			this.telemetry.logEvent(VerifyCallerEvents.ITA_REQUEST_SENT, {
				"screen": TelemetryScreen.VERIFY_CALLER
			}, true);

			return;
		}

		if (status === `timeout`) {
			this.itaTimeout = true;
	
			this.telemetry.logEvent(VerifyCallerEvents.ITA_TIMEDOUT, {
				"screen": TelemetryScreen.VERIFY_CALLER,
				"next-screen": TelemetryScreen.VERIFY_CALLER
			}, true);

			return;
		}

		if (status === `verified`) {
			this.telemetry.logEvent(VerifyCallerEvents.ITA_SUCCESS, {
				"screen": TelemetryScreen.VERIFY_CALLER,
				"next-screen": null // Determine by need / path its opened from
			}, true);

			this.itaAttempts++;
			this._updateApplicationState(`verified`, `ITA`);
			this.dispatchEvent(new CustomEvent(`verified`, {
				detail: {
					incomingCallDetails: this.incomingCallDetails,
					callerInformation: this.callerInformation
				}
			}));

			return;
		}

		this.logger.log(`info`, `ITA SignalR event indicated that verification was rejected`, `_signalRPostEventAction`);

		this.itaRejected = true;
		this.itaFailedCount++;
		this.itaAttempts++;
		
		this.telemetry.logEvent(VerifyCallerEvents.ITA_FAILED, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": this.itaFailedCount >= MAX_ITA_ATTEMPTS ? TelemetryScreen.ITA_FAILED : TelemetryScreen.VERIFY_CALLER
		}, true);

		if (this._itaAttemptsExceeded()) {
			this._navigateToItaVerificationFailed();
		}
	}

	_tickCallback(timeLeft) {
		this.timeLeft = timeLeft;
	}

	/**
	 * Determines if the client is actually blocked. This is different from the _canVerify() function
	 * that determines if it might be possible to verify the client on a channel.
	 * This function will return false, if the client has no available channels but clearly in this
	 * circumstance it would not be possible to verify the client.
	 * 
	 * @returns { Boolean } Returns true if the client is actually blocked across all available channels.
	 *
	 * */
	_clientBlocked() {
		const blockedOnITA = this.callerInformation.hasDigitalChannels ? this._itaAttemptsExceeded() : false;
		const blockedOnXDS = this.hasSouthAfricanID ? this._xdsAttemptsExceeded() : false;

		// If the client is blocked on both we cannot verify.
		return blockedOnITA && blockedOnXDS;
	}

	/**
	 * Determines if it is possible to verify a client. This does not determine if a client is blocked.
	 * This function will return true as long as there is a channel available on which the client is not
	 * blocked.
	 * 
	 * @returns  { Boolean } Returns true if it is possible to verify the client
	 */
	_canVerify() {
		const canVerifyViaITA = this.callerInformation.hasDigitalChannels && !this._itaAttemptsExceeded();
		const canVerifyViaXDS = this.hasSouthAfricanID && !this._xdsAttemptsExceeded();

		return canVerifyViaITA || canVerifyViaXDS;
	}

	_canOnlyVerifyByXds() {
		return this.hasSouthAfricanID && // Need an SA ID to be able to use XDS
			!this.callerInformation.hasDigitalChannels && // App/USSD is not an option
			this.xdsAttempts === 0; // We have not tried to verify yet
	}

	_failedFirstXdsAttempt() {
		return this.hasSouthAfricanID && 
			   this.xdsAttempts === 1; 
	}

	_xdsAttemptsExceeded() {
		// xdsAttempts is 0 based and is incremented on attempting to retrieve security questions
		// This is because simply retreiving security questions counts as an attempt
		return this.xdsAttempts >= MAX_XDS_ATTEMPTS;
	}

	_ItaAvailable() {
		return this.callerInformation.hasDigitalChannels && !this._xdsAttemptsExceeded();
	}

	_itaInProgress() {
		return this.itaInProgress;
	}


	_pushFailed() {
		return this.itaTimeout || this.itaRejected || this.itaSystemError;
	}

	_itaAttemptsExceeded() {
		// itaAttempts is 0 based and is incremented on successful initiation of an ITA request
		return this.itaAttempts >= MAX_ITA_ATTEMPTS;
	}

	// To check if client is minor.
	_isMinorClient() {
		// TODO - check that we have the birth date and that it is valid
		const today = new Date();
		const clientBirthDate = new Date(this.callerInformation.birthdate);
	
		// Minimum age a client should meet for being a major ( > 16 years). 
		// ClientDOB after 'minMajorAge' are considered to be a minor client.
		const minMajorAge = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
	
		return minMajorAge < clientBirthDate;
	}
		
	_foreignOrMinorClient() {
		return (!this.hasSouthAfricanID || this._isMinorClient) && // This client may be foreign or a minor
			this.xdsAttempts === 0 && // No XDS attempts have been made yet
			!this.callerInformation.hasDigitalChannels; // The client does not have the app
	}
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

				div[slot="body"]{
					width: 100%;
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
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					--theme-alert-banner-unsuccessful-red-border: none;
					--theme-alert-banner-margin-bottom: 0px;
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
				.ita-timeout-svg {
					height: 152px;
					width: 210px;
					margin: 18px 0px 20px 0px;
				}
				.notification-info {
					color: #545D60;
					font-family: "Hind Vadodara";
					text-align: center;
					font-size: 15px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 24px;
					margin-bottom: 10px;
				}
				.failed-client {
					margin-bottom: 29px;
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
				.foreign-client {
					margin-bottom: 29px;
					text-align: center;
				}
				.no-remote-access-client {
					margin-bottom: 18px;
					text-align: center;
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
					.securityQuestions="${this.securityQuestions}"
					?finalAttempt=${this.xdsAttempts === MAX_XDS_ATTEMPTS}
					@cancel="${() => this._cancelledSecurityQuestions()}"
					@skip="${() => this._skippedSecurityQuestions()}"
					@verified="${() => this._verifiedViaSecurityQuestions()}"
					@failed="${() => this._failedSecurityQuestions()}"
					@service-failure="${() => this._xdsServiceFailure()}">
				</horizon-security-question>`;
	}

	_renderEndCallModal() {
		let status = ``;

		if (this.seconds > 0 && this.seconds < ITA_TIMEOUT_SECS) {
			status = `InProgress`;
		} else if (this.callerInformation.verificationAttempts.itaAttempts > 0) {
			status = `Failed`;
		}

		return this.renderMode !== RENDER_MODE.END_CALL
			? html``
			: html`
				<horizon-end-call-session 
					.incomingCallDetails="${this.incomingCallDetails}"
					.incidentDetails="${this.incidentDetails}"
					endCallContext='VerifyClient${status}'
					@cancel="${() => this.renderMode = RENDER_MODE.VERIFY_CALLER}">
				</horizon-end-call-session>`;
	}

	_renderBody() {
		// Initial main body displays (on entering the dialog for the first time)
		if (this._canOnlyVerifyByXds()) {
			return this._renderNotRegisteredForITA();
		}

		if (this._foreignOrMinorClient()) {
			return this._renderVerificationUnavailable();
		}

		if (this._clientBlocked()) {
			return this._renderVerificationUnavailable();
		}

		if (this.xdsUnavailable) {
			return this._renderSecurityQuestionsUnavailable(this._ItaAvailable());
		}

		if (this._itaInProgress()) {
			return this._renderPushNotificationStatus();
		}

		if (this._pushFailed()) {
			return this._renderPushNotificationError();
		}

		// Subsequent displays 
		if (this._failedFirstXdsAttempt()) {
			return this._renderFailedFirstXdsAttempt(this._ItaAvailable());
		}
	
		if (this._canOnlyVerifyByXds()) {
			return this._renderClientBlockedByXds();
		}

		if (this.hasSouthAfricanID && this.xdsFailed && this.xdsAttempts === MAX_XDS_ATTEMPTS - 1) {
			this._renderXdsOneAttemptLeft();
		}

		if (this.hasSouthAfricanID && !this._xdsAttemptsExceeded() && this.xdsMessage !== ``) {
			return this._renderXdsError();
		}
	}

	_renderPushNotificationStatus() {
		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group
					layout="vertical"
					halign="stretch" 
					valign="top"
					gap="clear">
						${this._renderHeaderLabels()}
						${this._renderCountdown()}
						${this._renderLabels()}
				</capitec-group>
			</capitec-content-box>`;
	}

	_renderHeaderLabels() {
		return this.seconds < 16 && this.seconds > 0
			? html`
				<capitec-alert-banner type="warning">
					<b>Notify client:</b> Your time is about to run out.
				</capitec-alert-banner>`
			: html`
				<capitec-alert-banner type="info">
					<b>Notify client:</b> A push notification was sent to your phone, you need to accept to continue.
				</capitec-alert-banner>`;
	}

	_renderCountdown() {
		return html`
			<capitec-group 
				layout="vertical"
				halign="center"
				valign="top"
				gap="clear"
				id="notification-status-group">
				<horizon-countdown
					time-limit="${ITA_TIMEOUT_SECS}"
					warning-threshold="${25}"
					alert-threshold="${10}"
					.tickCallback="${(timeLeft) => this._tickCallback(timeLeft)}"
				>
				</horizon-countdown>
			</capitec-group>`;
	}

	_renderLabels() {
		if (this.seconds < 16 && this.seconds > 0) {
			return html`
			<capitec-group layout="vertical"
					halign="center"
					valign="top"
					gap="clear"
					id="notification-status-group">
				<div class="notification-info">
					<b>There are <span class="timer-bold">${this.timeLeft} seconds</span> left.</b>
				</div>
				<capitec-label type="title" label="You'll need to try again if the timer runs out.">
				</capitec-label>
			</capitec-group>`;
		} 

		return html`
			<capitec-group layout="vertical"
					halign="center"
					valign="top"
					gap="clear"
					id="notification-status-group">
			
				<div class="notification-info">
					There are <span class="timer-bold">${this.timeLeft} seconds</span> left.
				</div>
				<capitec-label 
					type="title"
					label= "Check your verified cellphone to accept.">
				</capitec-label>
			</capitec-group>`;
	}

	_renderPushNotificationError() {
		let message = ``;
		let instruction = ``;

		message = this.itaSystemError ? `The push notification didn't send due to a system error` : message;
		message = this.itaRejected ? `The client rejected the notification` : message;
		message = this.itaTimeout ? `The client did not accept the notification in time` : message;
		message = this._itaAttemptsExceeded() ? `Maximum number of ITA Attempts reached` : message;

		instruction = this.itaSystemError ? `You can try again or choose another option` : instruction;


		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group 
					layout="vertical" 
					halign="stretch" 
					valign="top" 
					gap="clear">
					<capitec-alert-banner 
						type="error">
						<b>Notify client:</b> ${message} 
					</capitec-alert-banner>
					<capitec-group layout="vertical"
						halign="center"
						valign="top"
						gap="clear"
						id="notification-status-group">
						<img src="/images/common/ita-timeout.svg" class="ita-timeout-svg"/>
						<capitec-label 
							type="title"
							label="${instruction}">
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
								label="Notify the client and either try again${this.hasSouthAfricanID ? ` or complete through security questions.` : ``}">
						</capitec-label>
				<capitec-group>
				</capitec-group>
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

	_renderNotRegisteredForITA() {
		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group layout="vertical" halign="stretch" valign="top" gap="clear">
					<capitec-alert-banner type="warning">
						<b>Notify: </b>This client isn't registered for Remote Banking.
					</capitec-alert-banner>
					<capitec-group layout="vertical" 
						halign="center"
						valign="top" 
						gap="clear"
						id="notification-status-error-group">
						<img src="/images/connection-error.svg" class="remote-connection-warning-svg"/>
						<div class="no-remote-access-client notification-info">
							<b>Notify client</b><br>
							We need to ask you 5 security questions before accessing your account.<br>
							Your answers will be checked by a third-party or credit bureau. Are you comfortable to continue?
						</div>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>`;
	}

	_renderClientBlockedByXds() {
		const message = this.callerInformation.hasDigitalChannels && !this._xdsAttemptsExceeded()
			? `You can skip to continue with limited transactions, verify via the App / USSD or be transferred to a team leader`
			: `You can skip to continue with limited transactions or be transferred to a team leader`;

		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group layout="vertical" halign="stretch" valign="top" gap="clear">
					<capitec-alert-banner type="error">
						<b>Notify: </b>Access to your Remote / Mobile Banking services have been restricted. 
					</capitec-alert-banner>
					<capitec-group layout="vertical" 
						halign="center"
						valign="top" 
						gap="clear"
						id="notification-status-error-group">
						<img src="/images/client-blocked.svg" class="warning-svg connection-error-svg"/>
						<div class="foreign-client notification-info">
							${message}
						</div>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>`;
	}

	_renderFailedFirstXdsAttempt(canPush) {
		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group layout="vertical" halign="stretch" valign="top" gap="clear">
					<capitec-alert-banner type="warning">
						<b>Notify client: </b>You didn't pass the security questions.
					</capitec-alert-banner>
					<capitec-group layout="vertical" 
						halign="center"
						valign="top" 
						gap="clear"
						id="notification-status-error-group">
						<img src="/images/warning.svg" class="warning-svg connection-error-svg"/>
						<div class="notification-info">
							Your first attempt was unsuccessful. <br>
							${canPush 
								? html`You can try again or verify by accepting the push notification.` 
								: html`You can try security questions again or skip verification`
							}
						</div>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>`;
	}

	_renderVerificationUnavailable() {
		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group layout="vertical" halign="stretch" valign="top" gap="clear">
					<capitec-alert-banner type="error">
						<b>Notify client : </b>We’re unable to verify you at this time.
					</capitec-alert-banner>
					<capitec-group layout="vertical" 
						halign="center"
						valign="top" 
						gap="clear"
						id="notification-status-error-group">
						<img src="/images/foreign-minorClientError.svg" class="warning-svg connection-error-svg"/>
						<div class="foreign-client notification-info">
						<b>Foreign / minor client</b><br>
						Skip verification to continue with limited transactions or transfer the call to a team leader
						</div>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>`;
	}

	_renderOtherOptions() {
		if (this.callerInformation.verificationStatus === `verified` && this.callerInformation.verificationMethod === `XDS`) {
			
				return html`
			<capitec-title-bar type="default" label="Choose another option"></capitec-title-bar>
			<capitec-content-box id="relation-options-btn">
				<capitec-group layout="horizontal" halign="left" valign="top" gap="clear">
					<horizon-option-button 
						label="Cancel"
						icon="system/close-action" 
						iconSize="default"
						@click="${() => this._cancelClick()}">
					</horizon-option-button>
					<horizon-option-button
					class="btnTryAgain"
						label="Try Again" 
						img-src="/images/insure/refresh.svg"
						iconSize="default"
						?hidden=${!this.appTimedOut || this.itaFailedCount >= MAX_ITA_ATTEMPTS}
						@click="${() => this._tryAgain()}">
					</horizon-option-button>
				</capitec-group>
			</capitec-content-box>
		`;
			
		} 

		return html`
			<capitec-title-bar type="default" label="Choose option"></capitec-title-bar>
			<capitec-content-box id="relation-options-btn">
				<capitec-group layout="horizontal" halign="left" valign="top" gap="clear">
					<horizon-option-button 
						label="Security Questions" 
						icon="system/knowledge-action"
						iconSize="default"
						?hidden=${!this.hasSouthAfricanID || this._xdsAttemptsExceeded() || !this._canVerify || this.callerInformation.isMinorClient}
						@click="${() => this._securityQuestionsClick()}">
					</horizon-option-button>
					<horizon-option-button 
						label="Skip Verification"
						icon="system/arrow-right-action" 
						iconSize="default"
						@click="${() => this._skipClick()}">
					</horizon-option-button>
					<horizon-option-button
					  class="btnTryAgain"
						label="Verify Via App/USSD" 
						icon="system/cellphone-action"
						iconSize="default"
						?hidden=${!this.callerInformation.hasDigitalChannels || this._itaAttemptsExceeded() || this._itaInProgress()}
						@click="${() => this._tryAgain()}">
					</horizon-option-button>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderSecurityQuestionsUnavailable(canPush) {
		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group layout="vertical" halign="stretch" valign="top" gap="clear">
					<capitec-alert-banner type="error">
						<b>Notify client: </b>A system error has occured..
					</capitec-alert-banner>
					<capitec-group layout="vertical" 
						halign="center"
						valign="top" 
						gap="clear"
						id="notification-status-error-group">
						<img src="/images/errorBlocks.svg" class="warning-svg connection-error-svg"/>
						<div class="notification-info failed-client">
							<b>Security questions are currently unavailable.</b> <br>
							${canPush
								? `Skip verification to continue with limited transactions or verify via the App/USSD.`
								: `Skip verification to continue with limited trasactions`
							}
							${this.unavailableText}
						</div>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>`;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}
}
window.customElements.define(`horizon-verify-caller`, VerifyCaller);