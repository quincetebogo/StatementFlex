import { View, css, html } from 'platform/elements';

import 'app/components/insure/ThirdPartyOrExistingClient';

export class VerifiedExistingClient extends View {

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
				"icon": `system/notes-action`,
				"imgSRC": ``,
				"iconSize": `default`,
				"label": `View Plan`
			},
			{
				"icon": `system/edit-action`,
				"imgSRC": ``,
				"iconSize": `default`,
				"label": `Update Plan`
			},
			{
				"icon": `system/cash-action`,
				"imgSRC": ``,
				"iconSize": `default`,
				"label": `Pay Arrears`
			},
			{
				"icon": `system/documents-action`,
				"imgSRC": ``,
				"iconSize": `default`,
				"label": `How to Claim`
			},
			{
				"icon": ``,
				"imgSRC": `email-action.svg`,
				"iconSize": `default`,
				"label": `Email Plan`
			},
			{
				"icon": `system/info-action`,
				"imgSRC": ``,
				"iconSize": `default`,
				"label": `Benefits`
			},
			{
				"icon": ``,
				"imgSRC": `close-action.svg`,
				"iconSize": `default`,
				"label": `Cancel Plan`
			}
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon-third-party-or-existing-client 
				.solutionsAvailable="${this.solutionsAvailable}" 
				clientType="verified-existing-client">
			</horizon-third-party-or-existing-client>`;
	}
}

customElements.define(`insure-verified-existing-client`, VerifiedExistingClient);