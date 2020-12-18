import { DEFAULT_AUTO_RETRIES, ServiceBase } from 'app/services/ServiceBase';

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

	hasInsuranceProducts(insuranceClientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.serviceCallHelper.asyncCall(this.channelService.hasInsuranceProducts(insuranceClientInfo), `hasInsuranceProducts`, errorHandler, autoRetries);
	}

	addNonClientDetails(incidentData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const nonClientDetailsRequest = {
			'incidentRecId': incidentData.incidentRecId,
			'ivrOptionCode': incidentData.ivrOptionCode,
			'incomingTelephoneNumber': incidentData.incomingTelephoneNumber,
			'firstName': incidentData.firstName,
			'surname': incidentData.surname, 
			'cellPhone': incidentData.cellPhone
		};

		return this.serviceCallHelper.asyncCall(this.channelService.addNonClientDetails(nonClientDetailsRequest), `addNonClientDetails`, errorHandler, autoRetries);
	}

	calculatePremiumDone(feedbackDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.serviceCallHelper.asyncCall(this.channelService.calculatePremiumDone(feedbackDetails), `calculatePremiumDone`, errorHandler, autoRetries);
	}

	InsureProducts(clientDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.serviceCallHelper.asyncCall(this.channelService.InsureProducts(clientDetails), `InsureProducts`, errorHandler, autoRetries);
	}

}