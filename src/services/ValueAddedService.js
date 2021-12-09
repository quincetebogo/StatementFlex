import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';


/**
 * ValueAddedService is used to get the status of the access channels 
 *
 * @export
 * @class ValueAddedService
 * @extends {ChannelServiceBase}
 */
export class ValueAddedService extends ChannelServiceBase {

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
			null
		);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	getValueAddedServiceStatus(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-client-${this._version}/value-added-services?cif=${cifNumber}`;

		return this.get(
			url, 
			this.setToken(), 
			`getValueAddedService`,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);

		/*
		const url = `/clientcare-client-${this._version}/value-added-services`;
		return this._post(url, { 'cif': cifNumber }, this._setToken(), `getValueAddedService`);
		*/
	}

	putValueAddedServiceStatus(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-client-${this._version}/value-added-services?` +
			`capitecEntityId=${request.capitecEntityId}&` +
			`optOutInsights=${request.optOutInsights}&` +
			`optOutBehaviouralMarketing=${request.optOutBehaviouralMarketing}&` +
			`optOutPreAssessments=${request.optOutPreAssessments}&` +
			`optOutAnalysis=${request.optOutAnalysis}&` +
			`optOutThirdParties=${request.optOutThirdParties}&`;

		return this.put(
			url, 
			request, 
			this.setToken(), 
			`putValueAddedService`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}
}