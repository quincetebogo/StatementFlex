
import { Component, css, html } from '../../elements/index.js';
import { InputLayouts } from '../input-layouts.js';

/**
 * An input control that allows a user to enter rich formatted text content.
 * 
 * ```js
 * import 'platform/components/inputs/RichTextBox';
 * ```
 * 
 * ```html
 * <capitec-rich-text-box
 *   label="Enter a value"
 *   value="Hello World"
 *   data="{'id': 12345, 'name': 'Test'}"
 *   keyboardMode="alpha"
 *   hint="Required"
 *   error="Field level error message"
 *   disabled>
 * </capitec-rich-text-box>
 * ```
 * 
 * @prop {"alpha"|"numeric"|"alpha-numeric"|"none"|String} keyboardMode - Keyboard mode supported
 */
export class RichTextBox extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		super();

		this.label = null;
		this.value = null;
		this.data = null;
		this.keyboardMode = `alpha-numeric`;

		this.hint = null;
		this.error = null;

		this.focussed = false;
		this.disabled = false;

		this.minLength = 0;
		this.maxLength = 0;

		// Internal variables

		this._minLength = 0;
		this._maxLength = 0;

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
	 * @property {Number} [minLength=0] - the minimum character limit for the component
	 * @property {Number} [maxLength=0] - the maximum character limit for the component
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

			minLength: { type: Number },
			maxLength: { type: Number }
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
			start: inputField.innerHTML.length,
			end: inputField.innerHTML.length
		};
	}

	get currentInputValue() {
		return this.shadowRoot.getElementById(`inputField`).innerHTML;
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

		// Copy the changed value into the content editable input field to be modified in HTML format.
		if (changedProperties.has(`value`)) {
			this.shadowRoot.getElementById(`inputField`).innerHTML = this.value;
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

		this.error = null;
		// Lookup the event details.
		const inputField = this.shadowRoot.getElementById(`inputField`);

		// Clear the content area if nothing left.
		if (inputField.innerHTML === `<br>`) {
			inputField.innerHTML = ``;
		}

		if (inputField.innerText.length > this.maxLength && this.maxLength > 0) {
			this.error = `The maximum character limit of ${this.maxLength} is exceeded by ${inputField.innerText.length - this.maxLength}`;
		} else if (inputField.innerText.length < this.minLength && this.minLength > 0) {
			this.error = `The field requires at least ${this.minLength} characters`;
		} else {
			// Notify any subscribers that a key input occurred.
			this.dispatchEvent(new CustomEvent(`key-input`, {
				detail: {
					action: event.inputType,
					old: this.value,
					new: inputField.innerHTML
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
		this.shadowRoot.getElementById(`inputField`).innerHTML = e.newValue;
		if (e.keyInput === true) {
			this._keyInput(e);
		}
		this.focus();
	}

	_valueChanged() {
		// Lookup and cache the updated value.
		const oldValue = this.value;
		const newValue = this.value = this.shadowRoot.getElementById(`inputField`).innerHTML;

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

	/**
	 * Set the formatting style to bold.
	 * @ignore
	 * @returns {void}
	 */
	_insertBold() {

		// Execute the editing style.
		document.execCommand(`bold`, false);

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	/**
	 * Set the formatting style to italic.
	 * @ignore
	 * @returns {void}
	 */
	_insertItalic() {

		// Execute the editing style.
		document.execCommand(`italic`, false);

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	/**
	 * Set the formatting style to underline.
	 * @ignore
	 * @returns {void}
	 */
	_insertUnderline() {

		// Execute the editing style.
		document.execCommand(`underline`, false);

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	/**
	 * Set the formatting style to bold.
	 * @ignore
	 * @returns {void}
	 */
	_insertStrikethrough() {

		// Execute the editing style.
		document.execCommand(`strikethrough`, false);

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	/**
	 * Insert a h1 into the input field.
	 * @ignore
	 * @returns {void}
	 */
	_insertHeading1() {

		// Execute the editing style.
		document.execCommand(`formatBlock`, false, `<h1>`);

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	/**
	 * Insert a h2 into the input field.
	 * @ignore
	 * @returns {void}
	 */
	_insertHeading2() {

		// Execute the editing style.
		document.execCommand(`formatBlock`, false, `<h2>`);

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	/**
	 * Insert a paragraph into the input field.
	 * @ignore
	 * @returns {void}
	 */
	_insertParagraph() {

		// Execute the editing style.
		document.execCommand(`formatBlock`, false, `<p>`);

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	/**
	 * Insert an ordered list into the input field.
	 * @ignore
	 * @returns {void}
	 */
	_insertOrderedList() {

		// Execute the editing style.
		document.execCommand(`insertOrderedList`, false);

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	/**
	 * Insert an unordered list into the input field.
	 * @ignore
	 * @returns {void}
	 */
	_insertUnorderedList() {

		// Execute the editing style.
		document.execCommand(`insertUnorderedList`, false);

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	/**
	 * Insert a horizontal rule into the input field.
	 * @ignore
	 * @returns {void}
	 */
	_insertHorizontalRule() {

		// Execute the editing style.
		document.execCommand(`insertHorizontalRule`, false);

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	/**
	 * Insert an hyperlink into the input field.
	 * @ignore
	 * @returns {void}
	 */
	_insertHyperlink() {

		// Prompt the user to supply a link URL.
		const url = window.prompt(`Enter the link URL`);

		// Add the link to the input field (if set).
		if (url) {
			document.execCommand(`createLink`, false, url);
		}

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	/**
	 * Insert an image into the input field.
	 * @ignore
	 * @returns {void}
	 */
	_insertImage() {

		// Prompt the user to supply a image URL.
		const url = window.prompt(`Enter the image URL`);

		// Add the image to the input field (if set).
		if (url) {
			document.execCommand(`insertImage`, false, url);
		}

		// Ensure the input field has focus.
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	// ---------
	// RENDERING
	// ---------	

	static get styles() {

		return [
			super.styles,
			css`
				${InputLayouts}

				/* LAYOUT STYLES */

				.container > .field {
					padding: 0px;
				}
				
				.container > .field > #inputField {
					height: 100px;
					overflow: auto;

					box-sizing: border-box;
					outline: 0;
					
					border: none;

					padding-top: var(--theme-input-padding-top, 8px);
					padding-bottom: var(--theme-input-padding-bottom, 14px);
					padding-left: var(--theme-input-padding-left, 10px);
					padding-right: var(--theme-input-padding-right, 10px);
				}

				.container.completed > .field > #inputField, .container.focussed > .field > #inputField {
					padding-top: var(--theme-input-padding-top, 8px);
					padding-bottom: var(--theme-input-padding-bottom, 14px);
				}
				
				.container.completed > .field, .container.focussed > .field {
					padding-top: 0px;
					padding-bottom: 0px;
				}
				
				.container > .field .action-bar {
					border-top: 1px solid var(--theme-input-border-color, #cdcdcd);
				}

				.container > .field .action-bar > button {
					height: 30px;
					width: 30px;

					background-color: transparent;
					border: none;

					cursor: pointer;
					outline: 0;

					vertical-align: bottom;
				}
				
				.container.disabled > .field > .action-bar {
					display: none;
				}

				#inputField::-webkit-scrollbar {
					width: calc(var(--theme-scrollbar-thumb-width, 10px) + var(--theme-scrollbar-track-padding-left, 2px) + var(--theme-scrollbar-track-padding-right, 2px));
				}
				
				#inputField::-webkit-scrollbar-track {
					border-radius: var(--theme-scrollbar-track-border-radius, 10px);
					background-color: var(--theme-scrollbar-track-background-color, transparent);
				}

				#inputField::-webkit-scrollbar-thumb {
					border-radius: var(--theme-scrollbar-thumb-border-radius, 10px);
					background-color: var(--theme-scrollbar-thumb-background-color, #d9d9d9);
					
					border-top: var(--theme-scrollbar-track-padding-top, 2px) solid transparent;
					border-bottom: var(--theme-scrollbar-track-padding-bottom, 2px) solid transparent;
					border-left: var(--theme-scrollbar-track-padding-left, 2px) solid transparent;
					border-right: var(--theme-scrollbar-track-padding-right, 2px) solid transparent;
					
					background-clip: padding-box;
				}

				/* EDITOR STYLES */

				#inputField h1 {
					font-size: 18px;
					font-weight: bold;
					margin: 0px 0px 5px 0px;
					padding: 0px;
				}

				#inputField h2 {
					font-size: 16px;
					font-weight: bold;
					margin: 0px 0px 5px 0px;
					padding: 0px;
				}

				#inputField p, #inputField div {
					font-size: 14px;
					font-weight: normal;
					margin: 0px;
					padding: 0px;
				}

				#inputField ul, ol {
					font-size: 14px;
					font-weight: normal;
					margin: 0px;
					padding: 0px 0px 0px 20px;
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
			<div class="container${this.value ? ` completed` : ``}${this.error ? ` error` : ``}${this.focussed ? ` focussed` : ``}${this.disabled ? ` disabled` : ``}">
				<label
					class="label${this.focussed ? ` blue` : ``}${this.error ? ` red` : ``}"
					for="inputField"
					@click="${() => this.focussed = true}">${this.label}</label>

				<div class="field">
					<div
						id="inputField"
						?contenteditable="${!this.disabled}"
						?readonly="${this.disabled}"
						tabindex="${this.disabled ? `` : 0}"
						@input="${this._keyInput}">
					</div>

					<div class="action-bar">
						<button tabindex="-1" title="Bold" @click="${() => this._insertBold()}"><b>B</b></button>
						<button tabindex="-1" title="Italic" @click="${() => this._insertItalic()}"><i>I</i></button>
						<button tabindex="-1" title="Underline" @click="${() => this._insertUnderline()}"><u>U</u></button>
						<button tabindex="-1" title="Strike-through" @click="${() => this._insertStrikethrough()}"><strike>S</strike></button>
						<button tabindex="-1" title="Heading 1" @click="${() => this._insertHeading1()}"><b>H<sub>1</sub></b></button>
						<button tabindex="-1" title="Heading 2" @click="${() => this._insertHeading2()}"><b>H<sub>2</sub></b></button>
						<button tabindex="-1" title="Paragraph" @click="${() => this._insertParagraph()}">&#182;</button>
						<button tabindex="-1" title="Ordered List" @click="${() => this._insertOrderedList()}">&#35;</button>
						<button tabindex="-1" title="Unordered List" @click="${() => this._insertUnorderedList()}">&#8226;</button>
						<button tabindex="-1" title="Horizontal Line" @click="${() => this._insertHorizontalRule()}">&#8213;</button>
						<button tabindex="-1" title="Link" @click="${() => this._insertHyperlink()}">&#128279;</button>
						<button tabindex="-1" title="Image" @click="${() => this._insertImage()}">&#128247;</button>
					</div>
				</div>

				${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
				${this.error ? html`<div class="error">${this.error}</div>` : ``}
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

window.customElements.define(`capitec-rich-text-box`, RichTextBox);

/**
 * Notify any subscribers that a key input occurred.
 *
 * @example
 * <capitec-rich-text-box ... @key-input="${this._handler}"></capitec-rich-text-box>
 *
 * @event RichTextBox#key-input
 * @type {Object}
 * @property {Object} detail Contains the action, old and new value.
 * @property {Object} detail.action - the action that will be performed.
 * @property {String} detail.old - The old value.
 * @property {String} detail.new - The new value.
 */

/**
 * Notify any subscribers that the value has changed.
 *
 * @example
 * <capitec-rich-text-box ... @value-change="${this._handler}"></capitec-rich-text-box>
 *
 * @event RichTextBox#value-change
 * @type {Object}
 * @property {Object} detail Contains the old and new value
 * @property {String} detail.old - The old value.
 * @property {String} detail.new - The new value.
 */