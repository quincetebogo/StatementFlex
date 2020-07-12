import { View, html, css } from 'platform/elements';

import '../../components/insure/InsureBenefitNonClient';

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

	render() {
		return html`<horizon-insure-benefit-nonclient class="unverified-caller" displayMode="unverified-prospective"></horizon-insure-benefit-nonclients>`;
	}
}

customElements.define(`horizon-insure-unverified-prospective`, InsureUnverifiedProspective);
