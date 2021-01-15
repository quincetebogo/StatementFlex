import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

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

		console.log(`ProfileAndProductSummaryBar - constructor`);

		this.miniProfile = {
			name: ``,
			idNumber: ``,
			phoneNumber: ``,
			livesIn: ``,
			languagePreference: ``,
			birthday: ``,
			showButtons: false,
			isConfirmed: false,
			isVerified: false,
			verificationFailed: false,
			is3rdParty: false,
			isNonClient: false
		};

		this.disableNavigation = true;
		this.hasFavourites = false;
		this.subtitle = {};
		this.detail = null;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		this.stateChangeSub = this.horizonStore.stateChanged.subscribe(state => this._stateChanged(state));

		this.eventAggregator.subscribe(`horizon-update-mini-profile`, (miniProfile) => this._updateMiniProfile(miniProfile));
		this.eventAggregator.subscribe(`horizon-update-left-hand-bar`, (buttonConfig) => this._onUpdatePageDetails(buttonConfig));
		this.eventAggregator.subscribe(`horizon-favorites-bar`, (e) => this.hasFavourites = e.hasFavourites);
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 *
	 * @property {Object} miniProfile Object holds client profile information
	 * @property {Boolean} disableNavigation Flag to disable navigation to client need landing pages
	 * @property {Boolean} disableNavigation Flag to disable navigation to client need landing pages
	 * 
	 * @readonly
	 * @static
	 * @memberof ProfileAndProductSummaryBar
	 */
	static get properties() {
		return {
			miniProfile: { type: Object },
			disableNavigation: { type: Boolean },
			hasFavourites: { type: Boolean },
			subtitle: { type: Object },
			detail: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		console.log(`ProfileAndProductSummaryBar - connectedCallBack`);
	}

	// ---------
	// EVENTS
	// ---------

	_stateChanged(state) {
		if (state && state.miniProfile) {
			this.miniProfile = state.miniProfile;
		}

		if (state && state.leftBarButtonConfig) {
			this.hasFavourites = state.leftBarButtonConfig.hasFavourites;
			this.subtitle = state.leftBarButtonConfig.subtitle;
			this.detail = state.leftBarButtonConfig.detail;
		}
	}

	_updateMiniProfile(miniProfile) {
		if (miniProfile) {
			this.miniProfile = miniProfile;
		}
	}

	_onUpdatePageDetails(buttonConfig) {
		this.hasFavourites = buttonConfig.hasFavourites;
		this.subtitle = buttonConfig.subtitle;
		this.detail = buttonConfig.detail;
	}

	// --------- 
	// PRIVATE
	// ---------

	_favouritesClicked() {
		const state = this.horizonStore.recoverState();
		this.horizonRouter.navigateToLandingPage(`Transact`, state.callerInformation.hasInsuranceProducts);
	}

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

	_webTemplate() {
		return html`
		<section class="left-card">
			<horizon-mini-profile 
				.miniProfile="${this.miniProfile}">
			</horizon-mini-profile>
			
			${this._renderFavourites()}
			
			<horizon-product-button-panel
				.subtitle="${this.subtitle}"
				.detail="${this.detail}"
				?disablenavigation=${true}>
			</horizon-product-button-panel>
		</section>`;
	}

	_renderFavourites() {
		const activePage = this.horizonRouter._getCurrentRoute();

		if (this.hasFavourites) {
			return html`
				<horizon-favourites-tile
					class="favourites-button"
					label="Favourites"
					subtitle="Transact, dispute, cards and more"
					@click="${() => this._favouritesClicked()}"
					?selected=${activePage.title === `Favourites`}>
				</horizon-favourites-tile>`;
		};
		return html``;
	}
}

window.customElements.define(`horizon-profile-and-product-summary-bar`, ProfileAndProductSummaryBar);