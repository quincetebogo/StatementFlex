import { Component, css, html } from 'platform/elements';
import 'app/components/common/RadioButtonGroup';

const ERROR_MESSAGE = `Choose an update option to continue.`;

export class ChooseAnUpdateOption extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.radioButtonsAvailable = [
			{ "key": `0`, "value": `Add payout beneficiary` },
			{ "key": `1`, "value": `Update payout beneficiary` },
			{ "key": `2`, "value": `Update premium and cover amounts` },
			{ "key": `3`, "value": `Remove payout beneficiary` }
		];
		this.checked = false;
		this.alertBannerMessage = ``;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			checked: { type: Boolean },
			alertBannerMessage: { type: String }
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

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-solution`, {}));
	}

	_onContinueClick() {
		if (!this.checked) {
			this.alertBannerMessage = ERROR_MESSAGE;
		} else {
			this.dispatchEvent(new CustomEvent(`solution-provided`, {}));
		}
	}

	_onValueChanged() {
		this.checked = !this.checked;
		if (this.checked) {
			this.alertBannerMessage = ``;
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
					height: auto;
					width: 578px;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-right: 16px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-footer-padding: 5px 16px 11px 0px;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #3E4547;
				}

				div[slot="body"] {
					width: 578px;
					height: auto;
				}

				.body-box {
					height: auto;
					margin: 0px 0px 0px 0px;
					--theme-container-padding-top : 13px;
					--theme-container-padding-bottom: 0px;
				}

				.radio-button {
					--horizon-radio-button-group-margin-bottom: 19px;
				}

				#id-cancel-button {
					height: 48px;
					width: 94px;
					margin-right: 19px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-right: 23px;
					--theme-button-padding-bottom: 14px;
					--theme-button-padding-left: 23px;
					--theme-button-line-height: 20px;
					--theme-button-clear-border-width: 0px;
				}

				#id-continue-button {
					height: 48px;
					width: 113px;
					--theme-button-line-height: 20px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-right: 24px;
					--theme-button-padding-bottom: 14px;
					--theme-button-padding-left: 24px;
					--theme-button-primary-border-width: 0px;
				}

				horizon-alert-banner {
					margin: 0px 0px 15px 0px;
					--theme-alert-banner-info-border: 0px;
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-font-weight: 500;
					color: var(--theme-alert-banner-unsuccessful-red-font-color, #C83C37);
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
				}`
		];

	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Choose an Update Option">
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderAlertBanner()}
						${this._renderFeedbackDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>`;
	}

	_renderFeedbackDetails() {
		return html`
			<horizon-radio-button-group
				class="radio-button"
				.radioButtonsAvailable="${this.radioButtonsAvailable}"
				@value-change="${() => this._onValueChanged()}">
			</horizon-radio-button-group>
		`;
	}

	_renderAlertBanner() {
		if (this.alertBannerMessage) {
			return html`
				<horizon-alert-banner
						label="${this.alertBannerMessage}"
						type="error">
				</horizon-alert-banner>
			`;
		}
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-cancel-button"
					type="clear"
					label="Cancel"
					tabindex=""
					@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button
					id="id-continue-button"
					type="primary"
					label="Continue"
					tabindex=""
					@click="${() => this._onContinueClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}
}

window.customElements.define(`horizon-choose-update-option`, ChooseAnUpdateOption);