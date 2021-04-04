import { View, html } from 'platform/elements';

import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'platform/components/buttons/Button';
import 'app/components/stopCard/StopCard';
import 'app/components/common/AccessMenuBar';
import 'app/components/common/ProfileAndProductSummaryBar';


/**
 * The Stop Card Landing Page. This view is currently based on the v1 Stop Card designs and will be completely redone
 * with the newer designs at some point.
 *
 * @export
 * @class StopCardLandingPage
 * @extends {View}
 */
export class StopCardLandingPage extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.isBusy = false;

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		const state = this.horizonStore.recoverState();

		this.clientProfileDetails = state.clientProfileDetails;

		this.callerInformation = this.horizonStore.getCallerInformation(); 
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			isBusy: { attribute: false }
		};
	}

	// ------------------
	// LIFCYCLE OVERRIDES
	// ------------------

	connectedCallback() {
		super.connectedCallback();
		super._inicidentManager_(`stop-card`, () => this._toggleBusyFlag());
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_stoppedCards(event) {
		this.horizonStore.saveState(event.detail);
		const stoppedCardsFailed = event.detail.stoppedCards.some(cards => !cards.cardStopped);

		if (stoppedCardsFailed) {
			this.horizonRouter.navigateToStopCardFailed();
		} else {
			this.horizonRouter.navigateToStoppedCards();
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<horizon-stop-card
				.clientProfileDetails="${this.clientProfileDetails}"
				.incomingCallDetails="${this.incomingCallDetails}"
				@cards-stopped="${(event) => this._stoppedCards(event)}">
			</horizon-stop-card>
			${this._renderLoadingIndicator()}
		`;
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}
}

customElements.define(`horizon-stop-card-landing-page`, StopCardLandingPage);