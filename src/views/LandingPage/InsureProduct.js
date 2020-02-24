import { View, html, css } from 'platform/elements';
import 'platform/components/buttons/Button';
import { EventAggregator } from 'platform/EventAggregator';

import '../../components/InsureProductDetails';
import { StopCardService } from '../../services/StopCardService';

// TODO: Review as per SavingsAccountProduct page
export class InsureProduct extends View {

	constructor() {
		super();

		this.fullname = ``;
		this.eventAggregator = EventAggregator.getInstance();
	}

	async connectedCallback() {
		super.connectedCallback();

		let landingPageData = null;

		try {
			landingPageData = await StopCardService.getInstance().initialise();
		}
		catch (ex) {
			// TODO: better handling must come here
			console.log(ex);
		}

		if (landingPageData != null) {
			this.eventAggregator.publish('horizon-top-bar-data', {
				agentFullName: landingPageData.agentFullName,
				employeeId: landingPageData.loggedInAgent.employeeId
			});
			this.fullname = landingPageData.loggedInAgent.fullName;
		}
		else {
			this.eventAggregator.publish('horizon-top-bar-data', { agentFullName: `unknown`, employeeId: `unknown` });
			this.fullname = `unknown`;
		}
	}

	static get properties() {
		return {
			fullname: { type: String },
		}
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

	renderMiddleSection() {
	}

	render() {
		return html`<insureproduct-details></insureproduct-details>`;
	}
}

customElements.define(`product-insure`, InsureProduct);
