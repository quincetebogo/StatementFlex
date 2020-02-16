import { View, html, css } from 'platform/elements';
//Added for navigation to the modal
import { Router } from 'platform/Router';
import './ConfirmCallerDetailsComponent';


export class LandigPageWaitForCall extends View {

	constructor() {
		super();

		//Added for navigation to the modal
		this.router = Router.getInstance();
		this.displayConfirmedCaller = false;

	}

	static get properties() {
		return {
			displayConfirmedCaller: { type: Boolean }
		}
	}

	static get styles() {
		return [
			super.styles,
			css`
			.call-waiting{
				width: 1067.8px;
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
				width: 1067.8px;
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
							${this.renderConfirmedUser()}
						</div>
						${this.renderShowConfirmButton()};
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

	renderConfirmedUser() {
		if (this.displayConfirmedCaller) {
			return html`<confirm-caller-component></confirm-caller-component>`;
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

window.customElements.define(`landingpage-waitforcall`, LandigPageWaitForCall);