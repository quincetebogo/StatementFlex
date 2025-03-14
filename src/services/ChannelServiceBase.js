import { Configuration, Logger, Security, Service } from 'platform/core';
import { HttpStatusError } from 'platform/core/errors/HttpStatusError';
import { v4 } from 'uuid';

export const DEFAULT_AUTO_RETRIES = 3;

/**
 * This is a base class for Horizon Channel Service classes. Each class that
 * interfaces to a channel service or microservice should derive from this class.
 
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
export class ChannelServiceBase extends Service {

	/**
	  * @typedef {Object} ReturnValue
	  * @property {boolean} succeeded Indicates if the service call succeeded
	  * @property {object} result The result of the service call if succeeded is true
	  * @property {string} correlationId The correlation ID from any exception that was raised
	  * @property {Object} [exception] The exception object if an exception was raised
	*/

	/**
	 * @callback errorHandlerCallback
	 * @param {object} exception - The exception from the failing service call
	 */

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Creates an instance of ChannelServiceBase.
	 * @param {Function} toggleBusyFunc A function that can be used to toggle a busy indicator on/off
	 * @param {errorHandlerCallback} [defaultErrorHandlerFunc=null] An error handler function that will be invoked when a Channel Service Method fails
	 * @param {string} baseUrlKey The key in the configuratikon file for the base URL of the service
	 * @param {String} serviceName The name of the channel service/microservice
	 * @param {String} version The version of the service
	 * @param {Function} mockLoadFunc Function that returns a dynamically imported module
	 */
	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null, baseUrlKey, serviceName, version, mockLoadFunc) {
		super({
			baseUrlKey: baseUrlKey,
			name: serviceName
		});

		this._version = version;
		this._mocking = null;
		this._mock = null;

		this._configuration = Configuration.getInstance();
		this._logger = Logger.getInstance();
		this._toggleBusyFlag = toggleBusyFunc;
		this._defaultErrorHandler = defaultErrorHandlerFunc;
		this._mockLoadFunc = mockLoadFunc;
		this.logRequestResponseModels = null;
	}


	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Wraps the platform's post method
	 * 
	 *    - Debug logging is added over the platform's post capability
	 *    - A correlation id is generated for purposes of tracing calls through the UI and CS logs.
	 *
	 * @param {string} url The Channel Service URL
	 * @param {Object} model The request model
	 * @param {Object} customHeaders Any custom headers
	 * @param {string} caller The name of the method for logging purposes
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {AbortController} [controller=null] The abort controller used to cancel file uploads, i.e. only works with FormData as model type.
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
	 * @param {errorHandlerCallback} [errorHandlerFunc=null] An error handler to invoke should the web service call fail
	 * @param {number} [maxAttempts=3] The number of attempts to retry a service call before invoking the error handler
	 * 
	 * @returns {Promise<*>} The response of the Channel Service Request
	*/
	post(url, model, customHeaders, caller, isBinary = false, controller, sla = null, timeout = null, errorHandlerFunc = null, maxAttempts = DEFAULT_AUTO_RETRIES) {
		return this._wrapCall(
			this._post(url, model, customHeaders, caller, isBinary, controller, sla, timeout),
			errorHandlerFunc,
			maxAttempts
		);
	}

	/**
	 * Wrap's the platform's get method
	 *
	 *    - Debug logging is added over the platform's get capability
	 *    - A correlation id is generated for the purposes of tracing calls through the UI and CS logs
	 * 
	 * @param {string} url The Channel Service URL
	 * @param {Object} customHeaders Any custom headers
	 * @param {string} caller The name of the method for logging purpose
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
	 * @param {errorHandlerCallback} [errorHandlerFunc=null] An error handler to invoke should the web service call fail
	 * @param {number} [maxAttempts=3] The number of attempts to retry a service call before invoking the error handler
	 * 
	 * @returns {Promise<*>} The response of the Channel Service REquest
	 */
	get(url, customHeaders, caller, isBinary = false, sla = null, timeout = null, errorHandlerFunc = null, maxAttempts = DEFAULT_AUTO_RETRIES) {
		return this._wrapCall(
			this._get(url, customHeaders, caller, isBinary, sla, timeout),
			errorHandlerFunc,
			maxAttempts
		);
	}

	put(url, model, customHeaders, caller, isBinary, controller, sla, timeout, errorHandlerFunc = null, maxAttempts = DEFAULT_AUTO_RETRIES) {
		return this._wrapCall(
			this._put(url, model, customHeaders, caller, isBinary, controller, sla, timeout),
			errorHandlerFunc,
			maxAttempts
		);
	}

	/**
	 * The X-User-Token is required by some calls where the Product Services/Capabilities services 
	 * makes calls to OpenBancs 2/Way Gate in order to retreive the agent's BANCS/SBL teller number
	 *
	 * @returns {object} The X-User-Token custom header object
	 * @memberof HorizonChannelService
	 */
	setToken() {
		return {
			"X-User-Token": Security.getInstance().token
		};
	}

	/**
	 * The custom headers for the invoice headers
	 * @returns {object} The custom headers for the invoice headers
	 */
	invoiceHeaders() {
		return {
			'Accept': `application/pdf`,
			'Authorization': `Bearer ${Security.getInstance().token}`
		};
	}

	/**
	 * Determine if mocking is enabled for the specified method
	 *
	 * @param {string} mockName Mock name/method name in the config.json file
	 * @returns {Promise<boolean>} A promise for a boolean that is true if the mock is enabled
	 * @memberof HorizonChannelService
	 */
	async isMockEnabled(mockName) {
		if (this._mocking === null) {
			try {
				this._mocking = await this._configuration.getSetting(`mock`);

				// Disable mocking in the SLDC environments. Only for local development
				if (this._inSdlc()) {
					this._mocking = { enabled: false };
					this._logger.log(`info`, `Channel Service Mocking has been automatically disabled as the application is not running locally.`, `_mockEnabled`);
				}
			} catch {
				// disable mocking if the setting is not present
				this._mocking = { enabled: false };
				this._logger.log(`info`, `Channel Service Mocking has been automatically disabled as no configuration is present.`, `_mockEnabled`);
			}

			if (!this._mocking.enabled) {
				return false;
			}

			if (!this._mockLoadFunc) {
				this._logger.log(`info`, `No mock load function provided for mock "${mockName}"`, `_mockEnabled`);
				return false;
			}

			if (typeof this._mockLoadFunc !== `function`) {
				this._logger.log(`info`, `Value provided for "mockLoadFunc" is not a function. Mocking disabled for "${mockName}"`, `_mockEnabled`);
				return false;
			}

			// Dynamically load the configured mocks
			this._logger.log(`info`, `Channel Service Mocking is enabled.`, `_mockEnabled`);
			const module = await this._mockLoadFunc();

			if (!Object.prototype.hasOwnProperty.call(module, `default`)) {
				this._logger.log(`info`, `Mocking module does not export a default object`, `_mockEnabled`);
			}

			this._mock = new module.default();
			const defaultObjectProtoType = Object.getPrototypeOf(this._mock);

			if (!Object.prototype.hasOwnProperty.call(defaultObjectProtoType, `initialise`)) {
				this._logger.log(`info`, `Mocking class does not contain an initialise function`, `_mockEnabled`);
			}
			
			await this._mock.initialise(this._mocking, (mockObj, mockFuncName, doImport) => this._loadMockModule(mockObj, mockFuncName, doImport));
		}


		// Check if mocking is switched off globally
		if (!this._mocking.enabled) {
			return false;
		}

		// Check if specified mock is configured and enabled
		if (Object.prototype.hasOwnProperty.call(this._mocking, mockName)) {
			return this._mocking[mockName].enabled;
		}

		return false;
	}

	/**
	 * Functions in mock classes should be called via the mock function. The mock function
	 * wraps the return value in a similar fashion to the get/post functions on this class.
	 * 
	 * @param {*} funcName  The mock function name
	 * @param  {...any} funcArgs Parameters for the mock function
	 * @returns {Promise<*>} The response of the mock request
	 */
	mock(funcName, ...funcArgs) {
		// Guard: If the caller forgets to check if mocks are enabled and calls this in the SDLC environment
		// just fail outright.
		if (this._inSdlc()) {
			this._logger.log(`fatal`, `Cannot invoke a mock ${funcName} in an SDLC environment`, `mock`);
			throw new Error(`Cannot invoke mock ${funcName} in an SDLC environment`);
		}

		return this._wrapCall(this._mock[funcName](...funcArgs));
	}

	/**
	 * Functions that override the error handling function in mock classes should be called via the mock with 
	 * error handler function. The mock function wraps the return value in a similar fashion to the get/post 
	 * functions on this class.
	 * 
	 * @param {*} funcName  The mock function name
	 * @param {errorHandlerCallback} [errorHandlerFunc=null] An error handler to invoke should the web service call fail
	 * @param  {...any} funcArgs Parameters for the mock function
	 * @returns {Promise<*>} The response of the mock request
	 */
	mockWithErrorHandler(funcName, errorHandlerFunc = null, ...funcArgs) {
		// Guard: If the caller forgets to check if mocks are enabled and calls this in the SDLC environment
		// just fail outright.
		if (this._inSdlc()) {
			this._logger.log(`fatal`, `Cannot invoke a mock ${funcName} in an SDLC environment`, `mock`);
			throw new Error(`Cannot invoke mock ${funcName} in an SDLC environment`);
		}

		return this._wrapCall(this._mock[funcName](...funcArgs), errorHandlerFunc);
	}

	_inSdlc() {
		return this._configuration.config.runtime.environment !== `LOCAL` && this._configuration.config.runtime.environment !== `DEV`;
	}

	/**
	 * Load a mocking module if it has not yet been loaded
	 *
	 * @param {object} mockObj A module object, if undefined or falsy a new module object will be returned
	 * @param {string} mockName A name of a mock in the config.json file
	 * @param {function} doImport function for importing the mocking module
	 * @returns {object} The loaded module
	 * @memberof HorizonChannelServiceMocks
	 */
	_loadMockModule(mockObj, mockName, doImport) {
		if (!mockObj) {
			if (Object.prototype.hasOwnProperty.call(this._mocking, mockName)) {
				if (this._mocking[mockName].enabled) {
					return doImport();
				}
			} else {
				this._mocking[mockName] = { enabled: false };
			}
		}
		return mockObj;
	}

	/**
	 *
	 *
	 * @param {Promise<*>} channelServiceCallFunc A Promise that returns the result of a channel service call
	 * @param {errorHandlerCallback} [errorHandlerFunc=null] An error handler to invoke should the web service call fail
	 * @param {number} [maxAttempts=3] The number of attempts to retry a service call before invoking the error handler
	 * @returns {Promise<ReturnValue>} A promise for the return value of the completed web service call
	 * @memberof ServiceBase
	 */
	async _wrapCall(channelServiceCallFunc, errorHandlerFunc = null, maxAttempts = 3) {
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
					if (Object.prototype.hasOwnProperty.call(exception, `correlationId`)) {
						returnValue.correlationId = exception.correlationId;
					}

					returnValue.exception = exception;

					this._handleException(errorHandlerFunc, exception);
				}
			} finally {
				this._toggleBusyFlag();
			}
		}
		return returnValue;
	}

	/**
	 * Wraps the platform's post method
	 * 
	 *    - Debug logging is added over the platform's post capability
	 *    - A correlation id is generated for purposes of tracing calls through the UI and CS logs.
	 *
	 * @param {string} url The Channel Service URL
	 * @param {Object} model The request model
	 * @param {Object} customHeaders Any custom headers
	 * @param {string} caller The name of the method for logging purposes
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {AbortController} [controller=null] The abort controller used to cancel file uploads, i.e. only works with FormData as model type.
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
	 * 
	 * @returns {Promise<*>} The response of the Channel Service Request
	 * @memberof HorizonChannelService
	 */
	async _post(url, model, customHeaders, caller, isBinary, controller, sla, timeout) {
		const correlationId = v4();

		this._logger.log(`debug`, `url: ${url}, body: ${JSON.stringify(model).substring(0, 19000)}`, caller, correlationId);

		try {
			const response = await super.httpClient.request({
				method: `POST`,
				url: url,
				model: model,
				customHeaders: customHeaders,
				correlationId: correlationId,
				isBinary: isBinary,
				controller: controller,
				sla: sla,
				timeout: timeout,
				caller: caller
			});

			this._logger.log(`debug`, `result: ${JSON.stringify(response).substring(0, 19000)}`, caller, correlationId);

			return response;
		} catch (exception) {
			exception.requestUrl = url;
			exception.requestModel = model;
			exception.requestCaller = caller;
			throw exception;
		}
	}

	/**
	 * Wrap's the platform's get method
	 *
	 *    - Debug logging is added over the platform's get capability
	 *    - A correlation id is generated for the purposes of tracing calls through the UI and CS logs
	 * 
	 * @param {string} url The Channel Service URL
	 * @param {Object} customHeaders Any custom headers
	 * @param {string} caller The name of the method for logging purpose
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
	 * 
	 * @returns {Promise<*>} The response of the Channel Service REquest
	 * @memberof HorizonChannelService
	 */
	async _get(url, customHeaders, caller, isBinary = false, sla = null, timeout = null) {
		const correlationId = v4();

		this._logger.log(`debug`, `url: ${url}`, caller, correlationId);

		try {
			const response = await super.httpClient.request({
				method: `GET`,
				url: url,
				customHeaders: customHeaders,
				correlationId: correlationId,
				isBinary: isBinary,
				sla: sla,
				timeout: timeout,
				caller: caller
			});

			this._logger.log(`debug`, `result: ${JSON.stringify(response)}`, caller, correlationId);

			return response;
		} catch (exception) {
			exception.requestUrl = url;
			exception.requestModel = null;
			exception.requestCaller = caller;
			throw exception;
		}
	}

	/**
	 * Wraps the platform's put method
	 * 
	 * - Debug logging is added over the platform's post capability
	 * - A correlation id is generated for purposes of tracing calls through the UI and CS logs.
	 *
	 * @param {string} url The Channel Service URL
	 * @param {Object} model The request model
	 * @param {Object} customHeaders Any custom headers
	 * @param {string} caller The name of the method for logging purposes
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {AbortController} [controller=null] The abort controller used to cancel file uploads, i.e. only works with FormData as model type.
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
	 *
	 * @returns {Promise<*>} The response of the Channel Service Request
	 * @memberof HorizonChannelService
	 */
	async _put(url, model, customHeaders, caller, isBinary, controller, sla, timeout) {
		const correlationId = v4();

		this._logger.log(`debug`, `url: ${url}, body: ${JSON.stringify(model).substring(0, 19000)}`, caller, correlationId);

		try {
			const response = await super.httpClient.request({
				method: `PUT`,
				url: url,
				model: model,
				customHeaders: customHeaders,
				correlationId: correlationId,
				isBinary: isBinary,
				controller: controller,
				sla: sla,
				timeout: timeout,
				caller: caller
			});

			this._logger.log(`debug`, `result: ${JSON.stringify(response).substring(0, 19000)}`, caller, correlationId);

			return response;
		} catch (exception) {
			exception.requestUrl = url;
			exception.requestModel = model;
			exception.requestCaller = caller;
			throw exception;
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_logException(exception) {
		let message = ``;

		if (Object.prototype.hasOwnProperty.call(exception, `message`) || Boolean(exception?.message)) {
			message = `${exception.message}`;
		}

		if (Object.prototype.hasOwnProperty.call(exception, `requestUrl`)) {
			message = `${message}, Url=${exception.requestUrl}`;
		}

		if (this.logRequestResponseModels) {
			message += exception?.requestModel ? `, request=${JSON.stringify(exception.requestModel)}` : ``;
			message += exception?.output ? `, output=${JSON.stringify(exception.output)}` : ``;
		}

		if (exception instanceof TypeError) {
			this._logger.log(`error`, message, exception?.requestCaller, exception?.correlationId);
		} else if (exception instanceof HttpStatusError) {
			this._logger.log(`error`, `${exception.status}: ${message}`, exception?.requestCaller, exception?.correlationId);
		} else {
			this._logger.log(`error`, message, exception?.requestCaller, exception?.correlationId);
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