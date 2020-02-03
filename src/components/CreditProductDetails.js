import { View, html, css } from 'platform/elements';

export class CreditProductDetails extends View {

	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
			.creditproduct-info{
				width: 1067.8px;
				height: 770px;
				padding: 0px 0px 0px 0px;
				text-align: center;
				line-height: 40px;
				align-items: center;
				background-color: white;
				border-radius: none;
			}
			`];
	}

	render() {
		return html`
			<capitec-card class="creditproduct-info">
			</capitec-card>
		`;
	}
}

window.customElements.define(`creditproduct-details`, CreditProductDetails);