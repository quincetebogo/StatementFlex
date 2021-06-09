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
		this.stopCardLandingMocks = await this._loadMockModule(this.stopCardLandingMocks, `stopCardLanding`, () => import(`../mocks/StopCardMockData`).catch(err => logError(err)));
		this.hasInsuranceProductsMock = await this._loadMockModule(this.hasInsuranceProductsMock, `hasInsuranceProducts`, () => import(`../mocks/HasInsuranceProductsMock`).catch(err => logError(err)));
		this.transactionHistoryMocks = await this._loadMockModule(this.transactionHistoryMocks, `transactionHistory`, () => import(`../mocks/TransactionHistoryMockData`).catch(err => logError(err)));   
		this.savingsAccountDetails = await this._loadMockModule(this.savingsAccountDetails, `savingsAccountLanding`, () => import(`../mocks/SavingsAccountMocks`).catch(err => logError(err)));
		this.viewStatementsMock = await this._loadMockModule(this.viewStatementsMock, `viewStatements`, () => import(`../mocks/ViewStatementMock`).catch(err => logError(err)));
		this.tapToPayMocks = await this._loadMockModule(this.tapToPayMocks, `tapToPayLanding`, () => import(`../mocks/CardLimitsMock`).catch(err => logError(err)));
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
			return this.cardLimitsMocks;
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

	savingsAccountLanding(cifNumber, mandateId, registerId) {
		if (this._mocking.savingsAccountLanding.positiveCase) {
			return this.savingsAccountDetails.savingsAccountDetails;
		}

		// Code for a negative case could come here
		return null;
	}

	transactionHistory(transactionHistoryRequest) {
		if (this._mocking.transactionHistory.positiveCase) {
			const transactions = this.transactionHistoryMocks.transactionHistoryMockData.transactionHistoryList.slice(transactionHistoryRequest.startAtIndex, transactionHistoryRequest.startAtIndex+transactionHistoryRequest.maxResults);
			return transactions;
		}

		// Code for a negative case could come here
		return null;
	}

	getCardLimits() {
		if (this._mocking.cardLimits.positiveCase) {
			return this.cardLimitsMocks.mockCardLimits.cardLimits;
		}

		// Code for a negative case could come here
		return null;
	}

	stopCardLanding() {
		if (this._mocking.stopCardLanding.positiveCase) {
			const mockResponse = this.stopCardLandingMocks.stopCardMockResponse;

			return mockResponse;
		}

		// Code for a negative case could come here
		return null;
	}

	stopCard(stopCardRequest) {
		const cardStopResponse = {
			cardResponses: stopCardRequest.cards.map((card) => (
				{
					maskedCardNumber: card.maskedCardNumber,
					result: {
						statusCode: this._mocking.stopCard.positiveCase ? 200 : 400
					}
				}
			))
		};

		return cardStopResponse;
	}

	hasInsuranceProducts() {
		if (this._mocking.hasInsuranceProducts.positiveCase) {
			return this.hasInsuranceProductsMock.mockHasInsuranceProducts;
		}

		// Code for a negative case could come here
		return null;
	}

	// Tap to pay function

	tapToPay(cifNumber) {

		if (this._mocking.tapToPayLanding.positiveCase) {
			return this.tapToPayMocks.mockCards;
		}
		return null;
	}

	viewStatements() {
		if (this._mocking.viewStatements.positiveCase) {
			return this.viewStatementsMock.PDF;
		}
		return null;
	}
}