import { Component, css, html } from 'platform/elements';

class EmailPlanSuccess extends Component {

//#region INITIALIZE

	constructor() {
		super();
	}

//#endregion

//#region PROPERTIES

	static get properties() {
		return {
			showSuccessAlert: {type: Boolean, state: true}
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
	}

	//#endregion

//#region PRIVATE METHODS

//#endregion

//#region EVENT HANDLERS

/**
 * Navigate to Landing
 */
 _onDoneClick() {
	this.dispatchEvent(new CustomEvent(`navigate-back`, {
		detail: {
		}
	}));
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
			
			.insure-title-bar{
				margin-bottom: 0px; 
				border-top-left-radius: 5px; 
				border-top-right-radius: 5px;
				
			}

			#temp-container{
				min-height: 650px;
				text-align: center;
				padding-top: 100px;
			}

			#temp-container-label{
				font-weight: bold;
				font-size: 24px;
			}
			
			.spacing { 
				margin-bottom: 30px;
				margin-top: 20px;
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
			${this._renderContent()}
		`
	}

	/**
	 * Render the content HTML for the component
	 * @returns {html}
	 */
	 _renderContent() {
		return html`

			${this._renderAlert()}

			<capitec-card id="temp-container">
				<div>
					<capitec-image src="platform/illustrations/send-documents.svg"
						style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
					<label id="temp-container-label">Funeral, (or quote) plan sent</label>
					<capitec-label class="spacing" type="subtitle" label="Your funeral plan document for policy number 'CF00027650' has been emailed to something@gmail.com"></capitec-label>
					<capitec-button label="Isssue Policy" type="secondary"></capitec-button>
					<capitec-button label="Isssue Policy" type="primary" @click="${() => this._onDoneClick()}"></capitec-button>
				</div>
			</capitec-card>
		`
	}

	/**
 * Renders the Email Sent alert
 * @returns {html}
 */
_renderAlert(){
	return this.showSuccessAlert == false ? html``
	: html`
		<capitec-toast
			class="toast"
			type="success"
			Header="Funeral Plan Sent"
			layout = "vertical"
			detail = "Funeral plan was sent"
			@click = "${() => this.showSuccessAlert = false}"
			closable>
		</capitec-toast>
		${window.setTimeout(() => this.showSuccessAlert = false, 2000)};
`}

	//#endregion



}
window.customElements.define(`horizon-insure-email-plan-success`, EmailPlanSuccess);