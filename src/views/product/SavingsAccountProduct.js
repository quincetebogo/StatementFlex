import { ProductPageBase } from 'app/views/product/ProductPageBase';
import { html } from 'platform/elements';
// import 'app/components/product/SavingsAccountproductDetails';
import 'app/components/product/CnetProductInfo';

/**
 * This page allows an agent to view Savings Account information while waiting for an incoming call
 * The page is temporarily directed top opening product information on CNET
 *
 * @export
 * @class SavingsAccountProduct
 * @extends {View}
 */
export class SavingsAccountProduct extends ProductPageBase {

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

	// ---------
	// RENDERING
	// ---------

	/*
	static get styles() {
		return [
			super.styles,
			css`
				.savings-details{
					width:100%;
					height:100%;
			}`
		];
	}
	*/

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon-cnet-product-info 
				data-automation-id="savings-account-product"
				viewType="transact" 
				viewHeader="Main Account"
				@view-benefits="${() => this._viewBenefits(`transact`)}">
			</horizon-cnet-product-info>`;
		// return html`<horizon-savings-account-product-details class="savings-details"></horizon-savings-account-product-details>`;
	}
}

customElements.define(`horizon-savings-account-product`, SavingsAccountProduct);