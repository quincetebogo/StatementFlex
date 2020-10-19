import { EventAggregator } from 'platform/EventAggregator';
import { HttpStatusError } from 'platform/errors/HttpStatusError';

/**
 *  Helper class for handling errors when making web service calls. 
 *
 *  The class provides a method to wrap web service calls in error
 *  handling logic. A default error handler is provided that causes
 *  errors to be displayed on the status bar.
 *
 *  The default error handler may be overridden by providing a 
 *  general error handler in the class constructor.
 * 
 *  The general error handler and default error handler may
 *  be overridden by providing a specific error handler on 
 *  the call methods.
 */
export class ServiceCallHelper {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Constructor
	 * 
	 * @param {*} toggleBusyFunc - A function that can be called to toggle a busy indicator
	 * @param {*} generalErrorHandler - An error handling function to use in place of the default handler
	 * @param {*} disableDefaultErrorHandler - Disable the default error handler that sends notification messages to the Horizon Status Bar
 	 */
	constructor(toggleBusyFunc, generalErrorHandler = null, disableDefaultErrorHandler = false) {
		this.toggleBusyFlag = toggleBusyFunc;
		this.generalErrorHandler = generalErrorHandler;
		this.disableDefaultErrorHandler = disableDefaultErrorHandler;
		this.eventAggregator = EventAggregator.getInstance();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/*
	 *  Web Service Call Wrapper function that provides error handling. By default errors
	 *  are sent to the Application's status bar by publishing a 'horizon-status-bar-update'
	 *  event. 
	 * 
	 * @param {*} serviceCall - A function that calls a web service
	 * @param {*} errorHandler - An optional error handler to override the default and general error handlers
	 */
	async asyncCall(serviceCall, errorHandler = null) {
		const returnValue = {
			succeeded: true,
            result: null
		};

		try {
			this._clearError();
			this.toggleBusyFlag();

			returnValue.result = await serviceCall;

			return returnValue;
		} catch (exception) {
			this._handleException(errorHandler, exception);
		} finally {
			this.toggleBusyFlag();
		}

		returnValue.succeeded = false;
		return returnValue;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------
	_clearError() {
		if (!this.disableDefaultErrorHandler) {
			this.eventAggregator.publish(`horizon-status-bar-update`, { from: `UI-CS`, status: `success`, message: `` });
		}
	}

	_handleException(errorHandler, exception) {
		let handled = false;

		if (errorHandler !== null) {
			// Call any error handler attached to the method invoking the service call
			handled = errorHandler(exception);
		}

		// Call any error hander attached to the class invoking the service call
		if (!handled && this.generalErrorHandler !== null) {
			handled = this.generalErrorHandler(exception);
		}

		if (!handled && !disableDefaultErrorHandler) {
			// Call the default error handler
			handled = this._defaultErrorHandler(exception);
		}

		// Throw an exception if none of the error handlers handled the error.
		if (!handled) {
			throw exception;
		};
	}

	_defaultErrorHandler(exception) {
		if (exception instanceof TypeError) {
			const event = {
				from: `UI-CS`,
				status: `error`,
				message: exception.message
			};
			this.eventAggregator.publish(`horizon-status-bar-update`, event);
			return true;
		} else if (exception instanceof HttpStatusError) {
			const event = {
				from: `UI-CS`,
				status: `error`,
				message: `${exception.status}: ${exception.message}`
			};
			this.eventAggregator.publish(`horizon-status-bar-update`, event);
			return true;
		}

		const event = {
			from: `UI-CS`,
			status: `error`,
			message: `UNEXPECTED ERROR: ${exception.message}`
		};

		this.eventAggregator.publish(`horizon-status-bar-update`, event);
		return false;
	}
}