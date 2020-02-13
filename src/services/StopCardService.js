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
		return await Configuration.getInstance().getSetting(this.channelUrlSetting);
	}

	_getClient() {
		return HttpClient.getInstance(this._getChannelUrl());
	}

	//for hello box component
	async initialise() {
		return await this._getClient().get(`/horizon/initialise/${this.version}`);
	}

	async acceptCall() {
		return await this._getClient().get(`/horizon/acceptcall/${this.version}/caller`);
	}
}
