import { HorizonChannelService } from './HorizonChannelService';
import { ServiceCallHelper } from '../utils/serviceCallHelper';

export class InsureService {
	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		this.channelService = HorizonChannelService.getInstance();
	}

	// --------------
	// EVENT HANDLERS
	// --------------


	// --------------
	// PUBLIC METHODS
	// --------------

	addNonClientDetails(incidentData, toggleBusyFunc, errorHandler = null) {
		const nonClientDetailsRequest = {
			'incidentRecId': incidentData.incidentRecId,
			'ivrOptionCode': incidentData.ivrOptionCode,
			'incomingTelephoneNumber': incidentData.incomingTelephoneNumber,
			'firstName': incidentData.firstName,
			'surname': incidentData.surname,
			'cellPhone': incidentData.cellPhone
		};

		const serviceCallHelper = new ServiceCallHelper(
			toggleBusyFunc,
			errorHandler
		);

		return serviceCallHelper.asyncCall(this.channelService.addNonClientDetails(nonClientDetailsRequest));
	}
}