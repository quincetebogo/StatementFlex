import { EventAggregator } from 'platform/EventAggregator';
import { HttpStatusError } from 'platform/errors/HttpStatusError';
import { isNullorEmpty } from '../utils/channelServiceUtilities';

/**
 *	Helper class for handling errors when making web service calls. 
 *
 *	The class provides a method to wrap web service calls in error
 *	handling logic. A default error handler is provided that causes
 *	errors to be displayed on the status bar.
 *
 * 	The default error handler may be overridden by providing a 
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
	 */
	constructor(toggleBusyFunc, generalErrorHandler = null) {
		this.toggleBusyFlag = toggleBusyFunc;
		this.generalErrorHandler = generalErrorHandler;
		this.eventAggregator = EventAggregator.getInstance();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 *  Web Service Call Wrapper function that provides error handling. By default errors
	 *  are sent to the Application's status bar by publishing a 'horizon-status-bar-update'
	 * 	event. 
	 * 
	 * @param {*} serviceCall - A function that calls a web service
	 * @param {*} errorHandler - An optional error handler to override the default and general error handlers
	 */
	async asyncCall(serviceCall, errorHandler = null) {
		try {
			this._clearError();
			this.toggleBusyFlag();

			let result = await serviceCall;

			if (isNullorEmpty(result)) {
				throw new HttpStatusError("No Content", 204, result);
			}

			return result;
		}
		catch (exception) {
			this._handleException(errorHandler, exception);
		}
		finally {
			this.toggleBusyFlag();
		}

		return null;
	}

	/**
	 *  Web Service Call Wrapper function that provides error handling. By default errors
	 *  are sent to the Application's status bar by publishing a 'horizon-status-bar-update'
	 * 	event. 
	 * 
	 * @param {*} serviceCall - A function that calls a web service
	 * @param {*} errorHandler - An optional error handler to override the default and general error handlers
	 */
	call(serviceCall, resultHandler, errorHandler = null) {
		this._clearError();
		this.toggleBusyFlag();

		serviceCall
			.then((result) => {
				resultHandler(result);
			})
			.catch((exception) => {
				this._handleException(errorHandler, exception);
				return null;
			})
			.finally(() => {
				this.toggleBusyFlag();
			})
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------
	_clearError() {
		this.eventAggregator.publish(`horizon-status-bar-update`, { from: 'UI-CS', status: 'success', message: '' });
	}

	_handleException(errorHandler, exception) {
		let handled = false;
		if (errorHandler !== null) {
			// Call the specific error handler if passed to this method
			handled = errorHandler(exception);
		}
		else if (this.generalErrorHandler !== null) {
			// No specific error handler, then call the general one if passed in the constructor
			handled = this.generalErrorHandler(exception);
		}
		else {
			// Error handlers not overridded, use the default error handler
			handled = this._defaultErrorHandler(exception);
		}
		// Throw an exception if none of the error handlers handled the error.
		if (!handled) {
			throw (exception);
		}
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
