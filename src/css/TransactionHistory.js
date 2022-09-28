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
					padding-bottom: 8px;`;
					
const statusTagType =
					`background-color: rgb(239, 239, 239);
					color: #3A3A3A;`;

const statusColumnLabel = 
					`font-size: 12px;
					font-weight: 600;
					line-height: 12px;
					text-align: center;
					margin-left: 16px;
					margin-right: 16px;
					height: 13px;`;


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

const tableHeaderGroup = `height: 48px; 
					background-color: #F5F5F5; 
					width: 1063px; z-index: 10; 
					position: absolute; 
					border-bottom: 1px solid #E1E1E1;`;

const tableHeaderLabel = `height: 48px;
					margin-left: 16px;
					line-height: 48px;
					font-size: 14px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-weight: 600;`;

const headings = {
					transactionDate: `width: 147px; `,
					description: `width: 408px;`,
					transactionStatus: `width: 212px;`,
					amount: `width: 120px;` 
};

const expanderDescriptionText = `height: 14px;
					color: #3A3A3A;
					font-size: 12px;
					line-height: 14px;`;

const expanderDecriptionValue = `width: 192px;
					color: #3A3A3A;
					font-size: 14px;
					font-weight: 600;
					height: 20px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;`;

const expanderTooltip = `height: 20px;
					--theme-tooltip-font-family: 'Hind Vadodara';
					--theme-tooltip-font-size: 14px;
					--theme-tooltip-line-height: 20px;
					--theme-tooltip-border-radius: 4px;`;

export const TABLE_EXPANDER_CELL = {
	headerGroup: tableHeaderGroup,
	headerLabel: tableHeaderLabel,
	tableHeadings: headings,
	firstcolumn: firstcolumn,
	expanderColumns: expanderColumns,
	expanderCell: expanderCell,
	labelText: expanderDescriptionText,
	labelValue: expanderDecriptionValue,
	toolTip: expanderTooltip
};

export const STATUS_TAG = {
	tagContainer: statusColumnContainer,
	tagLabel: statusColumnLabel,
	tagType: statusTagType
};