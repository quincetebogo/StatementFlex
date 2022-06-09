import { Component, css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { ITAChannelService } from 'app/services/ITAChannelService';
import { KbaChannelService } from 'app/services/KbaChannelService';
import { Logger } from 'platform/core';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { VerifyCallerEvents } from 'app/constants/telemetry/events/VerifyCaller';

import 'app/components/common/CallerDialog';
import 'app/components/common/MultiLineLabel';

const RENDER_MODE = Object.freeze({
	KBA: 1,
	END_CALL: 2
});

const ANSWERS = Object.freeze({
	YES: `Yes`,
	NO: `No`
});

const VERIFICATION_STATUS = Object.freeze({
	VERIFIED: `VERIFIED`,
	UNVERIFIED: `UNVERIFIED`
});

const VERIFICATION_STATUS_REASON = Object.freeze({
	ONEWRONGANSWER: `1`,
	TWOWRONGANSWERS: `2`,
	THREEWRONGANSWERS: `3`,
	FOURWRONGANSWERS: `4`,
	UNKNOWNERROR: `-1`
});

/**
 * Verifying client via Knowledge Based Authentication (KBA)
 * 
 * Events Raised
 * -------------
 * cancel - should return to caller 
 * skip - should return to caller which should then navigate to the appropriate landing page
 * verify - should navigate to landing page with appropriate verification status
 * 
 * @export
 * @class VerifyByKBA
 * @extends {Component}
 */
export class VerifyByKBA extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.KBA;
		this.isBusy = false;
		this.SQs = [];
		this.mandatoryQus = [];
		this.orQus = [];
		this._enableVerify = false;
		this._disableAutoVerify = false;

		this.logger = Logger.getInstance();
		this.telemetry = HorizonTelemetry.getInstance();

		this.itaChannelService = new ITAChannelService(() => this._toggleBusyFlag(), () => true);
		this.kbaChannelService = new KbaChannelService(() => this._toggleBusyFlag(), () => true);
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} incomingCallDetails Information on the incoming call
	 * @property {object} incidentDetails Incident details
	 * @property {object} questions KBA questions
	 * 
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			incidentDetails: { type: Object },
			questions: { type: Object },
			cifNumber: { type: String },
			lastName: { type: String },
			title: { 
				type: String,
				attribute: `client-title`
			},

			isBusy: { state: true },
			renderMode: { state: true },
			mandatoryQus: { state: true },
			orQus: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		await this.telemetry.startSpan(VerifyCallerEvents.KBA, {});
		this._initialise();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();

		await this.telemetry.endSpan(VerifyCallerEvents.KBA, {});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _endCall() {
		await this.telemetry.logEvent(VerifyCallerEvents.KBA_END_CALL, {
			"screen": TelemetryScreen.KBA,
			"next-screen": TelemetryScreen.END_CALL
		});

		this.renderMode = RENDER_MODE.END_CALL;
	}

	async _cancelClick() {
		await this.telemetry.logEvent(VerifyCallerEvents.KBA_CANCEL, {
			"screen": TelemetryScreen.KBA,
			"next-screen": TelemetryScreen.CONFIRM_CALLER
		});

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	async _skipClick() {
		await this.telemetry.logEvent(VerifyCallerEvents.KBA_SKIP, {
			"screen": TelemetryScreen.KBA,
			"next-screen": null
		});

		this.dispatchEvent(new CustomEvent(`skip`, {}));
	}

	async _verifyAnswers() {
		const baggage = {};

		this.SQs.map((item, index) => Object.assign(baggage, {
			"screen": TelemetryScreen.KBA,
			"next-screen": null,
			[`Qus_${index + 1}-id`]: item.questionId,
			[`Qus_${index + 1}-ans`]: item.selectedAnswer
		}));
		await this.telemetry.logEvent(VerifyCallerEvents.KBA_VERIFY, baggage);

		const request = {
			questionList: this.SQs.map(item => {
				const temp = {
					"questionId": item.questionId,
					"question": item.question,
					"answer": item.answer,
					"providedAnswer": item.selectedAnswer === ANSWERS.YES,
					"enabled": item.enabled
				};
				return temp;
			}),
			cif: this.cifNumber,
			title: this.title,
			lastName: this.lastName
		};
		const returnValue = await this.kbaChannelService.verifyKBA(request, () => true);
		const result = returnValue?.result;

		await this.telemetry.logEvent(VerifyCallerEvents.KBA_OUTCOME, {
			"verification-status": result?.verificationStatus,
			"verification-reason": result?.verificationStatusReason
		}, baggage);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to verify KBA answers`, `_verifyAnswers`, returnValue.correlationId);
			this.dispatchEvent(new CustomEvent(`service-failure`, {}));
			return true;
		}

		switch (true) {
			case result.verificationStatus === VERIFICATION_STATUS.VERIFIED:
				this.dispatchEvent(new CustomEvent(`verified`, {}));
				break;

			case result.verificationStatus === VERIFICATION_STATUS.UNVERIFIED:
				this.logger.log(`info`, `Answered ${VERIFICATION_STATUS_REASON[result.verificationStatusReason]} question(s) incorrectly`, `_verifyClick`, returnValue.correlationId);
				this.dispatchEvent(new CustomEvent(`failed`, {}));
				break;

			default:
				this.logger.log(`warn`, `Unknown verification status to handle on verify KBA`, `_verifyClick`, returnValue.correlationId);
				break;
		}
	}

	_answerSelected(questionId, answer) {
		const qusIndex = this.SQs.findIndex(item => item.questionId === questionId);
		this.SQs[qusIndex].selectedAnswer = answer;

		this._applyChanges();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_initialise() {
		this.SQs = this.questions.map((item, index) => {

			/**
			 * When answer is empty, preselect the radio option to 'NO' and disabling the selection
			 * Ex: if client has not provided their email id, answer will be empty for that question
			 */
			if (!item.answer) {
				item.selectedAnswer = ANSWERS.NO;
				item.enabled = false;
			} else {
				item.selectedAnswer = item.providedAnswer ? ANSWERS.YES : ``;
			}
			
			item.rowNum = index;
			item.optional = index + 1 > this.questions.length - 2;
			return item;
		});

		this.mandatoryQus = this.SQs.filter(item => !item.optional);
		this.orQus = this.SQs.filter(item => item.optional);
	}

	async _applyChanges() {

		/**
		 * Rule 1: If one of the answers is NO, then
		 * disable direct verification
		 */
		const noInMandatoryQ = this.mandatoryQus.some(item => item.selectedAnswer === ANSWERS.NO);
		const noInOptionaQ = this.orQus.some(item => item.selectedAnswer === ANSWERS.NO);
		const isNoSelected = noInMandatoryQ || noInOptionaQ;

		// Why we are OR conditioning here? Once auto verification is disabled, there is no
		// enabling back
		this._disableAutoVerify = this._disableAutoVerify || isNoSelected;

		/**
		 * Rule 2: 
		 * Mandatory qus: all YES 
		 * Optional 1: NO
		 * Optional 2: YES, then do direct verification
		 */
		const allYes = this.mandatoryQus.every(item => item.selectedAnswer === ANSWERS.YES) &&
		 			   this.orQus.some(item => item.selectedAnswer === ANSWERS.YES);
		if (allYes && !this._disableAutoVerify) {
			await this._verifyAnswers();
		} else {
			this._enableVerify = this._enableVerify || allYes;
		}

		let allAnswered = false;
		if (noInMandatoryQ) {
			allAnswered = this.mandatoryQus.every(item => Boolean(item.selectedAnswer)) &&
						  this.orQus.some(item => Boolean(item.selectedAnswer));
		} else {
			allAnswered = this.SQs.filter(item => item.enabled)
								  .every(item => Boolean(item.selectedAnswer));
		}

		/**
		 * Enable the verify button when auto verification is disabled and
		 * all questions are answered (this is based on the mandatory questions answers)
		 */
		if (this._disableAutoVerify && allAnswered) {
			this._enableVerify = true;
		}

		this.requestUpdate();
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// N/A

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				div[slot="body"] {
					border-bottom: 1px solid #E1E1E1;
				}
				.content {
					height: 545px;
				}
				capitec-content-box {
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 13px;
					--theme-container-padding-right: 16px;
				}
				/* Alert banner styles */
				capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-layout-gap-spacing: 24px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 12px;
					--theme-label-default-font-size: 14px;
				}
				.alert-banner-group > capitec-label[type="strong"] {
					--theme-label-strong-font-size: 14px;
					--theme-label-strong-font-weight: 600;
				}
				/* Content header styles */
				.header-group {
					--theme-layout-gap-spacing: 12px;
				}
				.header-group > *:last-child {
					padding-right: 34px;
				}
				capitec-label[type="subtitle"] {
					--theme-label-subtitle-font-weight: 600;
				}
				/* Question box styles */
				capitec-card {
					border-left: 2px solid #009DE0;
					--theme-card-min-height: 72px;
				}
				.question-box {
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 34px;
					--theme-container-padding-bottom: 16px;
				}
				.optional-qus-box {
					--theme-layout-gap-spacing: 7px;
				}
				.optional-qus-box > capitec-group:first-child {
					margin-bottom: 12px;
				}
				bb-multi-line-label {
					padding-top: 4px;
					padding-bottom: 0px;

					--horizon-multi-line-label-align: left;
					--horizon-multi-line-label-font-size: 16px;
					--horizon-multi-line-label-font-weight: 600;
					--horizon-multi-line-label-line-height: 16px;
					--horizon-multi-line-value-font-size: 14px;
					--horizon-multi-line-value-line-height: 20px;
					--horizon-multi-line-value-gap: 6px;
				}
				bb-multi-line-label[label=""] {
					padding-top: 8px;
					--horizon-multi-line-label-line-height: 0px;
				}
				capitec-label[label="OR"] {
					line-height: 20px;
					padding-left: 36px;

					--theme-label-strong-font-size: 14px;
					--theme-label-strong-font-weight: 600;
					--theme-layout-gap-spacing: 0px;
				}
				.hide {
					visibility: hidden;
				}
				/* Footer styles */
				capitec-group[slot="footer"] {
					width: 664px;
				}
				capitec-button{
					height: 48px;
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-bottom: 14px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderDialog()}
			${this._renderLoadingIndicator()}
		`;
	}

	_renderDialog() {
		switch (this.renderMode) {
			case RENDER_MODE.KBA:
				return html`${this._renderKBADialog()}`;
			case RENDER_MODE.END_CALL:
				return html`${this._renderEndCallModal()}`;
			default:
				return html``;
		}
	}

	_renderKBADialog() {
		return html`
			<horizon-caller-dialog
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				.isNeedSelectable=${false}
				headerLabel="Security Questions"
				@on-end-call="${() => this._endCall()}">
				<div slot="body">
					${this._renderBody()}
				</div>
				${this._renderFooter()}
			</horizon-caller-dialog>
		`;
	}

	_renderBody() {
		return html`
			<capitec-content-box
				class="content"
				layout="vertical"
				halign="stretch"
				valign="top"
				gap="clear">
					${this._renderAlertBanner()}
					${this._renderSecurityQuestions()}
			</capitec-content-box>
		`;
	}

	_renderAlertBanner() {
		return html`
			<capitec-alert-banner
				data-automation-id="kba-alert-banner"
				type="warning">
					<capitec-group layout="horizontal" class="alert-banner-group" gap="none">
						<capitec-label type="strong" label="Note: "></capitec-label>
						<capitec-label type="default"
							label="Client must answer all questions correctly to pass authentication.">
						</capitec-label>
						<capitec-spacer></capitec-spacer>
					</capitec-group>
			</capitec-alert-banner>
		`;
	}

	_renderSecurityQuestions() {
		return html`
			<capitec-group
				class="header-group"
				layout="horizontal"
				halign="left"
				valign="top"
				gap="none">
					<capitec-label type="subtitle" label="Security questions"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label type="subtitle" label="Client confirmed"></capitec-label>
			</capitec-group>

			${this._renderQuestions()}
			${this._renderORQuestions()}
		`;
	}

	_renderQuestions() {
		return this.mandatoryQus.map(item => html`
			<capitec-card>
				<capitec-content-box class="question-box">
					<capitec-group
						layout="horizontal"
						halign="left"
						valign="top"
						gap="clear">
							<capitec-label type="subtitle" label="Q${item.rowNum + 1}"></capitec-label>

							<bb-multi-line-label
								label="${item.question}"
								.value="${item.answer || `-`}">
							</bb-multi-line-label>

							<capitec-spacer></capitec-spacer>

							<capitec-radio-group>
								<capitec-group layout="horizontal" gap="clear">
									<capitec-radio
										label="${ANSWERS.YES}"
										@value-change="${() => this._answerSelected(item.questionId, ANSWERS.YES)}"
										?checked = "${item.selectedAnswer === ANSWERS.YES}"
										?disabled="${!item.enabled}">
									</capitec-radio>
									<capitec-radio
										label="${ANSWERS.NO}"
										@value-change="${() => this._answerSelected(item.questionId, ANSWERS.NO)}"
										?checked = "${item.selectedAnswer === ANSWERS.NO}"
										?disabled="${!item.enabled}">
									</capitec-radio>
								</capitec-group>
							</capitec-radio-group>
					</capitec-group>
				</capitec-content-box>
			</capitec-card>
		`);
	}

	_renderORQuestions() {
		return this.orQus.length > 0 
		? html`
			<capitec-card>
				<capitec-content-box class="question-box optional-qus-box" layout="vertical" gap="clear">
					${this.orQus.map((item, index) => html`
						<capitec-group
							layout="horizontal"
							halign="left"
							valign="top"
							gap="clear">
								<capitec-label
									class="${index !== 0 ? `hide` : ``}"
									type="subtitle"
									label="Q${item.rowNum + 1}">
								</capitec-label>

								<bb-multi-line-label
									label="${index === 0 ? item.question : ``}"
									.value="${item.answer || `-`}">
								</bb-multi-line-label>

								<capitec-spacer></capitec-spacer>

								<capitec-radio-group>
									<capitec-group layout="horizontal" gap="clear">
										<capitec-radio
											label="${ANSWERS.YES}"
											@value-change="${() => this._answerSelected(item.questionId, ANSWERS.YES)}"
											?checked = "${item.selectedAnswer === ANSWERS.YES}"
											?disabled="${!item.enabled}">
										</capitec-radio>
										<capitec-radio
											label="${ANSWERS.NO}"
											@value-change="${() => this._answerSelected(item.questionId, ANSWERS.NO)}"
											?checked = "${item.selectedAnswer === ANSWERS.NO}"
											?disabled="${!item.enabled}">
										</capitec-radio>
									</capitec-group>
								</capitec-radio-group>
						</capitec-group>

						${this._renderORLabel(index + 1, this.orQus.length)}
					`)}
				</capitec-content-box>
			</capitec-card>`
		: html``;
	}

	_renderORLabel(index, length) {
		return index !== length
		? html`<capitec-label label="OR" type="strong"></capitec-label>`
		: html``;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" halign="right" gap="clear" slot="footer">
				<capitec-button
					id="id-cancel-button"
					type="clear"
					label="Cancel"
					@click="${() => this._cancelClick()}">
				</capitec-button>
			
				<capitec-spacer></capitec-spacer>
			
				<capitec-button
					id="id-skip-button"
					label="Skip Verification"
					@click="${() => this._skipClick()}">
				</capitec-button>
			
				<capitec-button
					id="id-verify-button"
					type="primary"
					label="Verify"
					?disabled="${!this._enableVerify}"
					@click="${() => this._verifyAnswers()}">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}
	
	_renderEndCallModal() {

		return html`
			<horizon-end-call-session
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				.callerInformation="${this.callerInformation}"
				endCallContext='VerifyClient${status}'
				@cancel="${() => this.renderMode = RENDER_MODE.SECURITY_QUESTIONS}">
			</horizon-end-call-session>`;
	}
}

window.customElements.define(`horizon-verify-kba`, VerifyByKBA);