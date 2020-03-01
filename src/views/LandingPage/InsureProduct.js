import { View, html, css } from 'platform/elements';

import '../../components/InsureProductDetails';

// TODO: Review as per SavingsAccountProduct page
export class InsureProduct extends View {

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
				.insure-details{
					width:100%;
					height:100%;
				}					
				`];
	}

	render() {
		return html`<insureproduct-details class="insure-details"></insureproduct-details>`;
	}
}

customElements.define(`product-insure`, InsureProduct);
