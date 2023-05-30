import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * Channel Service Methods for Quick Transactions
 *
 * @export
 * @class QuickTransactionsService
 * @extends {ChannelServiceBase}
 */
export class QuickTransactionsService extends ChannelServiceBase {
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
	// --------------
	// PUBLIC METHODS
	// --------------


	async favouritesLanding(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`favouritesLanding`)) {
			return this.mock(`favouritesLanding`, clientInfo);
		}
		
		const url = `/clientcare-favourites-${this._version}/landing`;

		return this.post(
			url,
			{
				'cifNumber': clientInfo.cifNumber,
				'nationalIDNumber': clientInfo.nationalIDNumber,
				'isCallerVerified': clientInfo.isCallerVerified
			},
			this.setToken(),
			`favouritesLanding`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	getTaxCertificate(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const request = {
			"cif": cifNumber
		};

		const url = `​/clientcare-documents-${this._version}/select-tax-certificate`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`getTaxCertificate`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	async viewTaxCertificate(taxCertificate, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`viewStatements`)) {
			return this.mock(`viewStatements`);
		}

		const url = `/clientcare-documents-${this._version}/view-tax-certificate`;

		return this.post(
			url, 
			taxCertificate, 
			this.setToken(), 
			`viewTaxCertificate`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	async sendTaxCertificate(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

		const url = `/clientcare-documents-${this._version}/send-tax-certificate`;

		return this.post(
			url, 
			clientInfo, 
			this.setToken(), 
			`sendTaxCertificate`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

}