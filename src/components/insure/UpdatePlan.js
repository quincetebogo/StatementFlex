import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';

// Lookups
import { BANK_OPTIONS, ACCOUNT_TYPES, DEBIT_ORDER_DAY_OPTIONS, GENDER_OPTIONS, TITLE_OPTIONS } from 'app/constants/InsureCommon';


// Dialogs
import 'app/components/dialogs/insure/InsureAddLifeDialog';
import 'app/components/dialogs/insure/FCPAgreementDialog';
import 'app/components/dialogs/insure/YROAAgreementDialog';
import 'app/components/dialogs/insure/YBPAgreementDialog';
import 'app/components/dialogs/insure/EACLAgreementDialog';

// Other
import 'app/components/insure/EstimateCalculateSummary';
import 'app/components/common/HorizonLabel';
import 'app/components/common/ServiceCallErrorScreen';

class UpdatePlan extends Component {

	constructor() {
		super();

		this.showAddRelationshipDialog = false;
		this.showEmailPlanDialog = false;

		this.selectedQuoteTabIndex = 0;
		this.quote = {};

		this.showEACLAgreementDialog = false;
		this.showYBPAgreementDialog = false;
		this.showFCPAgreementDialog = false;
		this.showYROAAgreementDialog = false;

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

	static get properties() {
		return {
			selectedQuoteTabIndex: { number: 0 },
			showEACLAgreementDialog: { boolean: false },
			showYBPAgreementDialog: { boolean: false },
			showFCPAgreementDialog: { boolean: false },
			showYROAAgreementDialog: { boolean: false },
			agreementFCPAccepted: { boolean: false },
			agreementEACLAccepted: { boolean: false },
			agreementYBPAccepted: { boolean: false },
			agreementYROAAccepted: { boolean: false },
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
	 * Initialize component
	 */
	async _initialize() {
		this.quote.lifesAssured = [];
		this.quote.lifesAssured.push({
			relationship: "MainLife",
			coverAmount: 0,
			premium: 0,
			genderType: "Male",
			age: 0,
			rowID: 0
		});
	}

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
		this.showAddRelationshipDialog = true;
	}

	_closeAddLifeDialog() {
		this.showAddRelationshipDialog = false;
	}


	//#endregion

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
		${this._renderUpdatePlanAddLifeAssuredDialog()}
		${this._renderEACLAgreementDialog()}
		${this._renderYBPAgreementDialog()}
		${this._renderFCPAgreementDialog()}
		${this._renderYROAAgreementDialog()}`
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
			${this.selectedQuoteTabIndex != 0 ? html`
			<capitec-button label="Email Plan" type="white"></capitec-button>
			` : html`
			<capitec-button label="Calculate" type="white"></capitec-button>
			`}
		
			<capitec-button label="Update Plan" type="white" .disabled="${this.agreementFCPAccepted == false}">
			</capitec-button>
		
		</capitec-title-bar>
		<capitec-card style="min-height: 100vh;">
			<capitec-tab-group @tab-select="${(e) => this._updatePlanTabChange(e)}">
		
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
		return html`
		
			<div class="insure-calc-column-left">
				<div class="left-card">
					<capitec-expander-group modeset="single">
						${this.quote.lifesAssured.map((lifeAssured, index) => html`
						${index != 0 ? html`
						<!-- Life assured expander -->
						<div class="account-details-bar">
							<capitec-expander label="">
								<div class="expander-options">
									<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" id-field="code"
										style="width: 50%">
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
							<capitec-group class="actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">
								<horizon-label label="Relationship: ${lifeAssured.relationship}" value="name">
								</horizon-label>
			
								<horizon-label label="Cover amount (Min R5 000 - Max R100 000)" value="amount">
								</horizon-label>
			
								<capitec-label label="Remove" type="subtitle" class="stronger link">
								</capitec-label>
							</capitec-group>
						</div>`: html`
						<!-- notifications -->
						${this._renderFCPNotification()}
			
						<!-- main life details -->
						<div class="calc-card-row">
							<capitec-label label="Main Life" type="strong">
							</capitec-label>
						</div>
			
						<!-- main life expander -->
						<div class="account-details-bar">
							<capitec-expander label="">
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
							<capitec-group class="actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">
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
							<capitec-label label="Add Life Assured" type="subtitle" class="stronger link"
								@click="${() => this._openAddLifeDialog()}">
							</capitec-label>
						</div>`}
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
			<div class="insure-calc-columns">
				<div class="insure-calc-column-left">
					<div class="left-card">
						${this._renderEACLNotification()}
						<div style="margin-top:5px;"></div>
						${this._renderYBPNotification()}
						<div class="calc-card-row">
							<capitec-label label="Main Life" type="strong">
							</capitec-label>
						</div>
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
							<capitec-group class="actionbar-header" layout="horizontal" gap="none" halign="left"
								valign="center">
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
		
			<div class="insure-calc-column-right">
				<div class="calc-summary-card">
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

	/** Notifications */

	/**
		 * Render notification component for 'Your responsibility & our accountability'
		 * 
		 * @returns {html} The html content of the component.
		 */
	_renderYROANotification() {
		return html`
		<capitec-alert-banner @click="${() => this.showYROAAgreementDialog = true}"
			type="${this.agreementYROAAccepted == true ? 'success' : 'info'}" header="Header"
			label="Notify: I agree to Your Responsibility & Our Accountability agreement declaration"></capitec-alert-banner>`
	}

	/**
	 * Render notification component for 'Funeral cover plan'
	 * @returns {html}
	 */
	_renderFCPNotification() {
		return html`
		<capitec-alert-banner @click="${() => this.showFCPAgreementDialog = true}"
			type="${this.agreementFCPAccepted == true ? 'success' : 'info'}" header="Header"
			label="Notify: I agree to Funeral cover plan agreement declaration"></capitec-alert-banner>`
	}

	/**
	 * Render notification component for 'Entry Ages and Child Limits'
	 * @returns {html}
	 */
	_renderEACLNotification() {
		return html`
		<capitec-alert-banner @click="${() => this.showEACLAgreementDialog = true}"
			type="${this.agreementEACLAccepted == true ? 'success' : 'info'}" header="Header"
			label="Notify: I agree to Entry Ages and Child Limits agreement declaration"></capitec-alert-banner>`
	}

	/**
	 * Render notification component for 'You/your beneficiary are paid'
	 * @returns {html}
	 */
	_renderYBPNotification() {
		return html`
		<capitec-alert-banner @click="${() => this.showYBPAgreementDialog = true}"
			type="${this.agreementYBPAccepted == true ? 'success' : 'info'}" header="Header"
			label="Notify: I agree to You/your beneficiary are paid agreement declaration"></capitec-alert-banner>`
	}

	// Dialogs

	/**
	 * Render Dialog to add Life assured to Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderUpdatePlanAddLifeAssuredDialog() {
		return this.showAddRelationshipDialog == false ? `` :
			html`
			<insure-add-life-dialog @addNewLife="${(e) => this._addLifeQuote(e)}"
				@closeModal="${(e) => this._closeAddLifeDialog(e)}" .currentLifesAssured="${this.quote.lifesAssured}">
			</insure-add-life-dialog>`
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
}

window.customElements.define(`horizon-insure-update-plan`, UpdatePlan);