import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

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

// #endregion INITIALIZE

// #region PROPERTIES

	/**
	 * @property {Boolean} showSuccessAlert determines whether to show the success alert
	 * @property {String} contractReference policy contract reference
	 * @property {Object} confirmedEmail confirmed email
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

// #endregion PROPERTIES

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

// #endregion PRIVATE METHODS

// #region EVENT HANDLERS

/**
 * Navigate to Landing
 * @return {void} 
 */
 _doneClick() {
	this.dispatchEvent(new CustomEvent(`navigate-back`, {
		detail: {
		}
	}));
}

/**
 * Navigate to policy summary
 * @return {void} 
 */
 _viewPlanClick() {
	this.dispatchEvent(new CustomEvent(`navigate-to-policy-summary`, {
		detail: { policyContractReference: this.contractReference }
	}));
}

// #endregion EVENT HANDLERS

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
			
			${INSURE_CSS}

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

			.buttons {
				width: 150px;
				margin-left:5px;
				margin-right: 5px;
			}

			.success-message {
				display: flex;
				align-items: flex-start;
				justify-content: center;
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

					<div class="success-message">
						<capitec-icon size="medium" icon="status/success"></capitec-icon>
						<capitec-label class="spacing" type="subtitle" label="Your documentation for policy number '${this.contractReference}' has been emailed to ${this.confirmedEmail}"></capitec-label>
					</div>

					<capitec-button class="buttons" label="View Plan" type="secondary" @click="${() => this._viewPlanClick()}"></capitec-button>
					<capitec-button class="buttons" label="Done" type="primary" @click="${() => this._doneClick()}"
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
			Header="Successful"
			layout = "vertical"
			detail = "Document sent successfully"
			@click = "${() => this.showSuccessAlert = false}">
		</capitec-toast>

	`;
}

	// #endregion RENDERING

}
window.customElements.define(`horizon-insure-email-plan-success`, EmailPlanSuccess);

/**
 * Navigate back to client policies when 'Done' is clicked
 *
 * @example
 * <horizon-insure-email-plan-success ... @navigate-back="${this._handler}"></horizon-insure-email-plan-success>
 *
 * @event EmailPlanSuccess#navigate-back
 * @type {Object} - N/A
 */

/**
 * Navigate to policy Summary
 *
 * @example
 * <horizon-insure-email-plan-success ... @navigate-to-policy-summary="${this._handler}"></horizon-insure-email-plan-success>
 *
 * @event EmailPlanSuccess#navigate-back
 * @type {Object} - N/A
 */