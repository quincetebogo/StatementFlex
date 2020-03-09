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
		// this.fullName = "Mr I. Makatini";
		// this.idNumber = "8807120371081";
		// this.livesIn = "Somerset West";
		// this.birthday = "12 July";
		// this.verifiedCellphone = "082 555 9090";
		// this.language = "English";

		///TODO: Replace this with data that comes from the POP
		let incomingCallData = {
			incomingNumber: "0631152973",
			voiceReference: "123456",
			ivrOption: 'StopCard', // TODO: fix this to whatever is right
			incidentNo: '123456',
			agentPhoneNumber: '0219412557'
		};


		// Web service calls - must still handle errors
		try {
			let acceptedCall = await StopCardService.getInstance().acceptCall(incomingCallData);

			// should initialise from acceptedCall and other sources (Add Caller Details info)
			let incomingCallerData = {
				incomingNumber: acceptedCall.incomingTelephoneNumber.value,
				voiceReference: acceptedCall.voiceReferenceNumber.value,
				ivrOption: acceptedCall.ivrOption.value,
				incidentNo: acceptedCall.incidentReferenceNumber,
				agentPhoneNumber: incomingCallData.agentPhoneNumber,
				nonClientFullName: '',
				nonClientCellPhone: '',
				nonClientIDNumber: '',
				nonClientRelationship: ''
			}

			let identifiedCaller = await StopCardService.getInstance().identifyCaller(incomingCallerData);

			// Initialize from the results of the above web service calls.
			// this will be passed into the confirmed caller dialog
			this.confirmedCaller = {
				referenceNumber: identifiedCaller.voiceReferenceNumber,
				ivrOptions: [
					{ id: 'IVR', text: 'Stop Card' }
				],
				incomingNumber: identifiedCaller.incomingTelephoneNumber,
				fullName: identifiedCaller.clientPersonalInformation.value.name.value,
				idNumber: identifiedCaller.clientPersonalInformation.value.southAfricanIDNumber.value,
				verifiedCellphone: identifiedCaller.clientPersonalInformation.value.verifiedTelephoneNumber.value,
				livesIn: identifiedCaller.clientPersonalInformation.value.livesIn.value,
				language: identifiedCaller.clientPersonalInformation.value.languagePreference.value,
				birthday: identifiedCaller.clientPersonalInformation.value.birthdate.value,
				incidentNo: incomingCallerData.incidentNo
			}

			this.displayConfirmedCaller = true;
		}
		catch (error) {
			console.log(error);
			this.confirmedCaller = {
				referenceNumber: '123456',
				ivrOptions: [
					{ id: 'IVR', text: 'Stop Card' }
				],
				incomingNumber: '0631152973',
				fullName: 'jeff',
				idNumber: '6712075142087',
				verifiedCellphone: '084 6161747',
				livesIn: 'SW',
				language: 'ENG',
				birthday: 'DEC',
				incidentNo: '123456',
				agentPhoneNumber: "0219412557"
			}

			this.displayConfirmedCaller = true; //TODO: remove debug
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