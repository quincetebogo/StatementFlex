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
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	async accessChannelStatus(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`accessChannel`)) {
			return this.mock(`accessChannel`);
		}

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

	async activatefullUssdMenu(cifNumber, msisdn, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`activatefullUssdMenu`)) {
			return this.mock(`activatefullUssdMenu`);
		}

		const request = 
		{
			"msisdn": `${msisdn}`,
			"cifNumber": `${cifNumber}` 
		};

		const url = `/clientcare-accesschannels-${this._version}/ussd/activate-full`;

		return this.post(
			url,
			request,
			this.setToken(),
			`ussdActivatefullUssdMenu`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}
}