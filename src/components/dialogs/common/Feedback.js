import { Component, css, html } from 'platform/elements';
import { EndCallCauseCode } from 'app/utils/endCallCauseCode';
import { HorizonStore } from 'app/store/HorizonStore';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

const FEEDBACK_OPTIONS = [
	{
		key: 0,
		value: `Need fulfilled`
	},
	{
		key: 2,
		value: `Need was assigned/handed off`
	},
	{
		key: 1,
		value: `Need incomplete`
	}
];

const ERROR_LIST = {
	VALIDATION_ERROR: `Please choose an option:`,
	SYSTEM_ERROR: `System error. Please try again`
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

		this.horizonStore = HorizonStore.getInstance();
		this.endCallCauseCode = EndCallCauseCode.getInstance();
		this.incidentService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		
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

	async _doneClick() {
		if (this.selectedFeedback === -1) {
			this.alertBannerMessage = ERROR_LIST.VALIDATION_ERROR;
		} else {
			console.log(this.selectedFeedback);
			const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
			const incidentDetails = this.horizonStore.getIncidentDetails();
			const ivrOptionCode = incomingCallDetails.ivrOptionCode;
			const selectedOption = FEEDBACK_OPTIONS.find(item => item.key === this.selectedFeedback);
			const strackIncidentInfo = await this._incidentStatus(incidentDetails.incidentRecId) || {};
			const resolution = this._getResolution(strackIncidentInfo.resolution, selectedOption);

			const closeIncidentRequest = {
				incidentRecId: incidentDetails.incidentRecId,
				reason: this.selectedFeedback,
				resolution: resolution,
				causeCode: strackIncidentInfo.causeCode || this.endCallCauseCode.getCauseCode(`LandingPage`, ivrOptionCode, selectedOption.value)
			};

			const returnValue = await this.incidentService.closeIncident(closeIncidentRequest);
			
			if (returnValue.succeeded) {
				// Navigate to favourites landing page
				this._updateIncidentState();
				this.dispatchEvent(new CustomEvent(`done`, {}));
			} else {
				this.alertBannerMessage = ERROR_LIST.SYSTEM_ERROR;
			}
		}
	}

	_onValueChanged(event) {
		this.selectedFeedback = event.detail.key; 
		this.alertBannerMessage = ``;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_handleChannelServiceError() {
		this.alertBannerMessage = ERROR_LIST.SYSTEM_ERROR;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = super.HORIZON_NEED_STATUS.CLOSED;
		incidentDetails.feedback = this.selectedFeedback;

		this.horizonStore.setIncidentDetails(incidentDetails);
	}

	async _incidentStatus(incidentRecId) {
		const returnValue = await this.incidentService.incidentStatus(incidentRecId);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to get incident status.`, `_incidentStatus`, returnValue.correlationId);
			return null;
		}
		return returnValue.result;
	}

	_getResolution(resolution, selectedOption) {
		return resolution ? `${resolution || ``}%0D%0A${selectedOption.value}` : `${selectedOption.value}`;
	}

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
				capitec-alert-banner {
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

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	_renderAlertBanner() {
		if (isNullorEmpty(this.alertBannerMessage)) {
			return html``;
		}
		
		return html`
			<capitec-alert-banner type="unsuccessful-red" class="alert-banner">
				<capitec-group layout="horizontal">
					<capitec-label label="${this.alertBannerMessage}" class="label-err-message"></capitec-label>
				</capitec-group>
			</capitec-alert-banner>`;
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