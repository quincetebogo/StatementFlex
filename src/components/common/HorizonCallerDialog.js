import { Component, css, html } from 'platform/elements';

import { CALLERINFOBAR_CSS } from '../../css/CallerInfoBar';
import { HORIZON_CALLER_DIALOG_HEADER_CSS } from '../../css/HorizonModalHeader';

import './HorizonCallerInfoBar';

/**
 * A Dialog with a Caller Information Bar. This is a common dialog format in the Horizon Project.
 * 
 * @export
 * @class HorizonCallerDialog
 * @extends {Component}
 */
export class HorizonCallerDialog extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.displayButton = true;
		this.headerLabel = ``;
		this.incomingCallDetails = null;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} headerLabel - The label string for the dialog heading
	 * @property {Boolean} [displayButton=true] - Whether to display the End Call button or not 
	 * @property {Object} incomingCallDetails - Incoming Caller Information (see models/IncomingCallDetails)
	 * 
	 * @readonly
	 * @static
	 * @memberof HorizonCallerDialog
	 */
	static get properties() {
		return {
			headerLabel: { type: String },
			displayButton: { type: Boolean },
			incomingCallDetails: { type: Object }
		};
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
		this.dispatchEvent(new CustomEvent(`on-end-call`, {}));
	}

	_onNeedChanged(event) {
		this.dispatchEvent(new CustomEvent(`on-need-changed`, {
			detail: event.detail
		}));
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
			}`
		];

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
									style="visibility:${!this.displayButton ? `hidden` : `visible`}"
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
				.incomingCallDetails="${this.incomingCallDetails}"
				@on-need-changed=${(event) => this._onNeedChanged(event)}>
			</horizon-caller-info-bar>
			`;
	}

}

window.customElements.define(`horizon-caller-dialog`, HorizonCallerDialog);