import { Component, css, html } from 'platform/elements';
import { CALLERINFOBAR_CSS } from 'app/css/CallerInfoBar';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HttpStatusError } from 'platform/errors/HttpStatusError';
import { InsureService } from 'app/services/InsureService';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

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

const ERROR_MESSAGE = `Please choose an option`;

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
		this.alertBannerMessage = ``;


		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), null);
		this.quickTransactionsService = new QuickTransactionsService(() => this._toggleBusyFlag(), null);
		this.insureService = new InsureService(() => this._toggleBusyFlag());

	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 * 
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
			incomingCallDetails: { type: Object },
			callerInformation: { type: Object },
			securityQuestions: { type: Object },
			renderMode: { type: Number },
			questionNumber: { type: Number },
			retryCount: { type: Number },
			isBusy: { type: Boolean },
			alertBannerMessage: { type: String }
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
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_onSkip() {
		this._navigateToLandingPage(`unverified`);
	}

	_onContinueClick() {
		if (!this.checked) {
			this.alertBannerMessage = ERROR_MESSAGE;
		} else {
			this.alertBannerMessage = ``;
			this.questionNumber++;
			this.checked = false;
		}

	}

	async _verifyAnswers() {
		if (!this.checked) {
			this.alertBannerMessage = ERROR_MESSAGE;
		} else {
			this.alertBannerMessage = ``;
			this.checked = false;

			const returnValue = await this.callHandleService.verifySecurityQuestions(this.securityQuestions, (ex) => this._xdsErrorHandler(ex));

			if (returnValue.succeeded && returnValue.result === `Authenticated`) {
				this._navigateToLandingPage(`verified`);
			} else if (returnValue.succeeded && returnValue.result !== `Authenticated` && this.retryCount < 1) {
				this.renderMode = RENDER_MODE.FIRST_FAILURE;
				this.retryCount++;
			} else if (returnValue.succeeded) {
				this.callerInformation.verificationStatus = `failed`;

				const state = {
					callerInformation: this.callerInformation,
					incomingCallDetails: this.incomingCallDetails
				};

				this.horizonStore.saveState(state);

				this.horizonRouter.navigateToXdsVerificationFailed();
			} else {
				// TODO: navigate to system error screen this.horizonRouter.navigateTo or to XdsVerificationFailed..
			}
		}
	}

	_onEndCall() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_onValueChanged(e) {
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

	_navigateToLandingPage(verificationStatus) {
		this.callerInformation.verificationStatus = verificationStatus;

		const state = {
			callerInformation: this.callerInformation,
			incomingCallDetails: this.incomingCallDetails
		};

		this.horizonStore.saveState(state);
		switch (this.incomingCallDetails.ivrOptionCode) {
			case `StopCard`:
				// Verified Stop Card display must still be developed
				break;
			case `Insure`:
				if (this.callerInformation.hasInsuranceProducts) {
					this.horizonRouter.navigateToInsureExistingClient();
				} else {
					this.horizonRouter.navigateToInsureProspectiveClient();
				}
				break;
			case `Transact`:
			default:
				this.horizonRouter.navigateToQuickTransactionFavourites();
		}
	}

	_xdsErrorHandler(exception) {
		if (exception instanceof TypeError) {
			this.alertBannerMessage = `SYSTEM ERROR`;
		} else if (exception instanceof HttpStatusError) {
			console.log(exception);
			this.alertBannerMessage = `SYSTEM ERROR`;
		} else {
			console.log(exception);
			this.alertBannerMessage = `SYSTEM ERROR`;
		}

		return true;
	}

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
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.SECURITY_QUESTIONS:
				return html`
					<horizon-caller-dialog class="main-container" .incomingCallDetails="${this.incomingCallDetails}"
						.headerLabel="${HEADER_LABEL}" @on-end-call="${() => this._onEndCall()}">
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
			case RENDER_MODE.FIRST_FAILURE:
				return html`${this._renderFailureModal()}`;
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
				<capitec-label class="question-label" label="${item.question}"></capitec-label>
				<horizon-radio-button class="radio-button" .radioButtonsAvailable="${answers}"
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
			<horizon-security-questions-failed .incomingCallDetails="${this.incomingCallDetails}"
				@security-questions="${() => this._retrySecurityQuestions()}" @skip="${() => this._onSkip()}">
			</horizon-security-questions-failed>`;
	}

	_renderEndCallModal() {
		return html`
			<horizon-end-call-session .incomingCallDetails="${this.incomingCallDetails}"
				@on-cancel="${() => this.renderMode = RENDER_MODE.CONFIRM_CALLER}"
				@on-reason-set="${(reason) => this._onCallCancelled(reason)}">
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