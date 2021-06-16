import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';

/**
 * ValueAddedService is used to get the status of the access channels 
 *
 * @export
 * @class ValueAddedService
 * @extends {ServiceBase}
 */
export class ValueAddedService extends ServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, errorHandler = null) {
		super(toggleBusyFunc, errorHandler);

	}

	// --------------
	// PUBLIC METHODS
	// --------------

	getValueAddedServiceStatus(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.getValueAddedService(cifNumber), `getValueAddedServiceStatus`, errorHandler, autoRetries);
	}

	putValueAddedServiceStatus(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.putValueAddedService(request), `putValueAddedServiceStatus`, errorHandler, autoRetries);
	}

}