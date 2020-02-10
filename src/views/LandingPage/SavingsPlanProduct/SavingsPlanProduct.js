import { View, html, css } from 'platform/elements';
import { Router } from 'platform/Router';

import 'platform/components';
import '../../../components/LandingPageWelcome';
import '../../../components/LandingPageMarketing';
import '../../../components/Common/HorizonProductTile';

export class SavingsPlanProduct extends View {

	constructor() {
		super();
		this.router = Router.getInstance();
	}

	static get styles() {
		return [
			super.styles,
			css`
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
					width: 440px;
					background-color: gainsboro;
				}
				.middle {
					grid-area: middle;
					width: 1064px;
					text-align: center;
				}
				.right {
					grid-area: right;
					justify-self: center;
					width: 320px;
					height:770px;
				}
				.savingsproduct-info{
					width: 1067.8px;
					height: 770px;
					padding: 0px 0px 0px 0px;
					text-align: center;
					line-height: 40px;
					align-items: flex-start;
					background-color: white;
					border-radius: none;
				}
				horizon-product-tile{
					width: 97%;
					margin: 15px 0px 15px 15px;
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
		return html`
			<capitec-card class="savingsproduct-info">
				<capitec-title-bar type="save" label="Savings Plan"></capitec-title-bar>

					<horizon-product-tile type="save" 
										  label="Flexible Savings" 
										  subtitle="Earn from 5.1% interest per year on your daily balances. You have immediate access to your money."
										  navigational="true"
										  @click="${() => this.router.navigateByPath(`/product/savings-plan/flexible`)}">
					</horizon-product-tile>
					<horizon-product-tile type="save" 
										  label="Fixed-term Savings" 
										  subtitle="Earn up to 9.25% interest when you fix your savings plan for 6 - 60 months. You can calculate your estimated payout."
										  navigational="true"
										  @click="${() => this.router.navigateByPath(`/product/savings-plan/fixed-term`)}">
					</horizon-product-tile>
					<horizon-product-tile type="save" 
										  label="Tax-free Savings" 
										  subtitle="Save up to R33 000 per year for 12 - 24 months and pay no tax on your interest earned."
										  navigational="true"
										  @click="${() => this.router.navigateByPath(`/product/savings-plan/tax-free`)}">
					</horizon-product-tile>
			</capitec-card>
		`;
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

customElements.define(`product-savings-plan`, SavingsPlanProduct);