import { View, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

import 'platform/components/buttons/Button';

import '../components/landingPage/LandingPageWaitForCall';
import '../components/dialogs/ConfirmCallerDetails';
import '../components/dialogs/SearchClientDetails';
import '../components/dialogs/AssignStopCard';

import { HorizonRouter } from '../shell/HorizonRouter';
import { StopCardService } from '../services/StopCardService';
import { ServiceCallHelper } from '../utils/serviceCallHelper';
import { HorizonViewManager } from '../shell/HorizonViewManager';
import { HorizonStore } from '../store/HorizonStore';
import { DesktopAgentService } from '../services/DesktopAgentService'

const RENDER_MODE = {
	CONFIRM_CALLER: 0,
	SEARCH_CALLER: 1,
};

export class LandingPage extends View {

	constructor() {
		super();
		this.renderMode = -1;
		this.eventAggregator = EventAggregator.getInstance();

		this.eventAggregator.subscribe(`new-call`, (event) => this.onNewCall(event));
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.desktopAgentService = DesktopAgentService.getInstance();

		this.stopCardService = StopCardService.getInstance();
		this.serviceCallHelper = new ServiceCallHelper(
			() => { this.toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);

		this.isBusy = false;
	}

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

	async connectedCallback() {
		super.connectedCallback();

		await this.GetLandingPageData();

		// Notify the desktop agent service that we are now on the landing page and can therefore handle an incoming call
		this.eventAggregator.publish('landing-page-loaded', {});
	}

	async GetLandingPageData() {
		let landingPageData = null;
		landingPageData = await this.serviceCallHelper.asyncCall(this.stopCardService.initialise());
		if (landingPageData) {
			this.horizonViewManager.UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId })
		}
	}

	toggleBusyFlag() {
		this.isBusy = this.isBusy ? false : true;
	}

	async onNewCall(eventData) {
		console.log("new call received:", eventData);

		let acceptedCall = await this.serviceCallHelper.asyncCall(this.stopCardService.acceptCall(eventData));
		console.log("accepted call: ", acceptedCall);

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
			console.log(`Accept Call Failed: `);
			this.confirmedCaller = null;
			this.isUnverifiedCaller = null;
			this.renderMode = -1;
		}
	}

	identifiedClient(data) {
		this.confirmedCaller = data.detail.identifiedClient;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	onCallerConfirmed(data) {
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

	onCancel() {
		this.renderMode = -1;
	}

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

	render() {

		return html`
		${this.renderMiddleSection()}
		${this.renderLoadingIndicator()}
		${this.renderConfirmedUser()}
		${this.renderUnverifiedUser()}
		`;

	}

	renderMiddleSection() {
		return html`
			<landingpage-waitforcall class="wait-for-call"></landingpage-waitforcall>
		`;
	}

	renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		}
		else
			return html`
            <capitec-loading-indicator></capitec-loading-indicator>
        `;
	}

	renderConfirmedUser() {
		if (this.renderMode === RENDER_MODE.CONFIRM_CALLER) {
			return html`
				<horizon-confirm-caller 
					.confirmedCaller="${this.confirmedCaller}"
					@confirmed-caller="${(data) => this.onCallerConfirmed(data)}"
					@call-ended="${(data) => this._onCallEnded(data)}">
				</horizon-confirm-caller>`;
		}
	}

	renderUnverifiedUser() {
		if (this.renderMode === RENDER_MODE.SEARCH_CALLER) {
			return html`
				<horizon-search-client 
					.unverifiedCaller="${this.isUnverifiedCaller}"
					@on-client-identified="${(data) => this.identifiedClient(data)}"
					@call-ended="${async (data) => this._onCallEnded(data)}">
				</horizon-search-client>`;
		}
	}
}

customElements.define(`landing-page`, LandingPage);
