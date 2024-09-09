import { Component, css, html, ifDefined } from '../../elements/index.js';

import '../layers/ContentBox.js';
import '../layers/TitleBar.js';

/**
 * A layout component that groups together related content in a floating card box.
 * 
 * ```js 
 * import 'platform/components/containers/Card'; 
 * ```
 * 
 * ```html
 * <capitec-card label="Card Example - Simple">
 *   <capitec-label label="Hello there!"></capitec-label>
 * </capitec-card>
 * ```
 * 
 * ```html
 * <capitec-card label="Card Example - Expanded">
 *   <capitec-title-bar>
 *     <capitec-label type="title" label="Hello World"></capitec-label>
 *     <capitec-spacer></capitec-spacer>
 *     <capitec-button label="Test"></capitec-button>
 *   </capitec-title-bar>
 * 
 *   <capitec-action-bar>
 *     <capitec-search-field label="Search"></capitec-search-field>
 *     <capitec-spacer></capitec-spacer>
 *     <capitec-button type="primary" label="Create New"></capitec-button>
 *   </capitec-action-bar>
 *
 *   <capitec-content-box>
 *     <capitec-label label="Hello there!"></capitec-label>
 *   </capitec-content-box>
 *
 *   <capitec-button-bar>
 *     <capitec-button type="primary" label="Save"></capitec-button>
 *     <capitec-button type="default" label="Cancel"></capitec-button>
 *   </capitec-button-bar>
 * </capitec-card>
 * ```
 *
 */
export class Card extends Component {

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

		// Set default property values.
		this.label = ``;
		this.layout = `vertical`;
		this.halign = `stretch`;
		this.valign = `top`;
		this.gap = `clear`;
		this.elevated = false;
		this.noPadding = false;
		this.wrap = false;
		this.noScroll = false;
		this.icon = undefined;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} label - The title to display on the card. When set assumes a simple card layout with embedded content box is required & enables layout attributes to be set.
	 * @property {LayoutAttribute} [layout="vertical"] - The component content area layout.
	 * @property {HAlignAttribute} [halign="stretch"] - The component content area horizontal item alignment.
	 * @property {VAlignAttribute} [valign="top"] - The component content area vertical item alignment.
	 * @property {GapAttribute} [gap="clear"] - The component content area item gap.
	 * @property {Boolean} [elevated=false] - Applies an elevated border style to the card on hover & focus.
	 * @property {Boolean} [noPadding=false] - Suppresses the component content padding.
	 * @property {Boolean} [wrap=false] - Wrap the component content to a next line if needed.
	 * @property {Boolean} [noScroll] - Suppresses component scrolling.
	 * @property {String} [icon] - icon to show on left of Title Bar.
	 */
	static get properties() {
		return {
			label: { type: String },
			layout: { type: String },
			halign: { type: String },
			valign: { type: String },
			gap: { type: String },
			elevated: { type: Boolean },
			noPadding: { type: Boolean },
			wrap: { type: Boolean },
			noScroll: { type: Boolean },
			icon: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	_handleIconClick() {
		this.dispatchEvent(new CustomEvent(`click-icon`, { detail: {} }));
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
	 * @ignore
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,

			/* ---------- LAYOUT POLICY ---------- */
			css`
				:host {
					min-width: var(--theme-card-min-width, 200px);
					min-height: var(--theme-card-min-height, 100px);

					flex: 0 0 auto;
				}
			`,

			/* ---------- SHARED VARIABLES ---------- */
			css`
				:host {
					--theme-card-border: 1px solid #E1E1E1;
					--theme-card-border-radius: 4px;
					--theme-card-elevation-focus-box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.25);
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: stretch;

					border-radius: var(--theme-card-border-radius);
					background-color: var(--theme-card-background-color, #FFFFFF);
					box-shadow: var(--theme-card-box-shadow, none);
					border: var(--theme-card-border);
				}

				:host(:hover[elevated]) {
					box-shadow: var(--theme-card-elevation-hover-box-shadow, 0 3px 6px 0 rgba(0, 0, 0, 0.25));
					cursor: pointer;
				}

				:host(:active[elevated]) {
					box-shadow: var(--theme-card-elevation-focus-box-shadow);
					cursor: pointer;
				}

				:host(:focus-within[elevated]) {
					box-shadow: var(--theme-card-elevation-focus-box-shadow);
				}

				/* CONTENT */

				:host > *:first-child {
					border-radius: var(--theme-card-border-radius) var(--theme-card-border-radius) 0px 0px;
				}

				:host > ::slotted(*:first-child) {
					border-radius: var(--theme-card-border-radius) var(--theme-card-border-radius) 0px 0px;
				}

				:host > ::slotted(*:last-child) {
					border-radius: 0px 0px var(--theme-card-border-radius) var(--theme-card-border-radius);
				}

				:host > ::slotted(*) {
					order: 4;
				}

				:host > ::slotted(capitec-title-bar) {
					order: 1;
				}

				:host > ::slotted(capitec-action-bar) {
					order: 2;
				}

				:host > ::slotted(capitec-content-box) {
					order: 3;
				}

				:host > ::slotted(capitec-button-bar) {
					order: 5;
				}
				
				/* NB - This selector must differ from the cascaded 
				 * one above in order for the prop value to pull through,
				 */
				::slotted(capitec-button-bar) {
					--buttonbar-align: flex-end;
					--theme-buttonbar-padding: var(--theme-card-button-bar-padding, 16px);
				}

				::slotted(capitec-action-bar) {
					--theme-actionbar-shadow: var(--theme-card-action-bar-box-shadow, none);
				}
				
				::slotted(capitec-title-bar),
				capitec-title-bar {
					--theme-titlebar-shadow: none;
					--theme-label-title-font-weight: var(--theme-card-title-font-weight, 600);
					--theme-label-title-font-size: var(--theme-card-title-font-size, 24px);
					border-bottom: var(--theme-card-border);
					line-height: var(--theme-card-title-bar-line-height, 32px);
					letter-spacing: var(--theme-card-tile-bar-letter-spacing, 0);
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

		// Render the component in simple form if a label has been set.
		if (this.label) {

			return html`
				<capitec-title-bar type="default" label="${this.label}" icon="${ifDefined(this.icon)}" @click-icon=${this._handleIconClick}></capitec-title-bar>
				<capitec-content-box layout="${this.layout}" halign="${this.halign}" valign="${this.valign}" gap="${this.gap}" ?noPadding="${this.noPadding}" ?wrap="${this.wrap}" ?elevated="${this.elevated}" ?noScroll=${this.noScroll}>
					<slot></slot>
				</capitec-content-box>
			`;
		}

		// Render the component in expanded form if no label has been set.
		return html`<slot></slot>`;
	}
}

window.customElements.define(`capitec-card`, Card);

/**
 * When the title bar icon is clicked.
 *
 * @example
 * <capitec-card ... @click-icon="${this._handler}"></capitec-card>
 *
 * @event Card#click-icon
 * @type {Object}
 * @property {Object} detail Empty object.
 */