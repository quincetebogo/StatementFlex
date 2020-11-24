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
		this.badgeText = null;
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
 * @property {String} [badgeText] - Optional number to display in a badge, top right hand.
 */
	static get properties() {
		return {
			label: { type: String },
			icon: { type: String },
			image: { type: String, attribute: `img-src` },
			disabled: { type: Boolean },
			iconSize: { type: String },
			badgeText: { type: String }
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
				position: relative;
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
			.badge {
				position: absolute;
				justify-content: flex-end;
				width: 24px;
				right: 8px;
				top: 8px;
				color: #FFFFFF;
				font-family: "Hind Vadodara";
				font-size: 12px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 18px;
				text-align: center;
			}
			`
		];
	}

	_webTemplate() {
		return html`
			<button class="button" ?disabled="${this.disabled}" @click="${(e) => this._buttonClicked(e)}"
				@keydown="${(e) => this._keyDown(e)}">
				${this.renderIcon()}
				${this.renderBadge()}
				<capitec-label class="label-text${this.disabled ? `-disabled` : ``}" label="${this.label}"
					@click="${(e) => this._buttonClicked(e)}" @keydown="${(e) => this._keyDown(e)}">
				</capitec-label>
			</button>
		`;
	}

	/*
	*/

	renderIcon() {
		return this.icon ? html`<img class="icon-size" src="./platform/icons/${this.icon}.svg">` : html`<img class="icon-size" src="${this.image}">`;
	}

	renderBadge() {
		return this.badgeText ? html`<capitec-badge class="badge" color="#B71C1A" number="${this.badgeText}"></capitec-badge>` : html``;
	}
}

window.customElements.define(`horizon-option-button`, OptionButton);