import { Component, css, html } from 'platform/elements';

/**
 * A button control with an icon above a label.
 *
 * **Usage**
 * ```html
 * <horizon-option-button
 *   label="The label string to display"
 *   icon="platform icon | null"
 *   iconSize="platform icon size | null"
 *   img-src="path to image | null"
	  >
 * </horizon-option-button>
 * ```
 * 
 * **Events**
 * - ```click``` When the button is clicked.
 */

export class OptionButton extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {

		super();
		this.label = ``;
		this.icon = null;
		this.image = null;
		this.iconSize = ``;
		this.disabled = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
 * Registry of all properties defined by the component.
 * 
 * @property {String} [label] - The label string to display.
 * @property {String} [icon] - A platform icon to display.
 * @property {String} [iconSize] - Used in conjunction with the icon attribute. This is a <capitec-icon>, icon size setting.
 * @property {String} [img-src] - Path to an image to display. This will only be displayed if icon is NOT provided.
 */
	static get properties() {
		return {
			label: { type: String },
			icon: { type: String },
			image: { type: String, attribute: `img-src` },
			disabled: { type: Boolean },
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

	_keyDown(event) {

		// Ignore the event if the component is disabled.
		if (this.disabled) {
			return event.stopImmediatePropagation();
		}

		// Intercept space and enter key events to toggle the component checked state.
		const keyCode = (event.code || ``).toUpperCase();

		if (keyCode === `SPACE` || keyCode === `ENTER` || keyCode === `NUMPADENTER`) {

			this.dispatchEvent(new CustomEvent(`click`, {
				detail: {}
			}));

			event.stopPropagation();
		}
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

			.button {
				outline:none;
				height:100%;
				background: white;
				box-sizing: border-box;
				box-shadow: none;
				border: 1px solid #E1E1E1;
				border-radius: 4px;
				cursor: pointer;
			}

			.button:hover {
				outline:none;
				box-sizing: border-box;
				box-shadow: none;
				border: 1px solid #009DE0;
				border-radius: 4px;
			}

			.button:focus {
				outline:none;
				box-sizing: border-box;
				box-shadow: none;
				border: 1px solid #009DE0;
				border-radius: 4px;
			}

			.icon-size {
				height: var(--horizon-option-btn-icon-height, 24px);
				width: var(--horizon-option-btn-icon-width, 24px);
				margin: auto;
			}

			.label-text{
				margin-top: var(--horizon-option-btn-text-margin-top, 10px);
				color: var(--horizon-option-btn-text-color, #545D60); 
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: var(--horizon-option-btn-text-font-weight, 500);
				letter-spacing: 0;
				line-height: var(--horizon-option-btn-text-line-height, 24px);
				cursor: pointer;
			}

			.label-text-disabled {
				margin-top: var(--horizon-option-btn-text-margin-top, 10px);
				color: var(--horizon-option-btn-text-color, #969B9D); 
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: var(--horizon-option-btn-text-font-weight, 500);
				letter-spacing: 0;
				line-height: var(--horizon-option-btn-text-line-height, 24px);
				cursor: pointer;
			}
			`
		];
	}

	_webTemplate() {
		return html`
			<button class="button" ?disabled="${this.disabled}" @click="${(e) => this._buttonClicked(e)}"  @keydown="${(e) => this._keyDown(e)}">
				${this.renderIcon()}
				<capitec-label class="label-text${this.disabled ? `-disabled` : ``}" label="${this.label}" @click="${(e) => this._buttonClicked(e)}"  @keydown="${(e) => this._keyDown(e)}"></capitec-label> 
			</button>
		`;
	}

/*
*/

	renderIcon() {
		return html`<img class="icon-size" src="./platform/icons/${this.icon}.svg" alt="${this.icon}">`;

		return this.icon
			? html`<capitec-icon class="icon-size" size="${this.iconSize ? this.iconSize : `small`}" icon="${this.icon}" @click="${(e) => this._buttonClicked(e)}"  @keydown="${(e) => this._keyDown(e)}"></capitec-icon>`
			: html`<img class="icon-size" src="${this.image}" @click="${(e) => this._buttonClicked(e)}"  @keydown="${(e) => this._keyDown(e)}/>`;
	}
}

window.customElements.define(`horizon-option-button`, OptionButton);