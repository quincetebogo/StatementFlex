/**
 * The Horizon Landing/Startup Page that is presented when starting the Horizon User Interface.
 * This is the only page that can accept an incoming call. On completing the handling of a call
 * the user interface must be returned to this page in order top accept a new call.
 */
import { View, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HttpStatusError } from 'platform/errors/HttpStatusError';

import 'platform/components/buttons/Button';

import '../components/landingPage/LandingPageWaitForCall';
import '../components/dialogs/ConfirmCallerDetails';
import '../components/dialogs/stopCard/SearchClientDetails';
import '../components/dialogs/AssignStopCard';
import '../components/dialogs/insure/SearchCaller';

import { HorizonRouter } from '../shell/HorizonRouter';
import { HorizonViewManager } from '../shell/HorizonViewManager';
import { HorizonStore } from '../store/HorizonStore';

import { HorizonChannelService } from '../services/HorizonChannelService';
import { DesktopAgentService } from '../services/DesktopAgentService'
import { ServiceCallHelper } from '../utils/serviceCallHelper';
import { IncidentManagementService } from '../services/IncidentManagementService';

const RENDER_MODE = {
	CONFIRM_CALLER: 0,
	SEARCH_CALLER: 1,
	START_AGENT: 2,
	INSURE_SEARCH_CALLER: 3,
};

export class LandingPage extends View {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();

		this.renderMode = -1;
		this.renderDialog = 0;
		this.isBusy = false;
		this.errorHandled = false;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.desktopAgentService = DesktopAgentService.getInstance();
		this.channelService = HorizonChannelService.getInstance();

		/** @type {Object} */
		this.incomingCallDetails = {
			"incomingTelephoneNumber": ``,
			"incidentReferenceNumber": ``,
			"incidentRecId": ``,
			"agentTelephoneNumber": ``,
			"ivrOptionCode": ``
		};

		this.serviceCallHelper = new ServiceCallHelper(
			() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);

		this.eventAggregator.subscribe(`new-call`, (event) => this._onNewCall(event));
		this.eventAggregator.subscribe("prompt-start-desktopagent", () => this._onPromptStartDesktopAgent());
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

	async _onNewCall(newCallInfo) {
		console.log("landing page - _onNewCall(): creating incident");

		let incident = await IncidentManagementService.getInstance().createIncident(newCallInfo,
			() => { this._toggleBusyFlag() },
			(ex) => { this.landingPageErrorHandler(ex, "createIncident") }
		);

		if (incident) {
			newCallInfo.IncidentReferenceNumber = incident.incidentNumber;
			newCallInfo.IncidentRecId = incident.incidentRecId;

			console.log("landing page - _onNewCall(): incident created, accepting call");
			await this._acceptCall(newCallInfo);
		}
	}

	async _acceptCall(newCallInfo) {
		console.log("landing page - _acceptCall()");


		this.errorHandled = false;


		if (newCallInfo.IVROptionCode === `2`) {
			this._AddCallInfo(this.incomingCallDetails, newCallInfo);
			this.renderMode = RENDER_MODE.INSURE_SEARCH_CALLER;
			return;
		}

		// Check the incoming call to see if it is a verified or unverified number
		const acceptedCall = await this.serviceCallHelper.asyncCall(
			this.channelService.acceptCall(newCallInfo),
			(ex) => this.landingPageErrorHandler(ex, `acceptCall`)
		);

		// Based on need and verfication status, dispatch to the appropriate dialog
		if (this.channelService.isConfirmedCaller(acceptedCall)) {
			this.confirmedCaller = acceptedCall;
			this._AddCallInfo(this.incomingCallDetails, newCallInfo);
			this.unVerifiedCaller = null;

			this.renderMode = RENDER_MODE.CONFIRM_CALLER;
			console.log("landing page - show confirmed caller");
		}
		else if (this.channelService.isUnverifiedCaller(acceptedCall)) {
			this.unVerifiedCaller = acceptedCall;
			this.confirmedCaller = null;
			this._AddCallInfo(this.incomingCallDetails, newCallInfo);

			this.renderMode = RENDER_MODE.SEARCH_CALLER;
			console.log("landing page - show search caller");
		}
		else {
			if (!this.errorHandled) {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: "acceptCall - invalid response"
				}
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
				console.log("landing page - _acceptCall failed");
			}

			this.confirmedCaller = null;
			this.unVerifiedCaller = null;
			this.renderMode = -1;

			// If accept call fails, we will be stuck on the landing page and unable to take calls unless
			// we flag the call that we tied to take as complete...			
			this.desktopAgentService.callComplete();
		}
	}

	_onClientIdentified(data) {
		this.confirmedCaller = data.detail.identifiedClient;
		this.incomingCallDetails = data.detail.incomingCallDetails;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	_onConfirmedCaller(data) {

		/**
		 * Updating whether the incoming number is verified or unverified, which will be used in action bar
		 * Analysed, this is the best place to do for stop card. Yet to figure out for Insure
		 */
		data.detail.incomingCallDetails.isUnverifiedNumber = this.unVerifiedCaller ? true : false;

		this.horizonStore.saveState(data.detail);
		this.renderMode = -1;
		this.horizonRouter.navigateToStopCard();
	}

	async _onCallEnded(data) {
		this.renderMode = -1;
		// TODO: Consider how to recover if the web service call fails. Should this call perhaps be in the end call modal after all
		await this.serviceCallHelper.asyncCall(this.channelService.endCall(data.detail.incidentRecId, data.detail.endCallReason.key));
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
		landingPageData = await this.serviceCallHelper.asyncCall(this.channelService.initialise());
		if (landingPageData) {
			this.horizonViewManager.UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId });
			this.eventAggregator.publish('horizon-update-welcome-bar', { fullname: landingPageData.agentFullName });
		}
	}

	_toggleBusyFlag() {
		this.isBusy = this.isBusy ? false : true;
	}

	landingPageErrorHandler(exception, context) {
		try {
			if (exception instanceof TypeError) {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `${context}: ${exception.message}`
				}
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
			else if (exception instanceof HttpStatusError) {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `${context}: ${exception.status} - ${exception.message}`
				}
				console.log(exception.message);
				console.log(exception.output);
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
			else {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `${context}: UNEXPECTED ERROR - ${exception.message}`
				}
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
		}
		finally {
			// Just a flag to inform the _onNewCall event handler that the error was handled.
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
					.incomingCallDetails = "${this.incomingCallDetails}" 
					@confirmed-caller="${(data) => this._onConfirmedCaller(data)}"
					@call-ended="${(data) => this._onCallEnded(data)}">
				</horizon-confirm-caller>`;
		}
	}

	_renderUnverifiedUser() {
		if (this.renderMode === RENDER_MODE.SEARCH_CALLER) {
			return html`
				<horizon-search-client 
					.unverifiedCaller="${this.unVerifiedCaller}"
					.incomingCallDetails="${this.incomingCallDetails}"
					@on-client-identified="${(data) => this._onClientIdentified(data)}"
					@call-ended="${async (data) => this._onCallEnded(data)}">
				</horizon-search-client>`;
		}
		else if (this.renderMode === RENDER_MODE.INSURE_SEARCH_CALLER) {
			return html`
				<horizon-insure-search-client
					.incomingCallDetails="${this.incomingCallDetails}"
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
					<capitec-button slot="footer" type="clear" label="Retry" @click=${() => this.renderMode = -1}></capitec-button>
				</capitec-modal>
			`;
		}
	}
}

customElements.define(`landing-page`, LandingPage);
