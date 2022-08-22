import { HttpStatusError } from 'platform/errors/HttpStatusError';

/**
 * Mocks for methods in the HorizonChannelService class
 */
export default class HorizonChannelServiceMocks {

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
		
		this.callMocks = await this._loadMockModule(this.callMocks, `acceptCall`, () => import(`../mocks/CallMocks`).catch(err => logError(err)));
		this.callMocks = await this._loadMockModule(this.callMocks, `searchCaller`, () => import(`../mocks/CallMocks`).catch(err => logError(err)));
		this.favouritesMocks = await this._loadMockModule(this.favouritesMocks, `favouritesLanding`, () => import(`../mocks/QuickTransactionMocks`).catch(err => logError(err)));
		this.cardLimitsMocks = await this._loadMockModule(this.cardLimitsMocks, `cardLimitsLanding`, () => import(`../mocks/CardLimitsMock`).catch(err => logError(err)));
		this.cardLimitsMocks = await this._loadMockModule(this.cardLimitsMocks, `getTemporaryLimits`, () => import(`../mocks/CardLimitsMock`).catch(err => logError(err)));
		this.cardLimitsMocks = await this._loadMockModule(this.cardLimitsMocks, `getCardLimitsAgreement`, () => import(`../mocks/CardLimitsMock`).catch(err => logError(err)));
		this.mandatesMocks = await this._loadMockModule(this.mandatesMocks, `debiCheckMandates`, () => import(`../mocks/DebiCheckMockData`).catch(err => logError(err)));
		this.mandatesMocks = await this._loadMockModule(this.mandatesMocks, `debiCheckDetails`, () => import(`../mocks/DebiCheckMockData`).catch(err => logError(err)));
        this.mandatesMocks = await this._loadMockModule(this.mandatesMocks, `debiCheckApprove`, () => import(`../mocks/DebiCheckMockData`).catch(err => logError(err)));
		this.mandatesMocks = await this._loadMockModule(this.mandatesMocks, `debiCheckAgreement`, () => import(`../mocks/DebiCheckMockData`).catch(err => logError(err)));
		this.securityQuestionMocks = await this._loadMockModule(this.securityQuestionMocks, `xdsQuestions`, () => import(`../mocks/SecurityQuestions`).catch(err => logError(err)));
		this.stopCardLandingMocks = await this._loadMockModule(this.stopCardLandingMocks, `stopCardLanding`, () => import(`../mocks/StopCardMockData`).catch(err => logError(err)));
		this.hasInsuranceProductsMock = await this._loadMockModule(this.hasInsuranceProductsMock, `hasInsuranceProducts`, () => import(`../mocks/HasInsuranceProductsMock`).catch(err => logError(err)));
		this.transactionHistoryMocks = await this._loadMockModule(this.transactionHistoryMocks, `transactionHistory`, () => import(`../mocks/TransactionHistoryMockData`).catch(err => logError(err)));
		this.transactionHistoryMocks = await this._loadMockModule(this.transactionHistoryMocks, `savingsPlanTransactionHistory`, () => import(`../mocks/TransactionHistoryMockData`).catch(err => logError(err)));
		this.savingsAccountMocks = await this._loadMockModule(this.savingsAccountMocks, `savingsAccountLanding`, () => import(`../mocks/SavingsAccountMocks`).catch(err => logError(err)));  
		this.savingsAccountMocks = await this._loadMockModule(this.savingsAccountMocks, `savingsPlanLanding`, () => import(`../mocks/SavingsAccountMocks`).catch(err => logError(err)));
		this.viewStatementsMock = await this._loadMockModule(this.viewStatementsMock, `viewStatements`, () => import(`../mocks/ViewStatementMock`).catch(err => logError(err)));
		this.tapToPayMocks = await this._loadMockModule(this.tapToPayMocks, `tapToPayLanding`, () => import(`../mocks/CardLimitsMock`).catch(err => logError(err)));
		this.liveBetterLandingMocks = await this._loadMockModule(this.liveBetterLandingMocks, `liveBetterLanding`, () => import(`../mocks/LiveBetterLandingMocks`).catch(err => logError(err)));
		this.clientInsightsMocks = await this._loadMockModule(this.clientInsightsMocks, `getClientInsights`, () => import(`../mocks/ClientInsightsMocks`).catch(err => logError(err)));
    	this.accessChannelsMocks = await this._loadMockModule(this.accessChannelsMocks, `accessChannelLanding`, () => import(`../mocks/AccessChannelsMocks`).catch(err => logError(err)));    
    	this.creditMocks = await this._loadMockModule(this.creditMocks, `creditBalance`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
    	this.creditMocks = await this._loadMockModule(this.creditMocks, `creditOverview`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
    	this.creditMocks = await this._loadMockModule(this.creditMocks, `sendSettlementQuoteEmail`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
		  this.creditMocks = await this._loadMockModule(this.creditMocks, `permissions`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
		  this.creditMocks = await this._loadMockModule(this.creditMocks, `settleAndCloseQuote`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
    	this.creditMocks = await this._loadMockModule(this.creditMocks, `emailPaidUpLetter`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
    	this.budgetFacility = await this._loadMockModule(this.budgetFacility, `budgetTransferFromAccounts`, () => import(`../mocks/CreditBudgetFacilityAccounts`).catch(err => logError(err)));
    	this.budgetFacility = await this._loadMockModule(this.budgetFacility, `confirmBudgetTransfer`, () => import(`../mocks/CreditBudgetFacilityAccounts`).catch(err => logError(err)));
		this.kbaMocks = await this._loadMockModule(this.kbaMocks, `loadKBA`, () => import(`../mocks/KBAMocks`).catch(err => logError(err)));
	}

	// ===============================
	// Channel Service Mocking Methods
	// ===============================
	acceptCall(incomingCallData) {
		if (this._mockSettings.acceptCall.positiveCase) {
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

	searchCaller() {
		if (this._mockSettings.searchCaller.positiveCase) {
			return this.callMocks.searchCaller;
		}
	}

	xdsQuestions(clientID) {
		if (this._mockSettings.xdsQuestions.positiveCase) {
			return this.securityQuestionMocks.securityQuestions;
		}

		return null;
	}

	verifySecurityQuestions(answers) {
		if (this._mockSettings.verifySecurityQuestions.positiveCase) {
			return `Authenticated`;
		} 

		return `not-authenticated`;
	}

	favouritesLanding(clientInfo) {
		if (this._mockSettings.favouritesLanding.positiveCase) {
			return this.favouritesMocks.favouritesLandingSuccess;
		}

		const errPromise = new Promise(() => {
			const httpError = new HttpStatusError();
			httpError.status = 400;
			httpError.message = `Oh no! A fake 400!`;
	
			throw httpError;
		});

		return errPromise;
	}

	cardLimitsLanding() {
		if (this._mockSettings.cardLimitsLanding.positiveCase) {
			return this.cardLimitsMocks.limitsLandingResponse;
		}

		// Code for a negative case could come here
		return null;
	}

	getTemporaryLimits() {
		if (this._mockSettings.getTemporaryLimits.positiveCase) {
			return this.cardLimitsMocks.temporaryLimitsResponse;
		}

		// Code for a negative case could come here
		return null;
	}

	getCardLimitsAgreement() {
		if (this._mockSettings.getCardLimitsAgreement.positiveCase) {
			return this.cardLimitsMocks.limitsAgreementResponse;
		}

		// Code for a negative case could come here
		return null;
	}

	debiCheckMandates(cifNumber) {
		if (this._mockSettings.debiCheckMandates.positiveCase) {
			return this.mandatesMocks.mockMandates;
		}

		// Code for a negative case could come here
		return null;
	}

	debiCheckDetails(cifNumber, mandateId, registerId) {
		if (this._mockSettings.debiCheckDetails.positiveCase) {
			const mandateDetails = this.mandatesMocks.mandateInfo.find((entry, index, mandateInfo) => entry.mandateId === mandateId && entry.registerId === registerId);
			if (mandateDetails) {
				return mandateDetails.mandateInfo;
			}
		}

		return null;
    }

    debiCheckApprove(mandateInfo) {
        if (this._mockSettings.debiCheckApprove.positiveCase) {
            return this.mandatesMocks.agreement;
		}

		// Code for a negative case could come here
		return null;
    }

	debiCheckDecline() {
		if (this._mockSettings.debiCheckDecline.positiveCase) {
            return true;
		}

		// Code for a negative case could come here
		return null;
	}

	debiCheckAgreement(clientInfo) {
		if (this._mockSettings.debiCheckAgreement.positiveCase) {
            return this.mandatesMocks.agreementTemplate;
		}

		// Code for a negative case could come here
		return null;
	}

	savingsAccountLanding(cifNumber, mandateId, registerId) {
		if (this._mockSettings.savingsAccountLanding.positiveCase) {
			return this.savingsAccountMocks.savingsAccountDetails;
		}

		// Code for a negative case could come here
		return null;
	}

	savingsPlanLanding(cifNumber, mandateId, registerId) {
		if (this._mockSettings.savingsPlanLanding.positiveCase) {
			return this.savingsAccountMocks.savingsPlanDetails;
		}

		// Code for a negative case could come here
		return null;
	}

	transactionHistory(transactionHistoryRequest) {
		if (this._mockSettings.transactionHistory.positiveCase) {
			const result = { transactions: this.transactionHistoryMocks.transactionHistoryMockData.transactionHistoryList.slice(transactionHistoryRequest.startAtIndex, transactionHistoryRequest.startAtIndex + transactionHistoryRequest.maxResults) };
			return result;
		}

		// Code for a negative case could come here
		return null;
	}

	savingsPlanTransactionHistory() {
		if(this._mockSettings.savingsPlanTransactionHistory.positiveCase) {
			return this.transactionHistoryMocks.savingsPlanTransactionHistory;
		}
	}

	stopCardLanding() {
		if (this._mockSettings.stopCardLanding.positiveCase) {
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
						statusCode: this._mockSettings.stopCard.positiveCase ? 200 : 400
					}
				}
			))
		};

		return cardStopResponse;
	}

	hasInsuranceProducts() {
		if (this._mockSettings.hasInsuranceProducts.positiveCase) {
			return this.hasInsuranceProductsMock.mockHasInsuranceProducts;
		}

		// Code for a negative case could come here
		return null;
	}

	// Tap to pay function

	tapToPay(cifNumber) {

		if (this._mockSettings.tapToPayLanding.positiveCase) {
			return this.tapToPayMocks.mockCards;
		}
		return null;
	}

	viewStatements() {
		if (this._mockSettings.viewStatements.positiveCase) {
			return this.viewStatementsMock.PDF;
		}
		return null;
	}

	// Live Better Mocks
	liveBetterLanding() {
		if (this._mockSettings.liveBetterLanding.positiveCase) {
			return this.liveBetterLandingMocks.LiveBetterLandingInfo;
		}

		// Code for a negative case could come here
		return null;
	}

	liveBetterTransactionHistory() {
		if (this._mockSettings.liveBetterTransactionHistory.positiveCase) {
			return this.liveBetterLandingMocks.LBBTransactionHistory;
		}

		// Code for a negative case could come here
		return null;
	}

	lbbLinkedTransactionDetails() {
		if (this._mockSettings.lbbLinkedTransactionDetails.positiveCase) {
			return this.liveBetterLandingMocks.LBBLinkedTransactionDetails;
		}

		// Code for a negative case could come here
		return null;
	}

	getClientInsights() {
		if (this._mockSettings.getClientInsights.positiveCase) {
			return this.clientInsightsMocks.insightsMocks;
		}
		return null;
	}
    
	accessChannelLanding() {
		if (this._mockSettings.accessChannelLanding.positiveCase) {
			return this.accessChannelsMocks.accessChannelsDetails;
		}
		return null;
	}

	accessChannelUssdLanding() {
		if (this._mockSettings.accessChannelUssdLanding.positiveCase) {
			return this.accessChannelsMocks.accessChannelsDetails.ussd;
		}
		return null;
	}

	suspendApp() {
		return this._mockSettings.suspendApp.positiveCase;
	}
  
	accessChannelResetSecurityTokenClock() {
		if (this._mockSettings.accessChannelResetSecurityTokenClock.positiveCase) {
			return this.accessChannelsMocks.accessChannelResetSecurityTokenClock;
		}
		return null;
	}  

	activatefullUssdMenu() {
		if (this._mockSettings.activatefullUssdMenu.positiveCase) {
			return {};
		}

		const errPromise = new Promise(() => {
			const httpError = new HttpStatusError();
			httpError.status = 400;
			httpError.message = `Oh no! A fake 400!`;
	
			throw httpError;
		});

		return errPromise;
	}

	cancelUSSD() {
		if (this._mockSettings.cancelUSSD.positiveCase) {
			return {};
		}

		const errPromise = new Promise(() => {
			const httpError = new HttpStatusError();
			httpError.status = 400;
			httpError.message = `Oh no! A fake 400!`;
	
			throw httpError;
		});

		return errPromise;
	}

	unblockSIM() {
		if (this._mockSettings.unblockSIM.positiveCase) {
			return {};
		}

		const errPromise = new Promise(() => {
			const httpError = new HttpStatusError();
			httpError.status = 400;
			httpError.message = `Oh no! A fake 400!`;
	
			throw httpError;
		});

		return errPromise;
	}

	creditOverview() {
		if (this._mockSettings.creditOverview.positiveCase) {
			return this.creditMocks.creditOverview;
		}

		const errPromise = new Promise(() => {
			const httpError = new HttpStatusError();
			httpError.status = 400;
			httpError.message = `Oh no! A fake 400!`;
	
			throw httpError;
		});

		return errPromise;
	}

	creditBalance() {
		if (this._mockSettings.creditBalance.positiveCase) {
			return this.creditMocks.creditBalance;
		}

		const errPromise = new Promise(() => {
			const httpError = new HttpStatusError();
			httpError.status = 400;
			httpError.message = `Oh no! A fake 400!`;
	
			throw httpError;
		});

		return errPromise;
	}

	creditPermissions() {
		if (this._mockSettings.creditPermissions.positiveCase) {
			return this.creditMocks.creditPermissions;
		}

		const errPromise = new Promise(() => {
			const httpError = new HttpStatusError();
			httpError.status = 400;
			httpError.message = `Oh no! A fake 400!`;
	
			throw httpError;
		});

		return errPromise;
	}

	settleAndCloseQuote () {
		if (this._mockSettings.settleAndCloseQuote.positiveCase) {
			return this.creditMocks.settleAndCloseQuote;
		}

		const errPromise = new Promise(() => {
			const httpError = new HttpStatusError();
			httpError.status = 400;
			httpError.message = `Oh no! A fake 400!`;
	
			throw httpError;
		});

		return errPromise;

	}
  
	emailPaidUpLetter() {
		if (this._mockSettings.emailPaidUpLetter.positiveCase) {
			return this.creditMocks.emailPaidUpLetter;
		}

		const errPromise = new Promise(() => {
			const httpError = new HttpStatusError();
			httpError.status = 400;
			httpError.message = `Oh no! A fake 400!`;
	
			throw httpError;
		});

		return errPromise;
	}
  
	loadKBA(identifiedBy) {
		if (this._mockSettings.loadKBA.positiveCase) {

			const questions = this.kbaMocks.questions.questionList.map(item => {

				switch (true) {
					case identifiedBy === `VERIFIEDCELLPHONENUMBER` && item.questionId === 2:
					case identifiedBy === `ACCOUNTNUMBER` && item.questionId === 3:
						item.providedAnswer = true;
						item.enabled = false;
						break;

					default:
						item.providedAnswer = false;
						item.enabled = true;
						break;
				}

				return item;
			});

			return {
				"questionList": questions
			};
		}

		return null;
	}

	verifyKBA(request) {
		if (this._mockSettings.verifyKBA.positiveCase) {
			const max = 4;
			const correctAnswers = request?.questionList.filter(item => item.providedAnswer)
														  .length;
			const reason = {
				0: `ALLCORRECTLYANSWERED`,
				1: `ONEWRONGANSWER`,
				2: `TWOWRONGANSWERS`,
				3: `THREEWRONGANSWERS`,
				4: `FOURWRONGANSWERS`
			};

			return {
				"verificationStatus": correctAnswers >= max ? `VERIFIED` : `UNVERIFIED`,
				"verificationStatusReason": reason[max - correctAnswers]
			};
		}

		return null;
	}

	sendSettlementQuoteEmail() {
		if (this._mockSettings.sendSettlementQuoteEmail.positiveCase) {
			// TODO: Add postive case data
			return [];
		}

		const errPromise = new Promise(() => {
			const httpError = new HttpStatusError();
			httpError.status = 400;
			httpError.message = `Oh no! A fake 400!`;
	
			throw httpError;
		});

		return errPromise;
	}

	budgetTransferFromAccounts() {
		if (this._mockSettings.budgetTransferFromAccounts.positiveCase) {
			return this.budgetFacility.payBudgetModalDetails;
		}
		return null;
	}

	confirmBudgetTransfer() {
		if (this._mockSettings.confirmBudgetTransfer.positiveCase) {
			return this.budgetFacility.budgetTransferDetails;
		}
		return null;
	}

	emailProofOfPayment() {
		if (this._mockSettings.emailProofOfPayment.positiveCase) {
			return {
				"isSuccess": true,
				"errorReasons": null
			};
		}
		return null;
	}
}