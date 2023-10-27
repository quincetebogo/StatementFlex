import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { DesktopAgentService } from 'app/services/DesktopAgentService';

/**
 * Channel Service Methods for CapitecConnect Account/Plan/Product documents
 *
 * @export
 * @class CapitecConnectService
 * @extends {ChannelServiceBase}
 */

export class CapitecConnectService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc,
			defaultErrorHandlerFunc,
			`serviceURIs.capitecConnectServiceUrl`,
			`CapitecConnectChannelService`,
			`v1`,
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
		
		this.desktopAgentService = DesktopAgentService.getInstance();
	}

	// Get reversals

	async getReversals(status, pagination_args, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		pagination_args = {
			"page": pagination_args.page || 0,
			"size": pagination_args.size || 1,
			"sort": typeof pagination_args.sort === "object" && pagination_args.sort.length > 0 ? pagination_args.sort : ["cif"]
		}
		
		const url = `/v1/api/horizon/recharges/reverse/actions/${status}` + `/search?${this.convertJsonToUriString(pagination_args)}`;

		console.log("url", url)
		return this.post(
			url, 
			{}, 
			this.setToken(), 
			`getClientProducts`, 
			null, 
			null, 
			1000,
			null,
			null,
			autoRetries
		);
	}
	
	async LockReversal(transactionReference) {
		const url = `/v1/api/horizon/recharges/${transactionReference}/reverse/actions/lock`;
		return this.put(
			url, 
			{}, 
			this.setToken(), 
			`getClientProducts`, 
			null, 
			null, 
			1000,
			null,
			null,
			0
		);
	}

	async UnlockReversal(transactionReference) {
		const url = `/v1/api/horizon/recharges/${transactionReference}/reverse/actions/unlock`;
		return this.put(
			url, 
			{}, 
			this.setToken(), 
			`getClientProducts`, 
			null, 
			null, 
			1000,
			null,
			null,
			0
		);
	}

	async FlagReversal(transactionReference) {
		const url = `/v1/api/horizon/recharges/${transactionReference}/reverse/actions/flag`;
		return this.put(
			url, 
			{}, 
			this.setToken(), 
			`getClientProducts`, 
			null, 
			null, 
			1000,
			null,
			null,
			0
		);
	}

	async ProcessReversal(transactionReference, accepted) {
		const url = `/v1/api/horizon/recharges/${transactionReference}/reverse/actions/process?accepted=${accepted}`;
		return this.put(
			url, 
			{}, 
			this.setToken(), 
			`getClientProducts`, 
			null, 
			null, 
			1000,
			null,
			null,
			0
		);
	}

	convertJsonToUriString(obj) {
		if (typeof obj === "object" && obj.length > 0) {
			console.warn("Cannot pass an array into convertJsonToUriString(). Must be a JSON Object.")
			return false;
		}

		var keys = Object.keys(obj);
		var str = "";

		keys.forEach((v, i) => {
			var key = v;
			var value = obj[key];
			value = typeof obj === "object" && obj.length > 0 ? value.join(',') : value; // if value is an array, then make it a string

			str += i < keys.length && i != 0 ? "&" : "";
			str += key + "=" + value;
		});

		return str;
	}

	sanitizeJsonObject(jsonObject, keyList) {
		if (!jsonObject || typeof jsonObject !== 'object' || !Array.isArray(keyList)) {
			return false; // Invalid input, return null or handle the error accordingly
		}

		const sanitizedObject = {};

		for (const key of keyList) {
			if (jsonObject.hasOwnProperty(key)) {
				sanitizedObject[key] = jsonObject[key];
			}
		}

		return sanitizedObject;
	}

	async rechargeHistory(qry_args = {}, pagination_args = {}, capitecConnectRechargeHistory, isForEscalationDetails = false) {
		// if (await this.isMockEnabled(`capitecConnectRechargeHistory`) && !isForEscalationDetails) {
		// 	return this.mock(`capitecConnectRechargeHistory`, capitecConnectRechargeHistory);
		// }

		pagination_args = {
			"page": pagination_args.page || 0,
			"size": pagination_args.size || 1,
			"sort": typeof pagination_args.sort === "object" && pagination_args.sort.length > 0 ? pagination_args.sort : ["cif"]
		}

		var request = this.sanitizeJsonObject(
			qry_args,
			[ "cif", "channel", "msisdn", "amount", "type", "transactionReference", "productName", "bundleTypes", "transactionDate" ]
		);

		if (!request) {
			console.warn("Invalid query arguments passed into function: rechargeHistory()");
			return [];
		}

		const url = !isForEscalationDetails ?
			`/${this._version}/api/horizon/recharges/search?${this.convertJsonToUriString(pagination_args)}`
			: `/v1/api/horizon/recharges/reverse/actions/AVAILABLE/search`;

		return this.post(
			url,
			request,
			this.setToken(),
			!isForEscalationDetails ? `capitecConnectRechargeHistory` : `capitecConnectEscalationHistory`,
			null,
			null,
			2000,
			null,
			null,
			DEFAULT_AUTO_RETRIES
		);
	}

	async escalateForReversal(ref = null, reason = '', comments = '') {
		if (typeof ref !== "string") {
			console.error("Recharge reference number invalid.");
			return [];
		}

		const url = `/v1/api/horizon/recharges/${ref}/reverse`;
		const request = {
            reversalReason: reason,
            additionalComments: comments
        };

		return this.post(
			url,
			request,
			this.setToken(),
			`capitecConnectRechargeEscalation`,
			null,
			null,
			2000,
			null,
			() => console.log('[capitecConnectRechargeEscalation] request failed.'),
			DEFAULT_AUTO_RETRIES
		);
	}
}
