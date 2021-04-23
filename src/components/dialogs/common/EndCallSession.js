import { Component, css, html } from 'platform/elements';
import { Configuration, Logger, NavigationContext } from 'platform/core';
import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { CALLERINFOBAR_CSS } from 'app/css/CallerInfoBar';
import { EndCallCauseCode } from 'app/utils/endCallCauseCode';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'platform/components/popups/Modal';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonSelect';
import 'app/components/common/RadioButtonGroup';
import 'app/components/common/CallerDialog';

const HEADER_LABEL = `End Call Session`;
const ERROR_MESSAGE = `Choose an option to end call`;

/**
 * The end call dialog allows the client care agent to select a reason/cause code when ending the call.
 * The dialog then navigates back to the initial landing page in order to wait for the next call
 * 
 * Events Raised 
 * -------------
 * cancel
 *
 * @export
 * @class EndCallSession
 * @extends {Component}
 */
export class EndCallSession extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.incomingCallDetails = {};
		this.endCallReasons = [];
		this.isBusy = false;
		this.isReassigned = false;
		this.alertBannerMessage = ``;
		this.incidentRefNumber = ``;
		this.incidentRecId = ``;

		this._configuration = Configuration.getInstance();
		this._navigationContext = NavigationContext.getInstance();
		this.endCallCauseCode = EndCallCauseCode.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.logger = Logger.getInstance();

		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._endCallErrorHandler(ex));
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {Object} incomingCallDetails Incoming call information
	 * @property {Object} incidentDetails Incident details
	 * @property {String} endCallContext Determines the options presented. Value is ConfirmClient, VerifyClient or LandingPage
	 * @property {Boolean} isReassigned Flag to indicate of the incident has been assigned or not (Unused by v1.0 of the channel service)
	 * @readonly
	 * @static
	 * @memberof EndCallSession
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			incidentDetails: { type: Object },
			endCallContext: { type: String }, 
			isReassigned: { type: Boolean },

			isBusy: { attribute: false },
			endCallReasons: { attribute: false },
			alertBannerMessage: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	async connectedCallback() {
		super.connectedCallback();

		// Telemetry
		HorizonTelemetry.instance.screenLoadEndCall({
			screen: TelemetryScreen.END_CALL
		});

		// TODO: Evaluate why isRessagined is added to incomingCallDetails
		this.incomingCallDetails.isReassigned = isNullorEmpty(this.isReassigned) ? false : this.isReassigned; 

		const incidentDetails = this.horizonStore.getIncidentDetails();

		// Subsequent incident might be created, so retrieving refNo & recID always from state
		this.incidentRefNumber = incidentDetails.incidentReferenceNumber || this.incidentDetails.incidentReferenceNumber;
		this.incidentRecId = incidentDetails.incidentRecId || this.incidentDetails.incidentRecId;

		await this._loadEndCallOptions();
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		// Telemetry
		HorizonTelemetry.instance.screenUnloadEndCall({
			screen: TelemetryScreen.END_CALL
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancelClick() {
		// Telemetry
		HorizonTelemetry.instance.endCallCancel({
			screen: TelemetryScreen.END_CALL,
			nextScreen: null
		});

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_endCallClick() {

		// Telemetry 
		HorizonTelemetry.instance.endCall({
			screen: TelemetryScreen.END_CALL,
			reason: this.endCallReason.value,
			nextScreen: TelemetryScreen.WAIT_FOR_CALL
		});

		const isValid = this._validateCloseIncidentReason();

		if (isValid) {
			if (this._preventCloseOfIncident()) {
				// Updating state as call ended and redirecting it to call waiting page
				this._returnToCallWaitingPage();
				return;
			}
			this._classifyAndClose();
		}
	}

	_valueChanged(e) {
		if (e.detail.new) {
			this.alertBannerMessage = ``;
			this.endCallReason = this.endCallReasons.find(reason => reason.key === e.detail.key);
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _loadEndCallOptions() {
		const endCallDetails = {
			isReassigned: this.isReassigned,
			CloseIncidentContext: this.endCallContext
		};
		const returnValue = await this.incidentManagementService.closeIncidentOptions(endCallDetails);

		if (returnValue.succeeded) {
			this.endCallReasons = returnValue.result.closeIncidentReasons;
		} else {
			this.logger.log(`error`, `An error occured while trying to close the incident ${this.incidentRefNumber} with recording ID ${this.incomingCallDetails.voiceReferenceNumber}`, `_loadCallOptions`, returnValue.correlationId);

			// We can't give the user a list of reasons to select so just return to the call waiting page having logged the error
			this._returnToCallWaitingPage();
		}
	}

	_returnToCallWaitingPage() {
		// Telemetry
		HorizonTelemetry.instance.workflowCompleted();

		const state = { callStatus: `CALL-ENDED` };
		this.horizonStore.setState(state);
		this.horizonRouter.navigateToWaitingForCall();
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_endCallErrorHandler(exception) {
		// We must be able to end a call and return to the call waiting landing page
		// Errors on this screen will be logged by the caller and a return the the call waiting landing page will be effected

		return true;
	}

	/**
	 * Specical case: When a client need is stop card and client identity is not confirmed
	 * Assume call is dropped then incident should not be closed.
	 * 
	 * @returns {Boolean} True / False
	 */
	_preventCloseOfIncident() {
		if (this.isReassigned) {
			this.logger.log(`info`, `Incident assigned or handed off. The call will be ended without closing the incident.`);
			// Don't close the incident if it has been reassigned or handed off
			return true; 
		}

		// Don't close the incident the incident if
		//    - StopCard was the need and
		//    - the call was probably dropped before attempting to stop cards
		// OR
		//   - StopCard was the need and
		//   - an attempt to stop cards was made
		//   - and Need Incomplete was selected as the end call reason
		if (this.incomingCallDetails.ivrOptionCode === `StopCard` && this._landingCallPageActive()) {
			this.logger.log(`info`, `A Stop Card Call may have been dropped before attempting to stop a card. The incident will be left open.`);
			return true;
		}

		return false;
	}

	_landingCallPageActive() {
		if (this._navigationContext.current !== undefined) {
			return this._navigationContext.current.route.name === `horizon-landing-page`; /* && !this.onCall */
		}
		return false;
	}

	_validateCloseIncidentReason() {
		const incidentDetails = this.horizonStore.getIncidentDetails();

		if (isNullorEmpty(this.endCallReason)) {
			this.alertBannerMessage = ERROR_MESSAGE;
			return false;
		}
		else if (this.endCallReason.key === 0 && incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.alertBannerMessage = `INCORRECT OPTION: NEED WAS NOT FULFILLED`;
			this.logger.log(`info`, `client need not fulfilled, blocking selection of need fulfilled`);
			return false;
		}
		return true;
	}

	async _getNeedActions() {
		const ivrActionMapping = await this._configuration.getSetting(`ivrActionMapping`);
		return ivrActionMapping;
	}

	async _classifyAndClose() {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		const ivrActionMapping = await this._getNeedActions();
		const needAction = ivrActionMapping[incidentDetails.currentNeed];

		if (needAction) {
			const request = {
				incidentRecId: this.incidentRecId,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode,
				needAction: needAction,
				incidentCategorization: null
			};
			const returnValue = await this.incidentManagementService.classifyIncident(request);

			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Failed to close incident. Agent may have to manually close incident.`, `_closePrimaryIncident`, returnValue.correlationId);
			}
		}
		await this._closeIncident();
	}

	async _closeIncident() {
		let causeCode = ``;
		const incidentDetails = this.horizonStore.getIncidentDetails();

		// Special case, when subsequent need is created on opening a need, if its not required anymore
		// then it should be tagged as 'TransactionCancelled'.
		if (incidentDetails.needStatus === super.HORIZON_NEED_STATUS.NOT_STARTED) {
			causeCode = `TransactionCancelled`;
		}

		const callToEnd = {
			incidentRecId: this.incidentRecId,
			reason: this.endCallReason.key,
			resolution: this.endCallReason.value,
			causeCode: causeCode || this.endCallCauseCode.getCauseCode(this.endCallContext, this.incomingCallDetails.ivrOptionCode, this.endCallReason.value)
		};

		const returnValue = await this.incidentManagementService.closeIncident(callToEnd);

		// Log any error
		if (!returnValue.succeeded) {
			this.logger.log(`error`, `An error occured while trying to close the incident ${this.incidentRefNumber} with recording ID ${this.incomingCallDetails.voiceReferenceNumber}`, `_onReasonSelected`, returnValue.correlationId);
		}

		// Return the the call waiting landing page even if an error occured
		this._returnToCallWaitingPage();
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			${CALLERINFOBAR_CSS}

			capitec-modal {
				height: 550px;
				--theme-modal-header-padding-top: 32px;
				--theme-modal-header-padding-bottom: 32px;
				--theme-modal-header-padding-right: 31px;
				--theme-modal-header-padding-left: 31px;
				--theme-modal-footer-padding: 6px 18px 10px 0px;
			}

			div[slot="header"] {
				width: 690px;
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
				height: 322px;
				border-radius: 5px;
			}

			.body-box {
				height: 322px;
				--theme-container-padding-bottom: 0px;
			}

			.end-reason-label {
				height: 24px;
				width: 117px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				margin: 0px 0px 8px 0px;
			  }

			#id-cancel-button {
				height: 48px;
				width: 95px;
				margin-right: 17px;
				margin-bottom: 8px;
				--theme-button-line-height: 20px;
				--theme-button-clear-border-width: 0px;
				--theme-button-padding-top: 13px;
				--theme-button-padding-right: 12px;
				--theme-button-padding-bottom: 12px;
				--theme-button-padding-left: 12px;
			}

			#id-continue-button {
				height: 48px;
				width: 112px;
				margin-bottom: 8px;
				--theme-button-line-height: 20px;
				--theme-button-primary-border-width: 0px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 12px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 12px;
			}

			.radio-button {
				margin-top: 0px;
				padding-bottom: 8px;
			}
			
			capitec-alert-banner {
				--theme-alert-banner-icon-margin-left: 15px;
				--theme-alert-banner-icon-margin-right: 7px;
				--theme-icon-size-default: 26px;
				--theme-alert-banner-height: 48px;
			}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon-caller-dialog
						.incomingCallDetails="${this.incomingCallDetails}"
						.incidentDetails="${this.incidentDetails}"
						.isNeedSelectable=${false}
						.headerLabel="${HEADER_LABEL}" 
						.displayButton="${false}">
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderAlertBanner()}
						${this._renderChooseEndCallReason()}
						${this._renderLoadingIndicator()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</horizon-caller-dialog>
		`;
	}

	_renderChooseEndCallReason() {
		return html`
			<capitec-label class="end-reason-label" label="Choose reason"></capitec-label>
			<horizon-radio-button-group
                class="radio-button"
                .radioButtonsAvailable="${this.endCallReasons}"
                @value-change="${(e) => {
				this._valueChanged(e);
			}}">
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
                    @click="${() => this._cancelClick()}">
				</capitec-button>
			
				<capitec-button
                    id="id-continue-button"
                    type="primary"
                    label="End Call"
                    @click="${() => this._endCallClick()}">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderAlertBanner() {
			if (this.alertBannerMessage) {
				return html`
					<capitec-alert-banner type="unsuccessful-red">
						<b>Notify: </b>${this.alertBannerMessage}
				</capitec-alert-banner>`;
			}
		}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

window.customElements.define(`horizon-end-call-session`, EndCallSession);