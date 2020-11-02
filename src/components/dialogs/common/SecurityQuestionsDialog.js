import { Component, css, html } from 'platform/elements';
import { CALLERINFOBAR_CSS } from '../../../css/CallerInfoBar';


import '../../common/HorizonLabel';
import '../../common/HorizonSelect';
import '../../common/HorizonRadioButtonsContainer';
import '../../common/HorizonCallerDialog';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = {
	SECURITY_QUESTIONS: 0,
	END_CALL: 1
}
const BUTTON_CONTINUE = `Continue`;
const BUTTON_VERIFY = `Verify`;
const HEADER_LABEL = `Security Questions`;

export class SecurityQuestions extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.incomingCallDetails = {};
		this.renderMode = 0;
		this.question = 0;
		this.questionNumber = "0";
		this.buttonType = BUTTON_CONTINUE
		this.optionsAvailable = [];
		this.response = {
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
							"answerId": 15455469,
							"answer": "No",
							"isEnteredAnswerYN": false
						},
						{
							"answerId": 15455468,
							"answer": "Yes",
							"isEnteredAnswerYN": false
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
							"isEnteredAnswerYN": false
						},
						{
							"answerId": 15455475,
							"answer": "Yes",
							"isEnteredAnswerYN": false
						}
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
							"isEnteredAnswerYN": false
						},
						{
							"answerId": 15455467,
							"answer": "No",
							"isEnteredAnswerYN": false
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
							"isEnteredAnswerYN": false
						},
						{
							"answerId": 15455479,
							"answer": "Virgin Mortgage",
							"isEnteredAnswerYN": false
						},
						{
							"answerId": 15455477,
							"answer": "Alexander Forbes Home Plan",
							"isEnteredAnswerYN": false
						},
						{
							"answerId": 15455481,
							"answer": "None of these",
							"isEnteredAnswerYN": false
						},
						{
							"answerId": 15455478,
							"answer": "Standard Bank Homeloans",
							"isEnteredAnswerYN": false
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
							"isEnteredAnswerYN": false
						},
						{
							"answerId": 15455470,
							"answer": "0100100360",
							"isEnteredAnswerYN": false
						},
						{
							"answerId": 15455472,
							"answer": "0100106117",
							"isEnteredAnswerYN": false
						},
						{
							"answerId": 15455474,
							"answer": "None of these",
							"isEnteredAnswerYN": false
						},
						{
							"answerId": 15455473,
							"answer": "0100107379",
							"isEnteredAnswerYN": false
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
					"voidReasonId": 1,
					"voidReason": "Customer dropped call",
					"isEnteredReasonYN": false
				},
				{
					"voidReasonId": 2,
					"voidReason": "Suspected fraud",
					"isEnteredReasonYN": false
				},
				{
					"voidReasonId": 3,
					"voidReason": "Power failure",
					"isEnteredReasonYN": false
				},
				{
					"voidReasonId": 4,
					"voidReason": "Call lost",
					"isEnteredReasonYN": false
				},
				{
					"voidReasonId": 5,
					"voidReason": "Customer will call back",
					"isEnteredReasonYN": false
				},
				{
					"voidReasonId": 6,
					"voidReason": "Other",
					"isEnteredReasonYN": false
				}
			],
			"personalQuestions": [],
			"fraudReasons": [
				{
					"fraudReasonID": 1,
					"fraudReason": "Possible Identity Theft",
					"isEnteredReasonYN": false
				},
				{
					"fraudReasonID": 2,
					"fraudReason": "Suspicious Activity",
					"isEnteredReasonYN": false
				},
				{
					"fraudReasonID": 3,
					"fraudReason": "Other",
					"isEnteredReasonYN": false
				}
			]
		}
		//this.endCallReasons = [];
		//this.isBusy = false;
		//this.isReassigned = false;

		//this.channelService = HorizonChannelService.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			renderMode: { type: Number },
			question: { type: String },
			optionsAvailable: { type: Array },
			buttonType: { type: String }
			//endCallReasons: { type: Array },
			//isReassigned: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.ivrOptions = this.incomingCallDetails.ivrOption.possibleValues;
		this.incomingCallDetails.ivrOption.value = `Insure`;
		this._loadQuestions()
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	_loadQuestions() {
		if (this.questionNumber < this.response.questions.length) {
			this.question = this.response.questions[this.questionNumber].question;

			//modifying the response in order to use them to display radio buttons
			let result = this.response.questions[this.questionNumber].answers.map(item => item.answer);
			this.optionsAvailable = Object.keys(result).map(key => ({ "key": key, "value": result[key] }))

			this.questionNumber++;
		}
		else {
			this.buttonType = BUTTON_VERIFY
		}
	}

	_onCancel() {
		this.dispatchEvent(new CustomEvent(`on-cancel`, {
			detail: {}
		}));
	}

	_onSkip() {
		this.dispatchEvent(new CustomEvent(`on-skip`, {
			detail: {}
		}));
	}

	_onEndCall() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_onValueChanged(e) {
		if (e.detail.new) {
			this.response.questions[this.questionNumber - 1].answers[e.detail.key].isEnteredAnswerYN = true;
			//	this.endCallReason = this.endCallReasons.find(reason => reason.key == e.detail.key);
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

			div[slot="header"] {
				width: 696px;
				position: absolute;
				display: flex;
				align-items: center;
				left: -670px;
				top: -15px;
			}

			div[slot="header"] > span {
				height: 24px;
				width: auto;
				color: #FFFFFF;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				padding-left: 17px;
				margin-right: 545px;
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
				height: 256px;
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
				width: 690px;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				text-align: center;
				margin: 2px 0px 0px 0px;
			  }

			#id-cancel-button {
				justify-content: flex-start;
				height: 48px;
				width: 80px;
				border-radius: 4px;
				--theme-button-font-weight: 600;
				--theme-button-line-height: 20px;
				--theme-button-clear-border-width: 0px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 16px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 16px;
			}

			#id-skip-button {
				height: 48px;
				width: 149px;
				margin-right: 9px;
				--theme-button-font-weight: 600;
				--theme-button-line-height: 20px;
				--theme-button-clear-border-width: 0px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 16px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 16px;
			}

			#id-continue-button {
				height: 48px;
				width: 112px;
				--theme-button-font-weight: 600;
				--theme-button-line-height: 20px;
				--theme-button-primary-border-width: 0px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 12px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 12px;
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
								${this._renderSecurityQuestions()}
							</capitec-content-box>
						</div>
						<div slot="footer">
							${this._renderFooter()}
						</div>
					</horizon-caller-dialog>
				`;
			case RENDER_MODE.END_CALL:
				return html`${this._renderEndCallModal()}`;
		}
	}

	_renderSecurityQuestions() {
		return html`
			<capitec-label class="question-number-label" label="Question ${this.questionNumber}"></capitec-label>
			<capitec-label class="question-label" label="${this.question}"></capitec-label>
			<horizon-radio-button class="radio-button" .radioButtonsAvailable="${this.optionsAvailable}" @value-change="${(e) => {
							this._onValueChanged(e);
						}}">
			</horizon-radio-button>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button id="id-cancel-button" type="clear" label="Cancel" @click="${() => this._onCancel()}">
				</capitec-button>
			
				<capitec-spacer></capitec-spacer>
			
				<capitec-button id="id-skip-button" type="clear" label="Skip Verification" @click="${() => this._onSkip()}">
				</capitec-button>
			
				<capitec-button id="id-continue-button" type="primary" label="${this.buttonType}"
					@click="${() => this._loadQuestions()}">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderEndCallModal() {
		return html`
			<horizon-end-call-session @on-cancel="${() => { this.renderMode = RENDER_MODE.CONFIRM_CALLER }}"
				@on-reason-set="${(reason) => this._onCallCancelled(reason)}" .incomingCallDetails="${this.incomingCallDetails}">
			</horizon-end-call-session>`;
	}

}


window.customElements.define(`horizon-security-question`, SecurityQuestions);