import { View, html } from 'platform/elements';

import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'platform/components/buttons/Button';
import 'app/components/stopCard/StopCard';
import 'app/components/common/AccessMenuBar';
import 'app/components/common/ClientProfileDetails';

export class ClientProfile extends View {

	constructor() {
		super();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
	}

	_onCardsStopped(event) {
		this.horizonStore.saveState(event.detail);
		const stoppedCardsFailed = event.detail.stoppedCards.some(cards => !cards.stopped);

		if (stoppedCardsFailed) {
			this.horizonRouter.navigateToStopCardFailed();
		} else {
			this.horizonRouter.navigateToStoppedCards();
		}
	}

	render() {
		console.log(`render client profile`);
		const tempState = this.horizonStore.recoverState();
		return html`
		<stop-card 
			.confirmedCaller="${tempState}"
			@cards-stopped="${(event) => this._onCardsStopped(event)}">
		</stop-card>`;
	}
}

customElements.define(`client-profile`, ClientProfile);