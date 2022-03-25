
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

		this.insureMocks = await this._loadMockModule(this.insureMocks, `insureMocks`, () => import(`../mocks/InsureMockData`).catch(err => logError(err)));
	}

	// Insure product Params
	insureProductParams() {
		if (this._mockSettings.insureProductParams.positiveCase) {
			return this.insureMocks.InsureProductParams;
		}
		return null;
	}

	// Calculate Estimate
	insureCalculateEstimate() {
		if (this._mockSettings.insureCalculateEstimate.positiveCase) {
			return this.insureMocks.InsureCalculateEstimate;
		}
		return null;
	}

	// Calculate Quote
	insureCalculateQuote() {
		if (this._mockSettings.insureCalculateQuote.positiveCase) {
			return this.insureMocks.InsureCalculateQuote;
		}
		return null;
	}

	// Calculate Quote
	insureRetrieveQuotesList() {
		if (this._mockSettings.insureRetrieveQuotesList.positiveCase) {
			return this.insureMocks.InsureRetrieveQuotesList;
		}
		return null;
	}


	// Retrieve details for a single quote
	insureRetrieveQuoteDetails() {
		if (this._mockSettings.insureRetrieveQuoteDetails.positiveCase) {
			return this.insureMocks.InsureRetrieveQuoteDetails;
		}
		return null;
	}

	// Client Policy Summary
	insureClientPolicySummary() {
		if (this._mockSettings.insureClientPolicySummary.positiveCase) {
			return [
				{
					policyNumber: `ABC01`,
					effectiveDate: `01 Feb 2019`,
					debitOrderDate: `25 May 2019`,
					coverAmount: 35000.50,
					totalPremium: 88.50,
					status: `Active`,
					inArrears: false
				}
			];
			// return this.insureMocks.InsureClientPolicySummary;
		}
		return null;
	}
}