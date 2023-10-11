import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

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
			`serviceURIs.cardServiceUrl`, 
			`CardService`, 
			`v1`, 
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// --------------
	// EVENT HANDLERS
	// --------------


	// --------------
	// PUBLIC METHODS
	// --------------

	async identifyCaller(callerInformation, incident, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`stopCardLanding`)) {
			return this.mock(`stopCardLanding`);
		}

		const url = `/clientcare-card-${this._version}/LoadConfirmedClientProfile`;

		const model = {
			'incidentRecId': incident?.incidentId || `0`,
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

	async stopCards(cardsToStop, incident, cif, title, lastName, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		let cardStopResults = [];

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
			incidentRecId: incident?.incidentId || `0`,
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
		const todayDate = new Date();

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
				statusCode: response.result.statusCode,
				cardStoppedDate: `${todayDate.toLocaleDateString()} ${todayDate.toLocaleTimeString()}`
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
				"incident": incidentData.incident
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
				"incident": assignData.incident,
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

	async cardLimitsLanding(cifNumber, incident, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`cardLimitsLanding`)) {
			return this.mock(`cardLimitsLanding`, cifNumber);
		}

		const request = {
			"cifNumber": cifNumber,
			"incident": incident
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

	async tapToPayLanding(cifNumber, incident, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`tapToPayLanding`)) {
			return this.mock(`tapToPay`, cifNumber);
		}

		const request = {
			"cifNumber": cifNumber,
			"incident": incident
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
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

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
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

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
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

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

	async getStoppedCardDetails(callerInformation, incident, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		 if (await this.isMockEnabled(`stopCardLanding`)) {
			return this.mock(`stopCardLanding`);
		} 

		const url = `/clientcare-card-${this._version}/LoadConfirmedClientStopCard`;

		const model = {
			'incident': incident,
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
			`getStoppedCardDetails`, 
			null, 
			null, 
			1000,
			null, 
			errorHandler,
			autoRetries
		);
	};

}