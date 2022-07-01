import { Component, css, html } from 'platform/elements';

export class LandingPageWaitForCall extends Component {

	constructor() {
		super();
	}

	static get properties() {
		return {
		};
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
				height: 32px;
				width: 100%;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 24px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 32px;
				text-align: center;
			}

			#please-wait-text {
				height: 24px;
				width: 100%;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 16px;
				letter-spacing: 0;
				line-height: 24px;
				text-align: center;
			}
			#alert {
				width: 520px;
				margin-top: 10px;

				--theme-toast-icon-margin: 0px 18px 0px 26px;
			}
			`
		];
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
			<img src="/images/landingPageImages/Client_First.svg" class="needimage" />
			<capitec-label id="waiting-text" type="title" label="Waiting for your next call..."></capitec-label>
			<capitec-label id="please-wait-text" type="default" label="Please wait while we connect you to your next caller">
			</capitec-label>
			<horizon-alert-banner 
				id="alert" 
				type="warning"
				header="Notice: "
				label="All calls are being recorded and logged to your employee profile">
			</horizon-alert-banner>
			`;
	}
}

window.customElements.define(`horizon-landing-page-wait-for-call`, LandingPageWaitForCall);