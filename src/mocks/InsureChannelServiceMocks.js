
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

		// Funeral
		this.productParamsMocks = await this._loadMockModule(this.productParamsMocks, `insureProductParams`, () => import(`../mocks/insure/funeral/ProductParams`).catch(err => logError(err)));
		this.clientSummaryMocks = await this._loadMockModule(this.clientSummaryMocks, `insureClientSummary`, () => import(`../mocks/insure/funeral/ClientSummary`).catch(err => logError(err)));
		this.policySummaryMocks = await this._loadMockModule(this.policySummaryMocks, `insurePolicySummary`, () => import(`../mocks/insure/funeral/PolicySummary`).catch(err => logError(err)));
		this.createPolicyMocks = await this._loadMockModule(this.createPolicyMocks, `insureCreatePolicy`, () => import(`../mocks/insure/funeral/CreatePolicy`).catch(err => logError(err)));
		this.cancelPolicyMocks = await this._loadMockModule(this.cancelPolicyMocks, `insureCancelPolicy`, () => import(`../mocks/insure/InsureSuccessResponse`).catch(err => logError(err)));
		this.policyPayMocks = await this._loadMockModule(this.policyPayMocks, `insurePolicyPay`, () => import(`../mocks/insure/InsureSuccessResponse`).catch(err => logError(err)));
		this.transactionHistoryMocks = await this._loadMockModule(this.transactionHistoryMocks, `insurePolicyTransactionHistory`, () => import(`../mocks/insure/funeral/PolicyTransactionHistory`).catch(err => logError(err)));
		this.prepareUpdateMocks = await this._loadMockModule(this.prepareUpdateMocks, `insurePrepareUpdate`, () => import(`../mocks/insure/funeral/PrepareUpdate`).catch(err => logError(err)));
		this.calculateQuoteMocks = await this._loadMockModule(this.calculateQuoteMocks, `insureCalculateQuote`, () => import(`../mocks/insure/funeral/QuoteCalc`).catch(err => logError(err)));
		this.sendEmailMocks = await this._loadMockModule(this.sendEmailMocks, `insureSendEmail`, () => import(`../mocks/insure/InsureSuccessResponse`).catch(err => logError(err)));
		this.insureEstimatePrintoutMocks = await this._loadMockModule(this.insureEstimatePrintoutMocks, `insureEstimatePrintout`, () => import(`../mocks/insure/funeral/GenericDocumentResponse`).catch(err => logError(err)));
		this.generateIssueAgreementMocks = await this._loadMockModule(this.generateIssueAgreementMocks, `insureGenerateIssueAgreement`, () => import(`../mocks/insure/funeral/GenericDocumentResponse`).catch(err => logError(err)));
		this.generateAgreementMocks = await this._loadMockModule(this.generateAgreementMocks, `insureGenerateAgreement`, () => import(`../mocks/insure/funeral/InsureAgreement`).catch(err => logError(err)));
		this.policyAcceptMocks = await this._loadMockModule(this.policyAcceptMocks, `insurePolicyAccept`, () => import(`../mocks/insure/funeral/PolicyAccept`).catch(err => logError(err)));
		this.policyReissueMocks = await this._loadMockModule(this.policyReissueMocks, `insurePolicyReissue`, () => import(`../mocks/insure/funeral/PolicyReissue`).catch(err => logError(err)));
		this.commsHistoryMocks = await this._loadMockModule(this.commsHistoryMocks, `insureCommsHistory`, () => import(`../mocks/insure/funeral/CommunicationHistory`).catch(err => logError(err)));
		this.claimsMocks = await this._loadMockModule(this.claimsMocks, `insureClaims`, () => import(`./insure/ClientClaims`).catch(err => logError(err)));
		this.requestCallbackMocks = await this._loadMockModule(this.requestCallbackMocks, `insureRequestCallback`, () => import(`../mocks/insure/InsureSuccessResponse`).catch(err => logError(err)));
		this.arrearsMocks = await this._loadMockModule(this.arrearsMocks, `insureArrears`, () => import(`../mocks/insure/funeral/InsureArrears`).catch(err => logError(err)));
		this.estimateMocks = await this._loadMockModule(this.estimateMocks, `insureCalculateEstimate`, () => import(`../mocks/insure/funeral/InsureCalculateEstimate`).catch(err => logError(err)));

		// Life
		this.lifeClientSummaryMocks = await this._loadMockModule(this.lifeClientSummaryMocks, `insureLifeClientSummary`, () => import(`../mocks/insure/life/LifeClientSummary`).catch(err => logError(err)));
		this.lifeCancelPolicyMocks = await this._loadMockModule(this.lifeCancelPolicyMocks, `insureLifeCancelPolicy`, () => import(`../mocks/insure/life/LifeCancelPolicy`).catch(err => logError(err)));
		this.lifeGetMandatesMocks = await this._loadMockModule(this.lifeGetMandatesMocks, `insureLifeGetMandates`, () => import(`../mocks/insure/life/LifeGetMandates`).catch(err => logError(err)));
		this.lifeGetArrearsMocks = await this._loadMockModule(this.lifeGetArrearsMocks, `insureLifeGetArrears`, () => import(`../mocks/insure/life/LifeGetArrears`).catch(err => logError(err)));
		this.lifeGetPolicyMocks = await this._loadMockModule(this.lifeGetPolicyMocks, `insureLifeGetPolicy`, () => import(`../mocks/insure/life/LifeGetPolicy`).catch(err => logError(err)));
		this.lifePayArrearsMocks = await this._loadMockModule(this.lifePayArrearsMocks, `insureLifePayArrears`, () => import(`../mocks/insure/life/LifePayArrears`).catch(err => logError(err)));
		this.insureLifeQuestionnaireMocks = await this._loadMockModule(this.insureLifeQuestionnaireMocks, `insureLifeQuestionnaire`, () => import(`../mocks/insure/life/LifeHealthQuestionnaire`).catch(err => logError(err)));
		this.lifePremiumHistoryMocks = await this._loadMockModule(this.lifePremiumHistoryMocks, `insureLifePremiumHistory`, () => import(`../mocks/insure/life/LifePremiumHistory`).catch(err => logError(err)));
		this.lifeSMSHistoryMocks = await this._loadMockModule(this.lifeSMSHistoryMocks, `insureLifeSMSHistory`, () => import(`../mocks/insure/life/LifeSMSHistory`).catch(err => logError(err)));
		this.genericLifeDocumentMocks = await this._loadMockModule(this.genericLifeDocumentMocks, `insureGenericLifeDocument`, () => import(`../mocks/insure/life/GenericLifeDocument`).catch(err => logError(err)));
		this.lifeAllowedCoverMocks = await this._loadMockModule(this.lifeAllowedCoverMocks, `insureAllowedCover`, () => import(`../mocks/insure/life/LifeAllowedCover`).catch(err => logError(err)));
		this.lifeClientQualifiesMocks = await this._loadMockModule(this.lifeClientQualifiesMocks, `insureLifeClientQualifies`, () => import(`../mocks/insure/life/LifeQualifies`).catch(err => logError(err)));
		this.lifeIssuePolicyMocks = await this._loadMockModule(this.lifeIssuePolicyMocks, `insureLifeIssuePolicy`, () => import(`../mocks/insure/life/LifeIssuePolicy`).catch(err => logError(err)));
		this.lifeReIssuePolicyMocks = await this._loadMockModule(this.lifeReIssuePolicyMocks, `insureLifeReIssuePolicy`, () => import(`../mocks/insure/life/LifeReIssuePolicy`).catch(err => logError(err)));
		this.lifeAcceptPolicyMocks = await this._loadMockModule(this.lifeAcceptPolicyMocks, `insureLifeAcceptPolicy`, () => import(`../mocks/insure/life/LifeAcceptPolicy`).catch(err => logError(err)));
		this.lifeUpdatePolicyMocks = await this._loadMockModule(this.lifeUpdatePolicyMocks, `insureLifeUpdatePolicy`, () => import(`../mocks/insure/life/LifeUpdatePolicy`).catch(err => logError(err)));
		this.lifeUpdatePocketMocks = await this._loadMockModule(this.lifeUpdatePocketMocks, `insureLifeUpdatePocket`, () => import(`../mocks/insure/life/LifeUpdatePocket`).catch(err => logError(err)));
		this.lifeCoverAvailableMocks = await this._loadMockModule(this.lifeCoverAvailableMocks, `insureLifeCoverAvailable`, () => import(`../mocks/insure/life/LifeCoverAvailable`).catch(err => logError(err)));
		this.lifeIncreaseCoverMocks = await this._loadMockModule(this.lifeIncreaseCoverMocks, `insureLifeIncreaseCover`, () => import(`../mocks/insure/life/LifeIncreaseCover`).catch(err => logError(err)));
		this.lifeCalcIncreaseCoverPremiumMocks = await this._loadMockModule(this.lifeCalcIncreaseCoverPremiumMocks, `insureLifeCalcIncreaseCoverPremium`, () => import(`../mocks/insure/life/LifeCalcIncreaseCoverPremium`).catch(err => logError(err)));

		this.electOptionMocks = await this._loadMockModule(this.electOptionMocks, `insureElectOption`, () => import(`../mocks/insure/InsureElectOption`).catch(err => logError(err)));
	}

	// #region FUNERAL

	/**
	 * Product parameters mock check
	 * @returns {Object} Mock response data
	 */
	insureProductParams() {
		if (this._mockSettings.insureProductParams.positiveCase) {
			return this.productParamsMocks.ProductParams;
		}
		return null;
	}

	/**
	 * Client policies mock check
	 * @returns {Object} Mock response data
	 */
	insureClientSummary() {
		if (this._mockSettings.insureClientSummary.positiveCase) {
			return this.clientSummaryMocks.ClientSummary;
		}
		return null;
	}

	/**
	 * fetch mock data for policy transactions
	 * @param {Object} policyTransactionHistoryRequest request payload 
	 * @returns {Object} Mock transactions data
	 */
	insurePolicyTransactionHistory() {
		if (this._mockSettings.insurePolicyTransactionHistory.positiveCase) {
			return this.transactionHistoryMocks.PolicyTransactionHistory;
		}

		// Code for a negative case could come here
		return null;
	}

	/**
	 * Policy summary mock check
	 * @returns {Object} Mock response data
	 */
	insurePolicySummary() {
		if (this._mockSettings.insurePolicySummary.positiveCase) {
			return this.policySummaryMocks.PolicySummary;
		}
		return null;
	}

	/**
	 * Reinstate Policy Quote Calc mock check
	 * @returns {Object} Mock response data
	 */
	reinstateQuoteCalc() {
		if (this._mockSettings.insurePolicyReissue.positiveCase) {
			return this.policyReissueMocks.PolicyReissue;
		}
		return null;
	}

	/**
	 * Estimate Printout Calc mock check
	 * @returns {Object} Mock response data
	 */
	insureEstimatePrintout() {
		if (this._mockSettings.insureEstimatePrintout.positiveCase) {
			return this.insureEstimatePrintoutMocks.GenericDocumentResponse;
		}
		return null;
	}

	/**
	 * Create Policy Mock data
	 * @returns {Object} Mock response data
	 */
	createPolicy() {
		if (this._mockSettings.insureCreatePolicy.positiveCase) {
			return this.createPolicyMocks.CreatePolicy;
		}
		return null;
	}

	/**
	 * Calculate Quote mock check
	 * @returns {Object} Mock response data
	 */
	calculateQuote() {
		if (this._mockSettings.insureCalculateQuote.positiveCase) {
			return this.calculateQuoteMocks.QuoteCalc;
		}
		return null;
	}

	/**
	 * Prepare update mock check
	 * @returns {Object} Mock response data
	 */
	prepareUpdate() {
		if (this._mockSettings.insurePrepareUpdate.positiveCase) {
			return this.prepareUpdateMocks.PrepareUpdate;
		}
		return null;
	}

	/**
	 * Prepare update mock check
	 * @returns {Object} Mock response data
	 */
	policyAccept() {
		if (this._mockSettings.insurePolicyAccept.positiveCase) {
			return this.policyAcceptMocks.PolicyAccept;
		}
		return null;
	}

	/**
	 * Claims List
	 * @returns {Object} Mock response data
	 */
	insureClaims() {
		if (this._mockSettings.insureClaims.positiveCase) {
			return this.claimsMocks.Claims;
		}
		return null;
	}

	/**
	 * Generate agreement / Sample content, not specific to a Agreement
	 * @returns {Object} Mock response data
	 */
	generateAgreement() {
		if (this._mockSettings.insureGenerateAgreement.positiveCase) {
			return this.generateAgreementMocks.InsureAgreement;
		}
		return null;
	}

	/**
	 * Generate Issue agreement / Sample content, not specific to a Agreement
	 * @returns {Object} Mock response data
	 */
	generateIssueAgreement() {
		if (this._mockSettings.insureGenerateIssueAgreement.positiveCase) {
			return this.generateIssueAgreementMocks.InsureAgreement;
		}
		return null;
	}

	/**
	 * Email Funeral Documents Response
	 * @returns {Object} Mock response data
	 */
	insureSendEmail() {
		if (this._mockSettings.insureSendEmail.positiveCase) {
			return this.sendEmailMocks.InsureSuccessResponse;
		}
		return null;
	}

	/**
	 * communication History mock check
	 * @returns {Object} Mock response data
	 */
	insureCommsHistory() {
		if (this._mockSettings.insureCommsHistory.positiveCase) {
			return this.commsHistoryMocks.CommsHistory;
		}
		return null;
	}

	/**
	 * Cancel Policy mock check
	 * @returns {Object} Mock response data
	 */
	insureCancelPolicy() {
		if (this._mockSettings.insureCancelPolicy.positiveCase) {
			return this.cancelPolicyMocks.CancelPolicy;
		}
		return null;
	}

	/**
	 * Cancel Policy mock check
	 * @returns {Object} Mock response data
	 */
	insurePolicyPay() {
		if (this._mockSettings.insurePolicyPay.positiveCase) {
			return this.policyPayMocks.InsureCancelPolicyMockData;
		}
		return null;
	}

	insureRequestCallback() {
		if (this._mockSettings.insureRequestCallback.positiveCase) {
			return this.requestCallbackMocks.insureRequestCallback;
		}
		return null;
	}
	
	insureArrears() {
		if (this._mockSettings.insureArrears.positiveCase) {
			return this.arrearsMocks.InsureArrears;
		}
		return null;
	}

	insureCalculateEstimate() {
		if (this._mockSettings.insureCalculateEstimate.positiveCase) {
			return this.estimateMocks.InsureCalculateEstimate;
		}
		return null;
	}

	// #endregion FUNERAL

	// #region LIFE
	
	/**
	 * Policy summary mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeClientSummary() {
		if (this._mockSettings.insureLifeClientSummary.positiveCase) {
			return this.lifeClientSummaryMocks.insureLifeClientSummary;
		}
		return null;
	}

	/**
	 * Cancel life policy mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeCancelPolicy() {
		if (this._mockSettings.insureLifeCancelPolicy.positiveCase) {
			return this.lifeCancelPolicyMocks.insureLifeCancelPolicy;
		}
		return null;
	}

	/**
	 * Get Mandates policy mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeGetMandates() {
		if (this._mockSettings.insureLifeGetMandates.positiveCase) {
			return this.lifeGetMandatesMocks.insureLifeGetMandates;
		}
		return null;
	}

	/**
	 * Get Arrears policy mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeGetArrears() {
		if (this._mockSettings.insureLifeGetArrears.positiveCase) {
			return this.lifeGetArrearsMocks.insureLifeGetArrears;
		}
		return null;
	}
	
	/**
	 * Pay Arrears policy mock check
	 * @returns {Object} Mock response data
	 */
	insureLifePayArrears() {
		if (this._mockSettings.insureLifePayArrears.positiveCase) {
			return this.lifePayArrearsMocks.insureLifePayArrears;
		}
		return null;
	}

	/**
	 * Premium History policy mock check
	 * @returns {Object} Mock response data
	 */
	insureLifePremiumHistory() {
		if (this._mockSettings.insureLifePremiumHistory.positiveCase) {
			return this.lifePremiumHistoryMocks.insureLifePremiumHistory;
		}
		return null;
	}

	/**
	 * Get Policy mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeGetPolicy() {
		if (this._mockSettings.insureLifeGetPolicy.positiveCase) {
			return this.lifeGetPolicyMocks.insureLifeGetPolicy;
		}
		return null;
	}

	/**
	 * Get Policy mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeQuestionnaire() {
		if (this._mockSettings.insureLifeQuestionnaire.positiveCase) {
			return this.insureLifeQuestionnaireMocks.insureLifeQuestionnaire;
		}
		return null;
	}

	/**
	 * Premium History policy mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeSMSHistory() {
		if (this._mockSettings.insureLifeSMSHistory.positiveCase) {
			return this.lifeSMSHistoryMocks.insureLifeSMSHistory;
		}
		return null;
	}

	/**
	 * life generic doc mock check
	 * @returns {Object} Mock response data
	 */
	insureGenericLifeDocument() {
		if (this._mockSettings.insureGenericLifeDocument.positiveCase) {
			return this.genericLifeDocumentMocks.insureGenericLifeDocument;
		}
		return null;
	}

	/**
	 * life allowed cover mock check
	 * @returns {Object} Mock response data
	 */
	insureAllowedCover() {
		if (this._mockSettings.insureAllowedCover.positiveCase) {
			return this.lifeAllowedCoverMocks.insureAllowedCover;
		}
		return null;
	}

	/**
	 * life re-issue mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeReIssuePolicy() {
		if (this._mockSettings.insureLifeReIssuePolicy.positiveCase) {
			return this.lifeReIssuePolicyMocks.insureLifeReIssuePolicy;
		}
		return null;
	}

	/**
	 * life issue policy mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeIssuePolicy() {
		if (this._mockSettings.insureLifeIssuePolicy.positiveCase) {
			return this.lifeIssuePolicyMocks.insureLifeIssuePolicy;
		}
		return null;
	}

	/**
	 * life client qualifies mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeClientQualifies() {
		if (this._mockSettings.insureLifeQualifies.positiveCase) {
			return this.lifeClientQualifiesMocks.insureLifeQualifies;
		}
		return null;
	}
	
	/**
	 * life accept policy mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeAcceptPolicy() {
		if (this._mockSettings.insureLifeAcceptPolicy.positiveCase) {
			return this.lifeAcceptPolicyMocks.insureLifeAcceptPolicy;
		}
		return null;
	}

		
	/**
	 * life update policy mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeUpdatePolicy() {
		if (this._mockSettings.insureLifeUpdatePolicy.positiveCase) {
			return this.lifeUpdatePolicyMocks.insureLifeUpdatePolicy;
		}
		return null;
	}
	
	/**
	 * life update pocket mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeUpdatePocket() {
		if (this._mockSettings.insureLifeUpdatePocket.positiveCase) {
			return this.lifeUpdatePocketMocks.insureLifeUpdatePocket;
		}
		return null;
	}
	
	/**
	 * life update pocket mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeCoverAvailable() {
		if (this._mockSettings.insureLifeCoverAvailable.positiveCase) {
			return this.lifeCoverAvailableMocks.insureLifeCoverAvailable;
		}
		return null;
	}

	/**
	 * life increase cover mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeIncreaseCover() {
		if (this._mockSettings.insureLifeIncreaseCover.positiveCase) {
			return this.lifeIncreaseCoverMocks.insureLifeIncreaseCover;
		}
		return null;
	}

	/**
	 * life calc increase cover premium mock check
	 * @returns {Object} Mock response data
	 */
	insureLifeCalcIncreaseCoverPremium() {
		if (this._mockSettings.insureLifeCalcIncreaseCoverPremium.positiveCase) {
			return this.lifeCalcIncreaseCoverPremiumMocks.insureLifeCalcIncreaseCoverPremium;
		}
		return null;
	}

	// #endregion LIFE
	
	insureElectOption() {
		if (this._mockSettings.insureElectOption.positiveCase) {
			return this.electOptionsMocks.InsureElectOption;
		}
		return null;
	}
}