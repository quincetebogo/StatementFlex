import { Component, css, html, unsafeCSS } from '../../elements/index.js';

import { Constants } from '../../Constants.js';

const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Layout base component that positions elements against a layout strategy.
 * 
 * NOTE: Do not use this component directly, instead:
 *  - Use the **{@link Group}** component.
 *  - The layout="..." attribute of any container component, e.g. **{@link ContentBox}**.
 *  - Base your own layout component of this class.
 * 
 * ```js
 * import 'platform/components/layouts/Layout';
 * ```
 * 
 * ```html
 * <capitec-layout layout="horizontal">
 *   <capitec-button type="primary" label="Save"></capitec-button>
 *   <capitec-button type="default" label="Cancel"></capitec-button>
 * </capitec-layout>
 * ```
 */
export class Layout extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Attribute definitions:
	 * 
	 * @property {LayoutAttribute} [layout="vertical"] - Component content area layout.
	 * @property {HAlignAttribute} [halign="stretch"] - Component content area horizontal item alignment.
	 * @property {VAlignAttribute} [valign="top"] - Component content area vertical item alignment.
	 * @property {GapAttribute} [gap="clear"] - Component gap (external padding) setting.
	 * @property {ColumnsAttribute} [columns] - Component column layout setting.
	 * @property {RowsAttribute} [rows] - Component row layout setting.
	 */
	constructor() {
		super();

		this._responsiveStylesGrid = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	// n/a

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

		// Manually lay out grid elements if the browser does not support CSS grid.
		if (this.getAttribute(`layout`) === `grid` && !CSS.supports(`display`, `grid`)) {
			this._ponyfillCSSGrid();
		}
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


	_renderResponsiveStylesGrid() {

		if (!this._responsiveStylesGrid) {

			const breakpoints = this.config?.platform?.design?.breakpoints ?? {
				xs: 600,
				sm: 960,
				md: 1264,
				lg: 1904
			};

			const styles = `

				${columns.map(col => css`
				:host([layout=grid]) ::slotted([column='${col}']) {
					grid-column: ${col};
				}

				:host([layout=grid]) ::slotted([colspan='${col}']) {
					grid-column-end: span ${col} !important;
				}
				`).join(``)}

				${rows.map(row => css`
				:host([layout=grid]) ::slotted([row='${row}']) {
					grid-row: ${row};
				}

				:host([layout=grid]) ::slotted([rowspan='${row}']) {
					grid-row-end: span ${row} !important;
				}
				`).join(``)}

				/* ---------- RESPONSIVE GRID LAYOUT (lg) ---------- */
				@media screen and (max-width: ${breakpoints.lg}px) {

					${columns.map(col => css`
						:host([layout=grid]) ::slotted([column-lg='${col}']) {
							grid-column: ${col};
						}

						:host([layout=grid]) ::slotted([colspan-lg='${col}']) {
							grid-column-end: span ${col} !important;
						}
					`).join(``)}

					${rows.map(row => css`
						:host([layout=grid]) ::slotted([row-lg='${row}']) {
							grid-row: ${row};
						}

						:host([layout=grid]) ::slotted([rowspan-lg='${row}']) {
							grid-row-end: span ${row} !important;
						}
					`).join(``)}
				}

				/* ---------- RESPONSIVE GRID LAYOUT (md) ---------- */
				@media screen and (max-width: ${breakpoints.md}px) {

					${columns.map(col => css`
						:host([layout=grid]) ::slotted([column-md='${col}']) {
							grid-column: ${col};
						}

						:host([layout=grid]) ::slotted([colspan-md='${col}']) {
							grid-column-end: span ${col} !important;
						}
					`).join(``)}

					${rows.map(row => css`
						:host([layout=grid]) ::slotted([row-md='${row}']) {
							grid-row: ${row};
						}

						:host([layout=grid]) ::slotted([rowspan-md='${row}']) {
							grid-row-end: span ${row} !important;
						}
					`).join(``)}
				}

				/* ---------- RESPONSIVE GRID LAYOUT (sm) ---------- */
				@media screen and (max-width: ${breakpoints.sm}px) {

					${columns.map(col => css`
						:host([layout=grid]) ::slotted([column-sm='${col}']) {
							grid-column: ${col};
						}

						:host([layout=grid]) ::slotted([colspan-sm='${col}']) {
							grid-column-end: span ${col} !important;
						}
					`).join(``)}

					${rows.map(row => css`
						:host([layout=grid]) ::slotted([row-sm='${row}']) {
							grid-row: ${row};
						}

						:host([layout=grid]) ::slotted([rowspan-sm='${row}']) {
							grid-row-end: span ${row} !important;
						}
					`).join(``)}
				}

				/* ---------- RESPONSIVE GRID LAYOUT (xs) ---------- */
				@media screen and (max-width: ${breakpoints.xs}px) {

					${columns.map(col => css`
						:host([layout=grid]) ::slotted([column-xs='${col}']) {
							grid-column: ${col};
						}

						:host([layout=grid]) ::slotted([colspan-xs='${col}']) {
							grid-column-end: span ${col} !important;
						}
					`).join(``)}

					${rows.map(row => css`
						:host([layout=grid]) ::slotted([row-xs='${row}']) {
							grid-row: ${row};
						}

						:host([layout=grid]) ::slotted([rowspan-xs='${row}']) {
							grid-row-end: span ${row} !important;
						}
					`).join(``)}
				}
			`;

			this._responsiveStylesGrid = html`
				<style>
					${styles.replace(/\t\t\t\t/g, ``)}
				</style>
			`;
		}

		return this._responsiveStylesGrid;
	}

	/**
	 * This is a basic "ponyfill" to at least offer a basic grid layout for very old browsers, e.g. Android 5, 6 & 7 handsets.
	 * 
	 * Take note that:
	 * 1) This implementation re-layouts the child elements of the container a equally sized grid.
	 * 2) The following properties still work: PARENT = gap (clear and none); CHILD = row, column
	 * 3) The following properties don't work: PARENT = gap (line), columns, rows; CHILD = rowanchor, colanchor
	 * 4) CSS properties are set directly on the elements in JS instead of CSS selectors or classes to ensure cascading of styles work through the shadow root on these old devices.
	 * 5) It would be impractical to replicate the full CSS-grid implementation in Javascript. Even using absolute positioning is a struggle,
	 *    as you need newer technology such as MutationObserver to constantly recalculate item heights.
	 *
	 * @private
	 * 
	 * @returns {void}
	 */
	_ponyfillCSSGrid() {

		// Convert the host layout to a traditional uniform table.
		this.style.display = `table`;
		this.style.tableLayout = `fixed`;
		this.style.borderCollapse = `collapse`;
		this.style.width = `100%`;
		this.style.marginTop = this.getAttribute(`gap`) === `clear` ? `calc(-1 * var(--theme-layout-gap-spacing, 10px))` : `0px`;

		// Calculate the size of the grid in rows and columns.
		const childMap = {};

		let maxColumns = 0;
		let maxRows = 0;

		for (const child of this.children) {

			const row = Number(child.getAttribute(`row`)) || 0;
			const column = Number(child.getAttribute(`column`)) || 0;

			if (row > maxRows) {
				maxRows = row;
			}
			if (row > maxColumns) {
				maxColumns = column;
			}

			childMap[`${row}|${column}`] = child;
		}

		// Generate a matrix of table row and column elements equal to the size of the grid required.
		for (let row = 1; row <= maxRows; row++) {

			// Create a empty row container for each row.
			const rowHTML = document.createElement(`div`);
			rowHTML.style.display = `table-row`;

			for (let column = 1; column <= maxColumns; column++) {

				// Create a empty column container for each column in the row.
				const columnHTML = document.createElement(`div`);
				columnHTML.style.display = `table-cell`;
				columnHTML.style.backgroundClip = `padding-box`;
				columnHTML.style.border = `0px solid transparent`;
				columnHTML.style.borderTopWidth = this.getAttribute(`gap`) === `clear` ? `var(--theme-layout-gap-spacing, 10px)` : `0px`;
				columnHTML.style.borderLeftWidth = column === 1 ? `0px` : this.getAttribute(`gap`) === `clear` ? `var(--theme-layout-gap-spacing, 10px)` : `0px`;

				// Nest the child element inside of the new empty column element.
				const childElement = childMap[`${row}|${column}`];

				if (childElement) {

					childElement.style.width = `100%`;
					childElement.style.height = `100%`;

					columnHTML.appendChild(childElement);
				}

				rowHTML.appendChild(columnHTML);
			}

			this.appendChild(rowHTML);
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
					flex: 0 0 auto;
				}
			`,

			/* ---------- HORIZONTAL LAYOUT ---------- */
			css`
				:host([layout=horizontal]) {
					display: flex;
					flex-direction: row;
					align-items: flex-start;
					justify-content: flex-start;
				}

				:host([layout=horizontal][reverse]) {
					flex-direction: row-reverse;
				}

				/* wrap */

				:host([layout=horizontal][wrap]) {
					flex-wrap: wrap;
				}

				/* valign */

				:host([layout=horizontal][valign=top]) {
					align-items: flex-start;
				}

				:host([layout=horizontal][valign=center]) {
					align-items: center;
				}

				:host([layout=horizontal][valign=bottom]) {
					align-items: flex-end;
				}

				:host([layout=horizontal][valign=stretch]) {
					align-items: stretch;
				}

				/* halign */

				:host([layout=horizontal][halign=left]) {
					justify-content: flex-start;
				}

				:host([layout=horizontal][halign=center]) {
					justify-content: center;
				}

				:host([layout=horizontal][halign=right]) {
					justify-content: flex-end;
				}

				:host([layout=horizontal][halign=stretch]) {
					justify-content: stretch;
				}

				:host([layout=horizontal][halign=left]) ::slotted(*) {
					flex: 0 0 auto;
				}

				:host([layout=horizontal][halign=stretch]) ::slotted(*) {
					flex: 1 1 0px;
					justify-self: stretch;
				}

				/* gap */

				:host([layout=horizontal][gap=none]) {
					column-gap: 0px;
				}

				:host([layout=horizontal][gap=clear]),
				:host([layout=horizontal][gap=line]) {
					column-gap: var(--theme-layout-gap-spacing, 10px);
				}

				:host([layout=horizontal][gap=line]:not([reverse])) ::slotted(*:not(:last-child)) {
					border-right: 1px solid var(--theme-layout-gap-line-color, #000000);
					padding-right: var(--theme-layout-gap-spacing, 10px);
				}

				:host([layout=horizontal][gap=line][reverse]) ::slotted(*:not(:last-child)) {
					border-left: 1px solid var(--theme-layout-gap-line-color, #000000);
					padding-left: var(--theme-layout-gap-spacing, 10px);
				}

				/* grow */

				:host([layout=horizontal]) ::slotted([grow=""]) {
					flex: 1 1 auto;
					justify-self: stretch;
				}
			
				:host([layout=horizontal]) ::slotted([grow=horizontal]) {
					flex: 1 1 auto;
					justify-self: stretch;
				}

				:host([layout=horizontal]) ::slotted([grow=vertical]) {
					align-self: stretch;
				}

				:host([layout=horizontal]) ::slotted([grow=both]) {
					flex: 1 1 auto;
					align-self: stretch;
					justify-self: stretch;
				}
			`,

			/* ---------- VERTICAL LAYOUT ---------- */
			css`
				:host([layout=vertical]) {
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					justify-content: flex-start;
				}

				:host([layout=vertical][reverse]) {
					flex-direction: column-reverse
				}

				/* wrap */

				:host([layout=vertical][wrap]) {
					flex-wrap: wrap;
				}

				/* valign */
				
				:host([layout=vertical][valign=top]) {
					justify-content: flex-start;
				}

				:host([layout=vertical][valign=center]) {
					justify-content: center;
				}

				:host([layout=vertical][valign=bottom]) {
					justify-content: flex-end;
				}

				:host([layout=vertical][valign=stretch]) {
					justify-content: stretch;
				}

				/* halign */

				:host([layout=vertical][halign=left]) {
					align-items: flex-start;
				}

				:host([layout=vertical][halign=center]) {
					align-items: center;
				}

				:host([layout=vertical][halign=right]) {
					align-items: flex-end;
				}

				:host([layout=vertical][halign=stretch]) {
					align-items: stretch;
				}

				:host([layout=vertical][valign=top]) ::slotted(*) {
					flex: 0 0 auto;
				}

				:host([layout=vertical][valign=stretch]) ::slotted(*) {
					flex: 1 1 0px;
					justify-self: stretch;
				}

				/* gap */

				:host([layout=vertical][gap=none]) {
					row-gap: 0px;
				}

				:host([layout=vertical][gap=clear]),
				:host([layout=vertical][gap=line]) {
					row-gap: var(--theme-layout-gap-spacing, 10px);
				}

				:host([layout=vertical][gap=line]:not([reverse])) ::slotted(*:not(:last-child)) {
					border-bottom: 1px solid var(--theme-layout-gap-line-color, #000000);
					padding-bottom: var(--theme-layout-gap-spacing, 10px);
				}

				:host([layout=vertical][gap=line][reverse]) ::slotted(*:not(:last-child)) {
					border-top: 1px solid var(--theme-layout-gap-line-color, #000000);
					padding-top: var(--theme-layout-gap-spacing, 10px);
				}

				/* grow */
			
				:host([layout=vertical]) ::slotted([grow=""]) {
					flex: 1 1 auto;
					justify-self: stretch;
				}

				:host([layout=vertical]) ::slotted([grow=horizontal]) {
					align-self: stretch;
				}
			
				:host([layout=vertical]) ::slotted([grow=vertical]) {
					flex: 1 1 auto;
					justify-self: stretch;
				}

				:host([layout=vertical]) ::slotted([grow=both]) {
					flex: 1 1 auto;
					align-self: stretch;
					justify-self: stretch;
				}
			`,

			/* ---------- GRID LAYOUT (experimental) ---------- */
			css`
				:host([layout=grid]) {
					display: grid;
					grid-gap: var(--theme-layout-grid-gap-row, 10px) var(--theme-layout-grid-gap-column, 10px);
					grid-auto-columns: 1fr;
					grid-auto-rows: auto;
				}

				:host([layout=grid][columns=auto]) {
					grid-auto-columns: auto;
				}

				:host([layout=grid][columns=uniform]) {
					grid-auto-columns: 1fr;
				}

				:host([layout=grid][rows=auto]) {
					grid-auto-rows: auto;
				}

				:host([layout=grid][rows=uniform]) {
					grid-auto-rows: 1fr;
				}

				:host([layout=grid][gap=none]) {
					grid-gap: 0px;
				}

				:host([layout=grid][gap=clear]) {
					grid-gap: var(--theme-layout-grid-gap-row, 10px) var(--theme-layout-grid-gap-column, 10px);
				}

				:host([layout=grid][gap=line]) {
					grid-gap: 0px;
				}
				
				:host([layout=grid][gap=line]) ::slotted(*) {
					border: 1px solid var(--theme-layout-gap-line-color, #000000);
					padding: var(--theme-layout-gap-spacing, 10px);
					margin: 0px -1px -1px 0px;
				}

				:host([layout=grid]) ::slotted(*) {
					align-self: stretch;
					justify-self: stretch;
				}

				:host([layout=grid]) ::slotted([rowanchor=top]) {
					align-items: flex-start;
				}

				:host([layout=grid]) ::slotted([rowanchor=center]) {
					align-items: center;
				}

				:host([layout=grid]) ::slotted([rowanchor=bottom]) {
					align-items: flex-end;
				}

				:host([layout=grid]) ::slotted([rowanchor=stretch]) {
					align-items: stretch;
				}

				:host([layout=grid]) ::slotted([colanchor=left]) {
					justify-content: flex-start;
				}

				:host([layout=grid]) ::slotted([colanchor=center]) {
					justify-content: center;
				}

				:host([layout=grid]) ::slotted([colanchor=right]) {
					justify-content: flex-end;
				}

				:host([layout=grid]) ::slotted([colanchor=stretch]) {
					justify-content: stretch;
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
			${this._renderResponsiveStylesGrid()}
			<slot></slot>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return html`
			${this._renderResponsiveStylesGrid()}
			<slot></slot>
		`;
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
			${this._renderResponsiveStylesGrid()}
			<slot></slot>
		`;
	}
}

window.customElements.define(`capitec-layout`, Layout);