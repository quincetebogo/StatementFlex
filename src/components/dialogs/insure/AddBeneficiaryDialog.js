import { Component, css, html } from 'platform/elements';
import { ROLE_PLAYER_RELATIONSHIP } from 'app/constants/InsureCommon';
import { formatStringAsPascalCase } from 'app/utils/channelServiceUtilities';
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
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Array} lifesAssured current list of lives assured
	 *
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			lifesAssured: { type: Array, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles
	 * @returns {void}
	 */
	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	/**
	 * Add Event, Calculate cover details parameter, emit new life object to consuming component & reset toggles
	 * @returns {void}
	 */
	_onAddClick() {
		const detail = {
			beneficiary: this.newBeneficiary
		};
		this.dispatchEvent(new CustomEvent(`add-click`, { detail: detail }));
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
	}

	/**
	 * Event to add a new beneficiary that is not a life assured
	 * @param {String} relationship selected relationship type
	 * @returns {void}
	 */
	_addNewBeneficiaryChange(relationship) {
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
			recordID: v4(),
			coverDetails: {},
			contactDetails: {
				cellphone: ``
			}
		};
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
		<capitec-modal type="alert" header="Add Beneficiary" style="--theme-modal-alert-m-l-xl-width: 840px;">
			<div slot="body">
				${this._renderDialogBody()}
			</div>
			<div slot="footer">
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
			<!-- style="max-height: 500px; overflow: scroll" -->
			<capitec-label label="Life assured" type="title"></capitec-label>
			<capitec-label label="Choose from clients policy members" type="default"></capitec-label>
			<capitec-radio-group>
				<capitec-content-box style="max-height:200px; padding-left: 0px;">
					${this.lifesAssured.map((lifeAssured) => html`
					<div class="add-life-assured">
						<capitec-radio label="${lifeAssured.relationship?.toUpperCase() === `COUSINSCHILD` ? `First Cousin's Child` : formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[lifeAssured.relationship?.toUpperCase()])}: ${lifeAssured.firstName} ${lifeAssured.surname}"
							@value-changed="${() => this._addExistingBeneficiaryChange(lifeAssured)}">
						</capitec-radio>
					</div>
					`)}
			
				</capitec-content-box>
			
				<capitec-label label="Add a beneficiary relation" type="title"></capitec-label>
				<div class="beneficiary-radio-row">
					<div class="add-beneficiary">
						<capitec-radio label="Child" hint="Up to 8 allowed for ages 25 and younger"
							@value-changed="${() => this._addNewBeneficiaryChange(`Child`)}">
						</capitec-radio>
					</div>
					<div class="add-beneficiary">
						<capitec-radio label="Extended Family" hint="Up to 8 allowed for ages 85 and younger"
							@value-changed="${() => this._addNewBeneficiaryChange(`ExtendedFamily`)}">
						</capitec-radio>
					</div>
					<div class="add-beneficiary">
						<capitec-radio label="Parent" hint="Up to 4 allowed for ages 85 and younger"
							@value-changed="${() => this._addNewBeneficiaryChange(`Parent`)}">
						</capitec-radio>
					</div>
				</div>

				<capitec-label label="Add new beneficiary" type="title"></capitec-label>
				<div class="new-beneficiary-radio-row" >
					<div class="add-new-beneficiary">
						<capitec-radio label="Not related" hint="A friend or acquaintance"
							@value-changed="${() => this._addNewBeneficiaryChange(`BeneficiaryOnly`)}">
						</capitec-radio>
					</div>
				</div>

			</capitec-radio-group>
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
		<capitec-button slot="footer" type="clear" label="Cancel" @click="${() => this._onCancelClick()}">
		</capitec-button>
		<capitec-button slot="footer" type="clear" label="Add" @click="${() => this._onAddClick()}">
		</capitec-button>`;
	}

	// #endregion RENDERING

}

window.customElements.define(`add-beneficiary-dialog`, AddBeneficiaryDialog);

/**
 * send a close modal event to consuming component when 'cancel' is clicked
 *
 * @example
 * <remove-life-assured-dialog ... @close-modal="${this._handler}"></remove-life-assured-dialog>
 *
 * @event RemoveLifeAssuredDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree click event to consuming component when 'agree' is clicked
 *
 * @example
 * <remove-life-assured-dialog ... @agree-click="${this._handler}"></remove-life-assured-dialog>
 *
 * @event RemoveLifeAssuredDialog#agree-click
 * @type {Object} - N/A
 */