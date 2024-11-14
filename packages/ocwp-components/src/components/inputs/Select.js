import { Component, css, html, ifDefined } from '../../elements/index.js';

import { InputLayouts } from '../input-layouts.js';

/**
 * An input control that allows a user to select an option as input value.
 * 
 * ```js 
 * import 'platform/components/inputs/Select'; 
 * ```
 * 
 * ```html
 * <capitec-select 
 *   label="Lorem Ipsum" 
 *   .items="${this.data}" 
 *   display-field="text"
 *   mode="basic"
 *   hint="This is a hint"
 *   .displayRenderer="${(e) => html`<capitec-card label="${e.id}">${e.text}</capitec-card>`}"
 *   custom-icon="icon-name">
 * </capitec-select>
 * ```
 * @prop {"basic"|"inline"|"filter"|String} mode - Mode for the select.
 * @attr {"start"|"center"|"end"|"nearest"|String} auto-scroll-position - Sets the position to where the select should scroll the last selected item.
 * @attr {Boolean} [data-popup] - When specified, the dropdown menu will be displayed.
 */
export class Select extends Component {

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
		this.labelAsPlaceholder = false;
		this.items = [];
		this.displayField = null;
		this.idField = `id`;
		this.popup = false;
		this.searchable = false;
		this.focussed = false;
		this.disabled = false;
		this.customIcon = null;
		this.selectMode = `single`;
		this.autoScrollPosition = `nearest`;

		// Internal properties
		this._isKeyboardOpen = false;
		this._displayMode = super.config && super.config.platform && super.config.platform.type ? super.config.platform.type : `desktop`;
		this._isMouseOver = false;
		this._mode = `basic`;
		this._value = null;

		this.addEventListener(`focus`, this._onFocus);
		this.addEventListener(`focusout`, this._onFocusout);
		this.addEventListener(`mouseenter`, () => this._isMouseOver = true);
		this.addEventListener(`mouseleave`, () => this._isMouseOver = false);
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - Label text to display.
	 * @property {String} [labelAsPlaceholder=false] - When true, hides label when the component has a selected value.
	 * @property {String[] | Object[]} [items] - Source data to render as options.
	 * @property {String | Object | String[] | Object[]} [value] - Selected option (item).
	 * @property {String} [mode="basic"] - Mode for the select:
	 * - `basic` Typically used in forms.`(default)`
	 * - `inline` Typically in layered containers, e.g. title bar.
	 * - `filter` Typically used in filter bars.
	 * @property {String} [selectMode="single"] - Select Type for the select:
	 * - `single` Select one item at a time.`(default)`
	 * - `multi` Select multiple items.
	 * @property {String} [displayField] - When binding object data, indicates the name of data field to display for each option. NOTE: This is set via "display-field" HTML attribute.
	 * @property {String} [idField="id"] - When binding object data, indicates the data field to signal uniqueness for each option. NOTE: This is set via "id-field" HTML attribute.
	 * @property {String} [customIcon] - Can be used to display a custom *system* icon.
	 * @property {Function} [displayRenderer] If specified, points to a custom render function for each select option. This should be visual only, with no components that perform actions/handle clicks, e.g. concatenate a first name and a last name to render a full name 

	 * @property {String} [hint] - A hint message to assist the user.
	 * @property {String} [error] - An error message to guide users to correct a mistake.
	 * 
	 * @property {Boolean} [focussed=false] - Indicator if the component should be focussed.
	 * @property {Boolean} [disabled=false] - Indicator if the component should be editable.
	 * 
	 * @property {String} [autoScrollPosition="nearest"] - Scroll to position for selected item:
	 * - `none` Will not scroll the selected item.
	 * - `nearest` Will scroll the selected item into view.`(default)`
	 * - `start` Will scroll to the selected item to the top of the page.
	 * - `center` Will scroll to the selected item to the center of the page.
	 * - `end` Will scroll to the selected item to the bottom of the page.
	 */
	static get properties() {

		return {
			label: { type: String },
			labelAsPlaceholder: { type: Boolean },
			items: { type: Array },
			value: { type: Object },
			mode: { type: String },
			selectMode: {
				type: String,
				attribute: `select-mode`
			},
			displayField: {
				type: String,
				attribute: `display-field`
			},
			idField: {
				type: String,
				attribute: `id-field`
			},
			popup: { type: Boolean, attribute: `data-popup` },
			searchable: { type: Boolean },
			customIcon: { type: String },
			displayRenderer: {
				type: Object,
				attribute: false
			},
			hint: { type: String },
			error: { type: String },
			focussed: { type: Boolean },
			disabled: { type: Boolean },
			autoScrollPosition: { type: String, attribute: `auto-scroll-position` }
		};
	}

	get selectedValue() {

		if (!this.value || this.value === Object) {
			return ``;
		}

		switch (this.selectMode) {
			case `multi`:

				return this.value.map((item) => {
					if (typeof item === `string`) {
						return item;
					} else if (typeof item === `object`) {
						return item[this.displayField];
					}
					return item;
				}).join(`, `);
			case `single`:
			default:

				if (typeof this.value === `string`) {
					return this.value;
				} else if (typeof this.value === `object`) {
					return this.value[this.displayField];
				}
		}

		return ``;
	}

	get mode() {
		return this._mode;
	}

	set mode(value) {
		this._mode = value;
		if (this._mode === `inline`) {
			this.labelAsPlaceholder = true;
		}
	}

	get value() {
		switch (this.selectMode) {
			case `multi`:
				return this._value ? this._value.filter((item) => item) : this._value;
			case `single`:
			default:
				return this._value;
		}
	}

	set value(value) {
		const oldValue = this._value;
		switch (this.selectMode) {
			case `multi`:

				if (value) {
					if (!(value instanceof Array)) {
						value = [value];
					}

					value.forEach((item) => {
						const position = this._value ? this._value.indexOf(item) : -1;

						if (!this._value) {
							this._value = [];
						}

						if (position === -1) { // If new value
							this._value.splice(this._value.indexOf(item), 0, item);
							this._value[this._value.indexOf(item)] = item;
							this._value.sort((lhs, rhs) => this.items.indexOf(lhs) - this.items.indexOf(rhs));
						} else if (position !== -1) { // If value exists and is not selected
							this._value.splice(this._value.indexOf(item), 1);

							if (this._value.length === 0) {
								this._value = null;
							}
						}
					});
				}
				break;
			case `single`:
			default:
				this._value = value;
		}
		this.requestUpdate(`value`, oldValue);
	}

	set currentSelection(selection) {
		// Ensure the input cursor is placed at the end of the input.
		const inputField = this.shadowRoot.getElementById(`searchField`);

		if (inputField) {
			inputField.setSelectionRange(
				selection.start,
				selection.end
			);
		}
	}

	get currentSelection() {
		// Ensure the input cursor is placed at the end of the input.
		const inputField = this.shadowRoot.getElementById(`searchField`);

		return {
			start: inputField.selectionStart,
			end: inputField.selectionEnd
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------	

	// --------------
	// EVENT HANDLERS
	// --------------

	_updateValue(e) {
		this.searchValue = e.newValue;
		this.shadowRoot.getElementById(`searchField`).value = this.searchValue;
		this.requestUpdate();
	}

	_closeOnScreenKeyboard() {
		this._isKeyboardOpen = false;
		this.dispatchEvent(new CustomEvent(`keyboard-request-close`, { bubbles: true, composed: true }));
	}

	_openOnscreenKeyboard() {
		this._isKeyboardOpen = true;
		this.dispatchEvent(new CustomEvent(`keyboard-input-focus`, {
			detail: {
				keyboardMode: `alpha-numeric`,
				mask: false,
				getCurrentValue: () => this.searchValue ? this.searchValue : ``,
				focusCallback: () => {
					this.popup = true;
					this.shadowRoot.getElementById(`searchField`).focus();
				},
				defocusCallback: () => {
					this.shadowRoot.getElementById(`searchField`).blur();
					this._isKeyboardOpen = false;
					this.shadowRoot.getElementById(`inputField`).focus();

				},
				updateValueCallback: (e) => this._updateValue(e),
				getSelection: () => this.currentSelection,
				setSelection: (selection) => {
					this.currentSelection = selection;
				},
				valueChangedCallback: () => { },
				returnMode: `change-value`,
				getElement: () => this
			},
			bubbles: true,
			composed: true
		}));
	}

	/**
	 * When the select component gains focus.
	 * @param {MouseEvent} e - the event details
	 * @ignore
	 * @returns {void}
	 */
	_onFocus(e) {

		// Prevent the control from gaining focus when it is in a disabled state.
		if (this.disabled || (this.mode === `filter` && this.value)) {
			return e.preventDefault();
		}

		// Update the component focus state.
		this.focussed = true;

		if (!this.popup && this._displayMode === `kiosk` && this.searchable) {
			this._openOnscreenKeyboard();
		}
	}

	/**
	 * When the select component loses focus.
	 * @param {MouseEvent} e - the event details
	 * @ignore
	 * @returns {void}
	 */
	_onFocusout(e) {
		if (this._displayMode !== `kiosk`) {
			this.focussed = false;

			if (this.popup && !this._isMouseOver) {
				this.popup = false;
				this.searchValue = null;
			}
		} else if (this.popup && !this._isMouseOver && !this._isKeyboardOpen) {
			this._closeOnScreenKeyboard();
			this.focussed = false;
			this.popup = false;
			this.searchValue = null;
		}
	}

	/**
	 * When the Select component is clicked.
	 * @param {MouseEvent} e - event details
	 * @ignore
	 * @returns {void}
	 */
	_onInputClick(e) {

		// added to bring the input field into focus when the chevron is clicked
		this.focus();

		if (this.mode === `filter` && this.value) {
			return;
		}

		if (!this.popup && this._displayMode === `kiosk` && this.searchable) {
			this.focussed = true;
			this._openOnscreenKeyboard();
		}

		if (this.popup && this._displayMode === `kiosk` && this.searchable) {
			this.focussed = false;
			this._closeOnScreenKeyboard();
		}

		this._togglePopup(e);
	}

	/**
	 * When the Select component is clicked.
	 * @param {MouseEvent} e - event details
	 * @ignore
	 * @returns {void}
	 */
	_onClearClick(e) {

		const newValue = null;
		const oldValue = this.value;
		this.value = newValue;

		this.searchValue = null;
		this._value = null;
		// If you click on the clear button while the multi select popup is open
		if (this.selectMode === `multi`) {

			if (this.popup) {
				this.popup = false;
			}
			this.requestUpdate(`value`);
		}

		this._dispatchValueChangedEvent(oldValue, newValue);
		this.requestUpdate(`value`);
	}

	/**
	 * When a item in the select component is clicked
	 * 
	 * @param {Object} newValue - Item selected
	 * @param {MouseEvent} e - the event details
	 * @ignore 
	 * @returns {void}
	 */
	_onOptionClick(newValue, e) {

		if (!newValue) {
			return;
		}

		const oldValue = this.value;
		this.value = newValue;

		this._dispatchValueChangedEvent(oldValue, newValue);
		if (this._displayMode === `kiosk`) {
			this._closeOnScreenKeyboard();
		}
		this._togglePopup(e);
	}

	_onOptionChanged(newValue) {

		if (!newValue) {
			return;
		}

		const oldValue = this.value ? [...this.value] : this.value;
		this.value = newValue;

		this._dispatchValueChangedEvent(oldValue, this.value);
	}

	/**
	 * When the user types a value in the search field
	 * 
	 * @param {KeyboardEvent} e - the event details
	 * @ignore 
	 * @returns {void}
	 */
	_onSearchFieldInput(e) {
		this.searchValue = e.target.value;
		this.requestUpdate();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	focus() {
		this.shadowRoot.getElementById(`inputField`).focus();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_togglePopup(e) {

		if (e.target.id === `searchField`) {
			return;
		}

		if (this.disabled) {
			return e.stopImmediatePropagation();
		}

		this.popup = !this.popup;

		if (!this.popup) {
			this.searchValue = null;
		}
	}

	_filterInItem(item) {

		if (!this.searchValue) {
			return true;
		}

		if (typeof item === `string`) {
			return item.toString().toLowerCase().includes(this.searchValue.toLowerCase());
		}

		if (!this.displayField || !item.hasOwnProperty(this.displayField)) {
			return true;
		}

		return item[this.displayField].toString().toLowerCase().includes(this.searchValue.toLowerCase());
	}

	/**
	 * Dispatch "value-change" event.
	 * 
	 * @param {Object} oldValue - the previous value
	 * @param {Object} newValue - the new value
	 * @ignore 
	 * @returns {void}
	 */
	_dispatchValueChangedEvent(oldValue, newValue) {

		if (oldValue === newValue) {
			return;
		}

		this.dispatchEvent(new CustomEvent(`value-changed`, {
			detail: {
				old: oldValue,
				new: newValue
			},
			bubbles: true,
			composed: true
		}));

		this.dispatchEvent(new CustomEvent(`value-change`, {
			detail: {
				old: oldValue,
				new: newValue
			},
			bubbles: true,
			composed: true
		}));

		this.searchValue = null;
	}

	// ---------
	// RENDERING
	// ---------	

	static get styles() {

		return [
			super.styles,
			InputLayouts,
			css`
				.select {
					cursor: pointer;
				}

				.inline .field {
					border: none;
				}

				.select > .field, .label {
					cursor: pointer;
				}
			
				.container.filtered > .field, .container.focussed > .field {
					border-radius: var(--theme-select-focussed-input-field-border-radius, 4px);
				}

				.container.filtered:hover {
					border-radius: var(--theme-select-focussed-input-field-border-radius, 4px);
					background-color: var(--theme-select-container-hover-background-color,#F7F7F7);
				}

				.container > .inline {
					border: none;
				}

				.container.inline > input {
					background-color: transparent;
				}
				.container.inline > label {
					background-color: transparent;
				}

				.container > .field {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				:host([mode="filter"]) > .container.focussed > .label {
					transform: none;
					padding: var(--theme-select-filter-focussed-label-padding, 0px);
					color: var(--theme-input-label-font-color, #4E6066);
				}

				:host([mode="filter"]) > .container.filtered > .label {
					transform: none;
					padding: var(--theme-select-filter-focussed-label-padding, 0px);
					display: none;
				}

				:host([mode="filter"]) > .container.filtered > input {
					background-color: var(--theme-select-filter-active-background-color, #F7F7F7);
					font-weight: var(--theme-select-filter-active-font-weight, 600);
					line-height: var(--theme-select-filter-active-line-height, 16px);
				}

				.options-container {
					position: absolute;
					width: 100%;

					z-index: var(--theme-select-container-z-index, 1100);
					transition: 1s;

					border-top-left-radius: 0;
					border-top-right-radius: 0;
					border-bottom-left-radius:var(--theme-button-border-radius, 4px);
					border-bottom-right-radius: var(--theme-button-border-radius, 4px);
					
					box-shadow: var(--theme-select-options-box-shadow, 0 0 6px 0 rgba(0,0,0,0.11));
					background-color: var(--theme-input-background-color, #FFFFFF);
				}

				.options-container.inline {
					top: 0;
				}
				
				.options {
					height: auto;
					width: 100%;
					max-height: var(--theme-select-options-max-height, 240px);
					
					overflow-x: hidden; /* Hide horizontal scrollbar */
					overflow-y: auto;
				}

				.inline > .option {
					color: var(--theme-select-option-value-font-color, #009DE0);
				}
				
				.options::-webkit-scrollbar {
					width: calc(var(--theme-scrollbar-thumb-width, 10px) + var(--theme-scrollbar-track-padding-left, 2px) + var(--theme-scrollbar-track-padding-right, 2px));
				}
				
				.options::-webkit-scrollbar-track {
					border-radius: var(--theme-scrollbar-track-border-radius, 10px);
					background-color: var(--theme-scrollbar-track-background-color, transparent);
				}

				.options::-webkit-scrollbar-thumb {
					border-radius: var(--theme-scrollbar-thumb-border-radius, 10px);
					background-color: var(--theme-scrollbar-thumb-background-color, #d9d9d9);
					
					border-top: var(--theme-scrollbar-track-padding-top, 2px) solid transparent;
					border-bottom: var(--theme-scrollbar-track-padding-bottom, 2px) solid transparent;
					border-left: var(--theme-scrollbar-track-padding-left, 2px) solid transparent;
					border-right: var(--theme-scrollbar-track-padding-right, 2px) solid transparent;
					
					background-clip: padding-box;
				}
				
				.option, .none {
					color: var(--theme-input-font-color, black);

					font-family: var(--theme-input-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-input-font-size, 14px);
					font-weight: var(--theme-input-font-weight, normal);
			
					padding-top: var(--theme-input-padding-top, 8px);
					padding-bottom: var(--theme-input-padding-bottom, 14px);
					padding-left: var(--theme-input-padding-left, 10px);
					padding-right: var(--theme-input-padding-right, 10px);

					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.option:hover {
					background-color: var(--theme-system-hover-color);
				}

				.option-label {
					background-color: var(--theme-select-option-label-background-color, #009DE0);
				}

				.option-label > capitec-label {
					color: var(--theme-select-option-label-font-color, white);

					font-family: var(--theme-input-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-input-font-size, 14px);
					font-weight: var(--theme-input-font-weight, normal);
			
					padding-top: var(--theme-input-padding-top, 8px);
					padding-bottom: var(--theme-input-padding-bottom, 14px);
					padding-left: var(--theme-input-padding-left, 10px);
					padding-right: var(--theme-input-padding-right, 10px);

					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.none {
					width: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					cursor: default;
				}

				.none:hover {
					background-color: var(--theme-select-no-results-background-color, "blue");
				}

				.selected-value {
					color: var(--theme-select-option-value-font-color, #009DE0);
				}

				.searchField {
					width: 100%;
					color: var(--theme-input-font-color, #4E6066);

					font-family: var(--theme-input-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-input-font-size, 14px);
					font-weight: var(--theme-input-font-weight, normal);

					padding-top: var(--theme-input-padding-top, 8px);
					padding-bottom: var(--theme-input-padding-bottom, 14px);
					padding-left: var(--theme-input-padding-left, 10px);
					padding-right: var(--theme-input-padding-right, 10px);
					
					border-top-width: var(--theme-select-searchfield-border-width, 0);
					border-left-width: var(--theme-select-searchfield-border-width, 0);
					border-right-width: var(--theme-select-searchfield-border-width, 0);
					border-bottom-width: var(--theme-input-border-width, 1px);
					border-bottom-color: var(--theme-select-search-bottom-border-color, #E1E1E1);
				}

				.searchField:focus {
					outline: none;
				}

				.focussed > .label.focussed {
					color: var(--theme-button-default-font-color, #009DE0);
				}

				.clearIcon {
					width:var(--theme-select-clear-icon-width,20px);
					height:var(--theme-select-clear-icon-height,20px);
				}

				::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
					color: var(--theme-select-search-placeholder-color, #ABB3B6);
					opacity: 1; /* Firefox */
				}
				
				:-ms-input-placeholder { /* Internet Explorer 10-11 */
					color: var(--theme-select-search-placeholder-color, #ABB3B6);
				}
				
				::-ms-input-placeholder { /* Microsoft Edge */
					color: var(--theme-select-search-placeholder-color, #ABB3B6);
				}

				.position-inline {
					position: relative;
					box-shadow: none;
				}

				capitec-modal {
					--theme-modal-body-box-shadow: none;
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
			<div
				class="select container ${this.mode === `inline` ? `inline` : ``} ${this.value && this.mode !== `filter` ? `completed` : ``} ${this.value && this.mode === `filter` ? `filtered` : ``} ${this.error ? `error` : ``} ${this.focussed ? `focussed` : ``} ${this.disabled ? `disabled` : ``}">
				${this._renderLabel()}
				<input id="inputField" class="field ${this.mode === `filter` ? `icon-padding` : ``}" type="text" readonly
					value="${this.selectedValue}" tabindex="${ifDefined(this.disabled ? `-1` : undefined)}" @click="${this._onInputClick}" />
			
				${this._renderIcons(`mobile`)}
			
				${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
				${this.error ? html`<div class="error">${this.error}</div>` : ``}
			
			</div>
			
			${this._renderModal()}
		`;
	}

	_renderModal() {
		if (this.popup) {
			return html`
				<capitec-modal type="select" @clicked-out-modal="${() => this.popup = false}">
					<div slot="body" class="position-inline options-container${this.mode === `inline` ? ` inline` : ``}">
						<div class="option-label">
							<capitec-label label="${this.label}"></capitec-label>
						</div>
						<div class="options ${this.mode === `inline` ? `inline` : ``}">
							${this._renderFilteredOptions()}
						</div>
					</div>
				</capitec-modal>`;
		}

		return html``;
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<div
				class="select container ${this.mode === `inline` ? `inline` : ``} ${this.value && this.mode !== `filter` ? `completed` : ``} ${this.value && this.mode === `filter` ? `filtered` : ``} ${this.error ? `error` : ``} ${this.focussed ? `focussed` : ``} ${this.disabled ? `disabled` : ``}">
				${this._renderLabel()}
				<input id="inputField" class="field ${this.mode === `filter` ? `icon-padding` : ``}" type="text" readonly
					value="${this.selectedValue}" tabindex="${ifDefined(this.disabled ? `-1` : undefined)}" @click="${this._onInputClick}" />
			
				${this._renderIcons(`web`)}
				${this._renderOptions()}
			
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

	_renderLabel() {

		if (this.mode === `inline` && this.popup) {
			return ``;
		}

		return html`
			<label class="label ${this.error ? `error` : ``}${!this.error && this.focussed ? `focussed` : ``}" for="inputField">
				${this.labelAsPlaceholder && this.selectedValue ? `` : this.label}
			</label>
		`;
	}

	_renderIcons(runtime = `web`) {
		if (runtime === `mobile` && !this.value) {
			return html`
				<div class="icon" @click="${(e) => this._onInputClick(e)}">
					<img src="./platform/icons/system/more-${this.error ? `error` : `action`}.svg">
				</div>
			`;
		}

		if ((this.mode === `filter` || runtime === `mobile`) && this.value) {
			return html`
				<div class="icon" @click="${(e) => this._onClearClick(e)}">
					<img class="clearIcon" src="./platform/icons/status/unsuccessful-blue.svg">
				</div>
            `;
		}

		if (this.customIcon !== null) {
			return html`
				<div class="icon" @click="${(e) => this._onInputClick(e)}">
					<img src="./platform/icons/system/${this.customIcon}-${this.error ? `error` : `action`}.svg">
				</div>
            `;
		}

		return html`
			<div class="icon" @click="${(e) => this._onInputClick(e)}">
				<img class="${this.popup ? `expanded` : `collapsed`}"
					src="./platform/icons/system/chevron-down-${this.error ? `error` : `action`}.svg">
			</div>
        `;
	}

	_renderOptions() {
		if (!this.popup || !this.items) {
			return;
		}

		return html`
			<div class="options-container${this.mode === `inline` ? ` inline` : ``}">
				${this.searchable
				? html`<div>
					<input type="text" class="searchField" id="searchField" placeholder="Search..."
						@focus="${() => this._displayMode === `kiosk` ? this._openOnscreenKeyboard() : null}"
						@input="${this._onSearchFieldInput}" />
				</div>`
				: html``}
				<div class="options ${this.mode === `inline` ? `inline` : ``}">
					${this._renderFilteredOptions()}
				</div>
			</div>
        `;
	}

	_renderFilteredOptions() {

		const filterLength = this.items.filter(i => this._filterInItem(i)).length;

		if (filterLength === 0) {
			return html`<div class="none" @click="${(e) => {
				e.preventDefault();
				this._togglePopup(e);
			}}">No matching results</div>`;
		}

		return this.items.filter(i => this._filterInItem(i)).map(i => this._renderOption(i));
	}

	_renderOption(item) {

		if (this.displayRenderer && this.displayRenderer instanceof Function) {
			switch (this.selectMode) {
				case `multi`:
					return html`
						<div class="option ${this.value && this.value === item ? `selected-value` : ``}"
							@click="${(e) => this._onOptionChanged(item)}">
							${this.displayRenderer(item)}
						</div>
					`;
				case `single`:
				default:
					return html`
						<div class="option ${this.value && this.value === item ? `selected-value` : ``}"
							@click="${(e) => this._onOptionClick(item, e)}">
							${this.displayRenderer(item)}
						</div>
					`;
			}
		}

		if (typeof item === `string`) {

			switch (this.selectMode) {
				case `multi`:
					return html`
						<capitec-check class="option check" label="${item}" ?checked="${this.value && this.value.indexOf(item) !== -1}"
							@value-change="${() => this._onOptionChanged(item)}"></capitec-check>
					`;
				case `single`:
				default:
					return html`
						<div class="option${this.value && this.value === item ? ` selected-value` : ``}"
							@click="${(e) => this._onOptionClick(item, e)}">
							${item}
						</div>
				`;
			}
		}

		// Display hint that display-field attribute wasn't specified.
		if (!this.displayField) {
			return html`<div class="option">"display-field" not specified</div>`;
		}

		// Display hint that display-field attribute cannot be found on the item.
		if (!item.hasOwnProperty(this.displayField)) {
			return html`<div class="option">"display-field" is invalid</div>`;
		}

		// Display hint that id-field attribute cannot be found on the item.
		if (!item.hasOwnProperty(this.idField)) {
			return html`<div class="option">"id-field" is invalid</div>`;
		}

		switch (this.selectMode) {
			case `multi`:
				return html`
					<capitec-check class="option check" label="${item[this.displayField]}"
						?checked="${this.value && this.value.indexOf(item) !== -1}" @value-change="${() => this._onOptionChanged(item)}">
					</capitec-check>
				`;
			case `single`:
			default:
				return html`
					<div class="option ${this.value && this.value[this.idField] === item[this.idField] ? `selected-value` : ``}"
						@click="${(e) => this._onOptionClick(item, e)}">
						${item[this.displayField]}
					</div>
				`;
		}
	}

	async updated(changedProperties) {

		// Wait for the rendering to complete as per https://lit-element.polymer-project.org/guide/lifecycle#updatecomplete.
		await this.updateComplete;

		if (changedProperties.has(`popup`) && this.popup) {
			if (this.searchable) {
				this.shadowRoot.getElementById(`searchField`).focus();
			}
			// Scroll to the last selected item
			if (this.value) {
				const element = this.renderRoot.querySelector(`[class="option selected-value"]`);
				if (element && this.autoScrollPosition !== `none`) {
					element.scrollIntoView({ behavior: `smooth`, block: this.autoScrollPosition, inline: `start` });
					element.focus();
				}
			}
		}
	}
}

window.customElements.define(`capitec-select`, Select);

/**
 * When the selected value (item) changed.
 *
 * @example
 * <capitec-select ... @value-change="${this._handler}"></capitec-select>
 *
 * @event Select#value-change
 * @type {Object}
 * @property {Object} detail Contains the old and new value
 * @property {String} detail.old - The old value.
 * @property {String} detail.new - The new value.
 */

/**
 * When the event to open the virtual keyboard is dispatched
 *
 * @example
 * <capitec-select ... @keyboard-input-focus="${this._handler}"></capitec-select>
 *
 * @event Select#keyboard-input-focus
 * @type {object}
 * @property {Object} detail Contains the attrubutes and callback functions needed by the virtual keyboard
 * @property {String} keyboardMode The keyboard mode to use for the virtual keyboard
 * @property {Boolean} mask If the text should be masked
 * @property {Function} getCurrentValue A callback function to get the current value of the searchfield
 * @property {Function} focusCallback A callback function that gets called when the keyboard appears
 * @property {Function} defocusCallback A callback function that gets called when the keyboard disappears
 * @property {Function} updateValueCallback A callback function that gets called when the value is updated
 * @property {Function} getSelection A callback function that returns the current position of the caret
 * @property {Function} setSelection A callback function that sets the position of the caret
 * @property {Function} valueChangedCallback A callback function that gets called after the user presses enter on the virtual keyboard
 * @property {String} returnMode The return mode of the virtual keyboard
 * @property {Function} getElement A function returning a reference to the component being updated
 */

/**
* When the event to open the virtual keyboard is dispatched
*
* @example
* <capitec-select ... @keyboard-request-close="${this._handler}"></capitec-select>
*
* @event Select#keyboard-request-close
* @type {void}
*/