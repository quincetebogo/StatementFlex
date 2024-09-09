import { Component, css, html } from '../../elements/index.js';

/**
 * Defines rendering of a data property within a {@link Table}.
 * 
 * ```js 
 * import 'platform/components/data/TableColumn'; 
 * ```
 * 
 * ```html
 * <capitec-table .items="${this.records}" .selectedItem="${this.selectedRecord}">
 *   <capitec-table-column label="One" field="columnOne" type="text" ></capitec-table-column>
 * </capitec-table>
 * ```
 * @prop {"date"|"time"|"text"|"currency"|String} type Type for the column value.
 * @prop {"px"|"%"|"auto"|String} [size] Width of column.
 * @prop {"left"|"right"|String} align Column header & content alignment.
 */
export class TableColumn extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		super();

		this.label = null;
		this.field = null;
		this.type = null;
		this.size = null;
		this.wrap = false;
		this.align = `left`;
		this.sortable = false;
	}

	/**
	 * Render callback for header cell used by {@link TableColumn}.
	 * 
	 * @example
	 * <capitec-table-column 
	 *   ... 
	 *   .headerRenderer="${(items, fieldName) => this.headerRenderer(items, fieldName)}">
	 * </capitec-table-column>
	 * 
	 * @callback HeaderRenderer
	 * @param {Array} items Records currently bound.
	 * @param {String} fieldName Field name of column.
	 * @param {String} value Label of column.
	 * @returns {html} The response needed to render content.
	 */

	/**
	 * Render callback for data cell used by {@link TableColumn}.
	 * 
	 * @example
	 * <capitec-table-column 
	 *   ... 
	 *   .renderer="${(item, fieldName, fieldValue) => this.renderer(item, fieldName, fieldValue)}">
	 * </capitec-table-column>
	 * 
	 * @callback CellRenderer
	 * @param {Object} item Record for cell.
	 * @param {String} fieldName Field name in record.
	 * @param {*} value Field value in record.
	 * @returns {html} The response needed to render content.
	 */

	// ----------
	// PROPERTIES
	// ----------	

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} label Column label (header).
	 * @property {String} field Field to display (Supports nested paths, e.g. 'parent.child').
	 * @property {String} type Type for the column value.
	 * - `date` Indicates that a date value will be bound.
	 * - `time` Indicates that a time value will be bound.
	 * - `text` Indicates that a plain text value will be bound.
	 * - `currency` Indicates that a currency value will be bound.
	 * @property {String} [size] Width of column.
	 * - `px` Column width set in pixels.
	 * - `%` Column width set as percentage of total table width.
	 * - `auto` Column width automatically calculated.
	 * @property {HeaderRenderer} [headerRenderer] If specified, points to a custom render function for the header field.
	 * @property {CellRenderer} [renderer] If specified, points to a custom render function for the data field.
	 * @property {Boolean} [wrap=false] Indicates if the data in the field is allowed to wrap.
	 * @property {String} [align="left"] Column header & content alignment.
	 * - `left` Align content left.
	 * - `right` Align content right.
	 * @property {Boolean} [sortable=false] Column can be use to sort.
	 */
	static get properties() {

		return {
			label: { type: String },
			field: { type: String },
			type: { type: String },
			size: { type: String },
			headerRenderer: {
				type: Object,
				attribute: false
			},
			renderer: {
				type: Object,
				attribute: false
			},
			wrap: { type: Boolean },
			align: { type: String },
			sortable: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a	

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

	// n/a

	// ---------
	// RENDERING
	// ---------

	static get styles() {

		return [super.styles];
	}

	/**
	 * Generates the component template for mobile mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {

		return html``;
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html``;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return html``;
	}
}

window.customElements.define(`capitec-table-column`, TableColumn);