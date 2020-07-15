import { Component, html, css } from 'platform/elements';

export class PayArrears extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.checked = false;
		this.alertBannerMessage = '';
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			alertBannerMessage: { type: String },
			checked: { type: Boolean }
		}
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
	}

	_onDoneClick() {
		if (!this.checked) {
			this.alertBannerMessage = "Choose a feedback reason to continue.";
		}
	}

	_onValueChanged() {
		this.checked = !this.checked;
		if (this.checked) {
			this.alertBannerMessage = '';
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
					height: 616px;
					width: 690px;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-right: 16px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-footer-padding: 0px 16px 16px 0px;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #3E4547;
				}

				div[slot="body"] {
					width: 694px;
					height: auto;
				}

				.body-box {
					height: auto;
					margin: 0px 0px 0px 0px;
					--theme-container-padding-top : 13px;
					--theme-container-padding-bottom: 0px;
				}

				.navigate-container {
					height: 242px;
					width: 662px;
					margin: 0px;
					border-style: solid;
					border-width: thin;
					border-radius: 5px;
					border-color: lightgrey;
				}

				.group-navigate {
					margin-left: 16px;
					margin-top: 17px;
					padding: 0px;
					width: auto;
					height: 224px;
				}

				.navigate-info-label {
					height: 26px;
					width: 553px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					line-height: 24px;
					color: #545D60;
					letter-spacing: 0;
					margin: 0px 0px 11px 0px;
				}

				.navigate-bullet-label {
					height: 24px;
					width: 622px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					line-height: 24px;
					color: #545D60;
					margin: 0px;
				}

				.navigate-label {
					height: 24px;
					padding: 0px 0px 0px 22px;
					width: 622px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					margin: 0px;
				}

				.feedback-label {
					height: 24px;
					width: 546px;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
					margin: 24px 0px 15px 0px;
				}

				.radio-group {
					margin-bottom: 52px;
				}

				.radio-button-container {
					margin: 8px 0px 0px 0px;
					height: 48px;
					padding: 0px;
					box-sizing: border-box;
					border-style: solid;
					border-width: thin;
					border-radius: 5px;
					border-color: lightgrey;
				}

				.radio-button-label {
					height:24px;
					margin:11px 0px 10px 16px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 20px;
				}

				#id-cancel-button {
					height: 48px;
					width: 94px;
					margin-right: 19px;
					--theme-button-padding-top: 13px;
					--theme-button-padding-right: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 12px;
				}

				#id-done-button {
					height: 48px;
					width: 86px;
					--theme-button-padding-top: 13px;
					--theme-button-padding-right: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 12px;
				}

				capitec-alert-banner {
					margin: 0px 0px 15px 0px;
					--theme-alert-banner-info-border: 0px;
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-font-weight: 500;
					color: var(--theme-alert-banner-unsuccessful-red-font-color, #C83C37);
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
				}
		`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Solution - Pay Arrears">
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderAlertBanner()}
						${this._renderNavigationToSBL()}
						${this._renderFeedbackDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>`;
	}

	_renderAlertBanner() {
		if (!this.alertBannerMessage == '') {
			return html`
				<capitec-alert-banner
									label="${this.alertBannerMessage}"
									type="error">
				</capitec-alert-banner>`;
		}
	}

	_renderNavigationToSBL() {
		return html`
			<capitec-group class="navigate-container" layout="vertical" gap="clear" halign="stretch" valign="top">
				<capitec-content-box class="group-navigate">
					<p class="navigate-info-label">Navigate to <b> SBL T62053 </b> (Landing page) </p>
					<li class="navigate-bullet-label"> Enter valid client details. Verify client </li>
					<li class="navigate-bullet-label"> Choose Insure tab </li>
					<li class="navigate-bullet-label"> Pay Outstanding Amount </li>
					<li class="navigate-bullet-label"> This option can be used if the client missed a payment and reflects in arrears. </li>
					<li class="navigate-bullet-label"> Choose the account the client wants to make the outstanding payment from then transmit to </li>
					<p class="navigate-label"> complete the payment. </p>
					<li class="navigate-bullet-label"> Click transmit </li>
				</capitec-content-box>
			</capitec-group>
		`;
	}

	_renderFeedbackDetails() {
		return html`
			<capitec-label class="feedback-label" label="Feedback:"></capitec-label>

			<capitec-radio-group class="radio-group">
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								class="radio-button-label"
								label="Payment has been made"
								@value-change="${() => this._onValueChanged()}">
					</capitec-radio>
				</capitec-group>
 
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								class="radio-button-label"
								label="System error - assign now"
								@value-change="${() => this._onValueChanged()}">
					</capitec-radio>
				</capitec-group>

				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								class="radio-button-label"
								label="Client has informed that they are not in arrear - assign now"
								@value-change="${() => this._onValueChanged()}">
					</capitec-radio>
				</capitec-group>

			</capitec-radio-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-cancel-button"
					type="clear"
					label="Cancel"
					?hidden=""
					.disabled=""
					tabindex=""
					@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button
					id="id-done-button"
					type="primary"
					label="Done"
					?hidden=""
					.disabled=""
					tabindex=""
					@click="${() => this._onDoneClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}
}

window.customElements.define(`horizon-pay-arrears`, PayArrears)