import { HorizonChannelService } from './HorizonChannelService';
import { ServiceCallHelper } from '../utils/serviceCallHelper';

export class CallHandleService {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new CallHandleService());
	}

	constructor() {

		if (this.instance) {
			return this.instance;
		}

		this.channelService = HorizonChannelService.getInstance();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	// --------------
	// PUBLIC METHODS
	// --------------

	// ------------------------------------------
	// Utility Methods - not part of API Contract
	// ------------------------------------------
	isConfirmedCaller(acceptedCall) {
		if (acceptedCall === null || acceptedCall === undefined) {
			return false;
		}
		return acceptedCall.addCallerDetailsButton !== undefined;
	}

	isUnverifiedCaller(acceptedCall) {
		if (acceptedCall === null || acceptedCall === undefined) {
			return false;
		}
		return !this.isConfirmedCaller(acceptedCall);
	}

	//TODO: Parameterise the client need
	acceptCall(acceptCallData, toggleBusyFunc, errorHandler = null) {

		const serviceCallHelper = new ServiceCallHelper(
			toggleBusyFunc,
			errorHandler
		);

		return serviceCallHelper.asyncCall(this.channelService.acceptCall(acceptCallData), errorHandler);
	}

	endCall(details, toggleBusyFunc, errorHandler = null) {
		const incidentRecId = details.incidentRecId;
		const endCallReasonKey = details.endCallReason.key;
		const serviceCallHelper = new ServiceCallHelper(
			toggleBusyFunc,
			errorHandler
		);
		return serviceCallHelper.asyncCall(this.channelService.endCall(incidentRecId, endCallReasonKey), errorHandler);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------
}