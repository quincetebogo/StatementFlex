import { Component, html } from 'platform/elements';

/**
 * Policy summary component showing details of single policy with its role players
 * 
 * Events Raised 
 * -------------
 * navigate-back
 *  
 * @export
 * @class PolicySummary
 * @extends {Component}
 */
class PolicySummary extends Component {

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

	//region EVENT HANDLERS

	/**
	 * Navigate to Landing
	 */
	_backToSummaryPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, {
			detail: {
			}
		}));
	}

	//endregion

	//#region RENDERING

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
				<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}" />
				<capitec-label label="Funeral Plan" type="title"></capitec-label>
				<capitec-spacer></capitec-spacer>
				</capitec-button>
				<capitec-button label="Email Plan" type="white"></capitec-button>
				<capitec-button label="Update Plan" type="white"></capitec-button>
			</capitec-title-bar>`
	}

	//#endregion
}
window.customElements.define(`horizon-insure-policy-summary`, PolicySummary);

/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-insure-policy-summary ... @navigate-back="${this._handler}"></horizon-insure-policy-summary>
 *
 * @event PolicySummary#navigate-back
 * @type {Object} - N/A
 */