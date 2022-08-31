// ---------------------
// STYLESHEET DEFINITION
// ---------------------

const firstcolumn = `width :192px;
					padding: 12px 0px 10px 0px;`;

const expanderColumns = `width :164px;
					padding: 12px 0px 10px 16px;`;

const expanderCell = `height: 56px;
					font-weight: 300;
					justify-content: left;
					--horizon-label-text-height: 14px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-font-size: 12px;
					--horizon-label-text-line-height: 14px;

					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 14px;
					--horizon-label-value-line-height: 20px;`;

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

const tableDescriptionLabel = `white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
					font-size: 15px;
					cursor: pointer;
					line-height: 20px;`;

const expanderTooltip = `height: 20px;
					--theme-tooltip-font-family: 'Hind Vadodara';
					--theme-tooltip-font-size: 14px;
					--theme-tooltip-line-height: 20px;
					--theme-tooltip-border-radius: 4px;`;

export const EXPANDER_LABEL = `margin: 6px 0px 6px 0px; 
					height: 20px;
					width: auto;
					color: #3A3A3A;
					font-family: 'Hind Vadodara';
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;`;

const linkedTransactionContentBox = `
					max-height: 186px;
					margin-bottom: 16px;
					`;

const linkedTransactionsHeading = `
					margin-top: 22px;
					`;

const linkedTransactionTile = `
					height: 56px;
					width: -webkit-fill-available;
					--theme-card-min-height: 56px;
					padding: 0px 16px;
					margin-bottom: 8px;
					`;
const verticalSeparator = `
					height: 40px;
					width: 1px;
					background-color: #E1E1E1;
					`;
const linkedDescription = `
					--horizon-label-value-color: #009de0;
					padding-right: 16px;
					width: auto;
					min-width: 192px;
					`;

export const TABLE_EXPANDER_CELL = {
	firstcolumn: firstcolumn,
	expanderColumns: expanderColumns,
	expanderCell: expanderCell,
	labelText: expanderDescriptionText,
	labelValue: expanderDecriptionValue,
	toolTip: expanderTooltip,
	columnTooltip: tableDescriptionLabel
};

export const LINKED_TRANSACTION = {
	contentBox: linkedTransactionContentBox, 
	heading: linkedTransactionsHeading,
	card: linkedTransactionTile,
	verticalLine: verticalSeparator,
	description: linkedDescription
};