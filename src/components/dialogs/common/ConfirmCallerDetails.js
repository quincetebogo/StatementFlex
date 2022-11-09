import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';
import { CallHandleService } from 'app/services/CallHandleService';
import { CallerInformation } from 'app/models/CallerInformation';
import { CardService } from 'app/services/CardService';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { IDCallerEvents } from 'app/constants/telemetry/events/IdentifyCaller';
import { ITAChannelService } from 'app/services/ITAChannelService';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { InsureService } from 'app/services/InsureService';
import { RoleManager } from 'app/shell/RoleManager';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

import 'platform/components/popups/Modal';
import 'platform/components/data/Table';
import 'platform/components/layouts/Spacer';
import 'platform/components/core/Icon';

import 'app/components/dialogs/common/AddCallerDetails';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/stopCard/StopCardSearchCaller';
import 'app/components/dialogs/common/verifyCaller/VerifyCaller';

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

const branchBannerMessage = ` Branch calling in on behalf of the client`;

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

		this.eventAggregator = EventAggregator.getInstance();
		this.logger = Logger.getInstance();

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this._telemetry = HorizonTelemetry.instance;
		this.roleManager = RoleManager.getInstance();
		this.horizonIncidentManager = HorizonIncidentManager.getInstance();

		this.cardService = new CardService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.callService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.incidentService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.itaChannelService = new ITAChannelService(() => this._toggleBusyFlag(), () => true);

		// Property initialization
		this.confirmedCaller = null;
		this.incomingCallDetails = null;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
		this.isBusy = false;
		this.errorMessage = ``;
		this.errorCount = 0;
		this.cpNumber = ``;
		this.clientType = -1;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} confirmedCaller Information on confirmed client.
	 * @property {Object} incomingCallDetails Incoming call information
	 * @property {Object} incidentDetails Incident details
	 *
	 * @readonly
	 * @static
	 * @memberof ConfirmCallerDetails
	 */
	static get properties() {
		return {
			confirmedCaller: { type: Object },
			incomingCallDetails: { type: Object },
			incidentDetails: { type: Object },

			cpNumber: { attribute: false },
			clientType: { attribute: false },
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

		this._telemetry.startSpan(IDCallerEvents.CONFIRM_CALLER, {
			"screen": TelemetryScreen.CONFIRM_CALLER,
			"initial-primary-need": null,
			"initial-specific-need": this.incomingCallDetails.ivrOption.value,
			"initial-client-cif": this.confirmedCaller.cifNumber
		});
		this._initCallerInformation();
	}

	disconnectedCallback() {
		this._telemetry.endSpan(IDCallerEvents.CONFIRM_CALLER, {
			"screen": TelemetryScreen.CONFIRM_CALLER
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_addCallerDetailsClick() {
		this._telemetry.logEvent(IDCallerEvents.CONFIRM_CALLER_ADD_CALLER_CLICK, {
			"screen": TelemetryScreen.CONFIRM_CALLER,
			"next-screen": TelemetryScreen.ADD_CALLER_DETAILS
		});

		this.renderMode = RENDER_MODE.ADD_CALLER_DETAILS;
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

		this._confirmClick();
	}

	async _confirmClick() {
		this._telemetry.logEvent(IDCallerEvents.CONFIRM_CALLER_CONFIRM_CLICK, {
			"screen": TelemetryScreen.CONFIRM_CALLER,
			"next-screen": this.incomingCallDetails.ivrOption.value === `StopCard` ? TelemetryScreen.STOP_CARD : TelemetryScreen.VERIFY_CALLER,
			"confirmed-primary-need": null,
			"confirmed-specific-need": this.incomingCallDetails.ivrOptionCode,
			"confirmed-client-cif": this.callerInformation.cifNumber
		});
		
		await this._updateClientNonClientDetails();

		/* Navigate to Favourites landing by skipping verification flow 
		 * Scenario 1: When branch consultant is calling in and client is not present at branch
		 * Scenario 2: When branch consultant is calling in and an agent is with Helpdesk role
		 */

		if (this.callerInformation.isBranchConsultant && (this.roleManager.isHelpDeskAgent || !this.confirmedCaller.isClientPresent)) {
			this._navigateToLandingPage();
			return;
		}
		
		// Navigation based on need selected
		const stopCard = () => this._navigateToLandingPage();
		const productEnquiry = () => this._navigateToLandingPage();
		const transact = () => this._verifyCaller();

		const clientNeed = {
			StopCard: stopCard,
			ProductEnquiry: productEnquiry,
			Transact: transact
		};

		clientNeed[this.incomingCallDetails.ivrOptionCode]();

	}

	async _verifyCaller() {
		if (await this._setAvailabilityFlags()) {
			this.renderMode = RENDER_MODE.VERIFY_CALLER;
		}
	}

	_identifiedClient(event) {
		// After a search we need to replace whatever we might have had for the confirmed caller with 
		// the results of the search
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.confirmedCaller = event.detail.confirmedCaller;
		this.confirmedCaller.isBranchConsultant = false;

		// TODO: Do we lose the added caller details if we go there first before doing a search???
		this._initCallerInformation();
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;

		// Dispatching an event to update the confirmed caller in landing page
		this.dispatchEvent(new CustomEvent(`client-identified`, {
			detail: event.detail
		}));
	}

	_branchCaptured(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.confirmedCaller = event.detail.confirmedCaller;
		this.callerInformation.isBranchConsultant = true;
		this.cpNumber = event.detail.cpNumber;
		this.clientType = event.detail.clientType;
		this._initCallerInformation();
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;

		// Dispatching an event to update the confirmed caller in landing page
		this.dispatchEvent(new CustomEvent(`branch-captured`, {
			detail: event.detail
		}));
	}

	/**
	 * Non-client information has been captured on the general need search dialog
	 *
	 * @param {Object} event Event details contain the non-client information captured from the search dialog
	 * @returns {undefined}
	 * @memberof ConfirmCallerDetails
	 */
	_nonClientCaptured(event) {
		this.confirmedCaller.isBranchConsultant = false;
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
		const ivrOptionCode = event.detail.new;

		this.confirmedCaller.ivrOptionCode = ivrOptionCode;
		this.incomingCallDetails.ivrOption.value = ivrOptionCode;
		this.incomingCallDetails.ivrOptionCode = ivrOptionCode;

		this.horizonIncidentManager.setCurrentNeed(ivrOptionCode);
	}

	_searchClick() {
		this._telemetry.logEvent(IDCallerEvents.CONFIRM_CALLER_SEARCH_CLICK, {
			"screen": TelemetryScreen.CONFIRM_CALLER,
			"next-screen": TelemetryScreen.SEARCH_CLIENT
		});

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
		this._telemetry.logEvent(IDCallerEvents.CONFIRM_CALLER_END_CALL_CLICK, {
			"screen": TelemetryScreen.CONFIRM_CALLER,
			"next-screen": TelemetryScreen.END_CALL
		});
		
		this.renderMode = RENDER_MODE.END_CALL;
	}
	
	// Tooltip is displayed only for a long client's name where the overflowing text is hidden
	_displayTooltip(e) {
		const tooltip = this.shadowRoot.getElementById(`long-name`);
		const clientName = this.shadowRoot.getElementById(`client-name`);

		if (e.target.scrollWidth > e.target.offsetWidth) {
			tooltip.style.display = `flex`;
			clientName.style.display = `none`;
		}
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
			this.confirmedCaller.cifNumber, // cif
			this.confirmedCaller.birthdate, // birthdate
			this.confirmedCaller.languagePreference, // languagePreference
			this.confirmedCaller.livesIn, // livesIn
			this.confirmedCaller.name, // name
			this.confirmedCaller.title,
			this.confirmedCaller.southAfricanIDNumber, // SA id
			this.confirmedCaller.verifiedTelephoneNumber, // verified number
			``, // nonclient firstname
			``, // nonclient surname
			``, // nonclient fullname
			``, // nonclient cellphone
			``, // nonclient ID number
			``, // nonclient relationship
			true, // isConfirmed
			this.confirmedCaller.isClientVerifiedInBranch ? `verified` : `unverified`, // verificationStatus
			false, // verificationToastDisplayed
			false, // isThirdParty
			false, // isNonClient
			false, // hasInsuranceProducts
			false, // hasDigitalChannels
			{ itaAttempts: 0, sqAttempts: 0 }, 
			this.confirmedCaller.isBranchConsultant, // isBranchConsultant
			this.confirmedCaller.isClientPresent, // isClientPresent
			this.confirmedCaller.isClientVerifiedInBranch ? `ITA` : ``,
			this.confirmedCaller.firstName,
			this.confirmedCaller.middleName1,
			this.confirmedCaller.middleName2,
			this.confirmedCaller.middleName3,
			this.confirmedCaller.lastName,
			this.confirmedCaller.initials,
			this.confirmedCaller.identifiedBy,
			``, // client's registered email ID
			this.confirmedCaller.profilePhoto,
			this.confirmedCaller.gender,
			this.confirmedCaller.branchCallerID,
			this.confirmedCaller.branchCode
		);
	}

	async _navigateToLandingPage() {
		if (!await this._setAvailabilityFlags()) {
			// The channel service calls to set the availability flags failed.
			// Do nothing here. The error handler for the channel service calls will do the necessary.
			return;
		}

		if (this.incomingCallDetails.ivrOption.value === `StopCard`) {
			
			const returnValue = await this.cardService.identifyCaller(this.callerInformation, this.incomingCallDetails, this.horizonIncidentManager.getIncidentDetails());

			if (!returnValue.succeeded) {
				// The error handler will take over. We don't need to do anything more in this routine
				return;
			}

			const screenDetails = this.horizonStore.getScreenDetails();
			screenDetails.cards = returnValue.result && returnValue.result.cards;
			this.horizonStore.setScreenDetails(screenDetails);
		};

		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	}

	async _checkForInsuranceProducts(southAfricanIDNumber, cifNumber, isCallerVerified) {
		const insuranceClientInfo = {
			'idNumber': southAfricanIDNumber,
			'cifNumber': cifNumber,
			'isCallerVerified': isCallerVerified
		};

		const returnValue = await this.insureService.hasInsuranceProducts(insuranceClientInfo);

		return returnValue.result.hasInsurance;
	}

	async _setAvailabilityFlags() {
		let flagsSet = false;

		this.callerInformation.hasInsuranceProducts = true;

		// Check if the client has digital channels
		// Disabled error handler because if this call fails we will still attempt to help the client.
		// It will just be with XDS Security Questions
		const returnValue = await this.itaChannelService.digitalVerificationChannelsAvailable(this.callerInformation.cifNumber, () => true);

		if (returnValue.succeeded) {
			this.callerInformation.hasDigitalChannels = returnValue.result;
			flagsSet = true;
		} else {
			// Function will indicate success (i.e. and digital channels is defaulted to on)
			// When we do other calls to set other flags (hasInsuranceProducts we may prefer to show a system error and return false)
			flagsSet = true;
			this.callerInformation.hasDigitalChannels = true;
			this.logger.log(`error`, `Could not determine if digital channels are available. Defaulting to available.`, `_setAvailabilityFlags`, returnValue.correlationId);
		}
		
		this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
		this.horizonStore.setCallerInformation(this.callerInformation);

		return flagsSet;
	}

	_handleChannelServiceError(ex) {
		this.errorMessage = `System error. Please try again.`;
		this.errorCount++;

		if (this.errorCount > 2) {
			this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
			this.horizonStore.setCallerInformation(this.callerInformation);
			this.horizonRouter.navigateToSystemError();
		}
		return true;
	}

	_getLanguagePreference() {
		let languagePreference = this.confirmedCaller.languagePreference;

		if (!languagePreference || languagePreference === `NOT_DEFINED`) {
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
			dob = new Date(birthdate) || Date.parse(birthdate);
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

	async _updateClientNonClientDetails() {
		const currentIncident = this.horizonIncidentManager.getCurrentIncident();

		if (!currentIncident.incidentRecId || currentIncident.incidentRecId === `0`) {
			this.logger.log(`error`, `There is no incident available against which to record the client/ non-client details`, `_updateClientNonClientDetails`);
			return;
		}

		// Updating client details to Incident at Strack
		let returnValue = await this.incidentService.updateIncidentClientDetails(this.callerInformation.cifNumber, this.incidentDetails.incidentRecId);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to update client details on incident due to a system error`, `_updateClientNonClientDetails`, returnValue.correlationId);
		}

		// Updating non-client details to Incident at Strack
		if (this.callerInformation.is3rdParty) {
			const nonClientDetails = {
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode,
				incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				firstName: this.callerInformation.nonClientFirstName,
				surname: this.callerInformation.nonClientSurName,
				cellPhone: this.callerInformation.nonClientCellPhone
			};

			returnValue = await this.incidentService.updateIncidentNonClientDetails(this.incidentDetails.incidentRecId, nonClientDetails);

			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Unable to update non-client details on incident due to a system error`, `_updateClientNonClientDetails`, returnValue.correlationId);
			}
		}
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-caller-dialog {
					--horizon-modal-footer-padding: 16px;
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
					--theme-toast-icon-margin: 0px 18px 0px 16px;
					--theme-hyperlink-font-weight: 600;
					--theme-layout-gap-spacing: 28px;
				}
				#id-banner-addcallerdetails > section {
					margin-left: 3px;
				}
				capitec-avatar {
					--theme-avatar-size-large: 200px;
					--theme-layout-gap-spacing: 25px;
				}
				capitec-label[type="title"] {
					--theme-text-select: text;
					--theme-label-title-font-weight: 600;
					line-height: 28px;
					display: inline-block;
					width: 385px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
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
				capitec-tooltip {
					display: none;
					height: 27px;
					--theme-tooltip-font-family: 'Hind Vadodara';
					--theme-tooltip-font-size: 14px;
					--theme-tooltip-line-height: 20px;
					--theme-tooltip-border-radius: 2px;
					--theme-layout-gap-spacing: 0px;
				}
				img {
					height: 200px;
					width: 200px;
					padding: 5px;
					border: 2px solid #E1E1E1;
					--theme-layout-gap-spacing: 25px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderLoadingIndicator()}
			${this._renderContent()}
		`;
	}

	_renderContent() {
		switch (this.renderMode) {
			case RENDER_MODE.CONFIRM_CALLER:
				return html`
					<horizon-caller-dialog
						data-automation-id="confirm-caller-details-dialog"
						.incomingCallDetails="${this.incomingCallDetails}"
						.incidentDetails="${this.incidentDetails}"
						.isNeedSelectable=${true}
						headerLabel="${this.callerInformation.isBranchConsultant ? `Confirm Client` : `Confirm Caller`}"
						@on-end-call="${() => this._onEndCall()}"
						@on-need-changed="${(e) => this._needChanged(e)}">
							<div slot="body">
								<capitec-content-box>
									${this._renderError()}
									${this._renderAlertBanner()}
									${this._renderConfirmedCaller()}
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
				<horizon-alert-banner 
					data-automation-id="confirm-caller-details-error-banner"
					type="error"
					label=${this.errorMessage}>
				</horizon-alert-banner>`;
	}

	_renderAlertBanner() {
		if (!this.confirmedCaller.isBranchConsultant) {
			return html`
				<horizon-alert-banner 
					id="id-banner-addcallerdetails" 
					data-automation-id="confirm-caller-details-add-caller-banner"
					type="warning"
					layout="horizontal">
						<capitec-hyperlink 
							label="Add Caller Details"
							data-automation-id="confirm-caller-details-add-caller-details"
							@click="${() => this._addCallerDetailsClick()}">
						</capitec-hyperlink>
						<section>if the caller is calling on another client's behalf</section>
				</horizon-alert-banner>`;
		} 

		return html`
			<horizon-alert-banner 
				id="id-banner-addcallerdetails" 
				data-automation-id="confirm-caller-details-branch-banner"
				type="warning"
				header="Notify: "
				label="${branchBannerMessage}">
			</horizon-alert-banner>`;
	}

	_renderConfirmedCaller() {
		return html`
			<capitec-group class="client-info" layout="horizontal" gap="clear">
				${this._renderClientProfileImage()}
				<capitec-group id="id-caller-group" layout="grid" gap="none" columns="auto" rows="auto">
					<capitec-label 
						id="client-name" 
						data-automation-id="confirm-caller-details-client-name"
						type="title"
						row="1" column="1" colspan="2"
						label="${this.confirmedCaller.name}"
						@mouseover="${(e) => this._displayTooltip(e)}">
					</capitec-label>
					<capitec-tooltip
						id="long-name" 
						data-automation-id="confirm-caller-details-client-name-tooltip"
						row="1" column="1" colspan="2" 
						message="${this.confirmedCaller.name}"
						position="bottom">
						<capitec-label
							data-automation-id="confirm-caller-details-client-name-tooltip-label"
							type="title"
							label="${this.confirmedCaller.name}"
							@mouseover="${(e) => this._displayTooltip(e)}">
						</capitec-label>
					</capitec-tooltip>
					<horizon-label class="client-info-row" row="2" column="1" 
						data-automation-id="confirm-caller-details-id-number"
						label="ID Number"
						value="${this.confirmedCaller.southAfricanIDNumber}">
					</horizon-label>
					<horizon-label class="client-info-row" row="2" column="2" 
						data-automation-id="confirm-caller-details-verified-phone-number"
						label="Verified Cellphone Number"
						value="${this._getVerifiedTelephoneNumber()}">
					</horizon-label>
					<horizon-label class="client-info-row" row="3" columun="1" 
						data-automation-id="confirm-caller-details-lives-in"
						label="Lives In" 
						value="${this.confirmedCaller.livesIn}">
					</horizon-label>
					<horizon-label class="client-info-row" row="3" columun="2" 
						data-automation-id="confirm-caller-details-language-preference"
						label="Language Preference"
						value="${this._getLanguagePreference()}">
					</horizon-label>
					<horizon-label class="client-info-row" row="4" columun="1" 
						data-automation-id="confirm-caller-details-birthday"
						label="Birthday"
						value="${this._getBirthdate(this.birthdate)}" >
					</horizon-label>
				</capitec-group>
			</capitec-group>
		 `;
	}

	_renderClientProfileImage() {
		return this.confirmedCaller.profilePhoto
		? html`<img src="data:image/jpg;base64,${this.confirmedCaller.profilePhoto}"/>`
		: html`
			<capitec-avatar 
					shape="square"
					icon="/images/common/avatar.svg">
			</capitec-avatar>
		`;
	}

	renderFooter() {
		return html`
			<capitec-group 
			layout="horizontal" 
			halign="left" 
			valign="center" 
			gap="none" 
			class="footer-group">
				<capitec-button
					data-automation-id="confirm-caller-details-back"
					class="footer-back"
					type="clear"
					label="Back"
					@click="${() => this._searchClick()}"
					?hidden="${!this.confirmedCaller.isBranchConsultant}">
				</capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-button 
					id="id-search-button" 
					data-automation-id="confirm-caller-details-search"
					type="clear" 
					label="Search Client"
					@click="${() => this._searchClick()}"
					?hidden="${this.confirmedCaller.isBranchConsultant}">
				</capitec-button>
				<capitec-button 
					id="id-confirm-button" 
					data-automation-id="confirm-caller-details-confirm"
					type="primary" 
					label="Confirm"
					@click="${() => this._confirmClick()}"
					autofocus>
				</capitec-button>
			</capitec-group>`;
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator data-automation-id="confirm-caller-loading-indicator"></capitec-loading-indicator>` 
			: html``;
	}

	renderAddCallerDetailsModal() {
		return html`
			<horizon-add-caller-details
				data-automation-id="add-caller-details-modal"
				.callerInformation="${this.callerInformation}"
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				@cancel="${(e) => this._addCallerDetailsCancelled(e)}"
				@confirm=${(e) => this._addCallerDetailsConfirmed(e)}>
			</horizon-add-caller-details>`;
	}

	renderEndCallModal() {
		return html`
			<horizon-end-call-session 
				data-automation-id="confirm-caller-details-end-call-modal"
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				.callerInformation="${this.callerInformation}"
				endCallContext="ConfirmClient"
				@cancel="${() => this.renderMode = RENDER_MODE.CONFIRM_CALLER}">
			</horizon-end-call-session>`;
	}

	renderStopCardSearchModal() {
		return html`
			<horizon-stop-card-search-caller
				data-automation-id="confirm-caller-details-stop-card-search-modal"
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				@client-identified="${(event) => this._identifiedClient(event)}"
				@other-need-selected="${(event) => this._otherNeedSelected(event)}">
			</horizon-stop-card-search-caller>`;
	}

	renderSearchModal() {
		return html`
			<horizon-search-caller
				data-automation-id="confirm-caller-details-search-caller-modal"
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				.cpNumber="${this.callerInformation.isBranchConsultant ? this.cpNumber : ``}"
				.clientType="${this.callerInformation.isBranchConsultant ? this.clientType : ``}"
				@client-identified="${(data) => this._identifiedClient(data)}"
				@non-client-captured="${data => this._nonClientCaptured(data)}"
				@branch-captured="${(event) => this._branchCaptured(event)}"
				@stop-card-need-selected="${(event) => this._stopCardNeedSelected(event)}">
			</horizon-search-caller>`;
	}

	renderVerifyCallerModal() {
		return html`
			<horizon-verify-caller
				data-automation-id="confirm-caller-details-veirfy-caller-modal"
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				.callerInformation="${this.callerInformation}"
				@cancel="${(event) => this._verificationCancelled(event)}" 
				@skip="${(event) => this._verificationSkipped(event)}"
				@verified="${(event) => this._clientVerified(event)}">
			</horizon-verify-caller>
		`;
	}
}

window.customElements.define(`horizon-confirm-caller-details`, ConfirmCallerDetails);