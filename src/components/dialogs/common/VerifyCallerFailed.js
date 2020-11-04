import { Component, css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/HorizonOptionButton';
import 'app/components/common/HorizonCallerDialog';
import 'app/components/dialogs/common/VerifyCallerSecurityQuestions';
import 'app/components/dialogs/common/EndCallSession';


const RENDER_MODE = {
	VERIFY_CALLER_FAILED: 0,
	END_CALL: 1,
	SECURITY_QUESTIONS: 2
};

const HEADER_LABEL = `Verify Caller`;

/**
 * The Horizon Verify Caller Details Dialog is used to verify a Capitec Client.
 *
 * @export
 * @class VerifyCaller
 * @extends {Component}
 */

export class VerifyCallerFailed extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Property initialization
		this.renderMode = 0;
		this.incomingCallDetails = null;

		// TODO: Remove this hardcoded values, once the channel service is ready
		this.ivrOptions = [
			{
				"key": `1`,
				"value": `Stop Card`
			},
			{
				"key": `2`,
				"value": `Insure`
			}
		];

		this.horizonStore = HorizonStore.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			renderMode: { type: Number },
			incomingCallDetails: { type: Object }
		};
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
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_verifyUsingSQ() {
		// Show Security Questions dialog
		this.renderMode = RENDER_MODE.SECURITY_QUESTIONS;
	}

	_skip() {
		//TODO: Functionality to skip Security questions to be implemented here.
	}

	_onEndCall() {
		this.renderMode = RENDER_MODE.END_CALL;
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

				div[slot="body"]{
					width: 690px;
					height: auto;
				}
				#notification-status-box {
					--theme-container-padding-top: 18px;
					--theme-container-padding-right: 22px;
					--theme-container-padding-bottom: 12px;
					--theme-container-padding-left: 16px;
					height: auto;
				}
				#notification-status-box > capitec-group {
					--theme-layout-gap-spacing: 16px;
					height: auto;
				}
				#notification-status-box > capitec-group > capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-info-border: none;
					margin-bottom: 16px;
					color: rgb(200, 59, 55);
				}
				#notification-status-box > capitec-group > capitec-alert-banner[type="error-trans"] {
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					--theme-alert-banner-unsuccessful-red-border: none;

					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
				}
				#notification-status-group {
					height: auto;
				}
				#notification-status-group > capitec-label {
					line-height: 24px;
					margin: 0;
					margin-bottom: 41px;

					--theme-label-title-font-size: 15px;
				}
				.sms-svg{
					height: 152px;
					width: 210px;
					margin: 22px 0px 18px 0px;
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
					--theme-container-padding-bottom: 17px;
					--theme-container-padding-left: 16px;
					height: auto;
				}
				#relation-options-btn > capitec-group {
					--theme-layout-gap-spacing: 24px;
				}
				horizon-option-button {
					width: 204px;
					height: 80px;
					box-sizing: border-box;
					border: 1px solid #E1E1E1;
					border-radius: 6px;
					
					--theme-button-padding-top: 9px;
					--theme-button-padding-bottom: 9px;

					--horizon-option-btn-text-margin-top: 4px;
					--horizon-option-btn-text-color: #3E4547;
					--horizon-option-btn-text-font-weight: 600;
				}
				horizon-caller-dialog {
					--horizon-modal-footer-padding: 0px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.VERIFY_CALLER_FAILED:
				return html`
					<horizon-caller-dialog
								.incomingCallDetails="${this.incomingCallDetails}"
								.headerLabel="${HEADER_LABEL}"
								@on-end-call="${() => this._onEndCall()}">
						<div slot="body">
							${this._renderNotificationStatus()}
							${this._renderOtherOptions()}
						</div>
					</horizon-caller-dialog>
				`;

			case RENDER_MODE.SECURITY_QUESTIONS:
				return html`<horizon-verify-caller-secutity-questions
										.incomingCallDetails="${this.incomingCallDetails}">
							</horizon-verify-caller-secutity-questions>`;

			case RENDER_MODE.END_CALL:
				return html`${this._renderEndCallModal()}`;
			default:
				return html`Incorrect Render mode specified`;
		}
	}

	_renderNotificationStatus() {
		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group layout="vertical" 
								halign="stretch" 
								valign="top"
								gap="clear">
					<capitec-alert-banner type="error-trans">
						<b>Notify client: </b>Unfortunately you didn't pass the security questions.
					</capitec-alert-banner>
					<capitec-group layout="vertical" 
									halign="center" 
									valign="top" 
									gap="clear"
									id="notification-status-group">
						<img src="/images/warning.svg" class="sms-svg"/>
						<capitec-label type="title" 
										label="You've got one more attempt left. Do you want to try the security questions again?">
						</capitec-label>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>
		`;
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
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderEndCallModal() {
		return html`
			<horizon-end-call-session
				@cancel="${() => this.renderMode = RENDER_MODE.CONFIRM_CALLER}"
				.incomingCallDetails = "${this.incomingCallDetails}">
			</horizon-end-call-session>`;
	}
}

window.customElements.define(`horizon-verify-caller-failed`, VerifyCallerFailed);