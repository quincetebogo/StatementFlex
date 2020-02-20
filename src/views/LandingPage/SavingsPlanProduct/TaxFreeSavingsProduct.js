import { View, html, css } from 'platform/elements';
import { Router } from 'platform/Router';

import 'platform/components';
import '../../../components/LandingPageWelcome';
import '../../../components/LandingPageMarketing';

export class TaxFreeSavingsProduct extends View {

	constructor() {
		super();
		this.router = Router.getInstance();
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
				.savingsproduct-info{
					width: 100%;
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
						<capitec-label label="Tax Free Savings" type="Title"></capitec-label>
					</capitec-title-bar>

					<capitec-content-box class="content" row="2" column="1">
						<capitec-label id="label" label="Invest for the long term, for your future or your children's." type="default">
						</capitec-label>
						<hr class="hr-top">
							<capitec-label id="label" label="Benefits" type="strong"></capitec-label>
						<hr>
						<p id="benefits-text"> 
							The benefits of our tax-free savings account:
						</p>
						<ul class="list-items">
							<li>You can open one tax-free savings account at any of our branches</li>
							<li>Deposit any amount up to R33 000 per year (single or multiple deposits)</li>
							<li>Choose an investment term from 12-24 months</li>
							<li>Earn interest from R1</li>
						</ul>
						<hr class="hr-top">
							<capitec-label id="label" label="South African Revenue Service (SARS) rules" type="strong"></capitec-label>
						<hr>
						<ul class="list-items">
							<li>Contribution limits</li>
							<li>Your combine limit for the financial year (1 March-28 February) across all tax-free savings account,
							    including those at other financial services providers, is R33 000</li>
							<li>Lifetime limit is R500 000</li>
							<li>Contributions over these limits are taxed at 40%</li>
							<li>Interest will not be taxed</li>
							<li>Money withdrawn cannot be replaced</li>
							<li>Money may be transferred to and from a tax-free account at aonther financial services provider</li>
							<li>Other savings plans may not be converted to a tax-free savings account</li>
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

customElements.define(`product-taxfree-savings-plan`, TaxFreeSavingsProduct);