import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';

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

}

//#endregion

//#region PROPERTIES

	/**
	 *  @property {boolean} ShowSuccessAlert Controls when to show the Success Alert
	 *  @property {boolean} showEmailPlanDialog Controls when to show the Email plan Dialog]
	 * 
	 * @readonly
	 * @static
	 */
	 static get properties() {
		return {
			showSuccessAlert: { type: Boolean, state: true},
			showEmailPlanDialog: {type: Boolean, state: true},
		};
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
 * open email plan dialog event
 */
_openEmailPlanDialog(){

	this.showEmailPlanDialog = true;

}
/**
 * close email dialog event
 */
_closeEmailPlanDialog(){

	this.showEmailPlanDialog = false;

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
			
			#temp-container{
				min-height: 650px;
				text-align: center;
				padding-top: 100px;
			}

			#temp-container-label{
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
		<capitec-card id="temp-container">
			
			<div>
			
				<capitec-image src="platform/illustrations/transfer.svg"
					style="width: 300px; margin-left: auto; margin-right: auto;">
				</capitec-image>
				<label id="temp-container-label">Arrears was paid</label>
				<div style= "justify-content: center;">
					<capitec-icon size="medium" icon="status/success-trans" style="position: relative; left: 214px; top: 45px;"></capitec-icon>
					<p>You've paid the full outstanding amount of <b>R88.00</b> towards your plan <b>CF09847678</b></p>
				</div>
				 
				<div class="button-row">
					<capitec-button data-automation-id="insure-pay-premium-success-view-plan" label="View Plan">
					</capitec-button>

					<capitec-button  label="Email" @click= "${() => this._openEmailPlanDialog()}">
					</capitec-button>

					<capitec-button class="buttons" data-automation-id="insure-pay-premium-success-done" type="primary" label="Done"
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
		${window.setTimeout(() => this.showSuccessAlert= false, 2000)};
`}

_renderEmailPlanDialog(){
	return this.showEmailPlanDialog == false ? html`` 
	:html`
		<insure-email-plan-dialog
			@close-modal="${() => this._closeEmailPlanDialog()}"
			@send-email="${() => this._goToEmailSuccess()}">
		</insure-email-plan-dialog>
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
