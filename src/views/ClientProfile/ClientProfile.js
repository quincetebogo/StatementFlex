import { View, html, css } from 'platform/elements';

import { Router } from 'platform/Router';
import 'platform/components/buttons/Button';
import { HorizonViewManager } from '../../HorizonViewManager';

import './ClientProfileDetails';
import './AccessComponent';
import './StopCardComponent';

export class ClientProfile extends View {

	constructor() {
		super();
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.router = Router.getInstance();
	}

	_onCardsStopped(event) {
		this.horizonViewManager.saveState(event.detail);
		let hasFailedCards = event.detail.stoppedCards.some(cards => !cards.stopped);
		if (!hasFailedCards) {
			this.router.navigateByPath(`/client/profile/stoppedcards`);
		}
		else {
			this.router.navigateByPath(`/client/profile/stopcardfailed`);
		}
	}

	render() {
		console.log('render client profile');
		let tempState = HorizonViewManager.getInstance().recoverState();
		return html`
		<stop-card 
			.confirmedCaller="${tempState}"
			@cards-stopped="${(event) => this._onCardsStopped(event)}">
		</stop-card>`;
	}
}

customElements.define(`client-profile`, ClientProfile);