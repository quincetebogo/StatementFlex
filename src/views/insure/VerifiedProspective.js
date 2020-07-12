import { View, html, css } from 'platform/elements';

import '../../components/insure/InsureBenefitNonClient';

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

	render() {
		return html`<horizon-insure-benefit-nonclient class="verified-caller" displayMode="verified-prospective"></horizon-insure-benefit-nonclients>`;
	}
}

customElements.define(`horizon-insure-verified-prospective`, InsureVerifiedProspective);
