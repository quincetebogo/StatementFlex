import { Component, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

export class LandingPageWaitForCall extends Component {

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
	}

	static get styles() {
		return [
			super.styles,
			css`
			.call-waiting{
				width: 1073px;
				height: 770px;
				padding: 0px 0px 0px 0px;
				text-align: center;
				line-height: 40px;
				align-items: center;
				background-color: white;
				border-radius: none;
			}
			
			.needimage{
				height: 120px;
				width: 170px;
				margin: 24px 24px 18px 24px;
			}
			#waiting-text{
				color: #003652;
			}
		
			.userwaiting{
				display: grid;
				grid-template-rows: 1fr 1fr 1fr;
				text-align: center;
				width: 1073px;
				height: 770px;
			}
			`];
	}


	render() {
		return html`
			<capitec-card class="call-waiting">
				<div>
					<capitec-group class="userwaiting" layout="absolute">
						<div></div>
						<div>
							${this.renderWaitingForCall()}
							${this.renderShowConfirmButton()}
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
		this.eventAggregator.publish('horizon-temp-button', {});
		console.log('triggering dialog');
	}

	/// temporary button trigger until the incoming call pop is working
	renderShowConfirmButton() {
		return html`
				<div>
					<capitec-button 
						class="buttons" 
						type="credit" 
						label="Click to see modal" 
						@click="${() => this.triggerConfirmDialog()}"> 
					</capitec-button>
				</div>`;
		return html``;
	}
}

window.customElements.define(`landingpage-waitforcall`, LandingPageWaitForCall);