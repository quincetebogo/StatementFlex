import { View, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { CardService } from 'app/services/CardService';
import { IncidentManagementService } from 'app/services/IncidentManagementService';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyCaller';
import 'app/components/dialogs/common/AddCallerDetails';


/**
 * A Base class for view components to collect common functionality used across most views
 * 
 * This base class will contain the following common code
 * 
 *    - support for ending a call: added
 *    - support for verifying a caller: added
 *    - support for assigning/handing off a call
 *    - restoration of common state information: added
 *    - incident management
 *    - toggling isBusy support: added
 *    - possibly support for updating the left menu bar
 *    - possibly support for updating access channels
 *    - possibly support for updating client insights
 *
 * @export
 * @class ViewBase
 * @extends {View}
 */
export class ViewBase extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.cardService = new CardService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.incidentService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._handleAddNonClientException(ex));

		this.callerInformation = this.horizonStore.getCallerInformation();
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.isReassigned = this.horizonStore.getIsIncidentReassigned();
		this.isBusy = false;
		this.endCallContext = `LandingPage`;
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.showEndCall = false;
		this.showAddCallerDetails = false;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			callerInformation: { attribute: false },
		    incomingCallDetails: { attribute: false },
			verificationStatus: { attribute: false },

			renderMode: { attribute: false },
			isBusy: { attribute: false },
			showEndCall: { attribute: false },
			showAddCallerDetails: { attribute: false}
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());
		this.verifySub = this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyClick());
		this.assignSub = this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._assignIncidentClick());
		this.addCallerDetailsSub = this.eventAggregator.subscribe(`horizon-add-caller-details`, () => this._onAddCallerDetailsClick());

		super.connectedCallback();
	}

	disconnectedCallback() {
		this.endCallSub.dispose();
		this.verifySub.dispose();
		this.assignSub.dispose();
		this.addCallerDetailsSub.dispose();
	
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_verifyClick() {
		this.renderMode = RENDER_MODE.VERIFY_NOW;
	}

	_skipVerification(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_verificationCancelled(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.verificationStatus = this.callerInformation.verificationStatus;

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_clientVerified(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.verificationStatus = this.callerInformation.verificationStatus;
	}

	_assignIncidentClick() {
        this.horizonRouter.navigateToStrack(this.incidentDetails.incidentRecId);
	}

	_endCallClick() {
		this.showEndCall = !this.showEndCall;
	}

	_cancelEndCallClick() {
		this.showEndCall = !this.showEndCall;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/**
	 * Necessary to refresh the incident details object, when a primary incident is closed
	 * and subsequent incident is opened
	 * 
	 * @returns {void}
	 */
	_refreshIncidentDetails() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
	}

	async _onAddCallerDetailsClick() {
		console.log("click")
		await this._addCallerDetailsClick();
	}

	async _addCallerDetailsClick() {
		HorizonTelemetry.instance.selectAddCallerDetails({ screen: TelemetryScreen.CONFIRM_CALLER });

		const callDetails = {
			incomingNumber: this.incomingCallDetails.incomingTelephoneNumber,
			voiceReference: this.incomingCallDetails.voiceReferenceNumber,
			ivrOption: this.incomingCallDetails.ivrOption.value,
			incidentNo: this.incidentDetails.incidentReferenceNumber,
			agentPhoneNumber: this.incomingCallDetails.agentTelephoneNumber
		};

		const returnValue = await this.cardService.addCallerDetails(callDetails);
		if (returnValue.succeeded) {
			this.showAddCallerDetails = !this.showAddCallerDetails;
			this.addCallerDetails = returnValue.result;
		}
	}

	_addCallerDetailsCancelled(event) {
		this.confirmedCaller = {};
		this.confirmedCaller.ivrOptionCode = event.detail.ivrOptionValue;
		this.incomingCallDetails.ivrOption.value = event.detail.ivrOptionValue;
		this.incomingCallDetails.ivrOptionCode = event.detail.ivrOptionValue;
		this.showAddCallerDetails = !this.showAddCallerDetails;
	}

	async _addCallerDetailsConfirmed(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;

		if (this.incidentDetails.incidentRecId && this.incidentDetails.incidentRecId !== ``) {
			const nonClientDetails = {
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode,
				incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				firstName: this.callerInformation.nonClientFirstName,
				surname: this.callerInformation.nonClientSurName,
				cellPhone: this.callerInformation.nonClientCellPhone
			};
			const returnValue = await this.incidentService.updateIncidentNonClientDetails(this.incidentDetails.incidentRecId, nonClientDetails);

			if (returnValue.succeeded) {
				this.showAddCallerDetails = !this.showAddCallerDetails;
			} else {
				this.logger.log(`error`, `Unable to update non-client details on incident due to a system error`, `_addCallerDetailsConfirmed`, returnValue.correlationId);
			}
		} else {
			this.logger.log(`error`, `There is no incident available against which to record then non-client details`, `_addCallerDetailsConfirmed`);
		}
	}

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		return this._webTemplate();
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderVerifyNowModal()}
			${this._renderEndCallSessionModal()}
			${this._renderLoadingIndicator()}
			${this._renderAddCallerDetailsModal()}
		`; 
	}

	_renderVerifyNowModal() {
		if (this.renderMode === RENDER_MODE.VERIFY_NOW) {
			return html`
				<horizon-verify-caller
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
					@skip="${(e) => this._skipVerification(e)}"
					@cancel="${(e) => this._verificationCancelled(e)}"
					@verified="${(e) => this._clientVerified(e)}">
				</horizon-verify-caller>`;
		}
		return html``;
	}

	_renderEndCallSessionModal() {
		return this.showEndCall
			? html`
				<horizon-end-call-session
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.isReassigned="${this.isReassigned}"
					endCallContext=${this.endCallContext}
					@cancel="${() => this._cancelEndCallClick()}">
				</horizon-end-call-session>`
			: html``;
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

	_renderAddCallerDetailsModal() {
		return this.showAddCallerDetails ? html`
			<horizon-add-caller-details
				.confirmedCaller="${this.confirmedCaller}"
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				.addCallerDialog="${this.addCallerDetails}"
				@cancel="${(e) => this._addCallerDetailsCancelled(e)}"
				@confirm=${(e) => this._addCallerDetailsConfirmed(e)}>
			</horizon-add-caller-details>`
		: html ``;
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}
}