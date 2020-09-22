import { HorizonChannelService } from './HorizonChannelService';
import { ServiceCallHelper } from '../utils/serviceCallHelper';

export class InitialiseService {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new InitialiseService());
	}

	constructor() {
		if (this.instance) {
			return this.instance;
		}

		this.channelService = HorizonChannelService.getInstance();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	// --------------
	// PUBLIC METHODS
	// --------------

	initialise(toggleFunc, errorHandler = null) {

		const serviceCallHelper = new ServiceCallHelper(toggleFunc, errorHandler);

		return serviceCallHelper.asyncCall(this.channelService.initialise());
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

}