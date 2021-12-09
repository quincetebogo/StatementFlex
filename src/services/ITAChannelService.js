import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';

/**
 */
export class ITAChannelService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`signalRUrl`, 
			`HorizonITAChannelService`, 
			`v1`, 
			null
		);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// --------------
	// PUBLIC METHODS
	// --------------

	itaVerification(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare/call/${this._version}/ita-verification?CifNumber=${request.cifNumber}&ConnectionId=${request.connectionID}`;
		return this.get(
			url, 
			this.setToken(), 
			`itaVerification`,
			false,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}
}