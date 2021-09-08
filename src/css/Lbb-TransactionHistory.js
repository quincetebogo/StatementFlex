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

export const EXPANDER_LABEL = `margin: 6px 0px 6px 0px; 
					height: 20px;
					width: auto;
					color: #3A3A3A;
					font-family: 'Hind Vadodara';
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;`;

const linkedTransactionsHeading = `
					margin-top: 22px;
					`;

const linkedTransactionTile = `
					--theme-card-min-width: 1032px;
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
					--horizon-label-value-color: #009de0
					`;

export const TABLE_EXPANDER_CELL = {
	firstcolumn: firstcolumn,
	expanderColumns: expanderColumns,
	expanderCell: expanderCell
};

export const LINKED_TRANSACTION = {
	heading: linkedTransactionsHeading,
	card: linkedTransactionTile,
	verticalLine: verticalSeparator,
	description: linkedDescription
}
