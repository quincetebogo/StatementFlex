import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';

/**
 * The CreditService is used to retrieve information about clients' credit products.
 * 
 * @export
 * @class {CreditService}
 * @extends {ChannelServiceBase}
 */
export class CreditService extends ChannelServiceBase {
	
	// --------------
	// INITIALISATION
	// --------------
	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`serviceURIs.creditChannelServiceUrl`, 
			`credit-v1`, 
			`v1`,
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	async creditOverview(cifNumber, accountStatus = `All`, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		if (await this.isMockEnabled(`creditOverview`)) {
			return this.mock(`creditOverview`);
		}

		const creditOverviewRequest = {
			"cifnumber": cifNumber,
			"accountStatus": accountStatus
		};
		
		const url = `/clientcare-credit-${this._version}/credit/overview`;

		return this.post(
			url,
			creditOverviewRequest,
			this.setToken(),
			`creditOverview`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	async creditBalance(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		if (await this.isMockEnabled(`creditBalance`)) {
			if (errorHandler) {
				return this.mockWithErrorHandler(`creditBalance`, errorHandler);
			}
			return this.mock(`creditBalance`);
		}

		const creditBalanceRequest = {
			"cifnumber": cifNumber
		};

		const url = `/clientcare-credit-${this._version}/credit/balance`;

		return this.post(
			url,
			creditBalanceRequest,
			this.setToken(),
			`creditBalance`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	budgetFacility(accountNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		const budgetFacilityRequest = {
			"accountnumber": accountNumber
		};

		const url = `/clientcare-credit-${this._version}/credit/budgetaccounts/details`;

		return this.post(
			url,
			budgetFacilityRequest,
			this.setToken(),
			`budgetFacility`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	creditCardDetails(accountNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		const creditCardDetailsRequest = {
			"accountnumber": accountNumber
		};

		const url = `/clientcare-credit-${this._version}/credit/creditcard/details`;

		return this.post(
			url,
			creditCardDetailsRequest,
			this.setToken(),
			`creditCardDetails`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	accessFacilityDetails(accountNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		const accessFacilityDetailsRequest = {
			"accountnumber": accountNumber
		};

		const url = `/clientcare-credit-${this._version}/credit/accessfacility/details`;

		return this.post(
			url,
			accessFacilityDetailsRequest,
			this.setToken(),
			`accessFacilityDetails`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	termLoanDetails(accountNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		const termLoanDetailsRequest = {
			"accountnumber": accountNumber
		};

		const url = `/clientcare-credit-${this._version}/credit/loans/details`;

		return this.post(
			url,
			termLoanDetailsRequest,
			this.setToken(),
			`termLoanDetails`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	flexibleStatementList(accountNumber, creditType, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const flexibleStatementListRequest = {
			"creditType": creditType,
			"accountnumber": accountNumber
		};
		const url = `/clientcare-credit-${this._version}/credit/flexible/statementlist`;

		return this.post(
			url,
			flexibleStatementListRequest,
			this.setToken(),
			`flexibleStatementList`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	flexibleStatement(accountNumber, creditType, statementId, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const flexibleStatementRequest = {
			"creditType": creditType,
			"statementId": statementId,
			"accountNumber": accountNumber
		};
		const url = `/clientcare-credit-${this._version}/credit/flexible/statement`;

		return this.post(
			url,
			flexibleStatementRequest,
			this.setToken(),
			`flexibleStatement`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	flexibleStatementEmail (creditType, accountNumber, emailAddress, statementDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const flexibleStatementEmailRequest = {
			"creditType": creditType,
			"accountNumber": accountNumber,
			"emailAddress": emailAddress,
			"statementDetails": statementDetails
		};
		const url = `/clientcare-credit-${this._version}/credit/flexible/statement/email`;

		return this.post(
			url,
			flexibleStatementEmailRequest,
			this.setToken(),
			`flexibleStatementEmail`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	fixedStatement(accountNumber, fromDate, toDate, setdate, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		
		const fixedStatementRequest = {
			"accountNumber": accountNumber,
			"fromDate": fromDate,
			"toDate": toDate,
			"setdate": setdate
		};

		const url = `/clientcare-credit-${this._version}/credit/fixed/statement`;

		return this.post(
			url,
			fixedStatementRequest,
			this.setToken(),
			`fixedStatement`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);

	}

	fixedStatementEmail(accountNumber, emailAddress, fromDate, toDate, setdate, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		
		const fixedStatementEmailRequest = {
			"accountNumber": accountNumber,
			"emailAddress": emailAddress,
			"fromDate": fromDate,
			"toDate": toDate,
			"setDates": setdate
		};

		const url = `/clientcare-credit-${this._version}/credit/fixed/statement/email`;

		return this.post(
			url,
			fixedStatementEmailRequest,
			this.setToken(),
			`fixedStatementEmail`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	permissions(cifNumber, accNumber, productType, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		const url = `/clientcare-credit-${this._version}/credit/permission`;

		return this.post(
			url,
			{
				"accountNumber": accNumber,
				"cifNumber": cifNumber,
				"resourceIdentifierType": productType
			},
			this.setToken(),
			`permissions`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	settlementQuote(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		
		const url = `/clientcare-credit-${this._version}/credit/settlement-quote`;

		return this.post(
			url,
			request,
			this.setToken(),
			`settlementQuote`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}
	
	sendSettlementQuoteEmail(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		const url = `/clientcare-credit-v1/credit/settlement-quote/email`;

		return this.post(
			url,
			request,
			this.setToken(),
			`permission`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	async budgetTransferFromAccounts(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		
		if (await this.isMockEnabled(`budgetTransferFromAccounts`)) {
			return this.mock(`budgetTransferFromAccounts`, request);
		}

		const url = `/clientcare-credit-${this._version}/credit/budgetaccount/transfer/modal`;

		return this.post(
			url,
			request,
			this.setToken(),
			`budgetTransferFromAccounts`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	async confirmBudgetTransfer(transferDetails, callerInformation, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		
		if (await this.isMockEnabled(`confirmBudgetTransfer`)) {
			return this.mock(`confirmBudgetTransfer`, transferDetails);
		}

		const request = {
			"cifNumber": callerInformation.cifNumber,
			"creditCardAccountNumber": transferDetails.budgetAccountNumber,
			"fromAccountNumber": transferDetails.fromAccountNumber,
			"fromAccountType": transferDetails.fromAccountType,
			"authorisedAmount": transferDetails.authorisedAmount,
			"budgetSequenceNumber": transferDetails.budgetSequenceNumber,
			"caseId": null,
			"idPassportNumber": callerInformation.southAfricanIDNumber,
			"firstName": callerInformation.firstName,
			"surname": callerInformation.lastName
		};

		const url = `/clientcare-credit-${this._version}/credit/budgetaccount/transfer`;

		return this.post(
			url,
			request,
			this.setToken(),
			`confirmBudgetTransfer`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	async emailProofOfPayment(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		if (await this.isMockEnabled(`emailProofOfPayment`)) {
			return this.mock(`emailProofOfPayment`, request);
		}

		const url = `/clientcare-credit-${this._version}/credit/document/email`;

		return this.post(
			url,
			request,
			this.setToken(),
			`emailProofOfPayment`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}
}