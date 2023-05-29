import { Component, css, html } from 'platform/elements';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { INSURE_CALLER_PAGE } from 'app/constants/InsureCommon';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

import 'app/components/dialogs/insure/InsureEmailDialog';

/**
 * Cancel policy success page shows you how many policies you still have active and allows you to navigate to issue policy
 * 
 * Events Raised 
 * -------------
 * navigate-to-summary
 * send-email
 *  
 * @export
 * @class CancelPolicySuccess
 * @extends {Component}
 */
class CancelPolicySuccess extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.horizonIncidentManager = HorizonIncidentManager.getInstance();

		this.showEmailPlanDialog = false;
		this.contractReference = ``;
		this.titleMessage = ``;
	}

	// #endregion

	// #region PROPERTIES

	/**
	 * @property {Boolean} showEmailPlanDialog - Show flag for email address & send dialog
	 * @property {String} contractReference - policy contract reference
	 * @property {String} titleMessage - title of send email popup.
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {

			showEmailPlanDialog: { type: Boolean, state: true },
			contractReference: { type: String, state: true },
			titleMessage: { type: String, state: true }
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

		this._updateIncidentState();
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	_updateIncidentState() {
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS


	/**
	 * Event to open the email plan dialog
	 * @return {void} 
	 */
	_openEmailPlanDialog() {
		this.titleMessage = `Email Funeral Plan (${this.contractReference})`;

		this.showEmailPlanDialog = true;
	}

	/**
	 * Invoke this function when Send button is clicked on Email Popup
	 * 
	 * @param {*} emailAddress email address
	 * @return {void} 
	 */
	_sendEmail(emailAddress) {
		this.callerPage = INSURE_CALLER_PAGE.CANCEL_POLICY;

		this.dispatchEvent(new CustomEvent(`send-email`, { detail: { emailId: emailAddress, callerPage: this.callerPage } }));
	}

	/**
	 * Navigate to client summary
	 * @returns {void}
	 */
	_navigateToSummary() {
		this.dispatchEvent(new CustomEvent(`navigate-to-summary`, {
			detail: {
			}
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
				margin-bottom: 30px;
			}
			
			.spacing { 
				margin-bottom: 30px;
				margin-top: 20px;
			}

			.notification {
				width: 350px;
				margin: auto;
			}

			.button-row{
				display: flex; 
				justify-content: center;
				padding: 10px 15px 15px 15px; 
				gap: 10px;
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
		`;
	}

	/**
	 * Render Dialogs
	 * @return {html} html
	 */
	_renderDialogs() {
		return html`
		${this._renderEmailPlanDialog()}
		`;
	}

	/**
	 * Render the content HTML for the component
	 * @returns {html} html content
	 */
	_renderContent() {
		return html`
			<capitec-card class="container">
				<div>
					<capitec-image src="platform/illustrations/application.svg"
						style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
					<capitec-label class="label" type="title" label="The policy has been cancelled"></capitec-label>
					<div class="button-row">
						<capitec-button label="Done" class="capitec-button-medium" type="secondary" @click="${() => this._navigateToSummary()}"
							data-automation-id="">
						</capitec-button>
						<capitec-button label="Email" class="capitec-button-medium" type="primary" @click="${() => this._openEmailPlanDialog()}"
							data-automation-id="">
						</capitec-button>
					</div>
				</div>
			</capitec-card>
		`;
	}

	/**
	 * Render the email plan dialog
	 * @return {html} html
	 */
	_renderEmailPlanDialog() {
		return this.showEmailPlanDialog === false ? ``
			: html`
			<horizon-insure-email-dialog 
				.contractReference = "${this.contractReference}" 
				.titleMessage = "${this.titleMessage}"
				@close-modal="${() => this.showEmailPlanDialog = false}"
				@send-email = "${(emailAddress) => this._sendEmail(emailAddress)}">
			</horizon-insure-email-dialog>
		`;
	}

	// #endregion

}
window.customElements.define(`horizon-insure-cancel-policy-success`, CancelPolicySuccess);

/**
 * Navigate back to client policies 
 *
 * @example
 * <horizon-insure-cancel-policy-success ... @navigate-to-summary="${this._handler}"></horizon-insure-cancel-policy-success>
 *
 * @event CancelPolicySuccess#navigate-back
 * @type {Object} - N/A
 */

/**
 * Open email dialog
 *
 * @example
 * <horizon-insure-cancel-policy-success ... @send-email="${this._handler}"></horizon-insure-cancel-policy-success>
 *
 * @event CancelPolicySuccess#navigate-back
 * @type {Object} - N/A
 */