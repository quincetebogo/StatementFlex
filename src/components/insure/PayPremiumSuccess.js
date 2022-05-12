import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';

class PayPremiumSuccess extends Component {

	//#region INITIALIZE

constructor() {
	super();

	this.showSuccessAlert = true;

}

//#endregion

//#region PROPERTIES

	/**
	 * 
	 * @readonly
	 * @static
	 */
	 static get properties() {
		return {
			showSuccessAlert: { boolean : true},
		};
	}

//#endregion

//#region PRIVATE FUNCTIONS

_backToSummaryPage() {
	this.dispatchEvent(new CustomEvent(`navigate-back`, {detail: {}}));
}
//#endregion

//#region EVENT HANDLERS



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
			
		`}

	/**
	 * Render the content HTML  for the component
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
					<capitec-button data-automation-id="" label="View Plan">
					</capitec-button>

					<capitec-button class="buttons" data-automation-id="" id="id-confirm-button" type="primary" label="Done"
					@click= "${() => this._backToSummaryPage()}">
					</capitec-button>
				</div>
			</div>

		</capitec-card>
		
		`}

_renderAlert(){
	return this.showSuccessAlert == false ? html``
	: html`
		<capitec-toast
					class="toast"
					type="success"
					Header="Payment succesful"
					layout = "horizontal"
					@click = "${() => this.showSuccessAlert = false}"
					closable
					>
				</capitec-toast>
		${window.setTimeout(() => this.showSuccessAlert= false, 2000)};
`}

	//#endregion



}

window.customElements.define(`horizon-pay-premium-success-page`, PayPremiumSuccess);

