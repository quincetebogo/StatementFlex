// ---------------------
// STYLESHEET DEFINITION
// ---------------------

const rowItem = `height: 64px;
				 box-sizing: border-box;
				 border: 1px solid #E1E1E1;
				 border-radius: 4px;
				 background-color: #FFFFFF;
				 margin-bottom: 8px;`;

const width_223 = `width: 223px;`;
const width_185 = `width: 185px;`;
const width_98 = `width: 98px;`;

const border_Right = `border-right: 1px solid #E1E1E1;`;

const rowCell_Group = `margin-left: 16px;`;

const rowCell_Label = `--theme-label-default-font-size: 14px;
					   --theme-label-font-color: #3A3A3A;
					   line-height: 20px;`

const rowCell_Label_Strong = `--theme-label-default-font-weight: 600;`;

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
	rowCell_Group: rowCell_Group,
	rowCell_Label: rowCell_Label,
	rowCell_Label_Strong: rowCell_Label_Strong
};