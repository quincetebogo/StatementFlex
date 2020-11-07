import { View, css, html } from 'platform/elements';
import { EventAggregator, NavigationContext, Router } from 'platform/core';
import 'app/components/quickTransactions/FavouriteTransactions';

/**
 * The Favourites view for a verified-client.
 *
 * @export
 * @class Favourites
 * @extends {View}
 */
export class Favourites extends View {

	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
			.favourites{
				width:100%;
				height:100%;
			}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`<horizon-favourites-transactions class="favourites"></horizon-favourites-transactions>`;
	}
}

customElements.define(`horizon-favourites`, Favourites);