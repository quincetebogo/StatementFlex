import { HorizonTelemetry, OutcomeScreen } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { html } from 'platform/elements';

import 'platform/components/buttons/Button';
import 'app/components/stopCard/StopCard';
import 'app/components/common/AccessMenuBar';
import 'app/components/common/ProfileAndProductSummaryBar';

const RENDER_MODE = {
	MAIN_PAGE: 0,
	CARD_STOP_MODAL: 1,
	CARD_STOP_SUCCESS: 2,
	END_CALLSESSION: 3,
	ASSIGN: 4,
	ASSIGN_REASON_SELECTED: 5,
	VERIFY_NOW: 6,
	ADD_CALLER_DETAILS: 7
};

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
		
		this.screenDetails = this.horizonStore.getScreenDetails();
		this.cards = this.screenDetails && this.screenDetails.cards;
		
		this._telemetry = HorizonTelemetry.instance;
	}

	// --------------
	// PROPERTIES
	// --------------
	
	// ------------------
	// LIFCYCLE OVERRIDES
	// ------------------

	connectedCallback() {
		super.connectedCallback();
		super._inicidentManager_(`stop-card`, () => this._toggleBusyFlag());

		this._telemetry.startSpan(QuickTransactionEvents.FULFILL_NEED, { 
			"screen": TelemetryScreen.STOP_CARD
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_stoppedCards(event) {
		const stoppedCardsFailed = event.detail.stoppedCards.some(cards => !cards.cardStopped);

		// The stop card incident can be closed if all cards were stopped successfully.
		// Otherwise we go to the failure screen where a retry can be attempted or an assignment done
		const screenDetails = this.horizonStore.getScreenDetails();
		
		screenDetails.stoppedCards = event.detail.stoppedCards;
		screenDetails.cardStopAttemptMade = true;
		screenDetails.stoppedCardsFailed = stoppedCardsFailed;

		this.horizonStore.setScreenDetails(screenDetails);
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_OUTCOME, { 
			"screen": TelemetryScreen.STOP_CARD_OUTCOME,
			"next-screen": stoppedCardsFailed ? OutcomeScreen.FAIL : OutcomeScreen.SUCCESS
		}, true);

		if (stoppedCardsFailed) {
			this.horizonRouter.navigateToStopCardFailed();
		} else {
			this.horizonRouter.navigateToStoppedCards();
		}
	}

	_clientVerified(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this._updateLeftBar();
		this.renderMode = RENDER_MODE.MAIN_PAGE;		
	}
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_updateLeftBar() {
		this.horizonStore.setCallerInformation(this.callerInformation);
		
		this.eventAggregator.publish(
			`horizon-update-left-hand-bar`,
			{
				hasFavourites: true,
				subtitle: {
					savingsAccount: ``,
					savingsPlan: ``,
					insure: ``,
					credit: ``
				},
				detail: {
					savingsAccount: ``,
					savingsPlan: ``,
					insure: ``,
					credit: ``
				}
			}
		);
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
				data-automation-id="stop-card-landing-page"
				.cards="${this.cards || []}"
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