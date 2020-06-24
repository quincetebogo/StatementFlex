import { View, html, css } from 'platform/elements';

import '../../components/dialogs/Insure/InsureBenefitNonClient';

export class InsureProductNonClient extends View {

	constructor() {
		super();
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
		return html`<horizon-insure-benefit-nonclient class="non-client-benefits"></horizon-insure-benefit-nonclients>`;
	}
}

customElements.define(`product-insure-non-client`, InsureProductNonClient);
