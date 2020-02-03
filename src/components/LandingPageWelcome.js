import { View, html, css } from 'platform/elements';
import { Router } from 'platform/Router';

export class LandingPageWelcome extends View {

	constructor() {
		super();

		this.userDetails = null;
		this.router = Router.getInstance();
	}

	static get properties() {
		return {
			userDetails: { type: Object }
		}
	}

	static get styles() {
		return [
			super.styles,
			css`
			.left-card {
				width: 440px;
				height: 770px;
				padding: 0px 0px 0px 0px;
			}
			.hello-card {
				width: 440px;
				height: 192px;
			}

			#hello-id {
				color: #003652;
				line-height: 72px;
				font-size: 48px;
				text-align: center;
			
			}

			#name-id {
				color: #003652;
				text-align: center;
			}

			#buttons{
				width: 440px;
			
			
			}
			.userrole{
				display: grid;
				grid-template-rows: 1fr 1fr 1fr;
				text-align: center;
				width:440px;
				height:192px;
			}
			capitec-button-bar{
				background-color: gainsboro;
				padding: 8px 0px 0px 0px;
			}
			.products{
				padding: 0px 0px 8px 0px;
				background-color: gainsboro;
			}

			`];
	}

	render() {
		return html`
				<capitec-card class="left-card">
					<div>	
						<capitec-card class="hello-card">
								<capitec-group class="userrole" layout="absolute">
								<div></div>
								<div>
									<capitec-label id="hello-id" type="title" label="Hello"></capitec-label>
 									<capitec-label  id="name-id" label="Jeffrey Anderson"></capitec-label>
								</div>
								</capitec-group>
						</capitec-card>	
					</div>		

				<capitec-card class="products">
						<capitec-button-bar>
							<capitec-button id="buttons" type="primary" label="Savings Account"></capitec-button>
						</capitec-button-bar>
						<capitec-button-bar>
							<capitec-button id="buttons" type="primary" label="Savings Plan"></capitec-button>	
						</capitec-button-bar>
						<capitec-button-bar>
							<capitec-button id="buttons" type="primary" label="Insure"></capitec-button>	
						</capitec-button-bar>
						<capitec-button-bar>
							<capitec-button id="buttons" type="primary" label="Credit" @click="${() => this.router.navigateByPath(`/product/credit`)}"></capitec-button>
						</capitec-button-bar>
				</capitec-card>
			`;
	}

}

window.customElements.define(`landingpage-welcome`, LandingPageWelcome);