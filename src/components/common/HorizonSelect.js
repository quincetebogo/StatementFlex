import { Component, css, html } from 'platform/elements';
import 'platform/components/core/Label';

/**
 * A select (drop down) component. This component displays a label with a value shown
 * vertically beneath it. The value may be changed by clicking on the kebab icon and
 * selecting a new value.
 *
 * 
 * **Usage**
 * ```html
 *   <horizon-select> 
 *  </horizon-select>
 * ```
 * 
 * **Events**
 * - n/a
 */
export class HorizonSelect extends Component {

	// --------------
	// INITIALISATION 
	// --------------

	constructor() {
		super();
		this.label = ``;
		this.value = null;
		this.items = {};
		this.displayField = ``;
		this.popup = false;
		this.focused = false;
		this.disabled = false;

		// Internal properties
		this._isMouseOver = false;

		this.addEventListener(`focus`, this._onFocus);
		this.addEventListener(`focusout`, this._onFocusout);
		this.addEventListener(`mouseenter`, () => this._isMouseOver = true);
		this.addEventListener(`mouseleave`, () => this._isMouseOver = false);
	}

	// -------------------
	// PROPERTIES REGISTRY
	// -------------------
	static get properties() {
		return {
			label: { type: String },
			value: { type: String },
			items: { type: Object },
			displayField: { type: String, attribute: `display-field` },
			popup: { type: Boolean },
			focused: { type: Boolean },
			disabled: { type: Boolean }
		};
	}

	get selectedValue() {

		if (!this.value) {
			return ``;
		}

		if (typeof this.value === `string`) {
			return this.value;
		}

		return this.value[this.displayField];
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * When the select component gains focus.
	 * @param {MouseEvent} e - the event details
	 * @ignore
	 * @returns {void}
	 */
	_onFocus(e) {

		// Prevent the control from gaining focus when it is in a disabled state.
		if (this.disabled || this.value) {
			return e.preventDefault();
		}

		// Update the component focus state.
		this.focused = true;
	}

	/**
	 * When the select component loses focus.
	 * @param {MouseEvent} e - the event details
	 * @ignore
	 * @returns {void}
	 */
	_onFocusout(e) {

		this.focused = false;

		if (this.popup && !this._isMouseOver) {
			this.popup = false;
		}
	}

	/**
	 * When a item in the select component is clicked
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
		this.value = newValue[this.displayField];

		this._dispatchValueChangedEvent(oldValue, newValue);
		this._togglePopup(e);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_togglePopup(e) {

		if (this.disabled) {
			return e.stopImmediatePropagation();
		}
		this.popup = !this.popup;
	}

	/**
	 * Dispatch "value-changed" event.
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
	}

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
				:host{
					--theme-input-font-size: 14px;
				}

				.outer-wrapper {
					display: flex;
					flex-direction: row;
					margin-left: var(--horizon-select-outer-wrapper-margin-left, 24px);
				}

				.inner-wrapper{
					width: 164px;
					height: var(--horizon-select-inner-wrapper-height, 48px);
					margin-top: var(--horizon-select-inner-wrapper-margin-top, 0px);
				}

				.label-text{
					height: var(--horizon-select-label-text-height, 21px);
					color: var(--horizon-select-label-text-color, #4E6066);
					font-family: "Hind Vadodara";
					font-size: var(--horizon-select-label-text-font-size, 14px);
					letter-spacing: 0;
					line-height: var(--horizon-select-label-text-line-height, 21px);
				}

				.label-value{
					height: var(--horizon-select-label-value-height, 27px);
					color: var(--horizon-select-label-value-color, #003652);
					font-family: "Hind Vadodara";
					font-size: var(--horizon-select-label-value-font-size, 18px);
					font-weight: 600;
					letter-spacing: 0;
					line-height: var(--horizon-select-label-value-line-height, 27px);
				}

				.kebab-icon {
					margin-top: var(--horizon-select-icon-margin-top, 20px);
					margin-right: var(--horizon-select-icon-margin-right, 0px);
					cursor: pointer;
					width: var(--horizon-select-icon-width, 24px);
					align-items: flex-end;
					height: var(--horizon-select-icon-height, 24px);
				}

				.options {
					height: auto;
					width: var(--horizon-select-options-width, 282px);
					max-height: var(--horizon-select-options-max-height, 219px);
					margin-top: var(--horizon-select-options-margin-top, 50px);

					border-top-left-radius: 0;
					border-top-right-radius: 0;
					border-bottom-left-radius: var(--theme-button-border-radius, 4px);
					border-bottom-right-radius: var(--theme-button-border-radius, 4px);
					
					overflow-x: hidden; /* Hide horizontal scrollbar */
					overflow-y: auto;
					
					position: absolute;
					z-index:300;
					transition:1s;
					box-shadow: var(--theme-select-options-box-shadow, 0 0 6px 0 rgba(0,0,0,0.11));
					background-color: var(--theme-input-background-color, #FFFFFF);
					margin-bottom: var(--horizon-select-options-margin-bottom, 0px);
					margin-left: var(--horizon-select-options-margin-left, 0px);
				}

				.option {
					height: var(--horizon-select-option-height, 40px);
					color: var(--theme-input-font-color, black);

					font-family: var(--theme-input-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-input-font-size, 14px);
					font-weight: var(--theme-input-font-weight, normal);
			
					padding-top: var(--theme-input-padding-top, 8px);
					padding-bottom: var(--theme-input-padding-bottom, 14px);
					padding-left: var(--theme-input-padding-left, 10px);
					padding-right: var(--theme-input-padding-right, 10px);
					cursor: pointer;
				}

				.option:hover {
					background-color: var(--theme-system-hover-color);
				}

				.selected-value {
					color: var(--theme-select-option-value-font-color, #009DE0);
				}

				/* Below styles for scrollbar inside options*/
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
				
				.hide-icon{
					display: none;
				}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<div class="outer-wrapper">
				<div class="inner-wrapper">
					<capitec-label
                        class="label-text"
                        label="${this.label}">
					</capitec-label>
					<capitec-label
                        class="label-value"
                        label="${this.selectedValue}">
					</capitec-label>
				</div>
				<capitec-icon
                    class=${this.disabled ? `hide-icon` : `kebab-icon`}
                    icon="system/more-action"
					@click="${(e) => this._togglePopup(e)}">
				</capitec-icon>
			</div>
			${this._renderOptions()}
		`;
	}

	_renderOptions() {
		if (!this.items || !this.popup) {
			return;
		}

		return html`
			<div class="options">
				${this.items.map(item => this.renderOption(item))}
			</div>
        `;
	}

	renderOption(item) {
		if (typeof item === `string`) {
			return html`
				<div class="option ${this.value && this.value === item ? `selected-value` : ``}"
					@click="${(e) => this._onOptionClick(item, e)}">
					${item}
				</div>
            `;
		}

		// Display hint that item-field attribute wasn't specified.
		if (!this.displayField) {
			return html`<div class="option">"display-field" not specified</div>`;
		}

		// Display hint that item-field attribute cannot be found on the item.
		if (!Object.prototype.hasOwnProperty.call(item, this.displayField)) {
			return html`<div class="option">"display-field" is invalid</div>`;
		}

		return html`
			<div
                class="option ${this.value && this.value === item[this.displayField] ? `selected-value` : ``}"
				@click="${(e) => this._onOptionClick(item, e)}">
				${item[this.displayField]}
			</div>`;
	}
}

window.customElements.define(`horizon-select`, HorizonSelect);