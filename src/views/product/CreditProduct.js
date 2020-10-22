import { View, css, html } from 'platform/elements';
import 'app/components/product/CreditProductDetails';

export class CreditProduct extends View {

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
				.credit-details{
					width:100%;
					height:100%;
				}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`<horizon-credit-product-details class="credit-details"></horizon-credit-product-details>`;
	}
}

customElements.define(`horizon-credit-product`, CreditProduct);