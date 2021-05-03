import { Store } from 'platform/core';

export class TelemetryStore extends Store {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new TelemetryStore());
	}

	constructor() {
		super({
			name: `horizon-telemetry-store`,
			persistence: `sessionStorage`,
			logStateChanges: false
		});
	}
}