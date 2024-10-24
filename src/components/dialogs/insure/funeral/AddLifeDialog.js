import { Component, css, html } from 'platform/elements';
import { INSURE_CALLER_PAGE, ROLE_PLAYER_RELATIONSHIP } from 'app/constants/InsureCommon';
import { formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { livesPerPolicy, refreshRelationshipCoverDetails } from 'app/utils/insureUtils';
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

		this.callerPage = 0;
		this.beneToAdd = {};
		this.showAddBeneficiaryOnly = false;
		this.beneOnlyToAdd = {};
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
			currentLifesAssured: { type: Array },
			productParams: { type: Object },
			showExtendedList: { type: Boolean, state: true }
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
		if (this.selectedRelationship === `Spouse` || this.selectedRelationship === `Parent` || this.selectedRelationship === `Child`) {
			this.showExtendedList = false;
		}
		
		if (Object.keys(this.beneToAdd).length !== 0 && (this.beneToAdd?.relationship !== `Spouse` || this.beneToAdd?.relationship !== `Parent` || this.beneToAdd?.relationship !== `Child`)) {
			this.showExtendedList = true;
		}

		if (this.selectedRelationship === `BeneficiaryOnly`) {
			this.showExtendedList = false;
			this.showAddBeneficiaryOnly = true;
			return;
		}
		const coverDetails = refreshRelationshipCoverDetails(this.selectedRelationship, this.productParams, 0, 0, ``, this.showExtendedList, true);
		this.dispatchEvent(new CustomEvent(`add-new-life`, { detail: { relationship: this.selectedRelationship, coverDetails: coverDetails, beneficiary: this.beneToAdd } }));
		this.showExtendedList = false;
	}

	/**
	 * Set the newly selected relationship type if value has changed
	 * @param {event} event Contains old and new value from selected radio button
	 * @returns {void} 
	 */
	_relationshipSelect(event) {
		this.showAddBeneficiaryOnly = false;
		this.beneToAdd = {};
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

	_addExistingBeneficiary(life, event) {
		this.showAddBeneficiaryOnly = false;

		if (life.relationship === `BeneficiaryOnly`) {
			this.beneOnlyToAdd = life;
			this.showAddBeneficiaryOnly = true;
		}

		if (event.detail.new) {
			this.selectedRelationship = life.relationship;
			this.requestUpdate();
			this.beneToAdd = life;
		}
	}

	_checkCurrentTotal(life) {
		const currentLifeAssuredLength = this.currentLifesAssured.filter((life) => life.lifeAssured === true).length;

		if (life.relationship === `Spouse`) {
			if (this.currentTotalSpouse >= livesPerPolicy(`Spouse`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY) {

				let count = 0;
				this.currentLifesAssured.forEach(lifes => {
					if (lifes.relationship === `Spouse` && life.lifeAssured === true) {
						count++;
					}
				});
				if (count !== 1) {
					return true;
				}
			}
		} else if (life.relationship === `Parent`) {
			if (this.currentTotalParent >= livesPerPolicy(`Parent`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY) {
				return true;
			}
		} else if (life.relationship === `Child`) {
			if (this.currentTotalChild >= livesPerPolicy(`Child`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY) {
				return true;
			}
		} else if (life.relationship !== `Spouse` && life.relationship !== `Parent` && life.relationship !== `Child` && life.relationship !== `BeneficiaryOnly`) {
			if (this.currentTotalExtendedFamily >= livesPerPolicy(`ExtendedFamily`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY) {
				return true;
			}
		}
		return false;
	}

	_addNewBeneOnly(event) {
		this.showAddBeneficiaryOnly = false;
		this.beneToAdd = this.beneOnlyToAdd;
		this.selectedRelationship = event.detail.selectedRelationship;
		this._addClick();
	}

	_closeBeneOnlyDialog() {
		this.showAddBeneficiaryOnly = false;
		this.requestUpdate();
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
					height: 424px;
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
		${this._renderAddBeneficiaryOnly()}
		<capitec-modal type="form" class="modal-body-label" header="Add Life Assured"
			data-automation-id="horizon-insure-add-life-dialog" header-align="left" style="--theme-modal-header-color: black">
			<div slot="body" class="modal-body">
				<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear"
					data-automation-id="horizon-insure-add-life-dialog-body">
					${this._renderDialogBody()}
				</capitec-content-box>
			</div>
			<div slot="footer" data-automation-id="horizon-insure-add-life-dialog-footer">
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
		${this.callerPage === INSURE_CALLER_PAGE.UPDATE_PLAN ? html`
			<capitec-label label="Add existing beneficiary" type="title" class="title"></capitec-label>
			${this.currentLifesAssured.filter((life) => life.lifeAssured === false && life.beneficiary === true).length === 0 ? html`
				<capitec-label label="No existing beneficiaries to add" type="subtitle" class="subtitle"></capitec-label>
			` : html``}
			${this.currentLifesAssured.map((life) => html`
				${life.lifeAssured === true || (life.lifeAssured === false && life.beneficiary === false)? html``
				: html`
					<capitec-card class="relationship-card">
						<capitec-radio label="${life.relationship?.toUpperCase() === `COUSINSCHILD` ? `First Cousin's Child` : formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[life.relationship?.toUpperCase()])}: ${life.firstName} ${life.surname}"
							@value-changed= "${(e) => this._addExistingBeneficiary(life, e)}"
							.disabled= "${this._checkCurrentTotal(life)}">
						</capitec-radio>
					</capitec-card>
				`}
			`)}
			<capitec-label label="Add new life assured" type="title" class="title"></capitec-label>
		`
				: html``}
		
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Spouse" id="Spouse" data-automation-id="horizon-insure-add-life-dialog-relationship" 
					.disabled="${this.currentTotalSpouse >= livesPerPolicy(`Spouse`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY}" 
					hint="Only one allowed between the ages of 18 - 64 years."
					@value-changed="${(e) => this._relationshipSelect(e)}"></capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Child" id="Child" data-automation-id="horizon-insure-add-life-dialog-relationship" 
					.disabled="${this.currentTotalChild >= livesPerPolicy(`Child`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY}" 
					hint="Up to ${livesPerPolicy(`Child`, this.productParams)} allowed for ages 25 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Parent" id="Parent" data-automation-id="horizon-insure-add-life-dialog-relationship" 
					.disabled="${this.currentTotalParent >= livesPerPolicy(`Parent`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY}" 
					hint="Up to ${livesPerPolicy(`Parent`, this.productParams)} allowed between ages of 26 - 85 years."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card class="relationship-card">
				<capitec-radio label="Extended Family" data-automation-id="horizon-insure-add-life-dialog-extended" id="ExtendedFamily"
					.disabled="${this.currentTotalExtendedFamily >= livesPerPolicy(`ExtendedFamily`, this.productParams) || currentLifeAssuredLength === MAX_LIVES_PER_POLICY}" 
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
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Child Extended" id="ExtendedChild"
					data-automation-id="horizon-insure-add-life-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="First Cousin" id="Firstcousin" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="First Cousin's Child" id="Cousinschild"
					data-automation-id="horizon-insure-add-life-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Grandchild" id="Grandchild" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger." 
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Grandparent" id="Grandparent" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Nephew/ Niece" id="NephewNiece" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Parent Extended" id="ExtendedParent"
					data-automation-id="horizon-insure-add-life-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Parent in Law" id="ParentInLaw" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Sibling" id="Sibling" data-automation-id="horizon-insure-add-life-dialog-relationship"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" 
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Spouse Extended" id="ExtendedSpouse"
					data-automation-id="horizon-insure-add-life-dialog-relationship" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Great Grandparent" id="Greatgrandparent"
					data-automation-id="horizon-insure-add-life-dialog-relationship" 
					.disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to ${livesPerPolicy(`ExtendedFamily`, this.productParams)} allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card class="relationship-card">
				<capitec-radio label="Great Grandchild" id="Greatgrandchild"
					data-automation-id="horizon-insure-add-life-dialog-relationship" 
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

	_renderAddBeneficiaryOnly() {
		return this.showAddBeneficiaryOnly === false ? html``
			: html`
			<horizon-insure-add-beneficiary-only-la-dialog
			.lives= "${this.currentLifesAssured}"
			.selectedBene="${this.beneOnlyToAdd}"
			.productParams="${this.productParams}"
			@close-modal = "${() => this._closeBeneOnlyDialog()}"
			@add = "${(e) => this._addNewBeneOnly(e)}"
			>

			</horizon-insure-add-beneficiary-only-la-dialog>
		`;


	}

	// #endregion EVENT HANDLERS
}

window.customElements.define(`horizon-insure-add-life-dialog`, AddLifeDialog);

/**
 * Send the newly selected relationship with cover details to consuming component when 'Add' is clicked
 *
 * @example
 * <horizon-insure-add-life-dialog ... @add-new-life="${this._handler}"></horizon-insure-add-life-dialog>
 *
 * @event AddLifeDialog#add-new-life
 * @type {Object} - N/A
 */

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-add-life-dialog ... @close-modal="${this._handler}"></horizon-insure-add-life-dialog>
 *
 * @event AddLifeDialog#add-new-life
 * @type {Object} - N/A
 */