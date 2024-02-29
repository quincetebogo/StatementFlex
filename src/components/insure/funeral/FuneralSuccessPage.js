import { Component, css, html } from 'platform/elements';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { INSURE_CALLER_PAGE } from 'app/constants/InsureCommon';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import 'app/components/dialogs/insure/InsureEmailDialog';


/**
 * Success page after action (update plan, accept policy, etc...) has been done.
 * 
 * Events Raised:
 * --------------
 * send-email
 * navigate-back
 *  
 * @export
 * @class FuneralSuccessPage
 * @extends {Component}
 */
class FuneralSuccessPage extends Component {

	// #region INITIALISATION

	constructor() {
		super();
	
		this.successMessage = ``;
		this.callerPage = ``;
		this.showEmailPlanDialog = false;
		this.contractReference = ``;
		this.titleMessage = ``;

		this.horizonIncidentManager = HorizonIncidentManager.getInstance();

	}

	// #endregion INITIALISATION

	// #region PROPERTIES

	/**
	 * @property {String} successMessage - Success message after action is done.
	 * @property {String} callerPage - caller Page from which success page is invoked.
	 * @property {Boolean} showEmailPlanDialog - Show flag for email address & send dialog
	 * @property {String} contractReference - policy contract reference
	 * @property {String} titleMessage - title fo send email popup.
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			successMessage: { type: String },
			showEmailPlanDialog: { type: Boolean, state: true },
			callerPage: { type: String },
			contractReference: { type: String },
			titleMessage: { type: String }
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
	}

	// #endregion

	// #region PRIVATE METHODS

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLER

	/**
	 * Display email dialog
	 * @returns {void}
	 */
	async _emailClick() {
		this.showEmailPlanDialog = true;

		if (this.callerPage === INSURE_CALLER_PAGE.REINSTATE_POLICY) {
			this.titleMessage = `Email Funeral Plan (${this.contractReference})`;
		} else if (this.callerPage === INSURE_CALLER_PAGE.UPDATE_PLAN) {
			this.titleMessage = `Email Funeral Plan (${this.contractReference})`;
		}
	}
	
	/**
	 * Navigate back to Landing Page
	 * @return {void} 
	 */
	_doneClick() {
		if (this.callerPage === INSURE_CALLER_PAGE.REINSTATE_POLICY) {
			this.dispatchEvent(new CustomEvent(`navigate-back`, { detail: { navigateBackTo: INSURE_RENDER_MODE.CLIENT_POLICIES } }));
		} else if (this.callerPage === INSURE_CALLER_PAGE.UPDATE_PLAN) {
			this.dispatchEvent(new CustomEvent(`navigate-back`, { detail: { navigateBackTo: INSURE_RENDER_MODE.CLIENT_POLICIES } }));
		}
	}

	/**
	 * Invoke this function when Send button is clicked on Email Popup
	 * @param {*} emailAddress email address
	 * @return {void} 
	 */
	 _sendEmail(emailAddress) {
		this.dispatchEvent(new CustomEvent(`send-email`, { detail: { emailId: emailAddress } }));
	}

	// #endregion EVENT HANDLER

	// #region RENDERING

	/**
	 * Generates the view stylesheet.
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			
				${INSURE_CSS}

				#success-container{
					min-height: 650px;
					text-align: center;
					padding-top: 100px;
				}
		
				#title{
					font-weight: bold;
					font-size: 24px;
				}

				#mainIcon{
					width: 300px; 
					margin-left: auto; 
					margin-right: auto;
				}

				#message-row{
					display: flex;
					justify-content: center;
				}

				#message-row > capitec-icon{
					margin-right: 10px;
				}
		
				#button-row{
					display: flex; 
					justify-content: center;
					padding: 10px 15px 15px 15px; 
					gap: 10px;
				}
				capitec-label[type="subtitle"] {
					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
				}
			`
		];
	}

	/**
	 * Generates the component template for kiosk mode.
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for mobile mode.
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
			${this._renderDialogs()}
		`;
	}

	/**
	 * Render the content HTML for the component
	 * @return {html} html
	 */
	_renderContent() {
		return html`
		<capitec-card id="success-container">
			<capitec-image src="platform/illustrations/send-documents.svg" id="mainIcon">
			</capitec-image>
			<div id="message-row">
				<capitec-icon size="medium" icon="status/success-trans">
				</capitec-icon>
				<capitec-label type ="subtitle" label = "${this.successMessage}"></capitec-label>
			</div>
			<div id="button-row">
				<capitec-button type="secondary" label="Email" class = "capitec-button-medium" @click="${() => this._emailClick()}">
				</capitec-button>
				<capitec-button type="primary" class = "capitec-button-medium" label="Done" @click="${() => this._doneClick()}">
				</capitec-button>
			</div>
		</capitec-card>
		`;
	}

	/**
	 * Generates the component template for web mode.
	 * @returns {html} The html content of the component.
	 */
	_renderDialogs() {
		return html`
			${this._renderInsureEmailDialog()}
		`;
	}

	/** 
	 * Render dialog for confirming email address then sending
	 * @return {html} html
	 */
	_renderInsureEmailDialog() {
		return this.showEmailPlanDialog === false ? `` 
		: html`
				<horizon-insure-email-dialog
					.contractReference = "${this.contractReference}" 
					.titleMessage = "${this.titleMessage}"
					@close-modal="${() => this.showEmailPlanDialog = false}"
					@send-email = "${(emailAddress) => this._sendEmail(emailAddress)}">
				</horizon-insure-email-dialog>`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-success-page`, FuneralSuccessPage);


/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-insure-success-page ... @navigate-back="${this._handler}"></horizon-insure-success-page>
 *
 * @event FuneralSuccessPage#navigate-back
 * @type {Object} - N/A
 */

/**
 * When send email button is clicked
 *
 * @example
 * <horizon-insure-success-page ... @send-email="${this._handler}"></horizon-insure-success-page>
 *
 * @event FuneralSuccessPage#send-email
 * @type {Object} - N/A
 */