import { Component, css, html } from '../../elements/index.js';

/**
 * A keyboard button control that will be used in the keyboard component, relevant to Kiosk applications only.
 *
 * ```js 
 * import 'platform/components/buttons/KeyboardButton'; 
 * ```
 * 
 * ```html
 * <capitec-keyboard-button
 *  label="a"
 *  mode="alpha"
 *  character="Return" 
 *  case="upper"
 *  disabled>
 * </capitec-keyboard-button>"
 * ```
 * @prop {"alpha"|"return"|"numeric"|"action"|"space"|String} mode - The mode for the button
 * @prop {"upper"|"lower"|String} case - The case of the button
 */

export class KeyboardButton extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Initialises the component.
	 *
	 * @hideconstructor
	 */
	constructor() {

		super();

		// Set the default property values.
		this.label = ``;
		this.icon = ``;
		this.character = ``;
		this.mode = ``;
		this.case = `lower`;
		this.disabled = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The label text to display.
	 * @property {String} [icon] - The name of the icon to display.
	 * @property {String} [character] - The character for the button.
	 * @property {String} [mode] - The mode for the button:
	 * - `alpha` Alphabetical mode.
	 * - `return` Return (Enter) mode.
	 * - `numeric` Numerical mode.
	 * - `action` Arbitrary actions mode.
	 * - `space` Spacebar mode.
	 * @property {String} [case="lower"] - The case of the button:
	 * - `upper` Uppercase input only.
	 * - `lower` Lowercase input only.
	 * @property {Boolean} [disabled=false] - Indicator if the button is disabled.
	 */
	static get properties() {
		return {
			label: { type: String },
			icon: { type: String },
			character: { type: String },
			mode: { type: String },
			case: { type: String },
			disabled: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Handles component key down events.
	 * 
	 * @param {KeyboardEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_click(event) {

		// Ignore the event if the component is disabled.
		if (this.disabled) {
			return event.stopImmediatePropagation();
		}

		let val = ``;
		if (this.character) {
			if (this.case === `custom`) {
				val = this.character;
			} else if (this.case !== `lower`) {
				val = this.character.toUpperCase();
			} else {
				val = this.character.toLowerCase();
			}
		} else if (this.case === `custom`) {
			val = this.label;
		} else if (this.case !== `lower`) {
			val = this.label.toUpperCase();
		} else {
			val = this.label.toLowerCase();
		}

		this.dispatchEvent(new CustomEvent(`keyboard-click`, {
			detail: {
				value: val
			}
		}));

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

	/**
	 * Generates the component stylesheet.
	 * 
	 * @ignore
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
				:host {
					box-sizing: border-box;
					display: inline-flex;
				}

				.button {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					
					font-family: var(--theme-button-font-family, Arial, Helvetica, sans-serif);
					color: var(--theme-keyboard-button-font-color, #3A3A3A);
					/*Common styles for keyboard button types*/

					background-color: var(--theme-keyboard-button-background-color, #FFFFFF);
					border: var(--theme-keyboard-button-border, 1.5px solid #FFFFFF);
					margin: var(--theme-keyboard-button-margin, 6px 7px);
					font-weight: var(--theme-keyboard-font-weight, 600);
					height: var(--theme-keyboard-button-height, 80px);
					width: var(--theme-keyboard-button-width, 80px);
					
					font-size: var(--theme-keyboard-button-font-size, 20px);
					line-height: var(--theme-keyboard-button-line-height, 30px);
					border-radius: var(--theme-keyboard-button-border-radius, 8px);

					box-shadow: 2px 2px 5px 0 rgba(109,109,109,0.35), -10px -10px 20px -10px rgba(255,255,255,0.5);
					border-style: solid;

					cursor: pointer;
					
					transition:
						opacity .1s ease,
						background-color .1s ease,
						border .1s ease,
						color .1s ease,
						box-shadow .1s ease,
						background .1s ease,
						-webkit-box-shadow .1s ease;
				}
						
				.numeric {
					width: var(--theme-numeric-keyboard-button-width, 84px);
					height: var(--theme-numeric-keyboard-button-height, 56px);
					border-radius: var(--theme-numeric-keyboard-button-border-radius,8px);
					line-height: var(--theme-numeric-keyboard-button-line-height, 30px);
					background-color: var(--theme-numeric-keyboard-keyboard-button-background-color, #FFFFFF);
					border: var(--theme-numeric-keyboard-button-border,1.5px solid #FFFFFF);
					font-size: var(--theme-numeric-keyboard-button-font-size, 20px);
					box-shadow: 2px 2px 5px 0 rgba(109,109,109,0.35), -10px -10px 20px -10px rgba(255,255,255,0.5);

				}

				.alpha {
					text-align: var(--theme-keyboard-button-text-align, center);
					background-color: var(--theme-alpha-keyboard-button-background-color,#FFFFFF);
					border: var(--theme-alpha-keyboard-button-border,1.5px solid #FFFFFF);
					width: var(--theme-alpha-keyboard-keyboard-button-width, 84px);
					height: var(--theme-alpha-keyboard-keyboard-button-height, 56px);
					line-height: var(--theme-alpha-keyboard-button-line-height, 30px);
					font-size: var(--theme-alpha-keyboard-button-font-size, 20px);
					border-radius: var(--theme-alpha-keyboard-button-border-radius,8px);
					color: var(--theme-alpha-keyboard-button-color,#3A3A3A);
					box-shadow: 2px 2px 5px 0 rgba(109,109,109,0.35), -10px -10px 20px -10px rgba(255,255,255,0.5);

				}

				.action {
					text-align: var(--theme-keyboard-button-text-align, center);
					background-color: var(--theme-action-keyboard-button-background-color,#FFFFFF);
					border: var(--theme-action-keyboard-button-border,1.5px solid #FFFFFF);
					width: var(--theme-action-keyboard-button-width, 184px);
					height: var(--theme-action-keyboard-button-height, 56px);
					font-size: var(--theme-action-keyboard-button-font-size, 20px);
					border-radius: var(--theme-action-keyboard-button-border-radius,8px);
					line-height: var(--theme-action-keyboard-button-line-height, 30px);
					box-shadow: 2px 2px 5px 0 rgba(109,109,109,0.35), -10px -10px 20px -10px rgba(255,255,255,0.5);
				}

				.return{
					border: var(--theme-return-keyboard-button-border, 1.5px solid #FFFFFF);
					text-align: var(--theme-keyboard-button-text-align, center);
					width: var(--theme-return-keyboard-button-width, 184px);
					height: var(--theme-return-keyboard-button-height, 56px);
					border-radius: var(--theme-return-keyboard-button-border-radius,8px);
					background-color: var(--theme-return-keyboard-button-background-color, #FFFFFF);
					line-height: var(--theme-return-keyboard-button-line-height, 30px);
					font-size: var(--theme-return-keyboard-button-font-size, 20px);
					color: #3A3A3A;
					box-shadow: 2px 2px 5px 0 rgba(109,109,109,0.35), -10px -10px 20px -10px rgba(255,255,255,0.5);
				}

				.space {
					text-align: var(--theme-keyboard-button-text-align, center);
					height: var(--theme-space-keyboard-button-height, 56px);
					width: var(--theme-space-keyboard-button-width, 481px);
					line-height: var(--theme-space-keyboard-button-line-height, 30px);
					color: var(--theme-space-keyboard-button-color,#3A3A3A);
					font-size: var(--theme-space-keyboard-button-font-size, 20px);
					font-weight: var(--theme-space-keyboard-button-font-weight,600);
					border-radius: var(--theme-space-keyboard-button-border-radius,8px);
					background-color: var(--theme-space-keyboard-button-background-color, #FFFFFF);
					border: var(--theme-space-keyboard-button-border,1.5px solid #FFFFFF);
					box-shadow: 2px 2px 5px 0 rgba(109,109,109,0.35), -10px -10px 20px -10px rgba(255,255,255,0.5);

				}

				/* icon */

				button > capitec-icon {
					max-height: var(--theme-keyboard-button-icon-max-height,40px);
					max-width: var(--theme-keyboard-button-icon-max-width,40px);
				}
			`
		];
	}

	/**
	 * Generates the component template for mobile mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {

		return html`
		`;
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		this.label = this.case !== `lower` ? this.case === `custom` ? this.label : this.label.toUpperCase() : this.label.toLowerCase();

		return html`
			<button class="button ${this.mode === `alpha` ? `alpha` : ``}${this.mode === `return` ? `return` : ``} ${this.mode === `numeric` ? `numeric` : ``} ${this.mode === `action` ? `action` : ``} ${this.mode === `space` ? `space` : ``} ${this.disabled ? `disabled` : ``} " 
				@click="${this._click}">
				${this.icon ? html`<capitec-icon size="medium" icon="${this.icon}"></capitec-icon>` : ``}
				${this.label ? html`<div class="label${this.icon ? ` space-left` : ``}">${this.label}</div>` : ``}
			</button>
		`;
	}
}

window.customElements.define(`capitec-keyboard-button`, KeyboardButton);

/**
 * When the keyboard button is clicked.
 *
 * @example
 * <capitec-keyboard-button ... @keyboard-click="${this._handler}"></capitec-keyboard-button>
 *
 * @event KeyboardButton#keyboard-click
 * @type {Object}
 * @property {Object} detail Event object.
 * @property {String} detail.value Value of the button clicked.
 */