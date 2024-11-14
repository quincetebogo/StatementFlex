import { Layout } from './Layout.js';

/**
 * Layout component to group together standalone elements in a specified layout strategy.
 * 
 * ```js
 * import 'platform/components/layouts/Group'
 * ```
 * 
 * ```html
 * <capitec-group layout="vertical">
 *   <capitec-label label="Hello"></capitec-label>
 *   <capitec-label label="World"></capitec-label>
 * </capitec-group>
 * ```
 * 
 * @attribute {"vertical"|"horizontal"|"grid"|String} layout - The component content area layout.
 * @attribute {"left"|"center"|"right"|"stretch"|String} halign - The component content area horizontal item alignment.
 * @attribute {"top"|"center"|"bottom"|"stretch"|String} valign - The component content area horizontal item alignment.
 * @attribute {"none"|"clear"|"line"|String} gap - Attaches the component to the browser frame.
 * @attribute {"auto"|"uniform"|String} columns - Number of grid columns.
 * @attribute {"auto"|"uniform"|String} rows - Number of grid rows.
 * @attribute {false|true|Boolean} reverse - Reverse the order of the items (Note: this only applies to Horizontal and Vertical "layout").
 */
export class Group extends Layout {

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

			// Default horizontal layouts to left-center, if policy attributes not set.
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

	// n/a
}

window.customElements.define(`capitec-group`, Group);