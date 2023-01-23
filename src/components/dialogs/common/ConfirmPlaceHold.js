import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
 
const HOLD_REASON = [
	{ key: `1`, value: `Smishing (Mobile USSD/App Banking Fraud)`, reason: `SMISHING` },
	{ key: `2`, value: `Unauthorised transaction (Lost Device, Stolen, Robbed)`, reason: `UNAUTHORIZED_TRANSACTION` },
	{ key: `3`, value: `SendCash Friendly fraud (Civil Matter)`, reason: `FRIENDLY_FRAUD` },
	{ key: `4`, value: `Client Request (Civil Matter)`, reason: `CLIENT_REQUEST` },
	{ key: `5`, value: `Phising/Vishing sms/Call`, reason: `PHISING_VISHING` }
];

export class ConfirmPlaceHold extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.selectedReason = ``;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {String} selectedReason The value selected as the reason for placing the voucher on hold.
	 * @readonly
	 * @static
	 * @memberof ConfirmPlaceHold
	 */

	static get properties() {
		return {
			selectedReason: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_valueChanged(e) {
		this.selectedReason = e.detail.new;
	}

	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel`));
	}

	_confirmClick() {
		this.dispatchEvent(new CustomEvent(`on-confirm`, { 
			detail: {
				selectedReason: this.selectedReason
			}
		}));
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
				capitec-alert-banner {
					width: 540px;
					--theme-alert-banner-height: 68px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 16px;
				}
				div[slot="body"] {
					width: auto;
					height: 427px;
				}
				p {
					margin: 0px;
				}
				capitec-label {
					--theme-label-default-font-weight: 600;
				}
				capitec-content-box {
					--theme-layout-gap-spacing: 15px;
				}
				capitec-select {
					--theme-input-font-weight: 600;
				}
			`
		];

	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header="Confirm" header-align="left">
					<div slot="body">
						${this._renderBodyContent()}
					</div>
					<div slot="footer">
						${this._renderFooter()}
					</div>
			</capitec-modal>
		`;
	}

	_renderBodyContent() {
		return html`
			<capitec-content-box>
				<capitec-alert-banner type="info">
					<capitec-label label="Notify client:"></capitec-label>
					<p>The voucher will be placed on <strong>'Hold'</strong>, the client won't be able</p>
					<p>to redeem it from any partner merchant(s) or Capitec ATMs.</p>
				</capitec-alert-banner>

				<capitec-select 
					label="Choose reason" 
					.items="${HOLD_REASON}" 
					display-field="value"
					id-field="key"
					hint="Please select a reason from the dropdown options."
					@value-change="${(e) => this._valueChanged(e)}">
				</capitec-select>
			</capitec-content-box>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<capitec-button
					type="clear"
					label="Cancel"
					@click="${() => this._cancelClick()}">
				</capitec-button>
				<capitec-button
					type="primary"
					label="Confirm"
					?disabled="${isNullorEmpty(this.selectedReason)}"
					@click="${() => this._confirmClick()}">
				</capitec-button>
			</capitec-group>`;
	}
}
window.customElements.define(`horizon-confirm-place-hold`, ConfirmPlaceHold);