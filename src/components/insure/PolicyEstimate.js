import { Component, css, html } from 'platform/elements';

import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getCoverDetailsByParams } from 'app/utils/insureUtils';
import { GENDER_OPTIONS } from 'app/constants/InsureCommon';

import 'app/components/dialogs/insure/AddLifeDialog';
import 'app/components/common/HorizonLabel';

/**
 * Insure Policy Estimate component that allows cover and premium estimations be made on the fly.
 * Lives can be added AddLiveDialog
 * 
 * Events Raised 
 * -------------
 * navigate-back
 * calculate
 *  
 * @export
 * @class PolicyEstimate
 * @extends {Component}
 */
class PolicyEstimate extends Component {

	//#region INITIALISATION

	constructor() {
		super();
		this.genderOptions = GENDER_OPTIONS;
		this.showAddLifeDialog = false;
		this.canPerformEstimate = false;
	}

	//#endregion

	//#region PROPERTIES

	/**
	 * @property {Object} estimate Data & flags for view & estimate service request
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {String} newTotalPremium Tied to 'calculate by premium' input and used to track the override
	 * @property {boolean} showAddLifeDialog Controls when to show the AddLife dialog
	 * @property {boolean} canPerformEstimate Check to enable calculate button
	 * @property {boolean} mainLifeDefaultAge Main life derived age
	 * @property {boolean} mainLifeDefaultGender Main life derived gender
	 * @property {Number} maxAllowedCover  CheckInsurance limit for remaining cover limit
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			estimate: { type: Object, state: true },
			productParams: { type: Object },
			newTotalPremium: { type: String, state: true },
			showAddLifeDialog: { type: Boolean, state: true },
			canPerformEstimate: { type: Boolean, state: true },
			mainLifeDefaultAge: { type: Number, state: true },
			mainLifeDefaultGender: { type: String, state: true },
			maxAllowedCover: { type: Number, state: true }
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
	 * Navigate to Landing
	 */
	_backToSummaryPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, {
			detail: {
			}
		}));
	}

	/**
	 * Calculate Button event
	 * 1. Determine if should calculate by premium or not
	 * 2. Dispatch event to invoke service
	 * 3. Reset total premium values
	 * 
	 */
	async _calculateEstimate() {
		if (this.newTotalPremium != '') {
			this.estimate.totalPremium = this.newTotalPremium
		} else {
			delete this.estimate.totalPremium
		}
		let request = {
			...this.estimate,
		}
		this.dispatchEvent(new CustomEvent(`calculate`, {
			detail: request
		}));
		this.estimate.totalPremium = 0;
		this.newTotalPremium = '';
	}


	/**
	 * Add Event from Add life dialog for Estimate.
	 * Receives relationship & cover details from dialog, and sets default values for the remaining properties.
	 * Closes dialog when finished.
	 * @param {Event} event Contains coverDetails & relationship from Add Life dialog
	 */
	_addLife(event) {
		let life = {
			relationship: event.detail.relationship,
			coverAmount: '',
			premium: 0,
			genderType: "Male",
			age: '',
			rowID: this.estimate.lifesAssured.length,
			coverDetails: event.detail.coverDetails
		}

		// Set initial error message
		// life.coverDetails.coverMessage = life.coverDetails.minCoverMessage.replace("{0:#,##0}", life.coverDetails.minCoverAmount);

		this.estimate.lifesAssured.splice(1, 0, life);
		this.showAddLifeDialog = false;
		this.canPerformEstimate = false;
	}

	/**
	 * Click event from remove button on life list
	 * @param {Object} lifeToRemove Live object at index that was clicked
	 */
	_removeLife(lifeToRemove) {
		this.estimate.lifesAssured.splice(lifeToRemove.rowID, 1);
		for (let index = 0; index < this.estimate.lifesAssured.length; index++) {
			this.estimate.lifesAssured[index].rowID = index;
		}
		this.newTotalPremium = '';
		this.requestUpdate();
	}

	/**
	 * Event fired when an estimate life assured COVER AMOUNT value changes
	 * Captures new coverAmount value
	 * Refresh error messages for Age & Cover amount
	 * Toggle canPerformEstimate
	 * @param {event} event Contains the new value for coverAmount
	 * @param {number} index Index of the life that changed
	 */
	_coverAmountChanged(event, index) {
		this.canPerformEstimate = true;
		if (event.detail.old != event.detail.new) {
			this.estimate.lifesAssured[index].coverAmount = event.detail.new;
			this.newTotalPremium = '';
		}
		this.estimate.lifesAssured[index].coverDetails.coverMessage = ``;
		this.estimate.lifesAssured[index].coverDetails.genderMessage = ``;

		// Over max cover check
		let maxCover = 0;
		if (index == 0) {
			maxCover = this.maxAllowedCover;
		} else {
			maxCover = this.estimate.lifesAssured[index].coverDetails.maxCoverAmount;
		}
		if (parseInt(this.estimate.lifesAssured[index].coverAmount) > parseInt(maxCover)) {
			this.estimate.lifesAssured[index].coverDetails.coverMessage = this.estimate.lifesAssured[index].coverDetails.maxCoverMessage
				.replace("{0:#,##0}", "R" + maxCover);
			this.canPerformEstimate = false;
		}

		// Under min cover check
		if (parseInt(this.estimate.lifesAssured[index].coverAmount) < parseInt(this.estimate.lifesAssured[index].coverDetails.minCoverAmount) ||
			this.estimate.lifesAssured[index].coverAmount == 0) {
			this.estimate.lifesAssured[index].coverDetails.coverMessage = this.estimate.lifesAssured[index].coverDetails.minCoverMessage
				.replace("{0:#,##0}", "R" + this.estimate.lifesAssured[index].coverDetails.minCoverAmount);
			this.canPerformEstimate = false;
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when an estimate life assured AGE value changes
	 * Captures new age value
	 * Refresh cover details for life, supplying age
	 * Refresh error messages for Age & Cover amount
	 * Toggle canPerformEstimate
	 * @param {event} event Contains the new value for age
	 * @param {number} index Index of the life that changed
	 */
	_ageChanged(event, index) {
		this.canPerformEstimate = true;
		if (event.detail.old != event.detail.new) {
			this.estimate.lifesAssured[index].age = event.detail.new;
			this.newTotalPremium = '';
		}
		this.estimate.lifesAssured[index].coverDetails.coverMessage = ``;
		this.estimate.lifesAssured[index].coverDetails.genderMessage = '';
		this.estimate.lifesAssured[index].coverDetails = getCoverDetailsByParams(
			this.estimate.lifesAssured[index].relationship,
			this.productParams,
			this.estimate.lifesAssured[index].age,
			this.estimate.lifesAssured[index].coverDetails.isExtendedFamily);

		// Age Check
		if (this.estimate.lifesAssured[index].age >= this.estimate.lifesAssured[index].coverDetails.minAge
			&& this.estimate.lifesAssured[index].age <= this.estimate.lifesAssured[index].coverDetails.maxAge) {
			this.estimate.lifesAssured[index].coverDetails.ageMessage = ``;
		} else {
			this.canPerformEstimate = false;
		}

		// Over max cover / under min cover checks
		if (this.estimate.lifesAssured[index].coverAmount != '') {
			if (parseInt(this.estimate.lifesAssured[index].coverAmount) > parseInt(this.estimate.lifesAssured[index].coverDetails.maxCoverAmount)) {
				this.estimate.lifesAssured[index].coverDetails.coverMessage = this.estimate.lifesAssured[index].coverDetails.maxCoverMessage
					.replace("{0:#,##0}", "R" + this.estimate.lifesAssured[index].coverDetails.maxCoverAmount);
				this.canPerformEstimate = false;
			}
			if (parseInt(this.estimate.lifesAssured[index].coverAmount < this.estimate.lifesAssured[index].coverDetails.minCoverAmount)) {
				this.estimate.lifesAssured[index].coverDetails.coverMessage = this.estimate.lifesAssured[index].coverDetails.minCoverMessage
					.replace("{0:#,##0}", "R" + this.estimate.lifesAssured[index].coverDetails.minCoverAmount);
				this.canPerformEstimate = false;
			}
		}
		else {
			this.estimate.lifesAssured[index].coverDetails.coverMessage = this.estimate.lifesAssured[index].coverDetails.minCoverMessage.replace("{0:#,##0}", this.estimate.lifesAssured[index].coverDetails.minCoverAmount);
		}

		this.requestUpdate();
	}

	/**
	 * Event fired when an estimate life assured GENDER value changes
	 * @param {event} event Contains the new value for gender
	 * @param {number} index Index of the life that changed
	 */
	_genderChanged(event, index) {
		if (event.detail.old != event.detail.new) {
			this.estimate.lifesAssured[index].genderType = event.detail.new.code;
			this.newTotalPremium = '';
		}
		this.requestUpdate();
	}

	/**
	 * @bug OIPA needs to fix this then we can invoke te service
	 * Event fired when calculate by Premium override input changed
	 * @param {*} event 
	 * @returns {object} Estimate Response
	 */
	async _totalPremiumChanged(e) {
		this.newTotalPremium = e.detail.new;
	}

	//#endregion

	//#region PRIVATE FUNCTIONS

	/**
	 * Initialize component when loaded / Add default life to list for calculator and list
	 */
	_initialise() {
		this.estimate.lifesAssured = [];
		this.estimate.lifesAssured.push({
			relationship: "MainLife",
			coverAmount: 5000,
			premium: 0,
			genderType: this.mainLifeDefaultGender,
			age: this.mainLifeDefaultAge,
			rowID: 0,
			coverDetails: {
				defaultCover: 5000,
				maxCoverAmount: 100000,
				minCoverAmount: 5000,
				maxAge: 64,
				minAge: 18,
				ageMessage: "",
				coverMessage: "",
				genderMessage: "",
				maxCoverMessage: "Only cover up to {0:#,##0} on main life assured is allowed.",
				minCoverMessage: "A minimum cover amount of {0:#,##0} is required for the main life.",
				mainLifeDetailsDisabled: this.mainLifeDefaultAge == 0 ? false : true
			}
		});
		this.estimate.totalPremium = 0;
		this.canPerformEstimate = true;
		this.requestUpdate();
	}

	//#endregion

	//#region RENDERING

	/**
	 * Generates the component stylesheet.
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

			#insure-calc-card{
				padding-top: 10px;
			}

			.insure-calc-columns{
				display: flex;
				justify-content: stretch;
			}
			#insure-calc-column-left{
				margin: 10px;
				flex: 2 1 520px;
				min-height: calc(100vh - 300px);
			}
			#insure-calc-column-right{
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
			}
			
			#calc-card-other{
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

			.calc-card-row-input{
				width: 50%;
			}

			.calc-card-row-actions{
				margin-top: 15px;
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


			:host > .disabledButton {
				color: #485b65!important;
			}
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
			${this._renderDialogs()}
		`;
	}

	/**
	 * Render dialogs for the component
	 * @returns {html} HTML for the dialogs used in the component
	 */
	_renderDialogs() {
		return html`
			${this._renderAddLifeDialog()}`
	}

	/**
	 * Render the content for the component
* 		@return {html} Html containing title bar and column components
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar" data-automation-id="insure-estimate-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}"
				data-automation-id="insure-estimate-back" />
			<capitec-label label="Get an estimate" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			</capitec-button>
			<capitec-button label="Calculate" class="${this.canPerformEstimate == false ? 'disabledButton' : ''}"
				.disabled="${this.canPerformEstimate == false}" type="white" data-automation-id="insure-estimate-calculate"
				@click="${() => this._calculateEstimate()}"></capitec-button>
		</capitec-title-bar>
		<capitec-card id="insure-calc-card">
			<div class="insure-calc-columns">
				${this._renderLeftColumn()}
				${this._renderRightColumn()}
			</div>
		</capitec-card>`
	}

	/**
	 * Render left column (Card List) for Estimate subview
	 * @return {html} Html of the left column, containing cards list with input fields for each life assured
	 */
	_renderLeftColumn() {
		return html`		
		<div id="insure-calc-column-left">
			${this.estimate.lifesAssured.map((lifeAssured, index) => html`
			<div class="calc-card" id=${index !=0 ? 'calc-card-other' : '' }>
				${index != 0 ? html`
				<div class="calc-card-header">
					<capitec-label data-automation-id="insure-estimate-card-relationship"
						label="Relationship: ${lifeAssured.relationship}" type="small" class="stronger">
					</capitec-label>
		
					<capitec-label data-automation-id="insure-estimate-card-remove"
						@click="${() => this._removeLife(lifeAssured)}" label="Remove" type="small" class="stronger link">
					</capitec-label>
				</div>
				` : html`
				<div class="calc-card-header">
					<capitec-label data-automation-id="insure-estimate-card-relationship" label="Main Life: You" type="small"
						class="stronger"></capitec-label>
				</div>
				`}
		
				<div class="calc-card-row">
					<capitec-text-field label="Cover Amount" type="currency" class="calc-card-row-input"
						data-automation-id="insure-estimate-card-cover"
						@value-changed="${(e) => this._coverAmountChanged(e, index)}" value="${lifeAssured.coverAmount}"
						hint="R${lifeAssured?.coverDetails?.minCoverAmount} - R${index == 0 ? this.maxAllowedCover : lifeAssured?.coverDetails?.maxCoverAmount}"
						error="${lifeAssured.coverDetails.coverMessage}">
					</capitec-text-field>
					<capitec-text-field label="Premium" type="currency" disabled hint="Estimate" class="calc-card-row-input"
						data-automation-id="insure-estimate-card-premium" value="${lifeAssured.premium}">
					</capitec-text-field>
				</div>
				<div class="calc-card-row">
					<capitec-text-field label="Age" type="numeric" data-automation-id="insure-estimate-card-age"
						keyboardMode="numeric" @value-changed="${(e) => this._ageChanged(e, index)}" value="${lifeAssured.age}"
						class="calc-card-row-input"
						hint="${lifeAssured?.coverDetails?.minAge} - ${lifeAssured?.coverDetails?.maxAge}"
						error="${lifeAssured.coverDetails.ageMessage}"
						.disabled="${lifeAssured.coverDetails.mainLifeDetailsDisabled == true}">
					</capitec-text-field>
					<capitec-select label="Gender" display-field="text" .items="${this.genderOptions}" id-field="code"
						data-automation-id="insure-estimate-card-gender" class="calc-card-row-input"
						@value-changed="${(e) => this._genderChanged(e, index)}" value="${lifeAssured.genderType}"
						.disabled="${lifeAssured.coverDetails.mainLifeDetailsDisabled == true}">
					</capitec-select>
				</div>
			</div>
		
			${index != 0 ? html`` : html`<div class="calc-card-row calc-card-row-actions">
				<capitec-label label="Lives Assured" type="subtitle" class="stronger"></capitec-label>
				<capitec-label label="Add Life Assured" type="subtitle" class="stronger link"
					data-automation-id="insure-estimate-add-life" @click="${() => this.showAddLifeDialog = true}">
				</capitec-label>
			</div>`}
			`)}
			<capitec-spacer></capitec-spacer>
		</div>
		`
	}

	/**
	 * Render right column (Life List & Calculation result) for Estimate subview
	 * @return {html} Html of the right column containing the calculation results & total premium override input
	 */
	_renderRightColumn() {
		return html`
			<div id="insure-calc-column-right">
				<div class="calc-summary-card">
					<div>
						<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-label label="Total estimated monthly premium"></capitec-label>
						<capitec-label label="${formatCurrency(this.estimate.totalPremium)}" class="calc-premium-total"
							data-automation-id="insure-estimate-heading-total-premium">
						</capitec-label>
						<capitec-label label="Summary of estimated monthly premium:" class="stronger"></capitec-label>
						<hr>
			
						${this.estimate.lifesAssured.map(life => html`
						<div class="calc-life-list">
							<capitec-label label="${life.relationship}" data-automation-id="insure-estimate-list-relationship">
							</capitec-label>
							<capitec-label label="${formatCurrency(life.premium)}"
								data-automation-id="insure-estimate-list-premium"></capitec-label>
						</div>
						<hr>`)}
			
						<div class="calc-life-list">
							<capitec-label label="Total Premium Amount" class="stronger"></capitec-label>
							<capitec-label label="${formatCurrency(this.estimate.totalPremium)}" class="stronger"
								data-automation-id="insure-estimate-list-total-premium"></capitec-label>
						</div>
					</div>
			
					<div>
						<capitec-label label="Specify a premium you are willing to pay" class="stronger"></capitec-label>
						<br>
						<capitec-text-field label="Premium Amount" type="currency"
							data-automation-id="insure-estimate-total-premium-override"
							@value-change="${(e) => this._totalPremiumChanged(e)}" .value="${this.newTotalPremium}">
						</capitec-text-field>
					</div>
				</div>
			</div>`
	}

	/**
	 * Render Dialog to add Life assured to Estimate
	 * @return {html} Html for the dialog
	 */
	_renderAddLifeDialog() {
		return this.showAddLifeDialog == false ? `` :
			html`
			<insure-add-life-dialog @add-new-life="${(e) => this._addLife(e)}"
				@close-modal="${(e) => this.showAddLifeDialog = false}" .currentLifesAssured="${this.estimate.lifesAssured}"
				.productParams="${this.productParams}">
			</insure-add-life-dialog>`
	}

	//#endregion
}
window.customElements.define(`horizon-insure-policy-estimate`, PolicyEstimate);

/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-insure-policy-estimate ... @navigate-back="${this._handler}"></horizon-insure-policy-estimate>
 *
 * @event PolicyEstimate#navigate-back
 * @type {Object} - N/A
 */

/**
 * When calculate button is clicked, send estimate calculate event to View with new estimate request
 *
 * @example
 * <horizon-insure-policy-estimate ... @calculate="${this._handler}"></horizon-insure-policy-estimate>
 *
 * @event PolicyEstimate#calculate
 * @type {Object} - Estimate request
 */