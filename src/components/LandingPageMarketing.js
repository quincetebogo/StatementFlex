import { View, html, css } from 'platform/elements';
//import all UI components
//import 'platform/components/navigation/AppRouter';

export class LandingPageMarketing extends View {

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
			.insights{
				width: 100%;
				height: 770px;
				padding: 0px 0px 0px 0px;
			}
		
			img{
				width:100%;
				height: 770px;
			}
			`];
	}


	render() {
		return html`
		<capitec-card class="insights">
			<img src="../images/LandingPageImages/Banner.png" alt="banner" />
		</capitec-card>
	`;
	}

}

window.customElements.define(`landingpage-marketing`, LandingPageMarketing);