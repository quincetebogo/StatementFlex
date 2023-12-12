import { Logger, SignalRClient } from 'platform/core';

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
		this._remoteIdentifier = ``;

		this.logger = Logger.getInstance();
	}

	get remoteIdentifier() {
		return this._remoteIdentifier;
	}

	set remoteIdentifier(value) {
		this._remoteIdentifier = value;
	}

	startConnection() {
		super.onConnected(() => this._onConnected());
		return super.startConnection();
	}

	async stopConnection() {
		// invoking server func to remove connection id from group, which deletes the group
		if (this._remoteIdentifier) {
			await super.invoke(`DeleteFromGroup`, this._connectionId, this._remoteIdentifier);
			this._remoteIdentifier = ``; // disposing locally stored remote identifier
		}

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
			this._connectionId = await super.invoke(`GetConnectionId`);
		}

		return this._connectionId;
	}

	_onConnected(callback = null) {

		if (this._connectionId) {
			this.logger.log(`warn`, `SignalR reconnection detected. Clearing old id:${this._connectionId}`, `_onConnected`);
		}

		// Delete local value for id.
		delete this._connectionId;

		if (typeof callback === `function`) {
			return callback();
		}
	}
}