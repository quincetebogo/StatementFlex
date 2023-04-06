import { Component, css, html } from 'platform/elements';
import { formatDate } from 'app/utils/channelServiceUtilities';

const DISPUTE_STEPS = {
	Questions: 1,
	Declaration: 2
};

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
			disputeQuestions: { type: Array },
			getNextQuestion: { type: Object },

			disputeCurState: { state: true },
			declarationExpanded: { state: true },
			agreementAccepted: { state: true },
			showDeclarationError: { state: true }
		};
	}

	get disableNextBtn() {
		const len = this.disputeQuestions.length;
		const lastElem = this.disputeQuestions[len - 1];
		return !Boolean(lastElem?.finalCue) || !this.allAnswered;
	}

	get allAnswered() {
		return this.disputeQuestions.every(item => Boolean(item.selectedAnswer));
	}

	get steps() {
		return Object.entries(DISPUTE_STEPS).map(item => { 
			const obj = {
				title: item[0]
			};
			return obj;
		});
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.disputeQuestions = [];
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_restartQuestions() {

	}

	async _answerSelected(answerId, cueSheetId) {
		const index = this.disputeQuestions.findIndex(item => item.cueSheetId === cueSheetId);
		this.disputeQuestions[index].selectedAnswer = answerId;

		if (!this.disputeQuestions[index].finalCue) {
			const nxtQus = await this.getNextQuestion(answerId);
			
			this.disputeQuestions.push(nxtQus);
			this._initialise();
		}
		
		this.requestUpdate();
	}

	_dispute() {
		if (!this.agreementAccepted) {
			this.showDeclarationError = true;
			return;
		}
		this.dispatchEvent(new CustomEvent(`dispute-confirm`, {}));
	}

	_agreeDeclaration(e) {
		this.agreementAccepted = e.detail.new;
		this.showDeclarationError = false;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		this.disputeQuestions = this.disputeQuestions.map((item, index) => {
			item.rowNum = index + 1;
			item.selectedAnswer = item.selectedAnswer;
			item.mutipleOptions = item.answers.length > 2; // temp check
			return item;
		});
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
					height: 660px;
				}
				capitec-label[type="subtitle"] {
					--theme-label-font-color: #3A3A3A; 
				}
				capitec-label[type="strong"] {
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}
				.question-card {
					border-left: 3px solid #009DE0;
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
				}
				.question-box . capitec-group {
					--theme-layout-gap-spacing: 16px;
				}
				capitec-radio-group {
					--theme-layout-gap-spacing: 26px;
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
				}
				.multiple-ans-option-card {
					--theme-card-border-radius: 0px 0px 4px 4px;
				}
				.multiple-option-radio-group > capitec-radio {
					--theme-layout-gap-spacing: 8px;
					--theme-label-font-size: 16px;
				}
				.declaration-card {
					--theme-card-min-height: 48px;
				}
				capitec-expander {
					--theme-expander-height: 368px;
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
			<horizon-alert-banner
				type="info"
				header="Notify client: "
				label="All questions must be answered to complete the dispute request."
				?hidden="${this.showDeclarationError}">
			</horizon-alert-banner>

			<capitec-group layout="horizontal" gap="none">
				<capitec-label type="subtitle" label="Questions"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label type="subtitle" label="Client feedback"></capitec-label>
			</capitec-group>

			${this._renderQuestions()}`
		: html``;
	}

	_renderQuestions() {
		return this.disputeQuestions.map(item => html`
			<capitec-card class="question-card ${item.mutipleOptions ? `multiple-options-card` : ``}">
				<capitec-content-box class="question-box">
					<capitec-group layout="horizontal" halign="left" valign="top" gap="clear">
							<capitec-label type="strong" label="Q${item.rowNum}"></capitec-label>

							<capitec-label type="strong" label="${item.clientQuestionWording}">
							</capitec-label>

							<capitec-spacer></capitec-spacer>

							${this._renderYesOrNoAnswers(item.answers, item.cueSheetId, item.selectedAnswer)}
					</capitec-group>
				</capitec-content-box>
			</capitec-card>
			${this._renderMultipleOptionAns(item.answers, item.cueSheetId, item.selectedAnswer)}
		`);
	}

	_renderYesOrNoAnswers(answers, cueSheetId, selectedAnswer) {
		return answers.length === 2
		? html`
			<capitec-radio-group layout="horizontal" gap="clear">
				${answers.map(item => html`
					<capitec-radio
						label="${item.clientAnswerWording}"
						@value-change="${() => this._answerSelected(item.answerId, cueSheetId)}"
						?checked="${selectedAnswer === item.answerId}"
						?disabled="${Boolean(selectedAnswer)}">
					</capitec-radio>
				`)}
			</capitec-radio-group>`
		: html``;
	}

	_renderMultipleOptionAns(answers, cueSheetId, selectedAnswer) {
		return answers.length > 2
		? html`
			<capitec-title-bar class="multiple-ans-option" type="clear" label="Choose an option"></capitec-title-bar>
			<capitec-card class="multiple-ans-option-card">
				<capitec-content-box>
					<capitec-radio-group layout="vertical" gap="clear" class="multiple-option-radio-group">
						${answers.map(item => html`
							<capitec-radio
								label="${item.clientAnswerWording}"
								@value-change="${() => this._answerSelected(item.answerId, cueSheetId)}"
								?checked = "${selectedAnswer === item.answerId}"
								?disabled="${Boolean(selectedAnswer)}">
							</capitec-radio>
						`)}
					</capitec-radio-group>
				</capitec-content-box>
			</capitec-card>`
		: html``;
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
							<capitec-label type="default" label="If your dispute is successful, Capitec will automatically credit your account with the disputed amount(s)."></capitec-label>
							<capitec-label type="default" label="If the merchant also issues you with a refund, or if they’re able to prove that the disputed transaction is valid, Capitec will automatically debit the disputed amount from your account."></capitec-label>
							<capitec-label type="default" label="It’s important to remember that you will be charged an R80 Charge Back fee for each transaction you dispute. This means that Capitec will debit your savings account with the R80.00 Charge Back fee once you proceed with this dispute."></capitec-label>
							<capitec-label type="default" label="If we need any further documents or information from regarding this dispute, a Capitec agent will contact with you."></capitec-label>
							<capitec-label type="default" label="Please confirm if you agree to the R80 charge back fee."></capitec-label>

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
					?hidden="${this.disputeCurState === DISPUTE_STEPS.Declaration}">
				</capitec-button>
				<capitec-button
					data-automation-id="dispute-back"
					label="Back"
					@click="${() => this.disputeCurState = DISPUTE_STEPS.Questions}"
					?hidden="${this.disputeCurState === DISPUTE_STEPS.Questions}">
				</capitec-button>
				<capitec-button
					data-automation-id="dispute-next"
					type="primary"
					label="Next"
					@click="${() => this.disputeCurState = DISPUTE_STEPS.Declaration}"
					?disabled="${this.disableNextBtn}"
					?hidden="${this.disputeCurState === DISPUTE_STEPS.Declaration}">
				</capitec-button>
				<capitec-button
					data-automation-id="dispute-confirm"
					type="primary"
					label="Dispute"
					@click="${() => this._dispute()}"
					?disabled="${this.disableNextBtn}"
					?hidden="${this.disputeCurState === DISPUTE_STEPS.Questions}">
				</capitec-button>
			</capitec-group>
		`;
	 }
}

window.customElements.define(`horizon-disputes`, Disputes);