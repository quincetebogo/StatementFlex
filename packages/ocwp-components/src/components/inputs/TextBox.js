import { Component, css, html } from '../../elements/index.js';
import { InputLayouts } from '../input-layouts.js';

/**
 * An input control that allows a user to enter multiple lines of text.
 * 
 * ```js
 * import 'platform/components/inputs/TextBox';
 * ```
 * 
 * ```html
 * <capitec-text-editor
 *   label="Enter a value"
 *   value="Hello World"
 *   data="{'id': 12345, 'name': 'Test'}"
 *   keyboardMode="alpha-numeric"
 *   hint="Required"
 *   error="Field level error message"
 *   disabled>
 * </capitec-text-editor>
 * ```
 * @prop {"alpha-numeric"|"numeric"|"none"|String} keyboardMode - The mode to display.
 */
export class TextBox extends Component {

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
		this.value = null;
		this.data = null;
		this.keyboardMode = `alpha-numeric`;

		this.hint = null;
		this.error = null;

		this.maxLength = 0;
		this.minLength = 0;

		this.focussed = false;
		this.disabled = false;

		// Internal variables
		this._maxLength = 0;
		this._minLength = 0;

		// Register state event listeners.
		this.addEventListener(`focus`, this._focusGained.bind(this));
		this.addEventListener(`focusout`, this._focusLost.bind(this));
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The input label text.
	 * @property {String} [value] - The value entered into the input.
	 * @property {Object} [data] - Data associated with the component.
	 * @property {String} [keyboardMode="alpha-numeric"] - Keyboard mode supported:
	 * - `alpha` Alphabetical mode.
	 * - `numeric` Numerical mode.
	 * - `alpha-numeric` Alphanumerical mode.
	 * - `none` No keyboard visible.
	 *  
	 * @property {String} [hint] - A hint message to assist the user.
	 * @property {String} [error] - An error message to guide users to correct a mistake.
	 * 
	 * @property {Boolean} [focussed=false] - Indicator if the component should be focussed.
	 * @property {Boolean} [disabled=false] - Indicator if the component should be editable.
	 * 
	 * @property {Number} [maxLength=0] - the maximum character limit for the component
	 * @property {Number} [minLength=0] - the minimim character limit for the component
	 */
	static get properties() {

		return {
			label: { type: String },
			value: { type: String },
			data: { type: Object },
			keyboardMode: { type: String },

			hint: { type: String },
			error: { type: String },

			focussed: { type: Boolean },
			disabled: { type: Boolean },

			maxLength: { type: Number },
			minLength: { type: Number }
		};
	}

	set currentSelection(selection) {
		// // Ensure the input cursor is placed at the end of the input.
		// const inputField = this.shadowRoot.getElementById(`inputField`);

		// inputField.setSelectionRange(
		// 	selection.start,
		// 	selection.end
		// );
	}

	get currentSelection() {
		// Ensure the input cursor is placed at the end of the input.
		const inputField = this.shadowRoot.getElementById(`inputField`);

		// Temporary implementation just acts as if the cursor is at the end
		return {
			start: inputField.innerText.length,
			end: inputField.innerText.length
		};
	}

	get currentInputValue() {
		return this.shadowRoot.getElementById(`inputField`).innerText;
	}

	set maxLength(val) {
		if (val < this.minLength && this.minLength > 0) {
			this.error = `Max length value less than min length value`;
		} else {
			this._maxLength = Number(val);
		}
	}

	get maxLength() {
		return this._maxLength;
	}

	set minLength(val) {
		if (val > this.maxLength && this.maxLength > 0) {
			this.error = `Min length value greater than max length value`;
		} else {
			this._minLength = Number(val);
		}
	}

	get minLength() {
		return this._minLength;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------	

	/**
	 * Extends the behaviour of properties that have changed.
	 * 
	 * @param {Map} changedProperties - The details of the properties that have changed.
	 * @ignore
	 * @returns {void}
	 */
	updated(changedProperties) {

		// Copy the changed value into the content editable input field to be modified in plain text format.
		if (changedProperties.has(`value`)) {
			this.shadowRoot.getElementById(`inputField`).innerText = this.value;
		}

		// Ensure the input field gains focus if the focussed property changes to true.
		if (changedProperties.has(`focussed`) && this.focussed === true) {
			this.shadowRoot.getElementById(`inputField`).focus();
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Handle focus gained events.
	 * 
	 * @param {FocusEvent} event - The event details.
	 * @ignore
	 * @returns {void}
	 */
	_focusGained(event) {

		// Prevent the control from gaining focus when it is in a disabled state.
		if (this.disabled) {
			return event.stopImmediatePropagation();
		}

		// Update the component focus state.
		this.focussed = true;

		// Ensure the input cursor is placed at the end of the input.
		const inputField = this.shadowRoot.getElementById(`inputField`);

		const range = document.createRange();
		range.selectNodeContents(inputField);
		range.collapse(false);

		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);

		this.dispatchEvent(new CustomEvent(`keyboard-input-focus`, {
			detail: {
				keyboardMode: this.keyboardMode,
				valueChangedCallback: () => this._valueChanged(),
				returnMode: `multi-line`, // As opposed to `change-value`
				updateValueCallback: (e) => this._updateValue(e),
				getCurrentValue: () => this.currentInputValue,
				focusCallback: () => this.focus(),
				defocusCallback: () => this.defocus(),
				getSelection: () => this.currentSelection,
				setSelection: (selection) => this.currentSelection = selection,
				getElement: () => this
			},
			bubbles: true,
			composed: true
		}));
	}

	/**
	 * Handle focus lost events.
	 * 
	 * @param {FocusEvent} event - The event details.
	 * @ignore
	 * @returns {void}
	 */
	_focusLost(event) {

		// Update the component focus state.
		this.focussed = false;
		const mode = this.config.platform && this.config.platform.type ? this.config.platform.type : `desktop`;
		if (mode !== `kiosk`) {
			this._valueChanged();
		}
	}

	/**
	 * Handles key input events.
	 *
	 * @param {KeyboardEvent} event - The key input event details.
	 * @ignore
	 * @returns {void}
	 */
	_keyInput(event) {

		const valueLength = this.shadowRoot.getElementById(`inputField`).innerText.length;
		this.error = null;

		if (valueLength > this.maxLength && this.maxLength > 0) {
			this.error = `The maximum character limit of ${this.maxLength} is exceeded by ${valueLength - this.maxLength} characters`;
		} else if (valueLength < this.minLength && this.minLength > 0) {
			this.error = `The field requires atleast ${this.minLength} characters`;
		} else {
			// Notify any subscribers that a key input occurred.
			this.dispatchEvent(new CustomEvent(`key-input`, {
				detail: {
					action: event.inputType,
					old: this.value,
					new: this.shadowRoot.getElementById(`inputField`).innerText
				}
			}));
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	focus() {
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	defocus() {
		this.shadowRoot.getElementById(`inputField`).blur();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateValue(e) {
		this.shadowRoot.getElementById(`inputField`).innerText = e.newValue;
		if (e.keyInput === true) {
			this._keyInput(e);
		}
		this.focus();
	}

	_valueChanged() {
		// Lookup and cache the updated value.
		const oldValue = this.value;
		const newValue = this.value = this.shadowRoot.getElementById(`inputField`).innerText;

		// Notify any subscribers that the value has changed.
		if (oldValue !== newValue) {

			this.dispatchEvent(new CustomEvent(`value-changed`, {
				detail: {
					old: oldValue,
					new: newValue
				}
			}));

			this.dispatchEvent(new CustomEvent(`value-change`, {
				detail: {
					old: oldValue,
					new: newValue
				}
			}));
		}
	}

	// ---------
	// RENDERING
	// ---------	

	static get styles() {

		return [
			super.styles,
			css`
				${InputLayouts}

				.container > .field {
					height: 100px;
					overflow: auto;
				}
				
				.label.red {
					color: var(--theme-input-error-label-font-color, #E63934);
				}

				.focussed > .label.blue {
					color: var(--theme-button-default-font-color, #009DE0);
				}

				.focussed > .label.red {
					color: var(--theme-input-error-label-font-color, #E63934);
				}

				.field::-webkit-scrollbar {
					width: calc(var(--theme-scrollbar-thumb-width, 10px) + var(--theme-scrollbar-track-padding-left, 2px) + var(--theme-scrollbar-track-padding-right, 2px));
				}
				
				.field::-webkit-scrollbar-track {
					border-radius: var(--theme-scrollbar-track-border-radius, 10px);
					background-color: var(--theme-scrollbar-track-background-color, transparent);
				}

				.field::-webkit-scrollbar-thumb {
					border-radius: var(--theme-scrollbar-thumb-border-radius, 10px);
					background-color: var(--theme-scrollbar-thumb-background-color, #d9d9d9);
					
					border-top: var(--theme-scrollbar-track-padding-top, 2px) solid transparent;
					border-bottom: var(--theme-scrollbar-track-padding-bottom, 2px) solid transparent;
					border-left: var(--theme-scrollbar-track-padding-left, 2px) solid transparent;
					border-right: var(--theme-scrollbar-track-padding-right, 2px) solid transparent;
					
					background-clip: padding-box;
				}
			`
		];
	}

	render() {

		return html`
			<div class="container${this.value ? ` completed` : ``}${this.error ? ` error` : ``}${this.focussed ? ` focussed` : ``}${this.disabled ? ` disabled` : ``}">
				<label
					class="label${this.focussed ? ` blue` : ``}${this.error ? ` red` : ``}"
					for="inputField"
					@click="${() => this.focus()}">${this.label}</label>

				<div
					class="field"
					id="inputField"
					contenteditable="${!this.disabled}"
					?readonly="${this.disabled}"
					tabindex="${this.disabled ? `` : 0}"
					@input="${this._keyInput}">
				</div>
				
				${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
				${this.error ? html`<div class="error">${this.error}</div>` : ``}
			</div>
		`;
	}
}

window.customElements.define(`capitec-text-box`, TextBox);

/**
 * When the control loses focus (Tab, Enter, click-away) and the input value has changed from originally gaining focus.
 *
 * @example
 * <capitec-text-box ... @value-change="${this._handler}"></capitec-text-box>
 *
 * @event TextBox#value-change
 * @type {Object}
 * @property {Object} detail - Contains the old and new value.
 * @property {String} detail.old - The old value.
 * @property {String} detail.new - The new value.
 */

/**
 * When the user enters or changes text characters in the input.
 *
 * @example
 * <capitec-text-box ... @key-input="${this._handler}"></capitec-text-box>
 *
 * @event TextBox#key-input
 * @type {Object}
 * @property {Object} detail Contains the action, old and new value.
 * @property {Object} detail.action - the action that will be performed.
 * @property {String} detail.old - The old value.
 * @property {String} detail.new - The new value.
 */