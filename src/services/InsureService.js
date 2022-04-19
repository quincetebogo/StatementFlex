import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { Security } from 'platform/core';
import { v4 } from 'uuid';

/**
 * Channel Service Methods for Insure related functionality
 *
 * @export
 * @class InsureService
 * @extends {ChannelServiceBase}
 */
export class InsureService extends ChannelServiceBase {

	//#region INITIALISATION

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc,
			defaultErrorHandlerFunc,
			`serviceURIs.insureChannelServiceUrl`,
			`InsureChannelService`,
			`v1`,
			() => import(`../mocks/InsureChannelServiceMocks.js`)
		);

		this._version = `v1`;
	}

	setInsureTokens() {
		return {
			"X-User-Token": Security.getInstance().token,
			"x-session-id": v4(),
			"x-request-id": v4(),
			"x-requester-uid": 'CP336134_17249_01_3997_16',
		};
	}

	//#endregion

	//#region PUBLIC METHODS

	/**
	 * IsAlive Check for Insure
	 *
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async alive(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/platform/healthcheck/${this._version}/alive`;
		return this.get(
			url,
			this.setToken(),
			`alive`,
			null,
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Product Params for Insure Product
	 *
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async productParams(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		// if (await this.isMockEnabled(`insureProductParams`)) {
		// 	return this.mock(`insureProductParams`, insureProductParams);
		// }

		return {
			"products": [
				{
					"parameters": {
						"policyParams": {
							"param": {
								"minAffordableAmountMessage": "The specified premium cannot be less than R40. Please specify a new premium.",
								"validateTotalAffordablePremiumMinCalcLimit": true,
								"totalAffordablePremiumMinCalcLimit": "40"
							}
						},
						"organisation": {
							"productCode": "Capitec",
							"name": "CapitecBank"
						},
						"rolePlayers": {
							"roleList": {
								"role": [
									{
										"ageRange": [
											{
												"maxPremiumAmount": "",
												"minPremiumAmout": "",
												"premiumAmountMessage": "",
												"coverAmountMessage": "Only cover up to R{0:#,##0} on main life assured is allowed.",
												"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the main life.",
												"maxCoverAmount": "100000",
												"minCoverAmount": "5000",
												"maxAge": 64.0,
												"minAge": 18.0
											}
										],
										"benefitCode": "FunMainRsk",
										"ageMessage": "The age for main life assured must be {0} to {1}",
										"validatePremium": true,
										"validateCover": true,
										"validateAge": true,
										"perPolicy": 1.0,
										"type": "MainLife",
										"relationshipTypeEnum": "MainLife"
									},
									{
										"ageRange": [
											{
												"maxPremiumAmount": "",
												"minPremiumAmout": "",
												"coverAmountMessage": "Only cover up to R{0:#,##0} on a spouse/partner is allowed.",
												"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the spouse.",
												"maxCoverAmount": "100000",
												"minCoverAmount": "1000",
												"maxAge": 64.0,
												"minAge": 18.0
											}
										],
										"benefitCode": "FunSpouseRsk",
										"ageMessage": "The age for spouse/partner must be {0} to {1}",
										"validatePremium": false,
										"validateCover": true,
										"validateAge": true,
										"perPolicy": 1.0,
										"type": "Spouse",
										"relationshipTypeEnum": "Spouse"
									},
									{
										"ageRange": [
											{
												"maxPremiumAmount": "",
												"minPremiumAmout": "",
												"coverAmountMessage": "Only cover up to R{0:#,##0} for a child up to 5 years old is allowed.",
												"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the child.",
												"maxCoverAmount": "20000",
												"minCoverAmount": "1000",
												"maxAge": 5.0,
												"minAge": 0.0
											},
											{
												"maxPremiumAmount": "",
												"minPremiumAmout": "",
												"coverAmountMessage": "Only cover up to R{0:#,##0} for a child between 6 and 13 years old is allowed.",
												"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the child.",
												"maxCoverAmount": "50000",
												"minCoverAmount": "1000",
												"maxAge": 13.0,
												"minAge": 6.0
											},
											{
												"maxPremiumAmount": "",
												"minPremiumAmout": "",
												"coverAmountMessage": "Only cover up to R{0:#,##0} for a child between 14 and 25 years old is allowed.",
												"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the child.",
												"maxCoverAmount": "60000",
												"minCoverAmount": "1000",
												"maxAge": 25.0,
												"minAge": 14.0
											}
										],
										"benefitCode": "FunChildRsk",
										"ageMessage": "The age for child must be {0} to {1}",
										"validatePremium": false,
										"validateCover": true,
										"validateAge": true,
										"perPolicy": 8.0,
										"type": "Child",
										"relationshipTypeEnum": "Child"
									},
									{
										"ageRange": [
											{
												"maxPremiumAmount": "",
												"minPremiumAmout": "",
												"coverAmountMessage": "Only cover up to R{0:#,##0} on a parent is allowed.",
												"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the parent.",
												"maxCoverAmount": "50000",
												"minCoverAmount": "1000",
												"maxAge": 85.0,
												"minAge": 26.0
											}
										],
										"benefitCode": "FunParentRsk",
										"ageMessage": "The age for parents must be {0} to {1}",
										"validatePremium": false,
										"validateCover": true,
										"validateAge": true,
										"perPolicy": 4.0,
										"type": "Parent",
										"relationshipTypeEnum": "Parent"
									},
									{
										"ageRange": [
											{
												"maxPremiumAmount": "",
												"minPremiumAmout": "",
												"coverAmountMessage": "Only cover up to R{0:#,##0} for a child up to 5 years old is allowed.",
												"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the child.",
												"maxCoverAmount": "20000",
												"minCoverAmount": "1000",
												"maxAge": 5.0,
												"minAge": 0.0
											},
											{
												"maxPremiumAmount": "",
												"minPremiumAmout": "",
												"coverAmountMessage": "Only cover up to R{0:#,##0} for a child between 6 and 13 years old is allowed.",
												"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the child.",
												"maxCoverAmount": "50000",
												"minCoverAmount": "1000",
												"maxAge": 13.0,
												"minAge": 6.0
											},
											{
												"maxPremiumAmount": "",
												"minPremiumAmout": "",
												"coverAmountMessage": "Only cover up to R{0:#,##0} on an extended family member is allowed.",
												"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the extended family member.",
												"maxCoverAmount": "50000",
												"minCoverAmount": "1000",
												"maxAge": 85.0,
												"minAge": 14.0
											}
										],
										"benefitCode": "FunWiderRsk",
										"ageMessage": "The age for extended family must be {0} to {1}",
										"validatePremium": false,
										"validateCover": true,
										"validateAge": true,
										"perPolicy": 8.0,
										"type": "ExtendedFamily",
										"relationshipTypeEnum": "ExtendedFamily"
									}
								]
							},
							"genericFieldValidator": {
								"validation": {
									"fieldName": "Cellphone",
									"modelFieldName": "Cellphone",
									"type": "StartsWith",
									"allowedList": "60,61,62,63,64,65,66,67,71,72,73,74,76,78,79,81,82,83,84,85",
									"allowedValues": [
										"60",
										"61",
										"62",
										"63",
										"64",
										"65",
										"66",
										"67",
										"71",
										"72",
										"73",
										"74",
										"76",
										"78",
										"79",
										"81",
										"82",
										"83",
										"84",
										"85"
									],
									"errorMessage": "Cellphone number must start with {0}",
									"shouldValidate": false
								}
							}
						},
						"rulesParams": [
							{
								"ruleType": "MaternityWaiver",
								"editAccountDetails": true,
								"addNewLives": true,
								"peopleRulesList": [
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": false,
										"editRelationship": true,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Unknown",
										"relationshipTypeEnum": "Unknown"
									},
									{
										"editTitle": false,
										"editGender": false,
										"editSurname": false,
										"editFirstName": false,
										"editMiddleName1": false,
										"editMiddleName2": false,
										"editIDNumber": false,
										"editDateOfBirth": false,
										"editRelationship": false,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "MainLife",
										"relationshipTypeEnum": "MainLife"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": false,
										"editRelationship": false,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Spouse",
										"relationshipTypeEnum": "Spouse"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": false,
										"editRelationship": false,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Parent",
										"relationshipTypeEnum": "Parent"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": false,
										"editRelationship": false,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "ExtendedFamily",
										"relationshipTypeEnum": "ExtendedFamily"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": false,
										"editRelationship": false,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Child",
										"relationshipTypeEnum": "Child"
									}
								],
								"editDebitOrderDetails": true,
								"increaseCover": true,
								"ruleEnum": "MaternityWaiver"
							},
							{
								"ruleType": "PolicyPause",
								"editAccountDetails": true,
								"addNewLives": true,
								"peopleRulesList": [
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": false,
										"editRelationship": true,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Unknown",
										"relationshipTypeEnum": "Unknown"
									},
									{
										"editTitle": false,
										"editGender": false,
										"editSurname": false,
										"editFirstName": false,
										"editMiddleName1": false,
										"editMiddleName2": false,
										"editIDNumber": false,
										"editDateOfBirth": false,
										"editRelationship": false,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "MainLife",
										"relationshipTypeEnum": "MainLife"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": false,
										"editRelationship": false,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Spouse",
										"relationshipTypeEnum": "Spouse"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": false,
										"editRelationship": false,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Parent",
										"relationshipTypeEnum": "Parent"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": false,
										"editRelationship": false,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "ExtendedFamily",
										"relationshipTypeEnum": "ExtendedFamily"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": false,
										"editRelationship": false,
										"editLifeAssuredValues": false,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Child",
										"relationshipTypeEnum": "Child"
									}
								],
								"editDebitOrderDetails": true,
								"increaseCover": true,
								"ruleEnum": "PolicyPause"
							},
							{
								"ruleType": "Standard",
								"editAccountDetails": true,
								"addNewLives": true,
								"peopleRulesList": [
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": true,
										"editRelationship": true,
										"editLifeAssuredValues": true,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Unknown",
										"relationshipTypeEnum": "Unknown"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": true,
										"editRelationship": true,
										"editLifeAssuredValues": true,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "MainLife",
										"relationshipTypeEnum": "MainLife"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": true,
										"editRelationship": true,
										"editLifeAssuredValues": true,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Spouse",
										"relationshipTypeEnum": "Spouse"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": true,
										"editRelationship": true,
										"editLifeAssuredValues": true,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Parent",
										"relationshipTypeEnum": "Parent"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": true,
										"editRelationship": true,
										"editLifeAssuredValues": true,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "ExtendedFamily",
										"relationshipTypeEnum": "ExtendedFamily"
									},
									{
										"editTitle": true,
										"editGender": true,
										"editSurname": true,
										"editFirstName": true,
										"editMiddleName1": true,
										"editMiddleName2": true,
										"editIDNumber": true,
										"editDateOfBirth": true,
										"editRelationship": true,
										"editLifeAssuredValues": true,
										"editBeneficiaryValues": true,
										"editContactDetails": true,
										"type": "Child",
										"relationshipTypeEnum": "Child"
									}
								],
								"editDebitOrderDetails": true,
								"increaseCover": true,
								"ruleEnum": "Standard"
							}
						],
						"id": "NBS"
					},
					"type": "Capitec"
				}
			]
		};

		// const url = `/FuneralInsuranceProductService/product/params`;
		// return this.get(
		// 	url,
		// 	this.setInsureTokens(),
		// 	`productParams`,
		// 	null,
		// 	1000,
		// 	null,
		// 	errorHandler,
		// 	autoRetries
		// );
	}

	/**
	 * Calculate Estimate / leaving no footprint on OIPA
	 *
	 * @param {estimateRequest} [errorHandler=null]  Request data for estimate 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async calculateEstimate(estimateRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureCalculateEstimate`)) {
			return this.mock(`insureCalculateEstimate`);
		}
		return this.post(
			`/FuneralInsuranceProductService/quote/estimate`,
			estimateRequest,
			this.setInsureTokens(),
			`calculateEstimate`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Calculate Quote / Generate Quote
	 *
	 * @param {quoteRequest} [errorHandler=null]  Request data for quote 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async calculateQuote(quoteRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureCalculateQuote`)) {
			return this.mock(`insureCalculateQuote`);
		}
		return this.post(
			`/FuneralInsuranceProductService/quote/calc`,
			quoteRequest,
			this.setInsureTokens(),
			`calculateQuote`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Retrieve quote details
	 *
	 * @param {quoteRequest} [errorHandler=null]  Request data for retrieve quote 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async retrieveQuoteDetails(quoteRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureRetrieveQuoteDetails`)) {
			return this.mock(`insureRetrieveQuoteDetails`);
		}

		return this.post(
			`/FuneralInsuranceProductService/quote/retrieve`,
			quoteRequest,
			this.setInsureTokens(),
			`retrieveQuote`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Retrieve list of quotes
	 *
	 * @param {quoteRequest} [errorHandler=null]  Request data for retrieve quotes list 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async retrieveQuotes(quoteRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureRetrieveQuotes`)) {
			return this.mock(`insureRetrieveQuotes`);
		}

		return this.post(
			`/FuneralInsuranceProductService/client/quotes/retrieve`,
			quoteRequest,
			this.setInsureTokens(),
			`retrieveQuotes`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 * Client Policy Summary / Policy list
	 *
	 * @param {summaryRequest} [errorHandler=null]  Request data for summary 
	 * @param {errorHandlerCallback} [errorHandler=null]  An optional error handler 
	 * @param {Number} [autoRetries] The number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object containing a success flag and the result of the channel service call
	 */
	async clientPolicySummary(summaryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`insureClientPolicySummary`)) {
			console.log('MOCKS!')
			return this.mock(`insureClientPolicySummary`);
		}

		return this.post(
			`/FuneralInsuranceProductService/client/summary`,
			quoteRequest,
			this.setInsureTokens(),
			`summary`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	//#endregion


	// ---- OLD // Check if can / should still use these

	async hasInsuranceProducts(insuranceClientInfo, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`hasInsuranceProducts`)) {
			return this.mock(`hasInsuranceProducts`);
		}

		const url = `/clientcare-insure-${this._version}/landing?` +
			`IdNumber=${insuranceClientInfo.IdNumber}&` +
			`Cif=${insuranceClientInfo.CifNumber}&` +
			`IsCallerVerified=${insuranceClientInfo.isCallerVarified}`;

		return this.get(
			url,
			this.setToken(),
			`hasInsuranceProducts`,
			null,
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	addNonClientDetails(incidentData, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const nonClientDetailsRequest = {
			'incidentRecId': incidentData.incidentRecId,
			'ivrOptionCode': incidentData.ivrOptionCode,
			'incomingTelephoneNumber': incidentData.incomingTelephoneNumber,
			'firstName': incidentData.firstName,
			'surname': incidentData.surname,
			'cellPhone': incidentData.cellPhone
		};

		return this.post(
			`/clientcare-insure-${this._version}/addCaller/nonclient`,
			nonClientDetailsRequest,
			this.setToken(),
			`addNonClientDetails`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}

	calculatePremiumDone(feedbackDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		return this.post(
			`/clientcare-insure-${this._version}/CalculatePremium/done`,
			{
				'incidentRecId': feedbackDetails.incidentRecId,
				'feedback': feedbackDetails.feedback,
				'updateIncident': feedbackDetails.updateIncident
			},
			this.setToken(),
			`calculatePremiumDone`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}
}