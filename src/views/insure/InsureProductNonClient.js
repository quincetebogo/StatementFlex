import { View, css, html } from 'platform/elements';

import 'app/components/insure/InsureInformation';

/**
 * The Insure view for a non-client. Only information about insurance productw will be accessible.
 *
 * @export
 * @class InsureProductNonClient
 * @extends {View}
 */
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
			`
];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`<horizon-insure-information class="non-client-benefits" displayMode="non-client"></horizon-insure-information>`;
	}
}

customElements.define(`horizon-product-insure-non-client`, InsureProductNonClient);