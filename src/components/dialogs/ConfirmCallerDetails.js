/*
 *		Horizon Confirm Caller Details Dialog
 *
 */
import { Component, html, css } from 'platform/elements';

import 'platform/components/popups/Modal';
import 'platform/components/data/Table';
import 'platform/components/layouts/Spacer';
import 'platform/components/core/Icon';

import './AddCallerDetails';
import './EndCallSessionReason';
import '../../components/Common/HorizonLabel'
import '../../components/Common/HorizonSelect'
import './SearchClientDetails';

import { StopCardService } from '../../services/StopCardService';
import { isDisabled, isHidden, getTabIndex } from '../../utils/channelServiceUtilities';

const RENDER_MODE = {
	CONFIRM_CALLER: 0,
	ADD_CALLER_DETAILS: 1,
	END_CALL: 2,
	SEARCH_CALLER: 3
};

export class ConfirmCallerDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Property initialization
		this.confirmedCaller = null;
		this.isBusy = false;
		this.nonClientCallerInfo = null;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
		this.isBusy = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * confirmedCaller	: Dialog input - the result of the web service call to retrieve the confirmed caller.
	 * renderMode	: Flag - controls whether to show the AddCallerDetails dialog
	 */
	static get properties() {
		return {
			isBusy: { type: Boolean },
			confirmedCaller: { type: Object },
			renderMode: { type: Number },
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// Short hand references for reaching into the incoming data model
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
		this.addCallerDetailsButton = this.confirmedCaller.addCallerDetailsButton;
		this.confirmButton = this.confirmedCaller.confirmButton;
		this.incidentReferenceNumber = this.confirmedCaller.incidentReferenceNumber;
		this.agentTelephoneNumber = this.confirmedCaller.agentTelephoneNumber;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _loadAddCallerDialog() {
		let callDetails = {
			incomingNumber: this.incomingTelephoneNumber.value,
			voiceReference: this.voiceReferenceNumber.value,
			ivrOption: 'StopCard',
			incidentNo: this.incidentReferenceNumber,
			agentPhoneNumber: this.agentTelephoneNumber
		}

		this.isBusy = true;
		try {
			this.addCallerDialog = await StopCardService.getInstance().addCallerDetails(callDetails);
			this.renderMode = RENDER_MODE.ADD_CALLER_DETAILS;
		}
		catch (error) {
			//TODO: Handle error properly
			console.log(error);
		}
		finally {
			this.isBusy = false;
		}
	}

	// Raise an event to return the confirmed caller information once the confirm button has been pressed.
	async onConfirmClick() {
		let confirmedCaller = {
			idNumber: this.southAfricanIDNumber.value,
			incomingTelephoneNumber: this.incomingTelephoneNumber.value,
			voiceReferenceNumber: this.voiceReferenceNumber.value,
			ivrOptionCode: 'StopCard',
			incidentReferenceNumber: this.incidentReferenceNumber,
			agentTelephoneNumber: this.agentTelephoneNumber,
			// verifiedTelephoneNumber: this.verifiedTelephoneNumber.value,
			nonClientFullName: '',
			nonClientCellPhone: '',
			nonClientIDNumber: '',
			nonClientRelationship: ''
		}

		try {
			this.isBusy = true;

			let clientProfileDetails = await StopCardService.getInstance().identifyCaller(confirmedCaller);

			//Object.assign(this.confirmedCaller, clientProfileDetails);
			this.dispatchEvent(new CustomEvent('confirmed-caller', {
				detail: {
					incomingCallDetails: {
						voiceReferenceNumber: this.voiceReferenceNumber.value,
						incomingTelephoneNumber: this.incomingTelephoneNumber.value,
						ivrOptionCode: 'StopCard',
						incidentReferenceNumber: this.incidentReferenceNumber,
						agentTelephoneNumber: this.agentTelephoneNumber
					},
					clientProfileDetails: clientProfileDetails
				}
			}));
		}
		catch (error) {
			console.log('Error in fetching Client Info.');
			console.log(error);
		}
		finally {
			this.isBusy = false;
		}
	}

	onCallCancelled(event) {
		if (event.detail.unverifiedCaller === undefined) {
			// We got here by ending the call from this dialog.
			// we return the the caller with the information from this dialog and the end call reason
			let confirmedCaller = {
				voiceReferenceNumber: this.voiceReferenceNumber.value,
				ivrOption: this.ivrOption.value,
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

	onSearchClick() {
		let callerDetails = {
			incomingNumber: this.confirmedCaller.incomingTelephoneNumber.value,
			voiceReference: this.confirmedCaller.voiceReferenceNumber.value,
			incidentNo: this.confirmedCaller.incidentReferenceNumber,
			agentPhoneNumber: this.confirmedCaller.agentTelephoneNumber,
			ivrOptionSelected: 'StopCard'
		}
		this.isBusy = true;
		let searchOptions = StopCardService.getInstance().searchOptions(callerDetails);

		searchOptions.then((response) => {
			this.confirmedCaller.identificationMethods = response.identificationMethods;
			this.renderMode = RENDER_MODE.SEARCH_CALLER;
			this.isBusy = false;
		}, (error) => {
			console.log("Error in fething search options.");
			this.isBusy = false;
		});
	}

	identifiedClient(data) {

		//Updating the identified caller info into local variables
		this.updateCallerInfo(data)
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	updateCallerInfo(data) {
		this.callerInformation = data.detail.identifiedClient.callerInformation;
		this.callerFullName = this.callerInformation.name;
		this.southAfricanIDNumber = this.callerInformation.southAfricanIDNumber;
		this.verifiedTelephoneNumber = this.callerInformation.verifiedTelephoneNumber;
		this.livesIn = this.callerInformation.livesIn;
		this.languagePreference = this.callerInformation.languagePreference;
		this.birthdate = this.callerInformation.birthdate;
		this.incidentReferenceNumber = data.detail.identifiedClient.incidentReferenceNumber;
		this.agentTelephoneNumber = data.detail.identifiedClient.agentTelephoneNumber;
	}

	_ivrOptionChanged(e) {
		this.ivrOption.value = e.detail.new.key;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	getLanguagePreference() {
		let languagePreference = this.confirmedCaller.callerInformation.languagePreference.value;

		if (languagePreference === null) {
			languagePreference = '';
		}
		return languagePreference;
	}

	getVerifiedTelephoneNumber() {
		let verifiedTelephoneNumber = this.confirmedCaller.callerInformation.verifiedTelephoneNumber.value;

		if (verifiedTelephoneNumber === null) {
			verifiedTelephoneNumber = '';
		}
		return verifiedTelephoneNumber;
	}

	getBirthdate() {
		let birthdate = this.confirmedCaller.callerInformation.birthdate.value;
		console.log("Birthdate:", birthdate);
		let dob = birthdate instanceof Date ? birthdate : birthdate ? new Date(birthdate) : null;
		console.log("Date of birth: ", dob);
		let months = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"];

		return (`${dob.getDate()} ${months[dob.getMonth()]}`);

	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	onNonClientDetailsAdded(data) {
		this.dispatchEvent(new CustomEvent('confirmed-caller', {
			detail: data.detail
		}));
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.call-details-bar{
					display: flex;
					flex-direction: row;
					height:64px;
					margin: 0px;
					border-bottom: 1px solid #dfdfdf;
				}

				.call-label{
					width:208px;
					margin-left:24px;
					margin-top:8px;
					margin-bottom:8px;
				}

				.left-border{
					border-left: 1px solid #dfdfdf;
				}

				.ivr-option{
					width: 228px;
				}

				#label-ivr{
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
					width: 100%;
					margin-top: 8px;
				}

				.horizon-add-caller-details-div{
					width: 648px;
					height: 56px;
					margin-top: 24px;
					margin-left:21.6px;
					margin-right:18.6px;
					background: #DAF5F3;
				}

				#action-icon{
					width:22px;
					height:22px;
					margin-top:17px;
					margin-left:24px;
				}

				#action-label{
					margin-top: 16px;
					color: #08A6B5;
					font-family: "Hind Vadodara";
					font-weight: 800;
					text-decoration:underline;
					align: center;
					padding: 0px 0px 0px 8px;
					cursor: pointer;
				}

				#action-display{
					margin-top; 16px;
					color: #08A6B5;
					font-family: "Hind Vadodara";
					font-weight: 500;
					align: center;
					padding: 0px 0px 0px 0px;
				}

				.image{
					width: 200px;
					height: 200px;
					padding: 0px;
					margin-left: 24px;
					margin-top: 27px;
					background: gainsboro;
					display: inline-block;
				}

				.client-info{
					display: flex;
					flex-direction: row;
				}

				#id-caller-group{
					margin-left:24px; 
					margin-top:27px;
				}

				.fullname{
					height: 30px;
					width: auto;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 20px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 30px;					
				}

				.line{
					width:100%;
					margin-top:30px;
					border-top:1px solid #dfdfdf;"
				}

				#id-search-button{
					margin-right:232px;				
				}

				#id-confirm-button{
					margin-right:12px;
				}
			`];
	}

	render() {
		switch (this.renderMode) {
			case RENDER_MODE.CONFIRM_CALLER:
				return html`
				<capitec-modal
						type="free"
						header="Confirm Caller Details"
						header-align="left">
					<div slot="body">
						${this.renderCallInformation()}
						${this.renderAddCallerDetails()}
						${this.renderConfirmedCaller()} 
					</div>
					<div slot="footer">
						${this.renderFooter()}
					<div> 
				</capitec-modal>
				${this.renderLoadingIndicator()}`;

			case RENDER_MODE.ADD_CALLER_DETAILS:
				return html`${this.renderAddCallerDetailsModal()}`;

			case RENDER_MODE.END_CALL:
				return html`${this.renderEndCallModal()}`;

			case RENDER_MODE.SEARCH_CALLER:
				return html`${this.renderSearchCallerModal()}`;
		}
	}

	renderCallInformation() {
		return html`
			<div class="call-details-bar">
				<horizon-label 
					class="call-label"
					label="Reference Number" 
					value = "${this.voiceReferenceNumber.value}"
					tabindex="${getTabIndex(this.voiceReferenceNumber)}"
					?hidden=${isHidden(this.voiceReferenceNumber)}>
				</horizon-label>
				<div class="ivr-option left-border">
					<horizon-select
						id="label-ivr"
						label="IVR Option Selected"
						display-field="value"
						.items="${this.ivrOption.possibleValues}"
						.value="${this.ivrOption.value}"
						tabindex="${getTabIndex(this.ivrOption)}"
						?hidden=${isHidden(this.ivrOption)}
						@value-changed="${(e) => this._ivrOptionChanged(e)}">
					</horizon-select>
				</div>
				<div class="left-border">
					<horizon-label
						class="call-label"
						label="Incoming Number"
						value="${this.incomingTelephoneNumber.value}"
						tabindex="${getTabIndex(this.incomingTelephoneNumber)}"
						?hidden=${isHidden(this.incomingTelephoneNumber)}>
					</horizon-label>
				<div>
			</div>`
	}

	renderAddCallerDetails() {
		return html`
			<capitec-group layout="horizontal" gap="none"
				class="horizon-add-caller-details-div" 
				?hidden=${isHidden(this.addCallerDetailsButton)}>
					<img src="../images/info.svg" id="action-icon"/>
					<p id="action-label" 
						tabindex="${getTabIndex(this.addCallerDetailsButton)}" 
						@click="${() => this._loadAddCallerDialog()}">
						Add Caller Details
					</p> 
					<p id="action-display">&nbsp;if the caller is calling on another client's behalf</p>
			</capitec-group>`;
	}

	renderConfirmedCaller() {
		return html`
				<!-- <capitec-group layout="grid" gap="clear" columns="uniform" rows="auto"> -->
				<capitec-group class="client-info" layout="horizontal" gap="none">
					<capitec-avatar
						class="image"
						shape = "none"
						value = ""
						tabindex="-1">
					</capitec-avatar>
					<capitec-group id="id-caller-group" layout="grid" gap="clear" columns="uniform" rows="auto"> 
						<capitec-label row = "1" column = "1" colspan="2" class="fullname"
							id="label-value"
							label="${this.callerFullName.value}"
							tabindex="${getTabIndex(this.callerFullName)}"
							?hidden=${isHidden(this.callerFullName)}>
						</capitec-label>
						<horizon-label
							row = "2" column = "1" 
							label="ID Number"
							value="${this.southAfricanIDNumber.value}"
							tabindex="${getTabIndex(this.southAfricanIDNumber)}"
							?hidden=${isHidden(this.southAfricanIDNumber)}>
						</horizon-label>
						<horizon-label
							row = "2" column = "2"
							label="Verified Cellphone Number"
							value="${this.getVerifiedTelephoneNumber()}"
							tabindex="${getTabIndex(this.verifiedTelephoneNumber)}"
							?hidden=${isHidden(this.verifiedTelephoneNumber)}>
						</horizon-label>
						<horizon-label
							row="3" columun = "1"
							label="Lives In"
							value="${this.livesIn.value}"
							tabindex="${getTabIndex(this.livesIn)}"
							?hidden=${isHidden(this.livesIn)}>
						</horizon-label>
						<horizon-label
							row="3" columun = "2"
							label="Language Preference"
							value="${this.getLanguagePreference()}"
							tabindex="${getTabIndex(this.languagePreference)}"
							?hidden=${isHidden(this.languagePreference)}>
						</horizon-label>
						<horizon-label
							row="4" columun = "1"
							label="Birthday"
							value="${this.getBirthdate(this.birthdate)}"
							tabindex="${getTabIndex(this.birthdate)}"
							?hidden=${isHidden(this.birthdate)}>
						</horizon-label>
					</capitec-group>
				</capitec-group>

				<div class="line"></div>
		 `;
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal">
					<!-- class="footer-bar" > -->
				<capitec-button
					id="id-search-button"
					type="clear"
					label="Search Client"
					?hidden=${isHidden(this.searchClientButton)}
					.disabled="${isDisabled(this.searchClientButton)}"
					tabindex="${getTabIndex(this.searchClientButton)}"
					@click="${() => this.renderMode = RENDER_MODE.SEARCH_CALLER}">
				</capitec-button>

				<capitec-button
					type="clear"
					label="End Call Session"
					?hidden=${isHidden(this.endCallSessionButton)}
					.disabled="${isDisabled(this.endCallSessionButton)}"
					tabindex="${getTabIndex(this.endCallSessionButton)}"
					@click="${() => this.renderMode = RENDER_MODE.END_CALL}">
				</capitec-button>

				<capitec-button
					id="id-confirm-button"
					type="primary"
					label="Confirm"
					?hidden=${isHidden(this.confirmButton)}
					.disabled="${isDisabled(this.confirmButton)}"
					tabindex="${getTabIndex(this.confirmButton)}"
					@click="${() => this.onConfirmClick()}">
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
		// TODO: We may need to pass confirmedCaller into addCallerDetails
		return html`
			<horizon-add-caller
				.confirmedCaller="${this.confirmedCaller}"
				.addCallerDialog="${this.addCallerDialog}"
				@on-back="${() => this.renderMode = RENDER_MODE.CONFIRM_CALLER}"
				@call-ended="${(data) => this.onCallCancelled(data)}"
				@caller-added="${(data) => this.onNonClientDetailsAdded(data)}">
			</horizon-add-caller>`;
	}

	renderEndCallModal() {
		return html`
			<end-call-session
				@on-cancel="${() => { this.renderMode = RENDER_MODE.CONFIRM_CALLER }}"
				@on-reason-set="${(reason) => this.onCallCancelled(reason)}">
			</end-call-session>`;
	}

	renderSearchCallerModal() {
		return html`
			<horizon-search-client
				.unverifiedCaller="${this.confirmedCaller}"
				@on-client-identified="${(data) => this.identifiedClient(data)}"
				@call-ended="${(data) => this.onCallCancelled(data)}">
			</horizon-search-client>`;
	}
}

window.customElements.define(`horizon-confirm-caller`, ConfirmCallerDetails)