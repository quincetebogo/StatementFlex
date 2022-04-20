import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getCoverDetailsByParams, livesPerPolicy } from 'app/utils/insureUtils';

import { GENDER_OPTIONS } from 'app/constants/InsureCommon';

import 'app/components/dialogs/insure/InsureAddLifeDialog';
import 'app/components/common/HorizonLabel';
import 'app/components/common/ServiceCallErrorScreen';

class PolicyEstimate extends Component {

	constructor() {
		super();
		this.clientEstimateDetails = {};
		this.showAddRelationshipDialog = false;

		// Lookups
		this.genderOptions = GENDER_OPTIONS;
	}

	static get properties() {
		return {
			estimate: { state: true },
			productParams: { state: true },
			newTotalPremium: { string: '' },
			showAddRelationshipDialog: { state: false }
		};
	}

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialize();
	}

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

			.calc-premium-total{
				font-size: 32px;
				font-weight: 600;
				color: #3A3A3A;
			}

			.calc-summary-card{
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
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
	 * Initialize component
	 */
	async _initialize() {
		this.estimate.lifesAssured = [];
		this.estimate.lifesAssured.push({
			relationship: "MainLife",
			coverAmount: 10000,
			premium: 0,
			genderType: "Male",
			age: 0,
			rowID: 0,
			coverDetails: {
				defaultCover: 100000,
				maxCover: 100000,
				minCover: 5000,
				ageMax: 64,
				ageMin: 18,
			}
		});
		this.estimate.totalPremium = 0;
		// this.clientEstimateDetails = {
		// 	"estimateReference": "",
		// 	"clientCif": this.callerInformation.cifNumber,
		// 	"lastName": this.callerInformation.lastName,
		// 	"firstName": this.callerInformation.firstName,
		// 	"contactEmail": "",
		// 	"contactNumber": this.callerInformation.verifiedTelephoneNumber
		// }
		this.requestUpdate();
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
		this.newTotalPremium = '';
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
			this.newTotalPremium = '';
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
			this.newTotalPremium = '';
		}
		this.estimate.lifesAssured[index].coverDetails = getCoverDetailsByParams(this.estimate.lifesAssured[index].relationship, this.productParams, this.estimate.lifesAssured[index].age);
	}

	/**
	 * Event fired when an estimate life assured GENDER value changes
	 * @param {*} event 
	 * @param {*} index 
	 */
	_estimateLifeGenderValueChanged(event, index) {
		if (event.detail.old != event.detail.new) {
			this.estimate.lifesAssured[index].genderType = event.detail.new.code;
			this.newTotalPremium = '';
		}
	}

	/**
	 * Event fired when calculate by Premium override input changed
	 * @param {*} event 
	 * @returns {object} Estimate Response
	 */
	async _totalPremiumChanged(e) {
		this.newTotalPremium = e.detail.new;

		// const request = {
		// 	...this.estimate,
		// 	clientEstimateDetails: this.clientEstimateDetails
		// }
		// let estimateResponse = await this.calculateClientEstimate(request);
		// if (estimateResponse != null) {
		// 	this.estimate = estimateResponse.result;
		// }
		// this.totalPremiumOverrideInput = '';
	}

	/**
	 * Calculate Button event / Calculate by life assured
	 * @returns {object} Estimate Response
	 */
	async _calculateEstimate() {
		if (this.newTotalPremium != 0) {
			console.log("Calculating by premium")
			this.estimate.totalPremium = this.newTotalPremium
		}

		const request = {
			...this.estimate,
			// clientEstimateDetails: this.clientEstimateDetails
		}

		// Reset
		this.estimate.totalPremium = 0;
		this.newTotalPremium = '';

		console.log("this.estimate")
		console.log(this.estimate);

		this.dispatchEvent(new CustomEvent(`calculate`, {
			detail: request
		}));

		// let estimateResponse = await this.calculateClientEstimate(request);
		// if (estimateResponse != '') {
		// 	this.estimate = estimateResponse;
		// }'



		this.requestUpdate();
	}

	//#region PRIVATE FUNCTIONS

	_backToSummaryPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, {
			detail: {
			}
		}));
	}

	/**
	 * Open Add Life dialog returning select relationship
	 */
	_openAddLifeDialog() {
		// Telemetry here
		this.showAddRelationshipDialog = true;
	}

	_closeAddLifeDialog() {
		this.showAddRelationshipDialog = false;
	}

	//#endregion

	/**
	 * Main render point for component
	 * @returns {html}
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
			${this._renderDialogs()}
		`;
	}

	_renderDialogs() {
		return html`
			${this._renderEstimateAddLifeAssuredDialog()}
		`
	}

	/**
	 * Render the content HTML  for the component
	 */
	_renderContent() {
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
						value="${lifeAssured.coverAmount}" hint="R${lifeAssured?.coverDetails?.minCover} - R${lifeAssured?.coverDetails?.maxCover}" min="${lifeAssured?.coverDetails?.minCover}" max="${lifeAssured?.coverDetails?.maxCover}">
					</capitec-text-field>
					<capitec-text-field label="Premium" type="currency" disabled hint="Estimate" style="width: 50%;"
						value="${lifeAssured.premium}">
					</capitec-text-field>
				</div>
				<div class="calc-card-row">
					<capitec-text-field label="Age" type="numeric"
						@value-changed="${(e) => this._estimateLifeAgeValueChanged(e, index)}" style="width: 50%;"
						hint="${lifeAssured?.coverDetails?.ageMin} - ${lifeAssured?.coverDetails?.ageMax}" min="${lifeAssured?.coverDetails?.ageMin}" max="${lifeAssured?.coverDetails?.ageMax}">
					</capitec-text-field>
					<capitec-select label="Gender" display-field="text" .items="${this.genderOptions}" id-field="code"
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
					<div>
						<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-label label="Total estimated monthly premium"></capitec-label>
						<capitec-label label="${formatCurrency(this.estimate.totalPremium)}" class="calc-premium-total">
						</capitec-label>
						<capitec-label label="Summary of estimated monthly premium:" class="stronger"></capitec-label>
						<hr>
			
						${this.estimate.lifesAssured.map(life => html`
						<div class="calc-life-list">
							<capitec-label label="${life.relationship}"></capitec-label>
							<capitec-label label="${formatCurrency(life.premium)}"></capitec-label>
						</div>
						<hr>`)}
			
						<div class="calc-life-list">
							<capitec-label label="Total Premium Amount" class="stronger"></capitec-label>
							<capitec-label label="${formatCurrency(this.estimate.totalPremium)}" class="stronger"></capitec-label>
						</div>
					</div>
			
					<div>
						<capitec-label label="Specify a premium you are willing to pay" class="stronger"></capitec-label>
						<br>
						<capitec-text-field @value-change="${(e) => this._totalPremiumChanged(e)}" .value="${this.newTotalPremium}"
							label="Premium Amount" type="currency">
						</capitec-text-field>
					</div>
				</div>
			</div>`
	}

	/** Dialogs */

	/**
	 * Render Dialog to add Life assured to Estimate
	 * @return {html} Html of the dialog
	 */
	_renderEstimateAddLifeAssuredDialog() {
		return this.showAddRelationshipDialog == false ? `` :
			html`
			<insure-add-life-dialog @addNewLife="${(e) => this._addLifeEstimate(e)}"
				@closeModal="${(e) => this._closeAddLifeDialog(e)}" .currentLifesAssured="${this.estimate.lifesAssured}"
				.productParams="${this.productParams}">
			</insure-add-life-dialog>`
	}
}

window.customElements.define(`horizon-insure-policy-estimate`, PolicyEstimate);