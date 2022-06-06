import { Component, css, html } from 'platform/elements';

/**
 * Cancel policy success page shows you how many policies you still have active and allows you to navigate to issue policy
 * 
 * Events Raised 
 * -------------
 * navigate-back
 *  
 * @export
 * @class CancelPolicySuccess
 * @extends {Component}
 */
class CancelPolicySuccess extends Component {

//#region INITIALIZE

	constructor() {
		super();
	}

//#endregion

//#region PROPERTIES

	/**
	 * @property {Boolean} showSuccessAlert determines when to show the Success alert
	 * 
	 * @readonly
	 * @static
	 */
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
 _onIssuePolicyClick() {
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

			.notification {
				width: 350px;
				margin: auto;
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
					<capitec-image src="platform/illustrations/application.svg"
						style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
					<label id="temp-container-label">The policy has been cancelled</label>
					<capitec-label class="spacing" type="subtitle" label="You currently have 2 active policies"></capitec-label>
					<capitec-button label="Issue Policy" type="primary" @click="${() => this._onIssuePolicyClick()}"></capitec-button>
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
window.customElements.define(`horizon-insure-cancel-policy-success`, CancelPolicySuccess);

/**
 * Navigate back to client policies when 'Issue Policy' is clicked
 *
 * @example
 * <horizon-insure-cancel-policy-success ... @navigate-back="${this._handler}"></horizon-insure-cancel-policy-success>
 *
 * @event CancelPolicySuccess#navigate-back
 * @type {Object} - N/A
 */
