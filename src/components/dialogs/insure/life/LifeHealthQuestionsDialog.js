import { Component, css, html, unsafeHTML } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { LIFE_UPDATE_MODE } from 'app/constants/InsureCommon';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatCurrencyInsureCoverAmount } from 'app/utils/insureUtils';

/**
 * @export
 * @class LifeHealthQuestionsDialog
 * @extends {Component}
 */
class LifeHealthQuestionsDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.lifeHealthQuestions = {};

		this.currentQuestion = {};
		this.currentQuestionIndex = 0;
		this.currentAnswerSingle = {};
		this.enableNextButton = false;

		this.finalAnswers = [];
		this.showQuestionnaireResults = false;
		this.freeTextAnswerId = ``;
		this.updateMode = ``;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Object} currentQuestion -Object containing current question to display
	 * @property {Number} currentQuestionIndex Index of current question
	 * @property {Object} lifeHealthQuestions All life health questions
	 * @property {Object} executeLifeAllowedCover Callback function to execute allowed cover call
	 * @property {Object} allowedCoverResults Results from allowed cover call
	 * @property {Boolean} enableNextButton Flag to control next button via current questions validation results
	 * @property {Boolean} showQuestionnaireResults Flag to control results view
	 * @property {function} executeLifeIncreaseCover callback function to execute increase cover call
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			currentQuestion: { type: Object, state: true },
			currentQuestionIndex: { type: Number, state: true },
			lifeHealthQuestions: { type: Object, state: true },
			executeLifeAllowedCover: { type: Object, state: true },
			allowedCoverResults: { type: Object, state: true },
			enableNextButton: { type: Boolean, state: true },
			showQuestionnaireResults: { type: Boolean, state: true },
			updateMode: { type: String, state: true },
			executeLifeIncreaseCover: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this.currentQuestion = this.lifeHealthQuestions.questions[this.currentQuestionIndex];
	}

	/**
	 * Remove the component from the DOM.
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
	}

	//  #endregion LIFECYCLE OVERRIDES


	// #region PRIVATE METHODS

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Set answer change event for checkboxes and radio buttons
	 * 
	 * @param {*} groupId question groupID
	 * @param {*} answerId answerID
	 * @param {*} answerDetail answer details
	 * @returns {void}
	 */
	_setAnswer(groupId, answerId, answerDetail) {
		this.currentAnswerSingle = {
			questionGroupId: groupId,
			answerId: answerId,
			answer: true,
			answerDetailDescription: answerDetail
		};
		this.enableNextButton = true;
	}

	/**
	 * Next question event
	 * 
	 * @returns {void}
	 */
	async _nextQuestion() {
		this.finalAnswers.push(this.currentAnswerSingle);

		// Was it last question?
		if (this.currentQuestionIndex === this.lifeHealthQuestions.questions.length - 1) {
			console.log(`last question`);
			if (this.updateMode = LIFE_UPDATE_MODE.ALLOCATE) {
				const allowedCoverReq = {
					answers: this.finalAnswers
				};
				this.allowedCoverResults = await this.executeLifeAllowedCover(allowedCoverReq);
				this.allowedCoverResults.message = this.allowedCoverResults.message.replaceAll(`'`, ``);
			} else { // Increase cover
				const increaseCoverReq = {
					answers: this.finalAnswers
				};
				this.increaseCoverResults = await this.executeLifeIncreaseCover(increaseCoverReq);
				console.log(`this.increaseCoverResults :>> `, this.increaseCoverResults);
			}
			
			this.showQuestionnaireResults = true;
			return;
		}

		// More questions
		if (this.lifeHealthQuestions.questions[this.currentQuestionIndex + 1].isReflexive === true) {
			if (this.currentAnswerSingle.answerId !== this.lifeHealthQuestions.questions[this.currentQuestionIndex + 1].dependentAnswerName) {
				this.currentQuestionIndex++;
			} else {
				let foundNextQuestion = false;
				let nextQuestionIndex = this.currentQuestionIndex + 1;
				while (foundNextQuestion === false) {
					if (this.lifeHealthQuestions.questions[nextQuestionIndex].isReflexive === false) {
						foundNextQuestion = true;
						break;
					} else {
						nextQuestionIndex++;
					}
				}
			}
		}

		// Move on to next question
		this.currentQuestionIndex++;
		this.currentQuestion = this.lifeHealthQuestions.questions[this.currentQuestionIndex];
		this.currentAnswerSingle = {};
		this.currentAnswersMultiple = [];
		this.enableNextButton = false;

		// Clear all
		const radioButtons = this.shadowRoot.querySelectorAll(`.visibleControl`);
		radioButtons.forEach(radioButton => {
			radioButton.checked = false;
			radioButton.removeAttribute(`aria-checked`);
		});
	}

	/**
	 * Continue with offer
	 * @returns {void}
	 */
	_continueToAllocation() {
		if (this.updateMode === LIFE_UPDATE_MODE.ALLOCATE) {
			this.dispatchEvent(new CustomEvent(`continue`, {
				detail: {
					allowedCoverResults: this.allowedCoverResults,
					allowedCoverAnswers: this.finalAnswers
				}
			}));
		} else {
			this.dispatchEvent(new CustomEvent(`continue`, {
				detail: {
					increaseCoverResults: this.increaseCoverResults,
					increaseCoverAnswers: this.finalAnswers
				}
			}));
		}
		
	}

	/**
	 * Back event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-dialog`));
	}

	// #endregion EVENT HANDLERS

	// #region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
				${INSURE_CSS}
			
				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
					--theme-modal-body-padding: 20px 20px 0px 20px;
				}

				capitec-radio-group {
					--theme-buttonbar-item-gap: 14px;
				}
				
				capitec-radio-group > capitec-radio {
					height: 20px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-size: 15px;
					--theme-label-font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
					margin: 10px 0px;
				}

				capitec-check-group > capitec-check {
					height: 20px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-size: 15px;
					--theme-label-font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
					margin: 10px 0px;
				}

				.offer-details-cell{
					text-align: center;
				}

				.offer-details-value{
					font-weight: bold;
					font-size: 20px;
				}
				`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
		`;
	}

	/**
	 * Main content renderer
	 * @returns {void}
	 */
	_renderContent() {
		return html`
			<capitec-modal type="form" header="${this.showQuestionnaireResults === false ? `Question ${this.currentQuestion?.groupId}` : `Life Cover offer`}" style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: auto; z-index: 4000;">
				<div slot="body" style="width: 500px">
					${this._renderDialogBody()}
				</div>
				<div slot="footer">
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`;
	}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {
		return html`
			${this.showQuestionnaireResults === false ? html`
				${this._renderCustomRadioGroup()}` : html`
				<div style="min-width: 350px; min-height: 140px;">
					<div style="display: flex; justify-content: space-around; padding-top: 20px; padding-bottom: 30px;">
						<div class="offer-details-cell">
							<div>Get up to</div>
							<div class="offer-details-value">${formatCurrencyInsureCoverAmount(formatCurrency(this.allowedCoverResults?.maximumAllowedCover))}</div>
						</div>
				
						<div class="offer-details-cell">
							<div>Monthly Premium</div>
							<div class="offer-details-value">${formatCurrency(this.allowedCoverResults?.maximumPremium)}</div>
						</div>
					</div>
					<p>You can choose a lower cover amount for a lower premium, to fit your budget</p>
				</div>
			`}
		`;
	}

	_renderCustomRadioGroup() {
		return html`
			<div>
				<div style="max-width: 500px; min-height: 50px; margin-bottom: 10px;">
					<label>${unsafeHTML(this.currentQuestion?.description)}</label>
				</div>
				${this.currentQuestion?.answers.map(answer => html`
					<div style="display: block; margin-bottom: 10px;">
						<input @click=${() => this._setAnswer(this.currentQuestion.groupId, answer.answerId, answer.detail)} class="visibleControl" type="radio" style="cursor: pointer;" value="${answer.detail}" name="${this.currentQuestion.groupId}" id="${answer.answerId}">
						<label style="cursor: pointer;" for="${answer.answerId}">${answer.detail}</label>
					</div>
				`)}
			</div>
		`;
	}

	// @change="${this._setAnswer(this.currentQuestion.groupId, answer.answerId, answer.detail)}"

	/**
	 * Render question set, in separate function because of refresh workaround
	 * @returns {html} The html content of the component.
	 */
	// _renderRadioGroup() {
	// 	return html`
	// 		<div style="min-height: 180px;">
	// 			<div id="capitec-form-group">
	// 				<div style="max-width: 500px; min-height: 50px;">
	// 					<label>${unsafeHTML(this.currentQuestion?.description)}</label>
	// 				</div>
	// 				<div style="margin-top:15px;">
	// 					<capitec-radio-group layout="vertical" style="margin-bottom: 10px;" id="questions-radio-group">
	// 						${this.currentQuestion?.answers.map(answer => html`
	// 							<capitec-radio
	// 								class="visibleControl"
	// 								id="${answer.answerId}" 
	// 								label="${answer.detail}" 
	// 								name="${answer.answerId}" 
	// 								@value-changed="${(e) => this._setAnswer(e, this.currentQuestion.groupId, answer.answerId, answer.detail)}">
	// 							</capitec-radio>
	// 						`)}
	// 					</capitec-radio-group>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	`;
	// }

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button class="capitec-button-small" slot="footer" type="clear" label="Cancel" @click="${() => this._cancelClick()}">
				</capitec-button>

				${this.showQuestionnaireResults === false ? html`
					<capitec-button .disabled="${!this.enableNextButton}" class="capitec-button-small" slot="footer" type="primary" label="Next" @click="${() => this._nextQuestion()}">
					</capitec-button>
				` : html`
					<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Continue" @click="${() => this._continueToAllocation()}">
					</capitec-button>
				`}
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-health-questions-dialog`, LifeHealthQuestionsDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-life-health-questions-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-health-questions-dialog>
 *
 * @event LifeHealthQuestionsDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * Send continue event to consuming component when 'Continue' is clicked 
 * 
 * @example
 * <horizon-insure-life-health-questions-dialog ... @continue="${this._handler}"></horizon-insure-life-health-questions-dialog>
 * 
 * @event LifeHealthQuestionsDialog#continue
 * @type {Object} - N/A
 */