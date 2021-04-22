import { View, css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/insure/ThirdPartyOrExistingClient';

/**
 * Implements the view for Insure verified and unverified existing clients (i.e. the client has products)
 * This includes the view for third parties phoning in about an existing client.
 *
 * The view is context sensitive to the incoming callers verification status. 
 * 
 * @export
 * @class ExistingClient
 * @extends {View}
 */
export class ExistingClient extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.horizonStore = HorizonStore.getInstance();
		
		this.callerInformation = this.horizonStore.getCallerInformation();
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		switch (this.callerInformation.verificationStatus) {
			case `verified`:
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
				break;
			case `unverified`:
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
			break;
			case `3rdparty`:
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
				break;
			default:
				this.solutionsAvailable = [];
		}
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


	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon-third-party-or-existing-client 
				.solutionsAvailable="${this.solutionsAvailable}">
			</horizon-third-party-or-existing-client>`;
	}
}

customElements.define(`horizon-existing-client`, ExistingClient);