import { Component, css, html } from 'platform/elements';
import { CALLERINFOBAR_CSS } from 'app/css/CallerInfoBar';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'platform/components/popups/Modal';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonSelect';
import 'app/components/common/HorizonRadioButtonsContainer';
import 'app/components/common/HorizonCallerDialog';

const HEADER_LABEL = `End Call Session`;

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
		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), null);
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 *
	 * @readonly
	 * @static
	 * @memberof EndCallSession
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			endCallReasons: { type: Array },
			isReassigned: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	connectedCallback() {
		super.connectedCallback();

		this.ivrOptions = this.incomingCallDetails.ivrOption.possibleValues;
		this.incomingCallDetails.isReassigned = isNullorEmpty(this.isReassigned) ? false : this.isReassigned;

		this.callHandleService.endCallOptions(this.incomingCallDetails, null)
			.then((returnValue) => {
				const endCallDialog = returnValue.result;

				if (returnValue.succeeded) {
					this.endCallReasons = endCallDialog.endCallReasons.possibleValues;
				} else {
					// TODO: Handle not being able to load end call options
				}
			});
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

		const returnValue = await this.callHandleService.endCall(callToEnd, null);

		if (!returnValue.succeeded) {
			// TODO: Handle end call failing
			this.horizonRouter.navigateToSystemError();
		} else {
			const state = { callStatus: `CALL-ENDED` };
			this.horizonStore.setState(state);
			this.horizonRouter.navigateToLandingPage();
		}
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
			}`
		];
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
				@value-change="${(e) => {
				this._onValueChanged(e);
			}}">
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

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

window.customElements.define(`horizon-end-call-session`, EndCallSession);