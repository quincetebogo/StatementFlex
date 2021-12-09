import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';

/**
 * AccessChannelService is used to get the status of the access channels 
 *
 * @export
 * @class AccessChannelService
 * @extends {ChannelServiceBase}
 */
export class AccessChannelService extends ChannelServiceBase {

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
			null
		);
	}

	accessChannelStatus(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-accesschannels-${this._version}/access-channels?cif=${cifNumber}`;
		return this.get(
			url, 
			this.setToken(), 
			`accessChannelStatus`, 
			false, 
			1000,
			null,
			errorHandler,
			autoRetries
		);

		/*
		const url = `/clientcare-accesschannels-${this._version}/access-channels`;
		return this.post(url, { 'cif': cifNumber }, this._setToken(), `accessChannels`, null, null, 1000);
		*/
	}
}