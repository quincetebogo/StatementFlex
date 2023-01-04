import { Component, css, html } from 'platform/elements';

import { CALLERINFOBAR_CSS } from 'app/css/CallerInfoBar';

import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonSelect';

/**
 * The Horizon Caller Info Bar is presented at the top of many Horizon Dialogs.
 */
export class CallerInfoBar extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.incomingCallDetails = null;
		this.need = null;
		this.isNeedSelectable = false;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {Object} incomingCallDetails - Incoming Caller Information (see models/IncomingCallDetails for layout)
	 * @property {string} incidentRefNumber - Current incident reference number
	 * @property {Boolean} [isNeedSelectable=false] Determines if the need can be switched via the Caller Info Bar on the dialog
	*/
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			incidentRefNumber: { type: String },
			isNeedSelectable: { type: Boolean }
		};
	}

	get _incidentRefNumber() {
		return this.incidentRefNumber && this.incidentRefNumber > 0 ? this.incidentRefNumber : ``;
	}

	get incCreated() {
		return this.incidentDetails.incCreated;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// Short hand references for reaching into the incoming data model
		this._initReferences();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onIvrOptionChanged(e) {
		this.dispatchEvent(new CustomEvent(`on-need-changed`, {
			detail: {
				old: this.need,
				new: e.detail.new.key
			}
		}));

		this.need = e.detail.new.key;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initReferences() {
		// Setup shorthand references into the confirmedCaller object that either
		// passed into this dialog or returned to this dialog after a Search.

		this.need = this.incomingCallDetails.ivrOption.value;
		this.possibleNeedValues = this.incomingCallDetails.ivrOption.possibleValues;

		this.incomingTelephoneNumber = this.incomingCallDetails.incomingTelephoneNumber;
	}


	_getNeedDisplayValue(need) {
		const result = this.possibleNeedValues.find((entry) => entry.key === need);
		return result ? result.value : ``;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`${CALLERINFOBAR_CSS}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<div class="call-details-bar">
				${this._renderIncRefNumber()}
				<horizon-select
					data-automation-id="caller-info-bar-need"
					label="Client Need"
					display-field="value"
					.items="${this.possibleNeedValues}"
					.value="${this._getNeedDisplayValue(this.need)}"
					@value-changed="${(e) => this._onIvrOptionChanged(e)}"
					?disabled=${!this.isNeedSelectable}>
				</horizon-select>
				<horizon-label
					data-automation-id="caller-info-bar-incoming-telephone"
					label="Incoming Number"
					value="${this.incomingTelephoneNumber}">
				</horizon-label>
			</div>
		`;
	}

	_renderIncRefNumber() {

		switch (true) {
			case !this._incRefNumber && !this.incCreated:
				return html`
					<capitec-content-box class="noIncRef" layout="horizontal" gap="clear" halign="left" valign="center">
						<capitec-icon
							size="medium"
							icon="status/warning-trans">
						</capitec-icon>
						<capitec-label label="Incident not created"></capitec-label>
					</capitec-content-box>`
			case !this._incRefNumber && this.incCreated:
				return html`
					<capitec-content-box class="noIncRef" layout="horizontal" gap="clear" halign="left" valign="center">
						<capitec-icon
							size="medium"
							icon="status/info-trans">
						</capitec-icon>
						<capitec-label label="Incident closed"></capitec-label>
					</capitec-content-box>`;
			default:
				return html`
					<horizon-label
						data-automation-id="caller-info-bar-incident-reference"
						label="Reference Number"
						value = "${this._incRefNumber}">
					</horizon-label>`;
		}
	}
}

window.customElements.define(`horizon-caller-info-bar`, CallerInfoBar);