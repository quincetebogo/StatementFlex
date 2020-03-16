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

	async initialise() {
		let tmp = await this._getClient().get(`/horizon/initialise/${this.version}`);

		console.log(tmp);

		return tmp;
	}

	async acceptCall(incomingCallData) {
		console.log('acceptCall : incomingCallDate =', incomingCallData);
		return await this._getClient().post(`/horizon/acceptcall/${this.version}/caller`, {
			'incomingTelephoneNumber': incomingCallData.IncomingTelephoneNumber,
			'voiceReferenceNumber': incomingCallData.VoiceReferenceNumber,
			'ivrOptionCode': incomingCallData.IVROptionCode,
			'incidentReferenceNumber': incomingCallData.IncidentReferenceNumber,
			'agentTelephoneNumber': incomingCallData.AgentTelephoneNumber
		});

		//return await this._getClient().post(`/horizon/acceptcall/${this.version}/caller`, {
		//	'incomingTelephoneNumber': incomingCallData.IncomingTelephoneNumber,
		//	'voiceReferenceNumber': incomingCallData.VoiceReferenceNumber,
		//	'ivrOptionCode': incomingCallData.IVROptionCode,
		//	'incidentReferenceNumber': incomingCallData.IncidentReferenceNumber,
		//	'agentTelephoneNumber': incomingCallData.AgentTelephoneNumber
		//});
	}

	async identifyCaller(callerData) {
		return await this._getClient().post(`/horizon/identifycaller/${this.version}`, {
			'incomingTelephoneNumber': callerData.incomingTelephoneNumber,
			'voiceReferenceNumber': callerData.voiceReferenceNumber,
			'ivrOptionCode': callerData.ivrOption,
			'incidentReferenceNumber': callerData.incidentReferenceNumber,
			'agentTelephoneNumber': callerData.agentTelephoneNumber,
			'nonClientFullName': callerData.callerFullName,
			'nonClientCellPhone': callerData.verifiedTelephoneNumber,
			'nonClientIDNumber': callerData.southAfricanIDNumber,
			'nonClientRelationship': callerData.relationship
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
			"incomingTelephoneNumber": clientInfo.incomingNumber,
			"voiceReferenceNumber": clientInfo.voiceReference,
			"ivrOptionCode": clientInfo.ivrOptionSelected,
			"incidentReferenceNumber": clientInfo.incidentNo,
			"agentTelephoneNumber": clientInfo.agentPhoneNumber,
			"identificationMethod": parseInt(clientInfo.identificationMethod),
			"value": clientInfo.searchValue
		});
	}

	async addCaller(callerData) {
		return await this._getClient().post(`/horizon/identifycaller/${this.version}/caller/addcallerdetails`, {
			'incomingTelephoneNumber': callerData.incomingNumber,
			'voiceReferenceNumber': callerData.voiceReference,
			'ivrOptionCode': callerData.ivrOption,
			'incidentReferenceNumber': callerData.incidentNo,
			'agentTelephoneNumber': callerData.agentPhoneNumber,
			'ivrOptionCode': callerData.ivrOption,
			'incidentReferenceNumber': callerData.incidentReferenceNumber,
			'agentTelephoneNumber': callerData.agentTelephoneNumber,
			'nonClientFullName': callerData.callerFullName,
			'nonClientCellPhone': callerData.verifiedTelephoneNumber,
			'nonClientIDNumber': callerData.southAfricanIDNumber,
			'nonClientRelationship': callerData.relationship
		});
	}


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
