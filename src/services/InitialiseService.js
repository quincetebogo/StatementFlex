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

		this.isBusy = false;
		this.errorHandled = false;

		if (this.instance) {
			return this.instance;
		}

		this.channelService = HorizonChannelService.getInstance();
	}

	static get properties() {
		return {
			isBusy: { type: Boolean },
			errorHandled: { type: Boolean }
		};
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