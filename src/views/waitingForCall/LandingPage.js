import { View, css, html } from 'platform/elements';
import { CallHandleService } from 'app/services/CallHandleService';
import { DesktopAgentService } from 'app/services/DesktopAgentService';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonViewManager } from 'app/shell/HorizonViewManager';
import { HttpStatusError } from 'platform/errors/HttpStatusError';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { IncomingCallDetails } from 'app/models/IncomingCallDetails';
import { InitialiseService } from 'app/services/InitialiseService';
import { tempFixIVROption } from 'app/utils/channelServiceUtilities';

import 'platform/components/buttons/Button';

import 'app/components/landingPage/LandingPageWaitForCall';

import 'app/components/dialogs/common/ConfirmCallerDetails';
import 'app/components/dialogs/common/SearchCaller';
import 'app/components/dialogs/common/Error404';
import 'app/components/dialogs/stopCard/StopCardSearchCaller';
import 'app/components/dialogs/stopCard/AssignStopCard';

const RENDER_MODE = {
	PAGE_ONLY: -1,
	CONFIRM_CALLER: 0,
	STOP_CARD_SEARCH: 1,
	START_AGENT: 2,
	SEARCH_CALLER: 3
};

/**
 * The Horizon Landing/Startup Page that is presented when starting the Horizon User Interface.
 * This is the only page that can accept an incoming call. On completing the handling of a call
 * the user interface must be returned to this page in order top accept a new call.
 *
 * @export
 * @class LandingPage
 * @extends {View}
 */
export class LandingPage extends View {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();

		this.renderMode = RENDER_MODE.PAGE_ONLY;
		this.isBusy = false;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.desktopAgentService = DesktopAgentService.getInstance();

		this.initialiseService = new InitialiseService(() => this._toggleBusyFlag(), (ex) => this._landingPageErrorHandler(ex));
		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._landingPageErrorHandler(ex));
		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._landingPageErrorHandler(ex));

		this.incomingCallDetails = new IncomingCallDetails();

		this.eventAggregator.subscribe(`new-call`, (newCallInfo) => this._onNewCall(newCallInfo));
		this.eventAggregator.subscribe(`desktop-agent-up`, () => this._onDesktopAgentup());
		this.eventAggregator.subscribe(`prompt-start-desktopagent`, () => this._onPromptStartDesktopAgent());

		this.callStatusSubscription = this.horizonStore.stateChanged.subscribe(state => {
			this.callStatus = state && state.callStatus ? state.callStatus : `WAITING-FOR-CALL`;
			if (this.callStatus === `CALL-ENDED`) {
				this.horizonStore.eraseState();
				this.callStatus = `WAITING-FOR-CALL`;
				this.horizonStore.setState({ callStatus: this.callStatus });
				this.desktopAgentService.callComplete();
				this.renderMode = RENDER_MODE.PAGE_ONLY;
			}
		});
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			fullname: { type: String },
			renderMode: { type: Number },
			isBusy: { type: Boolean },
			incomingTelephoneNumber: { type: String },
			voiceReferenceNumber: { type: String },
			ivrOption: { type: String }
		};
	}

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
		super.disconnectedCallback();
		this.callStatusSubscription.unsubscribe();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onDesktopAgentup() {
		if (this.renderMode === RENDER_MODE.START_AGENT) {
			this.renderMode = RENDER_MODE.PAGE_ONLY;
		}
	}

	_onPromptStartDesktopAgent() {
		this.renderMode = RENDER_MODE.START_AGENT;
	}

	async _onNewCall(newCallInfo) {
		const returnValue = await this.incidentManagementService.createIncident(newCallInfo);
		const incident = returnValue.result;

		if (returnValue.succeeded && incident) {
			await this._acceptCall(newCallInfo, incident);
		} else {
			this.horizonRouter.navigateToInitialSystemError();
		}
	}

	async _acceptCall(newCallInfo, incident) {
		newCallInfo.incidentReferenceNumber = incident.incidentNumber;
		newCallInfo.incidentRecId = incident.incidentRecId;

		// Check the incoming call to see if it is a verified or unverified number
		const returnValue = await this.callHandleService.caller(newCallInfo);

		this._dispatchCall(returnValue.result, newCallInfo, !returnValue.succeeded);
	}

	_dispatchCall(acceptedCall, newCallInfo, forceSearchDialog) {
		this.callStatus = `CALL-IN-PROGRESS`;
		const state = { callStatus: this.callStatus };
		this.horizonStore.saveState(state);

		this.incomingCallDetails = new IncomingCallDetails();

		switch (newCallInfo.ivrOptionCode) {
			case `Insure`:
			case `Transact`:
				// TODO: below code will actuall fire for all needs but StopCard. 
				// TODO: Temporary code until the contract is available for loading the client/non-client search dialog
				this._AddCallInfo(this.incomingCallDetails, newCallInfo);
				tempFixIVROption(this.incomingCallDetails.ivrOption);
				this.incomingCallDetails.ivrOption.value = newCallInfo.ivrOptionCode;

				if (!forceSearchDialog && this.callHandleService.isConfirmedCaller(acceptedCall)) {
					this.renderMode = RENDER_MODE.CONFIRM_CALLER;
					this.confirmedCaller = acceptedCall;
				} else {
					this.renderMode = RENDER_MODE.SEARCH_CALLER;
				}
				break;
			case `StopCard`: // StopCard is a special case and runs the following code 
				// Based on need and verfication status, dispatch to the appropriate dialog
				if (!forceSearchDialog && this.callHandleService.isConfirmedCaller(acceptedCall)) {
					this._AddCallInfo(this.incomingCallDetails, newCallInfo);
					this.incomingCallDetails.ivrOption.possibleValues = acceptedCall.ivrOption.possibleValues;
					this.incomingCallDetails.ivrOption.value = newCallInfo.ivrOptionCode;
					this.confirmedCaller = acceptedCall;

					this.renderMode = RENDER_MODE.CONFIRM_CALLER;
				} else if (forceSearchDialog || this.callHandleService.isUnverifiedCaller(acceptedCall)) {
					this._AddCallInfo(this.incomingCallDetails, newCallInfo);
					tempFixIVROption(this.incomingCallDetails.ivrOption);
					this.incomingCallDetails.ivrOption.value = this.incomingCallDetails.ivrOptionCode;
					this.confirmedCaller = null;

					this.renderMode = RENDER_MODE.STOP_CARD_SEARCH;
				} else {
					this.confirmedCaller = null;
					this.renderMode = RENDER_MODE.PAGE_ONLY;

					// If accept call fails, we will be stuck on the landing page and unable to take calls unless
					// we flag the call that we tied to take as complete...
					this.desktopAgentService.callComplete();

					this.horizonRouter.navigateToSystemError();
				}
				break;
			default:
				this._AddCallInfo(this.incomingCallDetails, newCallInfo);
				tempFixIVROption(this.incomingCallDetails.ivrOption);
				this.renderMode = RENDER_MODE.SEARCH_CALLER;
		}
	}

	_clientIdentified(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.confirmedCaller = event.detail.identifiedClient;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	_nonClientCaptured(event) {
		const callerInformation = {
			cifNumber: ``,
			birthdate: ``,
			languagePreference: ``,
			livesIn: ``,
			name: ``,
			southAfricanIDNumber: ``,
			verifiedTelephoneNumber: ``,
			nonClientFullName: `${event.detail.nonClient.firstName} ${event.detail.nonClient.surname}`,
			nonClientCellPhone: event.detail.incomingCallDetails.incomingTelephoneNumber,
			nonClientIDNumber: ``,
			nonClientRelationship: ``,
			isConfirmed: false,
			verificationStatus: `non-client`,
			is3rdParty: false,
			isNonClient: true,
			hasInsuranceProducts: false
		};

		this.horizonStore.saveState({ incomingCallDetails: event.detail.incomingCallDetails, callerInformation: callerInformation });

		switch (event.detail.incomingCallDetails.ivrOption.value) {
			case `Insure`:
				this.horizonRouter.navigateToInsureProspectiveClient();
				break;
			case `Transact`: 
			default:
				this.horizonRouter.navigateToQuickTransactionFavourites();
				break;
		}
	}

	_otherNeedSelected(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.renderMode = RENDER_MODE.SEARCH_CALLER;
	}

	_stopCardNeedSelected(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.renderMode = RENDER_MODE.STOP_CARD_SEARCH;
	}

	_confirmedCaller(data) {
		this.horizonStore.saveState(data.detail);
		this.renderMode = RENDER_MODE.PAGE_ONLY;
		this.horizonRouter.navigateToStopCard();
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
		const landingPageData = returnValue.result;

		if (returnValue.succeeded) {
			this.horizonViewManager.UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId });
			this.eventAggregator.publish(`horizon-update-welcome-bar`, { fullname: landingPageData.agentFullName });
		}
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_landingPageErrorHandler(exception) {
		if (exception instanceof TypeError) {
			console.log(exception);
		} else if (exception instanceof HttpStatusError) {
			console.log(exception);
		} else {
			console.log(exception);
		}

		this.desktopAgentService.callComplete();
		this.horizonRouter.navigateToInitialSystemError();
		return true;
	}

	_AddCallInfo(model, newCallInfo) {
		model.incomingTelephoneNumber = newCallInfo.incomingTelephoneNumber;
		model.incidentReferenceNumber = newCallInfo.incidentReferenceNumber;
		model.incidentRecId = newCallInfo.incidentRecId;
		model.agentTelephoneNumber = newCallInfo.agentTelephoneNumber;
		model.ivrOptionCode = newCallInfo.ivrOptionCode;
		model.voiceReferenceNumber = newCallInfo.voiceReferenceNumber;
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

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
		${this._renderMiddleSection()}
		${this._renderLoadingIndicator()}
		${this._renderConfirmedUser()}
		${this._renderUnverifiedUser()}
		${this._renderStartAgentPrompt()}
		`;
	}

	_renderMiddleSection() {
		return html`
			<horizon-landing-page-wait-for-call class="wait-for-call"></horizon-landing-page-wait-for-call>
		`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	_renderConfirmedUser() {
		if (this.renderMode === RENDER_MODE.CONFIRM_CALLER) {
			return html`
				<horizon-confirm-caller-details 
					.confirmedCaller="${this.confirmedCaller}" 
					.incomingCallDetails="${this.incomingCallDetails}"
					@confirmed-caller="${(data) => this._confirmedCaller(data)}" 
					@non-client-captured=${event => this._nonClientCaptured(event)}>
				</horizon-confirm-caller-details>`;
		}
	}

	_renderUnverifiedUser() {
		if (this.renderMode === RENDER_MODE.STOP_CARD_SEARCH) {
			return html`
				<horizon-stop-card-search-caller 
					.incomingCallDetails="${this.incomingCallDetails}"
					@client-identified="${(data) => this._clientIdentified(data)}"
					@other-need-selected="${(event) => this._otherNeedSelected(event)}">
				</horizon-stop-card-search-caller>`;
		} else if (this.renderMode === RENDER_MODE.SEARCH_CALLER) {
			return html`
				<horizon-search-caller
					.incomingCallDetails="${this.incomingCallDetails}"
					@client-identified="${(event) => this._clientIdentified(event)}"
					@non-client-captured="${event => this._nonClientCaptured(event)}"
					@stop-card-need-selected="${(event) => this._stopCardNeedSelected(event)}">
				</horizon-search-caller>`;
		}
	}

	_renderStartAgentPrompt() {
		if (this.renderMode === RENDER_MODE.START_AGENT) {
			return html`
				<horizon-error-404 
					@click="${() => this.renderMode = RENDER_MODE.PAGE_ONLY}">
				</horizon-error-404>
			`;
		}
	}
}

customElements.define(`horizon-landing-page`, LandingPage);