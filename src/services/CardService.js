
import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';

/**
 * Channel Service methods for Cards related functionality
 *
 * @export
 * @class CardService
 * @extends {ServiceBase}
 */
export class CardService extends ServiceBase {
	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, errorHandler = null) {
		super(toggleBusyFunc, errorHandler);
	}

	// --------------
	// EVENT HANDLERS
	// --------------


	// --------------
	// PUBLIC METHODS
	// --------------

	identifyCaller(callerData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.identifyCaller(callerData), `identifyCaller`, errorHandler, autoRetries);
	};

	addCallerDetails(callerData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.addCallerDetails(callerData), `addCallerDetails`, errorHandler, autoRetries);
	}

	async stopCards(cardsToStop, callerInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		let cardStopResults = [];

		const stopCardRequest = {
			cards: cardsToStop.map((card) => ({
				cardId: card.cardNumber,
				maskedCardNumber: card.maskedCardNumber,
				cardExpiryYear: card.cardExpiryYear,
				cardExpiryMonth: card.cardExpiryMonth,
				cardSequenceNumber: card.cardSequenceNumber,
				reason: card.cardStopReason
			})),
			incomingTelephoneNumber: callerInfo.incomingTelephoneNumber,
			voiceReferenceNumber: callerInfo.voiceReferenceNumber,
			ivrOptionCode: callerInfo.ivrOptionCode,
			incidentReferenceNumber: callerInfo.incidentReferenceNumber,
			agentTelephoneNumber: callerInfo.agentTelephoneNumber
		};

		const returnValue = await this.wrapCall(this.channelService.stopCard(stopCardRequest), `stopCard`, errorHandler, autoRetries);
		const stopCardResponse = returnValue.result;

		if (returnValue.succeeded && stopCardResponse && stopCardResponse.cardResponses) {
			cardStopResults = stopCardResponse.cardResponses.map((response, index) => ({
				cardDisplayName: cardsToStop[index].cardDisplayName,
				cardNumber: cardsToStop[index].cardNumber,
				maskedCardNumber: cardsToStop[index].maskedCardNumber,
				cardExpiryYear: cardsToStop[index].cardExpiryYear,
				cardExpiryMonth: cardsToStop[index].cardExpiryMonth,
				cardSequenceNumber: cardsToStop[index].cardSequenceNumber,
				cardStopReason: cardsToStop[index].cardStopReason,
				cardStopped: response.result.statusCode === 200,
				statusCode: response.result.statusCode
			}));
		}

		return { succeeded: returnValue.succeeded, result: cardStopResults };
	}

	assignTeams(incidentData, errorHandler, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.channelService.assignTeams(incidentData), `assignTeams`, errorHandler, autoRetries);
	}

	// assignRequest
	assign(assignData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.wrapCall(this.assignTeams(assignData), `assign`, errorHandler, autoRetries);
	}
}