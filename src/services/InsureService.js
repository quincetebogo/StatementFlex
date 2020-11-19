import { ServiceBase } from 'app/services/ServiceBase';

/**
 * Channel Service Methods for Insure related functionality
 *
 * @export
 * @class InsureService
 * @extends {ServiceBase}
 */
export class InsureService extends ServiceBase {
	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, errorHandler = null) {
		super(toggleBusyFunc, errorHandler);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	addNonClientDetails(incidentData, errorHandler = null) {
		const nonClientDetailsRequest = {
			'incidentRecId': incidentData.incidentRecId,
			'ivrOptionCode': incidentData.ivrOptionCode,
			'incomingTelephoneNumber': incidentData.incomingTelephoneNumber,
			'firstName': incidentData.firstName,
			'surname': incidentData.surname,
			'cellPhone': incidentData.cellPhone
		};

		return this.serviceCallHelper.asyncCall(this.channelService.addNonClientDetails(nonClientDetailsRequest), errorHandler);
	}

	calculatePremiumDone(feedbackDetails, errorHandler = null) {
		return this.serviceCallHelper.asyncCall(this.channelService.calculatePremiumDone(feedbackDetails), errorHandler);
	}
}