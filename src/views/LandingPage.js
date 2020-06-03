import { View, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HttpStatusError } from 'platform/errors/HttpStatusError';

import 'platform/components/buttons/Button';

import '../components/landingPage/LandingPageWaitForCall';
import '../components/dialogs/ConfirmCallerDetails';
import '../components/dialogs/SearchClientDetails';
import '../components/dialogs/AssignStopCard';

import { HorizonRouter } from '../shell/HorizonRouter';
import { HorizonViewManager } from '../shell/HorizonViewManager';
import { HorizonStore } from '../store/HorizonStore';

import { StopCardService } from '../services/StopCardService';
import { DesktopAgentService } from '../services/DesktopAgentService'
import { ServiceCallHelper } from '../utils/serviceCallHelper';

const RENDER_MODE = {
	CONFIRM_CALLER: 0,
	SEARCH_CALLER: 1,
	START_AGENT: 2
};

export class LandingPage extends View {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();
		this.renderMode = -1;
		this.eventAggregator = EventAggregator.getInstance();

		this.eventAggregator.subscribe(`new-call`, (event) => this._onNewCall(event));
		this.eventAggregator.subscribe("prompt-start-desktopagent", () => this._onPromptStartDesktopAgent());
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.desktopAgentService = DesktopAgentService.getInstance();

		this.stopCardService = StopCardService.getInstance();
		this.serviceCallHelper = new ServiceCallHelper(
			() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);

		this.isBusy = false;
		this.acceptCallErrorHandled = false;
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
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		await this._GetLandingPageData();

		// Notify the desktop agent service that we are now on the landing page and can therefore handle an incoming call
		this.eventAggregator.publish('landing-page-loaded', {});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onPromptStartDesktopAgent() {
		this.renderMode = RENDER_MODE.START_AGENT;
	}

	async _onNewCall(eventData) {
		this.acceptCallErrorHandled = false;

		// Check the incoming call to see if it is a verified or unverified number
		let acceptedCall = await this.serviceCallHelper.asyncCall(
			this.stopCardService.acceptCall(eventData),
			(ex) => this._acceptCallErrorHandler(ex));

		// Based on need and verfication status, dispatch to the appropriate dialog
		if (this.stopCardService.isConfirmedCaller(acceptedCall)) {
			this.confirmedCaller = acceptedCall;
			this.isUnverifiedCaller = null;

			// TODO: injected into model. Not the best way to do this. look for an alternative
			this.confirmedCaller.incidentReferenceNumber = eventData.IncidentReferenceNumber;
			this.confirmedCaller.agentTelephoneNumber = eventData.AgentTelephoneNumber;

			this.renderMode = RENDER_MODE.CONFIRM_CALLER;
		}
		else if (this.stopCardService.isUnverifiedCaller(acceptedCall)) {
			this.confirmedCaller = null;
			this.isUnverifiedCaller = acceptedCall;

			// TODO: injected into model. Not the best way to do this. look for an alternative
			this.isUnverifiedCaller.agentTelephoneNumber = eventData.AgentTelephoneNumber;

			this.renderMode = RENDER_MODE.SEARCH_CALLER;
		}
		else {
			if (!this.acceptCallErrorHandled) {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: "acceptCall - invalid response"
				}
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}

			this.confirmedCaller = null;
			this.isUnverifiedCaller = null;
			this.renderMode = -1;

			// If accept call fails, we will be stuck on the landing page and unable to take calls unless
			// we flag the call that we tied to take as complete...			
			this.desktopAgentService.callComplete();
		}
	}

	_onClientIdentified(data) {
		this.confirmedCaller = data.detail.identifiedClient;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	_onConfirmedCaller(data) {
		this.horizonStore.saveState(data.detail);
		this.renderMode = -1;
		this.horizonRouter.navigateToStopCard();
	}

	async _onCallEnded(data) {
		this.renderMode = -1;
		// TODO: Consider how to recover if the web service call fails. Should this call perhaps be in the end call modal after all
		await this.serviceCallHelper.asyncCall(this.stopCardService.endCall(data.detail.incidentReferenceNumber, data.detail.endCallReason.key));
		this.desktopAgentService.callComplete();
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
		landingPageData = await this.serviceCallHelper.asyncCall(this.stopCardService.initialise());
		if (landingPageData) {
			this.horizonViewManager.UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId })
		}
	}

	_toggleBusyFlag() {
		this.isBusy = this.isBusy ? false : true;
	}

	_acceptCallErrorHandler(exception) {
		try {
			if (exception instanceof TypeError) {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `acceptCall: ${exception.message}`
				}
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
			else if (exception instanceof HttpStatusError) {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `acceptCall: ${exception.status} - ${exception.message}`
				}
				console.log(exception.message);
				console.log(exception.output);
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
			else {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `acceptCall: UNEXPECTED ERROR - ${exception.message}`
				}
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
		}
		finally {
			// Just a flag to inform the _onNewCall event handler that the error was handled.
			this.acceptCallErrorHandled = true;

			// If accept call fails, we will be stuck on the landing page and unable to take calls unless
			// we flag the call that we tied to take as complete...
			this.desktopAgentService.callComplete();
		}

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
				`];
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
		}
		else
			return html`
            <capitec-loading-indicator></capitec-loading-indicator>
        `;
	}

	_renderConfirmedUser() {
		if (this.renderMode === RENDER_MODE.CONFIRM_CALLER) {
			return html`
				<horizon-confirm-caller 
					.confirmedCaller="${this.confirmedCaller}"
					@confirmed-caller="${(data) => this._onConfirmedCaller(data)}"
					@call-ended="${(data) => this._onCallEnded(data)}">
				</horizon-confirm-caller>`;
		}
	}

	_renderUnverifiedUser() {
		if (this.renderMode === RENDER_MODE.SEARCH_CALLER) {
			return html`
				<horizon-search-client 
					.unverifiedCaller="${this.isUnverifiedCaller}"
					@on-client-identified="${(data) => this._onClientIdentified(data)}"
					@call-ended="${async (data) => this._onCallEnded(data)}">
				</horizon-search-client>`;
		}
	}

	_renderStartAgentPrompt() {
		if (this.renderMode === RENDER_MODE.START_AGENT) {
			return html`
				<capitec-modal type="result" result="error" header="Error">
					<div slot="body">
						Cannot connect to Desktop Agent Service!
					</div>
					<capitec-button slot="footer" type="clear" label="Retry" @click=${() => this.renderMode = -1}></capitec-button>
				</capitec-modal>
			`;
		}
	}
}

customElements.define(`landing-page`, LandingPage);
