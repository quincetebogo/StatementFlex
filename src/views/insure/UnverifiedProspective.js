import { View, html, css } from 'platform/elements';

import '../../components/insure/InsureInformation';

export class InsureUnverifiedProspective extends View {

	constructor() {
		super();
	}


	static get styles() {
		return [
			super.styles,
			css`
				.unverified-caller{
					width:100%;
					height:100%;
				}					
				`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`<horizon-insure-information class="unverified-caller" displayMode="unverified-prospective"></horizon-insure-information>`;
	}
}

customElements.define(`horizon-insure-unverified-prospective`, InsureUnverifiedProspective);
