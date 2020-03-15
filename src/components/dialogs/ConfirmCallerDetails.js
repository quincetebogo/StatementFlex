/*
 *		Horizon Confirm Caller Details Dialog
 *
 */
import { Component, html, css } from 'platform/elements';

import 'platform/components/popups/Modal';
import 'platform/components/data/Table';
import 'platform/components/layouts/Spacer';
import 'platform/components/core/Icon';

import '../AddCallerDetailsComponent';
import '../EndCallSessionReason';
import './SearchClientDetails';

import { StopCardService } from '../../services/StopCardService';
import { isDisabled, isHidden, getTabIndex } from '../../utils/channelServiceUtilities';
import StopCardHelper from '../../helpers/StopCardHelper';

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
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
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

	// Raise an event to return the confirmed caller information once the confirm button has been pressed.
	onConfirmClick() {
		let confirmedCaller = {
			incomingTelephoneNumber: this.incomingTelephoneNumber.value,
			voiceReferenceNumber: this.voiceReferenceNumber.value,
			ivrOption: 'StopCard',
			incidentReferenceNumber: this.incidentReferenceNumber,
			agentTelephoneNumber: this.agentTelephoneNumber,
			callerFullName: this.callerFullName.value,
			verifiedTelephoneNumber: this.verifiedTelephoneNumber.value,
			southAfricanIDNumber: this.southAfricanIDNumber.value,
			livesIn: this.livesIn.value,
			languagePreference: this.languagePreference.value,
			birthdate: this.birthdate.value,
			relationship: ''
			/*
				TODO: should added Caller Details go here?

				probably not but we should perhaps add the fields and initialize them to null
			*/
		}

		let identifyCallerPromise = StopCardHelper.getInstance().identifyCaller(confirmedCaller);

		identifyCallerPromise.then((response) => {

			this.dispatchEvent(new CustomEvent('confirmed-caller', { detail: { confirmedCaller: response } }));
		}, (error) => {

			console.log('Error in fetching Client Info.');
			console.log(error);
		});
	}

	onCallCancelled(reason) {
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

		this.dispatchEvent(new CustomEvent('call-ended', { detail: { confirmedCaller: confirmedCaller, endCallReason: reason.detail.endCallReason } }));
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

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.grid-container{
					grid-row-gap: 0px;
					grid-column-gap: 0px;
					width:690;
					margin:0px;
					padding:0px;
				}
				.main{
					height: 375px;
				}
				.populatedText{
					padding: 8px;
					height: 64px;
					width: 690x;
					border-bottom: 1px solid #dfdfdf;
				}

				.footer-bar{
					width: 678px;
					height: 64px;
					margin: 0px;
					padding: 0px;
					border-top: : 1px solid #dfdfdf;
				}

				.horizon-call{
					display: flex;
					flex-direction: row;
					margin: 0px;
				}

				.horizon-add-caller-details-div{
					display: flex;
					flex-direction: row;
					width: 648px;
					height: 56px;
					margin-top: 24px;
					margin-left:21.6px;
					margin-right:18.6px;
					background: #DAF5F3;
				}

				.ref-call{
					text-align:left;
					padding-left: 24px;
					padding-top: 8px;
					padding-bottom: 8px;
					width:232px;
					height:64px;
					border: 0px;
					margin: 0px;
				}

				.ivr-option{
					width: 223px;
					height: 64px;
					text-align:left;
					border: 0px;
					padding: 8px;
					border-left: 1px solid #dfdfdf;
					border-right: 0px;
					border-top: 0px;
					border-bottom: 0px;
					margin: 0px;
				}

				.incoming-call{
					width:232px;
					height:64px;
					text-align:left;
					padding-left: 24px;
					padding-top: 8px;
					padding-bottom: 8px;
					border-left: 1px solid #dfdfdf;
					border-right: 0px;
					border-top: 0px;
					border-bottom: 0px;
					margin: 0px;
				}

				.client-avatar{
					display: grid;
					grid: 'avatar clientdetails';
					height: 200px;
					width: 433px;
					border: 0px 0px 1px 0px;
					margin-top: 24px;
					margin-bottom: 0px;
					margin-right: 0px;
				}

				.client-info{
					display: grid;
					grid-template-columns: 213px 213px;
					padding-left: 20px;
					text-align: left;
					height: 200px;
					width: 400px;
				}
				.add-caller{
				background-color: #4330;
				}

				.image{
					width: 200px;
					height: 200px;
					align: left;
					padding: 0px 0px 0px 24px;
					margin: 0px 0px 0px 24px;
					background: gainsboro;
				}

				.fullname{
					//  width: 200px;
					//  margin: 0px;
					text-align: left;
					padding: 0px 0px 16px 0px ;
					vertical-align: middle;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
					//transform: translate(-8.0%);
				}

				.label-text{
					height: 30px;
					width: 123px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 30px;
				}

				#ref-number{
					height: 21px;
					width: 112px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 14px;
					line-height: 21px;
				}

				#incoming-num{
					height: 27px;
					width: 104px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
				}

				#label-value{
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
				}

				#label-ivr{
					width: 192px;
					//height: 64px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
				}
				.items{
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
				}

				#action-bar{
					background: #DAF5F3;
					height: 56px;
					width: 690px;
					margin: 16px 16px 16px 24px;
					align: center;
				}

				#action-icon{
					margin: 0px 0px 0px 0px;
					color: #08A6B5;
					align: center;
					padding: 18px 4px 18px 32px;
				}
				#action-label{
					margin:1px 0px 0px 0px;
					color: #08A6B5;
					font-family: "Hind Vadodara";
					font-weight: 800;
					align: center;
					padding: 18px 0px 18px 8px;
				}

				#action-display{
					margin: 0px 0px 0px 0px;
					color: #08A6B5;
					font-family: "Hind Vadodara";
					font-weight: 500;
					align: center;
					padding: 18px 0px 18px 0px;
				}

				#id-confirm-button {
					width: 105px;
				}

				#id-search-client-button {
					margin-left : 12px;
				}

				.footer{
					width: 742px;
					margin:0px;
					padding:0px;
					border-top: 1px solid #dfdfdf;
				}
				u{
					color: #08A6B5;
				}
				.icon{
					align: center;
					padding: 18px 0px 18px 48px;
					color:  #08A6B5;
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
					  <div slot="body" class="main">
						${this.renderCallInformation()}
						${this.renderAddCallerDetails()}
						${this.renderConfirmedCaller()}
					</div>
					${this.renderFooter()}
				</capitec-modal>
				${this.renderLoadingIndicator()}`;

			case RENDER_MODE.ADD_CALLER_DETAILS:
				return html`${this.renderAddCallerDetailsModal()}`;

			case RENDER_MODE.END_CALL:
				return html`${this.renderEndCallModal()}`;
			case RENDER_MODE.SEARCH_CALLER:
				return html`
				${this.renderSearchCallerModal()}`;
		}
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
	renderCallInformation() {
		return html`
			<capitec-group layout = "grid" class="grid-container" >
				<capitec-action-bar class="populatedText" tabindex="-1">
					<div class="horizon-call">
						<div class="ref-call">
							<capitec-label
								id="ref-number"
								label="Reference Number"
								tabindex="-1">
							</capitec-label>
							<capitec-label id="label-value"
								label="${this.voiceReferenceNumber.value}"
								tabindex="${getTabIndex(this.voiceReferenceNumber)}"
								?hidden=${isHidden(this.voiceReferenceNumber)}>
							</capitec-label>
						</div>
						<div class="ivr-option">
							<capitec-select
								id="label-ivr"
								label="ivr option selected"
								display-field="value"
								.items="${this.ivrOption.possibleValues}"
								.value="${this.ivrOption.possibleValues[0]}"
								tabindex="${getTabIndex(this.ivrOption)}"
								?hidden=${isHidden(this.ivrOption)}>
							</capitec-select>
						</div>
						<div class="incoming-call">
							<capitec-label
								id="ref-number"
								label="Incoming Number"
								tabindex="-1">
							</capitec-label>
							<capitec-label id="incoming-num"
								label="${this.incomingTelephoneNumber.value}"
								tabindex="${getTabIndex(this.incomingTelephoneNumber)}"
								?hidden=${isHidden(this.incomingTelephoneNumber)}>
							</capitec-label>
						</div>
					</div >
				</capitec-action-bar >
			</capitec-group >`;
	}

	renderAddCallerDetails() {
		return html`
			<div class="horizon-add-caller-details-div">
				<capitec-icon
					size="default"
					icon="system/info"
					id="action-icon"
					tabindex="-1">
				</capitec-icon>
				<u>
					<capitec-label
						id="action-label"
						label="Add Caller Details"
						tabindex="${getTabIndex(this.addCallerDetailsButton)}"
						?hidden=${isHidden(this.addCallerDetailsButton)}
						@click="${() => this.renderMode = RENDER_MODE.ADD_CALLER_DETAILS}">
				</u>
				<p id="action-display">&nbsp;if the caller is calling on another client's behalf</p>
			</div>`;
	}

	renderConfirmedCaller() {
		return html`
			<div class="client-avatar">
				<capitec-avatar
					class="image"
					shape = "none"
					value = ""
					tabindex="-1">
				</capitec-avatar>
				<div class="client-info">
					<capitec-label class="fullname"
						id="label-value"
						label="${this.callerFullName.value}"
						tabindex="${getTabIndex(this.callerFullName)}"
						?hidden=${isHidden(this.callerFullName)}>
					</capitec-label>
					<div></div>
					<div>
						<capitec-label
							label="ID Number"
							tabindex="-1"
							?hidden=${isHidden(this.southAfricanIDNumber)}>
						</capitec-label>
						<capitec-label
							class="label-text"
							label="${this.southAfricanIDNumber.value}"
							tabindex="${getTabIndex(this.southAfricanIDNumber)}"
							?hidden=${isHidden(this.southAfricanIDNumber)}>
						</capitec-label>
						</div><div>
						<capitec-label
							label="Verified Cellphone Number"
							tabindex="-1"
							?hidden=${isHidden(this.verifiedTelephoneNumber)}>
						</capitec-label>
						<capitec-label
							class="label-text"
							label="${this.getVerifiedTelephoneNumber()}"
							tabindex="${getTabIndex(this.verifiedTelephoneNumber)}"
							?hidden=${isHidden(this.verifiedTelephoneNumber)}>
						</capitec-label>
					</div>
				<div>
					<capitec-label
						label="Lives In"
						tabindex="-1"
						?hidden=${isHidden(this.livesIn)}>
					</capitec-label>
					<capitec-label
						class="label-text"
						label="${this.livesIn.value}"
						tabindex="${getTabIndex(this.livesIn)}"
						?hidden=${isHidden(this.livesIn)}>
					</capitec-label>
				</div>
				<div>
					<capitec-label
						label="Language Preference"
						tabindex="-1">
						?hidden=${isHidden(this.languagePreference)}
					</capitec-label>
					<capitec-label
						class="label-text"
						label="${this.getLanguagePreference()}"
						tabindex="${getTabIndex(this.languagePreference)}"
						?hidden=${isHidden(this.languagePreference)}>
					</capitec-label>
				</div>
				<div>
					<capitec-label
						label="Birthday"
						tabindex="-1">
						?hidden=${isHidden(this.birthdate)}
					</capitec-label>
					<capitec-label id="label-text"
						label="${this.birthdate.value}"
						tabindex="${getTabIndex(this.birthdate)}"
						?hidden=${isHidden(this.birthdate)}>
					</capitec-label>
				</div>
				<div>
				</div>
			</div >
		</div > `;
	}

	renderFooter() {
		return html`
			<capitec-action-bar
					slot = "footer"
					class="footer-bar" >
				<capitec-button
					id="id-search-client-button"
					type="clear"
					label="Search Client"
					?hidden=${isHidden(this.searchClientButton)}
					.disabled="${isDisabled(this.searchClientButton)}"
					tabindex="${getTabIndex(this.searchClientButton)}"
					@click="${() => this.renderMode = RENDER_MODE.SEARCH_CALLER}">
				</capitec-button>				
				<capitec-spacer tabindex="-1"></capitec-spacer>
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
			</capitec-action-bar>`;
	}

	renderAddCallerDetailsModal() {
		// TODO: We may need to pass confirmedCaller into addCallerDetails
		return html`
			<client-add-caller
				@on-back="${() => { this.renderMode = RENDER_MODE.CONFIRM_CALLER }}">
			</client-add-caller>`;
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
				.unverifiedCaller="${this.confirmedCaller}">
			</horizon-search-client>`;
	}
}

window.customElements.define(`horizon-confirm-caller`, ConfirmCallerDetails)