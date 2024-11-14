import { Component, css, html } from '../../elements/index.js';

/**
 * A simple label component that renders a styled text string.
 * 
 * ```js
 * import 'platform/components/core/Label';
 * ```
 * 
 * ```html
 * <capitec-label
 *   label="Hello World"
 *   type="strong">
 * </capitec-label>
 * ```
 * @prop {"default"|"title"|"subtitle"|"strong"|String} type - The type of label to display.
 */
export class Label extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Initialises the component.
	 *
	 * @hideconstructor
	 */
	constructor() {

		super();

		// Set the default property values.
		this.type = `default`;
		this.label = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [type="default"] - The type of label to display:
	 *  - `default` Normal font weight.
	 *  - `title` Larger font and weight.
	 *  - `subtitle` Larger font and weight.
	 *  - `strong` Largest font and weight.
	 * @property {String} label - The label string to display.
	 */
	static get properties() {

		return {
			type: { type: String },
			label: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	// n/a

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
	 * @ignore
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
				:host {
					color: var(--theme-label-font-color, black);
					font-family: var(--theme-label-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-label-font-size, 12px);
					font-weight: var(--theme-label-font-weight, normal);
					white-space: pre-wrap;

					cursor: var(--theme-label-cursor, default);
				}

				:host([type="title"]) {
					font-size: var(--theme-label-title-font-size, 20px);
					font-weight: var(--theme-label-title-font-weight, bold);
				}

				:host([type="subtitle"]) {
					font-size: var(--theme-label-subtitle-font-size, 16px);
					font-weight: var(--theme-label-subtitle-font-weight, bold);
				}

				:host([type="strong"]) {
					font-size: var(--theme-label-strong-font-size, 12px);
					font-weight: var(--theme-label-strong-font-weight, bold);
				}

				:host([type="default"]) {
					font-size: var(--theme-label-default-font-size, 12px);
					font-weight: var(--theme-label-default-font-weight, normal);
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

		return html`${this.label}`;
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`${this.label}`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return html`${this.label}`;
	}
}

window.customElements.define(`capitec-label`, Label);