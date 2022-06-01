import { css, html } from 'platform/elements';

import { InsureService } from 'app/services/InsureService';
import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { getAgeFromIDNumber, getGenderFromIDNumber } from 'app/utils/insureUtils';

import 'app/components/insure/ClientPolicies';
import 'app/components/insure/PolicyEstimate';
import 'app/components/insure/UpdatePlan';
import 'app/components/insure/PolicySummary';
import 'app/components/insure/CancelPolicySuccess';
import 'app/components/insure/EmailPlanSuccess';

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

	//#endregion

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

	//#endregion

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

	//#endregion

	//#region EVENT HANDLERS

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
	 * Prepare and navigate Policy Summary
	 */
	_goToPolicySummary() {
		// Telemetry Here
		this._navigateToSubView(INSURE_RENDER_MODE.POLICY_SUMMARY);
	}

	/**
	 * Prepare and navigate Cancel Policy Success
	 */
	 _goToCancelPolicySuccess() {
		// Telemetry Here
		this._navigateToSubView(INSURE_RENDER_MODE.CANCEL_POLICY_SUCCESS);
	}

	/**
	 * Prepare and navigate Email Success
	 */
	 _goToEmailPlanSuccess() {
		// Telemetry Here
		this._navigateToSubView(INSURE_RENDER_MODE.EMAIL_SUCCESS);
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
			case INSURE_RENDER_MODE.POLICY_SUMMARY:
				return html`${this._renderPolicySummaryPage()}`
			case INSURE_RENDER_MODE.CANCEL_POLICY_SUCCESS:
				return html`${this._renderCancelPolicySuccessPage()}`
			case INSURE_RENDER_MODE.EMAIL_SUCCESS:
				return html`${this._renderEmailSuccessPage()}`
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
				@navigate-to-policy-summary="${(e) => this._goToPolicySummary()}"
				@navigate-to-cancel-policy-success="${(e) => this._goToCancelPolicySuccess()}"
				@navigate-to-email-success="${(e) => this._goToEmailPlanSuccess()}">
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
			<horizon-insure-policy-summary @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-policy-summary>`
	}

	/**
	 * Render Cancel Policy Success Page
	 * @return {html} Html of the sub view
	 */
	_renderCancelPolicySuccessPage() {
		return html`
		<horizon-insure-cancel-policy-success @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
		</horizon-insure-cancel-policy-success>
		`
	}

	/**
	 * Render Email Success Page
	 * @return {html} Html of the sub view
	 */
	 _renderEmailSuccessPage() {
		return html`
		
			<horizon-insure-email-plan-success @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-email-plan-success>

		`
	}
}
customElements.define(`horizon-existing-client`, ExistingClient);