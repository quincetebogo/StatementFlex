// Core
import { css, html } from 'platform/elements';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';

import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';

// Pages
import 'app/components/insure/ClientPolicies';
import 'app/components/insure/PolicyEstimate';
import 'app/components/insure/UpdatePlan';
import 'app/components/insure/PolicySummary';

import { InsureService } from 'app/services/InsureService';

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
		this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;

		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));

		this.estimate = {};
		this.productParams = {};
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
		console.log("Estimate Calculate event in View ", JSON.stringify(e.detail))
		let estimateWithCoverDetails = e.detail;
		this.isBusy = true;
		const resp = await this.insureService.calculateEstimate(estimateWithCoverDetails, () => true);
		if (resp.succeeded == true && resp.result != null) {
			estimateWithCoverDetails.totalPremium = resp.result.totalPremium;
			estimateWithCoverDetails.lifesAssured = estimateWithCoverDetails.lifesAssured.map(lifeWithDetails => {
				return Object.assign(lifeWithDetails, resp.result.lifesAssured.find(respLife => {
					return lifeWithDetails.rowID === respLife.rowID
				}))
			});
			this.estimate = estimateWithCoverDetails;
			this.isBusy = false;
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

	/**
	 * Prepare and navigate Policy Summary
	 */
	_goToPolicySummary() {
		// Telemetry Here
		this._navigateToSubView(INSURE_RENDER_MODE.POLICY_SUMMARY);
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
			case INSURE_RENDER_MODE.CLIENT_POLICIES:
				return html`${this._renderClientPoliciesPage()}`
			case INSURE_RENDER_MODE.ESTIMATE:
				return html`${this._renderCalculateEstimatePage()}`
			case INSURE_RENDER_MODE.UPDATE_PLAN:
				return html`${this._renderUpdatePlanPage()}`
			case INSURE_RENDER_MODE.POLICY_SUMMARY:
				return html`${this._renderPolicySummaryPage()}`
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
			<horizon-insure-client-policies @navigate-to-estimate="${(e) => this._goToPolicyEstimate()}"
				@navigate-to-update-plan="${(e) => this._goToUpdatePlan()}"
				@navigate-to-policy-summary="${(e) => this._goToPolicySummary()}">
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
				.productParams="${this.productParams}">
			</horizon-insure-policy-estimate>`
	}

	/**
	 * Render Update Plan page
	 * @return {html} Html of the sub view
	 */
	_renderUpdatePlanPage() {
		return html`
			<horizon-insure-update-plan @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-update-plan>`
	}

	/**
	 * Render Policy Details Plan
	 * @return {html} Html of the sub view
	 */
	_renderPolicySummaryPage() {
		return html`
			<horizon-insure-policy-summary @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-policy-summary>`
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