/**
 * The Horizon Confirm Caller Details Dialog is used to confirming caller details of a
 * Capitec Client. This dialog is currently shared between the Stop Card and Insure Needs.
 */
import { Component, css, html } from 'platform/elements';
import { getTabIndex, isDisabled, isHidden } from 'app/utils/channelServiceUtilities';
import { CardService } from 'app/services/CardService';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { InsureService } from 'app/services/InsureService';

import 'platform/components/popups/Modal';
import 'platform/components/data/Table';
import 'platform/components/layouts/Spacer';
import 'platform/components/core/Icon';

import 'app/components/dialogs/common/AddCallerDetails';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/stopCard/StopCardSearchCaller'; // TODO: Remove direct access to stop card dialog
import 'app/components/dialogs/common/VerifyCaller';

import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonSelect';

import 'app/components/common/HorizonCallerInfoBar';
import 'app/components/common/HorizonCallerDialog';


/**
 * 
 */
const RENDER_MODE = {
	CONFIRM_CALLER: 0,
	ADD_CALLER_DETAILS: 1,
	END_CALL: 2,
	STOP_CARD_SEARCH_CALLER: 3,
	SEARCH_CALLER: 4,
	VERIFY_CALLER: 5
};

const HEADER_LABEL = `Confirm Caller Details`;

export class ConfirmCallerDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Property initialization
		this.confirmedCaller = null;
		this.incomingCallDetails = null;
		this.hasInsurance = false;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
		this.isBusy = false;

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.cardService = new CardService(() => this._toggleBusyFlag(), null);
		this.insureService = new InsureService(() => this._toggleBusyFlag(), null);

		this.isBusy = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} confirmedCaller - Information on confirmed client.
	 * @property {Object} incomingCallDetails - Incoming call information
	 *
	 * @readonly
	 * @static
	 * @memberof ConfirmCallerDetails
	 */
	static get properties() {
		return {
			confirmedCaller: { type: Object },
			incomingCallDetails: { type: Object },
			isBusy: { type: Boolean },
			renderMode: { type: Number }
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

	async _onAddCallerDetails() {

		const callDetails = {
			incomingNumber: this.incomingTelephoneNumber,
			voiceReference: this.voiceReferenceNumber,
			ivrOption: this.incomingCallDetails.ivrOption.value,
			incidentNo: this.incidentReferenceNumber,
			agentPhoneNumber: this.agentTelephoneNumber
		};

		const returnValue = await this.cardService.addCallerDetails(callDetails, null);
		this.addCallerDetails = returnValue.result;

		if (returnValue.succeeded) {
			this.renderMode = RENDER_MODE.ADD_CALLER_DETAILS;
		} else {
			// TODO: handle failure to add caller details
		}
	}

	_onAddCallerDetailsReturn(data) {
		this.confirmedCaller.ivrOptionCode = data.detail.ivrOptionValue;
		this.incomingCallDetails.ivrOption.value = data.detail.ivrOptionValue;
		this.incomingCallDetails.ivrOptionCode = data.detail.ivrOptionValue;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	// Raise an event to return the confirmed caller information once the confirm button has been pressed.
	async _onConfirmClick() {
		// Check if client has Insurance Products, and add flag to the horizonStore:
		await this._checkForInsuranceProducts();

		if (this.incomingCallDetails.ivrOptionCode === `StopCard`) {
			this._navigateToStopCard(); 
		} else {
			this.renderMode = RENDER_MODE.VERIFY_CALLER;
		}
	}

	async _checkForInsuranceProducts() {
		const InsuranceCientInfo = {
			IdNumber: this.confirmedCaller.callerInformation.southAfricanIDNumber.value,
			CifNumber: this.confirmedCaller.callerInformation.cifNumber.value,
			isCallerVarified: false
		};

		const returnProducts = await this.insureService.hasInsuranceProducts(InsuranceCientInfo, null);

		if (returnProducts.result.hasInsurance) {
			// Save hasInsuranceProducts value in horizonStore
			this.hasInsurance = true;
		} else {
			// TODO: failure show system error
		}
	}

	async _navigateToStopCard() {
		const confirmedCaller = {
			idNumber: this.southAfricanIDNumber.value,
			incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
			voiceReferenceNumber: this.incomingCallDetails.voiceReferenceNumber,
			ivrOptionCode: this.incomingCallDetails.ivrOption.value,
			incidentReferenceNumber: this.incomingCallDetails.incidentReferenceNumber,
			incidentRecId: this.incomingCallDetails.incidentRecId,
			agentTelephoneNumber: this.incomingCallDetails.agentTelephoneNumber,
			nonClientFullName: ``,
			nonClientCellPhone: ``,
			nonClientIDNumber: ``,
			nonClientRelationship: ``
		};

		const callerInformation = {
			birthdate: this.confirmedCaller.callerInformation.birthdate.value,
			languagePreference: this.confirmedCaller.callerInformation.languagePreference.value,
			livesIn: this.confirmedCaller.callerInformation.livesIn.value,
			name: this.confirmedCaller.callerInformation.name.value,
			southAfricanIDNumber: this.confirmedCaller.callerInformation.southAfricanIDNumber.value,
			verifiedTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber, // TODO: Must be replaced by Verified Number from CS call
			nonClientFullName: ``,
			nonClientCellPhone: ``,
			nonClientIDNumber: ``,
			nonClientRelationship: ``,
			isConfirmed: true,
			verificationStatus: `unverified`,
			is3rdParty: false,
			isNonClient: false,
			hasInsuranceProducts: this.hasInsurance 
		};

		const returnValue = await this.cardService.identifyCaller(confirmedCaller);
		const clientProfileDetails = returnValue.result;

		if (returnValue.succeeded) {
			this.horizonStore.saveState({
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: callerInformation,
				clientProfileDetails: clientProfileDetails
			});
			this.horizonRouter.navigateToStopCard();
		} else {
			this.horizonStore.saveState({
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: callerInformation
			});
			this.horizonRouter.navigateToSystemError();
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

	_onNonClientCaptured(data) {
		this.dispatchEvent(new CustomEvent(`non-client-captured`, { detail: data.detail }));
	}

	_onNonClientDetailsAdded(data) {
		this.dispatchEvent(new CustomEvent(`confirmed-caller`, {
			detail: data.detail
		}));
	}

	_onIvrOptionChanged(e) {
		this.confirmedCaller.ivrOptionCode = e.detail.new;
		this.incomingCallDetails.ivrOption.value = e.detail.new;
		this.incomingCallDetails.ivrOptionCode = e.detail.new;
	}

	_onSearchClick() {
		if (this.incomingCallDetails.ivrOptionCode === `StopCard`) {
			this.renderMode = RENDER_MODE.STOP_CARD_SEARCH_CALLER;
		} else {
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

		// Confirmed caller shortcut referencews
		this.callerInformation = this.confirmedCaller.callerInformation;
		this.callerFullName = this.confirmedCaller.callerInformation.name;
		this.southAfricanIDNumber = this.confirmedCaller.callerInformation.southAfricanIDNumber;
		this.verifiedTelephoneNumber = this.confirmedCaller.callerInformation.verifiedTelephoneNumber;
		this.livesIn = this.confirmedCaller.callerInformation.livesIn;
		this.languagePreference = this.confirmedCaller.callerInformation.languagePreference;
		this.birthdate = this.confirmedCaller.callerInformation.birthdate;

		this.incomingTelephoneNumber = this.incomingCallDetails.incomingTelephoneNumber;
		this.voiceReferenceNumber = this.incomingCallDetails.voiceReferenceNumber;
		this.ivrOption = this.incomingCallDetails.ivrOption;
		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
		this.incidentRecId = this.incomingCallDetails.incidentRecId;
		this.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;

		// TODO: Are we going to persist with these
		this.addCallerDetailsButton = this.confirmedCaller.addCallerDetailsButton;
		this.searchClientButton = this.confirmedCaller.searchClientButton;
		this.endCallSessionButton = this.confirmedCaller.endCallSessionButton;
		this.confirmButton = this.confirmedCaller.confirmButton;
	}

	_getLanguagePreference() {
		let languagePreference = this.confirmedCaller.callerInformation.languagePreference.value;

		if (languagePreference === null) {
			languagePreference = `-`;
		}
		return languagePreference;
	}

	_getVerifiedTelephoneNumber() {
		let verifiedTelephoneNumber = this.confirmedCaller.callerInformation.verifiedTelephoneNumber.value;

		if (verifiedTelephoneNumber === null) {
			verifiedTelephoneNumber = `-`;
		}
		return verifiedTelephoneNumber;
	}

	_getBirthdate() {
		const birthdate = this.birthdate.value;
		let dob = null;

		if (birthdate instanceof Date) {
			dob = birthdate;
		} else if (birthdate) {
			dob = new Date(birthdate);
		} else {
			dob = null;
		}

		const months = [
			`January`, `February`, `March`, `April`, `May`, `June`,
			`July`, `August`, `September`, `October`, `November`, `December`
		];

		return `${dob.getDate()} ${months[dob.getMonth()]}`;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_onEndCall() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

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
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.CONFIRM_CALLER:
				return html`
					<horizon-caller-dialog .incomingCallDetails="${this.incomingCallDetails}" .headerLabel="${HEADER_LABEL}"
						@on-end-call="${() => this._onEndCall()}" @on-need-changed="${(e) => this._onIvrOptionChanged(e)}">
						<div slot="body">
							<capitec-content-box>
								${this.renderAddCallerDetails()}
								${this.renderConfirmedCaller()}
								${this.renderLoadingIndicator()}
							</capitec-content-box>
						</div>
						<div slot="footer">
							${this.renderFooter()}
						</div>
					</horizon-caller-dialog>`;

			case RENDER_MODE.ADD_CALLER_DETAILS:
				return html`${this.renderAddCallerDetailsModal()}`;

			case RENDER_MODE.END_CALL:
				return html`${this.renderEndCallModal()}`;

			case RENDER_MODE.STOP_CARD_SEARCH_CALLER:
				return html`${this.renderStopCardSearchModal()}`;

			case RENDER_MODE.SEARCH_CALLER:
				return html`${this.renderSearchModal()}`;

			case RENDER_MODE.VERIFY_CALLER:
				return html`${this.renderVerifyCallerModal()}`;
			default:
				return html``;
		}
	}

	renderAddCallerDetails() {
		return html`
		<capitec-alert-banner id="id-banner-addcallerdetails" type="warning">
			<capitec-hyperlink label="Add Caller Details" tabindex="${getTabIndex(this.addCallerDetailsButton)}"
				@click="${() => this._onAddCallerDetails()}">
			</capitec-hyperlink>
			if the caller is calling on another client's behalf
		</capitec-alert-banner>`;
	}

	renderConfirmedCaller() {
		return html`
				<capitec-group class="client-info" layout="horizontal" gap="none">
					<capitec-avatar class="image" shape="none" value="" tabindex="-1">
					</capitec-avatar>
					<capitec-group id="id-caller-group" layout="grid" gap="none" columns="auto" rows="auto">
						<capitec-label row="1" column="1" colspan="2" class="fullname" label="${this.callerFullName.value}"
							tabindex="${getTabIndex(this.callerFullName)}" ?hidden=${isHidden(this.callerFullName)}>
						</capitec-label>
						<horizon-label class="client-info-row" row="2" column="1" label="ID Number"
							value="${this.southAfricanIDNumber.value}" tabindex="${getTabIndex(this.southAfricanIDNumber)}"
							?hidden=${isHidden(this.southAfricanIDNumber)}>
						</horizon-label>
						<horizon-label class="client-info-row" row="2" column="2" label="Verified Cellphone Number"
							value="${this._getVerifiedTelephoneNumber()}" tabindex="${getTabIndex(this.verifiedTelephoneNumber)}"
							?hidden=${isHidden(this.verifiedTelephoneNumber)}>
						</horizon-label>
						<horizon-label class="client-info-row" row="3" columun="1" label="Lives In" value="${this.livesIn.value}"
							tabindex="${getTabIndex(this.livesIn)}" ?hidden=${isHidden(this.livesIn)}>
						</horizon-label>
						<horizon-label class="client-info-row" row="3" columun="2" label="Language Preference"
							value="${this._getLanguagePreference()}" tabindex="${getTabIndex(this.languagePreference)}"
							?hidden=${isHidden(this.languagePreference)}>
						</horizon-label>
						<horizon-label class="client-info-row" row="4" columun="1" label="Birthday"
							value="${this._getBirthdate(this.birthdate)}" tabindex="${getTabIndex(this.birthdate)}"
							?hidden=${isHidden(this.birthdate)}>
						</horizon-label>
					</capitec-group>
				</capitec-group>
		 `;
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button id="id-search-button" type="clear" label="Search Client"
					?hidden=${isHidden(this.searchClientButton)} .disabled="${isDisabled(this.searchClientButton)}"
					tabindex="${getTabIndex(this.searchClientButton)}" @click="${() => this._onSearchClick()}">
				</capitec-button>
			
				<capitec-button id="id-confirm-button" type="primary" label="Confirm" ?hidden=${isHidden(this.confirmButton)}
					.disabled="${isDisabled(this.confirmButton)}" tabindex="${getTabIndex(this.confirmButton)}"
					@click="${() => this._onConfirmClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}

	renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	renderAddCallerDetailsModal() {
		return html`
			<horizon-add-caller-details .confirmedCaller="${this.confirmedCaller}"
				.incomingCallDetails="${this.incomingCallDetails}" .addCallerDialog="${this.addCallerDetails}"
				@on-back="${(data) => this._onAddCallerDetailsReturn(data)}"
				@caller-added="${(data) => this._onNonClientDetailsAdded(data)}">
			</horizon-add-caller-details>`;
	}

	renderEndCallModal() {
		return html`
			<horizon-end-call-session @cancel="${() => this.renderMode = RENDER_MODE.CONFIRM_CALLER}"
				.incomingCallDetails="${this.incomingCallDetails}">
			</horizon-end-call-session>`;
	}

	renderStopCardSearchModal() {
		return html`
			<horizon-stop-card-search-caller .incomingCallDetails="${this.incomingCallDetails}"
				@on-client-identified="${(data) => this._onIdentifiedClient(data)}">
			</horizon-stop-card-search-caller>`;
	}

	renderSearchModal() {
		return html`
			<horizon-search-caller .incomingCallDetails="${this.incomingCallDetails}"
				@on-client-identified="${(data) => this._onIdentifiedClient(data)}"
				@non-client-captured="${data => this._onNonClientCaptured(data)}">
			</horizon-search-caller>`;
	}

	renderVerifyCallerModal() {
		const callerInformation = {
			cifNumber: this.confirmedCaller.callerInformation.cifNumber.value,
			birthdate: this.confirmedCaller.callerInformation.birthdate.value,
			languagePreference: this.confirmedCaller.callerInformation.languagePreference.value,
			livesIn: this.confirmedCaller.callerInformation.livesIn.value,
			name: this.confirmedCaller.callerInformation.name.value,
			southAfricanIDNumber: this.confirmedCaller.callerInformation.southAfricanIDNumber.value,
			verifiedTelephoneNumber: this.incomingTelephoneNumber.value,
			nonClientFullName: ``,
			nonClientCellPhone: ``,
			nonClientIDNumber: ``,
			nonClientRelationship: ``,
			isConfirmed: true,
			verificationStatus: `unverified`,
			is3rdParty: false,
			isNonClient: false,
			hasInsuranceProducts: this.hasInsurance
		};

		return html`
			<horizon-verify-caller 
				.incomingCallDetails="${this.incomingCallDetails}" 
				.callerInformation="${callerInformation}"
				@cancel="${() => this.renderMode = RENDER_MODE.CONFIRM_CALLER}">
			</horizon-verify-caller>
		`;
	}
}

window.customElements.define(`horizon-confirm-caller-details`, ConfirmCallerDetails);