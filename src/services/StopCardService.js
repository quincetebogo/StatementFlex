import { HttpClient } from 'platform/HttpClient';
import { Configuration } from 'platform/Configuration';

export class StopCardService {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new StopCardService());
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
	async acceptCall(incomingCallData) {
		console.log('acceptCall : incomingCallDate =', incomingCallData);
		return await this._getClient().post(`/horizon/acceptcall/${this.version}/caller`, {
			'incomingTelephoneNumber': incomingCallData.IncomingTelephoneNumber,
			'voiceReferenceNumber': incomingCallData.VoiceReferenceNumber,
			'ivrOptionCode': incomingCallData.IVROptionCode,
			'incidentReferenceNumber': incomingCallData.IncidentReferenceNumber,
			'agentTelephoneNumber': incomingCallData.AgentTelephoneNumber
		});
	}

	async addCallerDetails(callerData) {
		return await this._getClient().post(`/horizon/acceptcall/${this.version}/caller/addcallerdetails`, {
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
		return await this._getClient().get(`/horizon/endcall/${this.version}/Options`);
	}

	async endCall(incidentNumber, reasonCode) {
		return await this._getClient().post(`/horizon/endcall/${this.version}`,
			{
				"incidentReferenceNumber": incidentNumber,
				"endReason": reasonCode,
				"incidentDetails": null
			});
	}

	async stopCard(card) {
		return await this._getClient().post(`/horizon/endcall/${this.version}/StopCard`,
			{
				"incomingTelephoneNumber": card.incomingTelephoneNumber,
				"voiceReferenceNumber": card.voiceReferenceNumber,
				"ivrOptionCode": card.ivrOptionCode,
				"incidentReferenceNumber": card.incidentReferenceNumber,
				"agentTelephoneNumber": card.agentTelephoneNumber,
				"cardId": card.cardId,
				"accountNumber": card.accountNumber,
				"stopReason": card.stopReason
			});
	}


	// -----------------------
	// Identify Caller Methods
	// -----------------------

	async identifyCaller(callerData) {
		return await this._getClient().post(`/horizon/identifycaller/${this.version}`, {
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
			// 'verifiedTelephoneNumber': callerData.verifiedTelephoneNumber,
		});
	}

	async searchOptions(incomingCallData) {
		return await this._getClient().post(`/horizon/identifycaller/${this.version}/search/options`, {
			"incomingTelephoneNumber": incomingCallData.incomingTelephoneNumber,
			"voiceReferenceNumber": incomingCallData.voiceReferenceNumber,
			"ivrOptionCode": incomingCallData.ivrOptionCode,
			"incidentReferenceNumber": incomingCallData.incidentReferenceNumber,
			"agentTelephoneNumber": incomingCallData.agentTelephoneNumber
		});
	}

	async searchCaller(clientInfo) {
		return await this._getClient().post(`/horizon/identifycaller/${this.version}/search`, {
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
		console.log('in initialise');
		let tmp = await this._getClient().get(`/horizon/initialise/${this.version}`);

		console.log(tmp);

		return tmp;
	}

	// ------------------------------------------
	// Utility Methods - not part of API Contract
	// ------------------------------------------
	isConfirmedCaller(acceptedCall) {
		return acceptedCall.addCallerDetailsButton !== undefined;
	}

	isUnverifiedCaller(acceptedCall) {
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
