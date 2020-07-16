import { Component, html, css } from 'platform/elements';

import 'platform/components/popups/Modal';
import '../../Common/HorizonLabel';
import '../../Common/HorizonSelect';

import { CALLERINFOBAR_CSS } from '../../../css/CallerInfoBar';

import { HorizonRouter } from '../../../shell/HorizonRouter';

export class VerifyCallerSequrityQuestions extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.alertBannerType = "info";
		this.checked = false;
		this.alertBannerMessage = "Navigate to SBL T62053 to complete client verification";

		//TODO: Remove this hardcoded values, once the channel service is ready
		this.ivrOptions = [
			{
				"key": "StopCard",
				"value": "Stop Card"
			},
			{
				"key": "Insure",
				"value": "Insure"
			}
		];
		this.incidentReferenceNumber = "34567893";
		this.ivrOptionCode = "Insure";
		this.incomingTelephoneNumber = "082 555 9090";

		this.horizonRouter = HorizonRouter.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			checked: { type: Boolean },
			alertBannerType: { type: String },
			alertBannerMessage: { type: String },
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
	_onContinueClick() {

		if (!this.checked) {
			this.alertBannerType = "error";
			this.alertBannerMessage = "Choose a feedback reason to continue.";
			//navigate to the next screen on no error
		}
		else {
			//TODO: Based on the option selected, naviagtion should happen. Can be done when implementing channel service
			this.horizonRouter.navigateToInsureNonClient();
		}
	}

	_onValueChanged(e) {
		if (e.detail.new == true) {
			this.checked = true;
			this.alertBannerType = "info";
			this.alertBannerMessage = "Navigate to SBL T62053 to complete client verification";

		}
	}
	_skip() {
		//TODO: Channel service might be implemented here. If required.
		this.horizonRouter.navigateToInsureNonClient();
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
			${CALLERINFOBAR_CSS}

			capitec-modal {
				height: 550px;
				--theme-modal-header-padding-top: 32px;
				--theme-modal-header-padding-bottom: 32px;
				--theme-modal-header-padding-right: 31px;
				--theme-modal-header-padding-left: 31px;
				--theme-modal-footer-padding: 7px 16px 9px 0px;
			}

			div[slot="header"] {
				width: 690px;
				position: absolute;
				display: flex;
				align-items: center;
				left: -670px;
				top: -15px;
			}

			div[slot="header"] > span {
				height: 24px;
				width: 190px;
				color: #FFFFFF;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				padding-left: 17px;
				margin-right: 575px;
			}

			div[slot="body"] {
				width: 690px;
				height: 422px;
			}

			.body-box {
				height: 366px;
				--theme-container-padding-top: 16px;
				--theme-container-padding-bottom: 0px;
				--theme-container-padding-left: 16px;
				--theme-container-padding-right: 17px;
			}

			capitec-alert-banner {
				margin: 0px;
				--theme-alert-banner-info-border: 0px;
				--theme-alert-banner-height: 48px;
				--theme-alert-banner-font-weight: 500;
			}

			.alert-banner-error {
				color: var(--theme-alert-banner-unsuccessful-red-font-color, #C83C37);
				background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
			}

			.bold-label {
				font-weight: 600;
			}

			.navigate-label {
				height: 24px;
				width: auto;
				font-family: "Hind Vadodara";
				font-size: 15px;
				color: #545D60;
				line-height: 24px;
				letter-spacing: 0;
				margin: 15px 0px 0px 0px;
			}

			li {
				margin: 17px 0px 0px 12px;
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
				margin: 32px 0px 15px 0px;
			}

			#id-skip-button {
				margin-right: 6px;
				height: 48px;
				width: 78px;
				--theme-button-padding-top: 13px;
				--theme-button-padding-right: 12px;
				--theme-button-padding-bottom: 12px;
				--theme-button-padding-left: 12px;
			}

			#id-continue-button {
				height: 48px;
				width: 105px;
				--theme-button-padding-top: 13px;
				--theme-button-padding-right: 12px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 12px;
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
				height: 24px;
				margin: 11px 0px 10px 16px;
			}
		`];

	}

	_webTemplate() {
		return html`
			<capitec-modal
				type="free"
				header-align="left">
				<div slot="header">
					<span>Verify Caller</span>
				</div>
				<div slot="body">
					${this._renderCallInformation()}
					<capitec-content-box class="body-box">
					${this._renderNavigationToSBL()}
					${this._renderFeedbackDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderCallInformation() {
		return html`
			<div class="call-details-bar">
				<horizon-label
					label="Reference Number"
					value = "${this.incidentReferenceNumber}">
				</horizon-label>
				<horizon-select
					label="Client Need"
					display-field="value"
					.items="${this.ivrOptions}"
					.value="${this.ivrOptionCode}">
				</horizon-select>
				<horizon-label
					label="Incoming Number"
					value="${this.incomingTelephoneNumber}">
				</horizon-label>
			</div>
		`;
	}

	_renderNavigationToSBL() {
		return html`
			${this._renderAlertBanner()}
			<p class="navigate-label">Navigate to <b class="bold-label">SBL T62053</b> (Landing Page)</p>
			<li class="navigate-label">Select <b class="bold-label">No</b> under 'Has the client been verified in the branch'</li>
		`;
	}

	_renderAlertBanner() {
		if (this.alertBannerType === "info") {
			return html`
			<capitec-alert-banner label="${this.alertBannerMessage}" type="${this.alertBannerType}"></capitec-alert-banner>`;
		}
		else if (this.alertBannerType === "error") {
			return html`
			<capitec-alert-banner class="alert-banner-error" label="${this.alertBannerMessage}" type="${this.alertBannerType}"></capitec-alert-banner>`;
		}
	}

	_renderFeedbackDetails() {
		return html`
			<capitec-label class="feedback-label" label="Feedback:"></capitec-label>

			<capitec-radio-group>
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio class="radio-button-label" @value-change="${(e) => this._onValueChanged(e)}" label="Passed Verification"></capitec-radio>
				</capitec-group>

				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio class="radio-button-label" @value-change="${(e) => this._onValueChanged(e)}" label="Failed Verification (end call if client failed)"></capitec-radio>
				</capitec-group>
			</capitec-radio-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-skip-button"
					type="clear"
					label="Skip"
					@click="${() => this._skip()}">
				</capitec-button>

				<capitec-button
					id="id-continue-button"
					type="primary"
					label="Continue"
					@click="${() => this._onContinueClick()}">
				</capitec-button>
			</capitec-group>
		`;
	}
}

window.customElements.define(`horizon-verify-caller-secutity-questions`, VerifyCallerSequrityQuestions)