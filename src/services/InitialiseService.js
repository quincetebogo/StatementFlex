import { HorizonChannelService } from './HorizonChannelService';
import { SecurityContext } from 'platform/SecurityContext';
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

	initialise() {

		const serviceCallHelper = new ServiceCallHelper(() => {
			this._toggleBusyFlag();
		},
			(ex) => this.landingPageErrorHandler(ex, `inilialise service`)
		);

		return serviceCallHelper.asyncCall(this.channelService.initialise());
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	landingPageErrorHandler(exception, context) {
		try {
			if (exception instanceof TypeError) {
				const event = {
					from: `UI-CS`,
					status: `error`,
					message: `${context}: ${exception.message}`
				};
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			} else if (exception instanceof HttpStatusError) {
				const event = {
					from: `UI-CS`,
					status: `error`,
					message: `${context}: ${exception.status} - ${exception.message}`
				};
				console.log(exception.message);
				console.log(exception.output);
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			} else {
				const event = {
					from: `UI-CS`,
					status: `error`,
					message: `${context}: UNEXPECTED ERROR - ${exception.message}`
				};
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
		} finally {
			// Just a flag to inform _dispatchCall that the error was handled.
			this.errorHandled = true;

			// If accept call fails, we will be stuck on the landing page and unable to take calls unless
			// we flag the call that we tied to take as complete...
			this.desktopAgentService.callComplete();
		}

		return true;
	}
}