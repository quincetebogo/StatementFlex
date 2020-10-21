import { View, css, html } from 'platform/elements';
import 'app/components/product/SavingsAccountproductDetails';

export class SavingsAccountProduct extends View {

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
		return html`<horizon-savings-account-product-details class="savings-details"></horizon-savings-account-product-details>`;
	}
}

customElements.define(`horizon-savings-account-product`, SavingsAccountProduct);