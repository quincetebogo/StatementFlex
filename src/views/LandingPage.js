import { View, html, css } from 'platform/elements';
import '../components/HorizonClient';
import 'platform/components/buttons/Button';

export class LandingPage extends View {


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
					width: 1511px;
				}

				.left {
					grid-area: left;
					width: 100%;
					
				}

				.middle {
					grid-area: middle;
					width: 100%;
					height: 400px;
					text-align: justify-center;
				}

				.right {
					grid-area: right;
					justify-self: center;
					width: 100%;
				}
				.hello-client{
					width: 352px;
					height: 920px;
					padding: 0px 0px 0px 0px;
			
				
				}
				.call-waiting{
					display:flex;
					width: 853.41px;
					height: 920px;
					padding: 0px 0px 0px 0px;
					text-align:center;
					line-height: 40px;
					align-items: center;
					background-color: white;
					border-radius: none;

				}
				capitec-label{
					border: white;
				}
				.insights{
					width: 256.66px;
					height: 920px;
					padding: 0px 0px 0px 0px;
				}
				`];
	}

	render() {
		return html`
			<section class="grid-container">
				<div class="left">
					<capitec-card class="hello-client">
						

					<div class="product-buttons">

						<capitec-button-bar>
							<capitec-icon class="style-scope view-icon" icon="product/transact" size="medium"></capitec-icon>
							<capitec-button type="clear" label="Savings Account"></capitec-button>
							<capitec-label label="Know what you get, know what you pay"></capitec-label>
						</capitec-button-bar>
						<capitec-button-bar>
							<capitec-icon class="style-scope view-icon" icon="product/save" size="medium"></capitec-icon>	
							<capitec-button type="clear" label="Savings Plan"></capitec-button>	
							<capitec-label label="Let your money make money"></capitec-label>	
						</capitec-button-bar>
						<capitec-button-bar>
							<capitec-icon class="style-scope view-icon" icon="product/insure" size="medium"></capitec-icon>	
							<capitec-button type="clear" label="Insure"></capitec-button>	
							<capitec-label label="One plan, more cover"></capitec-label>			
						</capitec-button-bar>
						<capitec-button-bar>
							<capitec-icon class="style-scope view-icon" icon="product/credit" size="medium"></capitec-icon>
							<capitec-button type="clear" label="Credit"></capitec-button>
							<capitec-label label="Rethink credit, realise dreams"></capitec-label>	
						</capitec-button-bar>
					</div>
					</capitec-card>
				</div>
		
				<div class="middle">
					<capitec-card class="call-waiting">
					
							<capitec-label type="title" label="Waiting for your next call..." ></capitec-label>
							<capitec-label type="default" label="Please wait while we connect you to your next caller"></capitec-label>
						
					</capitec-card>
				</div>

				<div class="right">
					<capitec-card class="insights">
						
					</capitec-card>
				</div>
			</section>		
		`;

	}
}
console.log('On the landing page');
customElements.define(`landing-page`, LandingPage);