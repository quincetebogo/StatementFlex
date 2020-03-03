import { View, html, css } from 'platform/elements';
import 'platform/components/buttons/Button';
import { EventAggregator } from 'platform/EventAggregator';

import '../../components/LandingPageWaitForCall';
import '../../components/ConfirmCallerDetailsComponent';

import { StopCardService } from '../../services/StopCardService';
import { HorizonViewManager } from '../../HorizonViewManager';

export class LandingPage extends View {

	constructor() {
		super();

		this.displayConfirmedCaller = false;

		this.eventAggregator = EventAggregator.getInstance();

		/// Temporary event to catch temporary button trigger to invoke comfirmed call dialog
		this.eventAggregator.subscribe(`horizon-temp-button`, (event) => this.onTempButtonPressed(event));

		this.voiceReferenceNumber = ``;
		this.incomingTelephoneNumber = ``;
		this.ivrOption = ``;
		this.incidentReferenceNumber = ``;
	}

	static get properties() {
		return {
			incomingTelephoneNumber: { type: String },
			voiceReferenceNumber: { type: String },
			ivrOption: { type: String },
		}
	}
	async connectedCallback() {
		super.connectedCallback();

		let landingPageData = null;

		landingPageData = await this.GetLandingPageData(landingPageData);
		HorizonViewManager.getInstance().UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId })
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
			incomingNumber: "0710569987",
			voiceReference: "123456",
			ivrOption: 'StopCard',
			incidentNo: '123456',
			agentPhoneNumber: '0219412557'
		};


		// Web service calls - must still handle errors
		try {
			let acceptedCall = await StopCardService.getInstance().acceptCall(incomingCallData);

			// should initialise from acceptedCall and other sources (Add Caller Details info)

			// let identifiedCaller = await StopCardService.getInstance().identifyCaller(incomingCallerData);

			// Initialize from the results of the above web service calls.
			// this will be passed into the confirmed caller dialog
			this.confirmedCaller = acceptedCall;


			this.displayConfirmedCaller = true;
		}
		catch (error) {
			console.log(error);
			this.confirmedCaller = null;

			this.displayConfirmedCaller = false;

			return null;

			/*
				IF acceptedCall succeeded but identifiedCaller failed then 
					we must invoke the search dialog (which must still be built)
			*/
		}
	}

	static get properties() {
		return {
			fullname: { type: String },
			displayConfirmedCaller: { type: Boolean }
		}
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
			${this.renderConfirmedUser()}
		`;

	}

	renderConfirmedUser() {
		if (this.displayConfirmedCaller) {
			return html`<confirm-caller-component .confirmedCaller="${this.confirmedCaller}"></confirm-caller-component>`;
		}

		return html``;
	}
}

customElements.define(`landing-page`, LandingPage);