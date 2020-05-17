import { View, html, css } from 'platform/elements';

import { Router } from 'platform/Router';
import 'platform/components/buttons/Button';
import { HorizonStore } from '../../store/HorizonStore';

import './ClientProfileDetails';
import './AccessComponent';
import './StopCardComponent';

export class ClientProfile extends View {

	constructor() {
		super();
		this.horizonStore = HorizonStore.getInstance();
		this.router = Router.getInstance();
	}

	_onCardsStopped(event) {
		this.horizonStore.saveState(event.detail);
		let stoppedCardsFailed = event.detail.stoppedCards.some(cards => !cards.stopped);

		if (stoppedCardsFailed) {
			this.router.navigateByPath(`/client/profile/stopcardfailed`);
		}
		else {
			this.router.navigateByPath(`/client/profile/stoppedcards`);
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