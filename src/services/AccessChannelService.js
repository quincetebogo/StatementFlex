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
			`serviceURIs.accessChannelsUrl`, 
			`HorizonChannelService`, 
			`v1`, 
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	async accessChannelStatus(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`accessChannel`)) {
			return this.mock(`accessChannel`);
		}

		const url = `/clientcare-accesschannels-${this._version}/landing`;
		return this.post(
			url,
			{
				"cif": cifNumber
			},
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

	async suspendApp(reason, userRegNo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`suspendApp`)) {
			return this.mock(`suspendApp`);
		}

		const url = `/clientcare-accesschannels-${this._version}/app/suspend`;
		return this.post(
			url,
			{
				"reason": reason,
				"userRegNo": userRegNo
			},
			this.setToken(), 
			`suspendApp`,
			false,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}
}