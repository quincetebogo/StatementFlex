import { Component, html, css } from 'platform/elements';
import { Router } from 'platform/Router';

import '../components/Common/HorizonProductTile';

export class LandingPageWelcome extends Component {

	constructor() {
		super();

		this.fullname = ``;
		this.router = Router.getInstance();
	}

	async connectedCallback() {
		super.connectedCallback();

		console.log(`LandingPageWelcome: connectedCallback`);
	}

	async disconnectedCallback() {
		super.disconnectedCallback();

		console.log(`LandingPageWelcome: disconnectedCallback`);
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

			.products-card{
				padding: 0px;
				background-color: #f4f4f4;
				border: 0px;
			}

            .product-button{
				height:80px;
                padding: 0px 0px 0px 0px;
				width: 440px;
				margin-top:24px;
			}
			`];
	}

	render() {
		console.log(`rendering landing page welcome`);

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

					<div class="products-card">
						<horizon-product-tile class="product-button"
											  type="transact" 
											  label="Savings Account" 
											  subtitle="Know what you get, know what you pay"
											  icon="product/transact-white"
											  @click="${() => this.router.navigateByPath(`/product/savings-account`)}">
						</horizon-product-tile>
						<horizon-product-tile class="product-button"
											  type="save" 
											  label="Savings Plan"
											  subtitle="Let your money make money"
											  icon="product/save-white"
											  @click="${() => this.router.navigateByPath(`/product/savings-plan`)}">
						</horizon-product-tile>
						<horizon-product-tile class="product-button"
											  type="insure" 
											  label="Insure"
											  subtitle="One plan, more cover"
											  icon="product/insure-white"
											  @click="${() => this.router.navigateByPath(`/product/insure`)}">
						</horizon-product-tile>
						<horizon-product-tile class="product-button"
											  type="credit" 
											  label="Credit" 
											  subtitle="Rethink credit, realise dreams"
											  icon="product/credit-white"
											  @click="${() => this.router.navigateByPath(`/product/credit`)}">
						</horizon-product-tile>
					</div>
				</div>
			`;
	}
}

window.customElements.define(`landingpage-welcome`, LandingPageWelcome);