import { Component, css, html } from 'platform/elements';
import { CreditEvents } from 'app/constants/telemetry/events/Credit';
import { CreditService } from 'app/services/CreditService';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { LANDING_PAGE_NEEDS } from 'app/constants/Common';
import { LandingPageEvents } from 'app/constants/telemetry/events/LandingPage';
import { LiveBetterEvents } from 'app/constants/telemetry/events/LiveBetter';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RoleManager } from 'app/shell/RoleManager';
import { SavingsAccLandingPage } from 'app/constants/telemetry/events/SavingsAccount';
import { SavingsPlanEvents } from 'app/constants/telemetry/events/SavingsPlan';


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
			liveBetterSavings: ``,
			savingsPlan: ``,
			insure: ``, 
			credit: ``
		};

		this.detail = {
			savingsAccount: ``,
			liveBetterSavings: ``,
			savingsPlan: ``,
			insure: ``, 
			credit: ``
		};

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this._telemetry = HorizonTelemetry.getInstance();
		this.roleManager = RoleManager.getInstance();

		this.stateChangeSub = this.horizonStore.stateChanged.subscribe(state => this._stateChanged(state));

		this.leftBarSub = this.eventAggregator.subscribe(`horizon-update-left-hand-bar`, (buttonConfig) => this._updateButtons(buttonConfig));
		this.favouritesBarSub = this.eventAggregator.subscribe(`horizon-favorites-bar`, (e) => this.hasFavourites = e.hasFavourites);
		this.navContextSub = this.eventAggregator.subscribe(`platform-navigation-context-updated`, () => this._onNavigationContextUpdated());

		this.activePageTitle = ``;
		this.product = ``;
		
		this.creditService = new CreditService(() => true, ex => true);
		this.quickTransactionService = new QuickTransactionsService(() => true, () => true);
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
			miniProfile: { state: true },
			hasFavourites: { state: true },
			subtitle: { state: true },
			detail: { state: true },
			activePageTitle: { state: true } // Determines which product button should be highlighted
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._updateProductTileInfo();
		this._setActivePageTitle();
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
		if (state?.callerInformation) {
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
				verificationAttempts: state.callerInformation.verificationAttempts,
				profilePhoto: state.callerInformation.profilePhoto,
				isBranchConsultant: state.callerInformation.isBranchConsultant
			};
		}

		if (state?.leftBarButtonConfig) {
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
		this._setActivePageTitle();
	};

	_setActivePageTitle() {
		const activePage = this.horizonRouter.getCurrentRoute(); 

		// Initialise activePage properly if the current route is not yet readable
		if (!activePage) {
			this.activePageTitle = ``;
			return;
		} 
		
		// this.activePageTitle is passed to the horizon-product-button-panel control and is used to
		// determine which product button should be highlighted.
		this.activePageTitle = activePage.title;
		if (this.activePageTitle === `ProductInfo`) {
			this.activePageTitle = this.product;
		}
	}

	async _productButtonClick(event) {
		await this._clearPrevProductSpans(this.product, event.detail.productButton);
		
		this.product = event.detail.productButton;

		await this._telemetry.logEvent(LandingPageEvents[`PRODUCT_BUTTON_${this.product}`], {});
		this._setIncidentDone();

		// Clear return to state before navigation
		this.horizonStore.clearReturnScreen();
		
		// Note that when invoked from the agent's waiting for call landing page we will
		// not have caller information
		if (!this.callerInformation) {
			return;
		}

		if (this.product !== `Insure` && this.roleManager.isInsureAgent) {
			this.horizonRouter.navigateToUnavaliableForRole();
			return;
		}

		if (this.callerInformation.verificationStatus === `unverified` 
				&& (this.product === `LiveBetter` || this.product === `SavingsPlan` || this.product === `Credit` || this.product === `SavingsAccount` || this.product === `Insure`)) {
			this.horizonRouter.navigateToLandingPage(this.product, this.callerInformation.hasInsuranceProducts);
			return;
		}

		if (this.callerInformation.verificationStatus === `verified`) {
			this.horizonRouter.navigateToLandingPage(this.product, this.callerInformation.hasInsuranceProducts);
			return;
		}
		
		this.horizonRouter.navigateToProductInfo(this.product);
	}

	async _favouritesClicked() {
		await this._clearPrevProductSpans(this.product, ``);
		await this._telemetry.logEvent(LandingPageEvents.PRODUCT_BUTTON_FAVOURITES, {});

		this.product = ``;
		this.horizonStore.clearReturnScreen();

		if (this.roleManager.isInsureAgent) {
			this.horizonRouter.navigateToUnavaliableForRole();
			return;
		}

		this.horizonRouter.navigateToLandingPage(`Transact`, this.callerInformation.hasInsuranceProducts);
	}

	// --------- 
	// PRIVATE
	// ---------

	async _updateProductTileInfo() {

		let productTilesInfo = {};

		if (!this.callerInformation || this.callerInformation.verificationStatus === `non-client`) {
			const landingRequest = {
				cifNumber: this.callerInformation.cifNumber,
				nationalIDNumber: this.callerInformation.southAfricanIDNumber,
				isCallerVerified: this.callerInformation.verificationStatus === `verified`
			};
	
			const returnValues = await Promise.allSettled([this.quickTransactionService.favouritesLanding(landingRequest), this.creditService.creditBalance(this.callerInformation.cifNumber, () => true)]);
	
			if (returnValues[0].status === `fulfilled` && returnValues[0].value.succeeded) {
				this.isLoading = false;
	
				productTilesInfo = returnValues[0].value.result;
				
				/* 
				* NOTE: This is a work around as the favourites landing does not return credit information. 
				* NOTE: This implementation will not include credit information in the favourites landing call fails.
				* TODO: Develop better solution (CSCEH-7747)
				*/
				if (returnValues[1].status === `fulfilled` && returnValues[1].value.succeeded && returnValues[1].value.result.availableBalance !== null) {
					if (this.callerInformation.verificationStatus === `verified`) {
						productTilesInfo.creditProductDescription = `Available balance`;
						productTilesInfo.creditProductAmount = formatCurrency(returnValues[1].value.result.availableBalance);
					} else {
						productTilesInfo.creditProductDescription = `Active`;
						productTilesInfo.creditProductAmount = ``;
					}
				}
			}
		} else {
			productTilesInfo = {
				savingsAccountProductDescription: ``,
				savingsPlanProductDescription: ``,
				liveBetterBankingProductDescription: ``,
				insureProductDescription: ``,
				creditProductDescription: ``,
				savingsAccountProductAmount: ``,
				savingsPlanProductAmount: ``,
				liveBetterBankingProductAmount: ``,
				insureProductAmount: ``,
				creditProductAmount: ``
			};
		}

		this.subtitle = {
			savingsAccount: productTilesInfo.savingsAccountProductDescription,
			liveBetterSavings: productTilesInfo.liveBetterBankingProductDescription,
			savingsPlan: productTilesInfo.savingsPlanProductDescription,
			insure: productTilesInfo.insureProductDescription,
			credit: productTilesInfo.creditProductDescription
		};

		this.detail = {
			savingsAccount: productTilesInfo.savingsAccountProductAmount,
			liveBetterSavings: productTilesInfo.liveBetterBankingProductAmount,
			savingsPlan: productTilesInfo.savingsPlanProductAmount,
			insure: productTilesInfo.insureProductAmount,
			credit: productTilesInfo.creditProductAmount
		};

		this.hasFavourites = true;

		const updatedProductButtonInfo = {
			subtitle: this.subtitle,
			detail: this.detail,
			hasFavorutie: this.hasFavourites
		};
		
		// Now we can update the information on the product buttons
		this.horizonStore.setLeftBarProductTilesInfoState(updatedProductButtonInfo);

	}

	/**
	 * Private function to clear all active telemetry span associated to current
	 * product screen
	 * 
	 * @param {any} current Current product screen
	 * @param {any} incoming Product screen navigating to
	 * @returns {Promise<void>} A promise for clearing/closing active telemetry spands
	 */
	async _clearPrevProductSpans(current, incoming) {
		if (current === incoming) {
			return;
		}

		const productEvents = {
			'SavingsAccount': SavingsAccLandingPage.SAVINGS_ACCOUNT,
			'SavingsPlan': SavingsPlanEvents.SAVINGS_PLAN,
			'LiveBetter': LiveBetterEvents.LIVE_BETTER,
			'Insure': ``,
			'Credit': CreditEvents.CREDIT
		};

		if (!this.product) {
			await this._telemetry.closeChildSpans(QuickTransactionEvents.FULFILL_NEED);
		} else {
			await this._telemetry.endSpan(productEvents[this.product], {}, false, false, true);
		}
	}

	_setIncidentDone() {
		const incidentManager = HorizonIncidentManager.getInstance();
		
		if (Object.values(LANDING_PAGE_NEEDS).includes(incidentManager.incidentState) &&
			incidentManager.incidentState !== super.HORIZON_NEED_STATUS.NOT_STARTED) {
				incidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
		}
	}

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
				.miniProfile="${this.miniProfile}"
				.isHelpDeskAgent="${this.roleManager.isHelpDeskAgent}"
				?isInsureAgent="${this.roleManager.isInsureAgent}">
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
			return html`
				<horizon-favourites-tile
					data-automation-id="profile-and-product-summary-bar-favourites"
					class="favourites-button"
					label="Favourites"
					subtitle="Transact, dispute, cards and more"
					@click="${() => this._favouritesClicked()}"
					?selected=${this.activePageTitle === `Favourites`}>
				</horizon-favourites-tile>`;
	}
}

window.customElements.define(`horizon-profile-and-product-summary-bar`, ProfileAndProductSummaryBar);