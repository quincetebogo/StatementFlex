import { Component, html } from 'platform/elements';

export class AccessChannelError extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// ----------
	// PROPERTIES
	// ----------

	// N/A

	// ----------
	// PRIVATE METHODS
	// ----------

	onOK() {
		this.dispatchEvent(new CustomEvent(`on-OK`, {}));
	}

	// ---------
	// RENDERING
	// ---------

	render() {
		return html`
			<capitec-modal type="result" result="info" header="Access Channels">
				<div slot="body">
					All Access tools are unavailable at this time you will be notified when they become available
				</div>
				<capitec-button slot="footer" 
								type="clear" 
								label="Ok"
								@click="${() => this.onOK()}">
				</capitec-button>
			</capitec-modal>
		`;
	}
}

window.customElements.define(`horizon-access-channel-error`, AccessChannelError);