import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonStore } from 'app/store/HorizonStore';

/**
 * Channel Service methods for Cards related functionality
 *
 * @export
 * @class CardService
 * @extends {ChannelServiceBase}
 */
export class CardService extends ChannelServiceBase {
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

		this.horizonStore = HorizonStore.getInstance();
	}

	// --------------
	// EVENT HANDLERS
	// --------------


	// --------------
	// PUBLIC METHODS
	// --------------

	async identifyCaller(callerInformation, incomingCallDetails, incidentDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`stopCardLanding`)) {
			return this.mock(`stopCardLanding`);
		}

		const url = `/clientcare-card-${this._version}/LoadConfirmedClientProfile`;

		const model = {
			'incidentRecId': incidentDetails.incidentRecId,
			'idNumber': callerInformation.southAfricanIDNumber,
			'nonClientFullName': callerInformation.nonClientFullName,
			'nonClientCellPhone': callerInformation.nonClientCellPhone,
			'nonClientIDNumber': ``,
			'nonClientRelationship': callerInformation.nonClientRelationship
		};
	
		return this.post(
			url, 
			model, 
			this.setToken(), 
			`identifyCaller`, 
			null, 
			null, 
			1000,
			null, 
			errorHandler,
			autoRetries
		);
	};

	async stopCards(cardsToStop, callerInfo, incidentDetails, cif, title, lastName, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubsIncident(this._toggleBusyFlag);

		let cardStopResults = [];
		incidentDetails = this.horizonStore.getIncidentDetails();

		const stopCardRequest = {
			cards: cardsToStop.map((card) => ({
				cardId: card.cardNumber,
				maskedCardNumber: card.maskedCardNumber,
				cardExpiryYear: card.cardExpiryYear,
				cardExpiryMonth: card.cardExpiryMonth,
				cardSequenceNumber: card.cardSequenceNumber,
				reason: card.cardStopReason.key,
				cardDisplayName: card.cardDisplayName
			})),
			incidentRecId: incidentDetails.incidentRecId,
			title: title,
			lastName: lastName,
			cif: cif
		};

		if (await this.isMockEnabled(`stopCard`)) {
			return this.mock(`stopCard`, stopCardRequest);
		}
	
		const url = `/clientcare-card-${this._version}/StopCard`;
	
		const returnValue = await this.post(
			url, 
			stopCardRequest, 
			this.setToken(), 
			`stopCard`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	
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

		returnValue.result = cardStopResults;

		return returnValue;
 	}

	assignTeams(incidentData, errorHandler, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/clientcare-card-${this._version}/Assign/Teams`, 
			{
				"cardIds": incidentData.cardIds,
				"incidentRecId": incidentData.incidentRecId
			},
			this.setToken(),
			`assignTeams`, 
			null, 
			null, 
			900,
			null,
			errorHandler, 
			autoRetries
		);
	}

	// assignRequest
	assign(assignData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/clientcare-card-${this._version}/Assign`, 
			{
				"cardIds": assignData.cardIds,
				"incidentRecId": assignData.incidentRecId,
				"team": assignData.team
			},
			this.setToken(),
			`assign`, 
			null, 
			null, 
			900,
			null,
			errorHandler, autoRetries
		);
	}
}