import { DateTime } from 'luxon';
import { HttpStatusError } from './errors/HttpStatusError.js';
import { MetricProcessor } from './MetricProcessor.js';
import Security from './Security.js';
import { Utilities } from './Utilities.js';
import { v4 } from 'uuid';

/**
 * Helper class for making HTTP requests, that supports the ability to:
 * - Access RESTful APIs.
 * - Retrieve static artifacts (e.g. JSON file with config).
 * - Upload file(s) RESTful APIs, with cancellation support.
 * 
 * ```js 
 * import { HttpClient } from 'platform/core'; 
 * ```
 * 
 * @example
 * HttpClient.getInstance().request({
 *   method: `GET`,
 *   url: `/pets`
 * });
 * 
 */
export class HttpClient {

	/**
	 * @param {Promise<String>|String} [baseUrl] Service base URL, typically that of a Channel Service.
	 * @param {String} [metricContext] Metric context to use, typically provided by a wrapping service.
	 *
	 * @static
	 * @returns {HttpClient} Transient
	 */
	static getInstance(baseUrl, metricContext) {
		return new HttpClient(baseUrl, metricContext);
	}

	/**
	 * @param {Promise<String>|String} [baseUrl] Service base URL, typically that of a Channel Service.
	 * @param {String} [metricContext] Metric context to use, typically provided by a wrapping service.
	 * 
	 * @hideconstructor
	 */
	constructor(baseUrl, metricContext = null) {
		this._baseUrl = baseUrl;
		this._metricContext = metricContext;
	}


	/**
	 * Makes an HTTP request using provided parameters.
	 *
	 * @param {HttpRequest} parameters Parameters object to pass in.
	 * 
	 * @returns {Promise<*>} Promise for the completed HTTP request.
	 */
	request(parameters) {

		if (parameters.sla && !parameters.caller) {
			console.warn(`[HttpClient] ${parameters.method} call to [${parameters.url}] has "sla" specified, ` +
				`but not "caller", please specify for instrumentation purposes.`);
		}

		return this._secureExecute(parameters);
	}

	/**
	 * Makes a HTTP GET request to an URL endpoint.
	 *
	 * @param {String} url Path to the resource to access.
	 * @param {Object} [customHeaders] Custom Header object to append to standard Request Headers.
	 * @param {String} [correlationId=null] Correlation Id for HttpRequest. Auto generated if not provided
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request. 
	 * 
	 * NOTE: When `sla` is specified, `caller` is required.
	 * 
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
	 * @param {String} [caller=null] Name of the calling method, e.g. `this.getPets.name`. NOTE: Required when `sla` is specified.
	 * 
	 * @throws {TypeError} An error if the HTTP call is not made successfully, i.e. "Failed to fetch".
	 * @throws {HttpStatusError} An error if the HTTP response status code is not successful.
	 * 
	 * @returns {Promise<*>} Promise for the completed HTTP request.
	 */
	get(url, customHeaders = null, correlationId = null, isBinary = false, sla = null, timeout = null, caller = null) {
		return this.request({
			method: `GET`,
			url: url,
			customHeaders: customHeaders,
			correlationId: correlationId,
			isBinary: isBinary,
			sla: sla,
			timeout: timeout,
			caller: caller
		});
	}

	/**
	 * Makes a HTTP POST request to an URL endpoint.
	 *
	 * @param {String} url Path to the resource to access.
	 * @param {Object|FormData} [model=null] The content body to send along with the request.
	 * @param {Object} [customHeaders] Custom Header object to append to standard Request Headers.
	 * @param {String} [correlationId=null] Correlation Id for HttpRequest. Auto generated if not provided
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {AbortController} [controller=null] The abort controller used to cancel file uploads, i.e. only works with FormData as model type.
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * 
	 * NOTE: When `sla` is specified, `caller` is required.
	 * 
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
	 * @param {String} [caller=null] Name of the calling method, e.g. `this.addPet.name`. NOTE: Required when `sla` is specified.
	 * 
	 * @throws {TypeError} An error if the HTTP call is not made successfully, i.e. "Failed to fetch".
	 * @throws {HttpStatusError} An error if the HTTP response status code is not successful.
	 * 
	 * @returns {Promise<*>} Promise for the completed HTTP request.
	 */
	post(url, model = null, customHeaders = null, correlationId = null, isBinary = false, controller = null, sla = null, timeout = null, caller = null) {
		return this.request({
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
	}

	/**
	 * Makes a HTTP PUT request to an URL endpoint.
	 *
	 * @param {String} url Path to the resource to access.
	 * @param {Object} [model=null] The content body to send along with the request.
	 * @param {Object} [customHeaders] Custom Header object to append to standard Request Headers.
	 * @param {String} [correlationId=null] Correlation Id for HttpRequest. Auto generated if not provided
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * 
	 * NOTE: When `sla` is specified, `caller` is required.
	 * 
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
	 * @param {String} [caller=null] Name of the calling method, e.g. `this.updatePet.name`. NOTE: Required when `sla` is specified.
	 * 
	 * @throws {TypeError} An error if the HTTP call is not made successfully, i.e. "Failed to fetch".
	 * @throws {HttpStatusError} An error if the HTTP response status code is not successful.
	 * 
	 * @returns {Promise<*>} Promise for the completed HTTP request.
	 */
	put(url, model = null, customHeaders = null, correlationId = null, isBinary = false, sla = null, timeout = null, caller = null) {
		return this.request({
			method: `PUT`,
			url: url,
			model: model,
			customHeaders: customHeaders,
			correlationId: correlationId,
			isBinary: isBinary,
			sla: sla,
			timeout: timeout,
			caller: caller
		});
	}

	/**
	 * Makes a HTTP DELETE request to an URL endpoint.
	 * 
	 * @param {String} url Path to the resource to access.
	 * @param {Object} [customHeaders] Custom Header object to append to standard Request Headers.
	 * @param {String} [correlationId=null] Correlation Id for HttpRequest. Auto generated if not provided
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * 
	 * NOTE: When `sla` is specified, `caller` is required.
	 * 
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
	 * @param {String} [caller=null] Name of the calling method, e.g. `this.deletePet.name`. NOTE: Required when `sla` is specified.
	 * 
	 * @throws {TypeError} An error if the HTTP call is not made successfully, i.e. "Failed to fetch".
	 * @throws {HttpStatusError} An error if the HTTP response status code is not successful.
	 * 
	 * @returns {Promise<void>} Promise for the completed HTTP request.
	 */
	delete(url, customHeaders = null, correlationId = null, sla = null, timeout = null, caller = null) {
		return this.request({
			method: `DELETE`,
			url: url,
			customHeaders: customHeaders,
			correlationId: correlationId,
			sla: sla,
			timeout: timeout,
			caller: caller
		});
	}

	/**
	 * Wrapper method to ensure a valid OAuth 2.0 token is used for the request.
	 * 
	 * @param {HttpRequest} request Request object
	 * 
	 * @private
	 * @returns {Promise<*>} Promise for the resource to retrieve.
	 */
	async _secureExecute(request) {

		// Ensure that the Token is valid, implicitly performs a refresh of the access token, prior to expiration.
		if (Security && Security.isAuthenticated) {
			await Security.ensureValidToken();
		}

		return this._execute(request);
	}

	/**
	 * Executes an HTTP request to a remote endpoint. 
	 * 
	 * NOTE: Do not call this directly, make use of the HTTP wrapper methods, e.g. get(...)
	 * 
	 * @param {HttpRequest} request Request object
	 * 
	 * @throws {TypeError} An error if the HTTP call is not made successfully, i.e. "Failed to fetch".
	 * @throws {AbortError} An error if the HTTP call is aborted due to either:
	 * - File Upload cancellation request.
	 * - Request Timeout
	 * @throws {HttpStatusError} An error if the HTTP response status code is not successful.
	 * 
	 * @private
	 * @returns {Promise<*>} Promise for the completed HTTP request.
	 */
	async _execute(request) {

		if (!request.correlationId) {
			request.correlationId = v4();
		}

		/** @type RequestInit */
		const requestInit = {
			mode: `cors`,
			method: request.method,
			credentials: `same-origin`,
			headers: {
				'Pragma': `no-cache`,
				'Cache-Control': `no-store`,
				'X-Capitec-Correlation-Id': request.correlationId
			}
		};

		if (request.model && request.model instanceof FormData && request.controller) {
			requestInit.signal = request.controller.signal;
		}

		if (!request.model || !(request.model instanceof FormData)) {
			const additionalHeaders = {
				'Accept': `application/json`,
				'Content-Type': `application/json`
			};

			requestInit.headers = {
				...requestInit.headers,
				...additionalHeaders
			};
		}

		// Merging custom headers with request headers.
		if (request.customHeaders) {
			requestInit.headers = {
				...requestInit.headers,
				...request.customHeaders
			};
		}

		// Add OAuth bearer token to headers.
		if (Security && Security.token) {
			requestInit.headers.Authorization = `Bearer ${Security.token}`;
		}

		// Create body for supported operations.
		if (request.method === `POST` || request.method === `PUT`) {
			requestInit.body = this._getBody(request.model);
		}

		let fullUrl = request.url;

		// Check if the full URL to call must be prefixed with a base URL.
		if (this._baseUrl) {
			fullUrl = (Utilities.isPromise(this._baseUrl) ? await this._baseUrl : this._baseUrl) + request.url;
		}

		let start = null;
		let startTimeStamp = null;
		let response = null;
		let output = null;
		let error = null;
		let timeoutSignal = null;
		let timeoutOut = false;

		try {

			// Start metric (security dependant)
			if (this._metricContext &&
				request.sla &&
				window.platform.security) {

				start = performance.now();
				startTimeStamp = DateTime.utc();
			}

			// Check if a timeout was specified.
			if (typeof request.timeout === `number` &&
				request.timeout > 0) {

				// Use AbortController potentially passed in (POST for file uploads) or create a new one.
				const controller = request.controller ? request.controller : new AbortController();
				timeoutSignal = controller.signal;
				requestInit.signal = timeoutSignal;

				setTimeout(() => {
					timeoutOut = true;
					if (!controller.aborted) {
						controller.abort();
					}
				}, request.timeout);
			}

			// Fetch the resource / Make the HTTP request.
			response = this.isLocalFetch(fullUrl, request.method)
				? await this.fetchLocal(fullUrl)
				: await fetch(fullUrl, requestInit);


			// Parse the output.
			output = request.isBinary !== true
				? await this._parseTextOrJson(response)
				: await this._parseBinary(response);

		} catch (e) {
			error = e;
		}

		// End metric (security dependant).
		if (this._metricContext &&
			request.sla &&
			window.platform.security) {

			const end = performance.now();
			const endTimeStamp = DateTime.utc();

			// Send metric to be processed.
			MetricProcessor
				.getInstance(this._metricContext)
				.processMetric({
					context: this._metricContext,
					method: request.caller,
					uri: fullUrl,
					startTimeStamp: startTimeStamp,
					endTimeStamp: endTimeStamp,
					sla: request.sla,
					timeout: request.timeout,
					direction: `Out`,
					duration: end - start,
					ok: response && response.ok,
					httpStatusCode: response && response.status ? response.status : null,
					httpVerb: request.method,
					reference: request.correlationId,
					error: error
				}, timeoutOut);
		}

		// Throw error that resulted in fetch to fail.
		if (error) {
			throw error;
		}

		// Handle 200 - 299 statuses.
		if (response.ok) {
			return output;
		}

		// Throw error for all other statuses.
		throw new HttpStatusError(response.statusText, response.status, output, request.correlationId);
	}

	isLocalFetch(fullUrl, httpMethod) {
		return window.targetSystem && window.targetSystem === `android` && (fullUrl.startsWith(`file:`) || fullUrl.startsWith(`/`)) && httpMethod === `GET`;
	}

	fetchLocal(url) {

		if (url.startsWith(`/`)) {
			url = `${window.baseHRef}${window.baseHRef && window.baseHRef.endsWith(`/`) ? `` : `/`}${url.replace(`/`, ``)}`;
		}

		console.log(`Fetching local file at: ${url}`);

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.onload = () => {
				resolve(new Response(xhr.responseText, { status: xhr.status }));
			};
			xhr.onerror = () => {
				reject(new TypeError(`Local request failed`));
			};
			xhr.open(`GET`, url);
			xhr.send(null);
		});
	}

	/**
	 * Parses the output from the response object:
	 * - Parses output as text
	 * - Attempts to parse text as JSON.
	 *
	 * @param {Object} response Response object from Fetch API.
	 * 
	 * @private
	 * @returns {Promise<String|Object>} Output parsed.
	 */
	async _parseTextOrJson(response) {

		let output = await response.text();

		if (output && output.length > 0) {
			try {
				output = JSON.parse(output);
			} catch { }
		}

		return output;
	}

	/**
	 * Parses the output from the response object:
	 * - Parses output as binary blob
	 *
	 * @param {Object} response Response object from Fetch API.
	 * 
	 * @private
	 * @returns {Promise<Object>} Object with 'contentType' of output and 'raw' binary of output
	 */
	async _parseBinary(response) {

		const output = await response.blob();

		return {
			contentType: response.headers.get(`Content-Type`),
			raw: output
		};
	}

	/**
	 * Prepare the body for the API call.
	 *
	 * @param {Object|FormData} model Fetch body.
	 * 
	 * @private
	 * @returns {String|FormData|Null} Body content for API call.
	 */
	_getBody(model) {

		let body = null;

		if (model) {
			body = model instanceof FormData ? model : JSON.stringify(model);
		}

		return body;
	}
}