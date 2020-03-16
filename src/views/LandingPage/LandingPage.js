import { View, html, css } from 'platform/elements';
import 'platform/components/buttons/Button';
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';

import '../../components/LandingPageWaitForCall';
import '../../components/dialogs/ConfirmCallerDetails';
import '../../components/dialogs/SearchClientDetails';

import { StopCardService } from '../../services/StopCardService';
import { HorizonViewManager } from '../../HorizonViewManager';

const RENDER_MODE = {
	CONFIRM_CALLER: 0,
	SEARCH_CALLER: 1
};

export class LandingPage extends View {

	constructor() {
		super();
		this.renderMode = -1;
		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe(`horizon-temp-button`, () => this.onNewCall({ Date: "2020-03-11T16:05:44.5173009+02:00", IncomingTelephoneNumber: "0631152973", VoiceReferenceNumber: "123456", IVROptionCode: 'StopCard', IncidentReferenceNumber: '1234567', AgentTelephoneNumber: '0219412557' }));
		this.eventAggregator.subscribe(`new-call`, (event) => this.onNewCall(event));
		this.eventAggregator.subscribe(`confirmed-caller`, (event) => this.onCallerConfirmed(event));
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.router = Router.getInstance();

		this.isBusy = false;

		//TODO: cleanup
		//this.voiceReferenceNumber = ``;
		//this.incomingTelephoneNumber = ``;
		//this.ivrOption = ``;
		//this.incidentReferenceNumber = ``;
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
		this.horizonViewManager.UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId });

		this.eventAggregator.publish('landing-page-loaded', {});
	}

	async GetLandingPageData(landingPageData) {
		try {
			landingPageData = await StopCardService.getInstance().initialise();

		}
		catch (ex) {
			// TODO: better handling must come here
			console.log(ex);
		}

		return landingPageData;
	}

	async onNewCall(eventData) {
		console.log("new call received:", eventData);

		//TODO: Remove
		if (eventData.IVROptionCode == null) {
			eventData.IVROptionCode = 'StopCard';
		}
		if (eventData.IncidentReferenceNumber == null) {
			eventData.IncidentReferenceNumber = '1234567';
		}


		///TODO: Replace this with data that comes from the POP
		//let incomingCallData = {
		//	incomingNumber: "0631152973",
		//	voiceReference: "123456",
		//	ivrOption: 'StopCard', // TODO: fix this to whatever is right
		//	incidentNo: '1234567',
		//	agentPhoneNumber: '0219412557'
		//};


		// Web service calls - must still handle errors
		try {
			let stopCardService = StopCardService.getInstance();
			this.isBusy = true;

			let acceptedCall = await StopCardService.getInstance().acceptCall(eventData);

			if (stopCardService.isConfirmedCaller(acceptedCall)) {
				this.confirmedCaller = acceptedCall;
				this.isUnverifiedCaller = null;

				// TODO: injected into model. Not the best way to do this. look for an alternative
				this.confirmedCaller.incidentReferenceNumber = incomingCallData.incidentNo;
				this.confirmedCaller.agentTelephoneNumber = incomingCallData.agentPhoneNumber;

				this.renderMode = RENDER_MODE.CONFIRM_CALLER;
			}
			else if (stopCardService.isUnverifiedCaller(acceptedCall)) {
				this.confirmedCaller = null;
				this.isUnverifiedCaller = acceptedCall;

				// TODO: injected into model. Not the best way to do this. look for an alternative
				this.isUnverifiedCaller.agentTelephoneNumber = incomingCallData.agentPhoneNumber;

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
					.unverifiedCaller="${this.isUnverifiedCaller}">
				</horizon-search-client>`;
		}
	}
}

customElements.define(`landing-page`, LandingPage);
