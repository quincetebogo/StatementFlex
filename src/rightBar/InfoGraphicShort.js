import { Component, css, html } from 'platform/elements';

export class InfoGraphicShort extends Component {

	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
				.landingpage-marketing-short-img{
					width: var(--horizon-right-panel-width, 320px);
					height: 427px;
				}`
		];
	}


	render() {
		return html`
			<img class="landingpage-marketing-short-img" src="/images/landingPageImages/banner-short.png" alt="banner" />
		`;
	}

}

window.customElements.define(`horizon-info-graphic-short`, InfoGraphicShort);