import { View, html, css } from 'platform/elements';
import 'platform/components/buttons/Button';
import { EventAggregator } from 'platform/EventAggregator';

import '../../components/LandingPageWelcome';
import '../../components/LandingPageWaitForCall';
import '../../components/LandingPageMarketing';
import '../../components/ConfirmCallerDetailsComponent';

import { StopCardService } from '../../services/StopCardService';

export class LandingPage extends View {

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.fullname = ``;
		this.displayConfirmedCaller = false;

		/// Temporary event to catch temporary button trigger to invoke comfirmed call dialog
		this.eventAggregator.subscribe(`horizon-temp-button`, (event) => this.onTempButtonPressed(event));
	}

	async connectedCallback() {
		super.connectedCallback();

		let landingPageData = null;
		let confirmedCaller = null;
		try {
			landingPageData = await StopCardService.getInstance().initialise();
		}
		catch (ex) {
			// TODO: better handling must come here
			console.log(ex);
		}

		if (landingPageData != null) {
			this.eventAggregator.publish('horizon-top-bar-data', {
				agentFullName: landingPageData.agentFullName,
				employeeId: landingPageData.loggedInAgent.employeeId
			});
			this.fullname = landingPageData.loggedInAgent.fullName;
		}
		else {
			this.eventAggregator.publish('horizon-top-bar-data', { agentFullName: `unknown`, employeeId: `unknown` });
			this.fullname = `unknown`;
		}
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
			incomingNumber: "082 555 9090",
			voiceReference: "34562783",
			ivrOption: 'Stop Card', // TODO: fix this to whatever is right
			incidentNo: '1234567',
			agentPhoneNumber: '021 8523086'
		};


		// Web service calls - must still handle errors
		try {
			let acceptedCall = await StopCardService.getInstance().acceptCall(incomingCallData);

			// should initialise from acceptedCall and other sources (Add Caller Details info)
			let incomingCallerData = {
				incomingNumber: incomingCallData.incomingNumber,
				voiceReference: incomingCallData.voiceReference,
				ivrOption: incomingCallData.ivrOption,
				incidentNo: incomingCallData.incidentNo,
				agentPhoneNumber: incomingCallData.agentFullName,
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
				birthday: identifiedCaller.clientPersonalInformation.value.birthdate.value
			}

			this.displayConfirmedCaller = true;
		}
		catch (error) {
			console.log(error);
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
				.grid-container {
					display: grid;
					grid-template-columns: 0.413534fr 1fr 0.300752fr;
					grid-template-areas: "left middle right";
					grid-gap: 24px;
					background-color: gainsboro;
					height: 770px;
					width: 1890px;
				}

				.left {
					grid-area: left;
					width: 440px;
					background-color: gainsboro;
				}

				.middle {
					grid-area: middle;
					width: 1064px;
					text-align: center;
				}

				.right {
					grid-area: right;
					justify-self: center;
					width: 320px;
					height:770px;
				}
				
				horizon-user{
					width: 440px;
					height: 770px;
					padding: 0px 0px 0px 0px;
				}
			
				horizon-rightuser{
					width: 320px;
					height: 770px;
				}
				
	
				`];
	}

	renderleftUI() {
		return html`
			<landingpage-welcome .fullname="${this.fullname}"></landingpage-welcome>
		`;
	}
	renderRightImage() {
		return html`
			<landingpage-marketing></landingpage-marketing>
		`;
	}
	renderMiddleSection() {
		return html`
			<landingpage-waitforcall></landingpage-waitforcall>
		`;
	}

	render() {
		return html`
			<section class="grid-container">
				<div class="left">
				${this.renderleftUI()}
				</div>
		
				<div class="middle">
					${this.renderMiddleSection()}
				</div>

				<div class="right">
					${this.renderRightImage()}
				</div>
			</section>		

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