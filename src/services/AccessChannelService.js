import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

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
			`AccessChannelService`, 
			`v1`, 
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	async activatefullUssdMenu(cifNumber, msisdn, reason, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`activatefullUssdMenu`)) {
			return this.mock(`activatefullUssdMenu`);
		}

		const request =
		{
			"msisdn": `${msisdn}`,
			"cif": `0${cifNumber}`,
			"reason": `${reason}`
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
	
	async accessChannelLanding(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`accessChannelLanding`)) {
			return this.mock(`accessChannelLanding`);
		}

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

	// App profile details 
	async suspendApp(reason, userRegNo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

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

	async cancelUSSD(cifNumber, msisdn, reason, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`cancelUSSD`)) {
			return this.mock(`cancelUSSD`);
		}

		const request =
		{
			"msisdn": `${msisdn}`,
			"cif": `0${cifNumber}`,
			"reason": `${reason}`
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

	// Internet Banking details
	internetBankingLanding(userRegNo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
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

	async unblockSIM(msisdn, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

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

	async suspendToken(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

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
	
	async resetSecurityTokenClock(requestParams, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`accessChannelResetSecurityTokenClock`)) {
			return this.mock(`accessChannelResetSecurityTokenClock`);
		}

		const url = `/clientcare-accesschannels-${this._version}/internet-banking/reset-token`;

		const requestBody = {
			'tokenSerialNo': requestParams.tokenSerialNo
		};

		return this.post(
			url,
			requestBody,
			this.setToken(),
			`resetSecurityTokenClock`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}
	
	// USSD
	async accessChannelsUssdLanding(requestParams, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`accessChannelUssdLanding`)) {
			return this.mock(`accessChannelUssdLanding`);
		}

		const requestBody = {
			'msisdn': requestParams.msisdn,
			'cif': requestParams.cif
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

	// Notification 
	updateNotificationType(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		// TODO: add url 
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

}