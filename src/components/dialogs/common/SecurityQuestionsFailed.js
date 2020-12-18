import { Component, css, html } from 'platform/elements';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { navigateToFailedScreen } from 'app/components/dialogs/common/VerifyCaller';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonCallerDialog';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = {
	VERIFY_CALLER_FAILED: 0,
	END_CALL: 1
};

const ERROR_MESSAGE = {
	DEFAULT_NOTIFICATION: html`<b>Notify client: </b>Unfortunately you didn't pass the security questions.`
};

const HEADER_LABEL = `Verify Caller`;

/**
 * The Horizon Verify Caller Details Dialog is used to verify a Capitec Client.
 *
 * @export
 * @class VerifyCaller
 * @extends {Component}
 */

export class SecurityQuestionsFailed extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Property initialization
		this.renderMode = 0;
		this.incomingCallDetails = null;
		this.callerInformation = {};
		this.xdsMessage = ERROR_MESSAGE.DEFAULT_NOTIFICATION;
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._xdsErrorHandler(ex));
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {Object} incomingCallDetails - Incoming Caller Information
	 * @property {Object} callerInformation Information on the incoming caller (mini-profile)
	 * 
	 * @readonly
	 * @static
	 * @memberof SecurityQuestionsFailed
	 */

	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			callerInformation: { type: Object },
			renderMode: { type: Number },
			xdsMessage: { type: String },
			isBusy: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.voiceReferenceNumber = this.incomingCallDetails.voiceReferenceNumber;
		this.ivrOptions = this.incomingCallDetails.ivrOption.possibleValues;
		this.ivrOptionCode = this.incomingCallDetails.ivrOptionCode;
		this.incomingTelephoneNumber = this.incomingCallDetails.incomingTelephoneNumber;

		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
		this.incidentRecId = this.incomingCallDetails.incidentRecId;
		this.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _retrySecurityQuestions() {

		const clientID = this.callerInformation.southAfricanIDNumber;
		const returnValue = await this.callHandleService.xdsQuestions(clientID);

		if (returnValue.succeeded) {
			this.securityQuestions = returnValue.result;

			if (!this.securityQuestions.authenticationPermitted) {
				// common code - imported from VerifyCaller
				navigateToFailedScreen(this);
			} else if (this.securityQuestions.questions && this.securityQuestions.questions.length > 0) {
				this.dispatchEvent(new CustomEvent(`security-questions`, {
					detail: { 'securityQuestions': this.securityQuestions }
				}));
			} else {
				this.xdsMessage = this.securityQuestions.errorMessage;
			}
		}
	}


	_skip() {
		this.dispatchEvent(new CustomEvent(`skip`, {
			detail: {}
		}));
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

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_xdsErrorHandler(exception) {
		const state = {
			incomingCallDetails: this.incomingCallDetails,
			callerInformation: this.callerInformation
		};
		this.horizonStore.saveState(state);
		this.horizonRouter.navigateToSystemError();
		return true;
	}

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
                            .isNeedSelectable=${false}
						    .headerLabel="${HEADER_LABEL}"
                            @on-end-call="${() => this._onEndCall()}">
						<div slot="body">
							${this._renderNotificationStatus()}
							${this._renderOtherOptions()}
							${this._renderLoadingIndicator()}
						</div>
					</horizon-caller-dialog>
				`;
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
					<capitec-alert-banner type="unsuccessful-red">
						${this.xdsMessage}
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
                                            icon="system/knowledge-action"
                                            iconSize="default"
						                    @click="${() => this._retrySecurityQuestions()}">
					</horizon-option-button>
					<horizon-option-button label="Skip Verification" 
                                            icon="system/arrow-right-action"
                                            iconSize="default"
						                    @click="${() => this._skip()}">
					</horizon-option-button>
					<horizon-option-button label="Verify via Banking App" 
                                            icon="system/cellphone-action"
                                            iconSize="default"
						                    @click="${() => this._verifyUsingMobileApp()}">
					</horizon-option-button>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	_renderEndCallModal() {
		return html`
			<horizon-end-call-session
                @cancel="${() => this.renderMode = RENDER_MODE.VERIFY_CALLER_FAILED}"
				.incomingCallDetails = "${this.incomingCallDetails}">
			</horizon-end-call-session>`;
	}
}

window.customElements.define(`horizon-security-questions-failed`, SecurityQuestionsFailed);