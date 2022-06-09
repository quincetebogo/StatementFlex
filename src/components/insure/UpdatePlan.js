import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getCoverDetailsByParams, livesPerPolicy } from 'app/utils/insureUtils';

// Lookups
import { BANK_OPTIONS, ACCOUNT_TYPES, DEBIT_ORDER_DAY_OPTIONS, GENDER_OPTIONS, TITLE_OPTIONS } from 'app/constants/InsureCommon';


// Dialogs
import 'app/components/dialogs/insure/AddLifeDialog';
import 'app/components/dialogs/insure/FCPAgreementDialog';
import 'app/components/dialogs/insure/YROAAgreementDialog';
import 'app/components/dialogs/insure/YBPAgreementDialog';
import 'app/components/dialogs/insure/EACLAgreementDialog';
import 'app/components/dialogs/insure/RemoveBeneficiaryDialog';
import 'app/components/dialogs/insure/RemoveLifeAssuredDialog';
import 'app/components/dialogs/insure/AddBeneficiaryDialog';

// Other
import 'app/components/common/HorizonLabel';
import 'app/components/common/ServiceCallErrorScreen';

/**
 * Update Plan allows for the Policy to be updated. The premium and cover amount, beneficiaries and the debit order details may be updated.
 * Lives can be added via AddLifeDialog
 * beneficiaries can be added via AddBeneficiaryDialog
 * 
 * Events Raised 
 * -------------
 * navigate-back
 * 
 *  
 * @export
 * @class UpdatePlan
 * @extends {Component}
 */
class UpdatePlan extends Component {

	//#region INITIALISATION

	constructor() {
		super();

		this.showAddRelationshipDialog = false;
		this.showAddBeneficiariesDialog = false;

		this.today = Date();

		this.selectedTabIndex = 0;
		this.lifeAssuredToRemove;
		this.beneficiaryToRemove;
		this.quote = {};
		this.quote.beneficiaries = [];
		

		this.showEACLAgreementDialog = false;
		this.showYBPAgreementDialog = false;
		this.showFCPAgreementDialog = false;
		this.showYROAAgreementDialog = false;
		this.showRemoveLifeAssuredDialog = false;
		this.showRemoveBeneficiaryDialog = false;

		this.agreementFCPAccepted = false;
		this.agreementEACLAccepted = false;
		this.agreementYBPAccepted = false;
		this.agreementYROAAccepted = false;

		// Lookups
		this.accountTypeOptions = ACCOUNT_TYPES;
		this.bankOptions = BANK_OPTIONS;
		this.debitOrderDayOptions = DEBIT_ORDER_DAY_OPTIONS;
		this.genderOptions = GENDER_OPTIONS;
		this.titleOptions = TITLE_OPTIONS;

	}

	//#endregion

	//#region PROPERTIES

	/**
	 * @property {Number} selectedTabIndex stores the index of the current tab being used
	 * @property {Boolean} showEACLAgreementDialog determines whether to show the EACL agreement dialog
	 * @property {Boolean} showYBPAgreementDialog determines whether to show the YBP agreement dialog
	 * @property {Boolean} showFCPAgreementDialog determines whether to show the FCP agreement dialog
	 * @property {Boolean} showYROAAgreementDialog determines whether to show the YROA agreement dialog
	 * @property {Boolean} agreementFCPAccepted determines whether the FCP agreement has been accepted
	 * @property {Boolean} agreementEACLAccepted determines whether the EACL agreement has been accepted
	 * @property {Boolean} agreementYBPAccepted determines whether the YBP agreement has been accepted
	 * @property {Boolean} agreementYROAAccepted determines whether the YROA agreement has been accepted
	 * @property {Boolean} showAddRelationshipDialog determines whether to show the add relationship agreement dialog
	 * @property {Boolean} showAddBeneficiariesDialog determines whether to show the add beneficiariesdialog
	 * @property {Boolean} showRemoveLifeAssuredDialog determines whether to show the EACL agreement dialog
	 * @property {Boolean} showRemoveBeneficiaryDialog determines whether to show the EACL agreement dialog
	 * @property {Object} quote Data & flags for view & quote service request
	 *
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			selectedTabIndex: { type: Number, state: true },
			showEACLAgreementDialog: { type: Boolean, state: true },
			showYBPAgreementDialog: { type: Boolean, state: true },
			showFCPAgreementDialog: { type: Boolean, state: true },
			showYROAAgreementDialog: { type: Boolean, state: true },
			agreementFCPAccepted: { type: Boolean, state: true },
			agreementEACLAccepted: { type: Boolean, state: true },
			agreementYBPAccepted: { type: Boolean, state: true },
			agreementYROAAccepted: { type: Boolean, state: true },
			showAddRelationshipDialog: { type: Boolean, state: true },
			showAddBeneficiariesDialog: { type: Boolean, state: true},
			showRemoveLifeAssuredDialog: {type: Boolean, state: true},
			showRemoveBeneficiaryDialog: {type: Boolean, state: true},
			quote: { type: Object, state: true },

			newTotalPremium: { string: '' },
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
	 * Event from Add life dialog for Update Plan
	 * 
	 * @param {Event} e 
	 */
	_addLife(e) {
		this.quote.lifesAssured.push({
			relationship: e.detail.relationship,
			coverAmount: e.detail.coverDetails.defaultCover,
			premium: 0,
			genderType: "Male",
			age: 0,
			rowID: this.quote.lifesAssured.length,
			coverDetails: e.detail.coverDetails
		});
		this.showAddRelationshipDialog = false;
	}

	//adding/removing beneficiaries

	/**
	 * Event to Add beneficiary to Beneficiary list
	 * 
	 * @param {Object} beneficiary 
	 */
	_addBeneficiary(beneficiary) {
		this.quote.beneficiaries.push(beneficiary)
	}

	/**
	 * Click event from the beneficiary dialog to add new beficiary and close dialog
	 */
	_onAddBeneficiaryClick(e) {
		this._addBeneficiary(e.detail)
		this._closeAddBeneficiariesDialog()
	}

	/**
	 * Click event from remove button on beneficiary list
	 * @param {Object} event
	 */
	_removeBeneficiary(event) {
		this.quote.beneficiaries.splice(this.beneficiaryToRemove, 1);
		// Reshuffle
		for (let index = 0; index < this.quote.beneficiaries.length; index++) {
			this.quote.beneficiaries[index].rowID = index;
		}
		this._closeRemoveBeneficiaryDialog();
		this.requestUpdate();

	}

	/**
	 * Open Remove Beneficiary dialog
	 * 
	 * @param {*} index 
	 */
	 _openRemoveBeneficiaryDialog(index) {
		this.showRemoveBeneficiaryDialog = true;
		this.beneficiaryToRemove = index;
	}

	/**
	 * Close Remove Beneficiary dialog
	 */
	_closeRemoveBeneficiaryDialog() {
		this.showRemoveBeneficiaryDialog = false;
	}

	/**
	 * Click event from remove button on life list
	 * @param {Object} lifeAssured clicked
	 */
	_removeLifeAssured() {
		
		this.quote.lifesAssured.splice(this.lifeAssuredToRemove, 1);
		// Reshuffle
		for (let index = 0; index < this.quote.lifesAssured.length; index++) {
			this.quote.lifesAssured[index].rowID = index;
		}
		this._closeRemoveLifeAssuredDialog();
		this.newTotalPremium = '';
		this.requestUpdate();
	}

	/**
	 * Open Remove Life Assured dialog
	 */
	 _openRemoveLifeAssuredDialog(index) {
		this.showRemoveLifeAssuredDialog = true;
		this.lifeAssuredToRemove = index;
	}

	/**
	 * Close Remove Life Assured dialog
	 */
	_closeRemoveLifeAssuredDialog() {
		this.showRemoveLifeAssuredDialog = false;
	}

	/**
	 * Event fired when a life assured COVER AMOUNT value changes
	 * @param {*} event 
	 * @param {*} index 
	 */
	 _lifeCoverAmountValueChanged(event, index) {
		if (event.detail.old != event.detail.new) {
			this.quote.lifesAssured[index].coverAmount = event.detail.new;
			this.newTotalPremium = '';
		}
	}

	/**
	 * Event fired when a life assured AGE value changes
	 * @param {*} event 
	 * @param {*} index 
	 */
	 _lifeAgeValueChanged(event, index) {
		if (event.detail.old != event.detail.new) {
			this.quote.lifesAssured[index].age = event.detail.new;
			this.newTotalPremium = '';
		}
		this.quote.lifesAssured[index].coverDetails = getCoverDetailsByParams(this.quote.lifesAssured[index].relationship, this.productParams, this.quote.lifesAssured[index].age, this.quote.lifesAssured[index].coverDetails.isExtendedFamily);
		this.requestUpdate();
	}

	/**
	 * Event fired when a life assured GENDER value changes
	 * @param {*} event 
	 * @param {*} index 
	 */
	 _lifeGenderValueChanged(event, index) {
		if (event.detail.old != event.detail.new) {
			this.quote.lifesAssured[index].genderType = event.detail.new.code;
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
	 }

	 /**
	 * Calculate Button event / Calculate by life assured
	 * @returns {object} Estimate Response
	 */
	 async _calculatePremium() {
		if (this.newTotalPremium != 0) {
			this.quote.totalPremium = this.newTotalPremium
		}

		const request = {
			...this.estimate,
			// clientEstimateDetails: this.clientEstimateDetails
		}

		// Reset
		this.quote.totalPremium = 0;
		this.newTotalPremium = '';


		this.dispatchEvent(new CustomEvent(`calculate`, {
			detail: request
		}));

		// let estimateResponse = await this.calculateClientEstimate(request);
		// if (estimateResponse != '') {
		// 	this.estimate = estimateResponse;
		// }'



		this.requestUpdate();
	}

	/**
	 * Tab change to switch between calculate and email plan button
	 * @param {*} e 
	 */
	_tabChange(e) {
		this.selectedTabIndex = e.detail.selectedIndex;
	}

	/**
	 * Accept the FCP (Funeral Cover Plan) Agreement
	 */
	_acceptFCPAgreement() {
		this.agreementFCPAccepted = true;
		this.showFCPAgreementDialog = false;
	}

	/**
	 * Close EACL (Entry Ages and Child Limits) agreement dialog
	 */
	_acceptEACLAgreement() {
		this.agreementEACLAccepted = true;
		this.showEACLAgreementDialog = false;
	}

	/**
	 * Close YBP (You/your Beneficiary are paid) agreement dialog
	 */
	_acceptYBPAgreement() {
		this.agreementYBPAccepted = true;
		this.showYBPAgreementDialog = false;
	}

	/**
	 * Close YROA (Your responsibility & our Accountability) agreement dialog
	 */
	_acceptYROAAgreement() {
		this.agreementYROAAccepted = true;
		this.showYROAAgreementDialog = false;
	}

	//#endregion

	//#region PRIVATE FUNCTIONS

	/**
	 * Initialize component
	 */
	async _initialise() {
		this.quote.lifesAssured = [];
		this.quote.lifesAssured.push({
			relationship: "MainLife",
			coverAmount: 0,
			premium: 0,
			genderType: "Male",
			age: 0,
			rowID: 0,
			coverDetails: {
				defaultCover: 100000,
				maxCover: 100000,
				minCover: 5000,
				maxAge: 64,
				minAge: 18,
			}
		});
		this.quote.beneficiaries = [];
		this.quote.totalPremium = 0;
	}

	/**
	 * Navigate back to client policies
	 */
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
		this.showAddRelationshipDialog = true;
	}

	/**
	 * Close the Add Life dialog
	 */
	_closeAddLifeDialog() {
		this.showAddRelationshipDialog = false;
	}

	/**
	 * open add beneficiaries dialog 
	 */
	_openAddBeneficiariesDialog() {

		if (this.quote.beneficiaries.length >= 2) {
			this.showAddBeneficiariesDialog = false;
		} else {
			this.showAddBeneficiariesDialog = true;
		}
		
	}

	/**
	 * Close the Add beneficiaries dialog
	 */
	_closeAddBeneficiariesDialog() {
		this.showAddBeneficiariesDialog = false;
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

			.beneficiary-radio-row{
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

			capitec-group {
				width: 93%;
				z-index: 10;
				padding-top: 12px;
				padding-bottom: 12px;
				border-right: 1px solid #dfdfdf;
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
	 * 
	 * @returns {html}
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
			${this._renderDialogs()}
			
		`;
	}

	/**
	 * Generates the component template for web mode.
	 * @returns {html} The html content of the component.
	 */
	_renderDialogs() {
		return html`
		${this._renderLifeAssuredDialog()}
		${this._renderAddBeneficiariesDialog()}
		${this._renderEACLAgreementDialog()}
		${this._renderYBPAgreementDialog()}
		${this._renderFCPAgreementDialog()}
		${this._renderYROAAgreementDialog()}
		${this._renderRemoveLifeAssuredDialog()}
		${this._renderRemoveBeneficiaryDialog()}`
	}

	/**
	 * Render the content HTML  for the component
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}" />
			<capitec-label label="Update Plan" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			${this.selectedTabIndex != 0 ? html`
				<capitec-button label="Email Plan" type="white"></capitec-button>
			` : html`
				<capitec-button label="Calculate" type="white" @click="${() => this._calculatePremium()}"></capitec-button>
			`}

			${this.selectedTabIndex == 0 ? html`
				<capitec-button label="Update Plan" type="white" .disabled="${this.agreementFCPAccepted == false}">
				</capitec-button>
			`: this.selectedTabIndex == 1 ? html`
				<capitec-button label="Update Plan" type="white" .disabled="${this.agreementEACLAccepted == false || this.agreementYBPAccepted == false}">
				</capitec-button>
			`: html`
			<capitec-button label="Update Plan" type="white" .disabled="${this.agreementYROAAccepted == false}">
				</capitec-button>
			`}
			
		
		</capitec-title-bar>
		<capitec-card style="min-height: 100vh;">
			<capitec-tab-group @tab-select="${(e) => this._tabChange(e)}">
		
				${this._renderPremiumTab()}
				${this._renderBeneficiariesTab()}
				${this._renderDebitOrderTab()}
		
			</capitec-tab-group>
		</capitec-card>
		`
	}

	/**
	 * render the premium Tab of Update plan
	 * @returns {html}
	 * 
	 */
	_renderPremiumTab() {
		return html`
		<capitec-tab label="Premium & Cover Amount">
			<div class="insure-calc-columns">
		
				${this._renderLeftPremiumColumn()}
		
				<div class="insure-calc-column-right">
					<div class="calc-summary-card">
						<div>
							<!-- top -->
							<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
							</capitec-label>
							<capitec-spacer></capitec-spacer>
							<capitec-label label="Total estimated monthly premium"></capitec-label>
							<capitec-label label="${formatCurrency(this.quote.totalPremium)}" class="calc-premium-total">
							</capitec-label>
							<capitec-label label="Summary of estimated monthly premium:" class="stronger"></capitec-label>
							<hr>
		
							<!-- life list -->
							${this.quote.lifesAssured.map(lifeAssured => html`
							<div class="calc-life-list">
								<capitec-label label="${lifeAssured.relationship}"></capitec-label>
								<capitec-label label="${formatCurrency(lifeAssured.premium)}"></capitec-label>
							</div>
							<hr>`)}
							<div class="calc-life-list">
								<capitec-label label="Total Premium Amount" class="stronger"></capitec-label>
								<capitec-label label="${formatCurrency(this.quote.totalPremium)}" class="stronger"></capitec-label>
							</div>
						</div>
		
						<!-- bottom -->
						<div>
							<capitec-label label="Specify a premium you are willing to pay" class="stronger"></capitec-label>
							<br>
							<capitec-text-field @value-change="${(e) => this._totalPremiumChanged(e)}" .value="${this.newTotalPremium}"
							label="Premium Amount" type="numeric">
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
		return html`
			<div class="insure-calc-column-left">
				<div class="left-card">
					<capitec-expander-group modeset="single">
						${this.quote.lifesAssured.map((lifeAssured, index) => html`
						${index != 0 ? html`

						<!-- Life assured expander -->		
							<capitec-label label="Remove" @click="${() => this._openRemoveLifeAssuredDialog(index)}"
								type="subtitle" class="stronger link" style="position: relative; width: fit-content; left: 613px; top: 38px;">
							</capitec-label>
						<capitec-expander  label="${lifeAssured.relationship} | Name">
							
							<div class="expander-options">
								<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" id-field="code"
									style="width: 50%" >
								</capitec-select>

								<capitec-select label="Gender" .items="${this.genderOptions}" display-field="text"
									id-field="code" style="width: 50%"  @value-changed="${(e) => this._lifeGenderValueChanged(e, index)}">
								</capitec-select></div>								
							</div>
							<div class="expander-options">								
								<capitec-text-field label="Name" style="width: 50%" >
								</capitec-text-field>

								<capitec-text-field label="Surname" style="width: 50%" >
								</capitec-text-field>								
							</div>
							<div class="expander-options">
								<capitec-text-field label="Middle Names" style="width: 50%" >
								</capitec-text-field>
		
								<capitec-text-field label="Middle Names" style="width: 50%">
								</capitec-text-field>
							</div>
							<div class="expander-options">
								<capitec-date-time-picker label="Date of Birth" type="single" mode="date" inputType="input" 
								date="2020-02-01" outputType="string" maxdate="${this.today}">
								</capitec-date-time-picker>
		
								<capitec-text-field label="ID" style="width: 50%">
								</capitec-text-field>
							</div>
							<div class="expander-options">
								<capitec-text-field label="Cellphone number" style="width: 50%" >
								</capitec-text-field>
							
								<capitec-text-field label="Email Address" style="width: 50%" >
								</capitec-text-field>
							</div>
							<div class="expander-options">
								<capitec-text-field label="Cover amount" style="width: 50%">
								</capitec-text-field>
							</div>
						</capitec-expander>
						
						`
						
						: html`

						<!-- notifications -->
						${this._renderFCPNotification()}

						<div class="calc-card-row">
							<capitec-label label="Main Life" type="strong">
							</capitec-label>
						</div>
						
						<!-- Main Life -->
						<capitec-expander  label="Main Life | Charl Walden">
							<div class="expander-options">
								<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" id-field="code"
									style="width: 50%" disabled>
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
		
								<capitec-text-field label="Cover amount" style="width: 50%" type="currency"
								@value-changed="${(e) => this._lifeCoverAmountValueChanged(e, index)}"
								value="${lifeAssured.coverAmount}" hint="R${lifeAssured?.coverDetails?.minCover} - R${lifeAssured?.coverDetails?.maxCover}" min="${lifeAssured?.coverDetails?.minCover}" max="${lifeAssured?.coverDetails?.maxCover}">
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
						
			
						
			
						<!-- add lives Assured  -->
						<div class="calc-card-row" style="margin-top: 15px;">
							<capitec-label label="Lives Assured" type="strong" class="stronger">
							</capitec-label>
							<capitec-label label="Add Life Assured" type="subtitle" class="stronger link"
								@click="${() => this._openAddLifeDialog()}">
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
						<capitec-expander-group modeset="single">
								<!-- Notifications -->
								${this._renderEACLNotification()}
								
								<div style="margin-top:5px;"></div>

								${this._renderYBPNotification()}
								

								<!-- main life details -->
								<div class="calc-card-row">
									<capitec-label label="Main Life" type="strong">
									</capitec-label>
								</div>
				
								<!-- main life expander -->

								<capitec-expander label="Main Life | Charl Walden">
									<div class="expander-options">
										<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" id-field="code"
											style="width: 50%" disabled>
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
								
								<!--Beneficiaries  -->
								<div class="calc-card-row" style="margin-top: 15px;">
									<capitec-label label="Beneficiaries" type="strong" class="stronger">
									</capitec-label>
									<capitec-label label="Add Beneficiary" type="subtitle" class="stronger link"
										@click="${() => this._openAddBeneficiariesDialog()}" disabled="${this.quote.beneficiaries.length >= 2}" >
									</capitec-label>
								</div>

							${this.quote.beneficiaries.map((beneficiary, index) => html`
								${index != 0 || index == 0 ? html`
								<!-- Beneficiaries -->
								<capitec-label label="Remove" @click="${() => this._openRemoveBeneficiaryDialog(index)}"
								type="subtitle" class="stronger link" style="position: relative; width: fit-content; left: 613px; top: 38px;">
								</capitec-label>
								<capitec-expander  label="${beneficiary.relationship} | Name">
								
									<div class="expander-options">
										<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" id-field="code"
											style="width: 50%" >
										</capitec-select>

										<capitec-text-field label="Name" style="width: 50%" >
										</capitec-text-field>
									</div>
									<div class="expander-options">
										<capitec-text-field label="Surname" style="width: 50%" >
										</capitec-text-field>

										<capitec-date-time-picker label="Date of Birth" type="single" mode="date" 
											inputType="input" date="2020-02-01" outputType="string" maxdate="${this.today}">
										</capitec-date-time-picker>
									</div>
									<div class="expander-options">
										<capitec-select label="Gender" .items="${this.genderOptions}" display-field="text"
											id-field="code" style="width: 50%" >
										</capitec-select>
										<capitec-text-field label="Payout amount" style="width: 50%">
										</capitec-text-field>
									</div>
									<div class="expander-options">
										<capitec-text-field label="Email Address" style="width: 50%" >
										</capitec-text-field>
										<capitec-text-field label="Cellphone number" style="width: 50%" >
										</capitec-text-field>	
									</div>
								
								</capitec-expander>
							`
							 :html``}
							
						`)}
							
						</capitec-expander-group>
					
							

							
		
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
						<capitec-label label="R0.00" class="calc-premium-total">
						</capitec-label>
						<capitec-label label="Summary of payout beneficiary amount:" class="stronger"></capitec-label>
						<hr>

						<!-- Beneficiaries list -->
						${this.quote.beneficiaries.map(beneficiary => html`
							<div class="calc-life-list">
								<capitec-label label="${beneficiary.relationship}"></capitec-label>
								<capitec-label label=""></capitec-label>
							</div>
							<hr>`)}
							<div class="calc-life-list">
								<capitec-label label="Total Premium Amount" class="stronger"></capitec-label>
								<capitec-label label="R0.00" class="stronger"></capitec-label>
							</div>
						
					</div>	

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
		
			<div class="insure-calc-columns">
		
				<div class="insure-calc-column-left">
					<div class="left-card">
						<!-- notifications -->
						${this._renderYROANotification()}
		
		
						<!-- Collection account card -->
						<div class="calc-card">
		
							<div class="calc-card-header">
								<capitec-label type="subtitle" class="stronger" label="Collection Account"
									style="padding: 10px;">
								</capitec-label>
							</div>
		
							<div class="calc-card-row">
		
								<capitec-select label="Bank" .items="${this.bankOptions}" display-field="text" id-field="code"
									style="width: 50%">
								</capitec-select>
		
								<capitec-text-field label="Account Number" type="numeric" style="width: 50%">
								</capitec-text-field>
		
							</div>
		
							<div class="calc-card-row">
		
								<capitec-select label="Account Type" .items="${this.accountTypeOptions}" display-field="text"
									id-field="code" style="width: 50%">
								</capitec-select>
		
								<capitec-text-field label="Branch Code" type="numeric" style="width: 50%">
								</capitec-text-field>
		
							</div>
		
							<div class="calc-card-row">
		
								<capitec-select label="Debit order day" .items="${this.debitOrderDayOptions}"
									display-field="text" id-field="code" style="width: 50%">
								</capitec-select>
		
							</div>
		
							<div class="calc-card-row">
								<div>
		
									<capitec-label label="Does the client prefer to authenticate the the DebiCheck mandate by">
									</capitec-label>
									<capitec-radio-group
										label="Does the client prefer to authenticate the the DebiCheck mandate by">
										<capitec-radio label="Card and Pin (Bank Card Present)" checked disabled>
										</capitec-radio>
										<capitec-radio label="Remote Authentication (USSD/Banking App/Online)" disabled>
										</capitec-radio>
									</capitec-radio-group>
		
								</div>
							</div>
		
						</div>
		
					</div>
				</div>
		
				<div class="insure-calc-column-right">
		
					<div class="calc-summary-card">
						<div>
							<!-- top -->
							<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
							</capitec-label>
							<capitec-spacer></capitec-spacer>
							<capitec-label label="Total estimated monthly premium"></capitec-label>
							<capitec-label label="${formatCurrency(this.quote.totalPremium)}" class="calc-premium-total">
							</capitec-label>
							<capitec-label label="Summary of estimated monthly premium:" class="stronger"></capitec-label>
							<hr>
		
							<!-- life list -->
							${this.quote.lifesAssured.map(lifeAssured => html`
							<div class="calc-life-list">
								<capitec-label label="${lifeAssured.relationship}"></capitec-label>
								<capitec-label label="${formatCurrency(lifeAssured.premium)}"></capitec-label>
							</div>
							<hr>`)}
							<div class="calc-life-list">
								<capitec-label label="Total Premium Amount" class="stronger"></capitec-label>
								<capitec-label label="${formatCurrency(this.quote.totalPremium)}" class="stronger"></capitec-label>
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

	/** NOTIFICATIONS */

	/**
		 * Render notification component for 'Your responsibility & our accountability'
		 * 
		 * @returns {html} The html content of the component.
		 */
	_renderYROANotification() {
		return html`
		<capitec-alert-banner @click="${() => this.showYROAAgreementDialog = true}"
			type="${this.agreementYROAAccepted == true ? 'success' : 'info'}" header="Header"
			label="Notify: I agree to Your Responsibility & Our Accountability agreement declaration">
		</capitec-alert-banner>`
	}

	/**
	 * Render notification component for 'Funeral Cover Plan'
	 * @returns {html}
	 */
	_renderFCPNotification() {
		return html`
		<capitec-alert-banner @click="${() => this.showFCPAgreementDialog = true}"
			type="${this.agreementFCPAccepted == true ? 'success' : 'info'}" header="Header"
			label="Notify: I agree to Funeral cover plan agreement declaration">
		</capitec-alert-banner>`
	}

	/**
	 * Render notification component for 'Entry Ages and Child Limits'
	 * @returns {html}
	 */
	_renderEACLNotification() {
		return html`
		<capitec-alert-banner @click="${() => this.showEACLAgreementDialog = true}"
			type="${this.agreementEACLAccepted == true ? 'success' : 'info'}" header="Header"
			label="Notify: I agree to Entry Ages and Child Limits agreement declaration">
		</capitec-alert-banner>`
	}

	/**
	 * Render notification component for 'You/your beneficiary are paid'
	 * @returns {html}
	 */
	_renderYBPNotification() {
		return html`
		<capitec-alert-banner @click="${() => this.showYBPAgreementDialog = true}"
			type="${this.agreementYBPAccepted == true ? 'success' : 'info'}" header="Header"
			label="Notify: I agree to You/your beneficiary are paid agreement declaration">
		</capitec-alert-banner>`
	}

	/** DIALOGS */

	/**
	 * Render Dialog to add Life assured to Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderLifeAssuredDialog() {
		return this.showAddRelationshipDialog == false ? `` :
			html`
			<insure-add-life-dialog @add-new-life="${(e) => this._addLife(e)}"
				@close-modal="${(e) => this._closeAddLifeDialog(e)}" .currentLifesAssured="${this.quote.lifesAssured}"
				.productParams="${this.productParams}">
			</insure-add-life-dialog>`
	}

	/**
	 * Render Dialog to remove Life assured from Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderRemoveLifeAssuredDialog() {
		return this.showRemoveLifeAssuredDialog == false ? ``:
		html`

		<remove-life-assured-dialog @agree-click="${(e) => this._removeLifeAssured(e)}"
			@close-modal="${(e) => this._closeRemoveLifeAssuredDialog(e)}">
		</remove-life-assured-dialog>
		`
	}

	/**
	 * Render Dialog to remove a beneficiary from update plan
	 * 
	 * @returns {html} html of the document
	 */
	_renderRemoveBeneficiaryDialog() {
		return this.showRemoveBeneficiaryDialog == false ? ``:
		html`
		<remove-beneficiary-dialog @agree-click="${(e) => this._removeBeneficiary(e)}"
			@close-modal="${(e) => this._closeRemoveBeneficiaryDialog(e)}">
		</remove-beneficiary-dialog>
		`

	}

	/**
	 * Render Dialog to add beneficiaries to Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderAddBeneficiariesDialog(){
		return this.showAddBeneficiariesDialog == false ? html`` :
			html`

				<add-beneficiary-dialog .lifesAssured="${this.quote.lifesAssured}" .beneficiaries="${this.quote.beneficiaries}"
					@add-click="${(e) => this._onAddBeneficiaryClick(e)}"
					@close-modal="${() => this._closeAddBeneficiariesDialog()}">

				</add-beneficiary-dialog>

			`
	}

	/**
	 * Render Dialog for EACL Agreement
	 * @returns {html}
	 */
	_renderEACLAgreementDialog() {
		return this.showEACLAgreementDialog == false ? `` : html`
		<horizon-insure-eacl-agreement-dialog @agreementAccepted="${(e) => this._acceptEACLAgreement()}">
		</horizon-insure-eacl-agreement-dialog>`
	}

	/**
	 * render Dialog for YBP Agreement
	 * @returns {html}
	 */
	_renderYBPAgreementDialog() {
		return this.showYBPAgreementDialog == false ? `` : html`
		<horizon-insure-ybp-agreement-dialog @agreementAccepted="${(e) => this._acceptYBPAgreement()}">
		</horizon-insure-ybp-agreement-dialog>`
	}

	/**
	 * render Dialog for FCP Agreement
	 * @returns {html}
	 */
	_renderFCPAgreementDialog() {
		return this.showFCPAgreementDialog == false ? `` : html`
		<horizon-insure-fcp-agreement-dialog @agreementAccepted="${(e) => this._acceptFCPAgreement()}">
		</horizon-insure-fcp-agreement-dialog>`
	}

	/**
	* Render Dialog for YROA Agreement
	* @returns {html}
	*/
	_renderYROAAgreementDialog() {
		return this.showYROAAgreementDialog == false ? `` : html`
		<horizon-insure-yroa-agreement-dialog @agreementAccepted="${(e) => this._acceptYROAAgreement()}">
		</horizon-insure-yroa-agreement-dialog>`
	}

	//#endregion

}

window.customElements.define(`horizon-insure-update-plan`, UpdatePlan);

/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-insure-update-plan ... @navigate-back="${this._handler}"></horizon-insure-update-plan>
 *
 * @event UpdatePlan#navigate-back
 * @type {Object} - N/A
 */