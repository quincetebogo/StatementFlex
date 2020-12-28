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

const width_223 = `width: 223px;`;
const width_185 = `width: 185px;`;
const width_98 = `width: 98px;`;

const border_Right = `border-right: 1px solid #E1E1E1;`;

const cell_Group = `margin-left: 16px;`;

const cell_Label = `--theme-label-default-font-size: 14px;
					   --theme-label-font-color: #3A3A3A;
					   line-height: 20px;`

const cell_Label_Strong = `--theme-label-default-font-weight: 600;`;

const cell_Color_Orange = `color: #D4781C;`;

const cell_Color_Green = `color: #70AF00;`;

const cell_Color_Red = `color: #C83B37;`;

const cell_Button = `width: 100px;
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
	width_223: width_223,
	width_185: width_185,
	width_98: width_98,
	border_Right: border_Right
};

/**
 * DebiCheck mandates table component row cell styles
 *
 * @export
 * @constant TABLE_ROW_CELL_CSS
 */
export const TABLE_ROW_CELL_CSS = {
	cell_Group: cell_Group,
	cell_Label: cell_Label,
	cell_Label_Strong: cell_Label_Strong,
	cell_Color_Orange: cell_Color_Orange,
	cell_Color_Green: cell_Color_Green,
	cell_Color_Red: cell_Color_Red,
	cell_Button: cell_Button
	
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

	return value === 'Pending' ? cell_Color_Orange : 
		   value === 'Accepted' ? cell_Color_Green : cell_Color_Red;
}