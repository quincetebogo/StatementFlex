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
		this.invalidRelMessage = ``
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
		this.currentTotalExtendedFamily = this.currentLifesAssured.filter((life) => life.relationship !== `MainLife` && life.relationship !== `Spouse` && life.relationship !== `Child` && life.relationship !== `Parent` && life.relationship !== `ExtendedFamily` && life.relationship !== `ExtendedSpouse` && life.relationship !== `ExtendedParent` && life.relationship !== `ExtendedChild` && life.relationship !== `ParentInLaw` && life.lifeAssured === true).length;
		this.selectedRelationship = ``;

		this._determineCurrentRelationship()
	}

	_determineCurrentRelationship() {
		let currentRel = this.currentLifesAssured[this.selectedLife].relationship

		if (currentRel === `ExtendedFamily`) {
			this.invalidRelMessage = `Extended Family category is no longer applicable, we have removed this category, please select the correct relationship type.`
		} else if (currentRel === `ExtendedSpouse`) {
			this.invalidRelMessage = `Spouse Extended category is no longer applicable, we have simplified this to Spouse. If this person is your Husband, Wife or Life Partner, please confirm below, otherwise select the correct relationship type.`
		} else if (currentRel === `ExtendedParent`) {
			this.invalidRelMessage = `Parent Extended category is no longer applicable, we have simplified this to Parent. If this person is your Parent, Parent-in-law, Step-Parent or legal Gaurdian, please confirm below, otherwise select the correct relationship type.`
		} else if (currentRel === `ExtendedChild`) {
			this.invalidRelMessage = `Child Extended category is no longer applicable, we have simplified this to Child. If this person is your child, adopted child, step child or son/daughter in-law, please confirm below, otherwise select the correct relationship type.`
		} else if (currentRel === `ParentInLaw`) {
			this.invalidRelMessage = `Parent In Law category is no longer applicable, we have simplified this to Parent. If this person is your Parent, Parent-in-law, Step-Parent or legal Gaurdian, please confirm below, otherwise select the correct relationship type`
		}

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
					height: 485px;
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

		<capitec-label label="${this.invalidRelMessage}" type="strong"></capitec-label>
		

		<capitec-radio-group>
			<capitec-card class="relationship-card">
				<capitec-radio label="Spouse" id="Spouse" style="--theme-input-hint-label-font-color: black;"
					.disabled="${this.currentTotalSpouse >= livesPerPolicy(`Spouse`, this.productParams) || this.financialChange || this._validAgeCheck(`Spouse`, this.productParams)}" 
					hint="Your legal husband, wife or life partner. Up to ${livesPerPolicy(`Spouse`, this.productParams)} allowed between the ages of 18 - 85 years."
					@value-changed="${(e) => this._relationshipSelect(e)}"></capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Child" id="Child" style="--theme-input-hint-label-font-color: black;"
					.disabled="${this.currentTotalChild >= livesPerPolicy(`Child`, this.productParams) || this.financialChange || this._validAgeCheck(`Child`, this.productParams)}" 
					hint="Your children or your spouse’s children. Including your son-in-law and daughter-in-law. Up to ${livesPerPolicy(`Child`, this.productParams)} allowed for ages 50 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Parent/Parent in Law" id="Parent" style="--theme-input-hint-label-font-color: black;"
					.disabled="${this.currentTotalParent >= livesPerPolicy(`Parent`, this.productParams) || this.financialChange || this._validAgeCheck(`Parent`, this.productParams)}" 
					hint="Your parents or your spouse’s parents. Up to ${livesPerPolicy(`Parent`, this.productParams)} allowed between ages of 26 - 85 years."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Extended Family"  id="ExtendedFamily" style="--theme-input-hint-label-font-color: black;"
					.disabled="${this.currentTotalExtendedFamily >= livesPerPolicy(`ExtendedFamily`, this.productParams) || this.financialChange || this._validAgeCheck(`ExtendedFamily`, this.productParams)}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._showExtendedFamilyList(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="None of the Above" id="Unknown" .disabled="${this.nonFinancialChange && !this.canReinstate}" style="--theme-input-hint-label-font-color: black;"
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
					.disabled="${this.ruleTotalExtendedFamily >= 8}" style="--theme-input-hint-label-font-color: black;"
					hint="Your parent's sister or brother and their spouses. Includes your spouse's aunt/uncle. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>

			<capitec-card class="relationship-card">
				<capitec-radio label="First Cousin" id="Firstcousin" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}" style="--theme-input-hint-label-font-color: black;"
					hint="First cousin is the child of your aunt or uncle. Includes your spouse's first cousin (must share a grandparent). Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="First Cousin's Child" id="Cousinschild"
					 .disabled="${this.ruleTotalExtendedFamily >= 8}" style="--theme-input-hint-label-font-color: black;"
					hint="The child of your first cousin. Including your spouse’s first cousin’s child. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Grandchild" id="Grandchild" style="--theme-input-hint-label-font-color: black;"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Your child’s child. Including your spouse’s grandchild. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Grandparent" id="Grandparent" style="--theme-input-hint-label-font-color: black;"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Your parent’s parent. Including your spouse’s grandparent. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Nephew/ Niece" id="NephewNiece" style="--theme-input-hint-label-font-color: black;"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="The child of your brother or sister. Including your spouse’s nephew or niece. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Sibling" id="Sibling" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}" style="--theme-input-hint-label-font-color: black;"
					hint="Your brother or sister. You need to share at least one parent. This includes your spouse’s sibling and your sibling’s spouse. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>

			<capitec-card class="relationship-card">
				<capitec-radio label="Great Grandparent" id="Greatgrandparent"
					 style="--theme-input-hint-label-font-color: black;"
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Your grandparent’s parent. Including your spouse’s great-grandparent. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Great Grandchild" id="Greatgrandchild"
					 style="--theme-input-hint-label-font-color: black;"
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Your great-grandchildren. Including your spouse’s great-grandchild. Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
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
					.disabled="${this.selectedRelationship === ``}">
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
