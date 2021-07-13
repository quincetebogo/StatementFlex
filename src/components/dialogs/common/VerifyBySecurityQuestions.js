import { Component, css, html } from 'platform/elements';
import { CALLERINFOBAR_CSS } from 'app/css/CallerInfoBar';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { Logger } from 'platform/core';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';
import { VerifyCallerEvents } from 'app/constants/Telemetry/Events/VerifyCaller';

import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonSelect';
import 'app/components/common/RadioButtonGroup';
import 'app/components/common/CallerDialog';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = Object.freeze({
	SECURITY_QUESTIONS: 1,
	END_CALL: 2
});

const HEADER_LABEL = `Security Questions`;

const ERROR_MESSAGE = `Please choose an option`;
const SYSTEM_ERROR = `System error. Please try again later`;

const MAX_XDS_ATTEMPTS = 2;

/**
 * Verify by Security questions dialog is used to verify the client's identity via Questions to mitigate the risk of fraud.
 * 
 * Events Raised 
 * -------------
 * cancel
 * skip
 * verified
 *
 * @export
 * @class VerifyBySecurityQuestions
 * @extends {Component}
 */

export class VerifyBySecurityQuestions extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.SECURITY_QUESTIONS;
		this.questionNumber = 0;
		this.questions = [];
		this.checked = false;
		this.alertBannerMessage = ``;

		this.logger = Logger.getInstance();

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this._telemetry = HorizonTelemetry.instance;

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag());
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {Object} incidentDetails Incident details
	 * @property {Object} incomingCallDetails Information about the incoming call (incoming number etc.)
	 * @property {Object} callerInformation Information on the incoming caller (mini-profile)
	 * @property {Object} securityQuestions The security questions object retrieved from XDS
	 * 
	 * @readonly
	 * @static
	 * @memberof VerifyBySecurityQuestions
	 */

	static get properties() {
		return {
			incidentDetails: { type: Object },
			incomingCallDetails: { type: Object },
			callerInformation: { type: Object },
			securityQuestions: { type: Object },

			renderMode: { attribute: false },
			questionNumber: { attribute: false },
			isBusy: { attribute: false },
			alertBannerMessage: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._telemetry.startSpan(VerifyCallerEvents.VERIFY_CALLER_XDS, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS
		});
		this.questions = this.securityQuestions.questions;
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(VerifyCallerEvents.VERIFY_CALLER_XDS, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_cancelClick() {
		this._telemetry.logEvent(VerifyCallerEvents.XDS_CANCEL, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS,
			"next-screen": null // Have to determine
		});

		this.dispatchEvent(new CustomEvent(`cancel`, {
			detail: {
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: this.callerInformation
			}
		}));
	}

	_skipClick() {
		this._telemetry.logEvent(VerifyCallerEvents.XDS_SKIP, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS,
			"next-screen": null // Have to determine
		});

		this.dispatchEvent(new CustomEvent(`skip`, {
			detail: {
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: this.callerInformation
			}
		}));
	}

	_continueClick() {
		if (!this.checked) {
			this.alertBannerMessage = ERROR_MESSAGE;
		} else {
			this._telemetry.logEvent(VerifyCallerEvents.XDS_NEXT_QUESTION, {
				"screen": TelemetryScreen.SECURITY_QUESTIONS,
				"next-screen": TelemetryScreen.SECURITY_QUESTIONS
			});

			this.alertBannerMessage = ``;
			this.questionNumber++;
			this.checked = false;
		}
	}

	async _verifyClick() {
		if (!this.checked) {
			this.alertBannerMessage = ERROR_MESSAGE;
		} else {
			this._telemetry.logEvent(VerifyCallerEvents.XDS_VERIFY_ANSWERS, {
				"screen": TelemetryScreen.SECURITY_QUESTIONS,
				"next-screen": null // Have to determine
			});

			this.alertBannerMessage = ``;
			this.checked = false;

			const returnValue = await this.callHandleService.verifySecurityQuestions(this.securityQuestions, () => true);
			
			if (returnValue.succeeded) {
				this.logger.log(`info`, `verifySecurityQuestions returned: ${returnValue.result}`);
				
				if (returnValue.result === `Authenticated`) {
					this._telemetry.logEvent(VerifyCallerEvents.XDS_SUCCESS, {
						"screen": TelemetryScreen.SECURITY_QUESTIONS,
						"next-screen": null // Have to determine
					});

					this.callerInformation.verificationStatus = `verified`;
					this.dispatchEvent(new CustomEvent(`verified`, { detail: { incomingCallDetails: this.incomingCallDetails, callerInformation: this.callerInformation } }));
				} else if (returnValue.result !== `Authenticated` && this.callerInformation.verificationAttempts.xdsAttempts < MAX_XDS_ATTEMPTS) {
					this._telemetry.logEvent(VerifyCallerEvents.XDS_FAILED, {
						"screen": TelemetryScreen.SECURITY_QUESTIONS,
						"next-screen": TelemetryScreen.SECURITY_QUESTIONS_FAILURE
					});

					this.dispatchEvent(new CustomEvent(`failed`, { detail: { incomingCallDetails: this.incomingCallDetails, callerInformation: this.callerInformation } }));
				} else {
					this._telemetry.logEvent(VerifyCallerEvents.XDS_FAILED, {
						"screen": TelemetryScreen.SECURITY_QUESTIONS,
						"next-screen": TelemetryScreen.XDS_FAILED
					});

					this.logger.log(`warn`, `Caller exceeded verification attempts!`, `_verifyClick`);

					this.callerInformation.verificationStatus = `failed`;
					this.horizonStore.setCallerInformation(this.callerInformation);
					this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);

					  // TODO: If ITA attmepts have been exceeded, this is the wrong thing to do
					this.horizonRouter.navigateToXdsVerificationFailed();
				}
			} else if (this.callerInformation.verificationAttempts.xdsAttempts < MAX_XDS_ATTEMPTS) {
				this._telemetry.logEvent(VerifyCallerEvents.XDS_FAILED, {
					"screen": TelemetryScreen.SECURITY_QUESTIONS,
					"next-screen": TelemetryScreen.SECURITY_QUESTIONS_FAILURE
				});

				this.logger.log(`error`, `Call to verifySecurityQuestions failed. Treating this as a first failure!`, `_verifyClick`);

				this.renderMode = RENDER_MODE.FIRST_FAILURE;
			} else {
				this._telemetry.logEvent(VerifyCallerEvents.XDS_FAILED, {
					"screen": TelemetryScreen.SECURITY_QUESTIONS,
					"next-screen": TelemetryScreen.XDS_FAILED
				});

				this.logger.log(`error`, `Call to verifySecurityQuestions failed. Treating this as the final failure.`, `_verifyClick`);

				this.callerInformation.verificationStatus = `failed`;

				this.horizonStore.setCallerInformation(this.callerInformation);
				this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);

				// TODO: If ITA attempts have been exceeded, this is the wrong thing to do
				this.horizonRouter.navigateToXdsVerificationFailed();
			}
		}
	}

	_valueChanged(e) {
		if (!this.checked) {
			this.checked = !this.checked;
		}

		this.alertBannerMessage = this.checked ? `` : ERROR_MESSAGE;

		this.questions[this.questionNumber].answers.forEach(answer => {
			if (answer.answerId === e.detail.key) {
				answer.isEnteredAnswerYN = true;
			} else {
				answer.isEnteredAnswerYN = false;
			}
		});
	}

	_endCallClick() {
		this._telemetry.logEvent(VerifyCallerEvents.XDS_END_CALL, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS,
			"next-screen": TelemetryScreen.END_CALL
		});

		this.renderMode = RENDER_MODE.END_CALL;
	}

	_cancelEndCall() {
		this.renderMode = this.callerInformation.verificationAttempts.xdsAttempts === 1 ? RENDER_MODE.FIRST_FAILURE : RENDER_MODE.SECURITY_QUESTIONS;
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

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			${CALLERINFOBAR_CSS}

			capitec-modal{
				--theme-modal-footer-padding : 7px 16px 16px 0px;
			}

			div[slot="body"] {
				width: 690px;
				height: 468px;
				border-radius: 5px;
			}

			div[slot="footer"] {
				width: 674px;
				margin: 9px 0px 7px 0px; 
			}

			.body-box {
				height: auto;
				--theme-container-padding-top: 0px;
				--theme-container-padding-bottom: 0px;
				--theme-container-padding-left: 0px;
				--theme-container-padding-right: 0px;
			}

			.question-number-label{
				height: 16px;
				width: 690px;
				color: #969B9D;
				font-family: "Hind Vadodara";
				font-size: 12px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 16px;
				text-align: center;
				margin: 16px 0px 2px 0px;
			}

			.question-label {
				height: 24px;
				width: auto;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				text-align: center;
				margin: 2px 60px 0px 60px;
			}

			.footer-wrapper{
				--theme-layout-gap-spacing: 0px;
			}

			#id-cancel-button {
				justify-content: flex-start;
				width: 80px;
				border-radius: 4px;
				--theme-button-clear-border-width: 0px;
				--theme-button-padding-right: 16px;
				--theme-button-padding-left: 16px;
			}

			#id-skip-button {
				width: 149px;
				margin-right: 9px;
				--theme-button-clear-border-width: 0px;
				--theme-button-padding-right: 16px;
				--theme-button-padding-left: 16px;
			}

			#id-continue-button {
				width: 112px;
				--theme-button-primary-border-width: 0px;
				--theme-button-padding-right: 12px;
				--theme-button-padding-left: 12px;
			}

			.id-verify-button{
				width: 87px;
				--theme-button-primary-border-width: 0px;
				--theme-button-padding-right: 12px;
				--theme-button-padding-left: 12px;
			}

			capitec-button{
				height: 48px;
				--theme-button-font-weight: 600;
				--theme-button-line-height: 20px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-bottom: 14px;
			}

			capitec-alert-banner {
				margin: 16px 16px 0px 16px;
				--theme-alert-banner-info-border: 0px;
				--theme-alert-banner-height: 48px;
				--theme-alert-banner-font-weight: 600;
				color: var(--theme-alert-banner-unsuccessful-red-font-color, #C83C37);
				background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
			}
			
			.radio-button {
				margin: 28px 60px 0px 60px;
			}`
		];
	}

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.SECURITY_QUESTIONS:
				return html`
					<horizon-caller-dialog class="main-container" 
							.incomingCallDetails="${this.incomingCallDetails}"
							.incidentDetails="${this.incidentDetails}"
							.isNeedSelectable=${false} 
							.headerLabel="${HEADER_LABEL}" 
							@on-end-call="${() => this._endCallClick()}">
						<div slot="body">
							<capitec-content-box class="body-box">
								${this._renderAlertBanner()}
								${this.questions.map((item, index) => this._renderSecurityQuestions(item, index))}
							</capitec-content-box>
							${this._renderLoadingIndicator()}
						</div>
						<div slot="footer">
							${this._renderFooter()}
						</div>
					</horizon-caller-dialog>
				`;
			case RENDER_MODE.END_CALL:
				return html`${this._renderEndCallModal()}`;
		default:
				return html``;
		}
	}

	_renderAlertBanner() {
		if (this.alertBannerMessage) {
			return html`<capitec-alert-banner label="${this.alertBannerMessage}" type="unsuccessful-red"></capitec-alert-banner>`;
		}
	}

	_renderSecurityQuestions(item, index) {

		let answers = this.questions[index].answers;
		answers = answers.map(answer => ({
			"key": answer.answerId,
			"value": answer.answer
		}));

		if (index === this.questionNumber) {
			return html`
				<capitec-label class="question-number-label" label="Question ${index + 1}"></capitec-label>
				<capitec-label class="question-label" label="${item.question.replace(/(\r\n|\n|\r)/gm, ``)}"></capitec-label>
				<horizon-radio-button-group
					class="radio-button" 
					.radioButtonsAvailable="${answers}"
					@value-change="${(e) => this._valueChanged(e)}">
				</horizon-radio-button-group>
		`;
		}
	}

	_renderFooter() {
		return html`
			<capitec-group class="footer-wrapper" layout="horizontal">
				<capitec-button
					id="id-cancel-button"
					type="clear"
					label="Cancel"
					@click="${() => this._cancelClick()}">
				</capitec-button>
			
				<capitec-spacer></capitec-spacer>
			
				<capitec-button
					id="id-skip-button"
					type="clear"
					label="Skip Verification"
					@click="${() => this._skipClick()}">
				</capitec-button>
			
				<capitec-button
					id="id-continue-button"
					type="primary"
					label="Continue"
					?hidden="${!(this.questionNumber !== this.questions.length - 1)}"
					@click="${() => this._continueClick()}">
				</capitec-button>
			
				<capitec-button
					id="id-verify-button"
					type="primary"
					label="Verify"
					?hidden="${!(this.questionNumber === this.questions.length - 1)}"
					@click="${() => this._verifyClick()}">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderEndCallModal() {
		return html`
			<horizon-end-call-session
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				endCallContext="VerifyClient"
				@cancel="${() => this.renderMode = RENDER_MODE.CONFIRM_CALLER}">
			</horizon-end-call-session>`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}


window.customElements.define(`horizon-security-question`, VerifyBySecurityQuestions);