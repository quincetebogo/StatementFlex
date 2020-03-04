import { EventAggregator } from 'platform/EventAggregator';
import { View, html, css } from 'platform/elements';
import './HorizonActionBar';
import '../views/ClientProfile/StopCardComponent';
import { Router } from 'platform/Router';
import '../views/ClientProfile/StopCardComponent';

export class EndCallSessionComponent extends View {

	constructor() {
		super();
		this.eventAggregator = EventAggregator.getInstance();
		this.router = Router.getInstance();
	}

	static get styles() {
		return [
			super.styles,
		]
	}

	static get properties() {
		return {
			varEndCallSession: { type: Boolean }
		}
	}

	/*renderLeftUI() {
		return html`<client-details></client-details>`;
	}

	renderMiddleUI() {
		return html`<stop-card></stop-card>`;
	}

	renderRightUI() {
		return html`<access-component></access-component>`;
	}*/

	/*render() {
		return html`
			<capitec-action-bar row="1" colspan="3">
				<capitec-label type="title" label="Reference Number: 5678532"></capitec-label>
				<div></div>
				<capitec-icon size="small" icon="system/phone-escalation"></capitec-icon>
				<capitec-label type="title" label="082 555 9090"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-button label="End Call Session" type="primary" @click="${() => this.endCallSession = true}"></capitec-button>
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
	}*/
	//<capitec-group layout="vertical gap="clear" halign="left" valign="top">
	//</capitec-group>

	render() {
		return html`
		<capitec-modal type="alert" header="End Call Session Reason">
			<div slot="body">
				${this.renderCallSessionReason()}
			</div>
			${this.renderCallSessionFooter()}
		</capitec-modal>
	`;
	}

	renderCallSessionReason() {
		return html`
				<capitec-radio-group>
					<capitec-radio label="Need fulfilled"></capitec-radio>
					<capitec-radio label="Need incomplete, bad connection"></capitec-radio>
					<capitec-radio label="Incident escalated"></capitec-radio>
					<capitec-radio label="Incident hand-off"></capitec-radio>
				</capitec-radio-group>
				`;
	}
	//<capitec-action-bar slot="footer">
	//</capitec-action-bar>
	renderCallSessionFooter() {
		return html`
			<capitec-action-bar slot="footer">
				<capitec-spacer></capitec-spacer>
				<capitec-button type="clear" label="Cancel" @click="${() => this.cancelpopup()}"></capitec-button>
				<capitec-button type="clear" label="End Call Session" @click="${() => this.router.navigateByPath(`/landingpage`)}"></capitec-button>
			</capitec-action-bar>
		`;
	}

	cancelpopup() {
		this.eventAggregator.publish('toggle-endcall-session', {});
		console.log('button clicked');
	}

}

window.customElements.define(`end-call-session`, EndCallSessionComponent);