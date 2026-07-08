import { Component, css, html } from 'platform/elements';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { formatDateToInsure, refreshRelationshipCoverDetails, getAgeFromDob, livesPerPolicy } from 'app/utils/insureUtils';
import { INSURE_CALLER_PAGE, RELTIONSHIP_FIX_EXT_FAM, ROLE_PLAYER_RELATIONSHIP, OLD_RELATIONSHIPS } from 'app/constants/InsureCommon';
import { formatDate, formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities'
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

import '../../dialogs/insure/funeral/AmendRelationshipDialog';
import '../../dialogs/insure/funeral/AmendActionInfoDialog';
import '../../dialogs/insure/funeral/AmendConfirmAcceptRiskDialog';
import '../../dialogs/insure/funeral/AmendConfirmRemoveLifeDialog';



/**
 * Cancel policy success page shows you how many policies you still have active and allows you to navigate to issue policy
 * 
 * Events Raised 
 * -------------
 * navigate-to-summary
 * send-email
 *  
 * @export
 * @class FuneralCancelPolicySuccess
 * @extends {Component}
 */
class FuneralAmendRelationship extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		this.policyToAmend = {}
		this.amendedPolicy = {}
		this.currentTotalSpouse = 0;
		this.currentTotalChild = 0;
		this.currentTotalParent = 0;
		this.currentTotalExtendedFamily = 0;
		this.productParams = {}

		this.financialChange = false;
		this.nonFinancialChange = false;
		this.showAmendRelationshipDialog = false;
		this.showAmendActionInfoDialog = false;

		this.showConfirmAcceptRisk = false;
		this.showConfirmRemoveLife = false;

		this.canReinstate = false;


	}

	// #endregion

	// #region PROPERTIES

	/**
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			policyToAmend: { type: Object, state: true },
			amendedPolicy: { type: Object, state: true },
			currentTotalSpouse: { type: Number, state: true },
			currentTotalChild: { type: Number, state: true },
			currentTotalParent: { type: Number, state: true },
			currentTotalExtendedFamily: { type: Number, state: true },
			livesToAmend: { type: Array, state: true },
			showAmendRelationshipDialog: { type: Boolean, state: true },
			showAmendActionInfoDialog: { type: Boolean, state: true },
			showConfirmAcceptRisk: { type: Boolean, state: true },
			showConfirmRemoveLife: { type: Boolean, state: true },
			canReinstate: { type: Boolean, state: true },

		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialise()
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	_initialise() {
		this.amendedPolicy = JSON.parse(JSON.stringify(this.policyToAmend))
		this.livesToAmend = this.amendedPolicy.roleplayers.map(rp => JSON.parse(JSON.stringify(rp)))
		if (this.amendedPolicy?.canReinstate) {
			this.canReinstate = true;
			this.showAmendActionInfoDialog = true
		}

		if (!this.amendedPolicy?.amended) {
			this._setNewAmendRelationshipFields()
		}

		if (this.amendedPolicy?.isFinancialChanges) {
			this.financialChange = true
		}

		if (this.amendedPolicy?.isNonFinancialChanges) {
			this.nonFinancialChange = true
		}

		this._getRelationshipTotals()
		this._validateRelationshipTotals()

	}

	_setNewAmendRelationshipFields() {
		this.livesToAmend.forEach((life, index) => {

			if (!life?.amendDetails?.previousRelationship) {
				life.amendDetails.toFix = false;
			}

			if (Object.keys(OLD_RELATIONSHIPS).includes(life.relationship.toUpperCase()) && life.lifeAssured === true) {

				if (!life.amendDetails?.amended && life.nonInsurableAcknowledged) {
					life.amendDetails.toFix = false
				} else {
					life.amendDetails.previousRelationship = "";
					life.amendDetails.relationshipMessage = "";
					life.nonInsurableRemoval = false;
					life.nonInsurableAcknowledged = false;
					life.amendDetails.toFix = true;
					life.amendDetails.amended = false;
					life.amendDetails.showAcceptRisk = false;
					life.amendDetails.showRemoveLife = false;
					life.amendDetails.showChangeRelationship = true;
				}

			}
			this._getRelationshipTotals()

		})
	}

	_refreshCoverDetails(life, index) {
		this.livesToAmend[index].coverDetails = refreshRelationshipCoverDetails(
			life.relationship,
			this.productParams,
			life?.coverAmount,
			index === 0 ? this.maxAllowedCover : 0,
			getAgeFromDob(life.dateOfBirth),
			life.coverDetails?.isExtendedFamily,
			false
		);
		this.requestUpdate()
	}

	_getRelationshipTotals() {
		this.currentTotalSpouse = this.livesToAmend.filter((life) => life.relationship === `Spouse` && life.lifeAssured === true).length;
		this.currentTotalChild = this.livesToAmend.filter((life) => life.relationship === `Child` && life.lifeAssured === true).length;
		this.currentTotalParent = this.livesToAmend.filter((life) => life.relationship === `Parent` && life.lifeAssured === true).length;
		this.currentTotalExtendedFamily = this.livesToAmend.filter((life) =>
			life.relationship !== `MainLife`
			&& life.relationship !== `Spouse`
			&& life.relationship !== `Child`
			&& life.relationship !== `Parent`
			&& !Object.keys(OLD_RELATIONSHIPS).includes(life.relationship.toUpperCase())
			&& life.lifeAssured === true).length;

	}

	_validateRelationshipTotals() {
		this.livesToAmend.forEach((life, index) => {
			if (life?.amendDetails.toFix) {
				life.amendDetails.relationshipMessage = ``
			}
		})

		this._validateMinimumAges()

		if (this.currentTotalSpouse > livesPerPolicy(`Spouse`, this.productParams)) {
			this.livesToAmend.forEach((life, index) => {
				if (life.relationship == `Spouse` && life.amendDetails.toFix) {
					life.amendDetails.relationshipMessage = "Only 2 Spouses allowed per policy"
				}
			})
		}
		if (this.currentTotalChild > livesPerPolicy(`Child`, this.productParams)) {
			this.livesToAmend.forEach((life, index) => {
				if (life.relationship == `Child` && life.amendDetails.toFix) {
					life.amendDetails.relationshipMessage = "Only 10 Children allowed per policy"
				}
			})
		}
		if (this.currentTotalParent > livesPerPolicy(`Parent`, this.productParams)) {
			this.livesToAmend.forEach((life, index) => {
				if (life.relationship == `Parent` && life.amendDetails.toFix) {
					life.amendDetails.relationshipMessage = "Only 5 Parents allowed per policy"
				}
			})
		}
		if (this.currentTotalExtendedFamily > livesPerPolicy(`ExtendedFamily`, this.productParams)) {
			this.livesToAmend.forEach((life, index) => {
				if (life.relationship != `Parent` && life.relationship != `Child` && life.relationship != `Spouse` && life.relationship != `MainLife` && life.amendDetails.toFix) {
					life.amendDetails.relationshipMessage = "Only 10 Extended Family Members allowed per policy"
				}
			})
		}
	}

	/**
	 * Validate whether lives meet minimum ages
	 * @returns {void}
	 */
	_validateMinimumAges() {
		this.livesToAmend.forEach((life, index) => {
			let age = getAgeFromDob(life.dateOfBirth)

			if (life.amendDetails.toFix && age < life.coverDetails.minAge) {
				life.amendDetails.relationshipMessage = life.coverDetails.ageMessage
			}
		})
	}

	/**
	 * Validate whether lives has any error messages 
	 * @returns {void}
	 */
	_validateRoleplayer(rp) {
		if (!isNullorEmpty(rp?.relationshipFix?.relationshipMessage)) {
			return true
		}
		return false
	}

	_newRelationshipSelected(e, lives, index) {

		lives.relationship = e.detail.new.code

		if (lives.relationship == "Spouse" || lives.relationship == "Child" || lives.relationship == "Parent") {
			lives.coverDetails.isExtendedFamily = false
		} else {
			lives.coverDetails.isExtendedFamily = true
		}

		this._getRelationshipTotals()
		this._refreshCoverDetails(lives, index)
		this._validateRelationshipTotals()
		this.requestUpdate()
	}

	_selectNewRelationship(lives, index) {
		//TODO: open new Dialog to change relationship
		this.selectedRoleplayer = index

		this.showAmendRelationshipDialog = true
	}


	_removeLifeFromInception() {

		this.livesToAmend[this.selectedRoleplayer].nonInsurableRemoval = true;
		this.livesToAmend[this.selectedRoleplayer].nonInsurableAcknowledged = false;
		this.livesToAmend[this.selectedRoleplayer].amendDetails.amended = true;
		this.financialChange = true;
		this.livesToAmend[this.selectedRoleplayer].amendDetails.showChangeRelationship = false
		//if also a beneficiary
		// if (this.livesToAmend[this.selectedRoleplayer].beneficiary === true) {
		// 	this.livesToAmend[this.selectedRoleplayer].coverAmount = 0;
		// }


		this.showConfirmRemoveLife = false

		this.requestUpdate()
	}

	_acceptRiskOnLife() {
		this.livesToAmend[this.selectedRoleplayer].nonInsurableRemoval = false;
		this.livesToAmend[this.selectedRoleplayer].nonInsurableAcknowledged = true;

		this.livesToAmend[this.selectedRoleplayer].amendDetails.amended = true;
		this.financialChange = true;
		if (this.livesToAmend[this.selectedRoleplayer].amendDetails?.previousRelationship?.length > 0) {
			this.livesToAmend[this.selectedRoleplayer].relationship = this.livesToAmend[this.selectedRoleplayer].amendDetails.previousRelationship
		}
		this.livesToAmend[this.selectedRoleplayer].amendDetails.showChangeRelationship = false
		this.showConfirmAcceptRisk = false
		this.requestUpdate()
	}

	_updateRelationship(e) {
		this.showAmendRelationshipDialog = false;

		if (e.detail.relationship === `Unknown`) {
			this.livesToAmend[this.selectedRoleplayer].amendDetails.amended = true;
			this.livesToAmend[this.selectedRoleplayer].nonInsurableRemoval = false;
			this.livesToAmend[this.selectedRoleplayer].nonInsurableAcknowledged = false;
			this.livesToAmend[this.selectedRoleplayer].amendDetails.showAcceptRisk = true
			this.livesToAmend[this.selectedRoleplayer].amendDetails.showRemoveLife = true
			this.livesToAmend[this.selectedRoleplayer].amendDetails.showChangeRelationship = true
		} else {
			this.livesToAmend[this.selectedRoleplayer].amendDetails.previousRelationship = this.livesToAmend[this.selectedRoleplayer].relationship;
			this.livesToAmend[this.selectedRoleplayer].relationship = e.detail.relationship;
			this.livesToAmend[this.selectedRoleplayer].amendDetails.amended = true;
			this.livesToAmend[this.selectedRoleplayer].nonInsurableRemoval = false;
			this.livesToAmend[this.selectedRoleplayer].nonInsurableAcknowledged = false;
			if (!this.canReinstate) {
				this.financialChange = false;
				this.nonFinancialChange = true;
			}


		}

		this._getRelationshipTotals()
		this.requestUpdate()
	}


	_closeAmendRelationshipDialog() {
		this.showAmendRelationshipDialog = false;
	}

	_determineRelationshipChangeAvailablity(lives) {
		let disable = false;
		if (!lives.amendDetails?.showChangeRelationship) {
			disable = true
		}

		return disable
	}

	_determineRemoveLifeAvailablity(lives) {
		let disable = true;
		if (lives.amendDetails.showRemoveLife) {
			disable = false
		}
		return disable
	}

	_determineAcceptRiskAvailablity(lives) {
		let disable = true;
		if (lives.amendDetails?.showAcceptRisk) {
			disable = false
		}
		if (this.canReinstate) {
			disable = true
		}
		return disable
	}

	_openInfoDialog() {
		this.showAmendActionInfoDialog = true;
		this.requestUpdate()
	}

	_openConfirmAcceptRiskDialog(lives, index) {
		this.selectedRoleplayer = index
		this.showConfirmAcceptRisk = true
	}

	_openConfirmRemoveLifeDialog(lives, index) {
		this.selectedRoleplayer = index
		// this.showConfirmRemoveLife = true
		if (this.canReinstate) {
			this.livesToAmend[this.selectedRoleplayer].nonInsurableRemoval = true;
			this.livesToAmend[this.selectedRoleplayer].nonInsurableAcknowledged = false;
			this.livesToAmend[this.selectedRoleplayer].amendDetails.amended = true;
			this.requestUpdate()
		} else {
			this.showConfirmRemoveLife = true
		}

	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Navigate to client summary
	 * @returns {void}
	 */
	_backToUpdatePlan() {
		if (!this.canReinstate) {
			this.dispatchEvent(new CustomEvent(`navigate-back-to-update`, {
				detail: {
					policy: this.policyToAmend
				}
			}));
		} else {
			this.dispatchEvent(new CustomEvent(`navigate-back-to-client-summary`, {
				detail: {
					policy: this.policyToAmend
				}
			}));
		}

	}

	_confirmAmendment() {

		this.amendedPolicy.amended = true
		if (this.financialChange) {
			this.amendedPolicy.isFinancialChanges = true
		}

		if (this.nonFinancialChange) {
			this.amendedPolicy.isNonFinancialChanges = true
		}

		if (this.canReinstate) {
			for (let i = 1; i < this.livesToAmend.length; i++) {
				if (this.livesToAmend[i].nonInsurableRemoval) {
					if (this.livesToAmend[i].beneficiary === false) {
						this.livesToAmend.splice(i, 1);
						for (let index = 0; index < this.livesToAmend.length; index++) {
							this.livesToAmend[index].rowID = index;
						}
					} else {
						this.livesToAmend[i].relationship = `BeneficiaryOnly`;
						this.livesToAmend[i].lifeAssured = false;
						this.livesToAmend[i].coverAmount = 0;
					}
				}
			}
		}
		this.amendedPolicy.roleplayers = this.livesToAmend
		this.dispatchEvent(new CustomEvent(`navigate-back-to-update`, {
			detail: {
				policy: this.amendedPolicy
			}
		}));
	}

	_checkAvailability() {
		if (!this.canReinstate) {
			return false
		}

		let allAmended = true;

		this.livesToAmend.forEach((life) => {
			if (life.amendDetails.amended === false) {
				allAmended = false;
			}
		})
		return !allAmended
	}
	// #endregion EVENT HANDLERS

	// #region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			
			${INSURE_CSS}

			.insure-title-bar{
				margin-bottom: 0px; 
				border-top-left-radius: 5px; 
				border-top-right-radius: 5px;
				
			}

			.container{
				min-height: 650px;
				text-align: center;
				padding-top: 100px;
			}

			.label{
				font-weight: bold;
				font-size: 24px;
				margin-bottom: 30px;
			}
			
			.spacing { 
				margin-bottom: 30px;
				margin-top: 20px;
			}

			.notification {
				width: 350px;
				margin: auto;
			}

			.button-row{
				display: flex; 
				justify-content: center;
				padding: 10px 15px 15px 15px; 
				gap: 10px;
			}

			.select{
				margin-bottom: 20px;
				width: 100%;
			}
			.button {
				width: 140px;
			}

			horizon-label {
				width: 285px;
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

			.expander-header > capitec-icon {
				--theme-icon-size-default: 20px;
				--theme-layout-gap-spacing: 0px;
				margin-left: 10px;
			}

			.expander-header > capitec-button {
				width: 128px;
			}

			.fixed-label-secondary{
				width: 85%;
				--horizon-label-max-overflow-width: 170px;
			}

			.vertical-line {
				height: 40px;
				width: 1px;
				background-color: #E1E1E1;
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
			
			.expander-options{
				display: flex; 
				width: 100%;
				justify-content: space-between; 
				gap: 10px;
				min-height: 78px;
				padding-top: 15px;
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
				max-height: 1045px;
				height: fit-content;
			}
			
			.calc-summary-card{
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
			
			.calc-life-list{
				display: flex; 
				justify-content: space-between;
			}

			.clickable{
				cursor: pointer;
				--theme-toast-width: 100%;
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
		`;
	}

	/**
	 * Render the content HTML for the component
	 * @returns {html} html content
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToUpdatePlan()}" />
			<capitec-label label="${!this.canReinstate ? `Amend Policy Relationships #${this.policyToAmend.contractReference}` : `Amend Policy Relationships`}" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			<capitec-button label="Confirm" type="white" class="capitec-button-medium"
					.disabled="${this._checkAvailability()}"
					@click="${() => this._confirmAmendment()}">
			</capitec-button>
		</capitec-title-bar>

		<capitec-card style="min-height: 50vh;">
			${this._renderDialogs()}
			<div class="insure-calc-columns">
				<div class="insure-calc-column-left">
					${this._renderLivesToAmend()}
				</div>
				<div class="insure-calc-column-right">
					${this._renderRelationshipCounter()}
				</div>
			</div>	
			
		</capitec-card>
		`;
	}

	/**
	 * Render the the necessary dialogs
	 * @returns {html} html content
	 */
	_renderDialogs() {
		return html`
			${this._renderAmendRelationshipDialog()}
			${this._renderAmendActionInfoDialog()}
			${this._renderConfirmRemoveLife()}
			${this._renderConfirmAcceptRisk()}
		`
	}

	/**
	 * Render the content HTML for the lives to amend component
	 * @returns {html} html content
	 */
	_renderLivesToAmend() {
		return html`

		<capitec-content-box class="body-box">
			${this._renderInvalidRelationshipsNotification()}
			<div class="select">
			${this.livesToAmend.map((lives, index) => html`
				${lives.amendDetails.toFix === false ? html`` : html`
					<horizon-expander expandButtonAlignment="right" .expanded="${this._validateRoleplayer(lives)}" >
						<capitec-group class="expander-header" slot="custom-header" layout="horizontal" gap="clear" halign="left"
							valign="center">
							<horizon-label class="fixed-label-secondary"
								label="${ROLE_PLAYER_RELATIONSHIP[lives.relationship?.toUpperCase()]}"
								textOverflow="ellipsis"
								value="${lives.firstName} ${lives.surname}">
							</horizon-label>
							<div class="vertical-line"></div>
							${lives.amendDetails?.amended === false ? html`
								<horizon-label style="--horizon-label-text-color: green;"
									label="Action needed"
									value="Please Amend life">
								</horizon-label>
								` : html`
								${lives.nonInsurableRemoval ? html`
									<horizon-label 
										label="Action"
										value="Life to be removed">
									</horizon-label>
								`: html`
									${lives.nonInsurableAcknowledged ? html`
										<horizon-label 
											label="Action"
											value="Risk accepted">
										</horizon-label>
									` : html`
										<horizon-label 
											label="New Relationship"
											value="${ROLE_PLAYER_RELATIONSHIP[lives.relationship?.toUpperCase()]}">
										</horizon-label>
										`}
									`}
							`}
						</capitec-group >
						<div slot="content">
							<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
								<div class="expander-options">
									<capitec-button 
										label="Change Relationship" 
										type="primary" 
										.disabled="${this._determineRelationshipChangeAvailablity(lives)}"
										style="width: 50%; padding-left: 15px; max-height: 47px;" 
										@click="${() => this._selectNewRelationship(lives, index)}">
									</capitec-button>
									<capitec-button 
										label="Remove Life" 
										type="primary" 
										.disabled="${this._determineRemoveLifeAvailablity(lives)}"
										style="width: 50%; padding-left: 15px; max-height: 47px;" 
										@click="${() => this._openConfirmRemoveLifeDialog(lives, index)}">
									</capitec-button>
									<capitec-button 
										label="Accept Risk" 
										type="primary" 
										.disabled="${this._determineAcceptRiskAvailablity(lives)}"
										style="width: 50%; padding-left: 15px; max-height: 47px;" 
										@click="${() => this._openConfirmAcceptRiskDialog(lives, index)}">
									</capitec-button>
								<div>
							</capitec-group>
						</div >
					</horizon-expander >
				`}
			`)}
			</div>
		</capitec-content-box>
		`
	}

	_renderRelationshipCounter() {
		return html`
		
			<div class="calc-summary-card">
				<div>
					<!-- top -->
					<capitec-label label="Relationship totals:" class="Strong" style="font-weight: bold;"></capitec-label>
					<hr>
		
					<!-- relationship list -->
					<div class="calc-life-list">
						<capitec-label label="Spouse"></capitec-label>
						<capitec-label label="${this.currentTotalSpouse}/2"></capitec-label>
					</div>
					<hr>
					<div class="calc-life-list">
						<capitec-label label="Child"></capitec-label>
						<capitec-label label="${this.currentTotalChild}/10"></capitec-label>
					</div>
					<hr>
					<div class="calc-life-list">
						<capitec-label label="Parent/Parent in Law"></capitec-label>
						<capitec-label label="${this.currentTotalParent}/5"></capitec-label>
					</div>
					<hr>
					<div class="calc-life-list">
						<capitec-label label="Extended Family"></capitec-label>
						<capitec-label label="${this.currentTotalExtendedFamily}/8"></capitec-label>
					</div>
					<hr>
				</div>
			</div>
		`
	}

	/**
	 * Render Dialog to add Life assured to Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderAmendRelationshipDialog() {
		return this.showAmendRelationshipDialog === false ? ``
			: html`
			<horizon-insure-amend-relationship-dialog 
				.currentLifesAssured="${this.livesToAmend}" 
				.selectedLife="${this.selectedRoleplayer}"
				.canReinstate="${this.canReinstate}"
				.productParams="${this.productParams}"
				.financialChange="${this.financialChange}"
				.nonFinancialChange="${this.nonFinancialChange}"
				@amend-relationship="${(e) => this._updateRelationship(e)}" 
				@close-modal="${(e) => this._closeAmendRelationshipDialog(e)}">
			</horizon-insure-amend-relationship-dialog>`;
	}

	/**
	 * Render notification component for 'Debit Order agreement'
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderInvalidRelationshipsNotification() {
		return html`
		<capitec-alert-banner style="padding-bottom: 10px" class="clickable"}"
			type="info" header="Please Update:"
			label="You have covered lives on your policy that fall into these extended categories.">
		</capitec-alert-banner>`;
	}

	_renderAmendActionInfoDialog() {
		return this.showAmendActionInfoDialog === false ? html`` : html`
		<horizon-insure-amend-action-info-dialog
			@close-modal="${() => this.showAmendActionInfoDialog = false}">
		</horizon-insure-amend-action-info-dialog>
		`
	}

	_renderConfirmAcceptRisk() {
		return this.showConfirmAcceptRisk === false ? html`` : html`
			<horizon-insure-amend-confirm-accept-risk-dialog
				@confirm-change="${() => this._acceptRiskOnLife()}"
				@close-modal="${() => this.showConfirmAcceptRisk = false}">
			</horizon-insure-amend-confirm-accept-risk-dialog>
		`

	}

	_renderConfirmRemoveLife() {
		return this.showConfirmRemoveLife === false ? html`` : html`
			<horizon-insure-amend-confirm-remove-life-dialog
				@confirm-change="${() => this._removeLifeFromInception()}"
				@close-modal="${() => this.showConfirmRemoveLife = false}">
			</horizon-insure-amend-confirm-remove-life-dialog>
		`
	}


	// #endregion

}
window.customElements.define(`horizon-insure-funeral-amend-relationship`, FuneralAmendRelationship);

