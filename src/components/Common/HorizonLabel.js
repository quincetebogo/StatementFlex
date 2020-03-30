import { Component, html, css } from 'platform/elements';
import 'platform/components/core/Label';

export class HorizonLabel extends Component {

	constructor() {
		super();
		this.label = ``;
		this.value = ``;
	}

	static get properties() {
		return {
			label: { type: String },
			value: { type: String }
		}
	}

	static get styles() {
		return [
			super.styles,
			css`
				.wrapper{

				}

				.label-text{
					height: 21px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 14px;
					letter-spacing: 0;
					line-height: 21px;
				}

				.label-value{
					height: 27px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 27px;
				}
			`]
	}

	render() {
		return html`
			<div class="wrapper">
				<capitec-label
					class="label-text"
					label="${this.label}">
				</capitec-label>
				<capitec-label 
					class="label-value"
					label="${this.value}">
				</capitec-label>
			</div>`
	}
}

window.customElements.define(`horizon-label`, HorizonLabel);
