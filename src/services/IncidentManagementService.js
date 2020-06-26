
import '../utils/channelServiceUtilities';

import { Configuration } from 'platform/Configuration'
import { HttpClient } from 'platform/HttpClient';

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
		console.log("New-Call : Creating incident using : ", incidentData);

		//getting the channel url setting from URIs
		let url = await Configuration.getInstance().getSetting(this.channelUrlSetting);

		let client = HttpClient.getInstance(url);

		let incident = await client.post(`/horizon/initialise/v1/CreateIncident`,
			{
				"networkUserName": "CP347369",
				"cli": "0845805348",
				"vdn": "200012",
				"ucid": "00001012341234567890"
			}
		);
		console.log("New-Call : Incident created : ", incident);

		return incident;
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------

}
