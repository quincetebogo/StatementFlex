import { SecurityContext } from 'platform/SecurityContext';
import { HorizonChannelService } from './HorizonChannelService';
import { ServiceCallHelper } from '../utils/serviceCallHelper';

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

		this.channelService = HorizonChannelService.getInstance();
	}

	// --------------
	// EVENT HANDLERS
	// --------------


	// --------------
	// PUBLIC METHODS
	// --------------

	async createIncident(incidentData, toggleBusyFunc, errorHandler = null) {
		let createIncidentRequest = {
			"networkUserName": SecurityContext.getInstance().username,
			"cli": incidentData.IncomingTelephoneNumber,
			"vdn": incidentData.VDN,
			"ucid": incidentData.VoiceReferenceNumber
		};

		//createIncidentRequest.vdn = '211377';

		let serviceCallHelper = new ServiceCallHelper(
			toggleBusyFunc,
			errorHandler
		);

		return await serviceCallHelper.asyncCall(this.channelService.createIncident(createIncidentRequest));
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------
}
