import { Component, css, html } from 'platform/elements';
import { INSURE_CALLER_PAGE, ROLE_PLAYER_RELATIONSHIP } from 'app/constants/InsureCommon';
import { formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { livesPerPolicy, refreshRelationshipCoverDetails, getAgeFromDob, getRelationshipMinAge } from 'app/utils/insureUtils';
import 'app/components/dialogs/insure/AddBeneficiaryOnlyLaDialog';

const MAX_LIVES_PER_POLICY = 22;

/**
 * Add life modal dialog component, that will provide the consumer to selected relationship, as well as the applied cover details for that relationship.
 * The dialog will also check if you have exceeded the max lives per policy and relationship type, and then disable those selection if max count has been reached
 * 
 * Events Raised 
 * -------------
 * add-new-life
 * close-modal
 *  
 * @export
 * @class AmendRelationshipDialog
 * @extends {Component}
 */
class AmendRelationshipDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.currentTotalSpouse = 0;
		this.currentTotalChild = 0;
		this.currentTotalParent = 0;
		this.currentTotalExtendedFamily = 0;
		this.selectedRelationship = ``;
		this.showExtendedList = false;
		this.financialChange = false;
		this.nonFinancialChange = false;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Array} currentLifesAssured Current list of covered lives, used to check max per policy rules for new additions
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {boolean} showExtendedList Used to toggle between the primary and extended list
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			currentLifesAssured: { type: Array, state: true },
			selectedLife: { type: Number, state: true },
			productParams: { type: Object, state: true },
			showExtendedList: { type: Boolean, state: true },
			canReinstate: { type: Boolean, state: true }
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
		this._initialise();
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	/**
	 * Initialize component when loaded / Count current lives in list and set limits
	 * Resets last selected relationship
	 * @returns {void}
	 */
	_initialise() {
		this.currentTotalSpouse = this.currentLifesAssured.filter((life) => life.relationship === `Spouse` && life.lifeAssured === true).length;
		this.currentTotalChild = this.currentLifesAssured.filter((life) => life.relationship === `Child` && life.lifeAssured === true).length;
		this.currentTotalParent = this.currentLifesAssured.filter((life) => life.relationship === `Parent` && life.lifeAssured === true).length;
		this.currentTotalExtendedFamily = this.currentLifesAssured.filter((life) => life.relationship !== `MainLife` && life.relationship !== `Spouse` && life.relationship !== `Child` && life.relationship !== `Parent` && life.lifeAssured === true).length;
		this.selectedRelationship = ``;
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void}
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
		this.showExtendedList = false;
	}

	/**
	 * Back event from dialog footer button, sets view back to main relationship
	 * @returns {void} 
	 */
	_backClick() {
		this.showExtendedList = false;
	}

	/**
	 * Add Event, Calculate cover details parameter, emit new life object to consuming component & reset toggles 
	 * @returns {void}
	 */
	_addClick() {
		console.log("before dispatch")
		this.dispatchEvent(new CustomEvent(`amend-relationship`, { detail: { relationship: this.selectedRelationship } }));

	}

	/**
	 * Set the newly selected relationship type if value has changed
	 * @param {event} event Contains old and new value from selected radio button
	 * @returns {void} 
	 */
	_relationshipSelect(event) {


		if (event.detail.new) {
			this.selectedRelationship = event.target.id;
			this.requestUpdate();
		}
		console.log(this.selectedRelationship)
	}

	/**
	 * Switch from default list to extended family list & reset current selected relationship
	 * @returns {void} 
	 */
	_showExtendedFamilyList() {
		this.showExtendedList = true;
		this.selectedRelationship = ``;
	}

	_validAgeCheck(selectedRelationship, params) {
		let minAge = getRelationshipMinAge(selectedRelationship, params)
		let lifeAge = getAgeFromDob(this.currentLifesAssured[this.selectedLife].dateOfBirth)
		if (Number(lifeAge) < minAge) {
			return true
		} else {
			return false
		}

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
				.modal-body-label{
					padding: 10px 10px 10px 10px;
					font-weight: bold;
				}
				
				#dialog-body{
					height: 450px;
					padding: 0px;
				}

				.relationship-card{
					padding: 10px; min-height: inherit; width: 100%;
				}
				.add-beneficiary{
					border: 1px solid #e1e1e1; 
					border-radius: 5px; 
					padding: 10px; 
					width: 100%;
				}
				.title{
					padding-bottom: 5px; 
				}
				.subtitle{
					padding-bottom: 5px;
					font-weight: normal; 
				}
				
				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
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
		<capitec-modal type="form" class="modal-body-label" header="Select new relationship"
			 header-align="left" style="--theme-modal-header-color: black; z-index: 10000;">
			<div slot="body" class="modal-body">
				<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear">
					${this._renderDialogBody()}
				</capitec-content-box>
			</div>
			<div slot="footer">
				${this._renderDialogFooter()}
			</div>
		</capitec-modal>`;
	}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {
		return html`
		<capitec-content-box id="dialog-body">
			${this.showExtendedList === false ? this._renderDefaultList() : this._renderExtendedFamilyList()}
		</capitec-content-box>`;
	}

	/**
	 * Default list with default life options
	 * @returns {html} The html content of the component.
	 */
	_renderDefaultList() {
		const currentLifeAssuredLength = this.currentLifesAssured.filter((life) => life.lifeAssured === true).length;

		return html`

		<capitec-radio-group>
			<capitec-card class="relationship-card">
				<capitec-radio label="Spouse" id="Spouse" 
					.disabled="${this.currentTotalSpouse >= livesPerPolicy(`Spouse`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY || this.financialChange || this._validAgeCheck(`Spouse`, this.productParams)}" 
					hint="The person you are married to. Up to ${livesPerPolicy(`Spouse`, this.productParams)} allowed between the ages of 18 - 85 years."
					@value-changed="${(e) => this._relationshipSelect(e)}"></capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Child" id="Child" 
					.disabled="${this.currentTotalChild >= livesPerPolicy(`Child`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY || this.financialChange || this._validAgeCheck(`Child`, this.productParams)}" 
					hint="Your/Your spouse’s biological child, legally adopted child, stepchild, son/daughter-in-law or where you/your spouse are the child’s legal guardian. Up to ${livesPerPolicy(`Child`, this.productParams)} allowed for ages 50 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Parent" id="Parent" 
					.disabled="${this.currentTotalParent >= livesPerPolicy(`Parent`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY || this.financialChange || this._validAgeCheck(`Parent`, this.productParams)}" 
					hint="Your/Your spouse’s biological parents, parents-in-law, legal guardian if you are adopted and stepparents. Up to ${livesPerPolicy(`Parent`, this.productParams)} allowed between ages of 26 - 85 years."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Extended Family"  id="ExtendedFamily"
					.disabled="${this.currentTotalExtendedFamily >= livesPerPolicy(`ExtendedFamily`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY || this.financialChange || this._validAgeCheck(`ExtendedFamily`, this.productParams)}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._showExtendedFamilyList(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="None of the Above" id="Unknown" .disabled="${this.nonFinancialChange && !this.canReinstate}"
					hint="Life does not match any of the provided relationship types"
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		</capitec-radio-group>`;
	}

	/**
	 * Extended family list with extra life options
	 * @returns {html} The html content of the component.
	 */
	_renderExtendedFamilyList() {
		return html`
		<capitec-radio-group>
			<capitec-card class="relationship-card">
				<capitec-radio label="Aunt/ Uncle" id="AuntUncle" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="The sister/brother of your/your spouse's father or mother, or your aunt’s/uncle’s spouse. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>

			<capitec-card class="relationship-card">
				<capitec-radio label="First Cousin" id="Firstcousin" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="The child of your/your spouse’s aunt/uncle. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="First Cousin's Child" id="Cousinschild"
					 .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="The child of your/your spouse’s first cousin. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Grandchild" id="Grandchild" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Your/your spouse’s child’s child. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Grandparent" id="Grandparent" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Your/your spouse’s parent’s parent. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Nephew/ Niece" id="NephewNiece" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="The male/female child of your/your spouse’s brother or sister. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Sibling" id="Sibling" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Your/your spouse’s parent’s male or female child. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>

			<capitec-card class="relationship-card">
				<capitec-radio label="Great Grandparent" id="Greatgrandparent"
					 
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Your/your spouse’s parent’s grandparent. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Great Grandchild" id="Greatgrandchild"
					 
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="The child of your/your spouse’s grandchild. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		</capitec-radio-group>`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			<capitec-group layout="horizontal">
				${this._renderCancelOrBackButton()}
				<capitec-button id="id-confirm-button" type="primary" label="Add" data-automation-id="horizon-insure-add-life-dialog-add"
					@click="${() => this._addClick()}"
					.disabled="${this.currentLifesAssured.filter((life) => life.lifeAssured === true).length >= MAX_LIVES_PER_POLICY || this.selectedRelationship === ``}">
				</capitec-button>
			</capitec-group>`;
	}

	/**
	 * Render back or cancel button depending on which view is shown (Default vs Extended Family)
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderCancelOrBackButton() {
		if (this.showExtendedList === false) {
			return html`
			<capitec-button label="Cancel" data-automation-id="horizon-insure-add-life-dialog-cancel"
				@click="${() => this._cancelClick()}">
			</capitec-button>
		`;
		}
		return html`
		<capitec-button label="Back" data-automation-id="horizon-insure-add-life-dialog-back" @click="${() => this._backClick()}">
		</capitec-button>`;


	}

	// #endregion EVENT HANDLERS
}

window.customElements.define(`horizon-insure-amend-relationship-dialog`, AmendRelationshipDialog);
