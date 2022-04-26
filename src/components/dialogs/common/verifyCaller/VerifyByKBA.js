import { Component, css, html } from 'platform/elements';
import { CallHandleService } from 'app/services/CallHandleService';

import 'app/components/common/CallerDialog';
import 'app/components/common/MultiLineLabel';

const ANSWERS = {
	YES: `Yes`,
	NO: `No`
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
export class VerifyByKBA extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.isBusy = false;

		this.questions = [
			{
				"questionId": `1`,
				"question": `Confirm your full name?`,
				"answer": `Lawrence dolo wade`,
				"providedAnswer": ``,
				"enabled": true
			},
			{
				"questionId": `2`,
				"question": `Confirm your Capitec registered mobile number?`,
				"answer": `083 301 8744`,
				"providedAnswer": ``,
				"enabled": true
			},
			{
				"questionId": `3`,
				"question": `Confirm your account number?`,
				"answer": `*******909`,
				"providedAnswer": ``,
				"enabled": true
			},
			{
				"questionId": `4`,
				"question": `Confirm one of the below?`,
				"answer": [`email: lawrencedolo@gmail.com`, `residentail address: 105, Grand Olive estate`],
				"providedAnswer": ``,
				"enabled": true
			}
		];

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag());
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			incidentDetails: { type: Object },

			isBusy: { state: true }
		};
	}

	get canVerify() {
		return this.questions.every(item => Boolean(item.providedAnswer));
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_endCall() {

	}

	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_skipClick() {
		this.dispatchEvent(new CustomEvent(`skip`, {}));
	}

	async _verifyClick() {
		const returnValue = await this.callHandleService.verifyKBA({}, () => true);

		if (returnValue.succeeded) {
			this.dispatchEvent(new CustomEvent(`verified`, {}));
			return true;
		}

		this.dispatchEvent(new CustomEvent(`failed`, {}));
	}

	_answerSelected(questionId, answer) {
		const qusIndex = this.questions.findIndex(item => item.questionId === questionId);
		this.questions[qusIndex].providedAnswer = answer;

		this.requestUpdate();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
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
				bb-multi-line-label {
					padding-top: 4px;
					padding-bottom: 0px;

					--horizon-multi-line-label-align: left;
					--horizon-multi-line-label-font-size: 16px;
					--horizon-multi-line-label-font-weight: 600;
					--horizon-multi-line-label-line-height: 16px;
					--horizon-multi-line-value-font-size: 14px;
					--horizon-multi-line-value-gap: 6px;
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
		`;
	}

	_renderQuestions() {
		return this.questions.map((item, index) => html`
			<capitec-card>
				<capitec-content-box class="question-box">
					<capitec-group
						layout="horizontal"
						halign="left"
						valign="top"
						gap="clear">
							<capitec-label type="subtitle" label="Q${index + 1}"></capitec-label>

							<bb-multi-line-label
								label="${item.question}"
								.value="${item.answer}">
							</bb-multi-line-label>

							<capitec-spacer></capitec-spacer>

							<capitec-radio-group>
								<capitec-group layout="horizontal" gap="clear">
									<capitec-radio
										label="${ANSWERS.YES}"
										@value-change="${() => this._answerSelected(item.questionId, ANSWERS.YES)}"
										?checked = "${item.providedAnswer === ANSWERS.YES}">
									</capitec-radio>
									<capitec-radio
										label="${ANSWERS.NO}"
										@value-change="${() => this._answerSelected(item.questionId, ANSWERS.NO)}"
										?checked = "${item.providedAnswer === ANSWERS.NO}">
									</capitec-radio>
								</capitec-group>
							</capitec-radio-group>
					</capitec-group>
				</capitec-content-box>
			</capitec-card>
		`);
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
					?disabled="${!this.canVerify}"
					@click="${() => this._verifyClick()}">
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
}

window.customElements.define(`horizon-verify-kba`, VerifyByKBA);