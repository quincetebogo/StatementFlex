import { Component, html, css } from 'platform/elements';

import 'platform/components/popups/Modal';
import '../../Common/HorizonLabel';
import '../../Common/HorizonSelect';

import { CALLERINFOBAR_CSS } from '../../../css/CallerInfoBar';

export class VerifyCallerSequrityQuestions extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		//these hardcoded values--to be removed if services are ready

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

	}

	// --------------
	// PROPERTIES
	// --------------


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------


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

			.alert-banner-info {
				margin: 0px;
				--theme-alert-banner-info-border: 0px;
				--theme-alert-banner-height: 48px;
				--theme-alert-banner-font-weight: 500;
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
					${this.renderCallInformation()}
					<capitec-content-box class="body-box">
					${this.renderNavigationToSBL()}
					${this.renderFeedbackDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this.renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	renderCallInformation() {
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

	renderNavigationToSBL() {
		return html`
			${this.renderAlertBanner()}
			<p class="navigate-label">Navigate to <b class="bold-label">SBL T62053</b> (Landing Page)</p>
			<li class="navigate-label">Select <b class="bold-label">NO</b> under 'Has the client been verified in the branch'</li>
		`;
	}

	renderAlertBanner() {
		return html`
			<capitec-alert-banner class="alert-banner-info" label="Navigate to SBL T62053 to complete client verification" type="info"></capitec-alert-banner>
		`;
	}

	renderFeedbackDetails() {
		return html`
			<capitec-label class="feedback-label" label="Feedback:"></capitec-label>

			<capitec-radio-group>
				<capitec-group class="radio-button-container" id="passedRadioButton" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio class="radio-button-label" @value-change="" label="Passed Verification"></capitec-radio>
				</capitec-group>

				<capitec-group class="radio-button-container" id="failedRadioButton" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio class="radio-button-label" @value-change="" label="Failed Verification (end call if client failed)"></capitec-radio>
				</capitec-group>
			</capitec-radio-group>
		`;
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-skip-button"
					type="clear"
					label="Skip"
					@click="">
				</capitec-button>

				<capitec-button
					id="id-continue-button"
					type="primary"
					label="Continue"
					@click="">
				</capitec-button>
			</capitec-group>
		`;
	}
}

window.customElements.define(`horizon-verify-caller-secutity-questions`, VerifyCallerSequrityQuestions)