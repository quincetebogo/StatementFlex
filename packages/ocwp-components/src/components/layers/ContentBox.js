import { css, html } from '../../elements/index.js';

import { Layout } from '../layouts/index.js';

/**
 * A layout container that can scroll it's contents if needed.
 * 
 * ```js
 * import 'platform/components/layers/ContentBox';
 * ```
 * 
 * ```html
 * <capitec-content-box layout="vertical">
 *   <capitec-label label="Hello World 1"></capitec-label>
 *   <capitec-label label="Hello World 2"></capitec-label>
 *   <capitec-label label="Hello World 3"></capitec-label>
 *   <capitec-label label="Hello World 4"></capitec-label>
 *   <capitec-label label="Hello World 5"></capitec-label>
 * </capitec-content-box>
 * ```
 * 
 * @attribute {"vertical"|"horizontal"|"grid"|String} layout - The component content area layout.
 * @attribute {"left"|"center"|"right"|"stretch"|String} halign - The component content area horizontal item alignment.
 * @attribute {"top"|"center"|"bottom"|"stretch"|String} valign - The component content area horizontal item alignment.
 * @attribute {"none"|"clear"|"line"|String} gap - Attaches the component to the browser frame.
 * @attribute {"auto"|"uniform"|String} columns - Number of grid columns.
 * @attribute {"auto"|"uniform"|String} rows - Number of grid rows.
 * @attribute {Boolean} anchor - Sets component to have absolute positioning.
 * @attribute {Boolean} noPadding - Suppresses component padding.
 * @attribute {Boolean} noScroll - Suppresses component scrolling.
 */
export class ContentBox extends Layout {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @ignore
	 * NB - Below docs are duplicated above (for now) to aid both intellisense and JSDoc generation. 
	 */

	/**
	 * Attribute definitions:
	 * 
	 * @property {LayoutAttribute} [layout="vertical"] - The component content area layout.
	 * @property {HAlignAttribute} [halign="stretch"] - The component content area horizontal item alignment.
	 * @property {VAlignAttribute} [valign="top"] - The component content area vertical item alignment.
	 * @property {GapAttribute} [gap="clear"] - Attaches the component to the browser frame.
	 * @property {ColumnsAttribute} [columns] - Number of grid columns.
	 * @property {RowsAttribute} [rows] - Number of grid rows.
	 * @property {Boolean} [anchor] - Sets component to have absolute positioning.
	 * @property {Boolean} [noPadding] - Suppresses component padding.
	 * @property {Boolean} [noScroll] - Suppresses component scrolling.
	 */
	constructor() {

		super();

		// Set layout policy.
		switch (this.getAttribute(`layout`) || `vertical`) {

			// Default vertical layouts to stretch-top, if policy attributes not set.
			case `vertical`:
				this.setAttribute(`layout`, `vertical`);
				this.setAttribute(`halign`, this.getAttribute(`halign`) || `stretch`);
				this.setAttribute(`valign`, this.getAttribute(`valign`) || `top`);
				this.setAttribute(`gap`, this.getAttribute(`gap`) || `clear`);
				break;

			// Default horizontal layouts to stretch-top, if policy attributes not set.
			case `horizontal`:
				this.setAttribute(`layout`, `horizontal`);
				this.setAttribute(`halign`, this.getAttribute(`halign`) || `left`);
				this.setAttribute(`valign`, this.getAttribute(`valign`) || `top`);
				this.setAttribute(`gap`, this.getAttribute(`gap`) || `clear`);
				break;
			default:
				break;
		}
	}

	// ----------
	// PROPERTIES
	// ----------

	// n/a

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

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

	static get styles() {

		return [
			super.styles,

			/* ---------- LAYOUT POLICY ---------- */
			css`
				:host {
					flex: 1 1 auto;
					
					width: 100%;
					height: 100%;
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					overflow: auto;
				}

				:host([anchor]) {
					position: absolute;
				}

				:host([noScroll]) {
					overflow: visible;
				}

				:host([nopadding]), /* <-- For backwards compatibility */
				:host([noPadding]) {
					padding: 0px; 
				}

				:host {
					padding-left: var(--theme-container-padding-left, 10px);
					padding-right: var(--theme-container-padding-right, 10px);
					padding-top: var(--theme-container-padding-top, 10px);
					padding-bottom: var(--theme-container-padding-bottom, 10px);
				}

				:host::-webkit-scrollbar {
					width: calc(var(--theme-scrollbar-thumb-width, 10px) + var(--theme-scrollbar-track-padding-left, 2px) + var(--theme-scrollbar-track-padding-right, 2px));
				}
				
				:host::-webkit-scrollbar-track {
					border-radius: var(--theme-scrollbar-track-border-radius, 10px);
					background-color: var(--theme-scrollbar-track-background-color, transparent);
				}

				:host::-webkit-scrollbar-thumb {
					border-radius: var(--theme-scrollbar-thumb-border-radius, 10px);
					background-color: var(--theme-scrollbar-thumb-background-color, #d9d9d9);
					
					border-top: var(--theme-scrollbar-track-padding-top, 2px) solid transparent;
					border-bottom: var(--theme-scrollbar-track-padding-bottom, 2px) solid transparent;
					border-left: var(--theme-scrollbar-track-padding-left, 2px) solid transparent;
					border-right: var(--theme-scrollbar-track-padding-right, 2px) solid transparent;
					
					background-clip: padding-box;
				}
			`
		];
	}
}

window.customElements.define(`capitec-content-box`, ContentBox);