import { Component, html, css } from 'platform/elements';

export class HorizonOptionButton extends Component {

	// --------------
	// INITIALISATION
	// --------------	

	constructor() {

		super();
		this.label = '';
		this.icon = null;
		this.image = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
 * Registry of all properties defined by the component.
 * 
 * @property {String} [label] - The label string to display.
 * @property {String} [icon] - A platform icon to display.
 * @property {String} [img-src] - Path to an image to display. This will only be displayed if icon is NOT provided.
 */
	static get properties() {
		return {
			label: { type: String },
			icon: { type: String },
			image: { type: String, attribute: 'img-src' }
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

			.icon-size {
				height: 24px;
				width: 24px;
			}

			.label-text{
				margin-top:10px;
				color: #4E6066;
				font-family: "Hind Vadodara";
				font-size: 16px;
				letter-spacing: 0;
				line-height: 24px;			}
			`]
	}

	render() {
		return html`
			<capitec-button>
				<capitec-group layout="vertical" halign="center" valign="top" gap="none">
					${this.renderIcon()}			
					<capitec-label class="label-text" label="${this.label}"></capitec-label> 
				</capitec-content-box>  
			</capitec-button>
		`;
	}

	renderIcon() {
		return this.icon
			? html`<capitec-icon class="icon-size" size="small" icon="${this.icon}"></capitec-icon>`
			: html`<img class="icon-size" src="${this.image}"/>`;
	}
}

window.customElements.define(`horizon-option-button`, HorizonOptionButton);