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

		this.leftBarSub = this.eventAggregator.subscribe(`horizon-update-left-hand-bar`, (buttonConfig) => this._updateButtons(buttonConfig));
		this.favouritesBarSub = this.eventAggregator.subscribe(`horizon-favorites-bar`, (e) => this.hasFavourites = e.hasFavourites);
		this.navContextSub = this.eventAggregator.subscribe(`platform-navigation-context-updated`, () => this._onNavigationContextUpdated());

		this.product = ``;
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
			hasFavourites: { attribute: false },
			subtitle: { attribute: false },
			detail: { attribute: false },
			activePageTitle: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		this.leftBarSub.dispose();
		this.favouritesBarSub.dispose();
		this.navContextSub.dispose();
		this.stateChangeSub.unsubscribe();
		
		super.disconnectedCallback();
	}

	// ---------
	// EVENTS
	// ---------

	_stateChanged(state) {
		if (state && state.callerInformation) {
			this.callerInformation = state.callerInformation;

			let contactNumber = ``;
			const isNonClient = state.callerInformation.verificationStatus === `non-client`;

			if (isNonClient && state.callerInformation.nonClientCellPhone && state.callerInformation.nonClientCellPhone !== ``) {
				contactNumber = state.callerInformation.nonClientCellPhone;
			} else if (state.callerInformation.verifiedTelephoneNumber && state.callerInformation.verifiedTelephoneNumber !== ``) {
				contactNumber = state.callerInformation.verifiedTelephoneNumber;
			} else {
				contactNumber = state.callerInformation.incomingTelephoneNumber;
			}
	
			this.miniProfile = {
				name: state.callerInformation.isNonClient ? state.callerInformation.nonClientFullName : state.callerInformation.name,
				idNumber: state.callerInformation.southAfricanIDNumber,
				phoneNumber: contactNumber,
				livesIn: state.callerInformation.livesIn,
				languagePreference: state.callerInformation.languagePreference,
				birthday: state.callerInformation.birthdate,
				showButtons: state.callerInformation.verificationStatus === `verified`,
				isVerified: state.callerInformation.verificationStatus === `verified`,
				verificationFailed: state.callerInformation.verificationStatus === `failed`,
				isConfirmed: state.callerInformation.verificationStatus !== `non-client`,
				isNonClient: isNonClient,
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

	_onNavigationContextUpdated() {
		// TODO: _getCurrentRoute() was supposed to be a private function, re-evaluate
		const activePage = this.horizonRouter._getCurrentRoute(); 

		// Initialise activePage properly if the current route is not yet readable
		if (!activePage) {
			this.activePageTitle = ``;
		} else {
			this.activePageTitle = activePage.title;
			if (this.activePageTitle === `ProductInfo`) {
				this.activePageTitle = this.product;
			}
		}
	};

	_productButtonClick(event) {
		this.product = event.detail.productButton;
		
		// Note that when invoked from the agent's waiting for call landing page we will
		// not have caller information
		if (this.callerInformation) {
			if (this.callerInformation.verificationStatus === `verified`) {
				this.horizonRouter.navigateToLandingPage(this.product, false);
			} else {
				this.horizonRouter.navigateToProductInfo(this.product);
			}
		} 
	}

	_favouritesClicked() {
		this.product = ``;
		this.horizonRouter.navigateToLandingPage(`Transact`, this.callerInformation.hasInsuranceProducts);
	}

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
				width: var(--horizon-left-panel-width, 440px);
				height: 770px;
				padding: 0px 0px 0px 0px;
			}
			.favourites-button{
                padding: 0px 0px 0px 0px;
				width: var(--horizon-left-panel-width, 440px);
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
				selectedButton="${this.activePageTitle}"
				@click="${(e) => this._productButtonClick(e)}">
			</horizon-product-button-panel>
		</section>`;
	}

	_renderFavourites() {
		if (this.hasFavourites) {
			return html`
				<horizon-favourites-tile
					class="favourites-button"
					label="Favourites"
					subtitle="Transact, dispute, cards and more"
					@click="${() => this._favouritesClicked()}"
					?selected=${this.activePageTitle === `Favourites`}>
				</horizon-favourites-tile>`;
		};
		return html``;
	}
}

window.customElements.define(`horizon-profile-and-product-summary-bar`, ProfileAndProductSummaryBar);