import { Component, css, html } from 'platform/elements';

export class InfoGraphic extends Component {

	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
				.landingpage-marketing-img{
					width: var(--horizon-right-panel-width, 320px);
					height: 876px;
				}`
		];
	}


	render() {
		return html`
			<img class="landingpage-marketing-img" src="/images/landingPageImages/banner.png" alt="banner" />
		`;
	}

}

window.customElements.define(`horizon-info-graphic`, InfoGraphic);