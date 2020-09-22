/**
 * The Horizon Landing/Startup Page that is presented when starting the Horizon User Interface.
 * This is the only page that can accept an incoming call. On completing the handling of a call
 * the user interface must be returned to this page in order top accept a new call.
 */
import { View, css, html } from 'platform/elements';
import { DesktopAgentService } from '../services/DesktopAgentService';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonChannelService } from '../services/HorizonChannelService';
import { HorizonRouter } from '../shell/HorizonRouter';
import { HorizonStore } from '../store/HorizonStore';
import { HorizonViewManager } from '../shell/HorizonViewManager';
import { HttpStatusError } from 'platform/errors/HttpStatusError';
import { IncidentManagementService } from '../services/IncidentManagementService';
import { IncomingCallDetails } from '../models/IncomingCallDetails';
import { ServiceCallHelper } from '../utils/serviceCallHelper';
import { tempFixIVROption } from '../utils/channelServiceUtilities';

import 'platform/components/buttons/Button';

import '../components/landingPage/LandingPageWaitForCall';
import '../components/dialogs/ConfirmCallerDetails';
import '../components/dialogs/stopCard/SearchClientDetails';
import '../components/dialogs/AssignStopCard';
import '../components/dialogs/insure/SearchCaller';

const RENDER_MODE = {
	PAGE_ONLY: -1,
	CONFIRM_CALLER: 0,
	SEARCH_CALLER: 1,
	START_AGENT: 2,
	INSURE_SEARCH_CALLER: 3
};

export class LandingPage extends View {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();

		this.renderMode = RENDER_MODE.PAGE_ONLY;
		this.renderDialog = 0;
		this.isBusy = false;
		this.errorHandled = false;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.desktopAgentService = DesktopAgentService.getInstance();
		this.channelService = HorizonChannelService.getInstance();

		this.incomingCallDetails = new IncomingCallDetails();

		this.serviceCallHelper = new ServiceCallHelper(
			() => {
				this._toggleBusyFlag();
			}, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);

		this.eventAggregator.subscribe(`new-call`, (newCallInfo) => this._onNewCall(newCallInfo));
		this.eventAggregator.subscribe(`desktop-agent-up`, () => this._onDesktopAgentup());
		this.eventAggregator.subscribe(`prompt-start-desktopagent`, () => this._onPromptStartDesktopAgent());
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
			ivrOption: { type: String },
			renderDialog: { type: Number }
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
		console.log(`landing page - _onNewCall(): creating incident`);

		const incident = await IncidentManagementService.getInstance().createIncident(
			newCallInfo,
			() => {
				this._toggleBusyFlag();
			},
			(ex) => {
				this.landingPageErrorHandler(ex, `createIncident`);
			}
		);

		if (incident) {
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
		const acceptedCall = await this.serviceCallHelper.asyncCall(
			this.channelService.acceptCall(newCallInfo),
			(ex) => this.landingPageErrorHandler(ex, `acceptCall`)
		);

		if (acceptedCall) {
			this._dispatchCall(acceptedCall, newCallInfo);
		} else {
			console.log(`Failed to accept call`);
		}
	}

	_dispatchCall(acceptedCall, newCallInfo) {
		this.incomingCallDetails = new IncomingCallDetails();
		this._AddCallInfo(this.incomingCallDetails, newCallInfo);

		switch (newCallInfo.IVROptionCode) {
			case `Insure`:
				// Temporary code until the contract is available for loading the client/non-client search dialog
				tempFixIVROption(this.incomingCallDetails.ivrOption);
				this.incomingCallDetails.ivrOption.value = `Insure`;
				this.unVerifiedCaller = acceptedCall;
				this.renderMode = RENDER_MODE.INSURE_SEARCH_CALLER;
				break;
			case `StopCard`: // StopCard
				// Based on need and verfication status, dispatch to the appropriate dialog
				if (this.channelService.isConfirmedCaller(acceptedCall)) {
					this.confirmedCaller = acceptedCall;
					this.unVerifiedCaller = null;

					this.renderMode = RENDER_MODE.CONFIRM_CALLER;
					console.log(`landing page - show confirmed caller`);
				} else if (this.channelService.isUnverifiedCaller(acceptedCall)) {
					this.unVerifiedCaller = acceptedCall;
					this.confirmedCaller = null;

					this.renderMode = RENDER_MODE.SEARCH_CALLER;
					console.log(`landing page - show search caller`);
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

	async _onCallEnded(data) {
		this.renderMode = RENDER_MODE.PAGE_ONLY;
		// TODO: Consider how to recover if the web service call fails. Should this call perhaps be in the end call modal after all
		await this.serviceCallHelper.asyncCall(this.channelService.endCall(data.detail.incidentRecId, data.detail.endCallReason.key));
		this.desktopAgentService.callComplete();
		this.horizonStore.eraseState();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _GetLandingPageData() {
		let landingPageData = null;
		landingPageData = await this.serviceCallHelper.asyncCall(this.channelService.initialise());
		if (landingPageData) {
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
				console.log(exception.message);
				console.log(exception.output);
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
				}`
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
			<landingpage-waitforcall class="wait-for-call"></landingpage-waitforcall>
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
				<horizon-confirm-caller .confirmedCaller="${this.confirmedCaller}" .incomingCallDetails="${this.incomingCallDetails}"
					@confirmed-caller="${(data) => this._onConfirmedCaller(data)}" @call-ended="${(data) => this._onCallEnded(data)}">
				</horizon-confirm-caller>`;
		}
	}

	_renderUnverifiedUser() {
		if (this.renderMode === RENDER_MODE.SEARCH_CALLER) {
			console.log(`render search caller for stop card`);
			return html`
				<horizon-search-client 
					.unverifiedCaller="${this.unVerifiedCaller}" 
					.incomingCallDetails="${this.incomingCallDetails}"
					@on-non-client-captured="${event => this._onNonClientCaptured(event)}"
					@on-client-identified="${(data) => this._onClientIdentified(data)}"
					@call-ended="${async (data) => this._onCallEnded(data)}">
				</horizon-search-client>`;
		} else if (this.renderMode === RENDER_MODE.INSURE_SEARCH_CALLER) {
			console.log(`render search caller for insure`);
			return html`
				<horizon-insure-search-client 
					.unverifiedCaller="${this.unVerifiedCaller}"
					.incomingCallDetails="${this.incomingCallDetails}"
					@on-non-client-captured="${event => this._onNonClientCaptured(event)}"
					@on-client-identified="${(data) => this._onClientIdentified(data)}"
					@call-ended="${(data) => this._onCallEnded(data)}">  
				</horizon-insure-search-client>`;
		}
	}

	_renderStartAgentPrompt() {
		if (this.renderMode === RENDER_MODE.START_AGENT) {
			return html`
				<capitec-modal type="result" result="error" header="Error">
					<div slot="body">
						Cannot connect to Desktop Agent Service!
					</div>
					<capitec-button 
						slot="footer" 
						type="clear" 
						label="Retry" @click=${() => this.renderMode = RENDER_MODE.PAGE_ONLY}>
					</capitec-button>
				</capitec-modal>
			`;
		}
	}
}

customElements.define(`landing-page`, LandingPage);