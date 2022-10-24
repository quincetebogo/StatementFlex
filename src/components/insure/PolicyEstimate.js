import { Component, css, html } from 'platform/elements';
import { GENDER_OPTIONS, INSURE_CALLER_PAGE, ROLE_PLAYER_RELATIONSHIP } from 'app/constants/InsureCommon';
import { formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { PolicyEstimateEvents } from 'app/constants/telemetry/events/Insure';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { refreshRelationshipCoverDetails } from 'app/utils/insureUtils';

import 'app/components/dialogs/insure/AddLifeDialog';
import 'app/components/common/HorizonLabel';
import 'app/components/dialogs/insure/PrintEstimateAgreementDialog';
import 'app/components/dialogs/insure/InsureEmailDialog';
import 'app/components/dialogs/insure/MaxAllowedCoverDialog';

const AGE_ERROR_MESSAGE = `Age is not valid`;
const AGE_REQUIRED_MESSAGE = `Age is required`;
const MAIN_LIFE_MINIMUM_COVER = 5000;

/**
 * Insure Policy Estimate component that allows cover and premium estimations be made on the fly.
 * Lives can be added AddLifeAssuredDialog
 * 
 * Events Raised 
 * -------------
 * 
 * calculate
 * send-email
 * navigate-back 
 *  
 * @export
 * @class PolicyEstimate
 * @extends {Component}
 */
class PolicyEstimate extends Component {

	//  #region INITIALISATION

	constructor() {
		super();
		this.printEstimateDocumentContent = ``;
		this.genderOptions = GENDER_OPTIONS;

		this.showAddLifeDialog = false;
		this.showPrintEstimateDialog = false;
		this.showEmailPlanDialog = false;
		this.showMaxAllowedCoverDialog = false;

		this._telemetry = HorizonTelemetry.getInstance();
		this.telemetryEvents = {};
	}

	//  #endregion

	//  #region PROPERTIES

	/**
	 * @property {Object} estimate Data & flags for view & estimate service request
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {String} newTotalPremium Tied to 'calculate by premium' input and used to track the override
	 * @property {Object} printEstimateDocumentContent - document content of Estimate
	 * @property {Number} mainLifeDefaultAge Main life derived age
	 * @property {String} mainLifeDefaultGender Main life derived gender
	 * @property {Number} maxAllowedCover  CheckInsurance limit for remaining cover limit
	 * @property {boolean} showAddLifeDialog Controls when to show the AddLife dialog
	 * @property {boolean} showPrintEstimateDialog Controls when to show the Email Estimate dialog
	 * @property {boolean} showEmailPlanDialog - Show flag for email address & send dialog
	 * @property {boolean} showMaxAllowedCoverDialog - Show flag for max allowed cover dialog
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			estimate: { type: Object, state: true },
			productParams: { type: Object },
			newTotalPremium: { type: String, state: true },
			printEstimateDocumentContent: { type: Object, state: true },
			mainLifeDefaultAge: { type: Number, state: true },
			mainLifeDefaultGender: { type: String, state: true },
			maxAllowedCover: { type: Number, state: true },
			showAddLifeDialog: { type: Boolean, state: true },
			showPrintEstimateDialog: { type: Boolean, state: true },
			showEmailPlanDialog: { type: Boolean, state: true },
			showMaxAllowedCoverDialog: { type: Boolean, state: true }
		};
	}

	//  #endregion

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		this.telemetryEvents = PolicyEstimateEvents;
		await this._telemetry.startSpan(this.telemetryEvents.ESTIMATE, {});

		this._initialise();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();
		await this._telemetry.endSpan(this.telemetryEvents.ESTIMATE, {});
	}

	//  #endregion

	//  #region EVENT HANDLERS

	/**
	 * Navigate to Landing
	 * @returns {void} 
	 */
	_backToSummaryPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`));
	}

	/**
	 * Open Add Life Assured Dialog
	 * @returns {void} 
	 */
	_openAddLifeDialog() {
		if (this.maxAllowedCover < MAIN_LIFE_MINIMUM_COVER) {
			this.showMaxAllowedCoverDialog = true;
			return;
		}

		this.showAddLifeDialog = true;
	}

	/**
	 * Calculate Button event
	 * 1. Determine if should calculate by premium or not
	 * 2. Dispatch event to invoke service
	 * 3. Reset total premium values
	 * 
	 * @param {number} printOrCalculate print or calculate
	 * @returns {void}
	 */
	async _calculateOrPrintEstimate(printOrCalculate) {
		this._telemetry.logEvent(this.telemetryEvents.ESTIMATE_REMOVE_LIVE, {
			"screen": TelemetryScreen.INSURE_ESTIMATE,
			"next-screen": null
		});

		if (this.maxAllowedCover < MAIN_LIFE_MINIMUM_COVER) {
			this.showMaxAllowedCoverDialog = true;
			return;
		}

		let isValid = true;

		// Validate
		this.estimate.lifesAssured.forEach(life => {
			if (!life.coverAmount || life.coverAmount === `` || life.coverAmount === 0) {
				life.coverDetails.coverMessage = life.coverDetails.minCoverMessage.replace(`{0:#,##0}`, life.coverDetails.minCoverAmount);
				isValid = false;
			}
			if (isNullorEmpty(life.age)) {
				life.coverDetails.ageMessage = AGE_REQUIRED_MESSAGE;
				isValid = false;
			}
			if (life.age.toString().includes(`.`)) {
				life.coverDetails.ageMessage = AGE_ERROR_MESSAGE;
				isValid = false;
			}
		});

		if (!isValid) {
			this.requestUpdate();
		} else {
			if (this.newTotalPremium !== ``) {
				this.estimate.totalPremium = this.newTotalPremium;
			} else {
				delete this.estimate.totalPremium;
			}
			const request = {
				...this.estimate
			};

			if (printOrCalculate === 1) {
				this.dispatchEvent(new CustomEvent(`calculate`, { detail: request }));
				this.estimate.totalPremium = 0;
				this.newTotalPremium = ``;
			} else {
				const printEstimateResponse = await this.printEstimate({ detail: request });
				this.printEstimateDocumentContent = printEstimateResponse?.result?.documentContent;
				this.showPrintEstimateDialog = true;
			}
			this.requestUpdate();
		}
	}


	/**
	 * Add Event from Add life dialog for Estimate.
	 * Receives relationship & cover details from dialog, and sets default values for the remaining properties.
	 * Closes dialog when finished.
	 * @param {Event} event Contains coverDetails & relationship from Add Life dialog
	 * @return {void}
	 */
	_addLife(event) {
		this._telemetry.logEvent(this.telemetryEvents.ESTIMATE_ADD_LIFE_DIALOG, {
			"screen": TelemetryScreen.INSURE_ESTIMATE,
			"next-screen": null
		});

		const life = {
			relationship: event.detail.relationship,
			coverAmount: ``,
			premium: 0,
			genderType: `Male`,
			age: ``,
			rowID: this.estimate.lifesAssured.length,
			coverDetails: event.detail.coverDetails
		};
		this.estimate.lifesAssured.splice(1, 0, life);
		this.showAddLifeDialog = false;
	}

	/**
	 * Click event from remove button on life list
	 * @param {Object} lifeToRemove Live object at index that was clicked
	 * @returns {void}
	 */
	_removeLife(lifeToRemove) {
		this._telemetry.logEvent(this.telemetryEvents.ESTIMATE_REMOVE_LIVE, {
			"screen": TelemetryScreen.INSURE_ESTIMATE,
			"next-screen": null
		});

		const indexOfObject = this.estimate.lifesAssured.findIndex(object => object.rowID === lifeToRemove.rowID);
		this.estimate.lifesAssured.splice(indexOfObject, 1);
		for (let index = 0; index < this.estimate.lifesAssured.length; index++) {
			this.estimate.lifesAssured[index].rowID = index;
		}
		this.newTotalPremium = ``;
		this.requestUpdate();
	}

	/**
	 * Event fired when an estimate life assured COVER AMOUNT value changes
	 * Captures new coverAmount value
	 * Refresh error messages for Age & Cover amount
	 * @param {event} event Contains the new value for coverAmount
	 * @param {number} index Index of the life that changed
	 * @returns {void}
	 */
	_coverAmountChanged(event, index) {
		if (event.detail.old !== event.detail.new) {
			this.estimate.lifesAssured[index].coverAmount = event.detail.new;
			this.newTotalPremium = ``;
		}

		this.estimate.lifesAssured[index].coverDetails = refreshRelationshipCoverDetails(
			this.estimate.lifesAssured[index].relationship,
			this.productParams,
			this.estimate.lifesAssured[index].coverAmount,
			index === 0 ? this.maxAllowedCover : 0,
			this.estimate.lifesAssured[index].age,
			this.estimate.lifesAssured[index].coverDetails.isExtendedFamily,
			false
		);
		this.requestUpdate();
	}

	/**
	 * Event fired when an estimate life assured AGE value changes
	 * Captures new age value
	 * Refresh cover details for life, supplying age
	 * Refresh error messages for Age & Cover amount
	 * @param {event} event Contains the new value for age
	 * @param {number} index Index of the life that changed
	 * @returns {void}
	 */
	_ageChanged(event, index) {
		if (event.detail.old !== event.detail.new) {
			this.estimate.lifesAssured[index].age = event.detail.new;
			this.newTotalPremium = ``;
		}

		this.estimate.lifesAssured[index].coverDetails = refreshRelationshipCoverDetails(
			this.estimate.lifesAssured[index].relationship,
			this.productParams,
			this.estimate.lifesAssured[index].coverAmount,
			index === 0 ? this.maxAllowedCover : 0,
			this.estimate.lifesAssured[index].age,
			this.estimate.lifesAssured[index].coverDetails.isExtendedFamily,
			false
		);

		if (event.detail.new.includes(`.`)) {
			this.estimate.lifesAssured[index].coverDetails.ageMessage = AGE_ERROR_MESSAGE;
		}

		this.requestUpdate();
	}

	/**
	 * Event fired when an estimate life assured GENDER value changes
	 * @param {event} event Contains the new value for gender
	 * @param {number} index Index of the life that changed
	 * @returns {void}
	 */
	_genderChanged(event, index) {
		if (event.detail.old !== event.detail.new) {
			this.estimate.lifesAssured[index].genderType = event.detail.new.code;
			this.newTotalPremium = ``;
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when calculate by Premium override input changed
	 * @param {event} event premium changed event
	 * @returns {object} Estimate Response
	 */
	_totalPremiumChanged(event) {
		this.newTotalPremium = event.detail.new;
	}

	/**
	 * Invoke this function when Agree button is clicked on Email Estimate Popup
	 * @returns {void}
	 */
	_acceptPrintEstimate() {
		this._telemetry.logEvent(this.telemetryEvents.ESTIMATE_PRINT, {
			"screen": TelemetryScreen.INSURE_ESTIMATE,
			"next-screen": null
		});
		this.showPrintEstimateDialog = false;
		this.showEmailPlanDialog = true;
	}

	/**
	 * Invoke this function when Send button is clicked on Email Popup
	 * @param {string} emailAddress email address
	 * @returns {void}
	 */
	_sendEmail(emailAddress) {
		this.showEmailPlanDialog = false;
		this.dispatchEvent(new CustomEvent(`send-email`, { detail: { emailId: emailAddress, callerPage: INSURE_CALLER_PAGE.ESTIMATE } }));
	}

	//  #endregion

	//  #region PRIVATE FUNCTIONS

	/**
	 * Initialize component when loaded / Add default life to list for calculator and list
	 * @returns {void}
	 */
	_initialise() {
		this.estimate.lifesAssured = [];
		this.estimate.lifesAssured.push({
			relationship: `MainLife`,
			coverAmount: this.maxAllowedCover < MAIN_LIFE_MINIMUM_COVER ? this.maxAllowedCover : MAIN_LIFE_MINIMUM_COVER,
			premium: 0,
			genderType: this.mainLifeDefaultGender,
			age: this.mainLifeDefaultAge,
			rowID: 0,
			coverDetails: {
				defaultCover: MAIN_LIFE_MINIMUM_COVER,
				maxCoverAmount: 100000,
				minCoverAmount: MAIN_LIFE_MINIMUM_COVER,
				maxAge: 64,
				minAge: 18,
				ageMessage: ``,
				coverMessage: ``,
				genderMessage: ``,
				maxCoverMessage: `Only cover up to {0:#,##0} on main life assured is allowed.`,
				minCoverMessage: `A minimum cover amount of {0:#,##0} is required for the main life.`,
				mainLifeDetailsDisabled: this.mainLifeDefaultAge !== 0
			}
		});
		this.estimate.totalPremium = 0;
		this.requestUpdate();
	}

	/**
	 * Build formatted hint message for Cover Amount inputs
	 * @param {string} lifeAssured current life assured
	 * @param {number} index life index
	 * @return {string} formatted message
	 */
	_getCoverAmountHintMessage(lifeAssured, index) {
		let hintMessage;
		if (index === 0 && this.maxAllowedCover === 0) {
			hintMessage = `You have reached your maximum allowed funeral cover.`;
		} else {
			hintMessage = `R${index === 0 && this.maxAllowedCover < MAIN_LIFE_MINIMUM_COVER ? this.maxAllowedCover : lifeAssured?.coverDetails?.minCoverAmount} - R${index === 0 ? this.maxAllowedCover : lifeAssured?.coverDetails?.maxCoverAmount}`;
		}
		return hintMessage;

	}

	//  #endregion

	//  #region RENDERING

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

			${INSURE_CSS}

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
			${this._renderAddLifeDialog()}
			${this._renderPrintEstimateDialog()}
			${this._renderInsureEmailDialog()}
			${this._renderMaxAllowedCoverDialog()}`;
	}

	/**
	 * Render the content for the component
	 * @return {html} Html containing title bar and column components
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar" data-automation-id="insure-estimate-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}"
				data-automation-id="insure-estimate-back" />
			<capitec-label label="Get an estimate" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			</capitec-button>
			<capitec-button label="Email Estimate" class="capitec-button-large" type="white" data-automation-id="insure-estimate-calculate"
				@click="${() => this._calculateOrPrintEstimate(0)}"></capitec-button>
			<capitec-button label="Calculate" class="capitec-button-large" type="white" data-automation-id="insure-estimate-calculate"
				@click="${() => this._calculateOrPrintEstimate(1)}"></capitec-button>
		</capitec-title-bar>
		<capitec-card id="insure-calc-card">
			<div class="insure-calc-columns">
				${this._renderLeftColumn()}
				${this._renderRightColumn()}
			</div>
		</capitec-card>`;
	}

	/**
	 * Render left column (Card List) for Estimate subview
	 * @return {html} Html of the left column, containing cards list with input fields for each life assured
	 */
	_renderLeftColumn() {
		return html`
		<div id="insure-calc-column-left">
			${this.estimate.lifesAssured?.map((lifeAssured, index) => html`
			<div class="calc-card" id=${index !== 0 ? `calc-card-other` : ``}>
				${index !== 0 ? html`
				<div class="calc-card-header">
					
					<capitec-label data-automation-id="insure-estimate-card-relationship"
						label="Relationship: ${formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[lifeAssured.relationship?.toUpperCase()])}" type="small" class="stronger">
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
						hint="${this._getCoverAmountHintMessage(lifeAssured, index)}"
						error="${lifeAssured.coverDetails.coverMessage}"
						.disabled="${this.maxAllowedCover < MAIN_LIFE_MINIMUM_COVER}">
					</capitec-text-field>
					<capitec-text-field label="Premium" type="currency" disabled hint="Estimate" class="calc-card-row-input"
						data-automation-id="insure-estimate-card-premium" value="${formatCurrency(lifeAssured.premium).replace(`R`, ``)}">
					</capitec-text-field>
				</div>
				<div class="calc-card-row">
					<capitec-text-field label="Age" type="numeric" data-automation-id="insure-estimate-card-age"
						keyboardMode="numeric" @value-changed="${(e) => this._ageChanged(e, index)}" value="${lifeAssured.age}"
						class="calc-card-row-input"
						hint="${lifeAssured?.coverDetails?.minAge} - ${lifeAssured?.coverDetails?.maxAge}"
						error="${lifeAssured.coverDetails.ageMessage}" .disabled="${index === 0}">
					</capitec-text-field>
					<capitec-select label="Gender" display-field="text" .items="${this.genderOptions}" id-field="code"
						data-automation-id="insure-estimate-card-gender" class="calc-card-row-input"
						@value-changed="${(e) => this._genderChanged(e, index)}" value="${lifeAssured.genderType}"
						.disabled="${index === 0}">
					</capitec-select>
				</div>
			</div>
		
			${index !== 0 ? html`` : html`<div class="calc-card-row calc-card-row-actions">
				<capitec-label label="Lives Assured" type="subtitle" class="stronger"></capitec-label>
				<capitec-label label="Add Life Assured" type="subtitle" class="stronger link"
					data-automation-id="insure-estimate-add-life" @click="${() => this._openAddLifeDialog()}">
				</capitec-label>
			</div>`}
			`)}
			<capitec-spacer></capitec-spacer>
		</div>
		`;
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
			
						${this.estimate.lifesAssured?.map(life => html`
						<div class="calc-life-list">
							<capitec-label label="${formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[life.relationship?.toUpperCase()])}" data-automation-id="insure-estimate-list-relationship">
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
			</div>`;
	}

	/**
	 * Render Dialog to add Life assured to Estimate
	 * @return {html} Html for the dialog
	 */
	_renderAddLifeDialog() {
		return this.showAddLifeDialog === false ? ``
			: html`
			<insure-add-life-dialog 
				.currentLifesAssured="${this.estimate.lifesAssured}"
				.productParams="${this.productParams}"
				@add-new-life="${(e) => this._addLife(e)}"
				@close-modal="${() => this.showAddLifeDialog = false}" >
			</insure-add-life-dialog>`;
	}

	/**
	 * Render Dialog to add Life assured to Estimate
	 * @return {html} Html for the dialog
	 */
	_renderPrintEstimateDialog() {
		return this.showPrintEstimateDialog === false ? ``
			: html`
			<print-estimate-agreement-dialog 
				.printEstimateAgreementContent="${this.printEstimateDocumentContent}"
				@print-estimate-close-modal = "${() => this.showPrintEstimateDialog = false}"
				@print-estimate-agree-click = "${() => this._acceptPrintEstimate()}">
			</print-estimate-agreement-dialog>`;
	}

	/** 
	 * Render dialog for confirming email address then sending
	 * @returns {void}
	 */
	_renderInsureEmailDialog() {
		return this.showEmailPlanDialog === false ? ``
			: html`
			<insure-email-dialog 
				.titleMessage = "${`Email Funeral Plan Estimate`}"
				@close-modal="${() => this.showEmailPlanDialog = false}"
				@send-email = "${(emailAddress) => this._sendEmail(emailAddress)}">
			</insure-email-dialog>`;
	}

	/** 
	 * Render dialog for max allowed cover
	 * @returns {void}
	 */
	_renderMaxAllowedCoverDialog() {
		return this.showMaxAllowedCoverDialog === true ? html`
			<insure-max-allowed-cover-dialog
				@confirm="${() => this.showMaxAllowedCoverDialog = false}">
			</insure-max-allowed-cover-dialog>`
			: html``;
	}

	//  #endregion
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

/**
 * Send / Print Estimate event
 *
 * @example
 * <horizon-insure-policy-estimate ... @send-email="${this._handler}"></horizon-insure-policy-estimate>
 *
 * @event PolicyEstimate#send-email
 * @type {Object} - Email Request
 */