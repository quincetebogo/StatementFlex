import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { INSURE_CALLER_PAGE } from 'app/constants/InsureCommon';

//Dialogs
import 'app/components/dialogs/insure/EmailPlanDialog';

/**
 * Pay Premium Success component that displays once Arrears have been successfully paid.
 * Displays the total Arrears amount that has been paid
 * 
 * Events Raised 
 * -------------
 * navigate-back
 *  
 * @export
 * @class PayPremiumSuccess
 * @extends {Component}
 */
class PayPremiumSuccess extends Component {

	//#region INITIALIZE

constructor() {
	super();

	this.showSuccessAlert = true;
	this.showEmailPlanDialog = false;
	this.amountToPay = ``;
	this.contractReference = ``;
	this.titleMessage = ``;

}

//#endregion

//#region PROPERTIES

	/**
	 *  @property {boolean} ShowSuccessAlert Controls when to show the Success Alert
	 *  @property {boolean} showEmailPlanDialog Controls when to show the Email plan Dialog]
	 *  @property {Object} amountToPay amount of arrears that is paid
	 *  @property {boolObjectean} contractReference of the policy
	 * @property {String} titleMessage - title of send email popup.
	 * 
	 * @readonly
	 * @static
	 */
	 static get properties() {
		return {
			showSuccessAlert: { type: Boolean, state: true},
			showEmailPlanDialog: {type: Boolean, state: true},
			amountToPay: { type: Object },
			contractReference: { type: Object },
			titleMessage: { type: String }
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

//#region PRIVATE FUNCTIONS


//#endregion

//#region EVENT HANDLERS

/**
 * Navigate to Landing
 */
_backToSummaryPage() {
	this.dispatchEvent(new CustomEvent(`navigate-back`, {detail: {}}));
}

/**
 * navigate to the Email Success page
 */
_goToEmailSuccess(){
	this.dispatchEvent(new CustomEvent(`navigate-to-email-success-page`, {detail: {}}));
}

/**
 * Invoke this function when Send button is clicked on Email Popup
 */
 async _sendEmail(emailAddress) {
	this.callerPage = INSURE_CALLER_PAGE.PAY_PREMIUM;

	this.dispatchEvent(new CustomEvent(`send-email`, { detail: { emailId: emailAddress
			,callerPage: this.callerPage } } ));
}

/**
 * open email plan dialog event
 */
_openEmailPlanDialog(){
	this.titleMessage = `Email Funeral Plan (${this.contractReference})`;

	this.showEmailPlanDialog = true;
}
/**
 * close email dialog event
 */
_closeEmailPlanDialog(){

	this.showEmailPlanDialog = false;

}

_viewPlan(){
	this.dispatchEvent(new CustomEvent(`navigate-to-policy-summary`, { detail: { policyContractReference: this.contractReference } } ));
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
			
			${INSURE_CSS}

			.card{
				min-height: 650px;
				text-align: center;
				padding-top: 100px;
			}

			.label{
				font-weight: bold;
				font-size: 24px;
			}

			.button-row{
				display: flex; 
				justify-content: center;
				padding: 10px 15px 15px 15px; 
				gap: 10px;
			}
			
			.toast {
				position: absolute;
				top : 70px;
				left: 790px;
				height: 64px;
				width: 428px;
				border-radius: 4px;
				color: #70AF00;
				z-index: 201;
				left: calc(50.8% - 200px);
				justify-content: center;
				align-items: center;
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
			
		`}

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
		${this._renderAlert()}	
		<capitec-card class="card">
			
			<div>
			
				<capitec-image src="platform/illustrations/transfer.svg"
					style="width: 300px; margin-left: auto; margin-right: auto;">
				</capitec-image>
				<label class="label">Arrears was paid</label>
				<div style= "justify-content: center;">
					<capitec-icon size="medium" icon="status/success-trans" style="position: relative; left: 214px; top: 45px;"></capitec-icon>
					<p>You've paid the outstanding amount of <b>${formatCurrency(this.amountToPay)}</b> towards your plan <b>${this.contractReference}</b></p>
				</div>
				 
				<div class="button-row">
					<capitec-button data-automation-id="insure-pay-premium-success-view-plan" 
						class = "capitec-button-medium" label="View Plan" 
						@click= "${() => this._viewPlan()}">
					</capitec-button>

					<capitec-button  label="Email" class = "capitec-button-medium" 
						@click= "${() => this._openEmailPlanDialog()}">
					</capitec-button>

					<capitec-button data-automation-id="insure-pay-premium-success-done" 
						class = "capitec-button-medium" type="primary" label="Done"
						@click= "${() => this._backToSummaryPage()}">
					</capitec-button>
				</div>
			</div>

		</capitec-card>
		
		`}

/**
 * Renders the Successful payment alert
 * @returns {html}
 */
_renderAlert(){
	return this.showSuccessAlert == false ? html``
	: html`
		<capitec-toast
					class="toast"
					type="success"
					Header="Payment succesful"
					layout = "horizontal"
					@click = "${() => this.showSuccessAlert = false}">
				</capitec-toast>
`}

_renderEmailPlanDialog(){
	return this.showEmailPlanDialog == false ? html`` 
	:html`
		<insure-email-dialog @close-modal="${(e) => this.showEmailPlanDialog = false}"
			@send-email = "${(emailAddress) => this._sendEmail(emailAddress)}"
			.contractReference = "${this.contractReference}" .titleMessage = "${ this.titleMessage }">
		</insure-email-dialog>
	`
}

	//#endregion



}

window.customElements.define(`horizon-pay-premium-success-page`, PayPremiumSuccess);

/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-pay-premium-success-page ... @navigate-back="${this._handler}"></horizon-pay-premium-success-page>
 *
 * @event PayPremiumSuccess#navigate-back
 * @type {Object} - N/A
 */
