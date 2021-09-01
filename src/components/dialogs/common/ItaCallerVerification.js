import { Component } from 'platform/elements';
import { HorizonSignalRClient } from 'app/shell/HorizonSignalRClient';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { VerifyCallerEvents } from 'app/constants/telemetry/events/VerifyCaller';
import { CallHandleService } from 'app/services/CallHandleService';


const MAX_ITA_ATTEMPTS = 3;

export class ItaCallerVerification extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Property initialization
		this.renderMode = RENDER_MODE.VERIFY_CALLER;
		this.seconds = ITA_TIMEOUT_SECS;
		this.isBusy = false;

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

	// --------------
	// PROPERTIES
	// --------------
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
	// --------------
	// EVENT HANDLERS
	// --------------
	// --------------
	// PUBLIC METHODS
	// --------------
	// ---------------
	// PRIVATE METHODS
	// ---------------

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
	// ---------
	// RENDERING
	// ---------
}