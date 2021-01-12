import { Component, css, html } from 'platform/elements';
import { getTabIndex, isDisabled, isHidden } from 'app/utils/channelServiceUtilities';
import { CallerInformation } from 'app/models/CallerInformation';
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
import 'app/components/dialogs/stopCard/StopCardSearchCaller';
import 'app/components/dialogs/common/VerifyCaller';

import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonSelect';

import 'app/components/common/CallerInfoBar';
import 'app/components/common/CallerDialog';


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

		this.cardService = new CardService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));

		this.isBusy = false;
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
			renderMode: { attribute: false }
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

	async _confirmClick() {
		if (this.incomingCallDetails.ivrOptionCode === `StopCard`) {
			this._navigateToLandingPage();
		} else {
			this.callerInformation.hasInsuranceProducts = await this._checkForInsuranceProducts(
				this.confirmedCaller.southAfricanIDNumber, 
				this.confirmedCaller.cifNumber,
				false
			);
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
			false
		);
	}

	async _navigateToLandingPage() {
		this.callerInformation.hasInsuranceProducts = await this._checkForInsuranceProducts(
			this.confirmedCaller.southAfricanIDNumber, 
			this.confirmedCaller.cifNumber,
			false
		);

		const state = {
			incomingCallDetails: this.incomingCallDetails,
			callerInformation: this.callerInformation
		};

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

			state.clientProfileDetails = returnValue.result;
		};

		this.horizonStore.saveState(state);
		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	}

	async _checkForInsuranceProducts(southAfricanIDNumber, cifNumber, isCallerVerified) {
		const InsuranceCientInfo = {
			IdNumber: southAfricanIDNumber,
			CifNumber: cifNumber,
			isCallerVarified: isCallerVerified
		};

		// TODO: Remove temporary error handler. 
		const returnValue = await this.insureService.hasInsuranceProducts(InsuranceCientInfo, (ex) => this._temporaryErrorHander(ex), 1);

		// TODO: Remmove temporary code that forces hasInsurance flag if CS call does not work. This is to allow testing of Stop Card in INT in the meantime.
		if (!returnValue.succeeded) {
			return true;
		}

		return returnValue.result.hasInsurance;
	}

	_handleChannelServiceError(ex) {
		this.horizonStore.saveState({
			incomingCallDetails: this.incomingCallDetails
		});
		this.horizonRouter.navigateToSystemError();

		return true;
	}

	// TODO: remove temporary function
	_temporaryErrorHander(ex) {
		console.log(ex);
		return true;
	}

	_getLanguagePreference() {
		let languagePreference = this.confirmedCaller.languagePreference;

		if (languagePreference === null) {
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
		return this._webTemplate();
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.CONFIRM_CALLER:
				return html`
					<horizon-caller-dialog .incomingCallDetails="${this.incomingCallDetails}" .isNeedSelectable=${true}
						.headerLabel="${HEADER_LABEL}" @on-end-call="${() => this._onEndCall()}"
						@on-need-changed="${(e) => this._needChanged(e)}">
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
			<capitec-hyperlink label="Add Caller Details"
				@click="${() => this._addCallerDetailsClick()}">
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
						<capitec-label row="1" column="1" colspan="2" class="fullname" label="${this.confirmedCaller.name}">
						</capitec-label>
						<horizon-label class="client-info-row" row="2" column="1" label="ID Number"
							value="${this.confirmedCaller.southAfricanIDNumber}">
						</horizon-label>
						<horizon-label class="client-info-row" row="2" column="2" label="Verified Cellphone Number"
							value="${this._getVerifiedTelephoneNumber()}">
						</horizon-label>
						<horizon-label class="client-info-row" row="3" columun="1" label="Lives In" value="${this.confirmedCaller.livesIn}">
						</horizon-label>
						<horizon-label class="client-info-row" row="3" columun="2" label="Language Preference"
							value="${this._getLanguagePreference()}">
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
				<capitec-button 
					id="id-search-button" 
					type="clear" 
					label="Search Client"
					@click="${() => this._searchClick()}">
				</capitec-button>
			
				<capitec-button 
					id="id-confirm-button" 
					type="primary" 
					label="Confirm"
					@click="${() => this._confirmClick()}">
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