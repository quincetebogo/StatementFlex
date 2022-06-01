import { Component, css, html } from 'platform/elements';

class InsureAccountSelect extends Component {

	//#region INITIALIZE

	constructor() {
		super();

		this.label = null;
		this.items = [];
		this.displayOptions = false;
		this.selectedIndex = null;
	}

	//#endregion

	//#region PROPERTIES

	/**
	 * 
	 * @property {String} label 
	 * @property {Array} items
	 * @property {boolean} displayOptions
	 * @property {integer} selectedIndex
	 * 
	 * 
	 */
	static get properties() {
		return {

			label: { type: String },
			items: { type: Array },
			displayOptions: { boolean: false },
			selectedIndex: { integer: null }
		};
	}

	//#endregion

	//#region PRIVATE METHODS


	//#endregion

	//#region EVENT HANDLERS

	/**
	 * Event that determins whether to display or hide the select options
	 */
	_showAccountOptions(){
		if (this.displayOptions == false) {
			
			this.displayOptions = true;
		} else {
			this.displayOptions = false;
		}
		
	}

	/**
	 * Event that determines which icon to display for the account
	 * 
	 * @param {*} account 
	 * @returns 
	 */
	_displayIcon(account) {
		
		if (account == "Credit"){
			return "product/credit";
		} else if (account == "Savings"){
			return "product/transact";
		}

	}

	/**
	 * Event that determines the index of the option that was selected from the options
	 * 
	 * @param {*} selected 
	 */
	_indexChange(selected) {
		this.selectedIndex = this.items.map(account => account.text).indexOf(selected);
		this.displayOptions = false;
	}

	/**
	 * Event that flips the chevron depending on whether the select box is open or closed
	 * 
	 * @returns 
	 */
	_chevronChange() {

		if (this.displayOptions == false) {
			return "system/chevron-down-action";
		} else if(this.displayOptions == true){
			return "system/chevron-up-action";
		}

	}

	//#endregion


	//#region RENDERING

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

				.select-header > capitec-content-box{
					border: 1px solid #e1e1e1;
					border-radius: 3px;
					height: 75px;
					display: flex;
					justify-content: space-between;
				}

				.select-header :hover{
					border-color: #009DE0;

				}

				.select-header :focus-within {
					border: 3px solid #009DE0;

				}


				.select-options > capitec-content-box {
					height: 40px;
					width: 560px;
					display: flex;
					border-radius: 3px;
					background-color: #fafafa
					
				}

				.all-options {
					position:absolute;
					box-shadow: 0 0 6px 0 rgba(0,0,0,0.11);
					border-radius: 3px;
					z-index: 1100;
					
				}

				.select-options :hover {
					background-color: #9de1ff
				}

				.account-label {
					position: relative; 
					left: -80px; 
					
				}

				.option-label {
					/*position: relative;
					left: -385px;*/
					font-weight: bold;
				}

				.account-amount {
					left: 62px; 
					position: relative; 
					font-weight: bold;
				}
				
				.default > capitec-content-box {
					border: 1px solid #e1e1e1;
					border-radius: 3px;
					height: 45px;
					display: flex;
					justify-content: space-between;
				}
				.default :hover{
					border-color: #009DE0;

				}

			`
		];
	}

	/**
	 * Main render point for component
	 * 
	 * @returns {html} The html content of the component.
	 */
_webTemplate() {
	return html`
		<div >	
			${this._renderHeader()}
		</div>
		<div>
			${this._renderOptions()}
		</div>

	`

	}

/**
 * Render the header section of the select box
 * 
 * @returns {html} The html content of the component.
 */
_renderHeader() {
	return html`
		${this.selectedIndex == null ? html`
			
			<div class="default">
				<capitec-content-box @click="${this._showAccountOptions}" layout="horizontal" valign="center" noScroll>
					<div>
						<capitec-label type="strong" label="${this.label}" ></capitec-label>
					</div>

					<div>
						<capitec-icon size="8px" icon="${this.displayOptions == false ? "system/chevron-down-action" : "system/chevron-up-action"}" ></capitec-icon>
					</div>

				</capitec-content-box>
			</div>

			
		` 

		: html `
		<div class="select-header">
		<capitec-content-box @click="${this._showAccountOptions}" layout="horizontal" valign="center" noScroll>
			<div> 
				<capitec-icon size="default" icon="${this._displayIcon(this.items[this.selectedIndex].code)}"></capitec-icon>
			</div>

			<div style="display: flex; flex-direction: column;">
				<capitec-label class="account-label" type="subtitle" label="${this.items[this.selectedIndex].text}" style="font-weight: bold;" ></capitec-label>
				<capitec-label class="account-label" type="subtitle" label="Available balance" ></capitec-label>
			</div>

			<div> 
				<capitec-label type="subtitle" label="R24 000.50" style="left: 62px; position: relative; font-weight: bold;"></capitec-label>
			</div>

			<div>
				<capitec-icon size="8px" icon="${this.displayOptions == false ? "system/chevron-down-action" : "system/chevron-up-action"}" ></capitec-icon>
			</div>
		</capitec-content-box>
		</div>
		`}
			

	`
}

/**
 * Render the Select box options
 * 
 * @returns The html content of the component.
 */
_renderOptions() {
	return this.displayOptions == false ? html`` :

	 html`
	<div class="all-options">
		${this.items.map(item=> html`
				
			<div class="select-options">
				<capitec-content-box @click="${() => this._indexChange(item.text)}" layout="horizontal" valign="center" noScroll>
					<div> 
						<capitec-icon size="default" icon="${this._displayIcon(item.code)}"></capitec-icon>
					</div>
					<div >
						<capitec-label class="option-label" type="subtitle" label="${item.text}" ></capitec-label>
					</div>
				</capitec-content-box>

			</div>
		`)
		}
	</div>


		<!-- <div class="select-options">
			
			<capitec-content-box layout="horizontal" valign="center" noScroll>
				<div> 
					<capitec-icon size="default" icon="product/credit"></capitec-icon>
				</div>

				<div style="display: flex; flex-direction: column;">
					<capitec-label class="option-label" type="subtitle" label="Credit Account" ></capitec-label>
					<capitec-label class="option-label" type="subtitle" label="Available balance" ></capitec-label>
				</div>

				<div> 
					<capitec-label type="subtitle" label="R24 000.50" style=" font-weight: bold;"></capitec-label>
				</div>
			</capitec-content-box>

		</div> -->


	`

}


	//#endregion

	
}

window.customElements.define(`insure-account-select`, InsureAccountSelect);