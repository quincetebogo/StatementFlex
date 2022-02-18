import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';

/**
 * The CreditService is used to retrieve information about clients' credit products.
 * 
 * @export
 * @class {CreditService}
 * @extends {ChannelServiceBase}
 */
export class CreditService extends ChannelServiceBase {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`serviceURIs.creditChannelServiceUrl`, 
			`credit-v1`, 
			`v1`,
			null
		);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	creditOverview(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		const creditOverviewRequest = {
			"cifnumber": cifNumber
		};

		const url = `/clientcare-credit-${this._version}/credit/overview`;

		return this.post(
			url,
			creditOverviewRequest,
			this.setToken(),
			`creditOverview`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}
}