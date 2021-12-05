import { Configuration, Logger, Security, Service } from 'platform/core';
import { v4 } from 'uuid';

/**
 * @deprecated Use a class derived from ChannelServiceBase rather than this class for all new functionality
 */
export class HorizonChannelService extends Service {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new HorizonChannelService());
	}

	constructor() {
		super({
			baseUrlKey: `serviceURIs.channelServiceUrl`,
			name: `HorizonChannelService`
		});

		this._version = `v1`;
		this._mocking = null;
		this._mock = null;

		this._configuration = Configuration.getInstance();
		this._logger = Logger.getInstance();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/**
	 * Determine if mocking is enabled for the specified method
	 *
	 * @param {string} mockName Mock name/method name in the config.json file
	 * @returns {Promise<boolean>} A promise for a boolean that is true if the mock is enabled
	 * @memberof HorizonChannelService
	 */
	async _mockEnabled(mockName) {
		if (this._mocking === null) {
			try {
				this._mocking = await this._configuration.getSetting(`mock`);

				// Disable mocking in the SLDC environments. Only for local development
				if (this._configuration.config.runtime.environment !== `LOCAL`) {
					this._mocking = { enabled: false };
					this._logger.log(`info`, `Channel Service Mocking has been automatically disabled as the application is not running locally.`, `_mockEnabled`);
				}
			} catch {
				// disable mocking if the setting is not present
				this._mocking = { enabled: false };
				this._logger.log(`info`, `Channel Service Mocking has been automatically disabled as no configuration is present.`, `_mockEnabled`);
			}

			if (this._mocking.enabled) {
				// Dynamically load the configured mocks
				this._logger.log(`info`, `Channel Service Mocking is enabled.`, `_mockEnabled`);
				this._mock = new (await import(`../mocks/HorizonChannelServiceMocks`)).HorizonChannelServiceMocks();
				await this._mock.initialise(this._mocking);
			}
		}

		// Check if mocking is switched off globally
		if (!this._mocking.enabled) {
			return false;
		}

		// Check if specified mock is configured and enabled
		if (Object.prototype.hasOwnProperty.call(this._mocking, mockName)) {
			return this._mocking[mockName].enabled;
		}

		return false;
	}

	/**
	 * Wraps the platform's post method
	 * 
	 *    - Debug logging is added over the platform's post capability
	 *    - A correlation id is generated for purposes of tracing calls through the UI and CS logs.
	 *
	 * @param {string} url The Channel Service URL
	 * @param {Object} model The request model
	 * @param {Object} customHeaders Any custom headers
	 * @param {string} caller The name of the method for logging purposes
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {AbortController} [controller=null] The abort controller used to cancel file uploads, i.e. only works with FormData as model type.
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
* 
	 * @returns {Promise<*>} The response of the Channel Service Request
	 * @memberof HorizonChannelService
	 */
	async _post(url, model, customHeaders, caller, isBinary, controller, sla, timeout) {
		const correlationId = v4();

		this._logger.log(`debug`, `url: ${url}, body: ${JSON.stringify(model).substring(0, 19000)}`, caller, correlationId);

		try {
			const response = await super.httpClient.request({
				method: `POST`,
				url: url,
				model: model,
				customHeaders: customHeaders,
				correlationId: correlationId,
				isBinary: isBinary,
				controller: controller,
				sla: sla,
				timeout: timeout,
				caller: caller
			});

			this._logger.log(`debug`, `result: ${JSON.stringify(response).substring(0, 19000)}`, caller, correlationId);

			return response;
		} catch (exception) {
			exception.requestUrl = url;
			exception.requestModel = model;
			exception.requestCaller = caller;
			throw exception;
		}
	}

	/**
	 * Wrap's the platform's get method
	 *
	 *    - Debug logging is added over the platform's get capability
	 *    - A correlation id is generated for the purposes of tracing calls through the UI and CS logs
	 * 
	 * @param {string} url The Channel Service URL
	 * @param {Object} customHeaders Any custom headers
	 * @param {string} caller The name of the method for logging purpose
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
	 * 
	 * @returns {Promise<*>} The response of the Channel Service REquest
	 * @memberof HorizonChannelService
	 */
	async _get(url, customHeaders, caller, isBinary = false, sla = null, timeout = null) {
		const correlationId = v4();
			
		this._logger.log(`debug`, `url: ${url}`, caller, correlationId);

		try {
			const response = await super.httpClient.request({
				method: `GET`,
				url: url,
				customHeaders: customHeaders,
				correlationId: correlationId,
				isBinary: isBinary,
				sla: sla,
				timeout: timeout,
				caller: caller
			});

			this._logger.log(`debug`, `result: ${JSON.stringify(response)}`, caller, correlationId);

			return response;
		} catch (exception) {
			exception.requestUrl = url;
			exception.requestModel = null;
			exception.requestCaller = caller;
			throw exception;
		}
	}

	/**
	 * Wraps the platform's put method
	 * 
	 * - Debug logging is added over the platform's post capability
	 * - A correlation id is generated for purposes of tracing calls through the UI and CS logs.
	 *
	 * @param {string} url The Channel Service URL
	 * @param {Object} model The request model
	 * @param {Object} customHeaders Any custom headers
	 * @param {string} caller The name of the method for logging purposes
	 * @param {Boolean} [isBinary=false] When true, converts response into object with raw binary content
	 * @param {AbortController} [controller=null] The abort controller used to cancel file uploads, i.e. only works with FormData as model type.
	 * @param {Number} [sla=null] SLA in milliseconds to track for the maximum allowed duration of the request.
	 * @param {Number} [timeout=null] Timeout in milliseconds for the request.
	 *
	 * @returns {Promise<*>} The response of the Channel Service Request
	 * @memberof HorizonChannelService
	 */
	async _put(url, model, customHeaders, caller, isBinary, controller, sla, timeout) {
		const correlationId = v4();

		this._logger.log(`debug`, `url: ${url}, body: ${JSON.stringify(model).substring(0, 19000)}`, caller, correlationId);

		try {
			const response = await super.httpClient.request({
				method: `PUT`,
				url: url,
				model: model,
				customHeaders: customHeaders,
				correlationId: correlationId,
				isBinary: isBinary,
				controller: controller,
				sla: sla,
				timeout: timeout,
				caller: caller
			});

			this._logger.log(`debug`, `result: ${JSON.stringify(response).substring(0, 19000)}`, caller, correlationId);

			return response;
		} catch (exception) {
			exception.requestUrl = url;
			exception.requestModel = model;
			exception.requestCaller = caller;
			throw exception;
		}
	}

	/**
	 * The X-User-Token is required by some calls where the Product Services/Capabilities services 
	 * makes calls to OpenBancs 2/Way Gate in order to retreive the agent's BANCS/SBL teller number
	 *
	 * @returns {object} The X-User-Token custom header object
	 * @memberof HorizonChannelService
	 */
	_setToken() {
		return {
			"X-User-Token": Security.getInstance().token
		};
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ----------------
	// Access Channels 
	// ----------------


	// --------------------
	// Value Added Services
	// --------------------

	getValueAddedService(cifNumber) {
		const url = `/clientcare-client-${this._version}/value-added-services?cif=${cifNumber}`;
		return this._get(url, this._setToken(), `getValueAddedService`);

		/*
		const url = `/clientcare-client-${this._version}/value-added-services`;
		return this._post(url, { 'cif': cifNumber }, this._setToken(), `getValueAddedService`);
		*/
	}

	putValueAddedService(request) {
		const url = `/clientcare-client-${this._version}/value-added-services?` +
			`capitecEntityId=${request.capitecEntityId}&` +
			`optOutInsights=${request.optOutInsights}&` +
			`optOutBehaviouralMarketing=${request.optOutBehaviouralMarketing}&` +
			`optOutPreAssessments=${request.optOutPreAssessments}&` +
			`optOutAnalysis=${request.optOutAnalysis}&` +
			`optOutThirdParties=${request.optOutThirdParties}&`;

		return this._put(url, request, this._setToken(), `putValueAddedService`);
	}

	// -----------
	// Call Methods
	// -----------


	// ----
	// card
	// ----

	async cardLimitsLanding(cifNumber, incidentRecId) {
		if (await this._mockEnabled(`cardLimitsLanding`)) {
			return this._mock.cardLimitsLanding(cifNumber);
		}

		const url = `/clientcare-card-${this._version}/limits-landing?` +
			`cifNumber=${cifNumber}&` +
			`incidentRecId=${incidentRecId}`;
		return this._get(url, this._setToken(), `cardLimitsLanding`, false, 1000);

		/*
		const url = `/clientcare-card-${this._version}/limits-landing`;

		return this._post(
			url,
			{
				'cifNumber': cifNumber,
				'incidentRecId': incidentRecId
			},
			this._setToken(),
			`cardLimitsLanding`, null, null, 1000
		);
		*/
	}

	async getCardLimits(cardDetails) {
		if (await this._mockEnabled(`cardLimits`)) {
			return this._mock.getCardLimits();
		}
		const url = `/clientcare-card-${this._version}/temporary-limits`;
		return this._get(url, this._setToken(), `getCardLimits`);
	}

	async getCardLimitsAgreement(cardDetails) {
		if (await this._mockEnabled(`getCardLimitsAgreement`)) {
			return this._mock.getCardLimitsAgreement(cardDetails);
		}

		return this._post(`/clientcare-card-${this._version}/limits-agreement`, cardDetails, this._setToken(), `getCardLimitsAgreement`, null, null, 1000);
	}

	updatePermanentLimits(request) {
		const url = `/clientcare-card-${this._version}/permanent-limits`;

		return this._put(url, request, this._setToken(), `updatePermanentLimits`, null, null, 1000);
	}

	updateTemporaryLimits(request) {
		const url = `/clientcare-card-${this._version}/temporary-limits`;

		return this._put(url, request, this._setToken(), `updateTemporaryLimits`, null, null, 1000);
	}

	getPermanentLimits(request) {
		const url = `/clientcare-card-${this._version}/permanent-limits`;

		return this._post(url, request, this._setToken(), `getPermanentLimits`, null, null, 1000);
	}

	async getTemporaryLimits(request) {

		if (await this._mockEnabled(`getTemporaryLimits`)) {
			return this._mock.getTemporaryLimits(request);
		}

		const url = `/clientcare-card-${this._version}/temporary-limits`;

		return this._post(url, request, this._setToken(), `getTemporaryLimits`, null, null, 1000);
	}

	async tapToPayLanding(cifNumber, incidentRecId) {
		if (await this._mockEnabled(`tapToPayLanding`)) {
			return this._mock.tapToPay(cifNumber);
		}

		const url = `/clientcare-card-${this._version}/tap-to-pay-landing?cifNumber=${cifNumber}&incidentRecId=${incidentRecId}`;
		return this._get(url, this._setToken(), `tapToPayLanding`, false, 1000);

		/*
		const url = `/clientcare-card-${this._version}/tap-to-pay-landing`;

		return this._post(
			url,
			{
				'cifNumber': cifNumber,
				'incidentRecId': incidentRecId
			},
			this._setToken(), `tapToPayLanding`, null, null, 1000
		);
		*/
	}

	tapToPayAgreement(agreementInfo) {
		const url = `/clientcare-card-${this._version}/tap-to-pay-agreement`;

		return this._post(url, agreementInfo, this._setToken(), `tapToPayAgreement`, null, null, 1000);
	}

	updateTapToPay(acceptTapToPay) {
		const url = `/clientcare-card-${this._version}/tap-to-pay`;

		return this._post(url, acceptTapToPay, this._setToken(), `updateTapToPay`, null, null, 1000);
	}

	// ----------
	// debi-check
	// ----------

	async debiCheckMandates(cifNumber) {
		if (await this._mockEnabled(`debiCheckMandates`)) {
			return this._mock.debiCheckMandates(cifNumber);
		}

		const request = {
			cifNumber: cifNumber
		};

		const url = `/clientcare-debicheck-${this._version}/client-mandate`;
		return this._post(url, request, this._setToken(), `debiCheckMandates`);
	}

	async debiCheckDetails(cifNumber, mandateId, registerId) {
		if (await this._mockEnabled(`debiCheckDetails`)) {
			return this._mock.debiCheckDetails(cifNumber, mandateId, registerId);
		}

		const request = {
			cifNumber: cifNumber,
			mandateId: mandateId,
			registerId: registerId
		};
		const url = `/clientcare-debicheck-${this._version}/client-mandate-details`;
		return this._post(url, request, this._setToken(), `debiCheckDetails`);
	}

	async debiCheckConfirmAgreement(mandateInfo) {
		if (await this._mockEnabled(`debiCheckConfirmAgreement`)) {
			return this._mock.debiCheckConfirmAgreement(mandateInfo);
		}

		const request = {
			cifNumber: mandateInfo.cifNumber,
			mandateRef: mandateInfo.mandateRef,
			title: mandateInfo.title,
			firstName: mandateInfo.firstName,
			surname: mandateInfo.surname,
			middleName: mandateInfo.middleName,
			identificationNumber: mandateInfo.identificationNumber,
			residentialAddress: mandateInfo.residentialAddress,
			postalAddress: mandateInfo.postalAddress,
			cellphone: mandateInfo.cellphone,
			homeNumber: mandateInfo.homeNumber,
			workNumber: mandateInfo.workNumber,
			savingsAccountNumber: mandateInfo.savingsAccountNumber,
			cardNumber: mandateInfo.cardNumber,
			contractReference: mandateInfo.contractReference,
			instalmentAmount: mandateInfo.instalmentAmount,
			frequency: mandateInfo.frequency,
			firstCollectionDate: mandateInfo.firstCollectionDate,
			collectionDayFrequencyWording: mandateInfo.collectionDayFrequencyWording,
			ultimateDebtorName: mandateInfo.debitAccountName,            
			debitAccountName: mandateInfo.debitAccountName,
			accountConfirmation: mandateInfo.accountConfirmation,
			instalmentConfirmation: mandateInfo.instalmentConfirmation,
			permissionToDebit: mandateInfo.permissionToDebit,
			termsAndConditionsConfirmation: mandateInfo.termsAndConditionsConfirmation
		};

		const url = `/clientcare-debicheck-${this._version}/client-mandate-confirm-agreement`;
		return this._post(url, request, this._setToken(), `debiCheckConfirmAgreement`);
	}

	debiCheckAuthenticate(cifNumber, mandateReferenceNumber, debtorAccountNumber, accepted) {
		const request = {
			cifNumber: cifNumber,
			mandateReferenceNumber: mandateReferenceNumber,
			debtorAccountNumber: debtorAccountNumber,
			accepted: accepted
		};

		const url = `/clientcare-debicheck-${this._version}/client-mandate-authenticate`;
		return this._post(url, request, this._setToken(), `debiCheckAuthenticate`);
	}

	debiCheckAgreement(clientInfo) {

		const request = {
			 title: clientInfo.title,
			 firstName: clientInfo.firstName,
			surname: clientInfo.surname,
			identificationNumber: clientInfo.identificationNumber,
			savingsAccountNumber: clientInfo.savingsAccountNumber,
			registerId: clientInfo.registerId,
			mandateId: clientInfo.mandateId,
			mandateReferenceNumber: clientInfo.mandateReferenceNumber,
			cifNumber: clientInfo.cifNumber 
		};
		
		const url = `/clientcare-debicheck-${this._version}/client-mandate-agreement-template`;
		return this._post(url, request, this._setToken(), `debiCheckAgreement`);
	}

	// ---------
	// documents
	// ---------

	getClientProducts(request) {
		const url = `/clientcare-documents-${this._version}/statements/client?CIFNumber=${request.cifNumber}` +
					`&ProductStatus=${request.status}`;
		return this._get(url, this._setToken(), `getClientProducts`, false, 1000);

		/*
		const url = `/clientcare-documents-${this._version}/statements/client`;

		return this._post(
			url,
			{
				'cifNumber': request.cifNumber,
				'productStatus': request.status
			},
			this._setToken(), 
			`getClientProducts`, null, null, 1000
		);
		*/
	}

	async viewStatement(statement) {

		if (await this._mockEnabled(`viewStatements`)) {
			return this._mock.viewStatements();
		}

		const url = `/clientcare-documents-${this._version}/statements/view-statement`;
		return this._post(url, statement, this._setToken(), `viewStatement`, null, null, 2000);
	}

	sendStatement(statement) {
		const url = `/clientcare-documents-${this._version}/statements/send-statement`;
		return this._post(url, statement, this._setToken(), `sendStatement`, null, null, 2000);
	}

	sendProofOfAccount(clientInfo) {
		const url = `/clientcare-documents-${this._version}/statements/send-proof-of-account`;
		return this._post(url, clientInfo, this._setToken(), `sendProofOfAccount`, null, null, 2000);
	}

	viewProofOfAccount(clientInfo) {
		const url = `/clientcare-documents-${this._version}/statements/view-proof-of-account`;
		return this._post(url, clientInfo, this._setToken(), `viewProofOfAccount`, null, null, 2000);
	}

	getTaxCertificate(cifNumber) {
		const request = {
			"cif": cifNumber
		};

		const url = `​/clientcare-documents-${this._version}/select-tax-certificate`;
		return this._post(url, request, this._setToken(), `getTaxCertificate`);
	}

	async viewTaxCertificate(taxCertificate) {

		if (await this._mockEnabled(`viewStatements`)) {
			return this._mock.viewStatements();
		}

		const url = `/clientcare-documents-${this._version}/view-tax-certificate`;
		return this._post(url, taxCertificate, this._setToken(), `viewTaxCertificate`);
	}

	sendTaxCertificate(req) {
		const url = `/clientcare-documents-${this._version}/send-tax-certificate`;
		return this._post(url, req, this._setToken(), `sendTaxCertificate`);
	}
	// ----------
	// favourites
	// ----------

	async favouritesLanding(clientInfo) {
		if (await this._mockEnabled(`favouritesLanding`)) {
			return this._mock.favouritesLanding(clientInfo);
		}

		/*
		const url = `/clientcare-favourites-${this._version}/landing?` +
			`CifNumber=${clientInfo.cifNumber}&` +
			`NationalIDNumber=${clientInfo.nationalIDNumber}&` +
			`IsCallerVerified=${clientInfo.isCallerVerified}`;

		return this._get(url, this._setToken(), `favouritesLanding`, false, 1000);
		*/
		
		const url = `/clientcare-favourites-${this._version}/landing`;

		return this._post(
			url,
			{
				'cifNumber': clientInfo.cifNumber,
				'nationalIDNumber': clientInfo.nationalIDNumber,
				'isCallerVerified': clientInfo.isCallerVerified
			},
			this._setToken(),
			`favouritesLanding`, null, null, 1000
		);
	}

	// --------
	// incident
	// --------

	// ----------
	// initialise
	// ----------

	// ------
	// insure
	// ------

	calculatePremiumDone(feedbackDetails) {
		return this._post(
			`/clientcare-insure-${this._version}/CalculatePremium/done`, {
			'incidentRecId': feedbackDetails.incidentRecId,
			'feedback': feedbackDetails.feedback,
			'updateIncident': feedbackDetails.updateIncident
		},
			this._setToken(),
			`calculatePremiumDone`, null, null, 900
		);
	}

	addNonClientDetails(callerData) {
		return this._post(
			`/clientcare-insure-${this._version}/addCaller/nonclient`, {
			'incidentRecId': callerData.incidentRecId,
			'ivrOptionCode': callerData.ivrOptionCode,
			'incomingTelephoneNumber': callerData.incomingTelephoneNumber,
			'firstName': callerData.firstName,
			'surname': callerData.surname,
			'cellPhone': callerData.cellPhone
		},
			this._setToken(),
			`addNonClientDetails`, null, null, 900
		);
	}

	async hasInsuranceProducts(insuranceClientInfo) {
		if (await this._mockEnabled(`hasInsuranceProducts`)) {
			return this._mock.hasInsuranceProducts();
		}

		const url = `/clientcare-insure-${this._version}/landing?` +
			`IdNumber=${insuranceClientInfo.IdNumber}&` +
			`Cif=${insuranceClientInfo.CifNumber}&` +
			`IsCallerVerified=${insuranceClientInfo.isCallerVarified}`;

		return this._get(url, this._setToken(), `hasInsuranceProducts`, null, 1000);
	}

	// --------------
	// SavingsAccount
	// --------------

	async savingsAccountLanding(cifNumber, nationalIDNumber, getGenericData) {
		if (await this._mockEnabled(`savingsAccountLanding`)) {
			return this._mock.savingsAccountLanding(cifNumber, nationalIDNumber, getGenericData);
		}

		const url = `/clientcare-savingsaccount-${this._version}/landing?` +
			`CifNumber=${cifNumber}&` +
			`NationalIDNumber=${nationalIDNumber}&` +
			`GetGenericData=${getGenericData}`;
		
		return this._get(url, this._setToken(), `savingsAccountLanding`);

		/*
		const url = `/clientcare-savingsaccount-${this._version}/landing`;

		return this._post(
			url,
			{
				'cifNumber': cifNumber,
				'nationalIDNumber': nationalIDNumber,
				'getGenericData': getGenericData
			},
			this._setToken(), 
			`savingsAccountLanding`
		);
		*/
	}

	async transactionHistory(transactionHistoryRequest) {
		if (await this._mockEnabled(`transactionHistory`)) {
			return this._mock.transactionHistory(transactionHistoryRequest);
		}

		const url = `/clientcare-savingsaccount-${this._version}/client/transactions?` +
			`CIFNumber=${transactionHistoryRequest.cifNumber}&` +
			`AccountNumber=${transactionHistoryRequest.accountNumber}&` +
			`AccountType=${transactionHistoryRequest.accountType}&` +
			`StartDate=${transactionHistoryRequest.startDate}&` +
			`EndDate=${transactionHistoryRequest.endDate}&` +
			`StartAtIndex=${transactionHistoryRequest.startAtIndex}&` +
			`MaxResults=${transactionHistoryRequest.maxResults}&` +
			`MoneyType=${transactionHistoryRequest.moneyType}`;

		return this._get(url, this._setToken(), `transactionHistory`, false, 2000);

		/*
		const url = `/clientcare-savingsaccount-${this._version}/client/transactions`;

		return this._post(
			url,
			{
				'cifNumber': transactionHistoryRequest.cifNumber,
				'accountNumber': transactionHistoryRequest.accountNumber,
				'accountType': transactionHistoryRequest.accountType,
				'startDate': transactionHistoryRequest.startDate,
				'endDate': transactionHistoryRequest.endDate,
				'startAtIndex': transactionHistoryRequest.startAtIndex,
				'maxResults': transactionHistoryRequest.maxResults,
				'moneyType': transactionHistoryRequest.moneyType
			}, 
			this._setToken(), 
			`transactionHistory`, null, null, 2000
		);
		*/
	}
}