
import { ServiceBase } from 'app/services/ServiceBase';

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

	identifyCaller(callerData, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.identifyCaller(callerData), errorHandler);
	};

	addCallerDetails(callerData, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.addCallerDetails(callerData), errorHandler);
	}

	async stopCards(cardsToStop, callerInfo, errorHandler = null) {
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

		const returnValue = await this.serviceCallHelper.asyncCall(this.channelService.stopCard(stopCardRequest), errorHandler);
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

	assignTeams(incidentData, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.assignTeams(incidentData), errorHandler);
	}

	// assignRequest
	assign(assignData, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.assignTeams(assignData), errorHandler);
	}
}