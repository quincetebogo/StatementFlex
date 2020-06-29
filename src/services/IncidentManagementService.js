
import '../utils/channelServiceUtilities';

import { Configuration } from 'platform/Configuration'
import { HttpClient } from 'platform/HttpClient';
import { SecurityContext } from 'platform/SecurityContext';

export class IncidentManagementService {
	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new IncidentManagementService());
	}

	constructor() {

		if (this.instance) {
			return this.instance;
		}

		this.channelUrlSetting = `serviceURIs.channelServiceUrl`;
	}

	// --------------
	// EVENT HANDLERS
	// --------------


	// --------------
	// PUBLIC METHODS
	// --------------

	async createIncident(incidentData) {
		console.log("New-Call : incident data : ", incidentData);
		console.log("New-Call : Security-Context : ", SecurityContext.getInstance());

		let createIncidentRequest = {
			"networkUserName": SecurityContext.getInstance().username,
			"cli": incidentData.IncomingTelephoneNumber,
			"vdn": incidentData.VDN,
			"ucid": incidentData.VoiceReferenceNumber
		};
		console.log("New-Call : Creating incident using : ", createIncidentRequest);


		//getting the channel url setting from URIs
		let url = await Configuration.getInstance().getSetting(this.channelUrlSetting);

		let client = HttpClient.getInstance(url);

		let incident = await client.post(`/horizon/initialise/v1/CreateIncident`, createIncidentRequest);
		console.log("New-Call : Incident created : ", incident);

		return incident;
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------

}
