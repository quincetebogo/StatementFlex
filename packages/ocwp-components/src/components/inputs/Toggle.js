import { Component, css, html, when } from '../../elements/index.js';

/**
 * A control that allows a user to toggle a value on or off.
 * 
 * ```js 
 * import 'platform/components/inputs/Toggle'; 
 * ```
 * 
 * ```html
 * <capitec-toggle
 *   label="My Toggle Value"
 *   size="small"
 *   data="{'id': 12345, 'name': 'Test'}"
 *   hint="Required"
 *   error="Field level error message"
 *   checked>
 * </capitec-toggle>
 * ```
 * 
 * @prop {"default"|"small"} size - The size to display the toggle at. Options include.
 */
export class Toggle extends Component {

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
		this.header = null;
		this.data = null;

		this.hint = null;
		this.error = null;

		this.checked = false;
		this.disabled = false;

		this.size = `default`;
	}

	// ----------
	// PROPERTIES
	// ----------	

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The toggle label text.
	 * @property {String} [header] - The toggle header text.
	 * @property {Object} [data] - Data associated with the component.
	 * 
	 * @property {String} [hint] - A hint message to assist the user.
	 * @property {String} [error] - An error message to guide users to correct a mistake.
	 * 
	 * @property {Boolean} [checked=false] - Indicator if the component is checked or not.
	 * @property {Boolean} [disabled=false] - Indicator if the component is disabled.
	 * 
	 * @property {Size} [size="default"] - The size to display the toggle at. Options include:
	 *   - `default` Toggle height 24px
	 *   - `small` Toggle height 16px
	 */
	static get properties() {

		return {
			label: { type: String },
			header: { type: String },
			data: { type: Object },

			hint: { type: String },
			error: { type: String },

			checked: { type: Boolean },
			disabled: { type: Boolean },

			size: { type: String }
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

	// --------------
	// PUBLIC METHODS
	// --------------

	focus() {
		this.shadowRoot.getElementById(`track`).focus();
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

		// Record the previous state.
		const oldValue = this.checked;

		// Invert the checked state.
		this.checked = !oldValue;

		// Notify any subscribers that the value changed.
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

		if (keyCode === `SPACE` || keyCode === `ENTER` || keyCode === `NUMPADENTER`) {

			// Toggle the component checked state.
			this._toggleChecked();

			// Prevent the key event from propagating further.
			return event.preventDefault();
		}
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
				}

				:host([size="small"]) {
					--theme-toggle-track-height: 16px;
					--theme-toggle-track-width: 32px;
					--theme-toggle-knob-width: 10px;
					--theme-toggle-knob-height: 10px;
					--theme-toggle-track-inset: 3px;
				}

				/* HEADER STYLES */
				.header {
					color: var(--theme-toggle-header-font-color, var(--theme-label-font-color));
					font-family: var(--theme-toggle-header-font-family, var(--theme-label-font-family));
					font-size: var(--theme-toggle-header-font-size, 14px);
					font-weight: var(--theme-toggle-header-font-weight, 400);
					margin:  var(--theme-toggle-header-margin, 0px 0px 6px 0px);
				}


				/* LABEL STYLES */
				
				.container > .label {
					color: var(--theme-toggle-label-font-color,  var(--theme-label-font-color));
					font-family: var(--theme-label-font-family, var(--theme-label-font-family));
					font-size: var(--theme-toggle-label-font-size, 15px);
					font-weight: var(--theme-toggle-label-font-weight, 500);

					margin-left: var(--theme-toggle-label-spacing, 8px);

					cursor: default;
				}

				.container > .label > .hint {
					color: var(--theme-input-hint-label-font-color, lightgrey);
					font-family: var(--theme-input-hint-label-font-family, var(--theme-label-font-family));
					font-size: var(--theme-input-hint-label-font-size, 12px);
					font-weight: var(--theme-input-hint-label-font-weight, 300);
				}

				.container > .label > .error {
					color: var(--theme-input-error-label-font-color, #C83C37);
					font-family: var(--theme-input-error-label-font-family, var(--theme-label-font-family));
					font-size: var(--theme-input-error-label-font-size, 12px);
					font-weight: var(--theme-input-error-label-font-weight, 300);
				}

				/* TOGGLE BUTTON STYLES */

				.container > #content {
					box-sizing: border-box;
					cursor: pointer;

					display: grid;
					align-items: center;
				}
				
				.container > #content > .track {
					width: var(--theme-toggle-track-width, 48px);
					height: var(--theme-toggle-track-height, 24px);

					grid-row: 1;
					grid-column: 1;
					
					background-color: var(--theme-toggle-track-background-color, #495B65);
					border-radius: var(--theme-toggle-track-border-radius, 12px);

					outline: 0;
				}

				.container > #content > .knob {
					height: var(--theme-toggle-knob-height, 15px);

					grid-row: 1;
					grid-column: 1;

					margin-left: var(--theme-toggle-track-inset, 5px);
					margin-right: var(--theme-toggle-track-inset, 5px);

					position: relative;
				}

				.container > #content > .knob > div {
					width: var(--theme-toggle-knob-width, 15px);
					height: 100%;

					background-color: var(--theme-toggle-knob-background-color, #495B65);
					border-radius: 50%;
					box-shadow: var(--theme-toggle-knob-box-shadow, 0px 0px 0 1px #FFFFFF);
					
					position: absolute;
					left: 0px;

					margin-top: auto;
					margin-bottom: auto;

					transition: .15s left ease-in-out;
				}
				
				/* CHECKED STATE STYLES */

				.container.checked > #content > .track {
					background-color: var(--theme-toggle-checked-track-background-color, #52BD28);
				}
				
				.container.checked > #content > .knob > div {
					background-color: var(--theme-toggle-checked-knob-background-color, #FFFFFF);
					left: calc(100% - var(--theme-toggle-knob-width, 14px));
					box-shadow: none;
				}

				.container.checked > #content:hover > .knob > div {
					background-color: var(--theme-toggle-checked-knob-background-color, #FFFFFF);
					left: calc(100% - var(--theme-toggle-knob-width, 14px));
				}

				/* DISABLED STATE STYLES */

				.container.disabled > #content {
					cursor: default;
				}

				.container.disabled > #content > .track,
				.container.disabled > #content:hover > .track {
					background-color: var(--theme-toggle-disabled-track-background-color, #F5F5F5);
				}

				.container.disabled > #content:hover > .knob > div,
				.container.disabled > #content > .knob > div {
					background-color: var(--theme-toggle-disabled-knob-background-color, #E1E1E1);
					box-shadow: var(--theme-toggle-knob-box-shadow, 0px 0px 0 1px #E1E1E1);
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${when(this.header, () => html`<div class="header">${this.header}</div>`)}
			<div class="container${this.checked ? ` checked` : ``}${this.disabled ? ` disabled` : ``}">
				<div
					id="content"
					@click="${this._click}"
					@keydown="${this._keyDown}">
					<div id="track" class="track" tabindex="${this.disabled ? `` : 0}"></div>
					<div class="knob">
						<div></div>
					</div>
				</div>

				<label class="label" @click="${this._click}">
					${this.label}
					${when(this.hint && !this.error, () => html`<div class="hint">${this.hint}</div>`)}
					${when(this.error, () => html`<div class="error">${this.error}</div>`)}
				</label>
			</div>
		`;
	}

	_kioskTemplate() {
		return this._webTemplate();
	}
}

window.customElements.define(`capitec-toggle`, Toggle);

/**
 * When the control value is either changed to either on or off.
 *
 * @example
 * <capitec-toggle ... @value-change="${this._handler}"></capitec-toggle>
 *
 * @event Toggle#value-change
 * @type {Object}
 * @property {Object} detail - Contains the old and new value.
 * @property {String} detail.old - The old value.
 * @property {String} detail.new - The new value.
 */