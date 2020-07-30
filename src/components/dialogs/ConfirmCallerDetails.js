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
import './insure/VerifyCaller';

import '../../components/common/HorizonLabel';
import '../../components/common/HorizonSelect';

import { CALLERINFOBAR_CSS } from '../../css/CallerInfoBar';
import { HORIZON_CALLER_DIALOG_HEADER_CSS } from '../../css/HorizonModalHeader';

import { HorizonChannelService } from '../../services/HorizonChannelService';
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
	INSURE_SEARCH_CALLER: 4,
	INSURE_VERIFY_CALLER: 5
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

		this.channelService = HorizonChannelService.getInstance();
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

		this.addCallerDetails = await this.serviceCallHelper.asyncCall(this.channelService.addCallerDetails(callDetails));
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

		if (this.incomingCallDetails.ivrOptionCode === "Insure") {
			this.renderMode = RENDER_MODE.INSURE_VERIFY_CALLER;
			return;
		}

		let confirmedCaller = {
			idNumber: this.southAfricanIDNumber.value,
			incomingTelephoneNumber: this.incomingTelephoneNumber.value,
			voiceReferenceNumber: this.voiceReferenceNumber.value,
			ivrOptionCode: this._getIvrOptionKey(this.ivrOption),
			incidentReferenceNumber: this.incidentReferenceNumber,
			incidentRecId: this.incidentRecId,
			agentTelephoneNumber: this.agentTelephoneNumber,
			nonClientFullName: '',
			nonClientCellPhone: '',
			nonClientIDNumber: '',
			nonClientRelationship: ''
		}

		let clientProfileDetails = await this.serviceCallHelper.asyncCall(this.channelService.identifyCaller(confirmedCaller));
		if (clientProfileDetails) {
			this.dispatchEvent(new CustomEvent('confirmed-caller', {
				detail: {
					incomingCallDetails: {
						voiceReferenceNumber: this.voiceReferenceNumber.value,
						incomingTelephoneNumber: this.incomingTelephoneNumber.value,
						ivrOptionCode: this._getIvrOptionKey(this.ivrOption),
						incidentReferenceNumber: this.incidentReferenceNumber,
						incidentRecId: this.incidentRecId,
						agentTelephoneNumber: this.agentTelephoneNumber
					},
					clientProfileDetails: clientProfileDetails
				}
			}));
		}
	}

	_onCallCancelled(event) {
		this.dispatchEvent(new CustomEvent('call-ended',
			{
				detail: {
					incidentReferenceNumber: this.incidentReferenceNumber,
					incidentRecId: this.incidentRecId,
					endCallReason: event.detail.endCallReason
				}
			}));
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
		this.incidentRecId = this.incomingCallDetails.incidentRecId;
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
				${HORIZON_CALLER_DIALOG_HEADER_CSS}

				capitec-modal{
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
					--theme-modal-footer-padding: 7px 16px 9px 0px;
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
					<capitec-group slot="header" layout="horizontal" halign="left" valign="center" gap="none" id="modalHeader">
						<capitec-label type="title" 
										label="Confirm Caller Details">
						</capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-button label="End Call" 
										@click="${() => this.renderMode = RENDER_MODE.END_CALL}">
							<img class="end-call-icon" src="../../images/hangup.svg"/>
						</capitec-button>
					</capitec-group>
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
					</div>
				</capitec-modal>`;

			case RENDER_MODE.ADD_CALLER_DETAILS:
				return html`${this.renderAddCallerDetailsModal()}`;

			case RENDER_MODE.END_CALL:
				return html`${this.renderEndCallModal()}`;

			case RENDER_MODE.SEARCH_CALLER:
				return html`${this.renderSearchCallerModal()}`;

			case RENDER_MODE.INSURE_SEARCH_CALLER:
				return html`${this.renderInsureSearchCallerModal()}`;

			case RENDER_MODE.INSURE_VERIFY_CALLER:
				return html`${this.renderVerifyCallerModal()}`;
		}
	}

	renderCallInformation() {
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
							class="client-info-row"
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
				.incomingCallDetails="${this.incomingCallDetails}"
				@on-client-identified="${(data) => this._onIdentifiedClient(data)}"
				@call-ended="${(data) => this._onCallCancelled(data)}">
			</horizon-insure-search-client>`;
	}

	renderVerifyCallerModal() {
		return html`
			<horizon-verify-caller .incomingCallDetails="${this.incomingCallDetails}"></horizon-verify-caller>
		`;
	}

}

window.customElements.define(`horizon-confirm-caller`, ConfirmCallerDetails)