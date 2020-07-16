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
				width: 578px;
				--theme-modal-header-background-color: #F7F7F7;
				--theme-modal-header-color: #3E4547;
			}	
			.body-content{
				width: 478px;
				height: 240px;
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
			#radio-button{
				padding-left: 16px;
			}
			#cancel-button{
				height: 48px;
				width: 94px;
				border-radius: 4px;
				background-color: rgba(255,255,255,0)
			}
			#continue-button{
				height: 48px;
				width: 113px;
				border-radius: 5px;
				background-color: #009DE0;
			}
			div[slot="footer"]{
				padding-right: 4px;
				--theme-modal-footer-padding: 12px 12px 12px 16px;
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
			<capitec-group layout="horizontal" class="footer-button">
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
