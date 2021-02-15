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

	cardLimitsLanding(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.cardLimitsLanding(clientInfo), `cardLimitsLanding`, errorHandler, autoRetries);
	}

	getCardLimits(clientInfo = null, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.getCardLimits(), `getCardLimits`, errorHandler, autoRetries);
	}
}