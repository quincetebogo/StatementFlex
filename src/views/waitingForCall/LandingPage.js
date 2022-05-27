import { css, html } from 'platform/elements';
import { AUTH_IDENTIFICATION_METHODS } from 'app/constants/Common';
import { AcceptCallEvents } from 'app/constants/telemetry/events/AcceptCall';
import { CallHandleService } from 'app/services/CallHandleService';
import { CallerInformation } from 'app/models/CallerInformation';
import { Configuration } from 'platform/core';
import { DesktopAgentService } from 'app/services/DesktopAgentService';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { HorizonViewManager } from 'app/shell/HorizonViewManager';
import { IDCallerEvents } from 'app/constants/telemetry/events/IdentifyCaller';
import { IncidentDetails } from 'app/models/IncidentDetails';
import { IncomingCallDetails } from 'app/models/IncomingCallDetails';
import { InitialiseService } from 'app/services/InitialiseService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase.js';

import 'platform/components/buttons/Button';

import 'app/components/landingPage/LandingPageWaitForCall';

import 'app/components/dialogs/common/ConfirmCallerDetails';
import 'app/components/dialogs/common/SearchCaller';
import 'app/components/dialogs/common/Error404';
import 'app/components/dialogs/stopCard/StopCardSearchCaller';
import 'app/components/dialogs/stopCard/AssignStopCard';

/**
 * The Horizon Landing/Startup Page that is presented when starting the Horizon User Interface.
 * This is the only page that can accept an incoming call. On completing the handling of a call
 * the user interface must be returned to this page in order top accept a new call.
 *
 * @export
 * @class LandingPage
 * @extends {ViewBase}
 */
export class LandingPage extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();

		this.horizonViewManager = HorizonViewManager.getInstance();
		this.desktopAgentService = DesktopAgentService.getInstance();
		this._configuration = Configuration.getInstance();
		this.telemetry = HorizonTelemetry.getInstance();

		this.initialiseService = new InitialiseService(() => this._toggleBusyFlag(), (ex) => this._landingPageErrorHandler(ex));
		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._landingPageErrorHandler(ex));

		this.incomingCallDetails = new IncomingCallDetails();
		this.incidentDetails = {};

		this.newCallSub = this.eventAggregator.subscribe(`new-call`, (newCallInfo) => this._onNewCall(newCallInfo));
		this.searchCallSub = this.eventAggregator.subscribe(`search-caller`, (newCallInfo) => this._onSearchCaller(newCallInfo));
		this.agentUpSub = this.eventAggregator.subscribe(`desktop-agent-up`, () => this._desktopAgentup());
		this.eventSub = this.eventAggregator.subscribe(`prompt-start-desktopagent`, () => this._promptStartDesktopAgent());

		// Subscribe to state changes. Erase state once the call status indicates that the
		// call has ended.
		this.callStatusSubscription = this.horizonStore.stateChanged.subscribe(state => {
			this.callStatus = state && state.callStatus ? state.callStatus : `WAITING-FOR-CALL`;
			if (this.callStatus === `CALL-ENDED`) {
				this.horizonStore.clearState();
				this.callStatus = `WAITING-FOR-CALL`;
				this.horizonStore.setState({ callStatus: this.callStatus });
				this.desktopAgentService.callComplete();
				this.renderMode = RENDER_MODE.MAIN_PAGE;
			}
		});

		this.employeeId = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		await this._GetLandingPageData();

		// Notify the desktop agent service that we are now on the landing page and can therefore handle an incoming call
		this.eventAggregator.publish(`landing-page-loaded`, {});
	}

	disconnectedCallback() {
		// Telemetry
		// TODO: This should probably move since this point will also mark the end of the caller verification.
		this.telemetry.endSpan(IDCallerEvents.IDENTIFY_CALLER);
		// TODO: Fulfill need span should start here

		// Cleanup all event aggregator and state management subscriptions;
		this.newCallSub.dispose();
		this.searchCallSub.dispose(); 
		this.agentUpSub.dispose(); 
		this.eventSub.dispose();
		this.callStatusSubscription.unsubscribe();

		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_promptStartDesktopAgent() {
		// The desktop agent service must be running in order to use Horizon.
		// If it is not running display an error dialog
		this.renderMode = RENDER_MODE.START_AGENT;
	}

	_desktopAgentup() {
		if (this.renderMode === RENDER_MODE.START_AGENT) {
			// Dismiss error dialog once the Desktop Agent is up and running
			this.renderMode = RENDER_MODE.MAIN_PAGE;
		}
	}

	async _onSearchCaller() {
		await this.desktopAgentService.manualCreateCall();
	}

	async _onNewCall(newCallInfo) {
		// Create an incident in STrack for the new incoming call. This was initially planned to happen
		// in the desktop agent but has moved here. 
		const incident = await this._createIncident(newCallInfo);

		this.incidentDetails = new IncidentDetails(
			incident ? incident.incidentNumber : `0`,
			incident ? incident.incidentRecId : `0`,
			incident ? incident.incidentNumber : `0`,
			``,
			newCallInfo.ivrOptionCode,
			``
		);
		this._acceptCall(newCallInfo);
	}

	async _createIncident(newCallInfo) {
		 const returnValue = await this.incidentManagementService.createIncident(newCallInfo, (ex) => this._landingPageErrorHandler(ex));
		 const incident = returnValue.result;

		 if (!returnValue.succeeded || !incident) {
		 	this.logger.log(`error`, `Failed to create incident. The call will be handled without incident data being tracked.`, `_createIncident`, returnValue.correlationId);
		 }

		if (incident) {
			await this.telemetry.logEvent(AcceptCallEvents.INCIDENT_CREATED, {
				"incident-reference": incident.incidentNumber,
				"incident-rec-id": incident.incidentRecId
			}, true);
		}
	
		return incident;
	}

	async _acceptCall(newCallInfo) {
		const incomingNumber = newCallInfo.incomingTelephoneNumber;
		let callerDetails = null;
		let forceSearchDialog = true;

		newCallInfo.incidentReferenceNumber = this.incidentDetails.incidentReferenceNumber;
		newCallInfo.incidentRecId = this.incidentDetails.incidentRecId;

		// Telemetry
		this.telemetry.startSpan(IDCallerEvents.IDENTIFY_CALLER);

		// If the incoming call was manually created (by pressing the search button on the agent's action bar)
		// then we don't invoke acceptCall as this method tries to identify the incoming caller based the incoming
		// telephone number. For a manually created call, we don't know the incoming telephone number.
		if (incomingNumber !== `0` && incomingNumber !== `0000000000` && incomingNumber !== ``) {
			// Check the incoming call to see if it is a verified or unverified number
			const returnValue = await this.callHandleService.acceptCall(newCallInfo);
			callerDetails = returnValue.result;
			forceSearchDialog = !returnValue.succeeded;

			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Failed to lookup incoming caller`, `_acceptCall`, returnValue.correlationId);
			}
		} else {
			this.logger.log(`info`, `accepting manually created call`, `_acceptCall`);
		}

		this._dispatchCall(callerDetails, newCallInfo, forceSearchDialog);
	}

	/**
	 * Determine the correct dialog to display in order to handle the incoming call
	 *
	 * @param {Object} acceptedCall The response from calling the accept-call channel service method
	 * @param {Object} newCallInfo Incoming call information
	 * @param {boolean} forceSearchDialog  Forces the display of the search dialog if accept-call fails
	 * @returns {undefined}
	 * @memberof LandingPage
	 */
	_dispatchCall(acceptedCall, newCallInfo, forceSearchDialog) {
		// Set up state for the incoming call
		this.incomingCallDetails = new IncomingCallDetails(
			newCallInfo.VDN,
			newCallInfo.incomingTelephoneNumber,
			false, 
			false,
			newCallInfo.voiceReferenceNumber,
			newCallInfo.agentTelephoneNumber,
			newCallInfo.ivrOptionCode
		);

		this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		const state = {
			callStatus: `CALL-IN-PROGRESS`,
			canCloseIncident: true
		};

		this.horizonStore.saveState(state);

		// Display the Confirmed Caller Details Dialog, Stop Card Search Dialog or General Search Dialog based on 
		// the IVR Option and whether the incoming number is recognised
		if (!forceSearchDialog && acceptedCall.callerInformation) {
			this.confirmedCaller = acceptedCall.callerInformation;

			// Case: We got response for the incoming phone number, meaning its verified phone number
			this.confirmedCaller.identifiedBy = AUTH_IDENTIFICATION_METHODS.CELLPHONE_NUMBER;
			
			this.renderMode = RENDER_MODE.CONFIRM_CALLER;
		} else if (this.incomingCallDetails.ivrOptionCode === `StopCard`) {
			this.renderMode = RENDER_MODE.STOP_CARD_SEARCH;
		} else {
			this.renderMode = RENDER_MODE.SEARCH_CALLER;
		}
	}

	_clientIdentified(event) {
		// Once the search dialogs identify a client we can go to the Confirm Caller Details Dialog
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.confirmedCaller = event.detail.confirmedCaller;
		this.incidentDetails = event.detail.incidentDetails;
		this.confirmedCaller.isBranchConsultant = event.detail.isBranchConsultant;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	_branchCaptured(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.confirmedCaller = event.detail.confirmedCaller;
		this.incidentDetails = event.detail.incidentDetails;
		this.confirmedCaller.isBranchConsultant = event.detail.isBranchConsultant;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	_nonClientCaptured(event) {
		// If a non-client is calling in (determined on the general search dialog), 
		// navigate to the appropriate landing page
		const callerInformation = new CallerInformation(
			``, // CIF Number
			``, // Birth Date
			``, // Language Preference
			``, // Lives In
			``, // Name 
			``, // Title
			``, // South African ID  Number
			``, // Verified Number
			event.detail.nonClient.firstName,
			event.detail.nonClient.surname,
			`${event.detail.nonClient.firstName} ${event.detail.nonClient.surname}`,
			event.detail.nonClient.cellphone,
			``, // Non client ID Number
			``, // Non client relationship
			false, // is Confirmed Client
			`non-client`, // Verification Status
			false, // verification toast
			false, // is 3rd party
			true, // is non-client
			false, // has insurance products
			false,
			{
				itaAttempts: 0,
				sqAttempts: 0
			},
			event.detail.isBranchConsultant,
			false,
			`unverified`,
			``, // client's first name
			``, // client's second name
			``, // client's third name
			``, // client's fourth name
			``, // client's surname/last name
			``, // client's initials
			``, // Identification method used to confirm client
			`` // client's email id
		);
		this.horizonStore.setIncomingCallDetails(event.detail.incomingCallDetails);
		this.horizonStore.setCallerInformation(callerInformation);

		this.horizonRouter.navigateToLandingPage(event.detail.incomingCallDetails.ivrOption.value, callerInformation.hasInsuranceProducts);
	}

	_otherNeedSelected(event) {
		// Switching from stop card search to general search dialog
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.incidentDetails = event.detail.incidentDetails;
		this.renderMode = RENDER_MODE.SEARCH_CALLER;
	}

	_stopCardNeedSelected(event) {
		// Switching from general search dialog to stop card search dialog
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.incidentDetails = event.detail.incidentDetails;
		this.renderMode = RENDER_MODE.STOP_CARD_SEARCH;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _GetLandingPageData() {
		const returnValue = await this.initialiseService.initialise();

		if (returnValue.succeeded) {
			const landingPageData = returnValue.result;
			this.employeeId = landingPageData.loggedInAgent.employeeId;
			
			this.horizonViewManager.UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId });
			this.eventAggregator.publish(`horizon-update-welcome-bar`, { fullname: landingPageData.agentFullName });
		}
	}

	_landingPageErrorHandler(exception) {
		// Errors that can happen on the landing page

		//   - initialise can fail - non fatal. This call only reports information to the Channel Service.
		//   - createIncident can fail - we must be able to proceed without an incident
		//   - acceptCall can fail - we must proceed to a search dialog

		// Since we can proceed whatever the channel service error on this page, return true to indicate that the error was handled.
		// The Channel Service call wrappers will log the failed calls.
		return true;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.wait-for-call{
					width:100%;
					height:100%;
				}
				`
		];
	}

	_webTemplate() {
		return html`
		${this._renderMiddleSection()}
		${this._renderConfirmCallerDetailsDialog()}
		${this._renderSearchDialog()}
		${this._renderStartAgentPrompt()}
		${super._webTemplate()}
		`;
	}

	_renderMiddleSection() {
		return html`
			<horizon-landing-page-wait-for-call class="wait-for-call"></horizon-landing-page-wait-for-call>
		`;
	}

	_renderConfirmCallerDetailsDialog() {
		if (this.renderMode === RENDER_MODE.CONFIRM_CALLER) {
			return html`
				<horizon-confirm-caller-details 
					.confirmedCaller="${this.confirmedCaller}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.incidentDetails="${this.incidentDetails}"
					@branch-captured="${(event) => this._branchCaptured(event)}"
					@non-client-captured=${event => this._nonClientCaptured(event)}>
				</horizon-confirm-caller-details>`;
		}
	}

	_renderSearchDialog() {
		if (this.renderMode === RENDER_MODE.STOP_CARD_SEARCH) {
			return html`
				<horizon-stop-card-search-caller 
					.incomingCallDetails="${this.incomingCallDetails}"
					.incidentDetails="${this.incidentDetails}"
					@client-identified="${(data) => this._clientIdentified(data)}"
					@other-need-selected="${(event) => this._otherNeedSelected(event)}">
				</horizon-stop-card-search-caller>`;
		} else if (this.renderMode === RENDER_MODE.SEARCH_CALLER) {
			return html`
				<horizon-search-caller
					.incomingCallDetails="${this.incomingCallDetails}"
					.incidentDetails="${this.incidentDetails}"
					@client-identified="${(event) => this._clientIdentified(event)}"
					@non-client-captured="${event => this._nonClientCaptured(event)}"
					@branch-captured="${(event) => this._branchCaptured(event)}"
					@stop-card-need-selected="${(event) => this._stopCardNeedSelected(event)}">
				</horizon-search-caller>`;
		}
	}

	_renderStartAgentPrompt() {
		if (this.renderMode === RENDER_MODE.START_AGENT) {
			return html`
				<horizon-error-404 
					@click="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</horizon-error-404>
			`;
		}
	}
}

customElements.define(`horizon-landing-page`, LandingPage);