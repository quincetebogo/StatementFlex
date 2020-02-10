import { View, html, css } from 'platform/elements';
import '../../components/LandingPageWelcome';
import 'platform/components/buttons/Button';
import '../../components/LandingPageMarketing';
import '../../components/LandingPageWaitForCall';

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
					grid-template-columns: 28% 53% 16%;
					grid-template-areas: "left middle right";
					grid-gap: 20px;
					background-color: gainsboro;
					height: 100%;
					width: 100%;
				}
				.left {
					grid-area: left;
					width: 100%;
					background-color: gainsboro;
				}
				.middle {
					grid-area: middle;
					width: 100%;
					text-align: center;
				}
				.right {
					grid-area: right;
					justify-self: center;
					width: 100%;
					height: 100%;
				}
			`];
	}

	renderleftUI() {
		return html`
			<landingpage-welcome></landingpage-welcome>
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