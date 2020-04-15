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

	// --------------
	// EVENT HANDLERS
	// --------------

	onValueChanged(e) {
		if (e.detail.new) {
			this.endCallReason = e.detail.selected
		};
	}

	onReasonSelected() {
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
			css`
			.options-group {
				width:396px; 
				margin-top:24px; 
				margin-left:24px;
			}
			
			#id-button-cancel{
				margin-left: auto;
			}

			.line{
				width:100%;
				margin-top:30px;
				border-top:1px solid #dfdfdf;"
			}			
			`
		]
	}


	render() {
		return html`
		<capitec-modal type="free" header="End Call Session Reason">
			<div slot="body">
						${this.renderCallSessionReason()} 
				<div class="line"></div>
			</div>
			<div slot="footer">
				${this.renderCallSessionFooter()} 
			</div>
		</capitec-modal>
	`;
	}

	renderCallSessionReason() {
		return html`
				<capitec-radio-group class="options-group">
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
			<capitec-group layout="horizontal">
				<capitec-button 
					id="id-button-cancel"
					type="clear" 
					label="Cancel" 
					@click="${() => this.onCancelpopup()}">
				</capitec-button>
				<capitec-button 
					type="clear" 
					label="End Call"
					?disabled="${this.endCallReason === null}"
					 @click="${() => this.onReasonSelected()}">
				</capitec-button>
			</capitec-group>
		`;
	}
}

window.customElements.define(`end-call-session`, EndCallSessionReason);