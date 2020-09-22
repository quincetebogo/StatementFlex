import { View, html, css } from 'platform/elements';

import '../../components/product/SavingsAccountproductDetails';

import { HorizonViewManager } from '../../shell/HorizonViewManager';
import { InitialiseService } from '../../services/InitialiseService';

export class SavingsAccountProduct extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			isBusy: { type: Boolean }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		let landingPageData = null;

		landingPageData = await this.GetLandingPageData(landingPageData);
		HorizonViewManager.getInstance().UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId })
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async GetLandingPageData(landingPageData) {
		try {
			landingPageData = await InitialiseService.getInstance().initialise(() => {
				this._toggleBusyFlag();
			});
		}
		catch (ex) {
			// TODO: better handling must come here
			console.log(ex);
		}

		return landingPageData;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.savings-details{
					width:100%;
					height:100%;
				}
				`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<savingsaccountproduct-details class="savings-details"></savingsaccountproduct-details>
			${this._renderLoadingIndicator()}
		`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

}

customElements.define(`product-savings-account`, SavingsAccountProduct);
