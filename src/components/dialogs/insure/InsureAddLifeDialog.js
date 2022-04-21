import { Component, css, html } from 'platform/elements';
import { getCoverDetailsByParams, livesPerPolicy } from 'app/utils/insureUtils';

class InsureAddLifeDialog extends Component {

	constructor() {
		super();

		this.ruleTotalSpouse = 0;
		this.ruleTotalChild = 0;
		this.ruleTotalParent = 0;
		this.ruleTotalExtendedFamily = 0;
		this.selectedRelationship = ``;
		this.showExtendedList = false;
	}

	static get properties() {
		return {
			productParams: { state: true },
		};
	}


	connectedCallback() {
		super.connectedCallback();
		this._setActiveRadioButtons();

	}

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`closeModal`, {}));
	}

	/**
	 * Add Event, get cover details and emit new life to consuming component
	 */
	_onAddClick() {
		console.log(`Adding: ${this.selectedRelationship}`);
		let coverDetails = getCoverDetailsByParams(this.selectedRelationship, this.productParams, null, this.showExtendedList);
		this.dispatchEvent(new CustomEvent(`addNewLife`, { detail: { relationship: this.selectedRelationship, coverDetails: coverDetails } }));
	}

	/**
	 * Apply active rules to conditionally disable radio buttons if limits are reached
	 */
	_setActiveRadioButtons() {
		console.log(`Total Current Lives Assured: ${this.currentLifesAssured.length}`);

		this.ruleTotalSpouse = this.currentLifesAssured.filter((life) => life.relationship === "Spouse").length;
		this.ruleTotalChild = this.currentLifesAssured.filter((life) => life.relationship === "Child").length;
		this.ruleTotalParent = this.currentLifesAssured.filter((life) => life.relationship === "Parent").length;
		this.ruleTotalExtendedFamily = this.currentLifesAssured.filter((life) => life.relationship === "ExtendedFamily").length;

		// CHeck first
		this.selectedRelationship = ``;

		console.log(`Total Spouse: ${this.ruleTotalSpouse}`);
		console.log(`Total Child: ${this.ruleTotalChild}`);
		console.log(`Total Parent: ${this.ruleTotalParent}`);
		console.log(`Total Extended Family: ${this.ruleTotalExtendedFamily}`);
	}

	_relationshipSelect(e) {
		console.log(e.detail);
		if (e.detail.new) {
			console.log(e.target.id);
			this.selectedRelationship = e.target.id;
			console.log(this.selectedRelationship);
			this.requestUpdate();
		}
	}

	/**
	 * Switch from default list to extended family list
	 */
	_showExtendedFamilyList() {
		this.showExtendedList = true;
		this.selectedRelationship = ``;
		this.requestUpdate();
	}

	static get properties() {
		return {
			currentLifesAssured: { type: Object }
		};
	}

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

				.modal-body-textfield{
					padding: 10px 10px 10px 10px;
				}

			`
		];
	}

	/**
	 * Extended family list with extra life options
	 * @returns {html} The html content of the component.
	 */
	_renderExtendedFamilyList() {
		return html`
		<capitec-radio-group>
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Spouse extended" id="Spouse-extended" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Parent extended" id="Parent-extended" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Child extended" id="Child-extended" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Great-grandparent" id="Great-grandparent" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Great-grandparent-in-law" id="Great-grandparent-in-law"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" hint="Up to 8 allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Grandparent" id="Grandparent" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Grandparent-in-law" id="Grandparent-in-law"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" hint="Up to 8 allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Parent-in-law" id="Parent-in-law" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Aunt" id="Aunt" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Uncle" id="Uncle" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Brother" id="Brother" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Sister" id="Sister" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Brother-in-law" id="Brother-in-law" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Sister-in-law" id="Sister-in-law" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="First Cousin" id="First Cousin" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Son-in-law" id="Son-in-law" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Daughter-in-law" id="Daughter-in-law" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Nephew" id="Nephew" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Niece" id="Niece" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="First cousin’s child" id="First cousin’s child"
					.disabled="${this.ruleTotalExtendedFamily >= 8}" hint="Up to 8 allowed for ages 85 and younger."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Grandchild" id="Grandchild" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Great-grandchild" id="Great-grandchild" .disabled="${this.ruleTotalExtendedFamily >= 8}"
					hint="Up to 8 allowed for ages 85 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
		</capitec-radio-group>
		`;
	}

	/**
	 * Default list with default life options
	 * @returns {html} The html content of the component.
	 */
	_renderDefaultList() {
		return html`
		<capitec-radio-group>
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Spouse" id="Spouse"
					.disabled="${this.ruleTotalSpouse >= livesPerPolicy("Spouse",
					this.productParams)}" hint="Only one allowed between the ages of 18 - 64 years."
					@value-changed="${(e) => this._relationshipSelect(e)}"></capitec-radio>
			</capitec-card>
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Child" id="Child"
					.disabled="${this.ruleTotalChild >= livesPerPolicy("Child", this.productParams)}"
					hint="Up to 8 allowed for ages 25 and younger." @value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Parent" id="Parent"
					.disabled="${this.ruleTotalParent >= livesPerPolicy("Parent",
					this.productParams)}" hint="Up to 4 allowed between ages of 26-85 years."
					@value-changed="${(e) => this._relationshipSelect(e)}">
				</capitec-radio>
			</capitec-card>
			<capitec-card style="padding: 10px; min-height: inherit; width: 100%;">
				<capitec-radio label="Extended Family" id="ExtendedFamily"
					.disabled="${this.ruleTotalExtendedFamily >= livesPerPolicy("ExtendedFamily",
					this.productParams)}" hint="Up to 8 allowed for ages 85 and younger."
					@value-changed="${(e) => this._showExtendedFamilyList(e)}">
				</capitec-radio>
			</capitec-card>
		</capitec-radio-group>
		`;
	}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderBody() {
		return html`
		<capitec-content-box style="height: 370px">
			${this.showExtendedList == false ? this._renderDefaultList() : this._renderExtendedFamilyList()}
		</capitec-content-box>
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button data-automation-id="" label="Cancel" @click="${() => this._onCancelClick()}">
				</capitec-button>
			
				<capitec-button data-automation-id="" id="id-confirm-button" type="primary" label="Add"
					@click="${() => this._onAddClick()}"
					.disabled="${this.currentLifesAssured.length >= 22 || this.selectedRelationship == ``}">
				</capitec-button>
			</capitec-group>
			`;
	}

	/**
	 * Generates the component template for desktop mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
		<capitec-modal data-automation-id="????" type="form" style="font-weight: bold;" header="Add Life Assured"
			header-align="left">
			<div slot="body" class="modal-body">
				<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear">
					${this._renderBody()}
				</capitec-content-box>
			</div>
			<div slot="footer">
				${this._renderFooter()}
			</div>
		</capitec-modal>`;
	}
}

window.customElements.define(`insure-add-life-dialog`, InsureAddLifeDialog);