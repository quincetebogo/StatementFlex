import { Component, css, html } from 'platform/elements';

/**
 * Email Plan success page confirms that the funeral plan document has been emailed to the specified email address
 * 
 * Events Raised 
 * -------------
 * navigate-back
 *  
 * @export
 * @class EmailPlanSuccess
 * @extends {Component}
 */
class EmailPlanSuccess extends Component {

// #region INITIALIZE

	constructor() {
		super();
	}

// #endregion

// #region PROPERTIES

	/**
	 * @property {Boolean} showSuccessAlert determines whether to show the success alert
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			showSuccessAlert: { type: Boolean, state: true },
			contractReference: { type: String, state: true },
			confirmedEmail: { type: Object, state: true }
		};
	}

// #endregion

// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	 connectedCallback() {
		super.connectedCallback();
		window.setTimeout(() => this.showSuccessAlert = false, 2000);
	}

	// #endregion

// #region PRIVATE METHODS

// #endregion

// #region EVENT HANDLERS

/**
 * Navigate to Landing
 * @returns {null} null
 */
 _onDoneClick() {
	this.dispatchEvent(new CustomEvent(`navigate-back`, {
		detail: {
		}
	}));
}

/**
 * Navigate to policy summary
 * @returns {null} null
 */
 _onViewPlanClick() {
	this.dispatchEvent(new CustomEvent(`navigate-to-policy-summary`, {
		detail: { policyContractReference: this.contractReference }
	}));
}

// #endregion

// #region RENDERING

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

			.container{
				min-height: 650px;
				text-align: center;
				padding-top: 100px;
			}

			.label{
				font-weight: bold;
				font-size: 24px;
			}
			
			.spacing { 
				display: inline-block;
				margin-bottom: 30px;
				
			}
			
			.notification {
				width: 350px;
				margin: auto;
			}

			.icon{
				display: inline-block;
				position: relative;
				/*left: 135px;*/
				top: 9px;
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
		`;
	}

	/**
	 * Render the content HTML for the component
	 * @returns {html} html content
	 */
	 _renderContent() {
		return html`
			<div class="notification" data-automation-id="insure-email-plan-success-alert">
				${this._renderAlert()}
			</div>

			<capitec-card class="container">
				<div>
					<capitec-image src="platform/illustrations/send-documents.svg"
						style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
					<capitec-label class="label" type="title" label="Documentation sent"></capitec-label>
					<div>
						<capitec-icon class="icon" size="medium" icon="status/success"></capitec-icon>
						<capitec-label class="spacing" type="subtitle" label="Your documentation for policy number '${this.contractReference}' has been emailed to ${this.confirmedEmail}"></capitec-label>
					</div>
					<capitec-button class="buttons" label="View Plan" type="secondary" @click="${() => this._onViewPlanClick()}"></capitec-button>
					<capitec-button class="buttons" label="Done" type="primary" @click="${() => this._onDoneClick()}"
						data-automation-id="insure-email-plan-success-done">
					</capitec-button>
				</div>
			</capitec-card>
		`;
	}

/**
 * Renders the Email Sent alert
 * @returns {html} html content
 */
_renderAlert() {
	return this.showSuccessAlert === false ? html``
	: html`
		<capitec-toast
			class="toast"
			type="success"
			Header="Funeral Plan Sent"
			layout = "vertical"
			detail = "Funeral plan was sent"
			@click = "${() => this.showSuccessAlert = false}">
		</capitec-toast>

	`;
}

	// #endregion

}
window.customElements.define(`insure-email-plan-success`, EmailPlanSuccess);

/**
 * Navigate back to client policies when 'Done' is clicked
 *
 * @example
 * <insure-email-plan-success ... @navigate-back="${this._handler}"></insure-email-plan-success>
 *
 * @event EmailPlanSuccess#navigate-back
 * @type {Object} - N/A
 */