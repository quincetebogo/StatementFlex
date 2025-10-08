import { Component, css, html, unsafeHTML } from 'platform/elements';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { INSURE_CALLER_PAGE } from 'app/constants/InsureCommon';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';


import 'app/components/dialogs/insure/InsureEmailDialog';

/**
 * Life Cancel policy success page shows you how many policies you still have active and allows you to navigate to issue policy
 * 
 * Events Raised 
 * -------------
 * navigate-to-summary
 * send-email
 *  
 * @export
 * @class LifeSuccess
 * @extends {Component}
 */
class LifeSuccessPage extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.horizonIncidentManager = HorizonIncidentManager.getInstance();

		this.showEmailPlanDialog = false;
		this.contractReference = ``;
		this.titleMessage = ``;
		this.successMessages = {};
		this.email = ``;
	}

	// #endregion

	// #region PROPERTIES

	/**
	 * @property {Boolean} showEmailPlanDialog - Show flag for email address & send dialog
	 * @property {String} contractReference - policy contract reference
	 * @property {String} titleMessage - title of send email popup.
	 * @property {Object} successMessages - Contains messages to display on page.
	 * @property {Function} sendLifeEmail - Callback function to send email.
	 * @property {Function} showEmailDialog - determines whether to show email dialog.
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {

			showEmailPlanDialog: { type: Boolean, state: true },
			contractReference: { type: String, state: true },
			titleMessage: { type: String, state: true },
			successMessages: { type: Object, state: true },
			showEmailDialog: { type: Boolean, state: true },
			sendLifeEmail: { type: Object, state: true }
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

		/* Removed during incident management
		this._updateIncidentState();
		*/
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	/* Removed during incident management refactor
	_updateIncidentState() {
		// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
	}
	*/

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS


	/**
	 * Invoke this function when Send button is clicked on Email Popup
	 * 
	 * @param {*} e email address
	 * @return {void} 
	 */
	async _sendEmail(e) {

		if (!isNullorEmpty(e?.detail?.emailAddress)) {
			this.showEmailDialog = false;
			this.email = e.detail.emailAddress;
		}

		if (isNullorEmpty(this.email)) {
			this.showEmailDialog = true;
			return;
		}
		const payload = {};
		payload.detail = {
			emailAddress: this.email,
			contractReference: this.contractReference
		};

		const emailResponse = await this.sendLifeEmail(payload);

		if (emailResponse) {
			this.successMessages.emailMessage = `Your documentation has been successfully sent to ${this.email}`;
		} else {
			this.successMessages.emailSuccess = emailResponse;
			this.successMessages.emailMessage = `We were unable to send your documentation to ${this.email}`;
		}

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
			${this._renderEmailDialog()}
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
					<capitec-label class="label" type="title" label="${this.successMessages?.actionSuccessLabel}"></capitec-label>
						${isNullorEmpty(this.email) || isNullorEmpty(this.successMessages?.emailMessage) ? html``
				: html`
						<div class="success-message">
							<capitec-icon size="medium" icon="status/${this.successMessages?.emailSuccess ? `success` : `error`}" style="margin-right: 10px; margin-top: 15px;" ></capitec-icon>
							<p>${unsafeHTML(this.successMessages?.emailMessage)}</p>
						</div>
						`}
					

					<div class="button-row">
						
						${this.successMessages?.emailSuccess ? html`
							<capitec-button label="Done" class="capitec-button-medium" type="primary" @click="${() => this._navigateToSummary()}">
							</capitec-button>
						`
				: html`
							<capitec-button label="Email" class="capitec-button-medium" type="primary" @click="${() => this._sendEmail()}">
							</capitec-button>
							<capitec-button label="Done" class="capitec-button-medium" type="secondary" @click="${() => this._navigateToSummary()}">
							</capitec-button>
						`}
						
					</div>
				</div>
			</capitec-card>
		`;
	}


	_renderEmailDialog() {
		return this.showEmailDialog === true ? html`
			<horizon-insure-email-dialog
				.titleMessage = "${`Email Agreement`}"
				@close-modal="${() => this.showEmailDialog = false}"
				@send-email = "${(emailAddress) => this._sendEmail(emailAddress)}">
			</horizon-insure-email-dialog>
		`
			: html``;
	}

	// #endregion

}
window.customElements.define(`horizon-insure-life-success`, LifeSuccessPage);

/**
 * Navigate back to client policies 
 *
 * @example
 * <horizon-insure-funeral-cancel-policy-success ... @navigate-to-summary="${this._handler}"></horizon-insure-funeral-cancel-policy-success>
 *
 * @event FuneralCancelPolicySuccess#navigate-back
 * @type {Object} - N/A
 */

/**
 * Open email dialog
 *
 * @example
 * <horizon-insure-funeral-cancel-policy-success ... @send-email="${this._handler}"></horizon-insure-funeral-cancel-policy-success>
 *
 * @event FuneralCancelPolicySuccess#navigate-back
 * @type {Object} - N/A
 */