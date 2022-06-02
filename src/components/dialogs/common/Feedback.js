import { Component, css, html } from 'platform/elements';
import { FEEDBACK_OPTIONS } from 'app/constants/SearchOtherNeed';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

const ERROR_LIST = {
	VALIDATION_ERROR: `Please choose an option:`
};

/**
 * Feedback for other needs component
 *
 * Events Raised
 * -------------
 * done
 * 
 * @export
 * @class Feedback
 * @extends {Component}
 */

export class Feedback extends Component {
	
	// ----------
	// INITIALIZATION
	// ----------

	constructor() {
		super();

		// VARIABLES
		this.alertBannerMessage = ``;
		this.selectedFeedback = -1;
		this.feedbackOptions = [];

		this.isBusy = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { attribute: false },
			alertBannerMessage: { attribute: false },
			selectedFeedback: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.feedbackOptions = FEEDBACK_OPTIONS;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		if (this.selectedFeedback === -1) {
			this.alertBannerMessage = ERROR_LIST.VALIDATION_ERROR;
		} else {
			this.dispatchEvent(new CustomEvent(`done`, { detail: this.selectedFeedback }));
		}
	}

	_onValueChanged(event) {
		this.selectedFeedback = event.detail.key; 
		this.alertBannerMessage = ``;
	}

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
					width: 531px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 15px 16px 16px 0px;
				}
				div[slot="body"] {
					width: 531px;
				}
				capitec-content-box {
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 20px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}
				capitec-label[type="subtitle"] {
					--theme-layout-gap-spacing: 8px;
					--theme-label-subtitle-font-weight: 600;
					--theme-label-subtitle-font-size: 18px;
				}
				horizon-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-layout-gap-spacing: 16px;
				}
				.label-err-message{
					color:#C83B37;
					font-family: "Hind Vadodara";
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
				}
				horizon-radio-button-group {
					--horizon-radio-button-group-margin-bottom: 55px;
				}
			`
		];
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Give Feedback">
				<div slot="body">
					<capitec-content-box
						layout="vertical"
						halign="stretch"
						valign="top"
						gap="clear">
							${this._renderAlertBanner()}
							${this._renderRadioButtons()}
					</capitec-content-box>
				</div>
				<div slot="footer" class="footer-class">
					${this._renderFooter()}
				</div>
			</capitec-modal>
			
			${this._renderLoadingIndicator()}
		`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator data-automation-id="feedback-loading-indicator"></capitec-loading-indicator>`;
	}

	_renderAlertBanner() {
		if (isNullorEmpty(this.alertBannerMessage)) {
			return html``;
		}
		
		return html`
			<horizon-alert-banner type="unsuccessful-red" class="alert-banner">
				<capitec-group layout="horizontal">
					<capitec-label label="${this.alertBannerMessage}" class="label-err-message"></capitec-label>
				</capitec-group>
			</horizon-alert-banner>`;
	}

	_renderRadioButtons() {
		return html`
			<capitec-label
				label="What was the outcome on STrack?"
				type="subtitle">
			</capitec-label>

			<horizon-radio-button-group
				.radioButtonsAvailable="${this.feedbackOptions}"
				@value-change="${(event) => this._onValueChanged(event)}">
			</horizon-radio-button-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-button
				type="primary"
				label="Done"
				@click="${(e) => this._doneClick(e)}">
			</capitec-button>
		`;
	}
}
customElements.define(`horizon-feedback`, Feedback);