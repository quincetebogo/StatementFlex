import { Component, css, html } from '../../elements/index.js';

/**
 * A navigation control representing a non-selectable item separator in a menu.
 *
 * ```js
 * import `platform/components/navigation/MenuSeparator`
 * ```
 *
 * ```html
 * <capitec-menu>
 *   <capitec-menu-item label="Hello"></capitec-menu-item>
 *   <capitec-menu-separator></capitec-menu-separator>
 *   <capitec-menu-item label="World"></capitec-menu-item>
 * </capitec-menu>
 *```
 */
export class MenuSeparator extends Component {

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
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @type {Object}
	 */
	static get properties() {

		return {

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

	// n/a/

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
					padding-left: var(--theme-menu-item-separator-padding-left, 20px);
					padding-right: var(--theme-menu-item-separator-padding-right, 20px);
					padding-top: var(--theme-menu-item-separator-padding-top, 16px);
					padding-bottom: var(--theme-menu-item-separator-padding-bottom, 16px);
				}

				.line {
					height: 1px;
					background-color: var(--theme-menu-item-separator-color, #FFFFFF);
				}
			`
		];
	}

	/**
	 * Generates the component template for mobile mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {

		return html`
			<div class="line"></div>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return html`
			<div class="line"></div>
		`;
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
			<div class="line"></div>
		`;
	}
}

window.customElements.define(`capitec-menu-separator`, MenuSeparator);