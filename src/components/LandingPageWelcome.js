import { View, html, css } from 'platform/elements';
import { Router } from 'platform/Router';

import '../components/Common/HorizonProductTile';

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
            horizon-product-tile{
                padding: 10px 0px 0px 8px;
                width: 98%;
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
						<horizon-product-tile type="transact" 
											  label="Savings Account" 
											  subtitle="Know what you get, know what you pay"
											  icon="product/transact-white">
						</horizon-product-tile>
						<horizon-product-tile type="save" 
											  label="Savings Plan"
											  subtitle="Let your money make money"
											  icon="product/save-white"
											  @click="${() => this.router.navigateByPath(`/product/savings-plan`)}">
						</horizon-product-tile>
						<horizon-product-tile type="insure" 
											  label="Insure"
											  subtitle="One plan, more cover"
											  icon="product/insure-white">
						</horizon-product-tile>
						<horizon-product-tile type="credit" 
											  label="Credit" 
											  subtitle="Rethink credit, realise dreams"
											  icon="product/credit-white"
											  @click="${() => this.router.navigateByPath(`/product/credit`)}">
						</horizon-product-tile>
					</capitec-card>
			`;
	}
}

window.customElements.define(`landingpage-welcome`, LandingPageWelcome);