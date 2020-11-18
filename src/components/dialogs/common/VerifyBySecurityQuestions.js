import { Component, css, html } from 'platform/elements';
import { CALLERINFOBAR_CSS } from 'app/css/CallerInfoBar';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { CallHandleService } from 'app/services/CallHandleService';

import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonSelect';
import 'app/components/common/HorizonRadioButtonsContainer';
import 'app/components/common/HorizonCallerDialog';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/SecurityQuestionsFailed';

const RENDER_MODE = {
	SECURITY_QUESTIONS: 0,
	END_CALL: 1,
	FIRST_FAILURE: 2
};
const HEADER_LABEL = `Security Questions`;

/**
 * Verify by Security questions dialog is used to verify the client's identity via Questions to mitigate the risk of fraud.
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

		this.incomingCallDetails = {};
		this.callerInformation = {};
		this.renderMode = 0;
		this.questionNumber = 0;
		this.state = [];
		this.questions = [];
		this.checked = false;
		this.securityQuestions = {};
		this.retryCount = 0;


		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), null);

	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {Object} incomingCallDetails - Incoming Caller Information
	 * 
	 * @readonly
	 * @static
	 * @memberof VerifyBySecurityQuestions
	 */

	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			callerInformation: { type: Object },
			securityQuestions: { type: Object },
			renderMode: { type: Number },
			questionNumber: { type: Number },
			retryCount: { type: Number }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.questions = this.securityQuestions.questions;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_onCancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {
			detail: {}
		}));
	}

	_onSkip() {
		this.dispatchEvent(new CustomEvent(`skip`, {
			detail: {}
		}));
	}

	_onContinueClick() {
		if (!this.checked) {
			// show an Alert Banner for radio button validation - To Do
		} else {
			this.questionNumber++;
			this.checked = false;
		}

	}

	async _verifyAnswers() {
		//  TODO: To be handled -service call to verify answers after going through all the security questions
		const response = {
			"subscriberID": 14670,
			"subscriberAuthenticationID": 1158673,
			"authenticationDate": "2020-11-02T06:37:20",
			"authenticationStatusInd": "P",
			"authenticationTypeInd": "P",
			"referenceNo": "A1158673",
			"totalQuestionPointValue": 369,
			"requiredAuthenticatedPerc": 75.0,
			"authenticatedPerc": 0.0,
			"repeatAuthenticationMessage": "",
			"actionedBySystemUserID": 32505,
			"firstName": "GENVIEVRE",
			"secondName": null,
			"surname": "ECROIGNARD",
			"idNo": "7706200247083",
			"passportNo": null,
			"birthDate": "1977-06-20",
			"gender": "F",
			"ha_FirstName": "GENVIEVRE",
			"ha_SecondName": "DESIREE",
			"ha_Surname": "ECROIGNARD",
			"ha_IDNo": "7706200247083",
			"ha_DeceasedStatus": "Active",
			"ha_DeceasedDate": null,
			"ha_CauseOfDeath": null,
			"ha_IDIssuedDate": "1994-03-08",
			"consumerAccountAgeMessage": "Consumer's Jets account is 21 year(s) and 6 month(s) old \nConsumer's Woolworths Card account is 21 year(s) and 6 month(s) old \nConsumer's RCS Game account is 7 year(s) and 9 month(s) old \nConsumer's Truworths account is 1 year(s) and 4 month(s) old \nConsumer's Truworths account is 16 year(s) and 11 month(s) old \nConsumer's Mr Price Weekend account is 1 year(s) and 4 month(s) old \nConsumer's Sheet Street account is 9 year(s) and 2 month(s) old \nConsumer's Foschini account is 11 year(s) and 6 month(s) old \n",
			"encryptedReferenceNo": "",
			"authenticationComment": "",
			"safpsIndicator": false,
			"isUserBlocked": false,
			"personalQuestionsEnabled": false,
			"blockingEnabledFlag": false,
			"referToFraud": true,
			"blockId": 0,
			"blockingReason": "",
			"questionTimeout": 480,
			"errorMessage": "",
			"voidOrFraudReason": "",
			"noOfAttemptsRemaining": 0,
			"otpStatus": false,
			"otpEnabled": false,
			"otpNotGeneratedReason": "",
			"otpValue": "",
			"authenticationStatusReason": "NotProcessed",
			"safpsMessage": "Not Listed on SAFPS",
			"questions": [
				{
					"productAuthenticationQuestionID": 27001,
					"question": "Have you worked at TOWER ELECTRONIC SYSTEMS PTY LTD?",
					"answerStatusInd": "P",
					"questionPointValue": 84,
					"requiredNoOfAnswers": 1,
					"answers": [
						{
							"answerId": 15455468,
							"answer": "Yes",
							"isEnteredAnswerYN": true
						}
					]
				},
				{
					"productAuthenticationQuestionID": 28057,
					"question": "Did you purchase the property at 17 VILJOEN STREET, BEYERSPARK, BOKSBURG, 1459 in 2018?",
					"answerStatusInd": "P",
					"questionPointValue": 63,
					"requiredNoOfAnswers": 1,
					"answers": [
						{
							"answerId": 15455476,
							"answer": "No",
							"isEnteredAnswerYN": true
						},
					]
				},
				{
					"productAuthenticationQuestionID": 21007,
					"question": "Is your Nedbank Credit Card account active?",
					"answerStatusInd": "P",
					"questionPointValue": 85,
					"requiredNoOfAnswers": 1,
					"answers": [
						{
							"answerId": 15455466,
							"answer": "Yes",
							"isEnteredAnswerYN": true
						}
					]
				},
				{
					"productAuthenticationQuestionID": 21017,
					"question": "With which company do you have a home loan?",
					"answerStatusInd": "P",
					"questionPointValue": 66,
					"requiredNoOfAnswers": 1,
					"answers": [
						{
							"answerId": 15455480,
							"answer": "Standard Chartered Mortgage Loans",
							"isEnteredAnswerYN": true
						}
					]
				},
				{
					"productAuthenticationQuestionID": 28068,
					"question": "Name one of your home phone numbers",
					"answerStatusInd": "P",
					"questionPointValue": 71,
					"requiredNoOfAnswers": 5,
					"answers": [
						{
							"answerId": 15455471,
							"answer": "0100101010",
							"isEnteredAnswerYN": true
						}
					]
				}
			],
			"authenticationHistory": [
				{
					"bureauDate": "2020-11-02 06:37:20 AM",
					"subscriberName": "Authentication V2.3",
					"cellularNumber": "",
					"authenticationStatus": "Pending",
					"authenticationPerc": "0.0000",
					"emailAddress": ""
				}
			],
			"voidReasons": [
				{
					"voidReasonId": 0,
					"voidReason": "",
					"isEnteredReasonYN": true
				}
			],
			"personalQuestions": [

			],
			"fraudReasons": [
				{
					"fraudReasonID": 0,
					"fraudReason": "",
					"isEnteredReasonYN": true
				}
			]
		}
		const returnValue = await this.callHandleService.verifySecurityQuestions(response, null);


		// if (this.retryCount < 1) {
		// 	this.renderMode = RENDER_MODE.FIRST_FAILURE;
		// 	this.retryCount++;
		// } else {
		// 	const state = {
		// 		callerInformation: this.callerInformation,
		// 		incomingCallDetails: this.incomingCallDetails
		// 	};

		// 	this.callerInformation.verificationStatus = "verified";

		// 	this.horizonStore.saveState(state);

		// 	this.horizonRouter.navigateToQuickTransactionFavourites();
		// }
	}

	_onEndCall() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_onValueChanged(e) {
		if (!this.checked) {
			this.checked = !this.checked;
		}
		if (e.detail.new) {
			this.state[this.questionNumber] = {
				"questionID": this.questions[this.questionNumber].productAuthenticationQuestionID,
				"question": this.questions[this.questionNumber].question,
				"selectedAnswerId": e.detail.key
			};

			// saving to the state - answers selected by the caller for each question
			this.horizonStore.saveState({ "securityQuestions": this.state });
		}
	}

	_retrySecurityQuestions() {
		if (this.retryCount <= 1) {
			this.questionNumber = 0;
			this.renderMode = RENDER_MODE.SECURITY_QUESTIONS;
		}
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
				--theme-container-padding-top: 16px;
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
				margin: 0px;
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

			.radio-button {
				margin: 28px 60px 0px 60px;
			}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.SECURITY_QUESTIONS:
				return html`
					<horizon-caller-dialog class="main-container" .incomingCallDetails="${this.incomingCallDetails}"
						.headerLabel="${HEADER_LABEL}" @on-end-call="${() => this._onEndCall()}">
						<div slot="body">
							<capitec-content-box class="body-box">
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
			case RENDER_MODE.FIRST_FAILURE:
				return html`${this._renderFailureModal()}`;
			default:
				return html``;
		}
	}

	_renderSecurityQuestions(item, index) {

		let answers = this.questions[index].answers;
		answers = answers.map(item => ({
			"key": item.answerId,
			"value": item.answer,
			"checked": item.isEnteredAnswerYN
		}));

		if (index === this.questionNumber) {
			return html`
				<capitec-label class="question-number-label" label="Question ${index + 1}"></capitec-label>
				<capitec-label class="question-label" label="${item.question}"></capitec-label>
				<horizon-radio-button
                    class="radio-button"
                    .radioButtonsAvailable="${answers}"
					@value-change="${(e) => this._onValueChanged(e)}">
				</horizon-radio-button>
		`;
		}
	}

	_renderFooter() {
		return html`
			<capitec-group class="footer-wrapper" layout="horizontal">
				<capitec-button id="id-cancel-button" type="clear" label="Cancel" @click="${() => this._onCancel()}">
				</capitec-button>
			
				<capitec-spacer></capitec-spacer>
			
				<capitec-button id="id-skip-button" type="clear" label="Skip Verification" @click="${() => this._onSkip()}">
				</capitec-button>
			
				<capitec-button id="id-continue-button" type="primary" label="Continue"
					?hidden="${!(this.questionNumber !== this.questions.length - 1)}" @click="${() => this._onContinueClick()}">
				</capitec-button>
			
				<capitec-button id="id-verify-button" type="primary" label="Verify"
					?hidden="${!(this.questionNumber === this.questions.length - 1)}" @click="${() => this._verifyAnswers()}">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderFailureModal() {
		return html`
			<horizon-security-questions-failed
                .incomingCallDetails="${this.incomingCallDetails}"
				@security-questions="${() => this._retrySecurityQuestions()}" 
                @skip="${() => this._onSkip()}">
			</horizon-security-questions-failed>`;
	}

	_renderEndCallModal() {
		return html`
			<horizon-end-call-session
                @on-cancel="${() => {
				this.renderMode = RENDER_MODE.CONFIRM_CALLER;
            }}"
                @on-reason-set="${(reason) => this._onCallCancelled(reason)}" .incomingCallDetails="${this.incomingCallDetails}">
			</horizon-end-call-session>`;
	}

}


window.customElements.define(`horizon-security-question`, VerifyBySecurityQuestions);