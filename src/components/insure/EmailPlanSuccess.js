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
		window.setTimeout(() => this.showSuccessAlert = false, 2000);
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
				
			}
			
			.notification {
				width: 350px;
				margin: auto;
			}

			.icon{
				position: relative;
				left: 135px;
				top: 25px;
			}
			.buttons {
				width: 150px;
				margin-left:5px;
				margin-right: 5px;
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
			<div class="notification">
				${this._renderAlert()}
			</div>

			<capitec-card id="temp-container">
				<div>
					<capitec-image src="platform/illustrations/send-documents.svg"
						style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
					<label id="temp-container-label">Funeral, (or quote) plan sent</label>
						<capitec-icon class="icon" size="medium" icon="status/success"></capitec-icon>
						<capitec-label class="spacing" type="subtitle" label="Your funeral plan document for policy number 'CF00027650' has been emailed to something@gmail.com"></capitec-label>
					<capitec-button class="buttons" label="View Plan" type="secondary"></capitec-button>
					<capitec-button class="buttons" label="Done" type="primary" @click="${() => this._onDoneClick()}"></capitec-button>
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

`}

	//#endregion



}
window.customElements.define(`horizon-insure-email-plan-success`, EmailPlanSuccess);