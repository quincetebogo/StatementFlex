import { Service } from 'platform/core';

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

		this.version = `v1`;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// -------------------
	// Accept Call Methods
	// -------------------

	/**
	 * @deprecated use acceptCall instead
	 *
	 * @param {Object} incomingCallData Incoming call information
	 * @returns {Promise<*>} Caller information if the call is originating from a verified number
	 * @memberof HorizonChannelService
	 */
	caller(incomingCallData) {
		return super.httpClient.post(`/clientcare/card/${this.version}/caller`, {
			'incomingTelephoneNumber': incomingCallData.incomingTelephoneNumber,
			'voiceReferenceNumber': incomingCallData.voiceReferenceNumber,
			'ivrOptionCode': incomingCallData.IvrOptionCode,
			'incidentReferenceNumber': incomingCallData.incidentReferenceNumber,
			'agentTelephoneNumber': incomingCallData.agentTelephoneNumber
		});
	}

	/**
	 * 
	 *
	 * @param {Object} incomingCallData Incoming call information
	 * @returns {Promise<*>} Caller information if the call is originating from a verified number
	 * @memberof HorizonChannelService
	 */
	acceptCall(incomingCallData) {
		return super.httpClient.get(`/clientcare/call/${this.version}/accept-call?` +
			`incomingTelephoneNumber=${incomingCallData.incomingTelephoneNumber}&` +
			`voiceReferenceNumber=${incomingCallData.voiceReferenceNumber}&` +
			`ivrOptionCode=${incomingCallData.ivrOption}&` +
			`incidentReferenceNumber=${incomingCallData.incidentNo}&` +
			`agentTelephoneNumber=${incomingCallData.agentTelephoneNumber}`);
	}

	// addCallerDetailsRequest
	addCallerDetails(callerData) {
		return super.httpClient.post(`/clientcare/card/${this.version}/caller/addcallerdetails`, {
			'incomingTelephoneNumber': callerData.incomingNumber,
			'voiceReferenceNumber': callerData.voiceReference,
			'ivrOptionCode': callerData.ivrOption,
			'incidentReferenceNumber': callerData.incidentNo,
			'agentTelephoneNumber': callerData.agentPhoneNumber
		});
	}

	// ----------------
	// End Call Methods
	// ----------------

	/**
	 *  endCallOptions is deprecated and will be replaced by loadEndCallOptions in future builds
	 * 
	 * @deprecated
	 *
	 * @param {Object} endCallDetails Call details including the end call reason/cause code
	 * @returns {Promise<*>} A list of end call reasons for the end call dialog
	 * @memberof HorizonChannelService
	 */
	endCallOptions(endCallDetails) {
		return super.httpClient.post(`/clientcare/card/${this.version}/Options`, {
			'isReassigned': endCallDetails.isReassigned,
			'incomingTelephoneNumber': endCallDetails.incomingTelephoneNumber,
			'voiceReferenceNumber': endCallDetails.voiceReferenceNumber,
			'ivrOptionCode': endCallDetails.ivrOptionCode,
			'incidentReferenceNumber': endCallDetails.incidentReferenceNumber,
			'agentTelephoneNumber': endCallDetails.agentTelephoneNumber
		});
	}

	/**
	 * Loads the list of reasons to display on the end call dialog.
	 * 
	 * NOTE: THE CS IMPLEMENTATION OF THIS ENDPOINT IS NOT YET DONE
	 *
	 * @param {Object} endCallDetails Call details including the end call reason/cause code
	 * @returns {Promise<*>} A list of end call reasons for the end call dialog
	 * @memberof HorizonChannelService
	 */
	loadEndCallOptions(endCallDetails) {
		return super.httpClient.get(`/clientcare/call/${this.version}/end-call?` +
			`IsReassigned=${endCallDetails.isReassigned}&` +
			`IncomingTelephoneNumber=${endCallDetails.incomingTelephoneNumber}&` +
			`VoiceReferenceNumber=${endCallDetails.voiceReferenceNumber}&` +
			`IvrOptionCode=${endCallDetails.ivrOptionCode}&` +
			`IncidentReferenceNumber=${endCallDetails.incidentReferenceNumber}&` +
			`AgentTelephoneNumber=${endCallDetails.agentTelephoneNumber}&` +
			`EndCallContext=${endCallDetails.context}`);
	}

	// endCallSession
	endCall(incidentRecId, reasonCode) {
		return super.httpClient.post(`/clientcare/card/${this.version}/EndCallerSession`, {
			"incidentRecId": incidentRecId,
			"endReason": reasonCode
		});
	}

	// stopCardRequest
	stopCard(stopCardRequest) {
		return super.httpClient.post(
			`/clientcare/card/${this.version}/StopCard`,
			{
				"cards": stopCardRequest.cards,
				"incomingTelephoneNumber": stopCardRequest.incomingTelephoneNumber,
				"voiceReferenceNumber": stopCardRequest.voiceReferenceNumber,
				"ivrOptionCode": stopCardRequest.ivrOptionCode,
				"incidentReferenceNumber": stopCardRequest.incidentReferenceNumber,
				"agentTelephoneNumber": stopCardRequest.agentTelephoneNumber
			}
		);
	}

	// loadAssignRequest
	assignTeams(incidentData) {
		return super.httpClient.post(
			`/clientcare/card/${this.version}/Assign/Teams`,
			{
				"cardIds": incidentData.cardIds,
				"incidentRecId": incidentData.incidentRecId
			}
		);
	}

	// assignRequest
	assign(assignData) {
		return super.httpClient.post(
			`/clientcare/card/${this.version}/Assign`,
			{
				"cardIds": assignData.cardIds,
				"incidentRecId": assignData.incidentRecId,
				"team": assignData.Everyteam
			}
		);
	}

	// -----------------------
	// Identify Caller Methods
	// -----------------------

	// confirmedClientProfileRequest
	identifyCaller(callerData) {
		return super.httpClient.post(`/clientcare/card/${this.version}/LoadConfirmedClientProfile`, {
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
		});
	}

	// searchOptionsRequest
	searchOptions(incomingCallData) {
		return super.httpClient.post(`/clientcare/card/${this.version}/search/options`, {
			"incomingTelephoneNumber": incomingCallData.incomingTelephoneNumber,
			"voiceReferenceNumber": incomingCallData.voiceReferenceNumber,
			"ivrOptionCode": incomingCallData.ivrOptionCode,
			"incidentReferenceNumber": incomingCallData.incidentReferenceNumber,
			"agentTelephoneNumber": incomingCallData.agentTelephoneNumber
		});
	}

	searchCaller(clientInfo) {
		return super.httpClient.get(`/clientcare/call/${this.version}/search-caller?` +
			`incomingTelephoneNumber=${clientInfo.incomingTelephoneNumber}&` +
			`voiceReferenceNumber=${clientInfo.voiceReferenceNumber}&` +
			`ivrOptionCode=${clientInfo.ivrOption}&` +
			`incidentReferenceNumber=${clientInfo.incidentNo}&` +
			`agentTelephoneNumber=${clientInfo.agentTelephoneNumber}&` +
			`identificationMethod=${parseInt(clientInfo.identificationMethod, 10)}&` +
			`value=${clientInfo.searchValue}`);
	}

	// -----------------
	// Initialise Method
	// -----------------
	initialise() {
		return super.httpClient.get(`/clientcare/initialise/${this.version}`);
	}

	// newIncidentRequest
	createIncident(createIncidentRequest) {
		return super.httpClient.post(`/clientcare/initialise/${this.version}/CreateIncident`, createIncidentRequest);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------------
	// INSURE METHODS
	// ---------------

	hasInsuranceProducts(insuranceClientInfo) {
		return super.httpClient.get(`/clientcare/insure/${this.version}/landing?` +
			`IdNumber=${insuranceClientInfo.IdNumber}&` +
			`Cif=${insuranceClientInfo.CifNumber}&` +
			`IsCallerVerified=${insuranceClientInfo.isCallerVarified}`);
	}

	addNonClientDetails(callerData) {
		return super.httpClient.post(`/clientcare/insure/${this.version}/addCaller/nonclient`, {
			'incidentRecId': callerData.incidentRecId,
			'ivrOptionCode': callerData.ivrOptionCode,
			'incomingTelephoneNumber': callerData.incomingTelephoneNumber,
			'firstName': callerData.firstName,
			'surname': callerData.surname,
			'cellPhone': callerData.cellPhone
		});
	}

	calculatePremiumDone(feedbackDetails) {
		return super.httpClient.post(`/clientcare/insure/${this.version}/CalculatePremium/done`, {
			'incidentRecId': feedbackDetails.incidentRecId,
			'feedback': feedbackDetails.feedback,
			'updateIncident': feedbackDetails.updateIncident
		});
	}

	// ----------------
	// XDS Questions Methods
	// ----------------

	xdsQuestions(clientID) {
		return super.httpClient.get(`/clientcare/call/${this.version}/xds-questions?clientID=${clientID}`);
	}

	verifySecurityQuestions(response) {
		return super.httpClient.post(`/clientcare/call/${this.version}/xds-questions`, response);
	}

	// ----------------
	// Favourites Methods
	// ----------------

	favouritesLanding(clientInfo) {
		return super.httpClient.get(`/clientcare/favourites/${this.version}/landing?` +
			`CifNumber=${clientInfo.cifNumber}&` +
			`NationalIDNumber=${clientInfo.nationalIDNumber}&` +
			`IsCallerVerified=${clientInfo.isCallerVerified}`);
	}


}