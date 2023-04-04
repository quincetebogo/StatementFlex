import { HttpStatusError } from 'platform/core/errors/HttpStatusError';

/**
 * Mocks for methods in the HorizonChannelService class
 */
export default class HorizonChannelServiceMocks {

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

		const logError = (err) => {
			console.log(err);
		};
		
		this.callMocks = await loadMockModule(this.callMocks, `acceptCall`, () => import(`../mocks/CallMocks`).catch(err => logError(err)));
		this.callMocks = await loadMockModule(this.callMocks, `searchCaller`, () => import(`../mocks/CallMocks`).catch(err => logError(err)));
		this.callMocks = await loadMockModule(this.callMocks, `getClientConsent`, () => import(`../mocks/CallMocks`).catch(err => logError(err)));
		this.callMocks = await loadMockModule(this.callMocks, `putClientConsent`, () => import(`../mocks/CallMocks`).catch(err => logError(err)));
		this.favouritesMocks = await loadMockModule(this.favouritesMocks, `favouritesLanding`, () => import(`../mocks/QuickTransactionMocks`).catch(err => logError(err)));
		this.cardLimitsMocks = await loadMockModule(this.cardLimitsMocks, `cardLimitsLanding`, () => import(`../mocks/CardLimitsMock`).catch(err => logError(err)));
		this.cardLimitsMocks = await loadMockModule(this.cardLimitsMocks, `getTemporaryLimits`, () => import(`../mocks/CardLimitsMock`).catch(err => logError(err)));
		this.cardLimitsMocks = await loadMockModule(this.cardLimitsMocks, `getCardLimitsAgreement`, () => import(`../mocks/CardLimitsMock`).catch(err => logError(err)));
		this.mandatesMocks = await loadMockModule(this.mandatesMocks, `debiCheckMandates`, () => import(`../mocks/DebiCheckMockData`).catch(err => logError(err)));
		this.mandatesMocks = await loadMockModule(this.mandatesMocks, `debiCheckDetails`, () => import(`../mocks/DebiCheckMockData`).catch(err => logError(err)));
		this.mandatesMocks = await loadMockModule(this.mandatesMocks, `debiCheckApprove`, () => import(`../mocks/DebiCheckMockData`).catch(err => logError(err)));
		this.mandatesMocks = await loadMockModule(this.mandatesMocks, `debiCheckAgreement`, () => import(`../mocks/DebiCheckMockData`).catch(err => logError(err)));
		this.securityQuestionMocks = await loadMockModule(this.securityQuestionMocks, `xdsQuestions`, () => import(`../mocks/SecurityQuestions`).catch(err => logError(err)));
		this.stopCardLandingMocks = await loadMockModule(this.stopCardLandingMocks, `stopCardLanding`, () => import(`../mocks/StopCardMockData`).catch(err => logError(err)));
		this.hasInsuranceProductsMock = await loadMockModule(this.hasInsuranceProductsMock, `hasInsuranceProducts`, () => import(`../mocks/HasInsuranceProductsMock`).catch(err => logError(err)));
		this.transactionHistoryMocks = await loadMockModule(this.transactionHistoryMocks, `transactionHistory`, () => import(`../mocks/TransactionHistoryMockData`).catch(err => logError(err)));
		this.transactionHistoryMocks = await loadMockModule(this.transactionHistoryMocks, `savingsPlanTransactionHistory`, () => import(`../mocks/TransactionHistoryMockData`).catch(err => logError(err)));
		this.savingsAccountMocks = await loadMockModule(this.savingsAccountMocks, `savingsAccountLanding`, () => import(`../mocks/SavingsAccountMocks`).catch(err => logError(err)));  
		this.savingsAccountMocks = await loadMockModule(this.savingsAccountMocks, `savingsPlanLanding`, () => import(`../mocks/SavingsAccountMocks`).catch(err => logError(err)));
		this.viewStatementsMock = await loadMockModule(this.viewStatementsMock, `viewStatements`, () => import(`../mocks/ViewStatementMock`).catch(err => logError(err)));
		this.tapToPayMocks = await loadMockModule(this.tapToPayMocks, `tapToPayLanding`, () => import(`../mocks/CardLimitsMock`).catch(err => logError(err)));
		this.liveBetterLandingMocks = await loadMockModule(this.liveBetterLandingMocks, `liveBetterLanding`, () => import(`../mocks/LiveBetterLandingMocks`).catch(err => logError(err)));
		this.clientInsightsMocks = await loadMockModule(this.clientInsightsMocks, `getClientInsights`, () => import(`../mocks/ClientInsightsMocks`).catch(err => logError(err)));
		this.accessChannelsMocks = await loadMockModule(this.accessChannelsMocks, `accessChannelLanding`, () => import(`../mocks/AccessChannelsMocks`).catch(err => logError(err)));    
		this.creditMocks = await loadMockModule(this.creditMocks, `creditBalance`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
		this.creditMocks = await loadMockModule(this.creditMocks, `creditOverview`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
		this.creditMocks = await loadMockModule(this.creditMocks, `sendSettlementQuoteEmail`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
		this.creditMocks = await loadMockModule(this.creditMocks, `permissions`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
		this.creditMocks = await loadMockModule(this.creditMocks, `settleAndCloseQuote`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
		this.creditMocks = await loadMockModule(this.creditMocks, `emailPaidUpLetter`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
		this.budgetFacility = await loadMockModule(this.budgetFacility, `budgetTransferFromAccounts`, () => import(`../mocks/CreditBudgetFacilityAccounts`).catch(err => logError(err)));
		this.budgetFacility = await loadMockModule(this.budgetFacility, `confirmBudgetTransfer`, () => import(`../mocks/CreditBudgetFacilityAccounts`).catch(err => logError(err)));
		this.kbaMocks = await loadMockModule(this.kbaMocks, `loadKBA`, () => import(`../mocks/KBAMocks`).catch(err => logError(err)));
		this.unlockFTSPMocks = await loadMockModule(this.unlockFTSPMocks, `ftspUnlockOptions`, () => import(`../mocks/FtspMocks`).catch(err => logError(err)));
    	this.creditMocks = await loadMockModule(this.creditMocks, `sendSettlementQuoteEmail`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
		  this.creditMocks = await loadMockModule(this.creditMocks, `permissions`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
		  this.creditMocks = await loadMockModule(this.creditMocks, `settleAndCloseQuote`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
    	this.creditMocks = await loadMockModule(this.creditMocks, `emailPaidUpLetter`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
    	this.creditMocks = await loadMockModule(this.creditMocks, `creditStatement`, () => import(`../mocks/CreditMocks`).catch(err => logError(err)));
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

	getClientConsent() {
		if (this._mockSettings.getClientConsent.positiveCase) {
			return this.callMocks.getClientConsent;
		}
	}
	
	putClientConsent() {
		if (this._mockSettings.putClientConsent.positiveCase) {
			return this.callMocks.putClientConsent;
		}
	}

	sendCashVouchers() {
		if (this._mockSettings.sendCashVouchers.positiveCase) {
			return this.sendCashMocks.SendCashLandingMocks.TransactionHistoryResponseListModel;
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
			return this.mandatesMocks.mandateInfo;
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
		if (this._mockSettings.savingsPlanTransactionHistory.positiveCase) {
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

	ftspUnlockOptions() {
		if (this._mockSettings.ftspUnlockOptions.positiveCase) {
			return this.unlockFTSPMocks.unlockOptions;
		}
		return null;
	}

	ftspUnlockQuote() {
		if (this._mockSettings.ftspUnlockQuote.positiveCase) {
			return this.unlockFTSPMocks.unlockQuote;
		}
		return null;
	}
	
	ftspUnlockAgreement() {
		if (this._mockSettings.ftspUnlockAgreement.positiveCase) {
			return this.unlockFTSPMocks.unlockAgreement;
		}
		return null;
	}

	creditStatement() {
		if (this._mockSettings.creditStatement.positiveCase) {
			return this.creditMocks.creditStatement;
		}
		return null;
	}

	ftspUnlock() {
		if (this._mockSettings.ftspUnlock.positiveCase) {
		}
		return null;
	}
  
	getWidgetById() {
		if (this._mockSettings.getWidgetById.positiveCase) {
			return this.widgetRegistryMocks.widgetDetails;
		}

		const errPromise = new Promise(() => {
			const httpError = new HttpStatusError();
			httpError.status = 418;
			httpError.message = `Short and stout!`;
	
			throw httpError;
		});

		return errPromise;
	}  
}