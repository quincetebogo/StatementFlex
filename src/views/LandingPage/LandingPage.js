import { View, html, css } from 'platform/elements';
import '../../components/LandingPageWelcome';
import 'platform/components/buttons/Button';
import '../../components/LandingPageMarketing';
import '../../components/LandingPageWaitForCall';
import { EventAggregator } from 'platform/EventAggregator';

//import { StopCardService } from `../../services/StopCardService`;
import { StopCardService } from '../../services/StopCardService';
export class LandingPage extends View {

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.fullname = ``;
		this.displayConfirmedCaller = false;
	}

	async connectedCallback() {
		super.connectedCallback();

		let landingPageData = null;
		let confirmedCaller = null;
		try {
			landingPageData = await StopCardService.getInstance().initialise();
			//confirmedCaller = await StopCardService.getInstance().acceptCall();
		}
		catch (ex) {
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

		// --StopCardService call to get confirmed suer detials
		// if it woerks set displayConfirmedCaller = true
		// initialize confirmedCaller with data...

		// let confirmedCaller = await StopCardService.getInstance().acceptCall();
		// this.eventAggregator.publish('horizon-call-popup', {
		// 	referenceNumber: confirmedCaller.voiceReferenceNumber, ivrOption: confirmedCaller.ivrOptionCode,
		// 	incomingNumber: confirmedCaller.incomingTelephoneNumber,
		// });

		//call identify caller 
		// let identifyCaller = await StopCardService.getInstance().search();
		// this.eventAggregator.publish(`horizon-confirm-caller`, {
		// 	idNumber: identifyCaller.southAfricanIDNumber, verifiedNumber: identifyCaller.verifiedCellphoneNumber,
		// 	livesIn: identifyCaller.livesIn, language: identifyCaller.languagePreference, birthday: identifyCaller.birthdate,
		// });
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
	renderShowConfirmButton() {
		if (this.displayConfirmedCaller != true) {
			return html`
				<div>
					<capitec-button class="buttons" type="credit" label="Click to see modal" @click="${() => this.displayConfirmedCaller = true}"></capitec-button>
				</div>`;
		}

		return html``;
	}
}
console.log('On the landing page');
customElements.define(`landing-page`, LandingPage);