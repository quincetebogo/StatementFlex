import { Component, html, css } from 'platform/elements';

export class LandingPageWaitForCall extends Component {

	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
			.call-waiting-card {
				width: 100%;
				height: 876px;
				padding: 0px 0px 0px 0px;
				text-align: center;
				line-height: 40px;
				align-items: center;
				background-color: white;
				border-radius: none;
				justify-content: center;
			}
			
			.needimage{
				height: 120px;
				width: 170px;
				margin: 24px 24px 18px 24px;
			}

			#waiting-text{
				color: #003652;
			}
			`];
	}


	render() {
		return html`
			<capitec-card class="call-waiting-card">
				<div>
					${this.renderWaitingForCall()}
				</div>
			</capitec-card>

		`;
	}

	renderWaitingForCall() {
		return html`
			<img src="../images/LandingPageImages/need.svg" class="needimage"/>
			<capitec-label id="waiting-text" type="title" label="Waiting for your next call..." ></capitec-label>
			<capitec-label type="default" label="Please wait while we connect you to your next caller"></capitec-label>
			`;
	}
}

window.customElements.define(`landingpage-waitforcall`, LandingPageWaitForCall); 
