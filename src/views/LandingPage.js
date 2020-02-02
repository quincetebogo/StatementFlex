import { View, html, css } from 'platform/elements';
import '../components/HorizonClient';
import 'platform/components/buttons/Button';

export class LandingPage extends View {

	constructor() {
		super();
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
					height: 920px;
					width: 1903px;
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
				}

				.left-card {
					width: 440px;
					height: 920px;
					padding: 0px 0px 0px 0px;
					
				
				}
				.call-waiting{

					width: 1064px;
					height: 920px;
					padding: 0px 0px 0px 0px;
					text-align: center;
					line-height: 40px;
					align-items: center;
					background-color: white;
					border-radius: none;

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

				.insights{
					width: 320px;
					height: 920px;
					padding: 0px 0px 0px 0px;
				}
			
				img{
					width:320px;
					height: 920px;
				}
				capitec-button-bar{
					padding: 8px 0px 8px 0px;
					background-color: gainsboro;
				}

				#buttons{
					width: 440px;
				
				}
				.needimage{
					height: 120px;
					width: 170px;
					margin: 24px 24px 18px 24px;
				}
				#waiting-text{
					color: #003652;
				}
				.userrole{
					display: grid;
					grid-template-rows: 1fr 1fr 1fr;
					text-align: center;
					width:440px;
					height:192px;
				}
				.userwaiting{
					display: grid;
					grid-template-rows: 1fr 1fr 1fr;
					text-align: center;
					width: 1064px;
					height: 920px;
				}
				`];
	}

	render() {
		return html`
			<section class="grid-container">
				<div class="left">
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
							<capitec-button id="buttons" type="primary" label="Credit"></capitec-button>
						</capitec-button-bar>
				</capitec-card>
					</capitec-card>
				</div>
		
				<div class="middle">
					<capitec-card class="call-waiting">
						<div>
						<capitec-group class="userwaiting" layout="absolute">
						<div></div>
						<div>
							<img src="../images/LandingPageImages/need.svg" class="needimage"/>
							<capitec-label id="waiting-text" type="title" label="Waiting for your next call..." ></capitec-label>
							<capitec-label type="default" label="Please wait while we connect you to your next caller"></capitec-label>
						</div>
						</capitec-group>
						</div>
					</capitec-card>
				</div>

				<div class="right">
					<capitec-card class="insights">
						<img src="../images/LandingPageImages/Banner.png" alt="banner" />
					</capitec-card>
				</div>
			</section>		
		`;

	}
}
console.log('On the landing page');
customElements.define(`landing-page`, LandingPage);