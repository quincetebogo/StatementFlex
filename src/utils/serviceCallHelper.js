import { EventAggregator } from 'platform/EventAggregator';
import { HttpStatusError } from 'platform/errors/HttpStatusError';
import { Logger } from 'platform/core';

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
		this.logger = Logger.getInstance();
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
	async asyncCall(serviceCall, methodName, errorHandler = null, autoRetries = 3) {
		const returnValue = {
			succeeded: true,
            result: null
		};

		let tryCount = 0;

		while (tryCount < autoRetries) {
			try {
				tryCount++;

				this.toggleBusyFlag();
	
				// eslint-disable-next-line no-await-in-loop
				returnValue.result = await serviceCall;
	
				return returnValue;
			} catch (exception) {
				this._logException(exception, methodName);
				if (tryCount >= autoRetries) {
					this._handleException(errorHandler, exception);
				}
			} finally {
				this.toggleBusyFlag();
			}
		}


		returnValue.succeeded = false;
		return returnValue;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_logException(exception, methodName) {
		if (exception instanceof TypeError) {
			this.logger.log(`error`, exception.message, methodName, exception.correlationId);
		} else if (exception instanceof HttpStatusError) {
			this.logger.log(`error`, `${exception.status}: ${exception.message}`, methodName, exception.correlationId);
		} else {
			this.logger.log(`error`, exception.message, methodName, exception.correlationId);
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

		if (!handled && !this.disableDefaultErrorHandler) {
			// Call the default error handler
			handled = this._defaultErrorHandler(exception);
		}

		// Throw an exception if none of the error handlers handled the error.
		if (!handled) {
			throw exception;
		};
	}

	_defaultErrorHandler(exception) {
		return false;
	}
}