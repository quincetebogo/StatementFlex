import { View, css, html } from 'platform/elements';

import 'app/components/quickTransactions/TransactionFavourites';

/**
 * The Favourites view for unverified client. Only information about favourites will be accessible.
 *
 * @export
 * @class Favourites
 * @extends {View}
 */
export class FavouritesUnverified extends View {

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
		return html`<horizon-favourites-transations class="favourites" displayMode="favourites-verified"></horizon-favourites-transations>`;
	}
}

customElements.define(`horizon-unverified-favourites`, FavouritesUnverified);