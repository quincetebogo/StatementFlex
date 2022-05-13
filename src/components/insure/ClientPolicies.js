import { Component, css, html } from 'platform/elements';

//Dialogs
import 'app/components/dialogs/insure/PayPremiumDialog';

/**
 * Client policies component showing all the policies a client currently has on their account
 * This is the primary landing screen for client that has insurance product
 * 
 * Events Raised 
 * -------------
 * navigate-to-estimate
 * navigate-to-update-plan
 * navigate-to-policy-summary
 * pay-arrears
 *  
 * @export
 * @class ClientPolicies
 * @extends {Component}
 */
class ClientPolicies extends Component {

	//#region INITIALISATION

	constructor() {
		super();
		
		this.showPayPremiumDialog = false;
	}

	//#endregion

	//#region PROPERTIES

	/**
	 * @property {Object} clientArrears Data & flags from Arrears Service
	 * @property {boolean} showPayPremiumDialog Determines if the Pay Premium dialog should be shown
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			clientArrears: { type: Object },
			showPayPremiumDialog: { boolean: false },

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
		this._initialise();
	}

	//#endregion

	//#region EVENT HANDLERS

	/**
	 * Fire navigate event to Estimate
	 */
	_goToEstimate() {
		this.dispatchEvent(new CustomEvent(`navigate-to-estimate`, {
			detail: {
			}
		}));
	}

	/**
	 * Fire navigate event to Update Plan
	 */
	_goToUpdatePlan() {
		this.dispatchEvent(new CustomEvent(`navigate-to-update-plan`, {
			detail: {
			}
		}));
	}

	/**
	 * Fire navigate event to Policy Summary
	 */
	_goToPolicySummary() {
		this.dispatchEvent(new CustomEvent(`navigate-to-policy-summary`, {
			detail: {
			}
		}));
	}

	/**
	 * Fire navigate event to Pay Premium Success page
	 */
	 _payArrears(e) {
		this.dispatchEvent(new CustomEvent(`pay-arrears`, {
			detail: e.detail}));
	}

	/**
	 * Open Pay Premium dialog returning select relationship
	 */
	 _openPayPremiumDialog() {
		this.showPayPremiumDialog = true;
	}

	/**
	 * Close Pay Premium dialog returning select relationship
	 */
	_closePayPremiumDialog() {
		this.showPayPremiumDialog = false;
	}

	/**
	 * Initialize component
	 */
 	async _initialise() {
		this.clientArrears = {};
		this.clientArrears.arrears = [];
		this.clientArrears.contractReference = "CF09847678";
		this.clientArrears.arrears.push({
			dueDate: "2020-02-29T22:00:00.0000000+00:00",
			amount: 100.00,
			objectID: "24324234.43"
		});
		this.clientArrears.arrears.push({
			dueDate: "2020-01-29T22:00:00.0000000+00:00",
			amount: 50.00,
			objectID: "24294823.43"
		});
		
	 }

	//#endregion

	//#region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
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
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html}
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
			${this._renderDialogs()}
		`;
	}

	/**
	 * Generates the component template for web mode.
	 * @returns {html} The html content of the component.
	 */
	 _renderDialogs() {
		return html`
			${this._renderPayPremiumDialog()}
		`}

	/**
	 * Render the content HTML for the component
	 * @returns {html}
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
			<capitec-label label="Insure" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			<capitec-button type="white" label="Get Estimate" @click="${() => this._goToEstimate()}">
			</capitec-button>
			<capitec-button type="white" label="Pay Arrears" @click="${() => this._openPayPremiumDialog()}">
			</capitec-button>
		</capitec-title-bar>
		
		<capitec-card id="temp-container">
			<div>
				<capitec-image src="platform/illustrations/beneficiaries.svg"
					style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
				<label id="temp-container-label">Client Policies - Coming soon to a sprint near you!</label>
			</div>
		</capitec-card>

		`
	}

	// Not for estimate testing - reenable later
	// <capitec-button type="white" label="Update plan" @click="${() => this._goToUpdatePlan()}">
	// </capitec-button>
	// <capitec-button type="white" label="Policy Summary" @click="${() => this._goToPolicySummary()}">
	// </capitec-button>

	/**
	 * Render Pay Premium Dialog 
	 * @return {html} Html of the dialog
	 */
	 _renderPayPremiumDialog() {
		return this.showPayPremiumDialog == false ? `` :
			html`
			<pay-premium-dialog  @close-modal="${(e) => this._closePayPremiumDialog(e)}" .clientArrears = ${this.clientArrears}
			@pay-arrears = "${(e) => this._payArrears(e)}" >	
			</pay-premium-dialog>`

	}

	//#endregion
}

window.customElements.define(`horizon-insure-client-policies`, ClientPolicies);

/**
 * When Get Estimate button is clicked, navigate
 *
 * @example
 * <horizon-insure-client-policies ... @navigate-to-estimate="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#navigate-to-estimate
 * @type {Object} - N/A
 */

/**
 * When Update Plan tile is clicked, navigate
 *
 * @example
 * <horizon-insure-client-policies ... @navigate-to-update-plan="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#navigate-to-update-plan
 * @type {Object} - N/A
 */

/**
 * When policy contract reference link is clicked, navigate
 *
 * @example
 * <horizon-insure-client-policies ... @navigate-to-policy-summary="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#navigate-to-policy-summary
 * @type {Object} - N/A
 */

/**
 * When Pay Arrears button is clicked in dialog, payArrears object is passed through
 *
 * @example
 * <horizon-insure-client-policies ... @pay-arrears="${this._handler}"></horizon-insure-client-policies>
 *
 * @event ClientPolicies#navigate-to-estimate
 * @type {Object} - N/A
 */