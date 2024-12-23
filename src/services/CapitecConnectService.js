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

	async getReversals(status, query_args, pagination_args) {
		pagination_args = {
			"page": pagination_args.page || 0,
			"size": pagination_args.size || 1,
			"sort": typeof pagination_args.sort === "object" && pagination_args.sort.length > 0 ? pagination_args.sort : ["cif"]
		}

		query_args = this.sanitizeJsonObject(
			query_args,
			["cif", "channel", "msisdn", "amount", "accountNumber", "transactionReference", "processingDate", "productName", "string", "bundleTypes", "actionCreatedDate"]
		);
		
		const url = `/v1/api/horizon/recharges/reverse/actions/${status}` + `/search?${this.convertJsonToUriString(pagination_args)}`;

		return this.post(
			url, 
			query_args, 
			this.setToken(), 
			`getClientProducts`, 
			null, 
			null, 
			1000,
			null,
			null,
			1
		);
	}
	
	async lockReversal(transactionReference) {
		const url = `/v1/api/horizon/recharges/${transactionReference}/reverse/actions/lock`;
		return this.put(
			url, 
			{}, 
			this.setToken(), 
			`lockReversal`, 
			null, 
			null, 
			1000,
			null,
			null,
			1
		);
	}

	async unlockReversal(transactionReference) {
		const url = `/v1/api/horizon/recharges/${transactionReference}/reverse/actions/unlock`;
		return this.put(
			url, 
			{}, 
			this.setToken(), 
			`unlockReversal`, 
			null, 
			null, 
			1000,
			null,
			null,
			1
		);
	}

	async flagReversal(transactionReference) {
		const url = `/v1/api/horizon/recharges/${transactionReference}/reverse/actions/flag`;
		return this.put(
			url, 
			{}, 
			this.setToken(), 
			`flagReversal`, 
			null, 
			null, 
			1000,
			null,
			null,
			1
		);
	}

	async processReversal(transactionReference, accepted) {
		const url = `/v1/api/horizon/recharges/${transactionReference}/reverse/actions/process?accepted=${accepted}`;
		return this.put(
			url, 
			{}, 
			this.setToken(), 
			`processReversal`, 
			null, 
			null, 
			1000,
			null,
			null,
			1
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

	async rechargeHistory(qry_args = {}, pagination_args = {}, mockArgs = {}) {
		var request = this.sanitizeJsonObject(
			qry_args,
			[ "cif", "channel", "msisdn", "amount", "type", "accountNumber", "transactionReference", "productName", "bundleTypes", "transactionDate" ]
		);

		var requestLogTitle = ``;

		if (typeof request.type === "string") {
			switch (request.type.toUpperCase()) {
				case 'RECHARGES':
				case '':
					if (await this.isMockEnabled(`capitecConnectRechargeHistory`)) {
						console.log('capitecConnectRechargeHistory isActive');
						return this.mock(`capitecConnectRechargeHistory`, mockArgs);
					}
					requestLogTitle = "capitecConnectRechargeHistory";
					break;
				case 'ADVANCE':
					if (await this.isMockEnabled(`capitecConnectAdvancesHistory`)) {
						console.log('capitecConnectAdvancesHistory isActive');
						return this.mock(`capitecConnectAdvancesHistory`, mockArgs);
					}
					requestLogTitle = "capitecConnectAdvanceHistory";
					break;
				case 'ADVANCE_PAYMENT':
					requestLogTitle = "capitecConnectAdvancePaymentHistory";
					break;
				default:
					break;
			}
		}

		if (!request) {
			console.warn("Invalid query arguments passed into function: rechargeHistory()");
			return [];
		}

		pagination_args = {
			"page": pagination_args.page || 0,
			"size": pagination_args.size || 1,
			"sort": typeof pagination_args.sort === "object" && pagination_args.sort.length > 0 ? pagination_args.sort : ["cif"]
		}

		const url = `/v2/api/horizon/recharges/${request.cif}/search?${this.convertJsonToUriString(pagination_args)}`

		// we don't need the cif in the body request, seeing as we are only querying the records related to the current user
		delete request.cif;

		return this.post(
			url,
			request,
			this.setToken(),
			requestLogTitle,
			null,
			null,
			2000,
			null,
			null,
			DEFAULT_AUTO_RETRIES
		);
	}

	async advanceBalances(qry_args = {}) {
		var request = this.sanitizeJsonObject(
			qry_args,
			[ "cif", "msisdn" ]
		);

		if (!request) {
			console.warn("Invalid query arguments passed into function: advanceBalances()");
			return [];
		}

		var url = `/v2/api/horizon/advances/${request.cif}/accounts`;

		delete request.cif;

		// if (request.msisdn) {
		// 	url += `/search`;

		// 	return this.post(
		// 		url,
		// 		request,
		// 		this.setToken(),
		// 		'capitecConnectAdvanceBalance',
		// 		null,
		// 		null,
		// 		2000,
		// 		null,
		// 		null,
		// 		DEFAULT_AUTO_RETRIES
		// 	);
		// } else {
			return this.get(
				url, 
				this.setToken(), 
				`capitecConnectAdvanceBalance`, 
				false, 
				null, 
				null, 
				null, 
				DEFAULT_AUTO_RETRIES
			);
		// }
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

	getDeviceOrders(request) {
		const { pageNumber = 0, pageSize = 10, searchValue, dateFrom, dateTo, clientCif } = request;

		const queryParams = {
			page: pageNumber,
			size: pageSize,
			sort: `createdAt,DESC`
		};

		if (searchValue) {
			queryParams.searchValue = searchValue;
		}

		if (dateFrom) {
			queryParams.dateFrom = dateFrom;
		}

		if (dateTo) {
			queryParams.dateTo = dateTo;
		}

		if (clientCif) {
			queryParams.cif = clientCif;
		}

		const queryString = this.convertJsonToUriString(queryParams);
		const url = `/v1/api/horizon/device/orders/${clientCif}/search?${queryString}`;

		return this.post(
			url,
			{},
			this.setToken(),
			`getDeviceOrders`,
			null,
			null,
			2000,
			null,
			DEFAULT_AUTO_RETRIES
		);
	}
}