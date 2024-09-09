import { Component, Element, css, html } from '../../elements/index.js';
import { DateTimePicker } from '../inputs/DateTimePicker.js';
import { Select } from '../inputs/Select.js';
import { TextField } from '../inputs/TextField.js';
import { Utilities } from 'ocwp-core';

/**
 * Container layer that attaches to the action area of a display zone, e.g. card, popup, etc.
 * 
 * Can also be used as a standalone bar component.
 * 
 * ```js
 * import 'platform/components/layers/ActionBar';
 * ```
 * 
 * ```html
 * <capitec-action-bar>
 *   <capitec-search-field label="Search"></capitec-search-field>
 *   <capitec-spacer></capitec-spacer>
 *   <capitec-button type="primary" label="Create New"></capitec-button>
 * </capitec-action-bar>
 * ```
 * @attr {Boolean} show-filters - When set filters will show as chips.
 * @attr {String} active-filter-text - Text to show next to the activer filters.
 */
export class ActionBar extends Component {

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
		this.activeFilters = [];
		this.showFilters = false;
		this.activeFilterText = `Active Filters:`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {

		Array.from(this.children).filter((element) => element instanceof Element).forEach((element) => {

			element.setAttribute(`hint`, ``);

			if (!(element instanceof TextField)) {
				element.addEventListener(`value-changed`, (e) => {
					this._showActiveFilters(element, e.detail.new);
				});
			}

			element.addEventListener(`input`, (e) => {
				this._showActiveFilters(element, e.detail.new);
			});

			element.addEventListener(`apply-click`, (e) => {
				this._showActiveFilters(element, e.detail.new);
			});

			if (element instanceof Select) {
				element.setAttribute(`mode`, `action-bar`);
				element.mode = `action-bar`;
				element.selectMode = `single`;
				element.setAttribute(`select-mode`, `single`);
			}
		});

		super.connectedCallback();
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 */
	static get properties() {

		return {
			showFilters: { type: Boolean, attribute: `show-filters` },
			activeFilterText: { type: String, attribute: `active-filter-text` },
			activeFilters: { type: Array }
		};
	}

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

	_showActiveFilters(element, value) {

		const currentFilter = this.activeFilters.find((filter) => filter.element === element);

		if ((!value && typeof value !== `string`) || !Utilities.hasValue(value)) {
			return;
		}

		if (currentFilter) {
			const index = this.activeFilters.findIndex((filter) => filter === currentFilter);

			this.activeFilters.splice(index, 1);
		}

		/**
		 * @typedef ChangeResult
		 * @type {Object}
		 * @property {String} filterId
		 * @property {Element} element
		 * @property {String} idField
		 * @property {String} displayField
		 * @property {String|Number} value
		 */

		/** @type {ChangeResult} */
		let newValue = null;

		/** @type {ChangeResult} */
		let oldValue = null;

		switch (true) {
			case element instanceof Select:
				if (value) {
					oldValue = currentFilter;
					newValue = { filterId: element.getAttribute(`filter-id`), element: element, idField: element.idField, displayField: element.displayField, value: value };
					this.activeFilters.push(newValue);
				}
				break;
			case element instanceof TextField:

				oldValue = Utilities.deepCopy(currentFilter);

				if (value.length > 0) {
					if (currentFilter) {
						currentFilter.value = value;
						newValue = currentFilter;
					} else {
						newValue = { filterId: element.getAttribute(`filter-id`), element: element, value: value };
					}

					this.activeFilters.push(newValue);
				} else {
					newValue = { filterId: element.getAttribute(`filter-id`), element: element, value: null };
					this.dispatchEvent(new CustomEvent(`value-changed`, { detail: { old: oldValue, new: newValue } }));
				}
				break;
			case element instanceof DateTimePicker:
				if (value) {
					if (element.type === `range` && value.startDate && value.endDate) {
						oldValue = currentFilter;
						newValue = { filterId: element.getAttribute(`filter-id`), element: element, displayValue: element._getSelectedRangeValue(), value: value };
						this.activeFilters.push(newValue);
					}
				}
				break;
			default:
		}

		this.dispatchEvent(new CustomEvent(`value-changed`, { detail: { old: oldValue, new: newValue } }));

		this.requestUpdate(`activeFilters`);
	}

	_removeFilter(filter) {

		this.activeFilters.splice(this.activeFilters.indexOf(filter), 1);
		filter.element.value = null;

		this.dispatchEvent(new CustomEvent(`value-changed`, { detail: { old: filter, new: { ...filter, value: null } } }));

		this.requestUpdate(`activeFilters`);
	}

	_removeFilterMulti(filter, value) {
		const oldValue = filter.element.value;

		filter.element.value = filter.element.value.splice(filter.element.value.indexOf(value), 1);
		filter.value = filter.element.value;

		this.dispatchEvent(new CustomEvent(`value-changed`, { detail: { old: { ...filter, value: oldValue }, new: { ...filter } } }));

		this.requestUpdate(`activeFilters`);
	}

	_clearAll() {
		this.activeFilters.forEach((filter) => {
			if (filter.element.value instanceof Array) {
				filter.element.value = [];
			} else {
				filter.element.value = null;
			}
		});
		this.activeFilters = [];

		this.dispatchEvent(new CustomEvent(`clear`, { detail: {} }));

		this.requestUpdate(`activeFilters`);
	}

	_getFilterDisplayValue(filter, value) {

		if (filter.displayField) {
			return filter.value[filter.displayField];
		}

		return filter.displayValue;
	}

	_renderActiveFilters() {

		if (!this.showFilters) {
			return;
		}

		let chips = [];

		if (this.activeFilters && this.activeFilters.length > 0) {

			chips = this.activeFilters.map((filter) => {
				if (filter.value instanceof Array) {
					return filter.value.map((value) => {
						if (value instanceof Object) {
							return html`<capitec-chip label="${this._getFilterDisplayValue(filter, value)}" closable @remove=${() => this._removeFilterMulti(filter, value)}></capitec-chip>`;
						}

						return html`<capitec-chip label="${value}" closable @remove=${() => this._removeFilterMulti(filter, value)}></capitec-chip>`;
					});

				} else if (filter.value instanceof Object) {
					return html`<capitec-chip label="${this._getFilterDisplayValue(filter, filter.value)}" closable @remove=${() => this._removeFilter(filter)}></capitec-chip>`;
				}

				return html`<capitec-chip label="${filter.value}" closable @remove=${() => this._removeFilter(filter)}></capitec-chip>`;
			});

			return html`
				<capitec-group class="filters" layout="horizontal" valign="center">
					<capitec-label label="${this.activeFilterText}"></capitec-label>
					${chips}
					<capitec-hyperlink label="Clear all" @click=${() => this._clearAll()}></capitec-hyperlink>
				</capitec-group>
			`;
		}
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
					width: 100%;

					min-height: var(--theme-actionbar-min-height);

					flex-shrink: 0;
				}
			`,

			/* ---------- SHARED VARIABLES ---------- */
			css`
				:host {
					--theme-actionbar-padding-left: 16px;
					--theme-actionbar-padding-right: 16px;
					--theme-actionbar-padding-top: 8px;
					--theme-actionbar-padding-bottom: 8px;
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: stretch;

					background: var(--theme-actionbar-background, white);

					border-radius: 0px;
					border-bottom: var(--theme-actionbar-border, 1px solid grey);
					box-shadow: var(--theme-actionbar-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.2));

					padding-top: var(--theme-actionbar-padding-top);
					padding-bottom: var(--theme-actionbar-padding-bottom);
					
					margin-bottom: 1px;
				}

				:host > .wrapper {
					flex-grow: 1;
					
					display: flex;
					flex-wrap: wrap;
					flex-direction: row;
					justify-content: flex-start;
					align-items: stretch;

					--margin-y: calc(var(--theme-actionbar-item-gap, 10px) / 2 * -1);

					margin-top: var(--margin-y);
					margin-bottom: var(--margin-y);

					margin-left: calc(var(--theme-actionbar-padding-left) + var(--margin-y));
					margin-right: calc(var(--theme-actionbar-padding-right) + var(--margin-y));
				}

				:host > .wrapper > ::slotted(*:not(capitec-spacer)) {
					margin: calc(var(--theme-actionbar-item-gap, 10px) / 2);
				}

				* {
					--theme-floating-label-visibility: hidden;
				}

				:host > .filters {
					flex-grow: 1;

					display: flex;
					flex-wrap: wrap;
					flex-direction: row;
					justify-content: flex-start;
					align-items: center;
					margin: var(--theme-actionbar-filters-margin, 8px 0px 0px 0px);

					border-top: var(--theme-divider);

					padding-top: var(--theme-actionbar-padding-top);
					padding-left: var(--theme-actionbar-padding-left);
					padding-right: var(--theme-actionbar-padding-right);
				}


				:host > .filters > capitec-label {
					--theme-label-default-font-weight: var(--theme-actionbar-filter-label-weight, 600);
					--theme-label-default-font-size: var(--theme-actionbar-filter-label-font-size: 14px);
				}

				:host > .filters > capitec-hyperlink {
					--theme-hyperlink-font-size: var(--theme-actionbar-filter-clear-all-font-size, 14px);
				}

				:host ::slotted(capitec-text-field:only-child) {
					width: var(--theme-actionbar-only-child-width, 100%);
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
				<slot></slot>
			</div>
			${this._renderActiveFilters()}
		`;
	}
}

window.customElements.define(`capitec-action-bar`, ActionBar);

/**
 * When the values changes of any containing components with filter-id attribute.
 *
 * @example
 * <capitec-action-bar ... @value-changed="${this._handler}"></capitec-action-bar>
 *
 * @event ActionBar#value-change
 * @type {Object}
 * @property {Object} detail - Contains the old and new value.
 * @property {ChangeResult} detail.old - The old value.
 * @property {ChangeResult} detail.new - The new value.
 */

/**
 * When the clear all button is clicked.
 *
 * @example
 * <capitec-action-bar ... @clear="${this._handler}"></capitec-action-bar>
 *
 * @event ActionBar#clear
 * @type {Object}
 * @property {Object} detail Empty object.
 */