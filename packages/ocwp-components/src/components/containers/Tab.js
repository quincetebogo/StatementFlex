import { Component, css, html } from '../../elements/index.js';

import '../layers/ContentBox.js';

/**
 * Component that displays a tab control item.
 * 
 * ```js
 * import 'platform/components/containers/Tab';
 * ```
 * 
 * ```html
 *   <capitec-tab-group>
 *     <capitec-tab label="Details">
 *       <capitec-label label="Tab 1"></capitec-label>
 *     </capitec-tab>
 *     <capitec-tab label="Comments (3)">
 *       <capitec-label label="Tab 2"></capitec-label>
 *     </capitec-tab>
 *   </capitec-tab-group>
 *```
 */
export class Tab extends Component {

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
		this.label = null;

		this.layout = `vertical`;
		this.halign = `stretch`;
		this.valign = `top`;
		this.gap = `clear`;
		this.noPadding = false;
		this.wrap = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all public properties defined by the component.
	 * 
	 * @property {String} label - The text label of the tab.
	 * 
	 * @property {LayoutAttribute} [layout="vertical"] - The component content area layout.
	 * @property {HAlignAttribute} [halign="stretch"] - The component content area horizontal item alignment.
	 * @property {VAlignAttribute} [valign="top"] - The component content area vertical item alignment.
	 * @property {GapAttribute} [gap="clear"] - The component content area item gap.
	 * @property {Boolean} [noPadding=false] - Suppresses the component content padding.
	 * @property {Boolean} [wrap=false] - Wrap the component content to a next line if needed.
	 */
	static get properties() {

		return {
			label: { type: String },
			layout: { type: String },
			halign: { type: String },
			valign: { type: String },
			gap: { type: String },
			noPadding: { type: Boolean },
			wrap: { type: Boolean }
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

			/* ---------- LAYOUT POLICY ---------- */
			css`
				:host {
					width: 100%;
					height: 100%;
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				
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
			<capitec-content-box layout="${this.layout}" halign="${this.halign}" valign="${this.valign}" gap="${this.gap}" ?noPadding="${this.noPadding}" ?wrap="${this.wrap}">
				<slot></slot>
			</capitec-content-box>
		`;
	}
}

window.customElements.define(`capitec-tab`, Tab);