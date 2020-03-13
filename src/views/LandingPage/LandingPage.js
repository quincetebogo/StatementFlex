import { View, html, css } from 'platform/elements';
import 'platform/components/buttons/Button';
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';

import '../../components/LandingPageWaitForCall';
import '../../components/dialogs/ConfirmCallerDetails';

import { StopCardService } from '../../services/StopCardService';
import { HorizonViewManager } from '../../HorizonViewManager';

export class LandingPage extends View {

	constructor() {
		super();

		this.displayConfirmedCaller = false;

		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe(`horizon-temp-button`, () => this.onNewCall({ Date: "2020-03-11T16:05:44.5173009+02:00", IncomingTelephoneNumber: "0631152973", VoiceReferenceNumber: "123456", IVROptionCode: 'StopCard', IncidentReferenceNumber: '1234567', AgentTelephoneNumber: '0219412557' }));
		this.eventAggregator.subscribe(`new-call`, (event) => this.onNewCall(event));
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
			displayConfirmedCaller: { type: Boolean },
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
			this.isBusy = true;

			let acceptedCall = await StopCardService.getInstance().acceptCall(eventData);

			// Initialize from the results of the above web service calls.
			// this will be passed into the confirmed caller dialog
			this.confirmedCaller = acceptedCall;

			this.displayConfirmedCaller = true;
		}
		catch (error) {

			console.log("Error trying to handle new call event:", error);
			this.confirmedCaller = null;

			this.displayConfirmedCaller = false;

			return null;

			/*
				IF acceptedCall succeeded but identifiedCaller failed then 
					we must invoke the search dialog (which must still be built)
			*/
		}
		finally {
			this.isBusy = false;
		}
	}

	onCallerConfirmed(data) {
		this.horizonViewManager.saveState(data.detail.confirmedCaller);
		this.displayConfirmedCaller = false;
		this.router.navigateByPath(`/client/profile`);
	}

	onCallEnded(data) {
		console.log(data.detail);
		this.displayConfirmedCaller = false;
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

	renderMiddleSection() {
		return html`
			<landingpage-waitforcall class="wait-for-call"></landingpage-waitforcall>
		`;
	}

	render() {
		return html`
			${this.renderMiddleSection()}
			${this.renderLoadingIndicator()}
			${this.renderConfirmedUser()}

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
		if (this.displayConfirmedCaller) {
			return html`
				<horizon-confirm-caller 
					.confirmedCaller="${this.confirmedCaller}"
					@confirmed-caller="${(data) => this.onCallerConfirmed(data)}"
					@call-ended="${(data) => this.onCallEnded(data)}">
				</horizon-confirm-caller>`;
		}

		return html``;
	}
}

customElements.define(`landing-page`, LandingPage);