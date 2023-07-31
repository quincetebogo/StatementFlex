import { Component, css, html } from 'platform/elements';
import { getAgeFromDob, livesPerPolicy, refreshRelationshipCoverDetails } from 'app/utils/insureUtils';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

const MAX_LIVES_PER_POLICY = 22;
const MAX_AGE_SPOUSE = 65;
const MIN_AGE_SPOUSE = 26;
const MAX_AGE_PARENT = 85;
const MAX_AGE_EXTENDED = 85;
const MAX_AGE_CHILD = 25;

/**
 * cancel policy dialog 
 * 
 * Events Raised 
 * -------------
 * close-modal
 * agree
 *  
 * @export
 * @class CancelPolicyDialog
 * @extends {Component}
 */
class AddBeneficiaryOnlyLaDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		 
		this.selectedBene = [];
		this.lives = [];
		this.selectedRelationship = ``;
		this.showExtendedList = false;

		
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * 
	 */
	static get properties() {
		return {
			selectedBene: { type: Array, state: true },
			lives: { type: Array, state: true }
			
		};
	}

	//  #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
	}

	/**
	 * Initialize component when loaded / Count current lives in list and set limits
	 * Resets last selected relationship
	 * @returns {void}
	 */
	_initialise() {
		this.currentTotalSpouse = this.lives.filter((life) => life.relationship === `Spouse`).length;
		this.currentTotalChild = this.lives.filter((life) => life.relationship === `Child`).length;
		this.currentTotalParent = this.lives.filter((life) => life.relationship === `Parent`).length;
		this.currentTotalExtendedFamily = this.lives.filter((life) => life.relationship !== `MainLife` && life.relationship !== `Spouse` && life.relationship !== `Child` && life.relationship !== `Parent`).length;
		this.selectedRelationship = ``;
	}

	//  #endregion LIFECYCLE OVERRIDES

	//  #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * 
	 * @returns {void} 
	 */
	_backClick() {
		this.showExtendedList = false;
		this.requestUpdate();
	}

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void}
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
		this.showExtendedList = false;
	}

	/**
	 * Switch from default list to extended family list & reset current selected relationship
	 * @returns {void} 
	 */
	_showExtendedFamilyList() {
		this.showExtendedList = true;
		this.selectedRelationship = ``;
		this.requestUpdate();
	}

	_checkDisabled(relationship) {
		if (relationship === `Spouse`) {
			return Boolean(this.currentTotalSpouse >= livesPerPolicy(`Spouse`, this.productParams) || this.lives.length === MAX_LIVES_PER_POLICY || getAgeFromDob(this.selectedBene?.dateOfBirth) > MAX_AGE_SPOUSE || getAgeFromDob(this.selectedBene?.dateOfBirth) < MIN_AGE_SPOUSE);
		} else if (relationship === `Child`) {
			return Boolean(this.currentTotalChild >= livesPerPolicy(`Child`, this.productParams) || this.lives.length === MAX_LIVES_PER_POLICY || getAgeFromDob(this.selectedBene?.dateOfBirth) > MAX_AGE_CHILD);
		} else if (relationship === `Parent`) {
			return Boolean(this.currentTotalParent >= livesPerPolicy(`Parent`, this.productParams) || this.lives.length === MAX_LIVES_PER_POLICY || getAgeFromDob(this.selectedBene?.dateOfBirth) > MAX_AGE_PARENT);
		} 
			return Boolean(this.currentTotalExtendedFamily >= livesPerPolicy(`ExtendedFamily`, this.productParams) || this.lives.length === MAX_LIVES_PER_POLICY || getAgeFromDob(this.selectedBene?.dateOfBirth) > MAX_AGE_EXTENDED);
		
	}

	//  #endregion EVENT HANDLERS

	//  #region PRIVATE METHODS

	/**
	 * agree event from dialog footer button, closes modal and navigates to cancel policy success page
	 * 
	 * @returns {void} 
	 */
	_addBeneRelationship() {
		
		this.dispatchEvent(new CustomEvent(`add`, { detail: { selectedRelationship: this.selectedRelationship } }));
	}

	//  #endregion PRIVATE METHODS

	//  #region RENDERING

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

				.modal-body-label{
					padding: 10px 10px 10px 10px;
					font-weight: bold;
					z-index: 3000
				}
				
				#dialog-body{
					height: 370px;
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
					padding: 10px; 
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
				data-automation-id="horizon-insure-add-beneficiary-only-la-dialog" header-align="left" style="--theme-modal-header-color: black">
				<div slot="body" class="modal-body">
					<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear"
						data-automation-id="horizon-insure-add-beneficiary-only-la-dialog-body">
						${this._renderDialogBody()}
					</capitec-content-box>
				</div>
				<div slot="footer" data-automation-id="horizon-insure-add-beneficiary-only-la-dialog-footer">
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`;
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
			</capitec-content-box>
		`;
	}

	/**
	 * Default list with default life options
	 * @returns {html} The html content of the component.
	 */
	_renderDefaultList() {
		return html`
		
		<capitec-radio-group>
			<capitec-card class="relationship-card">
				<capitec-radio label="Spouse" id="Spouse" data-automation-id="horizon-insure-add-life-dialog-relationship" 
					.disabled="${this._checkDisabled(`Spouse`)}" 
					hint="Only one allowed between the ages of 18 - 64 years."
					@value-changed="${() => this.selectedRelationship = `Spouse`}"></capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Child" id="Child" data-automation-id="horizon-insure-add-life-dialog-relationship" 
					.disabled="${this._checkDisabled(`Child`)}" 
					hint="Up to ${livesPerPolicy(`Child`, this.productParams)} allowed for ages 25 and younger." 
					@value-changed="${() => this.selectedRelationship = `Child`}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Parent" id="Parent" data-automation-id="horizon-insure-add-life-dialog-relationship" 
					.disabled="${this._checkDisabled(`Parent`)}" 
					hint="Up to ${livesPerPolicy(`Parent`, this.productParams)} allowed between ages of 26 - 85 years."
					@value-changed="${() => this.selectedRelationship = `Parent`}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Extended Family" data-automation-id="horizon-insure-add-life-dialog-extended" id="ExtendedFamily"
					.disabled="${this._checkDisabled(`ExtendedFamily`)}" 
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
				<capitec-radio label="Aunt/ Uncle" id="AuntUncle" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${() => this.selectedRelationship = `AuntUncle`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Child Extended" id="ExtendedChild"
					data-automation-id="horizon-insure-add-life-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${() => this.selectedRelationship = `ExtendedChild`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="First Cousin" id="Firstcousin" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${() => this.selectedRelationship = `Firstcousin`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="First Cousin's Child" id="Cousinschild"
					data-automation-id="horizon-insure-add-life-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${() => this.selectedRelationship = `Cousinschild`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Grandchild" id="Grandchild" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${() => this.selectedRelationship = `Grandchild`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Grandparent" id="Grandparent" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${() => this.selectedRelationship = `Grandparent`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Nephew/ Niece" id="NephewNiece" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${() => this.selectedRelationship = `NephewNiece`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Parent Extended" id="ExtendedParent"
					data-automation-id="horizon-insure-add-life-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${() => this.selectedRelationship = `ExtendedParent`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Parent in Law" id="ParentInLaw" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${() => this.selectedRelationship = `ParentInLaw`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Sibling" id="Sibling" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${() => this.selectedRelationship = `Sibling`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Spouse Extended" id="ExtendedSpouse"
					data-automation-id="horizon-insure-add-life-dialog-relationship" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${() => this.selectedRelationship = `ExtendedFamily`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Great Grandparent" id="Greatgrandparent"
					data-automation-id="horizon-insure-add-life-dialog-relationship" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${() => this.selectedRelationship = `Greatgrandparent`}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Great Grandchild" id="Greatgrandchild"
					data-automation-id="horizon-insure-add-life-dialog-relationship" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${() => this.selectedRelationship = `Greatgrandchild`}">
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
				${this._renderCancelOrBackButton()}
				<capitec-button class="button" slot="footer" type="primary" label="Add"
					@click="${() => this._addBeneRelationship()}"
					data-automation-id="horizon-insure-add-beneficiary-only-la-dialog-agree">
				</capitec-button>
		`;
	}

	/**
	 * Render back or cancel button depending on which view is shown (Default vs Extended Family)
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderCancelOrBackButton() {
		if (this.showExtendedList === false) {
			return html`
			<capitec-button label="Cancel" data-automation-id="horizon-insure-add-beneficiary-only-la-dialog-cancel"
				@click="${() => this._cancelClick()}">
			</capitec-button>
		`;
		}
		return html`
		<capitec-button label="Back" data-automation-id="horizon-insure-add-beneficiary-only-la-dialog-back" @click="${() => this._backClick()}">
		</capitec-button>`;


	}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-add-beneficiary-only-la-dialog`, AddBeneficiaryOnlyLaDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-add-beneficiary-only-la-dialog ... @close-modal="${this._handler}"></horizon-insure-add-beneficiary-only-la-dialog>
 *
 * @event AddBeneficiaryOnlyLaDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree event to the consuming componant when 'agree is clicked' is clicked
 *
 * @example
 * <horizon-insure-add-beneficiary-only-la-dialog ... @agree="${this._handler}"></horizon-insure-add-beneficiary-only-la-dialog>
 *
 * @event AddBeneficiaryOnlyLaDialog#agree
 * @type {Object} - N/A
 */