import { View, html, css } from 'platform/elements';
import '../components/HorizonClient';
import '../components/HorizonLeftUI';
import 'platform/components/buttons/Button';
import '../components/HorizonRightUI';
import '../components/HorizonMiddleUI';

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
					height: 770px;
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
					height:770px;
				}
				
				horizon-user{
					width: 440px;
					height: 770px;
					padding: 0px 0px 0px 0px;
				}
			
				horizon-rightuser{
					width: 320px;
					height: 770px;
				}
				
	
				`];
	}

	renderleftUI() {
		return html`
			<horizon-user></horizon-user>
		`;
	}
	renderRightImage() {
		return html`
			<horizon-rightuser></horizon-rightuser>
		`;
	}
	renderMiddleSection() {
		return html`
			<horizon-middle-section></horizon-middle-section>
		`;
	}

	render() {
		return html`
			<section class="grid-container">
				<div class="left">
				${this.renderleftUI()}
				</div>
		
				<div class="middle">
					${this.renderMiddleSection()}
				</div>

				<div class="right">
					${this.renderRightImage()}
				</div>
			</section>		
		`;

	}
}
console.log('On the landing page');
customElements.define(`landing-page`, LandingPage);