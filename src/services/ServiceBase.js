import { HorizonChannelService } from './HorizonChannelService';
import { ServiceCallHelper } from '../utils/serviceCallHelper';

/**
 * This is a base class for Horizon Service Classes that utilize the Horizon Channel Service.
 * 
 * This class makes the HorizonChannelService (Resource Access) and the ServiceCallHelper (error handling)
 * available to derived classes.
 */
export class ServiceBase {
	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, errorHandler = null) {
		this.channelService = HorizonChannelService.getInstance();
		this.serviceCallHelper = new ServiceCallHelper(toggleBusyFunc, errorHandler);
	}
}