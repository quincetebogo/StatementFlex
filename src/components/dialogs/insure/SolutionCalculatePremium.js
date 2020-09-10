import { Component, html, css } from 'platform/elements';
import '../insure/AssignReasonSelected';

const RENDER_MODE = {
	CALCULATE_PREMIUM: 0,
	ASSIGN_SYSTEM_ERROR: 1
};
const FEEDBACK_OPTIONS = {
	COMPLETED: 0,
	SYSTEM_ERR: 1
};
const ASSIGN_REASON = `0`;
const ALTER_BANNER_MESSAGE = `Choose a feedback reason to continue.`;

export class CalculatePremium extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.CALCULATE_PREMIUM;
		this.alertBannerMessage = ``;
		this.selectedFeedback = -1;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			renderMode: { type: Number },
			alertBannerMessage: { type: String },
			selectedFeedback: { type: Number }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`on-cancel`, {
			detail: {}
		}));
	}

	_onCancelAssign() {
		this.renderMode = RENDER_MODE.CALCULATE_PREMIUM;
	}

	_onAssign() {
		//TODO: Functionality after assigning to be implemented here.
	}

	_onDoneClick() {

		//If feeback not selected - Show alert banner
		if (this.selectedFeedback === -1) {
			this.alertBannerMessage = ALTER_BANNER_MESSAGE;
		}
		//If System error feedback is selected - assign diaog will be shown
		else if (this.selectedFeedback === FEEDBACK_OPTIONS.SYSTEM_ERR) {
			this.renderMode = RENDER_MODE.ASSIGN_SYSTEM_ERROR;
		}
	}

	_onValueChanged(e) {

		if (e.detail.new && e.currentTarget.id === `completedCalculation`) {
			this.selectedFeedback = FEEDBACK_OPTIONS.COMPLETED;
		}
		else if (e.detail.new && e.currentTarget.id === `systemError`) {
			this.selectedFeedback = FEEDBACK_OPTIONS.SYSTEM_ERR;
		}
		this.alertBannerMessage = ``;
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
				capitec-modal {
					height: 616px;
					width: 690px;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-right: 16px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-footer-padding: 0px 16px 16px 0px;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #3E4547;
				}

				div[slot="body"] {
					width: 690px;
					height: 488px;
				}

				.body-box {
					height: 427px;
					margin: 0px 0px 0px 0px;
					--theme-container-padding-top : 13px;
					--theme-container-padding-bottom: 0px;
				}

				.navigate-info-label {
					height: 26px;
					width: 533px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
					margin: 0px 0px 14px 0px;
				}

				.navigate-bullet-label {
					height: 24px;
					width: 534px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					margin: 0px;
				}

				.feedback-label {
					height: 24px;
					width: 546px;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
					margin: 17px 0px 19px 0px;
				}

				#id-cancel-button {
					height: 48px;
					width: 94px;
					margin-right: 19px;
					--theme-button-padding-top: 13px;
					--theme-button-padding-right: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 12px;
				}

				#id-done-button {
					height: 48px;
					width: 86px;
					--theme-button-padding-top: 13px;
					--theme-button-padding-right: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 12px;
				}
		
				.radio-button-container {
					margin: 8px 0px 0px 0px;
					height: 48px;
					padding: 0px;
					box-sizing: border-box;
					border-style: solid;
					border-width: thin;
					border-radius: 5px;
					border-color: lightgrey;
				}

				.navigate-container {
					height: 151px;
					margin: 0px;
					border-style: solid;
					border-width: thin;
					border-radius: 5px;
					border-color: lightgrey;
				}
		
				.radio-button-label {
					height:24px;
					margin:11px 0px 10px 16px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 20px;
				}

				.group-navigate {
					margin-left: 16px;
					margin-top: 24px;
					padding: 0px;
					width: 640px;
					height: 125px;
				}

				capitec-alert-banner {
					margin: 0px 0px 15px 0px;
					--theme-alert-banner-info-border: 0px;
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-font-weight: 500;
					color: var(--theme-alert-banner-unsuccessful-red-font-color, #C83C37);
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
				}
		`];

	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			${this._renderCalculatePremium()}
			${this._renderAssignModal()}
		`;
	}

	_renderCalculatePremium() {
		if (this.renderMode == RENDER_MODE.CALCULATE_PREMIUM) {
			return html`
				<capitec-modal type="free" header-align="left" header="Solution - Calculate Premium">
					<div slot="body">
						<capitec-content-box class="body-box">
							${this._renderAlertBanner()}
							${this._renderNavigationToSBL()}
							${this._renderFeedbackDetails()}
						</capitec-content-box>
					</div>
					<div slot="footer">
						${this._renderFooter()}
					</div>
				</capitec-modal>`;
		}
	}

	_renderAssignModal() {
		if (this.renderMode == RENDER_MODE.ASSIGN_SYSTEM_ERROR) {
			return html`
				<horizon-assign-reason-selected
					.selectedReason=${ASSIGN_REASON}
					@on-cancel=${() => this._onCancelAssign()}
					@team-selected=${() => this._onAssign()}>
				</horizon-assign-reason-selected>
			`;
		}
	}

	_renderAlertBanner() {
		if (!this.alertBannerMessage == '') {
			return html`
				<capitec-alert-banner
									label="${this.alertBannerMessage}"
									type="error">
				</capitec-alert-banner>`;
		}
	}

	_renderNavigationToSBL() {
		return html`
			<capitec-group class="navigate-container" layout="vertical" gap="clear" halign="stretch" valign="top">
				<capitec-content-box class="group-navigate">
					<p class="navigate-info-label">Navigate to <b>SBL T62053</b> (Landing Page)</p>
					<li class="navigate-bullet-label"> Choose Insure tab </li>
					<li class="navigate-bullet-label"> Click on Estimate to calculate Premium </li>
				</capitec-content-box>
			</capitec-group>
		`;
	}

	_renderFeedbackDetails() {
		return html`
			<capitec-label class="feedback-label" label="Feedback:"></capitec-label>

			<capitec-radio-group>
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								id="completedCalculation"
								class="radio-button-label"
								label="Completed Calculation"
								@value-change="${(e) => this._onValueChanged(e)}"
								.checked = ${this.selectedFeedback === FEEDBACK_OPTIONS.COMPLETED}>
					</capitec-radio>
				</capitec-group>
 
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								id="systemError"
								class="radio-button-label"
								label="System error - assign now"
								@value-change="${(e) => this._onValueChanged(e)}"
								.checked = ${this.selectedFeedback === FEEDBACK_OPTIONS.SYSTEM_ERR}>
					</capitec-radio>
				</capitec-group>
			</capitec-radio-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-cancel-button"
					type="clear"
					label="Cancel"
					?hidden=""
					.disabled=""
					tabindex=""
					@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button
					id="id-done-button"
					type="primary"
					label="Done"
					?hidden=""
					.disabled=""
					tabindex=""
					@click="${() => this._onDoneClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}
}

window.customElements.define(`horizon-calculate-premium`, CalculatePremium)