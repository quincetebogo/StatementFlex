import { Component, html, css } from 'platform/elements';

const RENDER_MODE = {
	EMAIL_PLAN: 0
};

export class EmailPlan extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.EMAIL_PLAN;
		this.checked = false;
		this.alertBannerMessage = '';
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			renderMode: { type: Number },
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
					height: 146px;
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
					height: 127px;
				}

				.navigate-info-label {
					height: 26px;
					width: 533px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
					margin: 0px 0px 11px 0px;
				}

				.navigate-bullet-label {
					height: 24px;
					width: 622px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
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
					margin-bottom: 43px;
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
			<capitec-modal type="free" header-align="left" header="Solution - Email plan">
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderAlertBanner()}
						${this._renderNavigation()}
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

	_renderNavigation() {
		return html`
			<capitec-group class="navigate-container" layout="vertical" gap="clear" halign="stretch" valign="top">
				<capitec-content-box class="group-navigate">
					<p class="navigate-info-label">Navigate to ......</p>
					<li class="navigate-bullet-label"> Retrieve the relevant policy document from CDS using the client's ID number or Policy </li>
					<p class="navigate-label"> number </p>
					<li class="navigate-bullet-label"> Send the document from STRACK to the client's email address. </li>
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
								label="Email sent"
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

window.customElements.define(`horizon-email-plan`, EmailPlan)