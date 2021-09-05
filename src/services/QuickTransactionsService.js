import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * Channel Service Methods for Quick Transactions
 *
 * @export
 * @class QuickTransactionsService
 * @extends {ServiceBase}
 */
export class QuickTransactionsService extends ServiceBase {
	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, errorHandler = null) {
		super(toggleBusyFunc, errorHandler);
	}

	// --------------
	// PUBLIC METHODS
	// --------------


	favouritesLanding(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.favouritesLanding(clientInfo), `favouritesLanding`, errorHandler, autoRetries);
	}

	async sendStatement(statement, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		return this.wrapCall(this.channelService.sendStatement(statement), `sendStatement`, errorHandler, autoRetries);
	}

	viewStatement(statement, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.viewStatement(statement), `viewStatement`, errorHandler, autoRetries);
	}

	getTaxCertificate(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.getTaxCertificate(cifNumber), `getTaxCertificate`, errorHandler, autoRetries);
	}

	viewTaxCertificate(taxCertificate, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.viewTaxCertificate(taxCertificate), `viewTaxCertificate`, errorHandler, autoRetries);
	}

	async sendTaxCertificate(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);
		
		return this.wrapCall(this.channelService.sendTaxCertificate(clientInfo), `sendTaxCertificate`, errorHandler, autoRetries);
	}

	cardLimitsLanding(cifNumber, incidentRecId, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.cardLimitsLanding(cifNumber, incidentRecId), `cardLimitsLanding`, errorHandler, autoRetries);
	}

	getCardLimits(cardDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.getCardLimits(cardDetails), `getCardLimits`, errorHandler, autoRetries);
	}

	async sendProofOfAccount(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);
		
		return this.wrapCall(this.channelService.sendProofOfAccount(clientInfo), `sendProofOfAccount`, errorHandler, autoRetries);
	}

    viewProofOfAccount(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
        return this.wrapCall(this.channelService.viewProofOfAccount(clientInfo), `viewProofOfAccount`, errorHandler, autoRetries);
    }
	
	tapToPayLanding(cifNumber, incidentRecId, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.tapToPayLanding(cifNumber, incidentRecId), `tapToPayLanding`, errorHandler, autoRetries);
	}

	getClientProducts(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.getClientProducts(request), `getClientProducts`, errorHandler, autoRetries);
	}

	tapToPayAgreement(agreementInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.tapToPayAgreement(agreementInfo), `tapToPayAgreement`, errorHandler, autoRetries);
	}

	async updateTapToPay(acceptTapToPay, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		return this.wrapCall(this.channelService.updateTapToPay(acceptTapToPay), `updateTapToPay`, errorHandler, autoRetries);
	}

	getCardLimitsAgreement(cardDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.getCardLimitsAgreement(cardDetails), `getCardLimitsAgreement`, errorHandler, autoRetries);
	}

	async updatePermanentLimits(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		return this.wrapCall(this.channelService.updatePermanentLimits(request), `updatePermanentLimits`, errorHandler, autoRetries);
	}

	async updateTemporaryLimits(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		return this.wrapCall(this.channelService.updateTemporaryLimits(request), `updateTemporaryLimits`, errorHandler, autoRetries);
	}

	getPermanentLimits(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.getPermanentLimits(request), `getPermanentLimits`, errorHandler, autoRetries);
	}

	getTemporaryLimits(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.getTemporaryLimits(request), `getTemporaryLimits`, errorHandler, autoRetries);
	}
}