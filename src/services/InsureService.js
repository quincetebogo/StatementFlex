import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';

/**
 * Channel Service Methods for Insure related functionality
 *
 * @export
 * @class InsureService
 * @deprecated - InsureService is old code that will probably be completely replaced when we finally pick up Insure
 * @extends {ChannelServiceBase}
 */
export class InsureService extends ChannelServiceBase {
	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`serviceURIs.channelServiceUrl`, 
			`HorizonChannelService`, 
			`v1`, 
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	async hasInsuranceProducts(insuranceClientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`hasInsuranceProducts`)) {
			return this.mock(`hasInsuranceProducts`);
		}

		const insuranceClientRequest = {
			'idNumber': insuranceClientInfo.idNumber,
			'cif': insuranceClientInfo.cifNumber,
			'isCallerVerified': insuranceClientInfo.isCallerVerified
		};

		return this.post(
			`/clientcare-insure-${this._version}/landing`, 
			insuranceClientRequest,
			this.setToken(),
			`addNonClientDetails`, 
			null, 
			null, 
			900,
			null,
			errorHandler,
			autoRetries
		);
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

		return this.post(
			`/clientcare-insure-${this._version}/addCaller/nonclient`, 
			nonClientDetailsRequest,
			this.setToken(),
			`addNonClientDetails`, 
			null, 
			null, 
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	calculatePremiumDone(feedbackDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/clientcare-insure-${this._version}/CalculatePremium/done`, 
			{
				'incidentRecId': feedbackDetails.incidentRecId,
				'feedback': feedbackDetails.feedback,
				'updateIncident': feedbackDetails.updateIncident
			},
			this.setToken(),
			`calculatePremiumDone`, 
			null, 
			null, 
			900,
			null,
			errorHandler,
			autoRetries
		);
	}
}