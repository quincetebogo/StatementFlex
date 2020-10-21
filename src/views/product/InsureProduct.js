import { View, css, html } from 'platform/elements';
import 'app/components/product/InsureProductDetails';

export class InsureProduct extends View {

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
				.insure-details{
					width:100%;
					height:100%;
				}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`<horizon-insure-product-details class="insure-details"></horizon-insure-product-details>`;
	}
}

customElements.define(`horizon-insure-product`, InsureProduct);