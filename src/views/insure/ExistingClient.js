import { css, html } from 'platform/elements';
import { Configuration } from 'platform/core';

import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonRouter } from 'app/shell/HorizonRouter';

import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/dialogs/insure/InsureAddLifeDialog';
import 'app/components/common/HorizonLabel';
import 'app/components/common/ServiceCallErrorScreen';

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

		// General
		this.showAddRelationshipDialog = false;
		this.showEmailPlanDialog = false;

		// Update Plan
		this.showEACLAgreementDialog = false;
		this.showYBPAgreementDialog = false;
		this.showFCPAgreementDialog = false;
		this.showYROAAgreementDialog = false;
		this.selectedQuoteTabIndex = 0;
		this.quote = {};

		this.titleOptions = [
			{code: 'Mr', text: `Mr`},
			{code: 'Mrs', text: `Mrs`},
			{code: 'Ms', text: `Ms`}
		];

		this.accountTypeOptions = [
			{code:'Savings',text:`Savings`},
			{code:'Cheque',text:`Cheque`},
			{code:'Current',text:`Current`}
		]

		this.genderOptions = [
			{code: 'Male',text:`Male`},
			{code: 'Female',text:`Female`}
		];

		this.bankOptions = [
			{code:'CAPITEC',text:`CAPITEC`},
			{code:'20TWENTY',text:`20TWENTY`},
			{code:'ABN AMRO BANK',text:`ABN AMRO BANK`},
			{code:'ABSA BANK',text:`ABSA BANK`},
			{code:'FIRST NATIONAL BANK',text:`FIRST NATIONAL BANK`},
			{code:'MEEG BANK',text:`MEEG BANK`},
			{code:'NEDBANK',text:`NEDBANK`},
			{code:'STANDARD BANK',text:`STANDARD BANK`},
			{code:'BIDVEST BANK',text:`BIDVEST BANK`},
			{code:'GRINDROD BANK',text:`GRINDROD BANK`},
			{code:'FIRST NATIONAL BANK NAMIBIA',text:`FIRST NATIONAL BANK NAMIBIA`},
			{code:'FIRST NATIONAL BANK LESOTHO',text:`FIRST NATIONAL BANK LESOTHO`},
			{code:'FIRST NATIONAL BANK SWAZILAND',text:`FIRST NATIONAL BANK SWAZILAND`},
			{code:'VBS MUTUAL BANK',text:`VBS MUTUAL BANK`},
			{code:'HSBC',text:`HSBC`},
			{code:'ALBARAKA BANK',text:`ALBARAKA BANK`},
			{code:'MTN BANKING',text:`MTN BANKING`},
			{code:'NEDBANK LTD INC PEP BANK',text:`NEDBANK LTD INC PEP BANK`},
			{code:'AFRICAN BANK',text:`AFRICAN BANK`},
			{code:'SA POST OFFICE',text:`SA POST OFFICE`},
			{code:'NEDBANK CORPORATE SAVER',text:`NEDBANK CORPORATE SAVER`},
			{code:'NEDBANK PEOPLES MORTAGES LTD',text:`NEDBANK PEOPLES MORTAGES LTD`},
			{code:'CITI BANK',text:`CITI BANK`},
			{code:'INVESTEC BANK',text:`INVESTEC BANK`},
			{code:'OLYMPUS MOBILE',text:`OLYMPUS MOBILE`},
			{code:'STATE BANK OF INDIA',text:`STATE BANK OF INDIA`},
			{code:'FINBOND MUTUAL BANK',text:`FINBOND MUTUAL BANK`},
			{code:'JP MORGAN CHASE BANK',text:`JP MORGAN CHASE BANK`},
			{code:'SASFIN BANK',text:`SASFIN BANK`},
			{code:'BNP PARIBAS SA SOUTH AFRICA',text:`BNP PARIBAS SA SOUTH AFRICA`},
			{code:'STANDARD BANK NAMIBIA',text:`STANDARD BANK NAMIBIA`},
			{code:'NEDBANK BOND OR LOAN ACCOUNTS',text:`NEDBANK BOND OR LOAN ACCOUNTS`},
			{code:'RAND MERCHANT BANK',text:`RAND MERCHANT BANK`},
			{code:'UBANK',text:`UBANK`},
			{code:'HABIB OVERSEAS BANK',text:`HABIB OVERSEAS BANK`},
			{code:'FBC FIDELITY BANK',text:`FBC FIDELITY BANK`},
			{code:'ITHALA ABSA',text:`ITHALA ABSA`},
			{code:'HBZ BANK',text:`HBZ BANK`},
			{code:'NEDBANK SWAZILAND',text:`NEDBANK SWAZILAND`},
			{code:'NEDBANK LESOTHO',text:`NEDBANK LESOTHO`},
			{code:'STANDARD CHARTERED BANK',text:`STANDARD CHARTERED BANK`},
			{code:'NEDBANK NAMIBIA',text:`NEDBANK NAMIBIA`},
			{code:'STANDARD BANK LESOTHO',text:`STANDARD BANK LESOTHO`},
			{code:'STANDARD BANK SWAZILAND',text:`STANDARD BANK SWAZILAND`},
			{code:'SA BANK OF ATHENS',text:`SA BANK OF ATHENS`},
			{code:'NEDBANK LTD INC BOE BANK',text:`NEDBANK LTD INC BOE BANK`},
			{code:'MERCANTILE BANK',text:`MERCANTILE BANK`},
			{code:'SA RESERVE BANK',text:`SA RESERVE BANK`},
			{code:'TYMEDIGITAL BY CBSA',text:`TYMEDIGITAL BY CBSA`},
			{code:'DISCOVERY BANK',text:`DISCOVERY BANK`},
			{code:'BANK WINDHOEK',text:`BANK WINDHOEK`},
		];

		this.debitOrderDayOptions = [
			{code:'1',text:`1st of every Month`},
			{code:'2',text:`2nd of every Month`},
			{code:'3',text:`3rd of every Month`},
			{code:'4',text:`4th of every Month`},
			{code:'5',text:`5th of every Month`},
			{code:'6',text:`6th of every Month`},
			{code:'7',text:`7th of every Month`},
			{code:'8',text:`8th of every Month`},
			{code:'9',text:`9th of every Month`},
			{code:'10',text:`10th of every Month`},
			{code:'11',text:`11th of every Month`},
			{code:'12',text:`12th of every Month`},
			{code:'13',text:`13th of every Month`},
			{code:'14',text:`14th of every Month`},
			{code:'15',text:`15th of every Month`},
			{code:'16',text:`16th of every Month`},
			{code:'17',text:`17th of every Month`},
			{code:'18',text:`18th of every Month`},
			{code:'19',text:`19th of every Month`},
			{code:'20',text:`20th of every Month`},
			{code:'21',text:`21st of every Month`},
			{code:'22',text:`22nd of every Month`},
			{code:'23',text:`23rd of every Month`},
			{code:'24',text:`24th of every Month`},
			{code:'25',text:`25th of every Month`},
			{code:'26',text:`26th of every Month`},
			{code:'27',text:`27th of every Month`},
			{code:'28',text:`28th of every Month`},
			{code:'29',text:`29th of every Month`},
			{code:'30',text:`30th of every Month`},
			{code:'31',text:`31st of every Month`},
		];

		this.quoteRuleAgreementFuneralCoverAccepted = false;

		

		this.GENDER_OPTIONS = [
			{
				code: 'Male',
				text: `Male`
			},
			{
				code: 'Female',
				text: `Female`
			}
		];

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
			showEACLAgreementDialog: { boolean: false },
			showYBPAgreementDialog: { boolean: false },
			showFCPAgreementDialog: { boolean: false },
			showYROAAgreementDialog: { boolean: false },
			selectedQuoteTabIndex: { number: 0 },
			quoteRuleAgreementFuneralCoverAccepted: {boolean: false},
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

		let productParamsResponse = await this.retrieveInsureProductParams();
		console.log("productParamsResponse ", productParamsResponse);
		// let clientPolicies = await this.retrieveClientPolicySummary();

	}


	/** Estimate */

	/**
	 * Prepare and navigate Estimate
	 */
	async _goToEstimate() {
		this.estimate.lifesAssured = [];
		this.estimate.lifesAssured.push({
			relationship: "MainLife",
			coverAmount: 10000,
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
	 * Add Event from Add life dialog for Estimate
	 */
	_addLifeEstimate(e) {
		this.estimate.lifesAssured.push({
			relationship: e.detail.relationship,
			coverAmount: e.detail.coverDetails.defaultCover,
			premium: 0,
			genderType: "Male",
			age: 0,
			rowID: this.estimate.lifesAssured.length,
			coverDetails: e.detail.coverDetails
		});
		this.showAddRelationshipDialog = false;
		// console.log('this.estimate.lifesAssured ', this.estimate.lifesAssured)
	}

	/**
	 * Click event from remove button on life list
	 * @param {Object} lifeAssured clicked
	 */
	_estimateRemoveLifeAssured(lifeToRemove) {
		console.log('lifeToRemove');
		console.log(lifeToRemove);
		this.estimate.lifesAssured.splice(lifeToRemove.rowID, 1);
		// Reshuffle
		for (let index = 0; index < this.estimate.lifesAssured.length; index++) {
			this.estimate.lifesAssured[index].rowID = index;
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when an estimate life assured COVER AMOUNT value changes
	 * @param {*} event 
	 * @param {*} index 
	 */
	_estimateLifeCoverAmountValueChanged(event, index) {
		if (event.detail.old != event.detail.new) {
			this.estimate.lifesAssured[index].coverAmount = event.detail.new;
		}
	}

	/**
	 * Event fired when an estimate life assured AGE value changes
	 * @param {*} event 
	 * @param {*} index 
	 */
	_estimateLifeAgeValueChanged(event, index) {
		if (event.detail.old != event.detail.new) {
			this.estimate.lifesAssured[index].age = event.detail.new;
		}
	}

	/**
	 * Event fired when an estimate life assured GENDER value changes
	 * @param {*} event 
	 * @param {*} index 
	 */
	_estimateLifeGenderValueChanged(event, index) {
		if (event.detail.old != event.detail.new) {
			this.estimate.lifesAssured[index].genderType = event.detail.new.code;
		}
	}

	/**
	 * Event fired when calculate by Premium override input changed
	 * @param {*} event 
	 * @returns {object} Estimate Response
	 */
	async _estimatePremiumOverrideChanged(e) {
		this.estimate.totalPremium = e.detail.new;
		const request = {
			...this.estimate,
			clientEstimateDetails: this.clientEstimateDetails
		}
		let estimateResponse = await this.calculateClientEstimate(request);
		if (estimateResponse != null) {
			this.estimate = estimateResponse.result;
		}
		this.totalPremiumOverrideInput = '';
		this.requestUpdate();
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
		if (estimateResponse != '') {
			this.estimate = estimateResponse;
		}

		this.requestUpdate();
	}

	/**Update plan */

	/**
	 * Event from Add life dialog for Update Plan
	 */
	_addLifeQuote(e) {
		this.quote.lifesAssured.push({
			relationship: e.detail.relationship,
			coverAmount: e.detail.coverDetails.defaultCover,
			premium: 0,
			genderType: "Male",
			age: 0,
			rowID: this.quote.lifesAssured.length + 1,
			coverDetails: e.detail.coverDetails
		});
		this.showAddRelationshipDialog = false;
	}

	/**
	 * Prepare and navigate Update plan
	 */
	_goToUpdatePlan() {
		this.quote.lifesAssured = [];
		this.quote.lifesAssured.push({
			relationship: "MainLife",
			coverAmount: 0,
			premium: 0,
			genderType: "Male",
			age: 0,
			rowID: 0
		});
		this._navigateToSubView(INSURE_RENDER_MODE.UPDATE_PLAN);
		// this.quoteRuleAgreementFuneralCoverAccepted = false;
		
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

	/** Update Plan */


	/**
	 * Tab change to switch between calculate and email plan button
	 * @param {*} e 
	 */
	_updatePlanTabChange(e) {
		this.selectedQuoteTabIndex = e.detail.selectedIndex;
		console.log(this.selectedQuoteTabIndex)
	}

	/**
	 * Accept the FCP (Funeral Cover Plan) Agreement
	 */
	_acceptFCPAgreement(){
		this.quoteRuleAgreementFuneralCoverAccepted = true;
		console.log(this.quoteRuleAgreementFuneralCoverAccepted)
	}

	/**
	 * Open EACL (Entry Ages and Child Limits) agreement dialog
	 */

	_openEACLAgreementDialog() {
		this.showEACLAgreementDialog = true;
	}

	/**
	 * Close EACL (Entry Ages and Child Limits) agreement dialog
	 */
	_closeEACLAgreementDialog() {
		this.showEACLAgreementDialog = false;
	}

	/**
	 * Open YBP (You/your Beneficiary are paid) agreement dialog
	 */
	_openYBPAgreementDialog() {
		this.showYBPAgreementDialog = true;
	}

	/**
	 * Close YBP (You/your Beneficiary are paid) agreement dialog
	 */
	_closeYBPAgreementDialog() {
		this.showYBPAgreementDialog = false;
	}

	/**
	 * Open FCP (Funeral cover plan) agreement dialog
	 */
	_openFCPAgreementDialog() {
		this.showFCPAgreementDialog = true;
	}

	/**
	 * Close FCP (Funeral cover plan) agreement dialog
	 */
	_closeFCPAgreementDialog() {	
		this.quoteRuleAgreementFuneralCoverAccepted = true;
		this.showFCPAgreementDialog = false;
	}

	/**
	 * Open YROA (Your responsibility & our Accountability) agreement dialog
	 */
	_openYROAAgreementDialog() {
		this.showYROAAgreementDialog = true;
	}

	/**
	 * Close YROA (Your responsibility & our Accountability) agreement dialog
	 */
	_closeYROAAgreementDialog() {
		this.showYROAAgreementDialog = false;
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

			.left-card{
				height: 100%;
				display: flex;
				flex-direction: column;
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

			.notif-container{
				background: #daf2f4;
				padding: 15px;
				display: flex;
				justify-content: start;
			}

			.notif-container > .content {
				padding-left: 10px;
			}

			.notif-container > .content .title {
				font-weight: bold;
			}

			.account-details-bar {
				display: flex;
				position: relative;
			}

			.account-details-bar > capitec-expander {
				position: absolute;
				border: 1px solid #e1e1e1;
				border-radius: 5px;
				--theme-container-padding-right: 0px;
				--theme-container-padding-left: 0px;
				--theme-container-padding-top: 0px;
				--theme-container-padding-bottom: 0px;
				--theme-expander-header-height: 64px;
				--theme-expander-height: 211px;
				--theme-expander-indicator-width: 11.5px;
				--theme-expander-indicator-height: 6.5px;
				--theme-expander-border: 0px;
				box-shadow:0 3px 6px 0.25px rgba(0,0,0,0.08);
				
			}

			.account-details-bar > capitec-group {
				width: 93%;
				z-index: 10;
				padding-top: 12px;
				padding-bottom: 12px;
				border-right: 1px solid #dfdfdf;
			}

			.actionbar-header > horizon-label {
				width: 200px;
				height: 100%;
				font-weight: 300;
				justify-content: left;
				padding: 0px 0px 0px 16px;
				--horizon-label-text-height: 20px;
				--horizon-label-text-font-size: 14px;
				--horizon-label-text-line-height: 20px;
				--horizon-label-value-height: 20px;
				--horizon-label-value-font-size: 16px;
				--horizon-label-value-line-height: 20px;
				--horizon-label-value-color:#3A3A3A;
			}

			.actionbar-header > horizon-label[label="Cover amount (Min R5 000 - Max R100 000)"] {
				width: 300px;
			}

			.expander-options{
				display: flex; 
				justify-content: space-between; 
				padding: 20px 15px 15px 15px; 
				gap: 10px;
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
			${this._renderEACLAgreementDialog()}
			${this._renderYBPAgreementDialog()}
			${this._renderFCPAgreementDialog()}
			${this._renderYROAAgreementDialog()}
			${this._renderUpdatePlanAddLifeAssuredDialog()}
		`;
	}
	// ${this._renderErrorScreen()}
	// _renderErrorScreen() {
	// 	return html`
	// 				<horizon-service-call-error-screen data-automation-id="lbb-service-unavailable-screen"
	// 					image="/images/insure/assign-pay-arrears.svg" header="Live Better currently unavailable" right="Find a Branch"
	// 					bannerDetail="Live Better is currently unavailable" displayToast="true" >
	// 					<section id="id-error-msg" slot="detail">
	// 						<p>We are experiencing technical difficulties.<br>
	// 							We are sorry for the inconvenience and aim to have it resolved soon.</p>
	// 						<p><b>For any urgent matters, please visit a branch</b></p>
	// 					</section>

	// 				</horizon-service-call-error-screen>
	// 	`
	// }

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
				<capitec-button type="white"  label="Update plan" @click="${() => this._goToUpdatePlan()}">
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
					<capitec-label label="Relationship: ${lifeAssured.relationship}" type="small" class="stronger">
					</capitec-label>
		
					<capitec-label @click="${() => this._estimateRemoveLifeAssured(lifeAssured)}" label="Remove" type="small"
						class="stronger link">
					</capitec-label>
				</div>
				` : html`
				<div class="calc-card-header">
					<capitec-label label="Main Life: You" type="small" class="stronger"></capitec-label>
				</div>
				`}
		
				<div class="calc-card-row">
					<capitec-text-field label="Cover Amount" type="currency" style="width: 50%;"
						@value-changed="${(e) => this._estimateLifeCoverAmountValueChanged(e, index)}"
						value="${lifeAssured.coverAmount}">
					</capitec-text-field>
					<capitec-text-field label="Premium" type="currency" disabled hint="Estimate" style="width: 50%;"
						value="${lifeAssured.premium}">
					</capitec-text-field>
				</div>
				<div class="calc-card-row">
					<capitec-text-field label="Age" type="numeric"
						@value-changed="${(e) => this._estimateLifeAgeValueChanged(e, index)}" style="width: 50%;">
					</capitec-text-field>
					<capitec-select label="Gender" display-field="text" .items="${this.GENDER_OPTIONS}" id-field="code"
						style="width: 50%" @value-changed="${(e) => this._estimateLifeGenderValueChanged(e, index)}">
					</capitec-select>
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
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}" />
			<capitec-label label="Update Plan" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			${this.selectedQuoteTabIndex != 0 ? html`
			<capitec-button label="Email Plan" type="white" ></capitec-button>
			` : html`
			<capitec-button label="Calculate" type="white" ></capitec-button>
			`}

			<capitec-button label="Update Plan" type="white" .disableFd="${this.quoteRuleAgreementFuneralCoverAccepted == false}">
			</capitec-button>
			
		</capitec-title-bar>
		<capitec-card style="min-height: 100vh;">
		<capitec-tab-group @tab-select="${(e) => this._updatePlanTabChange(e)}">

			${this._renderPremiumTab()}
			${this._renderBeneficiariesTab()}
			${this._renderDebitOrderTab()}

		</capitec-tab-group>
		</capitec-card>`
	}

	/**
	 * render the premium Tab of Update plan
	 * @returns {html}
	 * 
	 */
	_renderPremiumTab() {
		return html`
		<capitec-tab label="Premium & Cover Amount">
		<div class = "insure-calc-columns">
			
			${this._renderLeftPremiumColumn()}
		
			<div class = "insure-calc-column-right"> 
				<div class="calc-summary-card">
					<div>
						<!-- top -->
						<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
						</capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-label label="Total estimated monthly premium"></capitec-label>
						<capitec-label label="R0.00" class="calc-premium-total">
						</capitec-label>
						<capitec-label label="Summary of estimated monthly premium:" class="stronger"></capitec-label>
						<hr>

						<!-- life list -->
						<div class="calc-life-list">

						</div>	
					</div>	

					<!-- bottom -->
					<div>
						<capitec-label label="Specify a premium you are willing to pay" class="stronger"></capitec-label>
						<br>
						<capitec-text-field label="Premium Amount" type="numeric">
						</capitec-text-field>
					</div>
				</div>
			</div>

		</div> 
		</capitec-tab>
		`
	}

	/**
	 *  render the left column of the premium tab of Update plan
	 * @returns {html}
	 */
	_renderLeftPremiumColumn() {
		return html `
		
			<div class = "insure-calc-column-left">
				<div class="left-card">
				<capitec-expander-group modeset="single">
					${this.quote.lifesAssured.map((lifeAssured, index) => html`
						${index !=0 ? html`
							<!-- Life assured expander -->
							<div class="account-details-bar">
								<capitec-expander label="" >
									<div class="expander-options">
										<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" 
											id-field="code" style="width: 50%" >
										</capitec-select>

										<capitec-text-field label="Name" style="width: 50%">
										</capitec-text-field>
									</div>
									<div class="expander-options">
										<capitec-text-field label="Surname" style="width: 50%">
										</capitec-text-field>

										<capitec-text-field label="Email Address" style="width: 50%">
										</capitec-text-field>
									</div>
									<div class="expander-options">
										<capitec-text-field label="Date of birth" style="width: 50%">
										</capitec-text-field>

										<capitec-text-field label="Cover amount" style="width: 50%">
										</capitec-text-field>
									</div>
									<div class="expander-options">
										<capitec-select label="Gender" .items="${this.genderOptions}" display-field="text" 
											id-field="code" style="width: 50%">
										</capitec-select>

										<capitec-text-field label="ID" style="width: 50%">
										</capitec-text-field>
									</div>
								</capitec-expander>
								<capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">
									<horizon-label
										label="Relationship: ${lifeAssured.relationship}"
										value="name">
									</horizon-label>
									
									<horizon-label
										label="Cover amount (Min R5 000 - Max R100 000)"
										value="amount">	
									</horizon-label>
									
									<capitec-label label="Remove" type="subtitle" class="stronger link">
									</capitec-label>
								</capitec-group>
							</div>

						`:html`
							<!-- notifications -->	
							${this._renderFCPNotification()}						
							
							<!-- main life details -->
							<div class="calc-card-row">
								<capitec-label label="Main Life" type="strong">
								</capitec-label>
							</div>
							
							<!-- main life expander -->
							<div class="account-details-bar">
								<capitec-expander label="" >
									<div class="expander-options">
										<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" 
											id-field="code" style="width: 50%" disabled>
										</capitec-select>

										<capitec-text-field label="Name" style="width: 50%" disabled>
										</capitec-text-field>
									</div>
									<div class="expander-options">
										<capitec-text-field label="Surname" style="width: 50%" disabled>
										</capitec-text-field>

										<capitec-text-field label="Email Address" style="width: 50%" disabled>
										</capitec-text-field>
									</div>
									<div class="expander-options">
										<capitec-text-field label="Date of birth" style="width: 50%" disabled>
										</capitec-text-field>

										<capitec-text-field label="Cover amount" style="width: 50%">
										</capitec-text-field>
									</div>
									<div class="expander-options">
										<capitec-select label="Gender" .items="${this.genderOptions}" display-field="text" 
											id-field="code" style="width: 50%" disabled>
										</capitec-select>

										<capitec-text-field label="ID" style="width: 50%" disabled>
										</capitec-text-field>
									</div>
								</capitec-expander>
								<capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">								
									<horizon-label label="Main life" value="name">
									</horizon-label>
									
									<horizon-label label="Cover amount (Min R5 000 - Max R100 000)" value="amount">	
									</horizon-label>

								</capitec-group>
							</div>
							
							<!-- add lives Assured  -->
							<div class="calc-card-row" style="margin-top: 15px;">
								<capitec-label label="Lives Assured" type="subtitle" class="stronger">
								</capitec-label>
								<capitec-label label="Add Life Assured" type="subtitle" class="stronger link" @click="${() => this._openAddLifeDialog()}">
								</capitec-label>
							</div>

						`}
					`)}
					</capitec-expander-group>
				</div>

			</div>	


		`
	}

	/**
	 * render the beneficiaries tab of Update plan
	 * @returns {html}
	 * 
	 */
	_renderBeneficiariesTab() {
		return html`
		<capitec-tab label="Beneficiaries">
		
		<div class = "insure-calc-columns">
 		
			<div class = "insure-calc-column-left">
				<div class = "left-card">
						<!-- Notifications -->
						${this._renderEACLNotification()}
						${this._renderYBPNotification()}

						<!-- main life details -->
						<div class="calc-card-row">
							<capitec-label label="Main Life" type="strong">
							</capitec-label>
						</div>
		
						<!-- main life expander -->
						<div class="account-details-bar">
							<capitec-expander label="">
								<div class="expander-options">
									<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" 
										id-field="code" style="width: 50%" disabled>
									</capitec-select>
									</capitec-select>
									<capitec-text-field label="Name" disabled style="width: 50%">
									</capitec-text-field>
								</div>
								<div class="expander-options">
									<capitec-text-field label="Surname" disabled style="width: 50%">
									</capitec-text-field>
									<capitec-text-field label="Email Address" disabled style="width: 50%">
									</capitec-text-field>
								</div>
								<div class="expander-options">
									<capitec-text-field label="Date of birth" style="width: 50%" disabled>
									</capitec-text-field>
									<capitec-text-field label="Cover amount" style="width: 50%">
									</capitec-text-field>
								</div>
								<div class="expander-options">
									<capitec-select label="Gender" .items="${this.genderOptions}" display-field="text" 
										id-field="code" style="width: 50%" disabled>
									</capitec-select>
										<capitec-text-field label="ID" disabled style="width: 50%">
									</capitec-text-field>
								</div>
							</capitec-expander>
							<capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">
								<horizon-label label="Main Life" value="name">
								</horizon-label>
								
								<horizon-label label="Cover amount (Min R5 000 - Max R100 000)" value="amount">	
								</horizon-label>
							</capitec-group>
						</div>

						<!--Beneficiaries  -->
						<div class="calc-card-row" style="margin-top: 15px;">
							<capitec-label label="Beneficiaries" type="subtitle" class="stronger">
							</capitec-label>
							<capitec-label label="Add Beneficiary" type="subtitle" class="stronger link">
							</capitec-label>
						</div>
		
					</div>
		
				</div>
 			</div>

			<div class = "insure-calc-column-right">
				<div class = "calc-summary-card">
					<div>
						<!-- top -->
						<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
						</capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-label label="Total cover amount"></capitec-label>
						<capitec-label label="R00.00" class="calc-premium-total">
						</capitec-label>
						<capitec-label label="Summary of payout beneficiary amount:" class="stronger"></capitec-label>
						<hr>

						<!-- life list -->
						<div class="calc-life-list">

						</div>	
					</div>	

					<!-- bottom -->
					<!-- <div>
						<capitec-label label="Specify a premium you are willing to pay" class="stronger"></capitec-label>
						<br>
						<capitec-text-field label="Premium Amount" type="numeric">
						</capitec-text-field>
					</div> -->
				</div>
 			</div>
		
		</div>

		</capitec-tab>
		`
	}


	/**
	 * render the Debit order tab of the Update plan
	 * @returns {html}
	 */
	_renderDebitOrderTab() {
		return html`
		<capitec-tab label="Debit Order Details">
			
		<div class = "insure-calc-columns">
 		
		 	<div class = "insure-calc-column-left">
				<div class = "left-card">
					<!-- notifications -->
					${this._renderYROANotification()}
					

					<!-- Collection account card -->
					<div class="calc-card">
					
						<div class="calc-card-header">
							<capitec-label type="subtitle" class="stronger" label="Collection Account" style="padding: 10px;">
							</capitec-label>
 						</div>

						<div class="calc-card-row">
							
							<capitec-select 
								label="Bank" 
								.items="${this.bankOptions}" 
								display-field="text"
								id-field="code"
								style="width: 50%"
								>
							</capitec-select>

							<capitec-text-field 
								label="Account Number"
								type="numeric"
								style="width: 50%">
							</capitec-text-field>

 						</div>

						 <div class="calc-card-row">
							
							<capitec-select 
								label="Account Type" 
								.items="${this.accountTypeOptions}" 
								display-field="text"
								id-field="code"
								style="width: 50%"
								>
							</capitec-select>

							<capitec-text-field 
								label="Branch Code"
								type="numeric"
								style="width: 50%">
							</capitec-text-field>

 						</div>

						<div class="calc-card-row">
							
							<capitec-select 
								label="Debit order day" 
								.items="${this.debitOrderDayOptions}" 
								display-field="text"
								id-field="code"
								style="width: 50%"
								>
							</capitec-select>

 						</div>

						<div class="calc-card-row"> 
							<div >

								<capitec-label label="Does the client prefer to authenticate the the DebiCheck mandate by" ></capitec-label>
								<capitec-radio-group label="Does the client prefer to authenticate the the DebiCheck mandate by">
									<capitec-radio label="Card and Pin (Bank Card Present)" checked disabled></capitec-radio>
									<capitec-radio label="Remote Authentication (USSD/Banking App/Online)" disabled></capitec-radio>
								</capitec-radio-group>

							</div>
						</div>

					</div>

 				</div>
 			</div>

			<div class="insure-calc-column-right">

				<div class = "calc-summary-card">
					<div>
						<!-- top -->
						<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
						</capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-label label="Total estimated monthly premium"></capitec-label>
						<capitec-label label="R00.00" class="calc-premium-total">
						</capitec-label>
						<capitec-label label="Summary of estimated monthly premium:" class="stronger"></capitec-label>
						<hr>

						<!-- life list -->
						<div class="calc-life-list">

						</div>	
					</div>	

					<!-- bottom -->
					<div>
						<capitec-label label="Specify a premium you are willing to pay" class="stronger"></capitec-label>
						<br>
						<capitec-text-field label="Premium Amount" type="numeric">
						</capitec-text-field>
					</div>
				</div>

 			</div>



 		</div>	
		</capitec-tab>
		`
	}

	

	/**
	 * Render Update Plan page
	 * @return {html} Html of the sub view
	 */
	_renderFuneralPlanDetailsPage() {
		return html`<div>Hi I am Funeral Plan details Page</div>`
	}

	// ---- Notifications
	
	/**
		 * Render notification component for 'Your responsibility & our accountability'
		 * 
		 * @returns {html} The html content of the component.
		 */
	_renderYROANotification() {
		return html`
		<div class="notif-container">
			<div class="icon">
				<capitec-icon icon="status/info-trans" size="default"  @click="${() => this._openYROAAgreementDialog()}"></capitec-icon>
			</div>
			<div class="content">
				<label class="title">Notify:</label>
				<label class="detail">
					I agree to
					<strong>Your Responsibility & Our Accountability</strong>
					agreement declaration
				</label>
			</div>
		</div>
	`
	}

	/**
	 * Render notification component for 'Funeral cover plan'
	 * @returns {html}
	 */
	_renderFCPNotification() {
		return html`
		<div class="notif-container">
			<div class="icon">
				<capitec-icon icon="status/info-trans" size="default"  @click="${() => this._openFCPAgreementDialog()}"></capitec-icon>
			</div>
			<div class="content">
				<label class="title">Notify:</label>
				<label class="detail">
					I agree to
					<strong>Funeral cover plan</strong>
					agreement declaration
				</label>
			</div>
		</div>	
	`
	}

	/**
	 * Render notification component for 'Entry Ages and Child Limits'
	 * @returns {html}
	 */
	_renderEACLNotification() {
		return html`
		<div class="notif-container">
			<div class="icon">
				<capitec-icon icon="status/info-trans" size="default" @click="${() => this._openEACLAgreementDialog()}" ></capitec-icon>
			</div>
			<div class="content">
				<label class="title">Notify:</label>
				<label class="detail">
					I agree to
					<strong>Entry Ages and Child Limits</strong>
					agreement declaration
				</label>
			</div>
		</div>
	`
	}

	/**
	 * Render notification component for 'You/your beneficiary are paid'
	 * @returns {html}
	 */
	_renderYBPNotification() {
		return html`
		<div class="notif-container">
			<div class="icon">
				<capitec-icon icon="status/info-trans" size="default"  @click="${() => this._openYBPAgreementDialog()}"></capitec-icon>
			</div>
			<div class="content">
				<label class="title">Notify:</label>
				<label class="detail">
					I agree to
					<strong>You/your beneficiary are paid</strong>
					agreement declaration
				</label>
			</div>
		</div>
	`
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
	 * Render Dialog to add Life assured to Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderUpdatePlanAddLifeAssuredDialog() {
		return this.showAddRelationshipDialog == false ? ``:
			html`
			<insure-add-life-dialog @addNewLife="${(e) => this._addLifeQuote(e)}"
				@closeModal="${(e) => this._closeAddLifeDialog(e)}" .currentLifesAssured="${this.quote.lifesAssured}">
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

	/**
	 * Render Dialog for EACL Agreement
	 * @returns {html}
	 */
	_renderEACLAgreementDialog() {
		return this.showEACLAgreementDialog == false ? `` :
			html`
			<capitec-modal type="form" header="Entry Ages and Child Limits Agreement Declaration">
				<div slot="body">
					In deciding who to include, please note: 

					<ul>
						<li>Entry Age is how old the Life Assured is on the Cover Start Date and is used to calculate the premium and cover. Once on the plan, there are no age restrictions; </li>
						<li>By law the total amount that can be paid out for a child’s death is limited. These limits apply across all our plans, benefit types and bind Insurers.</li> 
					</ul>
				</div>
				<capitec-button slot="footer" type="clear" label="Accept" @click="${() => this._closeEACLAgreementDialog()}"></capitec-button>
				<!-- <capitec-button slot="footer" type="clear" label="Decline"></capitec-button> -->
			</capitec-modal>
			`
	}

	/**
	 * render Dialog for YBP Agreement
	 * @returns {html}
	 */
	_renderYBPAgreementDialog() {
		return this.showYBPAgreementDialog == false ? `` :
			html`
		<capitec-modal type="form" header="You/your beneficiary are paid Agreement Declaration">
			<div slot="body">
				<strong>You/your beneficiary are paid:</strong>
				<ul>
					<li>The cover amount in the Schedule when a Life Assured dies only AFTER 6 months from the Cover Start Date;</li>
					<li>Double the Funeral Benefit cover amount in the Schedule when a Life Assured dies due to an accident any time after the Cover Start Date. </li>
				</ul>
				A Waiting Period will not be applicable on the Funeral Benefit if:  
				<ul>
					<li>the Lives Assured were covered on a previous funeral policy with another Licensed Insurer within 31 (thirty-one) days before the Cover Start Date or covered on a previous Capitec Funeral Cover Plan within 2 (two) months before the Cover Start Date (“the previous policy”); and </li>
					<li>the previous policy has lapsed or was cancelled; and </li>
					<li>the waiting period expired in respect of that previous policy for the Life Assured.</li>
				</ul>
				<strong>Burial Repatriation:</strong> We will transport the deceased to the funeral home of the claimant’s choice from within the Republic of South Africa, Namibia, Zimbabwe, Botswana, Swaziland, Lesotho and Mozambique to the closest place of burial anywhere in South Africa.  
			</div>
			<capitec-button slot="footer" type="clear" label="Accept" @click="${() => this._closeYBPAgreementDialog()}"></capitec-button>
			<!-- <capitec-button slot="footer" type="clear" label="Decline"></capitec-button> -->
		</capitec-modal>`;
	}

	/**
	 * render Dialog for FCP Agreement
	 * @returns {html}
	 */
	_renderFCPAgreementDialog() {
		return this.showFCPAgreementDialog == false ? `` :
			html`
		<capitec-modal type="form" header="Funeral cover plan Agreement Declaration">
			<div slot="body">
				<strong>The Funeral Plan: </strong>
				
				<p><strong>Starts:  </strong></p>
				
				<ul>
				<li>Immediately on the date of signature of this agreement, and certain benefits are payable from the Cover Start Date  </li>
				</ul>

				<strong>Ends if:  </strong>
				
				<ul>
				<li>You or Capitec cancel your Funeral Cover Plan;</li> 
				<li>You cancel in the cooling off period of 31 days from the Cover Start Date without claim, and you will receive a full refund of premiums paid; </li> 
				<li>You cancel at any other time with no refund of premiums already paid; </li> 
				<li>Your Capitec savings account is closed; </li> 
				<li>You are in arrears with 3 premiums. Your Funeral Cover Plan will then be terminated with effect from the date of the last premium received by Us. </li> 
				<li>You as the policyholder dies and the Death Premium Waiver benefit ends;  </li> 
				<li>Fraud is confirmed. 
				</ul>
			</div>
			<capitec-button slot="footer" type="clear" label="Accept" @click="${() => this._closeFCPAgreementDialog()}"></capitec-button>
		</capitec-modal>
		`;
	}

	/**
	* Render Dialog for YROA Agreement
	* @returns {html}
	*/
	_renderYROAAgreementDialog() {
		return this.showYROAAgreementDialog == false ? `` :
			html`
			<capitec-modal type="form" header="Your responsibility & Our Accountability Agreement Declaration">
				<div slot="body">
				<strong>Your Responsibility </strong>

				<ul>
					<li>You must give us accurate and true personal information, yours and all the Lives Assured; </li>
					<li>Any misrepresentation, incorrect or non-disclosure of information or circumstances may have a negative impact when you claim. </li>
				</ul>

				<strong> Our Accountability </strong>

				<p>If you’re unhappy with our products or services, we have provided detailed contact information in the Agreement and on our website. Please call our 24hr Client Care Centre.  </p>
				
				If you are still not satisfied please complain to: 
				<ul>
					<li>Centriq’s Complaints or Compliance department</li> 

					<li>the FAIS Ombudsman </li> 

					<li>the Long-term Insurance Ombudsman </li> 
				</ul>	

				<p>You will find their contact details in your Funeral Cover Plan Agreement. </p>

				<p>We may unilaterally change the terms, provisions and conditions of the Funeral Cover Plan by giving you at least 31 days’ written notice.  </p>

				</div>
				<capitec-button slot="footer" type="clear" label="Accept" @click="${() => this._closeYROAAgreementDialog()}"></capitec-button>
				<!-- <capitec-button slot="footer" type="clear" label="Decline"></capitec-button> -->
			</capitec-modal>
			`
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

	//#region HELPERS

	//#endregion
}

customElements.define(`horizon-existing-client`, ExistingClient);