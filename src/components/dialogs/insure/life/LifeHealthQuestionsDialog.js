import { Component, css, html, unsafeHTML } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
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
			showQuestionnaireResults: { type: Boolean, state: true }
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
	 * @param {*} e event from control
	 * @param {*} groupId question groupID
	 * @param {*} answerId answerID
	 * @param {*} answerDetail answer details
	 * @returns {void}
	 */
	_setAnswer(e, groupId, answerId, answerDetail) {
		// Clear all
		const radioButtons = this.shadowRoot.querySelectorAll(`.visibleControl`);
		radioButtons.forEach(radioButton => {
			radioButton.checked = false;
			radioButton.removeAttribute(`aria-checked`);
		});

		// Map new
		if (e.detail.new === true) {
			this.currentAnswerSingle = {
				questionGroupId: groupId,
				answerId: answerId,
				answer: e.detail.new,
				answerDetailDescription: answerDetail
			};
			this.enableNextButton = true;

			// Set Selected
			radioButtons.forEach(radioButton => {
				if (radioButton.id === answerId) {
					radioButton.checked = true;
				}
			});
		}
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
			const allowedCoverReq = {
				answers: this.finalAnswers
			};
			this.allowedCoverResults = await this.executeLifeAllowedCover(allowedCoverReq);
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

		// Reset Form and Fields
		const radioButtons = this.shadowRoot.querySelectorAll(`.visibleControl`);
		radioButtons.forEach(radioButton => {
			radioButton.checked = false;
		});

		this.currentQuestionIndex++;
		this.currentQuestion = this.lifeHealthQuestions.questions[this.currentQuestionIndex];
		this.currentAnswerSingle = {};
		this.currentAnswersMultiple = [];
		this.enableNextButton = false;
	}

	/**
	 * Continue with offer
	 * @returns {void}
	 */
	_continueToAllocation() {
		this.dispatchEvent(new CustomEvent(`continue`, {
			detail: {
				allowedCoverResults: this.allowedCoverResults
			}
		}));
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
			<capitec-modal type="form" header="${this.showQuestionnaireResults === false ? `Health Question ${this.currentQuestion?.groupId}` : `Questions Complete`}" style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: auto; z-index: 4000;">
				<div slot="body">
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
				<div>
					<div id="capitec-form-group">
						<div style="max-width: 500px;">
							<label>${unsafeHTML(this.currentQuestion?.description)}</label>
						</div>
						<div style="margin-top:15px;">
							<capitec-radio-group layout="vertical" style="margin-bottom: 10px;">
								${this.currentQuestion?.answers.map(answer => html`
									<capitec-radio
										class="visibleControl"
										id="${answer.answerId}" 
										label="${answer.detail}" 
										name="${answer.answerId}" 
										@value-changed="${(e) => this._setAnswer(e, this.currentQuestion.groupId, answer.answerId, answer.detail)}"
										>
									</capitec-radio>
								`)}
							</capitec-radio-group>
						</div>
					</div>
				</div>
			` : html`
				<div style="min-width: 350px;">
					<capitec-label style="text-align: center;  margin-bottom: 25px;"
						label="${this.allowedCoverResults?.message}"
						type="title">
					</capitec-label>
					<div>
						<horizon-label label="Maximum Cover Amount"
							value="${formatCurrencyInsureCoverAmount(formatCurrency(this.allowedCoverResults?.maximumAllowedCover))}">
						</horizon-label>
					</div>
					<div>
						<horizon-label label="Maximum Premium"
							value="${formatCurrency(this.allowedCoverResults?.maximumPremium)}">
						</horizon-label>
					</div>
				</div>
			`}
		`;
	}

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
					<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Next" @click="${() => this._nextQuestion()}" .disabled="${!this.enableNextButton}">
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