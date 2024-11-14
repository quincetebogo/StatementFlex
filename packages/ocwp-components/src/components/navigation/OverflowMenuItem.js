import { Component, css, html } from '../../elements/index.js';

import { OverflowMenu } from './index.js';
import '../core/Icon.js';

/**
 * A navigation control representing a selectable item in a menu.
 *
 * ```js
 * import `platform/components/navigation/MenuItem`
 * ```
 *
 * ```html
 * <capitec-overflow-menu>
 *   <capitec-overflow-menu-item
 *     label="Lorem Ipsum Dolor"
 *     icon="thumb_up"
 *     selected
 *     expanded
 *     disabled>
 *   </capitec-overflow-menu-item>
 * </capitec-overflow-menu>
 *```
 */
export class OverflowMenuItem extends Component {

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
		this.label = ``;
		this.icon = ``;
		this.href = ``;
		this.iconAlign = `left`;

		this.selected = false;
		this.expanded = false;
		this.disabled = false;
		this.subMenuLocation = 0;

		this.addEventListener(`mouseenter`, () => this._handleHover());
		this.addEventListener(`mouseleave`, () => this._handleHover());
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The menu item label.
	 * @property {String} [icon] - The menu item icon.
	 * @property {String} [iconAlign] - The menu item icon.
	 * @property {String} [href] - The menu item's href.
	 * 
	 * @property {Boolean} [selected=false] - Indictor if the menu item is currently selected.
	 * @property {Boolean} [expanded=false] - Indictor if the menu item is currently expanded.
	 * @property {Boolean} [disabled=false] - Indictor if the menu item is currently disabled.
	 * 
	 * @type {Object}
	 */
	static get properties() {

		return {
			label: { type: String },
			icon: { type: String },
			iconAlign: { type: String, attribute: `icon-align` },
			href: { type: String },

			selected: { type: Boolean },
			expanded: { type: Boolean },
			disabled: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Handles component click events.
	 * 
	 * @param {MouseEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_itemClicked(event) {

		// Prevent the event from bubbling up.
		event.stopPropagation();
		event.preventDefault();

		// Ignore the click event if the item is disabled.
		if (this.disabled) {
			return;
		}

		// Check if the clicked item was a parent or a child node.
		if (this.children.length > 0) {

			// If a parent node, toggle the visibility of the menu item children.
			if (this.expanded) {
				this.collapse();
			} else {
				this.expand();
			}

		} else {

			// If a child node, notify any subscribers that the menu item was selected.
			this.select();
			this._collapseSiblings();
			this._closeOverflowMenu();
		}

		this._handleHover();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Selects the menu item.
	 * 
	 * @fires click When the menu item is selected.
	 * @returns {void}
	 */
	select() {

		// Expand the menu item.
		this.selected = !this.selected;

		// Notify any direct subscribers that the menu item was selected.
		this.dispatchEvent(new CustomEvent(`click`, {
			detail: {
				label: this.label,
				icon: this.icon,
				iconAlign: this.iconAlign,
				path: this.href && this.href !== `undefined` ? this.href : undefined,
				disabled: this.disabled
			}
		}));
	}

	/**
	 * Expand the menu item to show it's children.
	 * 
	 * Does nothing if the menu item has no child items.
	 * 
	 * @fires expand When the menu item is expanded.
	 * @returns {void}
	 */
	expand() {

		// Ignore the request to expand if the component is already expanded.
		if (this.expanded === true) {
			return;
		}

		// Check if the menu item may be expanded.
		if (this.children.length === 0) {
			return;
		}

		// Set the item state to expanded.
		this.expanded = true;

		// Notify any direct subscribers that the component was expanded.
		this.dispatchEvent(new CustomEvent(`expand`, {
			detail: {
				label: this.label
			}
		}));
	}

	/**
	 * Collapses the menu item to hide it's children.
	 * 
	 * Does nothing if the menu item has no child items.
	 * 
	 * @fires menu-item-collapsed When the menu item is collapsed.
	 * @returns {void}
	 */
	collapse() {

		// Ignore the request to collapse if the component is already collapsed.
		if (this.expanded === false) {
			return;
		}

		// Check if the menu item may be expanded.
		if (this.children.length === 0) {
			return;
		}

		// Set the item state to collapsed.
		this.expanded = false;

		// Notify any direct subscribers that the component was collapsed.
		this.dispatchEvent(new CustomEvent(`collapse`, {
			detail: {
				label: this.label
			}
		}));
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_handleHover() {

		// Check if the clicked item was a parent or a child node.
		if (this.children.length > 0) {

			// If a parent node, toggle the visibility of the menu item children.
			if (this.expanded) {
				this.collapse();
			} else {
				this.expand();
			}

		} else {

			this._collapseSiblings();
		}
	}

	_closeOverflowMenu() {

		/** @type {OverflowMenu}
		 */
		const overflowMenu = this.parentElement instanceof OverflowMenu ? this.parentElement : this.parentElement.parentElement;

		if (overflowMenu && overflowMenu.popup) {
			overflowMenu.popup = false;
		}
	}

	_collapseSiblings() {
		if (this.parentElement instanceof OverflowMenu) {
			this.parentElement.collapseChildren();
		}
	}

	_subMenuLocation() {
		if (this.parentElement instanceof OverflowMenu && this.parentElement.getAttribute(`location`) === `right`) {
			return `right: ${this.getBoundingClientRect().width}px;`;
		}
		return `left: ${this.getBoundingClientRect().width}px;`;
	}

	_getDisabledFlag() {
		if (this.disabled) {
			return `disabled`;
		}
		return ``;
	}

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
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				/* CONTAINER STYLES */

				:host {
					display: flex;
					flex-direction: column;

					position: relative;

					cursor: pointer;
				}

				/* MENU-ITEM */

				:host > .menu-item {
					display: flex;
					flex-direction: row;
					align-items: center;

					padding-left: var(--theme-overflow-menu-item-padding-left, 16px);
					padding-right: var(--theme-overflow-menu-item-padding-right, 16px);
					padding-top: var(--theme-overflow-menu-item-padding-top, 14px);
					padding-bottom: var(--theme-overflow-menu-item-padding-bottom, 14px);

					color: var(--theme-overflow-menu-item-font-color, #545D60);
					background-color: var(--theme-overflow-menu-background-color, #FFFFFF);
				}

				.hyperlink {
					text-decoration: none;
				}

				:host > .menu-item > .icon {
					width: var(--theme-overflow-menu-item-icon-width, 20px);
					height: var(--theme-overflow-menu-item-icon-height, 20px);

					margin-left: 0px;
					margin-right: 16px;
				}

				:host([icon-align="right"]) > .menu-item > .icon {
					margin-left: auto;
					margin-right: 0px;
				}
				
				:host > .menu-item > .label {
					font-family: var(--theme-overflow-menu-item-font-family, 'Arial, Helvetica, sans-serif');
					font-size: var(--theme-overflow-menu-item-font-size, 15px);
					font-weight: var(--theme-overflow-menu-item-font-weight, 400);
				}
				
				:host > .menu-item.disabled {
					color: var(--theme-overflow-menu-item-disabled-font-color, #545D60);
				}
				
				:host > .menu-item > .indicator {
					width: var(--theme-overflow-menu-item-indicator-width, 20px);
					height: var(--theme-overflow-menu-item-indicator-height, 20px);

					margin-left: auto;
					margin-right: 0px;
				}

				:host > .menu-item:hover {
					background-color: var(--theme-overflow-menu-item-hover-background-color, lightgrey);
				}

				:host > .menu-item:hover.disabled {
					background-color: var(--theme-overflow-menu-item-hover-disabled-background-color, lightgrey);

					cursor: default;
				}

				/* SUB-MENU */

				:host > .sub-menu {
					display: none;
					overflow: hidden;
					
					max-height: 0px;
					height: 0px;

				}

				:host([expanded]) > .sub-menu {
					display: block;
					max-height: 999px;
					height: auto;

					width: var(--theme-overflow-menu-width, 180px);

					box-sizing: border-box;
					border: 1px solid var(--theme-overflow-menu-border-color, #E1E1E1);
					border-radius: 4px;
					background-color: var(--theme-overflow-menu-background-color, #FFFFFF);
					box-shadow: 0 1px 3px 0 rgba(0,0,0,0.25);

					position: absolute;
					width: 100%;
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
		if (this.href && this.href !== `undefined` && this.children && this.children.length === 0) {
			return html`
				<a class="menu-item hyperlink ${this._getDisabledFlag()}" href="${this.href}" target="_self" @click="${e => this._itemClicked(e)}">
					${this.icon && this.icon !== `undefined` && this.icon !== `null` && this.iconAlign === `left` ? html`<capitec-icon
						class="icon" icon="${this.icon}"></capitec-icon>` : ``}
					${this.label ? html`<div class="label ${this._getDisabledFlag()}">${this.label}</div>` : ``}
					${this.icon && this.icon !== `undefined` && this.icon !== `null` && this.iconAlign === `right` ? html`<capitec-icon
						class="icon" icon="${this.icon}"></capitec-icon>` : ``}
				</a>
			`;
		}

		return html`
			<div class="menu-item ${this._getDisabledFlag()}" @click="${e => this._itemClicked(e)}">
				${this.icon && this.icon !== `undefined` && this.icon !== `null` && this.iconAlign === `left` ? html`<capitec-icon
					class="icon" icon="${this.icon}"></capitec-icon>` : ``}
				${this.label ? html`<div class="label ${this._getDisabledFlag()}">${this.label}</div>` : ``}
				${this.icon && this.icon !== `undefined` && this.icon !== `null` && this.iconAlign === `right` ? html`<capitec-icon
					class="icon" icon="${this.icon}"></capitec-icon>` : ``}
			</div>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		if (this.href && this.href !== `undefined` && this.children && this.children.length === 0) {
			return html`
				<a class="menu-item hyperlink ${this._getDisabledFlag()}" href="${this.href}" target="_self" @click="${e => this._itemClicked(e)}">
					${this.icon && this.icon !== `undefined` && this.icon !== `null` && this.iconAlign === `left` ? html`<capitec-icon
						class="icon" icon="${this.icon}"></capitec-icon>` : ``}
					${this.label ? html`<div class="label ${this._getDisabledFlag()}">${this.label}</div>` : ``}
					${this.icon && this.icon !== `undefined` && this.icon !== `null` && this.iconAlign === `right` ? html`<capitec-icon
						class="icon" icon="${this.icon}"></capitec-icon>` : ``}
				</a>
			`;
		}

		return html`
			<div class="menu-item ${this._getDisabledFlag()}" @click="${e => this._itemClicked(e)}">
				${this.icon && this.icon !== `undefined` && this.icon !== `null` && this.iconAlign === `left` ? html`<capitec-icon
					class="icon" icon="${this.icon}"></capitec-icon>` : ``}
				${this.label ? html`<div class="label ${this._getDisabledFlag()}">${this.label}</div>` : ``}
				${this.children.length === 0 && this.icon && this.icon !== `undefined` && this.icon !== `null` && this.iconAlign === `right`
				? html`<capitec-icon class="icon" icon="${this.icon}"></capitec-icon>` : ``}
				${this.children.length > 0 ? html`<capitec-icon class="indicator" icon="system/chevron-right-action" size="small"></capitec-icon>` : ``}
			</div>
			<div class="sub-menu" style="${this._subMenuLocation()}">
				<slot></slot>
			</div>
		`;
	}
}

window.customElements.define(`capitec-overflow-menu-item`, OverflowMenuItem);

/**
 * When the menu item is clicked.
 *
 * @example
 * <capitec-overflow-menu-item ... @click="${this._handler}"></capitec-overflow-menu-item>
 *
 * @event OverflowMenuItem#click
 * @type {Object}
 * @property {Object} detail - Contains label property
 * @property {String} detail.label - The menu item label
 */

/**
 * When the menu item is expanded.
 *
 * @example
 * <capitec-overflow-menu-item ... @expand="${this._handler}"></capitec-overflow-menu-item>
 *
 * @event OverflowMenuItem#expand
 * @type {Object}
 * @property {Object} detail - Contains label property
 * @property {String} detail.label - The menu item label
 */

/**
 * When the menu item is collapsed.
 *
 * @example
 * <capitec-overflow-menu-item ... @collapse="${this._handler}"></capitec-overflow-menu-item>
 *
 * @event OverflowMenuItem#collapse
 * @type {Object}
 * @property {Object} detail - Contains label property
 * @property {String} detail.label - The menu item label
 */