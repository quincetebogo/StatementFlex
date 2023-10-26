import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
// import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * Channel Service Methods for Connect flow
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
	
	async LockReversal(transactionReference, requestObject) {
		const url = `/v1/api/horizon/recharges/${transactionReference}/reverse/actions/lock`;
		return this.put(
			url, 
			requestObject, 
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

	async FlagReversal(transactionReference, requestObject) {
		const url = `/v1/api/horizon/recharges/${transactionReference}/reverse/actions/flag`;
		return this.put(
			url, 
			requestObject, 
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

}
