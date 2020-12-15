import { Component, css, html } from 'platform/elements';

import { CALLERINFOBAR_CSS } from 'app/css/CallerInfoBar';
import { HORIZON_CALLER_DIALOG_HEADER_CSS } from 'app/css/HorizonModalHeader';

import 'app/Components/common/HorizonLabel';
import 'app/Components/common/HorizonSelect';

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
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {Object} incomingCallDetails - Incoming Caller Information (see models/IncomingCallDetails for layout)
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object }
		};
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
		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
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
			css`
			
			${CALLERINFOBAR_CSS}
			${HORIZON_CALLER_DIALOG_HEADER_CSS}

			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<div class="call-details-bar">
				<horizon-label
					label="Reference Number" 
					value = "${this.incidentReferenceNumber}">
				</horizon-label>
				<horizon-select
					label="Client Need"
					display-field="value"
					.items="${this.possibleNeedValues}"
					.value="${this._getNeedDisplayValue(this.need)}"
					@value-changed="${(e) => this._onIvrOptionChanged(e)}">
				</horizon-select>
				<horizon-label
					label="Incoming Number"
					value="${this.incomingTelephoneNumber}">
				</horizon-label>
			</div>`;
	}
}

window.customElements.define(`horizon-caller-info-bar`, CallerInfoBar);