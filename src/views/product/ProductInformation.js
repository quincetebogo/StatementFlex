import { View, css, html } from 'platform/elements';
import 'app/components/product/ProductInfo';

export class ProductInformation extends View {

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

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`<horizon-product-info 
						class="savings-details"
						view-benefits ="">
					</horizon-product-info>`;
	}
}

customElements.define(`horizon-product-information`, ProductInformation);