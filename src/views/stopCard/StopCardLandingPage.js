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

	constructor() {
		super();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		const state = this.horizonStore.recoverState();

		this.clientProfileDetails = state.clientProfileDetails;
		this.callerInformation = state.callerInformation; 
		this.incomingCallDetails = state.incomingCallDetails;
	}

	_stoppedCards(event) {
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

	render() {
		return html`
		<horizon-stop-card
			.clientProfileDetails="${this.clientProfileDetails}"
			.incomingCallDetails="${this.incomingCallDetails}"
			@cards-stopped="${(event) => this._stoppedCards(event)}">
		</horizon-stop-card>`;
	}
}

customElements.define(`horizon-stop-card-landing-page`, StopCardLandingPage);