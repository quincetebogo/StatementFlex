import { Component, css, html } from 'platform/elements';

/**
 * A button control with an icon above a label.
 *
 * **Usage**
 * ```html
 * <horizon-option-button
 *   label="Label Test"
 *   icon="platform icon | null"
 *   img-src="path to image | null"
 	>
 * </horizon-option-button>
 * ```
 * 
 * **Events**
 * - ```click``` When the button is clicked.
 */
export class HorizonOptionButton extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {

		super();
		this.label = ``;
		this.icon = null;
		this.image = null;
		this.type = ``;
		this.iconSize = ``;
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
			image: { type: String, attribute: `img-src` },
			disabled: { type: Boolean },
			type: { type: String },
			iconSize: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	_buttonClicked(event) {

		// Ignore the event if the component is disabled.
		if (this.disabled) {
			return event.stopImmediatePropagation();
		}

		// Notify any subscribers that the link was clicked.
		this.dispatchEvent(new CustomEvent(`click`, {
			detail: {}
		}));

		// Prevent the event from bubbling up.
		event.stopPropagation();
	}

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
				height: var(--horizon-option-btn-icon-height, 24px);
				width: var(--horizon-option-btn-icon-width, 24px);
			}

			.label-text{
				margin-top: var(--horizon-option-btn-text-margin-top, 10px);
				color: var(--horizon-option-btn-text-color, #4E6066);
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: var(--horizon-option-btn-text-font-weight, normal);
				letter-spacing: 0;
				line-height: var(--horizon-option-btn-text-line-height, 24px);
				cursor: pointer;
			}`
		];
	}

	_webTemplate() {
		return html`
			<capitec-button @click="${this._buttonClicked}" type="${this.type ? this.type : `secondary`}">
				<capitec-group layout="vertical" halign="center" valign="top" gap="none">
					${this.renderIcon()}
					<capitec-label class="label-text" label="${this.label}"></capitec-label> 
				</capitec-group>
			</capitec-button>
		`;
	}

	renderIcon() {
		return this.icon
			? html`<capitec-icon class="icon-size" size="${this.iconSize ? this.iconSize : `small`}" icon="${this.icon}"></capitec-icon>`
			: html`<img class="icon-size" src="${this.image}"/>`;
	}
}

window.customElements.define(`horizon-option-button`, HorizonOptionButton);