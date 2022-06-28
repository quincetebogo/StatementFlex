import { Component, css, html } from 'platform/elements';

/**
 * 
 * 
 * Events Raised 
 * -------------
 * navigate-back
 * agree-click
 * 
 *  
 * @export
 * @class AddBeneficiaryDialog
 * @extends {Component}
 */
class AddBeneficiaryDialog extends Component {

	//#region INITIALIZE

	/**
	 * Initialize
	 */
	constructor() {
		super();

		this.lifesAssured = [];
		this.beneficiaries = [];
		this.newbeneficiary = {};

		this.selected = false;
	
	}

	//#endregion


	//#region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 */
	 _onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	/**
	 * Add Event, Calculate cover details parameter, emit new life object to consuming component & reset toggles 
	 */
	_onAddClick() {
		
		
		
		console.log('In dialog agree event')
		console.log(this.newBeneficiary)
		this.dispatchEvent(new CustomEvent(`add-click`, {detail: this.newBeneficiary}));
	}

	/**
	 * event to add a beneficiary that is also a life assured
	 * 
	 * @param {*} lifeAssured 
	 */
	 _addBeneficiaryExistingChange(lifeAssured) {
		this.newBeneficiary= {
			name : lifeAssured.name,
			title : lifeAssured.title,
			surname :"",
			dateOfBirth: "",
			gender: lifeAssured.genderType,
			email: lifeAssured.email,
			relationship : lifeAssured.relationship,
			rowID : this.beneficiaries.length,
		}
	}

	/**
	 * event to add a new beneficiary that is not a life assured
	 * 
	 * @param {*} Relationship 
	 */
	 _addNewBeneficiaryChange(Relationship) {
		console.log(this.beneficiaries)

		if(!this.beneficiaries){
			this.beneficiaries = [];
		}
		this.newBeneficiary= {
			relationship : Relationship,
			rowID : this.beneficiaries.length,
		}
	}

	_checkselected(){

	}

	//#endregion

	//#region RENDERING

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
				justify-content: space-between; 
				padding: 10px 15px 15px 15px; 
				gap: 10px;
			}

			`
		]
	}

	/**
	 * Generates the component template for web mode
	 */
	 _webTemplate() {
		 return html `
		<capitec-modal type="alert" header="Add Beneficiary" style="--theme-modal-alert-m-l-xl-width: 840px;">
			<div slot="body" >
					${this._renderDialogBody()}
			</div>
			<div slot="footer">
				${this._renderDialogFooter()}
	 		</div>
		</capitec-modal>
		`
	 }

	 /**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {
		return html`
			<!-- style="max-height: 500px; overflow: scroll" -->
			<capitec-label label="Life Assured" type="title"></capitec-label>

			<capitec-label label="Choose from clients policy members" type="default"></capitec-label>
			<capitec-radio-group>
				<capitec-content-box style="max-height:200px">
					
					${this.lifesAssured.map((lifeAssured,index) => html`
						${index != 0 ? html`
							<div  style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px; margin: 5px; width: 70%;">
								<capitec-radio label="${lifeAssured.relationship}: Name" @value-changed="${() => this._addBeneficiaryExistingChange(lifeAssured)}">
								</capitec-radio>
							</div>
						` : html ``}
					`)}
					
				</capitec-content-box>

				<capitec-label label="Add Beneficiary" type="title"></capitec-label>

				<div class="beneficiary-radio-row">
					<capitec-radio label="Child" hint="Up to 8 allowed for ages 25 and younger" 
						style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px; margin: 5px;" @value-changed="${() => this._addNewBeneficiaryChange("Child")}">
					</capitec-radio>
					<capitec-radio label="Extended Family" hint="Up to 8 allowed for ages 85 and younger"
						style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px; margin: 5px;" @value-changed="${() => this._addNewBeneficiaryChange("Extended Family")}">
					</capitec-radio>
					<capitec-radio label="Parent" hint="Up to 4 allowed for ages 85 and younger"
						style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 10px; margin: 5px;" @value-changed="${() => this._addNewBeneficiaryChange("Parent")}">
					</capitec-radio>
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
			</capitec-button>
			
			`; 
	}

	 //#endregion

}

window.customElements.define(`add-beneficiary-dialog`, AddBeneficiaryDialog);

/**
 * send a close modal event to consuming component when 'cancel' is clicked
 *
 * @example
 * <remove-life-assured-dialog ... @close-modal="${this._handler}"></remove-life-assured-dialog>
 *
 * @event RemoveLifeAssuredDialog#close-moda
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