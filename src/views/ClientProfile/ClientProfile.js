import { View, html, css } from 'platform/elements';

import 'platform/components/buttons/Button';
import './ClientProfileDetails';
import './StopCardComponent';
import './AccessComponent';

export class ClientProfile extends View {

	constructor() {
		super();
	}

	render() {
		console.log('render client profile');
		return html`<stop-card></stop-card>`;
	}
}

customElements.define(`client-profile`, ClientProfile);