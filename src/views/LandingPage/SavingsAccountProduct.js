import { View, html, css } from 'platform/elements';
import '../../components/LandingPageWelcome';
import 'platform/components/buttons/Button';
import '../../components/LandingPageMarketing';
import '../../components/LandingPageWaitForCall';
import '../../components/SavingsAccountproductDetails';

export class SavingsAccountProduct extends View {

	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
				:host{
					padding: 20px 0px 0px 20px;
				}
				.grid-container {
					display: grid;
					grid-template-columns: 0.413534fr 1fr 0.300752fr;
					grid-template-areas: "left middle right";
					grid-gap: 24px;
					background-color: gainsboro;
					height: 770px;
					width: 1903px;
				}

				.left {
					grid-area: left;
					width: 100%;
					background-color: gainsboro;
				}

				.middle {
					grid-area: middle;
					width: 100%;
					text-align: center;
				}

				.right {
					grid-area: right;
					justify-self: center;
					width: 100%;
					height:770px;
				}
				

	
				`];
	}

	renderleftUI() {
		return html`
			<landingpage-welcome></landingpage-welcome>
		`;
	}
	renderRightImage() {
		return html`
			<landingpage-marketing></landingpage-marketing>
		`;
	}
	renderMiddleSection() {
		return html`<savingsaccountproduct-details></savingsaccountproduct-details>`;
	}

	render() {
		return html`
			<section class="grid-container">
				<div class="left">
				${this.renderleftUI()}
				</div>
		
				<div class="middle">
					${this.renderMiddleSection()}
				</div>

				<div class="right">
					${this.renderRightImage()}
				</div>
			</section>		
		`;

	}
}

customElements.define(`product-savings-account`, SavingsAccountProduct);