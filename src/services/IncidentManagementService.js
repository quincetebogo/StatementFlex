
import '../utils/channelServiceUtilities';

import { Configuration } from 'platform/Configuration'
import { HttpClient } from 'platform/HttpClient';
import { SecurityContext } from 'platform/SecurityContext';
import { ServiceCallHelper } from '../utils/serviceCallHelper';
import { EventAggregator } from 'platform/EventAggregator';


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
		this.eventAggregator = EventAggregator.getInstance();
	}

	// --------------
	// EVENT HANDLERS
	// --------------


	// --------------
	// PUBLIC METHODS
	// --------------

	async createIncident(incidentData, toggleBusyFunc, errorHandler = null) {
		console.log("New-Call : incident data : ", incidentData);
		console.log("New-Call : Security-Context : ", SecurityContext.getInstance());

		let createIncidentRequest = {
			"networkUserName": SecurityContext.getInstance().username,
			"cli": incidentData.IncomingTelephoneNumber,
			"vdn": incidentData.VDN,
			"ucid": incidentData.VoiceReferenceNumber
		};

		//TODO: Remove hard coded value
		createIncidentRequest.vdn = '211377';

		console.log("New-Call : Creating incident using : ", createIncidentRequest);

		let serviceCallHelper = new ServiceCallHelper(
			toggleBusyFunc, // ServiceCallHelper will toggle the busy flag
			errorHandler
		);

		let incident = await serviceCallHelper.asyncCall(this._createIncident(createIncidentRequest));

		console.log("New-Call : Incident created : ", incident);

		return incident;
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _createIncident(createIncidentRequest) {

		//getting the channel url setting from URIs
		let url = await Configuration.getInstance().getSetting(this.channelUrlSetting);
		let client = HttpClient.getInstance(url);

		return await client.post(`/horizon/initialise/v1/CreateIncident`, createIncidentRequest);
	}
}
