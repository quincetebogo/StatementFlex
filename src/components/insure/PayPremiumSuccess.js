import { Component, css, html } from 'platform/elements';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { INSURE_CALLER_PAGE } from 'app/constants/InsureCommon';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';

// Dialogs


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

	// #region INITIALIZE

	constructor() {
		super();

		this.showSuccessAlert = true;
		this.showEmailPlanDialog = false;
		this.amountToPay = ``;
		this.contractReference = ``;
		this.titleMessage = ``;

		this.horizonIncidentManager = HorizonIncidentManager.getInstance();

	}

	// #endregion

	// #region PROPERTIES

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
			showSuccessAlert: { type: Boolean, state: true },
			showEmailPlanDialog: { type: Boolean, state: true },
			amountToPay: { type: Object },
			contractReference: { type: Object },
			titleMessage: { type: String }
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

	// #endregion LIFECYCLE OVERRIDES

// #region PRIVATE METHODS

// #endregion PRIVATE METHODS

// #region EVENT HANDLERS

/**
 * Navigate to Landing
 * @returns {void} 
 */
_backToSummaryPage() {
	this.dispatchEvent(new CustomEvent(`navigate-back`, { detail: {} }));
}

/**
 * Invoke this function when Send button is clicked on Email Popup
 * @param {*} emailAddress email address
 * @returns {void} 
 */
 _sendEmail(emailAddress) {
	this.callerPage = INSURE_CALLER_PAGE.PAY_PREMIUM;

	this.dispatchEvent(new CustomEvent(`send-email`, { detail: { emailId: emailAddress, callerPage: this.callerPage } }));
}

/**
 * open email plan dialog event
 * @returns {void} 
 */
async _openEmailPlanDialog() {
	this.titleMessage = `Email Funeral Plan (${this.contractReference})`;

	this.showEmailPlanDialog = true;
}

/**
 * close email dialog event
 * @returns {void} 
 */
_closeEmailPlanDialog() {

	this.showEmailPlanDialog = false;

}

/**
 * navigate to policy summary
 * @return {void}
 */
_viewPlan() {
	this.dispatchEvent(new CustomEvent(`navigate-to-policy-summary`, { detail: { policyContractReference: this.contractReference } }));
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

			.options-group {
				height: 80px; 
				margin: 17px 0px 15px 0px;
				width: auto;
			}
			.options-group > horizon-option-button {
				width: 184px;
				height: 80px;
				margin-left: 16px;
				padding: 0px;

				--horizon-option-btn-text-margin-top: 3px;
				--horizon-option-btn-icon-height: 26px;
				--horizon-option-btn-icon-width: 26px;
			}

			capitec-group > capitec-title-bar {
				--theme-titlebar-min-height: 32px;
				--theme-titlebar-padding: 0px 16px 0px 16px;
				--theme-type-default-background: rgb(244, 244, 244);
				--theme-label-title-font-size: 15px;
				--theme-label-title-font-weight: 600;
				--theme-type-default-font-color: #3A3A3A;
				--theme-label-title-font-size: 14px;
				--theme-titlebar-shadow: 0px;
				--theme-titlebar-item-gap: 0px;

				border-top: 1px solid #E1E1E1;
				border-bottom: 1px solid #E1E1E1;
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

	_renderDialogs() {
		return html`
			${this._renderEmailPlanDialog()}
		`;
	}

	// TODO: fix inline styling for icon
	/**
	 * Render the content HTML for the component
	 * @returns {html} html content
	 */
	_renderContent() {
		return html`
		${this._renderAlert()}
		<capitec-card class="card">
			
			<div style="margin-bottom: 95px;">
			
				<capitec-image src="platform/illustrations/transfer.svg"
					style="width: 300px; margin-left: auto; margin-right: auto;">
				</capitec-image>
				<label class="label">Arrears paid</label>
				<div style= "justify-content: center;">
					<capitec-icon size="medium" icon="status/success-trans" style="position: relative; left: 304px; top: 42px;"></capitec-icon>
					<p>You've paid <b>${formatCurrency(this.amountToPay)}</b> towards Funeral Plan <b>${this.contractReference}</b></p>
				</div>
				 
				<div class="button-row">

					<capitec-button  label="Email" class = "capitec-button-medium" type="secondary"
						@click= "${() => this._openEmailPlanDialog()}">
					</capitec-button>

					<capitec-button data-automation-id="insure-pay-premium-success-done" 
						class = "capitec-button-medium" type="primary" label="Done"
						@click= "${() => this._backToSummaryPage()}">
					</capitec-button>
				</div>
			</div>
			${this._renderFooter()}
		</capitec-card>
		
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="vertical" gap="none" halign="left" valign="center">
				<capitec-title-bar
					type="default"
					label="More Options">
				</capitec-title-bar>
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button
							data-automation-id="insure-policy-product-enquiry"
							label="View Plan"
							icon="system/view-action"
							@click="${() => this._viewPlan()}">
					</horizon-option-button>
				</capitec-group>
			</capitec-group>
		`;
	}

/**
 * Renders the Successful payment alert
 * @returns {html} html content
 */
_renderAlert() {
	return this.showSuccessAlert === false ? html``
	: html`
		<capitec-toast
					class="toast"
					type="success"
					Header="Payment succesful"
					layout = "horizontal"
					@click = "${() => this.showSuccessAlert = false}">
				</capitec-toast>
	`;
}

_renderEmailPlanDialog() {
	return this.showEmailPlanDialog === false ? html`` 
	: html`
		<horizon-insure-email-dialog
			.contractReference = "${this.contractReference}" 
			.titleMessage = "${this.titleMessage}"
			@close-modal="${(e) => this.showEmailPlanDialog = false}"
			@send-email = "${(emailAddress) => this._sendEmail(emailAddress)}">
		</horizon-insure-email-dialog>
	`;
}

	// #endregion

}

window.customElements.define(`horizon-insure-pay-premium-success-page`, PayPremiumSuccess);

/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-insure-pay-premium-success-page ... @navigate-back="${this._handler}"></horizon-insure-pay-premium-success-page>
 *
 * @event PayPremiumSuccess#navigate-back
 * @type {Object} - N/A
 */