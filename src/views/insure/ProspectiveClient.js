import { View, css, html } from 'platform/elements';

import 'app/components/insure/InsureInformation';

/**
 * Implements the view for prospective clients and non-clients. 
 *
 * The view is context sensitive to the incoming callers verification status. 
 *
 * @export
 * @class ProspectiveClient
 * @extends {View}
 */
export class ProspectiveClient extends View {

	constructor() {
		super();
	}


	static get styles() {
		return [
			super.styles,
			css`
				.insure-info{
					width:100%;
					height:100%;
				}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`<horizon-insure-information class="insure-info"></horizon-insure-information>`;
	}
}

customElements.define(`horizon-prospective-client`, ProspectiveClient);