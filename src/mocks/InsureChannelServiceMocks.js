
/**
 * Mocks for methods in the InsureChannelService class
 */
export default class InsureChannelServiceMocks {

	/**
	 * Load a mocking module if it has not yet been loaded
	 *
	 * @param {object} mockObj A module object, if undefined or falsy a new module object will be returned
	 * @param {string} mockName A name of a mock in the config.json file
	 * @param {function} doImport function for importing the mocking module
	 * @returns {object} The loaded module
	 * @memberof HorizonChannelServiceMocks
	 */
	_loadMockModule(mockObj, mockName, doImport) {
		if (!mockObj) {
			if (Object.prototype.hasOwnProperty.call(this._mockSettings, mockName)) {
				if (this._mockSettings[mockName].enabled) {
					return doImport();
				}
			} else {
				this._mockSettings[mockName] = { enabled: false };
			}
		}
		return mockObj;
	}

	/**
	 * Load mocking modules if required. Checks are done to ensure that a mocking module is loaded once
	 * and then only if needed.
	 *
	 * @param {object} mockSettings The mocking settings from the config.json file
	 * @returns {Promise<undefined>} The promise return type is not used
	 * @memberof HorizonChannelServiceMocks
	 */
	async initialise(mockSettings) {
		this._mockSettings = mockSettings;

		const logError = (err) => {
			console.log(err);
		};

		this.productParamsMocks = await this._loadMockModule(this.productParamsMocks, `insureProductParams`, () => import(`../mocks/insure/ProductParams`).catch(err => logError(err)));
		this.clientPoliciesMocks = await this._loadMockModule(this.clientPoliciesMocks, `insureClientPolicies`, () => import(`../mocks/insure/ClientPolicies`).catch(err => logError(err)));
	}

	/**
	 * Product parameters mock check
	 * @returns {Object} Mock response data
	 */
	insureProductParams() {
		if (this._mockSettings.insureProductParams.positiveCase) {
			return this.productParamsMocks.InsureProductParams;
		}
		return null;
	}

	/**
	 * Client policies mock check
	 * @returns {Object} Mock response data
	 */
	insureClientPolicies() {
		if (this._mockSettings.insureClientPolicies.positiveCase) {
			return this.clientPoliciesMocks.ClientPolicies;
		}
		return null;
	}
}
