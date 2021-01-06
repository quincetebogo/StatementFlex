import { EventAggregator } from 'platform/EventAggregator';
import { HorizonChannelService } from './HorizonChannelService';
import { HttpStatusError } from 'platform/errors/HttpStatusError';
import { Logger } from 'platform/core';

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
 */
export class ServiceBase {
	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		this.channelService = HorizonChannelService.getInstance();

		this._eventAggregator = EventAggregator.getInstance();
		this._logger = Logger.getInstance();

		this._toggleBusyFlag = toggleBusyFunc;
		this._defaultErrorHandler = defaultErrorHandlerFunc;
	}

	
	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	  * @typedef {Object} ReturnValue
	  * @property {boolean} succeeded - Indicates if the service call succeeded
	  * @property {object} result - The result of the service call if succeeded is true
	*/

	/**
	 *
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
			result: null
		};
	
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
						case 501: // Not implemented
							tryCount = maxAttempts; // Fail immediately, no retries
							break;

						default:
							// Do nothing
							break;
					}
				}

				if (tryCount >= maxAttempts) {
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

		message += exception.requestModel ? `, request=${JSON.stringify(exception.requestModel)}` : ``;
		message += exception.output ? `, output=${exception.output}` : ``;

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