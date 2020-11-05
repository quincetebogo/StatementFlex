import { View, css, html } from 'platform/elements';

import 'app/components/quickTransactions/TransactionFavourites';

/**
 * The Insure view for a non-client. Only information about insurance products will be accessible.
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
		return html`<horizon-favourites-transations class="favourites"></horizon-favourites-transations>`;
	}
}

customElements.define(`horizon-favourites`, Favourites);