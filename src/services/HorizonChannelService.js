import { HttpClient } from 'platform/HttpClient';
import { Configuration } from 'platform/Configuration';

/**
 * Channel Service Proxy (Resource Access) for Stop Card channel. This is probably badly named as other 
 * needs such as Insure will probably be implemented using some of the same operations as below. 
 * The class may require a more generic name. 
 */
export class HorizonChannelService {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new HorizonChannelService());
	}

	constructor() {

		//channel url settings to be acquired from back end and set in config files
		this.channelUrlSetting = `serviceURIs.channelServiceUrl`;
		this.version = `v1`;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// -------------------
	// Accept Call Methods
	// -------------------

	// callerConfirmRequest
	async acceptCall(incomingCallData) {
		return await this._getClient().post(`/clientcare/card/${this.version}/caller`, {
			'incomingTelephoneNumber': incomingCallData.IncomingTelephoneNumber,
			'voiceReferenceNumber': incomingCallData.VoiceReferenceNumber,
			'ivrOptionCode': incomingCallData.IVROptionCode,
			'incidentReferenceNumber': incomingCallData.IncidentReferenceNumber,
			'agentTelephoneNumber': incomingCallData.AgentTelephoneNumber
		});
	}

	// addCallerDetailsRequest
	async addCallerDetails(callerData) {
		return await this._getClient().post(`/clientcare/card/${this.version}/caller/addcallerdetails`, {
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

	async endCallOptions() {
		return await this._getClient().get(`/clientcare/card/${this.version}/Options`);
	}

	// endCallSession
	async endCall(incidentRecId, reasonCode) {
		return await this._getClient().post(`/clientcare/card/${this.version}/EndCallerSession`,
			{
				"incidentRecId": incidentRecId,
				"endReason": reasonCode,
			});
	}

	// stopCardRequest
	async stopCard(stopCardRequest) {
		return await this._getClient().post(`/clientcare/card/${this.version}/StopCard`,
			{
				"cards": stopCardRequest.cards,
				"incomingTelephoneNumber": stopCardRequest.incomingTelephoneNumber,
				"voiceReferenceNumber": stopCardRequest.voiceReferenceNumber,
				"ivrOptionCode": stopCardRequest.ivrOptionCode,
				"incidentReferenceNumber": stopCardRequest.incidentReferenceNumber,
				"agentTelephoneNumber": stopCardRequest.agentTelephoneNumber,
			});
	}

	// loadAssignRequest
	async assignTeams(incidentData) {
		return await this._getClient().post(`/clientcare/card/${this.version}/Assign/Teams`,
			{
				"cardIds": incidentData.cardIds,
				"incidentRecId": incidentData.incidentRecId
			}
		);
	}

	// assignRequest
	async assign(assignData) {
		return await this._getClient().post(`/clientcare/card/${this.version}/Assign`,
			{
				"cardIds": assignData.cardIds,
				"incidentRecId": assignData.incidentRecId,
				"team": assignData.team
			}
		);
	}

	// -----------------------
	// Identify Caller Methods
	// -----------------------

	// confirmedClientProfileRequest
	async identifyCaller(callerData) {
		return await this._getClient().post(`/clientcare/${this.version}/LoadConfirmedClientProfile`, {
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
	async searchOptions(incomingCallData) {
		return await this._getClient().post(`/clientcare/card/${this.version}/search/options`, {
			"incomingTelephoneNumber": incomingCallData.incomingTelephoneNumber,
			"voiceReferenceNumber": incomingCallData.voiceReferenceNumber,
			"ivrOptionCode": incomingCallData.ivrOptionCode,
			"incidentReferenceNumber": incomingCallData.incidentReferenceNumber,
			"agentTelephoneNumber": incomingCallData.agentTelephoneNumber
		});
	}

	// searchForClientRequest
	async searchCaller(clientInfo) {
		return await this._getClient().post(`/clientcare/card/${this.version}/search`, {
			"incomingTelephoneNumber": clientInfo.incomingTelephoneNumber,
			"voiceReferenceNumber": clientInfo.voiceReferenceNumber,
			"ivrOptionCode": clientInfo.ivrOption,
			"incidentReferenceNumber": clientInfo.incidentNo,
			"agentTelephoneNumber": clientInfo.agentTelephoneNumber,
			"identificationMethod": parseInt(clientInfo.identificationMethod),
			"value": clientInfo.searchValue
		});
	}

	// -----------------
	// Initialise Method
	// -----------------
	async initialise() {
		return await this._getClient().get(`/clientcare/initialise/${this.version}`);
	}

	// newIncidentRequest
	async createIncident(createIncidentRequest) {
		return await this._getClient().post(`/clientcare/initialise/${this.version}/CreateIncident`, createIncidentRequest);
	}

	// ------------------------------------------
	// Utility Methods - not part of API Contract
	// ------------------------------------------
	isConfirmedCaller(acceptedCall) {
		if (acceptedCall === null || acceptedCall === undefined) {
			return false;
		}
		return acceptedCall.addCallerDetailsButton !== undefined;
	}

	isUnverifiedCaller(acceptedCall) {
		if (acceptedCall === null || acceptedCall === undefined) {
			return false;
		}
		return !this.isConfirmedCaller(acceptedCall);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _getChannelUrl() {
		//getting the channel url setting from URIs
		let url = await Configuration.getInstance().getSetting(this.channelUrlSetting);
		console.log(url);
		return url;
	}

	_getClient() {
		return HttpClient.getInstance(this._getChannelUrl());
	}
}
