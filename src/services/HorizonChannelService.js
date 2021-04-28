import { Configuration, Logger, Security, Service } from 'platform/core';
import { v4 } from 'uuid';

/**
 * Channel Service Proxy (Resource Access) for the Horizon Channel Service.
 * It is not recommended to use this class directly. Instead Service classes
 * should be created to wrap portions of functionality (cards, insure, incident management, calls etc.)
 */
export class HorizonChannelService extends Service {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new HorizonChannelService());
	}

	constructor() {
		super({
			baseUrlKey: `serviceURIs.channelServiceUrl`,
			name: `HorizonChannelService`
		});

		this._version = `v2`;
		this._mocking = null;
		this._mock = null;

		this._configuration = Configuration.getInstance();
		this._logger = Logger.getInstance();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/**
	 * Determine if mocking is enabled for the specified method
	 *
	 * @param {string} mockName Mock name/method name in the config.json file
	 * @returns {Promise<boolean>} A promise for a boolean that is true if the mock is enabled
	 * @memberof HorizonChannelService
	 */
	async _mockEnabled (mockName) {
		if (this._mocking === null) {
			try {
				this._mocking = await this._configuration.getSetting(`mock`);

				// Disable mocking in the SLDC environments. Only for local development
				if (this._configuration.config.runtime.environment !== `LOCAL`) {
					this._mocking = { enabled: false }; 
					this._logger.log(`info`, `Channel Service Mocking has been automatically disabled as the application is not running locally.`, `_mockEnabled`);
				}
			} catch {
				// disable mocking if the setting is not present
				this._mocking = { enabled: false }; 
				this._logger.log(`info`, `Channel Service Mocking has been automatically disabled as no configuration is present.`, `_mockEnabled`);
			}

			if (this._mocking.enabled) {
				// Dynamically load the configured mocks
				this._logger.log(`info`, `Channel Service Mocking is enabled.`, `_mockEnabled`);
				this._mock = new (await import(`../mocks/HorizonChannelServiceMocks`)).HorizonChannelServiceMocks();
				await this._mock.initialise(this._mocking);
			}
		}

		// Check if mocking is switched off globally
		if (!this._mocking.enabled) {
			return false;
		}

		// Check if specified mock is configured and enabled
		if (Object.prototype.hasOwnProperty.call(this._mocking, mockName)) {
			return this._mocking[mockName].enabled;
		}

		return false;
	}

	/**
	 * Wraps the platform's post method
	 * 
	 *    - Debug logging is added over the platform's post capability
	 *    - A correlation id is generated for purposes of tracing calls through the UI and CS logs.
	 *
	 * @param {string} url The Channel Service URL
	 * @param {Object} model The request model
	 * @param {Object} customHeaders Any custom headers
	 * @param {string} caller The name of the method for logging purposes
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {AbortController} [controller=null] The abort controller used to cancel file uploads, i.e. only works with FormData as model type.
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
* 
	 * @returns {Promise<*>} The response of the Channel Service Request
	 * @memberof HorizonChannelService
	 */
	async _post(url, model, customHeaders, caller, isBinary, controller, sla, timeout) {
		const correlationId = v4();
		
		this._logger.log(`debug`, `url: ${url}, body: ${JSON.stringify(model)}`, caller, correlationId);

		try {
			const response = await super.httpClient.request({
				method: `POST`,
				url: url,
				model: model,
				customHeaders: customHeaders,
				correlationId: correlationId,
				isBinary: isBinary,
				controller: controller,
				sla: sla,
				timeout: timeout,
				caller: caller
			});
	
			this._logger.log(`debug`, `result: ${JSON.stringify(response)}`, caller, correlationId);
	
			return response;
		} catch (exception) {
			exception.requestUrl = url;
			exception.requestModel = model;
			exception.requestCaller = caller;
			throw exception;
		}
	}

	/**
	 * Wrap's the platform's get method
	 *
	 *    - Debug logging is added over the platform's get capability
	 *    - A correlation id is generated for the purposes of tracing calls through the UI and CS logs
	 * 
	 * @param {string} url The Channel Service URL
	 * @param {Object} customHeaders Any custom headers
	 * @param {string} caller The name of the method for logging purposes
	 * @returns {Promise<*>} The response of the Channel Service REquest
	 * @memberof HorizonChannelService
	 */
	async _get(url, customHeaders, caller) {
		const correlationId = v4();
			
		this._logger.log(`debug`, `url: ${url}`, caller, correlationId);

		try {
			const response = await super.httpClient.get(url, customHeaders, correlationId);

			this._logger.log(`debug`, `result: ${JSON.stringify(response)}`, caller, correlationId);

			return response;
		} catch (exception) {
			exception.requestUrl = url;
			exception.requestModel = null;
			exception.requestCaller = caller;
			throw exception;
		}
	}

	/**
	 * Wraps the platform's put method
	 * 
	 * - Debug logging is added over the platform's post capability
	 * - A correlation id is generated for purposes of tracing calls through the UI and CS logs.
	 *
	 * @param {string} url The Channel Service URL
	 * @param {Object} model The request model
	 * @param {Object} customHeaders Any custom headers
	 * @param {string} caller The name of the method for logging purposes
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {AbortController} [controller=null] The abort controller used to cancel file uploads, i.e. only works with FormData as model type.
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
* 
	 * @returns {Promise<*>} The response of the Channel Service Request
	 * @memberof HorizonChannelService
	 */
	async _put(url, model, customHeaders, caller, isBinary, controller, sla, timeout) {
		const correlationId = v4();
		
		this._logger.log(`debug`, `url: ${url}, body: ${JSON.stringify(model)}`, caller, correlationId);

		try {
			const response = await super.httpClient.request({
				method: `PUT`,
				url: url,
				model: model,
				customHeaders: customHeaders,
				correlationId: correlationId,
				isBinary: isBinary,
				controller: controller,
				sla: sla,
				timeout: timeout,
				caller: caller
			});

			this._logger.log(`debug`, `result: ${JSON.stringify(response)}`, caller, correlationId);

			return response;
		} catch (exception) {
			exception.requestUrl = url;
			exception.requestModel = model;
			exception.requestCaller = caller;
			throw exception;
		}
	}

	/**
	 * The X-User-Token is required by some calls where the Product Services/Capabilities services 
	 * makes calls to OpenBancs 2/Way Gate in order to retreive the agent's BANCS/SBL teller number
	 *
	 * @returns {object} The X-User-Token custom header object
	 * @memberof HorizonChannelService
	 */
	_setToken() {
		return {
			"X-User-Token": Security.getInstance().token
		};
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// -------------------
	// Accept Call Methods
	// -------------------

	/**
	 * Records the information on an incoming call
	 *
	 * @param {Object} incomingCallData Incoming call information
	 * @returns {Promise<*>} Caller information if the call is originating from a verified number
	 * @memberof HorizonChannelService
	 */
	async acceptCall(incomingCallData) {
		if (await this._mockEnabled(`acceptCall`)) {
			return this._mock.acceptCall(incomingCallData);
		}

		const url = `/clientcare/call/${this._version}/accept-call?` +
			`incomingTelephoneNumber=${incomingCallData.incomingTelephoneNumber}&` +
			`voiceReferenceNumber=${incomingCallData.voiceReferenceNumber}&` +
			`ivrOptionCode=${incomingCallData.ivrOptionCode}&` +
			`incidentReferenceNumber=${incomingCallData.incidentReferenceNumber}&` +
			`agentTelephoneNumber=${incomingCallData.agentTelephoneNumber}`;

		return this._get(url, this._setToken(), `acceptCall`);
	}

	// addCallerDetailsRequest
	addCallerDetails(callerData) {
		const url = `/clientcare/card/${this._version}/caller/addcallerdetails`;
		const model = {
			'incomingTelephoneNumber': callerData.incomingNumber,
			'voiceReferenceNumber': callerData.voiceReference,
			'ivrOptionCode': callerData.ivrOption,
			'incidentReferenceNumber': callerData.incidentNo,
			'agentTelephoneNumber': callerData.agentPhoneNumber
		};

		return this._post(url, model, this._setToken(), `addCallerDetails`);
	}

	// ----------------
	// End Call Methods
	// ----------------
	
	// stopCardRequest
	stopCard(stopCardRequest) {

		/*
		const cardStopResponse = { 
							cardResponses: stopCardRequest.cards.map((card) => ({ maskedCardNumber: card.maskedCardNumber,
								result: {
									statusCode: 400
								  } }))
		};

		return cardStopResponse;
		*/
	
		
		const url = `/clientcare/card/${this._version}/StopCard`;
		const model = {
			"cards": stopCardRequest.cards,
			"incomingTelephoneNumber": stopCardRequest.incomingTelephoneNumber,
			"voiceReferenceNumber": stopCardRequest.voiceReferenceNumber,
			"ivrOptionCode": stopCardRequest.ivrOptionCode,
			"incidentReferenceNumber": stopCardRequest.incidentReferenceNumber,
			"agentTelephoneNumber": stopCardRequest.agentTelephoneNumber,
			"incidentRecId": stopCardRequest.incidentRecId
		};

		return this._post(url, model, this._setToken(), `stopCard`);
	}

	// loadAssignRequest
	assignTeams(incidentData) {
		return this._post(
			`/clientcare/card/${this._version}/Assign/Teams`, {
				"cardIds": incidentData.cardIds,
				"incidentRecId": incidentData.incidentRecId
			},
			this._setToken(),
			`assignTeams`
		);
	}

	// assignRequest
	assign(assignData) {
		return this._post(
			`/clientcare/card/${this._version}/Assign`, {
				"cardIds": assignData.cardIds,
				"incidentRecId": assignData.incidentRecId,
				"team": assignData.Everyteam
			},
			this._setToken(),
			`assign`
		);
	}

	// -----------------------
	// Identify Caller Methods
	// -----------------------

	// confirmedClientProfileRequest
	async identifyCaller(callerData) {
		if (await this._mockEnabled(`stopCard`)) {
			return this._mock.stopCard();
		}

		const url = `/clientcare/card/${this._version}/LoadConfirmedClientProfile`;
		const model = {
			'incidentRecId': callerData.incidentRecId,
			'idNumber': callerData.idNumber,
			'incomingTelephoneNumber': callerData.incomingTelephoneNumber,
			'voiceReferenceNumber': callerData.voiceReferenceNumber,
			'ivrOptionCode': callerData.ivrOptionCode,
			'incidentReferenceNumber': callerData.incidentReferenceNumber,
			'agentTelephoneNumber': callerData.agentTelephoneNumber,
			'nonClientFullName': callerData.nonClientFullName,
			'nonClientCellPhone': callerData.nonClientCellPhone,
			'nonClientIDNumber': callerData.nonClientIDNumber,
			'nonClientRelationship': callerData.nonClientRelationship
		};

		return this._post(url, model, this._setToken(), `identifyCaller`);
	}

	// searchOptionsRequest
	searchOptions(incomingCallData) {
		return this._post(
			`/clientcare/card/${this._version}/search/options`, {
				"incomingTelephoneNumber": incomingCallData.incomingTelephoneNumber,
				"voiceReferenceNumber": incomingCallData.voiceReferenceNumber,
				"ivrOptionCode": incomingCallData.ivrOptionCode,
				"incidentReferenceNumber": incomingCallData.incidentReferenceNumber,
				"agentTelephoneNumber": incomingCallData.agentTelephoneNumber
			},
			this._setToken(),
			`searchOptions`
		);
	}

	searchCaller(clientInfo) {
		return this._get(
			`/clientcare/call/${this._version}/search-caller?` +
				`incomingTelephoneNumber=${clientInfo.incomingTelephoneNumber}&` +
				`voiceReferenceNumber=${clientInfo.voiceReferenceNumber}&` +
				`ivrOptionCode=${clientInfo.ivrOption}&` +
				`incidentReferenceNumber=${clientInfo.incidentNo}&` +
				`agentTelephoneNumber=${clientInfo.agentTelephoneNumber}&` +
				`identificationMethod=${parseInt(clientInfo.identificationMethod, 10)}&` +
				`value=${clientInfo.searchValue}`,
				this._setToken(),
			`searchCaller`
		);
	}

	// ------------------
	// Initialise Methods
	// ------------------
	initialise() {
		const url = `/clientcare/initialise/${this._version}`;

		return this._get(url, this._setToken(), `initialise`);
	}

	// ----------------
	// Incident Methods
	// ----------------

	createIncident(createIncidentRequest) {
		const url = `/clientcare/incident/${this._version}/create-incident`;
		const model = createIncidentRequest;

		return this._post(url, model, this._setToken(), `createIncident`);
	}

	updateIncidentClientDetails(cifNumber, incidentRecId) {
		const request = {
			incidentRecId: incidentRecId,
			cif: cifNumber
		};

		return this._post(`/clientcare/incident/${this._version}/UpdateIncidentClientDetails`, request, this._setToken(), `updateIncidentClientDetails`);
	}

	updateIncidentNonClientDetails(incidentRecId, nonClientDetails) {
		nonClientDetails.incidentRecId = incidentRecId;

		return this._post(`/clientcare/incident/${this._version}/addcaller/nonclient`, nonClientDetails, this._setToken(), `updateIncidentNonClientDetails`);
	}

	/**
	 * Loads the list of reasons to display on the end call dialog.
	 *
	 * @param {Object} request Request to get close incident reasons
	 * @returns {Promise<*>} A list of end call reasons for the end call dialog
	 * @memberof HorizonChannelService
	 */
	 closeIncidentOptions(request) {
		return this._get(
			`/clientcare/incident/${this._version}/close-incident?` +
				`IsReassigned=${request.isReassigned}&` +
				`CloseIncidentContext=${request.CloseIncidentContext}`,
				this._setToken(), 
			`closeIncidentOptions`
		);
	}

	closeIncident(closeIncidentRequest) {
		const url = `/clientcare/incident/${this._version}/close-incident?` +
						`IncidentRecId=${closeIncidentRequest.incidentRecId}&` +
						`Reason=${closeIncidentRequest.reason}&` +
						`Resolution=${closeIncidentRequest.resolution}&` +
						`CauseCode=${closeIncidentRequest.causeCode}&`;

		return this._put(url, null, this._setToken(), `closeIncident`);
	}

	classifyIncident(classifyIncidentRequest) {
		const url = `/clientcare/incident/${this._version}/classification`;
	
		return this._post(url, classifyIncidentRequest, this._setToken(), `classifyIncident`);
	}

	// --------------
	// INSURE METHODS
	// --------------

	async hasInsuranceProducts(insuranceClientInfo) {
		if (await this._mockEnabled(`hasInsuranceProducts`)) {
			return this._mock.hasInsuranceProducts();
		}

		const url = `/clientcare/insure/${this._version}/landing?` +
			`IdNumber=${insuranceClientInfo.IdNumber}&` +
			`Cif=${insuranceClientInfo.CifNumber}&` +
			`IsCallerVerified=${insuranceClientInfo.isCallerVarified}`;

		return this._get(url, this._setToken(), `hasInsuranceProducts`);
	}

	addNonClientDetails(callerData) {
		return this._post(
			`/clientcare/insure/${this._version}/addCaller/nonclient`, {
				'incidentRecId': callerData.incidentRecId,
				'ivrOptionCode': callerData.ivrOptionCode,
				'incomingTelephoneNumber': callerData.incomingTelephoneNumber,
				'firstName': callerData.firstName,
				'surname': callerData.surname,
				'cellPhone': callerData.cellPhone
			},
			this._setToken(), 
			`addNonClientDetails`
		);
	}

	calculatePremiumDone(feedbackDetails) {
		return this._post(
			`/clientcare/insure/${this._version}/CalculatePremium/done`, {
				'incidentRecId': feedbackDetails.incidentRecId,
				'feedback': feedbackDetails.feedback,
				'updateIncident': feedbackDetails.updateIncident
			},
			this._setToken(),
			`calculatePremiumDone`
		);
	}

	// ----------------
	// call - ITA & XDS
	// ----------------

	itaVerification(request) {
		return this._get(`/clientcare/call/${this._version}/ita-verification?CifNumber=${request.cifNumber}&` + 
									`ConnectionId=${request.connectionID}`, this._setToken(), `itaVerification`);
    }

	async digitalVerificationChannelsAvailable(cifNumber) {
		if (await this._mockEnabled(`digitalVerificationChannelsAvailable`)) {
			if (this._mocking.digitalVerificationChannelsAvailable.positiveCase) {
				return this._mocking.digitalVerificationChannelsAvailable.positiveCase;
			}
			return false;
		}

		return this._get(`/clientcare/call/${this._version}/has-digital-verification-capability?Cif=${cifNumber}`, this._setToken(), `digitalVerificationChannelsAvailable`);
	}

	async xdsQuestions(clientID) {
		if (await this._mockEnabled(`xdsQuestions`)) {
			if (this._mocking.xdsQuestions.substituteIdOnly && this._mocking.xdsQuestions.substituteIdOnly !== ``) {
				clientID = this._mocking.xdsQuestions.substituteIdOnly;
			} else {
				return this._mock.xdsQuestions(clientID);
			}
		}

		return this._get(`/clientcare/call/${this._version}/xds-questions?clientID=${clientID}`, this._setToken(), `xdsQuestions`);
	}

	async verifySecurityQuestions(answers) {
		if (await this._mockEnabled(`verifySecurityQuestions`)) {
			return this._mock.verifySecurityQuestions(answers);
		}

		return this._post(`/clientcare/call/${this._version}/xds-questions`, answers, this._setToken(), `verifySecurityQuestions`);
	}

	// ------------------
	// Favourites Methods
	// ------------------

	async favouritesLanding(clientInfo) {
		if (await this._mockEnabled(`favouritesLanding`)) {
			return this._mock.favouritesLanding(clientInfo);
		}

		const url = `/clientcare/favourites/${this._version}/landing?` +
			`CifNumber=${clientInfo.cifNumber}&` +
			`NationalIDNumber=${clientInfo.nationalIDNumber}&` +
			`IsCallerVerified=${clientInfo.isCallerVerified}`;

		return this._get(url, this._setToken(), `favouritesLanding`);
	}

	// ------------------
	// card - card limits
	// ------------------

	async cardLimitsLanding(cifNumber) {
		if (await this._mockEnabled(`cardLimitsLanding`)) {
			return this._mock.cardLimitsLanding(cifNumber);
		}
		const url = `/clientcare/card/${this._version}/limits-landing?` +
					`cifNumber=${cifNumber}`;
		return this._get(url, this._setToken(), `cardLimitsLanding`);
	}

	async getCardLimits(cardDetails) {
		if (await this._mockEnabled(`cardLimits`)) {
			return this._mock.getCardLimits();
		}
		const url = `/clientcare/card/${this._version}/temporary-limits`;
		return this._get(url, this._setToken(), `cardLimitsLanding`);
	}


	// ------------------
	// tap - to - pay
	// ------------------

	async tapToPayLanding(cifNumber) {
		if (await this._mockEnabled(`tapToPayLanding`)) {
			return this._mock.tapToPay(cifNumber);
		}

		const url = `/clientcare/card/${this._version}/tap-to-pay-landing?${cifNumber}`;
		return this._get(url, this._setToken(), `tapToPay`);
	}

	// --------------------------
	// card - debi-check mandates
	// --------------------------

	async debiCheckMandates(cifNumber) {
		if (await this._mockEnabled(`debiCheckMandates`)) {
			return this._mock.debiCheckMandates(cifNumber);
		}
		const url = `/clientcare/debicheck/${this._version}/client/${cifNumber}/mandates`;
		return this._get(url, this._setToken(), `debiCheckMandates`);
	}

	async debiCheckDetails(cifNumber, mandateId, registerId) {
		if (await this._mockEnabled(`debiCheckDetails`)) {
			return this._mock.debiCheckDetails(cifNumber, mandateId, registerId);
		}
		const url = `/clientcare/debicheck/${this._version}/client/${cifNumber}/mandate/${mandateId}/register/${registerId}/details`;
		return this._get(url, this._setToken(), `debiCheckDetails`);
	}

	debiCheckDecline (cifNumber, mandateReferenceNumber, debtorAccountNumber) {
		const url = `/clientcare/debicheck/${this._version}/client/${cifNumber}/mandate/${mandateReferenceNumber}/account/${debtorAccountNumber}/decline`;
		return this._post(url, model, this._setToken(), `debiCheckDecline`);
	}
	
	itaVerification(request) {
		return super.httpClient.get(`/clientcare/call/${this._version}/ita-verification?CifNumber=${request.cifNumber}&` + 
									`ConnectionId=${request.connectionID}`);
    }

    sendProofOfAccount(clientInfo) {
        const url = `/clientcare/documents/${this._version}/statements/send-proof-of-account`;
        return this._post(url, clientInfo, this._setToken(), `sendProofOfAccount`);
    }

    viewProofOfAccount(clientInfo) {
        const url = `/clientcare/documents/${this._version}/statements/view-proof-of-account`;
        return this._post(url, clientInfo, this._setToken(), `viewProofOfAccount`);
	}

	// ---------------
	// Savings Account
	// ---------------

	async savingsAccountLanding (cifNumber, nationalIDNumber, getGenericData) {
		if (await this._mockEnabled(`savingsAccountLanding`)) {
			return this._mock.savingsAccountLanding(cifNumber, nationalIDNumber, getGenericData);
		}

		const url = `/clientcare/savingsaccount/${this._version}/landing?` +
		`CifNumber=${cifNumber}&` +
		`NationalIDNumber=${nationalIDNumber}&` +
		`GetGenericData=${getGenericData}`;
		
		return this._get(url, this._setToken(), `savingsAccountLanding`);
	}  

	async transactionHistory (transactionHistoryRequest) {
		if (await this._mockEnabled(`transactionHistory`)) {
			return this._mock.transactionHistory(transactionHistoryRequest);
		}

		const url = `/clientcare/savingsaccount/${this._version}/client/transactions?` + 
		`CIFNumber=${transactionHistoryRequest.cifNumber}&` +
		`AccountNumber=${transactionHistoryRequest.accountNumber}&` +
		`AccountType=${transactionHistoryRequest.accountType}&` +
		`StartDate=${transactionHistoryRequest.startDate}&` +
		`EndDate=${transactionHistoryRequest.endDate}&` +
		`StartAtIndex=${transactionHistoryRequest.startAtIndex}&` +
		`MaxResults=${transactionHistoryRequest.maxResults}&` +
		`MoneyType=${transactionHistoryRequest.moneyType}`;

		return this._get(url, this._setToken(), `transactionHistory`);
	}

	// -----------
	// Other Needs
	// -----------

	otherNeedCategories(orgUnit) {
		const url = `/clientcare/incident/${this._version}/categories?` +
		`OrgUnit=${encodeURIComponent(orgUnit)}`;
		return this._get(url, this._setToken(), `otherNeedCategories`);
	}

	otherNeedSpecificNeed(orgUnit, categoryName) {
		const url = `/clientcare/incident/${this._version}/need?` +
		`OrgUnit=${encodeURIComponent(orgUnit)}&` +
		`CategoryName=${encodeURIComponent(categoryName)}`;
		return this._get(url, this._setToken(), `otherNeedSpecificNeed`);
	}

	otherNeedIssueType(orgUnit, categoryName, need) {
		const url = `/clientcare/incident/${this._version}/issue?` +
		`OrgUnit=${encodeURIComponent(orgUnit)}&` +
		`CategoryName=${encodeURIComponent(categoryName)}&` +
		`Need=${encodeURIComponent(need)}`;
		return this._get(url, this._setToken(), `otherNeedIssueType`);
	}

	sendStatement(statement) {
		const url = `/clientcare/documents/${this._version}/statements/send-statement`;
		return this._post(url, statement, this._setToken(), `sendStatement`);
	}

	async viewStatement(statement) {

		if (await this._mockEnabled(`viewStatements`)) {
			return this._mock.viewStatements();
		}

		const url = `/clientcare/documents/${this._version}/statements/view-statement`;
		return this._post(url, statement, this._setToken(), `viewStatement`);
	}

	getClientProducts(request) {
		const url = `/clientcare/documents/${this._version}/statements/client/${request.cifNumber}?` +
					`ProductStatus=${request.status}`;
		return this._get(url, this._setToken(), `getClientProducts`);
	}

	// ----------------
	// Access Channels 
	// ----------------

	accessChannel(cifNumber) {
		const url = `/clientcare/accesschannels/${this._version}/access-channels?cif=${cifNumber}`;
		return this._get(url, this._setToken(), `accessChannels`);
	}
}