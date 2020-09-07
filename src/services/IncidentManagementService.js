import { HorizonChannelService } from './HorizonChannelService';
import { SecurityContext } from 'platform/SecurityContext';
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

	createIncident(incidentData, toggleBusyFunc, errorHandler = null) {
		const createIncidentRequest = {
			"networkUserName": SecurityContext.getInstance().username,
			"cli": incidentData.IncomingTelephoneNumber,
			"vdn": incidentData.VDN,
			"ucid": incidentData.VoiceReferenceNumber
		};

		const serviceCallHelper = new ServiceCallHelper(
			toggleBusyFunc,
			errorHandler
		);

		return serviceCallHelper.asyncCall(this.channelService.createIncident(createIncidentRequest));
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------
}