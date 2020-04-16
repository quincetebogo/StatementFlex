import { Component, html, css } from 'platform/elements';
import 'platform/components/core/Label';

export class HorizonLabel extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.label = ``;
		this.value = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
 	* 
 	* @property {String} [label] - The label string to display.
 	* @property {String} [value] - The value string to display beneath the label.
 */

	static get properties() {
		return {
			label: { type: String },
			value: { type: String }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------	

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
