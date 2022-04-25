
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

		this.productParamsMocks = await this._loadMockModule(this.productParamsMocks, `insureProductParams`, () => import(`../mocks/InsureProductParamsMockData`).catch(err => logError(err)));
		this.calculateEstimateMocks = await this._loadMockModule(this.calculateEstimateMocks, `insureCalculateEstimate`, () => import(`../mocks/InsureCalculateEstimateMockData`).catch(err => logError(err)));
		this.calculateQuoteMocks = await this._loadMockModule(this.calculateQuoteMocks, `insureCalculateQuote`, () => import(`../mocks/InsureCalculateQuoteMockData`).catch(err => logError(err)));

		//TODO: Need to create mock data file to retrieve qutoes list
		this.retrieveQuotesListMocks = await this._loadMockModule(this.retrieveQuotesListMocks, `insureRetrieveQuotesList`, () => import(`../mocks/InsureCalculateQuoteMockData`).catch(err => logError(err)));

		//TODO: Need to create mock data file to retrieve quote details
		this.retrieveQuoteDetailsMocks = await this._loadMockModule(this.retrieveQuoteDetailsMocks, `insureRetrieveQuoteDetails`, () => import(`../mocks/InsureCalculateQuoteMockData`).catch(err => logError(err)));
		
		this.policySummaryMocks = await this._loadMockModule(this.policySummaryMocks, `insureClientPolicySummary`, () => import(`../mocks/InsurePolicySummaryMockData`).catch(err => logError(err)));
		this.transactionHistoryMocks = await this._loadMockModule(this.transactionHistoryMocks, `insurePolicyTransactionHistory`, () => import(`../mocks/InsurePolicyTransactionsMockData`).catch(err => logError(err)));
	}

	// Insure product Params
	insureProductParams() {
		if (this._mockSettings.insureProductParams.positiveCase) {
			return this.productParamsMocks.InsureProductParams;
		}
		return null;
	}

	// Calculate Estimate
	insureCalculateEstimate() {
		if (this._mockSettings.insureCalculateEstimate.positiveCase) {
			return this.calculateEstimateMocks.InsureCalculateEstimate;
		}
		return null;
	}

	// Calculate Quote
	insureCalculateQuote() {
		if (this._mockSettings.insureCalculateQuote.positiveCase) {
			return this.calculateQuoteMocks.InsureCalculateQuote;
		}
		return null;
	}

	// Calculate Quote
	insureRetrieveQuotesList() {
		if (this._mockSettings.insureRetrieveQuotesList.positiveCase) {
			return this.retrieveQuotesListMocks.InsureRetrieveQuotesList;
		}
		return null;
	}


	// Retrieve details for a single quote
	insureRetrieveQuoteDetails() {
		if (this._mockSettings.insureRetrieveQuoteDetails.positiveCase) {
			return this.retrieveQuoteDetailsMocks.InsureRetrieveQuoteDetails;
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

	//fetch mock data for policy transactions
	policyTransactionHistory(policyTransactionHistoryRequest) {
		if (this._mockSettings.insurePolicyTransactionHistory.positiveCase) {
			const result = {transactions : 
				this.transactionHistoryMocks.PolicyTransactionHistory.transactions
				.slice(policyTransactionHistoryRequest.pageIndex
					,policyTransactionHistoryRequest.pageIndex + policyTransactionHistoryRequest.totalPerPage)}
			return result;
		}

		// Code for a negative case could come here
		return null;
	}
}