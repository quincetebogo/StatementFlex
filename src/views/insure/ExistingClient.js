// Core
import { css, html } from 'platform/elements';

import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';

import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';

// Pages
import 'app/components/insure/InsureLanding';
import 'app/components/insure/PolicyEstimate';
import 'app/components/insure/UpdatePlan';
import 'app/components/insure/PolicyTransactionHistory';

import { InsureService } from 'app/services/InsureService';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getMonthName } from 'app/utils/channelServiceUtilities';

// ninety days in milliseconds
const NINETY_DAYS = 7777000000;

const POLICY_TRANSACTION_HISTORY = {
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
	PAGE_INDEX: 0,
	MAX_RESULTS: 50
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
		this.configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.renderMode = INSURE_RENDER_MODE.POLICY_SUMMARY;

		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));

		this.estimate = {};
		this.productParams = {};
		this.policyTransactionHistory = [];
	}

	static get properties() {
		return {
			estimate: { state: true },
			productParams: { state: true }
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
		this._initialize();
	}

	//#endregion

	//#region EVENT HANDLERS

	/**
	 * Calculate estimate based on lives assured provided
	 * @returns {Object} Estimate response
	 */
	async _calculateClientEstimate(e) {
		console.log("Which e");
		console.log(e);
		this.isBusy = true;
		const resp = await this.insureService.calculateEstimate(e.detail, () => true);
		console.log('resp');
		console.log(resp);
		if (resp.succeeded == true && resp.result != null) {
			this.isBusy = false;
			this.estimate = resp.result;
		} else {
			console.error(resp.exception);
			this.isBusy = false;
			// Do error message
			return null;
		}
	}

	//#endregion

	//#region PRIVATE METHODS

	/**
	 * Initialize Landing View / Invoke params service
	 */
	async _initialize() {
		this.verificationStatus = this.callerInformation.verificationStatus;
		this.productParams = await this.insureService.productParams({}, () => true);
	}

	//#region PRIVATE METHODS

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

	async _goToPolicyTransactionHistory() {
		// Telemetry Here
		await this._getPolicyTransactionHistory();
		this._navigateToSubView(INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY);
	}

	//#endregion

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
		${this._renderLandingPage()}
		${this._renderLoadingIndicator()}`
	}

	/**
	 * Main render switch for Insure views
	 *
	 * @returns {html} Component html based on current render mode.
	 */
	_renderLandingPage() {
		switch (this.renderMode) {
			case INSURE_RENDER_MODE.POLICY_SUMMARY:
				return html`${this._renderPolicySummaryPage()}`
			case INSURE_RENDER_MODE.ESTIMATE:
				return html`${this._renderCalculateEstimatePage()}`
			case INSURE_RENDER_MODE.UPDATE_PLAN:
				return html`${this._renderUpdatePlanPage()}`
			case INSURE_RENDER_MODE.FUNERAL_PLAN_DETAILS:
				return html`${this._renderFuneralPlanDetailsPage()}`
			case INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY:
				return html`${this._renderPolicyTransactionHistoryPage()}`
			default:
				return html``;
		}
	}

	/**
	 * Render Landing page for Insure existing clients
	 * @return {html} Html of the sub view
	 */
	_renderPolicySummaryPage() {
		return html`
			<horizon-insure-landing @navigate-to-estimate="${(e) => this._goToPolicyEstimate()}"
				@navigate-to-update-plan="${(e) => this._goToUpdatePlan()}"
				@navigate-to-policy-transaction-history="${(e) => this._goToPolicyTransactionHistory()}">
			</horizon-insure-landing>`
	}

	/**
	 * Render Calculate estimate page
	 * @return {html} Html of the sub view
	 */
	_renderCalculateEstimatePage() {
		return html`
			<horizon-insure-policy-estimate 
			@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.POLICY_SUMMARY)}" 
			@calculate="${(e)=> this._calculateClientEstimate(e)}"
			.estimate="${this.estimate}"
			.productParams="${this.productParams}">
			</horizon-insure-policy-estimate>`
	}

	/**
	 * Render Update Plan page
	 * @return {html} Html of the sub view
	 */
	_renderUpdatePlanPage() {
		return html`
			<horizon-insure-update-plan @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.POLICY_SUMMARY)}">
			</horizon-insure-update-plan>`
	}

	/**
	 * Render Update Plan page
	 * @return {html} Html of the sub view
	 */
	_renderFuneralPlanDetailsPage() {
		return html`<div>Hi I am Funeral Plan details Page</div>`
	}

	/**
	 * Render Policy Transaction History Page
	 * @returns {html} Html of the sub view 
	 */
	_renderPolicyTransactionHistoryPage() {
		return this.renderMode === INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY
			? html `<horizon-insure-policy-transaction-history 
				@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.POLICY_SUMMARY)}"
				.policyTransactionHistory="${this.policyTransactionHistory}"
				.getPolicyTransactionHistory="${(startDate, endDate, pageIndex) => 
					this._getPolicyTransactionHistory(startDate, endDate, pageIndex)}"
				.disposeData="${() => this.policyTransactionHistory = []}"
				@unloading="${() => this._unloadPolicyTransactionHistory()}">
			</horizon-insure-policy-transaction-history>`
			: html``;
	}

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

	_unloadPolicyTransactionHistory() {
		this.policyTransactionHistory = [];
	}

	//#endregion

	//#region HELPERS

	/**
	 * Render capitec loading indicator if busy
	 * @returns {html} HTML of the loading indicator
	 */
	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};
		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
	//#endregion
}
customElements.define(`horizon-existing-client`, ExistingClient);