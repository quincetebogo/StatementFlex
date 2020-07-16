import { Component, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

export class AssignReasonDialog extends Component {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();
		this.eventAggregator = EventAggregator.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------
	static get properties() {
		return {
			assignReason: { type: Object },

		}
	}
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent('on-cancel', {}));
	}

	_onContinueClick() {
		this.dispatchEvent(new CustomEvent('on-assign-reason', {
			detail: { reason: this.selected }
		}));
	}

	_onSystemError(e) {
		console.log(e);
		if (e.detail.new) {
			this.selected = 0;
		}
	}

	_onNotInArrears(e) {
		console.log(e);
		if (e.detail.new) {
			this.selected = 1;
		}
	}

	_onRefund(e) {
		console.log(e);
		if (e.detail.new) {
			this.selected = 2;
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			capitec-modal {
				height: 384px;
				width: 578px;
				--theme-modal-header-background-color: #F7F7F7;
				--theme-modal-header-color: #3E4547;
			}			
			`];

	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Choose a Reason For Assigning">
				<div slot="body">
					<capitec-content-box class="body-content">
						${this._renderReason()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div> 
			</capitec-modal>`;
	}

	_renderReason() {
		return html`
			<capitec-radio-group class="radio-group">
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio id="radio-button" label="System error" @value-change="${(e) => this._onSystemError(e)}"></capitec-radio>
				</capitec-group>
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio id="radio-button" label="Client is not in arrears, but was told they are" @value-change="${(e) => this._onNotInArrears(e)}"></capitec-radio>
				</capitec-group>
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio id="radio-button" label="Refunds" @value-change="${(e) => this._onRefund(e)}"></capitec-radio>
				</capitec-group>
			</capitec-radio-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
			<capitec-button
					id="cancel-button"
					type="clear"
					label="Cancel"
					@click="${() => this._onCancelClick()}">
				</capitec-button>
				<capitec-button
					id="continue-button"
					type="primary"
					label="Continue"
					@click="${() => this._onContinueClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}

}

window.customElements.define(`horizon-insure-assign-reason`, AssignReasonDialog)
