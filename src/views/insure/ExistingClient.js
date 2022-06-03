import { css, html } from 'platform/elements';

import { InsureService } from 'app/services/InsureService';
import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { MAX_RESULTS } from 'app/constants/PolicyTransactionHistory';
import { getAgeFromIDNumber, getGenderFromIDNumber } from 'app/utils/insureUtils';

import 'app/components/insure/ClientPolicies';
import 'app/components/insure/PolicyEstimate';
import 'app/components/insure/UpdatePlan';
import 'app/components/insure/PolicySummary';
import 'app/components/insure/PayPremiumSuccess';
import 'app/components/insure/PolicyTransactionHistory';

import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getMonthName } from 'app/utils/channelServiceUtilities';

// ninety days in milliseconds
const NINETY_DAYS = 7777000000;

const POLICY_TRANSACTION_HISTORY = {
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
	PAGE_INDEX: 0,
	MAX_RESULTS: MAX_RESULTS
};

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
		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.estimate = {};
		this.productParams = {};
		this.policyTransactionHistory = [];
		this.policyDetails = {};
	}

	/**
	 * @property {Object} clientPolicies Data & flags for all policies relating to client CIF
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {Object} estimate Local object for new Estimate requests
	 * @property {Object} quote  Local object for new Quote requests
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			clientPolicies: { type: Object, state: true },
			productParams: { type: Object, state: true },
			estimate: { type: Object, state: true },
			quote: { type: Object, state: true },
			policyDetails: { type: Object, state: true },
			mainLifeGender: { type: String, state: true }
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
			idNumber: idNumber,
		}
		console.log("_retrieveClientPolicies");
		const resp = await this.insureService.clientPolicies(request);
		console.log(resp);
		return resp.result;
	}

		/**
	 * Retrieve Policy Summary via insure channel service
	 * @returns {Object} Policy Summary Details 
	 */
	async _retrievePolicySummary(contractReference, cifNumber) {
		let	request = {
			contractReference: contractReference,
			cifNumber: cifNumber,
		}
		const resp = await this.insureService.insurePolicySummary(request);
		return resp.result;
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
	_goToUpdatePlan() {
		// Telemetry Here
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
	async _goToPolicyTransactionHistory() {
		// Telemetry Here
		await this._getPolicyTransactionHistory();
		this._navigateToSubView(INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY);
	}
	
	async _goToPolicySummary(e) {
		// Telemetry Here
		this.policyDetails = await this._retrievePolicySummary(e.detail.policyContractReference
			, this.callerInformation.cifNumber);
		this._navigateToSubView(INSURE_RENDER_MODE.POLICY_SUMMARY);
	}
	
	/**
	 * Make FIPS call and Prepare and navigate to pay premium success page
	 * 
	 * @param {*} e contains the payArrears object
	 */
	_goToPayPremiumSuccess(e) {
		//call fips here

		// Telemetry Here

		this._navigateToSubView(INSURE_RENDER_MODE.PAY_PREMIUM_SUCCESS);
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
			contractReference: '',
			transactionDateType: '',
			fromDate: startDate || POLICY_TRANSACTION_HISTORY.START_DATE,
			toDate: endDate || POLICY_TRANSACTION_HISTORY.END_DATE,
			pageIndex: pageIndex || POLICY_TRANSACTION_HISTORY.PAGE_INDEX,
			totalPerPage: POLICY_TRANSACTION_HISTORY.MAX_RESULTS,
		};

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
			this.policyTransactionHistory.push(...formattedTrans);
			this.endCallContext = `PolicyTransactionHistory`;
			this.renderMode = INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY;
		}
	}

	/**
	 * Unload Policy Transactions
	 */
	_unloadPolicyTransactionHistory() {
		this.policyTransactionHistory = [];
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
			case INSURE_RENDER_MODE.PAY_PREMIUM_SUCCESS:
				return html`${this._renderPayPremiumSuccessPage()}`
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
			<horizon-insure-client-policies .clientPolicies = "${this.clientPolicies}"
				@navigate-to-estimate="${(e) => this._goToPolicyEstimate()}"
				@navigate-to-update-plan="${(e) => this._goToUpdatePlan()}"
				@navigate-to-pay-premium-success ="${(e) => this._goToPayPremiumSuccess()}"
				@navigate-to-policy-summary="${(e) => this._goToPolicySummary(e)}"
				@navigate-to-policy-transaction-history="${(e) => this._goToPolicyTransactionHistory()}">
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
				@calculate="${(e) => this._calculateClientQuote(e)}" .quote="${this.quote}" .productParams="${this.productParams}">
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
				@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-policy-summary>`
	}

	/**
	 * Render Pay Premium Success page
	 * @return {html} Html of the sub view
	 */
	_renderPayPremiumSuccessPage() {
		return html`
		<horizon-pay-premium-success-page @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
		</horizon-pay-premium-success-page>
		
	`}
	/**
	 * Render Policy Transaction History Page
	 * @returns {html} Html of the sub view 
	 */
	_renderPolicyTransactionHistoryPage() {
		return this.renderMode === INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY
			? html `<horizon-insure-policy-transaction-history 
				@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				.policyTransactionHistory="${this.policyTransactionHistory}"
				.getPolicyTransactionHistory="${(startDate, endDate, pageIndex) => 
					this._getPolicyTransactionHistory(startDate, endDate, pageIndex)}"
				.disposeData="${() => this.policyTransactionHistory = []}"
				@unloading="${() => this._unloadPolicyTransactionHistory()}">
			</horizon-insure-policy-transaction-history>`
			: html``;
	}

	//#endregion RENDERING

}
customElements.define(`horizon-existing-client`, ExistingClient);