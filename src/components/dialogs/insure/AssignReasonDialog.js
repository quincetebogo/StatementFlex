import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import 'app/components/common/HorizonSolutionDialog';

const ERROR_MESSAGE = `Choose a reason for assigning to continue`;

export class AssignReasonDialog extends Component {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();
		this.eventAggregator = EventAggregator.getInstance();
		this.radioButtonsAvailable = [
			{ "key": `0`, "value": `System error` },
			{ "key": `1`, "value": `Client is not in arrears, but was told they are` },
			{ "key": `2`, "value": `Refunds` }
		];
		this.checked = false;
		this.alertBannerMessage = ``;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			assignReason: { type: Object },
			checked: { type: Boolean },
			alertBannerMessage: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`on-cancel`, {}));
	}

	_onContinueClick() {
		if (!this.checked) {
			this.alertBannerMessage = ERROR_MESSAGE;
		} else {
			this.dispatchEvent(new CustomEvent(`on-assign-reason`, {
				detail: { reason: this.selected }
			}));
		}

	}

	_onValueChanged(e) {
		console.log(e);
		this.checked = !this.checked;

		if (this.checked) {
			this.alertBannerMessage = ``;
			this.selected = e.detail.key;
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
				--theme-modal-header-padding-top: 20px;
				--theme-modal-header-padding-bottom: 20px;
				--theme-modal-header-padding-right: 16px;
				--theme-modal-header-padding-left: 16px;
				--theme-modal-footer-padding: 5px 16px 11px 0px;
				--theme-modal-header-background-color: #F7F7F7;
				--theme-modal-header-color: #3E4547;
			}

			.body-content {
				width: 578px;
				height: auto;
				padding: 8px 16px 0px 16px;
			}

			.radio-button {
				--horizon-radio-button-group-margin-bottom: 75px;
			}

			#cancel-button {
				height: 48px;
				width: 94px;
				border-radius: 4px;
				background-color: rgba(255,255,255,0)
			}

			#continue-button {
				height: 48px;
				width: 113px;
				border-radius: 5px;
				background-color: #009DE0;
			}

			div[slot="footer"] {
				padding-right: 4px;
				--theme-modal-footer-padding: 12px 12px 12px 16px;
			}

			horizon-alert-banner {
				margin: 0px 0px 15px 0px;
				--theme-alert-banner-font-weight: 500;
				color: var(--theme-alert-banner-unsuccessful-red-font-color, #C83C37);
				background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
			}`
		];
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Choose a Reason For Assigning">
				<div slot="body">
					<capitec-content-box class="body-content">
						${this._renderAlertBanner()}
						${this._renderReason()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div> 
			</capitec-modal>`;
	}

	_renderAlertBanner() {
		if (this.alertBannerMessage) {
			return html`
				<horizon-alert-banner
					label="${this.alertBannerMessage}"
					type="error-trans">
				</horizon-alert-banner>
			`;
		}
	}

	_renderReason() {
		return html`
			<horizon-radio-button-group
					class="radio-button"
					.radioButtonsAvailable="${this.radioButtonsAvailable}"
					@value-change="${(e) => this._onValueChanged(e)}">
			</horizon-radio-button-group>
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

window.customElements.define(`horizon-insure-assign-reason`, AssignReasonDialog);