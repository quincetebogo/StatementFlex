// ---------------------
// STYLESHEET DEFINITION
// ---------------------

const firstcolumn = `width :240px;
					padding: 8px 0px 7.5px 0px;`;

const expanderColumns = `width :256px;
					padding: 8px 0px 7.5px 12px;`;

const statusColumnContainer =
				 	`display: inline-flex;
					box-sizing: border-box;
					flex-direction: row;
					align-items: center;
					border-radius: 16px;
					padding-top: 8px;
					padding-bottom: 8px;`
					
const statusTagType =
					`background-color: rgb(239, 239, 239);
					color: #3A3A3A;`

const statusColumnLabel = 
					`font-size: 12px;
					font-weight: 600;
					line-height: 12px;
					text-align: center;
					margin-left: 16px;
					margin-right: 16px;
					height: 13px;`


const expanderCell = `height: 57px;
					font-weight: 300;
					justify-content: left;
					margin-bottom: 2px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 20px;

					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 15px;
					--horizon-label-value-line-height: 20px;`;

export const EXPANDER_LABEL = `margin:5px 0px 15px 0px; 
					height: 20px;
					width: auto;
					color: #3A3A3A;
					font-family: 'Hind Vadodara';
					font-size: 15px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;`;

export const TABLE_EXPANDER_CELL = {
	firstcolumn: firstcolumn,
	expanderColumns: expanderColumns,
	expanderCell: expanderCell
};

export const STATUS_TAG = {
	tagContainer : statusColumnContainer,
	tagLabel : statusColumnLabel,
	tagType :statusTagType
}
