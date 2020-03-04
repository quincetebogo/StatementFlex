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
			toggleEndCallModal: { type: Boolean }
		}
	}

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
	}
}

window.customElements.define(`end-call-session`, EndCallSessionComponent);