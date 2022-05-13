import { Component, css, html } from 'platform/elements';

/**
 * Client policies component showing all the policies a client currently has on their account
 * This is the primary landing screen for client that has insurance product
 * 
 * Events Raised 
 * -------------
 * navigate-to-estimate
 * navigate-to-update-plan
 * navigate-to-policy-summary
 *  
 * @export
 * @class ClientPolicies
 * @extends {Component}
 */
class ClientPolicies extends Component {

	//#region INITIALISATION

	constructor() {
		super();
	}

	//#endregion

	//#region PROPERTIES

	/**
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {

		};
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
	 * Fire navigate event to Policy Transaction History
	 */
	_goToPolicyTransactionHistory() {
		this.dispatchEvent(new CustomEvent(`navigate-to-policy-transaction-history`, {
			detail: {
			}
		}));
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
		`;
	}

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
			<capitec-button type="white" label="Transaction History" @click="${() => this._goToPolicyTransactionHistory()}">
			</capitec-button>
			<capitec-button type="white" label="Get Estimate" @click="${() => this._goToEstimate()}">
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