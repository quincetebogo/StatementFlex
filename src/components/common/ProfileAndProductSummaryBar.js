import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

import 'app/components/common/MiniProfile';
import 'app/components/common/FavouritesTile';
import 'platform/components/buttons/ProductTile';

/**
 * ProfileAndProductSummaryBar displays the left hand bar of the Horizon display. This contains
 * the mini client profile, product buttons and various short cuts depending on the
 * state of the system
 *
 * @export
 * @class ProfileAndProductSummaryBar
 * @extends {Component}
 */
export class ProfileAndProductSummaryBar extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.EventAggregator = EventAggregator.getInstance();
		
		this.clientType = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			clientType: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// ---------
	// EVENTS
	// ---------

	// --------- 
	// PRIVATE
	// ---------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			.left-card {
				width: 440px;
				height: 770px;
				padding: 0px 0px 0px 0px;
			}
			.favourites-button{
                padding: 0px 0px 0px 0px;
				width: 440px;
				margin-top: 16px;
			}
			`
		];
	}

	render() {
		return html`
		<section class="left-card">
		 	<horizon-mini-profile></horizon-mini-profile>
			 <horizon-favourites-tile class="favourites-button" label="Favourites" subtitle="Transact, dispute, cards and more"></horizon-favourites-tile>
			<horizon-product-bar ?disablenavigation=${true}></horizon-product-bar>
		</section>`;
	}
}

window.customElements.define(`horizon-profile-and-product-summary-bar`, ProfileAndProductSummaryBar);