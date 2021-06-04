import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';

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

	sendStatement(statement, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.sendStatement(statement), `sendStatement`, errorHandler, autoRetries);
	}

	viewStatement(statement, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.viewStatement(statement), `viewStatement`, errorHandler, autoRetries);
	}

	cardLimitsLanding(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.cardLimitsLanding(cifNumber), `cardLimitsLanding`, errorHandler, autoRetries);
	}

	getCardLimits(cardDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.getCardLimits(cardDetails), `getCardLimits`, errorHandler, autoRetries);
	}

    sendProofOfAccount(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
        return this.wrapCall(this.channelService.sendProofOfAccount(clientInfo), `sendProofOfAccount`, errorHandler, autoRetries);
    }

    viewProofOfAccount(clientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
        return this.wrapCall(this.channelService.viewProofOfAccount(clientInfo), `viewProofOfAccount`, errorHandler, autoRetries);
    }
	
	tapToPayLanding(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.tapToPayLanding(cifNumber), `tapToPayLanding`, errorHandler, autoRetries);
	}

	getClientProducts(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.getClientProducts(request), `getClientProducts`, errorHandler, autoRetries);
	}

	tapToPayAgreement(agreementInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.tapToPayAgreement(agreementInfo), `tapToPayAgreement`, errorHandler, autoRetries);
	}

	updateTapToPay(acceptTapToPay, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.updateTapToPay(acceptTapToPay), `updateTapToPay`, errorHandler, autoRetries);
	}
}