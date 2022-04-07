import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';

/**
 * The call handling service contains service calls that start off the flow for 
 * an incoming phone call. The service alls are around searching and verifying 
 * a caller
 *
 * @export
 * @class CallHandleService
 * @extends {ChannelServiceBase}
 */
export class CallHandleService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`serviceURIs.channelServiceUrl`, 
			`HorizonChannelService`, 
			`v1`, 
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// ------------------------------------------
	// Utility Methods - not part of API Contract
	// ------------------------------------------

	
	/**
	 * @callback errorHandlerCallback
	 * @param {object} exception - The exception from the failing service call
	 */

	/**
	 * @typedef {Object} ReturnValue
	 * @property {boolean} succeeded - Indicates if the service call succeeded
	 * @property {object} result - The result of the service call if succeeded is true
	 */

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

		/*
		return this.get(
			`/clientcare-call-${this._version}/search-caller?` +
				`incomingTelephoneNumber=${clientInfo.incomingTelephoneNumber}&` +
				`voiceReferenceNumber=${clientInfo.voiceReferenceNumber}&` +
				`ivrOptionCode=${clientInfo.ivrOption}&` +
				`incidentReferenceNumber=${clientInfo.incidentNo}&` +
				`agentTelephoneNumber=${clientInfo.agentTelephoneNumber}&` +
				`identificationMethod=${parseInt(clientInfo.identificationMethod, 10)}&` +
				`value=${clientInfo.searchValue}`,
				this._setToken(),
			`searchCaller`
		);
		*/

		const url = `/clientcare-call-${this._version}/accept-call`;

		return this.post(
			url,
			{
				'incomingTelephoneNumber': acceptCallData.incomingTelephoneNumber
			},
			this.setToken(), 
			`acceptCall`,
			false,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Retrieves the search call options to search the existing client
	 *
	 * @param {object} incomingCallData Information about the incoming call
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing search options and the result of the channel service call
	 */
	searchOptions(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/clientcare-card-${this._version}/search/options`, 
			null,
			this.setToken(),
			`searchOptions`, 
			false,
			null, 
			1000,
			null,
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
	searchCaller(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		/*
		return this.get(
			`/clientcare-call-${this._version}/search-caller?` +
				`incomingTelephoneNumber=${clientInfo.incomingTelephoneNumber}&` +
				`voiceReferenceNumber=${clientInfo.voiceReferenceNumber}&` +
				`ivrOptionCode=${clientInfo.ivrOption}&` +
				`incidentReferenceNumber=${clientInfo.incidentNo}&` +
				`agentTelephoneNumber=${clientInfo.agentTelephoneNumber}&` +
				`identificationMethod=${parseInt(clientInfo.identificationMethod, 10)}&` +
				`value=${clientInfo.searchValue}`,
				this._setToken(),
			`searchCaller`,
			false,
			1000
		);
		*/
		
		const url = `/clientcare-call-${this._version}/search-caller`;

		return this.post(
			url,
			{
				'searchType': {
					'identificationMethod': parseInt(clientInfo.identificationMethod, 10),
					'value': clientInfo.searchValue
				}
			},
			this.setToken(), 
			`searchCaller`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Retrieves the security questions to verify the client
	 * 
	 * @param {string} clientID client identification number
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @returns {Promise<ReturnValue>} An object containing list of security questions & answers and the result of the channel service call
	 */
	async xdsQuestions(clientID, errorHandler = null) {
		if (await this.isMockEnabled(`xdsQuestions`)) {
			if (this._mocking.xdsQuestions.substituteIdOnly && this._mocking.xdsQuestions.substituteIdOnly !== ``) {
				clientID = this._mocking.xdsQuestions.substituteIdOnly;
			} else {
				return this.mock(`xdsQuestions`, clientID);
			}
		}

		// return this.get(`/clientcare-call-${this._version}/xds-questions?clientID=${clientID}`, this._setToken(), `xdsQuestions`, false, 3000);

		return this.post(
			`/clientcare-call-${this._version}/load-xds-questions`, 
			{ 'clientID': clientID }, 
			this.setToken(), 
			`xdsQuestions`, 
			null, 
			null, 
			3000,
			null,
			errorHandler,
			1
		);
	}

	/**
	 *  Verifies collected answers for security questions against XDS
	 * 
	 * @param {*} answers An object containing the responses/answers to the asked security questoins
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @returns {Promise<ReturnValue>} An object indicating if the verification process was successful or if not, the reason for failure
	 */
	 async verifySecurityQuestions(answers, errorHandler = null) {
		if (await this.isMockEnabled(`verifySecurityQuestions`)) {
			return this.mock(`verifySecurityQuestions`, answers);
		}

		return this.post(
			`/clientcare-call-${this._version}/xds-questions`, 
			answers, 
			this.setToken(), 
			`verifySecurityQuestions`, 
			null, 
			null, 
			3000,
			null,
			errorHandler,
			1
		);
	}

	/**
	 *  End call triggers automated messaging
	 * 
	 * @param {object} request End call request object
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @param {number} autoRetries auto retires 
	 * @returns {Promise<ReturnValue>} An object indicating if the verification process was successful or if not, the reason for failure
	 */
	endCall(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-call-${this._version}/end-call`;

		return this.post(
			url,
			request,
			this.setToken(), 
			`endCall`,
			false,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 *  Verifies collected answers for security questions against KBA
	 * 
	 * @param {*} answers An object containing the responses/answers to the asked security questoins
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @returns {Promise<ReturnValue>} An object indicating if the verification process was successful or if not, the reason for failure
	 */
	 async verifyKBA(answers, errorHandler = null) {
		if (await this.isMockEnabled(`verifyKBA`)) {
			return this.mock(`verifyKBA`, answers);
		}
	}
}