// ---------------------
// STYLESHEET DEFINITION
// ---------------------

const rowItem = `height: 64px;
				 box-sizing: border-box;
				 border: 1px solid #E1E1E1;
				 border-radius: 4px;
				 background-color: #FFFFFF;
				 margin-bottom: 8px;
				 cursor: default`;

const width223 = `width: 223px;`;
const width240 = `width: 240px;`;
const width185 = `width: 185px`;
const width128 = `width: 128px; margin-right: 50px;`;
const width200 = `width: 200px`;

const borderRight = `border-right: 1px solid #E1E1E1;`;

const cellGroup = `margin-left: 16px;
					margin-right: 8px`;

const cellLabel = `--theme-label-default-font-size: 14px;
					   --theme-label-font-color: #3A3A3A;
					   line-height: 20px;`;

const cellLabelStrong = `--theme-label-default-font-weight: 600;`;

const cellColorOrange = `color: #D4781C;`;

const cellColorGreen = `color: #70AF00;`;

const cellColorRed = `color: #C83B37;`;

const cellColorBlack = `color: #3A3A3A;`;

const cellButton = `width: 83px;
					 text-align: center;
					 cursor: pointer;
					 --theme-label-font-color: #009DE0;`;

/**
 * DebiCheck mandates table component row styles
 *
 * @export
 * @constant TABLE_ROW_CSS
 */
export const TABLE_ROW_CSS = {
	rowItem: rowItem,
	width223: width223,
	width240: width240,
	width185: width185,
    width128: width128,
    width200: width200,
	borderRight: borderRight
};

/**
 * DebiCheck mandates table component row cell styles
 *
 * @export
 * @constant TABLE_ROW_CELL_CSS
 */
export const TABLE_ROW_CELL_CSS = {
	cellGroup: cellGroup,
	cellLabel: cellLabel,
	cellLabelStrong: cellLabelStrong,
	cellColorOrange: cellColorOrange,
	cellColorGreen: cellColorGreen,
	cellColorRed: cellColorRed,
	cellButton: cellButton
};

/**
 * Determine font color based on status
 *
 * @export getDateOrdinal
 * @param {*} key Key value of the cell
 * @param {*} value Value of the cell
 * @returns {*} Font color
 */
export function getFontColor(key, value) {
	
	if (key !== `Status`) {
		return ``;
	}

	if (value === `Pending`) {
		return cellColorOrange;
	} else if (value === `Expired`) {
		return cellColorRed;
	}
		return cellColorBlack;
}