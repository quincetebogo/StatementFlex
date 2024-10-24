import { View, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import 'platform/components';

/**
 * Fixed Term Savings Product View: This view is no longer in use but may be revived at some point in a modified form
 * 
 * @deprecated The Fixed Term Savings View is no longer in use
 * @export
 * @class FixedTermSavingsProduct
 * @extends {View}
 */
export class FixedTermSavingsProduct extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.horizonRouter = HorizonRouter.getInstance();
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.savingsproduct-info{
					width: 100%;
					height: 100%;
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
				}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-group layout="vertical" halign="stretch" valign="top" gap="none" class="savingsproduct-info">
					<capitec-title-bar type="save">
						<capitec-icon size="small" icon="system/arrow-left"
									  @click="${() => this.horizonRouter.navigateToSavingsPlanProduct()}">
						</capitec-icon>
						<capitec-label label="Fixed-term Savings" type="Title"></capitec-label>
					</capitec-title-bar>

					<capitec-content-box class="content">
						<capitec-label id="label" label="Invest for 6 - 60 months, R20 million maximum investment with a minimum deposit of R10 000." type="default">
						</capitec-label>
						<hr class="hr-top">
							<capitec-label id="label" label="How it Works" type="strong"></capitec-label>
						<hr>
						<ul class="list-items">
							<li>You choose how long you want to invest (6 - 60 months)</li>
							<li>Deposit a single amount up to a maximum of R20 million to invest over the term you choose</li>
							<li>Minimum deposit amount of R10 000</li>
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
							<li>Money available on the maturity date</li>
							<li>After maturity, the account becomes an access anytime plan, which you can refix</li>
							<li>No monthly admin fee</li>
						</ul>
					</capitec-content-box>
			</capitec-group>
			`;
	}
}

customElements.define(`horizon-fixed-term-savings-product`, FixedTermSavingsProduct);