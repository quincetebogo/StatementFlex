import { View, html, css } from 'platform/elements';

import '../../components/SavingsAccountproductDetails';

export class SavingsAccountProduct extends View {

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
				.savings-details{
					width:100%;
					height:100%;
				}					
				`];
	}

	render() {
		return html`<savingsaccountproduct-details class="savings-details"></savingsaccountproduct-details>`;
	}
}

customElements.define(`product-savings-account`, SavingsAccountProduct);
