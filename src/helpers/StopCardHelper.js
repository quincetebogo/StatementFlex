import { StopCardService } from '../services/StopCardService';
import mockResponse from '../../mocks/IdentifyCallerResponseMock';

export default class StopcardHelper {

	static getInstance() {
		return this.instance || (this.instance = new StopcardHelper());
	}

	// --------------
	// INITIALISATION
	// --------------

	constructor() {

	}

	identifyCaller(data) {
		let identifyCallerPromise = StopCardService.getInstance().identifyCaller(data);

		return identifyCallerPromise.then((response) => {
			data.cards = response.cards;
			data.clientPersonalInfo = response.clientPersonalInformation;
			data.notAuthorizedLink = response.notAuthorizedLink;
			data.authorized = response.authorized;
			data.clientInsights = response.clientInsights;
			data.clientAccess = response.clientAccess;

			return data;
		}, (error) => {
			/**
			 * Need to removed this hard coded values, when Identify Caller channel service is ready
			 */
			data.cards = mockResponse.cards;
			data.clientPersonalInfo = mockResponse.clientPersonalInfo;
			data.notAuthorizedLink = mockResponse.notAuthorizedLink;
			data.authorized = mockResponse.authorized;
			data.clientInsights = mockResponse.clientInsights;
			data.clientAccess = mockResponse.clientAccess;

			return data;
		});
	}
}