import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

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

	async creditCardDetails(accountNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

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

	async accessFacilityDetails(accountNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

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

	async termLoanDetails(accountNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

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

	async flexibleStatementEmail(creditType, accountNumber, emailAddress, cif, title, lastName, statementDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`creditStatement`)) {
			return this.mock(`creditStatement`);
		}

		const flexibleStatementEmailRequest = {
			"creditType": creditType,
			"accountNumber": accountNumber,
			"emailAddress": emailAddress,
			"cifNumber": cif,
			"title": title,
			"surname": lastName,
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

	async fixedStatementEmail(accountNumber, emailAddress, fromDate, toDate, setdate, cif, title, lastName, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

		const fixedStatementEmailRequest = {
			"accountNumber": accountNumber,
			"emailAddress": emailAddress,
			"fromDate": fromDate,
			"toDate": toDate,
			"setDates": setdate,
			"cifNumber": cif,
			"title": title,
			"surname": lastName
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

	async getPaidUpLetter(cifNumber, accountNumbers, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		if (await this.isMockEnabled(`getPaidUpLetter`)) {
			return this.mock(`getPaidUpLetter`);
		}

		const getPaidUpLetterRequest = {
			"cifnumber": cifNumber,
			"accountNumbers": accountNumbers
		};

		const url = `/clientcare-credit-${this._version}/credit/paid-up-letter`;

		return this.post(
			url,
			getPaidUpLetterRequest,
			this.setToken(),
			`getPaidUpLetter`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	async emailPaidUpLetter(cifNumber, accountNumbers, emailAddress, title, lastName, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`emailPaidUpLetter`)) {
			if (errorHandler) {
				return this.mockWithErrorHandler(`emailPaidUpLetter`, errorHandler);
			}
			return this.mock(`emailPaidUpLetter`);
		}

		const emailPaidUpLetterRequest = {
			"cifnumber": cifNumber,
			"accountNumbers": accountNumbers,
			"emailAddress": emailAddress,
			"title": title,
			"surname": lastName,
			"documentType": `credit Paid Up letter`
		};

		const url = `/clientcare-credit-${this._version}/credit/paid-up-letter/email`;

		return this.post(
			url,
			emailPaidUpLetterRequest,
			this.setToken(),
			`emailPaidUpLetter`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	async permissions(cifNumber, accNumber, productType, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		const request = {
			"accountNumber": accNumber,
			"cifNumber": cifNumber,
			"resourceIdentifierType": productType
		};

		if (await this.isMockEnabled(`creditPermissions`)) {
			if (errorHandler) {
				return this.mockWithErrorHandler(`creditPermissions`, errorHandler);
			}
			return this.mock(`creditPermissions`, request);
		}

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

		const url = `/clientcare-credit-${this._version}/credit/settlement-quote/view`;

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

	async sendSettlementQuoteEmail(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`sendSettlementQuoteEmail`)) {
			return this.mock(`sendSettlementQuoteEmail`);
		}

		const url = `/clientcare-credit-v1/credit/settlement-quote/email`;

		return this.post(
			url,
			request,
			this.setToken(),
			`sendSettlementQuoteEmail`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	settlementQuoteLanding(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		const url = `/clientcare-credit-v1/credit/settlement-quote/landing`;

		return this.post(
			url,
			request,
			this.setToken(),
			`settlementQuoteLanding`,
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
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

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
			"surname": callerInformation.lastName,
			"title": callerInformation.title,
			"budgetTitle": transferDetails.budgetName
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

	async settleAndClose(settleAndCloseRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`settleAndClose`)) {
			return this.mock(`settleAndClose`, settleAndCloseRequest);
		}

		const settleAndClose =
		{
				creditType: settleAndCloseRequest.creditType,
				cifNumber: settleAndCloseRequest.cifNumber,
				accountNumber: settleAndCloseRequest.accountNumber,
				fromAccountNumber: settleAndCloseRequest.fromAccountNumber,
				fromAccountType: settleAndCloseRequest.fromAccountType,
				authorisedAmount: settleAndCloseRequest.authorisedAmount,
				caseId: settleAndCloseRequest.caseId,
				emailAddress: settleAndCloseRequest.emailAddress,
				firstname: settleAndCloseRequest.firstname,
				surname: settleAndCloseRequest.surname,
				idNumber: settleAndCloseRequest.idNumber,
				title: settleAndCloseRequest.title 
		};

		const url = `/clientcare-credit-${this._version}/credit/settle-and-close/settle`;

		return this.post(
			url,
			settleAndClose,
			this.setToken(),
			`settleAndClose`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	async settleAndCloseQuote(Request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const settleAndCloseQuoteRequest = {
			creditType: Request.creditType,
			accountNumber: Request.accountNumber,
			cifNumber: Request.cifNumber,
			idNumber: Request.idNumber

		};

		if (await this.isMockEnabled(`settleAndCloseQuote`)) {
			if (errorHandler) {
				return this.mockWithErrorHandler(`settleAndCloseQuote`, errorHandler);
			}
			return this.mock(`settleAndCloseQuote`, settleAndCloseQuoteRequest);
		}


		const url = `/clientcare-credit-${this._version}/credit/settle-and-close/quote`;

		return this.post(
			url,
			settleAndCloseQuoteRequest,
			this.setToken(),
			`settleAndCloseQuote`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	 transactionHistory(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare-credit-${this._version}/credit/transaction-history`;

		return this.post(
			url,
			request,
			this.setToken(),
			`transactionHistory`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	async canOpenBudget(ccAccNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`canOpenBudget`)) {
			return this.mock(`canOpenBudget`);
		}

		const url = `/clientcare-credit-${this._version}/credit/budgetaccount/can-open`;

		return this.post(
			url,
			{
				"creditCardAccountNumber": ccAccNumber
			},
			this.setToken(),
			`canOpenBudget`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	async calculateBudget(ccAccNumber, budgetAmount, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`calculateBudget`)) {
			return this.mock(`calculateBudget`);
		}

		const url = `/clientcare-credit-${this._version}/credit/budgetaccount/calculate`;

		return this.post(
			url,
			{
				"creditCardAccountNumber": ccAccNumber,
				"amount": budgetAmount
			},
			this.setToken(),
			`calculateBudget`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	async openBudget(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`openBudget`)) {
			return this.mock(`openBudget`);
		}

		const url = `/clientcare-credit-${this._version}/credit/budgetaccount/open`;

		return this.post(
			url,
			request,
			this.setToken(),
			`openBudget`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

}