import { Component, css, html } from '../../elements/index.js';

import { OverflowMenuItem } from './index.js';

import '../layers/ContentBox.js';
import '../core/Icon.js';
import '../core/Label.js';

/**
 * A navigation control that represents a overflow menu of selectable items.
 *
 * ```js
 * import `platform/components/navigation/OverflowMenu`;
 * ```
 *
 * ```html
 * <capitec-overflow-menu label="Menu">
 *   <capitec-overflow-menu-item icon="profile" label="Profile"></capitec-overflow-menu-item>
 *   <capitec-overflow-menu-item icon="settings" label="Settings"></capitec-overflow-menu-item>
 * </capitec-overflow-menu>
 * ```
 *
 * @prop {"default"|"extra-small"|"small"|"medium"|"large"|String} size - The size to display the icon at. Options include.
 * @attr {Boolean} [data-popup] - When specified, the overflow menu will be displayed.
 * 
 */
export class OverflowMenu extends Component {

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

		this.popup = false;
		this.label = ``;
		this.size = ``;
		this.icon = ``;

		// Internal properties
		this._isMouseOver = false;

		window.addEventListener(`click`, (e) => this._onParentClick(e));
		this.addEventListener(`mouseenter`, () => this._isMouseOver = true);
		this.addEventListener(`mouseleave`, () => this._isMouseOver = false);
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all public properties defined by the component.
	 *
	 * @property {Boolean} [popup] - When specified, the overflow menu will be displayed.
	 * @property {Boolean} [label] - The label string to display on the mobile view.
	 * @property {String} [icon] - The name of the icon to display.
	 * @property {String} [size="small"] - The size to display the icon at. Options include:
	 *  - `default` Icon size is 24px.
	 *  - `extra-small` Icon size is 8px.
	 *  - `small` Icon size is 16px.
	 *  - `medium` Icon size is 32px.
	 *  - `large` Icon size is 48px.
	 */
	static get properties() {

		return {
			popup: { type: Boolean, attribute: `data-popup` },
			label: { type: String },
			size: { type: String },
			icon: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	/**
	 * Setup the component once added to the DOM.
	 *
	 * @ignore
	 *
	 * @returns {void}
	 */
	connectedCallback() {

		// Ensure the component is setup correctly.
		super.connectedCallback();

		// Setup an observer to detect any changes to the attributes of direct child components.
		this._observer = new MutationObserver(mutations => {

			for (const mutation of mutations.filter((item) => item.type === `attributes` && item.target instanceof OverflowMenuItem)) {

				if (mutation.attributeName === `selected` && mutation.target.hasAttribute(`selected`)) {

					// Apply the menu item selection policy.
					this._childSelected(mutation.target);

				} else if (mutation.attributeName === `expanded` && mutation.target.hasAttribute(`expanded`)) {

					// Apply the menu item expansion policy.
					this._childExpanded(mutation.target);
				}
			}
		});

		// Start observing child attribute changes.
		this._observer.observe(this, {
			attributes: true,
			attributeFilter: [`selected`, `expanded`],
			subtree: true
		});

	}

	/**
	 * @ignore
	 * @returns {void}
	 */
	updated() {

		const xPosition = this.getBoundingClientRect()?.x || 0;

		const windowMiddleX = window.innerWidth / 2;

		if (xPosition <= windowMiddleX) {
			this.setAttribute(`location`, `left`);
		} else {
			this.setAttribute(`location`, `right`);
		}
	}
	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * When the Overflow Menu component loses focus.
	 * @param {MouseEvent} e - the event details
	 * @ignore
	 * @returns {void}
	 */
	_onParentClick(e) {

		// Update the component focus state.
		if (this.popup && !this._isMouseOver) {
			this.popup = false;
		}
	}

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Applying the item expantion policy to collapse all child item, when clicking outside the Overflow Menu.
	 *
	 * @ignore
	 *
	 * @returns {void}
	 */
	collapseChildren() {

		// Unselect & collapse all menu items, not in the selected child item`s parent tree.
		this.querySelectorAll(`capitec-overflow-menu-item`).forEach(item => {

			item.expanded = false;
		});
	}

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/**
	 * Applying the item selection policy to collapse other child items, when a child item has expanded.
	 *
	 * @ignore
	 *
	 * @param {Element} child - The child element that was expanded.
	 *
	 * @returns {void}
	 */
	_childSelected(child) {

		// Determine all menu items in the selected child item`s parent tree.
		const tree = [];
		let element = child;

		while (element.tagName.toLowerCase() === `capitec-overflow-menu-item`) {

			tree.push(element);

			element = element.parentNode;
		}

		// Unselect & collapse all menu items, not in the selected child item`s parent tree.
		this.querySelectorAll(`capitec-overflow-menu-item`).forEach(item => {

			if (!tree.includes(item)) {

				item.selected = false;
				item.collapse();

			} else if (item.childElementCount > 0) {
				// Ensure all parents in the selected child's tree are expanded.
				item.expanded = true;
			}
		});
	}

	/**
	 * Applying the item expansion policy to collapse other child items, when a child item has expanded.
	 *
	 * @ignore
	 *
	 * @param {Element} child - The child element that was expanded.
	 *
	 * @returns {void}
	 */
	_childExpanded(child) {

		// Determine all menu items in the selected child item`s parent tree.
		const tree = [];
		let element = child;

		while (element.tagName.toLowerCase() === `capitec-overflow-menu-item`) {

			tree.push(element);

			element = element.parentNode;
		}

		// Collapse all menu items, not in the selected child item`s parent tree.
		this.querySelectorAll(`capitec-overflow-menu-item`).forEach(item => {

			if (!tree.includes(item)) {
				item.collapse();
			}
		});
	}

	/**
	 * Gets the Size of the Icon or Default if not set
	 *
	 * @returns {String} The name of the size selected
	 */
	_getIconSizeOrDefault() {
		if (this.size) {
			return this.size;
		}

		return `default`;
	}

	/**
	 * Gets the Icon to display or Default if not set
	 *
	 * @returns {String} The name of the icon selected
	 */
	_getIconOrDefault() {
		if (this.icon) {
			return this.icon;
		}

		return `system/more-action`;
	}

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
					position: relative;
					cursor: pointer;
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				/* MENU OVERFLOW */

				:host {
					background-position: center;
					transition: background 0.8s;
					border-radius: 70px;
				}

				:host(:hover) {
					background: #009DE01A radial-gradient(circle, transparent 1%, #009DE01A 1%) center/15000%;
				}

				capitec-icon {
					display: flex;
					justify-content: center;
					align-content: center;
				}

				capitec-icon.default {
					width: 44px;
					height: 44px;
				}
				capitec-icon.extra-small {
					width: 28px;
					height: 28px;
				}
				capitec-icon.small {
					width: 36px;
					height: 36px;
				}
				capitec-icon.medium {
					width: 52px;
					height: 52px;
				}
				capitec-icon.large {
					width: 68px;
					height: 68px;
				}

				.overflow:not(.mobile) {
					z-index: var(--theme-overflow-menu-overlay-z-index, 10000);

					width: var(--theme-overflow-menu-width, 180px);

					box-sizing: border-box;
					border: 1px solid var(--theme-overflow-menu-border-color);
					border-radius: var(--theme-overflow-menu-border-radius);
					background-color: var(--theme-overflow-menu-background-color);
					box-shadow: 0 1px 3px 0 rgba(0,0,0,0.25);
				}

				:host([data-popup]) .overflow:not(.mobile) {
					position: absolute;
					top: 30px;
				}

				:host([data-popup]) .overflow.mobile {
					width: 100%;
					height: fit-content;

					position: fixed;
					top: unset;
					left: 0;
					right: 0;
					bottom: 0;

					z-index: var(--theme-overflow-menu-overlay-z-index, 10000);

					border: unset;
				}

				.overflow > .header {
					border-radius: var(--theme-overflow-menu-border-radius);
					padding: var(--theme-overflow-menu-header-padding);
					background-color: var(--theme-overflow-menu-header-background-color);
					--theme-label-font-color: var(--theme-overflow-menu-header-font-color);
				}

				:host([data-popup]) .overlay.mobile {
					width: 100%;
					height: 100%;

					z-index: var(--theme-overflow-menu-overflow-z-index, 9999);

					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;

					border-radius: var(--theme-overflow-menu-border-radius);
					background-color: var(--theme-overflow-menu-overlay-background-color);
				}

				:host(:not([data-popup])) .overflow {
					display: none;
				}

				:host(:not([data-popup])) .overlay {
					display: none;
				}

				:host([location="right"]) .overflow {
					right: 0;
				}

				:host([location="left"]) .overflow {
					left: 0;
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

		return html`
			<capitec-icon class="${this._getIconSizeOrDefault()}" icon="${this._getIconOrDefault()}"
				size="${this._getIconSizeOrDefault()}" @click="${() => this.popup = !this.popup}">
			</capitec-icon>
			<div class="overlay mobile" @click="${() => this.popup = !this.popup}"></div>
			<capitec-group class="overflow mobile" layout="vertical" gap="none">
				<capitec-group class="header" layout="horizontal" valign="center">
					<capitec-label type="subtitle" label="${this.label}"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon icon="system/close-white" size="small" @click="${() => this.popup = !this.popup}"></capitec-icon>
				</capitec-group>
				<slot></slot>
			</capitec-group>
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

	/**
	 * Generates the component template for web mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
		<capitec-icon class="${this._getIconSizeOrDefault()}" icon="${this._getIconOrDefault()}"
			size="${this._getIconSizeOrDefault()}" @click="${() => this.popup = !this.popup}">
		</capitec-icon>
		<capitec-group class="overflow" layout="vertical" gap="none">
			<slot></slot>
		</capitec-group>
		`;
	}
}

window.customElements.define(`capitec-overflow-menu`, OverflowMenu);