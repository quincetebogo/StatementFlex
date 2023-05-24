import { HttpStatusError } from 'platform/core/errors/HttpStatusError';

/**
 * Mocks for methods in the HorizonChannelService class
 */
export default class IncidentManagementMocks {

	/**
	 * Load mocking modules if required. Checks are done to ensure that a mocking module is loaded once
	 * and then only if needed.
	 *
	 * @param {object} mockSettings The mocking settings from the config.json file
	 * @param {Function} loadMockModule Module loader function
	 * @returns {Promise<undefined>} The promise return type is not used
	 * @memberof HorizonChannelServiceMocks
	 */
	async initialise(mockSettings, loadMockModule) {
		this._mockSettings = mockSettings;
		this.callMocks = await loadMockModule(this.incidentMocks, `createIncident`, () => {});
	}

	// Mock function is async to ensure that it returns a promise
	// eslint-disable-next-line require-await
	async createIncident(incidentData) {
		const httpError = new HttpStatusError();

		httpError.status = 400;
		httpError.message = `Oh no! A fake 400!`;
	
		throw httpError;
	}
}