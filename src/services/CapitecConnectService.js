import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

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

	async rechargeHistory(qry_args = {}, pagination_args = {}, capitecConnectRechargeHistory) {
		// if (await this.isMockEnabled(`capitecConnectRechargeHistory`)) {
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

		const url = `/${this._version}/api/horizon/recharges/search?${this.convertJsonToUriString(pagination_args)}`;

		return this.post(
			url,
			request,
			this.setToken(),
			`capitecConnectRechargeHistory`,
			null,
			null,
			2000,
			null,
			null,
			DEFAULT_AUTO_RETRIES
		);
	}
}