import { Configuration, Logger } from 'platform/core';
import { HorizonSignalRClient } from 'app/shell/HorizonSignalRClient';
import { ITAChannelService } from 'app/services/ITAChannelService';

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
		this._mocking = null;

		this.mockedResponseTimerId = null;

		// Property initialization
		this.verificationStatusCallback = verificationStatusCallback;
		this.toggleBusyCallback = toggleBusyCallback;

		this.configuration = Configuration.getInstance();
		this.logger = Logger.getInstance();

		this.itaChannelService = new ITAChannelService(() => toggleBusyCallback(), () => true);
	}

	/**
	 * Initiates the ITA verification process. ITA responses will be returned via the callback
	 * passed in the constructor
	 * 
	 * @param {*} cifNumber  the client's CIF number
	 * @returns { Promise<void> } A promise to initiate the ITA process
	 */
	async initiateItaVerification(cifNumber) {
		// Check for ITA mocking on lcoal development machines
		// The _mockingEnabled function will automatically disable mocking in SDLC environments
		if (await this._mockEnabled(`itaVerification`)) {
			const callTime = 800;
			const successTime = callTime + 20000;

			this.toggleBusyCallback();
	
			if (this._positiveMockEnabled()) {
				this.mockedResponseTimerId = setTimeout(() => {
					this.verificationStatusCallback(`verified`);
				}, successTime);
			} else {
				this.mockedResponseTimerId = setTimeout(() => {
					this.verificationStatusCallback(`rejected`);
				}, successTime);
			}
	
			// simulate the CS call taking some time
			await this._sleep(callTime);
	
			this.toggleBusyCallback();
	
			this.verificationStatusCallback(`started`);
	
			return true;
		}

		// Everything is real from this point on... (only mocking code is the above)
		this.close();

		const signalRUrl = await this.configuration.getSetting(`signalRUrl`);

		if (signalRUrl === ``) {
			this.logger.log(`warn`, `ITA is not configured`, `_initiateItaVerification`);
			throw new Error(`ITA is not configured`);
		}

		if (this.horizonSignalRClient) {
			this.logger.log(`warn`, `ITA connection is already started, a new connection will not be started`, `_initiateItaVerification`);
			throw new Error(`ITA connection is already started, a new connection will not be started`);
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
		
		try {
			await this._itaServiceCall(connectionID, cifNumber);
		} catch (error) {
			this._cleanupSignalRConnection();
			throw error;
		}
		
		this.verificationStatusCallback(`started`);
	}

	/**
	 * Closes the connection to the ITA service 
	 * 
	 * @returns { Promise<void> } A promise for the completion of cleanup
	 */
	close() {

		// Mock code to allow cancelling the timer before it has expired
		if (this.mockedResponseTimerId) {
			clearTimeout(this.mockedResponseTimerId);
			this.mockedResponseTimerId = null;
			return true;
		}

		// The real code for cancelling/cleaning up the connection.
		return this._cleanupSignalRConnection();
	}

	// ===============
	// PRIVATE METHODS
	// ===============
	async _initialiseSignalR() {
		try {
			await this.horizonSignalRClient.startConnection();
		} catch (error) {
			this.logger.log(`error`, `Failed to establish ITA Hub Connection`, `_initialiseSignalR`);
			throw new Error(`Failed to establish ITA Hub Connection`);
		}

		try {
			return await this.horizonSignalRClient.getConnectionId();
		} catch (error) {
			this.logger.log(`error`, `Failed to obtain Connection ID`, `_initialiseSignalR`);
			throw new Error(`Failed to obtain Connection ID`);
		}
	}

	async _itaServiceCall(connectionID, cifNumber) {
		try {
			await this.horizonSignalRClient.registerHandler(verificationStatus => this._signalRPostEventAction(verificationStatus));
		} catch (error) {
			this.logger.log(`error`, `Failed to register handler`, `_itaServiceCall`);
			throw new Error(`Failed to register handler`);
		}

		const request = {
			cifNumber: cifNumber,
			connectionID: connectionID
		};

		const returnValue = await this.itaChannelService.itaVerification(request, () => true);

		if (returnValue.succeeded) {
			this.logger.log(`info`, `ITA verification request successfully initiated`, `_itaServiceCall`);
			return;
		} 

		this.logger.log(`error`, `itaVerification channel service call failed`, `_itaServiceCall`, returnValue.correlationId);
		throw new Error(`itaVerification channel service call failed`);
	}
	
	async _signalRPostEventAction(callbackRes) {
		callbackRes = JSON.parse(callbackRes);
		this.logger.log(`info`, `ITA verification event received. Status=${JSON.stringify(callbackRes)}`, `_signalRPostEventAction`);
		const authStatus = callbackRes?.AuthorisationRequestStatus;
		const [reqChannel] = callbackRes?.AuthorisationRequestChannels;
		const channelStatus = reqChannel?.ChannelStatus;
		switch (true) {
			case this._isApproved(authStatus, channelStatus):
				this.verificationStatusCallback(`verified`);
				await this.close();
				break;
			
			case this._isRejected(authStatus, channelStatus):
				this.verificationStatusCallback(`unverified`);
				await this.close();
				break;
			
			case this._isFailed(authStatus, channelStatus):
				this.verificationStatusCallback(`system-failed`);
				await this.close();
				break;
			
			case this._isPINBlocked(authStatus, channelStatus):
				this.verificationStatusCallback(`pin-blocked`);
				await this.close();
				break;
			
			case this._isPending(authStatus):
			default:
				break;
		}
	}

	async _cleanupSignalRConnection() {
		if (!this.horizonSignalRClient) {
			return false;
		}

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

		return true;
	}

	
	_isApproved(authStatus, channelStatus) {
		return authStatus === AUTH_STATUS.APPROVED && channelStatus === AUTH_CHANNEL_STATUS.APPROVED;
	}
	_isRejected(authStatus, channelStatus) {
		return authStatus === AUTH_STATUS.DECLINED && 
			   [AUTH_CHANNEL_STATUS.DECLINED, AUTH_CHANNEL_STATUS.CANCELLED].includes(channelStatus);
	}
	_isPending(authStatus) {
		return authStatus === AUTH_STATUS.PENDING;
	}
	_isFailed(authStatus, channelStatus) {
		return authStatus === AUTH_STATUS.FAILED && 
			   [AUTH_CHANNEL_STATUS.NOT_DELIVERED, AUTH_CHANNEL_STATUS.TIMEOUT, AUTH_CHANNEL_STATUS.SYSTEM_FAILURE].includes(channelStatus);
	}
	_isPINBlocked(authStatus, channelStatus) {
		return authStatus === AUTH_STATUS.FAILED && channelStatus === AUTH_CHANNEL_STATUS.AUTHENTICATION_FAILURE;
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

	_positiveMockEnabled() {
		try {
			if (!Object.prototype.hasOwnProperty.call(this._mocking, `itaVerification`)) {
				return false;
			}

			const itaMockSettings = this._mocking.itaVerification;

			if (Object.prototype.hasOwnProperty.call(itaMockSettings, `positiveCase`)) {
				return itaMockSettings.positiveCase;
			}
		} catch {
			return false;
		}
		
		return false;
	}

	async _mockEnabled(mockName) {
		if (this._mocking === null) {
			try {
				this._mocking = await this.configuration.getSetting(`mock`);

				// Disable mocking in the SLDC environments. Only for local development
				if (this.configuration.config.runtime.environment !== `LOCAL`) {
					this._mocking = { enabled: false };
					this.logger.log(`info`, `ITA mocking has been automatically disabled as the application is not running locally.`, `_mockEnabled`);
				}
			} catch {
				// disable mocking if the setting is not present
				this._mocking = { enabled: false };
				this.logger.log(`info`, `ITA Mocking has been automatically disabled as no configuration is present.`, `_mockEnabled`);
			}

			if (this._mocking.enabled) {
				// Dynamically load the configured mocks
				this.logger.log(`info`, `ITA Mocking is enabled.`, `_mockEnabled`);
			}
		}

		// Check if mocking is switched off globally
		if (!this._mocking.enabled) {
			return false;
		}

		// Check if specified mock is configured and enabled
		if (Object.prototype.hasOwnProperty.call(this._mocking, mockName)) {
			return this._mocking[mockName].enabled;

		}

		return false;
	}
}