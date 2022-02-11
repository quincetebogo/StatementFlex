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
	
	async accessChannelLanding(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`accessChannel`)) {
			return this.mock(`accessChannel`);
		}

		const request = {
			"cif": `${cifNumber}`
		};

		const url = `/clientcare-accesschannels-${this._version}/landing`;
		return this.post(
			url, 
			request,
			this.setToken(), 
			`accessChannelStatus`, 
			null,
			null,
			900,
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
			"cif": `${cifNumber}` 
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

	async cancelUSSD(cifNumber, msisdn, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`cancelUSSD`)) {
			return this.mock(`cancelUSSD`);
		}

		const request = 
		{
			"msisdn": `${msisdn}`,
			"cif": `${cifNumber}` 
		};

		const url = `/clientcare-accesschannels-${this._version}/ussd/cancel`;

		return this.post(
			url,
			request,
			this.setToken(),
			`cancelUSSD`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	async unblockSIM(msisdn, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`unblockSIM`)) {
			return this.mock(`unblockSIM`);
		}

		const request = 
		{
			"msisdn": `${msisdn}`
		};

		const url = `/clientcare-accesschannels-${this._version}/ussd/unblock-sim`;

		return this.post(
			url,
			request,
			this.setToken(),
			`unblockSIM`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}
}