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

	async sendStatement(statement, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		const url = `/clientcare-documents-${this._version}/statements/send-statement`;
		
		return this.post(
			url, 
			statement, 
			this.setToken(), 
			`sendStatement`, 
			null, 
			null, 
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async viewStatement(statement, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`viewStatements`)) {
			return this.mock(`viewStatements`);
		}

		const url = `/clientcare-documents-${this._version}/statements/view-statement`;

		return this.post(
			url, 
			statement, 
			this.setToken(), 
			`viewStatement`, 
			null, 
			null, 
			2000,
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
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

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

	async cardLimitsLanding(cifNumber, incidentRecId, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`cardLimitsLanding`)) {
			return this.mock(`cardLimitsLanding`, cifNumber);
		}

		const request = {
			"cifNumber": cifNumber,
			"incidentRecId": incidentRecId
		};

		const url = `/clientcare-card-${this._version}/limits-landing`;

		return this.post(
			url,
			request,
			this.setToken(),
			`cardLimitsLanding`,
			null,
			null,
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async sendProofOfAccount(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		const url = `/clientcare-documents-${this._version}/statements/send-proof-of-account`;

		return this.post(
			url,
			clientInfo,
			this.setToken(),
			`sendProofOfAccount`,
			null,
			null,
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}

	viewProofOfAccount(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-documents-${this._version}/statements/view-proof-of-account`;

		return this.post(
			url, 
			clientInfo, 
			this.setToken(), 
			`viewProofOfAccount`, 
			null, 
			null, 
			2000,
			null,
			errorHandler,
			autoRetries
		);
	}
	
	async tapToPayLanding(cifNumber, incidentRecId, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`tapToPayLanding`)) {
			return this.mock(`tapToPay`, cifNumber);
		}

		const request = {
			"cifNumber": cifNumber,
			"incidentRecId": incidentRecId
		};

		const url = `/clientcare-card-${this._version}/tap-to-pay-landing`;
	
		return this.post(
			url, 
			request, 
			this.setToken(), 
			`tapToPayLanding`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);

	}

	getClientProducts(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const requestObject = {
			"cifNumber": request.cifNumber,
			"productStatus": request.status
		};
		
		const url = `/clientcare-documents-${this._version}/statements/client`;

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

	tapToPayAgreement(agreementInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-card-${this._version}/tap-to-pay-agreement`;

		return this.post(
			url, 
			agreementInfo, 
			this.setToken(), 
			`tapToPayAgreement`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async updateTapToPay(acceptTapToPay, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		const url = `/clientcare-card-${this._version}/tap-to-pay`;

		return this.post(
			url, 
			acceptTapToPay, 
			this.setToken(), 
			`updateTapToPay`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async getCardLimitsAgreement(cardDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`getCardLimitsAgreement`)) {
			return this.mock(`getCardLimitsAgreement`, cardDetails);
		}

		return this.post(
			`/clientcare-card-${this._version}/limits-agreement`, 
			cardDetails, 
			this.setToken(), 
			`getCardLimitsAgreement`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async updatePermanentLimits(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		const url = `/clientcare-card-${this._version}/permanent-limits`;

		return this.put(
			url, 
			request, 
			this.setToken(), 
			`updatePermanentLimits`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async updateTemporaryLimits(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		const url = `/clientcare-card-${this._version}/temporary-limits`;

		return this.put(
			url, 
			request, 
			this.setToken(), 
			`updateTemporaryLimits`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	getPermanentLimits(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-card-${this._version}/permanent-limits`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`getPermanentLimits`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async getTemporaryLimits(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`getTemporaryLimits`)) {
			return this.mock(`getTemporaryLimits`, request);
		}

		const url = `/clientcare-card-${this._version}/temporary-limits`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`getTemporaryLimits`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}
}