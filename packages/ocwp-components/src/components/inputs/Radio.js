import { Component, css, html } from '../../elements/index.js';

/**
 * A control that allows a user to select a single value from a small group of values.
 * 
 * ```js 
 * import 'platform/components/inputs/Radio'; 
 * ```
 * 
 * ```html
 * <capitec-radio
 *   label="My Toggle Value"
 *   data="{'id': 12345, 'name': 'Test'}"
 *   hint="Required"
 *   error="Field level error message"
 *   checked
 *   disabled>
 * </capitec-radio>
 * ```
 */
export class Radio extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		super();

		// Set the default property values.
		this.label = null;
		this.data = null;

		this.hint = null;
		this.error = null;

		this.checked = false;
		this.disabled = false;
	}

	// ----------
	// PROPERTIES
	// ----------	

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The radio label text.
	 * @property {Object} [data] - Data associated with the component.
	 * 
	 * @property {String} [hint] - A hint message to assist the user.
	 * @property {String} [error] - An error message to guide users to correct a mistake.
	 * 
	 * @property {Boolean} [checked=false] - Indicator if the component is checked or not.
	 * @property {Boolean} [disabled=false] - Indicator if the component is disabled.
	 */
	static get properties() {

		return {
			label: { type: String },
			data: { type: Object },

			hint: { type: String },
			error: { type: String },

			checked: { type: Boolean },
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
	 * Handles click events.
	 * 
	 * @param {MouseEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_click(event) {

		// Ignore the event if the component is disabled.
		if (this.disabled) {
			return event.stopImmediatePropagation();
		}

		// Toggle the component checked state.
		this._toggleChecked();
	}

	/**
	 * Handles key down events.
	 * 
	 * @param {KeyboardEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_keyDown(event) {

		// Ignore the event if the component is disabled.
		if (this.disabled) {
			return event.stopImmediatePropagation();
		}

		// Intercept space and enter key events to toggle the component checked state.
		const keyCode = (event.code || ``).toUpperCase();

		if (keyCode === `SPACE` || keyCode === `ENTER`) {

			// Toggle the component checked state.
			this._toggleChecked();

			// Prevent the key event from propogating further.
			return event.preventDefault();
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	focus() {
		this.shadowRoot.getElementById(`content`).focus();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/**
	 * Toggles the current checked state of the component.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_toggleChecked() {

		const oldValue = this.checked;
		this.checked = !oldValue;

		this.dispatchEvent(new CustomEvent(`value-changed`, {
			detail: {
				old: oldValue,
				new: this.checked
			}
		}));

		this.dispatchEvent(new CustomEvent(`value-change`, {
			detail: {
				old: oldValue,
				new: this.checked
			}
		}));
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {

		return [
			super.styles,
			css`

				/* CONTAINER STYLES */

				.container {
					display: flex;
					align-items: center;
				}`,

			css`
				:host {
					--theme-radio-width: 24px;
					--theme-radio-height: 24px;

					--theme-radio-padding: 2px;
				}
			`,
			css`
				/* LABEL STYLES */
				
				.container > .label {
					color: var(--theme-label-font-color);
					font-family: var(--theme-label-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-label-font-size, 14px);
					font-weight: var(--theme-radio-label-font-weight, 500);
					line-height: var(--theme-radio-label-line-height, 20px);

					margin-left: var(--theme-radio-label-spacing, 8px);

					cursor: default;
				}

				.container > .label > .hint {
					color: var(--theme-input-hint-label-font-color, lightgrey);
					font-family: var(--theme-input-hint-label-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-input-hint-label-font-size, 12px);
					font-weight: var(--theme-input-hint-label-font-weight, 300);

					padding-top: 4px;
				}

				.container > .label > .error {
					color: var(--theme-input-error-label-font-color, red);
					font-family: var(--theme-input-error-label-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-input-error-label-font-size, 12px);
					font-weight: var(--theme-input-error-label-font-weight, 300);

					padding-top: 4px;
				}

				/* RADIO BUTTON STYLES */

				.container > #content {
					box-sizing: border-box;
					cursor: pointer;

					display: flex;
					align-items: center;
					align-self: flex-start;
					justify-content: center;

					min-width: var(--theme-radio-width, 24px);
					min-height: var(--theme-radio-height, 24px);
					max-width: var(--theme-radio-width, 24px);
					max-height: var(--theme-radio-height, 24px);

					margin: var(--theme-radio-padding, 2px);

					background-color: var(--theme-radio-background-color, #FFFFFF);

					border-width: var(--theme-radio-border-width, 2px);
					border-style: var(--theme-radio-border-style, solid);
					border-color: var(--theme-radio-border-color, #009DE0);
					border-radius: var(--theme-radio-border-radius, 50%);
					
					outline: 0;
				}
				
				.container.checked > #content > .indicator {
					width: calc(var(--theme-radio-width) - var(--theme-radio-padding)*2);
					height: calc(var(--theme-radio-height) - var(--theme-radio-padding)*2);

					border-width: var(--theme-radio-indictor-border-width, 2px);
					border-style: solid;
					border-color: var(--theme-radio-indictor-border-color, #FFFFFF);
					border-radius: var(--theme-radio-border-radius, 50%);

					color: var(--theme-radio-indictor-color, #FFFFFF);
				}
				
				/* CHECKED STATE STYLES */

				.container.checked > #content {
					background-color: var(--theme-radio-checked-background-color, #009DE0);
				}
				
				/* HOVER STATE STYLES */

				.container > #content:hover {
					box-shadow: var(--theme-radio-hover-box-shadow, 0 0 4px 4px #E6F7FF);
					background-color: var(--theme-radio-hover-background-color, #E6F7FF);
				}

				.container.checked:hover > #content {
					background-color: var(--theme-radio-checked-background-color, #009DE0);
				}
				/* DISABLED STATE STYLES */

				.container.disabled > #content {
					cursor: default;
					border-color: var(--theme-radio-disabled-border-color, #DEDEDE);
					background-color: var(--theme-radio-disabled-background-color, #FFFFFF);
				}
				
				.container.disabled.checked > #content {
					background-color: var(--theme-radio-disabled-background-color, #DEDEDE);
				}
				
				.container.disabled:hover > #content {
					box-shadow: none;
				}

				:host(:not([disabled])) .container > #label {
					cursor: pointer;
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

		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
			<div class="container${this.checked ? ` checked` : ``}${this.disabled ? ` disabled` : ``}">
				<div id="content" tabindex="${this.disabled ? `` : 0}" @click="${this._click}" @keydown="${this._keyDown}">
					${this.checked ? html`<div class="indicator"></div>` : ``}
				</div>
			
				<label id="label" class="label" @click="${this._click}">
					${this.label}
					${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
					${this.error ? html`<div class="error">${this.error}</div>` : ``}
				</label>
			</div>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return this._webTemplate();
	}
}

window.customElements.define(`capitec-radio`, Radio);

/**
 * When the control value is changed to either on or off.
 *
 * @example
 * <capitec-radio ... @value-change="${this._handler}"></capitec-radio>
 *
 * @event Radio#value-change
 * @type {Object}
 * @property {Object} detail Contains old and new value.
 * @property {Boolean} detail.old - The old value of the Radio
 * @property {Boolean} detail.new - The new checked value of the Radio
 */