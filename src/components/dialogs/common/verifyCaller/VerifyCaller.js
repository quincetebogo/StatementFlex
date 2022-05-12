import { Component, css, html } from 'platform/elements';
import { Configuration, EventAggregator, Logger } from 'platform/core';
import { AUTH_METHODS } from 'app/constants/Common';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { ITAChannelService } from 'app/services/ITAChannelService';
import { ItaCallerVerification } from 'app/services/ItaCallerVerification';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { VerifyCallerEvents } from 'app/constants/telemetry/events/VerifyCaller';
import { isWellFormedSouthAfricanID } from 'app/utils/channelServiceUtilities';

import 'app/components/common/OptionButton';
import 'app/components/common/CallerDialog';
import 'app/components/common/ComponentCountdown';
import 'app/components/dialogs/common/EndCallSession';

import 'app/components/dialogs/common/verifyCaller/NotRegisteredForIta';
import 'app/components/dialogs/common/verifyCaller/PushNotificationStatus';
import 'app/components/dialogs/common/verifyCaller/PushNotificationError';
import 'app/components/dialogs/common/verifyCaller/VerifyByKBA';
import 'app/components/dialogs/common/verifyCaller/VerifyBySecurityQuestions';
import 'app/components/dialogs/common/verifyCaller/VerificationUnavailable';
import 'app/components/dialogs/common/verifyCaller/XdsAttemptFailed';
import 'app/components/dialogs/common/verifyCaller/XdsBlocked';
import 'app/components/dialogs/common/verifyCaller/XdsUnavailable';

const RENDER_MODE = Object.freeze({
	VERIFY_CALLER: 1,
	XDS_SQ: 2,
	END_CALL: 3,
	KBA_SQ: 4
});

const HEADER_LABEL = `Verify Caller`;

const MAX_ITA_ATTEMPTS = 3;
const MAX_XDS_ATTEMPTS = 2;
const MAX_KBA_ATTEMPTS = 1;

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
		this.isBusy = false;
		this.isLoading = true;

		this.SQUnavailable = false;
		this.xdsBlocked = false;

		this.itaInProgress = false;
		this.itaTimeout = false;
		this.itaRejected = false;
		this.itaSystemError = false;
		this.timeLeft = ITA_TIMEOUT_SECS;

		this.hasSouthAfricanID = false;
		this.kbaQuestions = [];

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.configuration = Configuration.getInstance();
		this.logger = Logger.getInstance();
		this.telemetry = HorizonTelemetry.getInstance();

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag());
		this.itaChannelService = new ITAChannelService(() => this._toggleBusyFlag(), () => true);
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
			hasSouthAfricanID: { state: true },
			SQUnavailable: { state: true }, // Set when there has been a system error with XDS/ KBA
			itaInProgress: { state: true },
			itaTimeout: { state: true },
			itaRejected: { state: true },
			itaSystemError: { state: true }, 
			kbaAttempts: { state: true },
			xdsAttempts: { state: true },
			itaAttempts: { state: true },
			timeLeft: { state: true },
			isBusy: { state: true },
			isLoading: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	async connectedCallback() {
		super.connectedCallback();

		this.telemetry.startSpan(VerifyCallerEvents.VERIFY_CALLER, {
			"remote-channels-registered": this.callerInformation.hasDigitalChannels
		});

		// Set up ITA & XDS attempts if structure does not exist yet
		if (!this.callerInformation.verificationAttempts) {
			this.callerInformation.verificationAttempts = {
				itaAttempts: 0,
				sqAttempts: 0
			};
		}

		this.xdsAttempts = this.kbaAttempts = this.callerInformation.verificationAttempts.sqAttempts;
		this.itaAttempts = this.callerInformation.verificationAttempts.itaAttempts;

		this.hasSouthAfricanID = isWellFormedSouthAfricanID(this.callerInformation.southAfricanIDNumber);

		if (this.callerInformation.hasDigitalChannels) {
			await this.telemetry.startSpan(VerifyCallerEvents.VERIFY_CALLER_ITA, {
				"screen": TelemetryScreen.VERIFY_CALLER
			});
			await this._initiateItaVerification();
		}

		this.authMethod = await this.configuration.getSetting(`AuthMethod`);
		this.isLoading = false;
	}

	disconnectedCallback() {
		this._itaClose();

		if (this.callerInformation.hasDigitalChannels) {
			this.telemetry.endSpan(VerifyCallerEvents.VERIFY_CALLER_ITA, {
				"screen": TelemetryScreen.VERIFY_CALLER
			});
		}

		this.telemetry.endSpan(VerifyCallerEvents.VERIFY_CALLER, {
			"screen": TelemetryScreen.VERIFY_CALLER
		});

		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	async _securityQuestionsClick() {
		
		// Stop any pending ITA attempt
		this._itaClose();
		this.itaInProgress = false;
		this.itaSystemError = false;
		this.itaTimeout = false;
		this.itaRejected = false;

		const xds = () => this._loadXDS();
		const kba = () => this._loadKBA();
		
		const getQuestions = {
			[AUTH_METHODS.XDS]: xds,
			[AUTH_METHODS.KBA]: kba
		};

		await getQuestions[this.authMethod]();
	}

	async _loadKBA() {
		const returnValue = await this.itaChannelService.loadKBA(this.callerInformation.cifNumber, this.callerInformation.identifiedBy, () => true);

		this.telemetry.logEvent(VerifyCallerEvents.SECURITY_QUESTIONS_CLICK, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": TelemetryScreen.KBA,
			"attempt": 1,
			"outcome": !returnValue.succeeded ? `Service-failure` : `Success`
		});

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to get KBA questions`, `_loadKBA`, returnValue.correlationId);
			this.SQUnavailable = true;
			return false;
		}

		this.kbaQuestions = returnValue.result?.questionList;
		this.renderMode = RENDER_MODE.KBA_SQ;
	}

	async _loadXDS() {
		const returnValue = await this.callHandleService.xdsQuestions(this.callerInformation.southAfricanIDNumber, () => true);

		if (!returnValue.succeeded) {
			// If we are unable to retreive security questions. It doesn't matter why at present.
			// We can't verify the client via XDS
			// this.xdsAttempts = MAX_XDS_ATTEMPTS;
		
			this.telemetry.logEvent(VerifyCallerEvents.SECURITY_QUESTIONS_CLICK, {
				"screen": TelemetryScreen.VERIFY_CALLER,
				"next-screen": TelemetryScreen.SECURITY_QUESTIONS_FAILURE,
				"attempt": null,
				"outcome": returnValue?.exception?.message
			});
	
			this.SQUnavailable = true;

			return;
		} 

		const result = returnValue.result;

		if (result?.errorCode) {
			this.telemetry.logEvent(VerifyCallerEvents.SECURITY_QUESTIONS_CLICK, {
				"screen": TelemetryScreen.VERIFY_CALLER,
				"next-screen": TelemetryScreen.SECURITY_QUESTIONS_FAILURE,
				"attempt": null,
				"outcome": `${result?.errorCode}: ${result.errorMessage}` 
			});
	
			if (result.errorMessage) {
				this.xdsAttempts = MAX_XDS_ATTEMPTS;
				this.xdsBlocked = true;
				this.logger.log(`warn`, `${result?.errorCode}: ${result.errorMessage}`, `_securityQuestionsClick`);
			}

			return;
		}

		return this._handleSecurityQuestions(result);
	}

	_handleSecurityQuestions(securityQuestions) {
		// Set this.securityQuestions for passing to the security questions dialog
		this.securityQuestions = securityQuestions;

		this.logger.log(`debug`, `BlockingEnabled=${securityQuestions.blockingEnabledFlag} Blocked=${securityQuestions.isUserBlocked} AuthStatusInd=${securityQuestions.authenticationStatusInd} AuthTypeInd=${securityQuestions.authenticationTypeInd} Remaining=${securityQuestions.noOfAttemptsRemaining}`, `_updateXdsAuthenticationAttempts`);

		this.xdsAttempts = this._updateXdsAuthenticationAttempts(securityQuestions, this.xdsAttempts);

		// Must be >, not >= as we bump this count as soon as we have requested questions
		if (securityQuestions.isUserBlocked || this.xdsAttempts > MAX_XDS_ATTEMPTS) {

			this.telemetry.logEvent(VerifyCallerEvents.SECURITY_QUESTIONS_CLICK, {
				"screen": TelemetryScreen.VERIFY_CALLER,
				"next-screen": TelemetryScreen.SECURITY_QUESTIONS_FAILURE,
				"attempt": this.xdsAttempts,
				"outcome": `XDS verification not permitted`
			});
	
			this.xdsAttempts = MAX_XDS_ATTEMPTS; 
			this.xdsBlocked = true;
			this.logger.log(`warn`, `XDS verification not permitted`, `_securityQuestionsClick`);
			return;
		} ;
		
		if (securityQuestions.questions && securityQuestions.questions.length > 0) {

			this.telemetry.logEvent(VerifyCallerEvents.SECURITY_QUESTIONS_CLICK, {
				"screen": TelemetryScreen.VERIFY_CALLER,
				"next-screen": TelemetryScreen.SECURITY_QUESTIONS,
				"attempt": this.xdsAttempts,
				"outcome": `Security questions retrieved successfully`
			});

			this.logger.log(`info`, `XDS Questions retrieved, transitioning to Security Questions Dialog`, `_securityQuestionsClick`);
			this.renderMode = RENDER_MODE.XDS_SQ;
			return;
		};
		
		// There is something wrong with the response packet from XDS. Try to extract and log the error.
		// XDS will be flagged as unavailable to the client for this session.
		this.xdsAttempts = MAX_XDS_ATTEMPTS;
		this.SQUnavailable = true;

		const xdsMessage = securityQuestions.errorMessage ? securityQuestions.errorMessage : `System Issue: Unable to obtain security questions`;
		this.logger.log(`error`, `XDS ERROR: ${xdsMessage}`, `_securityQuestionsClick`);
				
		this.telemetry.logEvent(VerifyCallerEvents.SECURITY_QUESTIONS_CLICK, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": TelemetryScreen.SECURITY_QUESTIONS_FAILURE,
			"attempt": this.xdsAttempts,
			"outcome": xdsMessage
		});
	}

	_updateXdsAuthenticationAttempts(securityQuestions, xdsAttempts) {
		// It appears that this blockingEnabledFlag is not respected in the Horizon Profile
		/*
		if (!securityQuestions.blockingEnabledFlag) {
			return this.xdsAttempts++;
		}
		*/
		

		// Should not get this as the CS should have caught it and returned an error
		// code. So the blocked case should have been handled when examining the errorCode
		// on the response to the request for security questions
		if (securityQuestions.isUserBlocked) {
			return MAX_XDS_ATTEMPTS;
		}

		// This is the inital attempt. XDS documentation states that AuthenticationTypeInd=P is the primary set of 
		// questions. This should mean that this is our initial attempt 
		if (securityQuestions.authenticationStatusInd === `P` && securityQuestions.authenticationTypeInd === `P`) {
			return 1;
		}

		// The current attempt will always show as the first attempt in history. This attempt should be PENDING
		// If the previous attempt is `authenticated' then it also indicates that this is the first attempt of this
		// session, irrespective of the authenticationTypeInd
		/*
		const authHistory = securityQuestions.authenticationHistory;
		if (authHistory.length >= 2 && authHistory[1].authenticationStatus.toLowerCase() === `authenticated`) {
			return 1;
		}
		*/

		// AuthenticationTypeInd=S means that we got back secondary questions after a failed attempt at 
		// answering questions. So this is at least the second attempt. It seeems that it takes two 
		// successful authentications before XDS go back to sending primary questions. All the time 
		// we are getting secondary questions, only one attempt will be allowed. 
		if (securityQuestions.authenticationStatusInd === `P` && securityQuestions.authenticationTypeInd === `S`) {
			// if we are starting from no recorded attempts in the UI but XDS says this is a secondary attempt then
			// assume that this is the final attempt, otherwise just bump the attempt count by one
			return xdsAttempts = xdsAttempts === 0 ? MAX_XDS_ATTEMPTS : xdsAttempts + 1;
		}

		// We probably won't be able to get here... 
		//
		// Now compute the number of attempts given the number of allowed attempts
		// and the number of remaining attempts. MAX_XDS_ATTEMPTS must be aligned with
		// what is set in our XDS profile for this to work properly
		xdsAttempts = MAX_XDS_ATTEMPTS - securityQuestions?.noOfAttemptsRemaining ?? 0;

		// IF XDS has their max attempts set higher than our limit then treat the all excess attempts
		// as first attempts
		if (xdsAttempts <= 0) {
			this.logger.log(`warning`, `XDS appears to be configured to allow more attempts than Horizon expects`, `_updateXdsAuthenticationAttempts`);
			xdsAttempts = 1;
		}

		return xdsAttempts;

		/*
		const authHistory = securityQuestions.authenticationHistory;

		if (!authHistory) {
			// Just sending off a request counts as an attempt already
			this.xdsAttempts++;
			return;
		}

		// Retrieve the number of previous attemnpts (including this current attempt)
		this.xdsAttempts = this._calculateXDSAttempts(authHistory);
		if (this.xdsAttempts > 1) {
			this.logger.log(`warn`, `The caller made ${this.xdsAttempts} to verify via XDS!`);
		}
		*/
	}

	/*
	_calculateXDSAttempts(authHistory) {
		let ndx = 0;
		let usedAttempts = 0;

		// Just asking for security questions counts as one attempt
		// All previous pending/failed attempts after the last successful attempt count as attempts.
		// There is no time limit after which an attempt is considered expired.
		while (ndx <= authHistory.length - 1) {
			if (authHistory[ndx].authenticationStatus.toLowerCase() !== `authenticated`) {
				ndx++;
				usedAttempts++;
			} else {
				return usedAttempts;
			}
		}

		return usedAttempts;
	}
	*/

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
		this.telemetry.logEvent(VerifyCallerEvents.ITA_CANCEL_CLICK, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": null // TODO: Determine by need and failed verification counts
		});

		this.callerInformation.verificationAttempts.itaAttempts = this.itaFailedCount;
		this.dispatchEvent(new CustomEvent(`cancel`, { detail: 
			{ 
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: this.callerInformation 
		} }));
	
	}

	_skippedSecurityQuestions() {
		this._updateApplicationState(`unverified`, `unverified`);
		this.dispatchEvent(new CustomEvent(`skip`, { detail: 
			{
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: this.callerInformation 
			} }));
	}

	_cancelledSecurityQuestions() {
		this._updateApplicationState(`unverified`, `unverified`);
		this.dispatchEvent(new CustomEvent(`cancel`, { detail: { 
			incomingCallDetails: this.incomingCallDetails,
			callerInformation: this.callerInformation 
		} }));
	}

	_verifiedViaSecurityQuestions() {
		this._updateApplicationState(`verified`, `SQ`);
		this.dispatchEvent(new CustomEvent(`verified`, { detail: { 
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: this.callerInformation 
		} }));
	}

	_failedSecurityQuestions(reason) {
		if (reason?.errorCode === `1004`) {
			// 1003 means security questions failed
			// 1004 means security questions failed and the user is now blocked
			this.xdsAttempts = MAX_XDS_ATTEMPTS;
			this.xdsBlocked = true;
		}

		this.telemetry.logEvent(VerifyCallerEvents.XDS_FAILED, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS,
			"next-screen": this._xdsAttemptsExceeded() ? TelemetryScreen.XDS_FAILED : TelemetryScreen.VERIFY_CALLER,
			"attempt": this.xdsAttempts
		}, true);

		if (this._xdsAttemptsExceeded()) {
			this._updateApplicationState(`failed`, `unverified`);
			this.horizonRouter.navigateToXdsVerificationFailed();
			return;
		};

		this.renderMode = RENDER_MODE.VERIFY_CALLER;
	}

	_sqServiceFailure() {
		this.callerInformation.verificationStatus = `unverified`;
		this.SQUnavailable = true;
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
			"next-screen": TelemetryScreen.VERIFY_CALLER // TODO: The next screen could be the ITA failure screen
		});

		this._itaClose();

		if (!this._itaAttemptsExceeded()) {
			this.logger.log(`info`, `Retrying ITA verification`, `_tryAgain`);
			this._initiateItaVerification();
			return;
		} 
		
		this.logger.log(`info`, `Maximum ITA verification attemmpts exceeded`, `_tryAgain`);
		this._navigateToItaVerificationFailed();
	}

	_endCall() {
		if (this.callerInformation.hasDigitalChannels) {
			this.telemetry.logEvent(VerifyCallerEvents.ITA_END_CALL, {
				"screen": TelemetryScreen.VERIFY_CALLER,
				"next-screen": TelemetryScreen.END_CALL
			});
		}

		// TODO: XDS end call event and what do we do if no channels available.... verify dialog end call

		this.renderMode = RENDER_MODE.END_CALL;
	}

	_failedKBA() {
		this.xdsAttempts = MAX_KBA_ATTEMPTS;
		this.xdsBlocked = true;

		this._updateApplicationState(`failed`, `unverified`);
		this.horizonRouter.navigateToKBAVerificationFailed();
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

		this.callerInformation.verificationAttempts.sqAttempts = this.xdsAttempts;
		this.callerInformation.verificationAttempts.itaAttempts = this.itaAttempts;

		this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
		this.horizonStore.setCallerInformation(this.callerInformation);
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_navigateToItaVerificationFailed() {
		if (this.itaFailedCount >= MAX_ITA_ATTEMPTS && (this.callerInformation.verificationStatus === `verified` && this.callerInformation.verificationMethod === `SQ`)) {

			this._updateApplicationState(`verified`, `SQ`);
		} else {
			this._updateApplicationState(`failed`, `unverified`);
			this.horizonRouter.navigateToItaVerificationFailed();
		}
	}

	async _initiateItaVerification() {
		this.itaInProgress = false;

		try {
			await this.itaService.initiateItaVerification(this.callerInformation.cifNumber);
			this.itaSystemError = false;
		} catch (error) {
			this.itaSystemError = true;
			this.telemetry.logEvent(VerifyCallerEvents.ITA_SERVICE_FAILURE, { "failure-reason": error?.message }, true);
		}
	}

	_verificationStatusCallBack(status) {
		this.itaRejected = false;
		this.itaInProgress = false;
		this.itaTimeout = false;

		switch (status) {
			case `started`: 
				this.itaInProgress = true;
				this.telemetry.logEvent(VerifyCallerEvents.ITA_REQUEST_SENT, {
					"screen": TelemetryScreen.VERIFY_CALLER
				}, true);
				break;

			case `timeout`: 
				// This should no longer happen as the itaService no longer runs a timer
				// Kept here in case we can get ITA timout notifications from the back end service
				this.itaTimeout = true;
				this.telemetry.logEvent(VerifyCallerEvents.ITA_TIMEDOUT, {
					"screen": TelemetryScreen.VERIFY_CALLER,
					"next-screen": TelemetryScreen.VERIFY_CALLER
				}, true);
				break;

			case `verified`: 
				this.telemetry.logEvent(VerifyCallerEvents.ITA_OUTCOME, {
					"screen": TelemetryScreen.VERIFY_CALLER,
					"next-screen": null, // Determine by need / path its opened from
					"ITA-outcome": status
				}, true);

				this.itaAttempts++;
				this._updateApplicationState(`verified`, `ITA`);
				this.dispatchEvent(new CustomEvent(`verified`, {
					detail: {
						incomingCallDetails: this.incomingCallDetails,
						callerInformation: this.callerInformation
					}
				}));
				break;

			case `system-failed`:
				this.itaSystemError = true;
				this.telemetry.logEvent(VerifyCallerEvents.ITA_SERVICE_FAILURE, {}, true);
				break;

			case `pin-blocked`:
				this.itaAttempts = MAX_ITA_ATTEMPTS;
				this._navigateToItaVerificationFailed();
				this.logger.log(`info`, `ITA SignalR event indicated that its pin blocked, status=${status}`, `_signalRPostEventAction`);
				break;
	
			default: 
				this.logger.log(`info`, `ITA SignalR event indicated that verification was rejected, status=${status}`, `_signalRPostEventAction`);

				this.itaRejected = true;
				this.itaFailedCount++;
				this.itaAttempts++;
				
				this.telemetry.logEvent(VerifyCallerEvents.ITA_OUTCOME, {
					"screen": TelemetryScreen.VERIFY_CALLER,
					"next-screen": this._itaAttemptsExceeded() ? TelemetryScreen.ITA_FAILED : TelemetryScreen.VERIFY_CALLER,
					"ITA-outcome": status
				}, true);
		
				if (this._itaAttemptsExceeded()) {
					this._navigateToItaVerificationFailed();
				}
		}
	}

	_tickCallback(timeLeft) {
		this.timeLeft = timeLeft;
	}

	async _itaTimeout() {
		this.telemetry.logEvent(VerifyCallerEvents.ITA_TIMEDOUT, {
			"screen": TelemetryScreen.VERIFY_CALLER,
			"next-screen": TelemetryScreen.VERIFY_CALLER
		}, true);

		await this._itaClose();

		this.itaRejected = false;
		this.itaInProgress = false;
		this.itaTimeout = true;
	}

	async _itaClose() {
		await this.itaService.close();
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
		const blockedOnSQ = this.hasSouthAfricanID ? this._sqAttemptsExceeded() : false;

		// If the client is blocked on both we cannot verify.
		return blockedOnITA && blockedOnSQ;
	}

	_sqAttemptsExceeded() {
		return this._xdsAttemptsExceeded() || this._kbaAttemptsExceeded();
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

		return canVerifyViaITA || this._canVerifyViaSQ();
	}

	_canVerifyViaSQ() {
		return (this.hasSouthAfricanID || this.authMethod === AUTH_METHODS.KBA) &&
			!this._sqAttemptsExceeded() &&
			!this.SQUnavailable &&
			this.callerInformation.verificationMethod !== `SQ`; // Already verified via XDS/ KBA
	}

	_canOnlyVerifyBySQ() {
		return (this.hasSouthAfricanID || this.authMethod === AUTH_METHODS.KBA) && // Need an SA ID to be able to use XDS, but not for KBA
			!this._isMinorClient() &&
			!this.callerInformation.hasDigitalChannels && // App/USSD is not an option
			(this.xdsAttempts === 0 && this.kbaAttempts === 0) && // We have not tried to verify yet
			!this.SQUnavailable;
			
	}

	_showSQUnavailable() {
		return this.SQUnavailable && // Can't do XDS/ KBA
			   !this.itaInProgress && !this._pushFailed(); // And ITA is not in progress & push failed
	}

	_showXDSBlocked() {
		return Boolean(this.xdsBlocked) && // XDS blocked
			   !this.itaInProgress && !this._pushFailed(); // And ITA is not in progress & push failed;
	}

	_failedFirstXdsAttempt() {
		return this.hasSouthAfricanID && 
			   this.xdsAttempts === 1 &&
			   this.authMethod === AUTH_METHODS.XDS; // This is specific to XDS flow
	}

	_xdsAttemptsExceeded() {
		// xdsAttempts is 0 based and is incremented on attempting to retrieve security questions
		// This is because simply retrieving security questions counts as an attempt
		return this.xdsAttempts >= MAX_XDS_ATTEMPTS;
	}

	_kbaAttemptsExceeded() {
		return this.kbaAttempts >= MAX_KBA_ATTEMPTS;
	}

	_ItaAvailable() {
		return this.callerInformation.hasDigitalChannels && !this._itaAttemptsExceeded();
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
		if (!this.callerInformation.birthdate) {
			return false;
		}

		const today = new Date();
		const clientBirthDate = new Date(this.callerInformation.birthdate);
	
		// Minimum age a client should meet for being a major ( > 16 years). 
		// ClientDOB after 'minMajorAge' are considered to be a minor client.
		const minMajorAge = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
	
		return minMajorAge < clientBirthDate;
	}
		
	_foreignOrMinorClient() {
		return (!this.hasSouthAfricanID || this._isMinorClient()) && // This client may be foreign or a minor
			this.xdsAttempts === 0 && this.kbaAttempts === 0 && // No XDS/ KBA attempts have been made yet
			!this.SQUnavailable &&
			!this.callerInformation.hasDigitalChannels; // The client does not have the app
	}

	async _cancelEndCall() {
		if (!this.itaRejected) {
			await this._initiateItaVerification();
		}

		this.renderMode = RENDER_MODE.VERIFY_CALLER;
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
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		if (this.isLoading) {
			return html`${this._renderLoadingIndicator()}`;
		}
		
		return html`
			${this._renderVerifyCallerDialog()}
			${this._renderSecurityQuestionsDialog()}
			${this._renderKBADialog()}
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
						${this._renderButtonBar()}
						${this._renderLoadingIndicator()}
					</div>
				</horizon-caller-dialog>`;
	}

	_renderBody() {
		// Initial main body displays (on entering the dialog for the first time)
		if (this._canOnlyVerifyBySQ()) {
			return this._renderNotRegisteredForITA();
		}

		if (this._foreignOrMinorClient()) {
			return this._renderVerificationUnavailable();
		}

		if (this._clientBlocked()) {
			return this._renderVerificationUnavailable();
		}

		if (this._showSQUnavailable()) {
			return this._renderSecurityQuestionsUnavailable(this._ItaAvailable());
		}

		if (this._itaInProgress()) {
			return this._renderPushNotificationStatus();
		}

		if (this._pushFailed()) {
			return this._renderPushNotificationError();
		}

		if (this._showXDSBlocked()) {
			return this._renderXdsBlocked();
		}

		// Subsequent displays 
		if (this._failedFirstXdsAttempt()) {
			return this._renderFailedFirstXdsAttempt(this._ItaAvailable());
		}
	}

	_renderPushNotificationStatus() {
		return html`
			<horizon-push-notication-status
				timeLimit="${ITA_TIMEOUT_SECS}"
				warningThreshold="${25}"
				alertThreshold="${10}"
				timeLeft="${this.timeLeft}"
				.tickCallback="${(timeleft) => this._tickCallback(timeleft)}"
				@time-expired="${() => this._itaTimeout()}">
			</horizon-push-notication-status>`;
	}

	_renderPushNotificationError() {
		return html`
			<horizon-push-notication-error
				?itaTimeout="${this.itaTimeout}"
				?itaRejected="${this.itaRejected}"
				?itaSystemError="${this.itaSystemError}">
			</horizon-push-notication-error>
		`;
	}

	_renderNotRegisteredForITA() {
		return html`<horizon-not-registered-for-ita></horizon-not-registered-for-ita>`;
	}

	_renderFailedFirstXdsAttempt(canPush) {
		return html`<horizon-xds-attempt-failed ?canPush="${canPush}"></horizon-xds-attempt-failed>`;
	}

	_renderSecurityQuestionsUnavailable(canPush) {
		return html`<horizon-xds-unavailable ?canPush="${canPush}"></horizon-xds-unavailable>`;
	}

	_renderVerificationUnavailable() {
		return html`<horizon-verification-unavailable></horizon-verification-unavailable>`;
	}

	_renderXdsBlocked() {
		return html`<horizon-xds-blocked></horizon-xds-blocked>`;
	}

	_renderButtonBar() {
		const showVerifyViaApp = !this.callerInformation.hasDigitalChannels || this._itaAttemptsExceeded() || 
								 !(this._showSQUnavailable() || this._showXDSBlocked() || this._failedFirstXdsAttempt());
		
		// Only Allow ITA/USSD if the client has already verified via XDS
		// This is for high risk transactions
		if (this.callerInformation.verificationStatus === `verified` && this.callerInformation.verificationMethod === `SQ`) {
			
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
							?hidden=${!(this.itaTimeout || this.itaRejected || this.itaSystemError)}
							@click="${() => this._tryAgain()}">
						</horizon-option-button>
					</capitec-group>
				</capitec-content-box>`;
		}

		return html`
			<capitec-title-bar type="default" label="Choose option"></capitec-title-bar>
			<capitec-content-box id="relation-options-btn">
				<capitec-group layout="horizontal" halign="left" valign="top" gap="clear">
					<horizon-option-button 
						label="Security Questions" 
						icon="system/knowledge-action"
						iconSize="default"
						?hidden=${!this._canVerifyViaSQ() || this._isMinorClient()}
						@click="${() => this._securityQuestionsClick()}">
					</horizon-option-button>
					<horizon-option-button 
						label="Skip Verification"
						icon="system/arrow-right-action" 
						iconSize="small"
						@click="${() => this._skipClick()}">
					</horizon-option-button>
					<horizon-option-button
						class="btnTryAgain"
						label="Try Again"
						img-src="/images/insure/refresh.svg"
						iconSize="default"
						?hidden=${!(this.itaTimeout || this.itaRejected || this.itaSystemError)}
						@click="${() => this._tryAgain()}">
					</horizon-option-button>
					<horizon-option-button
						class="btnTryAgain"
						label="Verify Via App/USSD"
						icon="system/cellphone-action"
						iconSize="default"
						?hidden=${showVerifyViaApp}
						@click="${() => this._tryAgain()}">
					</horizon-option-button>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderSecurityQuestionsDialog() {
		return this.renderMode === RENDER_MODE.XDS_SQ
			? html`
				<horizon-security-question 
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.securityQuestions="${this.securityQuestions}"
					.cifNumber="${this.callerInformation.cifNumber}"
					.title="${this.callerInformation.title}"
					.lastName="${this.callerInformation.lastName}"
					?finalAttempt=${this.xdsAttempts === MAX_XDS_ATTEMPTS}
					@cancel="${() => this._cancelledSecurityQuestions()}"
					@skip="${() => this._skippedSecurityQuestions()}"
					@verified="${() => this._verifiedViaSecurityQuestions()}"
					@failed="${(reason) => this._failedSecurityQuestions(reason)}"
					@service-failure="${() => this._sqServiceFailure()}">
				</horizon-security-question>`
			: html``;
	}

	_renderEndCallModal() {
		let status = ``;

		if (this.timeLeft > 0 && this.timeLeft < ITA_TIMEOUT_SECS) {
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
					@cancel="${() => this._cancelEndCall()}"
					@on-loading="${() => this.itaService.close()}">
				</horizon-end-call-session>`;
	}

	_renderLoadingIndicator() {
		if (this.isBusy || this.isLoading) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}

	_renderKBADialog() {
		return this.renderMode === RENDER_MODE.KBA_SQ
		? html`
			<horizon-verify-kba
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				.questions="${this.kbaQuestions}"
				@cancel="${() => this._cancelledSecurityQuestions()}"
				@skip="${() => this._skippedSecurityQuestions()}"
				@verified="${() => this._verifiedViaSecurityQuestions()}"
				@failed="${() => this._failedKBA()}"
				@service-failure="${() => this._sqServiceFailure()}">
			</horizon-verify-kba>`
		: html``;
	}
}
window.customElements.define(`horizon-verify-caller`, VerifyCaller);