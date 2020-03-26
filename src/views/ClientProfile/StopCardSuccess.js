import { View, html, css } from 'platform/elements';

import 'platform/components/buttons/Button';
import { HorizonViewManager } from '../../HorizonViewManager';
import './ClientProfileDetails';
import '../../components/dialogs/CardStopSummary/CardStopSummarySuccess';
import './AccessComponent';

export class StopCardSuccess extends View {

	constructor() {
		super();
	}

	render() {
		console.log('render stop card screen');
		return html`<horizon-stop-card-success .confirmedStop="${HorizonViewManager.getInstance().recoverState()}"></horizon-stop-card-success>`;
	}
}

customElements.define(`horizon-summary-success`, StopCardSuccess);