import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
// import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * Channel Service Methods for Connect flow
 *
 * @export
 * @class ConnectService
 * @extends {ChannelServiceBase}
 */
export class ConnectService extends ChannelServiceBase {
	// Get reversals

	async getReversals(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		// if (await this.isMockEnabled(`getClientProducts`)) {
		// 	return this.mock(`getClientProducts`, request.cifNumber);
		// }

		const requestObject = {
			"cif": request.cif,
			"channel": request.channel,
			"msisdn": request.msisdn,
			"amount": request.amount,
			"transactionReference": request.transactionReference,
			"transactionDate": request.transactionDate
		};

		const status = request.status;
		const pageable = request.pageable;
		
		const url = `/v1/api/horizon/recharges/reverse/actions/${this.status}` + '?' + status + '&' + pageable;

		return this.post(
			url, 
			requestObject, 
			this.setToken(), 
			`getClientProducts`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}
}
