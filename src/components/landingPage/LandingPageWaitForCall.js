import { Component, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';

export class LandingPageWaitForCall extends Component {

	constructor() {
		super();
		this.router = Router.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.phoneNumber = "0631152973";
	}

	static get styles() {
		return [
			super.styles,
			css`
			.call-waiting-card {
				width: 100%;
				height: 823px;
				padding: 0px 0px 0px 0px;
				text-align: center;
				line-height: 40px;
				align-items: center;
				background-color: white;
				border-radius: none;
			}

			.call-waiting-group {
				display: grid;
				grid-template-rows: 1fr 1fr 1fr;
				text-align: center;
				width: 100%;
				height: 100%;
			}
			
			.needimage{
				height: 120px;
				width: 170px;
				margin: 24px 24px 18px 24px;
			}

			#waiting-text{
				color: #003652;
			}

			.tempinput{
				height: 48px;
				line-height: 48px;
				width : 150px;
				display:inline;
			}	
			`];
	}


	render() {
		return html`
			<capitec-card class="call-waiting-card">
				<div>
					<capitec-group class="call-waiting-group" layout="absolute">
						<div></div>
						<div>
							${this.renderWaitingForCall()}
							${this.renderShowConfirmButton()}
							${this.renderHandoffButton()}
						</div>
					</capitec-group>
				</div>
			</capitec-card>

		`;
	}

	renderWaitingForCall() {
		if (this.displayConfirmedCaller != true) {
			return html`
				<img src="../images/LandingPageImages/need.svg" class="needimage"/>
				<capitec-label id="waiting-text" type="title" label="Waiting for your next call..." ></capitec-label>
				<capitec-label type="default" label="Please wait while we connect you to your next caller"></capitec-label>
			`;
		}

		return html``;
	}

	triggerConfirmDialog() {

		let eventData = {
			Date: "2020-03-11T16:05:44.5173009+02:00",
			IncomingTelephoneNumber: this.phoneNumber,
			VoiceReferenceNumber: "123456", IVROptionCode: 'StopCard',
			IncidentReferenceNumber: '1234567',
			AgentTelephoneNumber: '0219412557'
		};


		this.eventAggregator.publish('horizon-temp-button', eventData);
		console.log('triggering dialog');
	}

	triggerAssignDialog() {

		this.eventAggregator.publish('horizon-handoff-button', {});
		console.log('triggering hand-off dialog');
	}
	onPhoneNumberValueChanged(e) {
		console.log(e);
		this.phoneNumber = e.detail.new;
	}

	/// temporary button trigger until the incoming call pop is working
	renderShowConfirmButton() {
		return html`
				<capitec-text-field
					class="temptext"
					label="Phone Number" 
					value="${this.phoneNumber}"
					@value-changed="${(e) => this.onPhoneNumberValueChanged(e)}">
				</capitec-text-field>
				<capitec-button 
					class="buttons"
					type="credit" 
					label="Click to see modal" 
					@click="${() => this.triggerConfirmDialog()}"> 
				</capitec-button>
			`;
		return html``;
	}
	//temporary button for hand-off/assign modal
	renderHandoffButton() {
		return html`
				<capitec-button
					class="buttons"
					type="primary" 
					label="Assign" 
					@click="${(e) => this.triggerAssignDialog(e)}"> 
				</capitec-button>
		`;
	}
}

window.customElements.define(`landingpage-waitforcall`, LandingPageWaitForCall); 