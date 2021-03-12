/**
 * Mocks for methods in the HorizonChannelService class
 */
export class HorizonChannelServiceMocks {

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
			if (Object.prototype.hasOwnProperty.call(this._mocking, mockName)) {
				if (this._mocking[mockName].enabled) {
					return doImport();
				}
			} else {
				this._mocking[mockName] = { enabled: false };
			}
		}
		return mockObj;
	}

	/**
	 * Load mocking modules if required. Checks are done to ensure that a mocking module is loaded once
	 * and then only if needed.
	 *
	 * @param {object} mocking The mocking settings from the config.json file
	 * @returns {Promise<undefined>} The promise return type is not used
	 * @memberof HorizonChannelServiceMocks
	 */
	async initialise(mocking) {
		this._mocking = mocking;

		const logError = (err) => {
			console.log(err);
		};

		this.callMocks = await this._loadMockModule(this.callMocks, `acceptCall`, () => import(`../mocks/CallMocks`).catch(err => logError(err)));
		this.favouritesMocks = await this._loadMockModule(this.favouritesMocks, `favouritesLanding`, () => import(`../mocks/QuickTransactionMocks`).catch(err => logError(err)));
		this.cardLimitsMocks = await this._loadMockModule(this.cardLimitsMocks, `cardLimitsLanding`, () => import(`../mocks/CardLimitsMock`).catch(err => logError(err)));
		this.mandatesMocks = await this._loadMockModule(this.mandatesMocks, `debiCheckMandates`, () => import(`../mocks/DebiCheckMockData`).catch(err => logError(err)));
		this.mandatesMocks = await this._loadMockModule(this.mandatesMocks, `debiCheckDetails`, () => import(`../mocks/DebiCheckMockData`).catch(err => logError(err)));
		this.securityQuestionMocks = await this._loadMockModule(this.securityQuestionMocks, `xdsQuestions`, () => import(`../mocks/SecurityQuestions`).catch(err => logError(err)));
		this.stopCardMocks = await this._loadMockModule(this.stopCardMocks, `stopCard`, () => import(`../mocks/StopCardMockData`).catch(err => logError(err)));
		this.hasInsuranceProductsMock = await this._loadMockModule(this.hasInsuranceProductsMock, `hasInsuranceProducts`, () => import(`../mocks/HasInsuranceProductsMock`).catch(err => logError(err)));
	}

	// ===============================
	// Channel Service Mocking Methods
	// ===============================
	acceptCall(incomingCallData) {
		if (this._mocking.acceptCall.positiveCase) {
			const mockResponse = this.callMocks.acceptCallSuccess;
			mockResponse.incidentReferenceNumber = incomingCallData.incidentReferenceNumber;
			mockResponse.ivrOptionCode = incomingCallData.ivrOptionCode;
			mockResponse.incomingTelephoneNumber = incomingCallData.incomingTelephoneNumber;
			mockResponse.agentTelephoneNumber = incomingCallData.agentTelephoneNumber;
		
			return mockResponse;
		}

		// Code for a negative case could come here
		return null;
	}

	xdsQuestions(clientID) {
		if (this._mocking.xdsQuestions.positiveCase) {
			return this.securityQuestionMocks.securityQuestions;
		}

		return null;
	}

	verifySecurityQuestions(answers) {
		if (this._mocking.verifySecurityQuestions.positiveCase) {
			return `Authenticated`;
		} 

		return `not-authenticated`;
	}

	favouritesLanding(clientInfo) {
		if (this._mocking.favouritesLanding.positiveCase) {
			return this.favouritesMocks.favouritesLandingSuccess;
		}

		// Code for a negative case could come here
		return null;
	}

	cardLimitsLanding() {
		if (this._mocking.cardLimitsLanding.positiveCase) {
			return this.cardLimitsMocks.mockCards;
		}

		// Code for a negative case could come here
		return null;
	}

	debiCheckMandates(cifNumber) {
		if (this._mocking.debiCheckMandates.positiveCase) {
			return this.mandatesMocks.mockMandates;
		}

		// Code for a negative case could come here
		return null;
	}

	debiCheckDetails(cifNumber, mandateId, registerId) {
		if (this._mocking.debiCheckDetails.positiveCase) {
			const mandateDetails = this.mandatesMocks.mandateInfo.find((entry, index, mandateInfo) => entry.mandateId === mandateId && entry.registerId === registerId);
			if (mandateDetails) {
				return mandateDetails.mandateInfo;
			}
		}

		return null;
	}

	getCardLimits() {
		if (this._mocking.cardLimits.positiveCase) {
			return this.cardLimitsMocks.mockCardLimits.cardLimits;
		}

		// Code for a negative case could come here
		return null;
	}

	stopCard() {
		if (this._mocking.stopCard.positiveCase) {
			const mockResponse = this.stopCardMocks.stopCardMockResponse;

			return mockResponse;
		}

		// Code for a negative case could come here
		return null;
	}

	hasInsuranceProducts() {
		if (this._mocking.hasInsuranceProducts.positiveCase) {
			return this.hasInsuranceProductsMock.mockHasInsuranceProducts;
		}

		// Code for a negative case could come here
		return null;
	}
    }

    viewStatementsMocks() {
        if (this._mocking.viewStatements.positiveCase) {
            return this.viewStatementsMock.PDF;
        }
        return null;
    }
}