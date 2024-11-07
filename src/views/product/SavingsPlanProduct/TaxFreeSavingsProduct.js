import { View, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import 'platform/components';

/**
 * @deprecated The Tax Free Savings Product Plan View is no longer in use
 * @export
 * @class TaxFreeSavingsProduct
 * @extends {View}
 */
export class TaxFreeSavingsProduct extends View {

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
						<capitec-label label="Tax Free Savings" type="Title"></capitec-label>
					</capitec-title-bar>

					<capitec-content-box class="content">
						<capitec-label id="label" label="Invest for the long term, for your future or your children's." type="default">
						</capitec-label>
						<hr class="hr-top">
							<capitec-label id="label" label="Benefits" type="strong"></capitec-label>
						<hr>
						<p id="benefits-text"> 
							The benefits of our tax-free main account:
						</p>
						<ul class="list-items">
							<li>You can open one tax-free main account at any of our branches</li>
							<li>Deposit any amount up to R33 000 per year (single or multiple deposits)</li>
							<li>Choose an investment term from 12-24 months</li>
							<li>Earn interest from R1</li>
						</ul>
						<hr class="hr-top">
							<capitec-label id="label" label="South African Revenue Service (SARS) rules" type="strong"></capitec-label>
						<hr>
						<ul class="list-items">
							<li>Contribution limits</li>
							<li>Your combined limit for the financial year (1 March-28 February) across all tax-free main accounts,
							    including those at other financial services providers, is R33 000</li>
							<li>Lifetime limit is R500 000</li>
							<li>Interest will not be taxed</li>
							<li>Money withdrawn cannot be replaced</li>
							<li>Money may be transferred to and from a tax-free account at aonther financial services provider</li>
							<li>Other savings plans may not be converted to a tax-free main account</li>
						</ul>
					</capitec-content-box>
			</capitec-group>
		`;
	}
}

customElements.define(`horizon-tax-free-savings-product`, TaxFreeSavingsProduct);