import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';

/**
 * CallHandleService is used to start the tracking of a call against an incident. It is also
 * used to close off the tracking of a call against an incident.
 *
 * @export
 * @class CallHandleService
 * @extends {ServiceBase}
 */
export class CallHandleService extends ServiceBase {

	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, errorHandler = null) {
		super(toggleBusyFunc, errorHandler);
	}

	// ------------------------------------------
	// Utility Methods - not part of API Contract
	// ------------------------------------------

	/**
	 * A utility method to determine if the return type from acceptCall represents a 
	 * confirmed caller
	 * 
	 * @param { object } acceptedCall An object returned from acceptCall()
	 * @returns {boolean} Returns true if acceptedCall parameter is a confirmed caller object 
	 */
	isConfirmedCaller(acceptedCall) {
		if (acceptedCall === null || acceptedCall === undefined) {
			return false;
		}
		return acceptedCall.addCallerDetailsButton !== undefined;
	}

	/**
	 * A utility method to determine if the return type from acceptCall represents an 
	 * unverified caller
	 * 
	 * @param { object } acceptedCall An object returned from acceptCall()
	 * @returns {boolean} Returns true if acceptedCall parameter is an unverified caller object 
	 */
	isUnverifiedCaller(acceptedCall) {
		if (acceptedCall === null || acceptedCall === undefined) {
			return false;
		}
		return !this.isConfirmedCaller(acceptedCall);
	}

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
	 * Determines if the caller is phoning from a verified number. The returned object is 
	 * different depending on if the incoming call is from an unverified number or not.
	 * 
	 * @deprecated use the new acceptCall instead
	 * 
	 * @param {object} acceptCallData Information about the incoming call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof CallHandleService
	 */
	caller(acceptCallData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.serviceCallHelper.asyncCall(this.channelService.caller(acceptCallData), `caller`, errorHandler, autoRetries);
	}

	/**
	 * Determines if the caller is phoning from a verified number. 
	 * 
	 * @param {object} acceptCallData Information about the incoming call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @memberof CallHandleService
	 */
	acceptCall(acceptCallData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.serviceCallHelper.asyncCall(this.channelService.acceptCall(acceptCallData), `acceptCall`, errorHandler, autoRetries);
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
		return this.serviceCallHelper.asyncCall(this.channelService.searchOptions(incomingCallData), `searchOptions`, errorHandler, autoRetries);
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
		return this.serviceCallHelper.asyncCall(this.channelService.searchCaller(clientInfo), `searchCaller`, errorHandler, autoRetries);
	}

	/**
	 * Loads the list of end call reasons to display on the end call dialog
	 * 
	 * @deprecated
	 * @param {Object} endCallDetails Information about the call to end (including end call reason/cause code)
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	endCallOptions(endCallDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.serviceCallHelper.asyncCall(this.channelService.endCallOptions(endCallDetails), `endCallOptions`, errorHandler, autoRetries);
	}

	/**
	 * Loads the list of end call reasons to display on the end call dialog
	 * 
	 * THIS METHOD WILL REPLACE endCallOptions. THE CHANNEL SERVICE IMPLEMENTATION MUST BE DONE BEFORE WE CAN SWITCH
	 * 
	 * @param {Object} endCallDetails Information about the call to end (including end call reason/cause code)
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	loadEndCallOptions(endCallDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.serviceCallHelper.asyncCall(this.channelService.loadEndCallOptions(endCallDetails), `loadEndCallOptions`, errorHandler, autoRetries);
	}

	/**
	 *  Closes the incident that was created to track the call.
	 * 
	 * @param { object } details An object containg the incident for the call and the reason for ending the call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @memberof CallHandleService
	 */
	endCall(details, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const incidentRecId = details.incidentRecId;
		const endCallReasonKey = details.endCallReason.key;

		return this.serviceCallHelper.asyncCall(this.channelService.endCall(incidentRecId, endCallReasonKey), `endCall`, errorHandler, autoRetries);
	}

	/**
	 * Retrieves the security questions to verify the client
	 * 
	 * @param {string} clientID client identification number
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing list of security questions & answers and the result of the channel service call
	 */
	xdsQuestions(clientID, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.serviceCallHelper.asyncCall(this.channelService.xdsQuestions(clientID), `xdsQuestions`, errorHandler, autoRetries);
	}

	/**
	 *  Verifies collected answers for security questions against XDS
	 * 
	 * @param {*} response An object containing the responses/answers to the asked security questoins
	 * @param {*} errorHandler An optional error handler
	 * @param {*} autoRetries The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object indicating if the verification process was successful or if not, the reason for failure
	 */
	verifySecurityQuestions(response, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.serviceCallHelper.asyncCall(this.channelService.verifySecurityQuestions(response), `verifySecurityQuetsions`, errorHandler, autoRetries);
	}
}