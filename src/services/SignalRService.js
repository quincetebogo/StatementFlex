import { SignalRClient } from 'platform/core';

export class SignalRService extends SignalRClient {

	static getInstance() {
		return this.instance || (this.instance = new SignalRService());
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
		return this.startConnection();
	}

	getConnectionID() {
		return this.getConnectionId();
	}

}