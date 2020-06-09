/**
 * The Horizon Confirm Caller Details Dialog is used to confirming caller details of a
 * Capitec Client. This dialog is currently shared between the Stop Card and Insure Needs.
 */
import { Component, html, css } from 'platform/elements';

import 'platform/components/popups/Modal';
import 'platform/components/data/Table';
import 'platform/components/layouts/Spacer';
import 'platform/components/core/Icon';

import './AddCallerDetails';
import './EndCallSessionReason';
import './stopCard/SearchClientDetails';

import '../../components/Common/HorizonLabel';
import '../../components/Common/HorizonSelect';

import { CALLERINFOBAR_CSS } from '../../css/CallerInfoBar';

import { StopCardService } from '../../services/StopCardService';
import { ServiceCallHelper } from '../../utils/serviceCallHelper';

import { isDisabled, isHidden, getTabIndex } from '../../utils/channelServiceUtilities';

/**
 * 
 */
const RENDER_MODE = {
	CONFIRM_CALLER: 0,
	ADD_CALLER_DETAILS: 1,
	END_CALL: 2,
	SEARCH_CALLER: 3,
	INSURE_SEARCH_CALLER: 4
};

export class ConfirmCallerDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Property initialization
		this.confirmedCaller = null;
		this.incomingCallDetails = null;
		this.nonClientCallerInfo = null;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;

		this.stopCardService = StopCardService.getInstance();
		this.serviceCallHelper = new ServiceCallHelper(
			() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);

		this.isBusy = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} [confirmedCaller] - Caller info for verified client.
	 * @property {Object} [callerInfo]      - Incoming call information
	 *
	 * @readonly
	 * @static
	 * @memberof ConfirmCallerDetails
	 */
	static get properties() {
		return {
			isBusy: { type: Boolean },
			confirmedCaller: { type: Object },
			incomingCallDetails: { type: Object },
			renderMode: { type: Number },
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

	async _onAddCallerDetails() {
		let callDetails = {
			incomingNumber: this.incomingTelephoneNumber.value,
			voiceReference: this.voiceReferenceNumber.value,
			ivrOption: this._getIvrOptionKey(this.ivrOption),
			incidentNo: this.incidentReferenceNumber,
			agentPhoneNumber: this.agentTelephoneNumber
		}

		this.addCallerDetails = await this.serviceCallHelper.asyncCall(this.stopCardService.addCallerDetails(callDetails));
		if (this.addCallerDetails) {
			this.renderMode = RENDER_MODE.ADD_CALLER_DETAILS;
		}
	}

	_onAddCallerDetailsReturn(data) {
		this.ivrOption.value = data.detail.ivrOptionValue;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER
	}

	// Raise an event to return the confirmed caller information once the confirm button has been pressed.
	async _onConfirmClick() {
		let confirmedCaller = {
			idNumber: this.southAfricanIDNumber.value,
			incomingTelephoneNumber: this.incomingTelephoneNumber.value,
			voiceReferenceNumber: this.voiceReferenceNumber.value,
			ivrOptionCode: this._getIvrOptionKey(this.ivrOption),
			incidentReferenceNumber: this.incidentReferenceNumber,
			agentTelephoneNumber: this.agentTelephoneNumber,
			// verifiedTelephoneNumber: this.verifiedTelephoneNumber.value,
			nonClientFullName: '',
			nonClientCellPhone: '',
			nonClientIDNumber: '',
			nonClientRelationship: ''
		}

		let clientProfileDetails = await this.serviceCallHelper.asyncCall(this.stopCardService.identifyCaller(confirmedCaller));
		if (clientProfileDetails) {
			this.dispatchEvent(new CustomEvent('confirmed-caller', {
				detail: {
					incomingCallDetails: {
						voiceReferenceNumber: this.voiceReferenceNumber.value,
						incomingTelephoneNumber: this.incomingTelephoneNumber.value,
						ivrOptionCode: this._getIvrOptionKey(this.ivrOption),
						incidentReferenceNumber: this.incidentReferenceNumber,
						incidentRecNo: this.incidentRecNo,
						agentTelephoneNumber: this.agentTelephoneNumber
					},
					clientProfileDetails: clientProfileDetails
				}
			}));
		}
	}

	_onCallCancelled(event) {
		if (event.detail.unverifiedCaller === undefined) {
			// We got here by ending the call from this dialog.
			// we return the the caller with the information from this dialog and the end call reason
			let confirmedCaller = {
				voiceReferenceNumber: this.voiceReferenceNumber.value,
				ivrOption: this._getIvrOptionKey(this.ivrOption),
				incomingTelephoneNumber: this.incomingTelephoneNumber.value,
				callerFullName: this.callerFullName.value,
				southAfricanIDNumber: this.southAfricanIDNumber.value,
				verifiedTelephoneNumber: this.verifiedTelephoneNumber.value,
				livesIn: this.livesIn.value,
				languagePreference: this.languagePreference.value,
				birthdate: this.birthdate.value
			}

			this.dispatchEvent(new CustomEvent('call-ended',
				{
					detail: {
						confirmedCaller: confirmedCaller, 	// Do we need the confirmed caller?
						incidentReferenceNumber: this.incidentReferenceNumber,
						endCallReason: event.detail.endCallReason
					}
				}));
		}
		else {
			// We are bubbling back to the caller from the Search for Unverified Client dialog
			// Should we return the Confirmed Caller? (they are not really confirmed)
			// Should we return whatever we had on the Search dialog
			// This will depend on what we need to record when recording the end of the call
			this.dispatchEvent(new CustomEvent('call-ended',
				{
					detail: {
						incidentReferenceNumber: this.incidentReferenceNumber,
						endCallReason: event.detail.endCallReason
					}
				}));
		}
	}

	_onIdentifiedClient(data) {
		// After a search we need to replace whatever we might have had for the confirmed caller with 
		// the results of the search
		// the results of the search
		this.confirmedCaller = data.detail.identifiedClient;
		this.incomingCallDetails = data.detail.incomingCallDetails;
		this._initReferences();

		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	_onNonClientDetailsAdded(data) {
		this.dispatchEvent(new CustomEvent('confirmed-caller', {
			detail: data.detail
		}));
	}

	_onIvrOptionChanged(e) {
		this.ivrOption.value = e.detail.new.value;
		this.incomingCallDetails.ivrOptionCode = e.detail.new.key;
	}

	_onSearchClick() {

		if (this.incomingCallDetails.ivrOptionCode === "Insure") {
			this.renderMode = RENDER_MODE.INSURE_SEARCH_CALLER;
		}
		else {
			this.renderMode = RENDER_MODE.SEARCH_CALLER;
		}
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

		this.voiceReferenceNumber = this.confirmedCaller.voiceReferenceNumber;
		this.ivrOption = this.confirmedCaller.ivrOption;
		this.incomingTelephoneNumber = this.confirmedCaller.incomingTelephoneNumber;
		this.addCallerDetailsButton = this.confirmedCaller.addCallerDetailsButton;
		this.callerInformation = this.confirmedCaller.callerInformation;
		this.callerFullName = this.confirmedCaller.callerInformation.name;
		this.southAfricanIDNumber = this.confirmedCaller.callerInformation.southAfricanIDNumber;
		this.verifiedTelephoneNumber = this.confirmedCaller.callerInformation.verifiedTelephoneNumber;
		this.livesIn = this.confirmedCaller.callerInformation.livesIn;
		this.languagePreference = this.confirmedCaller.callerInformation.languagePreference;
		this.birthdate = this.confirmedCaller.callerInformation.birthdate;
		this.searchClientButton = this.confirmedCaller.searchClientButton;
		this.endCallSessionButton = this.confirmedCaller.endCallSessionButton;
		this.confirmButton = this.confirmedCaller.confirmButton;

		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
		this.incidentRecNo = this.incomingCallDetails.incidentRecNo;
		this.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;
	}

	_getLanguagePreference() {
		let languagePreference = this.confirmedCaller.callerInformation.languagePreference.value;

		if (languagePreference === null) {
			languagePreference = '-';
		}
		return languagePreference;
	}

	_getVerifiedTelephoneNumber() {
		let verifiedTelephoneNumber = this.confirmedCaller.callerInformation.verifiedTelephoneNumber.value;

		if (verifiedTelephoneNumber === null) {
			verifiedTelephoneNumber = '-';
		}
		return verifiedTelephoneNumber;
	}

	_getBirthdate() {
		let birthdate = this.birthdate.value;
		console.log("Birthdate:", birthdate);
		let dob = birthdate instanceof Date ? birthdate : birthdate ? new Date(birthdate) : null;
		console.log("Date of birth: ", dob);
		let months = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"];

		return (`${dob.getDate()} ${months[dob.getMonth()]}`);

	}

	_toggleBusyFlag() {
		this.isBusy = this.isBusy ? false : true;
	}

	_getIvrOptionKey(ivrOption) {
		let result = ivrOption.possibleValues.find((entry) => entry.value === ivrOption.value);
		return result.key;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				${CALLERINFOBAR_CSS}

				capitec-modal{
					--theme-modal-header-padding-top: 31px;
					--theme-modal-header-padding-bottom: 31px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
					--theme-modal-footer-padding: 7px 16px 9px 0px;
				}

				div[slot="header"]{
					width: 693px;
					position: absolute;
					display: flex;
					align-items: center;
					left: -670px;
					top: -25px;
				}

				div[slot="header"] > span{
					height: 24px;
					width: 190px;
					color: #FFFFFF;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
					padding-left: 17px;
					margin-right: 355px;
				}

				div[slot="header"] > capitec-button{
					width: 130px;
					--theme-button-padding-top: 12.5px;
					--theme-button-padding-bottom: 12.5px;
					--theme-button-padding-left: 16px;
					--theme-button-default-background-color: #FF2B25;
					--theme-button-default-border-color: #FF2B25;
					--theme-button-default-font-color: rgb(255, 255, 255);
					--theme-button-default-background-tapped-color: #FF2B25;
				}

				.end-call-icon{
					margin: 0px;
					margin-left: 14px;
					margin-top: -5px;
				}

				div[slot="body"]{
					width: 690px;
					height: 387px;
				}

				capitec-content-box{
					height: 332px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 17px;
				}

				#id-banner-addcallerdetails{
					--theme-alert-banner-warning-border: 1px solid rgba(228,124,40,0.1);
					--theme-alert-banner-icon-margin-left: 16px;
				}

				.client-info{
					display: flex;
					flex-direction: row;
				}

				.image{
					width: 200px;
					height: 200px;
					padding: 0px;
					margin-top: 16px;
					background: gainsboro;
					display: inline-block;
				}

				#id-caller-group{
					margin-left: 25px;
					margin-top: 16px;
				}

				.fullname{
					height: 34px;
					width: auto;
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 20px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 28px;
				}

				.client-info-row {
					height: 56px;
					width: 216px;
					justify-content: center;

					--horizon-label-text-height: 16px;
					--horizon-label-text-color: #545D60;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 16px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #545D60;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-margin-top: 4px;
				}

				#id-search-button{
					margin-right: 10px;
					height: 48px;
					width: 133px;
					--theme-button-padding-top: 13px;
					--theme-button-padding-right: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 12px;
				}

				#id-confirm-button {
					height: 48px;
					width: 105px;
					--theme-button-padding-top: 13px;
					--theme-button-padding-right: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 12px;
				}
			`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.CONFIRM_CALLER:
				return html`
				<capitec-modal
						type="free"
						header-align="left">
					<div slot="header">
						<span>Confirm Caller Details</span>
						<capitec-button label="End Call" 
										@click="${() => this.renderMode = RENDER_MODE.END_CALL}">
							<capitec-icon class="end-call-icon" size="small" icon="system/phone-escalation"></capitec-icon>
						</capitec-button>
					</div>
					<div slot="body">
						${this.renderCallInformation()}
						<capitec-content-box>
							${this.renderAddCallerDetails()}
							${this.renderConfirmedCaller()} 
							${this.renderLoadingIndicator()}
						</capitec-content-box>
					</div>
					<div slot="footer">
						${this.renderFooter()}
					<div>
				</capitec-modal>`;

			case RENDER_MODE.ADD_CALLER_DETAILS:
				return html`${this.renderAddCallerDetailsModal()}`;

			case RENDER_MODE.END_CALL:
				return html`${this.renderEndCallModal()}`;

			case RENDER_MODE.SEARCH_CALLER:
				return html`${this.renderSearchCallerModal()}`;

			case RENDER_MODE.INSURE_SEARCH_CALLER:
				return html`${this.renderInsureSearchCallerModal()}`;
		}
	}

	renderCallInformation() {
		return html`
			<div class="call-details-bar">
				<horizon-label
					label="Reference Number" 
					value = "${this.voiceReferenceNumber.value}"
					tabindex="${getTabIndex(this.voiceReferenceNumber)}"
					?hidden=${isHidden(this.voiceReferenceNumber)}>
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

	renderAddCallerDetails() {
		return html`
		<capitec-alert-banner id="id-banner-addcallerdetails" type="warning">
			<capitec-hyperlink 
				label="Add Caller Details" 
				tabindex="${getTabIndex(this.addCallerDetailsButton)}"
				@click="${() => this._onAddCallerDetails()}">
			</capitec-hyperlink> 
			if the caller is calling on another client's behalf
		</capitec-alert-banner>`;
	}

	renderConfirmedCaller() {
		return html`
				<capitec-group class="client-info" layout="horizontal" gap="none">
					<capitec-avatar
						class="image"
						shape = "none"
						value = ""
						tabindex="-1">
					</capitec-avatar>
					<capitec-group id="id-caller-group" layout="grid" gap="none" columns="auto" rows="auto">
						<capitec-label row = "1" column = "1" colspan="2" class="fullname"
							label="${this.callerFullName.value}"
							tabindex="${getTabIndex(this.callerFullName)}"
							?hidden=${isHidden(this.callerFullName)}>
						</capitec-label>
						<horizon-label
							class="client-info-row"
							row = "2" column = "1" 
							label="ID Number"
							value="${this.southAfricanIDNumber.value}"
							tabindex="${getTabIndex(this.southAfricanIDNumber)}"
							?hidden=${isHidden(this.southAfricanIDNumber)}>
						</horizon-label>
						<horizon-label
							class="client-info-row"
							row = "2" column = "2"
							label="Verified Cellphone Number"
							value="${this._getVerifiedTelephoneNumber()}"
							tabindex="${getTabIndex(this.verifiedTelephoneNumber)}"
							?hidden=${isHidden(this.verifiedTelephoneNumber)}>
						</horizon-label>
						<horizon-label
						class="client-info-row"
							row="3" columun = "1"
							label="Lives In"
							value="${this.livesIn.value}"
							tabindex="${getTabIndex(this.livesIn)}"
							?hidden=${isHidden(this.livesIn)}>
						</horizon-label>
						<horizon-label
							class="client-info-row"
							row="3" columun = "2"
							label="Language Preference"
							value="${this._getLanguagePreference()}"
							tabindex="${getTabIndex(this.languagePreference)}"
							?hidden=${isHidden(this.languagePreference)}>
						</horizon-label>
						<horizon-label
							class="client-info-row";
							row="4" columun = "1"
							label="Birthday"
							value="${this._getBirthdate(this.birthdate)}"
							tabindex="${getTabIndex(this.birthdate)}"
							?hidden=${isHidden(this.birthdate)}>
						</horizon-label>
					</capitec-group>
				</capitec-group>
		 `;
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-search-button"
					type="clear"
					label="Search Client"
					?hidden=${isHidden(this.searchClientButton)}
					.disabled="${isDisabled(this.searchClientButton)}"
					tabindex="${getTabIndex(this.searchClientButton)}"
					@click="${() => this._onSearchClick()}">
				</capitec-button>

				<capitec-button
					id="id-confirm-button"
					type="primary"
					label="Confirm"
					?hidden=${isHidden(this.confirmButton)}
					.disabled="${isDisabled(this.confirmButton)}"
					tabindex="${getTabIndex(this.confirmButton)}"
					@click="${() => this._onConfirmClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}

	renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		}
		else
			return html`
            <capitec-loading-indicator></capitec-loading-indicator>
        `;
	}

	renderAddCallerDetailsModal() {
		return html`
			<horizon-add-caller
				.confirmedCaller="${this.confirmedCaller}"
				.incomingCallDetails="${this.incomingCallDetails}"
				.addCallerDialog="${this.addCallerDetails}"
				@on-back="${(data) => this._onAddCallerDetailsReturn(data)}"
				@call-ended="${(data) => this._onCallCancelled(data)}"
				@caller-added="${(data) => this._onNonClientDetailsAdded(data)}">
			</horizon-add-caller>`;
	}

	renderEndCallModal() {
		return html`
			<end-call-session
				@on-cancel="${() => { this.renderMode = RENDER_MODE.CONFIRM_CALLER }}"
				@on-reason-set="${(reason) => this._onCallCancelled(reason)}">
			</end-call-session>`;
	}

	renderSearchCallerModal() {
		return html`
			<horizon-search-client
				.unverifiedCaller="${this.confirmedCaller}"
				.incomingCallDetails="${this.incomingCallDetails}"
				@on-client-identified="${(data) => this._onIdentifiedClient(data)}"
				@call-ended="${(data) => this._onCallCancelled(data)}">
			</horizon-search-client>`;
	}

	renderInsureSearchCallerModal() {
		return html`
			<horizon-insure-search-client
				.unverifiedCaller="${this.confirmedCaller}"
				.incomingCallDetails="${this.incomingCallDetails}"
				@on-client-identified="${(data) => this._onIdentifiedClient(data)}"
				@call-ended="${(data) => this._onCallCancelled(data)}">
			</horizon-insure-search-client>`;
	}

}

window.customElements.define(`horizon-confirm-caller`, ConfirmCallerDetails)