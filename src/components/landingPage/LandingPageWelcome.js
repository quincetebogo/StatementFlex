import { Component, html, css } from 'platform/elements';

import '../Common/HorizonProductBar';

export class LandingPageWelcome extends Component {

	constructor() {
		super();

		this.fullname = ``;
	}

	async connectedCallback() {
		super.connectedCallback();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();
	}

	static get properties() {
		return {
			//to extract client details from the service
			fullname: { type: String }
		}
	}

	static get styles() {
		return [
			super.styles,
			css`
			.left-card {
				width: 100%;
				height: 100%;
				padding: 0px 0px 0px 0px;
				background-color: #f4f4f4;
				border:none;
			}

			.hello-card {
				width: 100%;
				height: 192px;
			}

			#hello-id {
				color: #003652;
				line-height: 72px;
				font-size: 48px;
				text-align: center;
				font: bold 38px/64px Hind Vadodara;
			}

			#name-id {
				color: #57595d;
				text-align: center;
				font: bold 18px/30px Hind Vadodara;
			}

			.userrole{
				display: grid;
				grid-template-rows: 1fr 1fr 1fr;
				text-align: center;
				width:100%;
				height:192px;
			}
			`];
	}

	render() {
		return html`
				<div class="left-card">
					<div>	
						<capitec-card class="hello-card">
								<capitec-group class="userrole" layout="absolute">
								<div></div>
								<div>
									<capitec-label id="hello-id" type="title" label="Hello"></capitec-label>
 									<capitec-label  id="name-id" label="${this.fullname}" type="subtitle"></capitec-label>
								</div>
								</capitec-group>
						</capitec-card>	
					</div>		
					<horizon-product-bar></horizon-product-bar>
				</div>
			`;
	}
}

window.customElements.define(`landingpage-welcome`, LandingPageWelcome);
