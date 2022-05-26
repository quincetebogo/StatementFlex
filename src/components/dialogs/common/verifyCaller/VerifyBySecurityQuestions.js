import { Component, css, html } from 'platform/elements';
import { CALLERINFOBAR_CSS } from 'app/css/CallerInfoBar';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { Logger } from 'platform/core';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { VerifyCallerEvents } from 'app/constants/telemetry/events/VerifyCaller';

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
const CHOOSE_OPTION_MESSAGE = `Please choose an option`;

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
		this.isBusy = false;

		this.logger = Logger.getInstance();
		this.telemetry = HorizonTelemetry.getInstance();
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
	 * @property {Object} securityQuestions The security questions object retrieved from XDS
	 * @property {Object} finalAttempt Indicates if this is the final round of security questions
	 * 
	 * @readonly
	 * @static
	 * @memberof VerifyBySecurityQuestions
	 */

	static get properties() {
		return {
			incidentDetails: { type: Object },
			incomingCallDetails: { type: Object },
			securityQuestions: { type: Object },
			finalAttempt: { type: Boolean },
			cifNumber: { type: String },
			lastName: { type: String },
			title: {
				type: String ,
				attribute: `client-title`
			},

			renderMode: { state: true },
			questionNumber: { state: true },
			isBusy: { state: true },
			alertBannerMessage: { state: true },
			verificationResult: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.telemetry.startSpan(VerifyCallerEvents.VERIFY_CALLER_XDS, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS
		});
		this.questions = this.securityQuestions.questions;
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this.telemetry.endSpan(VerifyCallerEvents.VERIFY_CALLER_XDS, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancelClick() {
		this.telemetry.logEvent(VerifyCallerEvents.XDS_CANCEL, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS,
			"next-screen": null // Have to determine
		});

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_skipClick() {
		this.telemetry.logEvent(VerifyCallerEvents.XDS_SKIP, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS,
			"next-screen": null // Have to determine
		});

		this.dispatchEvent(new CustomEvent(`skip`, {}));
	}

	_continueClick() {
		if (!this.checked) {
			this.alertBannerMessage = CHOOSE_OPTION_MESSAGE;
			return;
		} 
		
		this.telemetry.logEvent(VerifyCallerEvents.XDS_NEXT_QUESTION, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS,
			"next-screen": TelemetryScreen.SECURITY_QUESTIONS
		});

		this.alertBannerMessage = ``;
		this.questionNumber++;
		this.checked = false;
	}

	async _verifyClick() {
		if (!this.checked) {
			this.alertBannerMessage = CHOOSE_OPTION_MESSAGE;
			return;
		};
				
		this.telemetry.logEvent(VerifyCallerEvents.XDS_VERIFY_ANSWERS, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS,
			"next-screen": null
		});

		this.alertBannerMessage = ``;
		this.checked = false;

		this.securityQuestions.title = this.title;
		this.securityQuestions.lastName = this.lastName;
		this.securityQuestions.cif = this.cifNumber;

		const returnValue = await this.callHandleService.verifySecurityQuestions(this.securityQuestions, () => true);
		const result = returnValue.result;
		
		if (!returnValue.succeeded) {
			this.telemetry.logEvent(VerifyCallerEvents.XDS_SERVICE_FAILURE, {
				"failure-reason": returnValue?.exception?.message
			}, true);

			this.dispatchEvent(new CustomEvent(`service-failure`, {}));
			return;
		};

		this.logger.log(`info`, `verifySecurityQuestions returned: ${JSON.stringify(result)}`, `_verifyClick`);

		// If we got an error model back, fail XDS
		if (result?.errorCode) {
			this._XdsFailed(result);
			return;
		}

		if (result.toLowerCase() === `authenticated`) {
			this.telemetry.logEvent(VerifyCallerEvents.XDS_SUCCESS, {
				"screen": TelemetryScreen.SECURITY_QUESTIONS,
				"next-screen": null // Have to determine
			}, true);

			this.dispatchEvent(new CustomEvent(`verified`, {}));
			return;
		} 

		this._authenticationFailed(result);
	}

	_XdsFailed(result) {
		this.telemetry.logEvent(VerifyCallerEvents.XDS_SERVICE_FAILURE, {
				"failure-reason": `${result?.errorCode}: ${result?.errorMessage}`
		}, true);

		this.logger.log(`warn`, `${result?.errorCode}: ${result?.errorMessage}`, `_XdsFailed`);

		this.dispatchEvent(new CustomEvent(`failed`, { 
			detail: {
				errorCode: result?.errorCode, 
				errorMessage: result?.errorMessage 
			} 
		}));
	}

	_authenticationFailed(result) {
		this.telemetry.logEvent(VerifyCallerEvents.XDS_SERVICE_FAILURE, {
			"failure-reason": `${JSON.stringify(result)}`
		}, true);

		this.logger.log(`warn`, `${JSON.stringify(result)}`, `_authenticationFailed`);
		
		this.dispatchEvent(new CustomEvent(`failed`, { 
			detail: {
				errorCode: result?.errorCode, 
				errorMessage: result?.errorMessage 
			} 
		}));
	}

	_valueChanged(e) {
		if (!this.checked) {
			this.checked = !this.checked;
		}

		this.alertBannerMessage = this.checked ? `` : CHOOSE_OPTION_MESSAGE;

		this.questions[this.questionNumber].answers.forEach(answer => {
			if (answer.answerId === e.detail.key) {
				answer.isEnteredAnswerYN = true;
			} else {
				answer.isEnteredAnswerYN = false;
			}
		});
	}

	_endCallClick() {
		this.telemetry.logEvent(VerifyCallerEvents.XDS_END_CALL, {
			"screen": TelemetryScreen.SECURITY_QUESTIONS,
			"next-screen": TelemetryScreen.END_CALL
		});

		this.renderMode = RENDER_MODE.END_CALL;
	}

	_cancelEndCall() {
		this.renderMode = RENDER_MODE.SECURITY_QUESTIONS;
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
		return html`
			${this._renderLoadingIndicator()}
			${this._renderContent()}
		`;
	}

	_renderContent() {
		switch (this.renderMode) {
			case RENDER_MODE.SECURITY_QUESTIONS:
				return html`
					<horizon-caller-dialog class="main-container" 
							.incomingCallDetails="${this.incomingCallDetails}"
							.incidentDetails="${this.incidentDetails}"
							.isNeedSelectable=${false} 
							headerLabel="${HEADER_LABEL}" 
							@on-end-call="${() => this._endCallClick()}">
						<div slot="body">
							<capitec-content-box class="body-box">
								${this._renderAlertBanner()}
								${this.questions.map((item, index) => this._renderSecurityQuestions(item, index))}
							</capitec-content-box>
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
		const status = this.finalAttempt ? `Failed` : `InProgress`;


		return html`
			<horizon-end-call-session
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				endCallContext='VerifyClient${status}'
				@cancel="${() => this.renderMode = RENDER_MODE.SECURITY_QUESTIONS}">
			</horizon-end-call-session>`;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}
}


window.customElements.define(`horizon-security-question`, VerifyBySecurityQuestions);