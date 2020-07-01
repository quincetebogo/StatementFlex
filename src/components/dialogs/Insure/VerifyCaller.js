/**
 * The Horizon Verify Caller Details Dialog is used to verify a Capitec Client.
 */
import { Component, html, css } from 'platform/elements';

import { CALLERINFOBAR_CSS } from '../../../css/CallerInfoBar';
import { HORIZON_CALLER_DIALOG_HEADER_CSS } from '../../../css/HorizonModalHeader';

import '../../Common/HorizonOptionButton';
import './VerifyCallerSecurityQuestions';

const RENDER_MODE = {
	VERIFY_CALLER: 0,
	END_CALL: 1,
	SECURITY_QUESTIONS: 2
}

export class VerifyCaller extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Property initialization
		this.renderMode = 0;
		this.incomingCallDetails = null;
		this.timeLeft = "1:00";
		this.minutes = 1;
		this.seconds = 60;
		this.notVerified = false;

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
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			renderMode: { type: Number },
			incomingCallDetails: { type: Object },
			timeLeft: { type: String },
			notVerified: { type: Boolean }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	connectedCallback() {
		super.connectedCallback();

		this.voiceReferenceNumber = this.incomingCallDetails.voiceReferenceNumber;
		this.ivrOptionCode = this.incomingCallDetails.ivrOptionCode;
		this.incomingTelephoneNumber = this.incomingCallDetails.incomingTelephoneNumber;

		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
		this.incidentRecId = this.incomingCallDetails.incidentRecId;
		this.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;

		this._startTimer();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_verifyUsingSQ() {
		//Show Security Questions dialog
		this.minutes = 0;
		this.seconds = 0;
		this.renderMode = RENDER_MODE.SECURITY_QUESTIONS;
	}

	_skip() {
		//TODO: Navigate to Insure Landing Page
	}

	_tryAgain() {
		//TODO: Channel service comes here, on success of it need to do the below reset
		this.notVerified = false;
		this.minutes = 1;
		this.seconds = 60;
		this._startTimer();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_startTimer() {
		var startTimer = setInterval(() => {
			this.minutes = this.minutes != 0 ? this.minutes - 1 : this.minutes;
			this.seconds--;

			if (this.seconds <= 0) {
				_stopTimer();
				this.notVerified = true;
			}

			this.timeLeft = `${this.minutes}:${this.seconds < 10 ? '0' : ''}${this.seconds.toString()}`;
		}, 1000);

		var _stopTimer = () => clearInterval(startTimer);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				${CALLERINFOBAR_CSS}
				${HORIZON_CALLER_DIALOG_HEADER_CSS}

				capitec-modal{
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
					--theme-modal-footer-padding: 7px 16px 9px 0px;
					--theme-modal-footer-padding: 0px;
				}

				div[slot="body"]{
					width: 690px;
					height: 550px;
				}
				#notification-status-box {
					--theme-container-padding-top: 18px;
					--theme-container-padding-right: 17px;
					--theme-container-padding-bottom: 12px;
					--theme-container-padding-left: 16px;
					height: auto;
				}
				#notification-status-box > capitec-group {
					--theme-layout-gap-spacing: 16px;
				}
				#notification-status-box > capitec-group > capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-info-border: none;
				}
				#notification-status-box > capitec-group > capitec-alert-banner[type="error"] {
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					--theme-alert-banner-unsuccessful-red-border: none;
					
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
				}
				#notification-status-group > capitec-label {
					line-height: 24px;
					margin: 0;
					margin-bottom: 34px;

					--theme-label-title-font-size: 15px;
				}
				#notification-status-error-group > capitec-label {
					line-height: 24px;
					margin: 0;
					margin-bottom: 26px;

					--theme-label-title-font-size: 15px;
				}
				.sms-svg{
					height: 152px;
					width: 210px;
					margin: 15px 0px 8px 0px;
				}
				.connection-error-svg {
					height: 152px;
					width: 210px;
					margin: 18px 0px 13px 0px;
				}
				.notification-info {
					color: #545D60;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 24px;
					margin-bottom: 0px;
				}
				.timer-bold {
					font-weight: 700;
					color: #0083BB;
				}
				capitec-title-bar {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 15px;
					--theme-label-title-font-weight: 600;

					border-top: 1px solid #E1E1E1;
				}
				#relation-options-btn {
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 17px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					height: auto;
				}
				#relation-options-btn > capitec-group {
					--theme-layout-gap-spacing: 24px;
				}
				horizon-option-button {
					width: 204px;
					height: 81px;
					box-sizing: border-box;
					border: 1px solid #E1E1E1;
					border-radius: 6px;
					
					--theme-button-padding-top: 9px;
					--theme-button-padding-bottom: 9px;

					--horizon-option-btn-text-margin-top: 4px;
					--horizon-option-btn-text-color: #3E4547;
					--horizon-option-btn-text-font-weight: 600;
				}
			`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.VERIFY_CALLER:
				return html`
					<capitec-modal type="free" header-align="left">
						${this._renderModalHeader()}
						${this._renderModalBody()}
					</capitec-modal>
				`;

			case RENDER_MODE.SECURITY_QUESTIONS:
				return html`<horizon-verify-caller-secutity-questions></horizon-verify-caller-secutity-questions>`;

			case RENDER_MODE.END_CALL:
				return html`${this._renderEndCallModal()}`;
		}
	}

	_renderModalHeader() {
		return html`
			<capitec-group slot="header" layout="horizontal" halign="left" valign="center" gap="none" id="modalHeader">
				<capitec-label type="title" 
								label="Verify Caller">
				</capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-button label="End Call" 
								@click="${() => this.renderMode = RENDER_MODE.END_CALL}">
					<img class="end-call-icon" src="../../../images/hangup.svg"/>
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderModalBody() {
		return html`
			<div slot="body">
				${this._renderCallInformation()}
				${this._renderNotificationStatus()}
				${this._renderPushNotificationError()}
				${this._renderOtherOptions()}
			</div>
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
					.value="${this.ivrOptionCode}"
					@value-changed="${(e) => this._onIvrOptionChanged(e)}">
				</horizon-select>
				<horizon-label
					label="Incoming Number"
					value="${this.incomingTelephoneNumber}">
				</horizon-label>
			</div>`;
	}

	_renderNotificationStatus() {
		if (!this.notVerified) {
			return html`
				<capitec-content-box id="notification-status-box">
					<capitec-group layout="vertical" 
									halign="stretch" 
									valign="top"
									gap="clear">
						<capitec-alert-banner type="info">
							Notify client that a push notification has been sent and they need to accept to continue.
						</capitec-alert-banner>
						<capitec-group layout="vertical" 
										halign="center" 
										valign="top" 
										gap="clear"
										id="notification-status-group">
							<img src="../../../images/Insure/sms.svg" class="sms-svg"/>
							<div class="notification-info">
								There is <span class="timer-bold">${this.timeLeft}</span> remaining.
							</div>
							<capitec-label type="title" 
											label="If the client has not received the notification, choose Try Again.">
							</capitec-label>
						</capitec-group>
					</capitec-group>
				</capitec-content-box>
			`;
		}
		return html``;
	}

	_renderPushNotificationError() {
		if (this.notVerified) {
			return html`
				<capitec-content-box id="notification-status-box">
					<capitec-group layout="vertical" 
									halign="stretch" 
									valign="top"
									gap="clear">
						<capitec-alert-banner type="error">
							Notification didn't send due to a system error.
						</capitec-alert-banner>
						<capitec-group layout="vertical" 
										halign="center" 
										valign="top" 
										gap="clear"
										id="notification-status-error-group">
							<img src="../../../images/Insure/connection-error.svg" class="connection-error-svg"/>
							<div class="notification-info">
								An error has occured.
							</div>
							<capitec-label type="title" 
											label="Notify the client and either try again or complete verification through security questions.">
							</capitec-label>
						</capitec-group>
					</capitec-group>
				</capitec-content-box>
			`;
		}
		return html``;
	}

	_renderOtherOptions() {
		return html`
			<capitec-title-bar type="default" label="Choose another option"></capitec-title-bar>
			<capitec-content-box id="relation-options-btn">
				<capitec-group layout="horizontal" halign="left" valign="top" gap="clear">
					<horizon-option-button label="Security Questions" 
											icon="system/apply-now-action"
											iconSize="default"
											type="clear"
											@click="${() => this._verifyUsingSQ()}">
					</horizon-option-button>
					<horizon-option-button label="Skip" 
											icon="system/arrow-right-action"
											iconSize="default"
											type="clear"
											@click="${() => this._skip()}">
					</horizon-option-button>
					<horizon-option-button label="Try Again" 
											img-src="../../../images/Insure/refresh.svg"
											iconSize="default"
											type="clear"
											@click="${() => this._tryAgain()}">
					</horizon-option-button>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderEndCallModal() {
		return html`
			<end-call-session
				@on-cancel="${() => { this.renderMode = RENDER_MODE.CONFIRM_CALLER }}"
				@on-reason-set="${(reason) => this._onCallCancelled(reason)}">
			</end-call-session>`;
	}
}

window.customElements.define(`horizon-verify-caller`, VerifyCaller)