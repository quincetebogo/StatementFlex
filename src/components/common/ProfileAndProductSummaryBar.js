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

		this.miniProfile = null;

		this.disableNavigation = true;
		this.hasFavourites = false;

		this.subtitle = {
			savingsAccount: ``,
			savingsPlan: ``,
			insure: ``, 
			credit: ``
		};

		this.detail = {
			savingsAccount: ``,
			savingsPlan: ``,
			insure: ``, 
			credit: ``
		};

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		this.stateChangeSub = this.horizonStore.stateChanged.subscribe(state => this._stateChanged(state));

		this.eventAggregator.subscribe(`horizon-update-left-hand-bar`, (buttonConfig) => this._updateButtons(buttonConfig));
		this.eventAggregator.subscribe(`horizon-favorites-bar`, (e) => this.hasFavourites = e.hasFavourites);
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 *
	 * @readonly
	 * @static
	 * @memberof ProfileAndProductSummaryBar
	 */
	static get properties() {
		return {
			miniProfile: { attribute: false },
			disableNavigation: { attribute: false },
			hasFavourites: { attribute: false },
			subtitle: { attribute: false },
			detail: { attribute: false }
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

	_stateChanged(state) {
		if (state && state.callerInformation) {
			this.miniProfile = {
				name: state.callerInformation.isNonClient ? state.callerInformation.nonClientFullName : state.callerInformation.name,
				idNumber: state.callerInformation.southAfricanIDNumber,
				phoneNumber: state.callerInformation.verificationStatus !== `non-client` ? state.callerInformation.verifiedTelephoneNumber : state.incomingCallDetails.incomingTelephoneNumber,
				livesIn: state.callerInformation.livesIn,
				languagePreference: state.callerInformation.languagePreference,
				birthday: state.callerInformation.birthdate,
				showButtons: state.callerInformation.verificationStatus === `verified`,
				isVerified: state.callerInformation.verificationStatus === `verified`,
				verificationFailed: state.callerInformation.verificationStatus === `failed`,
				isConfirmed: state.callerInformation.verificationStatus !== `non-client`,
				isNonClient: state.callerInformation.verificationStatus === `non-client`,
				is3rdParty: state.callerInformation.verificationStatus === `3rdparty`,
				hasDigitalChannels: state.callerInformation.hasDigitalChannels,
				verificationAttempts: state.callerInformation.verificationAttempts
			};
		}

		if (state && state.leftBarButtonConfig) {
			this.hasFavourites = state.leftBarButtonConfig.hasFavourites;
			this.subtitle = state.leftBarButtonConfig.subtitle;
			this.detail = state.leftBarButtonConfig.detail;
		}
	}

	_updateButtons(buttonConfig) {
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
				?disablenavigation= ${true}>
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