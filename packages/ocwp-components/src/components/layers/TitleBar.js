import { Component, css, html, ifDefined } from '../../elements/index.js';

import '../core/Label.js';

/**
 * Container layer that attaches to the title area of a display zone, e.g. card, popup, etc.
 * 
 * Can also be used as a standalone bar component.
 * 
 * ```js
 * import 'platform/components/layers/TitleBar';
 * ```
 * 
 * ```html
 * <capitec-title-bar type="primary" label="Hello World">
 *   <capitec-spacer></capitec-spacer>
 *   <capitec-button label="Log Out"></capitec-button>
 * </capitec-title-bar>
 * ```
 * @prop {"default"|"clear"|"primary"|"transact"|"save"|"credit"|"insure"|String} type - The title bar display type.
 */
export class TitleBar extends Component {

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
		this.icon = undefined;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [type="default"] - The title bar display type:
	 * - `default` White background.
	 * - `clear` Transparent background
	 * - `primary` GlobalOne style variation background.
	 * - `transact` GlobalOne style variation background.
	 * - `save` GlobalOne style variation background.
	 * - `credit` GlobalOne style variation background.
	 * - `insure` GlobalOne style variation background.
	 * 
	 * @property {String} [label] - The label string to display.
	 * @property {String} icon - icon to show on left of Title Bar.
	 * 
	 */
	static get properties() {

		return {
			type: { type: String },
			label: { type: String },
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
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,

			/* ---------- LAYOUT POLICY ---------- */
			css`
				:host {
					width: 100%;

					min-height: var(--theme-titlebar-min-height, 64px);

					flex-shrink: 0;
				}
			`,

			/* ---------- SHARED VARIABLES ---------- */
			css`
				:host {
					--theme-titlebar-item-gap: 10px;
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					display: flex;
					flex-direction: row;
					justify-content: flex-start;
					align-items: center;

					background: var(--theme-titlebar-background, #FFFFFF);
					
					border-radius: 0px;
					border-bottom: var(--theme-titlebar-border, none);
					box-shadow: var(--theme-titlebar-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.2));
					
					padding: var(--theme-titlebar-padding, 8px 16px);

					margin-bottom: 1px;
				}
				
				:host > capitec-label {
					color: var(--theme-titlebar-font-color, var(--theme-system-font-color));
					
					margin-right: var(--theme-titlebar-item-gap);
				}

				:host([icon]) > capitec-label {
					margin-left: var(--theme-titlebar-title-margin-left, 16px);
				}

				.icon {
					cursor: pointer;
				}
				
				:host > .wrapper {
					flex-grow: 1;

					display: flex;
					flex-wrap: wrap;
					flex-direction: row;
					justify-content: var(--theme-titlebar-justify-content, flex-start);
					align-items: center;

					margin: calc(var(--theme-titlebar-item-gap) / 2 * -1);
				}

				:host > .wrapper > ::slotted(*:not(capitec-spacer)) {
					margin: calc(var(--theme-titlebar-item-gap) / 2);
				}
			`,

			/* ---------- THEMES ---------- */
			css`
				:host([type=default]) {
					background: var(--theme-type-default-background);
					--theme-label-font-color: var(--theme-type-default-font-color);
				}

				:host([type=default]) > capitec-label {
					color: var(--theme-type-default-font-color);
				}

				:host([type=clear]) {
					background: var(--theme-type-clear-background);
					--theme-label-font-color: var(--theme-type-clear-font-color);
				}

				:host([type=clear]) > capitec-label {
					color: var(--theme-type-clear-font-color, var(--theme-system-font-color));
				}

				:host([type=primary]) {
					background: var(--theme-type-primary-background);
					--theme-label-font-color: var(--theme-type-primary-font-color);
				}

				:host([type=primary]) > capitec-label {
					color: var(--theme-type-primary-font-color);
				}
				
				:host([type=transact]) {
					background: var(--theme-type-transact-background);
					--theme-label-font-color: var(--theme-type-transact-font-color);
				}

				:host([type=transact]) > capitec-label {
					color: var(--theme-type-transact-font-color);
				}

				:host([type=save]) {
					background: var(--theme-type-save-background);
					--theme-label-font-color: var(--theme-type-save-font-color);
				}

				:host([type=save]) > capitec-label {
					color: var(--theme-type-save-font-color);
				}

				:host([type=insure]) {
					background: var(--theme-type-insure-background);
					--theme-label-font-color: var(--theme-type-insure-font-color);
				}

				:host([type=insure]) > capitec-label {
					color: var(--theme-type-insure-font-color);
				}

				:host([type=credit]) {
					background: var(--theme-type-credit-background);
					--theme-label-font-color: var(--theme-type-credit-font-color);
				}

				:host([type=credit]) > capitec-label {
					color: var(--theme-type-credit-font-color);
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
			${this.icon ? html`<capitec-icon class="icon" icon="${ifDefined(this.icon)}" @click=${this._handleIconClick}></capitec-icon>` : null}
			${this.label ? html`<capitec-label type="title" label="${this.label}"></capitec-label>` : null}
			<div class="wrapper">
				<slot></slot>
			</div>
		`;
	}
}

window.customElements.define(`capitec-title-bar`, TitleBar);

/**
 * When the icon is clicked.
 *
 * @example
 * <capitec-title-bar ... @click-icon="${this._handler}"></capitec-title-bar>
 *
 * @event TitleBar#click-icon
 * @type {Object}
 * @property {Object} detail Empty object.
 */