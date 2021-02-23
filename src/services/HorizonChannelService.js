import { Logger, Security, Service } from 'platform/core';
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

		this._version = `v1`;

		this._logger = Logger.getInstance();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

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
	acceptCall(incomingCallData) {
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

		return this._post(url, model, null, `addCallerDetails`);
	}

	// ----------------
	// End Call Methods
	// ----------------

	/**
	 * Loads the list of reasons to display on the end call dialog.
	 *
	 * @param {Object} endCallDetails Call details including the end call reason/cause code
	 * @returns {Promise<*>} A list of end call reasons for the end call dialog
	 * @memberof HorizonChannelService
	 */
	loadEndCallOptions(endCallDetails) {
		return this._get(
			`/clientcare/call/${this._version}/end-call?` +
				`IsReassigned=${endCallDetails.isReassigned}&` +
				`IncomingTelephoneNumber=${endCallDetails.incomingTelephoneNumber}&` +
				`VoiceReferenceNumber=${endCallDetails.voiceReferenceNumber}&` +
				`IvrOptionCode=${endCallDetails.ivrOptionCode}&` +
				`IncidentReferenceNumber=${endCallDetails.incidentReferenceNumber}&` +
				`AgentTelephoneNumber=${endCallDetails.agentTelephoneNumber}&` +
				`EndCallContext=${endCallDetails.endCallContext}`, 
			null, 
			`loadEndCallOptions`
		);
	}

	/**
	 * Records the end call reason/cause code against an incident
	 * 
	 * @param {string} incidentRecId The Incident identfier
	 * @param {string} reasonCode The end call reason/cause code
	 * @returns {Object} Either success or a failure object
	 * @memberof HorizonChannelService
	 */
	endCall(incidentRecId, reasonCode) {
		return this._post(
			`/clientcare/call/${this._version}/end-call`, {
				"incidentRecId": incidentRecId,
				"endReason": reasonCode
			},
			null,
			`endCall`
		);
	}
	
	// stopCardRequest
	stopCard(stopCardRequest) {
		const url = `/clientcare/card/${this._version}/StopCard`;
		const model = {
			"cards": stopCardRequest.cards,
			"incomingTelephoneNumber": stopCardRequest.incomingTelephoneNumber,
			"voiceReferenceNumber": stopCardRequest.voiceReferenceNumber,
			"ivrOptionCode": stopCardRequest.ivrOptionCode,
			"incidentReferenceNumber": stopCardRequest.incidentReferenceNumber,
			"agentTelephoneNumber": stopCardRequest.agentTelephoneNumber
		};

		return this._post(url, model, null, `stopCard`);
	}

	// loadAssignRequest
	assignTeams(incidentData) {
		return this._post(
			`/clientcare/card/${this._version}/Assign/Teams`, {
				"cardIds": incidentData.cardIds,
				"incidentRecId": incidentData.incidentRecId
			},
			null,
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
			null,
			`assign`
		);
	}

	// -----------------------
	// Identify Caller Methods
	// -----------------------

	// confirmedClientProfileRequest
	identifyCaller(callerData) {
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
			null,
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

		return this._get(url, null, `initialise`);
	}

	// newIncidentRequest
	createIncident(createIncidentRequest) {
		const url = `/clientcare/initialise/${this._version}/CreateIncident`;
		const model = createIncidentRequest;

		return this._post(url, model, null, `createIncident`);
	}

	// --------------
	// INSURE METHODS
	// --------------

	hasInsuranceProducts(insuranceClientInfo) {
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
			null, 
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
			null,
			`calculatePremiumDone`
		);
	}

	// ---------------------
	// XDS Questions Methods
	// ---------------------

	xdsQuestions(clientID) {
		const url = `/clientcare/call/${this._version}/xds-questions?clientID=${clientID}`;

		return this._get(url, null, `xdsQuestions`);
	}

	verifySecurityQuestions(answers) {
		const url = `/clientcare/call/${this._version}/xds-questions`;
		const model = answers;

		return this._post(url, model, null, `verifySecurityQuestions`);
	}

	// ------------------
	// Favourites Methods
	// ------------------

	favouritesLanding(clientInfo) {
			const url = `/clientcare/favourites/${this._version}/landing?` +
				`CifNumber=${clientInfo.cifNumber}&` +
				`NationalIDNumber=${clientInfo.nationalIDNumber}&` +
				`IsCallerVerified=${clientInfo.isCallerVerified}`;

		return this._get(url, this._setToken(), `favouritesLanding`);
    }

    sendProofOfAccount(clientInfo) {
        const url = `?/clientcare?/documents?/${this._version}?/statements?/send-proof-of-account`;

        return this._get(url, this._setToken(), `sendProofOfAccount`);
    }

    viewProofOfAccount(clientInfo) {
        const url = `?/clientcare?/documents?/${this._version}?/statements?/view-proof-of-account`;

        return this._get(url, this._setToken(), `viewProofOfAccount`);
    }

}