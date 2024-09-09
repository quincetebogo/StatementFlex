import { Component, css, html } from '../../elements/index.js';

import '../core/Icon.js';

/**
 * A navigation control representing a selectable item in a menu.
 *
 * ```js
 * import `platform/components/navigation/MenuItem`
 * ```
 *
 * ```html
 * <capitec-menu>
 *   <capitec-menu-item
 *     label="Lorem Ipsum Dolor"
 *     icon="thumb_up"
 *     selected
 *     expanded
 *     disabled>
 *   </capitec-menu-item>
 * </capitec-menu>
 *```
 */
export class MenuItem extends Component {

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

		this.selected = false;
		this.expanded = false;
		this.disabled = false;

		this.hover = false;
		this.addEventListener(`mouseover`, () => {
			this.hover = true;
			this.requestUpdate();
		});
		this.addEventListener(`mouseleave`, () => {
			this.hover = false;
			this.requestUpdate();
		});
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The menu item label.
	 * @property {String} [icon] - The menu item icon.
	 * @property {String} [href] - The menu item's href.
	 * 
	 * @property {Boolean} [selected=false] - Indictor if the menu item is currently selected.
	 * @property {Boolean} [expanded=false] - Indictor if the menu item is currently expanded.
	 * @property {Boolean} [disabled=false] - Indictor if the menu item is currently disabled.
	 * 
	 * @property {Number} [badgeNumber] - The menu item badge numeric value.
	 * @property {String} [badgeColor="#C83C37"] - The menu item badge color.
	 * 
	 * @type {Object}
	 */
	static get properties() {

		return {
			label: { type: String, reflect: true },
			icon: { type: String, reflect: true },
			href: { type: String, reflect: true },

			selected: { type: Boolean, reflect: true },
			expanded: { type: Boolean, reflect: true },
			disabled: { type: Boolean, reflect: true },

			badgeNumber: { type: Number, reflect: true, attribute: `badge-number` },
			badgeColor: { type: String, reflect: true, attribute: `badge-color` }
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
		}
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
		this.selected = true;

		// Notify any direct subscribers that the menu item was selected.
		this.dispatchEvent(new CustomEvent(`click`, {
			detail: {
				label: this.label
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

	/**
	 * Render's the relevant menu item icon.
	 * 
	 * @returns {html} The html representing the icon
	 */
	_renderIcon() {
		if ((this.hover || this.selected) && this.icon && this.icon !== `undefined` && this.icon !== `null` && this.icon.startsWith(`system`)) {
			return html`<capitec-icon class="icon" icon="${this.icon}-action"></capitec-icon>`;
		} else if (this.icon && this.icon !== `undefined` && this.icon !== `null`) {
			return html`<capitec-icon class="icon" icon="${this.icon}"></capitec-icon>`;
		}
		return html``;
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

					cursor: pointer;
				}

				/* MENU-ITEM */

				:host > .menu-item {
					display: flex;
					flex-direction: row;
					align-items: center;

					min-height: var(--theme-menu-item-min-height, 64px);

					padding-left: var(--theme-menu-item-padding-left, 20px);

					color: var(--theme-menu-item-font-color, black);
				}

				.hyperlink {
					text-decoration: none;
				}

				:host > .menu-item > .icon {
					
					margin-left: var(--theme-menu-item-icon-margin-left, 0px);
					margin-right: var(--theme-menu-item-icon-margin-right, 16px);
				}
				
				:host > .menu-item > .label {
					font-family: var(--theme-menu-item-font-family, 'Arial, Helvetica, sans-serif');
					font-size: var(--theme-menu-item-font-size, 12px);
					font-weight: var(--theme-menu-item-font-weight, normal);
				}
				
				:host > .menu-item > .expanded-indicator {
					width: var(--theme-menu-item-indicator-width, 20px);
					height: var(--theme-menu-item-indicator-height, 20px);
					
					margin-left: var(--theme-menu-item-indicator-margin-left, auto);
					margin-right: var(--theme-menu-item-indicator-margin-right, 20px);
				}

				:host > .menu-item > .expanded-indicator.badge {
					margin-left: 0px;
				}

				:host > .menu-item > .badge {
					margin-left: auto;
					margin-right: var(--theme-menu-item-indicator-margin-right, 20px);
				}

				:host([selected]) > .menu-item > .badge {
					display: none;
				}

				:host([expanded]) > .menu-item > .expanded-indicator {
					transform: rotate(180deg);
					transition: all linear .15s;
				}
				
				:host(:not([expanded])) > .menu-item > .expanded-indicator {
					transform: none;
					transition: all linear .15s;
				}

				:host([selected]) > .menu-item {
					background-color: var(--theme-menu-item-selected-background-color, lightgrey);
					--theme-menu-item-font-color: var(--theme-menu-item-font-color-selected);
				}

				:host([selected]) > .menu-item > .label {
					font-weight: var(--theme-menu-item-selected-font-weight, 600);
				}

				:host([selected]) > .menu-item > .selected-indicator {
					height: var(--theme-menu-item-selected-indicator-height, 48px);
					width: var(--theme-menu-item-selected-indicator-width, 5px);

					background-color: var(--theme-menu-item-selected-indicator-background-color, #009DE0);

					border-radius: var(--theme-menu-item-selected-indicator-border-radius, 6px 0px 0px 6px);

					margin: var(--theme-menu-item-selected-indicator-margin, 0px 0px 0px auto);;
				}

				:host > .menu-item:hover {
					background-color: var(--theme-menu-item-hover-background-color, lightgrey);
					--theme-menu-item-font-color: var(--theme-menu-item-font-color-selected);
				}

				/* SUB-MENU */

				:host > .sub-menu {
					transition: max-height 0.5s ease-in;
					overflow: hidden;
					
					max-height: 0px;
					height: 0px;

					--theme-menu-item-padding-left: var(--theme-menu-item-child-offset, 50px);
				}

				:host([expanded]) > .sub-menu {
					max-height: 999px;
					height: auto;
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

		return this._webTemplate();
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
				<a class="menu-item hyperlink" href="${this.href}" target="_self" @click="${e => this._itemClicked(e)}">
					${this._renderIcon()}
					${this.label ? html`<div class="label">${this.label}</div>` : ``}
					${this.badgeNumber ? html`<capitec-badge class="badge" number=${this.badgeNumber} color="${this.badgeColor}"></capitec-badge>` : ``}
					<div class="selected-indicator"></div>
				</a>
				`;
		}

		return html`
			<div class="menu-item" @click="${e => this._itemClicked(e)}">
				${this._renderIcon()}
				${this.label ? html`<div class="label">${this.label}</div>` : ``}
				${this.badgeNumber ? html`<capitec-badge class="badge" number=${this.badgeNumber} color="${this.badgeColor}"></capitec-badge>` : ``}
				${this.children.length > 0 ? html`<capitec-icon class="expanded-indicator${this.badgeNumber ? ` badge` : ``}" size="large"
					icon="system/chevron-down-action"></capitec-icon>` : ``}
				<div class="selected-indicator"></div>
			</div>
			<div class="sub-menu">
				<slot></slot>
			</div>
		`;
	}
}

window.customElements.define(`capitec-menu-item`, MenuItem);

/**
 * When the menu item is clicked.
 *
 * @example
 * <capitec-menu-item ... @click="${this._handler}"></capitec-menu-item>
 *
 * @event MenuItem#click
 * @type {Object}
 * @property {Object} detail - Contains label property
 * @property {String} detail.label - The menu item label
 */

/**
 * When the menu item is expanded.
 *
 * @example
 * <capitec-menu-item ... @expand="${this._handler}"></capitec-menu-item>
 *
 * @event MenuItem#expand
 * @type {Object}
 * @property {Object} detail - Contains label property
 * @property {String} detail.label - The menu item label
 */

/**
 * When the menu item is collapsed.
 *
 * @example
 * <capitec-menu-item ... @collapse="${this._handler}"></capitec-menu-item>
 *
 * @event MenuItem#collapse
 * @type {Object}
 * @property {Object} detail - Contains label property
 * @property {String} detail.label - The menu item label
 */