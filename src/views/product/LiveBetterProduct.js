import { ProductPageBase } from 'app/views/product/ProductPageBase';
import { html } from 'platform/elements';
import 'app/components/product/CnetProductInfo';

/**
 * This page allows an agent to view Live Better Savings Account information while waiting for an incoming call
 *
 * @export
 * @class LiveBetterProduct
 * @extends {View}
 */
export class LiveBetterProduct extends ProductPageBase {

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

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			<horizon-cnet-product-info 
				data-automation-id="live-better-savings-account-product"
				viewType="liveBetter" 
				viewHeader="Live Better Savings Account"
				@view-benefits="${() => this._viewBenefits(`liveBetter`)}">
			</horizon-cnet-product-info>`;
	}
}

customElements.define(`horizon-live-better-product`, LiveBetterProduct);