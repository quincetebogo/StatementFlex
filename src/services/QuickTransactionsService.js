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

    sendProofOfAccount(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
        return this.wrapCall(this.channelService.sendProofOfAccount(clientInfo), `sendProofOfAccount`, errorHandler, autoRetries);
    }

    viewProofOfAccount(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
        return this.wrapCall(this.channelService.viewProofOfAccount(clientInfo), `viewProofOfAccount`, errorHandler, autoRetries);
    }
}