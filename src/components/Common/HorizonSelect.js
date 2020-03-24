import { Component, html, css } from 'platform/elements';
import 'platform/components/core/Label';

/**
 * A select (drop down) component. This component displays a label with a value shown
 * vertically beneath it. The value may be changed by clicking on the kebab icon and
 * selecting a new value.
 *
 * 
 * **Usage**
 * ```html
 *   <horizon-select> 
 *  </horizon-select>
 * ```
 * 
 * **Events**
 * - n/a
 */
export class HorizonSelect extends Component {

	// --------------
	// INITIALISATION 
	// --------------

	constructor() {
		super();
		this.label = ``;
		this.value = ``;
		this.items = {};
		this.displayField = ``;
	}

	// -------------------
	// PROPERTIES REGISTRY
	// -------------------
	static get properties() {
		return {
			label: { type: String },
			value: { type: String },
			items: { type: Object },
			displayField: { type: String, attribute: `display-field` }
		}
	}

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
				.outer-wrapper {
					display: flex;
					flex-direction: row;
				}

				.inner-wrapper{
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

				.kebab-icon {
					margin-top:20px;
					margin-left:auto;
				}
			`]
	}

	render() {
		return html`
		    <div class= "outer-wrapper">
				<div class="inner-wrapper">
					<capitec-label
						class="label-text"
						label="${this.label}">
					</capitec-label>
					<capitec-label 
						class="label-value"
						label="${this.value}">
					</capitec-label>
				</div>
				<capitec-icon
					class="kebab-icon"
					icon="system/more-action"> 
				</capitec-icon>
			</div>
			`
	}
}

window.customElements.define(`horizon-select`, HorizonSelect);
