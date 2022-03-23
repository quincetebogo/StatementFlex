import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import { HorizonStore } from 'app/store/HorizonStore';

import { RENDER_MODE } from 'app/views/common/RenderModes';

import 'app/components/insure/InsurePolicyList';
import 'app/components/insure/InsureFuneralPlanDetails';
import 'app/components/insure/InsureClaims';
import 'app/components/insure/InsureLodgeClaim';
import 'app/components/insure/InsureCalculateEstimate';
import 'app/components/insure/InsureUpdatePlan';

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
export class ExistingClient extends ViewBase {

	//#region INITIALISATION

	constructor() {
		super();

		this.horizonStore = HorizonStore.getInstance();
		this.callerInformation = this.horizonStore.getCallerInformation();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}


	//#endregion

	//#region LIFECYCLE OVERRIDES

	connectedCallback() {
		super.connectedCallback();
		this._initialize();
	}

	//#endregion

	//#region EVENT HANDLERS

	/* Enter Sub views */
	/**
	 * Change renderMode to get estimate
	 */
	async _enterCalculateEstimate() {
		// Telemetry Here
		this.renderMode = RENDER_MODE.INSURE_GET_ESTIMATE;
		this.requestUpdate();
	}
	/**
	 * Change renderMode to get estimate
	 */
	async _enterUpdatePlan() {
		// Telemetry Here
		this.renderMode = RENDER_MODE.UPDATE_PLAN;
		this.requestUpdate();
	}

	//#endregion

	//#region PRIVATE METHODS

	/**
	 * Initialize View / Invoke services
	 */
	async _initialize() {
		this.verificationStatus = this.callerInformation.verificationStatus;
		if (this.verificationStatus === `verified`) {
			const clientDetails = {
				"cifNumber": this.callerInformation.cifNumber,
				"GetGenericData": true,
				"NationalIDNumber": this.callerInformation.southAfricanIDNumber
			};
		}
	}

	//#endregion

	//#region RENDERING

	/**
	 * Generates the view stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`

			`
		];
	}

	/**
	 * Generates the component template for kiosk mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for mobile mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			${this._renderLandingPage()}
		`;
	}

	/**
	 * Main render switch for Insure views
	 *
	 * @returns {html} Component html based on current render mode.
	 */
	_renderLandingPage() {
		switch (this.renderMode) {
			case RENDER_MODE.MAIN_PAGE:
				return html`
				<insure-policy-list @calculateEstimate="${(e) => this._enterCalculateEstimate(e)}"
					@viewClaims="${(e) => this._enterClaims(e)}" @updatePlan="${(e) => this._enterUpdatePlan(e)}"
					@viewPlan="${(e) => this._enterFuneralPlanDetails(e)}">
				</insure-policy-list>`
			case RENDER_MODE.INSURE_GET_ESTIMATE:
				return html`
				<insure-calculate-estimate @back="${(e) => this._exitCalculateEstimate(e)}"></insure-calculate-estimate>`;
			// 			case RENDER_MODE.FUNERAL_PLAN_DETAILS:
			// 				return html`<insure-funeral-plan-details @back="${(e) => this._exitFuneralPlanDetails(e)}"></insure-funeral-plan-details>`;
			// 			case RENDER_MODE.CLAIMS:
			// 				return html`<insure-claims @back="${(e) => this._exitClaims(e)}"></insure-claims>`;
			// case RENDER_MODE.INSURE_CLAIMS:
			// 	return html`<insure-claims></insure-claims>`;

			case RENDER_MODE.UPDATE_PLAN:
				return html`<insure-update-plan></insure-update-plan>`;
			default:
				return html``;
		}
	}

	//#endregion
}

customElements.define(`horizon-existing-client`, ExistingClient);