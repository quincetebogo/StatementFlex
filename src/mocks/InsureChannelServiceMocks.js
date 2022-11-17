
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
		this.clientSummaryMocks = await this._loadMockModule(this.clientSummaryMocks, `insureClientSummary`, () => import(`../mocks/insure/ClientSummary`).catch(err => logError(err)));
		this.policySummaryMocks = await this._loadMockModule(this.policySummaryMocks, `insurePolicySummary`, () => import(`../mocks/insure/PolicySummary`).catch(err => logError(err)));
		this.createPolicyMocks = await this._loadMockModule(this.createPolicyMocks, `insureCreatePolicy`, () => import(`../mocks/insure/CreatePolicy`).catch(err => logError(err)));
		this.cancelPolicyMocks = await this._loadMockModule(this.cancelPolicyMocks, `insureCancelPolicy`, () => import(`../mocks/insure/InsureSuccessResponse`).catch(err => logError(err)));
		this.policyPayMocks = await this._loadMockModule(this.policyPayMocks, `insurePolicyPay`, () => import(`../mocks/insure/InsureSuccessResponse`).catch(err => logError(err)));
		this.transactionHistoryMocks = await this._loadMockModule(this.transactionHistoryMocks, `insurePolicyTransactionHistory`, () => import(`../mocks/insure/PolicyTransactionHistory`).catch(err => logError(err)));
		this.prepareUpdateMocks = await this._loadMockModule(this.prepareUpdateMocks, `insurePrepareUpdate`, () => import(`../mocks/insure/PrepareUpdate`).catch(err => logError(err)));
		this.calculateQuoteMocks = await this._loadMockModule(this.calculateQuoteMocks, `insureCalculateQuote`, () => import(`../mocks/insure/QuoteCalc`).catch(err => logError(err)));
		this.sendEmailMocks = await this._loadMockModule(this.sendEmailMocks, `insureSendEmail`, () => import(`../mocks/insure/InsureSuccessResponse`).catch(err => logError(err)));

		this.insureEstimatePrintoutMocks = await this._loadMockModule(this.insureEstimatePrintoutMocks, `insureEstimatePrintout`, () => import(`../mocks/insure/GenericDocumentResponse`).catch(err => logError(err)));
		this.generateIssueAgreementMocks = await this._loadMockModule(this.generateIssueAgreementMocks, `insureGenerateIssueAgreement`, () => import(`../mocks/insure/GenericDocumentResponse`).catch(err => logError(err)));

		this.generateAgreementMocks = await this._loadMockModule(this.generateAgreementMocks, `insureGenerateAgreement`, () => import(`../mocks/insure/InsureAgreement`).catch(err => logError(err)));
		this.policyAcceptMocks = await this._loadMockModule(this.policyAcceptMocks, `insurePolicyAccept`, () => import(`../mocks/insure/PolicyAccept`).catch(err => logError(err)));
		this.policyReissueMocks = await this._loadMockModule(this.policyReissueMocks, `insurePolicyReissue`, () => import(`../mocks/insure/PolicyReissue`).catch(err => logError(err)));
		this.commsHistoryMocks = await this._loadMockModule(this.commsHistoryMocks, `insureCommsHistory`, () => import(`../mocks/insure/CommunicationHistory`).catch(err => logError(err)));

		this.claimsMocks = await this._loadMockModule(this.claimsMocks, `insureClaims`, () => import(`./insure/ClientClaims`).catch(err => logError(err)));
		this.auditTransactionHistoryMocks = await this._loadMockModule(this.auditTransactionHistoryMocks, `insureAuditTransactionHistory`, () => import(`../mocks/insure/InsureAuditTransactionsMockData`).catch(err => logError(err)));
	}

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
	insurePolicyTransactionHistory(policyTransactionHistoryRequest) {
		if (this._mockSettings.insurePolicyTransactionHistory.positiveCase) {
			const result = this.transactionHistoryMocks.PolicyTransactionHistory;
			const policyTrans = result.filter(x => x.contractReference === `FP123456`);
			return policyTrans[0];
		}

		// Code for a negative case could come here
		return null;
	}

	/**
	 * fetch mock data for audit transactions
	 * @param {Object} auditTransactionHistoryRequest request payload 
	 * @returns {Object} Mock transactions data
	*/
	auditTransactionHistory(auditTransactionHistoryRequest) {
		if (this._mockSettings.insureAuditTransactionHistory.positiveCase) {
			const result = this.auditTransactionHistoryMocks.AuditTransactionHistory;
			const auditTrans = result.filter(x => x.contractReference === auditTransactionHistoryRequest.contractReference);

			// TODO: should be modified below code once integrated with service
			if (auditTrans.length > 0) {
				return auditTrans[0];
			}

			return result.filter(x => x.contractReference === `FP123456`)[0];

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
	sendEmail() {
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
}