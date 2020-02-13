import { View, html, css } from 'platform/elements';
import '../../components/LandingPageWelcome';
import 'platform/components/buttons/Button';
import '../../components/LandingPageMarketing';
import '../../components/LandingPageWaitForCall';
import { EventAggregator } from 'platform/EventAggregator';

export class LandingPage extends View {

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.fullname = ``;
	}

	async connectedCallback() {
		super.connectedCallback();

		// IMPLEMENT WEB SERVICE CALL PROPERLY
		// let landingPageData = await StopCardService.getInstance().initialise();


		let landingPageData = { fullname: 'Jeffrey Anderson', role: `contact centre agent` };

		this.eventAggregator.publish('horizon-top-bar-data', { fullname: landingPageData.fullname, role: landingPageData.role });
		this.fullname = landingPageData.fullname;
	}

	static get properties() {
		return {
			fullname: { type: String },
		}
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
					width: 1890px;
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
			<landingpage-welcome .fullname="${this.fullname}"></landingpage-welcome>
		`;
	}
	renderRightImage() {
		return html`
			<landingpage-marketing></landingpage-marketing>
		`;
	}
	renderMiddleSection() {
		return html`
			<landingpage-waitforcall></landingpage-waitforcall>
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