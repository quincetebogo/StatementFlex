import { View, html, css } from 'platform/elements';

import '../../components/product/SavingsAccountproductDetails';

import { HorizonViewManager } from '../../shell/HorizonViewManager';
import { InitialiseService } from '../../services/InitialiseService';

export class SavingsAccountProduct extends View {

	constructor() {
		super();
	}

	async connectedCallback() {
		super.connectedCallback();

		let landingPageData = null;

		landingPageData = await this.GetLandingPageData(landingPageData);
		HorizonViewManager.getInstance().UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId })
	}

	async GetLandingPageData(landingPageData) {
		try {
			landingPageData = await InitialiseService.getInstance().initialise();
		}
		catch (ex) {
			// TODO: better handling must come here
			console.log(ex);
		}

		return landingPageData;
	}

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

	render() {
		return html`<savingsaccountproduct-details class="savings-details"></savingsaccountproduct-details>`;
	}
}

customElements.define(`product-savings-account`, SavingsAccountProduct);
