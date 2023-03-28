import { SignalRClient } from 'platform/core';

/**
 * Horizon signalR client
 * 
 * @export
 * @class HorizonSignalRClient
 * @extends {SignalRClient}
 */
export class HorizonSignalRClient extends SignalRClient {

	static getInstance() {
		return this.instance || (this.instance = new HorizonSignalRClient());
	}

	constructor() {
		super({
			baseUrlKey: `signalRUrl`,
			hubName: `itahub`,
			hubType: `eks`,
			useAuthentication: true,
			keepAlive: false
		});

		this.version = `v1`;
		this._connectionId = ``;
	}

	startConnection() {
		super.onConnected(() => this._onConnected());
		return super.startConnection();
	}

	stopConnection() {
		delete this._connectionId; // disposing locally stored connection id
		return super.stopConnection();
	}

	async registerHandler(callback) {
		await super.on(`ita-verification-status`, (verificationStatus) => callback(verificationStatus));
	}

	async deRegisterHandler() {
		await super.off(`ita-verification-status`);
	}

	async getConnectionId() {
		// Try to retrieve from Hubconnector
		this._connectionId = await super.getConnectionId();

		// If connection id retrieved from hub connector is empty get from server
		if (!this._connectionId) {
			console.log(`Invoking ITA Hub`);
			this._connectionId = await super.invoke(`GetConnectionId`);
			console.log(`connectionID: ${this._connectionId}:`);
		}

		return this._connectionId;
	}

	_onConnected(callback = null) {
		// Delete local value for id.
		delete this._connectionId;

		if (typeof callback === `function`) {
			return callback();
		}
	}
}