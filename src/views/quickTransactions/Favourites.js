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
		this.eventAggregator = EventAggregator.getInstance();
		this.navigationContext = NavigationContext.getInstance();
		this.router = Router.getInstance();
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
		// valid parameters are verified | unverified | failed
		const params = this.navigationContext.current.queryParams;

		// TODO: Put a check in here that the verification status in state matches the verification status parameter

		return html`<horizon-favourites-transactions class="favourites" verificationStatus="${params.verificationStatus}"></horizon-favourites-transactions>`;
	}
}

customElements.define(`horizon-favourites`, Favourites);