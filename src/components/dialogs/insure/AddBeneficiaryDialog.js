import { Component, css, html } from 'platform/elements';
import { formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { ROLE_PLAYER_RELATIONSHIP } from 'app/constants/InsureCommon';
import { getAgeFromDob } from 'app/utils/insureUtils';
import { v4 } from 'uuid';

/**
 * Dialog to add a beneficiary by selecting either an existing life assured or a relationship type
 * 
 * Events Raised 
 * -------------
 * close-modal
 * add-click
 * 
 *  
 * @export
 * @class AddBeneficiaryDialog
 * @extends {Component}
 */
class AddBeneficiaryDialog extends Component {

	// #region INITIALIZE

	/**
	 * Initialize
	 */
	constructor() {
		super();
		this.newBeneficiary = {};
		this.showExtendedRelationships = false;
		this.canAdd = false;
		this.selectedRelationship = ``;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Array} lifesAssured current list of lives assured
	 * @property {Number} roleplayerLength current amount of rolePlayers
	 * @property {Boolean} showExtendedRelationships determines whether to show the extended family sub-catagories
	 * @property {Boolean} canAdd determines whether to disable to the add button
	 *
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			lifesAssured: { type: Array, state: true },
			roleplayerLength: { type: Number, state: true },
			showExtendedRelationships: { type: Boolean, state: true },
			canAdd: { type: Boolean, state: true },
			selectedRelationship: { type: String, state: true },
			rolePlayers: { type: Array, state: true }

		};
	}

	// #endregion PROPERTIES

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles
	 * @returns {void}
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	/**
	 * Add Event, Calculate cover details parameter, emit new life object to consuming component & reset toggles
	 * @returns {void}
	 */
	_addClick() {
			const detail = {
				beneficiary: this.newBeneficiary
			};
			this.dispatchEvent(new CustomEvent(`add-click`, { detail: detail }));
	}

	/**
	 * whether to show the extended family 
	 * @returns {void}
	 */
	_showExtendedRelationships() {
		this.selectedRelationship = ``;
		this.showExtendedRelationships = true;
		this.canAdd = false;
	}

	/**
	 * back event from dialog footer when displaying extended family sub categories
	 * @returns {void}
	 */
	_backClick() {
		this.showExtendedRelationships = false;
		this.canAdd = false;
	}

	// #endregion EVENT HANDLERS

	// #region PRIVATE METHODS

	 /**
	  * event to add a beneficiary that is also a life assured
	  * @param {object} lifeAssured life Assured details of selected life assured
	  * @returns {void}
	  */
	_addExistingBeneficiaryChange(lifeAssured) {
		lifeAssured.beneficiary = true;
		lifeAssured.benefitPayout = 0;
		this.newBeneficiary = lifeAssured;
		this.canAdd = true;
		this.requestUpdate();
	}

	/**
	 * Event to add a new beneficiary that is not a life assured
	 * @param {String} relationship selected relationship type
	 * @returns {void}
	 */
	_addNewBeneficiaryChange(relationship) {
		this.selectedRelationship = relationship;

			this.newBeneficiary = {
				relationship: relationship,
				beneficiary: true,
				lifeAssured: false,
				title: ``,
				firstName: ``,
				surname: ``,
				gender: `Male`,
				benefitPayout: 0,
				coverAmount: 0,
				rowID: this.roleplayerLength,
				coverDetails: {},
				contactDetails: {
					cellphone: ``
				}
			};

			this.canAdd = true;
			this.requestUpdate();
	}

	// #endregion PRIVATE METHODS

	// #region RENDERING

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
			
			.beneficiary-radio-row{
				display: flex; 
				padding: 10px 0px 15px; 
				gap: 10px;
			}

			.new-beneficiary-radio-row{
				display: flex; 
				padding: 10px 0px 15px;
				gap: 10px;
			}
			
			.add-beneficiary{
				border: 1px solid #e1e1e1; 
				border-radius: 5px; 
				padding: 5px 5px 5px 10px;
			}

			.add-life-assured{
				border: 1px solid #e1e1e1; 
				border-radius: 5px; 
				padding: 10px; 
				width: 100%;
			}
			
			.add-new-beneficiary{
				border: 1px solid #e1e1e1; 
				width: 253px;
				border-radius: 5px; 
				padding: 17px 17px 17px 10px;
			}

			.modal-body-label{
				padding: 10px 10px 10px 10px;
				font-weight: bold;
			}

			.relationship-card{
				padding: 10px; min-height: inherit; width: 100%;
			}

			#dialog-body{ 
				height: 370px;
			}

			.relationships > horizon-product-tile {
				width: 263px;
				padding-right: 20px;
				--theme-layout-gap-spacing: 16px;
				--theme-product-tile--height: 81px;
			}

			horizon-product-tile {
				--theme-product-tile--height: 64px;
				--theme-product-tile-title-height: 20px;
				--theme-product-tile-title-font-size: 14px;
				--theme-product-tile-subtitle-height: 20px;
				--theme-product-tile-subtitle-font-size: 12px;
				--theme-product-tile-heading-margin-left: 16px;
				--theme-product-tile-heading-margin-left: 6px;
				--theme-layout-gap-spacing: 8px;
				--theme-product-tile-title-font-weight: 600;
				--theme-radio-disabled-border-color: #E1E1E1;
				--theme-radio-disabled-background-color: #F7F7F7;
			}
			
			capitec-modal {
				--theme-modal-header-background-color: #f7f7f7;
			}
			`
		];
	}

	/**
	 * Generates the component template for web mode
	 * 
	 * @returns {html} html content
	 */
	_webTemplate() {
		return html`
			${this._renderDialog()}
		`;
	}

	/**
	 * generates the appropriate modal
	 * 
	 * @returns {html} html content
	 */
	_renderDialog() {
		return html`
		${this.showExtendedRelationships === true ? this._renderExtendedRelationships() : this._renderAddBeneficiary()}
		`;
	}

	/**
	* Render default add beneficiary modal
	* 
	* @returns {html} The html content of the component.
	*/
	_renderAddBeneficiary() {
		return html`
			<capitec-modal type="alert" header="Add Beneficiary" style="--theme-modal-alert-m-l-xl-width: 840px; --theme-modal-header-color: black">
				<div slot="body">
					<capitec-label label="Life assured" type="title"></capitec-label>
					<capitec-label label="Choose from clients policy members" type="default"></capitec-label>
					<capitec-radio-group>
						<capitec-content-box style="max-height:200px; padding-left: 0px;">
							${this.lifesAssured.map((lifeAssured) => html`
								${getAgeFromDob(lifeAssured.dateOfBirth) < 18 ? html`` 
								: html`
									<div class="add-life-assured">
										<capitec-radio label="${lifeAssured.relationship?.toUpperCase() === `COUSINSCHILD` ? `First Cousin's Child` : formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[lifeAssured.relationship?.toUpperCase()])}: ${lifeAssured.firstName} ${lifeAssured.surname}"
											@value-changed="${() => this._addExistingBeneficiaryChange(lifeAssured)}">
										</capitec-radio>
									</div>
								`}
							`)}
			
						</capitec-content-box>
			
						<capitec-label label="Add a beneficiary relation" type="title"></capitec-label>
						<capitec-group class="relationships" layout="horizontal">
							<horizon-product-tile
								data-automation-id="statements-dialog-one-month-period"
								type="radio-button"
								label="Child"
								subtitle="Up to 8 allowed for ages 25 and younger"
								detail=""
								@click="${(e) => this._addNewBeneficiaryChange(`Child`)}"
								?selected="${this.selectedRelationship === `Child`}"
								>
							</horizon-product-tile>
							<horizon-product-tile
								data-automation-id="statements-dialog-one-month-period"
								type="radio-button"
								label="Extended Family"
								subtitle="Up to 8 allowed for ages 85 and younger"
								detail=""
								@click="${(e) => this._showExtendedRelationships()}"
								>
							</horizon-product-tile>
							<horizon-product-tile
								data-automation-id="statements-dialog-one-month-period"
								type="radio-button"
								label="Parent"
								subtitle="Up to 4 allowed for ages 85 and younger"
								detail=""
								@click="${(e) => this._addNewBeneficiaryChange(`Parent`)}"
								?selected="${this.selectedRelationship === `Parent`}"
								>
							</horizon-product-tile>
						</capitec-group>

						${this._renderSpouse()}
						<capitec-label label="Add new beneficiary" type="title"></capitec-label>
						<capitec-group class="relationships" layout="horizontal">
							<horizon-product-tile
								data-automation-id="statements-dialog-one-month-period"
								type="radio-button"
								label="Other"
								subtitle="A friend or acquaintance"
								detail=""
								@click="${(e) => this._addNewBeneficiaryChange(`BeneficiaryOnly`)}"
								?selected="${this.selectedRelationship === `BeneficiaryOnly`}"
								>
							</horizon-product-tile>
						</capitec-group>


					</capitec-radio-group>
				</div>
				<div slot="footer">
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderSpouse() {

		const foundSpouse = this.rolePlayers.find((life) => life.relationship === `Spouse`);

			if (isNullorEmpty(foundSpouse)) {
				return html`
					<capitec-group class="relationships" layout="horizontal">
						<horizon-product-tile
							data-automation-id="statements-dialog-one-month-period"
							type="radio-button"
							label="Spouse"
							subtitle="Only one allowed between the ages of 18 - 64 years."
							detail=""
							@click="${(e) => this._addNewBeneficiaryChange(`Spouse`)}"
							?selected="${this.selectedRelationship === `Spouse`}"
							>
						</horizon-product-tile>
					</capitec-group>
				`;
			}
			return html`
				<capitec-group class="relationships" layout="horizontal">
					<horizon-product-tile
						data-automation-id="statements-dialog-one-month-period"
						type="radio-button"
						label="Spouse"
						subtitle="Only one allowed between the ages of 18 - 64 years."
						detail=""
						?disabled= "${true}"
						@click="${(e) => this._addNewBeneficiaryChange(`Spouse`)}"
						?selected="${this.selectedRelationship === `Spouse`}"
						>
					</horizon-product-tile>
				</capitec-group>
			`;
	}

	/**
	 * Generates the modal to select an extended relationship
	 * 
	 * @returns {html} html content for extended relationships dialog
	 */
	_renderExtendedRelationships() {
		return html`
		<capitec-modal type="form" class="modal-body-label" header="Add extended family" style="--theme-modal-header-color: black"
			data-automation-id="horizon-insure-add-beneficiary-dialog" header-align="left">
			<div slot="body" class="modal-body">
				<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear"
					data-automation-id="horizon-insure-add-beneficiary-dialog-body">
				<capitec-content-box id="dialog-body">
					<capitec-radio-group>
						<capitec-card class="relationship-card">
							<capitec-radio label="Aunt/ Uncle" id="AuntUncle" data-automation-id="horizon-insure-add-beneficiary-dialog-relationship"
								.disabled="${this.ruleTotalExtendedFamily >= 8}" 
								@value-changed="${() => this._addNewBeneficiaryChange(`AuntUncle`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="Child Extended" id="ExtendedChild"
								data-automation-id="horizon-insure-add-beneficiary-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
								@value-changed="${() => this._addNewBeneficiaryChange(`ExtendedChild`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="First Cousin" id="Firstcousin" data-automation-id="horizon-insure-add-beneficiary-dialog-relationship"
								.disabled="${this.ruleTotalExtendedFamily >= 8}" 
								@value-changed="${() => this._addNewBeneficiaryChange(`Firstcousin`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="First Cousin's Child" id="Cousinschild"
								data-automation-id="horizon-insure-add-beneficiary-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
								@value-changed="${() => this._addNewBeneficiaryChange(`Cousinschild`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="Grandchild" id="Grandchild" data-automation-id="horizon-insure-add-beneficiary-dialog-relationship"
								.disabled="${this.ruleTotalExtendedFamily >= 8}" 
								@value-changed="${() => this._addNewBeneficiaryChange(`Grandchild`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="Grandparent" id="Grandparent" data-automation-id="horizon-insure-add-beneficiary-dialog-relationship"
								.disabled="${this.ruleTotalExtendedFamily >= 8}" 
								@value-changed="${() => this._addNewBeneficiaryChange(`Grandparent`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="Nephew/ Niece" id="NephewNiece" data-automation-id="horizon-insure-add-beneficiary-dialog-relationship"
								.disabled="${this.ruleTotalExtendedFamily >= 8}" 
								@value-changed="${() => this._addNewBeneficiaryChange(`NephewNiece`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="Parent Extended" id="ExtendedParent"
								data-automation-id="horizon-insure-add-beneficiary-dialog-relationship" .disabled="${this.ruleTotalExtendedFamily >= 8}"
								@value-changed="${() => this._addNewBeneficiaryChange(`ExtendedParent`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="Parent in Law" id="ParentInLaw" data-automation-id="horizon-insure-add-beneficiary-dialog-relationship"
								.disabled="${this.ruleTotalExtendedFamily >= 8}" 
								@value-changed="${() => this._addNewBeneficiaryChange(`ParentInLaw`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="Sibling" id="Sibling" data-automation-id="horizon-insure-add-beneficiary-dialog-relationship"
								.disabled="${this.ruleTotalExtendedFamily >= 8}" 
								@value-changed="${() => this._addNewBeneficiaryChange(`Sibling`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="Spouse Extended" id="ExtendedSpouse"
								data-automation-id="horizon-insure-add-beneficiary-dialog-relationship" 
								.disabled="${this.ruleTotalExtendedFamily >= 8}"
								@value-changed="${() => this._addNewBeneficiaryChange(`ExtendedSpouse`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="Great Grandparent" id="Greatgrandparent"
								data-automation-id="horizon-insure-add-beneficiary-dialog-relationship" 
								.disabled="${this.ruleTotalExtendedFamily >= 8}"
								@value-changed="${() => this._addNewBeneficiaryChange(`Greatgrandparent`)}">
							</capitec-radio>
						</capitec-card>
					
						<capitec-card class="relationship-card">
							<capitec-radio label="Great Grandchild" id="Greatgrandchild"
								data-automation-id="horizon-insure-add-beneficiary-dialog-relationship" 
								.disabled="${this.ruleTotalExtendedFamily >= 8}"
								@value-changed="${() => this._addNewBeneficiaryChange(`Greatgrandchild`)}">
							</capitec-radio>
						</capitec-card>
					</capitec-radio-group>
				</capitec-content-box>
				</capitec-content-box>
			</div>
			<div slot="footer" data-automation-id="horizon-insure-add-beneficiary-dialog-footer">
				${this._renderDialogFooter()}
			</div>
		</capitec-modal>
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
		${this._renderCancelOrBack()}
		<capitec-button .disabled="${!this.canAdd}" slot="footer" type="primary" label="Add" @click="${() => this._addClick()}">
		</capitec-button>`;
	}

	_renderCancelOrBack() {
		return this.showExtendedRelationships === true 
		? html`
		<capitec-button slot="footer" type="secondary" label="Back" @click="${() => this._backClick()}">
		</capitec-button></capitec-button>
		` 
		: html`
		<capitec-button slot="footer" type="secondary" label="Cancel" @click="${() => this._cancelClick()}">
		</capitec-button>
		`;
	}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-add-beneficiary-dialog`, AddBeneficiaryDialog);

/**
 * send a close modal event to consuming component when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-add-beneficiary-dialog ... @close-modal="${this._handler}"></horizon-insure-add-beneficiary-dialog>
 *
 * @event RemoveLifeAssuredDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree click event to consuming component when 'agree' is clicked
 *
 * @example
 * <horizon-insure-add-beneficiary-dialo ... @agree-click="${this._handler}"></horizon-insure-add-beneficiary-dialo>
 *
 * @event RemoveLifeAssuredDialog#agree-click
 * @type {Object} - N/A
 */