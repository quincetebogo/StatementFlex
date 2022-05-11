import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatDate } from 'app/utils/channelServiceUtilities';

class PayPremiumDialog extends Component {

//#region INITIALIZE

constructor() {
	super();

	this.checked = false;
	this.date = "";
}

//#endregion

//#region PROPERTIES

	/**
	 * 
	 * @readonly
	 * @static
	 */
	 static get properties() {
		return {
			clientArrears: { type: Object },
			payArrears: {type: Object},
			checked: {boolean: false},
		};
	}

//#endregion

//#region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	 connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	//#endregion

	//#region PRIVATE METHODS

	/**
	 * Initialize component when loaded / Count current lives in list and set limits
	 * Resets last selected relationship
	 */
	 _initialise() {
		this.payArrears = {};
		this.payArrears.arrears = [];
		this.payArrears.contractReference = "";
		this.payArrears.fromAccount = "";
		this.payArrears.cifNumber = "";

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
	_onPayClick() {

		this.dispatchEvent(new CustomEvent(`pay-arrears`, {detail: this.payArrears}));
	}

	_checkedChange(outstanding, e) {
		

		this._addSelected(outstanding, e);

		console.log(this.payArrears.arrears);

		if (this.payArrears.arrears.length > 0) {
			this.checked = true
		} else {
			this.checked = false;
		}
		

	}

	_addSelected(selected, e) {
		if (e.detail.new == true) {
			this.payArrears.arrears.push({
			dueDate: selected.dueDate,
			amount: selected.amount,
			objectID: selected.objectID,
			})
		} else {
			const index = this.payArrears.arrears.map(object => object.objectID).indexOf(selected.objectID);
			this.payArrears.arrears.splice(index, 1);
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
		
		.buttons{
			width: 100px;
		}

		.checkbox{
			border: 1px solid #e1e1e1;
			border-radius: 5px;
			padding: 10px;
		}

		.modal-body-label{
			padding: 10px 10px 10px 10px;
			font-weight: bold;
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
			<capitec-modal data-automation-id="????" type="form" class="modal-body-label" header="Pay Arrears (${this.clientArrears.contractReference})"
			header-align="left">
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
		
			<capitec-label type="subtitle" label="Choose payment method">
			</capitec-label>
			
			<capitec-select 
				label="Choose an account"  display-field="text" id-field="code">
			</capitec-select>
			
			<capitec-label type="subtitle" label="Arrear amount">
			</capitec-label>

			<capitec-check-group>
						${this.clientArrears.arrears.map((outstanding, index) => html`
							${index != 0 || index == 0 ? html`
								<capitec-check class="checkbox" label=" ${formatDate(outstanding.dueDate, 'MM yyyy')} | ${formatCurrency(outstanding.amount)}"
								@value-change=" ${(e) => this._checkedChange(outstanding,e)}">
								</capitec-check>
							` : html``}
							`)}
			</capitec-check-group>
		`;
		}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button class="buttons" data-automation-id="" label="Cancel" @click="${() => this._onCancelClick()}">
				</capitec-button>
			
				<capitec-button class="buttons" data-automation-id="" id="id-confirm-button" type="primary" label="Pay"
					@click="${() => this._onPayClick()}" .disabled=${this.checked == false}>
				</capitec-button>
			</capitec-group>`;
		
		}
	

//#endregion


}

window.customElements.define(`pay-premium-dialog`, PayPremiumDialog);