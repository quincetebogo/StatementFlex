import { Component, css, html, ifDefined } from '../../elements/index.js';
import { MenuItem, OverflowMenuItem } from './index.js';
import { Router } from 'ocwp-core';

import '../layers/ContentBox.js';
import '../core/Icon.js';
import '../core/Label.js';

/**
 * A navigation control that represents a menu of selectable items.
 * 
 * ```js 
 * import `platform/components/navigation/Menu`;
 * ```
 * 
 * ```html
 * <capitec-menu 
 *   header="Header" 
 *   sub-header="Sub Header" 
 *   header-avatar-text="Example Text" 
 *   .overflowMenuItems="${[
 *      { label: `Item 1`, icon: `system/add-action` },
 *      { label: `Item 2`, path: `inputs/textfield`, icon: `system/add-action` },
 *      {label: `Item 3`, icon: `system/add-action`, items: [
 *          { label: `Item 3a`, path: `inputs/textfield`, icon: `system/add-action` },
 *          { label: `Item 3b`, path: `inputs/textfield`, icon: `system/add-action` }
 *      ]}
 *   ]}">
 *   <capitec-menu-item icon="profile" label="Profile"></capitec-menu-item>
 *   <capitec-menu-item icon="material/settings" label="Setting">
 *      <capitec-menu-item icon="material/brightness_high" label="Brightness"></capitec-menu-item>
 *      <capitec-menu-item icon="material/volume_up" label="Volume"></capitec-menu-item>
 *   </capitec-menu-item>
 * </capitec-menu>
 * ```
 * 
 * @attribute {string} sub-header - The menu sub header label (attribute only).
 * @attribute {string} header-avatar - The menu header avatar icon (attribute only).
 * @attribute {string} header-avatar-text - The menu header avatar text (attribute only).
 */
export class Menu extends Component {

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

		this._router = Router.getInstance();

		// Property defaults.
		this.label = null;
		this.header = ``;
		this.subHeader = ``;
		this.hideFooter = false;
		this.hideHeader = false;
		this.headerAvatar = ``;
		this.headerAvatarText = ``;
		this.overflowMenuItems = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all public properties defined by the component.
	 * 
	 * @property {String} label - The menu title label (Deprecated: Use header instead)
	 * @property {String} header - The menu header label.
	 * @property {String} subHeader - The menu sub header label.
	 * @property {String} headerAvatar - The menu header avatar icon.
	 * @property {String} headerAvatarText - The menu header avatar text.
	 * @property {Boolean} [hideFooter] - When specified, hides the footer section containing the logo.
	 * @property {Boolean} [hideHeader] - When specified, hides the header section containing.
	 * @property {Array<OverflowMenuItem>} [overflowMenuItems] When specified, the overflow menu will be rendered.
	 */
	static get properties() {

		return {
			label: { type: String },
			header: { type: String },
			subHeader: { type: String, attribute: `sub-header` },
			headerAvatar: { type: String, attribute: `header-avatar` },
			headerAvatarText: { type: String, attribute: `header-avatar-text` },
			hideFooter: { type: Boolean },
			overflowMenuItems: { type: Array }
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

			for (const mutation of mutations.filter((item) => item.type === `attributes` && item.target instanceof MenuItem)) {

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

		window.addEventListener(`platform-navigation-context-updated`, (e) => this._navigationContextUpdated(e));
	}

	/**
	 * Clean-up the component once removed from the DOM.
	 * 
	 * @ignore
	 * 
	 * @returns {void}
	 */
	disconnectedCallback() {

		// Stop observing child attribute changes.
		if (this._observer) {
			this._observer.disconnect();
		}

		// Ensure the component is cleaned up correctly.
		super.disconnectedCallback();
	}

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
	_handleMenuItemClick(event) {
		// Prevent the event from bubbling up.
		event.stopPropagation();
		event.preventDefault();

		// Ignore the click event if the item is disabled.
		if (event.detail.disabled) {
			return;
		}

		if (event.detail.path) {
			this._router.navigateByPath(event.detail.path);
			return;
		}

		this.dispatchEvent(new CustomEvent(`overflow-menu-item-click`, event));
	}

	/**
	 * Handle nav change, specifically loading on path URLs within browser.
	 * 
	 * @ignore
	 *
	 * @param {Event} e Event 
	 * @returns {void}
	 */
	_navigationContextUpdated(e) {

		const items = this.querySelectorAll(`capitec-menu-item`);

		for (const item of items) {

			const navigationContext = e.detail;

			if (item.href && item.href === navigationContext.current.route.path) {
				item.selected = true;
			} else {
				item.selected = false;
			}
		}
	}

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

		while (element.tagName.toLowerCase() === `capitec-menu-item`) {

			tree.push(element);

			element = element.parentNode;
		}

		// Unselect & collapse all menu items, not in the selected child item`s parent tree.
		this.querySelectorAll(`capitec-menu-item`).forEach(item => {

			if (!tree.includes(item)) {

				item.selected = false;
				item.collapse();

			} else {

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

		while (element.tagName.toLowerCase() === `capitec-menu-item`) {

			tree.push(element);

			element = element.parentNode;
		}

		// Collapse all menu items, not in the selected child item`s parent tree.
		this.querySelectorAll(`capitec-menu-item`).forEach(item => {

			if (!tree.includes(item)) {
				item.collapse();
			}
		});
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

	_renderHeader() {
		return html`<capitec-group class="header-container" layout="horizontal" gap="none" valign="center">
			${this.headerAvatar || this.headerAvatarText ? html`<capitec-avatar size="small"
				value="${ifDefined(this.headerAvatarText)}" icon=${ifDefined(this.headerAvatar)}></capitec-avatar>` : ``}
			<capitec-group class="header-text-container" layout="grid" gap="none" columns="auto">
				<div class="header" column="2" row="1">${this.header || this.label}</div>
				<div class="sub-header" column="2" row="2">${this.subHeader}</div>
			</capitec-group>
			<capitec-spacer></capitec-spacer>
			${this._renderOverflowMenu()}
		</capitec-group>`;
	}

	_renderOverflowMenu() {
		return this.overflowMenuItems ? html`
			<capitec-overflow-menu>
				${this.overflowMenuItems.map(menuItem => html`
				<capitec-overflow-menu-item label="${menuItem.label}" icon="${menuItem.icon}" href="${menuItem.path}"
					@click="${(e) => this._handleMenuItemClick(e)}">
					${menuItem.items && menuItem.items.map(subMenuItem => html`
					<capitec-overflow-menu-item label="${subMenuItem.label}" .icon="${subMenuItem.icon}" href="${subMenuItem.path}"
						@click="${(e) => this._handleMenuItemClick(e)}">
					</capitec-overflow-menu-item>
					`)}
				</capitec-overflow-menu-item>
				`)}
			</capitec-overflow-menu>
		` : ``;
	}

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
					width: var(--theme-menu-width, 256px);
					height: 100%;

					min-width: var(--theme-menu-width, 256px);
					max-width: var(--theme-menu-width, 256px);
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				/* CONTAINER */

				:host {
					display: flex;
					flex-direction: column;
					align-items: stretch;

					background: var(--theme-menu-background, darkgrey);
					box-shadow: var(--theme-menu-box-shadow, 0px 1px #000000);
				}

				/* HEADER */

				.header-container {
					padding-left: var(--theme-menu-header-padding-left, 20px);
					padding-right: var(--theme-menu-header-padding-right, 8px);
					padding-top: var(--theme-menu-header-padding-top, 20px);
					padding-bottom: var(--theme-menu-header-padding-bottom, 10px);

					border-bottom: var(--theme-menu-header-border-bottom, 1px solid #E1E1E11A);
				}

				.header-text-container {
					margin-left: var(--theme-menu-header-margin-left, 16px);
				}

				.header { 
					color: var(--theme-menu-header-font-color, #5D737E);
					font-size: var(--theme-menu-header-font-size, 15px);
					font-weight: var(--theme-menu-header-font-weight, 600);
					cursor: default;
				}

				.sub-header { 
					color: var(--theme-menu-sub-header-font-color, #5D737E);
					font-size: var(--theme-menu-sub-header-font-size, 14px);
					font-weight: var(--theme-menu-sub-header-font-weight, 400);
					cursor: default;
				}

				/* FOOTER */

				.footer {
					box-sizing: border-box;

					color: var(--theme-menu-header-font-color, black);
					border-top: var(--theme-menu-footer-border, 1px solid #E1E1E1);
					padding: var(--theme-menu-footer-padding, 10px);
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
			${(this.label || this.header) && !this.hideHeader ? this._renderHeader() : html``}
			
			<capitec-content-box layout="vertical" valign="top" halign="stretch" gap="none" noPadding>
				<slot></slot>
			</capitec-content-box>
			
			${!this.hideFooter ? html`
			<div class="footer">
				<capitec-icon size="small" icon="capitec-logo"></capitec-icon>
			</div>
			` : html``}
		`;
	}
}

window.customElements.define(`capitec-menu`, Menu);

/**
 * When the overflow menu item is clicked.
 *
 * @example
 * <capitec-menu ... @overflow-menu-item-click="${this._handler}"></capitec-menu>
 *
 * @event Menu#overflow-menu-item-click
 * @type {Object}
 * @property {Object} detail - Contains menu item property
 * @property {String} detail.label - The menu item label
 * @property {String} detail.path - The menu item path
 * @property {String} detail.icon - The menu item icon
 * @property {String} detail.disabled - The menu item disabled state
 */