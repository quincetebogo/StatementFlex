import { View, html, css } from 'platform/elements';
import '../../components/LandingPageWelcome';
import 'platform/components/buttons/Button';
import '../../components/LandingPageMarketing';
import '../../components/LandingPageWaitForCall';
import '../../components/SavingsAccountproductDetails';

import { EventAggregator } from 'platform/EventAggregator';

import { StopCardService } from '../../services/StopCardService';

export class SavingsAccountProduct extends View {

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

	renderleftUI() {
		return html`
			<landingpage-welcome .fullname="${this.fullname}"></landingpage-welcome>
		`;
	}
	renderRightImage() {
		return html`
			<landingpage-marketing></landingpage-marketing>
		`;
	}
	renderMiddleSection() {
		return html`<savingsaccountproduct-details class="savings-details"></savingsaccountproduct-details>`;
	}

	render() {
		return html`
			<!-- <section class="grid-container">
				<div class="left">
				${this.renderleftUI()}
				</div>
		 -->
				<!-- <div class="middle"> -->
					${this.renderMiddleSection()}
				<!-- </div> -->
<!-- 
				<div class="right">
					${this.renderRightImage()}
				</div>
			</section>		 -->
		`;

	}
}

customElements.define(`product-savings-account`, SavingsAccountProduct);