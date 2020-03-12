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
		this.eventAggregator.subscribe(`horizon-temp-button`, (event) => this.onTempButtonPressed(event));
		this.eventAggregator.subscribe(`confirmed-caller`, (event) => this.onCallerConfirmed(event));
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.router = Router.getInstance();

		this.isBusy = false;

		this.voiceReferenceNumber = ``;
		this.incomingTelephoneNumber = ``;
		this.ivrOption = ``;
		this.incidentReferenceNumber = ``;
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
		this.horizonViewManager.UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId })
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

	async onTempButtonPressed(event) {
		console.log("Temp button presssed received");


		///TODO: Replace this with data that comes from the POP
		let incomingCallData = {
			incomingNumber: "0631152973",
			voiceReference: "123456",
			ivrOption: 'StopCard', // TODO: fix this to whatever is right
			incidentNo: '1234567',
			agentPhoneNumber: '0219412557'
		};


		// Web service calls - must still handle errors
		try {
			this.isBusy = true;

			let acceptedCall = await StopCardService.getInstance().acceptCall(incomingCallData);

			// Initialize from the results of the above web service calls.
			// this will be passed into the confirmed caller dialog
			this.confirmedCaller = acceptedCall;
			this.confirmedCaller.incidentReferenceNumber = incomingCallData.incidentNo;
			this.confirmedCaller.agentTelephoneNumber = incomingCallData.agentPhoneNumber;
			this.renderMode = /*this.confirmedCaller.identificationMethods ? RENDER_MODE.SEARCH_CALLER :*/ RENDER_MODE.CONFIRM_CALLER;
			//this.confirmedCaller.isUnverifiedNumber = this.renderMode == RENDER_MODE.SEARCH_CALLER;

			this.displayConfirmedCaller = true;
		}
		catch (error) {

			console.log(error);
			this.confirmedCaller = null;
			this.renderMode = -1;
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
		${this.renderUnverifiedUser()}
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
		if (this.renderMode == RENDER_MODE.CONFIRM_CALLER) {
			return html`
				<horizon-confirm-caller 
					.confirmedCaller="${this.confirmedCaller}"
					@confirmed-caller="${(data) => this.onCallerConfirmed(data)}"
					@call-ended="${(data) => this.onCallEnded(data)}">
				</horizon-confirm-caller>`;
		}
	}

	renderUnverifiedUser() {
		if (this.renderMode == RENDER_MODE.SEARCH_CALLER) {
			return html`
				<horizon-search-client 
					.confirmedCaller="${this.confirmedCaller}">
				</horizon-search-client>`;
		}
	}
}

customElements.define(`landing-page`, LandingPage);