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

		this.showEmailPlanDialog = false;
	
	}

//#endregion

//#region PROPERTIES

	
	static get properties() {
		return {
			
			showEmailPlanDialog: {type: Boolean, state: true},
			contractReference: {type: String, state: true}
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
 * Event to open the email plan dialog
 */
_openEmailPlanDialog(){
	this.showEmailPlanDialog = true;
}

/**
 * Event to close the email plan dialog
 */
_closeEmailPlanDialog(){
	this.showEmailPlanDialog = false;
}
/**
 * event to navigate to the email success page
 */
_goToEmailSuccess(){
	this.dispatchEvent(new CustomEvent(`navigate-to-email-success`, {
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
			${this._renderDialogs()}
		`
	}
/**
 * Render Dialogs
 * 
 * @returns 
 */
	_renderDialogs(){
		return html`
		${this._renderEmailPlanDialog()}
		`
	}

	/**
	 * Render the content HTML for the component
	 * @returns {html}
	 */
	 _renderContent() {
		return html`
			<capitec-card id="temp-container">
				<div>
					<capitec-image src="platform/illustrations/application.svg"
						style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
					<label id="temp-container-label">The policy has been cancelled</label>
					<capitec-label class="spacing" type="subtitle" label="You currently have 2 active policies"></capitec-label>
					<capitec-button label="Email" type="primary" @click="${() => this._openEmailPlanDialog()}"
						data-automation-id="">
					</capitec-button>
				</div>
			</capitec-card>
		`
	}
	/**
	 * Render the email plan dialog
	 * @returns 
	 */
	_renderEmailPlanDialog(){
		return this.showEmailPlanDialog == false ? `` 
		: html`
		<insure-email-plan-dialog @close-modal="${(e) => this.showEmailPlanDialog = false}"
			@send-email="${(e) => this._goToEmailSuccess()}" .contractReference=${this.contractReference}>
		</insure-email-plan-dialog>
		`
	}

	//#endregion



}
window.customElements.define(`insure-cancel-policy-success`, CancelPolicySuccess);

/**
 * Navigate back to client policies when 'Issue Policy' is clicked
 *
 * @example
 * <insure-cancel-policy-success ... @navigate-back="${this._handler}"></insure-cancel-policy-success>
 *
 * @event CancelPolicySuccess#navigate-back
 * @type {Object} - N/A
 */
