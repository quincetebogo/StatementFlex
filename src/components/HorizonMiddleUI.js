import { View, html, css } from 'platform/elements';
//import all UI components
import 'platform/components/navigation/AppRouter';

export class HorizonMiddleUI extends View {

	constructor() {
		super();
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
					<img src="../images/LandingPageImages/need.svg" class="needimage"/>
					<capitec-label id="waiting-text" type="title" label="Waiting for your next call..." ></capitec-label>
					<capitec-label type="default" label="Please wait while we connect you to your next caller"></capitec-label>
				</div>
					</capitec-group>
				</div>
			</capitec-card>
		`;
	}

}

window.customElements.define(`horizon-middle-section`, HorizonMiddleUI);