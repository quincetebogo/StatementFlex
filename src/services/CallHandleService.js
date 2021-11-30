import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonITAChannelService } from 'app/services/HorizonITAChannelService';

/**
 * CallHandleService is used to start the tracking of a call against an incident. It is also
 * used to close off the tracking of a call against an incident.
 *
 * @export
 * @class CallHandleService
 * @extends {ChannelServiceBase}
 */
export class CallHandleService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null, baseUrlKey = `serviceURIs.channelServiceUrl`, serviceName = `HorizonChannelService`, version = `v1`) {
		super(toggleBusyFunc, defaultErrorHandlerFunc, baseUrlKey, serviceName, version, () => import(`../mocks/HorizonChannelServiceMocks.js`));
		this.itaService = HorizonITAChannelService.getInstance();
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
		if (await this._mockEnabled(`acceptCall`)) {
			return this._mock.acceptCall(acceptCallData);
		}

		/*
		return this._get(
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
				'incomingTelephoneNumber': acceptCallData.incomingTelephoneNumber,
				'voiceReferenceNumber': acceptCallData.voiceReferenceNumber,
				'ivrOptionCode': acceptCallData.ivrOptionCode,
				'incidentReferenceNumber': acceptCallData.incidentReferenceNumber,
				'agentTelephoneNumber': acceptCallData.agentTelephoneNumber
			},
			this._setToken(), 
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
	searchOptions(incomingCallData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/clientcare-card-${this._version}/search/options`, 
			{
				"incomingTelephoneNumber": incomingCallData.incomingTelephoneNumber,
				"voiceReferenceNumber": incomingCallData.voiceReferenceNumber,
				"ivrOptionCode": incomingCallData.ivrOptionCode,
				"incidentReferenceNumber": incomingCallData.incidentReferenceNumber,
				"agentTelephoneNumber": incomingCallData.agentTelephoneNumber
			},
			this._setToken(),
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
		return this._get(
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
				'incomingTelephoneNumber': clientInfo.incomingTelephoneNumber,
				'voiceReferenceNumber': clientInfo.voiceReferenceNumber,
				'ivrOptionCode': clientInfo.ivrOption,
				'incidentReferenceNumber': clientInfo.incidentNo,
				'agentTelephoneNumber': clientInfo.agentTelephoneNumber,
				'searchType': {
					'identificationMethod': parseInt(clientInfo.identificationMethod, 10),
					'value': clientInfo.searchValue
				}
			},
			this._setToken(), 
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
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing list of security questions & answers and the result of the channel service call
	 */
	xdsQuestions(clientID, errorHandler = null, autoRetries = 1) {
		return this._wrapCall(this.channelService.xdsQuestions(clientID), `xdsQuestions`, errorHandler, autoRetries);
	}

	/**
	 *  Verifies collected answers for security questions against XDS
	 * 
	 * @param {*} response An object containing the responses/answers to the asked security questoins
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @param {Number} autoRetries The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object indicating if the verification process was successful or if not, the reason for failure
	 */
	verifySecurityQuestions(response, errorHandler = null, autoRetries = 1) {
		return this._wrapCall(this.channelService.verifySecurityQuestions(response), `verifySecurityQuetsions`, errorHandler, autoRetries);
	}

	itaVerification(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this._wrapCall(this.itaService.itaVerification(request), `itaVerification`, errorHandler, autoRetries);
	}

	digitalVerificationChannelsAvailable(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this._wrapCall(this.channelService.digitalVerificationChannelsAvailable(cifNumber), `digitalVerificationChannelsAvailable`, errorHandler, autoRetries);
	}
}