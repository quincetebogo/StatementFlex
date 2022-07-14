import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { refreshRelationshipCoverDetails } from 'app/utils/insureUtils';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';

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
import 'app/components/dialogs/insure/UpdatePlanAgreementDialog';
import 'app/components/dialogs/insure/ReinstatePolicyAgreementDialog';

// Other
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';
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
		this.beneficiaryToRemoveRowID;
		this.beneficiaryToRemoveName;

		this.showEACLAgreementDialog = false;
		this.showYBPAgreementDialog = false;
		this.showFCPAgreementDialog = false;
		this.showYROAAgreementDialog = false;
		this.showRemoveLifeAssuredDialog = false;
		this.showRemoveBeneficiaryDialog = false;
		this.showUpdatePlanAgreementDialog = false;
		this.showReinstatePolicyAgreementDialog = false;

		this.agreementFCPAccepted = false;
		this.agreementEACLAccepted = false;
		this.agreementYBPAccepted = false;
		this.agreementYROAAccepted = false;

		this.prepareUpdateResponse = {};

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
	 * @property {Boolean} showUpdatePlanAgreementDialog determines whether to show the Update Plan agreement dialog
	 * @property {Boolean} showConfirmPlanUpdateDialog Show flag for Conformation dialog, to confirm Update Plan agreement
	 * @property {Object} policyDetails Current Policy Summary Object
	 * @property {Object} updatePlanPrepare Callback function to Prepare Update	 *
	 * @property {Boolean} canReinstate determines whether to show the Reinstate button on the title bar
	 * @property {Boolean} showReinstatePolicyAgreementDialog determines whether to show the Reinstate Policy agreement dialog
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
			showAddBeneficiariesDialog: { type: Boolean, state: true },
			showRemoveLifeAssuredDialog: { type: Boolean, state: true },
			showRemoveBeneficiaryDialog: { type: Boolean, state: true },
			showUpdatePlanAgreementDialog: { type: Boolean, state: true },
			showConfirmPlanUpdateDialog: { type: Boolean, state: true },
			policyDetails: { type: Object, state: true },
			collectionDay: { type: Number, state: true },

			newTotalPremium: { string: '' },

			updatePlanPrepare: { type: Object, state: true },
			tempDocContent: { type: String, state: true },

			canReinstate: { type: Boolean },
			showReinstatePolicyAgreementDialog: { type: Boolean, state: true }
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
		this.policyDetails.roleplayers.push({
			title: '',
			gender: '',
			firstName: '',
			surname: '',
			middleName: '',
			idNumber: '',
			contactDetails: {
				cellphone: '',
				email: '',
			},
			relationship: e.detail.relationship,
			coverAmount: e.detail.coverDetails.defaultCover,
			lifeAssured: true,
			beneficiary: false,
			premium: 0,
			genderType: "Male",
			age: 0,
			rowID: this.policyDetails.roleplayers.length,
			coverDetails: e.detail.coverDetails
		});
		this.showAddRelationshipDialog = false;
	}

	//adding/removing beneficiaries

	/**
	 * Click event from the beneficiary dialog to add new beficiary and close dialog
	 */
	_onAddBeneficiaryClick(e) {
		if (e.detail.isLifeAssured == true) {
			this.policyDetails.roleplayers.find(ele => {
				if (ele.rowID == e.detail.beneficiary.rowID) {
					ele.beneficiary = true;
				}
				return;
			});
		} else {
			this.policyDetails.roleplayers.push(e.detail.beneficiary)
		}

		console.log(this.policyDetails.roleplayers);
		this._closeAddBeneficiariesDialog()
	}

	/**
	 * Click event from remove button on beneficiary list
	 * @param {Object} event
	 */
	_removeBeneficiary() {
		for (let index = 0; index < this.policyDetails.roleplayers.length; index++) {
			if (this.policyDetails.roleplayers[index].rowID == this.beneficiaryToRemoveRowID) {
				this.policyDetails.roleplayers[index].beneficiary = false;
				console.log('removing beneficiary')
				console.log(this.policyDetails.roleplayers[index].firstName)
			}
		}
		this._closeRemoveBeneficiaryDialog();
		this.requestUpdate();

	}

	/**
	 * Open Remove Beneficiary dialog
	 * 
	 * @param {*} index 
	 */
	_openRemoveBeneficiaryDialog(beneficiary, index) {
		console.log('beneficiary ', JSON.stringify(beneficiary));
		console.log('index ', JSON.stringify(index));

		this.showRemoveBeneficiaryDialog = true;
		this.beneficiaryToRemoveRowID = beneficiary.rowID;
		this.beneficiaryToRemoveName = beneficiary.firstName;
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

		this.policyDetails.roleplayers.splice(this.lifeAssuredToRemove, 1);
		// Reshuffle
		for (let index = 0; index < this.policyDetails.roleplayers.length; index++) {
			this.policyDetails.roleplayers[index].rowID = index;
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
			this.policyDetails.roleplayers[index].coverAmount = event.detail.new;
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
			this.policyDetails.roleplayers[index].age = event.detail.new;
			this.newTotalPremium = '';
		}

		this.policyDetails.roleplayers[index].coverDetails = refreshRelationshipCoverDetails(
			this.policyDetails.roleplayers[index].relationship,
			this.productParams,
			this.policyDetails.roleplayers[index].coverAmount,
			index == 0 ? this.maxAllowedCover : 0,
			this.policyDetails.roleplayers[index].age,
			this.policyDetails.roleplayers[index].coverDetails.isExtendedFamily,
			false);

		this.requestUpdate();
	}

	/**
	 * Event fired when a life assured GENDER value changes
	 * @param {*} event 
	 * @param {*} index 
	 */
	_lifeGenderValueChanged(event, index) {
		if (event.detail.old != event.detail.new) {
			this.policyDetails.roleplayers[index].genderType = event.detail.new.code;
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
			this.policyDetails.totalPremium = this.newTotalPremium
		}

		const request = {
			...this.estimate,
			// clientEstimateDetails: this.clientEstimateDetails
		}

		// Reset
		this.policyDetails.totalPremium = 0;
		this.newTotalPremium = '';


		this.dispatchEvent(new CustomEvent(`calculate-quote`, {
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
		// this.quote.lifesAssured = [];
		// this.quote.lifesAssured.push({
		// 	relationship: "MainLife",
		// 	coverAmount: 0,
		// 	premium: 0,
		// 	genderType: "Male",
		// 	age: 0,
		// 	rowID: 0,
		// 	coverDetails: {
		// 		defaultCover: 100000,
		// 		maxCover: 100000,
		// 		minCover: 5000,
		// 		maxAge: 64,
		// 		minAge: 18,
		// 	}
		// });
		// this.quote.beneficiaries = [];
		// this.quote.totalPremium = 0;

		// this.collectionDay = this.policyDetails.deductionDetails.collectionDay;

		this.canReinstate = this.policyDetails.canReinstate; //true - for testing;
		console.log('policyDetails');
		console.log(this.policyDetails);
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
		this.showAddBeneficiariesDialog = true;
	}

	/**
	 * Close the Add beneficiaries dialog
	 */
	_closeAddBeneficiariesDialog() {
		this.showAddBeneficiariesDialog = false;
	}

	/**
	 * Close the Add Life dialog
	 */
	_closeUpdatePlanAgreementDialog() {
		this.showUpdatePlanAgreementDialog = false;
	}

	/**
	 * Calculate Total Cover for all beneficiaries, including Main Life
	 * @returns {Number} totalCover 
	 */
	_totalCoverAmount() {
		return this.policyDetails.roleplayers.reduce((accumulator, ele) => {
			if (ele.beneficiary == true || ele.relationship == "MainLife") {
				return accumulator + parseFloat(ele.coverAmount);
			} else {
				return accumulator;
			}
		}, 0);
	}

	/**
	 * Calculate / Refresh current total beneficiaries including main life
	 * @returns {Number} totalBeneficiaries 
	 */
	_totalBeneficiaries() {
		return this.policyDetails.roleplayers.reduce((accumulator, ele) => {
			if (ele.beneficiary == true || ele.relationship == "MainLife") {
				return accumulator + 1;
			} else {
				return accumulator;
			}
		}, 0);
	}


	/**
	 * Update Plan button click event
	 * Invoke API endpoints
	 */
	async _onUpdatePlan() {
		// this.dispatchEvent(new CustomEvent(`update-plan-prepare`, {
		// 	detail: {
		// 		policy: this.policyDetails,
		// 	}
		// }));

		console.log('About to call callback - prepareUpdate');
		this.prepareUpdateResponse = await this.updatePlanPrepare(this.policyDetails);
		console.log('AFTER callback');
		console.log(JSON.stringify(this.prepareUpdateResponse));
		// awaint whatever
		// This needs to move
		this.showUpdatePlanAgreementDialog = true;

		// policyScheduleDocContent
		this.planAgreementContent = this.prepareUpdateResponse.planAgreement.documentContent
		this.paymentAgreementContent = this.prepareUpdateResponse.paymentAgreement.documentContent
	}

	async _acceptUpdatedPlan() {
		this.dispatchEvent(new CustomEvent(`updatePlanAccept`, { detail: { prepareUpdate: this.prepareUpdateResponse } }));
	}

	/**
	 * 
	 */
	async _onReinstatePolicyPopup() {
		this.showReinstatePolicyAgreementDialog = true;
	}

	/**
	 * Invoke this function when Agree button is clicked on Reinstate Policy Popup
	 */
	async _acceptReinstatePolicy() {
		this.dispatchEvent(new CustomEvent(`acceptReinstatePolicy`, { detail: { } }));
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
				/*width: 93%;*/
				z-index: 10;
				padding-top: 12px;
				padding-bottom: 12px;
				/*border-right: 1px solid #dfdfdf;*/
			}


			.expander-options{
				display: flex; 
				width: 100%;
				justify-content: space-between; 
				padding: 20px 15px 15px 15px; 
				gap: 10px;
			}

			/* Expander header and content styles */
			horizon-expander {
				margin-bottom: 16px;
				--theme-expander-height: auto;
				--theme-layout-gap-spacing: 0px;
				--theme-expander-header-height: 64px;
				--theme-expander-header-padding: 0 6px 0 0;
				--theme-expander-indicator-width: 16px;
			}
			horizon-expander[expanded] {
				box-shadow: 0 6px 10px 0.25px rgb(0 0 0 / 7%);
				display: block;
				--theme-overflow-menu-width: 200px !important;
			}
			.expander-header > capitec-icon {
				--theme-icon-size-default: 20px;
				--theme-layout-gap-spacing: 0px;
				margin-left: 10px;
			}
			.expander-header > capitec-button {
				width: 128px;
			}
			.expander-content {
				border-left: 1px solid #E1E1E1;
				border-bottom: 1px solid #E1E1E1;
				border-right: 1px solid #E1E1E1;
				border-radius: 0px 0px 4px 4px
			}
			.expander-content > capitec-title-bar {
				border-top: 0px;
			}
			.expander-header > horizon-label[label="Status"] {
				--horizon-label-value-color: #70AF00;
				width: 200px;
				text-overflow: ellipsis;
			}
			horizon-label {
				width: 280px;
				padding-left: 16px;
				--theme-layout-gap-spacing: 0px;
				--horizon-label-text-height: 20px;
				--horizon-label-text-color: #3A3A3A;
				--horizon-label-text-line-height: 20px;
				
				--horizon-label-value-height: 20px;
				--horizon-label-value-color: #3A3A3A;
				--horizon-label-value-font-size: 16px;
				--horizon-label-value-line-height: 20px;
			}
			
			.fixed-label-main {
				width: 65%;
				--horizon-label-max-overflow-width: 170px;
			}

			.fixed-label-secondary{
				width: 65%;
				--horizon-label-max-overflow-width: 170px;
			}


			.vertical-line {
				height: 40px;
				width: 1px;
				background-color: #E1E1E1;
			}

			.clickable{
				cursor: pointer;
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
		${this._renderRemoveBeneficiaryDialog()}
		${this._renderUpdatePlanAgreementDialog()}
		${this._renderReinstatePolicyAgreementDialog()}`
	}

	/**
	 * Render the content HTML  for the component
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}" />
			<capitec-label label="Update Plan ${ this.canReinstate ? `` : `#${this.policyDetails.contractReference}`}" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			${ this.canReinstate ? 
				html `<capitec-button label="Reinstate" type="white" @click="${() => this._onReinstatePolicyPopup() }"></capitec-button>` 
				:
				html `
					${this.selectedTabIndex == 0 ? html`
					<capitec-button label="Calculate" type="white" @click="${() => this._calculatePremium()}">
					</capitec-button>
					`: html``}
					<capitec-button label="Update Plan" type="white" @click="${() => this._onUpdatePlan()}">
					</capitec-button>
			`}
		</capitec-title-bar>
		
		<!-- .disabled="${this.agreementYROAAccepted == false}" -->
		
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
				${this._renderPremiumCalculator()}
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
					<!-- Notifications -->
					${this._renderFCPNotification()}
			
					<!-- Main Life -->
					<div class="calc-card-row">
						<capitec-label label="Main Life" type="strong">
						</capitec-label>
					</div>
			
					<horizon-expander expandButtonAlignment="right">
						<capitec-group class="expander-header" slot="custom-header" layout="horizontal" gap="clear" halign="left"
							valign="center">
							<horizon-label class="fixed-label-main" data-automation-id="insure-policy-contract-reference"
								label="Main Life" textOverflow="ellipsis"
								value="${this.policyDetails.roleplayers[0].firstName} ${this.policyDetails.roleplayers[0].surname}">
							</horizon-label>
							<div class="vertical-line"></div>
							<horizon-label data-automation-id="insure-policy-start-date"
								label="Cover Amount (Min R5 000 - Max R100 000)"
								value="${formatCurrency(this.policyDetails.roleplayers[0].coverAmount)}">
							</horizon-label>
						</capitec-group>
						<div slot="content">
							<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
								${this._renderMainLifeOptions(this.policyDetails.roleplayers[0])}
							</capitec-group>
						</div>
					</horizon-expander>
			
					<!-- Add lives Assured Button  -->
					<div class="calc-card-row" style="margin-top: 5px;">
						${ this.policyDetails.roleplayers?.filter(x=> x.relationship !== `MainLife`
							&& x.lifeAssured == true)?.length > 0
							? html `
							<capitec-label label="Lives Assured" type="strong" class="stronger">
							</capitec-label>`
						: ``}
						${this.canReinstate ? `` : 
							html `<capitec-label label="Add Life Assured" type="subtitle" class="stronger link"
								@click="${() => this._openAddLifeDialog()}">
								</capitec-label>
						`}		
					</div>
			
					<!-- Lifes Assured list -->
					${this.policyDetails.roleplayers.map((roleplayer, index) => html` ${roleplayer.relationship != "MainLife" &&
			roleplayer.lifeAssured == true ? 
					html`
					${ this.canReinstate ? ``	
						: html `<capitec-label label="Remove" @click="${() => this._openRemoveLifeAssuredDialog(index)}" type="subtitle"
							class="stronger link" style="position: relative; width: fit-content; left: 613px; top: 43px;">
						</capitec-label>`
					}
			
					<horizon-expander expandButtonAlignment="right">
						<capitec-group class="expander-header" slot="custom-header" layout="horizontal" gap="clear" halign="left"
							valign="center">
							<horizon-label class="fixed-label-secondary" label="${roleplayer.relationship}" textOverflow="ellipsis"
								value="${roleplayer.firstName} ${roleplayer.surname}">
							</horizon-label>
							<div class="vertical-line"></div>
							<horizon-label label="Cover Amount (Min R5 000 - Max R100 000)"
								value="${formatCurrency(roleplayer.coverAmount)}">
							</horizon-label>
						</capitec-group>
						<div slot="content">
							<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
								${this._renderLifeAssuredOptions(roleplayer)}
							</capitec-group>
						</div>
					</horizon-expander>
					` : html``}`)}
				</div>
			</div>`
	}

	/**
	 * Render premium calculator column
	 * @returns {html}
	 */
	_renderPremiumCalculator() {
		return html`
		<div class="insure-calc-column-right">
			<div class="calc-summary-card">
				<div>
					<!-- top -->
					<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
					</capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label label="Total estimated monthly premium"></capitec-label>
					<capitec-label label="${formatCurrency(this.policyDetails.totalPremium)}" class="calc-premium-total">
					</capitec-label>
					<capitec-label label="Summary of estimated monthly premium:" class="stronger"></capitec-label>
					<hr>
		
					<!-- life list -->
					${this.policyDetails.roleplayers.filter(ele => ele.relationship !== `MainLife`
						&& ele.lifeAssured == true).map(lifeAssured => html`
						<div class="calc-life-list">
							<capitec-label label="${lifeAssured.relationship}"></capitec-label>
							<capitec-label label="${formatCurrency(lifeAssured.premium)}"></capitec-label>
						</div>
						<hr>`)
					}
					<div class="calc-life-list">
						<capitec-label label="Total Premium Amount" class="stronger"></capitec-label>
						<capitec-label label="${formatCurrency(this.policyDetails.totalPremium)}" class="stronger">
						</capitec-label>
					</div>
				</div>
		
				<!-- bottom -->
				<div>
					<capitec-label label="Specify a premium you are willing to pay" class="stronger"></capitec-label>
					<br>
					<capitec-text-field @value-change="${(e) => this._totalPremiumChanged(e)}" .value="${this.newTotalPremium}"
						label="Premium Amount" type="numeric" ?disabled = "${Boolean(this.canReinstate)}">
					</capitec-text-field>
				</div>
			</div>
		</div>
		`
	}

	/**
	 * render the beneficiaries tab of Update plan
	 * @returns {html}
	 */
	_renderBeneficiariesTab() {
		return html`
			<capitec-tab label="Beneficiaries">
				<div class="insure-calc-columns">
					<div class="insure-calc-column-left">
						<div class="left-card">
			
							<!-- Notifications -->
							${this._renderEACLNotification()}
							<capitec-spacer></capitec-spacer>
							${this._renderYBPNotification()}
			
			
							<!-- Main life details -->
							<div class="calc-card-row">
								<capitec-label label="Main Life" type="strong">
								</capitec-label>
							</div>
							<horizon-expander expandButtonAlignment="right">
								<capitec-group class="expander-header" slot="custom-header" layout="horizontal" gap="clear"
									halign="left" valign="center">
									<horizon-label class="fixed-label-main" data-automation-id="insure-policy-contract-reference"
										label="Main Life" textOverflow="ellipsis"
										value="${this.policyDetails.roleplayers[0].firstName} ${this.policyDetails.roleplayers[0].surname}">
									</horizon-label>
									<div class="vertical-line"></div>
									<horizon-label data-automation-id="insure-policy-start-date"
										label="Cover Amount (Min R5 000 - Max 100 000)"
										value="${formatCurrency(this.policyDetails.roleplayers[0].coverAmount)}">
									</horizon-label>
								</capitec-group>
								<div slot="content">
									<capitec-group class="expander-content" layout="vertical" gap="none" halign="left"
										valign="center">
										${this._renderMainLifeOptions(this.policyDetails.roleplayers[0])}
									</capitec-group>
								</div>
							</horizon-expander>
			
							<!--Beneficiaries -->
							<div class="calc-card-row" style="margin-top: 15px;">
								${this.policyDetails?.roleplayers?.filter(x => x.beneficiary === true)?.length > 0
									? html `
									<capitec-label label="Beneficiaries" type="strong" class="stronger">
									</capitec-label>`
								 : ``}
								${this.canReinstate ? `` :
									this._renderAddBeneficiaryButton()
								}
							</div>

							<!-- Beneficiaries -->
							${this.policyDetails.roleplayers.map((beneficiary, index) => 
								html` ${beneficiary.beneficiary == true ? 
									html`
									${ this.canReinstate ? ``
										: html	`<capitec-label label="Remove" @click="${() => this._openRemoveBeneficiaryDialog(beneficiary, index)}"
										type="subtitle" class="stronger link"
										style="position: relative; width: fit-content; left: 613px; top: 43px;">
										</capitec-label>`
									}									
									<horizon-expander expandButtonAlignment="right">
										<capitec-group class="expander-header" slot="custom-header" layout="horizontal" gap="clear"
											halign="left" valign="center">
											<horizon-label class="fixed-label-secondary" label="${beneficiary.relationship}"
												textOverflow="ellipsis" value="${beneficiary.firstName} ${beneficiary.surname}">
											</horizon-label>
											<div class="vertical-line"></div>
											<horizon-label label="Cover Amount (Min R5 000 - Max 100 000)"
												value="${formatCurrency(beneficiary.coverAmount)}">
											</horizon-label>
										</capitec-group>
										<div slot="content">
											<capitec-group class="expander-content" layout="vertical" gap="none" halign="left"
												valign="center">
												${this._renderBeneficiaryOptions(beneficiary)}
											</capitec-group>
										</div>
									</horizon-expander>` : html``}`)}
						</div>
					</div>
					${this._renderCoverCalculator()}
				</div>
			</capitec-tab>
		`
	}

	/**
	 * render the Add beneficiary button if not over max limit
	 * @returns {html}
	 */
	_renderAddBeneficiaryButton() {
		if (this._totalBeneficiaries() < 3) {
			return html`
				<capitec-label label="Add Beneficiary" type="subtitle" class="stronger link"
					@click="${() => this._openAddBeneficiariesDialog()}"
					disabled="${this.policyDetails.roleplayers.filter(ele => ele.beneficiary == true).length >= 2}">
				</capitec-label>
			`
		} else {
			return html``;
		}
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
									style="width: 50%" value="${this.policyDetails.deductionDetails?.bankDetails?.bank}" 
									?disabled = "${Boolean(this.canReinstate)}">
								</capitec-select>
								<capitec-text-field label="Account Number" type="numeric" style="width: 50%"
									value="${this.policyDetails.deductionDetails?.bankDetails?.accountNumber}"
									?disabled = "${Boolean(this.canReinstate)}">
								</capitec-text-field>
							</div>
		
							<div class="calc-card-row">
								<capitec-select label="Account Type" .items="${this.accountTypeOptions}" display-field="text"
									id-field="code" style="width: 50%"
									value="${this.policyDetails.deductionDetails?.bankDetails?.accountType}"
									?disabled = "${Boolean(this.canReinstate)}">
								</capitec-select>
								<capitec-text-field label="Branch Code" type="numeric" style="width: 50%"
									value="${this.policyDetails.deductionDetails?.bankDetails?.branchCode}"
									?disabled = "${Boolean(this.canReinstate)}">
								</capitec-text-field>
							</div>
		
							<div class="calc-card-row">
								<capitec-select label="Debit order day" .items="${this.debitOrderDayOptions}"
									display-field="text" id-field="text" style="width: 50%" 
									.value="${this.collectionDay}" ?disabled="${this.canReinstate}">
								</capitec-select>
							</div>
						</div>
					</div>
				</div>
		
				${this._renderPremiumCalculator()}
		
		
			</div>
		</capitec-tab>
		`
	}

	/**
	 * Render Cover calculator
	 * @returns {html}
	 */
	_renderCoverCalculator() {
		return html`
			<div class="insure-calc-column-right">
				<div class="calc-summary-card">
					<div>
						<!-- top -->
						<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
						</capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-label label="Total cover amount"></capitec-label>
						<capitec-label label="${formatCurrency(this._totalCoverAmount())}" class="calc-premium-total">
						</capitec-label>
						<capitec-label label="Summary of payout beneficiary amount:" class="stronger"></capitec-label>
						<hr>
			
						<!-- Beneficiaries list -->
						${this.policyDetails.roleplayers.filter(ele => ele.beneficiary == true || ele.relationship ==
			'MainLife').map(beneficiary => html`
						<div class="calc-life-list">
							<capitec-label label="${beneficiary.relationship}"></capitec-label>
							<capitec-label label="${formatCurrency(beneficiary.coverAmount)}"></capitec-label>
						</div>
						<hr>`)}
					</div>
				</div>
			</div>
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
		<capitec-alert-banner class="clickable" @click="${() => this.showYROAAgreementDialog = true}"
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
		<capitec-alert-banner class="clickable" @click="${() => this.showFCPAgreementDialog = true}"
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
		<capitec-alert-banner class="clickable" @click="${() => this.showEACLAgreementDialog = true}"
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
		<capitec-alert-banner class="clickable" @click="${() => this.showYBPAgreementDialog = true}"
			type="${this.agreementYBPAccepted == true ? 'success' : 'info'}" header="Header"
			label="Notify: I agree to You/your beneficiary are paid agreement declaration">
		</capitec-alert-banner>`
	}

	/**
	 * Render Main Life options
	 * @returns {html} The html content of the Main Life Expander options
	 */
	_renderMainLifeOptions(roleplayer) {
		return html`
			<div class="expander-options">
				<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" id-field="code" style="width: 50%"
					disabled value="${roleplayer?.title}">
				</capitec-select>
			
				<capitec-text-field label="Name" style="width: 50%" disabled value="${roleplayer?.firstName}">
				</capitec-text-field>
			</div>
			<div class="expander-options">
				<capitec-text-field label="Surname" style="width: 50%" disabled value="${roleplayer?.surname}">
				</capitec-text-field>
			
				<capitec-text-field label="Email Address" style="width: 50%" disabled value="${roleplayer?.contactDetails?.email}">
				</capitec-text-field>
			</div>
			<div class="expander-options">
				<capitec-text-field label="Date of birth" style="width: 50%" disabled
					value="${formatDate(roleplayer?.dateOfBirth)}">
				</capitec-text-field>
			
				<capitec-text-field label="Cover amount" style="width: 50%" type="currency" value="${roleplayer?.coverAmount}"
					?disabled = "${Boolean(this.canReinstate)}">
				</capitec-text-field>
			</div>
			<div class="expander-options">
				<capitec-select label="Gender" .items="${this.genderOptions}" display-field="text" id-field="code"
					style="width: 50%" disabled value="${roleplayer?.gender}">
				</capitec-select>
			
				<capitec-text-field label="ID" style="width: 50%" disabled value="${roleplayer?.idNumber}">
				</capitec-text-field>
			</div>
		`;
	}

	/**
	 * Render Life Assured options - List of lives roleplayers that have "lifeAssured"=true
	 * @returns {html} The html content of the Life Assured expander options
	 */
	_renderLifeAssuredOptions(roleplayer) {
		return html`
			<div class="expander-options">
				<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" id-field="code" style="width: 50%"
					value="${roleplayer?.title}" ?disabled="${this.canReinstate}">
				</capitec-select>
			
				<capitec-select label="Gender" .items="${this.genderOptions}" display-field="text" id-field="code"
					style="width: 50%" @value-changed="${(e) => this._lifeGenderValueChanged(e, index)}"
					value="${roleplayer?.gender}" ?disabled="${this.canReinstate}">
				</capitec-select>
			</div>
			</div>
			<div class="expander-options">
				<capitec-text-field label="Name" style="width: 50%" value="${roleplayer?.firstName}"
					?disabled="${this.canReinstate}">
				</capitec-text-field>
			
				<capitec-text-field label="Surname" style="width: 50%" value="${roleplayer?.surname}"
					?disabled="${this.canReinstate}">
				</capitec-text-field>
			</div>
			<div class="expander-options">
				<capitec-text-field label="Middle Names" style="width: 50%" value="${roleplayer?.middleName}"
					?disabled="${this.canReinstate}">
				</capitec-text-field>
			
				<capitec-text-field label="Cover amount" style="width: 50%" type="currency" 
					value="${roleplayer?.coverAmount}" ?disabled="${this.canReinstate}">
				</capitec-text-field>
			</div>
			<div class="expander-options">
				${ this.canReinstate == true ? 
						html `<capitec-text-field label="Date of birth" style="width: 50%" disabled
								value="${formatDate(roleplayer?.dateOfBirth)}">
							</capitec-text-field>`
						:
						html `<capitec-date-time-picker style="width: 50%" label="Date of Birth" type="single" mode="date" inputType="input"
								date="${formatDate(roleplayer?.dateOfBirth)}" outputType="string" maxdate="${this.today}">
							</capitec-date-time-picker>`
				}
				<capitec-text-field label="ID" style="width: 50%" value="${ isNullorEmpty(roleplayer?.idNumber) ? `-` : roleplayer?.idNumber }" ?disabled="${this.canReinstate}">
				</capitec-text-field>
			</div>
			<div class="expander-options">
				<capitec-text-field label="Cellphone number" style="width: 50%" 
					value="${ isNullorEmpty(roleplayer?.contactDetails?.cellphone) ? `-` : roleplayer?.contactDetails?.cellphone }" ?disabled="${this.canReinstate}">
				</capitec-text-field>
			
				<capitec-text-field label="Email Address" style="width: 50%" 
					value="${ isNullorEmpty(roleplayer?.contactDetails?.email) ? `-` : roleplayer?.contactDetails?.email }" ?disabled="${this.canReinstate}">
				</capitec-text-field>
			</div>
		`;
	}
	/**
	 * Render Beneficiary options
	 * @returns {html} The html content of the Beneficiary expander options
	 */
	_renderBeneficiaryOptions(roleplayer) {
		return html`
		<div class="expander-options">
			<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" id-field="code" style="width: 50%"
				value=${roleplayer.title} ?disabled="${this.canReinstate}">
			</capitec-select>
		
			<capitec-text-field label="Name" style="width: 50%" value=${roleplayer.firstName}
				?disabled="${this.canReinstate}">
			</capitec-text-field>
		</div>
		<div class="expander-options">
			<capitec-text-field label="Surname" style="width: 50%" value=${roleplayer.surname}
				?disabled="${this.canReinstate}">
			</capitec-text-field>
		
			${ this.canReinstate == true ? 
				html `<capitec-text-field label="Date of birth" style="width: 50%" disabled
						value="${formatDate(roleplayer?.dateOfBirth)}">
					</capitec-text-field>`
				:
				html `<capitec-date-time-picker label="Date of Birth" type="single" mode="date" inputType="input"
					date="${formatDate(roleplayer.dateOfBirth)}" outputType="string" maxdate="${this.today}"
					value=${formatDate(roleplayer.dateOfBirth)} style="width: 50%"
					?disabled="${this.canReinstate}">
				</capitec-date-time-picker>`
			}
		</div>
		<div class="expander-options">
			<capitec-select label="Gender" .items="${this.genderOptions}" display-field="text" id-field="code"
				style="width: 50%" value=${roleplayer.gender}
				?disabled="${this.canReinstate}">
			</capitec-select>
			<capitec-text-field label="Payout amount" style="width: 50%" 
				value=${formatCurrency(roleplayer.benefitPayout)} ?disabled="${this.canReinstate}">
			</capitec-text-field>
		</div>
		<div class="expander-options">
			<capitec-text-field label="Email Address" style="width: 50%" 
				value=${ isNullorEmpty(roleplayer.contactDetails?.email) ? `-` : roleplayer.contactDetails?.email }  ?disabled="${this.canReinstate}">
			</capitec-text-field>
			<capitec-text-field label="Cellphone number" style="width: 50%" 
				value=${ isNullorEmpty(roleplayer.contactDetails?.cellphone) ? `-` : roleplayer.contactDetails?.cellphone} ?disabled="${this.canReinstate}">
			</capitec-text-field>
		</div>`
	}

	/** DIALOGS */

	/**
	 * Render Dialog to add Life assured to Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderLifeAssuredDialog() {
		return this.showAddRelationshipDialog == false ? `` :
			html`
			<insure-add-life-dialog @add-new-life="${(e) => this._addLife(e)}" @close-modal="${(e) => this._closeAddLifeDialog(e)}"
				.currentLifesAssured="${this.policyDetails.roleplayers}" .productParams="${this.productParams}">
			</insure-add-life-dialog>`
	}

	/**
	 * Render Dialog to remove Life assured from Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderRemoveLifeAssuredDialog() {
		return this.showRemoveLifeAssuredDialog == false ? `` :
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
		return this.showRemoveBeneficiaryDialog == false ? `` :
			html`
		<remove-beneficiary-dialog @agree-click="${(e) => this._removeBeneficiary()}"
			@close-modal="${(e) => this._closeRemoveBeneficiaryDialog(e)}" .beneficiaryName="${this.beneficiaryToRemoveName}">
		</remove-beneficiary-dialog>
		`
	}

	/**
	 * Render Dialog to add beneficiaries to Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderAddBeneficiariesDialog() {
		return this.showAddBeneficiariesDialog == false ? html`` :
			html`
		<add-beneficiary-dialog
			.lifesAssured="${this.policyDetails.roleplayers.filter(ele => ele.lifeAssured == true && ele.beneficiary == false)}"
			.beneficiaries="${this.policyDetails.roleplayers.filter(ele => ele.beneficiary == true)}"
			@add-click="${(e) => this._onAddBeneficiaryClick(e)}" @close-modal="${() => this._closeAddBeneficiariesDialog()}">
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

	/** 
	 * render dialog for update plan agreement
	 */
	_renderUpdatePlanAgreementDialog() {
		return this.showUpdatePlanAgreementDialog == false ? `` : html`
		<insure-update-plan-agreement-dialog @close-modal="${() => this._closeUpdatePlanAgreementDialog()}"
			.planAgreementContent="${this.planAgreementContent}" .paymentAgreementContent="${this.paymentAgreementContent}"
			@agree-click="${() => this._acceptUpdatedPlan()}">
		</insure-update-plan-agreement-dialog>`
	}

	/** 
	 * render dialog for reinstate policy agreement
	 */
	_renderReinstatePolicyAgreementDialog() {
		return this.showReinstatePolicyAgreementDialog == false ? `` : html`
		<insure-reinstate-policy-agreement-dialog @reinstate-close-modal = "${() => this.showReinstatePolicyAgreementDialog = false }"
			@reinstate-agree-click = "${() => this._acceptReinstatePolicy()}">
		</insure-reinstate-policy-agreement-dialog>`
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

/**
 * Initiate Update Plan API calls
 *
 * @example
 * <horizon-insure-update-plan ... @update-plan-create="${this._handler}"></horizon-insure-update-plan>
 *
 * @event UpdatePlan#update-plan-create
 * @type {Object} - N/A
 */