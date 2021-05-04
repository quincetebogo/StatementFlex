import { Store } from 'platform/core';

/**
 * TelemetryStore implements separate state management for Telemetry. This has different lifetime 
 * rules from the main Horizon state store. Keeping the state management separate makes this 
 * easier to manage.
 */
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

	getTelemetryDetails() {
		const state = this.getState();
		return state && state.telemetryDetails;
	}

	setTelemetryDetails(telemetryDetails) {
		this.setState({ telemetryDetails: telemetryDetails }, `TELEMETRY-ADD`);
	}
}