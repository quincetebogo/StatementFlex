import { Component, html, css } from 'platform/elements';
//import all UI components
//import 'platform/components/navigation/AppRouter';

export class LandingPageMarketing extends Component {

	constructor() {
		super();

		this.userDetails = null;
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
				.landingpage-marketing-img{
					width: 320px;
					height: 876px;
				}`
		];
	}


	render() {
		return html`
			<img class="landingpage-marketing-img" src="../images/landingPageImages/Banner.png" alt="banner" />
		`;
	}

}

window.customElements.define(`landingpage-marketing`, LandingPageMarketing);