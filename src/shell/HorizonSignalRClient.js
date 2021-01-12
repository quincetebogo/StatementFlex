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
			useAuthentication: true,
			keepAlive: true
		});

		this.version = `v1`;
	}

	startConnection() {
		return super.startConnection();
	}

	stopConnection() {
		return super.stopConnection();
	}

	async registerHandler(callback) {
		await super.on(`ita-verification-status`, async (verificationStatus) => {
			
			return callback(verificationStatus);
		});
	}

}