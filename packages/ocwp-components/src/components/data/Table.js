import { Component, css, html } from '../../elements/index.js';
import { InputLayouts } from '../input-layouts.js';
import { Utilities } from 'ocwp-core';

export const CONSTANTS = {
	SORT_STRATEGY: {
		FULL: `Full`,
		PAGED: `Page`
	},
	DISPLAY_MODE: {
		FULL: `Full`,
		PAGING: `Paging`,
		LOAD_MORE: `LoadMore`
	}
};

/**
 * Renders tabular data with the layout controlled by one or more {@link TableColumn} items.
 * 
 * ```js 
 * import 'platform/components/data/Table'; 
 * ```
 * 
 * ```html
 * <capitec-table .items="${this.records}">
 *   <capitec-table-column label="One" field="columnOne"></capitec-table-column>
 *   <capitec-table-column label="Two" field="columnTwo"></capitec-table-column>
 *   <capitec-table-column label="Three" field="columnThree"></capitec-table-column>
 *   <capitec-table-column label="Four" field="columnFour" type="currency"></capitec-table-column>
 * </capitec-table>
 * ```
 * @prop {"Full"|"Paging"|"LoadMore"|String} displayMode This will set the mode in which user will view data.
 * @prop {"asc"|"desc"|String} sortDirection Starting direction with which to sort the dataset.
 */
export class Table extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		super();

		// Component properties
		this.pagedItems = [];
		this.selectedItem = null;
		this.readonly = false;
		this.fixed = false;
		this.hideHeader = false;
		this.footer = false;
		this.selected = false;
		this.paging = false;
		this.sortStrategy = CONSTANTS.SORT_STRATEGY.FULL;
		this.isBusy = false;

		this.sortColumn = null;
		this.sortDirection = ``;

		// Internal properties
		this.dataActionHandlers = [];
		this.actionHandlerInfo = {};
		this.initialized = false;

		this._displayMode = ``;

		this._items = [];
		this._filter = ``;
		this._paging = false;

		this.initialItems = null;
		this.expandedIndex = -1;
		this.expandable = `right`;
	}

	/**
	 * Data structure that defines response from a data handler call.
	 * 
	 * @typedef {Object} DataHandlerResponse
	 * @property {Number} items Full list of items in table.
	 * @property {Array} pagedItems Current view of items in table.
	 * @property {Array} totalCount Total number of the collection.
	 */

	/**
	 * Callback for external data queries used by {@link Table}.
	 * 
	 * @callback DataHandler
	 * @param {Number} [items] Full list of items in table.
	 * @param {Number} pagedItems Current view of items in table.
	 * @param {Number} currentPageIndex Current page selected.
	 * @param {Number} numOfPagingRows Number of rows selected by user.
	 * @param {String|Function} groupLabel The column name to group on or a function to convert column name to given name.
	 * @param {Number} totalCount Total Count of all items.
	 * @param {Object} strategy Object with the data altering strategy.
	 * @param {Boolean} strategy.page Flag to indicate if paging is enabled.
	 * @param {String|Function} strategy.groupField String or Function on how to handle group naming.
	 * @returns {DataHandlerResponse} The response needed to render table.
	 */

	/**
	 * Render callback for expanded row used by {@link Table}.
	 * 
	 * @example
	 * <capitec-table ... .expandRenderer="${(item) => this._expandRenderer(item)}"></capitec-table>
	 * 
	 * @callback ExpandRenderer
	 * @param {Object} item Record for expanded row.
	 * @returns {html} The response needed to render expanded row content.
	 */

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {Array} items Collection of data records to render.
	 * @property {Boolean} hideHeader When true, the column headers will be hidden.
	 * @property {Object} [selectedItem] Selected data record.
	 * @property {Boolean} [readonly] When true, disables row selection & hover styles
	 * @property {Boolean} [fixed] When true, forces the table to have fixed columns widths (table-layout: fixed).
	 * @property {String} currency Currency value attribute to determine content.
	 * @property {Boolean} paging - Deprecated
	 * @property {String} displayMode This will set the mode in which user will view data.
	 * - `Full` Renders all data bound.
	 * - `Paging` Renders data using paging controls.
	 * - `LoadMore` Renders data incrementally on the page.
	 * @property {Number} numOfPagingRows When **displayMode** is set to *Paging*, this is used to set the initial visible rows per page.
	 * @property {Array<Number>} [pagingRows] When **displayMode** is set to *Paging*, this is used to set the visible rows per page.
	 * @property {DataHandler} [dataHandler] data handler
	 * @property {String} [sortDirection="asc"] Starting direction with which to sort the dataset.
	 * - `asc` From a lower to a higher value.
	 * - `desc` From a higher to a lower value.
	 * @property {String} [sortColumn] Starting column field on which to sort the dataset
	 * @property {ExpandRenderer} [expandRenderer]  If specified, points to a custom render function for the expanded row.
	 * @property {String} [expandable="right"] Side of table to render expand/collapse button. Only applicable if expandRenderer is provided:
	 *  - `left` - Expander icon on the left.
	 *  - `right` - Expander icon on the right.
	 */
	static get properties() {

		return {
			items: { type: Array },
			selectedItem: { type: Object },
			readonly: { type: Boolean },
			fixed: { type: Boolean },
			currency: { type: String },
			filter: { type: String }, // Not documented on purpose.
			sortDirection: { type: String },
			sortColumn: { type: String },

			selected: { type: Boolean },
			pagedItems: { type: Array },
			hideHeader: { type: Boolean },
			footer: { type: Boolean },
			paging: { type: Boolean },
			rowCountSelectorOptions: { type: Boolean },
			numOfPagingRows: { type: Number },
			pagingRows: { type: Array },
			currentPageIndex: { type: Number },
			groupField: { type: String },
			sortStrategy: { type: String },
			dataHandler: {
				type: Object,
				attribute: false
			},
			isBusy: { type: Boolean },
			displayMode: { type: String },
			expandable: { type: String },
			expandRenderer: {
				type: Object,
				attribute: false
			}
		};
	}

	set displayMode(val) {
		this._displayMode = val;

		// Component property defaults
		this._updateDisplayDefaults();
	}

	get displayMode() {
		return this._displayMode;
	}

	set paging(val) {
		if (val) {
			console.warn(`Paging has been deprecated. Please use "displayMode" instead`);
			this._paging = val;
			this.displayMode = CONSTANTS.DISPLAY_MODE.PAGING;
		}
	}

	get paging() {
		return this._paging;
	}

	set items(val) {
		if (val && Array.isArray(val)) {
			this._items = val;
			if (!this.initialItems) {
				this.initialItems = Array.from(val);
			}
			this.runThroughHandlers();
		}
	}

	get items() {
		return this._items;
	}

	set filter(val) {
		if (typeof val !== `undefined`) {
			this._filter = val;
			this.currentPageIndex = 1;
			this.runThroughHandlers();
		}
	}

	get filter() {
		return this._filter;
	}

	get totalItemsCount() {

		// If items are set then we use internal count else we get count from index provided in handler
		if (this.items && this.items.length !== 0) {
			return this.items.length;
		}

		if (!this.actionHandlerInfo || !this.actionHandlerInfo.totalCount) {
			return 0;
		}

		return this.actionHandlerInfo.totalCount;
	}

	get calcCurrentPage() {
		const pageLowerValue = (this.currentPageIndex - 1) * this.numOfPagingRows;
		const pageHigherValue = this.currentPageIndex * this.numOfPagingRows;
		return `${pageLowerValue} - ${pageHigherValue > this.totalItemsCount ? this.totalItemsCount : pageHigherValue} of ${this.totalItemsCount}`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {

		super.connectedCallback();

		if (this.dataHandler) { // external handlers
			// Internal dataActionHandlers will be ignored if handler is added
			this.dataActionHandlers.push(this.dataHandler);

		} else { // Internal handlers

			// TODO: add other handlers. filtering
			// blackBox functions

			this.dataActionHandlers.push(this._stagingHandler);

			this.dataActionHandlers.push(this._internalStrategyHandler);

			if (this.groupField) {
				this.dataActionHandlers.push(this._internalGroupingHandler);
			}

			this.dataActionHandlers.push(this._internalPagingHandler);
		}

		this.runThroughHandlers();
	}

	shouldUpdate(changedProperties) {
		if (this.dataHandler) {
			if (this.items.length > 0) {
				this.items = [];
				console.warn(`Items should not be set when dataHandler is set`);
			}
		}

		if (this.displayMode && (this.displayMode !== CONSTANTS.DISPLAY_MODE.PAGING && this.displayMode !== CONSTANTS.DISPLAY_MODE.FULL)) {
			console.warn(`DisplayMode is currently set to '${this.displayMode}' and is not supported`);
		}

		return true;
	}

	async performUpdate() {
		await new Promise((resolve) => requestAnimationFrame(() => resolve()));
		super.performUpdate();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onRowCountSelectorOptionClick(item, e) {

		if (this.displayMode === CONSTANTS.DISPLAY_MODE.PAGING) {
			this.expandedIndex = -1;
		}

		this.numOfPagingRows = item;
		this.currentPageIndex = 1;
		this.rowCountSelectorOptions = false;
		this.runThroughHandlers();

		// This is important to prevent bubbling. 
		e.stopPropagation();
	}

	_onPageUpClick(e) {

		if (this.currentPageIndex * this.numOfPagingRows >= this.totalItemsCount) {
			return;
		}

		if (this.displayMode === CONSTANTS.DISPLAY_MODE.PAGING) {
			this.expandedIndex = -1;
		}

		this.currentPageIndex++;
		this.runThroughHandlers();
	}

	_onPageDownClick(e) {

		if (this.currentPageIndex <= 1) {
			return;
		}

		if (this.displayMode === CONSTANTS.DISPLAY_MODE.PAGING) {
			this.expandedIndex = -1;
		}

		this.currentPageIndex--;
		this.runThroughHandlers();
	}

	_onRowCountSelectorOptionsClick() {
		this.rowCountSelectorOptions = !this.rowCountSelectorOptions;
	}

	_rowSelected(e, item) {

		if (this.readonly) {
			return;
		}

		e.stopPropagation();

		this.dispatchEvent(new CustomEvent(`item-selected`, {
			detail: item
		}));

		this.dispatchEvent(new CustomEvent(`item-select`, {
			detail: item
		}));
	}

	_updateSort(tableColumnElement, columnField, direction) {
		if (!tableColumnElement.sortable) {
			return;
		}

		if (this.sortColumnElement && this.sortColumnElement !== tableColumnElement) {
			this.sortColumnElement.sortDirection = null;
		}
		this.sortColumnElement = tableColumnElement;
		this.sortColumn = direction ? columnField : null;
		this.sortDirection = direction;
		tableColumnElement.sortDirection = direction;
		if (!direction && this.initialItems && this.items && !this.dataHandler) {
			this.items = Array.from(this.initialItems);
		}

		this.runThroughHandlers();
	}

	_toggleExpand(e, item, itemIndex) {
		if (this.expandedIndex === itemIndex) {
			this.expandedIndex = -1;
		} else {
			this.expandedIndex = itemIndex;
		}

		e.stopPropagation();

		this.requestUpdate();
	}

	_loadMoreClicked(item) {
		this.runThroughHandlers();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	async runThroughHandlers() {

		// Show busy indicator when external handler is applied
		if (this.dataHandler) {
			this.initialItems = null;
			this.showLoadingIndicator();
		}
		// Run through handlers
		if (this.dataActionHandlers.length > 0) {

			/** @type {DataHandler} */
			let result = {};
			/* eslint-disable no-await-in-loop */
			for (const handler of this.dataActionHandlers) {
				try {

					result = await handler(this._buildActionHandleRequestModel(result));
				} catch (error) {
					console.warn(`Error occurred in handler`);
					console.warn(error);
				}
			}

			this._handleActionHandleResponse(result);
		}

		// remove busy indicator
		if (this.dataHandler) {
			this.removeLoadingIndicator();
		}
	}

	showLoadingIndicator() {
		this.isBusy = true;
	}

	removeLoadingIndicator() {
		this.isBusy = false;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateDisplayDefaults() {

		if (this.displayMode === CONSTANTS.DISPLAY_MODE.PAGING) {

			if (!this.numOfPagingRows) {
				this.numOfPagingRows = 10;
			}

			if (!this.pagingRows) {
				this.pagingRows = [10, 20, 50, 100];
			}

			this.currentPageIndex = 1;
		}
	}

	/** 
	 * Enriches and returns callback input model.
	 * 
	 * @param {DataHandler} result Object to pass in to handler callback
	 * 
	 * @returns {DataHandler} Populated object.
	 */
	_buildActionHandleRequestModel(result) {

		return {
			items: result.items ? result.items : this.items,
			pagedItems: result.pagedItems ? result.pagedItems : this.pagedItems,
			currentPageIndex: result.currentPageIndex ? result.currentPageIndex : this.currentPageIndex,
			numOfPagingRows: result.numOfPagingRows ? result.numOfPagingRows : this.numOfPagingRows,
			groupLabel: result.groupLabel ? result.groupLabel : this.groupLabel,
			totalCount: result.totalCount ? result.totalCount : this.totalItemsCount,
			strategy: {
				displayMode: this.displayMode,
				groupField: this.groupField,
				sortStrategy: this.sortStrategy,
				sortDirection: this.sortDirection ? this.sortDirection : ``,
				sortColumn: this.sortColumn ? this.sortColumn : ``,
				filter: this.filter
			}
		};
	}

	/**  
	 * Processes response data from an action handler.
	 * 
	 * @param {DataHandlerResponse} response Response object to process.
	 * 
	 * @returns {void}
	 */
	_handleActionHandleResponse(response) {

		if (!response) {
			console.warn(`Response to handler was empty. No result to apply`);
			return;
		}

		if (response.pagedItems) {
			this.pagedItems = response.pagedItems;
		}

		if (response.items) {
			this.items = response.items;
		}

		if (response.totalCount) {
			this.actionHandlerInfo.totalCount = response.totalCount;
		}
	}

	_hasPropertyValue(model, value) {
		for (const key in model) {
			if (value === model[key]) {
				return true;
			}
		}
	}

	_stagingHandler(renderSet) {

		if (renderSet.items.length > 0) {
			renderSet.pagedItems = renderSet.items;
		}

		return {
			pagedItems: renderSet.pagedItems
		};
	}

	_internalPagingHandler(renderSet) {

		if (renderSet.strategy.displayMode === CONSTANTS.DISPLAY_MODE.PAGING) {

			const newPagedItems = [];

			let j = 0;
			let i = 0;

			// Get all the non-grouped rows
			const recordsOnly = renderSet.pagedItems.filter(x => !x.group);

			i = (renderSet.currentPageIndex - 1) * renderSet.numOfPagingRows;
			i = renderSet.pagedItems.indexOf(recordsOnly[i]);

			// Get all groups that have been displayed
			const displayedGroupsOnly = renderSet.pagedItems.slice(0, i).filter(x => x.group);

			if (displayedGroupsOnly && displayedGroupsOnly.length > 0) {

				// Displays group as first record when viewing the next page
				newPagedItems.push(displayedGroupsOnly[displayedGroupsOnly.length - 1]);
			}

			for (; j < renderSet.numOfPagingRows && i < renderSet.totalCount + displayedGroupsOnly.length; i++) {
				const pagedItem = renderSet.pagedItems[i];
				if (pagedItem) {
					newPagedItems.push(pagedItem);
					if (!pagedItem.group) {
						j++;
					} else {
						displayedGroupsOnly.push(pagedItem);
					}
				} else {
					j++;
				}
			}

			renderSet.pagedItems = newPagedItems;

		} else if (renderSet.pagedItems.filter(x => x.group).length === 0) {

			// Assist with the re-render of the table items
			renderSet.pagedItems = [...renderSet.items];
		}

		return {
			pagedItems: renderSet.pagedItems
		};
	}

	_internalGroupingHandler(renderSet) {

		renderSet.pagedItems = renderSet.pagedItems.filter(x => !x.group);

		const groupedValues = Utilities.groupBy(renderSet.items, renderSet.strategy.groupField);

		const newRows = [];

		for (const key in groupedValues) {
			if (groupedValues.hasOwnProperty(key)) {

				let groupName = key;
				if (renderSet.groupLabel && Utilities.isFunction(renderSet.groupLabel)) {
					groupName = renderSet.groupLabel(key);
				} else if (typeof renderSet.groupLabel === `string`) {
					groupName = renderSet.groupLabel;
				}

				newRows.push({
					group: groupName
				});
				const rows = groupedValues[key];
				newRows.push(...rows);
			}
		}

		return {
			pagedItems: newRows
		};
	}

	_internalStrategyHandler(renderSet) {
		try {
			if (renderSet.strategy.sortDirection && renderSet.strategy.sortColumn && renderSet.strategy.sortColumn !== ``) {
				let sortingCollection;
				if (renderSet.strategy.sortStrategy === CONSTANTS.SORT_STRATEGY.FULL) {
					sortingCollection = renderSet.items;
				} else if (renderSet.strategy.sortStrategy === CONSTANTS.SORT_STRATEGY.PAGED && renderSet.pagedItems.length > 0) {
					sortingCollection = renderSet.pagedItems;
				} else {
					sortingCollection = renderSet.items;
				}

				sortingCollection.sort((v1, v2) => {
					if (renderSet.strategy.sortDirection === `desc`) {
						const t = v1;
						v1 = v2;
						v2 = t; // Swap the parameters.
					}
					const v1SortBy = Utilities.getValue(v1, renderSet.strategy.sortColumn);
					const v2SortBy = Utilities.getValue(v2, renderSet.strategy.sortColumn);

					if (typeof v1SortBy === `number`) { // when sorting by a numeric field
						if (v1SortBy < v2SortBy) {
							return -1;
						}
						if (v1SortBy > v2SortBy) {
							return 1;
						}
						return 0;
					} else if (v1SortBy instanceof Date) {
						if (v1SortBy < v2SortBy) {
							return -1; // v1SortBy is in the past of v2SortBy
						}
						if (v1SortBy > v2SortBy) {
							return 1; // v1SortBy is in the future of v2SortBy
						}
						return 0;
					}

					// assume sort field is a String
					if (v1SortBy.toLowerCase() < v2SortBy.toLowerCase()) {
						return -1;
					}
					if (v1SortBy.toLowerCase() > v2SortBy.toLowerCase()) {
						return 1;
					}
					return 0;
				});

				return {
					pagedItems: sortingCollection
				};
			}
			return renderSet;
		} catch (error) {
			console.warn(`Error occurred in handler`);
			console.warn(error);

			throw error;
		}
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {

		return [
			super.styles,
			css`
				${InputLayouts}
				
				/* table */
				table {
					width: 100%;
					border-collapse: collapse;
					border-spacing: 0;
				}

				table.fixed {
					table-layout: fixed;
				}
				
				/* header */
				
				table thead tr th {
					font-size: var(--theme-data-table-font-size, 12px);
					font-weight: var(--theme-data-table-header-font-weight, normal);
					
					color: var(--theme-data-table-font-color, #4E6066);
					background-color: var(--theme-data-table-header-background-color, #F5F5F5);
					
					text-align: left;
					position: var(--theme-data-table-position-header, sticky);
					top: 0;
					cursor: default;

					padding-top: var(--theme-data-table-padding-top, 10px);
					padding-bottom: var(--theme-data-table-padding-bottom, 10px);
					padding-left: var(--theme-data-table-padding-left, 10px);
					padding-right: var(--theme-data-table-padding-right, 10px);
					
					z-index: var(--theme-data-table-header-z-index, 1000);
				}

				* capitec-table {
					--theme-data-table-header-z-index: var(--theme-data-table-header-nested-z-index, 999);
				}

				.nested-table {
					--theme-data-table-header-z-index: var(--theme-data-table-header-nested-z-index, 999);
				}

				table thead tr th.right {
					text-align: right;
				}

				table thead tr th.currency {
					text-align: right;
				}

				.header-cell {
					display:flex;
					flex-direction: row;
				}

				table thead tr th.right > .header-cell {
					justify-content: flex-end;
				}

				table thead tr th.currency > .header-cell {
					justify-content: flex-end;
				}

				/* body + rows */
				table tbody {
					font-weight: var(--theme-data-table-body-font-weight, normal);
					background-color: var(--theme-data-table-body-background-color, #FFFFFF);
					overflow-y: auto;
				}

				table tbody tr {
					border-top: var(--theme-data-table-border, 1px solid #E1E1E1);
					border-bottom: var(--theme-data-table-border, 1px solid #E1E1E1);
					cursor: default;
				}

				table tbody tr:last-of-type {
					border-bottom: var(--theme-data-table-border-last-row, 1px solid #E1E1E1);
				}

				table tbody tr.hover:hover {
					background-color: var(--theme-system-hover-color, #009DE2);
					cursor: pointer;
				}

				table tbody tr.selected {
					background-color: var(--theme-data-table-body-row-selected-background-color, #009DE0);
				}
				
				/* Grouping divider styles */
				table tbody tr td.group {
					font-weight: var(--theme-data-table-body-group-font-weight, normal);
					
					padding-top: var(--theme-data-table-body-group-padding-top, 10px);
					padding-bottom: var(--theme-data-table-body-group-padding-bottom, 10px);
					
					background-color: var(--theme-data-table-body-group-background-color, #F5F5F5);
					color: var(--theme-data-table-body-group-color, #00486D);
				}
				
				table tbody tr td {
					font-size: var(--theme-data-table-font-size, 12px);
					font-weight: var(--theme-data-table-body-font-weight, normal);
					
					color: var(--theme-data-table-font-color, #4E6066);
					
					padding-top: var(--theme-data-table-padding-top, 10px);
					padding-bottom: var(--theme-data-table-padding-bottom, 10px);
					padding-left: var(--theme-data-table-padding-left, 10px);
					padding-right: var(--theme-data-table-padding-right, 10px);
				}

				table tbody tr td.right {
					text-align: right;
				}

				table tbody tr td.currency {
					text-align: right;
					font-weight: var(--theme-data-table-content-currency-font-weight, 500);
					line-height: 20px;
				}

				/* non-wrapping ellipsis */
				table tbody tr td.ellipsis {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				/* footer */
				table tfoot td {
					position: var(--theme-data-table-position-footer, sticky);
					position: var(--theme-data-table-position-footer-webkit, -webkit-sticky);
					bottom: 0;
					padding: 0;
				}

				.footer {
					border-top: var(--theme-data-table-footer-border, 1px solid #E1E1E1);
					border-bottom: var(--theme-data-table-footer-border, 1px solid #E1E1E1);
					background-color: var(--theme-data-table-footer-background-color, #FFFFFF); 
					margin-top: -1px;
					margin-bottom: -1px;
					padding: 0;

					display: flex; 
					justify-content: flex-end;
				}

				.footer capitec-hyperlink {
					text-align: center;
					border: 15px solid transparent;
					margin-left: auto;
					margin-right: auto;
				}

				/* footer box */
				.box {
					display: flex; justify-content: flex-start;
					border-left: var(--theme-data-table-border, 1px solid #E1E1E1);
				}

				.box capitec-label {
					font-weight: var(--theme-font-weight);
					padding-top: var(--theme-data-table-paging-padding-top, 10px);
					padding-bottom: var(--theme-data-table-paging-padding-bottom, 10px);
					padding-left: var(--theme-data-table-paging-padding-left, 10px);
				}

				/* footer row selector */
				.row-selector {
					cursor: pointer;
					position: relative;
				}
				
				.row-selector capitec-label {
					cursor: pointer;
				}

				.row-selector:hover {
					background-color: var(--theme-system-hover-color, #009DE2);
				}

				.row-selector .row-selector-options {
					display: block;
				}

				.row-selector .icon {
					background-color: transparent;
					display: flex; 
					align-items: center;
					padding: 12px;
				}

				.row-selector .icon .expanded {
					transform: rotate(180deg);
					transition: all linear .15s;
				}
			
				.row-selector .icon .collapsed {
					transform: none;
					transition: all linear .15s;
				}

				.row-selector-options {
					display: none;
					position: absolute;
					bottom: 44px;
					margin-left: -1px;
					width: calc(100% + 2px);
					background-color: white;
					border: var(--theme-data-table-border, 1px solid #E1E1E1);
					
					border-bottom-left-radius: 0;
					border-bottom-right-radius: 0;
					border-top-left-radius:var(--theme-button-border-radius, 4px);
					border-top-right-radius: var(--theme-button-border-radius, 4px);

					justify-content: flex-start;
					padding-top: 8px;
					padding-bottom: 8px;

					z-index: var(--theme-data-table-row-selector-z-index, 1);
				}

				.row-selector-option:hover {
					background-color: var(--theme-system-hover-color, #009DE2);
				}

				/* footer row pager */
				.row-pager capitec-label {
					padding-right: 8px;
				}

				.row-pager div.icon {
					background-color: transparent;
					display: flex; 
					align-items: center;
					cursor: pointer;
					padding: 12px;
				}
				
				.row-pager .icon:hover {
					background-color: var(--theme-system-hover-color, #009DE2);
				}

				.sorting {	
					margin-left: 10px;
					flex-direction: column;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.sorted {
					background-color: var(--theme-data-table-header-sorted-background-color, #FFFFFF);
				}

				@keyframes blackWhite {  
					0% { color: back; }
					50% { color: #004093; }
					51% { color: #0659C6; }
					100% { color: blue; }
				}

				@-webkit-keyframes blackWhite {  
					0% { color: back; }
					50% { color: #004093; }
					51% { color: #0659C6; }
					100% { color: blue; }
				}

				.sorting div:hover{	
					animation: blackWhite 2s infinite;
				}

				.sort-icon {
					cursor: pointer;
					flex-direction: column;
					display: flex;
					align-items: center;
					justify-content: center;
					height: var(--theme-data-table-header-sort-icon-height, 8px);
					width: var(--theme-data-table-header-sort-icon-width, 8px);
				}

				.sort-header {
					cursor: pointer;
				}

				.row-expander {
					height: var(--theme-data-table-expander-size, 24px);
					width: var(--theme-data-table-expander-size, 24px);
				}

				.expander-chevron-right {
					display: flex;
					justify-content: flex-end;
				}

				.row-collapsed {
					transform: none;
					transition: all linear .15s;
				}

				.row-expanded {
					transform: rotate(180deg);
					transition: all linear .15s;
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
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<table class="${this.fixed ? `fixed` : ``}">
				${!this.hideHeader ? html`
				<thead>
					<tr>
						${this._renderHeaderCells()}
					</tr>
				</thead>
				` : ``}
				<tbody>
					${this._renderRows()}
				</tbody>
				${this._renderFooter()}
			</table>
			<slot hidden></slot>
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

	_renderHeaderCells() {

		return html`
			${this.expandRenderer && this.expandable === `left` ? html`<th class="row-expander"></th>` : ``}
			${Array.from(this.children).map(tableColumnElement => this._renderHeaderCell(tableColumnElement))}
			${this.expandRenderer && this.expandable !== `left` ? html`<th class="row-expander"></th>` : ``}
		`;
	}

	_renderHeaderCell(tableColumnElement) {
		return html`
			<th class="${tableColumnElement.sortable ? `sort-header` : ``} ${tableColumnElement.align === `left` ? `left` : `right`} ${tableColumnElement.type ? `${tableColumnElement.type}` : ``} ${this.sortColumn && tableColumnElement.field === this.sortColumn ? `sorted` : ``}"
				@click="${() => this._updateSort(tableColumnElement, tableColumnElement.field, tableColumnElement.sortDirection === `asc` ? `desc` : tableColumnElement.sortDirection === `desc` ? null : `asc`)}"
				style="${`width: ${tableColumnElement.size ? `${tableColumnElement.size}` : `auto`}; ${!tableColumnElement.wrap ? `white-space: nowrap;` : ``}`}">
				${this._renderHeaderCellContent(tableColumnElement)}
			</th>
		`;
	}

	_renderHeaderCellContent(tableColumnElement) {

		if (tableColumnElement.headerRenderer) {
			return tableColumnElement.headerRenderer(this.pagedItems, tableColumnElement.field, tableColumnElement.label);
		}

		return html`
			<div class="header-cell">
				${tableColumnElement.label}
				${tableColumnElement.sortable ? html`
				<div class="sorting">
					${this.sortColumn && tableColumnElement.field === this.sortColumn
					? html`${this.sortDirection === `desc`
						? html`<div class="sort-icon"
						@click="${() => this._updateSort(tableColumnElement, tableColumnElement.field, `asc`)}"><img
							src="./platform/icons/system/sort-down-action.svg" alt="system/sort-down-action"></div>`
						: html`<div class="sort-icon"
						@click="${() => this._updateSort(tableColumnElement, tableColumnElement.field, `desc`)}"><img
							src="./platform/icons/system/sort-up-action.svg" alt="system/sort-up-action"></div>`}`
					: html`
					<div class="sort-icon" @click="${() => this._updateSort(tableColumnElement.field, `asc`)}"><img
							src="./platform/icons/system/sort-up.svg" alt="system/sort-up"></div>
					<div class="sort-icon" @click="${() => this._updateSort(tableColumnElement.field, `desc`)}"><img
							src="./platform/icons/system/sort-down.svg" alt="system/sort-down"></div>`}
				</div>
				` : html``}
			</div>
		`;
	}

	_renderRows() {

		if (!this.pagedItems) {
			return;
		}

		return html`
			${this.pagedItems.map((item, itemIndex) => this._renderRow(item, itemIndex))}
		`;
	}

	_renderRow(item, itemIndex) {

		if (!item) {
			console.warn(`Cannot render row as row is undefined`);
			return;
		}

		const colspan = this.expandRenderer ? this.children.length + 1 : this.children.length;

		// If row entry is group
		if (item.group) {

			return html`
				<tr colspan="${colspan}">
					<td class="group" colspan="${colspan}">
						${item.group}
					</td>
				</tr>
			`;
		}

		// else row entry must be normal row record
		return html`
			<tr @click="${(e) => this._rowSelected(e, item)}"
				class="${this.selectedItem && this.selectedItem === item ? `selected` : ``} ${this.readonly ? `` : `hover`}">
				${this.expandRenderer && this.expandable === `left` ? this._renderExpandChevron(item, itemIndex) : ``}
				${Array.from(this.children).map((tableColumnElement, tableColumnIndex) => this._renderCell(
			item, itemIndex,
			tableColumnIndex, tableColumnElement
		))}
				${this.expandRenderer && this.expandable !== `left` ? this._renderExpandChevron(item, itemIndex) : ``}
			</tr>
			${this.expandedIndex === itemIndex ? this._renderExpandedContent(colspan, item) : ``}
		`;
	}

	_renderExpandedContent(colspan, item) {
		return html`
			<tr colspan="${colspan}">
				<td colspan="${colspan}">
					${this.expandRenderer(item)}
				</td>
			</tr>
		`;
	}

	_renderExpandChevron(item, itemIndex) {
		return html`
			<td class="expander-chevron-${this.expandable}" @click="${(e) => this._toggleExpand(e, item, itemIndex)}">
				<capitec-icon class="row-expander ${this.expandedIndex !== itemIndex ? `row-collapsed` : `row-expanded`}"
					icon="system/chevron-down-action"></capitec-icon>
			</td>
		`;
	}

	_renderCell(item, itemIndex, tableColumnIndex, tableColumnElement) {

		let wrap = !tableColumnElement.wrap ? `ellipsis` : ``;
		// Remove Wrap option when renderer is enabled to allow Overflow of components like OverFlowMenu
		wrap = !tableColumnElement.renderer ? wrap : ``;
		const align = tableColumnElement.align && tableColumnElement.align === `right` ? `right` : `left`;
		const type = tableColumnElement.type ? `${tableColumnElement.type}` : ``;

		let posOrNeg = null;

		if (tableColumnElement.type === `currency`) {
			const val = Utilities.getValue(item, tableColumnElement.field);
			const float = parseFloat(val);
			posOrNeg = float >= 0 ? `positive` : `negative`;
		}

		return html`
			<td class="${wrap} ${align} ${type} ${posOrNeg}"
				style="${`${!tableColumnElement.wrap ? `white-space: nowrap;` : ``} ${this.hideHeader && tableColumnElement.size ? `width: ${tableColumnElement.size}` : ``}`}">
				${this._renderCellContent(item, tableColumnElement, itemIndex, tableColumnIndex)}
			</td>
		`;
	}

	_renderCellContent(item, tableColumnElement, itemIndex, tableColumnIndex) {

		// Check if an external rendering function was set and if so, call it. 
		// Useful for when developers specify their own content, e.g. a checkbox, or button.
		if (tableColumnElement.renderer) {
			return tableColumnElement.renderer(item, tableColumnElement.field, Utilities.getValue(item, tableColumnElement.field));
		}

		// Apply formatted rendering based on column type.
		switch (tableColumnElement.type) {
			case `date`:
				return html`${Utilities.parseAndFormatDate(Utilities.getValue(item, tableColumnElement.field), `dd LLL yyyy`)}`;
			case `time`:
				return html`${Utilities.parseAndFormatDate(Utilities.getValue(item, tableColumnElement.field), `HH:mm`)}`;
			default:
				return html`${Utilities.getValue(item, tableColumnElement.field)}`;
		}
	}

	_renderFooter() {

		if (!this.displayMode) {
			return ``;
		}

		const colspan = this.expandRenderer ? this.children.length + 1 : this.children.length;

		return html`
			${this.isBusy === true ? html`<capitec-loading-indicator></capitec-loading-indicator>` : html``}
			<tfoot>
				<tr>
					<td colspan="${colspan}">
						<div class="footer">
							${this._renderFooterContent()}
						</div>
					</td>
				</tr>
			</tfoot>
		`;
	}

	_renderFooterContent() {

		if (this.displayMode === CONSTANTS.DISPLAY_MODE.PAGING) {
			return html`
				${this._renderRowCountSelector()}
				${this._renderRowPagers()}
			`;
		}

		if (this.displayMode === CONSTANTS.DISPLAY_MODE.LOAD_MORE) {
			return html`<capitec-hyperlink label="Load More" @click="${(e) => this._loadMoreClicked(e)}"></capitec-hyperlink>`;
		}
	}

	_renderRowCountSelector() {

		return html`
			<div class="box row-selector" @click="${(e) => this._onRowCountSelectorOptionsClick(e)}">
				${this._renderRowCountSelectorOptions()}
				<capitec-label type="strong" label="${this.numOfPagingRows} Rows"></capitec-label>
				<div class="icon" style="margin-right: 12px;">
					<img class="${this.rowCountSelectorOptions ? `expanded` : `collapsed`}"
						src="./platform/icons/system/chevron-down-action.svg">
				</div>
			</div>
		`;
	}

	_renderRowCountSelectorOptions() {

		if (!this.rowCountSelectorOptions || !this.pagingRows) {
			return;
		}

		return html`
			<div class="row-selector-options">
				${this.pagingRows.sort((a, b) => b - a).map(i => this._renderRowCountSelectorOption(i))}
			</div>
		`;
	}

	_renderRowCountSelectorOption(item) {

		return html`
			<div class="row-selector-option">
				<capitec-label type="strong" label="${item}" @click="${(e) => this._onRowCountSelectorOptionClick(item, e)}"
					style="color: ${this.numOfPagingRows === item ? `var(--theme-data-table-footer-rows-selected-color)` : ``};">
				</capitec-label>
			</div>
		`;
	}

	_renderRowPagers() {

		return html`
			<div class="box row-pager">
				<capitec-label type="strong" label="${this.calcCurrentPage}"></capitec-label>
				<div class="icon" @click="${(e) => this._onPageDownClick(e)}">
					<capitec-icon size="small" icon="system/chevron-left-action"></capitec-icon>
				</div>
				<div class="icon" @click="${(e) => this._onPageUpClick(e)}" style="margin-right: 12px;">
					<capitec-icon size="small" icon="system/chevron-right-action"></capitec-icon>
				</div>
			</div>
		`;
	}
}

window.customElements.define(`capitec-table`, Table);

/**
 * When a row is selected.
 *
 * @example
 * <capitec-table ... @item-select="${this._handler}"></capitec-table>
 *
 * @event Table#item-select
 * @type {Object}
 * @property {Object} detail Record for selected row.
 */