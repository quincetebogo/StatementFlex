import { View, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';

import 'platform/components/buttons/Button';

import '../components/landingPage/LandingPageWaitForCall';
import '../components/dialogs/ConfirmCallerDetails';
import '../components/dialogs/SearchClientDetails';

import { StopCardService } from '../services/StopCardService';
import { ServiceCallHelper } from '../utils/serviceCallHelper';
import { HorizonViewManager } from '../HorizonViewManager';

const RENDER_MODE = {
	CONFIRM_CALLER: 0,
	SEARCH_CALLER: 1
};

export class LandingPage extends View {

	constructor() {
		super();
		this.renderMode = -1;
		this.eventAggregator = EventAggregator.getInstance();

		this.eventAggregator.subscribe(`horizon-temp-button`, (event) => this.onNewCall(event));
		this.eventAggregator.subscribe(`new-call`, (event) => this.onNewCall(event));
		this.eventAggregator.subscribe(`confirmed-caller`, (event) => this.onCallerConfirmed(event));
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.router = Router.getInstance();
		this.stopCardService = StopCardService.getInstance();
		this.serviceCallHelper = new ServiceCallHelper(t => { this.toggleBusyFlag() });

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

		let landingPageData = null;

		landingPageData = await this.GetLandingPageData(landingPageData);
		if (landingPageData) {
			this.horizonViewManager.UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId })
		}

		this.eventAggregator.publish('landing-page-loaded', {});
	}

	async GetLandingPageData() {
		return await this.serviceCallHelper.makeCall(this.stopCardService.initialise(),
			(x) => { this.handleInitErrors(x) });
	}

	toggleBusyFlag() {
		this.isBusy = this.isBusy ? false : true;
	}

	handleInitErrors(ex) {
		if (ex instanceof TypeError) {
			// Put in something to update the status bar
			console.log(ex.message, ": The channel service may be down");
		}
		else if (ex instanceof HttpStatusError) {
			// Put in something to update the status bar
			console.log(`Http Status: ${ex.status}`);
		}
		else {
			// Put in something to update the status bar
			console.log(ex);
		}
	}

	async onNewCall(eventData) {
		console.log("new call received:", eventData);

		// Web service calls - must still handle errors
		try {
			let stopCardService = StopCardService.getInstance();
			this.isBusy = true;

			let acceptedCall = await StopCardService.getInstance().acceptCall(eventData);

			if (stopCardService.isConfirmedCaller(acceptedCall)) {
				this.confirmedCaller = acceptedCall;
				this.isUnverifiedCaller = null;

				// TODO: injected into model. Not the best way to do this. look for an alternative
				this.confirmedCaller.incidentReferenceNumber = eventData.IncidentReferenceNumber;
				this.confirmedCaller.agentTelephoneNumber = eventData.AgentTelephoneNumber;

				this.renderMode = RENDER_MODE.CONFIRM_CALLER;
			}
			else if (stopCardService.isUnverifiedCaller(acceptedCall)) {
				this.confirmedCaller = null;
				this.isUnverifiedCaller = acceptedCall;

				// TODO: injected into model. Not the best way to do this. look for an alternative
				this.isUnverifiedCaller.agentTelephoneNumber = eventData.AgentTelephoneNumber;

				this.renderMode = RENDER_MODE.SEARCH_CALLER;
			}
		}
		catch (error) {
			console.log(`Accept Call Failed: `, error);
			this.confirmedCaller = null;
			this.isUnverifiedCaller = null;
			this.renderMode = -1;
			return null;
		}
		finally {
			this.isBusy = false;
		}
	}

	identifiedClient(data) {
		this.confirmedCaller = data.detail.identifiedClient;
		this.renderMode = RENDER_MODE.CONFIRM_CALLER;
	}

	onCallerConfirmed(data) {
		this.horizonViewManager.saveState(data.detail.confirmedCaller);
		this.renderMode = -1;
		this.router.navigateByPath(`/client/profile`);
	}

	onCallEnded(data) {
		console.log(data.detail);
		this.renderMode = -1;
		//		this.router.navigateByPath(`/landingpage`);
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
					@call-ended="${(data) => this.onCallEnded(data)}">
				</horizon-confirm-caller>`;
		}
	}

	renderUnverifiedUser() {
		if (this.renderMode === RENDER_MODE.SEARCH_CALLER) {
			return html`
				<horizon-search-client 
					.unverifiedCaller="${this.isUnverifiedCaller}"
					@on-client-identified="${(data) => this.identifiedClient(data)}"
					@call-ended="${(data) => this.onCallEnded(data)}">
				</horizon-search-client>`;
		}

	}

}

customElements.define(`landing-page`, LandingPage);
