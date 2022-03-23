import { ProductPageBase } from 'app/views/product/ProductPageBase';
import { html } from 'platform/elements';
import 'app/components/product/CnetProductInfo';

/**
 * This page allows an agent to view Savings Plan Product information while waiting for an incoming call
 * The page is temporarily directed top opening product information on CNET
 *
 * @export
 * @class SavingsPlanProduct
 * @extends {ProductPageBase}
 */
export class SavingsPlanProduct extends ProductPageBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// ---------
	// RENDERING
	// ---------

/*
	static get styles() {
		return [
			super.styles,
			css`
				.savingsproduct-info{
					width:100%;
					height:100%;
					padding: 0px 0px 0px 0px;
					text-align: center;
					line-height: 40px;
					align-items: flex-start;
					background-color: white;
					border-radius: none;
				}
				.margin-wrapper{
					width:auto;
					margin: 0px 24px 0px 24px;
				}
				horizon-product-tile{
					width : 100%;
					margin: 24px 0px 0px 0px;
				}`
		];
	}
*/
	_mobileTemplate() {
	}

	_webTemplate() {
		
		return html`
			<horizon-cnet-product-info 
				data-automation-id="savings-plan-product"
				viewType="save" 
				viewHeader="Savings Plans"
				@view-benefits="${() => this._viewBenefits(`save`)}">
			</horizon-cnet-product-info>`;

		/*
		return html`
			<capitec-card class="savingsproduct-info">
			<capitec-title-bar type="save" label="Savings Plan"></capitec-title-bar>
				<div class="margin-wrapper">
					<horizon-product-tile type="save" 
										  label="Flexible Savings" 
										  subtitle="Earn from 5.1% interest per year on your daily balances. You have immediate access to your money."
										  ?navigational="${true}"
										  @click="${() => this.horizonRouter.navigateToFlexibleSavingsPlanProduct()}">
					</horizon-product-tile>
					<horizon-product-tile type="save" 
										  label="Fixed-term Savings" 
										  subtitle="Earn up to 9.25% interest when you fix your savings plan for 6 - 60 months. You can calculate your estimated payout."
										  ?navigational="${true}"
										  @click="${() => this.horizonRouter.navigateToFixedTermSavingsProduct()}">
					</horizon-product-tile>
					<horizon-product-tile type="save" 
										  label="Tax-free Savings" 
										  subtitle="Save up to R33 000 per year for 12 - 24 months and pay no tax on your interest earned."
										  ?navigational="${true}"
										  @click="${() => this.horizonRouter.navigateToTaxFreeSavingsProduct()}">
					</horizon-product-tile>
					</div>
			</capitec-card>
		`;
		*/
	}
}

customElements.define(`horizon-savings-plan-product`, SavingsPlanProduct);