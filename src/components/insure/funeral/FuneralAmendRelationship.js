import { Component, css, html } from 'platform/elements';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { formatDateToInsure, refreshRelationshipCoverDetails, getAgeFromDob, livesPerPolicy } from 'app/utils/insureUtils';
import { INSURE_CALLER_PAGE, RELTIONSHIP_FIX_EXT_FAM, ROLE_PLAYER_RELATIONSHIP } from 'app/constants/InsureCommon';
import { formatDate, formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities'
import { INSURE_CSS } from 'app/css/InsureCommonStyles';



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
			livesToAmend: { type: Array, state: true }

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
		this.livesToAmend = this.policyToAmend.roleplayers.map(rp => JSON.parse(JSON.stringify(rp)))
		this._setNewDefaultRelationships()
		this._getRelationshipTotals()
		this._validateRelationshipTotals()

		console.log(this.livesToAmend)
	}

	_setNewDefaultRelationships() {
		this.livesToAmend.forEach((life, index) => {

			// life.relationshipFix = {};
			if (!life?.amendDetails?.previousRelationship) {
				life.amendDetails.toFix = false;
			}

			if (life.lifeAssured === true) {
				if (life.relationship === "ExtendedChild") {
					life.amendDetails.previousRelationship = life.relationship;
					life.amendDetails.relationshipMessage = "";
					life.relationship = "Child"
					life.coverDetails.isExtendedFamily = false
					life.amendDetails.toFix = true;

				} else if (life.relationship === "ExtendedParent" || life.relationship === "ParentInLaw") {
					life.amendDetails.previousRelationship = life.relationship;
					life.amendDetails.relationshipMessage = "";
					life.relationship = "Parent"
					life.coverDetails.isExtendedFamily = false
					life.amendDetails.toFix = true;

				} else if (life.relationship === "ExtendedSpouse") {
					life.amendDetails.previousRelationship = life.relationship;
					life.amendDetails.relationshipMessage = "";
					life.relationship = "Spouse"
					life.coverDetails.isExtendedFamily = false
					life.amendDetails.toFix = true;

				} else if (life.relationship === "ExtendedFamily") {
					life.amendDetails.previousRelationship = life.relationship;
					life.amendDetails.relationshipMessage = "";
					life.amendDetails.toFix = true;

				};

				this._refreshCoverDetails(life, index);
				this._getRelationshipTotals()
			}

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
		this.currentTotalExtendedFamily = this.livesToAmend.filter((life) => life.relationship !== `MainLife` && life.relationship !== `Spouse` && life.relationship !== `Child` && life.relationship !== `Parent` && life.lifeAssured === true).length;
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

	_revertRelationshipClick(life, index) {
		life.relationship = life.amendDetails.previousRelationship
		if (life.relationship == "Spouse" || life.relationship == "Child" || life.relationship == "Parent") {
			life.coverDetails.isExtendedFamily = false
		} else {
			life.coverDetails.isExtendedFamily = true
		}
		this._getRelationshipTotals()
		this._refreshCoverDetails(life, index)
		this._validateRelationshipTotals()
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
				width: 100%%;
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
				height: 90px;
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
					@click="${() => this._amendAndReturn()}">
			</capitec-button>
		</capitec-title-bar>

		<capitec-card style="min-height: 50vh;">
			${this._renderLivesToAmend()}
		</capitec-card>
		`;
	}

	_renderLivesToAmend() {
		return html`
		
		<capitec-content-box class="body-box">
			<div class="select" >
						${this.livesToAmend.map((lives, index) => html`
							${lives.amendDetails.toFix === false ? html`` : html`
								<horizon-expander expandButtonAlignment="right" .expanded="${this._validateRoleplayer(lives) || lives.relationship === "ExtendedFamily"}" }">
									<capitec-group class="expander-header" slot="custom-header" layout="horizontal" gap="clear" halign="left"
										valign="center">
										<horizon-label class="fixed-label-secondary" 
											label="${ROLE_PLAYER_RELATIONSHIP[lives.amendDetails?.previousRelationship?.toUpperCase()]}" 
											textOverflow="ellipsis" 
											value="${lives.firstName} ${lives.surname}">
										</horizon-label>
										<div class="vertical-line"></div>
										<horizon-label 
											label="New Relationship"
											value="${lives.relationship == "ExtendedFamily" ? "" : ROLE_PLAYER_RELATIONSHIP[lives.relationship?.toUpperCase()]}">
										</horizon-label>
									</capitec-group>
									<<div slot="content">
										<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
											<div class="expander-options">
												<capitec-select 
													label="Relationship" 
													display-field="text" 
													id-field="code" 
													style="width: 50%; padding-left: 15px;" 
													value="${ROLE_PLAYER_RELATIONSHIP[lives.relationship?.toUpperCase()]}" 
													.items="${RELTIONSHIP_FIX_EXT_FAM}" 
													error="${lives?.amendDetails?.relationshipMessage}"
													@value-changed="${(e) => this._newRelationshipSelected(e, lives, index)}">
												</capitec-select>
												<capitec-button 
													label="Undo" 
													type="primary" 
													style="width: 50%; padding-left: 15px; max-height: 47px;" 
													@click="${() => this._revertRelationshipClick(lives, index)}">
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



	// #endregion

}
window.customElements.define(`horizon-insure-funeral-amend-relationship`, FuneralAmendRelationship);

