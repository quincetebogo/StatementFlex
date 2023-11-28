import { Component, css, html } from 'platform/elements';
import { Logger } from 'platform/core';
import { formatDate } from 'app/utils/channelServiceUtilities';

const DISPUTE_STEPS = {
	Questions: 1,
	Declaration: 2
};

const QUESTION_TYPES = {
	RADIO: ``,
	TEXT: `input text`,
	CURRENCY: `input currency`,
	DATE: `input date`
};

const RESULTS = {
	TO_ETHOCA: `To Ethoca`,
	FROM_ETHOCA: `From Ethoca`,
	TO_AGENT: `To Agent`,
	COMPLETE: `Complete`,
	CLIENT_RESPONSIBILITY: `Client Responsibility`,
	MERCHANT_RESPONSIBILITY: `Merchant Responsibility`,
	HOLDING_PATTERN: `Holding Pattern`
};

const HASDISPUTERIGHTS = {
	YES: `Yes`,
	NO: `No`
};

/**
 * Dialog populates the cue sheet questions for raising dispute
 * 
 * Events Raised
 * -------------
 * cancel - should return to caller 
 * skip - should return to caller which should then navigate to the appropriate landing page
 * verify - should navigate to landing page with appropriate verification status
 * 
 * @export
 * @class Disputes
 * @extends {Component}
 */
export class Disputes extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.disputeCurState = DISPUTE_STEPS.Questions;
		this.declarationExpanded = true;
		this.agreementAccepted = false;
		this.showDeclarationError = false;
		this.systemError = false;
		this.qusNo = 0;
		this.selectedAnswer = ``;
		this.questionType = QUESTION_TYPES.RADIO;
		this.date = ``;
		this.input = ``; // Text or currency number
		this.currencyCode = ``;
		this.currFocussed = false;

		this.logger = Logger.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} transactionDetails Transaction to dispute
	 * 
	 */
	static get properties() {
		return {
			transactionDetails: { type: Object },
			disputeQuestion: { type: Object },
			getNextQuestion: { type: Object },
			restartQuestions: { type: Object },

			disputeCurState: { state: true },
			declarationExpanded: { state: true },
			agreementAccepted: { state: true },
			showDeclarationError: { state: true },
			systemError: { state: true },
			qusNo: { state: true },
			selectedAnswer: { state: true },
			currFocussed: { state: true }
		};
	}

	get disableNextBtn() {
		return !Boolean(this.selectedAnswer);
	}

	get steps() {
		return Object.entries(DISPUTE_STEPS).map(item => { 
			const obj = {
				title: item[0]
			};
			return obj;
		});
	}

	get isDisputed() {
		return this.disputeQuestion.clientHasDisputeRights === HASDISPUTERIGHTS.YES &&
				[RESULTS.COMPLETE, RESULTS.TO_ETHOCA].includes(this.disputeQuestion.disputeStep);
	}

	get isClientAgentQus() {
		return Boolean(this.disputeQuestion.clientQuestionWording) && Boolean(this.disputeQuestion.agentQuestionWording);
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.qusNo++;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.disputeQuestion = {};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	async _restartQuestions() {
		const returnValue = await this.restartQuestions(this.transactionDetails?.transactionId);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to restart cue sheet questions`, `_restartQuestions`, returnValue.correlationId);
			this.systemError = true;
			return;
		}

		this.disputeQuestion = returnValue.result;
		this.qusNo = 1;
		this._reset();
	}

	_answerSelected(answerId) {
		this.selectedAnswer = answerId;
	}

	async _next() {
		const nextQusReq = this._formatNextQusRequest();
		const returnValue = await this.getNextQuestion(nextQusReq);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to get next cue sheet questions`, `_next`, returnValue.correlationId);
			this.systemError = true;
			return;
		}

		this.disputeQuestion = returnValue.result;
		this.qusNo++;
		this._reset();

		if (this.disputeQuestion?.finalCue) {
			const ans = this.disputeQuestion?.answers.find((x, i) => i === 0);
			this.declarationContent = ans.clientAnswerWording.replace(`\n`, `\n\n`);

			if (this.isDisputed) {
				this.disputeCurState = DISPUTE_STEPS.Declaration;
				return true;
			}

			this._raiseDisputeOutcome(ans);
		}
	}

	_dispute() {
		if (!this.agreementAccepted) {
			this.showDeclarationError = true;
			return;
		}

		const ans = this.disputeQuestion?.answers.find((x, i) => i === 0);
		this._raiseDisputeOutcome(ans);
	}

	_agreeDeclaration(e) {
		this.agreementAccepted = e.detail.new;
		this.showDeclarationError = false;
	}

	_currCodeChanged(e, answerId) {
		this.currencyCode = e.detail.new.alphaCode;
		this.currFocussed = false;

		if (this.input) {
			this.selectedAnswer = answerId;
		}
	}

	_inputChanged(e, answerId) {
		this.input = e.detail.new;

		if (this.questionType === QUESTION_TYPES.CURRENCY && this.currencyCode) {
			this.selectedAnswer = answerId;
		} else {
			this.selectedAnswer = answerId;
		}
	}

	_dateChanged(e) {
		this.date = e.detail.new;
		this.selectedAnswer = answerId;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_reset() {
		this.selectedAnswer = ``;
		this.systemError = false;
		this.date = ``;
		this.input = ``; // Text or currency number
		this.currencyCode = ``;
	}

	_formatNextQusRequest() {
		const nextQusReq = {
			"cueSheetId": this.disputeQuestion.cueSheetId,
			"caseId": this.disputeQuestion.caseId,
			"answerId": this.selectedAnswer,
			"comments": ``,
			"dateInput": null,
			"currencyInput": null,
			"documentInput": null
		};

		switch (this.questionType) {
			case QUESTION_TYPES.TEXT:
				nextQusReq.comments = this.input;
				break;
			case QUESTION_TYPES.DATE:
				nextQusReq.dateInput = this.date;
				break;
			case QUESTION_TYPES.CURRENCY:
				nextQusReq.currencyInput = {
					"value": Number(this.input),
					"currencyNameOrCode": this.currencyCode
				};
				break;
			default:
				break;
		}
		return nextQusReq;
	}

	_raiseDisputeOutcome(firstElem) {
		
		this.dispatchEvent(new CustomEvent(`dispute-outcome`, {
			detail: {
				transDesc: this.transactionDetails?.statementDescription,
				disputed: this.isDisputed,
				clientAnswerWording: firstElem.clientAnswerWording,
				disputeStep: this.disputeQuestion.disputeStep
			}
		}));
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
				capitec-modal {
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
				}
				capitec-modal > div[slot="header"] {
					width: 1026px;
					margin-top: -12px;

					--theme-label-default-font-size: 16px;
					--theme-label-default-font-weight: 600;
					--theme-layout-gap-spacing: 7px;
				}
				div[slot="header"] > capitec-group > capitec-icon {
					--theme-icon-size-small: 20px;
					margin-top: 3px;
				}
				capitec-modal > div[slot="body"] {
					width: 1064px;
				}
				capitec-stepper {
					--theme-stepper-step-content-container-padding-left: 16px;
					--theme-stepper-step-container-height: 64px;
				}
				.dispute-tran-info > horizon-label {
					width: 164px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-color: #3A3A3A;
				}
				.dispute-tran-info > horizon-label:nth-child(2) {
					width: 255px;
				}
				.dispute-tran-info > horizon-label:nth-child(3) {
					width: 188px;
				}
				.content {
					height: 550px;
				}
				capitec-label[type="subtitle"] {
					--theme-label-font-color: #3A3A3A; 
				}
				capitec-label[type="strong"] {
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}
				.question-card {
					--theme-card-min-height: 56px;
				}
				.multiple-options-card {
					margin-bottom: 0px;
					--theme-card-border-radius: 4px 4px 0px 0px;
				}
				.question-box {
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 13px;
					--theme-container-padding-right: 18px;
					--theme-container-padding-bottom: 13px;
					border-left: 3px solid #009DE0;
					border-radius: 4px 4px 0px 0px;
				}
				.question-box .capitec-group {
					--theme-layout-gap-spacing: 16px;
				}
				.question-label {
					max-width: 982px;
				}
				capitec-radio-group {
					--theme-layout-gap-spacing: 12px;
				}
				capitec-radio-group > capitec-radio {
					--theme-radio-width: 20px;
					--theme-radio-height: 20px;
				}
				.multiple-ans-option {
					--theme-label-title-font-size: 14px;
					--theme-label-title-font-weight: 600;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-titlebar-min-height: 32px;
					--theme-type-clear-background: #F7F7F7;
					--theme-layout-gap-spacing: 0px;
					order: 3;
				}
				.multiple-ans-option-card {
					--theme-card-border-radius: 0px 0px 4px 4px;
					--theme-card-border: 0px;
				}
				.multiple-option-radio-group > capitec-radio {
					--theme-layout-gap-spacing: 8px;
					--theme-label-font-size: 16px;
				}
				.declaration-card {
					--theme-card-min-height: 48px;
				}
				capitec-expander {
					--theme-expander-height: auto;
					--theme-expander-border: 0px;
					--theme-expander-background-color: #F5F5F5;
					--theme-expander-header-font-size: 16px;
					--theme-expander-header-font-weight: 600;
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
				}
				.declaration-box {
					background-color: #FFFFFF;
					border-top: 1px solid #E1E1E1;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 16px;
				}
				.declaration-box > capitec-label {
					--theme-label-default-font-size: 15px;
				}
				.declaration-box > capitec-label:last-of-type {
					--theme-layout-gap-spacing: 24px;
				}
				.i-agree-card > capitec-content-box {
					--theme-container-padding-top: 11px;
					--theme-container-padding-bottom: 11px;
				}
				div[slot="footer"] {
					width: 1032px;
				}
				capitec-date-time-picker {
					--theme-date-time-picker-host-max-width: 180px;
					--theme-calendar-calendar-min-width: 180px;
				}
				.selectExpanded {
					height: 322px;
				}
				capitec-select{
					--theme-select-options-max-height: 185px;
				}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left">
				<div slot="header">
					${this._renderModalHeader()}
				</div>
				<div slot="body">
					${this._renderModalContent()}
				</div>
				<div slot="footer">
					${this._renderModalfooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderModalHeader() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-icon
					size="small"
					icon="status/warning-trans">
				</capitec-icon>
				<capitec-label label="Dispute Transaction"></capitec-label>
			</capitec-group>
		`;
	}

	_renderModalContent() {
		return html`
			<capitec-stepper
				layout="horizontal"
				.steps="${this.steps}"
				active-step-number="${this.disputeCurState}">
			</capitec-stepper>

			${this._renderDisputeTranInfo()}

			<capitec-content-box layout="vertical" gap="clear" class="content">
				${this._renderQuestionsContent()}
				${this._renderDeclarationContent()}
			</capitec-content-box>
		`;
	}

	_renderDisputeTranInfo() {
		return html`
			<capitec-title-bar type="default" class="dispute-tran-info">
				<horizon-label
					label="Transaction date"
					value = "${formatDate(this.transactionDetails.transactionDate, `dd mmm yyy hh:mm:ss`)}">
				</horizon-label>
				<horizon-label
					label="Description"
					value = "${this.transactionDetails.description}">
				</horizon-label>
				<horizon-label
					label="Card number"
					value = "${this.transactionDetails.cardNumber}">
				</horizon-label>
				<horizon-label
					label="Amount"
					value = "${this.transactionDetails.formatedAmount}">
				</horizon-label>
				<horizon-label
					label="Card status"
					value = "Active">
				</horizon-label>
			</capitec-title-bar>
		`;
	}

	_renderQuestionsContent() {
		return this.disputeCurState === 1
		? html`
			${this._renderQusBanner()}
			<capitec-group layout="horizontal" gap="none">
				<capitec-label type="subtitle" label="Questions"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label type="subtitle" label="Client feedback"></capitec-label>
			</capitec-group>

			${this._renderQuestion()}`
		: html``;
	}

	_renderQusBanner() {
		switch (true) {
			case this.systemError:
				return html`
					<horizon-alert-banner
						type="error"
						label="System error. Try again later">
					</horizon-alert-banner>`;
			case this.isClientAgentQus:
				return html`
					<horizon-alert-banner
						type="warning"
						header="Agent: "
						label="${this.disputeQuestion.agentQuestionWording}">
					</horizon-alert-banner>`;
			default:
				return html`
					<horizon-alert-banner
						type="info"
						header="Notify client: "
						label="All questions must be answered to complete the dispute request.">
					</horizon-alert-banner>`;
		}
	}

	_renderQuestion() {
		return html`
			<capitec-card class="question-card multiple-options-card">
				<capitec-content-box class="question-box">
					<capitec-group layout="horizontal" halign="left" valign="top" gap="clear" wrap>
						<capitec-label type="strong" label="Q${this.qusNo}"></capitec-label>
						<capitec-label
							class="question-label"
							type="strong"
							label="${this.disputeQuestion.clientQuestionWording || this.disputeQuestion.agentQuestionWording}">
						</capitec-label>
					</capitec-group>
				</capitec-content-box>
				${this._renderAnswer()}
			</capitec-card>
		`;
	}

	_renderAnswer() {
		const firstElem = this.disputeQuestion.answers[0];

		switch (firstElem.clientAnswerWording || firstElem.agentAnswerWording) {
			case `input currency`:
				this.questionType = QUESTION_TYPES.CURRENCY;
				return html`${this._renderAnsCurrency(firstElem)}`;
			case `input text`:
			case `input string`:
				this.questionType = QUESTION_TYPES.TEXT;
				return html`${this._renderAnsText(firstElem)}`;
			case `input date`:
				this.questionType = QUESTION_TYPES.DATE;
				return html`${this._renderAnsDate()}`;
			default:
				return html`${this._renderAnsOptions(this.disputeQuestion.answers)}`;
		}
	}

	_renderAnsCurrency(firstElem) {
		firstElem.currencyCodes = firstElem.currencyCodes.map(c => {
			c.label = `${c.alphaCode} - ${c.name}`;
			return c;
		});

		return html`
			<capitec-title-bar class="multiple-ans-option" type="clear" label="Input currency"></capitec-title-bar>
			<capitec-card class="multiple-ans-option-card">
				<capitec-content-box layout="horizontal" class="${this.currFocussed ? `selectExpanded` : ``}">
					<capitec-text-field
						label="Amount"
						type="numeric"
						value="${this.input}"
						@value-change="${(e) => this._inputChanged(e, firstElem.answerId)}">
					</capitec-text-field>
					<capitec-select
						label="Currency"
						.items="${firstElem.currencyCodes}"
						display-field="label"
						id-field="alphaCode"
						?searchable="${true}"
						value="${this.currencyCode}"
						@focus="${() => this.currFocussed = true}"
						@value-change="${(e) => this._currCodeChanged(e, firstElem.answerId)}">
					</capitec-select>
				</capitec-content-box>
			</capitec-card>`;
	}

	_renderAnsText(firstElem) {
		return html`
			<capitec-title-bar class="multiple-ans-option" type="clear" label="Input text"></capitec-title-bar>
			<capitec-card class="multiple-ans-option-card">
				<capitec-content-box>
					<capitec-text-box label="" minlength="1" maxlength="15" @value-change="${(e) => this._inputChanged(e, firstElem.answerId)}"></capitec-text-box>
				</capitec-content-box>
			</capitec-card>`;
	}

	_renderAnsDate(firstElem) {
		return html`
			<capitec-title-bar class="multiple-ans-option" type="clear" label="Input date"></capitec-title-bar>
			<capitec-card class="multiple-ans-option-card">
				<capitec-content-box>
					<capitec-date-time-picker
						type="single"
						mode="date"
						inputType="calendar"
						outputType="string"
						@value-change="${(e) => this._dateChanged(e, firstElem.answerId)}">
					</capitec-date-time-picker>
				</capitec-content-box>
			</capitec-card>`;
	}

	_renderAnsOptions(answers) {
		return html`
			<capitec-title-bar class="multiple-ans-option" type="clear" label="Choose an option"></capitec-title-bar>
			<capitec-card class="multiple-ans-option-card">
				<capitec-content-box>
					<capitec-radio-group layout="vertical" gap="clear" class="multiple-option-radio-group">
						${answers.map(item => html`
							<capitec-radio
								label="${item.clientAnswerWording || item.agentAnswerWording}"
								@value-change="${() => this._answerSelected(item.answerId)}"
								?checked="${this.selectedAnswer === item.answerId}"
								?disabled="${Boolean(this.selectedAnswer)}">
							</capitec-radio>
						`)}
					</capitec-radio-group>
				</capitec-content-box>
			</capitec-card>`;
	}

	_renderDeclarationContent() {
		return this.disputeCurState === 2
		? html`
			${this.showDeclarationError
			? html`
				<horizon-alert-banner
					type="error"
					label="You must confirm that you agree to the fee charge in order to dispute.">
				</horizon-alert-banner>`
			: html``}

			<capitec-card class="declaration-card">
				<capitec-expander
					label="Declaration"
					?expanded=${this.declarationExpanded}
					@expand="${() => this.declarationExpanded = true}"
					@collapse="${() => this.declarationExpanded = false}">
						<capitec-content-box class="declaration-box">
							<capitec-label type="default" label="${this.declarationContent}"></capitec-label>

							<capitec-card class="i-agree-card">
								<capitec-content-box>
									<capitec-check
										label="I agree to the penalty fee and above terms and conditions"
										?checked=${this.agreementAccepted}
										@value-change="${(e) => this._agreeDeclaration(e)}">
									</capitec-check>
								</capitec-content-box>
							</capitec-card>
						</capitec-content-box>
				</capitec-expander>
			</capitec-card>`
		: html``;
	}

	_renderModalfooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<capitec-button
					data-automation-id="dispute-cancel"
					type="clear"
					label="Cancel"
					@click="${() => this._cancel()}">
				</capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-button
					data-automation-id="dispute-restart-qus"
					label="Restart Questions"
					@click="${() => this._restartQuestions()}"
					?hidden="${this.disputeCurState === DISPUTE_STEPS.Declaration}"
					?disabled="${this.qusNo === 1}">
				</capitec-button>
				<capitec-button
					data-automation-id="dispute-next"
					type="primary"
					label="Next"
					@click="${() => this._next()}"
					?disabled="${this.disableNextBtn}"
					?hidden="${this.disputeCurState === DISPUTE_STEPS.Declaration}">
				</capitec-button>
				<capitec-button
					data-automation-id="dispute-confirm"
					type="primary"
					label="Dispute"
					@click="${() => this._dispute()}"
					?hidden="${this.disputeCurState === DISPUTE_STEPS.Questions}">
				</capitec-button>
			</capitec-group>
		`;
	}
}

window.customElements.define(`horizon-disputes`, Disputes);