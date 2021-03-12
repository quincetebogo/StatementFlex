import { Configuration, Logger, Security, Service } from 'platform/core';
import { v4 } from 'uuid';

/**
 * Channel Service Proxy (Resource Access) for the Horizon Channel Service.
 * It is not recommended to use this class directly. Instead Service classes
 * should be created to wrap portions of functionality (cards, insure, incident management, calls etc.)
 */
export class HorizonITAChannelService extends Service {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new HorizonITAChannelService());
	}

	constructor() {
		super({
			baseUrlKey: `signalRUrl`,
			name: `HorizonITAChannelService`
		});

		this._version = `v1`;
		this._mocking = null;
		this._mock = null;

		this._configuration = Configuration.getInstance();
		this._logger = Logger.getInstance();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------


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
		
		this._logger.log(`debug`, `url: ${url}, body: ${JSON.stringify(model)}`, caller, correlationId);

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
	
			this._logger.log(`debug`, `result: ${JSON.stringify(response)}`, caller, correlationId);
	
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
	 * @param {string} caller The name of the method for logging purposes
	 * @returns {Promise<*>} The response of the Channel Service REquest
	 * @memberof HorizonChannelService
	 */
	async _get(url, customHeaders, caller) {
		const correlationId = v4();
			
		this._logger.log(`debug`, `url: ${url}`, caller, correlationId);

		try {
			const response = await super.httpClient.get(url, customHeaders, correlationId);

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
	 * The X-User-Token is required by some calls where the Product Services/Capabilities services 
	 * makes calls to OpenBancs 2/Way Gate in order to retreive the agent's BANCS/SBL teller number
	 *
	 * @returns {object} The X-User-Token custom header object
	 * @memberof HorizonChannelService
	 */
	_setToken() {
		return {
			"X-User-Token": Security.getInstance().token
		};
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ----------------
	// call - ITA & XDS
	// ----------------
	itaVerification(request) {
		return this._get(`/clientcare/call/${this._version}/ita-verification?CifNumber=${request.cifNumber}&` + 
									`ConnectionId=${request.connectionID}`, this._setToken(), `itaVerification`);
    }
}