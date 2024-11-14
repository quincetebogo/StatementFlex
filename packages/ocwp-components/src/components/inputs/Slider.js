import { Component, css, html } from '../../elements/index.js';
import './TextField.js';
import '../core/Label.js';

/**
 * An input control that allows a user to slide in order to select a value.
 *
 * ```js 
 * import 'platform/components/inputs/Slider'; 
 * ```
 * 
 * ```html
 * <capitec-slider
 *  min=0
 *  max=10
 *  value=1
 *  step=1
 *  type='default'
 *  label='The label you want'>
 * </capitec-slider>
 * ```
 * @prop {"default"|"field"|String} [type="default"] The type of slider the user wants to use options.
 */

export class Slider extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	* @hideconstructor
	*/
	constructor() {

		super();

		// Set the default property values.

		this.min = 0;
		this.max = 10;
		this.value = 1;
		this.step = 1;
		this.type = `default`;
		this.label = ` `;

		// Internal variables 
		this._value = 0;
		this._error = null;
		this._fieldValue = ` `;
		this._min = 0;
		this._max = 10;
		this._toolTipValue = null;
		this._displayPos = 0;
		this._newDisplayPosition = 0;
		this._errorMessage = `Range not available`;

		this.addEventListener(`input`, this._updateTrack);

	}

	// ----------
	// PROPERTIES
	// ----------   

	/**
	 * Registry of all properties defined by the component.
	 * @property {String} [label] The label to display in the text field note only required when type is set to field
	 * 
	 * @property {Number} [min=0] - The minimum value allowed.
	 * @property {Number} [max=10] - The maximum value allowed.
	 * 
	 * @property {Number} [value=1] - The value displayed.
	 * @property {Number} [step=1] - The increment value.
	 * @property {String} [type="default"] The type of slider the user wants to use options:
	 * - `default` - Display only the slider
	 * - `field` - Display a text field along with the slider
	 */
	static get properties() {

		return {
			label: { type: String },
			min: { type: Number },
			max: { type: Number },
			value: { type: Number },
			step: { type: Number },
			type: { type: String }
		};
	}

	set value(val) {
		if (val < this.min || val > this.max) {
			this._error = this._errorMessage;
			this._value = 0;
			this._fieldValue = Number(val);
		} else {
			this._value = Number(val);
			this._fieldValue = Number(val);
		}
	}

	get value() {
		return this._value;
	}

	set min(val) {
		if (val > this.max) {
			this._error = `Min value greater than max value`;
		} else {
			this._min = Number(val);
		}
	}

	get min() {
		return this._min;
	}

	set max(val) {
		if (val < this.min) {
			this._error = `Max value less than min value`;
		} else {
			this._max = Number(val);
		}
	}

	get max() {
		return this._max;
	}
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	firstUpdated() {

		this._updateTrack();
		const range = this.shadowRoot.getElementById(`slide`);
		range.addEventListener(`input`, () => {
			this._setToolTip(range);
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	* Handles the slider click event
	* 
	* @param {MouseEvent} e - The event details
	* @ignore
	* @returns {void}
	*/
	_sliderClick(e) {

		e.stopPropagation();
		this._error = null;
		const range = this.shadowRoot.getElementById(`slide`);

		if (this.type === `default`) {

			this._dispatchValueChangedEvent(this._value, Number(range.value));

		} else if (this.type === `field`) {

			if (range.value < this.min || range.value > this.max) {

				this._error = this._errorMessage;
				this._value = 0;

			} else {

				this._dispatchValueChangedEvent(this._value, Number(range.value));
				this._value = Number(range.value);
				this._fieldValue = Number(range.value);
			}
		}
		this.requestUpdate();
	}


	_textValChange(e) {

		e.stopPropagation();
		this._error = null;
		const newNumberValue = Number(e.detail.new);

		if (newNumberValue < this.min || newNumberValue > this.max) {
			this._error = this._errorMessage;
			this.value = e.detail.old;
		} else {
			this._value = newNumberValue;
			const range = this.shadowRoot.getElementById(`slide`);
			range.value = this._value;
			this._dispatchValueChangedEvent(e.detail.old, e.detail.new);
		}

		this.requestUpdate();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_setToolTip(range) {
		this._toolTipValue = range.value;
		this._displayPos = Number((range.value - range.min) * 100 / (range.max - range.min));
		this._newDisplayPosition = 10 - (this._displayPos * 0.2);
		this.requestUpdate();
	}

	_updateTrack() {
		const range = this.shadowRoot.getElementById(`slide`);
		range.classList.add(`js`);
		range.style.setProperty(`--val`, Number(range.value));
	}

	_dispatchValueChangedEvent(oldValue, newValue) {

		if (oldValue === newValue) {
			return;
		}

		this.dispatchEvent(new CustomEvent(`value-change`, {
			detail: {
				old: oldValue,
				new: newValue
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
				:host {
					box-sizing: border-box;
				}
				
				/* Styles for the slider, the track and the thumb */
				
				.container {
					position: relative;
				}
				
				.error.js[type='range']::-webkit-slider-runnable-track {
					background: var(--theme-status-error-background, #C83B37);
					/*Red background */
				}
				
				.error[type='range']::-moz-range-track {
					background: var(--theme-status-error-background, #C83B37);
					/*Red background */
				}
				
				.error[type="range"]::-moz-range-progress {
					background: var(--theme-status-error-background, #C83B37);
				}
				
				.error.js[type='range']::-webkit-slider-thumb:hover {
					border: var(--theme-slider-error-border, 1px solid #C83B37);
				}
				
				.error.slider[type='range']::-moz-range-thumb:hover {
					border: var(--theme-slider-error-border, 1px solid #C83B37);
				}
				
				[type='range'] {
					--range: calc(var(--max) - var(--min));
					--ratio: calc((var(--val) - var(--min))/var(--range));
					--sx: calc(.5*18px + var(--ratio)*(100% - 18px));
					margin: var(--theme-slider-input-padding, 13px 0);
					padding: 0;
					width: 100%;
					height: var(--theme-slider-input-height, 18px);
					background: transparent;
				}
				
				[type='range'], [type='range']::-webkit-slider-thumb {
					-webkit-appearance: none;
				}
				
				.slider:focus {
					outline: none;
				}
				
				[type='range']::-webkit-slider-runnable-track {
					box-sizing: border-box;
					border: none;
					width: 100%;
					height: var(--theme-slider-track-height, 3px);
					background: var(--theme-slider-track-background, #E1E1E1);
				}
				
				.js[type='range']::-webkit-slider-runnable-track {
					background: var(--theme-slider-track-background-gradient, linear-gradient(#009DE0, #009DE0) 0/var(--sx) 100% no-repeat #E1E1E1);
				}
				
				[type='range']::-moz-range-track {
					box-sizing: border-box;
					border: none;
					width: 100%;
					height: var(--theme-slider-track-height, 3px);
					background: var(--theme-slider-track-background, #E1E1E1);
				}
				
				[type='range']::-ms-track {
					box-sizing: border-box;
					border: none;
					width: 100%;
					height: var(--theme-slider-track-height, 3px);
					background: var(--theme-slider-track-background, #E1E1E1);
				}
				
				[type='range']::-moz-range-progress {
					height: var(--theme-slider-track-height, 3px);
					background: var(--theme-slider-track-progress-color, #009DE0);
				}
				
				[type='range']::-ms-fill-lower {
					height: var(--theme-slider-track-height, 3px);
					background: var(--theme-slider-track-progress-color, #009DE0);
				}
				
				[type='range']::-webkit-slider-thumb {
					margin-top: var(--theme-slider-thumb-margin-top, -7.5px);
					box-sizing: border-box;
					border: none;
					width: var(--theme-slider-thumb-width, 18px);
					height: var(--theme-slider-thumb-height, 18px);
					border-radius: 50%;
					background: var(--theme-slider-thumb-color, #FFFFFF);
					border: var(--theme-slider-thumb-border, solid 3px #E1E1E1);
					box-shadow: var(--theme-slider-thumb-box-shadow, 0px 1px 3px rgba(0, 0, 0, 0.25));
					cursor: pointer;
				}
				
				[type='range']::-moz-range-thumb {
					box-sizing: border-box;
					border: none;
					width: var(--theme-slider-thumb-width, 18px);
					height: var(--theme-slider-thumb-height, 18px);
					border-radius: 50%;
					background: var(--theme-slider-thumb-color, #FFFFFF);
					border: var(--theme-slider-thumb-border, solid 3px #E1E1E1);
					box-shadow: var(--theme-slider-thumb-box-shadow, 0px 1px 3px rgba(0, 0, 0, 0.25));
					cursor: pointer;
				}
				
				[type='range']::-ms-thumb {
					margin-top: 0;
					box-sizing: border-box;
					border: none;
					width: var(--theme-slider-thumb-width, 18px);
					height: var(--theme-slider-thumb-height, 18px);
					border-radius: 50%;
					background: var(--theme-slider-thumb-color, #FFFFFF);
					border: var(--theme-slider-thumb-border, solid 3px #E1E1E1);
					box-shadow: var(--theme-slider-thumb-box-shadow, 0px 1px 3px rgba(0, 0, 0, 0.25));
					cursor: pointer;
				}
				
				[type='range']::-webkit-slider-thumb:hover {
					border: var(--theme-slider-border, solid 1px #009DE0);
				}
				
				[type='range']:focus::-webkit-slider-thumb {
					border: var(--theme-slider-thumb-focus-border, solid 2px #009DE0);
				}
				
				[type='range']::-webkit-slider-thumb:focus {
					border: var(--theme-slider-thumb-focus-border, solid 2px #009DE0);
				}
				
				[type='range']::-moz-range-thumb:hover {
					border: var(--theme-slider-border, solid 1px #009DE0);
					cursor: pointer;
				}
				
				[type='range']:focus::-moz-range-thumb {
					border: var(--theme-slider-thumb-focus-border, solid 2px #009DE0);
				}
				
				[type='range']::-ms-tooltip {
					display: none;
				}
				
				[type='range']:focus {
					outline: none;
				}
				
				/* Styles for hovering tool tip*/
				
				.toolSpan {
					left: calc(var(--displayPos) + (var(--newDisplayPosition)))
				}
				
				.range-value {
					position: absolute;
					top: var(--theme-slider-tool-tip-top,-45%); 
				}
				
				.range-value span {
					width: var(--theme-slider-tool-tip-width, 44px);
					height: var(--theme-slider-tool-tip-height, 30px);
					line-height: var(--theme-slider-tool-tip-height, 30px);
					text-align: center;
					background: var(--theme-slider-tool-tip-background-color, #FFFFFF);
					color: var(--theme-slider-tool-tip-text-color, #3E4547);
					font-size: var(--theme-slider-tool-tip-font-size, 12px);
					display: block;
					font-weight: var(--theme-slider-tool-tip-font-weight, 600);
					position: absolute;
					left: 50%;
					transform: translate(-50%, 0);
					border-radius: var(--theme-slider-tool-tip-border-radius, 6px);
					box-shadow: var(--theme-slider-tool-tip-box-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 2px 4px 0 rgba(0, 0, 0, 0.15));
				}
				
				.range-value span:before {
					content: "";
					position: absolute;
					width: 0;
					height: 0;
					border-top: var(--theme-slider-tool-tip-border-top, 5px solid #FFFFFF);
					border-left: var(--theme-slider-tool-tip-border-left-right, 9px solid transparent);
					border-right: var(--theme-slider-tool-tip-border-left-right, 9px solid transparent);
					top: 100%;
					left: 50%;
					margin-left: var(--theme-slider-tool-tip-margin-left, -9px);
					margin-top: var(--theme-slider-tool-tip-margin-top, -1px);
					filter: var(--theme-slider-tool-tip-arrow-drop-shadow, drop-shadow(rgba(0, 0, 0, 0.25) 0px 2px 1px));
				}
				
				/*Styles for value labels and error label*/
				
				.valLabels {
					margin-bottom: var(--theme-slider-value-labels-margin-bottom, 4px);
				}
				
				.minVal {
					float: left;
				}
				
				.maxVal {
					float: right;
				}
				
				.errorLabel {
					color: var(--theme-status-error-background, #C83B37);
					font-size: var(--theme-slider-error-label-font-size, 14px);
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
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html` 
	  			<div class="container">
					${this._renderTextField()}
					<input id="slide" class="slider ${this._error ? `error` : ``}" type="range" min="${this.min}" max="${this.max}" value="${this._value}" step="${this.step}" style="--min: ${this.min}; --max: ${this.max}; --val: ${this._value}" @click="${e => this._sliderClick(e)}"/>
					<div class="valLabels">
		  				<capitec-label class="minVal" label="${this.min}"></capitec-label>
		  				<capitec-label class="maxVal" label="${this.max}"></capitec-label>
					</div>
	  			</div>
	  		${this._error ? html`<div class="errorLabel">${this._error}</div>` : ``}
			`;

	}

	_renderTextField() {
		if (this.type === `field`) {
			return html`
				<capitec-text-field class="" type="numeric" label="${this.label}" error="${this._error ? ` ` : ``}" value="${this._fieldValue}" @key-input="${(e) => this._textValChange(e)}"></capitec-text-field>
	  		`;
		} else if (this.type === `default`) {
			return html`
		  		<div class="range-value toolSpan" id="rangeV" style="--displayPos: ${this._displayPos}%; --newDisplayPosition: ${this._newDisplayPosition}px;">
			  		${this._toolTipValue
					? html`<span>${this._toolTipValue}</span>`
					: ``}
		 		 </div>
			`;
		}
	}

}

window.customElements.define(`capitec-slider`, Slider);

/**
 * When the slider value is changed either via the slider or text field.
 *
 * @example
 * <capitec-slider ... @value-change="${this._handler}"></capitec-slider>
 *
 * @event Slider#value-change
 * @type {Object}
 * @property {Object} detail Contains oldValue and newValue.
 * @property {Boolean} detail.old - old value of the Slider
 * @property {Boolean} detail.new - new value of the Slider.
 */