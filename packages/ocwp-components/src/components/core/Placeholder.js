import { Component, css, html } from '../../elements/index.js';

/**
 * A simple placeholder component that renders an empty block.
 * 
 * ```js
 * import 'platform/components/core/Placeholder'
 * ```
 * 
 * ```html
 * <capitec-placeholder
 *   type="transact"
 *   label="Hello World">
 * </capitec-placeholder>
 * ```
 * @prop {"default"|"clear"|"transact"|"save"|"credit"|"insure"|String} type- The type of placeholder to display.
 */
export class Placeholder extends Component {

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
		this.size = 1;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [type="default"] - The type of placeholder to display.
	 * - `default` White background.
	 * - `clear` Transparent background.
	 * - `transact` GlobalOne style variation background.
	 * - `save` GlobalOne style variation background.
	 * - `credit` GlobalOne style variation background.
	 * - `insure` GlobalOne style variation background.
	 * @property {String} label - The label string to display in the placeholder.
	 * @property {Number} size - The placeholder size increment, i.e. 1, 2, 3, 4, 5, etc.
	 */
	static get properties() {

		return {
			type: { type: String },
			label: { type: String },
			size: { type: Number }
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

				}

				.container {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					height: 100%;
				}
				
				.content {
					display: flex;
					justify-content: center;
					align-items: center;
				}

				:host([type="default"]) > .container {
					--theme-label-font-color: var(--theme-type-default-font-color, #000000);
					background-color: var(--theme-type-default-background, #FFFFFF);
				}

				:host([type="clear"]) > .container {
					--theme-label-font-color: var(--theme-type-clear-font-color, #000000);
					background-color: var(--theme-type-clear-background, transparent);
				}

				:host([type="transact"]) > .container {
					--theme-label-font-color: var(--theme-type-transact-font-color, #FFFFFF);
					background: var(--theme-type-transact-background, lightblue);
				}

				:host([type="save"]) > .container {
					--theme-label-font-color: var(--theme-type-save-font-color, #FFFFFF);
					background: var(--theme-type-save-background, darkblue);
				}

				:host([type="credit"]) > .container {
					--theme-label-font-color: var(--theme-type-credit-font-color, #FFFFFF);
					background: var(--theme-type-credit-background, darkred);
				}

				:host([type="insure"]) > .container {
					--theme-label-font-color: var(--theme-type-insure-font-color, #FFFFFF);
					background: var(--theme-type-insure-background, darkgrey);
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
			<div class="container">
				<div class="content" style="width: ${this.size * 50}px; height: ${this.size * 50}px">
					<capitec-label label="${this.label}"></capitec-label>
				</div>
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

window.customElements.define(`capitec-placeholder`, Placeholder);