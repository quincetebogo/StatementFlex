import { ServiceBase } from 'app/services/ServiceBase';

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
	 * @returns {ReturnValue} An object containing a success flag and the result of the channel service call
	 * @memberof CallHandleService
	 */
	caller(acceptCallData, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.caller(acceptCallData), errorHandler);
	}

	/**
	 * Determines if the caller is phoning from a verified number. 
	 * 
	 * @param {object} acceptCallData Information about the incoming call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @returns {ReturnValue} An object containing a success flag and the result of the channel service call
	 * @memberof CallHandleService
	 */
	acceptCall(acceptCallData, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.acceptCall(acceptCallData), errorHandler);
	}

	/**
	 * Loads the list of end call reasons to display on the end call dialog
	 * 
	 * @deprecated
	 * @param {Object} endCallDetails Information about the call to end (including end call reason/cause code)
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @returns {ReturnValue} An object containing a success flag and the result of the channel service call
	 */
	endCallOptions(endCallDetails, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.endCallOptions(endCallDetails), errorHandler);
	}

	/**
	 * Loads the list of end call reasons to display on the end call dialog
	 * 
	 * THIS METHOD WILL REPLACE endCallOptions. THE CHANNEL SERVICE IMPLEMENTATION MUST BE DONE BEFORE WE CAN SWITCH
	 * 
	 * @param {Object} endCallDetails Information about the call to end (including end call reason/cause code)
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @returns {ReturnValue} An object containing a success flag and the result of the channel service call
	 */
	loadEndCallOptions(endCallDetails, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.loadEndCallOptions(endCallDetails), errorHandler);
	}

	/**
	 *  Closes the incident that was created to track the call.
	 * 
	 * @param { object } details An object containg the incident for the call and the reason for ending the call
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @returns {Promise|ReturnValue} An object containing a success flag and the result of the channel service call
	 * @memberof CallHandleService
	 */
	endCall(details, errorHandler = null) {
		const incidentRecId = details.incidentRecId;
		const endCallReasonKey = details.endCallReason.key;

		return this.serviceCallHelper.asyncCall(this.channelService.endCall(incidentRecId, endCallReasonKey), errorHandler);
	}

	xdsQuestions(clientID, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.xdsQuestions(clientID), errorHandler);
	}

	verifySecurityQuestions(response, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.verifySecurityQuestions(response), errorHandler);
	}
}