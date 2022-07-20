import { css, html } from 'platform/elements';

import { InsureService } from 'app/services/InsureService';
import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { MAX_RESULTS } from 'app/constants/PolicyTransactionHistory';
import { getAgeFromIDNumber, getGenderFromIDNumber } from 'app/utils/insureUtils';
import { SavingsAccountService } from 'app/services/SavingsAccountService';


import 'app/components/insure/ClientPolicies';
import 'app/components/insure/PolicyEstimate';
import 'app/components/insure/UpdatePlan';
import 'app/components/insure/PolicySummary';
import 'app/components/insure/CancelPolicySuccess';
import 'app/components/insure/EmailPlanSuccess';
import 'app/components/insure/PayPremiumSuccess';
import 'app/components/insure/PolicyTransactionHistory';
import 'app/components/insure/SMSHistory';


import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';

// ninety days in milliseconds
const NINETY_DAYS = 7777000000;

const POLICY_TRANSACTION_HISTORY = {
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
	PAGE_INDEX: 0,
	MAX_RESULTS: MAX_RESULTS
};

const COMMUNICATION_HISTORY = {
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
	PAGE_INDEX: 0,
	MAX_RESULTS: MAX_RESULTS
}

/**
 * Implements the view for Insure verified and unverified existing clients (i.e. the client has products)
 * This includes the view for third parties phoning in about an existing client.
 *
 * The view is context sensitive to the incoming callers verification status. 
 * 
 * @export
 * @class ExistingClient
 * @extends {View}
 */
export class ExistingClient extends InsureViewBase {

	//#region INITIALISATION

	constructor() {
		super();
		this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;
		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.estimate = {};
		this.policySummary = {};
		
		this.productParams = {};
		this.policyTransactionHistory = {};
		this.policyDetails = {};
		this.contractReference = ``;
		this.savingsAccountService = new SavingsAccountService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));

		this.readOnly = false;
	}

	/**
	 * @property {Object} clientPolicies Data & flags for all policies relating to client CIF
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {Object} estimate Local object for new Estimate requests
	 * @property {Object} policySummary  Local object for new Quote requests
	 * @property {String} cancellationReason conatins the cancellation reason selected
	 * @property {Object} cancelPolicyDocumentDetails contains the cancel policy document details
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			clientPolicies: { type: Object, state: true },
			productParams: { type: Object, state: true },
			estimate: { type: Object, state: true },
			policySummary: { type: Object, state: true },
			quote: { type: Object, state: true },
			policyDetails: { type: Object, state: true },
			mainLifeGender: { type: String, state: true },
			contractReference: { type: String, state: true },
			cancellationReason: {type: String, state: true},
			cancelPolicyDocumentDetails: {type: Object, state: true},
			accountDetails: { type: Object, state: true },		
			policyNumber: {type: String, state: true},
			commsHistory: {type: Object, state: true},
			readOnly: {type: Object, state: true}
		};
	}

	//#endregion

	//#region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialise();

	}

	//#endregion LIFECYCLE OVERRIDES

	//#region PRIVATE METHODS

	/**
	 * Initialise Landing View 
	 * Fetch client policies
	 */
	async _initialise() {
		this.clientPolicies = await this._retrieveClientPolicies(this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);
		this.accountDetails = await this._retrieveAccountDetails();
		this.commsHistory = await this._retrieveCommsHistory();
		console.log(this.accountDetails)
	}

	/**
	 * Get main life age from birthdate
	 * @returns 
	 */
	_getMainLifeAge() {
		let mainLifeAge = getAgeFromIDNumber(this.callerInformation.southAfricanIDNumber);
		return mainLifeAge;
	}

	/**
	 * Get main life gender from ID
	 * @returns 
	 */
	_getMainLifeGender() {
		let mainLifeGender = getGenderFromIDNumber(this.callerInformation.southAfricanIDNumber);
		return mainLifeGender;
	}

	//#endregion PRIVATE METHODS

	//#region EVENT HANDLERS

	/**
	 * Retrieve client policies via insure channel service
	 * @returns {Object} Client policies 
	 */
	async _retrieveClientPolicies(cifNumber, idNumber) {
		let request = {
			cifNumber: cifNumber,
			idNumber: idNumber
		}
		console.log("_retrieveClientPolicies");
		const resp = await this.insureService.clientPolicies(request);

		if (!resp.succeeded)
			return;

		return resp.result;
	}

		/**
	 * Retrieve Policy Summary via insure channel service
	 * @returns {Object} Policy Summary Details 
	 */
	async _retrievePolicySummary(contractReference, cifNumber, idNumber) {
		let	request = {
			contractReference: contractReference,
			cifNumber: parseInt(cifNumber),
			idNumber: idNumber
		}
		const resp = await this.insureService.insurePolicySummary(request);
		
		if(!resp.succeeded)
			return;

		return resp.result;
	}

	/**
	 * Retrieve Savings Account Details via Savings Account service
	 * @returns {Object} Savings Account Details 
	 */
	async _retrieveAccountDetails() {
		const savingsAccountData = await this.savingsAccountService.savingsAccountLanding(this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber, true);
		const savingsPlanData = await this.savingsAccountService.savingsPlanLanding(this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber, true);

		let resp = {
			savingsAccountData: savingsAccountData.result,
			savingsPlanData: savingsPlanData.result
		}

		

		return resp;
	}

	/**
	 * Calculate estimate based on lives assured provided
	 * Map metadata (coverDetails) back when response is received
	 * @returns {Object} Estimate response
	 */
	async _calculateClientEstimate(e) {
		let estimateWithCoverDetails = e.detail;
		const resp = await this.insureService.calculateEstimate(estimateWithCoverDetails, () => true);
		if (resp.succeeded == true && resp.result != null) {
			estimateWithCoverDetails.totalPremium = resp.result.totalPremium;
			estimateWithCoverDetails.lifesAssured = estimateWithCoverDetails.lifesAssured.map(lifeWithDetails => {
				return Object.assign(lifeWithDetails, resp.result.lifesAssured.find(respLife => {
					return lifeWithDetails.rowID === respLife.rowID
				}))
			});
			this.estimate = estimateWithCoverDetails;
		} else {
			// Do error message
			return null;
		}
	}

	/**
	 * Cancel Policy
	 * @returns {Object} 
	 */
	 async _cancelPolicy(e) {

		this.cancellationReason = e.detail.cancellationReason;

		let cancelPolicyDetails = {
			"contractReference": e.detail.contractReference,
			"cifNumber": this.callerInformation.cifNumber,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"cancellationReason": this.cancellationReason,
			"documents": {
				"documentCode": "",
				"documentName": "",
				"guid": "",
			}

		};
		console.log(cancelPolicyDetails)
		const resp = await this.insureService.cancelPolicy(cancelPolicyDetails, () => true);
		if (resp.succeeded == true && resp.result != null) {
			this._goToCancelPolicySuccess(e)
		} else {
			// Do error message
			return null;
		}
	}

	/**
	 * Cancel Policy Agreement
	 * @returns {Object} 
	 */
	 async _cancelPolicyAgreement(contractReference, cancelReason) {

		let dob = new Date(this.callerInformation.birthdate)

		let cancelPolicyAgreementDetails = {

			"documentFormat": "PDF",
			"saveDocumentToDocumentum": false,
			"returnDocumentContent": true,
			"emailDocumentToClient": false,
			"wetsignBarcode": false,

			"clientDetails": {
				"cifNumber": parseInt(this.callerInformation.cifNumber),
				"primarySavingsAccountNumber":  parseInt(this.accountDetails.savingsAccountData.accountNumber),
				"policyContractReference": contractReference,
				"firstName": this.callerInformation.firstName,
				"surname": this.callerInformation.lastName,
				"idNumber": this.callerInformation.southAfricanIDNumber,
				"dateOfBirth": dob.toISOString(),
			},
			"emailDetails": {
				"email": "test@test.com",
			},
			"input": {
				"cancellationReason": cancelReason,
			},
			
		}
		console.log(cancelPolicyAgreementDetails)
		console.log(this.callerInformation)

		const resp = await this.insureService.cancelPolicyAgreement(cancelPolicyAgreementDetails, () => true);
		if (resp.succeeded == true && resp.result != null) {
			this.cancelPolicyDocumentDetails = resp.result;
		} else {
			// Do error message
			return null;
		}
	}

	/**
	 * Pay Arrears based on arrears provided
	 * Map metadata back when response is received
	 * @returns {Object} Estimate response
	 */
	async _payPolicy(e) {
		

		let payArrears = {
			"contractReference": e.detail.payArrears.contractReference,
			"arrears": e.detail.payArrears.arrears,
			"cifNumber": this.callerInformation.cifNumber,
			"fromAccount": e.detail.fromAccount
		};
		
		const resp = await this.insureService.payPolicy(payArrears, () => true);
		if (resp.succeeded == true && resp.result != null) {
			this._navigateToSubView(INSURE_RENDER_MODE.PAY_PREMIUM_SUCCESS);
		} 
		else {
			// Do error message
			return null;
		}
	}


	/* 
	 * Calculate estimate based on lives assured provided
	 * Map metadata (coverDetails) back when response is received
	 * @returns {Object} Estimate response
	 */
	async _retrieveCommsHistory(startDate, endDate) {
		
		let commsHistoryDetails = {
			"cifNumber": this.callerInformation.cifNumber,
			"filters": {
				"contractReference": "",
				"contactNumber": this.callerInformation.verifiedTelephoneNumber,
				"medium": "SMS",
			},
			"fromDate": startDate || COMMUNICATION_HISTORY.START_DATE,
			"toDate": endDate || COMMUNICATION_HISTORY.END_DATE,
			"pagniation": {
				"pageIndex": COMMUNICATION_HISTORY.PAGE_INDEX,
				"totalPerPage": COMMUNICATION_HISTORY.MAX_RESULTS,
			}
		};

	const resp = await this.insureService.commsHistory(commsHistoryDetails, () => true);
		if (resp.succeeded == true && resp.result != null) {
			
			console.log(resp)
			return resp.result;
			
		} else {
			// Do error message
			return null;
		}
	}

	/**
	 * Navigate so specific subview
	  */
	_navigateToSubView(newMode) {
		this.renderMode = newMode;
	}

	/**
	 * Navigate back from any view to Summary
	 */
	_backToSummaryPage() {
		this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;
	}

	/**
	 * Prepare and navigate Update plan
	 */
	async _goToUpdatePlan(e) {
		// Telemetry Here
		this.policySummary = await this._retrievePolicySummary(e.detail.policyContractReference, this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);

		this._navigateToSubView(INSURE_RENDER_MODE.UPDATE_PLAN);
	}

	/**
	 * Prepare and navigate Estimate
	 */
	_goToPolicyEstimate() {
		// Telemetry Here
		this._navigateToSubView(INSURE_RENDER_MODE.ESTIMATE);
	}

	/**
	 * Prepare and navigate to Transaction history
	 */
	async _goToPolicyTransactionHistory(e) {
		// Telemetry Here
		this.contractReference = e.detail.policyNumber;
		await this._getPolicyTransactionHistory();
		this._navigateToSubView(INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY);
	}

	async _goToPolicySummary(e) {
		// Telemetry Here
		this.policyDetails = await this._retrievePolicySummary(e.detail.policyContractReference
			, this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);
		this._navigateToSubView(INSURE_RENDER_MODE.POLICY_SUMMARY);
	}

	_goToEmailSuccessPage() {
		this._navigateToSubView(INSURE_RENDER_MODE.EMAIL_PLAN_SUCCESS)
	}

	/**
	 * Prepare and navigate Cancel Policy Success
	 */
	 _goToCancelPolicySuccess(e) {
		// Telemetry Here
		this.contractReference = e.detail.contractReference;
		this._navigateToSubView(INSURE_RENDER_MODE.CANCEL_POLICY_SUCCESS);
	}

	/**
	 * Prepare and navigate Email Success
	 */
	 _goToEmailPlanSuccess() {
		// Telemetry Here
		this._navigateToSubView(INSURE_RENDER_MODE.EMAIL_SUCCESS);
	 }
	 
	/**
	 * Make FIPS call and Prepare and navigate to pay premium success page
	 * 
	 * @param {*} e contains the payArrears object
	 */
	_goToPayPremiumSuccess() {
		//call fips here

		// Telemetry Here

		
		this._navigateToSubView(INSURE_RENDER_MODE.PAY_PREMIUM_SUCCESS);
	}

	_goToSMSHistory(e){
		
		

		this.policyNumber = e.detail.policyNumber;

		
		//call fips here

		// Telemetry Here

		this._navigateToSubView(INSURE_RENDER_MODE.SMS_HISTORY);
	}

	//#endregion

	/**
	 * Fetch Policy Transaction History
	 * @param {*} startDate 
	 * @param {*} endDate 
	 * @param {*} pageIndex 
	 */
	async _getPolicyTransactionHistory(startDate, endDate, pageIndex) {
		const transactionHistoryRequest = {
			contractReference: this.contractReference,
			transactionDateType: 'TransactionDate',
			fromDate: startDate || POLICY_TRANSACTION_HISTORY.START_DATE,
			toDate: endDate || POLICY_TRANSACTION_HISTORY.END_DATE,
			pageIndex: pageIndex || POLICY_TRANSACTION_HISTORY.PAGE_INDEX,
			totalPerPage: POLICY_TRANSACTION_HISTORY.MAX_RESULTS,
		};

		this.transactions = [];

		const returnValue = await this.insureService.getPolicyTransactions(transactionHistoryRequest);

		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactions
				.map((item) => {
					const formatedPremiumDate = new Date(Date.parse(item.premiumDueDate));
					const formatedDate = new Date(Date.parse(item.Date));
					item.formatedPremiumDate = formatedPremiumDate;
					item.formatedDate = formatedDate;
					item.formatedPremium = formatCurrency(item.premium);
					item.groupByPremiumDate = `${getMonthName(formatedPremiumDate.getMonth())} ${formatedPremiumDate.getFullYear()}`;
					item.groupByDate = `${getMonthName(formatedDate.getMonth())} ${formatedDate.getFullYear()}`;
					item.formatedAmount = formatCurrency(item.amount);
					return item;
				});
			this.transactions.push(...formattedTrans);

			this.policyTransactionHistory = {
				contractReference: this.contractReference,
				transactions: this.transactions
			}

			this.endCallContext = `PolicyTransactionHistory`;
			this.renderMode = INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY;
		}
	}

	/**
	 * Unload Policy Transactions
	 */
	_unloadPolicyTransactionHistory() {
		this.policyTransactionHistory = {};
	}

	/**
	 * Unload Policy Transactions State
 	*/
	_undoClientPolicies() {
		this.clientPolicies?.summaryDetails?.policies?.forEach(item => { item["isExpanded"] = false; })
	}

	//#endregion EVENT HANDLERS

	//#region RENDERING

	/**
	 * Generates the view stylesheet.
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css``
		];
	}

	/**
	 * Generates the component template for kiosk mode.
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for mobile mode.
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
		${super._webTemplate()}
		${this._renderLandingPage()}`
	}

	/**
	 * Main render switch for Insure views
	 *
	 * @returns {html} Component html based on current render mode.
	 */
	_renderLandingPage() {
		switch (this.renderMode) {
			case INSURE_RENDER_MODE.CLIENT_POLICIES:
				return html`${this._renderClientPoliciesPage()}`
			case INSURE_RENDER_MODE.ESTIMATE:
				return html`${this._renderCalculateEstimatePage()}`
			case INSURE_RENDER_MODE.UPDATE_PLAN:
				return html`${this._renderUpdatePlanPage()}`
			case INSURE_RENDER_MODE.FUNERAL_PLAN_DETAILS:
				return html`${this._renderFuneralPlanDetailsPage()}`
			case INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY:
				return html`${this._renderPolicyTransactionHistoryPage()}`
			case INSURE_RENDER_MODE.POLICY_SUMMARY:
				return html`${this._renderPolicySummaryPage()}`
			case INSURE_RENDER_MODE.CANCEL_POLICY_SUCCESS:
				return html`${this._renderCancelPolicySuccessPage()}`
			case INSURE_RENDER_MODE.EMAIL_SUCCESS:
				return html`${this._renderEmailSuccessPage()}`
			case INSURE_RENDER_MODE.PAY_PREMIUM_SUCCESS:
				return html`${this._renderPayPremiumSuccessPage()}`
			case INSURE_RENDER_MODE.EMAIL_PLAN_SUCCESS:
				return html`${this._renderEmailPlanSuccessPage()}`
			case INSURE_RENDER_MODE.SMS_HISTORY:
				return html`${this._renderSMSHistory()}`
			default:
				return html``;
		}
	}

	/**
	 * Render Landing page for Insure existing clients
	 * @return {html} Html of the sub view
	 */
	_renderClientPoliciesPage() {
		return html`
			<horizon-insure-client-policies .clientPolicies = "${this.clientPolicies}" .cancelPolicyDocumentDetails = "${this.cancelPolicyDocumentDetails}"				
				.accountDetails = "${this.accountDetails}"
				@navigate-to-estimate="${(e) => this._goToPolicyEstimate()}"
				@navigate-to-update-plan="${(e) => this._goToUpdatePlan()}"
				@navigate-to-pay-premium-success ="${(e) => this._payPolicy(e)}"
				@navigate-to-policy-summary="${(e) => this._goToPolicySummary(e)}"
				@navigate-to-policy-transaction-history="${(e) => this._goToPolicyTransactionHistory(e)}"
				@navigate-to-cancel-policy-success="${(e) => this._cancelPolicy(e)}" 
				.getCancelPolicyDocument = "${(contractReference, cancelReason) => this._cancelPolicyAgreement(contractReference, cancelReason)}"
				@navigate-to-sms-history="${(e) => this._goToSMSHistory(e)}">
			</horizon-insure-client-policies>`
	}

	/**
	 * Render Calculate estimate page
	 * @return {html} Html of the sub view
	 */
	_renderCalculateEstimatePage() {
		return html`
			<horizon-insure-policy-estimate @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				@calculate="${(e) => this._calculateClientEstimate(e)}" .estimate="${this.estimate}"
				.productParams="${this.productParams}" .mainLifeDefaultAge="${this._getMainLifeAge()}"
				.mainLifeDefaultGender="${this._getMainLifeGender()}"
				.maxAllowedCover="${this.clientPolicies.checkInsuranceDetails[0].maxAllowedCover}">
			</horizon-insure-policy-estimate>`
	}

	/**
	 * Render Update Plan page
	 * @return {html} Html of the sub view
	 */
	_renderUpdatePlanPage() {
		return html`
			<horizon-insure-update-plan @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				@calculate="${(e) => this._calculateClientQuote(e)}" .quote="${this.policySummary}" .productParams="${this.productParams}">
			</horizon-insure-update-plan>`
	}

	/**
	 * Render Policy Details Plan
	 * @return {html} Html of the sub view
	 */
	_renderPolicySummaryPage() {
		return html`
			<horizon-insure-policy-summary 
				.policyDetails = "${this.policyDetails}"
				@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				@unloading="${() => this._undoClientPolicies()}">
			</horizon-insure-policy-summary>`
	}

	/**
	 * Render Cancel Policy Success Page
	 * @return {html} Html of the sub view
	 */
	_renderCancelPolicySuccessPage() {
		return html`
		<insure-cancel-policy-success @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
			@navigate-to-email-success="${(e) => this._goToEmailPlanSuccess()}" .contractReference = ${this.contractReference}>
		</insure-cancel-policy-success>
		`
	}

	/**
	 * Render Email Success Page
	 * @return {html} Html of the sub view
	 */
	 _renderEmailSuccessPage() {
		return html`
		
			<insure-email-plan-success @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				.contractReference = ${this.contractReference}>
			</insure-email-plan-success>

		`
	}
	/*
	 * Render Pay Premium Success page
	 * @return {html} Html of the sub view
	 */
	_renderPayPremiumSuccessPage() {
		return html`
		<horizon-pay-premium-success-page @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
		@navigate-to-email-success-page="${() => this._goToEmailSuccessPage()}">
		</horizon-pay-premium-success-page>
		
	`}
	/**
	 * Render Policy Transaction History Page
	 * @returns {html} Html of the sub view 
	 */
	_renderPolicyTransactionHistoryPage() {
		return this.renderMode === INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY
			? html`<horizon-insure-policy-transaction-history 
				@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				.policyTransactionHistory="${this.policyTransactionHistory}"
				.getPolicyTransactionHistory="${(startDate, endDate, pageIndex) =>
					this._getPolicyTransactionHistory(startDate, endDate, pageIndex)}"
				.disposeData="${() => this.policyTransactionHistory = []}"
				@unloading="${() => this._unloadPolicyTransactionHistory()}">
			</horizon-insure-policy-transaction-history>`
			: html``;
	}

	_renderEmailPlanSuccessPage() {
		return html`
			<insure-email-plan-success
				@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</insure-email-plan-success>
		`
	}
	
	_renderSMSHistory(){
		return html`
			<horizon-insure-sms-history-page @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				.contractReference = ${this.policyNumber} .contactNumber = ${this.callerInformation.verifiedTelephoneNumber}
				.commsHistory = "${this.commsHistory}"
				.getCommsHistory="${(startDate, endDate) => this._retrieveCommsHistory(startDate, endDate)}">
			</horizon-insure-sms-history-page>

		`
	}

	//#endregion RENDERING

}
customElements.define(`horizon-existing-client`, ExistingClient);

// 