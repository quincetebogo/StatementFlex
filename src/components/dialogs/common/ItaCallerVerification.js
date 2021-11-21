import { Configuration, Logger } from 'platform/core';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonSignalRClient } from 'app/shell/HorizonSignalRClient';


/*
* The Horizon ItaCallerVerification class is used to allow ITA verification logic to be reusable when the client is verified via ITA.
*/
export class ItaCallerVerification {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * 
	 * @param {*} verificationStatusCallback  A function for returning the verification status
	 * @param {*} toggleBusyCallback A function for toggling a busy status
	 */
	constructor(verificationStatusCallback, toggleBusyCallback) {

		this.mockResponses = false;

		// Property initialization
		this.verificationStatusCallback = verificationStatusCallback;
		this.toggleBusyCallback = toggleBusyCallback;

		this.configuration = Configuration.getInstance();
		this.logger = Logger.getInstance();

		this.callHandleService = new CallHandleService(() => toggleBusyCallback(), () => true);
	}

	/**
	 * Initiates the ITA verification process. ITA responses will be returned via the callback
	 * passed in the constructor
	 * 
	 * @param {*} cifNumber  the client's CIF number
	 * @returns { Promise<Boolean> } true if the ITA process could be successfully initiated
	 */
	async initiateItaVerification(cifNumber) {

		if (this.mockResponses) {
			this.toggleBusyCallback();
			setTimeout(() => {
				this.verificationStatusCallback(`rejected`);
			}, 20000);

			await this._sleep(2000);

			this.toggleBusyCallback();

			this.verificationStatusCallback(`started`);

			return true;
		}

		this.close();

		const signalRUrl = await this.configuration.getSetting(`signalRUrl`);

		if (signalRUrl === ``) {
			this.logger.log(`warn`, `ITA is not configured`, `_initiateItaVerification`);
			return false;
		}

		if (this.horizonSignalRClient) {
			this.logger.log(`warn`, `ITA connection is already started, a new connection will not be started`, `_initiateItaVerification`);
			return false;
		}

		this.logger.log(`info`, `Initiating ITA verification`, `_initiateItaVerification`);
		this.horizonSignalRClient = HorizonSignalRClient.getInstance();

		let connectionID;

		try {
			this.toggleBusyCallback();
			connectionID = await this._initialiseSignalR();
		} finally {
			this.toggleBusyCallback();
		}
		
		let itaNotificationSent = false;
		if (connectionID) {
			itaNotificationSent = await this._itaServiceCall(connectionID, cifNumber);
		};
		
		if (!itaNotificationSent) {
			this._cleanupSignalRConnection();
			return false;
		}

		this.verificationStatusCallback(`started`);

		return true;
	}

	/**
	 * Closes the connection to the ITA service 
	 * 
	 * @returns { Promise<void> } A promise for the completion of cleanup
	 */
	async close() {
		await this._cleanupSignalRConnection();
	}

	// ===============
	// PRIVATE METHODS
	// ===============
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

	async _itaServiceCall(connectionID, cifNumber) {
		try {
			await this.horizonSignalRClient.registerHandler(verificationStatus => this._signalRPostEventAction(verificationStatus));
		} catch (error) {
			this.logger.log(`error`, `Failed to register handler`, `_itaServiceCall`);
			return false;
		}

		const request = {
			cifNumber: cifNumber,
			connectionID: connectionID
		};

		const returnValue = await this.callHandleService.itaVerification(request, () => true);

		if (returnValue.succeeded) {
			this.logger.log(`info`, `ITA verification request successfully initiated`, `_itaServiceCall`);
			return true;
		} 

		this.logger.log(`error`, `itaVerification channel service call failed`, `_itaServiceCall`, returnValue.correlationId);
		return false;
	}
	
	async _signalRPostEventAction(verificationStatus) {
		this.logger.log(`info`, `ITA verification event received. Status=${JSON.stringify(verificationStatus)}`, `_signalRPostEventAction`);

		await this.close();

		if (this._isVerified(verificationStatus)) {
			this.verificationStatusCallback(`verified`);
			return;
		}

		this.verificationStatusCallback(`unverified`);
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

	_sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}