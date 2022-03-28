import { css, html } from 'platform/elements';
import { Configuration } from 'platform/core';

import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonRouter } from 'app/shell/HorizonRouter';

import { formatCurrency } from 'app/productControls/utilities/Currency';

// import 'app/components/insure/InsurePolicyList';
// import 'app/components/insure/InsureFuneralPlanDetails';
// import 'app/components/insure/InsureClaims';
// import 'app/components/insure/InsureLodgeClaim';
// import 'app/components/insure/InsureCalculateEstimate';
// import 'app/components/insure/InsureUpdatePlan';

import 'app/components/dialogs/insure/InsureAddLifeDialog';

/**
 * @readonly
 * @enum {object} GENDER_OPTIONS
 */
const GENDER_OPTIONS = [
	{
		code: 'Male',
		text: `Male`
	},
	{
		code: 'Female',
		text: `Female`
	}
];

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
		// this.renderMode = INSURE_RENDER_MODE.POLICY_SUMMARY;

		this.showAddRelationshipDialog = false;
		this.showEmailPlanDialog = false;

		// Estimate
		this.estimate = {};
		this.clientEstimateDetails = {};
		this.totalPremiumOverrideInput = '';
	}

	//#endregion

	static get properties() {
		return {
			showAddRelationshipDialog: { boolean: false },
			showEmailPlanDialog: { boolean: false },
		};
	}

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

	//#endregion

	//#region PRIVATE METHODS

	/**
	 * Initialize Landing View / Invoke services
	 */
	async _initialize() {
		this.verificationStatus = this.callerInformation.verificationStatus;
		if (this.verificationStatus === `verified`) {

			// const clientDetails = {
			// 	"cifNumber": this.callerInformation.cifNumber,
			// 	"GetGenericData": true,
			// 	"NationalIDNumber": this.callerInformation.southAfricanIDNumber
			// };
			// console.log(JSON.stringify(this.callerInformation));
		}

		// let clientPolicies = await this.retrieveClientPolicySummary();

	}


	/** Estimate */

	/**
	 * Prepare and navigate Estimate
	 */
	_goToEstimate() {
		this.estimate.lifesAssured = [];
		this.estimate.lifesAssured.push({
			relationship: "MainLife",
			coverAmount: 0,
			premium: 0,
			genderType: "Male",
			age: 0,
			rowID: 0
		});
		this.estimate.totalPremium = 0;
		this.clientEstimateDetails = {
			"estimateReference": "",
			"clientCif": this.callerInformation.cifNumber,
			"lastName": this.callerInformation.lastName,
			"firstName": this.callerInformation.firstName,
			"contactEmail": "",
			"contactNumber": this.callerInformation.verifiedTelephoneNumber
		}
		this._navigateToSubView(INSURE_RENDER_MODE.ESTIMATE);
	}

	/**
	 * Event from Add life dialog for Estimate
	 */
	_addLifeEstimate(e) {
		this.estimate.lifesAssured.push({
			relationship: e.detail.relationship,
			coverAmount: e.detail.coverDetails.defaultCover,
			premium: 0,
			genderType: "Male",
			age: 0,
			rowID: this.estimate.lifesAssured.length + 1,
			coverDetails: e.detail.coverDetails
		});
		this.showAddRelationshipDialog = false;
	}

	/**
	 * Calculate Button event / Calculate by life assured
	 * @returns {object} Estimate Response
	 */
	async _calculateEstimate() {
		this.estimate.totalPremium = 0;
		const request = {
			...this.estimate,
			clientEstimateDetails: this.clientEstimateDetails
		}
		let estimateResponse = await this.calculateClientEstimate(request);
		this.requestUpdate();
	}

	/**
	 * Calculate by Premium override input changed
	 * @returns {object} Estimate Response
	 */
	async _estimatePremiumOverrideChanged(e) {
		console.log(e);
		this.estimate.totalPremium = e.detail.new;
		const request = {
			...this.estimate,
			clientEstimateDetails: this.clientEstimateDetails
		}
		let estimateResponse = await this.calculateClientEstimate(request);
		this.totalPremiumOverrideInput = '';
		this.requestUpdate();
	}

	/** General */

	/**
	 * Open Add Life dialog returning select relationship
	 */
	_openAddLifeDialog() {
		this.showAddRelationshipDialog = true;
	}

	_closeAddLifeDialog() {
		this.showAddRelationshipDialog = false;
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
			capitec-label[type="Strong"] {
				line-height: 20px;
				--theme-label-strong-font-size: 18px;
				--theme-label-strong-font-weight: 600;
				--theme-label-font-color: #3A3A3A;
			}

			.insure-title-bar{
				margin-bottom: 0px; 
				border-top-left-radius: 5px; 
				border-top-right-radius: 5px;
			}

			.insure-calc-columns{
				display: flex;
				justify-content: stretch;
			}
			.insure-calc-column-left{
				margin: 10px;
				flex: 2 1 520px;
				min-height: calc(100vh - 300px);
			}
			.insure-calc-column-right{
				margin: 10px;
				flex: 1 1 10em;
				align-items: stretch;
				background-color: #f5f5f5;
				border-radius: 5px;
				padding: 10px;
			}
			
			.calc-summary-card{
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
			.calc-premium-total{
				font-size: 32px;
				font-weight: 600;
				color: #3A3A3A;
			}

			.calc-life-list{
				display: flex; 
				justify-content: space-between;
			}

			.calc-card {
				border: 1px solid #e1e1e1;
				border-radius: 5px;
				margin-top: 15px;
			}

			.calc-card-header{
				display: flex;
				justify-content: space-between;

				border-bottom: 1px solid #e1e1e1;
				border-top-right-radius: 5px;
				border-top-left-radius: 5px;
				margin-bottom:10px;
				padding: 15px 15px 15px 15px;
				font-weight: bold;
			}

			.calc-card-row{
				display: flex; 
				justify-content: space-between; 
				padding: 10px 15px 15px 15px; 
				gap: 10px;
			}

			.action-image{
				cursor: pointer;
			}

			.stronger{
				font-weight: bolder;
			}

			.link{
				color: #00a9f1;
				cursor: pointer;
			}
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
			${this._renderLoadingIndicator()}
			${this._renderEstimateAddLifeAssuredDialog()}
			${this._renderEmailPlanDialog()}
		`;
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
			<capitec-title-bar type="insure" class="insure-title-bar">
				<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
				<capitec-label label="Insure" type="title"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-button type="white" label="Get Estimate" @click="${() => this._goToEstimate()}">
				</capitec-button>
			</capitec-title-bar>
			`
	}

	/**
	 * Render Calculate estimate page
	 * @return {html} Html of the sub view
	 */
	_renderCalculateEstimatePage() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}" />
			<capitec-label label="Get an estimate" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			</capitec-button>
			<capitec-button label="Calculate" type="white" @click="${() => this._calculateEstimate()}"></capitec-button>
		</capitec-title-bar>
		<capitec-card style="padding: 10px;">
			<div class="insure-calc-columns">
				${this._renderLeftEstimateColumn()}
				${this._renderRightEstimateColumn()}
			</div>
		</capitec-card>`
	}

	/**
	 * Render left column (Card List) for Estimate subview
	 * @return {html} Html of the sub view
	 */
	_renderLeftEstimateColumn() {
		return html`		
		<div class="insure-calc-column-left">
			${this.estimate.lifesAssured.map((lifeAssured, index) => html`
			<div class="calc-card">
		
				${index != 0 ? html`
				<div class="calc-card-header">
					<capitec-label
						label="Relationship: ${lifeAssured.relationship}"
						type="small" class="stronger">
					</capitec-label>
		
					<capitec-label label="Remove" type="small" class="stronger link">
					</capitec-label>
				</div>
				` : html`
				<div class="calc-card-header">
					<capitec-label label="Main Life: You" type="small" class="stronger"></capitec-label>
				</div>
				`}
		
				<div class="calc-card-row">
					<capitec-text-field label="Cover Amount" type="input" disabled style="width: 50%;"
						value="${formatCurrency(lifeAssured.coverAmount)}">
					</capitec-text-field>
					<capitec-text-field label="Premium" type="input" disabled hint="Estimate" style="width: 50%;"
						value="${formatCurrency(lifeAssured.premium)}">
					</capitec-text-field>
				</div>
				<div class="calc-card-row">
					<capitec-text-field label="Age" type="numeric-input" style="width: 50%;"></capitec-text-field>
					<capitec-select label="Gender" display-field="text" .items="${this.GENDER_OPTIONS}" id-field="code" style="width: 50%"></capitec-select>
				</div>
			</div>
		
			${index != 0 ? html`` : html`<div class="calc-card-row" style="margin-top:15px;">
				<capitec-label label="Lives Assured" type="subtitle" class="stronger"></capitec-label>
				<capitec-label label="Add Life Assured" type="subtitle" class="stronger link"
					@click="${() => this._openAddLifeDialog()}"></capitec-label>
			</div>`}
			`)}
			<capitec-spacer></capitec-spacer>
		</div>
		`
	}

	/**
	 * Render right column (Life List & Calculation result) for Estimate subview
	 * @return {html} Html of the sub view
	 */
	_renderRightEstimateColumn() {
		return html`
			<div class="insure-calc-column-right">
				<div class="calc-summary-card">
					<!-- Top -->
					<div>
						<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-label label="Total estimated monthly premium"></capitec-label>
						<capitec-label label="${formatCurrency(this.estimate.totalPremium)}" class="calc-premium-total">
						</capitec-label>
						<capitec-label label="Summary of estimated monthly premium:" class="stronger"></capitec-label>
						<hr>
			
						<!-- Life List -->
						${this.estimate.lifesAssured.map(lifeAssured => html`
						<div class="calc-life-list">
							<capitec-label label="${lifeAssured.relationship}"></capitec-label>
							<capitec-label label="${formatCurrency(lifeAssured.premium)}"></capitec-label>
						</div>
						<hr>`)}
						<div class="calc-life-list">
							<capitec-label label="Total Premium Amount" class="stronger"></capitec-label>
							<capitec-label label="${formatCurrency(this.estimate.totalPremium)}" class="stronger"></capitec-label>
						</div>
					</div>
			
					<!-- Bottom -->
					<div>
						<capitec-label label="Specify a premium you are willing to pay" class="stronger"></capitec-label>
						<br>
						<capitec-text-field label="Premium Amount" type="numeric-input"
							@value-changed="${(e) => this._estimatePremiumOverrideChanged(e)}"
							.value="${this.totalPremiumOverrideInput}">
						</capitec-text-field>
					</div>
				</div>
			</div>
		`
	}

	/**
	 * Render Update Plan page
	 * @return {html} Html of the sub view
	 */
	_renderUpdatePlanPage() {
		return html`<div>Hi I am Update Plan Page</div>`
	}

	/**
	 * Render Update Plan page
	 * @return {html} Html of the sub view
	 */
	_renderFuneralPlanDetailsPage() {
		return html`<div>Hi I am Funeral Plan details Page</div>`
	}

	// ---- DIALOGS

	/**
	 * Render Dialog to add Life assured to Estimate
	 * @return {html} Html of the dialog
	 */
	_renderEstimateAddLifeAssuredDialog() {
		return this.showAddRelationshipDialog == false ? `` :
			html`
			<insure-add-life-dialog @addNewLife="${(e) => this._addLifeEstimate(e)}"
				@closeModal="${(e) => this._closeAddLifeDialog(e)}" .currentLifesAssured="${this.estimate.lifesAssured}">
			</insure-add-life-dialog>
		`
	}

	/**
	 * Render Dialog to Email Plan
	 * @return {html} Html of the dialog
	 */
	_renderEmailPlanDialog() {
		return this.showEmailPlanDialog == false ? `` :
			html`<div>I am the email plan dialog</div>`
	}

	// ---- HELPERS

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