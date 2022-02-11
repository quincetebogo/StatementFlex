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
			`serviceURIs.accessChannelServiceUrl`, 
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

	async accessChannelsUssdLanding(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`accessChannelUssdLanding`)) {
			return this.mock(`accessChannelUssdLanding`);
		}

		const requestBody = {
			'msisdn': clientInfo.msisdn
		};

		const url = `/clientcare-accesschannels-${this._version}/ussd/landing`;
		return this.post(
			url, 
			requestBody,
			this.setToken(), 
			`accessChannelUSSDLanding`, 
			null, 
			null,
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async accessChannelLanding(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const request = {
			"cif": cifNumber
		};

		const url = `/clientcare-accesschannels-${this._version}/landing`;

		return this.post(
			url,
			request,
			this.setToken(),
			`accessChannelLanding`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	async internetBankingLanding(userRegNo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const request = {
			"userRegNo": userRegNo
		};
		const url = `/clientcare-accesschannels-${this._version}/internet-banking/landing`;

		return this.post(
			url,
			request,
			this.setToken(),
			`internetBankingLanding`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	async suspendToken(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-accesschannels-${this._version}/internet-banking/suspend-token`;

		return this.post(
			url,
			{
				"cif": request.cifNumber,
				"tokenSerialNo": request.tokenSerialNo,
				"reason": request.reason
			},
			// request,
			this.setToken(),
			`suspendToken`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);		
	}

	async updateNotificationType(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		//TODO: add url 
		const url = `/clientcare-accesschannels-${this._version}/`;

		return this.put(
			url,
			request,
			this.setToken(),
			`updateNotificationType`,
			null,
			null,
			1000,
			null,
			errorHandler,
			autoRetries
		);
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