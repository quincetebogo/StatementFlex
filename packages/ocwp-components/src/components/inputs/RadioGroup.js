import { Component, css, html } from '../../elements/index.js';

/**
 * Container layer groups {@link Radio} components.
 * 
 * ```js
 * import `platform/components/layers/RadioGroup`;
 * ```
 * 
 * ```html
 * <capitec-radio-group>
 *      <capitec-radio label="Lorem Ipsum"></capitec-radio>
 *  </capitec-radio-group>
 * ```
 *
 * @prop {"vertical"|"horizontal"|String} layout - The component content area layout.
 * @prop {"left"|"center"|"right"|"stretch"|String} halign - The component content area horizontal item alignment.
 * @prop {"top"|"center"|"bottom"|"stretch"|String} valign - The component content area horizontal item alignment.
 * @prop {"none"|"clear"|"line"|String} gap - Attaches the component to the browser frame.
 */
export class RadioGroup extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Initialises the component.
	 * Implementation based on: https://gist.github.com/robdodson/85deb2f821f9beb2ed1ce049f6a6ed47.
	 *
	 * @hideconstructor
	 */
	constructor() {

		super();

		this.label = ``;
		this.layout = `vertical`;
		this.gap = `clear`;
		this.wrap = false;
		this.grow = `none`;
		this.halign = `left`;
		this.valign = `center`;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {String} [layout="vertical"] - The component content area layout.
	 * @property {String} [halign="left"] - The component content area horizontal item alignment.
	 * @property {String} [valign="center"] - The component content area horizontal item alignment.
	 * @property {String} [gap="clear"] - Attaches the component to the browser frame.
	 */
	static get properties() {

		return {
			label: { type: String },
			layout: { type: String },
			gap: { type: String },
			halign: { type: String },
			grow: { type: String },
			wrap: { type: Boolean }
		};
	}

	set selected(idx) {
		if (this.selected === idx) {
			return;
		}

		if (isFinite(this.selected)) {
			const previousSelected = this.radios[this.selected];
			if (previousSelected) {
				previousSelected.removeAttribute(`aria-checked`, false);
				if (previousSelected.checked) {
					previousSelected._toggleChecked(true);
				}
			}
		}

		const newSelected = this.radios[idx];
		newSelected.focus();
		newSelected.setAttribute(`aria-checked`, true);

		this.setAttribute(`selected`, idx);
		this._selected = idx;
	}

	get selected() {
		return this._selected;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		this.setAttribute(`role`, `radioGroup`);
		this.radios = Array.from(this.querySelectorAll(`capitec-radio`));

		if (this.radios.length > 0) {
			// Setup initial state
			const selectedRadio = this.radios.find(r => r.checked);
			if (selectedRadio) {
				selectedRadio.setAttribute(`aria-checked`, true);
				this._selected = this.radios.indexOf(selectedRadio);
			} else {
				this._selected = -1;
			}

			// Override the radio button default toggle to prevent un-toggling currently check radio
			this.radios.forEach((r, idx) => {
				const innerToggle = r._toggleChecked;
				r._toggleChecked = (force) => {
					if (idx !== this.selected || force) {

						// Call inner toggle with the radio button (r) applied as the this-pointer
						innerToggle.apply(r);
					}
				};
			}, this);
		}

		this.addEventListener(`click`, this._handleClick.bind(this));

		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_handleClick(e) {
		const idx = this.radios.indexOf(e.target);
		if (idx === -1 || e.target.disabled || !e.target.checked) {
			return;
		}
		this.selected = idx;

		this.requestUpdate();
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
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,

			css`
				:host {
					flex-shrink: 0;
					display: flex;
					flex-direction: column;
				}

				:host > .wrapper {
					flex-grow: 1;

					display: flex;
					flex-direction: column;
				}
				
				:host > .wrapper > ::slotted(*:not(capitec-spacer)) {
					margin: calc(var(--theme-buttonbar-item-gap, 10px) / 2);
				}

				:host([layout="horizontal"]){
					--theme-layout-gap-spacing: 16px;
				}

				:host([layout="vertical"]){
					--theme-layout-gap-spacing: 12px;
				}

				capitec-label {
					--theme-label-default-font-size: var(--theme-radio-group-label-font-size, 14px);
					--theme-label-default-font-weight: var(--theme-radio-group-label-font-weight, 400);
					margin-bottom: var(--theme-radio-group-label-margin-bottom, 6px);
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
			${this.label ? html`<capitec-label label="${this.label}" type="default"></capitec-label>` : null}
			<capitec-group layout=${this.layout} halign=${this.halign} valign="${this.valign}" gap="${this.gap}" ?wrap=${this.wrap}
				grow=${this.grow}>
				<slot></slot>
			</capitec-group>
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

window.customElements.define(`capitec-radio-group`, RadioGroup);