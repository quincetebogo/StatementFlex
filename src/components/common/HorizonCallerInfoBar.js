import { Component, html, css } from 'platform/elements';

import './HorizonLabel';
import './HorizonSelect';

import { CALLERINFOBAR_CSS } from '../../css/CallerInfoBar';
import { HORIZON_CALLER_DIALOG_HEADER_CSS } from '../../css/HorizonModalHeader';

import { isDisabled, isHidden, getTabIndex } from '../../utils/channelServiceUtilities';

export class CallerInfoBar extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.incomingCallDetails = null;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			incomingCallDetails: { type: Object },
		}
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
		this.ivrOption.value = e.detail.new.value;
		this.incomingCallDetails.ivrOptionCode = e.detail.new.key;
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

		this.ivrOption = this.incomingCallDetails.ivrOption;
		this.incomingTelephoneNumber = this.incomingCallDetails.incomingTelephoneNumber;
		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
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

			`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<div class="call-details-bar">
				<horizon-label
					label="Reference Number" 
					value = "${this.incidentReferenceNumber}"
					tabindex="${getTabIndex(this.incidentReferenceNumber)}"
					?hidden=${isHidden(this.incidentReferenceNumber)}>
				</horizon-label>
				<horizon-select
					label="Client Need"
					display-field="value"
					.items="${this.ivrOption.possibleValues}"
					.value="${this.ivrOption.value}"
					tabindex="${getTabIndex(this.ivrOption)}"
					?hidden=${isHidden(this.ivrOption)}
					@value-changed="${(e) => this._onIvrOptionChanged(e)}">
				</horizon-select>
				<horizon-label
					label="Incoming Number"
					value="${this.incomingTelephoneNumber.value}"
					tabindex="${getTabIndex(this.incomingTelephoneNumber)}"
					?hidden=${isHidden(this.incomingTelephoneNumber)}>
				</horizon-label>
			</div>`;
	}


}

window.customElements.define(`horizon-caller-info-bar`, CallerInfoBar);