
import { HorizonChannelService } from './HorizonChannelService';
import { ServiceCallHelper } from '../utils/serviceCallHelper';

export class CardService {
	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		this.channelService = HorizonChannelService.getInstance();
	}

	// --------------
	// EVENT HANDLERS
	// --------------


	// --------------
	// PUBLIC METHODS
	// --------------

	async stopCards(cardsToStop, callerInfo, toggleBusyFunc, errorHandler = null) {
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

		const serviceCallHelper = new ServiceCallHelper(
			toggleBusyFunc,
			errorHandler
		);

		const stopCardResponse = await serviceCallHelper.asyncCall(this.channelService.stopCard(stopCardRequest));

		if (stopCardResponse && stopCardResponse.cardResponses) {
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

		return cardStopResults;
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------
}