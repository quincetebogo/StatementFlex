import { ProductPageBase } from 'app/views/product/ProductPageBase';
import { html } from 'platform/elements';
// import 'app/components/product/CreditProductDetails';
import 'app/components/product/CnetProductInfo';

/**
 * This page allows an agent to view Credit Product information while waiting for an incoming call
 * The page is temporarily directed top opening product information on CNET
 * 
 * @export
 * @class CreditProduct
 * @extends {View}
 */
export class CreditProduct extends ProductPageBase {

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
				.credit-details{
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
				data-automation-id="credit-product"
				viewType="credit" 
				viewHeader="Credit"
				@view-benefits="${() => this._viewBenefits(`credit`)}">
			</horizon-cnet-product-info>`;

		// return html`<horizon-credit-product-details class="credit-details"></horizon-credit-product-details>`;
	}
}

customElements.define(`horizon-credit-product`, CreditProduct);