import { Component, css, html } from 'platform/elements';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { formatDateToInsure, refreshRelationshipCoverDetails, getAgeFromDob, livesPerPolicy } from 'app/utils/insureUtils';
import { INSURE_CALLER_PAGE, RELTIONSHIP_FIX_EXT_FAM, ROLE_PLAYER_RELATIONSHIP, OLD_RELATIONSHIPS } from 'app/constants/InsureCommon';
import { formatDate, formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities'
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

import '../../dialogs/insure/funeral/AmendRelationshipDialog';
import '../../dialogs/insure/funeral/AmendActionInfoDialog';



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
		this.showAmendRelationshipDialog = false;
		this.showAmendActionInfoDialog = false;

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
			showAmendActionInfoDialog: { type: Boolean, state: true }

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
		this._setNewAmendRelationshipFields()
		this._getRelationshipTotals()
		this._validateRelationshipTotals()

		console.log(this.livesToAmend)
	}

	_setNewAmendRelationshipFields() {
		this.livesToAmend.forEach((life, index) => {

			// life.relationshipFix = {};
			if (!life?.amendDetails?.previousRelationship) {
				life.amendDetails.toFix = false;
			}

			if (Object.keys(OLD_RELATIONSHIPS).includes(life.relationship.toUpperCase()) && life.lifeAssured === true) {
				life.amendDetails.previousRelationship = "";
				life.amendDetails.relationshipMessage = "";
				life.amendDetails.removeFromInception = false;
				life.amendDetails.riskAccepted = false;
				life.amendDetails.toFix = true;
				life.amendDetails.amended = false;
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

		console.log("Spouse count:", this.currentTotalSpouse)
		console.log("Child count:", this.currentTotalChild)
		console.log("Parent count:", this.currentTotalParent)
		console.log("Extended count:", this.currentTotalExtendedFamily)
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


	_removeLifeFromInception(lives, index) {
		//TODO: pop dialog to confirm removal
		lives.amendDetails.removeFromInception = true;
		lives.amendDetails.riskAccepted = true;
		lives.amendDetails.amended = true;
		console.log(this.livesToAmend)
		this.requestUpdate()
	}

	_acceptRiskOnLife(lives, index) {
		//TODO: Pop dialog to accept risk
		lives.amendDetails.removeFromInception = false;
		lives.amendDetails.riskAccepted = true;
		lives.amendDetails.amended = true;
		if (lives.amendDetails?.previousRelationship?.length > 0) {
			lives.relationship = lives.amendDetails.previousRelationship
			lives.amendDetails.previousRelationship = ""
		}
		this.requestUpdate()
	}

	_updateRelationship(e) {
		//TODO: set new selected relationship
		this.showAmendRelationshipDialog = false;
		this.livesToAmend[this.selectedRoleplayer].amendDetails.previousRelationship = this.livesToAmend[this.selectedRoleplayer].relationship
		this.livesToAmend[this.selectedRoleplayer].relationship = e.detail.relationship
		this.livesToAmend[this.selectedRoleplayer].amendDetails.amended = true
		this.livesToAmend[this.selectedRoleplayer].amendDetails.removeFromInception = false;
		this.livesToAmend[this.selectedRoleplayer].amendDetails.riskAccepted = false;

		this._getRelationshipTotals()
		this.requestUpdate()
	}


	_closeAmendRelationshipDialog() {
		this.showAmendRelationshipDialog = false;
	}

	_determineRelationshipChangeAvailablity() {
		let disable = false;
		this.livesToAmend.forEach((life) => {
			if (life.amendDetails?.removeFromInception || life.amendDetails.riskAccepted) {
				disable = true
			}
		})
		return disable
	}

	_determineRemoveLifeAvailablity() {
		let disable = false;
		this.livesToAmend.forEach((life) => {
			if (life.amendDetails?.previousRelationship?.length > 0) {
				disable = true
			}
		})
		return disable
	}

	_determineAcceptRiskAvailablity() {
		let disable = false;
		this.livesToAmend.forEach((life) => {
			if (life.amendDetails?.previousRelationship?.length > 0) {
				disable = true
			}
		})
		return disable
	}

	_openInfoDialog() {
		this.showAmendActionInfoDialog = true;
		console.log(this.showAmendActionInfoDialog)
		this.requestUpdate()
	}



	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Navigate to client summary
	 * @returns {void}
	 */
	_backToUpdatePlan() {
		this.dispatchEvent(new CustomEvent(`navigate-back-to-update`, {
			detail: {
				policy: this.policyToAmend
			}
		}));
	}

	_confirmAmendment() {
		this.amendedPolicy.roleplayers = this.livesToAmend
		this.dispatchEvent(new CustomEvent(`amend-and-navigate-back-to-update`, {
			detail: {
				policy: this.amendedPolicy
			}
		}));
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
			<capitec-label label="${`Amend Policy Relationships #${this.policyToAmend.contractReference}`}" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			<capitec-button label="Confirm" type="white" class="capitec-button-medium"
					@click="${() => this._confirmAmendment()}">
			</capitec-button>
		</capitec-title-bar>

		<capitec-card style="min-height: 50vh;">
			${this._renderAmendRelationshipDialog()}
			${this._renderAmendActionInfoDialog()}
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

	_renderLivesToAmend() {
		return html`

		<capitec-content-box class="body-box">
		${this._renderInvalidRelationshipsNotification()}
			<div class="select" >
						${this.livesToAmend.map((lives, index) => html`
							${lives.amendDetails.toFix === false ? html`` : html`
								<horizon-expander expandButtonAlignment="right" .expanded="${this._validateRoleplayer(lives) || lives.relationship === "ExtendedFamily"}" }">
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
												${lives.amendDetails?.removeFromInception ? html`
													<horizon-label 
														label="Action"
														value="Life to be removed">
													</horizon-label>
												`: html`
													${lives.amendDetails?.riskAccepted && !lives.amendDetails?.removeFromInception ? html`
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
										<!-- <horizon-label 
											label="New Relationship"
											value="${lives.relationship == "ExtendedFamily" ? "" : ROLE_PLAYER_RELATIONSHIP[lives.relationship?.toUpperCase()]}">
										</horizon-label> -->
									</capitec-group>
									<div slot="content">
										<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
											<div class="expander-options">
												<capitec-button 
													label="Change Relationship" 
													type="primary" 
													.disabled="${this._determineRelationshipChangeAvailablity()}"
													style="width: 50%; padding-left: 15px; max-height: 47px;" 
													@click="${() => this._selectNewRelationship(lives, index)}">
												</capitec-button>
												<capitec-button 
													label="Remove Life" 
													type="primary" 
													.disabled="${this._determineRemoveLifeAvailablity()}"
													style="width: 50%; padding-left: 15px; max-height: 47px;" 
													@click="${() => this._removeLifeFromInception(lives, index)}">
												</capitec-button>
												<capitec-button 
													label="Accept Risk" 
													type="primary" 
													.disabled="${this._determineAcceptRiskAvailablity()}"
													style="width: 50%; padding-left: 15px; max-height: 47px;" 
													@click="${() => this._acceptRiskOnLife(lives, index)}">
												</capitec-button>
											<div>
										</capitec-group>
									</div>
								</horizon-expander>	
							${console.log("life done rendering:", lives)}
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
						<capitec-label label="Parent"></capitec-label>
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
				.productParams="${this.productParams}"
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
			type="info" header="Please Advise:"
			@click="${() => this._openInfoDialog()}"
			label="Actions need to be taken on the below lives. Click for more Information.">
		</capitec-alert-banner>`;
	}

	_renderAmendActionInfoDialog() {
		return this.showAmendActionInfoDialog === false ? html`` : html`
		${console.log("rendering dialog")}
		<horizon-insure-amend-action-info-dialog
			@close-modal="${() => this.showAmendActionInfoDialog = false}">
		</horizon-insure-amend-action-info-dialog>
		`
	}



	// #endregion

}
window.customElements.define(`horizon-insure-funeral-amend-relationship`, FuneralAmendRelationship);

