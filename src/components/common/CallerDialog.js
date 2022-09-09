import { Component, css, html } from 'platform/elements';

import { CALLERINFOBAR_CSS } from 'app/css/CallerInfoBar';

import 'app/components/common/CallerInfoBar';

/**
 * A Dialog with a Caller Information Bar. This is a common dialog format in the Horizon Project.
 * 
 * @export
 * @class CallerDialog
 * @extends {Component}
 */
export class CallerDialog extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.displayButton = true;
		this.headerLabel = ``;
		this.incomingCallDetails = null;
		this.incidentDetails = null;
		this.isNeedSelectable = false;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} headerLabel - The label string for the dialog heading
	 * @property {Boolean} [displayButton=true] - Whether to display the End Call button or not 
	 * @property {object} incidentDetails - Incident details
	 * @property {Object} incomingCallDetails - Incoming Caller Information (see models/IncomingCallDetails)
	 * @property {Boolean} [isNeedSelectable=false] Determines if the need can be switched via the Caller Info Bar on the dialog
	 * 
	 * @readonly
	 * @static
	 * @memberof HorizonCallerDialog
	 */
	static get properties() {
		return {
			headerLabel: { type: String },
			displayButton: { type: Boolean },
			incidentDetails: { type: Object },
			incomingCallDetails: { type: Object },
			isNeedSelectable: { type: Boolean }
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

			capitec-modal {
				height: auto;
				width: var(--horizon-modal-width, 690px);

				--theme-modal-header-padding-top: 20px;
				--theme-modal-header-padding-bottom: 20px; 

				--theme-modal-slot-header-right: 20px;
				--theme-modal-footer-padding: var(--horizon-modal-footer-padding, 7px 16px 9px 0px);
                --theme-modal-body-box-shadow: #664e60;
                --theme-modal-header-border-radius: 4px 4px 0px 0px;
                --theme-modal-body-border-radius: 4px 4px 4px 4px;
			}

			#id-end-call-button {
				/* Position button in the top right corder of the dialog */
				position: absolute;
				top: -44px;
				right: -20px;

				/* Set button margin to offset from top left as appropriate. (easy to calculate now) */
				margin-top: var(--horizon-end-call-button-margin-top, 8px);
				margin-right: var(--horizon-end-call-button-margin-right, --theme-modal-header-padding-right, 16px); 

				height: 48px;
				width: 130px;

				--theme-button-default-background-color: #FF2B25;
				--theme-button-default-border-color: #FF2B25;
				--theme-button-default-font-color: rgb(255, 255, 255);
				--theme-button-default-background-tapped-color: #FF2B25;

				--theme-button-padding-top: 12px;
				--theme-button-padding-bottom: 12px;
				--theme-button-padding-right: 16px;
				--theme-button-padding-left: 16px;
			}

			.end-call-icon{
				margin-left: 14px;
			}

			div[slot="body"] {
				width: var(--horizon-modal-width, 690px);
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
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="${this.headerLabel}">
				<capitec-button
					slot="header"
					id="id-end-call-button"
					data-automation-id="caller-dialog-end-call"
					style="visibility:${!this.displayButton ? `hidden` : `visible`}" 
					label="End Call"
					@click="${() => this._onEndCall()}">
					<img class="end-call-icon" src="/images/common/hangup.svg"/>
				</capitec-button>

				<div slot="body">
					${this._renderCallInformation()}
					<slot name="body"></slot>
				</div>
				<div slot="footer">
					<slot name="footer"></slot>
				</div>
			</capitec-modal>`;
	}

	_renderCallInformation() {
		return html`
			<horizon-caller-info-bar
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				.isNeedSelectable="${this.isNeedSelectable}"
				@on-need-changed=${(event) => this._onNeedChanged(event)}>
			</horizon-caller-info-bar>
		`;
	}

}

window.customElements.define(`horizon-caller-dialog`, CallerDialog);