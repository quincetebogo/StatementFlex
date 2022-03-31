import { Component, css, html } from 'platform/elements';
import 'app/components/common/RadioButtonGroup';

const ERROR_MESSAGE = `Choose a feedback reason to continue.`;

export class HorizonSolutionDialog extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.solutionDetails = null;
		this.checked = false;
		this.alertBannerMessage = ``;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			solutionDetails: { type: Object },
			checked: { type: Boolean },
			alertBannerMessage: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.solutionHeader = this.solutionDetails.solutionHeader;
		this.radioButtonsAvailable = this.solutionDetails.radioButtonsAvailable;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`on-cancel`, {
			detail: {}
		}));
	}

	_onDoneClick() {
		if (!this.checked) {
			this.alertBannerMessage = ERROR_MESSAGE;
		} else {
			this.dispatchEvent(new CustomEvent(`on-done`, {}));
		}
	}

	_onValueChanged() {
		this.checked = !this.checked;
		if (this.checked) {
			this.alertBannerMessage = ``;
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

			capitec-modal {
				height: var(--horizon-solution-modal-height, auto);
				width: var(--horizon-solution-modal-width, 694px);
				--theme-modal-header-padding-top: 20px;
				--theme-modal-header-padding-bottom: 20px;
				--theme-modal-header-padding-right: 16px;
				--theme-modal-header-padding-left: 16px;
				--theme-modal-footer-padding: 0px 16px 16px 0px;
				--theme-modal-header-background-color: #F7F7F7;
				--theme-modal-header-color: #3E4547;
			}

			div[slot="body"] {
				width: 694px;
				height: auto;
			}

			.body-box {
				height: auto;
				margin: 0px 0px 0px 0px;
				--theme-container-padding-top : 13px;
				--theme-container-padding-bottom: 0px;
			}

			.navigate-container {
				height: auto;
				width: auto;
				margin: 0px;
				border-style: solid;
				border-width: thin;
				border-radius: 5px;
				border-color: lightgrey;
			}

			.group-navigate {
				margin: 16px 0px 19px 16px;
				padding: 0px;
				width: inherit;
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
				margin-top: var(--horizon-feedback-label-margin-top, 17px);
				margin-bottom: 15px;
				margin-left: 8px;
			}

			#id-cancel-button {
				height: 48px;
				width: 94px;
				margin-right: 19px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 23px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 23px;
				--theme-button-clear-border-width: 0px;
				--theme-button-line-height: 20px;
			}

			#id-done-button {
				height: 48px;
				width: 86px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 24px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 24px;
				--theme-button-primary-border-width: 0px;
				--theme-button-line-height: 20px;
			}

			horizon-alert-banner {
				margin: 0px 0px 15px 0px;
				--theme-alert-banner-info-border: 0px;
				--theme-alert-banner-height: 48px;
				--theme-alert-banner-font-weight: 500;
				color: var(--theme-alert-banner-unsuccessful-red-font-color, #C83C37);
				background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
			}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="${this.solutionHeader}">
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
			</capitec-modal>
		`;
	}

	_renderAlertBanner() {
		if (this.alertBannerMessage) {
			return html`
				<horizon-alert-banner
						label="${this.alertBannerMessage}"
						type="error">
				</horizon-alert-banner>
			`;
		}
	}

	_renderNavigationToSBL() {
		return html`
			<capitec-group class="navigate-container" layout="vertical" gap="clear" halign="stretch" valign="top">
				<capitec-content-box class="group-navigate">
					<slot></slot>
				</capitec-content-box>
			</capitec-group>
		`;
	}

	_renderFeedbackDetails() {
		return html`
			<capitec-label class="feedback-label" label="Feedback"></capitec-label>
			<horizon-radio-button-group
				class="radio-button"
				.radioButtonsAvailable="${this.radioButtonsAvailable}"
				@value-change="${() => this._onValueChanged()}">
			</horizon-radio-button-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-cancel-button"
					type="clear"
					label="Cancel"
					@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button
					id="id-done-button"
					type="primary"
					label="Done"
					@click="${() => this._onDoneClick()}">
				</capitec-button>
			</capitec-group>
		`;
	}
}

window.customElements.define(`horizon-solution-dialog`, HorizonSolutionDialog);