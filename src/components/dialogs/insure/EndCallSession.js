import { Component, html, css } from 'platform/elements';

import 'platform/components/popups/Modal';
import '../../common/HorizonLabel';
import '../../common/HorizonSelect';

import { CALLERINFOBAR_CSS } from '../../../css/CallerInfoBar';

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

	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {

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

	_onCancel() {
		this.dispatchEvent(new CustomEvent('on-cancel', {}));
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
				--theme-container-padding-top: 16px;
				--theme-container-padding-bottom: 0px;
				--theme-container-padding-left: 16px;
				--theme-container-padding-right: 17px;
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
				margin: 19px 57px 0px 56px;
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

			.radio-button-container {
				margin: 23px 57px 0px 56px;
				height: 48px;
				padding: 0px;
				box-sizing: border-box;
				border-style: solid;
				border-width: thin;
				border-radius: 5px;
				border-color: lightgrey;
			}

			.radio-button-label {
				height: 24px;
				--theme-radio-label-spacing: 12px;
				margin: 11px 0px 10px 16px;
			}
		`];

	}

	_webTemplate() {
		return html`
			<capitec-modal
				type="free"
				header-align="left">
				<div slot="header">
					<span>End Call Session</span>
				</div>
				<div slot="body">
					${this._renderCallInformation()}
					<capitec-content-box class="body-box">
					${this._renderChooseEndCallReason()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderCallInformation() {
		return html`
			<div class="call-details-bar">
				<horizon-label
					label="Reference Number"
					value = "${this.voiceReferenceNumber}">
				</horizon-label>
				<horizon-select
					label="Client Need"
					display-field="value"
					.items="${this.ivrOptions}"
					.value="${this.ivrOptionCode}">
				</horizon-select>
				<horizon-label
					label="Incoming Number"
					value="${this.incomingTelephoneNumber}">
				</horizon-label>
			</div>
		`;
	}

	_renderChooseEndCallReason() {
		return html`
			<capitec-label class="end-reason-label" label="Choose end call reason"></capitec-label>

			<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
				<capitec-radio class="radio-button-label" @value-change="" label="Client need has been assigned"></capitec-radio>
			</capitec-group>
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
					@click="">
				</capitec-button>
			</capitec-group>
		`;
	}
}

window.customElements.define(`horizon-end-call-session`, EndCallSession)