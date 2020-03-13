
import { HttpClient } from 'platform/HttpClient';
import { Configuration } from 'platform/Configuration';

export class StopCardService {

	static getInstance() {
		return this.instance || (this.instance = new StopCardService());
	}

	constructor() {

		//channel url settings to be acquired from back end and set in config files
		this.channelUrlSetting = `serviceURIs.channelServiceUrl`;
		this.version = `v1`;
	}

	async _getChannelUrl() {
		//getting the channel url setting from URIs
		let url = await Configuration.getInstance().getSetting(this.channelUrlSetting);
		console.log(url);
		return url;
	}

	_getClient() {
		return HttpClient.getInstance(this._getChannelUrl());
	}

	//for hello box component
	async initialise() {
		let tmp = await this._getClient().get(`/horizon/initialise/${this.version}`);

		console.log(tmp);

		return tmp;
	}

	async acceptCall(incomingCallData) {
		return await this._getClient().post(`/horizon/acceptcall/${this.version}/caller`, {
			'incomingTelephoneNumber': incomingCallData.incomingNumber,
			'voiceReferenceNumber': incomingCallData.voiceReference,
			'ivrOptionCode': incomingCallData.ivrOption,
			'incidentReferenceNumber': incomingCallData.incidentNo,
			'agentTelephoneNumber': incomingCallData.agentPhoneNumber
		});
	}

	async identifyCaller(callerData) {
		return await this._getClient().post(`/horizon/identifycaller/${this.version}`, {
			'incomingTelephoneNumber': callerData.incomingNumber,
			'voiceReferenceNumber': callerData.voiceReference,
			'ivrOptionCode': callerData.ivrOption,
			'incidentReferenceNumber': callerData.incidentNo,
			'agentTelephoneNumber': callerData.agentPhoneNumber,
			'nonClientFullName': callerData.Name + '' + callerData.Surname,
			'nonClientCellPhone': callerData.CellPhone,
			'nonClientIDNumber': callerData.nonClientIDNumber,
			'nonClientRelationship': callerData.Relationship
		});
	}
	async addCaller(callerData) {
		return await this._getClient().post(`/horizon/acceptcall/${this.version}/caller/addcallerdetails`, {
			'incomingTelephoneNumber': callerData.incomingNumber,
			'voiceReferenceNumber': callerData.voiceReference,
			'ivrOptionCode': callerData.ivrOption,
			'incidentReferenceNumber': callerData.incidentNo,
			'agentTelephoneNumber': callerData.agentPhoneNumber
		});
		console.log("Service Called");
	}
}
