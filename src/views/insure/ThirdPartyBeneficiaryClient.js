import { View, css, html } from 'platform/elements';

import 'app/components/insure/ThirdPartyOrExistingClient';

export class ThirdPartyBeneficiaryClient extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				:host{
					width: 100%;
					height: 100%;
				}
			`
		];
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.solutionsAvailable = [
			{
				"icon": `system/documents-action`,
				"imgSRC": ``,
				"iconSize": `default`,
				"label": `How to Claim`
			},
			{
				"icon": `system/notes-action`,
				"imgSRC": ``,
				"iconSize": `default`,
				"label": `View Status`
			}
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon-third-party-or-existing-client 
				.solutionsAvailable="${this.solutionsAvailable}" 
				clientType="third-party-client">
			</horizon-third-party-or-existing-client>`;
	}
}

customElements.define(`insure-third-party-client`, ThirdPartyBeneficiaryClient);