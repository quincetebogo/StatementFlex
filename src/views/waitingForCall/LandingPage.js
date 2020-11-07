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
	SEARCH_CALLER: 1,
	START_AGENT: 2,
	INSURE_SEARCH_CALLER: 3
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
		this.errorHandled = false;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.desktopAgentService = DesktopAgentService.getInstance();

		this.initialiseService = new InitialiseService(() => this._toggleBusyFlag(), null);
		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), null);
		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), null);

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
		// TODO: Perhaps fold this into callHandleService.acceptCall and get rid of incidentManagement Service
		console.log(`landing page - _onNewCall(): creating incident`);

		const returnValue = await this.incidentManagementService.createIncident(
			newCallInfo,
			(ex) => {
				this.landingPageErrorHandler(ex, `createIncident`);
			}
		);

		const incident = returnValue.result;
		if (returnValue.succeeded && incident) {
			console.log(`landing page - _onNewCall(): incident created, accepting call`);
			await this._acceptCall(newCallInfo, incident);
		} else {
			console.log(`Failed to create incident`);
		}
	}

	async _acceptCall(newCallInfo, incident) {
		console.log(`landing page - _acceptCall()`);

		newCallInfo.IncidentReferenceNumber = incident.incidentNumber;
		newCallInfo.IncidentRecId = incident.incidentRecId;

		this.errorHandled = false;

		// Check the incoming call to see if it is a verified or unverified number
		const returnValue = await this.callHandleService.acceptCall(
			newCallInfo,
			(ex) => this.landingPageErrorHandler(ex, `acceptCall`)
		);

		if (returnValue.succeeded) {
			this._dispatchCall(returnValue.result, newCallInfo);
		} else {
			console.log(`Failed to accept call`);
		}
	}

	_dispatchCall(acceptedCall, newCallInfo) {
		this.callStatus = `CALL-IN-PROGRESS`;
		const state = { callStatus: this.callStatus };
		this.horizonStore.saveState(state);

		this.incomingCallDetails = new IncomingCallDetails();

		switch (newCallInfo.IVROptionCode) {
			case `Insure`:
				// TODO: below code will actuall fire for all needs but StopCard. 
				// TODO: Temporary code until the contract is available for loading the client/non-client search dialog
				this._AddCallInfo(this.incomingCallDetails, newCallInfo);
				tempFixIVROption(this.incomingCallDetails.ivrOption);
				this.incomingCallDetails.ivrOption.value = `Insure`;
				this.unVerifiedCaller = acceptedCall;

				if (this.callHandleService.isConfirmedCaller(acceptedCall)) {
					this.renderMode = RENDER_MODE.CONFIRM_CALLER;
					this.confirmedCaller = acceptedCall;
					this.unVerifiedCaller = null;
				} else {
					this.renderMode = RENDER_MODE.INSURE_SEARCH_CALLER;
				}
				break;
			case `StopCard`: // StopCard is a special case and runs the following code 
				// Based on need and verfication status, dispatch to the appropriate dialog
				if (this.callHandleService.isConfirmedCaller(acceptedCall)) {
					this._AddCallInfo(this.incomingCallDetails, newCallInfo);
					this.incomingCallDetails.ivrOption.possibleValues = acceptedCall.ivrOption.possibleValues;
					this.incomingCallDetails.ivrOption.value = acceptedCall.ivrOption.value;
					this.confirmedCaller = acceptedCall;
					this.unVerifiedCaller = null;

					this.renderMode = RENDER_MODE.CONFIRM_CALLER;
				} else if (this.callHandleService.isUnverifiedCaller(acceptedCall)) {
					this._AddCallInfo(this.incomingCallDetails, newCallInfo);
					this.incomingCallDetails.ivrOption.possibleValues = acceptedCall.ivrOption.possibleValues;
					this.incomingCallDetails.ivrOption.value = acceptedCall.ivrOption.value;
					this.unVerifiedCaller = acceptedCall;
					this.confirmedCaller = null;

					this.renderMode = RENDER_MODE.SEARCH_CALLER;
				} else {
					if (!this.errorHandled) {
						const event = {
							from: `UI-CS`,
							status: `error`,
							message: `acceptCall - invalid response`
						};
						this.eventAggregator.publish(`horizon-status-bar-update`, event);
						console.log(`landing page - _acceptCall failed`);
					}

					this.confirmedCaller = null;
					this.unVerifiedCaller = null;
					this.renderMode = RENDER_MODE.PAGE_ONLY;

					// If accept call fails, we will be stuck on the landing page and unable to take calls unless
					// we flag the call that we tied to take as complete...
					this.desktopAgentService.callComplete();
				}
				break;
			default:
				this._AddCallInfo(this.incomingCallDetails, newCallInfo);
				tempFixIVROption(this.incomingCallDetails.ivrOption);
				this.renderMode = RENDER_MODE.INSURE_SEARCH_CALLER;
		}
	}

	_onClientIdentified(data) {
		this.confirmedCaller = data.detail.identifiedClient;
		this.incomingCallDetails = data.detail.incomingCallDetails;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	_onNonClientCaptured(event) {
		this.horizonStore.saveState(event.detail);
		this.renderMode = RENDER_MODE.PAGE_ONLY;
		this.horizonRouter.navigateToInsureNonClient();
	}

	_onConfirmedCaller(data) {

		/**
		 * Updating whether the incoming number is verified or unverified, which will be used in action bar
		 * Analysed, this is the best place to do for stop card. Yet to figure out for Insure
		 */
		data.detail.incomingCallDetails.isUnverifiedNumber = Boolean(this.unVerifiedCaller);

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

	landingPageErrorHandler(exception, context) {
		try {
			if (exception instanceof TypeError) {
				const event = {
					from: `UI-CS`,
					status: `error`,
					message: `${context}: ${exception.message}`
				};
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			} else if (exception instanceof HttpStatusError) {
				const event = {
					from: `UI-CS`,
					status: `error`,
					message: `${context}: ${exception.status} - ${exception.message}`
				};
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			} else {
				const event = {
					from: `UI-CS`,
					status: `error`,
					message: `${context}: UNEXPECTED ERROR - ${exception.message}`
				};
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
		} finally {
			// Just a flag to inform _dispatchCall that the error was handled.
			this.errorHandled = true;

			// If accept call fails, we will be stuck on the landing page and unable to take calls unless
			// we flag the call that we tied to take as complete...
			this.desktopAgentService.callComplete();
		}

		return true;
	}

	_AddCallInfo(model, newCallInfo) {
		model.incomingTelephoneNumber = newCallInfo.IncomingTelephoneNumber;
		model.incidentReferenceNumber = newCallInfo.IncidentReferenceNumber;
		model.incidentRecId = newCallInfo.IncidentRecId;
		model.agentTelephoneNumber = newCallInfo.AgentTelephoneNumber;
		model.ivrOptionCode = newCallInfo.IVROptionCode;
		model.voiceReferenceNumber = newCallInfo.VoiceReferenceNumber;
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
					@confirmed-caller="${(data) => this._onConfirmedCaller(data)}" 
					@non-client-captured=${event => this._onNonClientCaptured(event)}>
				</horizon-confirm-caller-details>`;
		}
	}

	_renderUnverifiedUser() {
		if (this.renderMode === RENDER_MODE.SEARCH_CALLER) {
			console.log(`render search caller for stop card`);
			return html`
				<horizon-stop-card-search-caller 
					.unverifiedCaller="${this.unVerifiedCaller}" 
					.incomingCallDetails="${this.incomingCallDetails}"
					@non-client-captured="${event => this._onNonClientCaptured(event)}"
					@on-client-identified="${(data) => this._onClientIdentified(data)}">
				</horizon-stop-card-search-caller>`;
		} else if (this.renderMode === RENDER_MODE.INSURE_SEARCH_CALLER) {
			console.log(`render search caller for insure`);
			return html`
				<horizon-search-caller .unverifiedCaller="${this.unVerifiedCaller}"
					.incomingCallDetails="${this.incomingCallDetails}"
					@non-client-captured="${event => this._onNonClientCaptured(event)}"
					@on-client-identified="${(data) => this._onClientIdentified(data)}">
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