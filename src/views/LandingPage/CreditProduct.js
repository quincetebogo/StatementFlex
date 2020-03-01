import { View, html, css } from 'platform/elements';
import '../../components/CreditProductDetails';

export class CreditProduct extends View {

	constructor() {
		super();
	}

	async connectedCallback() {
		super.connectedCallback();
	}

	static get styles() {
		return [
			super.styles,
			css`
				.credit-details{
					width:100%;
					height:100%;
				}					
				`];
	}

	render() {
		return html`<creditproduct-details class="credit-details"></creditproduct-details>`;
	}
}

customElements.define(`product-credit`, CreditProduct);
