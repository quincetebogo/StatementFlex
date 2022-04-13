import { Component, css, html } from 'platform/elements';

class InsureClientLanding extends Component {

	constructor() {
		super();
	}

	//#region PRIVATE FUNCTIONS

	_goToEstimate() {
		console.log('Going to estimate');
		this.dispatchEvent(new CustomEvent(`navigate-to-estimate`, {
			detail: {
			}
		}));
	}

	_goToUpdatePlan() {
		this.dispatchEvent(new CustomEvent(`navigate-to-update-plan`, {
			detail: {
			}
		}));
	}

	//#endregion

	/**
	 * 
	 * @returns {html}
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
		`;
	}

	/**
	 * Render the content HTML  for the component
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
			<capitec-label label="Insure" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			<capitec-button type="white" label="Get Estimate" @click="${() => this._goToEstimate()}">
			</capitec-button>
			<capitec-button type="white" label="Update plan" @click="${() => this._goToUpdatePlan()}">
			</capitec-button>
		</capitec-title-bar>`
	}
}

window.customElements.define(`horizon-insure-landing`, InsureClientLanding);