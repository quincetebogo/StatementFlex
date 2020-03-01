import { Component, html, css } from 'platform/elements';

export class HorizonActionBar extends Component {
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

	render() {
		return html`
		<div class="additional-bar">
			<capitec-action-bar row="1" colspan="3">
				<capitec-label type="title" label="Reference Number: 5678532"></capitec-label>
				<div></div>
				<capitec-icon size="small" icon="system/phone-escalation"></capitec-icon>
				<capitec-label type="title" label="082 555 9090"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-button label="End Call Session" type="primary"></capitec-button>
			</capitec-action-bar>
		</div>`
	}
}

window.customElements.define(`horizon-actionbar`, HorizonActionBar);