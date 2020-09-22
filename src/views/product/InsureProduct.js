import { View, html, css } from 'platform/elements';

import '../../components/product/InsureProductDetails';

import { HorizonViewManager } from '../../shell/HorizonViewManager';
import { InitialiseService } from '../../services/InitialiseService';

// TODO: Review as per SavingsAccountProduct page
export class InsureProduct extends View {

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
				.insure-details{
					width:100%;
					height:100%;
				}					
				`];
	}

	render() {
		return html`<insureproduct-details class="insure-details"></insureproduct-details>`;
	}
}

customElements.define(`product-insure`, InsureProduct);
