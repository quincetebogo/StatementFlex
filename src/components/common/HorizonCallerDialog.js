import { Component, html, css } from 'platform/elements';

import '../common/HorizonCallerInfoBar';

import { CALLERINFOBAR_CSS } from '../../css/CallerInfoBar';
import { HORIZON_CALLER_DIALOG_HEADER_CSS } from '../../css/HorizonModalHeader';

export class HorizonCallerDialog extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.displayButton = true;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			headerLabel: { type: String },
			displayButton: { type: Boolean }
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

	_onEndCall() {
		this.dispatchEvent(new CustomEvent('on-end-call', {}));
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
			${HORIZON_CALLER_DIALOG_HEADER_CSS}

			capitec-modal {
				height: auto;
				width: 690px;
				--theme-modal-header-padding-top: 32px;
				--theme-modal-header-padding-bottom: 32px;
				--theme-modal-header-padding-right: 31px;
				--theme-modal-header-padding-left: 31px;
				--theme-modal-footer-padding: 7px 16px 9px 0px;
			}

			div[slot="body"] {
				width: 690px;
				height: auto;
			}

			horizon-caller-info-bar {
				height: auto;
				--theme-container-padding-top: 0px;
				--theme-container-padding-bottom: 0px;
				--theme-container-padding-left: 0px;
				--theme-container-padding-right: 0px;
			}
		`];

	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal
					type="free"
					header-align="left">
					<capitec-group slot="header" layout="horizontal" halign="left" valign="center" gap="none" id="modalHeader">
						<capitec-label type="title" 
										label="${this.headerLabel}">
						</capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-button
									style="visibility:${!this.displayButton ? "hidden" : "visible"}"
									label="End Call"
									@click="${() => this._onEndCall()}">
							<img class="end-call-icon" src="../../images/hangup.svg"/>
						</capitec-button>
					</capitec-group>
				<div slot="body">
					${this._renderCallInformation()}
					<slot name="body">
						
					</slot>
				</div>
				<div slot="footer">
					<slot name="footer">

					</slot>
				</div>
			</capitec-modal>`;

	}

	_renderCallInformation() {
		return html`
			<horizon-caller-info-bar
							.incomingCallDetails="${this.incomingCallDetails}">
			</horizon-caller-info-bar>
			`;
	}

}

window.customElements.define(`horizon-caller-dialog`, HorizonCallerDialog)