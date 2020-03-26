import { View, html, css } from 'platform/elements';
import '../../components/product/CreditProductDetails';

import { StopCardService } from '../../services/StopCardService';
import { HorizonViewManager } from '../../HorizonViewManager';

export class CreditProduct extends View {

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
			landingPageData = await StopCardService.getInstance().initialise();
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
				.credit-details{
					width:100%;
					height:100%;
				}					
				`];
	}

	render() {
		return html`<creditproduct-details class="credit-details"></creditproduct-details>`;
	}
}

customElements.define(`product-credit`, CreditProduct);
