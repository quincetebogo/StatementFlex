import { View, html, css } from 'platform/elements';

import 'platform/components/buttons/Button';
import './ClientProfileDetails';
import './StopCardComponent';
import './AccessComponent';

export class ClientProfile extends View {

	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
				/* TODO: Move styles into new component for action bar where necessary */
				capitec-action-bar{
					border-top: ridge;
					border-bottom: ridge;
				}
				capitec-action-bar > capitec-label {
					margin: 15px 10px 0px 10px;
					color: #003652;
					font: bold 18px/35px Hind Vadodara;
				}
				capitec-action-bar > capitec-icon {
					margin: 23px 8px 0px 10px;
				}
				capitec-action-bar > div {
					border-left: groove;
				}
				capitec-group{
					padding: 0px 0px 0px 20px;
				}
			`
		];
	}

	renderMiddleUI() {
		return html`<stop-card></stop-card>`;
	}

	render() {
		console.log('render client profile');
		return html`
			<capitec-group layout="grid" columns="auto" rows="auto" gap="clear">
				<div class="middle" row="1" column="1">
					${this.renderMiddleUI()}
				</div>
			</capitec-group>
		`;
	}
}

customElements.define(`client-profile`, ClientProfile);