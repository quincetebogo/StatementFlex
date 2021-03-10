import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';
import { CallHandleService } from 'app/services/CallHandleService';
import { CallerInformation } from 'app/models/CallerInformation';
import { CardService } from 'app/services/CardService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { InsureService } from 'app/services/InsureService';

import 'platform/components/popups/Modal';
import 'platform/components/data/Table';
import 'platform/components/layouts/Spacer';
import 'platform/components/core/Icon';

import 'app/components/dialogs/common/AddCallerDetails';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/stopCard/StopCardSearchCaller';
import 'app/components/dialogs/common/VerifyCaller';

import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonSelect';

import 'app/components/common/CallerInfoBar';
import 'app/components/common/CallerDialog';


const RENDER_MODE = {
	CONFIRM_CALLER: 0,
	ADD_CALLER_DETAILS: 1,
	END_CALL: 2,
	STOP_CARD_SEARCH_CALLER: 3,
	SEARCH_CALLER: 4,
	VERIFY_CALLER: 5
};

const HEADER_LABEL = `Confirm Caller Details`;

/**
 * The Horizon Confirm Caller Details Dialog is used to confirming caller details of a
 * Capitec Client. This dialog is currently shared between the Stop Card and Insure Needs.
 * 
 * Events Raised 
 * -------------
 * non-client-captured
 * 
 * @export
 * @class ConfirmCallerDetails
 * @extends {Component}
 */
export class ConfirmCallerDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Property initialization
		this.confirmedCaller = null;
		this.incomingCallDetails = null;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
		this.isBusy = false;

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.logger = Logger.getInstance();

		this.cardService = new CardService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.callService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));

		this.isBusy = false;
		this.errorMessage = ``;
		this.errorCount = 0;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} confirmedCaller Information on confirmed client.
	 * @property {Object} incomingCallDetails Incoming call information
	 *
	 * @readonly
	 * @static
	 * @memberof ConfirmCallerDetails
	 */
	static get properties() {
		return {
			confirmedCaller: { type: Object },
			incomingCallDetails: { type: Object },

			isBusy: { attribute: false },
			renderMode: { attribute: false },
			errorMessage: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	connectedCallback() {
		super.connectedCallback();
		this._initCallerInformation();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _addCallerDetailsClick() {
		const callDetails = {
			incomingNumber: this.incomingCallDetails.incomingTelephoneNumber,
			voiceReference: this.incomingCallDetails.voiceReferenceNumber,
			ivrOption: this.incomingCallDetails.ivrOption.value,
			incidentNo: this.incomingCallDetails.incidentReferenceNumber,
			agentPhoneNumber: this.incomingCallDetails.agentTelephoneNumber
		};

		const returnValue = await this.cardService.addCallerDetails(callDetails);

		if (returnValue.succeeded) {
			this.addCallerDetails = returnValue.result;
			this.renderMode = RENDER_MODE.ADD_CALLER_DETAILS;
		}
	}

	_addCallerDetailsCancelled(event) {
		this.confirmedCaller.ivrOptionCode = event.detail.ivrOptionValue;
		this.incomingCallDetails.ivrOption.value = event.detail.ivrOptionValue;
		this.incomingCallDetails.ivrOptionCode = event.detail.ivrOptionValue;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	_addCallerDetailsConfirmed(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this._navigateToLandingPage();
	}

	_confirmClick() {
		if (this.incomingCallDetails.ivrOptionCode === `StopCard`) {
			this._navigateToLandingPage();
		} else {
			this._verifyCaller();
		}
	}

	async _verifyCaller() {
		if (await this._setAvailabilityFlags()) {
			this.renderMode = RENDER_MODE.VERIFY_CALLER;
		}
	}

	_identifiedClient(event) {
		// After a search we need to replace whatever we might have had for the confirmed caller with 
		// the results of the search
		// the results of the search
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.confirmedCaller = event.detail.confirmedCaller;

		// TODO: Do we lose the added caller details if we go there first before doing a search???
		this._initCallerInformation();

		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}


	/**
	 * Non-client information has been captured on the general need search dialog
	 *
	 * @param {Object} event Event details contain the non-client information captured from the search dialog
	 * @returns {undefined}
	 * @memberof ConfirmCallerDetails
	 */
	_nonClientCaptured(event) {
		this.dispatchEvent(new CustomEvent(`non-client-captured`, { detail: event.detail }));
	}

	_otherNeedSelected(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.renderMode = RENDER_MODE.SEARCH_CALLER;
	}

	_stopCardNeedSelected(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.renderMode = RENDER_MODE.STOP_CARD_SEARCH_CALLER;
	}

	_needChanged(event) {
		this.confirmedCaller.ivrOptionCode = event.detail.new;
		this.incomingCallDetails.ivrOption.value = event.detail.new;
		this.incomingCallDetails.ivrOptionCode = event.detail.new;
	}

	_searchClick() {
		if (this.incomingCallDetails.ivrOptionCode === `StopCard`) {
			this.renderMode = RENDER_MODE.STOP_CARD_SEARCH_CALLER;
		} else {
			this.renderMode = RENDER_MODE.SEARCH_CALLER;
		}
	}

	_verificationCancelled(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	_verificationSkipped(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
		this._navigateToLandingPage();
	}

	_clientVerified(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this._navigateToLandingPage();
	}

	_onEndCall() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	// --------------
	// PUBLIC METHODS
	// --------------


	// ---------------
	// PRIVATE METHODS
	// ---------------
	_initCallerInformation() {
		// This is the callerInformation object that will be persisted to state.
		this.callerInformation = new CallerInformation(
			this.confirmedCaller.cifNumber,
			this.confirmedCaller.birthdate,
			this.confirmedCaller.languagePreference,
			this.confirmedCaller.livesIn,
			this.confirmedCaller.name,
			this.confirmedCaller.southAfricanIDNumber,
			this.confirmedCaller.verifiedTelephoneNumber,
			``,
			``,
			``,
			``,
			true,
			`unverified`,
			false,
			false,
			false,
			false,
			false
		);
	}

	async _navigateToLandingPage() {
		if (!await this._setAvailabilityFlags()) {
			// The channel service calls to set the availability flags failed.
			// Do nothing here. The error handler for the channel service calls will do the necessary.
			return;
		}

		if (this.incomingCallDetails.ivrOption.value === `StopCard`) {
			const confirmedCaller = {
				idNumber: this.callerInformation.southAfricanIDNumber,
				incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				voiceReferenceNumber: this.incomingCallDetails.voiceReferenceNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOption.value,
				incidentReferenceNumber: this.incomingCallDetails.incidentReferenceNumber,
				incidentRecId: this.incomingCallDetails.incidentRecId,
				agentTelephoneNumber: this.incomingCallDetails.agentTelephoneNumber,
				nonClientFullName: this.callerInformation.nonClientFullName,
				nonClientCellPhone: this.callerInformation.nonClientCellPhone,
				nonClientIDNumber: ``,
				nonClientRelationship: this.callerInformation.nonClientRelationship
			};

			const returnValue = await this.cardService.identifyCaller(confirmedCaller);

			if (!returnValue.succeeded) {
				// The error handler will take over. We don't need to do anything more in this routine
				return; 
			}

			this.horizonStore.saveState({ clientProfileDetails: returnValue.result });
		};

		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	}

	async _checkForInsuranceProducts(southAfricanIDNumber, cifNumber, isCallerVerified) {
		const InsuranceCientInfo = {
			IdNumber: southAfricanIDNumber,
			CifNumber: cifNumber,
			isCallerVarified: isCallerVerified
		};

		const returnValue = await this.insureService.hasInsuranceProducts(InsuranceCientInfo);

		return returnValue.result.hasInsurance;
	}

	async _setAvailabilityFlags() {
		let flagsSet = false;

		/* This will be put back. Insure is not part of the first release

			Error handling needs to be re-assessed. This function currently always returns true but
			may need to return false and trigger the display of a system error once additional 
			flags (insurance are checked)

			this.callerInformation.hasInsuranceProducts = await this._checkForInsuranceProducts(
				this.confirmedCaller.southAfricanIDNumber, 
				this.confirmedCaller.cifNumber,
				false
			);
		*/

		// Check if the client has digital channels
		// Disabled error handler because if this call fails we will still attempt to help the client.
		// It will just be with XDS Security Questions
		const returnValue = await this.callService.digitalVerificationChannelsAvailable(this.callerInformation.cifNumber, () => true);

		if (returnValue.succeeded) {
			this.callerInformation.hasDigitalChannels = returnValue.result;
			flagsSet = true;
		} else {
			// Function will indicate success (i.e. and digital channels is defaulted to on)
			// When we do other calls to set other flags (hasInsuranceProducts we may prefer to show a system error and return false)
			flagsSet = true; 
			this.callerInformation.hasDigitalChannels = true;
			this.logger.log(`error`, `Could not determine if digital channels are available. Defaulting to available.`);
		}

		// Save above flags to state
		const state = {
			incomingCallDetails: this.incomingCallDetails,
			callerInformation: this.callerInformation,
			canCloseIncident: false
		};

		this.horizonStore.saveState(state);

		return flagsSet;
	}

	_handleChannelServiceError(ex) {
		this.errorMessage = `System error. Please try again.`;
		this.errorCount++;

		if (this.errorCount > 2) {
			this.horizonStore.saveState({
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: this.callerInformation
			});
			this.horizonRouter.navigateToSystemError();
		}
		return true;
	}

	_getLanguagePreference() {
		let languagePreference = this.confirmedCaller.languagePreference;

		if (!languagePreference || languagePreference === "NOT_DEFINED") {
			languagePreference = `-`;
		}
		return languagePreference;
	}

	_getVerifiedTelephoneNumber() {
		let verifiedTelephoneNumber = this.confirmedCaller.verifiedTelephoneNumber;

		if (verifiedTelephoneNumber === null) {
			verifiedTelephoneNumber = `-`;
		}
		return verifiedTelephoneNumber;
	}

	_getBirthdate() {
		const birthdate = this.confirmedCaller.birthdate;
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

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-caller-dialog {
					--horizon-modal-footer-padding: 16px 16px 16px 0px;
				}
				capitec-content-box{
					height: ${this.errorMessage = `` ? css`332px` : css`364`};
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 17px;
				}
				#id-banner-addcallerdetails{
					--theme-alert-banner-warning-border: 1px solid rgba(228,124,40,0.1);
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-layout-gap-spacing: 28px;
					--theme-alert-banner-height: 48px;
				}
				capitec-avatar {
					--theme-avatar-size-large: 200px;
					--theme-layout-gap-spacing: 25px;
				}
				capitec-label[type="title"] {
					--theme-label-title-font-weight: 600;
					line-height: 28px;
				}
				.client-info-row {
					height: 56px;
					width: 216px;
					justify-content: center;

					--horizon-label-text-height: 16px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 16px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3E4547;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-margin-top: 4px;
				}
				.footer-group > capitec-button:first-child {
					--theme-layout-gap-spacing: 16px;
					--theme-button-padding-right: 15px;
					--theme-button-padding-left: 15px;
				}
				.footer-group > capitec-button {
					--theme-button-padding-top: 13px;
					--theme-button-padding-bottom: 12px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.CONFIRM_CALLER:
				return html`
					<horizon-caller-dialog 
							.incomingCallDetails="${this.incomingCallDetails}" 
							.isNeedSelectable=${true}
							.headerLabel="${HEADER_LABEL}" 
							@on-end-call="${() => this._onEndCall()}"
							@on-need-changed="${(e) => this._needChanged(e)}">
						<div slot="body">
							<capitec-content-box>
								${this._renderError()}
								${this._renderAddCallerDetails()}
								${this._renderConfirmedCaller()}
								${this._renderLoadingIndicator()}
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

	_renderError() {
		return this.errorMessage === `` 
			? html``
			: html`
				<capitec-alert-banner 
					type="unsuccessful-red"
					label=${this.errorMessage}>
				</capitec-alert-banner>`;
	}

	_renderAddCallerDetails() {
		return html`
		<capitec-alert-banner id="id-banner-addcallerdetails" type="warning">
			<capitec-hyperlink label="Add Caller Details" 
				@click="${() => this._addCallerDetailsClick()}">
			</capitec-hyperlink>
			if the caller is calling on another client's behalf
		</capitec-alert-banner>`;
	}

	_renderConfirmedCaller() {
		return html`
				<capitec-group class="client-info" layout="horizontal" gap="clear">
					<capitec-avatar 
						shape="square"
						icon="../../../images/common/avatar.svg">
					</capitec-avatar>
					<capitec-group id="id-caller-group" layout="grid" gap="none" columns="auto" rows="auto">
						<capitec-label row="1" column="1" colspan="2" type="title"
							label="${this.confirmedCaller.name}">
						</capitec-label>
						<horizon-label class="client-info-row" row="2" column="1" 
							label="ID Number"
							value="${this.confirmedCaller.southAfricanIDNumber}">
						</horizon-label>
						<horizon-label class="client-info-row" row="2" column="2" 
							label="Verified Cellphone Number"
							value="${this._getVerifiedTelephoneNumber()}">
						</horizon-label>
						<horizon-label class="client-info-row" row="3" columun="1" 
							label="Lives In" 
							value="${this.confirmedCaller.livesIn}">
						</horizon-label>
						<horizon-label class="client-info-row" row="3" columun="2" 
							label="Language Preference"
							value="${this._getLanguagePreference()}">
						</horizon-label>
						<horizon-label class="client-info-row" row="4" columun="1" 
							label="Birthday"
							value="${this._getBirthdate(this.birthdate)}" >
						</horizon-label>
					</capitec-group>
				</capitec-group>
		 `;
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal" halign="right" valign="top" gap="clear" class="footer-group">
				<capitec-button 
					id="id-search-button" 
					type="clear" 
					label="Search Client"
					@click="${() => this._searchClick()}"
					tabindex="2">
				</capitec-button>
			
				<capitec-button 
					id="id-confirm-button" 
					type="primary" 
					label="Confirm"
					@click="${() => this._confirmClick()}"
					tabindex="1"
					autofocus>
				</capitec-button>
			</capitec-group>`;
	}

	_renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	renderAddCallerDetailsModal() {
		return html`
			<horizon-add-caller-details .confirmedCaller="${this.confirmedCaller}"
				.incomingCallDetails="${this.incomingCallDetails}"
                .addCallerDialog="${this.addCallerDetails}"
				@cancel="${(e) => this._addCallerDetailsCancelled(e)}"
                @confirm=${(e) => this._addCallerDetailsConfirmed(e)}>
			</horizon-add-caller-details>`;
	}

	renderEndCallModal() {
		return html`
			<horizon-end-call-session 
				.incomingCallDetails="${this.incomingCallDetails}"
				endCallContext="ConfirmClient"
				@cancel="${() => this.renderMode = RENDER_MODE.CONFIRM_CALLER}">
			</horizon-end-call-session>`;
	}

	renderStopCardSearchModal() {
		return html`
			<horizon-stop-card-search-caller
                .incomingCallDetails="${this.incomingCallDetails}"
				@client-identified="${(event) => this._identifiedClient(event)}"
				@other-need-selected="${(event) => this._otherNeedSelected(event)}"
                >
			</horizon-stop-card-search-caller>`;
	}

	renderSearchModal() {
		return html`
			<horizon-search-caller
                .incomingCallDetails="${this.incomingCallDetails}"
				@client-identified="${(data) => this._identifiedClient(data)}"
				@non-client-captured="${data => this._nonClientCaptured(data)}"
				@stop-card-need-selected="${(event) => this._stopCardNeedSelected(event)}">
			</horizon-search-caller>`;
	}

	renderVerifyCallerModal() {
		return html`
			<horizon-verify-caller
                .incomingCallDetails="${this.incomingCallDetails}"
                .callerInformation="${this.callerInformation}"
				@cancel="${(event) => this._verificationCancelled(event)}" 
                @skip="${(event) => this._verificationSkipped(event)}"
				@verified="${(event) => this._clientVerified(event)}">
			</horizon-verify-caller>
		`;
	}
}

window.customElements.define(`horizon-confirm-caller-details`, ConfirmCallerDetails);