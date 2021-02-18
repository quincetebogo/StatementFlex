import { Component, css, html } from 'platform/elements';
import { CALLERINFOBAR_CSS } from 'app/css/CallerInfoBar';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { Logger } from 'platform/core';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'platform/components/popups/Modal';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonSelect';
import 'app/components/common/RadioButtonGroup';
import 'app/components/common/CallerDialog';

const HEADER_LABEL = `End Call Session`;

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

		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.logger = Logger.getInstance();

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._endCallErrorHandler(ex));
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {Object} incomingCallDetails Incoming call information
	 * @property {String} endCallContext Determines the options presented. Value is ConfirmClient, VerifyClient or LandingPage
	 * @readonly
	 * @static
	 * @memberof EndCallSession
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			endCallContext: { type: String },
			isReassigned: { type: Boolean },

			endCallReasons: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	connectedCallback() {
		super.connectedCallback();

		this.ivrOptions = this.incomingCallDetails.ivrOption.possibleValues;
		this.incomingCallDetails.isReassigned = isNullorEmpty(this.isReassigned) ? false : this.isReassigned;

		const endCallDetails = {
			isReassigned: this.incomingCallDetails.isReassigned,
			incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
			voiceReferenceNumber: this.incomingCallDetails.voiceReferenceNumber,
			ivrOptionCode: this.incomingCallDetails.ivrOptionCode,
			incidentReferenceNumber: this.incomingCallDetails.incidentReferenceNumber,
			agentTelephoneNumber: this.incomingCallDetails.agentTelephoneNumber,
			endCallContext: this.endCallContext
		};

		this._loadCallOptions(endCallDetails);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	async _onReasonSelected() {
		const callToEnd = {
			incidentRecId: this.incomingCallDetails.incidentRecId,
			endCallReason: {
				key: this.endCallReason.key
			}
		};

		const returnValue = await this.callHandleService.endCall(callToEnd);

		// Log any error
		if (!returnValue.succeeded) {
			this.logger.log(`ERROR`, `An error occured while trying to close the incident ${this.incomingCallDetails.incidentReferenceNumber} with recording ID ${this.incomingCallDetails.voiceReferenceNumber}`, `_onReasonSelected`, returnValue.correlationId);
		}

		// Return the the call waiting landing page even if an error occured
		this._returnToCallWaitingPage();
	}

	_onValueChanged(e) {
		if (e.detail.new) {
			this.endCallReason = this.endCallReasons.find(reason => reason.key === e.detail.key);
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _loadCallOptions(endCallDetails) {
		const returnValue = await this.callHandleService.loadEndCallOptions(endCallDetails);

		if (returnValue.succeeded) {
			this.endCallReasons = returnValue.result.endCallReasons;
		} else {
			this.logger.log(`ERROR`, `An error occured while trying to close the incident ${this.incomingCallDetails.incidentReferenceNumber} with recording ID ${this.incomingCallDetails.voiceReferenceNumber}`, `_loadCallOptions`, returnValue.correlationId);

			// We can't give the user a list of reasons to select so just return to the call waiting page having logged the error
			this._returnToCallWaitingPage();
		}
	}

	_returnToCallWaitingPage() {
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
				height: 312px;
				border-radius: 5px;
			}

			.body-box {
				height: 256px;
				--theme-container-padding-top: 35px;
				--theme-container-padding-bottom: 0px;
				--theme-container-padding-left: 72px;
				--theme-container-padding-right: 73px;
				padding: 16px;
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
				margin: 0px;
			  }

			#id-cancel-button {
				height: 48px;
				width: 95px;
				margin-right: 17px;
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
			}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon-caller-dialog
                        .incomingCallDetails="${this.incomingCallDetails}"
                        .isNeedSelectable=${false}
				        .headerLabel="${HEADER_LABEL}" 
                        .displayButton="${false}">
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderChooseEndCallReason()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</horizon-caller-dialog>
			${this._renderLoadingIndicator()}
		`;
	}

	_renderChooseEndCallReason() {
		return html`
			<capitec-label class="end-reason-label" label="Choose reason"></capitec-label>
			<horizon-radio-button-group
                class="radio-button"
                .radioButtonsAvailable="${this.endCallReasons}"
                @value-change="${(e) => {
				this._onValueChanged(e);
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
                    @click="${() => this._onCancel()}">
				</capitec-button>
			
				<capitec-button
                    id="id-continue-button"
                    type="primary"
                    label="Continue"
                    @click="${() => this._onReasonSelected()}">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

window.customElements.define(`horizon-end-call-session`, EndCallSession);