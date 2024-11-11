import { Component, css, html } from '../../elements/index.js';

import '../core/Label.js';
import '../layers/ContentBox.js';

/**
 * Component that displays content in tabs.
 * 
 * ```js
 * import 'platform/components/containers/TabGroup';
 * ```
 * 
 * ```html
 * <capitec-tab-group>
 *   <capitec-tab label="Details">
 *     <capitec-label label="Tab 1"></capitec-label>
 *   </capitec-tab>
 * 
 *   <capitec-tab label="Comments (3)">
 *     <capitec-label label="Tab 2"></capitec-label>
 *   </capitec-tab>
 * </capitec-tab-group>
 * ```
 *
 */
export class TabGroup extends Component {

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
		this.selectedIndex = 0;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all public properties defined by the component.
	 * 
	 * @property {Number} [selectedIndex = 0] - The index of the selected tab.
	 */
	static get properties() {
		return {
			selectedIndex: { type: Number }
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

			for (const mutation of mutations) {

				if (mutation.type === `attributes`) {

					// Re-render the component when a child item's attributes has changed.
					this.requestUpdate();
				}
			}
		});

		// Start observing child attribute changes.
		this._observer.observe(this, {
			attributes: true,
			attributeFilter: [`label`],
			subtree: true
		});
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

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Selects and displays the contents of a specific tab index.
	 * 
	 * @param {Number} index - The index of the tab to display.
	 * 
	 * @returns {void}
	 */
	selectTab(index) {

		// Ensure that the specified tab index is within a valid range of the number of component in the container.
		if (index < 0 || index >= this.children.length) {
			return;
		}
		const previousIndex = this.selectedIndex;

		// Select the specified tab by index.
		this.selectedIndex = index;

		this.dispatchEvent(new CustomEvent(`tab-select`, {
			detail: {
				previousIndex: previousIndex,
				selectedIndex: this.selectedIndex
			}
		}));
	}

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

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					width:100%;
					height:100%;
				}

				/* TAB BAR */

				:host > .tab-bar {
					display: flex;
					flex-direction: row;
					align-items: center;
					width: var(--theme-tab-tab-bar-width, 100%);
					height: var(--theme-tab-bar-height, 50px);
					border-bottom: var(--theme-tab-border-bottom, none);
					background: var(--theme-tab-tab-bar-background-color, transparent);
				}

				:host > .tab-bar > .tab {
					height: var(--theme-tab-height, 100%);
					min-width: var(--theme-tab-min-width, 100px);
					max-width: var(--theme-tab-max-width, 300px);
				}

				:host > .tab-bar > .tab:hover {
					background-color: var(--theme-tab-hover-background-color, rgba(0, 157, 224, 0.1));
				}

				:host > .tab-bar > .tab > .tab-label-container {
					display: flex;
					justify-items: center;
					align-items: center;
					height: calc(var(--theme-tab-label-container-height, 100%) - var(--theme-tab-indicator-height, 4px));
					cursor: pointer;
				}

				:host > .tab-bar > .tab > .tab-label-container > .tab-label {
					font-size: var(--theme-tab-font-size, 16px);
					font-weight: var(--theme-tab-font-weight, bold);
					padding: 0px var(--theme-tab-label-padding-left-right, 24px);
					color: var(--theme-tab-font-color, black);
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				:host > .tab-bar > .tab > .tab-label-container > .tab-label.selected {
					color: var(--theme-tab-selected-font-color, black);
				}

				:host > .tab-bar > div > .indicator-bar {
					height: var(--theme-tab-indicator-height, 4px);
					background-color: var(--theme-tab-selected-indicator-color, darkgrey);
					border-radius: var(--theme-tab-indicator-border-radius, 100px 100px 0 0);
					width: var(--theme-tab-indicator-bar-width, 100%);
				}

				/* CONTENT */

				::slotted(*) {
					display: none;
				}
			`
		];
	}

	_renderNonDesktopStyles() {
		return html`
				:host > .tab-bar > .tab {
				display: flex;
				flex: 1 auto;
				flex-direction: column;
				}
				
				:host > .tab-bar > .tab > .tab-label-container > .tab-label {
				width: var(--theme-tab-tab-label-width, 100%);
				text-align: center;
				}
			`;
	}

	/**
	 * Generates the component template for mobile mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {

		return html`
			<style>
				::slotted(*:nth-child(${this.selectedIndex + 1})) {
					display: initial;
				}
				${this._renderNonDesktopStyles()}
			</style>

			<div class="tab-bar">
				${Array.from(this.children).map((tab, i) => html`
					<div class="tab" @click="${() => this.selectTab(i)}">
						<div class="tab-label-container">
							<div class="tab-label ${this.selectedIndex === i ? `selected` : ``}">${tab.label}</div>
						</div>
						${this.selectedIndex === i ? html`<div class="indicator-bar"></div>` : html``}
					</div>
				`)}
			</div>

			<capitec-content-box noPadding gap="none">
				<slot></slot>
			</capitec-content-box>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return html`
			<style>
				::slotted(*:nth-child(${this.selectedIndex + 1})) {
					display: initial;
				}
				${this._renderNonDesktopStyles()}
			</style>

			<div class="tab-bar">
				${Array.from(this.children).map((tab, i) => html`
					<div class="tab" @click="${() => this.selectTab(i)}">
						<div class="tab-label-container">
							<div class="tab-label ${this.selectedIndex === i ? `selected` : ``}">${tab.label}</div>
						</div>
						${this.selectedIndex === i ? html`<div class="indicator-bar"></div>` : html``}
					</div>
				`)}
			</div>

			<capitec-content-box noPadding gap="none">
				<slot></slot>
			</capitec-content-box>
		`;
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
			<style>
				::slotted(*:nth-child(${this.selectedIndex + 1})) {
					display: initial;
				}
			</style>

			<div class="tab-bar">
				${Array.from(this.children).map((tab, i) => html`
					<div class="tab" @click="${() => this.selectTab(i)}">
						<div class="tab-label-container">
							<div class="tab-label ${this.selectedIndex === i ? `selected` : ``}">${tab.label}</div>
						</div>
						${this.selectedIndex === i ? html`<div class="indicator-bar"></div>` : html``}
					</div>
				`)}
			</div>

			<capitec-content-box noPadding gap="none">
				<slot></slot>
			</capitec-content-box>
		`;
	}
}

window.customElements.define(`capitec-tab-group`, TabGroup);


/**
 * Notify direct subscribers that a tab was selected.
 *
 * @example
 * <capitec-tab-group ... @tab-select="${this._handler}"></capitec-tab-group>
 *
 * @event TabGroup#tab-select
 * @type {Object}
 * @property {Object} detail Event object.
 * @property {Number} detail.previousIndex Index of previous tab.
 * @property {Number} detail.selectedIndex Index of selected tab.
 */