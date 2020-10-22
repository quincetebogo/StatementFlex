
import { ServiceBase } from 'app/services/ServiceBase';

/**
 *
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

	searchCaller(clientInfo, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.searchCaller(clientInfo), errorHandler);
	}

	searchOptions(incomingCallData, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.searchOptions(incomingCallData), errorHandler);
	}

	async stopCards(cardsToStop, callerInfo, errorHandler = null) {
		let cardStopResults = [];

		const stopCardRequest = {
			cards: cardsToStop.map((card) => ({
					"cardId": card.cardId,
					"accountNumber": card.accountNumber,
					"stopReason": card.stopReason
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
					cardId: cardsToStop[index].cardId,
					cardType: cardsToStop[index].cardType,
					encryptedCardId: cardsToStop[index].encryptedCardId,
					accountNumber: cardsToStop[index].accountNumber,
					stopReason: cardsToStop[index].stopReason,
					stopped: response.result.statusCode === 200,
					errorMessage: response.result.statusCode
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