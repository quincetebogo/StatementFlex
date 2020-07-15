import { View, html, css } from 'platform/elements';

import '../../components/insure/InsureBenefitNonClient';

export class InsureProductNonClient extends View {

	constructor() {
		super();
	}


	static get styles() {
		return [
			super.styles,
			css`
			.non-client-benefits{
				width:100%;
				height:100%;
			}					
			`];
	}

	render() {
		return html`<horizon-insure-benefit-nonclient class="non-client-benefits" displayMode="non-client"></horizon-insure-benefit-nonclients>`;
	}
}

customElements.define(`product-insure-non-client`, InsureProductNonClient);
