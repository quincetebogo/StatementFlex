import { Component, css, html } from 'platform/elements';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { INSURE_CALLER_PAGE } from 'app/constants/InsureCommon';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';


/**
 * Cancel policy success page shows you how many policies you still have active and allows you to navigate to issue policy
 * 
 * Events Raised 
 * -------------
 * navigate-to-summary
 * send-email
 *  
 * @export
 * @class FuneralCancelPolicySuccess
 * @extends {Component}
 */
class FuneralAmendRelationship extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		this.policyToAmend = {}

	}

	// #endregion

	// #region PROPERTIES

	/**
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			policyToAmend: { type: Boolean, state: true }

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

	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

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
		`;
	}

	/**
	 * Render the content HTML for the component
	 * @returns {html} html content
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToUpdatePlan()}" />
			<capitec-label label="${`Amend Policy Relationships #${this.policyToAmend.contractReference}`}" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			<capitec-button label="Confirm Amend" type="white" class="capitec-button-medium"
					@click="${() => this._amendAndReturn()}">
			</capitec-button>
		</capitec-title-bar>

		<capitec-card style="min-height: 50vh;">
			
		</capitec-card>
		`;
	}



	// #endregion

}
window.customElements.define(`horizon-insure-funeral-amend-relationship`, FuneralAmendRelationship);

