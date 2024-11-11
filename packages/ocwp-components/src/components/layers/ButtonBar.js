import { Component, css, html } from '../../elements/index.js';

/**
 * Container layer that attaches to the button area of a display zone, e.g. card, popup, etc.
 * 
 * Can also be used as a standalone bar component.
 * 
 * ```js
 * import 'platform/components/layers/ButtonBar';
 * ```
 * 
 * ```html
 * <capitec-button-bar>
 *   <capitec-button type="primary" label="Save"></capitec-button>
 *   <capitec-button type="default" label="Cancel"></capitec-button>
 * </capitec-button-bar>
 * ```
 *
 */
export class ButtonBar extends Component {

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

		// Default values.
		this.align = `center`;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [align="center"] - Indicates alignment of slotted content:
	 * - `left` Left-align slotted content. 
	 * - `center` Center-align slotted content. 
	 * - `right` Right-align slotted content. 
	 *
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			align: { type: String }
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
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,

			/* ---------- LAYOUT POLICY ---------- */
			css`
				:host {
					width: 100%;
					min-height: var(--theme-buttonbar-min-height, 50px);
					flex-shrink: 0;
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					display: flex;
					flex-direction: column;
					justify-content: center;

					background: var(--theme-buttonbar-background, white);

					border-radius: 0px;
					border-top: var(--theme-buttonbar-border, 1px solid grey);
					box-shadow: var(--theme-buttonbar-shadow, none);

					padding: var(--theme-buttonbar-padding, 10px);
				}

				:host > .wrapper {
					flex-grow: 1;

					display: flex;
					flex-wrap: wrap;
					flex-direction: row;
					align-items: stretch;

					margin: calc(var(--theme-buttonbar-item-gap, 10px) / 2 * -1);
				}

				/* 
				 * Below classes utilise a var() function using a property that 
				 * is ONLY set on Card, to right-align the content (flex-end).
				 * The fallback values specified are utilised in the absence 
				 * of the property to revert to each class' default behavior.
				 */

				:host > .center {
					justify-content: var(--buttonbar-align, center); 
				}

				:host > .left {
					justify-content: var(--buttonbar-align, flex-start);
				}

				:host > .right {
					justify-content: var(--buttonbar-align, flex-end);
				}

				:host > .wrapper > ::slotted(*:not(capitec-spacer)) {
					margin: calc(var(--theme-buttonbar-item-gap, 10px) / 2);
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
			<div class="wrapper ${this.align}">
				<slot></slot>
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

window.customElements.define(`capitec-button-bar`, ButtonBar);