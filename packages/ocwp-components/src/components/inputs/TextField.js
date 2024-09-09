import { Component, css, html, ifDefined } from '../../elements/index.js';
import { InputLayouts } from '../input-layouts.js';

/**
 * An input control that allows a user to enter a single line of text.
 * 
 * ```js
 * import 'platform/components/inputs/TextField';
 * ```
 * 
 * ```html
 * <capitec-text-field
 *   label="Enter a value"
 *   value="Hello World"
 *   data="{'id': 12345, 'name': 'Test'}"
 *   keyboardMode="alpha-numeric"
 *   type="alpha-numeric"
 *   hint="Required"
 *   error="Field level error message"
 * 	 minlength=0
 * 	 maxlength=20
 * 	 min=1
 * 	 max=10
 *   disabled>
 * </capitec-text-field>
 * ```
 * 
 * @prop {"alpha-numeric"|"numeric"|"currency"|"password"|"search"|String} type - Type of input supported
 * @prop {"alpha-numeric"|"numeric"|"none"|String} keyboardMode - Keyboard mode supported
 */
export class TextField extends Component {

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
		this.value = null;
		this.data = null;
		this.keyboardMode = `alpha-numeric`;
		this.type = `alpha-numeric`;

		this.hint = null;
		this.error = null;

		this.focussed = false;
		this.disabled = false;

		this.minlength = 0;
		this.maxlength = 0;

		this.min = 0;
		this.max = 0;

		this.passwordVisible = false;
		this.clearVisible = false;

		// Register state event listeners.
		this.addEventListener(`focus`, this._focusGained.bind(this));
		this.addEventListener(`focusout`, this._focusLost.bind(this));

		// Internal property
		this._oldValue = ``;

		this._min = 0;
		this._max = 0;

		this._minlength = 0;
		this._maxlength = 0;

		this._parentPadding = ``;
		this._heightOfKeyboard = 340;
		this._heightOfTextField = 70;
		this._heightOfHint = 20;

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
	 * - `alpha` Alphabetical mode. [This code has been deprecated but is still supported]
	 * - `numeric` Numerical mode.
	 * - `alpha-numeric` Alphanumerical mode.
	 * - `none` No keyboard visible.
	 * 
	 * @property {String} [type="alpha-numeric"] - Type of input supported:
	 * - `alpha-numeric` Alphanumeric text input.
	 * - `numeric` Numeric text input.
	 * - `currency` Currency text input.
	 * - `password` Password text input.
	 * - `search` Search text input.
	 * - `numeric-input` Numeric text input with plus and minus buttons.
	 * 
	 * @property {String} [hint] - A hint message to assist the user.
	 * @property {String} [error] - An error message to guide users to correct a mistake.
	 * 
	 * @property {Boolean} [focussed=false] - Indicator if the component should be focussed.
	 * @property {Boolean} [disabled=false] - Indicator if the component should be editable.
	 * @property {Number} [minlength=0] - Value of the minlength attribute on the input
	 * @property {Number} [maxlength=0] - Value of the maxlength attribute on the input
	 * @property {Number} [min=0] - The minimum allowed value. Note should only be used when type is set to `numeric` or `currency` or `numeric-input`.
	 * @property {Number} [max=0] - The maximum allowed value. Note should only be used when type is set to `numeric` or `currency` or `numeric-input`.
	 */
	static get properties() {

		return {
			label: { type: String },
			value: { type: String },
			data: { type: Object },
			keyboardMode: { type: String },
			type: { type: String },

			hint: { type: String },
			error: { type: String },

			focussed: { type: Boolean },
			disabled: { type: Boolean },
			minlength: { type: Number },
			maxlength: { type: Number },
			min: { type: Number },
			max: { type: Number }
		};
	}

	set currentSelection(selection) {
		// Ensure the input cursor is placed at the end of the input.
		const inputField = this.shadowRoot.getElementById(`inputField`);

		inputField.setSelectionRange(
			selection.start,
			selection.end
		);
	}

	get currentSelection() {
		// Ensure the input cursor is placed at the end of the input.
		const inputField = this.shadowRoot.getElementById(`inputField`);

		return {
			start: inputField.selectionStart,
			end: inputField.selectionEnd
		};
	}

	get currentInputValue() {
		return this.shadowRoot.getElementById(`inputField`).value;
	}

	get rightIcon() {
		// Ensures that extra padding is applied to the right side of the input so the value does not go behind the icon
		if (this.type === `search` || this.type === `password`) {
			return true;
		}
		return false;
	}

	get min() {
		return this._min;
	}

	set min(val) {
		this.error = null;
		if (val > this.max && this.max > 0) {
			this.error = `min value is greater than the max value`;
		} else {
			this._min = Number(val);
		}
	}

	get max() {
		return this._max;
	}

	set max(val) {
		this.error = null;
		if (val < this.min && this.min > 0) {
			this.error = `max value is less than min value`;
		} else {
			this._max = Number(val);
		}
	}

	get minlength() {
		return this._minlength;
	}

	set minlength(val) {
		this.error = null;
		if (val > this.maxlength && this.maxlength > 0) {
			this.error = `min length value greater than max length value`;
		} else {
			this._minlength = Number(val);
		}
	}

	get maxlength() {
		return this._maxlength;
	}

	set maxlength(val) {
		this.error = null;
		if (val < this.minlength && this.minlength > 0) {
			this.error = `max length value less than the min length value`;
		} else {
			this._maxlength = Number(val);
		}
	}

	get value() {
		return this._value;
	}

	set value(val) {

		const oldVal = this._value;

		this._value = val;

		if (!this._value) {
			this._toggleClearHide();
		} else {
			this._toggleClearShow();
		}

		this.requestUpdate(`value`, oldVal);
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------	

	/**
	 * Activates the component once all initialization processes are complete.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	connectedCallback() {

		// Ensure the base class activation logic is applied.
		super.connectedCallback();

		// Ensure the input value is initialized.
		if (!this.value) {
			this.value = ``;
		}
	}

	/**
	 * Extends the behaviour of properties that have changed.
	 * 
	 * @param {Map} changedProperties - The details of the properties that have changed.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	updated(changedProperties) {

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
	 * 
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
		// const inputField = this.shadowRoot.getElementById(`inputField`);

		// This moves the cursor to the end of the input instead of where the selection is
		// inputField.setSelectionRange(
		// 	inputField.value.length,
		// 	inputField.value.length
		// );

		this.dispatchEvent(new CustomEvent(`keyboard-input-focus`, {
			detail: {
				keyboardMode: (this.type === `numeric` || this.type === `currency` || this.type === `numeric-input`) && this.keyboardMode !== `none` ? `numeric` : this.keyboardMode,
				mask: this.type === `password` && this.passwordVisible !== true,
				valueChangedCallback: () => this._valueChanged(),
				returnMode: `change-value`, // As opposed to `multi-line`
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

		const mode = this.config.platform && this.config.platform.type ? this.config.platform.type : `desktop`;
		if (mode === `kiosk`) {
			this._scrollIntoFocus(event.target);
		}
	}

	/**
	 * Handle focus lost events.
	 * 
	 * @param {FocusEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_focusLost(event) {

		// Update the component focus state.
		this.focussed = false;
		const mode = this.config.platform && this.config.platform.type ? this.config.platform.type : `desktop`;
		if (mode !== `kiosk` || !this.value) {
			this._valueChanged();
		}

		if (mode === `kiosk` && this._parentPadding) {
			this.parentContainerElement.style.paddingBottom = `${parseInt(this.parentContainerElement.style.paddingBottom.replace(`px`, ``), 10) - this._parentPadding}px`;
		}
	}

	/**
	 * Handles key input events.
	 *
	 * @param {KeyboardEvent} event - The key input event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_keyInput(event) {

		const inputField = this.shadowRoot.getElementById(`inputField`);

		if (this.type === `search`) {
			if (inputField.value === ``) {
				this._toggleClearHide();
			} else {
				this._toggleClearShow();
			}
		}

		if (this.type === `numeric` || this.type === `numeric-input` || this.type === `currency`) {

			if (Number(inputField.value) > this.max && this.max > 0 && (this.error === null || this.error === ``)) {
				this.error = `The maximum value limit of ${this.max} is exceeded by ${inputField.value - this.max}`;
				return;
			} else if (Number(inputField.value) < this.min && this.min > 0 && (this.error === null || this.error === ``)) {
				this.error = `This field requires a minimum value of ${this.min}`;
				return;
			} else if (Number(inputField.value) >= this.min && this.min >= 0 && Number(inputField.value) <= this.max && this.max >= 0 && this.error !== ``) {
				this.error = null;
			}

			const reg = new RegExp(`^$|^\\d+(?:\\.\\d{0,2})?$`);
			const valid = reg.test(inputField.value);

			if (valid === false) {
				inputField.value = this._oldValue;
				return;
			}
			this._oldValue = inputField.value;
			this._valueChanged();
		}

		this.dispatchEvent(new CustomEvent(`input`, {
			detail: {
				action: event.inputType,
				old: this.value,
				new: inputField.value
			}
		}));

		// Deprecated event
		this.dispatchEvent(new CustomEvent(`key-input`, {
			detail: {
				action: event.inputType,
				old: this.value,
				new: inputField.value
			}
		}));
	}

	/**
	 * @param  {KeyboardEvent} event keyboard event
	 * @returns {void}
	 */
	_keyUp(event) {

		if (event.key === `Enter`) {
			this._valueChanged();
		}
	}

	_togglePasswordVisible() {
		this.passwordVisible = !this.passwordVisible;

		// Notifying focus to ensure that keyboard is aware of mask change 
		this._focusGained();
		this.requestUpdate();
	}

	_clear() {
		this.shadowRoot.getElementById(`inputField`).value = ``;
		this._valueChanged();
		this._toggleClearHide();

		this.dispatchEvent(new CustomEvent(`input`, {
			detail: {
				action: `clear`,
				old: this.value,
				new: ``
			}
		}));

		// Deprecated event
		this.dispatchEvent(new CustomEvent(`key-input`, {
			detail: {
				action: `clear`,
				old: this.value,
				new: ``
			}
		}));
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

	_elementHasVerticalScrollbar(element) {
		return element && element.scrollHeight && element.clientHeight && element.scrollHeight > element.clientHeight;
	}

	_scrollIntoFocus(element) {
		let parentElement = element.parentElement;
		while (parentElement && !this._elementHasVerticalScrollbar(parentElement)) {
			parentElement = parentElement.parentElement;
		}
		this.parentContainerElement = parentElement || element.parentElement;

		const maxScrollHeight = this.parentContainerElement.scrollHeight;
		const topElementOffset = element.offsetTop - this.parentContainerElement.offsetTop;
		const topKeyboardOffset = this.parentContainerElement.offsetHeight - this._heightOfKeyboard - this._heightOfTextField;

		const maxScrollableHeight = maxScrollHeight - topKeyboardOffset - this._heightOfKeyboard - this._heightOfTextField;
		const yScroll = topElementOffset - topKeyboardOffset;

		if (yScroll > maxScrollableHeight) {
			this._parentPadding = `${this._heightOfKeyboard - (maxScrollHeight - topElementOffset - this._heightOfTextField - this._heightOfHint)}`;
			this.parentContainerElement.style.paddingBottom = `${this._parentPadding}px`;
		}

		let scrollElement = element.parentElement;
		while (scrollElement && !this._elementHasVerticalScrollbar(scrollElement)) {
			scrollElement = scrollElement.parentElement;
		}
		scrollElement = scrollElement || element.parentElement;

		scrollElement.scroll({ top: yScroll, behavior: `smooth` });
	}

	_updateValue(e) {
		this.shadowRoot.getElementById(`inputField`).value = e.newValue;
		if (e.keyInput === true) {
			this._keyInput(e);
		}
		this.focus();
	}

	_valueChanged() {
		// Lookup and cache the updated value.
		const oldValue = this.value;
		const newValue = this.value = this.shadowRoot.getElementById(`inputField`).value;

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

	_toggleClearShow() {
		this.clearVisible = true;
		this.requestUpdate();
	}

	_toggleClearHide() {
		this.clearVisible = false;
		this.requestUpdate();
	}

	_onAddClick() {

		// Ignore the click event if the item is disabled.
		if (this.disabled) {
			return;
		}

		this.error = null;

		if (this.value === 0 || this.value === `` || this.value === `0`) {
			this._updateNumericInput(1);
		} else {
			let tempValue = parseInt(this.value, 10);

			if (tempValue < this.max || this.max === 0) {
				tempValue++;
			} else {
				this.error = `The maximum value limit of ${this.max} cannot be exceeded`;
				return;
			}
			this._updateNumericInput(tempValue);
		}
	}

	_onMinusClick() {

		// Ignore the click event if the item is disabled.
		if (this.disabled) {
			return;
		}

		this.error = null;

		if (this.value === 0 || this.value === `` || this.value === `0`) {
			this.value = 0;
		} else {

			let tempValue = parseInt(this.value, 10);

			if (tempValue > this.min || this.min === 0) {
				tempValue--;

				if (tempValue > this.max && this.max > 0) {
					this.error = `The maximum value limit of ${this.max} cannot be exceeded`;
				}
			} else if (tempValue - 1 < this.min && this.min > 0) {
				this.error = `The minimum value limit of ${this.min} cannot be preceded`;
			}
			this._updateNumericInput(tempValue);
		}
	}

	_updateNumericInput(tempValue) {

		this._oldValue = this.value;
		this.value = tempValue.toString();

		this.dispatchEvent(new CustomEvent(`value-change`, {
			detail: {
				old: this._oldValue,
				new: this.value
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
				${InputLayouts}

				/*Prevent spinner on Number Input*/
				input[type=number]::-webkit-inner-spin-button, 
				input[type=number]::-webkit-outer-spin-button { 
					-webkit-appearance: none; 
					margin: 0; 
				}
				
				.currency-symbol {
					position: absolute;
					margin-left: var(--theme-input-currency-symbol-margin-left, 16px);
					margin-top: var(--theme-input-currency-symbol-margin-top, 12px);
					color: var(--theme-input-currency-symbol-color, #4E6066);
					font-size: var(--theme-input-currency-symbol-size, 16px);
				}

				.password-icon {
					position:absolute;
					right: var(--theme-input-password-icon-right, 12.5px);
					top: var(--theme-input-password-icon-top, 13px);
					cursor: pointer;
				}

				.container > .currency-label.idle {
					margin-left: var(--theme-input-currency-label-idle-margin-left, 23px);
					margin-top: var(--theme-input-currency-label-idle-margin-top, 1px);
				}

				.focussed > .currency-label.blue {
					color: var(--theme-button-default-font-color, #009DE0);
					padding-left: var(--theme-input-label-padding-sides, 4px);
					padding-right: var(--theme-input-label-padding-sides, 4px);
				}

				.completed > .currency-label.idle {
					margin-left: 0px;
					margin-top: 0px;
					color: var(--theme-input-font-color, #4E6066);
					padding-left: var(--theme-input-label-padding-sides, 4px);
					padding-right: var(--theme-input-label-padding-sides, 4px);
				}

				.container > .currency-field {
					text-indent: var(--theme-input-currency-field-text-indent, 18px);
				}

				.container > .currency-label {
					font-size: var(--theme-input-label-font-size, 16px);
				}

				::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
					color: var(--theme-input-currency-field-placeholder-color, #B3B5B5);
					opacity: 1; /* Firefox */
				}
				
				:-ms-input-placeholder { /* Internet Explorer 10-11 */
					color: var(--theme-input-currency-field-placeholder-color, #B3B5B5);
				}
				
				::-webkit-input-placeholder { /* Microsoft Edge */
					color: var(--theme-input-currency-field-placeholder-color, #B3B5B5);
				}

				.search-icon {
					position: absolute;
					margin-left: var(--theme-input-search-icon-margin-left, 20px);
					top: var(--theme-input-search-icon-margin-top, 19px);
				}

				.search-clear-icon {
					position: absolute;
					right: var(--theme-input-clear-icon-right, 13px);
					top: var(--theme-input-clear-icon-top, 14px);
					cursor: pointer;
				}

				.clear-icon {
					height: var(--theme-input-clear-icon-height, 20px);
					width: var(--theme-input-clear-icon-width,20px);
				}

				.container > .label.search.idle {
					margin-left: var(--theme-input-search-label-idle-margin-left, 40px);
					margin-top: var(--theme-input-search-label-idle-margin-top, 6px);
				}

				.focussed > .label.search.blue {
					color: var(--theme-button-default-font-color, #009DE0);
					padding-left: var(--theme-input-label-padding-sides, 4px);
					padding-right: var(--theme-input-label-padding-sides, 4px);
					font-size: var(--theme-input-search-label-focussed-font-size,0.75em);
				}

				.completed > .label.search.idle {
					margin-left: 0px;
					margin-top: 0px;
					color: var(--theme-input-font-color, #4E6066);
					padding-left: var(--theme-input-label-padding-sides, 4px);
					padding-right: var(--theme-input-label-padding-sides, 4px);
				}

				.container > .field.search {
					text-indent: var(--theme-input-search-field-text-indent, 40px);
					
				}			
				.container > .field.icon {
					padding-right: var(--theme-input-field-padding-right-icon, 40px);
				}

				.container > .field {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.clearHide {
					display:none;
				}

				.clearShow {
					display:block;
				}

				.quantity {
					position: absolute;
					display: flex;
					right: 0px;
				}

				.plus {
					line-height: var(--theme-input-numeric-input-plus-line-height, 10px);
				}

				.minus {
					line-height: var(--theme-input-numeric-input-minus-line-height, 6px);
				}

				.plus-minus-sign {
                    cursor: pointer;
                    font-size: var(--theme-input-numeric-input-plus-minus-sign-font-size, 22px);
					height: var(--theme-input-numeric-input-plus-minus-sign-height, 48px);
					width: var(--theme-input-numeric-input-plus-minus-sign-width, 48px);
					padding-top: var(--theme-input-numeric-input-plus-minus-sign-padding-top,20px);
					text-align: center;
				}

				.plus.plus-minus-sign:hover {
					background-color: var(--theme-input-numeric-input-plus-minus-focussed-hover,rgba(0,157,224,0.1));
				}

				.minus.plus-minus-sign:hover {
					background-color: var(--theme-input-numeric-input-plus-minus-focussed-hover,rgba(0,157,224,0.1));
				}

				.container.focussed > .quantity > .plus.plus-minus-sign:hover {
					color: var(--theme-input-numeric-input-plus-minus-focussed-color, #009DE0);
				}

				.container.focussed > .quantity > .minus.plus-minus-sign:hover {
					color: var(--theme-input-numeric-input-plus-minus-focussed-color, #009DE0);
				}

                .divider {
                    background-color: #E1E1E1;
					height: var(--theme-input-numeric-input-divider-height, 36px);
					margin-top: var(--theme-input-numeric-input-divider-margin-top, 6px);
					width: var(--theme-input-numeric-input-divider-width, 1px);
                }

				.error-icon {
                    margin-right: var(--theme-input-numeric-input-plus-minus-error-icon-margin-right, 8px);
                }
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<div
				class="container${this.value && (!this.focussed || this.focussed === false) ? ` completed` : ``}${this.error ? ` error` : ``}${this.focussed === true ? ` focussed` : ``}${this.disabled ? ` disabled` : ``}">
			
				${this.type === `search`
				? html`
				<capitec-icon class="search-icon" icon="system/search"></capitec-icon>
				<div class="search-clear-icon ${this.clearVisible === true ? `clearShow` : `clearHide`}" id="clear"
					@click="${(e) => this._clear()}">
					<img class="clear-icon" src="./platform/icons/status/unsuccessful-blue.svg">
				</div>`
				: ``
			}
			
				<label
					class="label${this.error ? ` error` : ``}${this.type === `currency` ? ` currency-label` : ``}${this.type === `search` ? ` search` : ``}${this.focussed === true ? ` blue` : ` idle`}"
					for="inputField" @click="${() => this.focus()}">${this.label}</label>
			
				${this.type === `currency` ? html`<label class="currency-symbol">R</label>` : ``/* Currency only supports South
				African Rand */}
			
				${this.type === `password`
				? html`
				<capitec-icon class="password-icon" icon="${this.passwordVisible === true
						? `system/eye-visible-action`
						: `system/eye-hidden-action`}" @click="${(e) => this._togglePasswordVisible()}">`
				: ``}
			
					${this.type === `numeric-input`
				? html`
					<div class="quantity">
						${this.error ? html`<capitec-icon class="error-icon" size="small" icon="status/error"></capitec-icon>` : ``}
						${this.error ? html`<div class="divider"></div>` : ``}
						<div class="plus plus-minus-sign" @click="${(e) => this._onAddClick()}">+</div>
						<div class="divider"></div>
						<div class="minus plus-minus-sign" @click="${(e) => this._onMinusClick()}">-</div>
					</div>
					` : ``}
			
					<input
						class="field${this.type === `currency` ? ` currency-field` : ``}${this.type === `search` ? ` search` : ``}${this.rightIcon === true ? ` icon-padding` : ``}"
						id="inputField"
						.type="${this.type === `alpha-numeric` ? `text` : ``}${this.type === `numeric` || this.type === `numeric-input` || this.type === `currency` ? `tel` : ``}${this.type === `password` && this.passwordVisible === false ? `password` : ``}${this.type === `password` && this.passwordVisible === true ? `text` : ``}${this.type === `search` ? `text` : ``}"
						.value="${this.value}" ?readonly="${this.disabled}" tabindex="${this.disabled ? `` : 0}"
						placeholder="${this.type === `currency` && this.focussed === true ? `0.00` : ``}"
						minlength="${ifDefined(this.minlength > 0 ? this.minlength : undefined)}"
						maxlength="${ifDefined(this.maxlength > 0 ? this.maxlength : undefined)}" @input="${e => this._keyInput(e)}"
						@keyup="${e => this._keyUp(e)}" />
			
					${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
					${this.error ? html`<div class="error">${this.error}</div>` : ``}
			</div>
		`;
	}

	_kioskTemplate() {
		return this._webTemplate();
	}
}

window.customElements.define(`capitec-text-field`, TextField);

/**
 * When the control loses focus (Tab, Enter, click-away) and the input value has changed from originally gaining focus.
 *
 * @example
 * <capitec-text-field ... @value-change="${this._handler}"></capitec-text-field>
 *
 * @event TextField#value-change
 * @type {Object}
 * @property {Object} detail - Contains the old and new value.
 * @property {String} detail.old - The old value.
 * @property {String} detail.new - The new value.
 */

/**
 * When the user enters or changes any text characters in the input.
 *
 * @example
 * <capitec-text-field ... @key-input="${this._handler}"></capitec-text-field>
 *
 * @event TextField#key-input
 * @type {Object}
 * @property {Object} detail Contains the action, old and new value.
 * @property {Object} detail.action - the action that will be performed.
 * @property {String} detail.old - The old value.
 * @property {String} detail.new - The new value.
 */