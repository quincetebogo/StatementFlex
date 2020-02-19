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
					padding: 20px 0px 0px 20px;
				}
			`
		];
	}

	renderLeftUI() {
		return html`<client-details></client-details>`;
	}

	renderMiddleUI() {
		return html`<stop-card></stop-card>`;
	}

	renderRightUI() {
		return html`<access-component></access-component>`;
	}

	render() {
		return html`
			<capitec-action-bar row="1" colspan="3">
				<capitec-label type="title" label="Reference Number: 5678532"></capitec-label>
				<div></div>
				<capitec-icon size="small" icon="system/phone-escalation"></capitec-icon>
				<capitec-label type="title" label="082 555 9090"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-button label="End Call Session" type="primary"></capitec-button>
			</capitec-action-bar>
			<capitec-group layout="grid" columns="auto" rows="auto" gap="clear">
				<div class="left" row="1" column="1">
					${this.renderLeftUI()}
				</div>
			
				<div class="middle" row="1" column="2">
					${this.renderMiddleUI()}
				</div>

				<div class="right" row="1" column="3">
					${this.renderRightUI()}
				</div>
			</capitec-group>
		`;
	}
}

customElements.define(`client-profile`, ClientProfile);