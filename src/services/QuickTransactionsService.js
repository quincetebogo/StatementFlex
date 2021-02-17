import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';

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


	favouritesLanding(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.favouritesLanding(clientInfo), `favouritesLanding`, errorHandler, autoRetries);
	}

	cardLimitsLanding(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.cardLimitsLanding(cifNumber), `cardLimitsLanding`, errorHandler, autoRetries);
	}
}