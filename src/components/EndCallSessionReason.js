import { EventAggregator } from 'platform/EventAggregator';
import { View, html, css } from 'platform/elements';

export class EndCallSessionReason extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.eventAggregator = EventAggregator.getInstance();
		this.endCallReason = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			toggleEndCallModal: { type: Boolean },
			endCallReason: { type: String },
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// N/A

	// --------------
	// EVENT HANDLERS
	// --------------

	onValueChanged(e) {
		if (e.detail.new) {
			this.endCallReason = e.detail.selected
		};
	}

	onReasonSelected() {
		//TODO: End Call Session Service should be implemented.
		this.dispatchEvent(new CustomEvent('on-reason-set', { detail: { endCallReason: this.endCallReason } }));
	}

	onCancelpopup() {
		this.dispatchEvent(new CustomEvent('on-cancel', {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------	

	static get styles() {
		return [
			super.styles,
		]
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
					<capitec-radio 
						label="Need fulfilled" 
						@value-changed="${(e) => { e.detail.selected = "needFulfilled"; this.onValueChanged(e) }}">
					</capitec-radio>
					<capitec-radio 
						label="Need incomplete, bad connection" 
						@value-changed="${(e) => { e.detail.selected = "badConnection"; this.onValueChanged(e) }}">
					</capitec-radio>
					<capitec-radio 
						label="Incident escalated" 
						@value-changed="${(e) => { e.detail.selected = "incidentEscalated"; this.onValueChanged(e) }}">
					</capitec-radio>
					<capitec-radio 
						label="Incident hand-off" 
						@value-changed="${(e) => { e.detail.selected = "incidentHandoff"; this.onValueChanged(e) }}">
					</capitec-radio>
				</capitec-radio-group>
				`;
	}

	renderCallSessionFooter() {
		return html`
			<capitec-action-bar slot="footer">
				<capitec-spacer></capitec-spacer>
				<capitec-button type="clear" label="Cancel" @click="${() => this.onCancelpopup()}"></capitec-button>
				<capitec-button 
					type="clear" 
					label="End Call Session"
					?disabled="${this.endCallReason === null}"
					@click="${() => this.onReasonSelected()}">
				</capitec-button>
			</capitec-action-bar>
		`;
	}
}

window.customElements.define(`end-call-session`, EndCallSessionReason);