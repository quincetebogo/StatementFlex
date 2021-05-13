import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

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
 * @extends {ViewBase}
 */
export class StopCardLandingPage extends ViewBase {

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
		HorizonTelemetry.instance.stopCardOutcome({ 
			screen: TelemetryScreen.STOP_CARD_OUTCOME, 
			cards: event.detail.stoppedCards
		});
		
		const stoppedCardsFailed = event.detail.stoppedCards.some(cards => !cards.cardStopped);

		// The stop card incident can be closed if all cards were stopped successfully.
		// Otherwise we go to the failure screen where a retry can be attempted or an assignment done
		this.horizonStore.saveState({ stoppedCards: event.detail.stoppedCards, cardStopAttemptMade: true, stoppedCardsFailed: stoppedCardsFailed });

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
			${this._renderStopCardComponent()}

			${super._webTemplate()}
		`;
	}

	_renderStopCardComponent() {
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