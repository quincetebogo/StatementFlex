import { Configuration, EventAggregator, Logger } from 'platform/core';
import { HorizonChannelService } from 'app/services/HorizonChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { HttpStatusError } from 'platform/errors/HttpStatusError';

export const DEFAULT_AUTO_RETRIES = 3;

/**
 * This is a base class for Horizon Service Classes that utilize the Horizon Channel Service.
 * 
 * This class makes the HorizonChannelService (Resource Access) available to derived classes.
 * 
 *  The class provides a method to wrap web service calls in error
 *  handling logic. 
 *
 *  The default error handler may be overridden by providing a 
 *  general error handler in the class constructor.
 * 
 *  The general error handler and default error handler may
 *  be overridden by providing a specific error handler on 
 *  the call methods.
 * 
 * @deprecated Derive from the ChannelServiceBase class instead
 */
export class ServiceBase {
	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Creates an instance of ServiceBase.
	 * @param {Function} toggleBusyFunc A function that can be used to toggle a busy indicator on/off
	 * @param {Function} [defaultErrorHandlerFunc=null] An error handler function that will be invoked when a Channel Service Method fails
	 * @memberof ServiceBase
	 */
	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		this.channelService = HorizonChannelService.getInstance();

		this._eventAggregator = EventAggregator.getInstance();
		this._logger = Logger.getInstance();

		this._toggleBusyFlag = toggleBusyFunc;
		this._defaultErrorHandler = defaultErrorHandlerFunc;
		this.logRequestResponseModels = null;
		this.horizonStore = HorizonStore.getInstance();
	}

	
	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	  * @typedef {Object} ReturnValue
	  * @property {boolean} succeeded - Indicates if the service call succeeded
	  * @property {object} result - The result of the service call if succeeded is true
	  * @property {string} correlationId - The correlation ID from any exception that was raised
	*/

	/**
	 * @deprecated Use the new ChannelServiceBase class instead of this ServiceBase class!
	 * 
	 * @param {Promise<*>} channelServiceCallFunc A Promise that returns the result of a channel service call
	 * @param {string} caller The method name of the channel service call being invoked (for logging purposes)
	 * @param {function} [errorHandlerFunc=null] An error handler to invoke should the web service call fail
	 * @param {number} [maxAttempts=3] The number of attempts to retry a service call before invoking the error handler
	 * @param {string} [correlationId] CorrellationId for tracing the call in logs
	 * @returns {Promise<ReturnValue>} A promise for the return value of the completed web service call
	 * @memberof ServiceBase
	 */
	async wrapCall(channelServiceCallFunc, caller, errorHandlerFunc = null, maxAttempts = 3) {
		const returnValue = {
			succeeded: false,
			result: null,
			correlationId: null
		};
	
		if (this.logRequestResponseModels === null) {
			this.logRequestResponseModels = await Configuration.getInstance().getSetting(`LogRequestResponseModels`);
		}

		let tryCount = 0;
	
		while (!returnValue.succeeded && tryCount < maxAttempts) {
			try {
				tryCount++;
	
				this._toggleBusyFlag();
		
				// we want each attempt to be sequential so disable es-lint warning
				// eslint-disable-next-line no-await-in-loop
				returnValue.result = await channelServiceCallFunc;
				returnValue.succeeded = true;

			} catch (exception) {
				this._logException(exception);

				if (exception instanceof HttpStatusError) {
					switch (exception.status) {
						case 400: // Bad Request
						case 401: // Unauthorized
						case 403: // Forbidden 
						case 404: // Not Found
						case 424: // Dependency error
						case 501: // Not implemented
							tryCount = maxAttempts; // Fail immediately, no retries
							break;

						default:
							// Do nothing
							break;
					}
				} else {
					tryCount = maxAttempts; // Fail immediately, no retries
				}

				if (tryCount >= maxAttempts) {
					returnValue.correlationId = exception.correlationId;
					returnValue.exception = exception;
					this._handleException(errorHandlerFunc, exception);
				}
			} finally {
				this._toggleBusyFlag();
			}
		}

		return returnValue;
	}
	
	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	_logException(exception) {
		let message = `${exception.message}, Url=${exception.requestUrl}`;

		if (this.logRequestResponseModels) {
			message += exception.requestModel ? `, request=${JSON.stringify(exception.requestModel)}` : ``;
			message += exception.output ? `, output=${JSON.stringify(exception.output)}` : ``;
		}

		if (exception instanceof TypeError) {
			this._logger.log(`error`, message, exception.requestCaller, exception.correlationId);
		} else if (exception instanceof HttpStatusError) {
			this._logger.log(`error`, `${exception.status}: ${message}`, exception.requestCaller, exception.correlationId);
		} else {
			this._logger.log(`error`, message, exception.requestCaller, exception.correlationId);
		}
	}
	
	_handleException(errorHandler, exception) {
		let handled = false;
	
		if (errorHandler !== null) {
			// Call any error handler attached to the method invoking the service call
			handled = errorHandler(exception);
		}
	
		// Call any error hander attached to the class invoking the service call
		if (!handled && this._defaultErrorHandler !== null) {
			handled = this._defaultErrorHandler(exception);
		}
	
		if (!handled) {
			throw exception;
		};
	}
}