import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';

/**
 * AccessChannelService is used to get the status of the access channels 
 *
 * @export
 * @class AccessChannelService
 * @extends {ServiceBase}
 */
export class AccessChannelService extends ServiceBase {

	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, errorHandler = null) {
		super(toggleBusyFunc, errorHandler);

	}

	accessChannelStatus(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.accessChannel(cifNumber), `accessChannelStatus`, errorHandler, autoRetries);
	}

}