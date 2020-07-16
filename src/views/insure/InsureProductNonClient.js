import { View, html, css } from 'platform/elements';

import '../../components/insure/InsureInformation';

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

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`<horizon-insure-information class="non-client-benefits" displayMode="non-client"></horizon-insure-information>`;
	}
}

customElements.define(`product-insure-non-client`, InsureProductNonClient);
