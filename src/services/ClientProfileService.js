import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';

/**
 * The client profile service contains service calls that start off the flow for 
 * an incoming phone call. The service calls are for accepting a call and searching
 * for client.
 *
 * @export
 * @class ClientProfileService
 * @extends {ChannelServiceBase}
 */
export class ClientProfileService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc,
			defaultErrorHandlerFunc,
			`serviceURIs.clientProfileServiceUrl`,
			`csc-cs-clientprofile`,
			`v1`,
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Determines if the caller is phoning from a verified number. 
	 * 
	 * @param {object} acceptCallData Information about the incoming call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof CallHandleService
	 */
	async acceptCall(acceptCallData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`acceptCall`)) {
			return this.mock(`acceptCall`, acceptCallData);
		}

		const url = `/clientcare-clientprofile-${this._version}/accept-call`;

		const acceptCallRequest = {
			'incomingTelephoneNumber': acceptCallData.incomingTelephoneNumber,
			'capitecChannel': `Horizon`
		};

		return this.post(
			url,
			acceptCallRequest,
			this.setToken(), 
			`acceptCall`,
			null,
			null,
			1000,
			5000,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Retrieves the client information based on the identification method search
	 *
	 * @param {object} clientInfo Information about the incoming call
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing client information and the result of the channel service call
	 */
	async searchCaller(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		if (await this.isMockEnabled(`searchCaller`)) {
			return this.mock(`searchCaller`);
		}

		const url = `/clientcare-clientprofile-${this._version}/search-caller`;

		const searchCallerRequest = {
			'searchType': {
				'identificationMethod': parseInt(clientInfo.identificationMethod, 10),
				'value': clientInfo.searchValue
			},
			'capitecChannel': `Horizon`
		};

		return this.post(
			url,
			searchCallerRequest,
			this.setToken(), 
			`searchCaller`, 
			null, 
			null, 
			1000,
			5000,
			errorHandler,
			autoRetries
		);
	}

	// consent management methods

	async getClientConsent(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		if (await this.isMockEnabled(`getClientConsent`)) {
			return this.mock(`getClientConsent`);
		}


		const request = {
			"cifNumber": cifNumber
		};
	
		const url = `/client/preferences/consent`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`getClientConsent`, 
			null, 
			null, 
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async putClientConsent(vasRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		if (await this.isMockEnabled(`putClientConsent`)) {
			return this.mock(`putClientConsent`);
		}

		const request = {
			"cifNumber": vasRequest.cifnumber,
			"optInInsights": vasRequest.optOutInsights,
  			"optInMarketing": vasRequest.optOutBehaviouralMarketing
		};

		const url = `/client/preferences/consent`;

		return this.put(
			url, 
			request, 
			this.setToken(), 
			`putClientConsent`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}
}