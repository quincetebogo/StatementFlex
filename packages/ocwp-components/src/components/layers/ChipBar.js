import { Component, css, html } from '../../elements/index.js';

/**
 * Container layer that manages chips
 * 
 * ```js
 * import 'platform/components/layers/ChipBar';
 * ```
 * 
 * ```html
 * <capitec-chip-bar></capitec-chip-bar>
 * ```
 */
export class ChipBar extends Component {

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

		this.items = [];
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

	_chipClicked(chip) {

		// Notify any subscribers that a chip was clicked.
		this.dispatchEvent(new CustomEvent(`chip-click`, {
			detail: {
				chip: chip
			}
		}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Add chips to bar.
	 * @param {Object} items The items to add.
	 * @returns {void}
	 */
	add(...items) {
		const allItems = [...this.items, ...items];

		allItems.forEach((item, i) => {
			let matchCount = 0;
			allItems.forEach((otherItem, j) => {
				if (otherItem.label === item.label) {
					matchCount++;
				}

				if (matchCount > 1) {
					throw new Error(`An item with label "${item.label}" has already been added`);
				}
			});
		});

		this.items = [...this.items, ...items];

		// Notify any subscribers that the items were changed.
		this.dispatchEvent(new CustomEvent(`items-changed`, {
			detail: {
				items: this.items
			}
		}));

		this.dispatchEvent(new CustomEvent(`items-change`, {
			detail: {
				items: this.items
			}
		}));

		this.requestUpdate();
	}


	/**
	 * Remove chip from bar.
	 * @param {Object} item The chip to remove.
	 * @returns {void}
	 */
	remove(item) {
		if (item.label) {
			const i = this.items.findIndex((cur, index, arr) => cur.label === item.label, this);
			if (i > -1) {
				const toRemove = this.items[i];
				this.items.splice(i, 1);
				this.items = [...this.items];

				// Notify any subscribers that a chip was removed.
				this.dispatchEvent(new CustomEvent(`chip-remove`, {
					detail: {
						chip: item
					}
				}));

				// Notify any subscribers that the items were changed.
				this.dispatchEvent(new CustomEvent(`items-changed`, {
					detail: {
						items: this.items
					}
				}));

				this.dispatchEvent(new CustomEvent(`items-change`, {
					detail: {
						items: this.items
					}
				}));

				this.requestUpdate();
			}
		}
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
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,

			/* ---------- LAYOUT POLICY ---------- */
			css`
				:host {
					width: 100%;

					min-height: var(--theme-chipbar-min-height, 50px);

					flex-shrink: 0;
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;

					background: var(--theme-chipbar-background, white);

					border-radius: 0px;
					border: var(--theme-chipbar-border, 1px solid grey);
					box-shadow: var(--theme-chipbar-shadow, none);

					padding: var(--theme-chipbar-padding, 10px);
				}

				:host > .wrapper {
					flex-grow: 1;
					
					display: flex;
					flex-wrap: wrap;
					flex-direction: row;
					justify-content: flex-start;
					align-items: center;

					margin: calc(var(--theme-chipbar-item-gap, 10px) / 2 * -1);
				}

				:host > .wrapper > capitec-chip {
					margin: calc(var(--theme-chipbar-item-gap, 10px) / 2);
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
			<div class="wrapper">
				${this.items.map(item => html`
					<capitec-chip
						class="chip"
						label="${item.label}"
						@click="${(e) => this._chipClicked(item)}"
						@remove="${(e) => this.remove(item)}">
					</capitec-chip>
				`)}
			</div>
		`;
	}
}

window.customElements.define(`capitec-chip-bar`, ChipBar);

/**
 * When the chip items are changed via addition or removal.
 *
 * @example
 * <capitec-chip-bar ... @items-change="${this._handler}"></capitec-chip-bar>
 *
 * @event ChipBar#items-change
 * @type {Object}
 * @property {Object} detail - Contains array of items
 * @property {array} detail.items - array of the items
 */

/**
 * When a chip is clicked.
 *
 * @example
 * <capitec-chip-bar ... @chip-click="${this._handler}"></capitec-chip-bar>
 *
 * @event ChipBar#chip-click
 * @type {Object}
 * @property {Object} detail - Contains chip property
 * @property {Object} detail.chip - the chip that is clicked
 */

/**
 * When a chip is removed.
 *
 * @example
 * <capitec-chip-bar ... @chip-remove="${this._handler}"></capitec-chip-bar>
 *
 * @event ChipBar#chip-remove
 * @type {Object}
 * @property {Object} detail - Contains chip property
 * @property {Object} detail.chip - the chip that is removed.
 */