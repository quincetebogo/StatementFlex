import { Component, html, css } from 'platform/elements';

import 'platform/components/popups/Modal';
import '../common/HorizonLabel';
import '../common/HorizonSelect';
import '../common/HorizonRadioButtonsContainer';

import { CALLERINFOBAR_CSS } from '../../css/CallerInfoBar';

import { HorizonChannelService } from '../../services/HorizonChannelService';
import { ServiceCallHelper } from '../../utils/serviceCallHelper';
import { isNullorEmpty } from '../../utils/channelServiceUtilities';
import '../common/HorizonCallerDialog';

const HEADER_LABEL = "End Call Session";

export class EndCallSession extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		//TODO: Remove this hardcoded values, once the channel service is ready
		this.ivrOptions = [
			{
				"key": "StopCard",
				"value": "Stop Card"
			},
			{
				"key": "Insure",
				"value": "Insure"
			}
		];
		this.voiceReferenceNumber = "34567893";
		this.ivrOptionCode = "Insure";
		this.incomingTelephoneNumber = "071 679 7003";

		this.incomingCallDetails = {};
		this.endCallReasons = [];
		this.isBusy = false;
		this.isReassigned = false;

		this.channelService = HorizonChannelService.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			endCallReasons: { type: Array },
			isReassigned: { type: Boolean }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	async connectedCallback() {

		this.serviceCallHelper = new ServiceCallHelper(
			() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);

		this.incomingCallDetails.isReassigned = isNullorEmpty(this.isReassigned) ? false : this.isReassigned;

		//this._fetchEndCallReasons();

		let endCallDialog = await this.serviceCallHelper.asyncCall(this.channelService.endCallOptions(this.incomingCallDetails));

		if (endCallDialog) {
			this.endCallReasons = endCallDialog.endCallReasons.possibleValues;
			super.connectedCallback();
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancel() {
		this.dispatchEvent(new CustomEvent('on-cancel', {}));
	}

	_onReasonSelected() {
		this.dispatchEvent(new CustomEvent('on-reason-set', { detail: { endCallReason: this.endCallReason } }));
	}

	_onValueChanged(e) {
		if (e.detail.new) {
			this.endCallReason = this.endCallReasons.find(reason => reason.key == e.detail.key);
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _fetchEndCallReasons() {

		this.incomingCallDetails.ivrOptionCode = "1"; //Hardcoded for now
		let endCallDialog = await this.serviceCallHelper.asyncCall(this.channelService.endCallOptions(this.incomingCallDetails));

		if (endCallDialog) {
			this.endCallReasons = endCallDialog.endCallReasons.possibleValues;
		}
	}

	_toggleBusyFlag() {
		this.isBusy = this.isBusy ? false : true;
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
			}

			.end-reason-label {
				height: 24px;
				width: 546px;
				color: #545D60;
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
				margin-top: 15px;
			}
		`];

	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon-caller-dialog 
						.incomingCallDetails="${this.incomingCallDetails}"
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
			<capitec-label class="end-reason-label" label="Choose end call reason"></capitec-label>
			<horizon-radio-button 
				class="radio-button"
				.radioButtonsAvailable="${this.endCallReasons}"
				@value-change="${(e) => { this._onValueChanged(e) }}">
			</horizon-radio-button>
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
		else
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

window.customElements.define(`horizon-end-call-session`, EndCallSession)