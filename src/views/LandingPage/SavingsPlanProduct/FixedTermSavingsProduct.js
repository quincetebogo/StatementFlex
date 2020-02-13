import { View, html, css } from 'platform/elements';
import { Router } from 'platform/Router';

import 'platform/components';
import '../../../components/LandingPageWelcome';
import '../../../components/LandingPageMarketing';

export class FixedTermSavingsProduct extends View {

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
				.content{
					height:705px;
					padding: 0px 0px 0px 0px;
				}
				#label{
					text-align:left;
					padding: 0px 0px 0px 24px;
					line-height:40px;
					color: #003652;
					margin: 0px;
				}
				.list-items{
					text-align:left;
					color: #003652;
					padding: 10px 0px 0px 40px;
				}
				ul{
					margin: 0px;
					font:  13px/30px Hind Vadodara;
				}
				#benefits-text{
					height: 25px;
					margin: 10px 0px 0px 0px;
					font:  13px/30px Hind Vadodara;
				}
				p{
					text-align:left;
					padding: 0px 0px 0px 24px;
					color: #003652;
					font:  13px/30px Hind Vadodara;
					margin: 0px;
				}
				hr{
					margin:0px;
				}
				.hr-top{
					margin: 15px 0px 0px 0px;
				}
				capitec-label[type="strong"]{
					font-weight: bold;
					font-size: large;
				}
				capitec-title-bar > capitec-icon{
					cursor: pointer;
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
			<capitec-group layout="grid" rows="auto" coulmns="uniform" class="savingsproduct-info">
					<capitec-title-bar type="save">
						<capitec-icon size="small" icon="system/arrow-left"
									  @click="${() => this.router.navigateByPath(`/product/savings-plan`)}">
						</capitec-icon>
						<capitec-label label="Fixed-term Savings" type="Title"></capitec-label>
					</capitec-title-bar>

					<capitec-content-box class="content" row="2" column="1">
						<capitec-label id="label" label="Invest for 6 - 60 months, R20 million maximum investment with a minimum deposit of R10 000." type="default">
						</capitec-label>
						<hr class="hr-top">
							<capitec-label id="label" label="How it Works" type="strong"></capitec-label>
						<hr>
						<ul class="list-items">
							<li>You choose how long you want to invest (6 - 60 months)</li>
							<li>Deposit a single amoutn up to a maximum of R20 million to invest over the term you choose</li>
							<li>Minimum deposit amount of R10 000</li>
							<li>Earn up to 8.55% interest (nominal interest rate)</li>
						</ul>
						<hr class="hr-top">
							<capitec-label id="label" label="Benefits" type="strong"></capitec-label>
						<hr>
						<p id="benefits-text"> 
							The benefits of our fixed-term savings plans:
						</p>
						<ul class="list-items">
							<li>Reinvest the interest or transfer it to your main savings account</li>
							<li>Interest rate fixed for the full term</li>
							<li>Money availabel on the maturity date</li>
							<li>After maturity, the acount becomes a flexible savings plan which you can refix</li>
							<li>No monthly admin fee</li>
						</ul>
					</capitec-content-box>
			</capitec-group>
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

customElements.define(`product-fixed-term-savings-plan`, FixedTermSavingsProduct);