import { ServiceBase } from 'app/services/ServiceBase';

/**
 * Channel Service Methods for Quick Transactions
 *
 * @export
 * @class QuickTransactionsService
 * @extends {ServiceBase}
 */
export class QuickTransactionsService extends ServiceBase {
	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, errorHandler = null) {
		super(toggleBusyFunc, errorHandler);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	favouritesLanding(clientInfo, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.favouritesLanding(clientInfo), errorHandler);
	}
}