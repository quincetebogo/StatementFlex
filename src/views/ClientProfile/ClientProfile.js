import { View, html, css } from 'platform/elements';
import 'platform/components/buttons/Button';

import { HorizonStore } from '../../store/HorizonStore';
import { HorizonRouter } from '../../shell/HorizonRouter';
import '../../components/stopCard/StopCard'
import '../../components/Common/AccessMenuBar';
import '../../components/Common/ClientProfileDetails';

export class ClientProfile extends View {

	constructor() {
		super();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
	}

	_onCardsStopped(event) {
		this.horizonStore.saveState(event.detail);
		let stoppedCardsFailed = event.detail.stoppedCards.some(cards => !cards.stopped);

		if (stoppedCardsFailed) {
			this.horizonRouter.navigateToStopCardFailed();
		}
		else {
			this.horizonRouter.navigateToStoppedCards();
		}
	}

	render() {
		console.log('render client profile');
		let tempState = this.horizonStore.recoverState();
		return html`
		<stop-card 
			.confirmedCaller="${tempState}"
			@cards-stopped="${(event) => this._onCardsStopped(event)}">
		</stop-card>`;
	}
}

customElements.define(`client-profile`, ClientProfile);