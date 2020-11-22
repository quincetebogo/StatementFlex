import { View, css, html } from 'platform/elements';
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
				width: 100%;
				height: 888px;
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