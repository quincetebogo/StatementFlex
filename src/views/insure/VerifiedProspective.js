import { View, html, css } from 'platform/elements';

import '../../components/insure/InsureInformation';

export class InsureVerifiedProspective extends View {

	constructor() {
		super();
	}


	static get styles() {
		return [
			super.styles,
			css`
				.verified-caller{
					width:100%;
					height:100%;
				}					
				`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`<horizon-insure-information class="verified-caller" displayMode="verified-prospective"></horizon-insure-information>`;
	}
}

customElements.define(`horizon-insure-verified-prospective`, InsureVerifiedProspective);
