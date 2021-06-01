import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { css, html } from 'platform/elements';
import { CardService } from 'app/services/CardService';
import { NavigationContext } from 'platform/core';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountBase } from 'app/views/common/SavingsAccountBase';
import { isWellFormedSouthAfricanID } from 'app/utils/channelServiceUtilities';

import 'app/components/dialogs/common/ClientNotVerified';
import 'app/components/dialogs/quickTransactions/TapToPayAgreement';
import 'app/components/dialogs/quickTransactions/DeclineDebiCheckMandate';
import 'app/components/quickTransactions/FavouriteTransactions';
import 'app/components/quickTransactions/CardLimitsLanding';
import 'app/components/quickTransactions/SearchOtherNeed';
import 'app/components/dialogs/quickTransactions/ViewInfoDebiCheck';
import 'app/components/dialogs/quickTransactions/ProofOfAccount';
import 'app/components/quickTransactions/TapToPayLanding';
import 'app/components/common/CardArt';

/**
 * Tap To Pay Landing Page View
 *
 * @export
 * @class Tap To Pay
 * @extends {SavingsAccountBase}
 */
export class TapToPay extends SavingsAccountBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.navigationContext = NavigationContext.getInstance();

		// Recover information from state
		const state = this.horizonStore.recoverState();

		this.isLoading = true;

		// private variables
		this.cards = {};

		this.returnToSub = this.eventAggregator.subscribe(`horizon-return-to-screen`, (e) => this._performAction(e.option));
	
		this.cardService = new CardService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			cards: { attribute: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// Telemetry 
		//Apply tap to pay telemetry here...

		this._updateReturnToScreen();
		this._initialise();
		this._performAction = async (option) => {

			const stopCard = () => this._stopCard();
			const debiCheck = () => this._debiCheck();
			const updateCardLimits = () => this._updateCardLimits();
			const tapToPay = () => this._tapToPay();
			const statements = () => this._getStatements();
			const taxCertificates = () => this._taxCertificates();
			const proofOfAccount = () => this._proofOfAccount();
			const searchOtherNeed = () => this._searchOtherNeed();

			const actions = {
				'stop-card': stopCard,
				'debi-check': debiCheck,
				'update-card-limits': updateCardLimits,
				'tap-to-pay': tapToPay,
				'statements': statements,
				'tax-certificate': taxCertificates,
				'proof-of-account': proofOfAccount,
				'search-other-need': searchOtherNeed
			};

			if (actions[option]) {
				await super._inicidentManager_(option, () => this._toggleBusyFlag());
				this._refreshIncidentDetails();
				return actions[option]();
			}

			/**
			 * When verify now on mini profile is selected, we dont need to perform any action
			 * Returning true for such case
			 */
			return true;
		};
	}

	disconnectedCallback() {
		// Telemetry unload Tap To Pay
		// Apply tap to pay telemetry unload here...
		
		this.returnToSub.dispose();
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {

		if (this.callerInformation.verificationStatus !== `non-client` && isWellFormedSouthAfricanID(this.callerInformation.southAfricanIDNumber)) {
			const landingRequest = {
				cifNumber: this.callerInformation.cifNumber,
				nationalIDNumber: this.callerInformation.southAfricanIDNumber,
				isCallerVerified: this.callerInformation.verificationStatus === `verified`
			};

			 const returnValue = await this.quickTransactionService.favouritesLanding(landingRequest);
			 
			 if (returnValue.succeeded) {
				this.isLoading = false;
				this.landingPageInfo = returnValue.result;
			 }
		} else {
			// minimal object for the Favourites landing page component
			this.isLoading = false;
			this.landingPageInfo = { 
				savingsAccountProductDescription: ``,
				savingsPlanProductDescription: ``,
				insureProductDescription: ``,
				creditProductDescription: ``,
				savingsAccountProductAmount: ``,
				savingsPlanProductAmount: ``,
				insureProductAmount: ``,
				creditProductAmount: ``,
				pendingMandateCount: 0 
			};
		}

		this.verificationStatus = this.callerInformation.verificationStatus;
		// Now we can update the information on the product buttons
		this._updateLeftBar();
		this._performReturnToScreen();
	}

	async _tapToPay() {

		// Telemetry select Tap to Pay
		HorizonTelemetry.instance.selectTapToPay({
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.TAP_TO_PAY
		});

		const returnValue = await this.quickTransactionService.tapToPayLanding(this.callerInformation.cifNumber);
			 
		if (returnValue.succeeded) {
			this.cards = returnValue.result;
			this.renderMode = RENDER_MODE.TAP_TO_PAY;
		}
	}

	async _updateCards(){
		const index = this.cards.findIndex(card => card.cardId === this.selectedCard.cardId);
		this.cards[index].isContactlessActivated = this.selectedCard.isContactlessActivated;
	}

	_toggleTapToPayAgreement(event){
		this.selectedCard = this.cards.find(card => card.cardId === event.currentTarget.card.cardId);
		this.selectedCard.isContactlessActivated = event.detail.new;

		this._updateCards();
		this.showTapToPayAgreement = !this.showTapToPayAgreement;
		
		//Telemetry
		HorizonTelemetry.instance.selectToggle({
			screen: TelemetryScreen.TAP_TO_PAY,
			nextScreen: TelemetryScreen.TAP_TO_PAY_AGREEMENT,
			cardId: this.selectedCard.cardId
		});
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the view stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			.tap-to-pay{
				width: 100%;
				height: 100%;
			}

			capitec-content-box {
				width: 100%;
				height: var(--horizon-panel-height, 888px);
			}
			`
		];
	}

	_webTemplate() {
		return html`
			${this._renderTapToPayLandingPage()}
			${this._renderTapToPay()}

			${super._webTemplate()}
		`;
	}

	_renderTapToPayLandingPage() {
		switch (this.renderMode) {
			case RENDER_MODE.TAP_TO_PAY:
			case RENDER_MODE.TAP_TO_PAY_SUCCESS:
			case RENDER_MODE.TAP_TO_PAY_UNSUCCESS:
				return html`
					<horizon-tap-to-pay-landing 
						class="tap-to-pay"
						.cards="${this.cards}"
						@update-cards="${(e) => this._updateCards(e)}"
						@toggle-agreement="${(event) => this._toggleTapToPayAgreement(event)}"
						.incomingCallDetails="${this.incomingCallDetails}"
						.callerInformation="${this.callerInformation}"
						.verificationStatus="${this.callerInformation.verificationStatus}"
						?displayVerificationStatusToast="${this._shouldToastDisplay()}"
						@verify-click="${() => super._verifyClick()}"
						@option-click="${(e) => this._onFavouritesOptionClick(e)}">
					</horizon-tap-to-pay-landing>`;
			default:
				return html``;
		}
	}

	_renderTapToPay() {
		return this.renderMode === RENDER_MODE.TAP_TO_PAY 
		? html` 
			<horizon-tap-to-pay-landing
				.cards="${this.cards}"
				@back="${() => this._backToLandingPage()}"
			></horizon-tap-to-pay-landing>
		` : html``;
	}
}

customElements.define(`horizon-tap-to-pay`, TapToPay);