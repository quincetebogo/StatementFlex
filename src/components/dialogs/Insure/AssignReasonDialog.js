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

	_onContinueClick() {
		this.dispatchEvent(new CustomEvent('on-assign-reason', {
			detail: {}
		}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------
	_onValueChanged() {
		this.checked = !this.checked;
	}
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					height: 384px;
					width: 578;
					border-radius: 5px;
					background-color: #F7F7F7;
				}
			
				div[slot="header"] {
					width: 375px;
					--theme-modal-header-height: 64px;
					position: absolute;
					display: flex;
					align-items: center;
				}

				div[slot="body"] {
					width: 375px;
					height: 198px;
				}

				.body-content {
					height: 320px;
					border-radius: 5px;
					background-color: #FFFFFF;
					box-shadow: 0 -1px 2px 0 rgba(0,0,0,0.06);
				}

				.header-label {
					height: 24px;
					width: auto;
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
				}

				#radio-button {
					box-sizing: border-box;
					height: 48px;
					width: 546px;
					border: 1px solid #E1E1E1;
					border-radius: 5px;
					background-color: #FFFFFF;
					height: 24px;
					margin: 11px 0px 10px 16px;
				}
				.radio-button-container{
					margin: 8px 0px 0px 0px;
					height: 48px;
					padding: 0px;
					box-sizing: border-box;
					border-style: solid;
					border-width: thin;
					border-radius: 5px;
					border-color: lightgrey;
				}
			`];

	}

	_webTemplate() {
		return html`
			<capitec-modal 
				type="free" 
				header-align="left">
				<div slot="header">
					<span>
							<capitec-label class="header-label" label="Choose a Reason For Assigning"></capitec-label>
					</span>
				</div>
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
					<capitec-radio id="radio-button" label="System error" @value-change="${() => this._onValueChanged()}"></capitec-radio>
				</capitec-group>
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio id="radio-button" label="Client is not in arrears, but was told they are" @value-change="${() => this._onValueChanged()}"></capitec-radio>
				</capitec-group>
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio id="radio-button" label="Refunds" @value-change="${() => this._onValueChanged()}"></capitec-radio>
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
					label="Continue"
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
