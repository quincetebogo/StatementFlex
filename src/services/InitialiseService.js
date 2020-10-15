import { ServiceBase } from 'app/services/ServiceBase';

export class InitialiseService extends ServiceBase {

	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, errorHandler = null) {
		super(toggleBusyFunc, errorHandler);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	initialise(errorHandler = null) {

		return this.serviceCallHelper.asyncCall(this.channelService.initialise(), errorHandler);
	}
}