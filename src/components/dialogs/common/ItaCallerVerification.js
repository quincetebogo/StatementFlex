import { Configuration, Logger } from 'platform/core';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonSignalRClient } from 'app/shell/HorizonSignalRClient';


/**
* The Horizon ItaCallerVerification class is used to allow ITA verification logic to be reusable when the client is verified via ITA.
*/
export class ItaCallerVerification {

	// --------------
	// INITIALISATION
	// --------------

	constructor(verificationStatusCallback, toggleBusyCallback, timeout = 70, maxItaAttempts = 3) {
		this.seconds = timeout;
		this.verificationStatusCallback = verificationStatusCallback;

		this.cifNumber = null;
		this.itaTimer = null;
		this.maxItaAttempts = maxItaAttempts;
		this.attempt = 0;

		this.configuration = Configuration.getInstance();
		this.logger = Logger.getInstance();

		this.callHandleService = new CallHandleService(() => toggleBusyCallback());
	}

	async initiateItaVerification(cifNumber) {
		// Resetting the attempt count if using a new cifNumber
		if (cifNumber !== this.cifNumber) {
			this.attempt = 0;
		}

		this.cifNumber = cifNumber;

		const signalRUrl = await this.configuration.getSetting(`signalRUrl`);

		if (signalRUrl === ``) {
			this.logger.log(`warn`, `ITA is not configured`, `_initiateItaVerification`);
			return false;
		}

		if (this.attempt > this.maxItaAttempts) {
			this.logger.log(`error`, `Cannot initiate ITA - maximum number of attempts exceeded`, `_initiateItaVerification`);
			return false;
		}

		if (this.horizonSignalRClient) {
			this.logger.log(`warn`, `ITA connection is already started, a new connection will not be started`, `_initiateItaVerification`);
			return false;
		}

		this.logger.log(`info`, `Initiating ITA verification`, `_initiateItaVerification`);
		this.horizonSignalRClient = HorizonSignalRClient.getInstance();

		const connectionID = await this._initialiseSignalR();
		
		let itaNotificationSent = false;
		if (connectionID) {
			itaNotificationSent = await this._itaServiceCall(connectionID);
		};
		
		if (!itaNotificationSent) {
			this._cleanupSignalRConnection();
			return false;
		}

		return true;
	}

	async close() {
		await this._stopTimer();
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
			cifNumber: this.cifNumber,
			connectionID: connectionID
		};

		const returnValue = await this.callHandleService.itaVerification(request, (ex) => this._itaErrorHandler(ex));

		if (returnValue.succeeded) {
			this.logger.log(`info`, `ITA verification request successfully initiated`, `_itaServiceCall`);

			this.attempt++;

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

		this.itaTimer = setInterval(async () => {
			this.seconds--;

			if (this.seconds <= 0) {
				
				await this._stopTimer();
				
				this.verificationStatusCallback(`timeout`, this.attempt);
			}
		}, 1000);
	}

	async _stopTimer() {
		await this._cleanupSignalRConnection();

		if (this.itaTimer) {
			clearInterval(this.itaTimer);
			this.itaTimer = null;
			this.logger.log(`info`, `ITA timer stopped`, `VerifyCaller`);
		}
	};
	
	async _signalRPostEventAction(verificationStatus) {
		this.logger.log(`info`, `ITA verification event received. Status=${verificationStatus}`, `_signalRPostEventAction`);

		await this._stopTimer();

		if (this._isVerified(verificationStatus)) {
			this.verificationStatusCallback(`verified`, this.attempt);
			return;
		}
		
		this.verificationStatusCallback(`unverified`, this.attempt);
	}

	async _cleanupSignalRConnection() {
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
}