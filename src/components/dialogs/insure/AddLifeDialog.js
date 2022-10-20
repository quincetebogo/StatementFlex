import { Component, css, html } from 'platform/elements';
import { livesPerPolicy, refreshRelationshipCoverDetails } from 'app/utils/insureUtils';

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
 * @class AddLifeDialog
 * @extends {Component}
 */
class AddLifeDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.currentTotalSpouse = 0;
		this.currentTotalChild = 0;
		this.currentTotalParent = 0;
		this.currentTotalExtendedFamily = 0;
		this.selectedRelationship = ``;
		this.showExtendedList = false;
	}

	// #endregion

	// #region PROPERTIES

	/**
	 * @property {Object} currentLifesAssured Current list of covered lives, used to check max per policy rules for new additions
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {boolean} showExtendedList Used to toggle between the primary and extended list
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			currentLifesAssured: { type: Object },
			productParams: { type: Object },
			showExtendedList: { type: Boolean, state: true }
		};
	}

	// #endregion

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	// #endregion

	// #region PRIVATE METHODS

	/**
	 * Initialize component when loaded / Count current lives in list and set limits
	 * Resets last selected relationship
	 * @returns {null} null
	 */
	_initialise() {
		this.currentTotalSpouse = this.currentLifesAssured.filter((life) => life.relationship === `Spouse`).length;
		this.currentTotalChild = this.currentLifesAssured.filter((life) => life.relationship === `Child`).length;
		this.currentTotalParent = this.currentLifesAssured.filter((life) => life.relationship === `Parent`).length;
		this.currentTotalExtendedFamily = this.currentLifesAssured.filter((life) => life.relationship !== `MainLife` && life.relationship !== `Spouse` && life.relationship !== `Child` && life.relationship !== `Parent`).length;
		this.selectedRelationship = ``;
	}

	// #endregion

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {null} null
	 */
	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
		this.showExtendedList = false;
	}

	/**
	 * Back event from dialog footer button, sets view back to main relationship
	 * @returns {null} null
	 */
	_onBackClick() {
		this.showExtendedList = false;
	}

	/**
	 * Add Event, Calculate cover details parameter, emit new life object to consuming component & reset toggles 
	 * @returns {null} null
	 */
	_onAddClick() {
		const coverDetails = refreshRelationshipCoverDetails(this.selectedRelationship, this.productParams, 0, 0, ``, this.showExtendedList, true);
		this.dispatchEvent(new CustomEvent(`add-new-life`, { detail: { relationship: this.selectedRelationship, coverDetails: coverDetails } }));
		this.showExtendedList = false;
	}

	/**
	 * Set the newly selected relationship type if value has changed
	 * @param {event} event Contains old and new value from selected radio button
	 * @returns {null} null
	 */
	_relationshipSelect(event) {
		if (event.detail.new) {
			this.selectedRelationship = event.target.id;
			this.requestUpdate();
		}
	}

	/**
	 * Switch from default list to extended family list & reset current selected relationship
	 * @returns {null} null
	 */
	_showExtendedFamilyList() {
		this.showExtendedList = true;
		this.selectedRelationship = ``;
	}

	// #endregion

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
					height: 370px;
				}

				.relationship-card{
					padding: 10px; min-height: inherit; width: 100%;
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
		<capitec-modal type="form" class="modal-body-label" header="Add Life Assured"
			data-automation-id="insure-add-life-dialog" header-align="left">
			<div slot="body" class="modal-body">
				<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear"
					data-automation-id="insure-add-life-dialog-body">
					${this._renderDialogBody()}
				</capitec-content-box>
			</div>
			<div slot="footer" data-automation-id="insure-add-life-dialog-footer">
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
		return html`
		<capitec-radio-group>
			<capitec-card class="relationship-card">
				<capitec-radio label="Spouse" id="Spouse" data-automation-id="insure-add-life-dialog-relationship" 
					.disabled="${this.currentTotalSpouse >= livesPerPolicy(`Spouse`, this.productParams)}" 
					hint="Only ${livesPerPolicy(`Spouse`, this.productParams)} allowed between the ages of 18 - 64 years."
					@value-changed="${(e) => this._relationshipSelect(e)}"></capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Child" id="Child" data-automation-id="insure-add-life-dialog-relationship" 
					.disabled="${this.currentTotalChild >= livesPerPolicy(`Child`, this.productParams)}" 
					hint="Up to ${livesPerPolicy(`Child`, this.productParams)} allowed for ages 25 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Parent" id="Parent" data-automation-id="insure-add-life-dialog-relationship" 
					.disabled="${this.currentTotalParent >= livesPerPolicy(`Parent`, this.productParams)}" 
					hint="Up to ${livesPerPolicy(`Parent`, this.productParams)} allowed between ages of 26 - 85 years."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Extended Family" data-automation-id="insure-add-life-dialog-extended" id="ExtendedFamily"
					.disabled="${this.currentTotalExtendedFamily >= livesPerPolicy(`ExtendedFamily`, this.productParams)}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._showExtendedFamilyList(e)}">
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
				<capitec-radio label="Aunt/ Uncle" id="AuntUncle" data-automation-id="insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Child Extended" id="ExtendedChild"
					data-automation-id="insure-add-life-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="First Cousin" id="Firstcousin" data-automation-id="insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="First Cousin's Child" id="Cousinschild"
					data-automation-id="insure-add-life-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Grandchild" id="Grandchild" data-automation-id="insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Grandparent" id="Grandparent" data-automation-id="insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Nephew/ Niece" id="NephewNiece" data-automation-id="insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Parent Extended" id="ExtendedParent"
					data-automation-id="insure-add-life-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Parent in Law" id="ParentInLaw" data-automation-id="insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Sibling" id="Sibling" data-automation-id="insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Spouse Extended" id="ExtendedSpouse"
					data-automation-id="insure-add-life-dialog-relationship" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Great Grandparent" id="Greatgrandparent"
					data-automation-id="insure-add-life-dialog-relationship" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Great Grandchild" id="Greatgrandchild"
					data-automation-id="insure-add-life-dialog-relationship" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
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
				<capitec-button id="id-confirm-button" type="primary" label="Add" data-automation-id="insure-add-life-dialog-add"
					@click="${() => this._onAddClick()}"
					.disabled="${this.currentLifesAssured.length >= MAX_LIVES_PER_POLICY || this.selectedRelationship === ``}">
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
			<capitec-button label="Cancel" data-automation-id="insure-add-life-dialog-cancel"
				@click="${() => this._onCancelClick()}">
			</capitec-button>
		`;
		}
		return html`
		<capitec-button label="Back" data-automation-id="insure-add-life-dialog-back" @click="${() => this._onBackClick()}">
		</capitec-button>`;


	}

	// #endregion
}

window.customElements.define(`insure-add-life-dialog`, AddLifeDialog);

/**
 * Send the newly selected relationship with cover details to consuming component when 'Add' is clicked
 *
 * @example
 * <insure-add-life-dialog ... @add-new-life="${this._handler}"></insure-add-life-dialog>
 *
 * @event AddLifeDialog#add-new-life
 * @type {Object} - N/A
 */

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <insure-add-life-dialog ... @close-modal="${this._handler}"></insure-add-life-dialog>
 *
 * @event AddLifeDialog#add-new-life
 * @type {Object} - N/A
 */