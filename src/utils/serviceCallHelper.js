import { EventAggregator } from 'platform/EventAggregator';
import { HttpStatusError } from 'platform/errors/HttpStatusError';

export class ServiceCallHelper {


	constructor(toggleBusyFunc, generalErrorHandler = null) {
		this.toggleBusyFlag = toggleBusyFunc;
		this.generalErrorHandler = generalErrorHandler;
		this.eventAggregator = EventAggregator.getInstance();
	}

	async makeCall(serviceCall, errorHandler = null) {
		try {
			console.log("In makeCall");

			this._clearError();
			this.toggleBusyFlag();

			console.log("Making service call");
			let result = await serviceCall;
			console.log("Made service call");
			return result;
		}
		catch (exception) {
			console.log("Service call failed");
			let handled = false;

			if (errorHandler !== null) {
				handled = errorHandler(exception);
			}
			else if (this.generalErrorHandler !== null) {
				handled = this._defaultErrorHandler(exception);
			} else {
				handled = this._defaultErrorHandler(exception);
			}

			if (!handled) {
				throw (exception);
			}
		}
		finally {
			console.log('Leaving makeCall');
			this.toggleBusyFlag();
		}

		console.log('make Call returning null - should it do this?');
		return null;
	}

	_clearError() {
		this.eventAggregator.publish(`horizon-status-bar-update`, { from: 'UI-CS', status: 'success', message: '' });
	}

	_defaultErrorHandler(exception) {
		if (exception instanceof TypeError) {
			let event = {
				from: 'UI-CS',
				status: "error",
				message: exception.message
			}
			this.eventAggregator.publish(`horizon-status-bar-update`, event);
			return true;
		}
		else if (exception instanceof HttpStatusError) {
			let event = {
				from: 'UI-CS',
				status: "error",
				message: `${exception.status}: ${exception.message}`
			}
			this.eventAggregator.publish(`horizon-status-bar-update`, event);
			return true;
		}
		else {
			let event = {
				from: 'UI-CS',
				status: "error",
				message: `UNEXPECTED ERROR: ${exception.message}`
			}
			this.eventAggregator.publish(`horizon-status-bar-update`, event);
			return true;
		}
	}
}
