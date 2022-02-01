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
			`serviceURIs.creditMicroChannelServiceUrl`, 
			`credit-v1`, 
			`v1`,
			null
		);
	}


	// --------------
	// PUBLIC METHODS
	// --------------
	creditOverview(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		const creditOverviewRequest = {
			"cifnumber": cifNumber
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
}