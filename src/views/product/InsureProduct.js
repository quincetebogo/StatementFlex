import { ProductPageBase } from 'app/views/product/ProductPageBase';
import { html } from 'platform/elements';
import 'app/components/product/CnetProductInfo';

// import 'app/components/product/InsureProductDetails';

/**
 * This page allows an agent to view Insure Product information while waiting for an incoming call
 * The page is temporarily directed top opening product information on CNET
 *
 * @export
 * @class InsureProduct
 * @extends {View}
 */
export class InsureProduct extends ProductPageBase {

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
				.insure-details{
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
				data-automation-id="insure-product"
				viewType="insure" 
				viewHeader="Insure"
				@view-benefits="${() => this._viewBenefits(`insure`)}">
			</horizon-cnet-product-info>`;
		// return html`<horizon-insure-product-details class="insure-details"></horizon-insure-product-details>`;
	}
}

customElements.define(`horizon-insure-product`, InsureProduct);