import { Component, css, html } from '../../elements/index.js';
import '../core/Icon.js';

/**
 * A control that allows a user to select multiple value from a small group of values.
 * 
 * ```js 
 * import 'platform/components/inputs/Check'; 
 * ```
 * 
 * ```html
 * <capitec-check
 *   label="My Toggle Value"
 *   data="{'id': 12345, 'name': 'Test'}"
 *   hint="Required"
 *   error="Field level error message"
 *   checked
 *   disabled>
 * </capitec-check>
 * ```
 * 
 */
export class Check extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		// Ensure the base class constructor logic is applied.
		super();

		// Set the default property values.
		this.label = null;
		this.data = null;

		this.hint = null;
		this.error = null;

		this.checked = false;
		this.disabled = false;
		this.indeterminate = false;
	}

	// ----------
	// PROPERTIES
	// ----------	

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The check label text.
	 * @property {Object} [data] - Data associated with the component.
	 * 
	 * @property {String} [hint] - A hint message to assist the user.
	 * @property {String} [error] - An error message to guide users to correct a mistake.
	 * 
	 * @property {Boolean} [checked=false] - Indicator if the component is checked or not.
	 * @property {Boolean} [disabled=false] - Indicator if the component is disabled.
	 * @property {Boolean} [indeterminate=false] - Indicator if the component is in and indeterminate state.
	 */
	static get properties() {

		return {
			label: { type: String },
			data: { type: Object },

			hint: { type: String },
			error: { type: String },

			checked: { type: Boolean },
			disabled: { type: Boolean },
			indeterminate: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.tabIndex = this.disabled ? -1 : 0;

		this.addEventListener(`click`, this._click);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Dispatched event when button is clicked
	 * 
	 * @param {MouseEvent} e - Indicator if the check is disabled
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_click(e) {

		if (this.disabled) {
			return e.stopImmediatePropagation();
		}

		this._toggleChecked(e);
	}

	/**
	 * Handles key down events.
	 * 
	 * @param {KeyboardEvent} e - The event details.
	 *
	 * @ignore
	 * @returns {void}
	 */
	_keyDown(e) {

		if (this.disabled) {
			return e.stopImmediatePropagation();
		}

		// Intercept space and enter key events to toggle the component checked state.
		const keyCode = (e.code || ``).toUpperCase();

		if (keyCode === `SPACE` || keyCode === `ENTER`) {

			// Toggle the component checked state.
			this._toggleChecked(e);

			// Prevent the key event from propagating further.
			return e.preventDefault();
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
	 * @param {MouseEvent | KeyboardEvent} e - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_toggleChecked(e) {

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

		e.stopPropagation();
	}

	// ---------
	// RENDERING
	// ---------	

	static get styles() {

		return [
			super.styles,
			css`
				:host {
					outline: none;
				}

				/* CONTAINER STYLES */

				.container {
					display: flex;
					align-items: center;
				}

				/* LABEL STYLES */
				
				.container > .label {
					color: var(--theme-label-font-color, #4E6066);
					font-family: var(--theme-label-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-label-font-size, 14px);
					font-weight: var(--theme-label-font-weight, 300);

					margin-left: var(--theme-check-label-spacing, 8px);

					cursor: pointer;
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

				/* CHECK BOX STYLES */

				.container > #content {
					box-sizing: border-box;
					cursor: pointer;

					display: flex;
					align-items: center;
					justify-content: center;

					width: var(--theme-check-width, 22px);
					height: var(--theme-check-height, 22px);

					background-color: var(--theme-check-background-color, #FFFFFF);

					border-width: var(--theme-check-border-width, 1px);
					border-style: solid;
					border-color: var(--theme-check-border-color, #009DE0);
					border-radius: var(--theme-check-border-radius, 50%);
					
					outline: 0;
				}
				
				.container.checked > #content > .indicator {
					width: 100%;
					height: 100%;

					border-width: var(--theme-check-indictor-border-width, 1px);
					border-style: solid;
					border-color: var(--theme-check-indictor-border-color, #009DE0);
					border-radius: var(--theme-check-border-radius, 50%);

					color: var(--theme-check-indictor-color, #FFFFFF);

					display: flex;
					align-items: center;
					justify-content: center;
				}
				
				/* CHECKED STATE STYLES */

				.container.checked > #content {
					background-color: var(--theme-check-checked-background-color, #009DE0);
				}
				/* INDETERMINATE STATE STYLES */

				.container.indeterminate > #content {
					background-color: var(--theme-check-indeterminate-background-color, #009DE0);
					color: var(--theme-check-indictor-color, #FFFFFF);
				}
				
				/* HOVER STATE STYLES */

				.container > #content:hover {
					box-shadow: var(--theme-check-hover-box-shadow,0 0 4px 4px #E6F7FF);
					background-color: var(--theme-check-hover-background-color,#E6F7FF);
				}

				.container.checked:hover > #content {
					background-color: var(--theme-check-checked-background-color, #0096DA);
				}

				.container.checked.disabled:hover > #content {
					background-color: var(--theme-check-disabled-background-color, #DEDEDE);
				}
				
				.container.indeterminate:hover > #content {
					background-color: var(--theme-check-indeterminate-background-color, #0096DA);
				}

				.container.disabled.indeterminate:hover > #content {
					background-color: var(--theme-check-disabled-background-color, #DEDEDE);					
				}

				/* DISABLED STATE STYLES */

				.container.disabled > #content {
					cursor: default;
					border-color: var(--theme-check-disabled-border-color, #DEDEDE);
					background-color: var(--theme-check-disabled-background-color, #DEDEDE);
				}

				.container.disabled:hover > #content {
					box-shadow: none;
				}

				.container.checked.disabled > #content > .indicator {
					border-color: transparent;
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
			<div 
				class="container${this.indeterminate ? ` indeterminate` : this.checked ? ` checked` : ``}${this.disabled ? ` disabled` : ``}">
				<div
					id="content"
					@keydown="${this._keyDown}">
					<div class="indicator">${this.indeterminate ? html`<capitec-icon size="fit" icon="material/remove"></capitec-icon>` : this.checked ? html`<capitec-icon size="fit" icon="material/check"></capitec-icon>` : ``}</div>
				</div>

				<label class="label">
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

window.customElements.define(`capitec-check`, Check);

/**
 * When the control value is changed to either on or off.
 *
 * @example
 * <capitec-check ... @value-change="${this._handler}"></capitec-check>
 *
 * @event Check#value-change
 * @type {Object}
 * @property {Object} detail Contains oldValue and newValue.
 * @property {Boolean} detail.old - old value of the Check
 * @property {Boolean} detail.new - new value of the Check.
 */